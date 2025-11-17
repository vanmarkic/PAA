/**
 * Business Rules for DeductionInvestissement
 *
 * Implements eligibility rules for DeductionInvestissement.
 *
 * BASE JURIDIQUE:
 * - To be completed with specific legal references
 */

import { Engine } from 'json-rules-engine';
import { EligibilityCheck } from '../modele-metier/types';

/**
 * Create the DeductionInvestissement eligibility rules engine
 */
function createDeductionInvestissementEngine(): Engine {
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
      type: 'deductionInvestissement-eligible',
      params: {
        message: 'Éligible pour DeductionInvestissement',
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
      type: 'deductionInvestissement-ineligible',
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
 * Singleton instance of the DeductionInvestissement rules engine
 */
const deductionInvestissementEngineInstance = createDeductionInvestissementEngine();

/**
 * Calculate DeductionInvestissement amount
 */
export function calculateDeductionInvestissementAmount(
  // Parameters to be defined based on specific requirements
): number {
  // Calculation logic to be implemented
  return 0;
}

/**
 * Check DeductionInvestissement eligibility
 */
export async function checkDeductionInvestissementEligibility(
  // Parameters to be defined based on specific requirements
): Promise<EligibilityCheck> {
  const facts = {
    // Facts to be defined
  };

  try {
    const results = await deductionInvestissementEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'deductionInvestissement-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'deductionInvestissement-eligible');

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
    throw new Error(`Error checking DeductionInvestissement eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const DEDUCTIONINVESTISSEMENT_RULES_JSON = {
  legalFramework: {
    note: 'Base juridique à compléter',
  },
  rules: [
    {
      id: 'deductionInvestissement-basic-eligibility',
      description: 'Conditions de base à définir',
      condition: 'meetsBasicConditions == true',
      priority: 5,
    },
  ],
};
