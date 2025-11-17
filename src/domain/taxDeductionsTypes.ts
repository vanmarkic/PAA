/**
 * Tax Deductions and Benefits Types
 * Comprehensive type definitions for Belgian tax benefits and deductions
 */

export enum TaxRegion {
  FEDERAL = 'federal',
  BRUSSELS = 'brussels',
  WALLONIA = 'wallonia',
  FLANDERS = 'flanders'
}

export enum TaxStatus {
  SINGLE = 'single',
  MARRIED_JOINT = 'married-joint',
  MARRIED_SEPARATE = 'married-separate',
  COHABITANT_LEGAL = 'cohabitant-legal',
  WIDOWED = 'widowed',
  DIVORCED = 'divorced'
}

export enum IncomeCategory {
  EMPLOYED = 'employed',
  SELF_EMPLOYED = 'self-employed',
  PENSION = 'pension',
  UNEMPLOYMENT = 'unemployment',
  DISABILITY = 'disability',
  STUDENT = 'student',
  MIXED = 'mixed'
}

export enum ChildcareType {
  CRECHE = 'creche',
  REGISTERED_CHILDMINDER = 'registered-childminder',
  AFTER_SCHOOL = 'after-school',
  HOLIDAY_CAMP = 'holiday-camp',
  PRESCHOOL = 'preschool'
}

export enum MortgageType {
  PRIMARY_RESIDENCE = 'primary-residence',
  SECOND_RESIDENCE = 'second-residence',
  INVESTMENT_PROPERTY = 'investment-property',
  RENOVATION_LOAN = 'renovation-loan',
  GREEN_LOAN = 'green-loan'
}

export enum ServiceVoucherType {
  CLEANING = 'cleaning',
  IRONING = 'ironing',
  COOKING = 'cooking',
  SHOPPING = 'shopping',
  TRANSPORT = 'transport'
}

export enum CharityCategory {
  RECOGNIZED_INSTITUTION = 'recognized-institution',
  UNIVERSITY = 'university',
  CULTURAL_INSTITUTION = 'cultural-institution',
  POLITICAL_PARTY = 'political-party',
  UNION_FEES = 'union-fees'
}

export enum PensionSavingType {
  PENSION_SAVING = 'pension-saving',
  LONG_TERM_SAVING = 'long-term-saving',
  INDIVIDUAL_PENSION = 'individual-pension',
  EMPLOYER_GROUP_INSURANCE = 'employer-group-insurance'
}

export enum TaxBracket {
  BRACKET_25 = '25',
  BRACKET_40 = '40',
  BRACKET_45 = '45',
  BRACKET_50 = '50'
}

export interface TaxPayer {
  id: string;
  taxRegion: TaxRegion;
  taxStatus: TaxStatus;
  age: number;
  grossIncome: number;
  netTaxableIncome: number;
  incomeCategory: IncomeCategory;
  dependentChildren: number;
  dependentOthers: number;
  disabledDependents: number;
  spouseIncome?: number;
  pensionAge?: boolean;
  currentTaxBracket: TaxBracket;
}

export interface ChildcareExpense {
  childId: string;
  childAge: number;
  type: ChildcareType;
  provider: {
    name: string;
    registrationNumber: string;
    isRegistered: boolean;
  };
  daysOfCare: number;
  totalCost: number;
  attestation202?: boolean; // Official childcare attestation
}

export interface MortgageDetails {
  type: MortgageType;
  startDate: Date;
  originalAmount: number;
  remainingCapital: number;
  annualInterest: number;
  annualCapital: number;
  insurancePremium: number;
  propertyAcquisitionDate: Date;
  isOnlyResidence: boolean;
  hasGreenCertificate?: boolean;
}

export interface ServiceVoucherUsage {
  type: ServiceVoucherType;
  vouchersUsed: number;
  costPerVoucher: number;
  totalCost: number;
  providerVAT: string;
  electronically: boolean;
}

export interface CharityDonation {
  category: CharityCategory;
  institution: string;
  amount: number;
  attestation: string;
  date: Date;
}

export interface PensionSavingContribution {
  type: PensionSavingType;
  annualContribution: number;
  contractNumber: string;
  institution: string;
  startYear: number;
  isTaxExempt: boolean;
}

export interface InsulationWork {
  workType: 'roof' | 'walls' | 'floor' | 'windows';
  invoiceAmount: number;
  contractorVAT: string;
  completionDate: Date;
  surface: number; // m²
  rValue?: number; // Insulation value
  hasEnergyAudit: boolean;
}

// Childcare Deduction Rates
export interface ChildcareDeductionRates {
  maxDailyAmount: number;
  maxAnnualDays: number;
  deductionRate: {
    standard: number;
    increased: number; // For low income
  };
  ageLimit: number;
  incomeThresholds: {
    increasedRate: number;
    phaseOut: number;
  };
}

// Mortgage Interest Deduction
export interface MortgageDeductionLimits {
  federal: {
    baseCeiling: number;
    first10Years: number;
    after10Years: number;
    reconstructionBonus: number;
  };
  regional: {
    brussels: number;
    wallonia: number;
    flanders: number;
  };
  greenLoanBonus: number;
  maxDeductibleYears: number;
}

// Service Voucher Deduction
export interface ServiceVoucherDeduction {
  maxVouchersDeductible: number;
  deductionRate: number;
  pricePerVoucher: {
    first400: number;
    after400: number;
  };
  maxTaxBenefit: number;
}

// Charity Donation Limits
export interface CharityDeductionLimits {
  minAmount: number;
  maxPercentageIncome: number;
  maxAbsoluteAmount: number;
  deductionRate: {
    standard: number;
    cultural: number;
    university: number;
  };
}

// Pension Saving Limits
export interface PensionSavingLimits {
  standard: {
    maxAmount: number;
    taxReduction: number; // percentage
  };
  increased: {
    maxAmount: number;
    taxReduction: number;
  };
  longTermSaving: {
    maxPercentageIncome: number;
    maxAbsolute: number;
  };
}

// Insulation Premium Tax Benefits
export interface InsulationTaxBenefit {
  maxAmount: number;
  deductionRate: {
    standard: number;
    energyEfficient: number;
  };
  requirements: {
    minRValue: number;
    professionalInstallation: boolean;
    energyAudit: boolean;
  };
  carryForward: number; // years
}

// Tax Credit Amounts
export interface TaxCreditAmounts {
  basicCredit: {
    single: number;
    married: number;
  };
  childCredit: {
    first: number;
    second: number;
    third: number;
    subsequent: number;
    disabled: number;
  };
  lowIncomeBonus: {
    threshold: number;
    amount: number;
  };
}

// Calculation Results
export interface ChildcareDeductionResult {
  isEligible: boolean;
  totalDaysEligible: number;
  maxDeductibleAmount: number;
  actualDeduction: number;
  taxSaving: number;
  effectiveRate: number;
  reason?: string;
}

export interface MortgageDeductionResult {
  isEligible: boolean;
  deductibleInterest: number;
  deductibleCapital: number;
  deductibleInsurance: number;
  totalDeduction: number;
  taxSaving: number;
  remainingYears: number;
  reason?: string;
}

export interface ServiceVoucherResult {
  isEligible: boolean;
  vouchersEligible: number;
  deductibleAmount: number;
  taxReduction: number;
  effectiveCost: number; // After tax benefit
  reason?: string;
}

export interface CharityDeductionResult {
  isEligible: boolean;
  totalDonations: number;
  eligibleAmount: number;
  taxReduction: number;
  effectiveRate: number;
  institutions: string[];
  reason?: string;
}

export interface PensionSavingResult {
  isEligible: boolean;
  regime: 'standard' | 'increased';
  maxContribution: number;
  actualContribution: number;
  taxReduction: number;
  projectedPension?: number;
  reason?: string;
}

export interface InsulationDeductionResult {
  isEligible: boolean;
  eligibleWorks: string[];
  totalInvoices: number;
  deductibleAmount: number;
  taxReduction: number;
  spreadOverYears: number;
  energySavings?: number; // Estimated annual savings
  reason?: string;
}

export interface TaxCreditResult {
  isEligible: boolean;
  basicCredit: number;
  childrenCredit: number;
  lowIncomeBonus: number;
  totalCredit: number;
  refundable: boolean;
  effectiveRate?: number;
  reason?: string;
}

// 2024 Tax Deduction Constants
export const CHILDCARE_DEDUCTION_2024: ChildcareDeductionRates = {
  maxDailyAmount: 16.40,
  maxAnnualDays: 230,
  deductionRate: {
    standard: 0.45,
    increased: 0.75
  },
  ageLimit: 14, // Extended to 21 for disabled children
  incomeThresholds: {
    increasedRate: 25000,
    phaseOut: 150000
  }
};

export const MORTGAGE_DEDUCTION_2024: MortgageDeductionLimits = {
  federal: {
    baseCeiling: 2350,
    first10Years: 760,
    after10Years: 380,
    reconstructionBonus: 1000
  },
  regional: {
    brussels: 2350,
    wallonia: 2290,
    flanders: 0 // Abolished in Flanders
  },
  greenLoanBonus: 500,
  maxDeductibleYears: 20
};

export const SERVICE_VOUCHER_2024: ServiceVoucherDeduction = {
  maxVouchersDeductible: 150,
  deductionRate: 0.20,
  pricePerVoucher: {
    first400: 9.00,
    after400: 10.80
  },
  maxTaxBenefit: 270 // 150 vouchers * 9 EUR * 0.20
};

export const CHARITY_DEDUCTION_2024: CharityDeductionLimits = {
  minAmount: 40,
  maxPercentageIncome: 0.10,
  maxAbsoluteAmount: 397850, // Very high income limit
  deductionRate: {
    standard: 0.45,
    cultural: 0.45,
    university: 0.60
  }
};

export const PENSION_SAVING_2024: PensionSavingLimits = {
  standard: {
    maxAmount: 1020,
    taxReduction: 0.30
  },
  increased: {
    maxAmount: 1310,
    taxReduction: 0.25
  },
  longTermSaving: {
    maxPercentageIncome: 0.15,
    maxAbsolute: 2450
  }
};

export const INSULATION_DEDUCTION_2024: InsulationTaxBenefit = {
  maxAmount: 3260,
  deductionRate: {
    standard: 0.30,
    energyEfficient: 0.45
  },
  requirements: {
    minRValue: 2.5,
    professionalInstallation: true,
    energyAudit: false
  },
  carryForward: 4
};

export const TAX_CREDIT_2024: TaxCreditAmounts = {
  basicCredit: {
    single: 320,
    married: 640
  },
  childCredit: {
    first: 460,
    second: 610,
    third: 1040,
    subsequent: 1230,
    disabled: 610 // Additional
  },
  lowIncomeBonus: {
    threshold: 15000,
    amount: 240
  }
};

export const TAX_CONSTANTS = {
  MIN_TAXABLE_INCOME: 9270,
  TAX_FREE_ALLOWANCE: {
    SINGLE: 9270,
    MARRIED: 18540,
    PER_DEPENDENT: 1730,
    DISABLED_DEPENDENT: 3460
  },
  TAX_BRACKETS: {
    BRACKET_25: { min: 0, max: 15200 },
    BRACKET_40: { min: 15200, max: 26830 },
    BRACKET_45: { min: 26830, max: 46440 },
    BRACKET_50: { min: 46440, max: Infinity }
  },
  MUNICIPAL_TAX_RANGE: { min: 0.00, max: 0.09 }, // 0-9% additional
  DEDUCTION_PRIORITY: [
    'mortgage',
    'pension-saving',
    'childcare',
    'service-voucher',
    'charity',
    'insulation'
  ],
  REFUNDABLE_CREDITS: true,
  TAX_YEAR_OFFSET: 1 // Income year N-1 for tax year N
};