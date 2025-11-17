/**
 * Batch Processing Service
 * Handles large-scale batch operations (e.g., monthly RIS recalculations)
 *
 * SCALABILITY IMPROVEMENT: Process 100,000 users in < 1 minute
 */

import { RISUser, RISEligibilityResult } from '../modele-metier/risTypes';
import { User, EligibilityCheck } from '../modele-metier/types';
import { checkRISEligibility } from '../regles-eligibilite/risRules';
import { checkAGREligibility } from '../regles-eligibilite/agrRules';
import { getCached } from '../cache/cacheService';
import crypto from 'crypto';

export interface BatchRISCheckRequest {
  users: RISUser[];
  priority?: 'high' | 'normal' | 'low';
  onProgress?: (completed: number, total: number) => void;
  onResult?: (result: RISEligibilityResult, index: number) => void;
}

export interface BatchAGRCheckRequest {
  users: User[];
  onProgress?: (completed: number, total: number) => void;
  onResult?: (result: EligibilityCheck, index: number) => void;
}

/**
 * Check RIS eligibility for multiple users in parallel
 * Processes in chunks of 100 users at a time
 */
export async function checkRISEligibilityBatch(
  request: BatchRISCheckRequest
): Promise<RISEligibilityResult[]> {
  const { users, onProgress, onResult } = request;
  const chunkSize = 100;
  const results: RISEligibilityResult[] = [];

  for (let i = 0; i < users.length; i += chunkSize) {
    const chunk = users.slice(i, i + chunkSize);

    // Process chunk in parallel
    const chunkResults = await Promise.all(
      chunk.map(async (user, chunkIndex) => {
        const globalIndex = i + chunkIndex;

        // Use cached version
        const result = await checkRISEligibilityCached(user);

        // Callback for each result
        if (onResult) {
          onResult(result, globalIndex);
        }

        // Update progress
        if (onProgress) {
          onProgress(globalIndex + 1, users.length);
        }

        return result;
      })
    );

    results.push(...chunkResults);

    // Small delay between chunks to avoid overwhelming the system
    if (i + chunkSize < users.length) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  return results;
}

/**
 * Check AGR eligibility for multiple users in parallel
 */
export async function checkAGREligibilityBatch(
  request: BatchAGRCheckRequest
): Promise<EligibilityCheck[]> {
  const { users, onProgress, onResult } = request;
  const chunkSize = 100;
  const results: EligibilityCheck[] = [];

  for (let i = 0; i < users.length; i += chunkSize) {
    const chunk = users.slice(i, i + chunkSize);

    const chunkResults = await Promise.all(
      chunk.map(async (user, chunkIndex) => {
        const globalIndex = i + chunkIndex;

        // Use cached version
        const result = await checkAGREligibilityCached(user);

        if (onResult) {
          onResult(result, globalIndex);
        }

        if (onProgress) {
          onProgress(globalIndex + 1, users.length);
        }

        return result;
      })
    );

    results.push(...chunkResults);

    if (i + chunkSize < users.length) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  return results;
}

/**
 * Cached RIS eligibility check
 * Cache key based on user attributes that affect eligibility
 */
async function checkRISEligibilityCached(
  user: RISUser
): Promise<RISEligibilityResult> {
  // Create cache key from relevant user attributes
  const cacheKey = createRISCacheKey(user);

  return getCached(
    cacheKey,
    async () => {
      return checkRISEligibility(user);
    },
    3600 // Cache for 1 hour
  );
}

/**
 * Cached AGR eligibility check
 */
async function checkAGREligibilityCached(user: User): Promise<EligibilityCheck> {
  const cacheKey = createAGRCacheKey(user);

  return getCached(
    cacheKey,
    async () => {
      return checkAGREligibility(user);
    },
    3600 // Cache for 1 hour
  );
}

/**
 * Create cache key for RIS check
 */
function createRISCacheKey(user: RISUser): string {
  const keyData = {
    age: user.age,
    category: user.category,
    residencyStatus: user.residencyStatus,
    monthlyIncome: user.monthlyIncome,
    patrimonyValue: user.patrimonyValue,
    isFullTimeStudent: user.isFullTimeStudent,
    childrenInCharge: user.childrenInCharge,
  };

  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(keyData))
    .digest('hex')
    .substring(0, 16);

  return `ris:eligibility:${hash}`;
}

/**
 * Create cache key for AGR check
 */
function createAGRCacheKey(user: User): string {
  const keyData = {
    employmentStatus: user.employmentStatus,
    monthlySalaryGross: user.monthlySalaryGross,
    hasRightsMaintenance: user.hasRightsMaintenance,
    currentBenefits: user.currentBenefits.map((b) => b.type).sort(),
  };

  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(keyData))
    .digest('hex')
    .substring(0, 16);

  return `agr:eligibility:${hash}`;
}

/**
 * Simulate monthly RIS recalculation
 * In production, this would be triggered by a cron job
 */
export async function monthlyRISRecalculation(
  allBeneficiaries: RISUser[]
): Promise<{
  total: number;
  processed: number;
  eligible: number;
  ineligible: number;
  duration: number;
}> {
  const startTime = Date.now();
  let eligible = 0;
  let ineligible = 0;

  console.log(`🔄 Starting monthly RIS recalculation for ${allBeneficiaries.length} beneficiaries...`);

  const results = await checkRISEligibilityBatch({
    users: allBeneficiaries,
    priority: 'low', // Low priority for batch processing
    onProgress: (completed, total) => {
      if (completed % 1000 === 0 || completed === total) {
        const percent = ((completed / total) * 100).toFixed(1);
        console.log(`Progress: ${completed}/${total} (${percent}%)`);
      }
    },
    onResult: (result) => {
      if (result.isEligible) {
        eligible++;
      } else {
        ineligible++;
      }
    },
  });

  const duration = Date.now() - startTime;

  console.log(`✅ Monthly RIS recalculation completed in ${(duration / 1000).toFixed(2)}s`);
  console.log(`   Eligible: ${eligible}, Ineligible: ${ineligible}`);

  return {
    total: allBeneficiaries.length,
    processed: results.length,
    eligible,
    ineligible,
    duration,
  };
}
