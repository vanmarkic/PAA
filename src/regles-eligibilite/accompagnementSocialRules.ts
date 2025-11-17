/**
 * Business Rules for AccompagnementSocial
 *
 * Implements eligibility rules for AccompagnementSocial.
 *
 * BASE JURIDIQUE:
 * - To be completed with specific legal references
 */

import { Engine } from 'json-rules-engine';
import { EligibilityCheck } from '../modele-metier/types';

/**
 * Create the AccompagnementSocial eligibility rules engine
 */
function createAccompagnementSocialEngine(): Engine {
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
      type: 'accompagnementSocial-eligible',
      params: {
        message: 'Éligible pour AccompagnementSocial',
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
      type: 'accompagnementSocial-ineligible',
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
 * Singleton instance of the AccompagnementSocial rules engine
 */
const accompagnementSocialEngineInstance = createAccompagnementSocialEngine();

/**
 * Calculate AccompagnementSocial amount
 */
export function calculateAccompagnementSocialAmount(
  // Parameters to be defined based on specific requirements
): number {
  // Calculation logic to be implemented
  return 0;
}

/**
 * Check AccompagnementSocial eligibility
 */
export async function checkAccompagnementSocialEligibility(
  // Parameters to be defined based on specific requirements
): Promise<EligibilityCheck> {
  const facts = {
    // Facts to be defined
  };

  try {
    const results = await accompagnementSocialEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'accompagnementSocial-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'accompagnementSocial-eligible');

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
    throw new Error(`Error checking AccompagnementSocial eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const ACCOMPAGNEMENTSOCIAL_RULES_JSON = {
  legalFramework: {
    note: 'Base juridique à compléter',
  },
  rules: [
    {
      id: 'accompagnementSocial-basic-eligibility',
      description: 'Conditions de base à définir',
      condition: 'meetsBasicConditions == true',
      priority: 5,
    },
  ],
};
