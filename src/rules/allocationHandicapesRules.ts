/**
 * Business Rules for Allocation pour Personnes Handicapées
 *
 * Implements eligibility rules for Belgian disability allowance.
 *
 * BASE JURIDIQUE:
 * - Loi du 27 février 1987 relative aux allocations aux personnes handicapées
 *   https://www.ejustice.just.fgov.be
 * - Service Public Fédéral Sécurité Sociale
 * - Évaluation médicale par ARR (Administration des Relations de Reclassement)
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';

// Constants from disability allowance law
const MIN_AUTONOMY_POINTS = 9; // Minimum points for category 4
const MAX_AUTONOMY_POINTS = 18; // Maximum points
const CATEGORY_1_POINTS = 18; // Category 1: 18 points
const CATEGORY_2_POINTS = 15; // Category 2: 15-17 points
const CATEGORY_3_POINTS = 12; // Category 3: 12-14 points
const CATEGORY_4_POINTS = 9; // Category 4: 9-11 points

// Example amounts (to be updated with official 2024 amounts)
const ALLOCATION_AMOUNTS_2024 = {
  category1: 1500, // Monthly amount for category 1
  category2: 1200, // Monthly amount for category 2
  category3: 900, // Monthly amount for category 3
  category4: 600, // Monthly amount for category 4
};

/**
 * Create the Disability Allowance eligibility rules engine
 */
function createDisabilityAllowanceEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Minimum autonomy points required
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'autonomyPoints',
          operator: 'lessThan',
          value: MIN_AUTONOMY_POINTS,
        },
      ],
    },
    event: {
      type: 'disability-allowance-ineligible',
      params: {
        reason: `points d'autonomie insuffisants (${MIN_AUTONOMY_POINTS} points minimum requis)`,
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 2: Medical evaluation required
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'hasMedicalEvaluation',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'disability-allowance-ineligible',
      params: {
        reason: 'évaluation médicale requise',
        priority: 10,
      },
    },
    priority: 10,
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
      type: 'disability-allowance-ineligible',
      params: {
        reason: 'pas de résidence valide en Belgique',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 4: Category 1 eligibility (18 points)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'autonomyPoints',
          operator: 'equal',
          value: CATEGORY_1_POINTS,
        },
        {
          fact: 'hasMedicalEvaluation',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'residencyStatus',
          operator: 'notIn',
          value: ['no-valid-status'],
        },
      ],
    },
    event: {
      type: 'disability-allowance-eligible-category1',
      params: {
        message: 'Éligible pour allocation catégorie 1',
        category: 1,
      },
    },
    priority: 5,
  });

  // Rule 5: Category 2 eligibility (15-17 points)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'autonomyPoints',
          operator: 'greaterThanInclusive',
          value: CATEGORY_2_POINTS,
        },
        {
          fact: 'autonomyPoints',
          operator: 'lessThan',
          value: CATEGORY_1_POINTS,
        },
        {
          fact: 'hasMedicalEvaluation',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'residencyStatus',
          operator: 'notIn',
          value: ['no-valid-status'],
        },
      ],
    },
    event: {
      type: 'disability-allowance-eligible-category2',
      params: {
        message: 'Éligible pour allocation catégorie 2',
        category: 2,
      },
    },
    priority: 5,
  });

  // Rule 6: Category 3 eligibility (12-14 points)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'autonomyPoints',
          operator: 'greaterThanInclusive',
          value: CATEGORY_3_POINTS,
        },
        {
          fact: 'autonomyPoints',
          operator: 'lessThan',
          value: CATEGORY_2_POINTS,
        },
        {
          fact: 'hasMedicalEvaluation',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'residencyStatus',
          operator: 'notIn',
          value: ['no-valid-status'],
        },
      ],
    },
    event: {
      type: 'disability-allowance-eligible-category3',
      params: {
        message: 'Éligible pour allocation catégorie 3',
        category: 3,
      },
    },
    priority: 5,
  });

  // Rule 7: Category 4 eligibility (9-11 points)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'autonomyPoints',
          operator: 'greaterThanInclusive',
          value: CATEGORY_4_POINTS,
        },
        {
          fact: 'autonomyPoints',
          operator: 'lessThan',
          value: CATEGORY_3_POINTS,
        },
        {
          fact: 'hasMedicalEvaluation',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'residencyStatus',
          operator: 'notIn',
          value: ['no-valid-status'],
        },
      ],
    },
    event: {
      type: 'disability-allowance-eligible-category4',
      params: {
        message: 'Éligible pour allocation catégorie 4',
        category: 4,
      },
    },
    priority: 5,
  });

  return engine;
}

/**
 * Singleton instance of the Disability Allowance rules engine
 */
const disabilityAllowanceEngineInstance = createDisabilityAllowanceEngine();

/**
 * Calculate disability allowance amount based on category and income
 */
export function calculateDisabilityAllowanceAmount(
  category: 1 | 2 | 3 | 4,
  monthlyIncome: number = 0
): number {
  const baseAmount = ALLOCATION_AMOUNTS_2024[`category${category}` as keyof typeof ALLOCATION_AMOUNTS_2024];

  // Income reduction (simplified: 50% of income above threshold)
  const incomeThreshold = 500; // Example threshold
  let reduction = 0;

  if (monthlyIncome > incomeThreshold) {
    reduction = (monthlyIncome - incomeThreshold) * 0.5;
  }

  const netAmount = Math.max(0, baseAmount - reduction);

  return Math.round(netAmount * 100) / 100;
}

/**
 * Determine category from autonomy points
 */
export function determineCategory(autonomyPoints: number): 1 | 2 | 3 | 4 | null {
  if (autonomyPoints === CATEGORY_1_POINTS) return 1;
  if (autonomyPoints >= CATEGORY_2_POINTS && autonomyPoints < CATEGORY_1_POINTS) return 2;
  if (autonomyPoints >= CATEGORY_3_POINTS && autonomyPoints < CATEGORY_2_POINTS) return 3;
  if (autonomyPoints >= CATEGORY_4_POINTS && autonomyPoints < CATEGORY_3_POINTS) return 4;
  return null;
}

/**
 * Check Disability Allowance eligibility
 */
export async function checkDisabilityAllowanceEligibility(
  autonomyPoints: number,
  hasMedicalEvaluation: boolean,
  residencyStatus: string,
  monthlyIncome: number = 0
): Promise<EligibilityCheck & { category?: 1 | 2 | 3 | 4 }> {
  const facts = {
    autonomyPoints,
    hasMedicalEvaluation,
    residencyStatus,
    monthlyIncome,
  };

  try {
    const results = await disabilityAllowanceEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'disability-allowance-ineligible');
    const eligibleEvent = results.events.find((e) => e.type.startsWith('disability-allowance-eligible'));

    if (ineligibleEvent) {
      return {
        benefitType: 'family-allowance', // Using as placeholder, should add 'disability-allowance' to BenefitType
        isEligible: false,
        reason: ineligibleEvent.params?.reason,
      };
    }

    if (eligibleEvent) {
      const category = eligibleEvent.params?.category as 1 | 2 | 3 | 4;
      const amount = calculateDisabilityAllowanceAmount(category, monthlyIncome);
      return {
        benefitType: 'family-allowance', // Using as placeholder
        isEligible: true,
        calculatedAmount: amount,
        category,
      };
    }

    return {
      benefitType: 'family-allowance', // Using as placeholder
      isEligible: false,
      reason: 'conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Error checking Disability Allowance eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const DISABILITY_ALLOWANCE_RULES_JSON = {
  legalFramework: {
    primaryLegislation: {
      title: 'Loi du 27 février 1987 relative aux allocations aux personnes handicapées',
      date: '1987-02-27',
      officialUrl: 'https://www.ejustice.just.fgov.be',
      authority: 'Service Public Fédéral Sécurité Sociale',
    },
  },
  amounts: ALLOCATION_AMOUNTS_2024,
  rules: [
    {
      id: 'disability-allowance-autonomy-points',
      description: `Points d'autonomie doivent être entre ${MIN_AUTONOMY_POINTS} et ${MAX_AUTONOMY_POINTS}`,
      condition: `autonomyPoints >= ${MIN_AUTONOMY_POINTS} AND autonomyPoints <= ${MAX_AUTONOMY_POINTS}`,
      priority: 10,
      legalBasis: {
        loi: 'Loi du 27 février 1987',
        url: 'https://www.ejustice.just.fgov.be',
      },
    },
    {
      id: 'disability-allowance-medical-evaluation',
      description: 'Évaluation médicale par ARR requise',
      condition: 'hasMedicalEvaluation == true',
      priority: 10,
      legalBasis: {
        loi: 'Loi du 27 février 1987',
        url: 'https://www.ejustice.just.fgov.be',
      },
    },
    {
      id: 'disability-allowance-residency-requirement',
      description: 'Résidence valide en Belgique requise',
      condition: 'residencyStatus != no-valid-status',
      priority: 10,
      legalBasis: {
        loi: 'Loi du 27 février 1987',
        url: 'https://www.ejustice.just.fgov.be',
      },
    },
  ],
  categories: {
    category1: { points: CATEGORY_1_POINTS, description: '18 points' },
    category2: { points: `${CATEGORY_2_POINTS}-17`, description: '15-17 points' },
    category3: { points: `${CATEGORY_3_POINTS}-14`, description: '12-14 points' },
    category4: { points: `${CATEGORY_4_POINTS}-11`, description: '9-11 points' },
  },
};

