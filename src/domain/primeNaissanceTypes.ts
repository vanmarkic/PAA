/**
 * Birth Allowance (Prime de Naissance) domain types
 * One-time payment for birth or adoption with regional variations
 */

import { BelgianRegion } from './allocationsFamilialesTypes';

export type BirthType = 'birth' | 'adoption' | 'foster-care';

export type ChildRank =
  | 'first'
  | 'second'
  | 'subsequent'; // Third and more

export interface BirthAllowanceApplication {
  id: string;
  region: BelgianRegion;
  applicantId: string;
  childId: string;
  birthType: BirthType;
  birthDate: Date;
  applicationDate: Date;
  childRank: ChildRank;
  isMultipleBirth: boolean; // Twins, triplets, etc.
  numberOfChildren?: number; // If multiple birth
  householdIncome?: number; // Required for some regional supplements
  motherEmploymentStatus?: 'employed' | 'unemployed' | 'self-employed' | 'inactive';
}

export interface RegionalBirthAmounts {
  region: BelgianRegion;
  baseAmount: {
    first: number;
    subsequent: number;
  };
  adoptionAmount?: {
    first: number;
    subsequent: number;
  };
  multipleBirthMultiplier?: number; // Factor for twins, triplets
  incomeSupplement?: {
    threshold: number;
    amount: number;
  };
}

export interface BirthAllowanceResult {
  isEligible: boolean;
  region: BelgianRegion;
  birthType: BirthType;
  amount: number;
  breakdown: {
    baseAmount: number;
    multipleBirthBonus?: number;
    incomeSupplement?: number;
  };
  paymentSchedule: {
    expectedDate: Date;
    installments?: { // Some regions split payment
      date: Date;
      amount: number;
    }[];
  };
  requiredDocuments: string[];
  applicationDeadline: Date;
  warnings?: string[];
}

export interface PregnancyAllowance {
  region: BelgianRegion;
  monthOfPregnancy: number;
  amount: number;
  paymentDate?: Date;
}

// Regional amounts for 2024
export const BRUSSELS_BIRTH_AMOUNTS_2024: RegionalBirthAmounts = {
  region: 'Brussels',
  baseAmount: {
    first: 1367.00,
    subsequent: 621.00,
  },
  adoptionAmount: {
    first: 1367.00,
    subsequent: 621.00,
  },
  multipleBirthMultiplier: 1.0, // Same amount per child
  incomeSupplement: {
    threshold: 31814.00, // Annual household income
    amount: 560.00,
  },
};

export const WALLONIA_BIRTH_AMOUNTS_2024: RegionalBirthAmounts = {
  region: 'Wallonia',
  baseAmount: {
    first: 1100.00,
    subsequent: 500.00,
  },
  adoptionAmount: {
    first: 1100.00,
    subsequent: 500.00,
  },
  multipleBirthMultiplier: 1.0,
  incomeSupplement: {
    threshold: 25000.00,
    amount: 400.00,
  },
};

export const FLANDERS_BIRTH_AMOUNTS_2024: RegionalBirthAmounts = {
  region: 'Flanders',
  baseAmount: {
    first: 1269.00, // Universal amount regardless of rank
    subsequent: 1269.00,
  },
  adoptionAmount: {
    first: 1269.00,
    subsequent: 1269.00,
  },
  multipleBirthMultiplier: 1.0,
  // No income-based supplement in Flanders
};

// Pregnancy allowance (Wallonia specific)
export const PREGNANCY_ALLOWANCE_WALLONIA: PregnancyAllowance[] = [
  { region: 'Wallonia', monthOfPregnancy: 5, amount: 135.00 },
  { region: 'Wallonia', monthOfPregnancy: 7, amount: 135.00 },
];

export const BIRTH_ALLOWANCE_CONSTANTS = {
  APPLICATION_DEADLINE_MONTHS: 12, // Apply within 12 months of birth
  PAYMENT_DELAY_DAYS: 60, // Payment within 60 days of application
  MIN_PREGNANCY_WEEKS_APPLICATION: 24, // Can apply from 24 weeks pregnancy
  REQUIRED_DOCUMENTS: {
    birth: [
      'birth_certificate',
      'identity_card',
      'family_composition',
      'bank_account_details',
    ],
    adoption: [
      'adoption_certificate',
      'identity_card',
      'family_composition',
      'bank_account_details',
      'court_decision',
    ],
    'foster-care': [
      'foster_care_agreement',
      'identity_card',
      'family_composition',
      'bank_account_details',
    ],
  },
  STILLBIRTH_ELIGIBILITY: {
    minWeeks: 22, // Eligible if stillbirth after 22 weeks
    amount: 1.0, // Full amount paid
  },
};