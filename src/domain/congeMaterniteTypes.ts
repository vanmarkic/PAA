/**
 * Maternity Leave (Congé de Maternité) domain types
 * Belgian maternity leave system with salary replacement
 */

export type EmploymentStatus =
  | 'employee'
  | 'self-employed'
  | 'civil-servant'
  | 'unemployed'
  | 'student';

export type LeavePhase =
  | 'prenatal'     // Before birth
  | 'postnatal'    // After birth
  | 'extended';    // Optional extension

export type ComplicationType =
  | 'multiple-pregnancy'  // Twins, triplets
  | 'medical-risk'        // High-risk pregnancy
  | 'premature-birth'     // Before 37 weeks
  | 'hospitalization'     // Extended hospital stay
  | 'postpartum-complications';

export interface MaternityLeaveUser {
  id: string;
  employmentStatus: EmploymentStatus;
  employer?: string;
  monthlyGrossSalary?: number;
  dailyWage?: number; // For calculation
  weeksWorkedLastYear: number;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  hasComplications: boolean;
  complications?: ComplicationType[];
  isMultipleBirth: boolean;
  numberOfChildren?: number; // For multiple births
  startedWorkDate: Date; // Employment start date
}

export interface MaternityLeaveDuration {
  prenatalWeeks: {
    mandatory: number;    // Required prenatal leave
    optional: number;     // Can be taken or postponed
    medical: number;      // Medical leave before maternity
  };
  postnatalWeeks: {
    mandatory: number;    // Required postnatal leave
    transferable: number; // Unused prenatal transferred
    extension: number;    // Optional extension
  };
  totalWeeks: number;
  complicationExtension?: number;
}

export interface MaternityBenefit {
  employmentType: EmploymentStatus;
  calculationMethod: 'percentage' | 'fixed' | 'progressive';
  rates: {
    firstMonth: number;      // Percentage of salary
    afterFirstMonth: number; // Reduced percentage
    ceiling?: number;        // Maximum daily/monthly amount
  };
  minimumAmount?: number;
  maximumAmount?: number;
}

export interface MaternityLeaveResult {
  isEligible: boolean;
  employmentStatus: EmploymentStatus;
  leaveDuration: MaternityLeaveDuration;
  benefit: {
    dailyAmount: number;
    monthlyAmount: number;
    totalAmount: number;
    calculation: {
      baseSalary: number;
      percentage: number;
      cappedAmount: number;
    };
  };
  schedule: {
    prenatalStart: Date;
    prenatalEnd: Date;
    postnatalStart: Date;
    postnatalEnd: Date;
    totalEnd: Date;
    canExtendUntil?: Date;
  };
  paymentSchedule: {
    frequency: 'monthly' | 'weekly';
    payments: {
      date: Date;
      amount: number;
      period: string;
    }[];
  };
  requiredDocuments: string[];
  warnings?: string[];
}

export interface BreastfeedingBreak {
  eligibleUntilMonths: number;
  breaksPerDay: number;
  minutesPerBreak: number;
  isPaid: boolean;
  compensationRate?: number;
}

// Maternity leave duration constants
export const MATERNITY_LEAVE_DURATION: MaternityLeaveDuration = {
  prenatalWeeks: {
    mandatory: 1,      // 1 week mandatory before due date
    optional: 5,       // 5 weeks optional (can be taken or postponed)
    medical: 0,        // Additional medical leave if needed
  },
  postnatalWeeks: {
    mandatory: 9,      // 9 weeks mandatory after birth
    transferable: 5,   // Unused prenatal can be transferred
    extension: 0,      // No standard extension
  },
  totalWeeks: 15,     // Total standard maternity leave
};

// Benefit rates for different employment types
export const EMPLOYEE_MATERNITY_BENEFIT: MaternityBenefit = {
  employmentType: 'employee',
  calculationMethod: 'percentage',
  rates: {
    firstMonth: 82,       // 82% of gross salary first 30 days
    afterFirstMonth: 75,  // 75% after 30 days
    ceiling: 127.79,      // Maximum daily amount (2024)
  },
  minimumAmount: 51.12,   // Minimum daily benefit
  maximumAmount: 127.79,  // Maximum daily benefit
};

export const SELF_EMPLOYED_MATERNITY_BENEFIT: MaternityBenefit = {
  employmentType: 'self-employed',
  calculationMethod: 'fixed',
  rates: {
    firstMonth: 100,      // Fixed weekly amount
    afterFirstMonth: 100, // Same throughout
  },
  minimumAmount: 523.80,  // Weekly amount (2024)
  maximumAmount: 523.80,  // Fixed amount
};

export const CIVIL_SERVANT_MATERNITY_BENEFIT: MaternityBenefit = {
  employmentType: 'civil-servant',
  calculationMethod: 'percentage',
  rates: {
    firstMonth: 100,      // 100% of salary
    afterFirstMonth: 100, // Continues at 100%
  },
  // No ceiling for civil servants
};

// Complications and extensions
export const MATERNITY_COMPLICATIONS_EXTENSIONS = {
  'multiple-pregnancy': {
    additionalWeeks: 2,
    prenatal: true,
  },
  'medical-risk': {
    additionalWeeks: 0, // Case by case
    prenatal: true,
  },
  'premature-birth': {
    additionalWeeks: 0, // Postnatal extended by days of premature birth
    prenatal: false,
  },
  'hospitalization': {
    additionalWeeks: 0, // Extended by hospitalization days beyond 7
    prenatal: false,
  },
  'postpartum-complications': {
    additionalWeeks: 0, // Medical certificate required
    prenatal: false,
  },
};

// Breastfeeding breaks
export const BREASTFEEDING_BREAKS: BreastfeedingBreak = {
  eligibleUntilMonths: 9,
  breaksPerDay: 2,
  minutesPerBreak: 30,
  isPaid: true,
  compensationRate: 82, // 82% of hourly wage
};

export const MATERNITY_LEAVE_CONSTANTS = {
  MIN_EMPLOYMENT_DAYS: 120, // Minimum days worked in last 6 months
  MIN_INSURANCE_MONTHS: 6,  // Minimum months of social insurance
  PRENATAL_START_MAX_WEEKS: 6, // Can start max 6 weeks before due date
  POSTNATAL_MANDATORY_WEEKS: 9, // Must take 9 weeks after birth
  SALARY_REFERENCE_PERIOD_MONTHS: 3, // Last 3 months for calculation
  APPLICATION_DEADLINE_WEEKS: 4, // Apply 4 weeks before leave
  STILLBIRTH_LEAVE_WEEKS: 9, // Full postnatal leave for stillbirth > 180 days
  REQUIRED_DOCUMENTS: [
    'medical_certificate_pregnancy',
    'expected_delivery_date_certificate',
    'employment_contract',
    'salary_slips_3_months',
    'social_insurance_card',
    'bank_account_details',
  ],
};