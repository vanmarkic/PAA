/**
 * Business Rules for Allocation pour l'Aide aux Personnes Âgées (APA)
 *
 * Implements the Gherkin specifications from features/benefits/aide-personnes-agees.feature
 * Using json-rules-engine for runtime evaluation.
 *
 * BASE JURIDIQUE:
 * - Décret du 4 avril 2019 relatif aux aides individuelles à l'intégration (Wallonie)
 * - Ordonnance du 21 décembre 2018 relative à l'APA (Bruxelles-Capitale)
 * - Arrêté du Gouvernement wallon du 11 juin 2020 portant exécution du décret APA
 * - Arrêté du Collège réuni du 4 juin 2020 fixant les montants APA (Bruxelles)
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';

/**
 * AidePersonnesAgees Rules Version Metadata
 * This version MUST match the specification version in features/benefits/aide-personnes-agees.feature
 */
export const AIDE_PERSONNES_AGEES_RULES_METADATA = {
  implementsSpecification: '0.0.0',
  implementationVersion: '0.0.0',
  implementationStatus: 'complete' as const,
  lastSyncedWith: 'features/benefits/aide-personnes-agees.feature',
  generatedFrom: 'features/benefits/aide-personnes-agees.feature@0.0.0',
  divergences: [] as string[],
  effectiveDate: '2024-06-01',
};

// Constants from Belgian social law - APA 2024
export const APA_CONSTANTS = {
  MIN_AGE: 65,
  MIN_AUTONOMY_SCORE: 7,
  MAX_AUTONOMY_SCORE: 18,
  POCKET_MONEY_NURSING_HOME: 111.24,
  EVALUATION_VALIDITY_YEARS: 5,
};

export const APA_INCOME_THRESHOLDS_2024 = {
  SINGLE: 20725.25,
  COUPLE: 25468.38,
};

export const APA_CATEGORIES_2024 = {
  1: { minPoints: 7, maxPoints: 8, annualAmount: 1269.81, monthlyAmount: 105.82 },
  2: { minPoints: 9, maxPoints: 11, annualAmount: 4847.15, monthlyAmount: 403.93 },
  3: { minPoints: 12, maxPoints: 14, annualAmount: 5893.36, monthlyAmount: 491.11 },
  4: { minPoints: 15, maxPoints: 16, annualAmount: 6939.25, monthlyAmount: 578.27 },
  5: { minPoints: 17, maxPoints: 18, annualAmount: 7985.15, monthlyAmount: 665.43 },
};

export const APA_AUTONOMY_DOMAINS = {
  MOBILITY: { name: 'Se déplacer', maxPoints: 3, description: 'À l\'intérieur et à l\'extérieur' },
  MEALS: { name: 'Préparer et prendre repas', maxPoints: 3, description: 'Capacité à cuisiner et manger' },
  HYGIENE: { name: 'Hygiène personnelle', maxPoints: 3, description: 'Se laver, s\'habiller' },
  HOUSEHOLD: { name: 'Entretien ménager', maxPoints: 3, description: 'Nettoyer, ranger' },
  SAFETY: { name: 'Dangers et comportement', maxPoints: 3, description: 'Conscience des risques' },
  COMMUNICATION: { name: 'Communication', maxPoints: 3, description: 'Contacts sociaux' },
};

export type APACategory = 1 | 2 | 3 | 4 | 5;
export type LivingSituation = 'single' | 'couple' | 'nursing_home';
export type Region = 'brussels' | 'wallonia' | 'flanders';

export interface APAUser {
  age: number;
  autonomyScore: number;
  annualIncome: number;
  livingSituation: LivingSituation;
  region: Region;
  nationality?: string;
  partnerAge?: number;
  receivesDisabilityAllowance?: boolean;
  receivesGRAPA?: boolean;
}

export interface APAEligibilityResult extends EligibilityCheck {
  category?: APACategory;
  annualAmount?: number;
  monthlyAmount?: number;
  alternativeOrientation?: string;
  paidToNursingHome?: boolean;
}

/**
 * Determine APA category based on autonomy score
 */
function getAPACategory(autonomyScore: number): APACategory | null {
  if (autonomyScore >= 17 && autonomyScore <= 18) return 5;
  if (autonomyScore >= 15 && autonomyScore <= 16) return 4;
  if (autonomyScore >= 12 && autonomyScore <= 14) return 3;
  if (autonomyScore >= 9 && autonomyScore <= 11) return 2;
  if (autonomyScore >= 7 && autonomyScore <= 8) return 1;
  return null;
}

/**
 * Get income threshold based on living situation
 */
function getIncomeThreshold(livingSituation: LivingSituation): number {
  if (livingSituation === 'couple') {
    return APA_INCOME_THRESHOLDS_2024.COUPLE;
  }
  return APA_INCOME_THRESHOLDS_2024.SINGLE;
}

/**
 * Create the AidePersonnesAgees eligibility rules engine
 */
function createAidePersonnesAgeesEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Age requirement (must be 65+)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'lessThan',
          value: APA_CONSTANTS.MIN_AGE,
        },
      ],
    },
    event: {
      type: 'aidePersonnesAgees-ineligible',
      params: {
        reason: `âge minimum non atteint (${APA_CONSTANTS.MIN_AGE} ans requis)`,
        alternativeOrientation: 'l\'allocation de remplacement de revenus (ARR)',
      },
    },
    priority: 100,
  });

  // Rule 2: Minimum autonomy score requirement
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: APA_CONSTANTS.MIN_AGE,
        },
        {
          fact: 'autonomyScore',
          operator: 'lessThan',
          value: APA_CONSTANTS.MIN_AUTONOMY_SCORE,
        },
      ],
    },
    event: {
      type: 'aidePersonnesAgees-ineligible',
      params: {
        reason: `score d'autonomie insuffisant (minimum ${APA_CONSTANTS.MIN_AUTONOMY_SCORE} points requis)`,
      },
    },
    priority: 90,
  });

  // Rule 3: Income threshold for single person
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: APA_CONSTANTS.MIN_AGE,
        },
        {
          fact: 'autonomyScore',
          operator: 'greaterThanInclusive',
          value: APA_CONSTANTS.MIN_AUTONOMY_SCORE,
        },
        {
          fact: 'livingSituation',
          operator: 'equal',
          value: 'single',
        },
        {
          fact: 'annualIncome',
          operator: 'greaterThan',
          value: APA_INCOME_THRESHOLDS_2024.SINGLE,
        },
      ],
    },
    event: {
      type: 'aidePersonnesAgees-ineligible',
      params: {
        reason: `revenus supérieurs au plafond (${APA_INCOME_THRESHOLDS_2024.SINGLE}€ pour personne isolée)`,
      },
    },
    priority: 80,
  });

  // Rule 4: Income threshold for couple
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: APA_CONSTANTS.MIN_AGE,
        },
        {
          fact: 'autonomyScore',
          operator: 'greaterThanInclusive',
          value: APA_CONSTANTS.MIN_AUTONOMY_SCORE,
        },
        {
          fact: 'livingSituation',
          operator: 'equal',
          value: 'couple',
        },
        {
          fact: 'annualIncome',
          operator: 'greaterThan',
          value: APA_INCOME_THRESHOLDS_2024.COUPLE,
        },
      ],
    },
    event: {
      type: 'aidePersonnesAgees-ineligible',
      params: {
        reason: `revenus supérieurs au plafond (${APA_INCOME_THRESHOLDS_2024.COUPLE}€ pour ménage)`,
      },
    },
    priority: 80,
  });

  // Rule 5: Income threshold for nursing home (treated as single)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: APA_CONSTANTS.MIN_AGE,
        },
        {
          fact: 'autonomyScore',
          operator: 'greaterThanInclusive',
          value: APA_CONSTANTS.MIN_AUTONOMY_SCORE,
        },
        {
          fact: 'livingSituation',
          operator: 'equal',
          value: 'nursing_home',
        },
        {
          fact: 'annualIncome',
          operator: 'greaterThan',
          value: APA_INCOME_THRESHOLDS_2024.SINGLE,
        },
      ],
    },
    event: {
      type: 'aidePersonnesAgees-ineligible',
      params: {
        reason: `revenus supérieurs au plafond (${APA_INCOME_THRESHOLDS_2024.SINGLE}€ pour personne isolée)`,
      },
    },
    priority: 80,
  });

  // Rule 6: Eligible - Category 1 (7-8 points) - Single
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: APA_CONSTANTS.MIN_AGE,
        },
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
          fact: 'livingSituation',
          operator: 'in',
          value: ['single', 'nursing_home'],
        },
        {
          fact: 'annualIncome',
          operator: 'lessThanInclusive',
          value: APA_INCOME_THRESHOLDS_2024.SINGLE,
        },
      ],
    },
    event: {
      type: 'aidePersonnesAgees-eligible',
      params: {
        category: 1,
        annualAmount: APA_CATEGORIES_2024[1].annualAmount,
        monthlyAmount: APA_CATEGORIES_2024[1].monthlyAmount,
      },
    },
    priority: 50,
  });

  // Rule 7: Eligible - Category 1 (7-8 points) - Couple
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: APA_CONSTANTS.MIN_AGE,
        },
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
          fact: 'livingSituation',
          operator: 'equal',
          value: 'couple',
        },
        {
          fact: 'annualIncome',
          operator: 'lessThanInclusive',
          value: APA_INCOME_THRESHOLDS_2024.COUPLE,
        },
      ],
    },
    event: {
      type: 'aidePersonnesAgees-eligible',
      params: {
        category: 1,
        annualAmount: APA_CATEGORIES_2024[1].annualAmount,
        monthlyAmount: APA_CATEGORIES_2024[1].monthlyAmount,
      },
    },
    priority: 50,
  });

  // Rule 8: Eligible - Category 2 (9-11 points) - Single
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: APA_CONSTANTS.MIN_AGE,
        },
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
          fact: 'livingSituation',
          operator: 'in',
          value: ['single', 'nursing_home'],
        },
        {
          fact: 'annualIncome',
          operator: 'lessThanInclusive',
          value: APA_INCOME_THRESHOLDS_2024.SINGLE,
        },
      ],
    },
    event: {
      type: 'aidePersonnesAgees-eligible',
      params: {
        category: 2,
        annualAmount: APA_CATEGORIES_2024[2].annualAmount,
        monthlyAmount: APA_CATEGORIES_2024[2].monthlyAmount,
      },
    },
    priority: 50,
  });

  // Rule 9: Eligible - Category 2 (9-11 points) - Couple
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: APA_CONSTANTS.MIN_AGE,
        },
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
          fact: 'livingSituation',
          operator: 'equal',
          value: 'couple',
        },
        {
          fact: 'annualIncome',
          operator: 'lessThanInclusive',
          value: APA_INCOME_THRESHOLDS_2024.COUPLE,
        },
      ],
    },
    event: {
      type: 'aidePersonnesAgees-eligible',
      params: {
        category: 2,
        annualAmount: APA_CATEGORIES_2024[2].annualAmount,
        monthlyAmount: APA_CATEGORIES_2024[2].monthlyAmount,
      },
    },
    priority: 50,
  });

  // Rule 10: Eligible - Category 3 (12-14 points) - Single
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: APA_CONSTANTS.MIN_AGE,
        },
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
          fact: 'livingSituation',
          operator: 'in',
          value: ['single', 'nursing_home'],
        },
        {
          fact: 'annualIncome',
          operator: 'lessThanInclusive',
          value: APA_INCOME_THRESHOLDS_2024.SINGLE,
        },
      ],
    },
    event: {
      type: 'aidePersonnesAgees-eligible',
      params: {
        category: 3,
        annualAmount: APA_CATEGORIES_2024[3].annualAmount,
        monthlyAmount: APA_CATEGORIES_2024[3].monthlyAmount,
      },
    },
    priority: 50,
  });

  // Rule 11: Eligible - Category 3 (12-14 points) - Couple
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: APA_CONSTANTS.MIN_AGE,
        },
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
          fact: 'livingSituation',
          operator: 'equal',
          value: 'couple',
        },
        {
          fact: 'annualIncome',
          operator: 'lessThanInclusive',
          value: APA_INCOME_THRESHOLDS_2024.COUPLE,
        },
      ],
    },
    event: {
      type: 'aidePersonnesAgees-eligible',
      params: {
        category: 3,
        annualAmount: APA_CATEGORIES_2024[3].annualAmount,
        monthlyAmount: APA_CATEGORIES_2024[3].monthlyAmount,
      },
    },
    priority: 50,
  });

  // Rule 12: Eligible - Category 4 (15-16 points) - Single
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: APA_CONSTANTS.MIN_AGE,
        },
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
          fact: 'livingSituation',
          operator: 'in',
          value: ['single', 'nursing_home'],
        },
        {
          fact: 'annualIncome',
          operator: 'lessThanInclusive',
          value: APA_INCOME_THRESHOLDS_2024.SINGLE,
        },
      ],
    },
    event: {
      type: 'aidePersonnesAgees-eligible',
      params: {
        category: 4,
        annualAmount: APA_CATEGORIES_2024[4].annualAmount,
        monthlyAmount: APA_CATEGORIES_2024[4].monthlyAmount,
      },
    },
    priority: 50,
  });

  // Rule 13: Eligible - Category 4 (15-16 points) - Couple
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: APA_CONSTANTS.MIN_AGE,
        },
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
          fact: 'livingSituation',
          operator: 'equal',
          value: 'couple',
        },
        {
          fact: 'annualIncome',
          operator: 'lessThanInclusive',
          value: APA_INCOME_THRESHOLDS_2024.COUPLE,
        },
      ],
    },
    event: {
      type: 'aidePersonnesAgees-eligible',
      params: {
        category: 4,
        annualAmount: APA_CATEGORIES_2024[4].annualAmount,
        monthlyAmount: APA_CATEGORIES_2024[4].monthlyAmount,
      },
    },
    priority: 50,
  });

  // Rule 14: Eligible - Category 5 (17-18 points) - Single
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: APA_CONSTANTS.MIN_AGE,
        },
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
          fact: 'livingSituation',
          operator: 'in',
          value: ['single', 'nursing_home'],
        },
        {
          fact: 'annualIncome',
          operator: 'lessThanInclusive',
          value: APA_INCOME_THRESHOLDS_2024.SINGLE,
        },
      ],
    },
    event: {
      type: 'aidePersonnesAgees-eligible',
      params: {
        category: 5,
        annualAmount: APA_CATEGORIES_2024[5].annualAmount,
        monthlyAmount: APA_CATEGORIES_2024[5].monthlyAmount,
      },
    },
    priority: 50,
  });

  // Rule 15: Eligible - Category 5 (17-18 points) - Couple
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: APA_CONSTANTS.MIN_AGE,
        },
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
          fact: 'livingSituation',
          operator: 'equal',
          value: 'couple',
        },
        {
          fact: 'annualIncome',
          operator: 'lessThanInclusive',
          value: APA_INCOME_THRESHOLDS_2024.COUPLE,
        },
      ],
    },
    event: {
      type: 'aidePersonnesAgees-eligible',
      params: {
        category: 5,
        annualAmount: APA_CATEGORIES_2024[5].annualAmount,
        monthlyAmount: APA_CATEGORIES_2024[5].monthlyAmount,
      },
    },
    priority: 50,
  });

  return engine;
}

/**
 * Singleton instance of the AidePersonnesAgees rules engine
 */
const aidePersonnesAgeesEngineInstance = createAidePersonnesAgeesEngine();

/**
 * Calculate Allocation pour l'Aide aux Personnes Âgées (APA) amount
 */
export function calculateAidePersonnesAgeesAmount(
  autonomyScore: number
): { category: APACategory | null; annualAmount: number; monthlyAmount: number } {
  const category = getAPACategory(autonomyScore);
  
  if (category === null) {
    return { category: null, annualAmount: 0, monthlyAmount: 0 };
  }

  const categoryData = APA_CATEGORIES_2024[category];
  return {
    category,
    annualAmount: categoryData.annualAmount,
    monthlyAmount: categoryData.monthlyAmount,
  };
}

/**
 * Check Allocation pour l'Aide aux Personnes Âgées (APA) eligibility
 */
export async function checkAidePersonnesAgeesEligibility(
  user: APAUser
): Promise<APAEligibilityResult> {
  const facts = {
    age: user.age,
    autonomyScore: user.autonomyScore,
    annualIncome: user.annualIncome,
    livingSituation: user.livingSituation,
    region: user.region,
    nationality: user.nationality,
    partnerAge: user.partnerAge,
    receivesDisabilityAllowance: user.receivesDisabilityAllowance || false,
    receivesGRAPA: user.receivesGRAPA || false,
  };

  try {
    const results = await aidePersonnesAgeesEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'aidePersonnesAgees-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'aidePersonnesAgees-eligible');

    if (ineligibleEvent) {
      return {
        benefitType: 'aide-personnes-agees' as any,
        isEligible: false,
        reason: ineligibleEvent.params?.reason as string,
        alternativeOrientation: ineligibleEvent.params?.alternativeOrientation as string | undefined,
      };
    }

    if (eligibleEvent) {
      const category = eligibleEvent.params?.category as APACategory;
      const annualAmount = eligibleEvent.params?.annualAmount as number;
      const monthlyAmount = eligibleEvent.params?.monthlyAmount as number;
      const paidToNursingHome = user.livingSituation === 'nursing_home';

      return {
        benefitType: 'aide-personnes-agees' as any,
        isEligible: true,
        category,
        annualAmount,
        monthlyAmount,
        calculatedAmount: monthlyAmount,
        paidToNursingHome,
      };
    }

    return {
      benefitType: 'aide-personnes-agees' as any,
      isEligible: false,
      reason: 'conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Error checking Allocation pour l'Aide aux Personnes Âgées (APA) eligibility: ${error}`);
  }
}

/**
 * Check cumul rules for APA with other benefits
 */
export function checkAPACumulRules(
  receivesGRAPA: boolean,
  receivesPension: boolean,
  receivesDisabilityAllowance: boolean,
  receivesCPASAid: boolean,
  isCaregiver: boolean
): { canCumul: boolean; restrictions: string[] } {
  const restrictions: string[] = [];

  if (receivesDisabilityAllowance) {
    restrictions.push('APA non cumulable avec l\'allocation de remplacement de revenus (ARR) ou l\'allocation d\'intégration (AI) - choix requis');
  }

  return {
    canCumul: !receivesDisabilityAllowance,
    restrictions,
  };
}

/**
 * Get procedure steps based on region
 */
export function getAPAProcedureSteps(region: Region): Array<{ step: string; channel: string; delay: string }> {
  if (region === 'brussels') {
    return [
      { step: 'Introduction demande', channel: 'MyIriscare en ligne', delay: 'Immédiat' },
      { step: 'Ou formulaire papier', channel: 'Via mutuelle/CPAS', delay: '5 jours ouvrables' },
      { step: 'Évaluation médicale', channel: 'Médecin Iriscare', delay: 'Dans les 3 mois' },
      { step: 'Visite à domicile', channel: 'Si nécessaire', delay: 'Sur rendez-vous' },
      { step: 'Décision', channel: 'Par courrier', delay: '6 mois maximum' },
      { step: 'Paiement', channel: 'Virement mensuel', delay: 'Mois suivant décision' },
    ];
  } else if (region === 'wallonia') {
    return [
      { step: 'Introduction demande', channel: 'Wal-Protect', delay: 'En ligne' },
      { step: 'Ou via mutuelle', channel: 'Formulaire papier', delay: 'Transmission AVIQ' },
      { step: 'Évaluation médicale', channel: 'Médecin AVIQ', delay: 'Dans les 4 mois' },
      { step: 'Décision', channel: 'Notification AVIQ', delay: '6 mois maximum' },
      { step: 'Recours possible', channel: 'Tribunal du travail', delay: '3 mois après décision' },
    ];
  }
  
  return [];
}

/**
 * Calculate nursing home contribution
 */
export function calculateNursingHomeContribution(
  apaMonthlyAmount: number,
  pensionAmount: number,
  nursingHomeCost: number
): { apaContribution: number; pensionContribution: number; cpasIntervention: number; pocketMoney: number } {
  const pocketMoney = APA_CONSTANTS.POCKET_MONEY_NURSING_HOME;
  const totalContribution = apaMonthlyAmount + pensionAmount - pocketMoney;
  const cpasIntervention = Math.max(0, nursingHomeCost - totalContribution);

  return {
    apaContribution: apaMonthlyAmount,
    pensionContribution: Math.max(0, pensionAmount - pocketMoney),
    cpasIntervention,
    pocketMoney,
  };
}

/**
 * Export rules in JSON format for transparency
 */
export const AIDE_PERSONNES_AGEES_RULES_JSON = {
  legalFramework: {
    wallonia: {
      decree: 'Décret du 4 avril 2019 relatif aux aides individuelles à l\'intégration',
      executiveOrder: 'Arrêté du Gouvernement wallon du 11 juin 2020',
    },
    brussels: {
      ordinance: 'Ordonnance du 21 décembre 2018 relative à l\'APA',
      executiveOrder: 'Arrêté du Collège réuni du 4 juin 2020',
    },
  },
  constants: {
    minAge: APA_CONSTANTS.MIN_AGE,
    minAutonomyScore: APA_CONSTANTS.MIN_AUTONOMY_SCORE,
    maxAutonomyScore: APA_CONSTANTS.MAX_AUTONOMY_SCORE,
    evaluationValidityYears: APA_CONSTANTS.EVALUATION_VALIDITY_YEARS,
    pocket