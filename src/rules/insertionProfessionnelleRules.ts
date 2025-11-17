/**
 * Business Rules for InsertionProfessionnelle
 *
 * Implements eligibility rules for InsertionProfessionnelle.
 *
 * BASE JURIDIQUE:
 * - To be completed with specific legal references
 */

import { Engine } from 'json-rules-engine';
import { EligibilityCheck } from '../domain/types';

/**
 * Create the InsertionProfessionnelle eligibility rules engine
 */
function createInsertionProfessionnelleEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Basic eligibility check
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'meetsBasicConditions',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'insertionProfessionnelle-eligible',
      params: {
        message: 'Éligible pour InsertionProfessionnelle',
      },
    },
    priority: 5,
  });

  // Rule 2: Ineligibility check
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'meetsBasicConditions',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'insertionProfessionnelle-ineligible',
      params: {
        reason: 'conditions de base non remplies',
        priority: 10,
      },
    },
    priority: 10,
  });

  return engine;
}

/**
 * Singleton instance of the InsertionProfessionnelle rules engine
 */
const insertionProfessionnelleEngineInstance = createInsertionProfessionnelleEngine();

/**
 * Calculate InsertionProfessionnelle amount
 */
export function calculateInsertionProfessionnelleAmount(
  // Parameters to be defined based on specific requirements
): number {
  // Calculation logic to be implemented
  return 0;
}

/**
 * Check InsertionProfessionnelle eligibility
 */
export async function checkInsertionProfessionnelleEligibility(
  // Parameters to be defined based on specific requirements
): Promise<EligibilityCheck> {
  const facts = {
    // Facts to be defined
  };

  try {
    const results = await insertionProfessionnelleEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'insertionProfessionnelle-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'insertionProfessionnelle-eligible');

    if (ineligibleEvent) {
      return {
        benefitType: 'housing-allowance', // To be updated with correct type
        isEligible: false,
        reason: ineligibleEvent.params?.reason,
      };
    }

    if (eligibleEvent) {
      return {
        benefitType: 'housing-allowance', // To be updated with correct type
        isEligible: true,
        calculatedAmount: 0,
      };
    }

    return {
      benefitType: 'housing-allowance', // To be updated with correct type
      isEligible: false,
      reason: 'conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Error checking InsertionProfessionnelle eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const INSERTIONPROFESSIONNELLE_RULES_JSON = {
  legalFramework: {
    note: 'Base juridique à compléter',
  },
  rules: [
    {
      id: 'insertionProfessionnelle-basic-eligibility',
      description: 'Conditions de base à définir',
      condition: 'meetsBasicConditions == true',
      priority: 5,
    },
  ],
};
