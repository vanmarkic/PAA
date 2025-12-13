/**
 * Business Rules for Allocations pour Personnes Handicapées
 *
 * Implements ARR (Allocation de Remplacement de Revenus) and AI (Allocation d'Intégration)
 * Based on DG Handicap evaluation system with autonomy points (7-18)
 *
 * BASE JURIDIQUE:
 * - Loi du 27 février 1987 relative aux allocations aux personnes handicapées
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1987022737&table_name=loi
 * - Arrêté royal du 6 juillet 1987 relatif à l'allocation de remplacement de revenus et à l'allocation d'intégration
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1987070637&table_name=loi
 * - Autorité: Direction générale Personnes handicapées (DG Handicap) - SPF Sécurité Sociale
 * - Dernière indexation: janvier 2024
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck, LegalReference } from '../../../../../domain/types';

// Constants from Belgian disability law - 2024 indexed values
// Source: DG Handicap - Montants indexés au 01.01.2024
export const ARR_AMOUNTS_2024 = {
  // Allocation de Remplacement de Revenus - Catégories
  categories: {
    A: {
      name: 'Personne isolée',
      annualAmount: 10567.43,
      monthlyAmount: 880.62,
      description: 'Personne handicapée vivant seule',
    },
    B: {
      name: 'Personne cohabitante',
      annualAmount: 15851.18,
      monthlyAmount: 1320.93,
      description: 'Personne vivant avec d\'autres personnes (sauf famille)',
    },
    C: {
      name: 'Personne avec famille à charge',
      annualAmount: 21421.87,
      monthlyAmount: 1785.16,
      description: 'Personne avec conjoint, partenaire ou enfant(s) à charge',
    },
  },
  ageLimit: 65,
  minimumDisabilityPercentage: 66,
  incomeCeiling: {
    categoryA: 880.62 * 12,
    categoryB: 1320.93 * 12,
    categoryC: 1785.16 * 12,
  },
};

export const AI_AMOUNTS_2024 = {
  // Allocation d'Intégration - Catégories selon points d'autonomie
  categories: {
    I: {
      autonomyPoints: { min: 7, max: 8 },
      annualAmount: 1423.66,
      monthlyAmount: 118.64,
      description: 'Difficultés légères dans les activités quotidiennes',
    },
    II: {
      autonomyPoints: { min: 9, max: 11 },
      annualAmount: 5128.21,
      monthlyAmount: 427.35,
      description: 'Difficultés modérées dans les activités quotidiennes',
    },
    III: {
      autonomyPoints: { min: 12, max: 14 },
      annualAmount: 8155.74,
      monthlyAmount: 679.65,
      description: 'Difficultés importantes dans les activités quotidiennes',
    },
    IV: {
      autonomyPoints: { min: 15, max: 16 },
      annualAmount: 11852.46,
      monthlyAmount: 987.71,
      description: 'Difficultés très importantes dans les activités quotidiennes',
    },
    V: {
      autonomyPoints: { min: 17, max: 18 },
      annualAmount: 13437.21,
      monthlyAmount: 1119.77,
      description: 'Difficultés extrêmes - besoin d\'aide constante',
    },
  },
  noAgeLimit: true, // Pas de limite d'âge pour l'AI
  minimumPoints: 7,
  maximumPoints: 18,
};

// Medical evaluation criteria
export const AUTONOMY_EVALUATION_CRITERIA = {
  activities: [
    { name: 'Se déplacer', maxPoints: 3 },
    { name: 'Préparer et manger', maxPoints: 3 },
    { name: 'Hygiène personnelle', maxPoints: 3 },
    { name: 'S\'habiller', maxPoints: 3 },
    { name: 'Dangers et surveillance', maxPoints: 3 },
    { name: 'Communication', maxPoints: 3 },
  ],
  totalMaxPoints: 18,
  evaluationFrequency: 'Tous les 2-5 ans selon situation',
  evaluationAuthority: 'Médecin évaluateur DG Handicap',
};

// Income exemptions
export const INCOME_EXEMPTIONS = {
  workIncome: {
    exemptionRate: 0.5, // 50% des revenus professionnels exemptés
    maxExemption: 7030.52, // Maximum annuel exempté
    description: 'Encouragement à l\'activité professionnelle',
  },
  otherIncome: {
    fullyExempt: ['allocations familiales', 'pension alimentaire enfants'],
    partiallyExempt: ['rente accident travail', 'indemnités maladie'],
  },
};

// Legal framework references
export const HANDICAP_LEGAL_FRAMEWORK: LegalReference = {
  type: 'loi',
  title: 'Loi relative aux allocations aux personnes handicapées',
  date: '1987-02-27',
  officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1987022737&table_name=loi',
  articles: ['2', '4', '6', '7', '8'],
  lastAmended: '2024-01',
  authority: 'Direction générale Personnes handicapées - SPF Sécurité Sociale',
};

/**
 * Create the Disability Allowance eligibility rules engine
 */
function createDisabilityAllowanceEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Age limit for ARR
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'benefitType',
          operator: 'equal',
          value: 'ARR',
        },
        {
          fact: 'age',
          operator: 'greaterThan',
          value: ARR_AMOUNTS_2024.ageLimit,
        },
      ],
    },
    event: {
      type: 'arr-ineligible',
      params: {
        reason: `Âge supérieur à ${ARR_AMOUNTS_2024.ageLimit} ans - pas d'ARR après l'âge de la pension`,
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 2: Minimum disability percentage for ARR
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'benefitType',
          operator: 'equal',
          value: 'ARR',
        },
        {
          fact: 'disabilityPercentage',
          operator: 'lessThan',
          value: ARR_AMOUNTS_2024.minimumDisabilityPercentage,
        },
      ],
    },
    event: {
      type: 'arr-ineligible',
      params: {
        reason: `Taux d'incapacité inférieur à ${ARR_AMOUNTS_2024.minimumDisabilityPercentage}%`,
        priority: 9,
      },
    },
    priority: 9,
  });

  // Rule 3: ARR eligible
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'benefitType',
          operator: 'equal',
          value: 'ARR',
        },
        {
          fact: 'age',
          operator: 'lessThanInclusive',
          value: ARR_AMOUNTS_2024.ageLimit,
        },
        {
          fact: 'disabilityPercentage',
          operator: 'greaterThanInclusive',
          value: ARR_AMOUNTS_2024.minimumDisabilityPercentage,
        },
        {
          fact: 'isResident',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'arr-eligible',
      params: {
        message: 'Éligible à l\'ARR',
      },
    },
    priority: 5,
  });

  // Rule 4: Minimum autonomy points for AI
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'benefitType',
          operator: 'equal',
          value: 'AI',
        },
        {
          fact: 'autonomyPoints',
          operator: 'lessThan',
          value: AI_AMOUNTS_2024.minimumPoints,
        },
      ],
    },
    event: {
      type: 'ai-ineligible',
      params: {
        reason: `Points d'autonomie insuffisants (minimum ${AI_AMOUNTS_2024.minimumPoints} requis)`,
        priority: 9,
      },
    },
    priority: 9,
  });

  // Rule 5: AI eligible
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'benefitType',
          operator: 'equal',
          value: 'AI',
        },
        {
          fact: 'autonomyPoints',
          operator: 'greaterThanInclusive',
          value: AI_AMOUNTS_2024.minimumPoints,
        },
        {
          fact: 'isResident',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'ai-eligible',
      params: {
        message: 'Éligible à l\'AI',
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
 * Determine AI category based on autonomy points
 */
export function determineAICategory(autonomyPoints: number): string | null {
  if (autonomyPoints < 7) return null;
  if (autonomyPoints <= 8) return 'I';
  if (autonomyPoints <= 11) return 'II';
  if (autonomyPoints <= 14) return 'III';
  if (autonomyPoints <= 16) return 'IV';
  if (autonomyPoints <= 18) return 'V';
  return null;
}

/**
 * Calculate ARR amount based on category and income
 */
export function calculateARRAmount(
  category: 'A' | 'B' | 'C',
  monthlyIncome: number,
  hasWorkIncome: boolean = false,
  workIncomeAmount: number = 0
): number {
  const baseAmount = ARR_AMOUNTS_2024.categories[category].monthlyAmount;

  // Apply work income exemption if applicable
  let countableIncome = monthlyIncome;
  if (hasWorkIncome && workIncomeAmount > 0) {
    const exemptedAmount = Math.min(
      workIncomeAmount * INCOME_EXEMPTIONS.workIncome.exemptionRate,
      INCOME_EXEMPTIONS.workIncome.maxExemption / 12
    );
    countableIncome = monthlyIncome - exemptedAmount;
  }

  // ARR = base amount - countable income
  const arrAmount = Math.max(0, baseAmount - countableIncome);

  return Math.round(arrAmount * 100) / 100;
}

/**
 * Calculate AI amount based on category
 */
export function calculateAIAmount(category: string): number {
  const categoryData = AI_AMOUNTS_2024.categories[category as keyof typeof AI_AMOUNTS_2024.categories];
  return categoryData ? categoryData.monthlyAmount : 0;
}

/**
 * Interface for disability user evaluation
 */
export interface DisabilityUser extends User {
  age: number;
  disabilityPercentage?: number;
  autonomyPoints?: number;
  householdSituation: 'isolated' | 'cohabitant' | 'family';
  monthlyIncome: number;
  hasWorkIncome?: boolean;
  workIncomeAmount?: number;
  isResident: boolean;
  hasDisabilityRecognition: boolean;
}

/**
 * Check eligibility for disability allocations
 */
export async function checkDisabilityAllowanceEligibility(
  user: DisabilityUser,
  benefitType: 'ARR' | 'AI'
): Promise<EligibilityCheck> {
  const facts = {
    benefitType,
    age: user.age,
    disabilityPercentage: user.disabilityPercentage || 0,
    autonomyPoints: user.autonomyPoints || 0,
    isResident: user.isResident,
    monthlyIncome: user.monthlyIncome,
  };

  try {
    const results = await disabilityAllowanceEngineInstance.run(facts);

    if (benefitType === 'ARR') {
      const eligibleEvent = results.events.find((e) => e.type === 'arr-eligible');
      const ineligibleEvent = results.events.find((e) => e.type === 'arr-ineligible');

      if (eligibleEvent) {
        const category = user.householdSituation === 'isolated' ? 'A' :
                        user.householdSituation === 'cohabitant' ? 'B' : 'C';
        const amount = calculateARRAmount(
          category,
          user.monthlyIncome,
          user.hasWorkIncome,
          user.workIncomeAmount
        );

        return {
          benefitType: 'family-allowance', // Using as placeholder
          isEligible: true,
          calculatedAmount: amount,
          optimizationSuggestion: `ARR Catégorie ${category}: ${ARR_AMOUNTS_2024.categories[category].description}`,
        };
      }

      if (ineligibleEvent) {
        return {
          benefitType: 'family-allowance',
          isEligible: false,
          reason: ineligibleEvent.params?.reason,
        };
      }
    }

    if (benefitType === 'AI') {
      const eligibleEvent = results.events.find((e) => e.type === 'ai-eligible');
      const ineligibleEvent = results.events.find((e) => e.type === 'ai-ineligible');

      if (eligibleEvent && user.autonomyPoints) {
        const category = determineAICategory(user.autonomyPoints);
        if (category) {
          const amount = calculateAIAmount(category);
          const categoryData = AI_AMOUNTS_2024.categories[category as keyof typeof AI_AMOUNTS_2024.categories];

          return {
            benefitType: 'family-allowance',
            isEligible: true,
            calculatedAmount: amount,
            optimizationSuggestion: `AI Catégorie ${category}: ${categoryData.description}`,
          };
        }
      }

      if (ineligibleEvent) {
        return {
          benefitType: 'family-allowance',
          isEligible: false,
          reason: ineligibleEvent.params?.reason,
        };
      }
    }

    return {
      benefitType: 'family-allowance',
      isEligible: false,
      reason: 'Conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Error checking disability eligibility: ${error}`);
  }
}

/**
 * Calculate combined ARR + AI for eligible persons
 */
export function calculateCombinedAllocations(user: DisabilityUser): {
  arr: number;
  ai: number;
  total: number;
  details: string;
} {
  let arrAmount = 0;
  let aiAmount = 0;

  // Calculate ARR if eligible
  if (user.age <= ARR_AMOUNTS_2024.ageLimit &&
      user.disabilityPercentage &&
      user.disabilityPercentage >= ARR_AMOUNTS_2024.minimumDisabilityPercentage) {
    const category = user.householdSituation === 'isolated' ? 'A' :
                    user.householdSituation === 'cohabitant' ? 'B' : 'C';
    arrAmount = calculateARRAmount(
      category,
      user.monthlyIncome,
      user.hasWorkIncome,
      user.workIncomeAmount
    );
  }

  // Calculate AI if eligible
  if (user.autonomyPoints && user.autonomyPoints >= AI_AMOUNTS_2024.minimumPoints) {
    const category = determineAICategory(user.autonomyPoints);
    if (category) {
      aiAmount = calculateAIAmount(category);
    }
  }

  return {
    arr: arrAmount,
    ai: aiAmount,
    total: arrAmount + aiAmount,
    details: `ARR: ${arrAmount}€/mois, AI: ${aiAmount}€/mois`,
  };
}

/**
 * Export rules in JSON format for transparency
 */
export const HANDICAP_RULES_JSON = {
  legalFramework: {
    primaryLegislation: {
      title: HANDICAP_LEGAL_FRAMEWORK.title,
      date: HANDICAP_LEGAL_FRAMEWORK.date,
      officialUrl: HANDICAP_LEGAL_FRAMEWORK.officialUrl,
      authority: HANDICAP_LEGAL_FRAMEWORK.authority,
      articles: HANDICAP_LEGAL_FRAMEWORK.articles,
      lastAmended: HANDICAP_LEGAL_FRAMEWORK.lastAmended,
    },
    implementingDecrees: [
      {
        title: 'Arrêté royal relatif à l\'allocation de remplacement de revenus et à l\'allocation d\'intégration',
        date: '1987-07-06',
        officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1987070637&table_name=loi',
      },
    ],
    notes: [
      'Les montants sont indexés annuellement selon l\'indice des prix à la consommation',
      'L\'évaluation médicale est effectuée par les médecins de la DG Handicap',
      'Les allocations sont cumulables entre elles (ARR + AI)',
      'Révision possible en cas d\'aggravation du handicap',
    ],
  },
  arrRules: {
    eligibility: {
      ageLimit: ARR_AMOUNTS_2024.ageLimit,
      minimumDisability: `${ARR_AMOUNTS_2024.minimumDisabilityPercentage}%`,
      residency: 'Résidence effective en Belgique requise',
    },
    categories: ARR_AMOUNTS_2024.categories,
    incomeExemptions: INCOME_EXEMPTIONS,
    calculation: 'ARR = Montant de base catégorie - Revenus comptables',
  },
  aiRules: {
    eligibility: {
      minimumPoints: AI_AMOUNTS_2024.minimumPoints,
      maximumPoints: AI_AMOUNTS_2024.maximumPoints,
      noAgeLimit: 'Pas de limite d\'âge pour l\'AI',
      residency: 'Résidence effective en Belgique requise',
    },
    categories: AI_AMOUNTS_2024.categories,
    evaluationCriteria: AUTONOMY_EVALUATION_CRITERIA,
    calculation: 'AI basée uniquement sur les points d\'autonomie',
  },
  socialAdvantages: {
    automatic: [
      'Tarif social énergie (gaz et électricité)',
      'Carte de stationnement pour personnes handicapées',
      'Réduction transports publics (carte accompagnateur gratuit)',
      'Exonération précompte immobilier (selon région)',
      'Tarif téléphonique social',
      'BIM (Bénéficiaire Intervention Majorée) automatique',
    ],
    onRequest: [
      'Allocations familiales majorées',
      'Prime d\'adaptation du logement',
      'Aide matérielle (voiturette, prothèses)',
      'Carte européenne de stationnement',
    ],
  },
  procedureAndObligations: {
    application: {
      platform: 'https://handicap.belgium.be',
      documents: [
        'Formulaire de demande en ligne',
        'Documents médicaux récents',
        'Preuves de revenus',
        'Composition de ménage',
      ],
      processingTime: '6 mois maximum',
      appeal: 'Tribunal du travail compétent',
    },
    obligations: [
      'Déclarer tout changement de situation dans les 30 jours',
      'Déclarer revenus professionnels immédiatement',
      'Déclarer changement état civil (mariage, divorce, cohabitation)',
      'Se soumettre aux contrôles médicaux si demandé',
      'Résider en Belgique minimum 8 mois par an',
    ],
    sanctions: {
      falseDeclaration: 'Récupération des montants + sanctions pénales possibles',
      nonDeclaration: 'Suspension ou réduction des allocations',
      absenceControle: 'Suspension jusqu\'à régularisation',
    },
  },
  lastUpdate: '2024-01-01',
  source: 'DG Handicap - SPF Sécurité Sociale',
};

