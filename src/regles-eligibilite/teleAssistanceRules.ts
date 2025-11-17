/**
 * Business Rules for TeleAssistance
 *
 * Implements eligibility rules for TeleAssistance.
 *
 * BASE JURIDIQUE:
 * - To be completed with specific legal references
 */

import { Engine } from 'json-rules-engine';
import { EligibilityCheck } from '../modele-metier/types';

/**
 * Create the TeleAssistance eligibility rules engine
 */
function createTeleAssistanceEngine(): Engine {
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
      type: 'teleAssistance-eligible',
      params: {
        message: 'Éligible pour TeleAssistance',
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
      type: 'teleAssistance-ineligible',
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
 * Singleton instance of the TeleAssistance rules engine
 */
const teleAssistanceEngineInstance = createTeleAssistanceEngine();

/**
 * Calculate TeleAssistance amount
 */
export function calculateTeleAssistanceAmount(
  // Parameters to be defined based on specific requirements
): number {
  // Calculation logic to be implemented
  return 0;
}

/**
 * Check TeleAssistance eligibility
 */
export async function checkTeleAssistanceEligibility(
  // Parameters to be defined based on specific requirements
): Promise<EligibilityCheck> {
  const facts = {
    // Facts to be defined
  };

  try {
    const results = await teleAssistanceEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'teleAssistance-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'teleAssistance-eligible');

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
    throw new Error(`Error checking TeleAssistance eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const TELEASSISTANCE_RULES_JSON = {
  legalFramework: {
    note: 'Base juridique à compléter',
  },
  rules: [
    {
      id: 'teleAssistance-basic-eligibility',
      description: 'Conditions de base à définir',
      condition: 'meetsBasicConditions == true',
      priority: 5,
    },
  ],
};
