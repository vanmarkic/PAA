/**
 * Business Rules for Revenu d'Intégration Sociale (RIS)
 *
 * Implements the Gherkin specifications from features/benefits/ris.feature
 */

import { Engine } from 'json-rules-engine';
import { RISUser, RISEligibilityResult, RIS_AMOUNTS_2024, RIS_CONSTANTS, RISCategory } from '../domain/risTypes';

/**
 * Create the RIS eligibility rules engine
 */
export function createRISEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Age requirement (must be 18+)
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'age',
          operator: 'lessThan',
          value: RIS_CONSTANTS.MIN_AGE,
        },
      ],
    },
    event: {
      type: 'ris-ineligible',
      params: {
        reason: `âge minimum non atteint (${RIS_CONSTANTS.MIN_AGE} ans requis)`,
        priority: 10, // Highest priority - absolute requirement
      },
    },
    priority: 10,
  });

  // Rule 2: Residency status requirement
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
      type: 'ris-ineligible',
      params: {
        reason: 'pas de titre de séjour valide',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 3: Patrimony too high
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'patrimonyValue',
          operator: 'greaterThan',
          value: RIS_CONSTANTS.MAX_PATRIMONY_MOVABLE,
        },
      ],
    },
    event: {
      type: 'ris-ineligible',
      params: {
        reason: `patrimoine mobilier supérieur à ${RIS_CONSTANTS.MAX_PATRIMONY_MOVABLE}€`,
        priority: 9,
      },
    },
    priority: 9,
  });

  // Rule 4: Full-time student (with exceptions)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isFullTimeStudent',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'age',
          operator: 'lessThan',
          value: 25, // Students under 25 generally ineligible unless exceptions
        },
      ],
    },
    event: {
      type: 'ris-ineligible',
      params: {
        reason: 'étudiant temps plein (sauf exceptions)',
        priority: 8,
      },
    },
    priority: 8,
  });

  // Rule 5: Basic eligibility (all conditions met)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: RIS_CONSTANTS.MIN_AGE,
        },
        {
          fact: 'residencyStatus',
          operator: 'notIn',
          value: ['no-valid-status'],
        },
        {
          fact: 'patrimonyValue',
          operator: 'lessThanInclusive',
          value: RIS_CONSTANTS.MAX_PATRIMONY_MOVABLE,
        },
      ],
    },
    event: {
      type: 'ris-eligible-basic',
      params: {
        message: 'Conditions de base remplies',
      },
    },
    priority: 5,
  });

  return engine;
}

/**
 * Calculate RIS amount based on category and income
 */
export function calculateRISAmount(
  category: RISCategory,
  monthlyIncome: number,
  isReceivingRIS: boolean = false,
  workIncome: number = 0
): RISEligibilityResult {
  // Map category to key
  const categoryKey = category === 'famille monoparentale' ? 'familleMonoparentale' : category;

  // Get base amount for category
  const baseAmount = RIS_AMOUNTS_2024[categoryKey as keyof typeof RIS_AMOUNTS_2024] as number;

  // If person is working while receiving RIS, apply exemption
  if (isReceivingRIS && workIncome > 0) {
    const exemptedAmount = Math.min(
      workIncome * RIS_CONSTANTS.EXONERATION_RATE,
      RIS_AMOUNTS_2024.exonerationAmount
    );

    const netIncome = workIncome - exemptedAmount;
    const risAmount = Math.max(0, baseAmount - monthlyIncome + exemptedAmount);

    return {
      isEligible: true,
      category,
      monthlyAmount: Math.round(risAmount * 100) / 100,
      exoneration: {
        workIncome,
        exemptedAmount: Math.round(exemptedAmount * 100) / 100,
        netIncome: Math.round(netIncome * 100) / 100,
      },
    };
  }

  // Standard calculation: base amount minus other income
  const risAmount = Math.max(0, baseAmount - monthlyIncome);

  return {
    isEligible: risAmount > 0,
    category,
    monthlyAmount: Math.round(risAmount * 100) / 100,
  };
}

/**
 * Check RIS eligibility for a user
 */
export async function checkRISEligibility(user: RISUser): Promise<RISEligibilityResult> {
  const engine = createRISEngine();

  // Prepare facts
  const facts = {
    age: user.age,
    residencyStatus: user.residencyStatus,
    patrimonyValue: user.patrimonyValue,
    isFullTimeStudent: user.isFullTimeStudent,
    monthlyIncome: user.monthlyIncome,
  };

  try {
    const results = await engine.run(facts);

    // Check for ineligibility reasons
    const ineligibleEvent = results.events.find((e) => e.type === 'ris-ineligible');

    if (ineligibleEvent) {
      return {
        isEligible: false,
        reason: ineligibleEvent.params?.reason,
      };
    }

    // Check for basic eligibility
    const eligibleEvent = results.events.find((e) => e.type === 'ris-eligible-basic');

    if (eligibleEvent) {
      // Calculate amount based on category
      const calculation = calculateRISAmount(
        user.category,
        user.monthlyIncome,
        user.isCurrentlyReceivingRIS,
        user.monthlyIncome // Assuming monthlyIncome is work income if currently receiving RIS
      );

      // Add obligations
      const obligations = [
        'Signer un contrat PIIS (Projet Individualisé d\'Intégration Sociale)',
        'Être disponible pour le marché de l\'emploi',
        'Déclarer toute modification de votre situation',
        'Résider effectivement en Belgique',
      ];

      return {
        ...calculation,
        obligations,
      };
    }

    return {
      isEligible: false,
      reason: 'conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Error checking RIS eligibility: ${error}`);
  }
}

/**
 * Determine optimal category for maximum RIS
 */
export function determineOptimalCategory(user: RISUser): {
  suggestedCategory: RISCategory;
  reason: string;
  maxAmount: number;
} {
  if (user.childrenInCharge > 0) {
    return {
      suggestedCategory: 'famille monoparentale',
      reason: 'Vous avez des enfants à charge',
      maxAmount: RIS_AMOUNTS_2024.familleMonoparentale,
    };
  }

  if (user.householdIncome === undefined || user.householdIncome === 0) {
    return {
      suggestedCategory: 'isolé',
      reason: 'Vous vivez seul(e)',
      maxAmount: RIS_AMOUNTS_2024.isolé,
    };
  }

  return {
    suggestedCategory: 'cohabitant',
    reason: 'Vous vivez avec d\'autres personnes',
    maxAmount: RIS_AMOUNTS_2024.cohabitant,
  };
}

/**
 * Compare RIS with other benefits
 */
export function compareWithOtherBenefits(
  risAmount: number,
  otherBenefits: { type: string; amount: number }[]
): {
  recommendation: string;
  explanation: string;
} {
  const unemployment = otherBenefits.find((b) => b.type === 'unemployment');

  if (unemployment && unemployment.amount > 0) {
    return {
      recommendation: 'demander le chômage d\'abord',
      explanation: 'le RIS est subsidiaire - demandez d\'abord les autres aides',
    };
  }

  return {
    recommendation: 'demander le RIS',
    explanation: 'vous n\'avez pas droit à d\'autres aides principales',
  };
}

/**
 * Export rules in JSON format for transparency
 */
export const RIS_RULES_JSON = {
  rules: [
    {
      id: 'ris-age-requirement',
      description: `Personne doit avoir au moins ${RIS_CONSTANTS.MIN_AGE} ans`,
      condition: 'age >= 18',
      priority: 10,
    },
    {
      id: 'ris-residency-requirement',
      description: 'Personne doit avoir un titre de séjour valide en Belgique',
      condition: 'residencyStatus != no-valid-status',
      priority: 10,
    },
    {
      id: 'ris-patrimony-limit',
      description: `Patrimoine mobilier doit être inférieur à ${RIS_CONSTANTS.MAX_PATRIMONY_MOVABLE}€`,
      condition: `patrimonyValue <= ${RIS_CONSTANTS.MAX_PATRIMONY_MOVABLE}`,
      priority: 9,
    },
    {
      id: 'ris-student-restriction',
      description: 'Étudiant temps plein généralement inéligible (sauf exceptions)',
      condition: 'isFullTimeStudent == false OR age >= 25',
      priority: 8,
    },
  ],
  amounts: RIS_AMOUNTS_2024,
  constants: RIS_CONSTANTS,
};
