/**
 * Business Rules for Allocations pour Personnes Handicapées
 *
 * Implements the Gherkin specifications from features/benefits/allocations-handicapes.feature
 * Using json-rules-engine for runtime evaluation.
 *
 * BASE JURIDIQUE:
 * - Loi du 27 février 1987 relative aux allocations aux personnes handicapées
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1987022730&table_name=loi
 * - Arrêté royal du 6 juillet 1987 relatif à l'allocation de remplacement de revenus et à l'allocation d'intégration
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1987070631&table_name=loi
 * - Direction générale Personnes handicapées (DG Handicap) - SPF Sécurité sociale
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';

/**
 * AllocationsHandicapes Rules Version Metadata
 * This version MUST match the specification version in features/benefits/allocations-handicapes.feature
 */
export const ALLOCATIONS_HANDICAPES_RULES_METADATA = {
  implementsSpecification: '0.0.0',
  implementationVersion: '0.0.0',
  implementationStatus: 'complete' as const,
  lastSyncedWith: 'features/benefits/allocations-handicapes.feature',
  generatedFrom: 'features/benefits/allocations-handicapes.feature@0.0.0',
  divergences: [] as string[],
  effectiveDate: '2024-01-01',
};

// Constants from Belgian social law - ARR 2024 (Allocation de Remplacement de Revenus)
export const ARR_AMOUNTS_2024 = {
  CAT_A: { annual: 10567.43, monthly: 880.62, description: 'Isolé' },
  CAT_B: { annual: 15851.18, monthly: 1320.93, description: 'Cohabitant' },
  CAT_C: { annual: 21421.87, monthly: 1785.16, description: 'Famille à charge' },
} as const;

// Constants from Belgian social law - AI 2024 (Allocation d'Intégration)
export const AI_AMOUNTS_2024 = {
  CAT_I: { minPoints: 7, maxPoints: 8, annual: 1423.66, monthly: 118.64 },
  CAT_II: { minPoints: 9, maxPoints: 11, annual: 5128.21, monthly: 427.35 },
  CAT_III: { minPoints: 12, maxPoints: 14, annual: 8155.74, monthly: 679.65 },
  CAT_IV: { minPoints: 15, maxPoints: 16, annual: 11852.46, monthly: 987.71 },
  CAT_V: { minPoints: 17, maxPoints: 18, annual: 13437.21, monthly: 1119.77 },
} as const;

// General constants
export const HANDICAP_CONSTANTS = {
  MIN_AGE_ARR: 18,
  MAX_AGE_ARR: 65,
  MIN_AGE_AI: 0,
  MAX_AUTONOMY_POINTS: 18,
  MIN_POINTS_FOR_AI: 7,
  RESIDENCE_MONTHS_REQUIRED: 8,
  DECLARATION_DELAY_DAYS: 30,
} as const;

// Autonomy evaluation activities (6 activities, max 3 points each = 18 total)
export const AUTONOMY_ACTIVITIES = [
  { name: 'Se déplacer', maxPoints: 3 },
  { name: 'Préparer et manger', maxPoints: 3 },
  { name: 'Hygiène personnelle', maxPoints: 3 },
  { name: 'S\'habiller', maxPoints: 3 },
  { name: 'Dangers et surveillance', maxPoints: 3 },
  { name: 'Communication', maxPoints: 3 },
] as const;

// Types for handicap allocations
export type ARRCategory = 'A' | 'B' | 'C';
export type AICategory = 'I' | 'II' | 'III' | 'IV' | 'V';
export type LivingSituation = 'isolated' | 'cohabitant' | 'familyWithDependents';

export interface HandicapUser {
  age: number;
  isLegalResident: boolean;
  isBelgian: boolean;
  hasMedicalEvaluation: boolean;
  autonomyScore: number;
  monthlyIncome: number;
  livingSituation: LivingSituation;
  hasWorkAccidentIndemnity: boolean;
  workAccidentIndemnityAmount: number;
  handicapRecognitionPercentage: number;
  handicapDevelopedAfter65: boolean;
  residenceMonthsPerYear: number;
}

export interface HandicapEligibilityResult {
  isEligibleARR: boolean;
  isEligibleAI: boolean;
  arrCategory?: ARRCategory;
  aiCategory?: AICategory;
  arrBaseAmount?: number;
  aiBaseAmount?: number;
  arrNetAmount?: number;
  aiNetAmount?: number;
  totalMonthlyAmount?: number;
  reasons: string[];
  additionalBenefits: string[];
}

/**
 * Determine AI category based on autonomy score
 */
function getAICategory(autonomyScore: number): AICategory | null {
  if (autonomyScore >= 17 && autonomyScore <= 18) return 'V';
  if (autonomyScore >= 15 && autonomyScore <= 16) return 'IV';
  if (autonomyScore >= 12 && autonomyScore <= 14) return 'III';
  if (autonomyScore >= 9 && autonomyScore <= 11) return 'II';
  if (autonomyScore >= 7 && autonomyScore <= 8) return 'I';
  return null;
}

/**
 * Get AI monthly amount based on category
 */
function getAIMonthlyAmount(category: AICategory): number {
  const amounts: Record<AICategory, number> = {
    'I': AI_AMOUNTS_2024.CAT_I.monthly,
    'II': AI_AMOUNTS_2024.CAT_II.monthly,
    'III': AI_AMOUNTS_2024.CAT_III.monthly,
    'IV': AI_AMOUNTS_2024.CAT_IV.monthly,
    'V': AI_AMOUNTS_2024.CAT_V.monthly,
  };
  return amounts[category];
}

/**
 * Determine ARR category based on living situation
 */
function getARRCategory(livingSituation: LivingSituation): ARRCategory {
  switch (livingSituation) {
    case 'isolated':
      return 'A';
    case 'cohabitant':
      return 'B';
    case 'familyWithDependents':
      return 'C';
    default:
      return 'A';
  }
}

/**
 * Get ARR monthly amount based on category
 */
function getARRMonthlyAmount(category: ARRCategory): number {
  const amounts: Record<ARRCategory, number> = {
    'A': ARR_AMOUNTS_2024.CAT_A.monthly,
    'B': ARR_AMOUNTS_2024.CAT_B.monthly,
    'C': ARR_AMOUNTS_2024.CAT_C.monthly,
  };
  return amounts[category];
}

/**
 * Create the AllocationsHandicapes eligibility rules engine
 */
function createAllocationsHandicapesEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Age requirement for ARR (must be 18-65)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'lessThan',
          value: HANDICAP_CONSTANTS.MIN_AGE_ARR,
        },
      ],
    },
    event: {
      type: 'arr-ineligible-age-min',
      params: {
        reason: `âge minimum non atteint pour l'ARR (${HANDICAP_CONSTANTS.MIN_AGE_ARR} ans requis)`,
      },
    },
    priority: 100,
  });

  // Rule 2: Maximum age for ARR (65 years)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThan',
          value: HANDICAP_CONSTANTS.MAX_AGE_ARR,
        },
      ],
    },
    event: {
      type: 'arr-ineligible-age-max',
      params: {
        reason: `limite d'âge dépassée pour l'ARR (maximum ${HANDICAP_CONSTANTS.MAX_AGE_ARR} ans)`,
      },
    },
    priority: 99,
  });

  // Rule 3: Residency requirement
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isLegalResident',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'isBelgian',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'allocations-handicapes-ineligible',
      params: {
        reason: 'doit être Belge ou résident légal en Belgique',
      },
    },
    priority: 98,
  });

  // Rule 4: Medical evaluation requirement
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasMedicalEvaluation',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'allocations-handicapes-ineligible',
      params: {
        reason: 'évaluation médicale DG Handicap requise',
      },
    },
    priority: 97,
  });

  // Rule 5: Minimum autonomy score for AI
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'autonomyScore',
          operator: 'lessThan',
          value: HANDICAP_CONSTANTS.MIN_POINTS_FOR_AI,
        },
      ],
    },
    event: {
      type: 'ai-ineligible-score',
      params: {
        reason: `score d'autonomie insuffisant pour l'AI (minimum ${HANDICAP_CONSTANTS.MIN_POINTS_FOR_AI} points requis)`,
      },
    },
    priority: 96,
  });

  // Rule 6: Residence months requirement
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'residenceMonthsPerYear',
          operator: 'lessThan',
          value: HANDICAP_CONSTANTS.RESIDENCE_MONTHS_REQUIRED,
        },
      ],
    },
    event: {
      type: 'allocations-handicapes-ineligible',
      params: {
        reason: `doit résider en Belgique minimum ${HANDICAP_CONSTANTS.RESIDENCE_MONTHS_REQUIRED} mois par an`,
      },
    },
    priority: 95,
  });

  // Rule 7: AI Category V eligibility (17-18 points)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'autonomyScore',
          operator: 'greaterThanInclusive',
          value: 17,
        },
        {
          fact: 'autonomyScore',
          operator: 'lessThanInclusive',
          value: 18,
        },
        {
          fact: 'hasMedicalEvaluation',
          operator: 'equal',
          value: true,
        },
        {
          any: [
            { fact: 'isLegalResident', operator: 'equal', value: true },
            { fact: 'isBelgian', operator: 'equal', value: true },
          ],
        },
      ],
    },
    event: {
      type: 'ai-eligible',
      params: {
        category: 'V',
        monthlyAmount: AI_AMOUNTS_2024.CAT_V.monthly,
        message: 'Éligible à l\'AI catégorie V (maximum)',
      },
    },
    priority: 50,
  });

  // Rule 8: AI Category IV eligibility (15-16 points)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'autonomyScore',
          operator: 'greaterThanInclusive',
          value: 15,
        },
        {
          fact: 'autonomyScore',
          operator: 'lessThanInclusive',
          value: 16,
        },
        {
          fact: 'hasMedicalEvaluation',
          operator: 'equal',
          value: true,
        },
        {
          any: [
            { fact: 'isLegalResident', operator: 'equal', value: true },
            { fact: 'isBelgian', operator: 'equal', value: true },
          ],
        },
      ],
    },
    event: {
      type: 'ai-eligible',
      params: {
        category: 'IV',
        monthlyAmount: AI_AMOUNTS_2024.CAT_IV.monthly,
        message: 'Éligible à l\'AI catégorie IV',
      },
    },
    priority: 49,
  });

  // Rule 9: AI Category III eligibility (12-14 points)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'autonomyScore',
          operator: 'greaterThanInclusive',
          value: 12,
        },
        {
          fact: 'autonomyScore',
          operator: 'lessThanInclusive',
          value: 14,
        },
        {
          fact: 'hasMedicalEvaluation',
          operator: 'equal',
          value: true,
        },
        {
          any: [
            { fact: 'isLegalResident', operator: 'equal', value: true },
            { fact: 'isBelgian', operator: 'equal', value: true },
          ],
        },
      ],
    },
    event: {
      type: 'ai-eligible',
      params: {
        category: 'III',
        monthlyAmount: AI_AMOUNTS_2024.CAT_III.monthly,
        message: 'Éligible à l\'AI catégorie III',
      },
    },
    priority: 48,
  });

  // Rule 10: AI Category II eligibility (9-11 points)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'autonomyScore',
          operator: 'greaterThanInclusive',
          value: 9,
        },
        {
          fact: 'autonomyScore',
          operator: 'lessThanInclusive',
          value: 11,
        },
        {
          fact: 'hasMedicalEvaluation',
          operator: 'equal',
          value: true,
        },
        {
          any: [
            { fact: 'isLegalResident', operator: 'equal', value: true },
            { fact: 'isBelgian', operator: 'equal', value: true },
          ],
        },
      ],
    },
    event: {
      type: 'ai-eligible',
      params: {
        category: 'II',
        monthlyAmount: AI_AMOUNTS_2024.CAT_II.monthly,
        message: 'Éligible à l\'AI catégorie II',
      },
    },
    priority: 47,
  });

  // Rule 11: AI Category I eligibility (7-8 points)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'autonomyScore',
          operator: 'greaterThanInclusive',
          value: 7,
        },
        {
          fact: 'autonomyScore',
          operator: 'lessThanInclusive',
          value: 8,
        },
        {
          fact: 'hasMedicalEvaluation',
          operator: 'equal',
          value: true,
        },
        {
          any: [
            { fact: 'isLegalResident', operator: 'equal', value: true },
            { fact: 'isBelgian', operator: 'equal', value: true },
          ],
        },
      ],
    },
    event: {
      type: 'ai-eligible',
      params: {
        category: 'I',
        monthlyAmount: AI_AMOUNTS_2024.CAT_I.monthly,
        message: 'Éligible à l\'AI catégorie I',
      },
    },
    priority: 46,
  });

  // Rule 12: ARR Category A eligibility (isolated, 18-65)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: HANDICAP_CONSTANTS.MIN_AGE_ARR,
        },
        {
          fact: 'age',
          operator: 'lessThanInclusive',
          value: HANDICAP_CONSTANTS.MAX_AGE_ARR,
        },
        {
          fact: 'livingSituation',
          operator: 'equal',
          value: 'isolated',
        },
        {
          fact: 'hasMedicalEvaluation',
          operator: 'equal',
          value: true,
        },
        {
          any: [
            { fact: 'isLegalResident', operator: 'equal', value: true },
            { fact: 'isBelgian', operator: 'equal', value: true },
          ],
        },
      ],
    },
    event: {
      type: 'arr-eligible',
      params: {
        category: 'A',
        monthlyAmount: ARR_AMOUNTS_2024.CAT_A.monthly,
        message: 'Éligible à l\'ARR catégorie A (isolé)',
      },
    },
    priority: 40,
  });

  // Rule 13: ARR Category B eligibility (cohabitant, 18-65)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: HANDICAP_CONSTANTS.MIN_AGE_ARR,
        },
        {
          fact: 'age',
          operator: 'lessThanInclusive',
          value: HANDICAP_CONSTANTS.MAX_AGE_ARR,
        },
        {
          fact: 'livingSituation',
          operator: 'equal',
          value: 'cohabitant',
        },
        {
          fact: 'hasMedicalEvaluation',
          operator: 'equal',
          value: true,
        },
        {
          any: [
            { fact: 'isLegalResident', operator: 'equal', value: true },
            { fact: 'isBelgian', operator: 'equal', value: true },
          ],
        },
      ],
    },
    event: {
      type: 'arr-eligible',
      params: {
        category: 'B',
        monthlyAmount: ARR_AMOUNTS_2024.CAT_B.monthly,
        message: 'Éligible à l\'ARR catégorie B (cohabitant)',
      },
    },
    priority: 39,
  });

  // Rule 14: ARR Category C eligibility (family with dependents, 18-65)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: HANDICAP_CONSTANTS.MIN_AGE_ARR,
        },
        {
          fact: 'age',
          operator: 'lessThanInclusive',
          value: HANDICAP_CONSTANTS.MAX_AGE_ARR,
        },
        {
          fact: 'livingSituation',
          operator: 'equal',
          value: 'familyWithDependents',
        },
        {
          fact: 'hasMedicalEvaluation',
          operator: 'equal',
          value: true,
        },
        {
          any: [
            { fact: 'isLegalResident', operator: 'equal', value: true },
            { fact: 'isBelgian', operator: 'equal', value: true },
          ],
        },
      ],
    },
    event: {
      type: 'arr-eligible',
      params: {
        category: 'C',
        monthlyAmount: ARR_AMOUNTS_2024.CAT_C.monthly,
        message: 'Éligible à l\'ARR catégorie C (famille à charge)',
      },
    },
    priority: 38,
  });

  // Rule 15: Elderly person (65+) only eligible for AI, not ARR
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThan',
          value: HANDICAP_CONSTANTS.MAX_AGE_ARR,
        },
        {
          fact: 'autonomyScore',
          operator: 'greaterThanInclusive',
          value: HANDICAP_CONSTANTS.MIN_POINTS_FOR_AI,
        },
        {
          fact: 'hasMedicalEvaluation',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'elderly-ai-only',
      params: {
        message: 'Personne de plus de 65 ans: éligible uniquement à l\'AI, pas à l\'ARR',
        canCumulateWithPension: true,
      },
    },
    priority: 60,
  });

  // Rule 16: Work accident indemnity cumulation
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasWorkAccidentIndemnity',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'autonomyScore',
          operator: 'greaterThanInclusive',
          value: HANDICAP_CONSTANTS.MIN_POINTS_FOR_AI,
        },
      ],
    },
    event: {
      type: 'work-accident-cumulation',
      params: {
        message: 'AI cumulable avec indemnité accident du travail, ARR réduite',
        aiCumulable: true,
        arrReduced: true,
      },
    },
    priority: 30,
  });

  return engine;
}

/**
 * Singleton instance of the AllocationsHandicapes rules engine
 */
const allocationsHandicapesEngineInstance = createAllocationsHandicapesEngine();

/**
 * Calculate AI amount based on category and income
 */
export function calculateAIAmount(
  autonomyScore: number,
  monthlyIncome: number = 0
): { category: AICategory | null; baseAmount: number; netAmount: number } {
  const category = getAICategory(autonomyScore);
  
  if (!category) {
    return { category: null, baseAmount: 0, netAmount: 0 };
  }
  
  const baseAmount = getAIMonthlyAmount(category);
  // AI is generally not reduced by income (unlike ARR)
  const netAmount = baseAmount;
  
  return { category, baseAmount, netAmount };
}

/**
 * Calculate ARR amount based on category and income
 */
export function calculateARRAmount(
  livingSituation: LivingSituation,
  monthlyIncome: number = 0,
  workAccidentIndemnity: number = 0
): { category: ARRCategory; baseAmount: number; netAmount: number } {
  const category = getARRCategory(livingSituation);
  const baseAmount = getARRMonthlyAmount(category);
  
  // ARR is reduced by income with partial exemption for professional income
  // Exemption: first part of professional income is partially exempt
  const professionalExemption = Math.min(monthlyIncome * 0.5, 250); // Simplified exemption
  const countableIncome = Math.max(0, monthlyIncome - professionalExemption);
  
  // Work accident indemnity reduces ARR
  const totalDeductions = countableIncome + workAccidentIndemnity;
  
  const netAmount = Math.max(0, baseAmount - totalDeductions);
  
  return { category, baseAmount, netAmount };
}

/**
 * Calculate total Allocations Handicapées amount
 */
export function calculateAllocationsHandicapesAmount(
  user: HandicapUser
): HandicapEligibilityResult {
  const result: HandicapEligibilityResult = {
    isEligibleARR: false,
    isEligibleAI: false,
    reasons: [],
    additionalBenefits: [],
  };

  // Check basic eligibility
  const isResident = user.isLegalResident || user.isBelgian;
  if (!isResident) {
    result.reasons.push('Non éligible: doit être Belge ou résident légal');
    return result;
  }

  if (!user.hasMedicalEvaluation) {
    result.reasons.push('Évaluation médicale DG Handicap requise');
    return result;
  }

  if (user.residenceMonthsPerYear < HANDICAP_CONSTANTS.RESIDENCE_MONTHS_REQUIRED) {
    result.reasons.push(`Doit résider en Belgique minimum ${HANDICAP_CONSTANTS.RESIDENCE_MONTHS_REQUIRED} mois par an`);
    return result;
  }

  // Calculate AI eligibility
  if (user.autonomyScore >= HANDICAP_CONSTANTS.MIN_POINTS_FOR_AI) {
    const aiCalc = calculateAIAmount(user.autonomyScore, user.monthlyIncome);
    if (aiCalc.category) {
      result.isEligibleAI = true;
      result.aiCategory = aiCalc.category;
      result.aiBaseAmount = aiCalc.baseAmount;
      result.aiNetAmount = aiCalc.netAmount;
      result.reasons.push(`Éligible à l'AI catégorie ${aiCalc.category}`);
    }
  } else {
    result.reasons.push(`Score d'autonomie insuffisant pour l'AI (${user.autonomyScore} points, minimum ${HANDICAP_CONSTANTS.MIN_POINTS_FOR_AI} requis)`);
  }

  // Calculate ARR eligibility (age 18-65)
  if (user.age >= HANDICAP_CONSTANTS.MIN_AGE_ARR && user.age <= HANDICAP_CONSTANTS.MAX_AGE_ARR) {
    const arrCalc = calculateARRAmount(
      user.livingSituation,
      user.monthlyIncome,
      user.hasWorkAccidentIndemnity ? user.workAccidentIndemnityAmount : 0
    );
    result.isEligibleARR = true;
    result.arrCategory = arrCalc.category;
    result.arrBaseAmount = arrCalc.baseAmount;
    result.arrNetAmount = arrCalc.netAmount;
    result.reasons.push(`Éligible à l'ARR catégorie ${arrCalc.category}`);
  } else if (user.age > HANDICAP_CONSTANTS.MAX_AGE_ARR) {
    result.reasons.push(`Non éligible à l'ARR (limite d'âge ${HANDICAP_CONSTANTS.MAX_AGE_ARR} ans dépassée)`);
    if (result.isEligibleAI) {
      result.reasons.push('Peut cumuler l\'AI avec la pension');
    }
  } else {
    result.reasons.push(`Non éligible à l'ARR (âge minimum ${HANDICAP_CONSTANTS.MIN_AGE_ARR} ans)`);
  }

  // Calculate total
  result.totalMonthlyAmount = (result.aiNetAmount || 0) + (result.arrNetAmount || 0);

  // Add additional benefits
  if (result.isEligibleAI || result.isEligibleARR) {
    result.additionalBenefits = [
      'Tarif social énergie (réduction gaz et électricité)',
      'Carte de stationnement pour personne handicapée',
      'Réduction transports publics (carte d\'accompagnateur gratuit)',
      'Exonération précompte immobilier (selon la région)',
      'Tarif téléphonique social',
      'BIM - Intervention majorée (remboursements santé augmentés)',
    ];
  }

  // Special case: work accident indemnity
  if (user.hasWorkAccidentIndemnity && result.isEligibleAI) {
    result.reasons.push('AI cumulable avec indemnité accident du travail');
    if (result.isEligibleARR) {
      result.reasons.push('ARR réduite en fonction de l\'indemnité accident du travail');
    }
  }

  return result;
}

/**
 * Check Allocations pour Personnes Handicapées eligibility
 */
export async function checkAllocationsHandicapesEligibility(
  user: HandicapUser
): Promise<EligibilityCheck> {
  const facts = {
    age: user.age,
    isLegalResident: user.isLegalResident,
    isBelgian: user.isBelgian,
    hasMedicalEvaluation: user.hasMedicalEvaluation,
    autonomyScore: user.autonomyScore,
    monthlyIncome: user.monthlyIncome,
    livingSituation: user.livingSituation,
    hasWorkAccidentIndemnity: user.hasWorkAccidentIndemnity,
    workAccidentIndemnityAmount: user.workAccidentIndemnityAmount,
    handicapRecognitionPercentage: user.handicapRecognitionPercentage,
    handicapDevelopedAfter65: user.handicapDevelopedAfter65,
    residenceMonthsPerYear: user.residenceMonthsPerYear,
  };

  try {
    const results = await allocationsHandicapesEngineInstance.run(facts);

    // Check for ineligibility events
    const ineligibleEvent = results.events.find(
      (e) => e.type === 'allocations-handicapes-ineligible' ||
             e.type === 'arr-ineligible-age-min' ||
             e.type === 'arr-ineligible-age-max' ||
             e.type === 'ai-ineligible-score'
    );

    // Check for eligibility events
    const aiEligibleEvent = results.events.find((e) => e.type === 'ai-eligible');
    const arrEligibleEvent = results.events.find((e) => e.type === 'arr-eligible');
    const elderlyAIOnlyEvent = results.events.find((e) => e.type === 'elderly-ai-only');

    // Calculate full result
    const calculatedResult = calculateAllocationsHandicapesAmount(user);