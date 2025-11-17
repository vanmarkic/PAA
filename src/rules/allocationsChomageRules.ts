/**
 * Business Rules for Allocations de Chômage (Unemployment Benefits)
 *
 * Implements eligibility rules for Belgian unemployment benefits.
 *
 * BASE JURIDIQUE:
 * - Arrêté royal du 25 novembre 1991 portant réglementation du chômage
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1991112550&table_name=loi
 * - Office National de l'Emploi (ONEM)
 * - Conditions d'éligibilité et calculs basés sur jours travaillés
 */

import { Engine } from 'json-rules-engine';
import { EligibilityCheck } from '../domain/types';

// Constants from Belgian unemployment law
const MIN_WORKING_DAYS = 312; // Minimum days worked in last 18 months (for workers under 36)
const MIN_WORKING_DAYS_36_PLUS = 468; // Minimum days for workers 36+
const MIN_AGE = 18;
const MAX_DAILY_ALLOWANCE = 65.48; // Maximum daily allowance (2024, example)
const WAITING_PERIOD_DAYS = 0; // No waiting period for involuntary unemployment

/**
 * Create the Unemployment Benefits eligibility rules engine
 */
function createUnemploymentEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Age requirement
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'age',
          operator: 'lessThan',
          value: MIN_AGE,
        },
      ],
    },
    event: {
      type: 'unemployment-ineligible',
      params: {
        reason: `âge minimum non atteint (${MIN_AGE} ans requis)`,
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 2: Insufficient working days (under 36)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'lessThan',
          value: 36,
        },
        {
          fact: 'workingDays',
          operator: 'lessThan',
          value: MIN_WORKING_DAYS,
        },
      ],
    },
    event: {
      type: 'unemployment-ineligible',
      params: {
        reason: `jours travaillés insuffisants (${MIN_WORKING_DAYS} jours requis sur 18 mois)`,
        priority: 9,
      },
    },
    priority: 9,
  });

  // Rule 3: Insufficient working days (36+)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: 36,
        },
        {
          fact: 'workingDays',
          operator: 'lessThan',
          value: MIN_WORKING_DAYS_36_PLUS,
        },
      ],
    },
    event: {
      type: 'unemployment-ineligible',
      params: {
        reason: `jours travaillés insuffisants (${MIN_WORKING_DAYS_36_PLUS} jours requis sur 18 mois)`,
        priority: 9,
      },
    },
    priority: 9,
  });

  // Rule 4: Voluntary resignation (may affect eligibility)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'reasonForUnemployment',
          operator: 'equal',
          value: 'demission',
        },
        {
          fact: 'hasValidReason',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'unemployment-ineligible',
      params: {
        reason: 'démission volontaire sans raison valable',
        priority: 8,
      },
    },
    priority: 8,
  });

  // Rule 5: Basic eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: MIN_AGE,
        },
        {
          fact: 'workingDays',
          operator: 'greaterThanInclusive',
          value: ({ context }: { context: { age: number } }) => {
            return context.age < 36 ? MIN_WORKING_DAYS : MIN_WORKING_DAYS_36_PLUS;
          },
        },
        {
          fact: 'reasonForUnemployment',
          operator: 'in',
          value: ['licenciement', 'fin-contrat', 'force-majeure'],
        },
        {
          fact: 'isRegisteredONEM',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'unemployment-eligible',
      params: {
        message: 'Éligible pour allocations de chômage',
      },
    },
    priority: 5,
  });

  return engine;
}

/**
 * Singleton instance of the Unemployment rules engine
 */
const unemploymentEngineInstance = createUnemploymentEngine();

/**
 * Calculate unemployment benefit amount based on previous salary and working days
 */
export function calculateUnemploymentAmount(
  previousSalary: number,
  workingDays: number,
  age: number,
  familySituation: 'isolé' | 'cohabitant' | 'avec-charge' = 'isolé'
): number {
  // Base calculation: percentage of previous salary
  let basePercentage = 0.6; // 60% base

  // Adjust for family situation
  if (familySituation === 'avec-charge') {
    basePercentage = 0.75; // 75% with dependents
  } else if (familySituation === 'cohabitant') {
    basePercentage = 0.55; // 55% for cohabitant
  }

  // Calculate daily amount
  const dailySalary = previousSalary / 22; // Average working days per month
  const dailyAllowance = dailySalary * basePercentage;

  // Apply maximum cap
  const cappedDailyAllowance = Math.min(dailyAllowance, MAX_DAILY_ALLOWANCE);

  // Monthly amount (22 working days)
  const monthlyAmount = cappedDailyAllowance * 22;

  return Math.round(monthlyAmount * 100) / 100;
}

/**
 * Check Unemployment Benefits eligibility
 */
export async function checkUnemploymentEligibility(
  age: number,
  workingDays: number,
  reasonForUnemployment: 'licenciement' | 'fin-contrat' | 'force-majeure' | 'demission' | 'autre',
  isRegisteredONEM: boolean,
  hasValidReason: boolean = false
): Promise<EligibilityCheck> {
  const facts = {
    age,
    workingDays,
    reasonForUnemployment,
    isRegisteredONEM,
    hasValidReason,
  };

  try {
    const results = await unemploymentEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'unemployment-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'unemployment-eligible');

    if (ineligibleEvent) {
      return {
        benefitType: 'unemployment',
        isEligible: false,
        reason: ineligibleEvent.params?.reason,
      };
    }

    if (eligibleEvent) {
      return {
        benefitType: 'unemployment',
        isEligible: true,
        calculatedAmount: 0, // Will be calculated separately
      };
    }

    return {
      benefitType: 'unemployment',
      isEligible: false,
      reason: 'conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Error checking Unemployment eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const UNEMPLOYMENT_RULES_JSON = {
  legalFramework: {
    primaryLegislation: {
      title: 'Arrêté royal du 25 novembre 1991 portant réglementation du chômage',
      date: '1991-11-25',
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1991112550&table_name=loi',
      authority: 'Office National de l\'Emploi (ONEM)',
    },
  },
  rules: [
    {
      id: 'unemployment-age-requirement',
      description: `Personne doit avoir au moins ${MIN_AGE} ans`,
      condition: `age >= ${MIN_AGE}`,
      priority: 10,
      legalBasis: {
        arrete: 'Arrêté royal du 25 novembre 1991',
        url: 'https://www.ejustice.just.fgov.be',
      },
    },
    {
      id: 'unemployment-working-days-requirement',
      description: `Minimum ${MIN_WORKING_DAYS} jours travaillés (moins de 36 ans) ou ${MIN_WORKING_DAYS_36_PLUS} jours (36 ans et plus)`,
      condition: 'workingDays >= (age < 36 ? MIN_WORKING_DAYS : MIN_WORKING_DAYS_36_PLUS)',
      priority: 9,
      legalBasis: {
        arrete: 'Arrêté royal du 25 novembre 1991',
        url: 'https://www.ejustice.just.fgov.be',
      },
    },
    {
      id: 'unemployment-reason-requirement',
      description: 'Raison de chômage doit être valide (licenciement, fin contrat, force majeure)',
      condition: 'reasonForUnemployment IN [licenciement, fin-contrat, force-majeure]',
      priority: 8,
      legalBasis: {
        arrete: 'Arrêté royal du 25 novembre 1991',
        url: 'https://www.ejustice.just.fgov.be',
      },
    },
    {
      id: 'unemployment-registration-requirement',
      description: 'Inscription obligatoire auprès de l\'ONEM',
      condition: 'isRegisteredONEM == true',
      priority: 10,
      legalBasis: {
        arrete: 'Arrêté royal du 25 novembre 1991',
        url: 'https://www.ejustice.just.fgov.be',
      },
    },
  ],
  constants: {
    minWorkingDays: MIN_WORKING_DAYS,
    minWorkingDays36Plus: MIN_WORKING_DAYS_36_PLUS,
    maxDailyAllowance: MAX_DAILY_ALLOWANCE,
    waitingPeriodDays: WAITING_PERIOD_DAYS,
  },
};

