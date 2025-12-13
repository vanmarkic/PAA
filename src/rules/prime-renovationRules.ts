/**
 * Business Rules for Prime Rénovation
 *
 * Implements the Gherkin specifications from features/benefits/prime-renovation.feature
 * Using json-rules-engine for runtime evaluation.
 *
 * BASE JURIDIQUE:
 * - Arrêté du Gouvernement wallon du 4 avril 2019 instaurant un régime de primes pour la réalisation d'un audit,
 *   de travaux, d'investissements économiseurs d'énergie et de rénovation d'un logement
 * - Décret flamand du 18 novembre 2022 relatif à MijnVerbouwPremie
 * - Ordonnance bruxelloise du 2 mai 2013 portant le Code bruxellois de l'Air, du Climat et de la Maîtrise de l'Énergie
 * - Code des impôts sur les revenus 1992 (CIR 92) - Avantage fiscal fédéral
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';

/**
 * PrimeRenovation Rules Version Metadata
 * This version MUST match the specification version in features/benefits/prime-renovation.feature
 */
export const PRIME_RENOVATION_RULES_METADATA = {
  implementsSpecification: '0.0.0',
  implementationVersion: '0.0.0',
  implementationStatus: 'complete' as const,
  lastSyncedWith: 'features/benefits/prime-renovation.feature',
  generatedFrom: 'features/benefits/prime-renovation.feature@0.0.0',
  divergences: [] as string[],
  effectiveDate: '2025-01-01',
};

// Constants from Belgian social law - Prime Rénovation
export const WALLONIA_INCOME_THRESHOLDS = {
  R1: { max: 24700, interventionRate: 0.70, description: 'Revenus modestes' },
  R2: { min: 24700, max: 34700, interventionRate: 0.70, description: 'Revenus bas' },
  R3: { min: 34700, max: 44700, interventionRate: 0.50, description: 'Revenus moyens bas' },
  R4: { min: 44700, max: 97700, interventionRate: 0.50, description: 'Revenus moyens' },
  R5: { min: 97700, interventionRate: 0, description: 'Revenus élevés' },
};

export const FEDERAL_TAX_ADVANTAGE = {
  maxDeduction: 3900,
  deductionRate: 0.30,
  year: 2024,
};

export const AUDIT_SUBSIDY = {
  wallonia: {
    rate: 0.90,
    maxCost: 700,
    subsidyAmount: 630,
  },
};

export const PRIME_LIMITS = {
  wallonia: {
    maxTotalPrime: 25000,
    roofInsulationPerSqm: { min: 20, max: 120 },
    doubleFluxVentilation: { min: 680, max: 4080 },
    reductionRate2025: 0.60,
  },
};

export const REGIONS = {
  WALLONIE: 'Wallonie',
  BRUXELLES: 'Bruxelles-Capitale',
  FLANDRES: 'Flandres',
};

export const SYSTEM_STATUS = {
  WALLONIE: 'active',
  BRUXELLES: 'suspended',
  FLANDRES: 'active',
};

export type WalloniaCategory = 'R1' | 'R2' | 'R3' | 'R4' | 'R5';

export interface PrimeRenovationUser {
  region: string;
  annualIncome: number;
  isOwner: boolean;
  isTenant: boolean;
  hasOwnerAgreement?: boolean;
  propertyAgeYears: number;
  workType: string;
  workArea?: number;
  quoteCost: number;
  performanceLevel?: string;
  year: number;
}

/**
 * Determine Wallonia income category based on annual income
 */
export function getWalloniaCategory(annualIncome: number): WalloniaCategory {
  if (annualIncome < WALLONIA_INCOME_THRESHOLDS.R1.max) {
    return 'R1';
  } else if (annualIncome >= WALLONIA_INCOME_THRESHOLDS.R2.min && annualIncome < WALLONIA_INCOME_THRESHOLDS.R2.max) {
    return 'R2';
  } else if (annualIncome >= WALLONIA_INCOME_THRESHOLDS.R3.min && annualIncome < WALLONIA_INCOME_THRESHOLDS.R3.max) {
    return 'R3';
  } else if (annualIncome >= WALLONIA_INCOME_THRESHOLDS.R4.min && annualIncome < WALLONIA_INCOME_THRESHOLDS.R4.max) {
    return 'R4';
  } else {
    return 'R5';
  }
}

/**
 * Get intervention rate based on category
 */
export function getInterventionRate(category: WalloniaCategory): number {
  return WALLONIA_INCOME_THRESHOLDS[category].interventionRate;
}

/**
 * Create the PrimeRenovation eligibility rules engine
 * 
 * IMPLEMENTATION NOTES:
 * - Extract conditions from "Étant donné" steps in Gherkin scenarios
 * - Map conditions to json-rules-engine facts
 * - Extract events from "Quand" steps
 * - Extract outcomes from "Alors" steps
 * - Use priority to order rule evaluation (higher = checked first)
 */
function createPrimeRenovationEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Brussels region - system suspended in 2025
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: REGIONS.BRUXELLES,
        },
        {
          fact: 'year',
          operator: 'greaterThanInclusive',
          value: 2025,
        },
      ],
    },
    event: {
      type: 'primeRenovation-ineligible',
      params: {
        reason: 'Système Renolution suspendu en 2025 - Attente nouveau gouvernement',
        recommendation: 'Contacter Homegrade pour information. Les travaux 2024 restent éligibles via Irisbox.',
        priority: 100,
      },
    },
    priority: 100,
  });

  // Rule 2: Wallonia R5 category - not eligible
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: REGIONS.WALLONIE,
        },
        {
          fact: 'category',
          operator: 'equal',
          value: 'R5',
        },
      ],
    },
    event: {
      type: 'primeRenovation-ineligible',
      params: {
        reason: 'Catégorie R5 exclue du système depuis 2025',
        recommendation: 'Éligible uniquement à l\'avantage fiscal fédéral (maximum 3,900€)',
        federalTaxAdvantage: FEDERAL_TAX_ADVANTAGE.maxDeduction,
        priority: 90,
      },
    },
    priority: 90,
  });

  // Rule 3: Must be owner or tenant with owner agreement
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isOwner',
          operator: 'equal',
          value: false,
        },
        {
          any: [
            {
              fact: 'isTenant',
              operator: 'equal',
              value: false,
            },
            {
              fact: 'hasOwnerAgreement',
              operator: 'equal',
              value: false,
            },
          ],
        },
      ],
    },
    event: {
      type: 'primeRenovation-ineligible',
      params: {
        reason: 'Doit être propriétaire ou locataire avec accord écrit du propriétaire',
        priority: 80,
      },
    },
    priority: 80,
  });

  // Rule 4: Wallonia - Property must be at least 15 years old for certain works
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: REGIONS.WALLONIE,
        },
        {
          fact: 'propertyAgeYears',
          operator: 'lessThan',
          value: 15,
        },
        {
          fact: 'workType',
          operator: 'in',
          value: ['isolation_toiture', 'renovation_globale', 'isolation_murs'],
        },
      ],
    },
    event: {
      type: 'primeRenovation-ineligible',
      params: {
        reason: 'Le logement doit avoir plus de 15 ans pour ces travaux',
        priority: 70,
      },
    },
    priority: 70,
  });

  // Rule 5: Wallonia R1 owner - roof insulation eligible
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: REGIONS.WALLONIE,
        },
        {
          fact: 'category',
          operator: 'equal',
          value: 'R1',
        },
        {
          fact: 'isOwner',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'workType',
          operator: 'equal',
          value: 'isolation_toiture',
        },
        {
          fact: 'propertyAgeYears',
          operator: 'greaterThanInclusive',
          value: 15,
        },
      ],
    },
    event: {
      type: 'primeRenovation-eligible',
      params: {
        category: 'R1',
        interventionRate: 0.70,
        baseRatePerSqm: '20-120€/m² selon performance',
        auditRequired: false,
        message: 'Éligible - Prime isolation toiture catégorie R1',
        priority: 50,
      },
    },
    priority: 50,
  });

  // Rule 6: Wallonia R2 tenant with owner agreement - ventilation
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: REGIONS.WALLONIE,
        },
        {
          fact: 'category',
          operator: 'equal',
          value: 'R2',
        },
        {
          fact: 'isTenant',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasOwnerAgreement',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'workType',
          operator: 'equal',
          value: 'ventilation_double_flux',
        },
      ],
    },
    event: {
      type: 'primeRenovation-eligible',
      params: {
        category: 'R2',
        interventionRate: 0.70,
        basePrimeRange: '680-4,080€ pour double flux',
        rentMaintenance: '5 ans',
        message: 'Éligible - Prime ventilation double flux catégorie R2 (locataire)',
        priority: 50,
      },
    },
    priority: 50,
  });

  // Rule 7: Wallonia R3 owner - global renovation
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: REGIONS.WALLONIE,
        },
        {
          fact: 'category',
          operator: 'equal',
          value: 'R3',
        },
        {
          fact: 'isOwner',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'workType',
          operator: 'equal',
          value: 'renovation_globale',
        },
      ],
    },
    event: {
      type: 'primeRenovation-eligible',
      params: {
        category: 'R3',
        interventionRate: 0.50,
        auditRequired: true,
        auditSubsidy: 630,
        maxTotalPrime: 25000,
        message: 'Éligible - Rénovation globale catégorie R3 (audit obligatoire)',
        priority: 50,
      },
    },
    priority: 50,
  });

  // Rule 8: Wallonia R2 owner - heat pump
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: REGIONS.WALLONIE,
        },
        {
          fact: 'category',
          operator: 'equal',
          value: 'R2',
        },
        {
          fact: 'isOwner',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'workType',
          operator: 'equal',
          value: 'pompe_chaleur',
        },
      ],
    },
    event: {
      type: 'primeRenovation-eligible',
      params: {
        category: 'R2',
        interventionRate: 0.70,
        reductionRate2025: 0.60,
        energySavings: '50-70%',
        auditRecommended: true,
        message: 'Éligible - Prime pompe à chaleur catégorie R2 (montants réduits de 60% en 2025)',
        priority: 50,
      },
    },
    priority: 50,
  });

  // Rule 9: Wallonia R4 owner - eligible with 50% rate
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: REGIONS.WALLONIE,
        },
        {
          fact: 'category',
          operator: 'equal',
          value: 'R4',
        },
        {
          fact: 'isOwner',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'primeRenovation-eligible',
      params: {
        category: 'R4',
        interventionRate: 0.50,
        federalTaxAdvantage: true,
        message: 'Éligible - Catégorie R4 avec taux intervention 50%',
        priority: 40,
      },
    },
    priority: 40,
  });

  // Rule 10: Flanders - MijnVerbouwPremie eligible
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: REGIONS.FLANDRES,
        },
        {
          fact: 'isOwner',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'primeRenovation-eligible',
      params: {
        system: 'MijnVerbouwPremie',
        calculationMethod: 'per m² selon catégorie de revenus',
        applicationMethod: 'en ligne',
        processingTime: '3-4 mois',
        message: 'Éligible - MijnVerbouwPremie Flandres',
        priority: 45,
      },
    },
    priority: 45,
  });

  // Rule 11: Wallonia R2 - window frames
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: REGIONS.WALLONIE,
        },
        {
          fact: 'category',
          operator: 'equal',
          value: 'R2',
        },
        {
          fact: 'isOwner',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'workType',
          operator: 'equal',
          value: 'chassis_vitrages',
        },
      ],
    },
    event: {
      type: 'primeRenovation-eligible',
      params: {
        category: 'R2',
        interventionRate: 0.70,
        performanceRequirement: 'Uw ≤ 1.5 W/m²K',
        note: 'Prime fortement réduite en 2025',
        contractorRequirement: 'entrepreneur agréé obligatoire',
        message: 'Éligible - Prime châssis catégorie R2',
        priority: 50,
      },
    },
    priority: 50,
  });

  return engine;
}

/**
 * Singleton instance of the PrimeRenovation rules engine
 */
const primeRenovationEngineInstance = createPrimeRenovationEngine();

/**
 * Calculate Prime Rénovation amount
 */
export function calculatePrimeRenovationAmount(
  region: string,
  category: WalloniaCategory | null,
  quoteCost: number,
  workType: string,
  workArea?: number,
  year: number = 2025
): number {
  // Brussels suspended in 2025
  if (region === REGIONS.BRUXELLES && year >= 2025) {
    return 0;
  }

  // Wallonia R5 not eligible
  if (region === REGIONS.WALLONIE && category === 'R5') {
    return 0;
  }

  // Wallonia calculations
  if (region === REGIONS.WALLONIE && category) {
    const interventionRate = getInterventionRate(category);
    
    if (interventionRate === 0) {
      return 0;
    }

    let basePrime = quoteCost * interventionRate;

    // Apply 2025 reduction for certain work types
    if (year >= 2025 && ['pompe_chaleur', 'chassis_vitrages'].includes(workType)) {
      basePrime = basePrime * (1 - PRIME_LIMITS.wallonia.reductionRate2025);
    }

    // Specific calculations per work type
    switch (workType) {
      case 'isolation_toiture':
        // Max 70% of cost for R1/R2, 50% for R3/R4
        const maxRoofPrime = quoteCost * interventionRate;
        return Math.min(basePrime, maxRoofPrime, PRIME_LIMITS.wallonia.maxTotalPrime);

      case 'ventilation_double_flux':
        // Base 680-4080€, with coefficient
        const ventilationBase = Math.min(quoteCost, PRIME_LIMITS.wallonia.doubleFluxVentilation.max);
        return Math.round(ventilationBase * interventionRate);

      case 'renovation_globale':
        // Max 25000€ total, 50% for R3
        return Math.min(basePrime, PRIME_LIMITS.wallonia.maxTotalPrime);

      case 'pompe_chaleur':
        // Reduced by 60% in 2025, but still significant with R2 coefficient
        return Math.round(basePrime);

      case 'chassis_vitrages':
        // Strongly reduced in 2025
        return Math.round(basePrime);

      case 'isolation_murs':
        // Per m² calculation if area provided
        if (workArea) {
          const perSqmBase = quoteCost / workArea;
          return Math.round(workArea * perSqmBase * interventionRate);
        }
        return Math.round(basePrime);

      default:
        return Math.round(basePrime);
    }
  }

  // Flanders calculations - variable rates based on income
  if (region === REGIONS.FLANDRES) {
    // Simplified calculation - actual rates depend on income category
    const baseRate = 0.40; // Average estimate
    return Math.round(quoteCost * baseRate);
  }

  return 0;
}

/**
 * Calculate federal tax advantage for roof insulation (Wallonia only)
 */
export function calculateFederalTaxAdvantage(
  region: string,
  workType: string,
  invoiceCost: number,
  year: number = 2024
): number {
  // Only available in Wallonia for roof insulation
  if (region !== REGIONS.WALLONIE || workType !== 'isolation_toiture') {
    return 0;
  }

  const deduction = invoiceCost * FEDERAL_TAX_ADVANTAGE.deductionRate;
  return Math.min(deduction, FEDERAL_TAX_ADVANTAGE.maxDeduction);
}

/**
 * Check Prime Rénovation eligibility
 */
export async function checkPrimeRenovationEligibility(
  user: PrimeRenovationUser
): Promise<EligibilityCheck> {
  const category = user.region === REGIONS.WALLONIE ? getWalloniaCategory(user.annualIncome) : null;

  const facts = {
    region: user.region,
    annualIncome: user.annualIncome,
    category: category,
    isOwner: user.isOwner,
    isTenant: user.isTenant,
    hasOwnerAgreement: user.hasOwnerAgreement || false,
    propertyAgeYears: user.propertyAgeYears,
    workType: user.workType,
    workArea: user.workArea,
    quoteCost: user.quoteCost,
    performanceLevel: user.performanceLevel,
    year: user.year,
  };

  try {
    const results = await primeRenovationEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'primeRenovation-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'primeRenovation-eligible');

    if (ineligibleEvent) {
      return {
        benefitType: 'prime-renovation' as any,
        isEligible: false,
        reason: ineligibleEvent.params?.reason as string,
        notes: ineligibleEvent.params?.recommendation ? [ineligibleEvent.params.recommendation as string] : undefined,
      };
    }

    if (eligibleEvent) {
      const calculatedAmount = calculatePrimeRenovationAmount(
        user.region,
        category,
        user.quoteCost,
        user.workType,
        user.workArea,
        user.year
      );

      const federalTaxAdvantage = calculateFederalTaxAdvantage(
        user.region,
        user.workType,
        user.quoteCost,
        user.year
      );

      const notes: string[] = [];
      if (eligibleEvent.params?.message) notes.push(eligibleEvent.params.message as string);
      if (eligibleEvent.params?.system) notes.push(`Système: ${eligibleEvent.params.system}`);
      if (eligibleEvent.params?.processingTime) notes.push(`Délai: ${eligibleEvent.params.processingTime}`);
      if (federalTaxAdvantage > 0) notes.push(`Avantage fiscal fédéral: ${federalTaxAdvantage}€`);

      return {
        benefitType: 'prime-renovation' as any,
        isEligible: true,
        calculatedAmount: calculatedAmount,
        category: eligibleEvent.params?.category as string,
        notes: notes.length > 0 ? notes : undefined,
      };
    }

    return {
      benefitType: 'prime-renovation' as any,
      isEligible: false,
      reason: 'Conditions non remplies pour les primes rénovation',
    };
  } catch (error) {
    throw new Error(`Error checking Prime Rénovation eligibility: ${error}`);
  }
}

/**
 * Get required documents for prime application
 */
export function getRequiredDocuments(): string[] {
  return [
    'Titre de propriété',
    'Avertissement-extrait de rôle',
    'Devis détaillés',
    'Photos avant/après',
    'Factures finales',
    'Attestation entrepreneur agréé',
  ];
}

/**
 * Get post-work obligations
 */
export function getPostWorkObligations(): Array<{ obligation: string; duration: string; sanction: string }> {
  return [
    { obligation: 'Maintenir la destination du bien', duration: '5 ans', sanction: 'Remboursement prime' },
    { obligation: 'Ne pas vendre (sauf exceptions)', duration: '5 ans', sanction: 'Remboursement proportionnel' },
    { obligation: 'Permettre les contrôles', duration: 'Permanent', sanction: 'Suspension/remboursement' },
    { obligation: 'Conserver les factures', duration: '10 ans', sanction: 'Problème si contrôle fiscal' },
    { obligation: 'Respecter performances promises', duration: 'Permanent', sanction: 'Remboursement si fraude' },
  ];
}

/**
 * Export rules in JSON format for transparency
 */
export const PRIME_RENOVATION_RULES_JSON = {
  legalFramework: {
    wallonia: {
      name: 'Prime Habitation',
      validUntil: '30/09/2026',
      majorChange: 'Réduction 60% des montants',
      legalBasis: 'Arrêté du Gouvernement wallon du 4 avril 2019',
    },
    brussels: {
      name: 'Renolution',
      status: 'Suspendu 2025',
      majorChange: 'Attente nouveau gouvernement',
      legalBasis: 'Ordonnance bruxelloise du 2 mai 2013',
    },
    flanders: {
      name: 'MijnVerbouwPremie',
      status: 'En vigueur 2025',
      majorChange: 'Fusion primes énergie + rénovation',
      legalBasis: 'Décret flamand du 18 novembre 2022',
    },
    federal: {
      name: 'Avantage fiscal isolation toiture',
      maxDeduction: 3900,
      year: 2024,
      legalBasis: 'CIR 92',
    },
  },
  incomeCategories: {
    R1: { maxIncome: 24700, interventionRate: 0.70, description: 'Revenus modestes' },
    R2: { minIncome: 24700, maxIncome: 34700, interventionRate: 0.70, description: 'Revenus bas' },
    R3: { minIncome: 34700, maxIncome: 44700, interventionRate: 0.50, description: 'Revenus moyens bas' },
    R4: { minIncome: 44700, maxIncome: 97700, interventionRate: 0.50, description: 'Revenus moyens' },
    R5: { minIncome: 97700, interventionRate: 0, description: 'Revenus élevés - Non éligible' },
  },
  rules: [
    {
      id: 'brussels-suspended-2025',
      description: 'Système Renolution suspendu à Bruxelles en 2025',
      conditions: ['region === Bruxelles-Capitale', 'year >= 2025'],
      result: 'ineligible',
      reason: 'Attente nouveau gouvernement',
    },
    {
      id: 'wallonia-r5-excluded',
      description: 'Catégorie R5 exclue en Wallonie depuis 2025',
      conditions: ['region === Wallonie', 'income > 97700€'],
      result: 'ineligible',
      alternative: 'Avantage fiscal fédéral uniquement (max 3900€)',
    },
    {
      id: 'owner-or-tenant-with-agreement',
      description: 'Doit être propriétaire ou locataire avec accord',
      conditions: ['isOwner === true OR (isTenant === true AND hasOwnerAgreement === true)'],
      result: 'prerequisite',
    },
    {
      id: 'wallonia-property-age',
      description: 'Logement de plus de 15 ans en Wallonie',
      conditions: ['region === Wallonie', 'propertyAge >= 15 ans'],
      applicableTo: ['isolation_toiture', 'renovation_globale', 'isolation_murs'],
      result: 'prerequisite',
    },
    {
      id: 'wallonia-r1-roof-insulation',
      description: 'Prime isolation toiture R1 Wallonie',
      conditions: ['region === Wallonie', 'category === R1', 'workType === isolation_toiture'],
      result: 'eligible',
      interventionRate: 0.70,
      auditRequired: false,
    },
    {
      id: 'wallonia-r2-ventilation',
      description: 'Prime ventilation double flux R2 Wallonie',
      conditions: ['region === Wallonie', 'category === R2', 'workType === ventilation_double_flux'],
      result: 'eligible',
      interventionRate: 0.70,
      basePrime: '680-4080€',
    },
    {
      id: 'wallonia-r3-global-renovation',
      description: 'Rénovation globale R3 Wallonie',
      conditions: ['region === Wallonie', 'category === R3', 'workType === renovation_globale'],
      result: 'eligible',
      interventionRate: 0.50,
      auditRequired: true,
      auditSubsidy: 630,
      maxPrime: 25000,
    },
    {
      id: 'wallonia-r2-heat-pump',
      description: 'Prime pompe à chaleur R2 Wallonie',
      conditions: ['region === Wallonie', 'category === R2', 'workType === pompe_chaleur'],
      result: 'eligible',
      interventionRate: 0.70,
      reduction2025: 0.60,
    },
    {
      id: 'flanders-mijnverbouwpremie',
      description: 'MijnVerbouwPremie Flandres',
      conditions: ['region === Flandres', 'isOwner === true'],
      result: 'eligible',
      calculationMethod: 'per m² selon catégorie revenus',
      processingTime: '3-4 mois',
    },
  ],
  procedures: {
    wallonia: {
      auditRequired: 'Obligatoire sauf toiture',
      applicationTiming: 'Avant travaux',
      processingTime: '3-4 mois',
      paymentTiming: 'Après travaux',
      maxWorkDelay: '2 ans',
    },
    flanders: {
      auditRequired: 'Recommandé',
      applicationTiming: 'Avant ou après travaux',
      processingTime: '2-3 mois',
      paymentTiming: 'Après travaux et audit',
      maxWorkDelay: '2 ans',
    },
  },
};