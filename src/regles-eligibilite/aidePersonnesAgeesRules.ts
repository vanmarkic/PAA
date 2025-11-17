/**
 * Business Rules for APA (Allocation pour l'Aide aux Personnes Âgées)
 *
 * Implements comprehensive eligibility rules for the Allocation for Elderly Care.
 * Based on features/benefits/aide-personnes-agees.feature Gherkin specifications.
 *
 * BASE JURIDIQUE:
 * RÉGION BRUXELLES-CAPITALE:
 * - Ordonnance du 10 décembre 2009 relative à l'allocation d'aide aux personnes âgées
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2009121017&table_name=loi
 * - Arrêté du 16 janvier 2014 du Collège réuni de la COCOM
 * - Autorité: Iriscare (Commission communautaire commune)
 *
 * RÉGION WALLONNE:
 * - Code wallon de l'Action sociale et de la Santé (CWASS), Livre V, Titre VII
 * - Décret du 21 décembre 2016 relatif aux prestations familiales
 * - Autorité: AVIQ (Agence pour une Vie de Qualité)
 *
 * Dernière modification: juin 2024 (revalorisation des montants)
 */

import { Engine } from 'json-rules-engine';
import { EligibilityCheck } from '../modele-metier/types';

// Types spécifiques pour l'APA
export type APACategory = 1 | 2 | 3 | 4 | 5;

export interface AutonomyScore {
  mobility: number; // 0-3 points
  mealPreparation: number; // 0-3 points
  personalHygiene: number; // 0-3 points
  householdMaintenance: number; // 0-3 points
  dangerAwareness: number; // 0-3 points
  communication: number; // 0-3 points
  total: number; // 0-18 points
}

// Montants APA 2024 (depuis juin 2024)
const APA_AMOUNTS_2024 = {
  categories: {
    1: { minPoints: 7, maxPoints: 8, annualAmount: 1269.81, monthlyAmount: 105.82 },
    2: { minPoints: 9, maxPoints: 11, annualAmount: 4847.15, monthlyAmount: 403.93 },
    3: { minPoints: 12, maxPoints: 14, annualAmount: 5893.36, monthlyAmount: 491.11 },
    4: { minPoints: 15, maxPoints: 16, annualAmount: 6939.25, monthlyAmount: 578.27 },
    5: { minPoints: 17, maxPoints: 18, annualAmount: 7985.15, monthlyAmount: 665.43 },
  },
  incomeCeilings: {
    isolated: 20725.25, // EUR per year
    couple: 25468.38, // EUR per year
  },
};

// Constantes APA
const APA_CONSTANTS = {
  minAge: 65,
  minAutonomyScore: 7,
  maxAutonomyScore: 18,
  evaluationValidityYears: 5,
  decisionDelayMonths: 6,
  pocketMoneyNursingHome: 111.24, // EUR par mois minimum gardé
};

/**
 * Create the comprehensive APA eligibility rules engine
 */
function createAPAEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Age requirement (must be 65+)
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'age',
          operator: 'lessThan',
          value: APA_CONSTANTS.minAge,
        },
      ],
    },
    event: {
      type: 'apa-ineligible',
      params: {
        reason: `âge minimum non atteint (${APA_CONSTANTS.minAge} ans requis)`,
        priority: 10,
        alternatives: ['allocation de remplacement de revenus (ARR) si moins de 65 ans'],
      },
    },
    priority: 10,
  });

  // Rule 2: Autonomy score too low (less than 7 points)
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'autonomyScore',
          operator: 'lessThan',
          value: APA_CONSTANTS.minAutonomyScore,
        },
      ],
    },
    event: {
      type: 'apa-ineligible',
      params: {
        reason: `score d'autonomie insuffisant (minimum ${APA_CONSTANTS.minAutonomyScore} points requis)`,
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 3: Income ceiling for isolated person
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'householdType',
          operator: 'equal',
          value: 'isolated',
        },
        {
          fact: 'annualIncome',
          operator: 'greaterThan',
          value: APA_AMOUNTS_2024.incomeCeilings.isolated,
        },
      ],
    },
    event: {
      type: 'apa-ineligible',
      params: {
        reason: `revenus supérieurs au plafond (${APA_AMOUNTS_2024.incomeCeilings.isolated}€ pour personne isolée)`,
        priority: 9,
      },
    },
    priority: 9,
  });

  // Rule 4: Income ceiling for couple
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'householdType',
          operator: 'equal',
          value: 'couple',
        },
        {
          fact: 'annualIncome',
          operator: 'greaterThan',
          value: APA_AMOUNTS_2024.incomeCeilings.couple,
        },
      ],
    },
    event: {
      type: 'apa-ineligible',
      params: {
        reason: `revenus supérieurs au plafond (${APA_AMOUNTS_2024.incomeCeilings.couple}€ pour ménage)`,
        priority: 9,
      },
    },
    priority: 9,
  });

  // Rule 5: Nationality/residency requirement
  engine.addRule({
    conditions: {
      not: {
        all: [
          {
            fact: 'nationality',
            operator: 'in',
            value: ['belgian', 'eu-citizen', 'long-term-resident', 'refugee'],
          },
        ],
      },
    },
    event: {
      type: 'apa-ineligible',
      params: {
        reason: 'nationalité ou statut de résidence non éligible',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 6: Regional residency requirement
  engine.addRule({
    conditions: {
      not: {
        all: [
          {
            fact: 'region',
            operator: 'in',
            value: ['brussels', 'wallonia'],
          },
        ],
      },
    },
    event: {
      type: 'apa-ineligible',
      params: {
        reason: 'doit résider en Région de Bruxelles-Capitale ou en Wallonie',
        priority: 10,
        note: 'La Flandre a un système différent (Zorgbudget voor Ouderen met een Zorgnood)',
      },
    },
    priority: 10,
  });

  // Rule 7: Category 1 eligibility (7-8 points)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: APA_CONSTANTS.minAge,
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
          fact: 'incomeWithinLimits',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'apa-eligible-category-1',
      params: {
        category: 1,
        message: 'Éligible APA catégorie 1',
        annualAmount: APA_AMOUNTS_2024.categories[1].annualAmount,
        monthlyAmount: APA_AMOUNTS_2024.categories[1].monthlyAmount,
      },
    },
    priority: 5,
  });

  // Rule 8: Category 2 eligibility (9-11 points)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: APA_CONSTANTS.minAge,
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
          fact: 'incomeWithinLimits',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'apa-eligible-category-2',
      params: {
        category: 2,
        message: 'Éligible APA catégorie 2',
        annualAmount: APA_AMOUNTS_2024.categories[2].annualAmount,
        monthlyAmount: APA_AMOUNTS_2024.categories[2].monthlyAmount,
      },
    },
    priority: 5,
  });

  // Rule 9: Category 3 eligibility (12-14 points)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: APA_CONSTANTS.minAge,
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
          fact: 'incomeWithinLimits',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'apa-eligible-category-3',
      params: {
        category: 3,
        message: 'Éligible APA catégorie 3',
        annualAmount: APA_AMOUNTS_2024.categories[3].annualAmount,
        monthlyAmount: APA_AMOUNTS_2024.categories[3].monthlyAmount,
      },
    },
    priority: 5,
  });

  // Rule 10: Category 4 eligibility (15-16 points)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: APA_CONSTANTS.minAge,
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
          fact: 'incomeWithinLimits',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'apa-eligible-category-4',
      params: {
        category: 4,
        message: 'Éligible APA catégorie 4',
        annualAmount: APA_AMOUNTS_2024.categories[4].annualAmount,
        monthlyAmount: APA_AMOUNTS_2024.categories[4].monthlyAmount,
      },
    },
    priority: 5,
  });

  // Rule 11: Category 5 eligibility (17-18 points)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: APA_CONSTANTS.minAge,
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
          fact: 'incomeWithinLimits',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'apa-eligible-category-5',
      params: {
        category: 5,
        message: 'Éligible APA catégorie 5',
        annualAmount: APA_AMOUNTS_2024.categories[5].annualAmount,
        monthlyAmount: APA_AMOUNTS_2024.categories[5].monthlyAmount,
      },
    },
    priority: 5,
  });

  return engine;
}

/**
 * Singleton instance of the APA rules engine
 * SCALABILITY IMPROVEMENT: Reuse engine instance instead of recreating on every call
 */
const apaEngineInstance = createAPAEngine();

/**
 * Calculate autonomy score based on evaluation criteria
 */
export function calculateAutonomyScore(evaluation: {
  mobility?: number;
  mealPreparation?: number;
  personalHygiene?: number;
  householdMaintenance?: number;
  dangerAwareness?: number;
  communication?: number;
}): AutonomyScore {
  const score: AutonomyScore = {
    mobility: Math.min(3, Math.max(0, evaluation.mobility || 0)),
    mealPreparation: Math.min(3, Math.max(0, evaluation.mealPreparation || 0)),
    personalHygiene: Math.min(3, Math.max(0, evaluation.personalHygiene || 0)),
    householdMaintenance: Math.min(3, Math.max(0, evaluation.householdMaintenance || 0)),
    dangerAwareness: Math.min(3, Math.max(0, evaluation.dangerAwareness || 0)),
    communication: Math.min(3, Math.max(0, evaluation.communication || 0)),
    total: 0,
  };

  score.total = score.mobility + score.mealPreparation + score.personalHygiene +
                score.householdMaintenance + score.dangerAwareness + score.communication;

  return score;
}

/**
 * Determine APA category based on autonomy score
 */
export function determineAPACategory(autonomyScore: number): APACategory | null {
  if (autonomyScore < 7) return null;
  if (autonomyScore <= 8) return 1;
  if (autonomyScore <= 11) return 2;
  if (autonomyScore <= 14) return 3;
  if (autonomyScore <= 16) return 4;
  if (autonomyScore <= 18) return 5;
  return null;
}

/**
 * Calculate APA amount based on category
 */
export function calculateAPAAmount(category: APACategory): {
  annualAmount: number;
  monthlyAmount: number;
  description: string;
} {
  const categoryData = APA_AMOUNTS_2024.categories[category];

  return {
    annualAmount: categoryData.annualAmount,
    monthlyAmount: categoryData.monthlyAmount,
    description: `APA catégorie ${category} (${categoryData.minPoints}-${categoryData.maxPoints} points d'autonomie)`,
  };
}

/**
 * Check APA eligibility with comprehensive rules
 */
export async function checkAPAEligibility(user: {
  age: number;
  nationality: string;
  region: string;
  householdType: 'isolated' | 'couple';
  annualIncome: number;
  autonomyEvaluation: {
    mobility?: number;
    mealPreparation?: number;
    personalHygiene?: number;
    householdMaintenance?: number;
    dangerAwareness?: number;
    communication?: number;
  };
  inNursingHome?: boolean;
}): Promise<EligibilityCheck> {
  const autonomyScore = calculateAutonomyScore(user.autonomyEvaluation);
  const incomeCeiling = user.householdType === 'isolated'
    ? APA_AMOUNTS_2024.incomeCeilings.isolated
    : APA_AMOUNTS_2024.incomeCeilings.couple;

  const incomeWithinLimits = user.annualIncome <= incomeCeiling;

  const facts = {
    age: user.age,
    nationality: user.nationality,
    region: user.region,
    householdType: user.householdType,
    annualIncome: user.annualIncome,
    autonomyScore: autonomyScore.total,
    incomeWithinLimits,
  };

  try {
    const results = await apaEngineInstance.run(facts);

    // Check for ineligibility reasons
    const ineligibleEvent = results.events.find((e) => e.type === 'apa-ineligible');

    if (ineligibleEvent) {
      return {
        benefitType: 'housing-allowance', // Using as placeholder
        isEligible: false,
        reason: ineligibleEvent.params?.reason,
      };
    }

    // Check for eligibility
    const eligibleEvents = results.events.filter((e) => e.type.startsWith('apa-eligible'));

    if (eligibleEvents.length > 0) {
      const event = eligibleEvents[0];
      const category = event.params?.category as APACategory;

      const services = getAPAServices();
      const cumulation = getCumulationRules();
      const procedure = getAPAProcedure(user.region);

      const additionalInfo: any = {
        category,
        autonomyScore: autonomyScore.total,
        autonomyDetails: autonomyScore,
        annualAmount: event.params?.annualAmount,
        monthlyAmount: event.params?.monthlyAmount,
        services,
        cumulation,
        procedure,
      };

      if (user.inNursingHome) {
        additionalInfo.nursingHomeInfo = {
          paymentMode: 'Versement direct à l\'établissement',
          pocketMoney: `Minimum ${APA_CONSTANTS.pocketMoneyNursingHome}€/mois conservé`,
        };
      }

      return {
        benefitType: 'housing-allowance', // Using as placeholder
        isEligible: true,
        calculatedAmount: event.params?.monthlyAmount,
        reason: event.params?.message,
        optimizationSuggestion: `Catégorie ${category} - Score autonomie: ${autonomyScore.total} points`,
      };
    }

    return {
      benefitType: 'housing-allowance', // Using as placeholder
      isEligible: false,
      reason: 'conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Error checking APA eligibility: ${error}`);
  }
}

/**
 * Get information about services that can be financed with APA
 */
export function getAPAServices() {
  return {
    homeServices: [
      {
        service: 'Aide familiale',
        financing: 'Titres-services',
        complement: 'CPAS si insuffisant',
      },
      {
        service: 'Soins infirmiers',
        financing: 'Via mutuelle',
        complement: 'APA pour surplus',
      },
      {
        service: 'Adaptation logement',
        financing: 'Frais directs',
        complement: 'Primes régionales',
      },
      {
        service: 'Télévigilance',
        financing: 'Abonnement mensuel',
        complement: 'Réduction via commune',
      },
      {
        service: 'Transport adapté',
        financing: 'Services agréés',
        complement: 'Intervention mutuelle',
      },
      {
        service: 'Matériel médical',
        financing: 'Location/achat',
        complement: 'INAMI si prescrit',
      },
    ],
  };
}

/**
 * Get cumulation rules with other benefits
 */
export function getCumulationRules() {
  return [
    {
      benefit: 'GRAPA',
      cumulation: 'Oui',
      note: 'Sans réduction',
    },
    {
      benefit: 'Pension de retraite',
      cumulation: 'Oui',
      note: 'Sans réduction',
    },
    {
      benefit: 'Allocation handicap (ARR/AI)',
      cumulation: 'Non',
      note: 'Choix entre APA ou ARR/AI',
    },
    {
      benefit: 'Aide sociale CPAS',
      cumulation: 'Oui',
      note: 'APA non comptée dans ressources',
    },
    {
      benefit: 'Allocation aidant proche',
      cumulation: 'Oui',
      note: 'Pour la personne aidante',
    },
  ];
}

/**
 * Get APA application procedure by region
 */
export function getAPAProcedure(region: string) {
  if (region === 'brussels') {
    return {
      authority: 'Iriscare',
      steps: [
        {
          step: 'Introduction demande',
          channel: 'MyIriscare en ligne',
          delay: 'Immédiat',
        },
        {
          step: 'Ou formulaire papier',
          channel: 'Via mutuelle/CPAS',
          delay: '5 jours ouvrables',
        },
        {
          step: 'Évaluation médicale',
          by: 'Médecin Iriscare',
          delay: 'Dans les 3 mois',
        },
        {
          step: 'Visite à domicile',
          condition: 'Si nécessaire',
          delay: 'Sur rendez-vous',
        },
        {
          step: 'Décision',
          format: 'Par courrier',
          delay: '6 mois maximum',
        },
        {
          step: 'Paiement',
          mode: 'Virement mensuel',
          delay: 'Mois suivant décision',
        },
      ],
      support: 'Aide disponible via CPAS pour la demande',
    };
  } else if (region === 'wallonia') {
    return {
      authority: 'AVIQ',
      steps: [
        {
          step: 'Introduction demande',
          channel: 'Wal-Protect',
          mode: 'En ligne',
        },
        {
          step: 'Ou via mutuelle',
          format: 'Formulaire papier',
          transmission: 'Transmission AVIQ',
        },
        {
          step: 'Évaluation médicale',
          by: 'Médecin AVIQ',
          delay: 'Dans les 4 mois',
        },
        {
          step: 'Décision',
          format: 'Notification AVIQ',
          delay: '6 mois maximum',
        },
        {
          step: 'Recours possible',
          tribunal: 'Tribunal du travail',
          delay: '3 mois après décision',
        },
      ],
    };
  } else {
    return {
      note: 'Procédure spécifique selon la région',
    };
  }
}

/**
 * Export comprehensive rules in JSON format for transparency
 * Avec références juridiques authentiques
 */
export const APA_RULES_JSON = {
  legalFramework: {
    brussels: {
      primaryLegislation: {
        title: 'Ordonnance relative à l\'allocation d\'aide aux personnes âgées',
        date: '2009-12-10',
        officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2009121017&table_name=loi',
        authority: 'Iriscare (Commission communautaire commune)',
      },
      implementingDecree: {
        title: 'Arrêté du Collège réuni de la COCOM',
        date: '2014-01-16',
        authority: 'Commission communautaire commune',
      },
    },
    wallonia: {
      primaryLegislation: {
        title: 'Code wallon de l\'Action sociale et de la Santé',
        book: 'Livre V, Titre VII',
        authority: 'AVIQ (Agence pour une Vie de Qualité)',
      },
      relatedDecree: {
        title: 'Décret relatif aux prestations familiales',
        date: '2016-12-21',
        relevance: 'Cadre général des allocations',
      },
    },
    notes: [
      'Compétence régionale depuis la 6e réforme de l\'État',
      'La Flandre a un système différent (Zorgbudget)',
      'Montants revalorisés en juin 2024',
      'Évaluation médicale standardisée',
    ],
  },
  amounts: APA_AMOUNTS_2024,
  conditions: {
    age: {
      minimum: APA_CONSTANTS.minAge,
      description: 'Âge minimum requis',
    },
    autonomy: {
      minimumScore: APA_CONSTANTS.minAutonomyScore,
      maximumScore: APA_CONSTANTS.maxAutonomyScore,
      evaluationDomains: [
        'Se déplacer (0-3 points)',
        'Préparer et prendre repas (0-3 points)',
        'Hygiène personnelle (0-3 points)',
        'Entretien ménager (0-3 points)',
        'Dangers et comportement (0-3 points)',
        'Communication (0-3 points)',
      ],
      evaluationValidity: `${APA_CONSTANTS.evaluationValidityYears} ans maximum`,
    },
    income: {
      isolated: APA_AMOUNTS_2024.incomeCeilings.isolated,
      couple: APA_AMOUNTS_2024.incomeCeilings.couple,
      counted: [
        'Pensions',
        'Revenus professionnels',
        'Revenus mobiliers',
        'Revenus immobiliers',
      ],
      excluded: [
        'GRAPA',
        'Allocations familiales',
        'Aide sociale CPAS',
      ],
    },
    nationality: {
      eligible: ['belgian', 'eu-citizen', 'long-term-resident', 'refugee'],
      residenceRequirement: 'Domicile en Belgique',
    },
    region: {
      covered: ['brussels', 'wallonia'],
      notCovered: 'Flandre (système différent)',
    },
  },
  categories: [
    {
      category: 1,
      pointsRange: '7-8',
      description: 'Perte d\'autonomie légère',
      annualAmount: APA_AMOUNTS_2024.categories[1].annualAmount,
      monthlyAmount: APA_AMOUNTS_2024.categories[1].monthlyAmount,
    },
    {
      category: 2,
      pointsRange: '9-11',
      description: 'Perte d\'autonomie modérée',
      annualAmount: APA_AMOUNTS_2024.categories[2].annualAmount,
      monthlyAmount: APA_AMOUNTS_2024.categories[2].monthlyAmount,
    },
    {
      category: 3,
      pointsRange: '12-14',
      description: 'Perte d\'autonomie importante',
      annualAmount: APA_AMOUNTS_2024.categories[3].annualAmount,
      monthlyAmount: APA_AMOUNTS_2024.categories[3].monthlyAmount,
    },
    {
      category: 4,
      pointsRange: '15-16',
      description: 'Perte d\'autonomie sévère',
      annualAmount: APA_AMOUNTS_2024.categories[4].annualAmount,
      monthlyAmount: APA_AMOUNTS_2024.categories[4].monthlyAmount,
    },
    {
      category: 5,
      pointsRange: '17-18',
      description: 'Perte d\'autonomie très sévère',
      annualAmount: APA_AMOUNTS_2024.categories[5].annualAmount,
      monthlyAmount: APA_AMOUNTS_2024.categories[5].monthlyAmount,
    },
  ],
  services: getAPAServices(),
  cumulation: getCumulationRules(),
  fiscalStatus: {
    taxExempt: true,
    description: 'APA exonérée d\'impôts',
    additionalBenefit: 'Réduction d\'impôt pour personne handicapée',
  },
  nursingHome: {
    paymentMode: 'Versement direct à l\'établissement',
    pocketMoneyMinimum: APA_CONSTANTS.pocketMoneyNursingHome,
    complementarySources: ['Pension', 'CPAS si nécessaire'],
  },
  procedure: {
    brussels: getAPAProcedure('brussels'),
    wallonia: getAPAProcedure('wallonia'),
    decisionDelay: `${APA_CONSTANTS.decisionDelayMonths} mois maximum`,
    revision: 'Possible sur changement de situation',
  },
  rules: [
    {
      id: 'apa-age-requirement',
      description: `Personne doit avoir au moins ${APA_CONSTANTS.minAge} ans`,
      condition: `age >= ${APA_CONSTANTS.minAge}`,
      priority: 10,
      legalBasis: 'Ordonnance 10/12/2009 Art. 4',
    },
    {
      id: 'apa-autonomy-requirement',
      description: `Score d'autonomie minimum ${APA_CONSTANTS.minAutonomyScore} points`,
      condition: `autonomyScore >= ${APA_CONSTANTS.minAutonomyScore}`,
      priority: 10,
      legalBasis: 'Évaluation médicale standardisée',
    },
    {
      id: 'apa-income-ceiling',
      description: 'Revenus inférieurs au plafond selon situation',
      condition: 'annualIncome <= incomeCeiling',
      priority: 9,
      legalBasis: 'Ordonnance 10/12/2009 Art. 7',
    },
    {
      id: 'apa-nationality-requirement',
      description: 'Nationalité belge ou statut équivalent',
      condition: 'nationality IN [belgian, eu-citizen, long-term-resident, refugee]',
      priority: 10,
      legalBasis: 'Ordonnance 10/12/2009 Art. 4',
    },
    {
      id: 'apa-regional-requirement',
      description: 'Résidence en Région Bruxelles-Capitale ou Wallonie',
      condition: 'region IN [brussels, wallonia]',
      priority: 10,
      legalBasis: 'Compétence régionale',
    },
  ],
};