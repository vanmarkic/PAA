/**
 * Business Rules for FormationEntreprise
 *
 * Implements eligibility rules for FormationEntreprise.
 *
 * BASE JURIDIQUE:
 * - To be completed with specific legal references
 */

import { Engine } from 'json-rules-engine';
import { EligibilityCheck } from '../modele-metier/types';

/**
 * Create the FormationEntreprise eligibility rules engine
 */
function createFormationEntrepriseEngine(): Engine {
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
      type: 'formationEntreprise-eligible',
      params: {
        message: 'Éligible pour FormationEntreprise',
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
      type: 'formationEntreprise-ineligible',
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
 * Singleton instance of the FormationEntreprise rules engine
 */
const formationEntrepriseEngineInstance = createFormationEntrepriseEngine();

/**
 * Calculate FormationEntreprise amount
 */
export function calculateFormationEntrepriseAmount(
  // Parameters to be defined based on specific requirements
): number {
  // Calculation logic to be implemented
  return 0;
}

/**
 * Check FormationEntreprise eligibility
 */
export async function checkFormationEntrepriseEligibility(
  // Parameters to be defined based on specific requirements
): Promise<EligibilityCheck> {
  const facts = {
    // Facts to be defined
  };

  try {
    const results = await formationEntrepriseEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'formationEntreprise-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'formationEntreprise-eligible');

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
    throw new Error(`Error checking FormationEntreprise eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const FORMATIONENTREPRISE_RULES_JSON = {
  legalFramework: {
    note: 'Base juridique à compléter',
  },
  rules: [
    {
      id: 'formationEntreprise-basic-eligibility',
      description: 'Conditions de base à définir',
      condition: 'meetsBasicConditions == true',
      priority: 5,
    },
  ],
};
