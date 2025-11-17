/**
 * GRAPA (Garantie de Revenus aux Personnes Âgées) specific domain types
 * Belgian income guarantee for elderly persons with insufficient resources
 */

/**
 * GRAPA benefit categories determining the amount of assistance
 */
export type GRAPACategory = 'personne isolée' | 'personne cohabitante';

/**
 * Nationality status for GRAPA eligibility evaluation
 */
export type NationalityStatus =
  | 'belgian-citizen'
  | 'eu-citizen'
  | 'refugee-recognized'
  | 'stateless-person'
  | 'non-eu-citizen';

/**
 * Types of resources considered for GRAPA calculation
 */
export type ResourceType =
  | 'pension-retirement'
  | 'pension-survival'
  | 'work-income'
  | 'property-income'
  | 'movable-assets'
  | 'immovable-assets'
  | 'donations'
  | 'other-benefits';

/**
 * GRAPA user profile with all required eligibility fields
 */
export interface GRAPAUser {
  /** Unique identifier */
  id: string;
  /** Age in years (must be >= 65 in 2024) */
  age: number;
  /** Living situation category */
  category: GRAPACategory;
  /** Nationality and legal status */
  nationalityStatus: NationalityStatus;
  /** Effective residence in Belgium */
  residesInBelgium: boolean;
  /** Number of days absent from Belgium per year */
  daysAbsentFromBelgium: number;
  /** Monthly pension amount in EUR */
  monthlyPension: number;
  /** Other monthly income in EUR */
  monthlyOtherIncome: number;
  /** Partner/cohabitant monthly income if applicable */
  partnerMonthlyIncome?: number;
  /** Value of movable assets (bank accounts, investments) */
  movableAssetsValue: number;
  /** Value of immovable assets (property) */
  immovableAssetsValue: number;
  /** Currently receiving GRAPA */
  isCurrentlyReceivingGRAPA: boolean;
  /** Years of residence in Belgium (for EU citizens) */
  yearsResidenceInBelgium?: number;
  /** Has worked in Belgium (for EU citizens) */
  hasWorkedInBelgium?: boolean;
}

/**
 * GRAPA amount structure by category
 */
export interface GRAPAAmounts {
  /** Monthly amount for isolated person */
  personneIsolee: number;
  /** Monthly amount for cohabitant */
  personneCohabitante: number;
  /** Annual income exemption for work */
  workIncomeExemptionAnnual: number;
  /** Succession recovery threshold */
  successionRecoveryThreshold: number;
}

/**
 * Calculated resources for GRAPA eligibility
 */
export interface GRAPAResources {
  /** Total monthly pension */
  pensionIncome: number;
  /** Income from work after exemption */
  workIncome: number;
  /** Calculated income from movable assets */
  movableAssetsIncome: number;
  /** Calculated income from immovable assets */
  immovableAssetsIncome: number;
  /** Other sources of income */
  otherIncome: number;
  /** Total monthly resources */
  totalMonthlyResources: number;
  /** Details of exemptions applied */
  exemptions?: {
    workIncomeExempted: number;
    primaryResidenceExempted: boolean;
  };
}

/**
 * GRAPA eligibility result with detailed calculation
 */
export interface GRAPAEligibilityResult {
  /** Eligibility status */
  isEligible: boolean;
  /** Benefit category if eligible */
  category?: GRAPACategory;
  /** Monthly GRAPA amount in EUR */
  monthlyAmount?: number;
  /** Annual GRAPA amount in EUR */
  annualAmount?: number;
  /** Reason for eligibility or rejection */
  reason?: string;
  /** Detailed resource calculation */
  resourceCalculation?: GRAPAResources;
  /** Specific obligations for beneficiary */
  obligations?: string[];
  /** Administrative notes */
  notes?: string[];
  /** Legal basis for decision */
  legalBasis?: string;
}

/**
 * GRAPA application procedure information
 */
export interface GRAPAProcedure {
  /** Application method */
  applicationMethod: 'MyPension.be' | 'point-pension' | 'courrier-recommande';
  /** Date of application */
  applicationDate: Date;
  /** Expected decision date (within 4 months) */
  expectedDecisionDate: Date;
  /** Required documents */
  requiredDocuments: string[];
  /** Current status */
  status: 'pending' | 'under-review' | 'approved' | 'rejected' | 'appeal';
}

/**
 * GRAPA revision cases
 */
export interface GRAPARevision {
  /** User identifier */
  userId: string;
  /** Reason for revision */
  revisionReason:
    | 'change-living-situation'
    | 'change-resources'
    | 'change-residence'
    | 'periodic-review'
    | 'fraud-investigation';
  /** Previous category */
  previousCategory: GRAPACategory;
  /** New category */
  newCategory?: GRAPACategory;
  /** Previous amount */
  previousAmount: number;
  /** New amount */
  newAmount?: number;
  /** Effective date of change */
  effectiveDate: Date;
  /** Recovery amount if applicable */
  recoveryAmount?: number;
}

// Constants for 2024
export const GRAPA_AMOUNTS_2024: GRAPAAmounts = {
  personneIsolee: 1549.42,
  personneCohabitante: 1032.95,
  workIncomeExemptionAnnual: 5000.00, // EUR per year for isolated person
  successionRecoveryThreshold: 32612.44, // EUR threshold for succession recovery
};

/**
 * GRAPA constants and thresholds
 */
export const GRAPA_CONSTANTS = {
  /** Minimum age requirement (2024) */
  MIN_AGE: 65,
  /** Minimum age from February 2025 */
  MIN_AGE_2025: 66,
  /** Minimum age from February 2030 */
  MIN_AGE_2030: 67,
  /** Maximum days absent from Belgium per year */
  MAX_DAYS_ABSENT: 29,
  /** Rate for calculating income from movable assets */
  MOVABLE_ASSETS_RATE: 0.06, // 6% annual
  /** Movable assets exemption threshold */
  MOVABLE_ASSETS_EXEMPTION: 6200, // EUR
  /** Primary residence value exemption */
  PRIMARY_RESIDENCE_EXEMPTION: 50000, // EUR
  /** Decision deadline in months */
  DECISION_DEADLINE_MONTHS: 4,
  /** Minimum years of work for EU citizens */
  MIN_WORK_YEARS_EU: 1,
  /** Minimum years of residence for refugees */
  MIN_RESIDENCE_YEARS_REFUGEE: 5,
};

/**
 * Age requirements by year
 */
export const GRAPA_AGE_REQUIREMENTS = {
  2024: 65,
  2025: 66, // Starting February 1st
  2030: 67, // Starting February 1st
};

/**
 * Work income exemptions by category
 */
export const GRAPA_WORK_EXEMPTIONS = {
  personneIsolee: 5000, // EUR per year
  personneCohabitante: 7500, // EUR per year for couple
};

/**
 * Resource calculation rates
 */
export const GRAPA_RESOURCE_RATES = {
  /** Rate for movable assets above exemption */
  movableAssetsRate: 0.06,
  /** Rate for immovable assets (not primary residence) */
  immovableAssetsRate: 0.06,
  /** Rate for donations in last 10 years */
  donationsRate: 0.06,
};

/**
 * GRAPA obligations for beneficiaries
 */
export const GRAPA_OBLIGATIONS = [
  'Déclarer tout changement de situation au SFP',
  'Déclarer tout changement de ressources',
  'Résider effectivement en Belgique',
  'Ne pas s\'absenter plus de 29 jours par an',
  'Avoir épuisé ses droits aux pensions belges et étrangères',
  'Accepter la récupération sur succession (au-delà de 32612.44€)',
];

/**
 * Type guard to check if user is eligible based on age
 */
export function isAgeEligibleForGRAPA(age: number, year: number = 2024): boolean {
  const minAge = year >= 2030 ? 67 : year >= 2025 ? 66 : 65;
  return age >= minAge;
}

/**
 * Calculate monthly resources from assets
 */
export function calculateAssetIncome(
  movableAssets: number,
  immovableAssets: number,
  isPrimaryResidence: boolean = false
): number {
  // Movable assets calculation
  const movableExcess = Math.max(0, movableAssets - GRAPA_CONSTANTS.MOVABLE_ASSETS_EXEMPTION);
  const movableIncome = (movableExcess * GRAPA_CONSTANTS.MOVABLE_ASSETS_RATE) / 12;

  // Immovable assets calculation
  let immovableIncome = 0;
  if (!isPrimaryResidence || immovableAssets > GRAPA_CONSTANTS.PRIMARY_RESIDENCE_EXEMPTION) {
    const immovableExcess = isPrimaryResidence
      ? Math.max(0, immovableAssets - GRAPA_CONSTANTS.PRIMARY_RESIDENCE_EXEMPTION)
      : immovableAssets;
    immovableIncome = (immovableExcess * GRAPA_RESOURCE_RATES.immovableAssetsRate) / 12;
  }

  return movableIncome + immovableIncome;
}