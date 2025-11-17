/**
 * Unemployment benefit (Allocations de Chômage) domain types
 */

export type UnemploymentCategory =
  | 'travailleur avec charge de famille'
  | 'isolé'
  | 'cohabitant';

export type UnemploymentReason =
  | 'licenciement-economique'
  | 'fin-contrat-determine'
  | 'licenciement-force-majeure'
  | 'chomage-temporaire'
  | 'demission-volontaire'
  | 'fin-etudes';

export type UnemploymentBenefitType =
  | 'chomage-complet'
  | 'chomage-temporaire'
  | 'allocation-insertion';

export type RegionalService = 'ONEM' | 'VDAB' | 'Forem' | 'Actiris';

export interface EmploymentHistory {
  totalDaysWorked: number;
  periodInMonths: number; // 18 months for < 36 years, 24 months for >= 36 years
  lastEmploymentEndDate: Date;
  lastEmploymentEndReason: UnemploymentReason;
  lastGrossSalary: number;
  employmentType: 'temps-plein' | 'temps-partiel';
}

export interface UnemploymentUser {
  id: string;
  age: number;
  category: UnemploymentCategory;
  employmentHistory: EmploymentHistory;
  isRegisteredWithService: boolean;
  regionalService?: RegionalService;
  isAvailableForWork: boolean;
  hasValidDismissalReason: boolean;
  sanctionPeriodWeeks?: number; // 4-52 weeks for voluntary resignation
  monthsReceivingBenefits?: number; // For degressive calculation
}

export interface UnemploymentCalculation {
  baseSalary: number;
  applicablePercentage: number; // 75% family, 60% isolated, 55% cohabitant
  dailyCeiling: number;
  monthlyAmount: number;
  benefitPhase: 1 | 2 | 3; // Phase 1: full, Phase 2: degressive, Phase 3: flat rate
}

export interface UnemploymentAmounts {
  familyCharge: {
    percentage: number;
    minimumDaily: number;
    maximumDaily: number;
  };
  isolated: {
    percentage: number;
    minimumDaily: number;
    maximumDaily: number;
  };
  cohabitant: {
    percentage: number;
    minimumDaily: number;
    maximumDaily: number;
  };
  dailyCeiling: number;
  temporaryUnemploymentPercentage: number; // 65% for force majeure, 60% otherwise
}

export interface UnemploymentEligibilityResult {
  isEligible: boolean;
  benefitType?: UnemploymentBenefitType;
  category?: UnemploymentCategory;
  monthlyAmount?: number;
  dailyAmount?: number;
  percentage?: number;
  maxDurationMonths?: number;
  currentPhase?: 1 | 2 | 3;
  reason?: string;
  obligations?: string[];
  sanctionPeriod?: {
    weeks: number;
    startDate?: Date;
    endDate?: Date;
  };
}

export interface InsertionAllowance {
  userId: string;
  stageDaysCompleted: number;
  diplomaObtained: boolean;
  age: number;
  maxDurationMonths: number; // Limited to 12 months since 2024 reform
  category: UnemploymentCategory;
  monthlyAmount: number;
}

export interface TemporaryUnemployment {
  reason: 'force-majeure' | 'economic' | 'weather' | 'technical';
  startDate: Date;
  expectedEndDate?: Date;
  percentage: number; // 65% for force majeure, 60% for others
  employerDeclaration: boolean;
  immediateEligibility: boolean; // No waiting period for force majeure
}

// Constants for 2024
export const UNEMPLOYMENT_AMOUNTS_2024: UnemploymentAmounts = {
  familyCharge: {
    percentage: 75,
    minimumDaily: 55.00,
    maximumDaily: 65.48,
  },
  isolated: {
    percentage: 60,
    minimumDaily: 44.00,
    maximumDaily: 65.48,
  },
  cohabitant: {
    percentage: 55,
    minimumDaily: 33.00,
    maximumDaily: 65.48,
  },
  dailyCeiling: 65.48, // EUR per day
  temporaryUnemploymentPercentage: 65, // For force majeure
};

export const UNEMPLOYMENT_CONSTANTS = {
  MIN_AGE: 18,
  MIN_DAYS_UNDER_36: 312, // Days in 18 months
  MIN_DAYS_36_AND_OVER: 468, // Days in 24 months
  PERIOD_MONTHS_UNDER_36: 18,
  PERIOD_MONTHS_36_AND_OVER: 24,
  MAX_DURATION_PHASE_1: 12, // months
  MAX_DURATION_PHASE_2: 12, // months
  MAX_MONTHLY_AMOUNT: 1440, // EUR (approximation based on daily ceiling)
  INSERTION_STAGE_DAYS: 310,
  INSERTION_MAX_DURATION_MONTHS: 12, // Since 2024 reform
  SANCTION_MIN_WEEKS: 4,
  SANCTION_MAX_WEEKS: 52,
};

export interface UnemploymentObligations {
  registrationRequired: boolean;
  activeJobSearch: boolean;
  acceptSuitableWork: boolean;
  attendConvocations: boolean;
  declareAllActivities: boolean;
  residenceInBelgium: boolean;
  controlCardRequired: boolean; // C3 card stamps
  reportChanges: boolean;
}

export interface TrainingCompatibility {
  canCombineWithTraining: boolean;
  maintainBenefits: boolean;
  trainingAllowance: number; // 1 EUR per hour
  requiresApproval: boolean;
  approvedBy?: RegionalService;
}

export interface AGRTransition {
  eligibleForAGR: boolean;
  newPartTimeJob: boolean;
  previousFullTimeBenefits: boolean;
  referenceWage: number;
  partTimeWage: number;
  agrSupplement?: number;
}