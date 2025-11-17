/**
 * Parental Leave (Congé Parental) domain types
 * Belgian parental leave system with various time reduction formulas
 */

export type ParentType = 'mother' | 'father' | 'adoptive-parent' | 'foster-parent';

export type LeaveFormula =
  | 'full-time'      // Complete work interruption
  | 'half-time'      // 50% reduction
  | 'one-fifth'      // 1/5 reduction (4 days work)
  | 'one-tenth';     // 1/10 reduction (flexible)

export type LeaveReason =
  | 'standard'       // Normal parental leave
  | 'medical'        // Child medical reasons
  | 'palliative'     // Palliative care
  | 'assistance';    // Assistance to family member

export type ChildAge =
  | 'under-12'       // Standard age limit
  | 'under-21'       // With disability
  | 'no-limit';      // Severe disability

export interface ParentalLeaveUser {
  id: string;
  parentType: ParentType;
  employmentStatus: 'employee' | 'civil-servant' | 'self-employed';
  workRegime: 'full-time' | 'part-time-80' | 'part-time-50';
  monthlyGrossSalary: number;
  hoursPerWeek: number;
  seniority: number; // Months with current employer
  childBirthDate: Date;
  childHasDisability: boolean;
  disabilityPoints?: number; // 0-36 scale
  numberOfChildren: number;
  partnerAlsoTakingLeave?: boolean;
  previousLeavesTaken?: PreviousLeave[];
}

export interface PreviousLeave {
  type: LeaveFormula;
  startDate: Date;
  endDate: Date;
  monthsTaken: number;
}

export interface LeaveAllocation {
  formula: LeaveFormula;
  maxMonths: number;
  minConsecutiveMonths?: number;
  canSplit: boolean;
  ageLimit: number; // Child age limit
}

export interface ParentalBenefit {
  formula: LeaveFormula;
  monthlyAmount: number;
  netAmount: number; // After social contributions
  taxExempt: boolean;
  employer_compensation?: number; // Some employers top up
}

export interface ParentalLeaveResult {
  isEligible: boolean;
  availableFormulas: LeaveFormula[];
  selectedFormula?: LeaveFormula;
  allocation: {
    totalMonthsAvailable: number;
    monthsAlreadyUsed: number;
    monthsRemaining: number;
    mustUseBeforeDate: Date; // Based on child age
  };
  benefit: {
    grossMonthly: number;
    netMonthly: number;
    totalExpected: number;
    paymentSchedule: 'monthly';
  };
  workSchedule?: {
    formula: LeaveFormula;
    workDaysPerWeek?: number;
    workHoursPerWeek?: number;
    reducedSalary?: number;
  };
  combinedIncome?: { // Leave benefit + reduced salary
    leaveBenefit: number;
    partialSalary: number;
    totalMonthly: number;
  };
  requiredNotice: {
    toEmployer: number; // Days notice
    toONEM: number;     // Days notice to unemployment office
  };
  requiredDocuments: string[];
  warnings?: string[];
}

export interface TimeCredit {
  type: 'with-reason' | 'without-reason';
  reason?: LeaveReason;
  maxMonths: {
    fullTime: number;
    halfTime: number;
    oneFifth: number;
  };
  benefit: ParentalBenefit;
}

// Leave allocations by formula for 2024
export const PARENTAL_LEAVE_ALLOCATIONS: LeaveAllocation[] = [
  {
    formula: 'full-time',
    maxMonths: 4,
    minConsecutiveMonths: 1,
    canSplit: true, // Can split into periods of min 1 month
    ageLimit: 12,
  },
  {
    formula: 'half-time',
    maxMonths: 8,
    minConsecutiveMonths: 2,
    canSplit: true, // Can split into periods of min 2 months
    ageLimit: 12,
  },
  {
    formula: 'one-fifth',
    maxMonths: 20,
    minConsecutiveMonths: 5,
    canSplit: true, // Can split into periods of min 5 months
    ageLimit: 12,
  },
  {
    formula: 'one-tenth',
    maxMonths: 40,
    canSplit: false, // Special agreement with employer
    ageLimit: 12,
  },
];

// Parental leave benefits for 2024 (ONEM/RVA rates)
export const PARENTAL_BENEFITS_2024: ParentalBenefit[] = [
  {
    formula: 'full-time',
    monthlyAmount: 879.05,    // Gross amount
    netAmount: 791.15,        // After 10% social contribution
    taxExempt: false,         // Subject to withholding tax
  },
  {
    formula: 'half-time',
    monthlyAmount: 439.53,
    netAmount: 395.58,
    taxExempt: false,
  },
  {
    formula: 'one-fifth',
    monthlyAmount: 148.88,    // For employees under 50
    netAmount: 134.00,
    taxExempt: false,
  },
  {
    formula: 'one-tenth',
    monthlyAmount: 74.44,
    netAmount: 67.00,
    taxExempt: false,
  },
];

// Enhanced rates for single parents or children with disabilities
export const ENHANCED_PARENTAL_BENEFITS_2024: ParentalBenefit[] = [
  {
    formula: 'full-time',
    monthlyAmount: 1054.86,   // Single parent or disabled child
    netAmount: 949.37,
    taxExempt: false,
  },
  {
    formula: 'half-time',
    monthlyAmount: 527.43,
    netAmount: 474.69,
    taxExempt: false,
  },
  {
    formula: 'one-fifth',
    monthlyAmount: 178.66,    // Enhanced rate
    netAmount: 160.79,
    taxExempt: false,
  },
];

// Time credit system (separate from parental leave)
export const TIME_CREDIT_SYSTEM: TimeCredit = {
  type: 'with-reason',
  reason: 'standard',
  maxMonths: {
    fullTime: 51,  // Career total with reasons
    halfTime: 51,
    oneFifth: 51,
  },
  benefit: {
    formula: 'full-time',
    monthlyAmount: 594.45,    // Lower than parental leave
    netAmount: 535.01,
    taxExempt: false,
  },
};

export const PARENTAL_LEAVE_CONSTANTS = {
  MIN_SENIORITY_MONTHS: 12,     // Must work 12 months with employer
  NOTICE_TO_EMPLOYER_MONTHS: 3, // 3 months notice (6 weeks if < 20 employees)
  NOTICE_TO_ONEM_WEEKS: 2,      // 2 weeks before start
  MAX_CHILD_AGE_STANDARD: 12,   // Standard age limit
  MAX_CHILD_AGE_DISABILITY: 21,  // With disability (4+ points)
  MIN_DISABILITY_POINTS: 4,     // For extended age limit
  ADOPTION_EXTRA_YEARS: 0,      // Same as biological children
  PAYMENT_DELAY_DAYS: 30,       // Payment within 30 days
  EMPLOYER_SIZE_THRESHOLD: 10,  // Different rules < 10 employees
  REQUIRED_DOCUMENTS: [
    'birth_certificate',
    'employment_contract',
    'employer_agreement_form',
    'C4_form_parental_leave',
    'salary_slips_3_months',
    'disability_certificate', // If applicable
  ],
  FLEXIBLE_ARRANGEMENTS: {
    'one-tenth': {
      requiresCAO: true, // Requires collective agreement
      flexibleSchedule: true,
      examples: [
        '1 afternoon per week',
        '1 day every 2 weeks',
        '2 half-days per week',
      ],
    },
  },
};