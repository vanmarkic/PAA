/**
 * Business Rules for Tarif Social Énergie
 *
 * Implements the Gherkin specifications from features/benefits/tarif-social-energie.feature
 * Using json-rules-engine for runtime evaluation.
 *
 * BASE JURIDIQUE:
 * - Loi du 29 avril 1999 relative à l'organisation du marché de l'électricité
 * - Loi du 12 avril 1965 relative au transport de produits gazeux
 * - Arrêté royal du 29 mars 2012 fixant les règles de détermination du coût de l'application
 *   des tarifs sociaux par les entreprises d'électricité et les règles d'intervention
 * - Réglementation CREG (Commission de Régulation de l'Électricité et du Gaz)
 * - Arrêté ministériel du 30 mars 2007 portant fixation de prix maximaux sociaux
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';

/**
 * TarifSocialEnergie Rules Version Metadata
 * This version MUST match the specification version in features/benefits/tarif-social-energie.feature
 */
export const TARIF_SOCIAL_ENERGIE_RULES_METADATA = {
  implementsSpecification: '0.0.0',
  implementationVersion: '0.0.0',
  implementationStatus: 'complete' as const,
  lastSyncedWith: 'features/benefits/tarif-social-energie.feature',
  generatedFrom: 'features/benefits/tarif-social-energie.feature@0.0.0',
  divergences: [] as string[],
  effectiveDate: '2024-11-01',
};

// Constants from Belgian social law - November 2024 rates
export const TARIF_SOCIAL_ENERGIE_CONSTANTS = {
  // Tarifs sociaux novembre 2024 (en cents par kWh)
  ELECTRICITY_SIMPLE_RATE: 22.773, // cents/kWh
  ELECTRICITY_BIHORAIRE_DAY_RATE: 24.5, // cents/kWh (approximation)
  ELECTRICITY_BIHORAIRE_NIGHT_RATE: 18.5, // cents/kWh (approximation)
  GAS_RATE: 4.745, // cents/kWh
  
  // Tarifs commerciaux moyens pour comparaison (approximation)
  COMMERCIAL_ELECTRICITY_RATE: 45.0, // cents/kWh
  COMMERCIAL_GAS_RATE: 9.5, // cents/kWh
  
  // Dates importantes
  BIM_REMOVAL_DATE: '2023-07-01',
  COLLECTIVE_HEATING_PREMIUM_DATE: '2024-09-01',
  
  // Délais
  APPLICATION_DELAY_DAYS: 10,
  ATTESTATION_VALIDITY_MONTHS: 12,
  
  // Pourcentages d'économie
  ESTIMATED_SAVINGS_PERCENT_MIN: 40,
  ESTIMATED_SAVINGS_PERCENT_MAX: 50,
};

// Catégories de bénéficiaires
export type BeneficiaryCategory = 
  | 'ris' 
  | 'grapa' 
  | 'disability_allowance' 
  | 'increased_family_allowance'
  | 'social_housing_tenant'
  | 'bim'
  | 'debt_mediation';

export type EnergyType = 'electricity_simple' | 'electricity_bihoraire' | 'gas' | 'heat';
export type MeterType = 'individual' | 'collective';
export type ApplicationType = 'automatic' | 'attestation_required';

export interface TarifSocialEnergieUser {
  // Statuts sociaux
  hasRIS: boolean;
  risAmount?: number;
  hasGRAPA: boolean;
  grapaAmount?: number;
  hasDisabilityRecognition: boolean;
  disabilityPercentage?: number;
  hasDisabilityAllowance: boolean;
  hasIncreasedFamilyAllowance: boolean;
  childWithDisability: boolean;
  hasBIM: boolean;
  bimStartDate?: Date;
  isSocialHousingTenant: boolean;
  isInDebtMediation: boolean;
  
  // Contrats énergie
  hasElectricityContract: boolean;
  hasGasContract: boolean;
  electricityMeterType: 'simple' | 'bihoraire';
  meterType: MeterType;
  hasCollectiveHeating: boolean;
  
  // Consommation
  annualElectricityConsumption: number; // kWh
  monthlyElectricityConsumption: number; // kWh
  annualGasConsumption: number; // kWh
  monthlyGasConsumption: number; // kWh
  
  // Situation
  householdType: 'single' | 'couple' | 'family_2_children' | 'large_family';
  hasElectricHeating: boolean;
  
  // Attestations
  hasValidAttestation: boolean;
  attestationSource?: string;
  attestationExpiryDate?: Date;
  
  // SPF transmission
  spfDataTransmitted: boolean;
  
  // Date de vérification
  checkDate: Date;
}

export interface TarifSocialEnergieResult extends EligibilityCheck {
  applicationType: ApplicationType;
  eligibleCategories: BeneficiaryCategory[];
  electricityRate?: number;
  gasRate?: number;
  estimatedMonthlySavings?: number;
  estimatedAnnualSavings?: number;
  attestationRequired: boolean;
  attestationSources?: string[];
  retroactiveFromDate?: Date;
  nextReviewDate?: Date;
}

/**
 * Create the TarifSocialEnergie eligibility rules engine
 */
function createTarifSocialEnergieEngine(): Engine {
  const engine = new Engine();

  // Rule 1: RIS beneficiary - automatic eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasRIS',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'spfDataTransmitted',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'tarifSocialEnergie-eligible',
      params: {
        category: 'ris',
        applicationType: 'automatic',
        reason: 'Bénéficiaire RIS - application automatique via SPF Économie',
        electricityRate: TARIF_SOCIAL_ENERGIE_CONSTANTS.ELECTRICITY_SIMPLE_RATE,
        gasRate: TARIF_SOCIAL_ENERGIE_CONSTANTS.GAS_RATE,
      },
    },
    priority: 100,
  });

  // Rule 2: GRAPA beneficiary - automatic eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasGRAPA',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'spfDataTransmitted',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'tarifSocialEnergie-eligible',
      params: {
        category: 'grapa',
        applicationType: 'automatic',
        reason: 'Bénéficiaire GRAPA - application automatique via SPF Économie',
        electricityRate: TARIF_SOCIAL_ENERGIE_CONSTANTS.ELECTRICITY_SIMPLE_RATE,
        gasRate: TARIF_SOCIAL_ENERGIE_CONSTANTS.GAS_RATE,
      },
    },
    priority: 99,
  });

  // Rule 3: Disability allowance beneficiary - automatic eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasDisabilityRecognition',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasDisabilityAllowance',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'tarifSocialEnergie-eligible',
      params: {
        category: 'disability_allowance',
        applicationType: 'automatic',
        reason: 'Personne handicapée avec allocation - application automatique',
        electricityRate: TARIF_SOCIAL_ENERGIE_CONSTANTS.ELECTRICITY_SIMPLE_RATE,
        gasRate: TARIF_SOCIAL_ENERGIE_CONSTANTS.GAS_RATE,
      },
    },
    priority: 98,
  });

  // Rule 4: Child with increased family allowance - automatic eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasIncreasedFamilyAllowance',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'childWithDisability',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'tarifSocialEnergie-eligible',
      params: {
        category: 'increased_family_allowance',
        applicationType: 'automatic',
        reason: 'Enfant avec allocation familiale majorée - tout le ménage bénéficie du tarif social',
        electricityRate: TARIF_SOCIAL_ENERGIE_CONSTANTS.ELECTRICITY_SIMPLE_RATE,
        gasRate: TARIF_SOCIAL_ENERGIE_CONSTANTS.GAS_RATE,
        appliesToWholeHousehold: true,
      },
    },
    priority: 97,
  });

  // Rule 5: Social housing tenant with collective heating - attestation required
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isSocialHousingTenant',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasCollectiveHeating',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'tarifSocialEnergie-eligible',
      params: {
        category: 'social_housing_tenant',
        applicationType: 'attestation_required',
        reason: 'Locataire social avec chauffage collectif - prime tarif social disponible depuis septembre 2024',
        requiresAttestation: true,
        attestationSource: 'Société de logement social',
        premiumAvailableFrom: TARIF_SOCIAL_ENERGIE_CONSTANTS.COLLECTIVE_HEATING_PREMIUM_DATE,
      },
    },
    priority: 90,
  });

  // Rule 6: BIM beneficiary - no longer eligible since July 2023
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasBIM',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasNoOtherEligibleStatus',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'tarifSocialEnergie-ineligible',
      params: {
        category: 'bim',
        reason: 'Le BIM ne donne plus droit au tarif social depuis le 1er juillet 2023',
        suggestion: 'Vérifiez si vous avez un autre statut éligible (RIS, GRAPA, allocation handicap, etc.)',
        changeDate: TARIF_SOCIAL_ENERGIE_CONSTANTS.BIM_REMOVAL_DATE,
      },
    },
    priority: 85,
  });

  // Rule 7: Debt mediation - case by case evaluation
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isInDebtMediation',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasValidAttestation',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'tarifSocialEnergie-eligible',
      params: {
        category: 'debt_mediation',
        applicationType: 'attestation_required',
        reason: 'Médiation de dettes - éligibilité évaluée au cas par cas',
        requiresAttestation: true,
        attestationSource: 'Médiateur de dettes',
        validityPeriod: '1 an',
        renewalRequired: true,
      },
    },
    priority: 80,
  });

  // Rule 8: Collective meter with eligible status - premium available
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'meterType',
          operator: 'equal',
          value: 'collective',
        },
        {
          fact: 'hasEligibleStatus',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'tarifSocialEnergie-eligible',
      params: {
        applicationType: 'attestation_required',
        reason: 'Compteur collectif - prime tarif social disponible depuis septembre 2024',
        requiresAttestation: true,
        premiumType: 'differential_compensation',
        premiumAvailableFrom: TARIF_SOCIAL_ENERGIE_CONSTANTS.COLLECTIVE_HEATING_PREMIUM_DATE,
      },
    },
    priority: 75,
  });

  // Rule 9: No energy contract
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasElectricityContract',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'hasGasContract',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'tarifSocialEnergie-ineligible',
      params: {
        reason: 'Aucun contrat d\'énergie actif',
        suggestion: 'Un contrat d\'électricité et/ou de gaz est nécessaire pour bénéficier du tarif social',
      },
    },
    priority: 110,
  });

  // Rule 10: Non-automatic beneficiary without attestation
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'spfDataTransmitted',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'hasValidAttestation',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'hasEligibleStatus',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'tarifSocialEnergie-pending',
      params: {
        reason: 'Éligible mais attestation requise',
        action: 'Obtenir une attestation auprès de l\'organisme compétent',
        applicationDelay: TARIF_SOCIAL_ENERGIE_CONSTANTS.APPLICATION_DELAY_DAYS,
      },
    },
    priority: 70,
  });

  return engine;
}

/**
 * Singleton instance of the TarifSocialEnergie rules engine
 */
const tarifSocialEnergieEngineInstance = createTarifSocialEnergieEngine();

/**
 * Calculate electricity cost at social tariff
 */
export function calculateElectricityCostSocialTariff(
  consumptionKwh: number,
  meterType: 'simple' | 'bihoraire' = 'simple',
  dayNightRatio: number = 0.6 // 60% day, 40% night for bihoraire
): number {
  if (meterType === 'simple') {
    return (consumptionKwh * TARIF_SOCIAL_ENERGIE_CONSTANTS.ELECTRICITY_SIMPLE_RATE) / 100;
  } else {
    const dayConsumption = consumptionKwh * dayNightRatio;
    const nightConsumption = consumptionKwh * (1 - dayNightRatio);
    const dayCost = (dayConsumption * TARIF_SOCIAL_ENERGIE_CONSTANTS.ELECTRICITY_BIHORAIRE_DAY_RATE) / 100;
    const nightCost = (nightConsumption * TARIF_SOCIAL_ENERGIE_CONSTANTS.ELECTRICITY_BIHORAIRE_NIGHT_RATE) / 100;
    return dayCost + nightCost;
  }
}

/**
 * Calculate gas cost at social tariff
 */
export function calculateGasCostSocialTariff(consumptionKwh: number): number {
  return (consumptionKwh * TARIF_SOCIAL_ENERGIE_CONSTANTS.GAS_RATE) / 100;
}

/**
 * Calculate electricity cost at commercial tariff
 */
export function calculateElectricityCostCommercial(consumptionKwh: number): number {
  return (consumptionKwh * TARIF_SOCIAL_ENERGIE_CONSTANTS.COMMERCIAL_ELECTRICITY_RATE) / 100;
}

/**
 * Calculate gas cost at commercial tariff
 */
export function calculateGasCostCommercial(consumptionKwh: number): number {
  return (consumptionKwh * TARIF_SOCIAL_ENERGIE_CONSTANTS.COMMERCIAL_GAS_RATE) / 100;
}

/**
 * Calculate Tarif Social Énergie savings
 */
export function calculateTarifSocialEnergieSavings(
  annualElectricityKwh: number,
  annualGasKwh: number,
  meterType: 'simple' | 'bihoraire' = 'simple'
): {
  electricitySavings: number;
  gasSavings: number;
  totalSavings: number;
  monthlyElectricityCostSocial: number;
  monthlyGasCostSocial: number;
  monthlyTotalCostSocial: number;
} {
  const annualElectricitySocial = calculateElectricityCostSocialTariff(annualElectricityKwh, meterType);
  const annualElectricityCommercial = calculateElectricityCostCommercial(annualElectricityKwh);
  const electricitySavings = annualElectricityCommercial - annualElectricitySocial;
  
  const annualGasSocial = calculateGasCostSocialTariff(annualGasKwh);
  const annualGasCommercial = calculateGasCostCommercial(annualGasKwh);
  const gasSavings = annualGasCommercial - annualGasSocial;
  
  return {
    electricitySavings: Math.round(electricitySavings),
    gasSavings: Math.round(gasSavings),
    totalSavings: Math.round(electricitySavings + gasSavings),
    monthlyElectricityCostSocial: Math.round((annualElectricitySocial / 12) * 100) / 100,
    monthlyGasCostSocial: Math.round((annualGasSocial / 12) * 100) / 100,
    monthlyTotalCostSocial: Math.round(((annualElectricitySocial + annualGasSocial) / 12) * 100) / 100,
  };
}

/**
 * Calculate Tarif Social Énergie amount (monthly bill)
 */
export function calculateTarifSocialEnergieAmount(
  monthlyElectricityKwh: number,
  monthlyGasKwh: number,
  meterType: 'simple' | 'bihoraire' = 'simple'
): number {
  const electricityCost = calculateElectricityCostSocialTariff(monthlyElectricityKwh, meterType);
  const gasCost = calculateGasCostSocialTariff(monthlyGasKwh);
  return Math.round((electricityCost + gasCost) * 100) / 100;
}

/**
 * Determine if user has any eligible status
 */
function hasEligibleStatus(user: TarifSocialEnergieUser): boolean {
  return (
    user.hasRIS ||
    user.hasGRAPA ||
    (user.hasDisabilityRecognition && user.hasDisabilityAllowance) ||
    (user.hasIncreasedFamilyAllowance && user.childWithDisability) ||
    user.isSocialHousingTenant ||
    user.isInDebtMediation
  );
}

/**
 * Determine if user has no other eligible status besides BIM
 */
function hasNoOtherEligibleStatus(user: TarifSocialEnergieUser): boolean {
  return (
    !user.hasRIS &&
    !user.hasGRAPA &&
    !(user.hasDisabilityRecognition && user.hasDisabilityAllowance) &&
    !(user.hasIncreasedFamilyAllowance && user.childWithDisability) &&
    !user.isSocialHousingTenant &&
    !user.isInDebtMediation
  );
}

/**
 * Get required attestation sources based on user status
 */
function getAttestationSources(user: TarifSocialEnergieUser): string[] {
  const sources: string[] = [];
  
  if (user.hasGRAPA) {
    sources.push('SPF Sécurité Sociale - Attestation GRAPA (validité 1 an)');
  }
  if (user.hasRIS) {
    sources.push('CPAS - Attestation RIS (validité 1 an)');
  }
  if (user.hasDisabilityAllowance) {
    sources.push('SPF Personnes Handicapées - Attestation allocation (permanente)');
  }
  if (user.hasIncreasedFamilyAllowance && user.childWithDisability) {
    sources.push('Mutualité - Attestation enfant handicapé (validité 1 an)');
  }
  if (user.isSocialHousingTenant) {
    sources.push('Société de logement social - Attestation locataire social (validité 1 an)');
  }
  if (user.isInDebtMediation) {
    sources.push('Médiateur de dettes - Attestation médiation (validité 1 an)');
  }
  
  return sources;
}

/**
 * Calculate next trimester start date for retroactive application
 */
function getQuarterStartDate(date: Date): Date {
  const month = date.getMonth();
  const year = date.getFullYear();
  const quarterStartMonth = Math.floor(month / 3) * 3;
  return new Date(year, quarterStartMonth, 1);
}

/**
 * Calculate next review date (quarterly)
 */
function getNextReviewDate(date: Date): Date {
  const month = date.getMonth();
  const year = date.getFullYear();
  const nextQuarterStartMonth = (Math.floor(month / 3) + 1) * 3;
  if (nextQuarterStartMonth >= 12) {
    return new Date(year + 1, nextQuarterStartMonth - 12, 1);
  }
  return new Date(year, nextQuarterStartMonth, 1);
}

/**
 * Check Tarif Social Énergie eligibility
 */
export async function checkTarifSocialEnergieEligibility(
  user: TarifSocialEnergieUser
): Promise<TarifSocialEnergieResult> {
  const facts = {
    hasRIS: user.hasRIS,
    risAmount: user.risAmount,
    hasGRAPA: user.hasGRAPA,
    grapaAmount: user.grapaAmount,
    hasDisabilityRecognition: user.hasDisabilityRecognition,
    disabilityPercentage: user.disabilityPercentage,
    hasDisabilityAllowance: user.hasDisabilityAllowance,
    hasIncreasedFamilyAllowance: user.hasIncreasedFamilyAllowance,
    childWithDisability: user.childWithDisability,
    hasBIM: user.hasBIM,
    isSocialHousingTenant: user.isSocialHousingTenant,
    isInDebtMediation: user.isInDebtMediation,
    hasCollectiveHeating: user.hasCollectiveHeating,
    hasElectricityContract: user.hasElectricityContract,
    hasGasContract: user.hasGasContract,
    meterType: user.meterType,
    hasValidAttestation: user.hasValidAttestation,
    spfDataTransmitted: user.spfDataTransmitted,
    hasEligibleStatus: hasEligibleStatus(user),
    hasNoOtherEligibleStatus: hasNoOtherEligibleStatus(user),
  };

  try {
    const results = await tarifSocialEnergieEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'tarifSocialEnergie-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'tarifSocialEnergie-eligible');
    const pendingEvent = results.events.find((e) => e.type === 'tarifSocialEnergie-pending');

    // No energy contract - absolute ineligibility
    if (ineligibleEvent && ineligibleEvent.params?.reason?.includes('contrat')) {
      return {
        benefitType: 'tarif-social-energie' as any,
        isEligible: false,
        reason: ineligibleEvent.params?.reason,
        applicationType: 'automatic',
        eligibleCategories: [],
        attestationRequired: false,
      };
    }

    // BIM only - no longer eligible
    if (ineligibleEvent && ineligibleEvent.params?.category === 'bim') {
      return {
        benefitType: 'tarif-social-energie' as any,
        isEligible: false,
        reason: ineligibleEvent.params?.reason,
        applicationType: 'automatic',
        eligibleCategories: [],
        attestationRequired: false,
      };
    }

    if (eligibleEvent) {
      const savings = calculateTarifSocialEnergieSavings(
        user.annualElectricityConsumption,
        user.annualGasConsumption,
        user.electricityMeterType
      );

      const categories: BeneficiaryCategory[] = [];
      if (eligibleEvent.params?.category) {
        categories.push(eligibleEvent.params.category);
      }

      const isAutomatic = eligibleEvent.params?.applicationType === 'automatic';
      const requiresAttestation = eligibleEvent.params?.requiresAttestation || !isAutomatic;

      return {
        benefitType: 'tarif-social-energie' as any,
        isEligible: true,
        calculatedAmount: savings.monthlyTotalCostSocial,
        applicationType: isAutomatic ? 'automatic' : 'attestation_required',
        eligibleCategories: categories,
        electricityRate: TARIF_SOCIAL_ENERGIE_CONSTANTS.ELECTRICITY_SIMPLE_RATE,
        gasRate: TARIF_SOCIAL_ENERGIE_CONSTANTS.GAS_RATE,
        estimatedMonthlySavings: Math.round(savings.totalSavings / 12),
        estimatedAnnualSavings: savings.totalSavings,
        attestationRequired: requiresAttestation,
        attestationSources: requiresAttestation ? getAttestationSources(user) : undefined,
        retroactiveFromDate: getQuarterStartDate(user.checkDate),
        nextReviewDate: getNextReviewDate(user.checkDate),
      };
    }

    if (pendingEvent) {
      return {
        benefitType: 'tarif-social-energie' as any,
        isEligible: false,
        reason: pendingEvent.params?.reason,
        applicationType: 'attestation_required',
        eligibleCategories: [],
        attestationRequired: true,
        attestationSources: getAttestationSources(user),
      };
    }

    return {
      benefitType: 'tarif-social-energie' as any,
      isEligible: false,
      reason: 'Conditions non remplies pour le tarif social énergie',
      applicationType: 'automatic',
      eligibleCategories: [],
      attestationRequired: false,
    };
  } catch (error) {
    throw new Error(`Error checking Tarif Social Énergie eligibility: ${error}`);
  }
}

/**
 * Get estimated savings by household profile
 */
export function getEstimatedSavingsByProfile(
  householdType: 'single' | 'couple' | 'family_2_children' | 'large_family' | 'electric_apartment'
): {
  annualElectricityKwh: number;
  annualGasKwh: number;
  electricitySavings: number;
  gasSavings: number;
  totalSavings: number;
} {
  const profiles = {
    single: { elec: 2000, gas: 5000 },
    couple: { elec: 3500, gas: 12000 },
    family_2_children: { elec: 4500, gas: 18000 },
    large_family: { elec: 6000, gas: 25000 },
    electric_apartment: { elec: 8000, gas: 0 },
  };

  const profile = profiles[householdType];
  const savings = calculateTarifSocialEnergieSavings(profile.elec, profile.gas);

  return {
    annualElectricityKwh: profile.elec,
    annualGasKwh: profile.gas,
    electricitySavings: savings.electricitySavings,
    gasSavings: savings.gasSavings,
    totalSavings: savings.totalSavings,
  };
}

/**
 * Export rules in JSON format for transparency
 */
export const TARIF_SOCIAL_ENERGIE_RULES_JSON = {
  legalFramework: {
    primaryLaws: [
      'Loi du 29 avril 1999 relative à l\'organisation du marché de l\'électricité',
      'Loi du 12 avril 1965 relative au transport de produits gazeux',
    ],
    implementingDecrees: [
      'Arrêté royal du 29 mars 2012 fixant les règles de détermination du coût de l\'application des tarifs sociaux',
      'Arrêté ministériel du 30 mars 2007 portant fixation de prix maximaux sociaux',
    ],
    regulator: 'CREG (Commission de Régulation de l\'Électricité et du Gaz)',
    effectiveDate: '2024-11-01',
  },
  rates: {
    effectiveDate: '2024-11-01',
    electricity: {
      simple: '22.773 cents/kWh',
      bihoraire: 'Variable jour/nuit',
    },
    gas: '4.745 cents/kWh',
    revision: 'Trimestrielle',