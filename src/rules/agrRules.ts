/**
 * Business Rules for Allocation de Garantie de Revenus (AGR)
 *
 * These rules implement the logic defined in the Gherkin feature files.
 * Using json-rules-engine for runtime evaluation.
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';

// Constants from Belgian social law
const MINIMUM_GUARANTEED_INCOME = 1650; // EUR per month
const AGR_CALCULATION_RATE = 0.8;

/**
 * Create the AGR eligibility rules engine
 */
export function createAGREngine(): Engine {
  const engine = new Engine();

  // Rule 1: Basic AGR Eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'employmentStatus',
          operator: 'equal',
          value: 'part-time',
        },
        {
          fact: 'hasRightsMaintenance',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'monthlySalaryGross',
          operator: 'lessThan',
          value: MINIMUM_GUARANTEED_INCOME,
        },
      ],
    },
    event: {
      type: 'agr-eligible',
      params: {
        message: 'Eligible pour AGR',
      },
    },
    priority: 10,
  });

  // Rule 2: Salary too high
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'employmentStatus',
          operator: 'equal',
          value: 'part-time',
        },
        {
          fact: 'monthlySalaryGross',
          operator: 'greaterThanInclusive',
          value: MINIMUM_GUARANTEED_INCOME,
        },
      ],
    },
    event: {
      type: 'agr-ineligible',
      params: {
        reason: 'salaire supérieur au minimum garanti',
      },
    },
    priority: 9,
  });

  // Rule 3: No rights maintenance
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'employmentStatus',
          operator: 'equal',
          value: 'part-time',
        },
        {
          fact: 'hasRightsMaintenance',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'agr-ineligible',
      params: {
        reason: 'pas de maintien des droits',
      },
    },
    priority: 9,
  });

  // Rule 4: Incompatible with full unemployment benefit
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'currentBenefits',
          operator: 'contains',
          value: 'unemployment',
        },
      ],
    },
    event: {
      type: 'agr-ineligible',
      params: {
        reason: 'cumul interdit avec chômage complet',
      },
    },
    priority: 8,
  });

  return engine;
}

/**
 * Calculate AGR amount based on salary
 */
export function calculateAGRAmount(monthlySalaryGross: number): number {
  if (monthlySalaryGross >= MINIMUM_GUARANTEED_INCOME) {
    return 0;
  }

  const netSalaryEstimate = monthlySalaryGross * AGR_CALCULATION_RATE;
  const agrAmount = MINIMUM_GUARANTEED_INCOME - netSalaryEstimate;

  return Math.max(0, Math.round(agrAmount));
}

/**
 * Check AGR eligibility for a user
 */
export async function checkAGREligibility(user: User): Promise<EligibilityCheck> {
  const engine = createAGREngine();

  // Prepare facts for the rules engine
  const facts = {
    employmentStatus: user.employmentStatus,
    hasRightsMaintenance: user.hasRightsMaintenance,
    monthlySalaryGross: user.monthlySalaryGross,
    currentBenefits: user.currentBenefits.map((b) => b.type),
  };

  try {
    const results = await engine.run(facts);

    // Check if eligible
    const eligibleEvent = results.events.find((e) => e.type === 'agr-eligible');
    const ineligibleEvent = results.events.find((e) => e.type === 'agr-ineligible');

    if (eligibleEvent) {
      const amount = calculateAGRAmount(user.monthlySalaryGross);
      const optimizationHint = getOptimizationHint(user.workingHoursPerWeek);

      return {
        benefitType: 'agr',
        isEligible: true,
        calculatedAmount: amount,
        optimizationSuggestion: optimizationHint,
      };
    }

    if (ineligibleEvent) {
      return {
        benefitType: 'agr',
        isEligible: false,
        reason: ineligibleEvent.params?.reason,
      };
    }

    // Default: not eligible (shouldn't reach here)
    return {
      benefitType: 'agr',
      isEligible: false,
      reason: 'conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Error checking AGR eligibility: ${error}`);
  }
}

/**
 * Get optimization hint based on working hours
 */
function getOptimizationHint(workingHoursPerWeek: number): string {
  if (workingHoursPerWeek < 20) {
    return 'Augmenter à 20-28h pour maximiser AGR';
  }

  if (workingHoursPerWeek >= 20 && workingHoursPerWeek <= 28) {
    return 'Zone optimale pour AGR';
  }

  if (workingHoursPerWeek > 28 && workingHoursPerWeek < 35) {
    return 'Augmenter légèrement peut réduire AGR - vérifier simulation';
  }

  return 'Temps plein, pas d\'AGR possible';
}

/**
 * Example of rule export in JSON format for transparency
 */
export const AGR_RULES_JSON = {
  rules: [
    {
      id: 'agr-basic-eligibility',
      description: 'Travailleur à temps partiel avec maintien des droits et salaire < 1650€',
      conditions: {
        all: [
          { fact: 'employmentStatus', operator: 'equal', value: 'part-time' },
          { fact: 'hasRightsMaintenance', operator: 'equal', value: true },
          { fact: 'monthlySalaryGross', operator: 'lessThan', value: 1650 },
        ],
      },
      outcome: 'eligible',
      calculation: '1650 - (salaire_brut * 0.8)',
      cumul: {
        allowed: ['salaire', 'allocations_familiales'],
        forbidden: ['chomage_complet', 'cpas'],
      },
    },
  ],
};
