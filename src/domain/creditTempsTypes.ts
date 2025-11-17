/**
 * Time credit and career interruption (Crédit-temps et Interruption de Carrière) domain types
 */

export type TimeOffType =
  | 'credit-temps-avec-motif' // Time credit with reason
  | 'interruption-carriere' // Career interruption (public sector)
  | 'conge-parental' // Parental leave
  | 'conge-assistance-medicale' // Medical assistance leave
  | 'conge-soins-palliatifs' // Palliative care leave
  | 'credit-temps-fin-carriere' // End-of-career time credit
  | 'credit-temps-formation'; // Training time credit

export type TimeOffReason =
  | 'soins-enfant' // Child care
  | 'soins-famille' // Family member care
  | 'assistance-medicale' // Medical assistance
  | 'soins-palliatifs' // Palliative care
  | 'formation' // Training/education
  | 'fin-carriere' // Career end
  | 'sans-motif'; // No reason (abolished since 2017)

export type ReductionType =
  | 'temps-plein' // Full-time interruption
  | '1/2-temps' // Half-time reduction
  | '1/5-temps'; // 1/5 time reduction

export type EmploymentSector =
  | 'prive' // Private sector
  | 'public-statutaire' // Public sector statutory
  | 'public-contractuel'; // Public sector contractual

export type FamilySituation =
  | 'isole' // Single
  | 'cohabitant' // Cohabitant
  | 'famille'; // Family

export interface TimeOffUser {
  id: string;
  age: number;
  sector: EmploymentSector;
  yearsOfService: number;
  careerYears: number;
  currentWorkRegime: 'temps-plein' | 'temps-partiel';
  familySituation: FamilySituation;
  childrenAges?: number[];
  employerSize: number; // Number of employees
  previousTimeOffMonths?: number; // Already used
  remainingCredits?: number; // Months remaining
}

export interface TimeOffRequest {
  type: TimeOffType;
  reason: TimeOffReason;
  reductionType: ReductionType;
  requestedDurationMonths: number;
  startDate: Date;
  endDate?: Date;
  justification?: string;
  medicalCertificate?: boolean;
  employerAgreement?: boolean;
}

export interface ParentalLeave {
  childAge: number;
  maxAgeLimit: number; // 12 years, 21 for disabled
  durationMonths: number; // 4 months per child
  reductionType: ReductionType;
  allocation: number; // Monthly amount
  employerCannotRefuse: boolean;
  protectionPeriod: number; // 3 months after return
  fractionalUse: boolean; // Can be taken in parts
}

export interface MedicalAssistanceLeave {
  familyMemberRelation: string;
  medicalCondition: 'grave' | 'chronique';
  maxDurationMonths: number; // 12 months, extendable to 24
  allocation: number;
  certificateFrequency: number; // Every 3 months
  extensionPossible: boolean;
}

export interface PalliativeCareLeave {
  patientRelation: string;
  durationMonths: number; // 1 month, renewable once
  allocation: number; // Higher than other types
  employerCannotRefuse: boolean;
  fractionalUse: boolean;
  urgentProcedure: boolean;
}

export interface EndOfCareerCredit {
  minimumAge: number; // 55 with conditions, 60 standard
  minimumCareerYears: number; // 25 years
  reductionType: '1/5-temps' | '1/2-temps';
  untilPension: boolean;
  allocation: number;
  specialRegimes?: {
    heavyWork?: boolean;
    nightWork?: boolean;
    minimumAge?: number; // Can be lower
  };
}

export interface TimeOffAllocation {
  grossAmount: number;
  netAmount: number;
  familySituationBonus?: number;
  ageBonus?: number;
  reductionType: ReductionType;
  paymentFrequency: 'mensuel';
}

export interface TimeOffEligibilityResult {
  isEligible: boolean;
  timeOffType?: TimeOffType;
  maxDurationMonths?: number;
  allocation?: TimeOffAllocation;
  employerCanRefuse?: boolean;
  refusalReasons?: string[];
  protectionAgainstDismissal?: boolean;
  protectionDurationMonths?: number;
  obligations?: string[];
  applicationProcedure?: string;
  reason?: string;
}

export interface BreakAtWorkApplication {
  mandatorySince: Date; // October 2024
  requiresEID: boolean;
  onlineOnly: boolean;
  processingTimeDays: number; // 30 days max
  digitalDecision: boolean;
  remainingCreditsVisible: boolean;
}

// Constants for 2024
export const TIME_OFF_AMOUNTS_2024 = {
  // Parental leave allocations (net monthly)
  PARENTAL_FULL_TIME_ISOLATED: 899.20,
  PARENTAL_FULL_TIME_COHABITANT: 719.36,
  PARENTAL_HALF_TIME_ISOLATED: 449.60,
  PARENTAL_HALF_TIME_COHABITANT: 359.68,
  PARENTAL_FIFTH_TIME_ISOLATED: 179.84,
  PARENTAL_FIFTH_TIME_COHABITANT: 143.87,

  // Medical assistance allocations (net monthly)
  MEDICAL_FULL_TIME_ISOLATED: 1328.20,
  MEDICAL_FULL_TIME_COHABITANT: 1062.56,
  MEDICAL_HALF_TIME_ISOLATED: 664.10,
  MEDICAL_HALF_TIME_COHABITANT: 531.28,
  MEDICAL_FIFTH_TIME_ISOLATED: 265.64,
  MEDICAL_FIFTH_TIME_COHABITANT: 212.51,

  // Palliative care allocations (net monthly)
  PALLIATIVE_FULL_TIME: 1528.78,
  PALLIATIVE_HALF_TIME: 764.39,
  PALLIATIVE_FIFTH_TIME: 305.76,

  // End of career allocations (net monthly)
  END_CAREER_HALF_TIME_ISOLATED: 664.10,
  END_CAREER_HALF_TIME_COHABITANT: 531.28,
  END_CAREER_FIFTH_TIME_ISOLATED: 271.15,
  END_CAREER_FIFTH_TIME_COHABITANT: 216.92,

  // Career interruption public sector (net monthly)
  INTERRUPTION_FULL_TIME_ISOLATED: 766.42,
  INTERRUPTION_FULL_TIME_COHABITANT: 613.14,
  INTERRUPTION_HALF_TIME_ISOLATED: 383.21,
  INTERRUPTION_HALF_TIME_COHABITANT: 306.57,
};

export const TIME_OFF_CONSTANTS = {
  MAX_TIME_CREDIT_MONTHS: 51, // Over entire career with reason
  PARENTAL_LEAVE_PER_CHILD: 4, // months
  PARENTAL_LEAVE_MAX_CHILD_AGE: 12, // years (21 for disabled)
  MEDICAL_ASSISTANCE_INITIAL: 12, // months
  MEDICAL_ASSISTANCE_EXTENDED: 24, // months total
  PALLIATIVE_CARE_INITIAL: 1, // month
  PALLIATIVE_CARE_EXTENDED: 2, // months total
  END_CAREER_MIN_AGE_FIFTH: 55, // with conditions
  END_CAREER_MIN_AGE_HALF: 60, // standard
  END_CAREER_MIN_CAREER_YEARS: 25,
  PROTECTION_AFTER_RETURN: 3, // months
  SMALL_EMPLOYER_THRESHOLD: 10, // employees
  SMALL_EMPLOYER_POSTPONEMENT: 6, // months max
  TRAINING_CREDIT_MAX: 36, // months
  PUBLIC_SECTOR_MAX_INTERRUPTION: 60, // months over career
  BREAK_AT_WORK_PROCESSING: 30, // days
  CERTIFICATE_RENEWAL_FREQUENCY: 3, // months for medical
};

export interface TimeOffObligations {
  notifyEmployerInAdvance: boolean;
  notificationPeriodMonths: number; // Usually 3 months
  provideJustification: boolean;
  maintainMedicalCertificates?: boolean;
  followTrainingProgram?: boolean; // For training credit
  notifyChanges: boolean;
  returnOnScheduledDate: boolean;
  noCompetingActivity: boolean;
  residenceInBelgium?: boolean;
}

export interface EmployerRights {
  canPostpone?: boolean;
  postponementMaxMonths?: number;
  postponementReasons?: string[];
  mustJustifyRefusal: boolean;
  replacementWorker?: boolean;
  onssReduction?: boolean; // For replacement worker
}

export interface PensionImpact {
  periodsAssimilated: boolean;
  assimilatedGratuitously?: boolean;
  voluntaryContributionPossible: boolean;
  contributionCost?: number;
  parentalLeaveAlwaysCounted: boolean;
  buybackPossible: boolean;
  referencesSalary?: number;
}

export interface CombinationRules {
  differentTypesStackable: boolean;
  totalMaximumMonths: number; // 51 with reason
  thematicLeaveSeparate: boolean; // Parental, medical, palliative
  previousUsageTracked: boolean;
  resetPossible: boolean;
}

export interface SmallEmployerRules {
  threshold: number; // 10 employees
  canPostponeParentalLeave: boolean;
  maxPostponementMonths: number; // 6 months
  mustJustify: boolean;
  eventuallyMustGrant: boolean;
}

export interface RegionalVariations {
  flanders?: {
    additionalPrograms?: string[];
    specificAmounts?: Record<string, number>;
  };
  wallonia?: {
    additionalPrograms?: string[];
    specificAmounts?: Record<string, number>;
  };
  brussels?: {
    additionalPrograms?: string[];
    specificAmounts?: Record<string, number>;
  };
}

export interface TrainingTimeCredit {
  recognizedTraining: boolean;
  communityApproved: boolean;
  maxDurationMonths: number; // 36 months
  requiresAttestations: boolean;
  attestationFrequency: 'trimestriel';
  mustSucceedToContinue: boolean;
  allocation: number;
}