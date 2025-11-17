/**
 * Business Rules for EgaliteSalariale
 *
 * Implements eligibility rules for EgaliteSalariale.
 *
 * BASE JURIDIQUE:
 * - To be completed with specific legal references
 */

import { Engine } from 'json-rules-engine';
import { EligibilityCheck } from '../modele-metier/types';

/**
 * Create the EgaliteSalariale eligibility rules engine
 */
function createEgaliteSalarialeEngine(): Engine {
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
      type: 'egaliteSalariale-eligible',
      params: {
        message: 'Éligible pour EgaliteSalariale',
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
      type: 'egaliteSalariale-ineligible',
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
 * Singleton instance of the EgaliteSalariale rules engine
 */
const egaliteSalarialeEngineInstance = createEgaliteSalarialeEngine();

/**
 * Calculate EgaliteSalariale amount
 */
export function calculateEgaliteSalarialeAmount(
  // Parameters to be defined based on specific requirements
): number {
  // Calculation logic to be implemented
  return 0;
}

/**
 * Check EgaliteSalariale eligibility
 */
export async function checkEgaliteSalarialeEligibility(
  // Parameters to be defined based on specific requirements
): Promise<EligibilityCheck> {
  const facts = {
    // Facts to be defined
  };

  try {
    const results = await egaliteSalarialeEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'egaliteSalariale-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'egaliteSalariale-eligible');

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
    throw new Error(`Error checking EgaliteSalariale eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const EGALITESALARIALE_RULES_JSON = {
  legalFramework: {
    note: 'Base juridique à compléter',
  },
  rules: [
    {
      id: 'egaliteSalariale-basic-eligibility',
      description: 'Conditions de base à définir',
      condition: 'meetsBasicConditions == true',
      priority: 5,
    },
  ],
};
