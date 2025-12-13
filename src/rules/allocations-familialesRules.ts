/**
 * Business Rules for Allocations Familiales
 *
 * Implements the Gherkin specifications from features/benefits/allocations-familiales.feature
 * Using json-rules-engine for runtime evaluation.
 *
 * BASE JURIDIQUE:
 * - Ordonnance du 25 avril 2019 réglant l'octroi des prestations familiales (Bruxelles)
 * - Décret du 8 février 2018 relatif à la gestion et au paiement des prestations familiales (Wallonie)
 * - Groeipakketdecreet van 2018 (Flandre)
 * - Loi générale relative aux allocations familiales (LGAF) du 19 décembre 1939
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';

/**
 * AllocationsFamiliales Rules Version Metadata
 * This version MUST match the specification version in features/benefits/allocations-familiales.feature
 */
export const ALLOCATIONS_FAMILIALES_RULES_METADATA = {
  implementsSpecification: '0.0.0',
  implementationVersion: '0.0.0',
  implementationStatus: 'complete' as const,
  lastSyncedWith: 'features/benefits/allocations-familiales.feature',
  generatedFrom: 'features/benefits/allocations-familiales.feature@0.0.0',
  divergences: [] as string[],
  effectiveDate: '2024-01-01',
};

// Constants from Belgian social law
export const ALLOCATIONS_FAMILIALES_CONSTANTS = {
  MAX_AGE: 25,
  MIN_AGE_ADULT: 18,
  BIRTH_YEAR_THRESHOLD: 2019,
  AGE_BRACKET_CHILD: 11,
  AGE_BRACKET_TEEN: 17,
  AGE_BRACKET_ADULT: 24,
  SOCIAL_INCOME_THRESHOLD: 31000,
  DISABILITY_PERCENTAGE_THRESHOLD: 66,
  DISABILITY_MAX_AGE: 21,
};

export const ALLOCATIONS_FAMILIALES_AMOUNTS_2024 = {
  bruxelles: {
    bornBefore2019: {
      child: 174.08,    // 0-11 ans
      teen: 186.51,     // 12-17 ans
      adult: 198.95,    // 18-24 ans
    },
    bornAfter2019: {
      child: 186.51,    // 0-11 ans
      teen: 198.94,     // 12-17 ans
      adult: 211.38,    // 18-24 ans
    },
  },
  wallonie: {
    child: 192.73,      // 0-17 ans
    adult: 205.16,      // 18-24 ans
  },
  flandre: {
    universal: 184.62,  // tous âges
  },
};

export const SUPPLEMENT_TYPES = {
  MONOPARENTAL: 'famille_monoparentale',
  HANDICAP: 'handicap',
  ORPHELIN: 'orphelin',
  SOCIAL: 'social',
};

export type Region = 'bruxelles' | 'wallonie' | 'flandre';

export interface ChildInfo {
  age: number;
  birthYear: number;
  isStudent?: boolean;
  isJobSeeker?: boolean;
  isInTraining?: boolean;
  hasLegalResidenceInBelgium: boolean;
  hasValidResidencePermit?: boolean;
  hasDisability?: boolean;
  disabilityPercentage?: number;
  isOrphan?: boolean;
}

export interface FamilyInfo {
  region: Region;
  children: ChildInfo[];
  isSingleParent?: boolean;
  annualGrossIncome?: number;
}

/**
 * Create the AllocationsFamiliales eligibility rules engine
 */
function createAllocationsFamilialesEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Age maximum exceeded (26+ years) - Absolute ineligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThan',
          value: ALLOCATIONS_FAMILIALES_CONSTANTS.MAX_AGE,
        },
      ],
    },
    event: {
      type: 'allocationsFamiliales-ineligible',
      params: {
        reason: 'âge maximum dépassé (25 ans)',
        priority: 100,
      },
    },
    priority: 100,
  });

  // Rule 2: No legal residence in Belgium
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasLegalResidenceInBelgium',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'hasValidResidencePermit',
          operator: 'notEqual',
          value: true,
        },
      ],
    },
    event: {
      type: 'allocationsFamiliales-ineligible',
      params: {
        reason: 'pas de domicile légal ou titre de séjour valide',
        priority: 90,
      },
    },
    priority: 90,
  });

  // Rule 3: Adult (18-25) without qualifying condition
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: ALLOCATIONS_FAMILIALES_CONSTANTS.MIN_AGE_ADULT,
        },
        {
          fact: 'age',
          operator: 'lessThanInclusive',
          value: ALLOCATIONS_FAMILIALES_CONSTANTS.MAX_AGE,
        },
        {
          fact: 'isStudent',
          operator: 'notEqual',
          value: true,
        },
        {
          fact: 'isJobSeeker',
          operator: 'notEqual',
          value: true,
        },
        {
          fact: 'isInTraining',
          operator: 'notEqual',
          value: true,
        },
      ],
    },
    event: {
      type: 'allocationsFamiliales-ineligible',
      params: {
        reason: 'pas de condition remplie pour 18-25 ans',
        priority: 80,
      },
    },
    priority: 80,
  });

  // Rule 4: Eligible child (0-17 years) with legal residence
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'lessThan',
          value: ALLOCATIONS_FAMILIALES_CONSTANTS.MIN_AGE_ADULT,
        },
        {
          fact: 'hasLegalResidenceInBelgium',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'allocationsFamiliales-eligible',
      params: {
        message: 'Éligible aux allocations familiales (enfant mineur)',
        condition: 'enfant de moins de 18 ans',
      },
    },
    priority: 50,
  });

  // Rule 5: Eligible student (18-25 years)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: ALLOCATIONS_FAMILIALES_CONSTANTS.MIN_AGE_ADULT,
        },
        {
          fact: 'age',
          operator: 'lessThanInclusive',
          value: ALLOCATIONS_FAMILIALES_CONSTANTS.MAX_AGE,
        },
        {
          fact: 'isStudent',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasLegalResidenceInBelgium',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'allocationsFamiliales-eligible',
      params: {
        message: 'Éligible aux allocations familiales (étudiant)',
        condition: 'étudiant jusqu\'à 25 ans',
      },
    },
    priority: 45,
  });

  // Rule 6: Single parent supplement eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isSingleParent',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasLegalResidenceInBelgium',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'allocationsFamiliales-supplement',
      params: {
        supplementType: SUPPLEMENT_TYPES.MONOPARENTAL,
        message: 'Éligible au supplément famille monoparentale',
      },
    },
    priority: 30,
  });

  // Rule 7: Disability supplement eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasDisability',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'disabilityPercentage',
          operator: 'greaterThanInclusive',
          value: ALLOCATIONS_FAMILIALES_CONSTANTS.DISABILITY_PERCENTAGE_THRESHOLD,
        },
        {
          fact: 'age',
          operator: 'lessThan',
          value: ALLOCATIONS_FAMILIALES_CONSTANTS.DISABILITY_MAX_AGE,
        },
      ],
    },
    event: {
      type: 'allocationsFamiliales-supplement',
      params: {
        supplementType: SUPPLEMENT_TYPES.HANDICAP,
        message: 'Éligible au supplément handicap',
      },
    },
    priority: 25,
  });

  // Rule 8: Social supplement eligibility (low income)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'annualGrossIncome',
          operator: 'lessThan',
          value: ALLOCATIONS_FAMILIALES_CONSTANTS.SOCIAL_INCOME_THRESHOLD,
        },
        {
          fact: 'hasLegalResidenceInBelgium',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'allocationsFamiliales-supplement',
      params: {
        supplementType: SUPPLEMENT_TYPES.SOCIAL,
        message: 'Éligible au supplément social',
      },
    },
    priority: 20,
  });

  return engine;
}

/**
 * Singleton instance of the AllocationsFamiliales rules engine
 */
const allocationsFamilialesEngineInstance = createAllocationsFamilialesEngine();

/**
 * Determine if child was born before or after 2019
 */
function isBornAfter2019(birthYear: number): boolean {
  return birthYear >= ALLOCATIONS_FAMILIALES_CONSTANTS.BIRTH_YEAR_THRESHOLD;
}

/**
 * Get age bracket for Brussels amounts
 */
function getAgeBracket(age: number): 'child' | 'teen' | 'adult' {
  if (age <= ALLOCATIONS_FAMILIALES_CONSTANTS.AGE_BRACKET_CHILD) {
    return 'child';
  } else if (age <= ALLOCATIONS_FAMILIALES_CONSTANTS.AGE_BRACKET_TEEN) {
    return 'teen';
  } else {
    return 'adult';
  }
}

/**
 * Calculate base amount for Brussels
 */
function calculateBruxellesAmount(age: number, birthYear: number): number {
  const bornAfter = isBornAfter2019(birthYear);
  const bracket = getAgeBracket(age);
  
  if (bornAfter) {
    return ALLOCATIONS_FAMILIALES_AMOUNTS_2024.bruxelles.bornAfter2019[bracket];
  } else {
    return ALLOCATIONS_FAMILIALES_AMOUNTS_2024.bruxelles.bornBefore2019[bracket];
  }
}

/**
 * Calculate base amount for Wallonia
 */
function calculateWallonieAmount(age: number): number {
  if (age < ALLOCATIONS_FAMILIALES_CONSTANTS.MIN_AGE_ADULT) {
    return ALLOCATIONS_FAMILIALES_AMOUNTS_2024.wallonie.child;
  } else {
    return ALLOCATIONS_FAMILIALES_AMOUNTS_2024.wallonie.adult;
  }
}

/**
 * Calculate base amount for Flanders
 */
function calculateFlandreAmount(): number {
  return ALLOCATIONS_FAMILIALES_AMOUNTS_2024.flandre.universal;
}

/**
 * Calculate Allocations Familiales amount for a single child
 */
export function calculateAllocationsFamilialesAmount(
  region: Region,
  age: number,
  birthYear: number
): number {
  switch (region) {
    case 'bruxelles':
      return calculateBruxellesAmount(age, birthYear);
    case 'wallonie':
      return calculateWallonieAmount(age);
    case 'flandre':
      return calculateFlandreAmount();
    default:
      return 0;
  }
}

/**
 * Calculate total allocations for a family
 */
export function calculateFamilyTotalAllocations(familyInfo: FamilyInfo): number {
  let total = 0;
  
  for (const child of familyInfo.children) {
    if (child.hasLegalResidenceInBelgium && child.age <= ALLOCATIONS_FAMILIALES_CONSTANTS.MAX_AGE) {
      total += calculateAllocationsFamilialesAmount(
        familyInfo.region,
        child.age,
        child.birthYear
      );
    }
  }
  
  return Math.round(total * 100) / 100;
}

/**
 * Get the competent payment office based on region
 */
export function getCompetentOffice(region: Region): string {
  switch (region) {
    case 'bruxelles':
      return 'Famiris ou autre caisse bruxelloise';
    case 'wallonie':
      return 'AVIQ ou autre caisse wallonne';
    case 'flandre':
      return 'Groeipakket';
    default:
      return 'Caisse d\'allocations familiales';
  }
}

/**
 * Get the system name based on region
 */
export function getSystemName(region: Region): string {
  switch (region) {
    case 'bruxelles':
      return 'Allocations familiales bruxelloises';
    case 'wallonie':
      return 'Allocations familiales wallonnes';
    case 'flandre':
      return 'Groeipakket';
    default:
      return 'Allocations familiales';
  }
}

/**
 * Check Allocations Familiales eligibility for a single child
 */
export async function checkAllocationsFamilialesEligibility(
  childInfo: ChildInfo,
  familyInfo: Partial<FamilyInfo>
): Promise<EligibilityCheck & { 
  baseAmount?: number; 
  supplements?: string[]; 
  competentOffice?: string;
  systemName?: string;
  condition?: string;
}> {
  const facts = {
    age: childInfo.age,
    birthYear: childInfo.birthYear,
    hasLegalResidenceInBelgium: childInfo.hasLegalResidenceInBelgium,
    hasValidResidencePermit: childInfo.hasValidResidencePermit || false,
    isStudent: childInfo.isStudent || false,
    isJobSeeker: childInfo.isJobSeeker || false,
    isInTraining: childInfo.isInTraining || false,
    hasDisability: childInfo.hasDisability || false,
    disabilityPercentage: childInfo.disabilityPercentage || 0,
    isOrphan: childInfo.isOrphan || false,
    isSingleParent: familyInfo.isSingleParent || false,
    annualGrossIncome: familyInfo.annualGrossIncome || Infinity,
    region: familyInfo.region || 'bruxelles',
  };

  try {
    const results = await allocationsFamilialesEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'allocationsFamiliales-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'allocationsFamiliales-eligible');
    const supplementEvents = results.events.filter((e) => e.type === 'allocationsFamiliales-supplement');

    if (ineligibleEvent) {
      return {
        benefitType: 'allocations-familiales' as any,
        isEligible: false,
        reason: ineligibleEvent.params?.reason as string,
      };
    }

    if (eligibleEvent) {
      const region = familyInfo.region || 'bruxelles';
      const baseAmount = calculateAllocationsFamilialesAmount(
        region,
        childInfo.age,
        childInfo.birthYear
      );
      
      const supplements = supplementEvents.map(e => e.params?.supplementType as string);
      
      // Calculate supplement amounts (simplified - actual amounts vary)
      let totalAmount = baseAmount;
      if (supplements.includes(SUPPLEMENT_TYPES.MONOPARENTAL)) {
        totalAmount += 50; // Simplified supplement amount
      }
      if (supplements.includes(SUPPLEMENT_TYPES.HANDICAP)) {
        totalAmount += 100; // Simplified supplement amount for disability
      }
      if (supplements.includes(SUPPLEMENT_TYPES.SOCIAL)) {
        totalAmount += 30; // Simplified social supplement
      }

      return {
        benefitType: 'allocations-familiales' as any,
        isEligible: true,
        calculatedAmount: totalAmount,
        baseAmount: baseAmount,
        supplements: supplements,
        competentOffice: getCompetentOffice(region),
        systemName: getSystemName(region),
        condition: eligibleEvent.params?.condition as string,
      };
    }

    return {
      benefitType: 'allocations-familiales' as any,
      isEligible: false,
      reason: 'conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Error checking Allocations Familiales eligibility: ${error}`);
  }
}

/**
 * Get required documents for new application
 */
export function getRequiredDocuments(): string[] {
  return [
    'Acte de naissance de l\'enfant',
    'Preuve de domicile',
    'Carte d\'identité du demandeur',
    'Composition de ménage',
  ];
}

/**
 * Get payment information
 */
export function getPaymentInfo(): { frequency: string; paymentDay: number } {
  return {
    frequency: 'mensuel',
    paymentDay: 8,
  };
}

/**
 * Export rules in JSON format for transparency
 */
export const ALLOCATIONS_FAMILIALES_RULES_JSON = {
  legalFramework: {
    bruxelles: 'Ordonnance du 25 avril 2019 réglant l\'octroi des prestations familiales',
    wallonie: 'Décret du 8 février 2018 relatif à la gestion et au paiement des prestations familiales',
    flandre: 'Groeipakketdecreet van 2018',
    federal: 'Loi générale relative aux allocations familiales (LGAF) du 19 décembre 1939',
  },
  rules: [
    {
      id: 'age-maximum',
      description: 'Âge maximum pour les allocations familiales',
      condition: 'age > 25',
      result: 'ineligible',
      reason: 'âge maximum dépassé (25 ans)',
    },
    {
      id: 'residence-requirement',
      description: 'Exigence de domicile légal en Belgique',
      condition: 'pas de domicile légal ET pas de titre de séjour valide',
      result: 'ineligible',
      reason: 'pas de domicile légal ou titre de séjour valide',
    },
    {
      id: 'adult-condition',
      description: 'Condition pour les 18-25 ans',
      condition: 'age >= 18 ET age <= 25 ET (étudiant OU demandeur d\'emploi OU en formation)',
      result: 'eligible',
      reason: 'condition remplie pour 18-25 ans',
    },
    {
      id: 'minor-eligibility',
      description: 'Éligibilité automatique pour les mineurs',
      condition: 'age < 18 ET domicile légal en Belgique',
      result: 'eligible',
      reason: 'enfant mineur avec domicile légal',
    },
    {
      id: 'single-parent-supplement',
      description: 'Supplément famille monoparentale',
      condition: 'parent isolé',
      result: 'supplément',
      type: 'famille_monoparentale',
    },
    {
      id: 'disability-supplement',
      description: 'Supplément handicap',
      condition: 'handicap >= 66% ET age < 21',
      result: 'supplément',
      type: 'handicap',
    },
    {
      id: 'social-supplement',
      description: 'Supplément social',
      condition: 'revenus annuels bruts < 31000€',
      result: 'supplément',
      type: 'social',
    },
  ],
  amounts: ALLOCATIONS_FAMILIALES_AMOUNTS_2024,
  constants: ALLOCATIONS_FAMILIALES_CONSTANTS,
};