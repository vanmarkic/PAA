/**
 * APA (Allocation pour l'Aide aux Personnes Âgées) specific domain types
 * Belgian allowance for elderly persons with reduced autonomy
 */

/**
 * APA autonomy categories based on points evaluation
 */
export type APACategory = 1 | 2 | 3 | 4 | 5;

/**
 * Belgian regions for APA administration
 */
export type BelgianRegion =
  | 'region-bruxelles-capitale'  // Brussels-Capital Region (Iriscare)
  | 'region-wallonne'            // Walloon Region (AVIQ)
  | 'region-flamande'           // Flemish Region (Zorgkas)
  | 'communaute-germanophone';  // German-speaking Community

/**
 * Living situation for APA beneficiaries
 */
export type LivingSituation =
  | 'domicile'                  // Living at home
  | 'maison-repos'              // Nursing home
  | 'residence-service'         // Service residence
  | 'famille-accueil'          // Foster family
  | 'centre-jour';             // Day care center

/**
 * Autonomy evaluation domains with scoring
 */
export interface AutonomyEvaluation {
  /** Moving inside and outside (0-3 points) */
  seDeplacer: number;
  /** Preparing and taking meals (0-3 points) */
  preparerPrendreRepas: number;
  /** Personal hygiene (washing, dressing) (0-3 points) */
  hygienePersonnelle: number;
  /** Household maintenance (0-3 points) */
  entretienMenager: number;
  /** Awareness of dangers and behavior (0-3 points) */
  dangerComportement: number;
  /** Communication and social contacts (0-3 points) */
  communication: number;
  /** Total score (7-18 points for eligibility) */
  totalScore: number;
  /** Evaluation date */
  evaluationDate: Date;
  /** Evaluating physician */
  evaluatingPhysician?: string;
  /** Validity period in years */
  validityYears: number;
}

/**
 * APA user profile with all required fields
 */
export interface APAUser {
  /** Unique identifier */
  id: string;
  /** Age in years (must be >= 65) */
  age: number;
  /** Region of residence */
  region: BelgianRegion;
  /** Living situation */
  livingSituation: LivingSituation;
  /** Family situation for income calculation */
  familySituation: 'personne-isolee' | 'en-couple';
  /** Autonomy evaluation results */
  autonomyEvaluation: AutonomyEvaluation;
  /** APA category (1-5) based on autonomy score */
  apaCategory?: APACategory;
  /** Annual income in EUR */
  annualIncome: number;
  /** Partner annual income if applicable */
  partnerAnnualIncome?: number;
  /** Currently receiving APA */
  isCurrentlyReceivingAPA: boolean;
  /** Also receiving other disability benefits */
  receivingDisabilityBenefits: boolean;
  /** Also receiving GRAPA */
  receivingGRAPA: boolean;
  /** Needs home adaptations */
  needsHomeAdaptations?: boolean;
  /** Needs home care services */
  needsHomeCareServices?: boolean;
  /** Name of care institution if applicable */
  careInstitutionName?: string;
}

/**
 * APA amounts structure by category
 */
export interface APAAmounts {
  /** Category 1: 7-8 points */
  category1: {
    annual: number;
    monthly: number;
  };
  /** Category 2: 9-11 points */
  category2: {
    annual: number;
    monthly: number;
  };
  /** Category 3: 12-14 points */
  category3: {
    annual: number;
    monthly: number;
  };
  /** Category 4: 15-16 points */
  category4: {
    annual: number;
    monthly: number;
  };
  /** Category 5: 17-18 points */
  category5: {
    annual: number;
    monthly: number;
  };
}

/**
 * Income thresholds for APA eligibility
 */
export interface APAIncomeThresholds {
  /** Annual income threshold for isolated person */
  personneIsolee: number;
  /** Annual income threshold for couple */
  menage: number;
  /** Reference date for thresholds */
  effectiveDate: Date;
}

/**
 * APA eligibility result with calculation details
 */
export interface APAEligibilityResult {
  /** Eligibility status */
  isEligible: boolean;
  /** APA category if eligible */
  category?: APACategory;
  /** Autonomy score */
  autonomyScore?: number;
  /** Annual APA amount in EUR */
  annualAmount?: number;
  /** Monthly APA amount in EUR */
  monthlyAmount?: number;
  /** Reason for eligibility or rejection */
  reason?: string;
  /** Income assessment details */
  incomeAssessment?: {
    totalAnnualIncome: number;
    applicableThreshold: number;
    underThreshold: boolean;
  };
  /** Next evaluation date */
  nextEvaluationDate?: Date;
  /** Payment details */
  paymentDetails?: {
    paymentMethod: 'virement' | 'institution';
    paymentFrequency: 'monthly';
    startDate?: Date;
  };
  /** Legal basis */
  legalBasis?: string;
  /** Administrative notes */
  notes?: string[];
}

/**
 * APA application procedure by region
 */
export interface APAProcedure {
  /** Application region */
  region: BelgianRegion;
  /** Application method */
  applicationMethod: 'online' | 'paper' | 'mutuelle' | 'cpas';
  /** Online platform used */
  onlinePlatform?: 'MyIriscare' | 'Wal-Protect' | 'Zorgkas-online';
  /** Application date */
  applicationDate: Date;
  /** Medical evaluation scheduled */
  medicalEvaluation?: {
    scheduled: boolean;
    scheduledDate?: Date;
    location: 'domicile' | 'centre-medical';
    completed?: boolean;
  };
  /** Expected decision date */
  expectedDecisionDate: Date;
  /** Required documents */
  requiredDocuments: string[];
  /** Current status */
  status: 'pending' | 'evaluation' | 'decision' | 'approved' | 'rejected' | 'appeal';
  /** Appeal information if applicable */
  appeal?: {
    filed: boolean;
    filingDate?: Date;
    tribunal: string;
    deadline: Date;
  };
}

/**
 * APA revision information
 */
export interface APARevision {
  /** User identifier */
  userId: string;
  /** Reason for revision */
  revisionReason:
    | 'aggravation-autonomy'     // Worsening of autonomy
    | 'improvement-autonomy'      // Improvement of autonomy
    | 'periodic-review'          // Scheduled review
    | 'change-living-situation'  // Move to institution
    | 'income-change';          // Income change
  /** Previous category */
  previousCategory: APACategory;
  /** New category */
  newCategory?: APACategory;
  /** Previous monthly amount */
  previousMonthlyAmount: number;
  /** New monthly amount */
  newMonthlyAmount?: number;
  /** Effective date */
  effectiveDate: Date;
}

/**
 * Services that can be funded with APA
 */
export interface APAFundableServices {
  /** Home help services (cleaning, cooking) */
  aideFamiliale: {
    hoursPerWeek?: number;
    costPerHour?: number;
    titresServices?: boolean;
  };
  /** Nursing care at home */
  soinsInfirmiers: {
    frequency: 'daily' | 'weekly' | 'as-needed';
    coveredByMutuelle?: boolean;
  };
  /** Home adaptations */
  adaptationLogement: {
    type: string[];
    estimatedCost?: number;
    regionalGrants?: number;
  };
  /** Telecare/monitoring services */
  televigilance: {
    subscribed: boolean;
    monthlyCost?: number;
  };
  /** Adapted transport */
  transportAdapte: {
    frequency: 'regular' | 'occasional';
    purpose: 'medical' | 'social' | 'both';
  };
  /** Medical equipment */
  materielMedical: {
    items: string[];
    rentalOrPurchase: 'rental' | 'purchase';
    monthlyCost?: number;
  };
}

// Constants for 2024
export const APA_AMOUNTS_2024: APAAmounts = {
  category1: {
    annual: 1269.81,
    monthly: 105.82
  },
  category2: {
    annual: 4847.15,
    monthly: 403.93
  },
  category3: {
    annual: 5893.36,
    monthly: 491.11
  },
  category4: {
    annual: 6939.25,
    monthly: 578.27
  },
  category5: {
    annual: 7985.15,
    monthly: 665.43
  }
};

/**
 * Income thresholds effective June 2024
 */
export const APA_INCOME_THRESHOLDS_2024: APAIncomeThresholds = {
  personneIsolee: 20725.25,
  menage: 25468.38,
  effectiveDate: new Date('2024-06-01')
};

/**
 * APA constants and parameters
 */
export const APA_CONSTANTS = {
  /** Minimum age for APA */
  MIN_AGE: 65,
  /** Minimum autonomy score for eligibility */
  MIN_AUTONOMY_SCORE: 7,
  /** Maximum autonomy score */
  MAX_AUTONOMY_SCORE: 18,
  /** Maximum points per evaluation domain */
  MAX_POINTS_PER_DOMAIN: 3,
  /** Number of evaluation domains */
  EVALUATION_DOMAINS: 6,
  /** Standard evaluation validity in years */
  STANDARD_VALIDITY_YEARS: 5,
  /** Decision deadline in months */
  DECISION_DEADLINE_MONTHS: 6,
  /** Medical evaluation deadline in months */
  EVALUATION_DEADLINE_MONTHS_BRUSSELS: 3,
  EVALUATION_DEADLINE_MONTHS_WALLONIA: 4,
  /** Appeal deadline in months */
  APPEAL_DEADLINE_MONTHS: 3,
  /** Minimum pocket money in institution */
  MIN_POCKET_MONEY_INSTITUTION: 111.24,
};

/**
 * Autonomy score to category mapping
 */
export const AUTONOMY_SCORE_TO_CATEGORY: { [key: string]: APACategory } = {
  '7-8': 1,
  '9-11': 2,
  '12-14': 3,
  '15-16': 4,
  '17-18': 5,
};

/**
 * Cumulation rules with other benefits
 */
export const APA_CUMULATION_RULES = {
  GRAPA: true,                          // Can cumulate with GRAPA
  pensionRetraite: true,                // Can cumulate with retirement pension
  allocationHandicap: false,            // Cannot cumulate with disability allowance
  aideSocialeCPAS: true,               // Can cumulate with CPAS aid
  allocationAidantProche: true,        // Caregiver can receive their allowance
};

/**
 * Regional administration contacts
 */
export const APA_REGIONAL_CONTACTS = {
  'region-bruxelles-capitale': {
    organization: 'Iriscare',
    website: 'www.myiriscare.brussels',
    phone: '02 435 63 00',
  },
  'region-wallonne': {
    organization: 'AVIQ',
    website: 'www.aviq.be',
    phone: '0800 16 061',
  },
  'region-flamande': {
    organization: 'Zorgkas',
    website: 'www.zorgkas.be',
    phone: '02 225 85 82',
  },
  'communaute-germanophone': {
    organization: 'Ministerium der DG',
    website: 'www.ostbelgienlive.be',
    phone: '080 28 00 02',
  },
};

/**
 * Get APA category from autonomy score
 */
export function getAPACategory(autonomyScore: number): APACategory | null {
  if (autonomyScore < 7 || autonomyScore > 18) return null;

  if (autonomyScore <= 8) return 1;
  if (autonomyScore <= 11) return 2;
  if (autonomyScore <= 14) return 3;
  if (autonomyScore <= 16) return 4;
  return 5;
}

/**
 * Calculate total household income for APA assessment
 */
export function calculateHouseholdIncome(
  personalIncome: number,
  partnerIncome: number = 0,
  familySituation: 'personne-isolee' | 'en-couple'
): number {
  if (familySituation === 'personne-isolee') {
    return personalIncome;
  }
  return personalIncome + partnerIncome;
}

/**
 * Check if income is under APA threshold
 */
export function isIncomeEligibleForAPA(
  annualIncome: number,
  familySituation: 'personne-isolee' | 'en-couple'
): boolean {
  const threshold = familySituation === 'personne-isolee'
    ? APA_INCOME_THRESHOLDS_2024.personneIsolee
    : APA_INCOME_THRESHOLDS_2024.menage;

  return annualIncome <= threshold;
}

/**
 * Get monthly APA amount by category
 */
export function getMonthlyAPAAmount(category: APACategory): number {
  const amounts: { [key: number]: number } = {
    1: APA_AMOUNTS_2024.category1.monthly,
    2: APA_AMOUNTS_2024.category2.monthly,
    3: APA_AMOUNTS_2024.category3.monthly,
    4: APA_AMOUNTS_2024.category4.monthly,
    5: APA_AMOUNTS_2024.category5.monthly,
  };

  return amounts[category] || 0;
}

/**
 * Calculate autonomy score from evaluation
 */
export function calculateAutonomyScore(evaluation: Partial<AutonomyEvaluation>): number {
  const score = (evaluation.seDeplacer || 0) +
    (evaluation.preparerPrendreRepas || 0) +
    (evaluation.hygienePersonnelle || 0) +
    (evaluation.entretienMenager || 0) +
    (evaluation.dangerComportement || 0) +
    (evaluation.communication || 0);

  return Math.min(Math.max(score, 0), APA_CONSTANTS.MAX_AUTONOMY_SCORE);
}