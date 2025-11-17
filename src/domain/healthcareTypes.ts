/**
 * Healthcare and Disability Benefits Types
 * Comprehensive type definitions for Belgian healthcare and disability assistance programs
 */

export enum HealthRegion {
  FEDERAL = 'federal',
  BRUSSELS = 'brussels',
  WALLONIA = 'wallonia',
  FLANDERS = 'flanders'
}

export enum DisabilityCategory {
  CATEGORY_A = 'A', // 7-8 points autonomy loss
  CATEGORY_B = 'B', // 9-11 points autonomy loss
  CATEGORY_C = 'C', // 12-14 points autonomy loss
  CATEGORY_D = 'D', // 15-16 points autonomy loss
  CATEGORY_E = 'E', // 17-18 points autonomy loss
}

export enum DisabilityLevel {
  LEVEL_I = 'I',   // 0-20% capacity loss
  LEVEL_II = 'II',  // 21-40% capacity loss
  LEVEL_III = 'III', // 41-60% capacity loss
  LEVEL_IV = 'IV',  // 61-80% capacity loss
  LEVEL_V = 'V',   // 81-100% capacity loss
}

export enum AutonomyDomain {
  MOBILITY = 'mobility',
  NUTRITION = 'nutrition',
  HYGIENE = 'hygiene',
  HOUSEHOLD = 'household',
  SUPERVISION = 'supervision',
  SOCIAL = 'social',
  COMMUNICATION = 'communication',
  ADAPTATION = 'adaptation'
}

export enum HealthcareStatus {
  BIM = 'BIM', // Beneficiary of Increased Intervention
  OMNIO = 'OMNIO', // Extended increased intervention
  STANDARD = 'standard',
  CHRONICALLY_ILL = 'chronically-ill',
  PALLIATIVE = 'palliative'
}

export enum SickLeaveType {
  SHORT_TERM = 'short-term', // < 30 days
  LONG_TERM = 'long-term',   // 31-365 days
  DISABILITY = 'disability',   // > 365 days
  MATERNITY = 'maternity',
  WORK_ACCIDENT = 'work-accident',
  OCCUPATIONAL_DISEASE = 'occupational-disease'
}

export enum ChronicConditionCategory {
  DIABETES = 'diabetes',
  CANCER = 'cancer',
  CARDIOVASCULAR = 'cardiovascular',
  RESPIRATORY = 'respiratory',
  RENAL = 'renal',
  NEUROLOGICAL = 'neurological',
  PSYCHIATRIC = 'psychiatric',
  RARE_DISEASE = 'rare-disease'
}

export enum MedicalExpenseType {
  CONSULTATION = 'consultation',
  MEDICATION = 'medication',
  HOSPITALIZATION = 'hospitalization',
  SURGERY = 'surgery',
  THERAPY = 'therapy',
  MEDICAL_DEVICES = 'medical-devices',
  TRANSPORT = 'transport',
  HOME_CARE = 'home-care'
}

export interface HealthcareApplicant {
  id: string;
  region: HealthRegion;
  age: number;
  healthcareStatus: HealthcareStatus;
  monthlyIncome: number;
  annualIncome: number;
  householdMembers: number;
  dependents: number;
  hasChronicCondition: boolean;
  chronicConditions?: ChronicConditionCategory[];
  isEmployed: boolean;
  isSelfEmployed: boolean;
  isPensioner: boolean;
  mutualityNumber: string;
}

export interface DisabilityAssessment {
  applicantId: string;
  assessmentDate: Date;
  disabilityCategory?: DisabilityCategory;
  disabilityLevel: DisabilityLevel;
  autonomyPoints: number;
  autonomyLoss: Record<AutonomyDomain, number>;
  medicalCertificates: string[];
  nextReviewDate?: Date;
  isPermanent: boolean;
  workCapacity: number; // percentage
}

export interface SickLeaveRecord {
  employeeId: string;
  type: SickLeaveType;
  startDate: Date;
  endDate?: Date;
  totalDays: number;
  grossSalary: number;
  dailyWage: number;
  employer: string;
  medicalCertificate: string;
  isPartialReturn?: boolean;
  returnToWorkPlan?: boolean;
}

export interface ChronicIllnessFile {
  patientId: string;
  conditions: ChronicConditionCategory[];
  diagnosisDate: Date;
  treatmentPlan: string;
  medications: string[];
  annualMedicalCost: number;
  forfaitChronique?: boolean; // Chronic illness lump sum
  maximumBill?: boolean; // MAF - Maximum à facturer
}

export interface MedicalExpense {
  type: MedicalExpenseType;
  date: Date;
  provider: string;
  totalCost: number;
  officialRate: number;
  personalContribution: number;
  reimbursement: number;
  isConventioned: boolean;
  prescription?: string;
}

// Disability Allowance Amounts (ARR - Allocation de Remplacement de Revenus)
export interface DisabilityAllowanceARR {
  categoryA: {
    single: number;
    cohabitant: number;
    family: number;
  };
  categoryB: {
    single: number;
    cohabitant: number;
    family: number;
  };
  categoryC: {
    single: number;
    cohabitant: number;
    family: number;
  };
}

// Integration Allowance (AI - Allocation d'Intégration)
export interface IntegrationAllowanceAI {
  levelI: number;
  levelII: number;
  levelIII: number;
  levelIV: number;
  levelV: number;
}

// BIM (Increased Intervention) Thresholds
export interface BIMThresholds {
  single: number;
  household: number;
  perDependent: number;
  categories: {
    pensioner: number;
    disabled: number;
    orphan: number;
    longTermUnemployed: number;
  };
}

// Sick Leave Compensation Rates
export interface SickLeaveCompensation {
  shortTerm: {
    days1to30: {
      employed: number; // percentage of salary
      selfEmployed: number;
    };
  };
  longTerm: {
    days31to365: {
      employed: number;
      selfEmployed: number;
    };
  };
  disability: {
    afterYear1: {
      withDependents: number;
      single: number;
      cohabitant: number;
    };
    minAmount: number;
    maxAmount: number;
  };
}

// Maximum Medical Bill (MAF - Maximum à Facturer)
export interface MaximumMedicalBill {
  incomeCategories: {
    category1: { limit: number; ceiling: number }; // Lowest income
    category2: { limit: number; ceiling: number };
    category3: { limit: number; ceiling: number };
    category4: { limit: number; ceiling: number };
    category5: { limit: number; ceiling: number }; // Highest income
  };
  socialMAF: {
    BIM: number;
    chronicIllness: number;
    child: number;
  };
}

// Healthcare Reimbursement Rates
export interface ReimbursementRates {
  standard: {
    generalPractitioner: number;
    specialist: number;
    medication: {
      categoryA: number; // Vital
      categoryB: number; // Therapeutic
      categoryC: number; // Symptomatic
      categoryD: number; // Comfort
    };
  };
  increased: { // BIM rates
    generalPractitioner: number;
    specialist: number;
    medication: {
      categoryA: number;
      categoryB: number;
      categoryC: number;
      categoryD: number;
    };
  };
}

// Chronic Care Benefits
export interface ChronicCareBenefits {
  forfaitChronique: {
    simple: number; // Annual amount
    complex: number;
  };
  diabetes: {
    convention: number;
    materials: number;
  };
  dialysis: {
    transport: number;
    homeDialysis: number;
  };
  palliative: {
    homeCare: number;
    dayForfait: number;
  };
}

// Calculation Results
export interface DisabilityAllowanceResult {
  isEligible: boolean;
  type: 'ARR' | 'AI' | 'combined';
  arrAmount?: number;
  aiAmount?: number;
  totalMonthly?: number;
  category?: DisabilityCategory;
  level?: DisabilityLevel;
  nextReview?: Date;
  reason?: string;
}

export interface BIMStatusResult {
  isEligible: boolean;
  category?: string;
  incomeThreshold?: number;
  householdIncome?: number;
  reimbursementIncrease?: number;
  additionalBenefits?: string[];
  validity?: Date;
  reason?: string;
}

export interface SickLeaveResult {
  isEligible: boolean;
  type?: SickLeaveType;
  dailyBenefit?: number;
  monthlyBenefit?: number;
  compensationRate?: number;
  remainingDays?: number;
  returnToWorkSupport?: string[];
  reason?: string;
}

export interface ChronicCareResult {
  isEligible: boolean;
  benefits: string[];
  forfaitAmount?: number;
  maxBillCeiling?: number;
  additionalReimbursements?: Record<string, number>;
  yearlySupport?: number;
  reason?: string;
}

export interface MAFResult {
  isEligible: boolean;
  incomeCategory?: number;
  annualCeiling?: number;
  currentExpenses?: number;
  reimbursableAmount?: number;
  socialMAF?: boolean;
  reason?: string;
}

// 2024 Healthcare Constants and Amounts
export const DISABILITY_ALLOWANCE_ARR_2024: DisabilityAllowanceARR = {
  categoryA: {
    single: 1119.21,
    cohabitant: 746.14,
    family: 1529.91
  },
  categoryB: {
    single: 1337.28,
    cohabitant: 964.21,
    family: 1747.98
  },
  categoryC: {
    single: 1629.36,
    cohabitant: 1256.29,
    family: 2040.06
  }
};

export const INTEGRATION_ALLOWANCE_AI_2024: IntegrationAllowanceAI = {
  levelI: 118.37,   // 7-8 points
  levelII: 357.86,  // 9-11 points
  levelIII: 571.46, // 12-14 points
  levelIV: 833.83,  // 15-16 points
  levelV: 1119.21   // 17-18 points
};

export const BIM_THRESHOLDS_2024: BIMThresholds = {
  single: 22251.48,
  household: 30847.05,
  perDependent: 4116.58,
  categories: {
    pensioner: 20365.47,
    disabled: 22251.48,
    orphan: 22251.48,
    longTermUnemployed: 22251.48
  }
};

export const SICK_LEAVE_COMPENSATION_2024: SickLeaveCompensation = {
  shortTerm: {
    days1to30: {
      employed: 1.00, // 100% paid by employer
      selfEmployed: 0.00 // No compensation first month
    }
  },
  longTerm: {
    days31to365: {
      employed: 0.60, // 60% of salary
      selfEmployed: 0.60
    }
  },
  disability: {
    afterYear1: {
      withDependents: 0.65,
      single: 0.55,
      cohabitant: 0.40
    },
    minAmount: 48.54, // Daily minimum
    maxAmount: 162.32 // Daily maximum
  }
};

export const MAXIMUM_MEDICAL_BILL_2024: MaximumMedicalBill = {
  incomeCategories: {
    category1: { limit: 11730, ceiling: 250 },
    category2: { limit: 19566, ceiling: 450 },
    category3: { limit: 30148, ceiling: 650 },
    category4: { limit: 40876, ceiling: 1000 },
    category5: { limit: 51604, ceiling: 1400 }
  },
  socialMAF: {
    BIM: 250,
    chronicIllness: 100,
    child: 100
  }
};

export const REIMBURSEMENT_RATES_2024: ReimbursementRates = {
  standard: {
    generalPractitioner: 0.75,
    specialist: 0.75,
    medication: {
      categoryA: 1.00, // 100% reimbursed
      categoryB: 0.75,
      categoryC: 0.50,
      categoryD: 0.20
    }
  },
  increased: {
    generalPractitioner: 0.90,
    specialist: 0.90,
    medication: {
      categoryA: 1.00,
      categoryB: 0.85,
      categoryC: 0.60,
      categoryD: 0.20
    }
  }
};

export const CHRONIC_CARE_BENEFITS_2024: ChronicCareBenefits = {
  forfaitChronique: {
    simple: 320, // Annual
    complex: 640
  },
  diabetes: {
    convention: 500, // Annual for materials
    materials: 1200
  },
  dialysis: {
    transport: 0.30, // Per km
    homeDialysis: 2500 // Annual equipment support
  },
  palliative: {
    homeCare: 737.68, // One-time payment
    dayForfait: 42.46
  }
};

export const HEALTHCARE_CONSTANTS = {
  MIN_AUTONOMY_POINTS_FOR_AI: 7,
  MIN_DISABILITY_PERCENTAGE: 66, // For ARR eligibility
  MAX_WORK_CAPACITY_FOR_DISABILITY: 33, // percentage
  BIM_VALIDITY_PERIOD: 12, // months
  DISABILITY_REVIEW_PERIOD: 60, // months for permanent
  SICK_LEAVE_MAX_DURATION: 365, // days before disability
  CHRONIC_ILLNESS_MIN_COST: 300, // Annual medical cost
  MAF_CALCULATION_PERIOD: 12, // months
  MUTUALITY_CONTRIBUTION: {
    EMPLOYED: 0.0435, // 4.35% of gross salary
    SELF_EMPLOYED: 0.0435,
    PENSIONER: 0.0365
  },
  THIRD_PARTY_PAYER: true, // Direct billing to mutuality
  GLOBAL_MEDICAL_FILE: {
    COST: 30, // Annual
    REIMBURSEMENT: 0.30 // 30% extra for consultations
  }
};