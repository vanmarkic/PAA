/**
 * Business Rules for ECHR Application Admissibility
 *
 * BASE JURIDIQUE:
 * - Convention européenne des droits de l'homme, Articles 34-35
 *   https://www.echr.coe.int/documents/convention_eng.pdf
 * - Règlement de la Cour (janvier 2024), Règles 47-54
 *   https://www.echr.coe.int/documents/rules_court_eng.pdf
 * - Guide pratique sur les critères de recevabilité
 *   https://www.echr.coe.int/documents/admissibility_guide_eng.pdf
 */

import { Engine } from 'json-rules-engine';
import {
  ECHRApplication,
  AdmissibilityAssessment,
  AdmissibilityCheck,
  AdmissibilityCriteria,
  ECHR_DEADLINES,
  ECHR_THRESHOLDS,
  VictimStatus
} from '../../domain/courEuropeenneTypes';

/**
 * Create the ECHR admissibility rules engine
 * Implements all admissibility criteria from Article 35 ECHR
 */
function createAdmissibilityEngine(): Engine {
  const engine = new Engine();

  // ============================================================================
  // Rule 1: Six-Month Rule (Four-Month from February 2024)
  // ============================================================================
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasFinalDomesticDecision',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'violationAfterFebruary2024',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'daysSinceFinalDecision',
          operator: 'greaterThan',
          value: ECHR_DEADLINES.ADMISSIBILITY_DEADLINE_MONTHS * 30, // 4 months
        },
      ],
    },
    event: {
      type: 'inadmissible',
      params: {
        criteria: 'six-month-rule' as AdmissibilityCriteria,
        reason: 'Application submitted after 4-month deadline (new rule)',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Old 6-month rule for violations before February 2024
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasFinalDomesticDecision',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'violationAfterFebruary2024',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'daysSinceFinalDecision',
          operator: 'greaterThan',
          value: ECHR_DEADLINES.OLD_DEADLINE_MONTHS * 30, // 6 months
        },
      ],
    },
    event: {
      type: 'inadmissible',
      params: {
        criteria: 'six-month-rule' as AdmissibilityCriteria,
        reason: 'Application submitted after 6-month deadline (old rule)',
        priority: 10,
      },
    },
    priority: 10,
  });

  // ============================================================================
  // Rule 2: Exhaustion of Domestic Remedies
  // ============================================================================
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'domesticRemediesExhausted',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'remediesIneffective',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'inadmissible',
      params: {
        criteria: 'exhaustion-domestic-remedies' as AdmissibilityCriteria,
        reason: 'Domestic remedies not exhausted and no exception applies',
        priority: 10,
      },
    },
    priority: 10,
  });

  // ============================================================================
  // Rule 3: Victim Status Requirement
  // ============================================================================
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasVictimStatus',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'inadmissible',
      params: {
        criteria: 'victim-status' as AdmissibilityCriteria,
        reason: 'Applicant does not have victim status under Article 34',
        priority: 10,
      },
    },
    priority: 10,
  });

  // ============================================================================
  // Rule 4: Significant Disadvantage
  // ============================================================================
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'financialImpact',
          operator: 'lessThan',
          value: ECHR_THRESHOLDS.SIGNIFICANT_DISADVANTAGE_AMOUNT,
        },
        {
          fact: 'hasNonPecuniaryDamage',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'raisesImportantPrinciple',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'inadmissible',
      params: {
        criteria: 'significant-disadvantage' as AdmissibilityCriteria,
        reason: 'No significant disadvantage suffered',
        priority: 8,
      },
    },
    priority: 8,
  });

  // ============================================================================
  // Rule 5: Manifestly Ill-Founded
  // ============================================================================
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasArgumentableClaim',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'supportedByEvidence',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'inadmissible',
      params: {
        criteria: 'manifestly-ill-founded' as AdmissibilityCriteria,
        reason: 'Application is manifestly ill-founded',
        priority: 7,
      },
    },
    priority: 7,
  });

  // ============================================================================
  // Rule 6: Abuse of Right of Application
  // ============================================================================
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'containsFalseInformation',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'usesAbusiveLanguage',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'isVexatiousApplication',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'inadmissible',
      params: {
        criteria: 'abuse-of-right' as AdmissibilityCriteria,
        reason: 'Abuse of the right of application',
        priority: 9,
      },
    },
    priority: 9,
  });

  // ============================================================================
  // Rule 7: Anonymous or Incomplete Applications
  // ============================================================================
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isAnonymous',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'anonymityJustified',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'inadmissible',
      params: {
        criteria: 'anonymous-incomplete' as AdmissibilityCriteria,
        reason: 'Anonymous application without justification',
        priority: 6,
      },
    },
    priority: 6,
  });

  // ============================================================================
  // Rule 8: Substantially Same as Previous Application
  // ============================================================================
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'previouslyExamined',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'containsNewInformation',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'inadmissible',
      params: {
        criteria: 'substantially-same' as AdmissibilityCriteria,
        reason: 'Substantially same as previously examined application',
        priority: 5,
      },
    },
    priority: 5,
  });

  // ============================================================================
  // Rule 9: Incompatibility Ratione Temporis
  // ============================================================================
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'violationDate',
          operator: 'lessThan',
          value: (fact: any) => {
            // Get stateRatificationDate from context if available
            return fact.stateRatificationDate || new Date('1950-11-04'); // ECHR entry into force
          },
        },
      ],
    },
    event: {
      type: 'inadmissible',
      params: {
        criteria: 'incompatible-ratione-temporis' as AdmissibilityCriteria,
        reason: 'Violation occurred before State ratification of Convention',
        priority: 10,
      },
    },
    priority: 10,
  });

  // ============================================================================
  // Rule 10: Admissibility Success - All Criteria Met
  // ============================================================================
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'domesticRemediesExhausted',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'withinTimeLimit',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasVictimStatus',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasSignificantDisadvantage',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasArgumentableClaim',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'admissible',
      params: {
        message: 'Application meets all admissibility criteria',
        priority: 1,
      },
    },
    priority: 1,
  });

  return engine;
}

/**
 * Singleton instance of the admissibility rules engine
 * Performance optimization: reuse engine instance
 */
const admissibilityEngineInstance = createAdmissibilityEngine();

/**
 * Check ECHR application admissibility
 */
export async function checkAdmissibility(
  application: ECHRApplication
): Promise<AdmissibilityAssessment> {
  const facts = extractAdmissibilityFacts(application);
  const results = await admissibilityEngineInstance.run(facts);

  return processAdmissibilityResults(results, application);
}

/**
 * Extract facts from application for rules engine
 */
function extractAdmissibilityFacts(application: ECHRApplication): Record<string, any> {
  const now = new Date();
  const finalDecisionDate = application.dateFinalDomesticDecision;
  const daysSinceDecision = finalDecisionDate
    ? Math.floor((now.getTime() - finalDecisionDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const violationAfterFeb2024 = application.violations.some(v => {
    if (v.violationPeriod?.start) {
      return v.violationPeriod.start >= new Date('2024-02-01');
    }
    return false;
  });

  const victimStatus = calculateVictimStatus(application.applicants);
  const financialImpact = calculateFinancialImpact(application);
  const domesticRemediesStatus = analyzeDomesticRemedies(application.domesticRemedies);

  return {
    hasFinalDomesticDecision: !!finalDecisionDate,
    daysSinceFinalDecision: daysSinceDecision,
    violationAfterFebruary2024: violationAfterFeb2024,
    domesticRemediesExhausted: domesticRemediesStatus.exhausted,
    remediesIneffective: domesticRemediesStatus.ineffective,
    hasVictimStatus: victimStatus.isValid,
    financialImpact: financialImpact,
    hasNonPecuniaryDamage: hasNonPecuniaryDamage(application),
    raisesImportantPrinciple: raisesImportantPrinciple(application),
    hasArgumentableClaim: hasArgumentableClaim(application),
    supportedByEvidence: isWellSupported(application),
    withinTimeLimit: isWithinTimeLimit(daysSinceDecision, violationAfterFeb2024),
    hasSignificantDisadvantage: financialImpact >= ECHR_THRESHOLDS.SIGNIFICANT_DISADVANTAGE_AMOUNT,
    isAnonymous: application.applicants.some(a => a.isAnonymous),
    anonymityJustified: application.applicants.some(a => a.anonymityRequested && hasValidAnonymityReason(a)),
    containsFalseInformation: false, // Would require verification
    usesAbusiveLanguage: false, // Would require text analysis
    isVexatiousApplication: false, // Would require history check
    previouslyExamined: false, // Would require database check
    containsNewInformation: true, // Assume new unless proven otherwise
    violationDate: getEarliestViolationDate(application),
    stateRatificationDate: getStateRatificationDate(application.respondentState),
  };
}

/**
 * Calculate victim status from applicants
 */
function calculateVictimStatus(applicants: any[]): { isValid: boolean } {
  return {
    isValid: applicants.some(a =>
      a.victimStatus.isDirectVictim ||
      a.victimStatus.isIndirectVictim ||
      a.victimStatus.isPotentialVictim
    ),
  };
}

/**
 * Calculate total financial impact
 */
function calculateFinancialImpact(application: ECHRApplication): number {
  if (!application.justSatisfaction) return 0;

  let total = 0;
  if (application.justSatisfaction.pecuniaryDamage) {
    total += application.justSatisfaction.pecuniaryDamage.amount;
  }

  // Also consider significant disadvantage claims
  const significantDisadvantage = application.applicants
    .map(a => a.victimStatus.significantDisadvantage?.financialImpact || 0)
    .reduce((sum, amount) => sum + amount, 0);

  return Math.max(total, significantDisadvantage);
}

/**
 * Analyze domestic remedies exhaustion
 */
function analyzeDomesticRemedies(remedies: any[]): { exhausted: boolean; ineffective: boolean } {
  if (!remedies || remedies.length === 0) {
    return { exhausted: false, ineffective: false };
  }

  const hasFinalDecision = remedies.some(r => r.finalDecision === true);
  const allIneffective = remedies.every(r => r.ineffectiveReason);

  return {
    exhausted: hasFinalDecision,
    ineffective: allIneffective,
  };
}

/**
 * Check for non-pecuniary damage
 */
function hasNonPecuniaryDamage(application: ECHRApplication): boolean {
  return !!application.justSatisfaction?.nonPecuniaryDamage?.amount;
}

/**
 * Check if case raises important principle
 */
function raisesImportantPrinciple(application: ECHRApplication): boolean {
  // Check for systemic issues, pilot judgment potential, or novel legal questions
  return !!(application.priorityRequested &&
           (application.priorityReason?.includes('systemic') ||
            application.priorityReason?.includes('principle')));
}

/**
 * Check if claim is arguable
 */
function hasArgumentableClaim(application: ECHRApplication): boolean {
  return application.violations.length > 0 &&
         application.violations.every(v =>
           v.legalArguments.length > 0 &&
           v.evidence.length > 0
         );
}

/**
 * Check if application is well-supported
 */
function isWellSupported(application: ECHRApplication): boolean {
  return application.violations.every(v =>
    v.evidence.length >= 2 &&
    v.caseReferences.length >= 1
  );
}

/**
 * Check if within time limit
 */
function isWithinTimeLimit(daysSince: number | null, afterFeb2024: boolean): boolean {
  if (daysSince === null) return false;

  const limitDays = afterFeb2024
    ? ECHR_DEADLINES.ADMISSIBILITY_DEADLINE_MONTHS * 30
    : ECHR_DEADLINES.OLD_DEADLINE_MONTHS * 30;

  return daysSince <= limitDays;
}

/**
 * Check if anonymity reason is valid
 */
function hasValidAnonymityReason(applicant: any): boolean {
  return applicant.victimStatus.harmDescription.includes('retaliation') ||
         applicant.victimStatus.harmDescription.includes('safety');
}

/**
 * Get earliest violation date
 */
function getEarliestViolationDate(application: ECHRApplication): Date {
  const dates = application.violations
    .filter(v => v.violationPeriod?.start)
    .map(v => v.violationPeriod!.start);

  return dates.length > 0
    ? new Date(Math.min(...dates.map(d => d.getTime())))
    : new Date();
}

/**
 * Get state ratification date (simplified - would need full database)
 */
function getStateRatificationDate(countryCode: string): Date {
  // Simplified example - in reality would query database
  const ratificationDates: Record<string, Date> = {
    'BE': new Date('1955-06-14'), // Belgium
    'FR': new Date('1974-05-03'), // France
    'DE': new Date('1952-12-05'), // Germany
    'UK': new Date('1951-03-08'), // United Kingdom
    // ... other countries
  };

  return ratificationDates[countryCode] || new Date('1950-11-04');
}

/**
 * Process rules engine results into assessment
 */
function processAdmissibilityResults(
  results: any,
  application: ECHRApplication
): AdmissibilityAssessment {
  const inadmissibleEvents = results.events.filter((e: any) => e.type === 'inadmissible');
  const admissibleEvents = results.events.filter((e: any) => e.type === 'admissible');

  const criteria: AdmissibilityCheck[] = [];
  const recommendations: string[] = [];
  const missingElements: string[] = [];

  // Process inadmissible criteria
  inadmissibleEvents.forEach((event: any) => {
    criteria.push({
      criteria: event.params.criteria,
      satisfied: false,
      reason: event.params.reason,
    });
  });

  // Add recommendations based on failures
  if (criteria.some(c => c.criteria === 'six-month-rule')) {
    recommendations.push('Time limit has expired - consider if continuing violation applies');
  }

  if (criteria.some(c => c.criteria === 'exhaustion-domestic-remedies')) {
    recommendations.push('Complete all domestic remedies or demonstrate their ineffectiveness');
    missingElements.push('Final domestic court decision');
  }

  if (criteria.some(c => c.criteria === 'victim-status')) {
    recommendations.push('Demonstrate direct, indirect, or potential victim status');
    missingElements.push('Evidence of personal harm');
  }

  // Determine case strength
  let caseStrength: 'strong' | 'moderate' | 'weak';
  if (admissibleEvents.length > 0 && criteria.length === 0) {
    caseStrength = 'strong';
  } else if (criteria.length <= 2 && criteria.every(c => c.criteria !== 'six-month-rule')) {
    caseStrength = 'moderate';
  } else {
    caseStrength = 'weak';
  }

  return {
    overallAdmissible: admissibleEvents.length > 0 && inadmissibleEvents.length === 0,
    criteria,
    recommendations,
    missingElements: missingElements.length > 0 ? missingElements : undefined,
    caseStrength,
  };
}

/**
 * Quick admissibility check for preliminary assessment
 */
export function quickAdmissibilityCheck(
  finalDecisionDate: Date | null,
  hasExhaustedRemedies: boolean,
  isVictim: boolean
): { likely: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!finalDecisionDate) {
    issues.push('No final domestic decision');
  } else {
    const daysSince = Math.floor(
      (new Date().getTime() - finalDecisionDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSince > ECHR_DEADLINES.ADMISSIBILITY_DEADLINE_MONTHS * 30) {
      issues.push('Likely outside time limit');
    }
  }

  if (!hasExhaustedRemedies) {
    issues.push('Domestic remedies may not be exhausted');
  }

  if (!isVictim) {
    issues.push('Victim status unclear');
  }

  return {
    likely: issues.length === 0,
    issues,
  };
}