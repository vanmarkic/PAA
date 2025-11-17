/**
 * Childcare (Garde d'Enfants) domain types
 * Belgian childcare system with subsidies and tax deductions
 */

import { BelgianRegion } from './allocationsFamilialesTypes';

export type ChildcareType =
  | 'creche'           // Public nursery (0-3 years)
  | 'accueillante'     // Registered childminder
  | 'maison-enfants'   // Children's house
  | 'prégardiennat'    // Pre-nursery school
  | 'extrascolaire'    // After-school care
  | 'private';         // Private childcare

export type ChildcareSchedule =
  | 'full-time'        // 5 days/week
  | 'part-time'        // 2-4 days/week
  | 'occasional'       // As needed
  | 'emergency';       // Emergency care

export type SubsidyType =
  | 'income-based'     // Based on family income
  | 'social-rate'      // Reduced rate for vulnerable families
  | 'multiple-children' // Reduction for multiple children
  | 'single-parent'    // Single parent subsidy
  | 'disability';      // Child with disability

export interface ChildcareChild {
  id: string;
  birthDate: Date;
  hasDisability: boolean;
  specialNeeds?: string[];
  enrollmentDate?: Date;
  schedule: ChildcareSchedule;
}

export interface ChildcareUser {
  id: string;
  region: BelgianRegion;
  familyComposition: 'couple' | 'single-parent';
  numberOfChildren: number;
  children: ChildcareChild[];
  annualHouseholdIncome: number;
  workingParents: 1 | 2;
  receivingSocialBenefits: boolean;
  postalCode: string; // For availability check
}

export interface ChildcareFacility {
  id: string;
  name: string;
  type: ChildcareType;
  region: BelgianRegion;
  isSubsidized: boolean;
  capacity: number;
  ageRange: {
    minMonths: number;
    maxYears: number;
  };
  schedule: {
    openTime: string;
    closeTime: string;
    daysPerWeek: number;
  };
  rates: ChildcareRates;
}

export interface ChildcareRates {
  type: 'daily' | 'monthly' | 'hourly';
  baseRate: number;
  subsidizedRate?: number;
  incomeBasedRates?: {
    incomeThreshold: number;
    rate: number;
  }[];
  additionalFees?: {
    registration?: number;
    meals?: number;
    activities?: number;
    latePickup?: number;
  };
}

export interface ChildcareSubsidy {
  type: SubsidyType;
  eligibilityThreshold?: number; // Income threshold
  reductionPercentage?: number;
  fixedReduction?: number;
  maxBenefit?: number;
}

export interface ChildcareCost {
  facility: ChildcareFacility;
  child: ChildcareChild;
  schedule: ChildcareSchedule;
  costs: {
    dailyRate: number;
    monthlyRate: number;
    annualRate: number;
  };
  subsidies: {
    type: SubsidyType;
    amount: number;
    percentage?: number;
  }[];
  netCost: {
    daily: number;
    monthly: number;
    annual: number;
  };
  taxDeduction: {
    eligible: boolean;
    maxDeductible: number;
    estimatedSaving: number; // Based on tax bracket
  };
}

export interface ChildcareResult {
  isEligible: boolean;
  region: BelgianRegion;
  availableFacilities: ChildcareFacility[];
  costEstimates: ChildcareCost[];
  totalMonthlyCost: number;
  totalAnnualCost: number;
  subsidiesApplied: {
    type: SubsidyType;
    totalReduction: number;
  }[];
  taxBenefit: {
    maxDeductiblePerDay: number;
    maxDeductiblePerChild: number;
    estimatedAnnualTaxSaving: number;
    requiredAttestation: boolean; // Form 281.86
  };
  waitingList?: {
    position: number;
    estimatedWait: string; // "3-6 months"
  };
  alternativeOptions?: ChildcareFacility[];
  requiredDocuments: string[];
}

// Regional childcare rates for 2024
export const BRUSSELS_CHILDCARE_RATES: ChildcareRates = {
  type: 'daily',
  baseRate: 35.00, // Private non-subsidized
  subsidizedRate: 2.64, // Minimum subsidized rate
  incomeBasedRates: [
    { incomeThreshold: 20000, rate: 2.64 },
    { incomeThreshold: 30000, rate: 8.50 },
    { incomeThreshold: 40000, rate: 15.00 },
    { incomeThreshold: 50000, rate: 22.00 },
    { incomeThreshold: 999999, rate: 28.00 }, // Maximum subsidized rate
  ],
  additionalFees: {
    registration: 50.00,
    meals: 3.50,
    activities: 2.00,
    latePickup: 5.00, // Per 15 minutes
  },
};

export const WALLONIA_CHILDCARE_RATES: ChildcareRates = {
  type: 'daily',
  baseRate: 32.00,
  subsidizedRate: 2.44,
  incomeBasedRates: [
    { incomeThreshold: 18000, rate: 2.44 },
    { incomeThreshold: 28000, rate: 7.80 },
    { incomeThreshold: 38000, rate: 13.50 },
    { incomeThreshold: 48000, rate: 19.00 },
    { incomeThreshold: 999999, rate: 25.00 },
  ],
  additionalFees: {
    registration: 40.00,
    meals: 3.00,
    activities: 1.50,
  },
};

export const FLANDERS_CHILDCARE_RATES: ChildcareRates = {
  type: 'daily',
  baseRate: 38.00,
  subsidizedRate: 5.45, // Minimum income-based rate
  incomeBasedRates: [
    { incomeThreshold: 17500, rate: 5.45 },
    { incomeThreshold: 27500, rate: 9.80 },
    { incomeThreshold: 37500, rate: 16.20 },
    { incomeThreshold: 47500, rate: 23.00 },
    { incomeThreshold: 999999, rate: 30.18 }, // Maximum
  ],
  additionalFees: {
    registration: 60.00,
    meals: 4.00,
    activities: 2.50,
  },
};

// Childcare subsidies by region
export const CHILDCARE_SUBSIDIES: ChildcareSubsidy[] = [
  {
    type: 'income-based',
    eligibilityThreshold: 50000, // Annual household income
    reductionPercentage: 65, // Up to 65% reduction
  },
  {
    type: 'social-rate',
    eligibilityThreshold: 20000,
    reductionPercentage: 85, // 85% reduction for low income
  },
  {
    type: 'multiple-children',
    reductionPercentage: 25, // 25% reduction for 2nd child
  },
  {
    type: 'single-parent',
    fixedReduction: 5.00, // Per day reduction
  },
  {
    type: 'disability',
    reductionPercentage: 50, // 50% reduction for disabled child
    maxBenefit: 20.00, // Per day
  },
];

// Tax deduction constants
export const TAX_DEDUCTION_2024 = {
  maxDeductiblePerDay: 16.40,      // Maximum per child per day
  maxDeductiblePerChild: 3780.00,  // Annual maximum per child under 14
  maxAge: 14,                      // Child must be under 14
  maxIncomeForFullDeduction: 45000, // Phase out above this income
  requiredForm: '281.86',          // Attestation fiscale
  taxSavingRate: 0.45,             // Approximate tax saving (45% marginal rate)
};

// After-school care rates
export const AFTER_SCHOOL_CARE = {
  morningRate: 1.50,    // Before school
  eveningRate: 2.50,    // After school until 6 PM
  wednesdayRate: 4.00,  // Wednesday afternoon
  holidayRate: 8.00,    // School holidays full day
  latePickupPenalty: 5.00, // Per 15 minutes after closing
};

export const CHILDCARE_CONSTANTS = {
  MIN_AGE_MONTHS: 3,       // Minimum 3 months old
  MAX_AGE_CRECHE: 3,       // Maximum age for crèche
  MAX_AGE_PRESCHOOL: 6,    // Start of mandatory education
  MAX_AGE_AFTERSCHOOL: 12, // After-school care limit
  MAX_AGE_TAX_DEDUCTION: 14, // Tax deduction age limit
  REGISTRATION_TIMING: {
    idealMonthsBefore: 6,  // Register 6 months before needed
    minimumWeeksBefore: 4, // Minimum 4 weeks notice
  },
  PRIORITY_CRITERIA: [
    'working_parents',
    'single_parent',
    'social_situation',
    'sibling_enrolled',
    'local_resident',
  ],
  REQUIRED_DOCUMENTS: [
    'birth_certificate',
    'proof_of_income',
    'work_certificates',
    'vaccination_record',
    'medical_certificate',
    'family_composition',
    'bank_details',
  ],
  QUALITY_STANDARDS: {
    maxChildrenPerCaregiver: {
      '0-18months': 4,
      '18-36months': 7,
      '3-6years': 18,
    },
    minSquareMetersPerChild: 5,
    requiredQualifications: [
      'puéricultrice',
      'educateur',
      'assistant_social',
    ],
  },
};