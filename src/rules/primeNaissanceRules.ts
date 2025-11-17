/**
 * Business Rules for Prime de Naissance (Birth Allowance)
 *
 * Implements comprehensive eligibility rules for Belgian birth allowance
 * with regional variations (Brussels, Wallonia, Flanders).
 *
 * BASE JURIDIQUE:
 * - Constitution belge, Article 23 - Droit aux allocations familiales
 * - Ordonnance du 25 avril 2019 (Bruxelles) - Chapitre III Prime de naissance
 * - Décret du 8 février 2018 (Wallonie) - Article 10
 * - Décret du 27 avril 2018 (Flandre) - Startbedrag
 * - Règlement (CE) n° 883/2004 - Coordination des systèmes de sécurité sociale
 *
 * AUTORITÉS:
 * - Bruxelles: Famiris / Iriscare
 * - Wallonie: AVIQ (Agence pour une Vie de Qualité)
 * - Flandre: Opgroeien (Kind en Gezin)
 *
 * Dernière mise à jour: 2024
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';
import { FAMILY_ALLOWANCES_LEGAL_FRAMEWORK, FAMILY_ALLOWANCES_AMOUNTS_2024 } from '../legal-sources/belgianLegalSources';

// Regional types
export type BelgianRegion = 'brussels' | 'wallonia' | 'flanders';

// Constants from Belgian birth allowance law (2024)
const MIN_PREGNANCY_MONTHS_ANTICIPATION = 6; // Can request from 6th month of pregnancy
const MAX_DECLARATION_DAYS_NORMAL = 90;      // Normal declaration deadline
const MAX_DECLARATION_YEARS_EXCEPTIONAL = 5;  // Exceptional deadline with justification
const MIN_STILLBIRTH_DAYS = 180;             // Minimum pregnancy duration for stillbirth eligibility

// Regional amounts for 2024 (in EUR)
export const REGIONAL_BIRTH_AMOUNTS_2024 = {
  brussels: {
    firstChild: 1367.74,
    otherChildren: 621.70,
    adoption: {
      firstChild: 1367.74,
      otherChildren: 621.70,
    },
    multipleBirth: {
      // Each child gets their rank amount
      twins: 'firstChild + otherChildren',
      triplets: 'firstChild + 2x otherChildren',
    },
    stillbirth: {
      eligible: true,
      minPregnancyDays: 180,
      amount: 'same as regular birth',
    },
    authority: 'Famiris',
    paymentTiming: 'Au 6ème mois de grossesse ou après naissance',
    officialUrl: 'https://famiris.brussels/fr/familles/prime-de-naissance/',
  },
  wallonia: {
    firstChild: 1100.00,
    otherChildren: 500.00,
    adoption: {
      firstChild: 1100.00,
      otherChildren: 500.00,
    },
    multipleBirth: {
      twins: 'firstChild + otherChildren',
      triplets: 'firstChild + 2x otherChildren',
    },
    stillbirth: {
      eligible: true,
      minPregnancyDays: 180,
      amount: 'same as regular birth',
    },
    authority: 'AVIQ',
    paymentTiming: 'Au 6ème mois de grossesse ou après naissance',
    officialUrl: 'https://www.aviq.be/fr/familles/prime-de-naissance',
  },
  flanders: {
    universal: 1269.25, // Same amount regardless of child rank
    adoption: {
      amount: 1269.25,
    },
    multipleBirth: {
      perChild: 1269.25, // Each child gets full amount
    },
    stillbirth: {
      eligible: true,
      minPregnancyDays: 180,
      amount: 1269.25,
    },
    authority: 'Opgroeien',
    paymentTiming: 'Automatisch na geboorte',
    officialUrl: 'https://www.groeipakket.be/nl/startbedrag',
  },
};

// Interface for birth information
export interface BirthInfo {
  pregnancyMonths?: number;       // For anticipation requests
  daysSinceBirth?: number;         // For post-birth requests
  childRank: number;               // 1 for first child, 2+ for others
  isMultipleBirth: boolean;
  numberOfMultiples?: number;      // 2 for twins, 3 for triplets, etc.
  isAdoption: boolean;
  adoptionDate?: Date;
  isStillbirth: boolean;
  pregnancyDays?: number;          // For stillbirth
  hasValidResidency: boolean;
  region: BelgianRegion;
}

/**
 * Create the Birth Allowance eligibility rules engine
 */
function createBirthAllowanceEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Anticipation request (during pregnancy)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'pregnancyMonths',
          operator: 'greaterThanInclusive',
          value: MIN_PREGNANCY_MONTHS_ANTICIPATION,
        },
        {
          fact: 'isStillbirth',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'birth-allowance-eligible-anticipation',
      params: {
        message: 'Éligible pour prime de naissance anticipée (6ème mois)',
        paymentTime: 'anticipation',
      },
    },
    priority: 10,
  });

  // Rule 2: Normal post-birth request
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'daysSinceBirth',
          operator: 'lessThanInclusive',
          value: MAX_DECLARATION_DAYS_NORMAL,
        },
        {
          fact: 'daysSinceBirth',
          operator: 'greaterThanInclusive',
          value: 0,
        },
        {
          fact: 'isStillbirth',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'birth-allowance-eligible-normal',
      params: {
        message: 'Éligible pour prime de naissance (délai normal)',
        paymentTime: 'normal',
      },
    },
    priority: 9,
  });

  // Rule 3: Late request with justification
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'daysSinceBirth',
          operator: 'greaterThan',
          value: MAX_DECLARATION_DAYS_NORMAL,
        },
        {
          fact: 'daysSinceBirth',
          operator: 'lessThanInclusive',
          value: MAX_DECLARATION_YEARS_EXCEPTIONAL * 365,
        },
        {
          fact: 'hasJustification',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'birth-allowance-eligible-late',
      params: {
        message: 'Éligible pour prime de naissance (délai exceptionnel avec justification)',
        paymentTime: 'late',
        requiresJustification: true,
      },
    },
    priority: 8,
  });

  // Rule 4: Stillbirth eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isStillbirth',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'pregnancyDays',
          operator: 'greaterThanInclusive',
          value: MIN_STILLBIRTH_DAYS,
        },
      ],
    },
    event: {
      type: 'birth-allowance-eligible-stillbirth',
      params: {
        message: 'Éligible pour prime de naissance (enfant mort-né après 180 jours)',
        paymentTime: 'stillbirth',
      },
    },
    priority: 10,
  });

  // Rule 5: Adoption eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isAdoption',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'adoptionDateValid',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'birth-allowance-eligible-adoption',
      params: {
        message: 'Éligible pour prime d\'adoption',
        paymentTime: 'adoption',
      },
    },
    priority: 9,
  });

  // Rule 6: Too late - prescription
  engine.addRule({
    conditions: {
      any: [
        {
          all: [
            {
              fact: 'daysSinceBirth',
              operator: 'greaterThan',
              value: MAX_DECLARATION_YEARS_EXCEPTIONAL * 365,
            },
            {
              fact: 'isStillbirth',
              operator: 'equal',
              value: false,
            },
          ],
        },
      ],
    },
    event: {
      type: 'birth-allowance-ineligible',
      params: {
        reason: `délai de prescription de ${MAX_DECLARATION_YEARS_EXCEPTIONAL} ans dépassé`,
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 7: Residency requirement
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'hasValidResidency',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'birth-allowance-ineligible',
      params: {
        reason: 'pas de titre de séjour valide en Belgique',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 8: Stillbirth not eligible (pregnancy too short)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isStillbirth',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'pregnancyDays',
          operator: 'lessThan',
          value: MIN_STILLBIRTH_DAYS,
        },
      ],
    },
    event: {
      type: 'birth-allowance-ineligible',
      params: {
        reason: `grossesse inférieure à ${MIN_STILLBIRTH_DAYS} jours pour enfant mort-né`,
        priority: 10,
      },
    },
    priority: 10,
  });

  return engine;
}

/**
 * Singleton instance of the Birth Allowance rules engine
 */
const birthAllowanceEngineInstance = createBirthAllowanceEngine();

/**
 * Calculate birth allowance amount based on region and situation
 */
export function calculateBirthAllowanceAmount(
  birthInfo: BirthInfo
): {
  amount: number;
  breakdown?: { [key: string]: number };
  authority: string;
  paymentMethod: string;
} {
  const regionalAmounts = REGIONAL_BIRTH_AMOUNTS_2024[birthInfo.region];
  let amount = 0;
  const breakdown: { [key: string]: number } = {};

  switch (birthInfo.region) {
    case 'brussels':
    case 'wallonia':
      // Brussels and Wallonia have similar structure
      const regionalBW = regionalAmounts as typeof REGIONAL_BIRTH_AMOUNTS_2024.brussels | typeof REGIONAL_BIRTH_AMOUNTS_2024.wallonia;
      if (birthInfo.isAdoption) {
        amount = birthInfo.childRank === 1
          ? regionalBW.adoption.firstChild
          : regionalBW.adoption.otherChildren;
        breakdown['adoption'] = amount;
      } else if (birthInfo.isStillbirth && regionalBW.stillbirth.eligible) {
        amount = birthInfo.childRank === 1
          ? regionalBW.firstChild
          : regionalBW.otherChildren;
        breakdown['stillbirth'] = amount;
      } else if (birthInfo.isMultipleBirth && birthInfo.numberOfMultiples) {
        // For multiple births, calculate each child's amount
        for (let i = 0; i < birthInfo.numberOfMultiples; i++) {
          const childRank = birthInfo.childRank + i;
          const childAmount = childRank === 1
            ? regionalBW.firstChild
            : regionalBW.otherChildren;
          breakdown[`child${i + 1}`] = childAmount;
          amount += childAmount;
        }
      } else {
        // Regular birth
        amount = birthInfo.childRank === 1
          ? regionalBW.firstChild
          : regionalBW.otherChildren;
        breakdown['base'] = amount;
      }
      break;

    case 'flanders':
      // Flanders has universal amount
      const regionalFL = regionalAmounts as typeof REGIONAL_BIRTH_AMOUNTS_2024.flanders;
      if (birthInfo.isAdoption) {
        amount = regionalFL.adoption.amount;
        breakdown['adoption'] = amount;
      } else if (birthInfo.isStillbirth && regionalFL.stillbirth.eligible) {
        amount = regionalFL.stillbirth.amount;
        breakdown['stillbirth'] = amount;
      } else if (birthInfo.isMultipleBirth && birthInfo.numberOfMultiples) {
        // Each child gets full amount
        amount = regionalFL.universal * birthInfo.numberOfMultiples;
        for (let i = 0; i < birthInfo.numberOfMultiples; i++) {
          breakdown[`child${i + 1}`] = regionalFL.universal;
        }
      } else {
        // Regular birth - same for all
        amount = regionalFL.universal;
        breakdown['base'] = amount;
      }
      break;
  }

  return {
    amount: Math.round(amount * 100) / 100,
    breakdown: Object.keys(breakdown).length > 0 ? breakdown : undefined,
    authority: regionalAmounts.authority,
    paymentMethod: regionalAmounts.paymentTiming,
  };
}

/**
 * Check Birth Allowance eligibility
 */
export async function checkBirthAllowanceEligibility(
  birthInfo: BirthInfo,
  hasJustification: boolean = false
): Promise<EligibilityCheck> {
  // Prepare facts for the rules engine
  const facts = {
    pregnancyMonths: birthInfo.pregnancyMonths || 0,
    daysSinceBirth: birthInfo.daysSinceBirth || -1,
    isStillbirth: birthInfo.isStillbirth,
    pregnancyDays: birthInfo.pregnancyDays || 0,
    isAdoption: birthInfo.isAdoption,
    adoptionDateValid: birthInfo.adoptionDate ? true : false,
    hasValidResidency: birthInfo.hasValidResidency,
    hasJustification,
  };

  try {
    const results = await birthAllowanceEngineInstance.run(facts);

    // Check for ineligibility
    const ineligibleEvent = results.events.find((e) => e.type === 'birth-allowance-ineligible');
    if (ineligibleEvent) {
      return {
        benefitType: 'birth-allowance',
        isEligible: false,
        reason: ineligibleEvent.params?.reason,
      };
    }

    // Check for eligibility (various types)
    const eligibleEvents = results.events.filter((e) => e.type.startsWith('birth-allowance-eligible'));

    if (eligibleEvents.length > 0) {
      const calculation = calculateBirthAllowanceAmount(birthInfo);
      const eligibilityType = eligibleEvents[0].params?.paymentTime;

      // Determine required documents
      const requiredDocuments = getRequiredDocuments(birthInfo, eligibilityType);

      return {
        benefitType: 'birth-allowance',
        isEligible: true,
        calculatedAmount: calculation.amount,
        breakdown: calculation.breakdown,
        notes: [
          `Type d'éligibilité: ${eligibilityType}`,
          eligibleEvents[0].params?.requiresJustification
            ? 'Conditions: Justification requise pour demande tardive'
            : undefined,
          `Documents requis: ${requiredDocuments.join(', ')}`,
          `Autorité compétente: ${calculation.authority}`,
          `Méthode de paiement: ${calculation.paymentMethod}`
        ].filter(Boolean) as string[],
      };
    }

    return {
      benefitType: 'birth-allowance',
      isEligible: false,
      reason: 'conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Error checking Birth Allowance eligibility: ${error}`);
  }
}

/**
 * Get required documents based on situation
 */
function getRequiredDocuments(birthInfo: BirthInfo, eligibilityType: string): string[] {
  const documents: string[] = [];

  // Common documents
  documents.push('Carte d\'identité des parents ou titre de séjour');
  documents.push('Preuve de domicile');
  documents.push('RIB ou numéro de compte bancaire');

  // Specific documents by type
  switch (eligibilityType) {
    case 'anticipation':
      documents.push('Attestation médicale de grossesse (6ème mois)');
      break;
    case 'normal':
      documents.push('Acte de naissance');
      documents.push('Composition de ménage');
      break;
    case 'late':
      documents.push('Acte de naissance');
      documents.push('Justification du retard');
      documents.push('Composition de ménage');
      break;
    case 'stillbirth':
      documents.push('Certificat médical attestant la durée de grossesse');
      documents.push('Acte de décès de l\'enfant');
      break;
    case 'adoption':
      documents.push('Jugement d\'adoption');
      documents.push('Acte d\'adoption');
      documents.push('Composition de ménage');
      break;
  }

  return documents;
}

/**
 * Calculate for multiple births (twins, triplets, etc.)
 */
export function calculateMultipleBirthAllowances(
  baseChildRank: number,
  numberOfChildren: number,
  region: BelgianRegion
): {
  totalAmount: number;
  perChildAmounts: number[];
} {
  const perChildAmounts: number[] = [];
  let totalAmount = 0;

  for (let i = 0; i < numberOfChildren; i++) {
    const birthInfo: BirthInfo = {
      childRank: baseChildRank + i,
      isMultipleBirth: true,
      numberOfMultiples: 1, // Calculate individually
      isAdoption: false,
      isStillbirth: false,
      hasValidResidency: true,
      region,
    };

    const calculation = calculateBirthAllowanceAmount(birthInfo);
    perChildAmounts.push(calculation.amount);
    totalAmount += calculation.amount;
  }

  return {
    totalAmount: Math.round(totalAmount * 100) / 100,
    perChildAmounts,
  };
}

/**
 * Export des règles en format JSON pour transparence
 * Avec références juridiques complètes
 */
export const BIRTH_ALLOWANCE_RULES_JSON = {
  legalFramework: {
    constitutional: {
      article: 'Article 23',
      content: 'Droit aux allocations familiales incluant la prime de naissance',
    },
    regionalLegislation: {
      brussels: {
        title: 'Ordonnance du 25 avril 2019 - Chapitre III',
        articles: ['Article 8', 'Article 9'],
        authority: 'Famiris',
        url: 'https://famiris.brussels/fr/familles/prime-de-naissance/',
      },
      wallonia: {
        title: 'Décret du 8 février 2018',
        article: 'Article 10',
        authority: 'AVIQ',
        url: 'https://www.aviq.be/fr/familles/prime-de-naissance',
      },
      flanders: {
        title: 'Décret du 27 avril 2018',
        name: 'Startbedrag',
        authority: 'Opgroeien',
        url: 'https://www.groeipakket.be/nl/startbedrag',
      },
    },
    europeanCoordination: {
      regulation: 'Règlement (CE) n° 883/2004',
      content: 'Coordination des systèmes de sécurité sociale',
      note: 'Prime exportable dans l\'UE selon certaines conditions',
    },
  },
  eligibilityCriteria: {
    timing: {
      anticipation: `À partir du ${MIN_PREGNANCY_MONTHS_ANTICIPATION}ème mois de grossesse`,
      normal: `Dans les ${MAX_DECLARATION_DAYS_NORMAL} jours après la naissance`,
      exceptional: `Jusqu'à ${MAX_DECLARATION_YEARS_EXCEPTIONAL} ans avec justification`,
    },
    residency: 'Titre de séjour valide en Belgique',
    specialCases: {
      stillbirth: {
        minPregnancyDays: MIN_STILLBIRTH_DAYS,
        eligibility: 'Oui, avec certificat médical',
      },
      adoption: {
        eligibility: 'Oui, mêmes montants',
        requiredDoc: 'Jugement d\'adoption',
      },
      multipleBirth: {
        calculation: 'Chaque enfant compte selon son rang',
        example: 'Jumeaux = premier enfant + deuxième enfant',
      },
    },
  },
  regionalAmounts2024: REGIONAL_BIRTH_AMOUNTS_2024,
  paymentProcess: {
    automatic: {
      flanders: 'Paiement automatique après déclaration à la commune',
    },
    onRequest: {
      brussels: 'Demande à faire auprès de Famiris',
      wallonia: 'Demande à faire auprès de la caisse d\'allocations',
    },
    timing: {
      anticipation: 'Au 6ème mois de grossesse',
      normal: 'Dans les 2 mois après la demande',
    },
  },
  cumulability: {
    withFamilyAllowances: true,
    withRIS: true,
    withUnemployment: true,
    note: 'Prime de naissance cumulable avec toutes les autres aides',
  },
  taxTreatment: {
    taxable: false,
    socialContributions: false,
    note: 'Prime de naissance non imposable et exempte de cotisations',
  },
  procedures: {
    standardProcess: [
      'Déclaration de naissance à la commune',
      'Demande auprès de la caisse d\'allocations familiales',
      'Fourniture des documents requis',
      'Paiement dans les 2 mois',
    ],
    anticipationProcess: [
      'Attestation médicale du 6ème mois',
      'Demande anticipée à la caisse',
      'Paiement au 6ème mois',
      'Confirmation après naissance',
    ],
    adoptionProcess: [
      'Jugement d\'adoption définitif',
      'Demande à la caisse avec documents',
      'Paiement dans les 2 mois',
    ],
  },
};