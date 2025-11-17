/**
 * Family Allowances (Allocations Familiales) domain types
 * Belgian family benefit system with regional variations
 */

export type BelgianRegion = 'Brussels' | 'Wallonia' | 'Flanders';

export type ChildAgeCategory =
  | '0-5'     // Birth to 5 years
  | '6-11'    // Elementary school age
  | '12-17'   // Secondary school age
  | '18-24';  // Higher education age (conditional)

export type SupplementType =
  | 'disability'      // Child with disability
  | 'orphan'          // Lost one or both parents
  | 'single-parent'   // Single parent household
  | 'social'          // Low income household
  | 'large-family'    // 3+ children
  | 'education';      // Higher education supplement

export interface Child {
  id: string;
  birthDate: Date;
  ageCategory: ChildAgeCategory;
  hasDisability: boolean;
  disabilityLevel?: 1 | 2 | 3; // Level of disability (1=light, 3=severe)
  isOrphan: boolean;
  orphanType?: 'single' | 'double'; // Lost one or both parents
  isInEducation: boolean;
  educationLevel?: 'secondary' | 'higher';
}

export interface FamilyAllowancesUser {
  id: string;
  region: BelgianRegion;
  isSingleParent: boolean;
  numberOfChildren: number;
  children: Child[];
  householdIncome: number; // Annual household income
  isReceivingSocialBenefits: boolean;
  hasLargeFamilyStatus: boolean; // 3+ children
}

export interface RegionalAmounts {
  region: BelgianRegion;
  baseAmounts: {
    [key in ChildAgeCategory]: number;
  };
  supplements: {
    [key in SupplementType]: number | SupplementScale;
  };
  rankSupplement?: { // Additional amount per child rank
    second: number;
    thirdAndMore: number;
  };
}

export interface SupplementScale {
  level1: number; // Light disability or low supplement
  level2: number; // Medium disability or medium supplement
  level3: number; // Severe disability or high supplement
}

export interface FamilyAllowancesResult {
  isEligible: boolean;
  region: BelgianRegion;
  totalMonthlyAmount: number;
  breakdown: {
    baseAmount: number;
    supplements: {
      type: SupplementType;
      amount: number;
      childId?: string;
    }[];
    totalSupplements: number;
  };
  perChild: {
    childId: string;
    baseAmount: number;
    supplements: number;
    total: number;
  }[];
  nextReview?: Date;
  warnings?: string[]; // Age limits approaching, etc.
}

// Regional amounts for 2024
export const BRUSSELS_AMOUNTS_2024: RegionalAmounts = {
  region: 'Brussels',
  baseAmounts: {
    '0-5': 174.00,
    '6-11': 188.00,
    '12-17': 202.00,
    '18-24': 211.00,
  },
  supplements: {
    disability: {
      level1: 82.00,
      level2: 110.00,
      level3: 145.00,
    } as SupplementScale,
    orphan: 185.00,
    'single-parent': 53.00,
    social: 120.00,
    'large-family': 35.00,
    education: 62.00,
  },
};

export const WALLONIA_AMOUNTS_2024: RegionalAmounts = {
  region: 'Wallonia',
  baseAmounts: {
    '0-5': 192.00,
    '6-11': 196.00,
    '12-17': 200.00,
    '18-24': 205.00,
  },
  supplements: {
    disability: {
      level1: 95.00,
      level2: 125.00,
      level3: 160.00,
    } as SupplementScale,
    orphan: 200.00,
    'single-parent': 48.00,
    social: {
      level1: 60.00,  // Income < 31,000€
      level2: 110.00, // Income < 20,000€
      level3: 150.00, // Income < 15,000€
    } as SupplementScale,
    'large-family': 42.00,
    education: 70.00,
  },
  rankSupplement: {
    second: 20.00,
    thirdAndMore: 35.00,
  },
};

export const FLANDERS_AMOUNTS_2024: RegionalAmounts = {
  region: 'Flanders',
  baseAmounts: {
    '0-5': 184.62,
    '6-11': 184.62,
    '12-17': 184.62,
    '18-24': 184.62,
  },
  supplements: {
    disability: {
      level1: 88.51,
      level2: 118.02,
      level3: 147.53,
    } as SupplementScale,
    orphan: 177.02,
    'single-parent': 0, // Integrated in social supplement
    social: {
      level1: 55.00,  // Income < 33,726€
      level2: 88.00,  // Income < 22,484€
      level3: 132.00, // Income < 16,863€
    } as SupplementScale,
    'large-family': 38.00,
    education: 58.00,
  },
};

export const FAMILY_ALLOWANCES_CONSTANTS = {
  MAX_AGE_STANDARD: 18,
  MAX_AGE_EDUCATION: 25,
  MIN_CHILDREN: 1,
  LARGE_FAMILY_THRESHOLD: 3,
  PAYMENT_DAY: 8, // 8th of each month
  INCOME_THRESHOLDS: {
    BRUSSELS: {
      social: 31814.00,
      increased: 20000.00,
    },
    WALLONIA: {
      low: 31000.00,
      medium: 20000.00,
      high: 15000.00,
    },
    FLANDERS: {
      low: 33726.00,
      medium: 22484.00,
      high: 16863.00,
    },
  },
};