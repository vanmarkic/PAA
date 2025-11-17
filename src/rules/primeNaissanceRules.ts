/**
 * Business Rules for Prime de Naissance (Birth Allowance)
 *
 * Implements eligibility rules for Belgian birth allowance.
 *
 * BASE JURIDIQUE:
 * - Allocations familiales - Prime de naissance
 * - Régionalisé depuis 2020 (Bruxelles, Flandre, Wallonie)
 * - Montants variables selon région et rang de l'enfant
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';
import { FAMILY_ALLOWANCES_AMOUNTS_2024 } from '../legal-sources/belgianLegalSources';

// Constants from family allowances law
const MAX_AGE_CHILD = 0; // Must be newborn
const DECLARATION_DEADLINE_DAYS = 90; // Days to declare birth

/**
 * Create the Birth Allowance eligibility rules engine
 */
function createBirthAllowanceEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Child must be newborn
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'childAge',
          operator: 'greaterThan',
          value: MAX_AGE_CHILD,
        },
      ],
    },
    event: {
      type: 'birth-allowance-ineligible',
      params: {
        reason: 'prime de naissance uniquement pour nouveau-né',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 2: Declaration deadline
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'daysSinceBirth',
          operator: 'greaterThan',
          value: DECLARATION_DEADLINE_DAYS,
        },
      ],
    },
    event: {
      type: 'birth-allowance-ineligible',
      params: {
        reason: `délai de déclaration dépassé (${DECLARATION_DEADLINE_DAYS} jours)`,
        priority: 9,
      },
    },
    priority: 9,
  });

  // Rule 3: Residency requirement
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
      type: 'birth-allowance-ineligible',
      params: {
        reason: 'pas de résidence valide en Belgique',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 4: Basic eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'childAge',
          operator: 'equal',
          value: MAX_AGE_CHILD,
        },
        {
          fact: 'daysSinceBirth',
          operator: 'lessThanInclusive',
          value: DECLARATION_DEADLINE_DAYS,
        },
        {
          fact: 'residencyStatus',
          operator: 'notIn',
          value: ['no-valid-status'],
        },
      ],
    },
    event: {
      type: 'birth-allowance-eligible',
      params: {
        message: 'Éligible pour prime de naissance',
      },
    },
    priority: 5,
  });

  return engine;
}

/**
 * Singleton instance of the Birth Allowance rules engine
 */
const birthAllowanceEngineInstance = createBirthAllowanceEngine();

/**
 * Calculate birth allowance amount based on child rank
 */
export function calculateBirthAllowanceAmount(
  childRank: number,
  isMultipleBirth: boolean = false
): number {
  // Use amounts from family allowances (Bruxelles example)
  let baseAmount = 0;

  if (childRank === 1) {
    baseAmount = FAMILY_ALLOWANCES_AMOUNTS_2024.birthAllowance.firstChild;
  } else {
    baseAmount = FAMILY_ALLOWANCES_AMOUNTS_2024.birthAllowance.otherChildren;
  }

  // Multiple birth supplement (example: 50% increase)
  if (isMultipleBirth) {
    baseAmount = baseAmount * 1.5;
  }

  return Math.round(baseAmount * 100) / 100;
}

/**
 * Check Birth Allowance eligibility
 */
export async function checkBirthAllowanceEligibility(
  childAge: number,
  daysSinceBirth: number,
  residencyStatus: string
): Promise<EligibilityCheck> {
  const facts = {
    childAge,
    daysSinceBirth,
    residencyStatus,
  };

  try {
    const results = await birthAllowanceEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'birth-allowance-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'birth-allowance-eligible');

    if (ineligibleEvent) {
      return {
        benefitType: 'family-allowance', // Birth allowance is part of family allowances
        isEligible: false,
        reason: ineligibleEvent.params?.reason,
      };
    }

    if (eligibleEvent) {
      return {
        benefitType: 'family-allowance',
        isEligible: true,
        calculatedAmount: 0, // Will be calculated separately based on rank
      };
    }

    return {
      benefitType: 'family-allowance',
      isEligible: false,
      reason: 'conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Error checking Birth Allowance eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const BIRTH_ALLOWANCE_RULES_JSON = {
  legalFramework: {
    note: 'Prime de naissance fait partie des allocations familiales, régionalisées depuis 2020',
  },
  amounts: {
    firstChild: FAMILY_ALLOWANCES_AMOUNTS_2024.birthAllowance.firstChild,
    otherChildren: FAMILY_ALLOWANCES_AMOUNTS_2024.birthAllowance.otherChildren,
  },
  rules: [
    {
      id: 'birth-allowance-newborn-requirement',
      description: 'Enfant doit être nouveau-né (0 ans)',
      condition: 'childAge == 0',
      priority: 10,
    },
    {
      id: 'birth-allowance-declaration-deadline',
      description: `Déclaration doit être faite dans les ${DECLARATION_DEADLINE_DAYS} jours`,
      condition: `daysSinceBirth <= ${DECLARATION_DEADLINE_DAYS}`,
      priority: 9,
    },
    {
      id: 'birth-allowance-residency-requirement',
      description: 'Résidence valide en Belgique requise',
      condition: 'residencyStatus != no-valid-status',
      priority: 10,
    },
  ],
  constants: {
    declarationDeadlineDays: DECLARATION_DEADLINE_DAYS,
  },
};

