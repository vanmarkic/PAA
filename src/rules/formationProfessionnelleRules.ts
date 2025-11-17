/**
 * Business Rules for FormationProfessionnelle
 *
 * Implements eligibility rules for FormationProfessionnelle.
 *
 * BASE JURIDIQUE:
 * - To be completed with specific legal references
 */

import { Engine } from 'json-rules-engine';
import { EligibilityCheck } from '../domain/types';

/**
 * Create the FormationProfessionnelle eligibility rules engine
 */
function createFormationProfessionnelleEngine(): Engine {
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
      type: 'formationProfessionnelle-eligible',
      params: {
        message: 'Éligible pour FormationProfessionnelle',
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
      type: 'formationProfessionnelle-ineligible',
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
 * Singleton instance of the FormationProfessionnelle rules engine
 */
const formationProfessionnelleEngineInstance = createFormationProfessionnelleEngine();

/**
 * Calculate FormationProfessionnelle amount
 */
export function calculateFormationProfessionnelleAmount(
  // Parameters to be defined based on specific requirements
): number {
  // Calculation logic to be implemented
  return 0;
}

/**
 * Check FormationProfessionnelle eligibility
 */
export async function checkFormationProfessionnelleEligibility(
  // Parameters to be defined based on specific requirements
): Promise<EligibilityCheck> {
  const facts = {
    // Facts to be defined
  };

  try {
    const results = await formationProfessionnelleEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'formationProfessionnelle-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'formationProfessionnelle-eligible');

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
    throw new Error(`Error checking FormationProfessionnelle eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const FORMATIONPROFESSIONNELLE_RULES_JSON = {
  legalFramework: {
    note: 'Base juridique à compléter',
  },
  rules: [
    {
      id: 'formationProfessionnelle-basic-eligibility',
      description: 'Conditions de base à définir',
      condition: 'meetsBasicConditions == true',
      priority: 5,
    },
  ],
};
