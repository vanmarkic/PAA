/**
 * Business Rules for BonusLogement
 *
 * Implements eligibility rules for BonusLogement.
 *
 * BASE JURIDIQUE:
 * - To be completed with specific legal references
 */

import { Engine } from 'json-rules-engine';
import { EligibilityCheck } from '../modele-metier/types';

/**
 * Create the BonusLogement eligibility rules engine
 */
function createBonusLogementEngine(): Engine {
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
      type: 'bonusLogement-eligible',
      params: {
        message: 'Éligible pour BonusLogement',
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
      type: 'bonusLogement-ineligible',
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
 * Singleton instance of the BonusLogement rules engine
 */
const bonusLogementEngineInstance = createBonusLogementEngine();

/**
 * Calculate BonusLogement amount
 */
export function calculateBonusLogementAmount(
  // Parameters to be defined based on specific requirements
): number {
  // Calculation logic to be implemented
  return 0;
}

/**
 * Check BonusLogement eligibility
 */
export async function checkBonusLogementEligibility(
  // Parameters to be defined based on specific requirements
): Promise<EligibilityCheck> {
  const facts = {
    // Facts to be defined
  };

  try {
    const results = await bonusLogementEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'bonusLogement-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'bonusLogement-eligible');

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
    throw new Error(`Error checking BonusLogement eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const BONUSLOGEMENT_RULES_JSON = {
  legalFramework: {
    note: 'Base juridique à compléter',
  },
  rules: [
    {
      id: 'bonusLogement-basic-eligibility',
      description: 'Conditions de base à définir',
      condition: 'meetsBasicConditions == true',
      priority: 5,
    },
  ],
};
