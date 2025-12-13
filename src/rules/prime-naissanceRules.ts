/**
 * Business Rules for Prime de Naissance
 *
 * Implements the Gherkin specifications from features/benefits/prime-naissance.feature
 * Using json-rules-engine for runtime evaluation.
 *
 * BASE JURIDIQUE:
 * - Ordonnance du 25 avril 2019 réglant l'octroi des prestations familiales (Bruxelles)
 * - Décret du 8 février 2018 relatif à la gestion et au paiement des prestations familiales (Wallonie)
 * - Groeipakketdecreet du 27 avril 2018 (Flandre)
 * - Loi générale relative aux allocations familiales (LGAF)
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';

/**
 * PrimeNaissance Rules Version Metadata
 * This version MUST match the specification version in features/benefits/prime-naissance.feature
 */
export const PRIME_NAISSANCE_RULES_METADATA = {
  implementsSpecification: '0.0.0',
  implementationVersion: '0.0.0',
  implementationStatus: 'complete' as const,
  lastSyncedWith: 'features/benefits/prime-naissance.feature',
  generatedFrom: 'features/benefits/prime-naissance.feature@0.0.0',
  divergences: [] as string[],
  effectiveDate: '2024-01-01',
};

// Constants from Belgian social law - Prime de Naissance 2024
export const PRIME_NAISSANCE_AMOUNTS_2024 = {
  bruxelles: {
    premierEnfant: 1367.74,
    enfantsSuivants: 621.70,
  },
  wallonie: {
    premierEnfant: 1100.0,
    enfantsSuivants: 500.0,
  },
  flandre: {
    premierEnfant: 1269.25,
    enfantsSuivants: 1269.25, // Same amount for all children in Flanders
  },
} as const;

export const PRIME_NAISSANCE_CONSTANTS = {
  MIN_PREGNANCY_MONTHS_ANTICIPATED: 6,
  NORMAL_DECLARATION_DAYS: 90,
  MAX_DECLARATION_YEARS: 5,
  MAX_DECLARATION_DAYS: 5 * 365, // 5 years in days
  MIN_STILLBIRTH_PREGNANCY_DAYS: 180,
  PAYMENT_DELAY_MONTHS: 2,
} as const;

export type Region = 'bruxelles' | 'wallonie' | 'flandre';

export interface PrimeNaissanceInput {
  region: Region;
  childRank: number;
  daysSinceBirth: number | null; // null if not yet born (anticipated request)
  pregnancyMonths: number | null; // null if child is already born
  hasValidResidencePermit: boolean;
  isAdoption: boolean;
  isAdoptionRecognized?: boolean;
  isStillbirth: boolean;
  stillbirthPregnancyDays?: number;
  isMultipleBirth: boolean;
  numberOfChildren?: number;
  hasJustificationForDelay?: boolean;
  isAnticipatedRequest: boolean;
}

/**
 * Create the PrimeNaissance eligibility rules engine
 */
function createPrimeNaissanceEngine(): Engine {
  const engine = new Engine();

  // Rule 1: No valid residence permit - ineligible (highest priority)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasValidResidencePermit',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'primeNaissance-ineligible',
      params: {
        reason: 'pas de titre de séjour valide',
        priority: 100,
      },
    },
    priority: 100,
  });

  // Rule 2: Prescription deadline exceeded (5 years) - ineligible
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'daysSinceBirth',
          operator: 'greaterThan',
          value: PRIME_NAISSANCE_CONSTANTS.MAX_DECLARATION_DAYS,
        },
        {
          fact: 'isAnticipatedRequest',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'primeNaissance-ineligible',
      params: {
        reason: 'délai de prescription de 5 ans dépassé',
        priority: 90,
      },
    },
    priority: 90,
  });

  // Rule 3: Anticipated request - must be at least 6 months pregnant
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isAnticipatedRequest',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'pregnancyMonths',
          operator: 'lessThan',
          value: PRIME_NAISSANCE_CONSTANTS.MIN_PREGNANCY_MONTHS_ANTICIPATED,
        },
        {
          fact: 'hasValidResidencePermit',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'primeNaissance-ineligible',
      params: {
        reason: 'demande anticipée possible uniquement à partir du 6ème mois de grossesse',
        priority: 80,
      },
    },
    priority: 80,
  });

  // Rule 4: Adoption without official recognition - ineligible
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isAdoption',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'isAdoptionRecognized',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'hasValidResidencePermit',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'primeNaissance-ineligible',
      params: {
        reason: "adoption non officiellement reconnue",
        priority: 75,
      },
    },
    priority: 75,
  });

  // Rule 5: Stillbirth with less than 180 days pregnancy - ineligible
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isStillbirth',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'stillbirthPregnancyDays',
          operator: 'lessThan',
          value: PRIME_NAISSANCE_CONSTANTS.MIN_STILLBIRTH_PREGNANCY_DAYS,
        },
        {
          fact: 'hasValidResidencePermit',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'primeNaissance-ineligible',
      params: {
        reason: 'enfant mort-né avant 180 jours de grossesse',
        priority: 70,
      },
    },
    priority: 70,
  });

  // Rule 6: Late request (after 90 days but within 5 years) - eligible with justification required
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasValidResidencePermit',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'daysSinceBirth',
          operator: 'greaterThan',
          value: PRIME_NAISSANCE_CONSTANTS.NORMAL_DECLARATION_DAYS,
        },
        {
          fact: 'daysSinceBirth',
          operator: 'lessThanInclusive',
          value: PRIME_NAISSANCE_CONSTANTS.MAX_DECLARATION_DAYS,
        },
        {
          fact: 'isAnticipatedRequest',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'primeNaissance-eligible-late',
      params: {
        message: 'Éligible avec justification du retard requise',
        requiresJustification: true,
        priority: 50,
      },
    },
    priority: 50,
  });

  // Rule 7: Anticipated request eligible (6+ months pregnant)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasValidResidencePermit',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'isAnticipatedRequest',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'pregnancyMonths',
          operator: 'greaterThanInclusive',
          value: PRIME_NAISSANCE_CONSTANTS.MIN_PREGNANCY_MONTHS_ANTICIPATED,
        },
      ],
    },
    event: {
      type: 'primeNaissance-eligible',
      params: {
        message: 'Éligible pour Prime de Naissance (demande anticipée)',
        isAnticipated: true,
        requiresMedicalCertificate: true,
        paymentTiming: 'au 6ème mois de grossesse',
        priority: 40,
      },
    },
    priority: 40,
  });

  // Rule 8: Adoption eligible
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasValidResidencePermit',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'isAdoption',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'isAdoptionRecognized',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'primeNaissance-eligible',
      params: {
        message: "Éligible pour Prime d'Adoption",
        isAdoption: true,
        requiresAdoptionJudgment: true,
        priority: 35,
      },
    },
    priority: 35,
  });

  // Rule 9: Stillbirth eligible (180+ days pregnancy)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasValidResidencePermit',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'isStillbirth',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'stillbirthPregnancyDays',
          operator: 'greaterThanInclusive',
          value: PRIME_NAISSANCE_CONSTANTS.MIN_STILLBIRTH_PREGNANCY_DAYS,
        },
      ],
    },
    event: {
      type: 'primeNaissance-eligible',
      params: {
        message: 'Éligible pour Prime de Naissance (enfant mort-né)',
        isStillbirth: true,
        requiresMedicalCertificate: true,
        priority: 30,
      },
    },
    priority: 30,
  });

  // Rule 10: Multiple birth eligible
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasValidResidencePermit',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'isMultipleBirth',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'isAnticipatedRequest',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'daysSinceBirth',
          operator: 'lessThanInclusive',
          value: PRIME_NAISSANCE_CONSTANTS.MAX_DECLARATION_DAYS,
        },
      ],
    },
    event: {
      type: 'primeNaissance-eligible',
      params: {
        message: 'Éligible pour Prime de Naissance (naissance multiple)',
        isMultipleBirth: true,
        priority: 25,
      },
    },
    priority: 25,
  });

  // Rule 11: Standard birth eligible (within normal period)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasValidResidencePermit',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'isAnticipatedRequest',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'isAdoption',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'isStillbirth',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'isMultipleBirth',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'daysSinceBirth',
          operator: 'greaterThanInclusive',
          value: 0,
        },
        {
          fact: 'daysSinceBirth',
          operator: 'lessThanInclusive',
          value: PRIME_NAISSANCE_CONSTANTS.NORMAL_DECLARATION_DAYS,
        },
      ],
    },
    event: {
      type: 'primeNaissance-eligible',
      params: {
        message: 'Éligible pour Prime de Naissance',
        requiresBirthCertificate: true,
        priority: 20,
      },
    },
    priority: 20,
  });

  return engine;
}

/**
 * Singleton instance of the PrimeNaissance rules engine
 */
const primeNaissanceEngineInstance = createPrimeNaissanceEngine();

/**
 * Get the amount for a single child based on region and rank
 */
function getAmountForChild(region: Region, rank: number): number {
  const amounts = PRIME_NAISSANCE_AMOUNTS_2024[region];
  
  if (rank === 1) {
    return amounts.premierEnfant;
  }
  return amounts.enfantsSuivants;
}

/**
 * Calculate Prime de Naissance amount
 */
export function calculatePrimeNaissanceAmount(
  region: Region,
  childRank: number,
  isMultipleBirth: boolean = false,
  numberOfChildren: number = 1
): number {
  if (isMultipleBirth && numberOfChildren > 1) {
    // For multiple births, first child gets premier enfant rate, others get enfants suivants rate
    let total = 0;
    for (let i = 0; i < numberOfChildren; i++) {
      const effectiveRank = childRank + i;
      total += getAmountForChild(region, effectiveRank);
    }
    return Math.round(total * 100) / 100;
  }
  
  return getAmountForChild(region, childRank);
}

/**
 * Calculate amount breakdown for multiple births
 */
export function calculateMultipleBirthBreakdown(
  region: Region,
  startingRank: number,
  numberOfChildren: number
): { perChild: number[]; total: number } {
  const perChild: number[] = [];
  let total = 0;
  
  for (let i = 0; i < numberOfChildren; i++) {
    const effectiveRank = startingRank + i;
    const amount = getAmountForChild(region, effectiveRank);
    perChild.push(amount);
    total += amount;
  }
  
  return {
    perChild,
    total: Math.round(total * 100) / 100,
  };
}

/**
 * Get competent authority based on region
 */
export function getCompetentAuthority(region: Region): string {
  switch (region) {
    case 'bruxelles':
      return 'Iriscare ou caisse bruxelloise';
    case 'wallonie':
      return 'AVIQ ou autre caisse wallonne';
    case 'flandre':
      return 'Groeipakket';
  }
}

/**
 * Get required documents based on situation
 */
export function getRequiredDocuments(input: PrimeNaissanceInput): string[] {
  const documents: string[] = [
    'Carte d\'identité des parents ou titre de séjour valide',
    'Preuve de domicile (composition de ménage ou facture)',
    'RIB ou numéro de compte pour le versement',
    'Formulaire de demande complété et signé',
  ];
  
  if (input.isAnticipatedRequest) {
    documents.push('Attestation médicale de grossesse');
  } else if (input.isAdoption) {
    documents.push('Jugement d\'adoption');
  } else if (input.isStillbirth) {
    documents.push('Certificat médical attestant de la durée de grossesse');
  } else {
    documents.push('Acte de naissance (document officiel de la commune)');
  }
  
  if (input.daysSinceBirth && input.daysSinceBirth > PRIME_NAISSANCE_CONSTANTS.NORMAL_DECLARATION_DAYS) {
    documents.push('Justification du retard de demande');
  }
  
  return documents;
}

/**
 * Check Prime de Naissance eligibility
 */
export async function checkPrimeNaissanceEligibility(
  input: PrimeNaissanceInput
): Promise<EligibilityCheck> {
  const facts = {
    region: input.region,
    childRank: input.childRank,
    daysSinceBirth: input.daysSinceBirth ?? -1,
    pregnancyMonths: input.pregnancyMonths ?? 0,
    hasValidResidencePermit: input.hasValidResidencePermit,
    isAdoption: input.isAdoption,
    isAdoptionRecognized: input.isAdoptionRecognized ?? false,
    isStillbirth: input.isStillbirth,
    stillbirthPregnancyDays: input.stillbirthPregnancyDays ?? 0,
    isMultipleBirth: input.isMultipleBirth,
    numberOfChildren: input.numberOfChildren ?? 1,
    hasJustificationForDelay: input.hasJustificationForDelay ?? false,
    isAnticipatedRequest: input.isAnticipatedRequest,
  };

  try {
    const results = await primeNaissanceEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'primeNaissance-ineligible');
    const eligibleLateEvent = results.events.find((e) => e.type === 'primeNaissance-eligible-late');
    const eligibleEvent = results.events.find((e) => e.type === 'primeNaissance-eligible');

    if (ineligibleEvent) {
      return {
        benefitType: 'prime-naissance' as any,
        isEligible: false,
        reason: ineligibleEvent.params?.reason as string,
      };
    }

    if (eligibleLateEvent || eligibleEvent) {
      const event = eligibleLateEvent || eligibleEvent;
      const calculatedAmount = calculatePrimeNaissanceAmount(
        input.region,
        input.childRank,
        input.isMultipleBirth,
        input.numberOfChildren
      );

      const additionalInfo: Record<string, any> = {
        region: input.region,
        competentAuthority: getCompetentAuthority(input.region),
        requiredDocuments: getRequiredDocuments(input),
        paymentDelay: `${PRIME_NAISSANCE_CONSTANTS.PAYMENT_DELAY_MONTHS} mois`,
      };

      if (eligibleLateEvent) {
        additionalInfo.requiresJustification = true;
        additionalInfo.message = 'Demande tardive - justification requise';
      }

      if (input.isMultipleBirth && input.numberOfChildren && input.numberOfChildren > 1) {
        additionalInfo.breakdown = calculateMultipleBirthBreakdown(
          input.region,
          input.childRank,
          input.numberOfChildren
        );
      }

      if (input.isAnticipatedRequest) {
        additionalInfo.paymentTiming = 'au 6ème mois de grossesse';
        additionalInfo.requiresMedicalCertificate = true;
      }

      if (input.isAdoption) {
        additionalInfo.requiresAdoptionJudgment = true;
      }

      if (input.region === 'flandre') {
        additionalInfo.system = 'Groeipakket';
      }

      return {
        benefitType: 'prime-naissance' as any,
        isEligible: true,
        calculatedAmount,
        additionalInfo,
      };
    }

    return {
      benefitType: 'prime-naissance' as any,
      isEligible: false,
      reason: 'conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Error checking Prime de Naissance eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const PRIME_NAISSANCE_RULES_JSON = {
  legalFramework: {
    bruxelles: {
      reference: 'Ordonnance du 25 avril 2019 réglant l\'octroi des prestations familiales',
      authority: 'Iriscare',
    },
    wallonie: {
      reference: 'Décret du 8 février 2018 relatif à la gestion et au paiement des prestations familiales',
      authority: 'AVIQ',
    },
    flandre: {
      reference: 'Groeipakketdecreet du 27 avril 2018',
      authority: 'Groeipakket',
      localName: 'Startbedrag',
    },
  },
  amounts2024: PRIME_NAISSANCE_AMOUNTS_2024,
  constants: PRIME_NAISSANCE_CONSTANTS,
  rules: [
    {
      id: 'residence-permit-required',
      description: 'Un titre de séjour valide en Belgique est requis',
      condition: 'hasValidResidencePermit === true',
      priority: 100,
    },
    {
      id: 'prescription-deadline',
      description: 'La demande doit être faite dans les 5 ans suivant la naissance',
      condition: 'daysSinceBirth <= 1825 (5 ans)',
      priority: 90,
    },
    {
      id: 'anticipated-request-timing',
      description: 'La demande anticipée est possible à partir du 6ème mois de grossesse',
      condition: 'pregnancyMonths >= 6',
      priority: 80,
    },
    {
      id: 'adoption-recognition',
      description: 'L\'adoption doit être officiellement reconnue',
      condition: 'isAdoptionRecognized === true',
      priority: 75,
    },
    {
      id: 'stillbirth-pregnancy-duration',
      description: 'Pour un enfant mort-né, la grossesse doit avoir duré au moins 180 jours',
      condition: 'stillbirthPregnancyDays >= 180',
      priority: 70,
    },
    {
      id: 'late-request-justification',
      description: 'Une demande après 90 jours nécessite une justification',
      condition: 'daysSinceBirth > 90 && daysSinceBirth <= 1825',
      requiresJustification: true,
      priority: 50,
    },
    {
      id: 'amount-calculation',
      description: 'Le montant dépend de la région et du rang de l\'enfant',
      calculation: {
        bruxelles: { premier: 1367.74, suivants: 621.70 },
        wallonie: { premier: 1100.0, suivants: 500.0 },
        flandre: { tous: 1269.25 },
      },
    },
    {
      id: 'multiple-birth',
      description: 'Pour une naissance multiple, chaque enfant reçoit sa prime selon son rang',
      example: 'Jumeaux premiers enfants à Bruxelles: 1367.74€ + 621.70€ = 1989.44€',
    },
    {
      id: 'cumul-other-benefits',
      description: 'La prime de naissance est cumulable avec d\'autres aides (RIS, etc.)',
      cumulative: true,
    },
  ],
  requiredDocuments: {
    standard: [
      'Acte de naissance',
      'Carte d\'identité des parents ou titre de séjour valide',
      'Preuve de domicile',
      'RIB ou numéro de compte',
      'Formulaire de demande complété et signé',
    ],
    anticipated: ['Attestation médicale de grossesse'],
    adoption: ['Jugement d\'adoption'],
    stillbirth: ['Certificat médical attestant de la durée de grossesse'],
    lateRequest: ['Justification du retard'],
  },
};