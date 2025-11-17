/**
 * Professional insertion (Insertion Professionnelle) domain types
 */

export type InsertionProgram =
  | 'article-60-7' // CPAS employment
  | 'article-61' // Social economy placement
  | 'ptp' // Programme de Transition Professionnelle
  | 'sine' // Social Integration Economy
  | 'activa' // ONSS reduction for employers
  | 'impulsion' // Hiring premium
  | 'stage-first' // Youth insertion internship
  | 'ibo-fpi' // Individual professional training
  | 'titres-services' // Service vouchers
  | 'eta' // Adapted work companies
  | 'acs-ape'; // Subsidized employment

export type UserProfile =
  | 'beneficiaire-ris' // RIS beneficiary
  | 'chomeur-longue-duree' // Long-term unemployed
  | 'jeune-peu-qualifie' // Low-qualified youth
  | 'parent-isole' // Single parent
  | 'personne-handicapee' // Person with disability
  | 'tres-eloigne-emploi' // Very far from employment
  | 'sortant-prison' // Ex-offender
  | 'sans-abri'; // Homeless

export type EmployerType =
  | 'cpas' // Public social welfare center
  | 'administration-publique' // Public administration
  | 'asbl-non-marchand' // Non-profit
  | 'economie-sociale' // Social economy
  | 'entreprise-privee' // Private company
  | 'entreprise-insertion' // Integration company
  | 'entreprise-travail-adapte' // Adapted work company
  | 'entreprise-titres-services'; // Service voucher company

export interface InsertionUser {
  id: string;
  age: number;
  profile: UserProfile;
  unemploymentDurationMonths: number;
  qualificationLevel: 'aucune' | 'faible' | 'moyenne' | 'elevee';
  hasWorkExperience: boolean;
  yearsWithoutWork?: number;
  receivingRIS?: boolean;
  receivingUnemployment?: boolean;
  childrenInCharge?: number;
  disabilityPercentage?: number;
  hasCriminalRecord?: boolean;
}

export interface Article60Contract {
  employerType: 'cpas' | 'commune' | 'asbl-partenaire';
  function: string;
  durationMonths: number; // Calculated to restore unemployment rights
  salary: number; // At least function scale
  fullSocialBenefits: boolean;
  socialSupport: boolean;
  objectiveUnemploymentRights: boolean;
  startDate: Date;
  endDate: Date;
}

export interface PTPContract {
  employerType: EmployerType;
  subsidyAmount: number;
  maxDurationMonths: number; // 24 months max
  sector: 'non-marchand' | 'public';
  additionalTraining: boolean;
  salaryScale: string;
  priorityCDI: boolean; // Priority for permanent contract after
}

export interface ActivaCard {
  reductionAmount: number; // 1000 EUR/month typical
  durationMonths: number; // 30 months typical
  unemploymentRequiredMonths: number; // 24 months typical
  contractType: 'cdi-obligatoire'; // CDI required
  employerONSSReduction: number;
  workerAge: number;
}

export interface StageFirstProgram {
  traineeBenefit: number; // 200 EUR/month
  companyPremium: number; // 500 EUR/month
  durationMonths: number; // 3-6 months
  sector: string;
  hiringRate: number; // 70% typically
  maintainsAllowances: boolean;
}

export interface TitresServicesJob {
  minimumHours: number; // 19 hours/week minimum
  hourlyWage: number; // 11.99 EUR gross minimum
  contractEvolution: 'cdd-3mois-puis-cdi';
  trainingFund: boolean;
  familyCompatibleSchedule: boolean;
  sectors: string[]; // Cleaning, ironing, shopping, transport
}

export interface AdaptedWorkCompany {
  disabilityRequirement: number; // 35% minimum
  adaptedPosition: boolean;
  specializedSupervision: boolean;
  subsidiesAvailable: boolean;
  evolutionToRegularWork: boolean;
  contractType: 'standard';
}

export interface InsertionEligibilityResult {
  isEligible: boolean;
  recommendedPrograms: InsertionProgram[];
  primaryProgram?: InsertionProgram;
  contractDetails?: {
    type: string;
    duration: number;
    salary: number;
    benefits: string[];
  };
  employerAdvantages?: {
    subsidies: number;
    onssReduction: number;
    hiringPremium?: number;
  };
  obligations?: string[];
  supportServices?: string[];
  reason?: string;
}

export interface FPIContract {
  // Formation Professionnelle Individuelle
  companyName: string;
  position: string;
  trainingDurationWeeks: number; // Max 26 weeks
  maintainsUnemployment: boolean;
  productivityBonus: {
    progressive: boolean;
    startAmount: number;
    endAmount: number;
  };
  hiringGuarantee: boolean; // CDI after training
  noSocialCharges: boolean; // For employer during training
}

export interface SINEEmployment {
  contractType: 'cdi'; // Always CDI
  psychosocialSupport: boolean;
  employerSubsidy: 'importante';
  trainingDuringWork: boolean;
  progressiveReintegration: boolean;
  targetGroup: 'tres-eloigne-emploi';
}

// Constants for 2024
export const INSERTION_AMOUNTS_2024 = {
  ARTICLE_60_MIN_SALARY: 1400, // EUR net/month (approximation)
  ACTIVA_ONSS_REDUCTION: 1000, // EUR/month
  ACTIVA_DURATION_MONTHS: 30,
  STAGE_FIRST_TRAINEE: 200, // EUR/month
  STAGE_FIRST_COMPANY: 500, // EUR/month
  TITRES_SERVICES_MIN_HOURLY: 11.99, // EUR gross
  TITRES_SERVICES_MIN_HOURS_WEEK: 19,
  PTP_MAX_DURATION: 24, // months
  FPI_MAX_DURATION_WEEKS: 26,
};

export const INSERTION_CONSTANTS = {
  MIN_AGE: 18,
  ARTICLE_60_OBJECTIVE: 'reconstitution-droits-chomage',
  ACTIVA_MIN_UNEMPLOYMENT_MONTHS: 24,
  STAGE_FIRST_MIN_MONTHS: 3,
  STAGE_FIRST_MAX_MONTHS: 6,
  STAGE_FIRST_HIRING_RATE: 70, // percentage
  ETA_MIN_DISABILITY: 35, // percentage
  TITRES_SERVICES_CDI_AFTER_MONTHS: 3,
  PTP_SECTOR_REQUIREMENT: 'non-marchand',
};

export interface InsertionObligations {
  respectWorkSchedule: boolean;
  followMandatoryTraining: boolean;
  collaborateWithSocialWorker: boolean;
  reportSituationChanges: boolean;
  participateInEvaluations: boolean;
  activelySeekPermanentWork: boolean;
  respectWorkRegulations: boolean;
  maintainRegistration?: boolean; // As job seeker if applicable
}

export interface PostInsertionSupport {
  jobSearchAssistance: boolean;
  cvEnhancement: boolean;
  skillsAssessment: boolean;
  internalApplicationPriority?: boolean;
  unemploymentRightsOpened?: boolean;
  accessToACSAPE?: boolean; // Subsidized employment
}

export interface ImpulsionPremium {
  targetGroup: 'jeunes' | 'chomeurs-longue-duree';
  premiumAmount: number;
  employerLocation: 'wallonie' | 'bruxelles';
  contractRequirement: 'cdi' | 'cdd-min-6-mois';
  combinableWithActiva: boolean;
}

export interface TransitionTracking {
  programStartDate: Date;
  programEndDate?: Date;
  currentPhase: 'orientation' | 'insertion' | 'stabilisation' | 'autonomie';
  evaluations: {
    date: Date;
    result: 'satisfaisant' | 'amelioration-necessaire' | 'insuffisant';
    recommendations: string[];
  }[];
  nextSteps?: string[];
}

export interface CumulWithSocialAids {
  maintainsFamilyAllowances: boolean;
  installationPremium?: boolean;
  socialEnergyRate: boolean;
  childcareIntervention?: boolean;
  medicalCardDuration?: number; // months after insertion
}

export interface SpecializedPrograms {
  exOffenderReintegration?: {
    specialSupport: boolean;
    employerIncentives: number;
    confidentialityGuaranteed: boolean;
  };
  homelessnessTransition?: {
    housingFirst: boolean;
    stabilizationPeriod: number;
    intensiveSupport: boolean;
  };
  addictionRecovery?: {
    flexibleSchedule: boolean;
    therapeuticSupport: boolean;
    relapseProtocol: boolean;
  };
}