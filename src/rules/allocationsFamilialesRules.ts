/**
 * Business Rules for Allocations Familiales (Family Allowances)
 *
 * Implements eligibility rules for Belgian family allowances.
 *
 * BASE JURIDIQUE:
 * - Ordonnance du 25 avril 2019 réglant l'octroi des prestations familiales (Bruxelles)
 *   https://www.ejustice.just.fgov.be
 * - Régionalisation depuis le 1er janvier 2020
 * - Article 23 de la Constitution garantit le droit aux allocations familiales
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';
import { FAMILY_ALLOWANCES_LEGAL_FRAMEWORK, FAMILY_ALLOWANCES_AMOUNTS_2024 } from '../legal-sources/belgianLegalSources';

// Constants from Belgian family allowance law
const MIN_AGE_CHILD = 0;
const MAX_AGE_CHILD_UNCONDITIONAL = 18;
const MAX_AGE_CHILD_CONDITIONAL = 25;

/**
 * Create the Family Allowances eligibility rules engine
 */
function createFamilyAllowancesEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Child age requirement (0-18 unconditional, 18-25 conditional)
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'childAge',
          operator: 'lessThan',
          value: MIN_AGE_CHILD,
        },
        {
          all: [
            {
              fact: 'childAge',
              operator: 'greaterThan',
              value: MAX_AGE_CHILD_CONDITIONAL,
            },
            {
              fact: 'meetsConditionalCriteria',
              operator: 'equal',
              value: false,
            },
          ],
        },
      ],
    },
    event: {
      type: 'family-allowance-ineligible',
      params: {
        reason: 'enfant hors tranche d\'âge éligible',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 2: Residency requirement
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'residencyStatus',
          operator: 'equal',
          value: 'no-valid-status',
        },
      ],
    },
    event: {
      type: 'family-allowance-ineligible',
      params: {
        reason: 'pas de résidence valide en Belgique',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 3: Basic eligibility (child 0-18)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'childAge',
          operator: 'greaterThanInclusive',
          value: MIN_AGE_CHILD,
        },
        {
          fact: 'childAge',
          operator: 'lessThanInclusive',
          value: MAX_AGE_CHILD_UNCONDITIONAL,
        },
        {
          fact: 'residencyStatus',
          operator: 'notIn',
          value: ['no-valid-status'],
        },
      ],
    },
    event: {
      type: 'family-allowance-eligible',
      params: {
        message: 'Éligible pour allocations familiales (0-18 ans)',
      },
    },
    priority: 5,
  });

  // Rule 4: Conditional eligibility (child 18-25)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'childAge',
          operator: 'greaterThan',
          value: MAX_AGE_CHILD_UNCONDITIONAL,
        },
        {
          fact: 'childAge',
          operator: 'lessThanInclusive',
          value: MAX_AGE_CHILD_CONDITIONAL,
        },
        {
          fact: 'meetsConditionalCriteria',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'residencyStatus',
          operator: 'notIn',
          value: ['no-valid-status'],
        },
      ],
    },
    event: {
      type: 'family-allowance-eligible-conditional',
      params: {
        message: 'Éligible pour allocations familiales (18-25 ans avec conditions)',
      },
    },
    priority: 5,
  });

  return engine;
}

/**
 * Singleton instance of the Family Allowances rules engine
 */
const familyAllowancesEngineInstance = createFamilyAllowancesEngine();

/**
 * Calculate family allowance amount based on child age and birth date
 */
export function calculateFamilyAllowanceAmount(
  childAge: number,
  bornAfter2019: boolean,
  hasDisability: boolean = false,
  isOrphan: boolean = false
): number {
  let baseAmount = 0;

  // Determine base amount by age
  if (childAge >= 0 && childAge <= 11) {
    baseAmount = bornAfter2019
      ? FAMILY_ALLOWANCES_AMOUNTS_2024.monthlyAllowances.age0to11.bornAfter2019
      : FAMILY_ALLOWANCES_AMOUNTS_2024.monthlyAllowances.age0to11.bornBefore2019;
  } else if (childAge >= 12 && childAge <= 17) {
    baseAmount = bornAfter2019
      ? FAMILY_ALLOWANCES_AMOUNTS_2024.monthlyAllowances.age12to17.bornAfter2019
      : FAMILY_ALLOWANCES_AMOUNTS_2024.monthlyAllowances.age12to17.bornBefore2019;
  } else if (childAge >= 18 && childAge <= 24) {
    // Check if in higher education
    baseAmount = bornAfter2019
      ? FAMILY_ALLOWANCES_AMOUNTS_2024.monthlyAllowances.age18to24HigherEd.bornAfter2019
      : FAMILY_ALLOWANCES_AMOUNTS_2024.monthlyAllowances.age18to24HigherEd.bornBefore2019;
  }

  // Add supplements
  if (hasDisability && childAge <= 21) {
    // Disability supplement (amount varies)
    baseAmount += FAMILY_ALLOWANCES_AMOUNTS_2024.supplements.ageSupplement.min;
  }

  if (isOrphan) {
    // Orphan supplement (amount varies)
    baseAmount += FAMILY_ALLOWANCES_AMOUNTS_2024.supplements.ageSupplement.min;
  }

  return Math.round(baseAmount * 100) / 100;
}

/**
 * Check Family Allowances eligibility for a child
 */
export async function checkFamilyAllowancesEligibility(
  childAge: number,
  residencyStatus: string,
  meetsConditionalCriteria: boolean = false
): Promise<EligibilityCheck> {
  const facts = {
    childAge,
    residencyStatus,
    meetsConditionalCriteria,
  };

  try {
    const results = await familyAllowancesEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'family-allowance-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'family-allowance-eligible');
    const eligibleConditionalEvent = results.events.find(
      (e) => e.type === 'family-allowance-eligible-conditional'
    );

    if (ineligibleEvent) {
      return {
        benefitType: 'family-allowance',
        isEligible: false,
        reason: ineligibleEvent.params?.reason,
      };
    }

    if (eligibleEvent || eligibleConditionalEvent) {
      return {
        benefitType: 'family-allowance',
        isEligible: true,
        calculatedAmount: 0, // Will be calculated separately based on age
      };
    }

    return {
      benefitType: 'family-allowance',
      isEligible: false,
      reason: 'conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Error checking Family Allowances eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const FAMILY_ALLOWANCES_RULES_JSON = {
  legalFramework: {
    primaryLegislation: {
      title: FAMILY_ALLOWANCES_LEGAL_FRAMEWORK.primaryLegislation.title,
      date: FAMILY_ALLOWANCES_LEGAL_FRAMEWORK.primaryLegislation.date,
      officialUrl: FAMILY_ALLOWANCES_LEGAL_FRAMEWORK.primaryLegislation.officialUrl,
      authority: FAMILY_ALLOWANCES_LEGAL_FRAMEWORK.primaryLegislation.authority,
    },
    notes: FAMILY_ALLOWANCES_LEGAL_FRAMEWORK.notes,
  },
  amounts: FAMILY_ALLOWANCES_AMOUNTS_2024,
  rules: [
    {
      id: 'family-allowance-age-requirement',
      description: 'Enfant doit avoir entre 0 et 18 ans (inconditionnel) ou 18-25 ans (conditionnel)',
      condition: 'childAge >= 0 AND (childAge <= 18 OR (childAge <= 25 AND meetsConditionalCriteria))',
      priority: 10,
      legalBasis: {
        article: 'Article 23 Constitution',
        url: FAMILY_ALLOWANCES_LEGAL_FRAMEWORK.primaryLegislation.officialUrl,
      },
    },
    {
      id: 'family-allowance-residency-requirement',
      description: 'Résidence valide en Belgique requise',
      condition: 'residencyStatus != no-valid-status',
      priority: 10,
      legalBasis: {
        ordonnance: 'Ordonnance du 25 avril 2019',
        url: FAMILY_ALLOWANCES_LEGAL_FRAMEWORK.primaryLegislation.officialUrl,
      },
    },
  ],
  conditions: FAMILY_ALLOWANCES_AMOUNTS_2024.conditions,
};

