/**
 * Professional training (Formation Professionnelle) domain types
 */

export type TrainingOrganization =
  | 'Forem' // Wallonia
  | 'Actiris' // Brussels
  | 'Bruxelles Formation' // Brussels French-speaking
  | 'VDAB' // Flanders
  | 'IFAPME' // Wallonia entrepreneurship
  | 'EFP' // Brussels entrepreneurship
  | 'SYNTRA' // Flanders entrepreneurship;

export type TrainingType =
  | 'metier-penurie' // Shortage occupation
  | 'qualifiante' // Qualifying training
  | 'reconversion' // Career change
  | 'alternance' // Work-study
  | 'langues' // Language training
  | 'numerique' // Digital skills
  | 'entrepreneuriat' // Entrepreneurship
  | 'fpie'; // Individual professional training in company

export type TrainingStatus =
  | 'demandeur-emploi' // Job seeker
  | 'travailleur' // Employed worker
  | 'jeune-sans-diplome' // Young person without diploma
  | 'parent-isole' // Single parent
  | 'travailleur-age'; // Worker over 50

export interface TrainingUser {
  id: string;
  age: number;
  status: TrainingStatus;
  hasSecondaryDiploma: boolean;
  registeredWith?: TrainingOrganization;
  receivingUnemploymentBenefits: boolean;
  monthlyIncome?: number;
  childrenInCharge?: number;
  employmentDuration?: number; // months
}

export interface TrainingProgram {
  type: TrainingType;
  name: string;
  organization: TrainingOrganization;
  durationMonths: number;
  hoursPerWeek: number;
  totalHours: number;
  isApproved: boolean;
  isShortageOccupation: boolean;
  hasCompanyPlacement: boolean;
  certificationLevel?: string;
  startDate: Date;
  endDate: Date;
}

export interface TrainingAllowances {
  hourlyRate: number; // 1 EUR per hour standard
  monthlyAllowance?: number; // For specific programs
  shortageBonus?: number; // 350 EUR for shortage occupations
  completionBonus?: number;
  transportReimbursement: boolean;
  childcareSupport?: number; // Up to 18 EUR per day per child
}

export interface PaidEducationLeave {
  eligibleHoursPerYear: number; // 120 hours standard
  salaryCeiling: number; // 3098 EUR gross monthly
  salaryMaintained: boolean;
  employerReimbursement: boolean;
  requiresApproval: boolean;
}

export interface TrainingEligibilityResult {
  isEligible: boolean;
  trainingType?: TrainingType;
  allowances?: TrainingAllowances;
  maintainsUnemploymentBenefits?: boolean;
  transportBenefits?: {
    freePublicTransport: boolean;
    mileageReimbursement?: number;
  };
  additionalSupport?: {
    childcare: boolean;
    childcareAmount?: number;
    accommodationSupport?: boolean;
  };
  obligations?: string[];
  reason?: string;
  priority?: 'high' | 'normal' | 'low';
}

export interface FPIE {
  // Formation Professionnelle Individuelle en Entreprise
  companyName: string;
  durationWeeks: number; // Max 26 weeks
  progressiveProductivityBonus: boolean;
  guaranteedHiring: boolean;
  maintainsBenefits: boolean;
  noSocialChargesForEmployer: boolean;
}

export interface LanguageTraining {
  language: 'NL' | 'FR' | 'DE' | 'EN';
  currentLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  targetLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  reason: 'emploi-specifique' | 'general' | 'integration';
  voucherEligible: boolean;
  intensiveDurationMonths: number; // Typically 3 months
  certificationIncluded: boolean;
  selorCertification?: boolean;
}

export interface WorkStudyProgram {
  type: 'alternance' | 'stage-first' | 'fpie';
  companyPartner?: string;
  theoreticalHours: number;
  practicalHours: number;
  monthlyCompensation: number; // 200 EUR for Stage First
  companyPremium?: number; // 500 EUR per month for Stage First
  hiringProbability: number; // 70% for Stage First
  maxDurationMonths: number;
}

// Constants for 2024
export const TRAINING_AMOUNTS_2024 = {
  HOURLY_ALLOWANCE: 1.00, // EUR per hour
  SHORTAGE_OCCUPATION_BONUS: 350, // EUR
  YOUNG_PERSON_MONTHLY: 200, // EUR per month
  CHILDCARE_DAILY_MAX: 18, // EUR per day per child
  PAID_LEAVE_HOURS: 120, // Hours per year
  PAID_LEAVE_SALARY_CEILING: 3098, // EUR gross monthly
  STAGE_FIRST_TRAINEE: 200, // EUR per month
  STAGE_FIRST_COMPANY: 500, // EUR per month
  TRANSPORT_REIMBURSEMENT_PER_KM: 0.15, // EUR
};

export const TRAINING_CONSTANTS = {
  MIN_AGE: 18,
  MIN_AGE_EXCEPTION: 16, // With special conditions
  MIN_ATTENDANCE_RATE: 80, // Percentage
  FPIE_MAX_DURATION_WEEKS: 26,
  INTENSIVE_LANGUAGE_MONTHS: 3,
  STAGE_FIRST_MIN_MONTHS: 3,
  STAGE_FIRST_MAX_MONTHS: 6,
  ENTREPRENEURSHIP_BENEFIT_MONTHS: 6, // Maintain benefits
  OVER_50_PROGRAM_AGE: 50,
};

export interface TrainingObligations {
  minimumAttendance: number; // 80% typically
  activeParticipation: boolean;
  passEvaluations: boolean;
  justifyAbsences: boolean;
  remainRegistered: boolean; // As job seeker
  informONEM: boolean;
  availableForWork: boolean; // For suitable employment
  completeFullProgram: boolean;
}

export interface ShortageOccupations2024 {
  sector: string;
  occupations: string[];
  bonusEligible: boolean;
  priorityAccess: boolean;
}

export interface EntrepreneurshipTraining {
  organization: 'IFAPME' | 'UCM' | 'EFP' | 'SYNTRA';
  businessManagementIncluded: boolean;
  personalCoaching: boolean;
  airbagSupport: boolean; // UCM program
  tremplainPlan: boolean; // Springboard for independents
  microCreditAccess: boolean;
  benefitMaintenanceMonths: number; // 6 months typically
}

export interface TrainingCertification {
  type: 'attestation' | 'certificat' | 'diplome' | 'titre-competence';
  recognizedByRegions: boolean;
  europassCompatible: boolean;
  salaryImpact: boolean;
  validityYears?: number;
}

export interface Over50Program {
  priorityAccess: boolean;
  personalizedSupport: boolean;
  extendedDuration: boolean;
  maintainsMajoredBenefits: boolean;
  specialProgram: '50+';
}

export interface ValidationOfSkills {
  priorExperienceRecognized: boolean;
  formalCertification: boolean;
  crossRegionalRecognition: boolean;
  procedure: 'evaluation' | 'portfolio' | 'examination';
}