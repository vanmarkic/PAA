/**
 * Artist Status (Statut d'Artiste) Domain Types
 *
 * Legal Framework:
 * - Arrêté royal du 16 novembre 2009 relatif à la protection sociale des artistes
 * - Loi-programme du 24 décembre 2002, article 1bis
 * - Code des impôts sur les revenus (régime fiscal artistes)
 * - Arrêté royal du 26 mars 2003 (Commission des Artistes)
 */

// ============= Core Types =============

export type ArtistCategory =
  | 'musicien'
  | 'comédien'
  | 'danseur'
  | 'plasticien'
  | 'écrivain'
  | 'metteur en scène'
  | 'chorégraphe'
  | 'photographe'
  | 'vidéaste'
  | 'technicien du spectacle'
  | 'artiste numérique'
  | 'artiste multidisciplinaire';

export type ArtistStatus =
  | 'amateur'
  | 'professionnel'
  | 'débutant'
  | 'intermittent'
  | 'indépendant principal'
  | 'indépendant complémentaire'
  | 'salarié article 1bis'
  | 'mixte';

export type EmploymentType =
  | 'contrat employé'
  | 'cachet'
  | 'indépendant'
  | 'smart'
  | 'interim spectacle'
  | 'contrat étudiant'
  | 'bénévolat défrayé';

export type ResidencyType =
  | 'belge'
  | 'UE'
  | 'hors-UE avec permis'
  | 'hors-UE sans permis'
  | 'réfugié reconnu';

// ============= Artist Profile =============

export interface Artist {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    nationality: string;
    residencyStatus: ResidencyType;
    nationalNumber?: string;
  };

  artistProfile: {
    category: ArtistCategory;
    status: ArtistStatus;
    yearsOfExperience: number;
    disciplines: string[];
    artistNumber?: string; // Numéro Commission des Artistes
    visaArtist?: {
      number: string;
      issueDate: Date;
      expiryDate: Date;
    };
  };

  professionalActivity: {
    daysWorked: number;
    daysWorkedArtistic: number;
    daysWorkedNonArtistic: number;
    employersCount: number;
    mainEmployers: string[];
  };

  financials: {
    annualIncomeArtistic: number;
    annualIncomeNonArtistic: number;
    monthlyIncomeAverage: number;
    patrimonyValue: number;
    hasOtherBenefits: boolean;
    otherBenefits?: string[];
  };
}

// ============= Eligibility Results =============

export interface ArtistStatusEligibility {
  isEligible: boolean;
  statusType?: ArtistStatus;
  category?: ArtistCategory;
  reasons?: string[];
  missingConditions?: string[];
  recommendations?: string[];

  detailedAnalysis?: {
    daysRequirement: {
      required: number;
      actual: number;
      met: boolean;
      derogationPossible?: boolean;
    };
    incomeRequirement: {
      minimumArtistic: number;
      actual: number;
      met: boolean;
    };
    maxNonArtisticIncome?: {
      maximum: number;
      actual: number;
      met: boolean;
    };
  };
}

// ============= Unemployment Specific =============

export interface ArtistUnemployment {
  userId: string;

  eligibility: {
    hasMinimumDays: boolean;
    daysWorked: number;
    referenceperiod: number; // in months
    isEligible: boolean;
  };

  benefits: {
    dailyAllowance: number;
    monthlyEstimate: number;
    category: 'isolé' | 'cohabitant' | 'chef de famille';
    protectionPeriod: number; // in months
    startDate?: Date;
    endDate?: Date;
  };

  cachetRule: {
    dailyExemption: number;
    appliedTo: Array<{
      date: Date;
      amount: number;
      exempted: number;
      deducted: number;
    }>;
  };

  obligations: string[];
  nextEvaluation?: Date;
}

// ============= Tax Regime =============

export interface ArtistTaxRegime {
  userId: string;
  taxYear: number;

  income: {
    grossArtisticIncome: number;
    grossNonArtisticIncome: number;
    copyrightIncome?: number;
    foreignIncome?: number;
  };

  deductions: {
    regime: 'forfaitaire' | 'frais réels' | 'petites indemnités';
    flatRateDeduction?: number;
    flatRateCap?: number;
    actualExpenses?: number;
    appliedDeduction: number;
  };

  calculations: {
    taxableBase: number;
    estimatedTax: number;
    withholdingTax?: number;
    finalTaxDue: number;
  };

  specialRegimes?: {
    copyrightWithholding?: {
      applicable: boolean;
      rate: number;
      amount: number;
    };
    smallCompensation?: {
      applicable: boolean;
      exempt: boolean;
    };
  };
}

// ============= Social Security =============

export interface ArtistSocialSecurity {
  userId: string;

  affiliation: {
    type: 'indépendant' | 'salarié' | 'mixte' | 'article 1bis';
    socialSecurityFund?: string;
    affiliationDate?: Date;
    registrationNumber?: string;
  };

  contributions: {
    quarterly: number;
    annual: number;
    rate: number;
    reductions?: Array<{
      type: string;
      amount: number;
    }>;
  };

  coverage: {
    healthInsurance: boolean;
    pension: boolean;
    familyAllowances: boolean;
    workAccident: boolean;
    maternityLeave?: {
      eligible: boolean;
      weeks: number;
      weeklyAmount: number;
    };
  };

  exemptions?: {
    lowIncomeExemption: boolean;
    studentExemption: boolean;
    pensionerExemption: boolean;
  };
}

// ============= Copyright and Royalties =============

export interface ArtistCopyright {
  userId: string;

  rightsManagement: {
    collectiveSociety?: 'SABAM' | 'SACD' | 'SOFAM' | 'SCAM' | 'PlayRight' | 'none';
    memberNumber?: string;
    joinDate?: Date;
  };

  works: Array<{
    id: string;
    title: string;
    type: 'musical' | 'literary' | 'visual' | 'audiovisual' | 'performance';
    registrationDate: Date;
    iswc?: string; // International Standard Work Code
    collaborators?: Array<{
      name: string;
      role: string;
      percentage: number;
    }>;
  }>;

  royalties: {
    performanceRights: number;
    mechanicalRights: number;
    synchronizationRights: number;
    resaleRights?: number; // droit de suite
    totalAnnual: number;
  };

  distributions: Array<{
    period: string;
    society: string;
    grossAmount: number;
    fees: number;
    netAmount: number;
    taxWithheld: number;
  }>;
}

// ============= Grants and Subsidies =============

export interface ArtistGrant {
  id: string;
  userId: string;

  grantType:
    | 'création'
    | 'résidence'
    | 'recherche'
    | 'projet'
    | 'jeune talent'
    | 'équipement'
    | 'diffusion'
    | 'urgence';

  application: {
    submittedDate: Date;
    projectTitle: string;
    requestedAmount: number;
    projectDuration: number; // in months
    status: 'draft' | 'submitted' | 'review' | 'approved' | 'rejected' | 'completed';
  };

  evaluation: {
    artisticQuality: number; // score 0-100
    feasibility: number;
    impact: number;
    innovation: number;
    totalScore: number;
    juryComments?: string;
  };

  funding?: {
    approvedAmount: number;
    disbursements: Array<{
      date: Date;
      amount: number;
      condition: string;
    }>;
    reporting: Array<{
      dueDate: Date;
      submitted: boolean;
      approved: boolean;
    }>;
  };
}

// ============= Commission Procedures =============

export interface CommissionProcedure {
  id: string;
  userId: string;

  procedureType:
    | 'visa demande'
    | 'visa renouvellement'
    | 'carte artiste'
    | 'reconnaissance étranger'
    | 'médiation'
    | 'contestation'
    | 'avis consultatif';

  submission: {
    date: Date;
    documents: string[];
    completeness: boolean;
  };

  review: {
    assignedDate?: Date;
    reviewer?: string;
    hearingDate?: Date;
    additionalInfoRequested?: string[];
  };

  decision?: {
    date: Date;
    outcome: 'approved' | 'rejected' | 'deferred' | 'partial';
    reasoning: string;
    validity?: {
      from: Date;
      to: Date;
    };
    conditions?: string[];
  };

  appeal?: {
    filed: boolean;
    date?: Date;
    grounds?: string;
    newDecision?: {
      date: Date;
      outcome: string;
    };
  };
}

// ============= Constants =============

export const ARTIST_STATUS_CONSTANTS = {
  // Minimum thresholds 2024
  MINIMUM_DAYS_STANDARD: 156,
  MINIMUM_DAYS_REDUCED: 104, // First-time applicants
  MINIMUM_DAYS_TECHNICIEN: 156,
  REFERENCE_PERIOD_MONTHS: 21,

  // Income thresholds 2024
  MINIMUM_ARTISTIC_INCOME: 2000,
  MAXIMUM_NON_ARTISTIC_INCOME: 10000,
  SMALL_COMPENSATION_THRESHOLD: 2500,

  // Unemployment benefits
  DAILY_ALLOWANCE_MAX: 65.96,
  DAILY_CACHET_EXEMPTION: 130,
  PROTECTION_PERIOD_MONTHS: 12,

  // Tax regime
  FLAT_RATE_DEDUCTION_PERCENT: 50,
  FLAT_RATE_DEDUCTION_CAP: 10000,
  COPYRIGHT_WITHHOLDING_RATE: 15,
  VAT_RATE_ORIGINAL_WORKS: 6,
  ARTIST_TAX_EXEMPTION: 3590,

  // Social security
  SOCIAL_CONTRIBUTION_RATE: 20.5,
  MINIMUM_QUARTERLY_CONTRIBUTION: 721.89,
  MATERNITY_LEAVE_WEEKS: 12,
  MATERNITY_WEEKLY_ALLOWANCE: 506.24,

  // Grants
  MAX_CREATION_GRANT: 25000,
  MAX_RESIDENCE_GRANT: 15000,
  MAX_RESEARCH_GRANT: 20000,
  MAX_PROJECT_GRANT: 10000,
  MAX_YOUNG_TALENT_GRANT: 8000,
  MAX_EQUIPMENT_GRANT: 5000,

  // Commission delays
  COMMISSION_STANDARD_DELAY_DAYS: 30,
  COMMISSION_APPEAL_DELAY_DAYS: 30,
  VISA_VALIDITY_YEARS: 5,
};

// ============= Legal References =============

export interface ArtistLegalReference {
  title: string;
  type: 'loi' | 'arrêté royal' | 'arrêté ministériel' | 'circulaire' | 'code';
  date: string;
  articles?: string[];
  url?: string;
  lastAmended?: string;
}

export const ARTIST_LEGAL_REFERENCES: ArtistLegalReference[] = [
  {
    title: "Arrêté royal du 16 novembre 2009 relatif à la protection sociale des artistes",
    type: "arrêté royal",
    date: "2009-11-16",
    articles: ["1", "2", "3", "4", "5"],
    url: "https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2009111603",
    lastAmended: "2023-01-01"
  },
  {
    title: "Loi-programme du 24 décembre 2002 - Article 1bis",
    type: "loi",
    date: "2002-12-24",
    articles: ["1bis"],
    url: "https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2002122445",
  },
  {
    title: "Code des impôts sur les revenus 1992",
    type: "code",
    date: "1992-04-10",
    articles: ["17", "37", "37bis"],
    url: "https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1992041030",
  },
  {
    title: "Arrêté royal du 26 mars 2003 portant création de la Commission Artistes",
    type: "arrêté royal",
    date: "2003-03-26",
    url: "https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2003032638",
  },
  {
    title: "Loi relative aux droits d'auteur et aux droits voisins",
    type: "loi",
    date: "1994-06-30",
    articles: ["1", "2", "3", "XI.165"],
    url: "https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1994063035",
    lastAmended: "2022-01-01"
  }
];

// ============= Validation Functions =============

export function isEligibleForArtistStatus(artist: Artist): ArtistStatusEligibility {
  const result: ArtistStatusEligibility = {
    isEligible: false,
    reasons: [],
    missingConditions: [],
    recommendations: []
  };

  // Check minimum days
  const daysRequired = artist.artistProfile.yearsOfExperience === 0
    ? ARTIST_STATUS_CONSTANTS.MINIMUM_DAYS_REDUCED
    : ARTIST_STATUS_CONSTANTS.MINIMUM_DAYS_STANDARD;

  const daysMet = artist.professionalActivity.daysWorkedArtistic >= daysRequired;

  // Check minimum income
  const incomeMet = artist.financials.annualIncomeArtistic >= ARTIST_STATUS_CONSTANTS.MINIMUM_ARTISTIC_INCOME;

  // Check non-artistic income ceiling
  const ceilingMet = artist.financials.annualIncomeNonArtistic <= ARTIST_STATUS_CONSTANTS.MAXIMUM_NON_ARTISTIC_INCOME;

  result.detailedAnalysis = {
    daysRequirement: {
      required: daysRequired,
      actual: artist.professionalActivity.daysWorkedArtistic,
      met: daysMet,
      derogationPossible: artist.artistProfile.yearsOfExperience === 0
    },
    incomeRequirement: {
      minimumArtistic: ARTIST_STATUS_CONSTANTS.MINIMUM_ARTISTIC_INCOME,
      actual: artist.financials.annualIncomeArtistic,
      met: incomeMet
    },
    maxNonArtisticIncome: {
      maximum: ARTIST_STATUS_CONSTANTS.MAXIMUM_NON_ARTISTIC_INCOME,
      actual: artist.financials.annualIncomeNonArtistic,
      met: ceilingMet
    }
  };

  // Determine eligibility
  if (daysMet && incomeMet && ceilingMet) {
    result.isEligible = true;
    result.statusType = determineStatusType(artist);
    result.category = artist.artistProfile.category;
    result.recommendations?.push("Vous êtes éligible au statut d'artiste complet");
  } else {
    if (!daysMet) {
      result.missingConditions?.push(`Jours prestés insuffisants (${artist.professionalActivity.daysWorkedArtistic}/${daysRequired})`);
    }
    if (!incomeMet) {
      result.missingConditions?.push(`Revenus artistiques insuffisants (${artist.financials.annualIncomeArtistic}€/${ARTIST_STATUS_CONSTANTS.MINIMUM_ARTISTIC_INCOME}€)`);
    }
    if (!ceilingMet) {
      result.missingConditions?.push(`Revenus non-artistiques trop élevés (max ${ARTIST_STATUS_CONSTANTS.MAXIMUM_NON_ARTISTIC_INCOME}€)`);
    }
  }

  return result;
}

function determineStatusType(artist: Artist): ArtistStatus {
  if (artist.financials.annualIncomeNonArtistic > artist.financials.annualIncomeArtistic) {
    return 'indépendant complémentaire';
  }
  if (artist.artistProfile.yearsOfExperience < 2) {
    return 'débutant';
  }
  if (artist.professionalActivity.employersCount > 3) {
    return 'intermittent';
  }
  return 'professionnel';
}

// ============= Calculation Helpers =============

export function calculateArtistUnemploymentBenefit(
  category: 'isolé' | 'cohabitant' | 'chef de famille',
  daysWorked: number,
  cachetIncome: number = 0
): number {
  const dailyRates = {
    'isolé': 65.96,
    'cohabitant': 43.78,
    'chef de famille': 65.96
  };

  const dailyRate = dailyRates[category];
  const monthlyBase = dailyRate * 26; // 26 days per month average

  // Apply cachet rule if applicable
  if (cachetIncome > 0) {
    const exemption = Math.min(cachetIncome, ARTIST_STATUS_CONSTANTS.DAILY_CACHET_EXEMPTION);
    const deduction = cachetIncome - exemption;
    return Math.max(0, monthlyBase - deduction);
  }

  return monthlyBase;
}

export function calculateArtistTaxDeduction(
  grossIncome: number,
  regime: 'forfaitaire' | 'frais réels',
  actualExpenses?: number
): number {
  if (regime === 'forfaitaire') {
    const flatRate = grossIncome * (ARTIST_STATUS_CONSTANTS.FLAT_RATE_DEDUCTION_PERCENT / 100);
    return Math.min(flatRate, ARTIST_STATUS_CONSTANTS.FLAT_RATE_DEDUCTION_CAP);
  } else {
    return actualExpenses || 0;
  }
}

export function calculateSocialContributions(
  annualIncome: number,
  isMainActivity: boolean
): number {
  if (annualIncome < 1500 && !isMainActivity) {
    return 0; // Exemption for very low complementary income
  }

  const minimumBase = ARTIST_STATUS_CONSTANTS.MINIMUM_QUARTERLY_CONTRIBUTION * 4;
  const calculated = annualIncome * (ARTIST_STATUS_CONSTANTS.SOCIAL_CONTRIBUTION_RATE / 100);

  return Math.max(minimumBase, calculated);
}

// ============= Export Types for Rules Engine =============

export interface ArtistFactsForRules {
  age: number;
  category: ArtistCategory;
  yearsExperience: number;
  daysWorkedArtistic: number;
  daysWorkedTotal: number;
  annualIncomeArtistic: number;
  annualIncomeNonArtistic: number;
  hasVisaArtist: boolean;
  residencyStatus: ResidencyType;
  employersCount: number;
}

export interface ArtistRulesResult {
  eligible: boolean;
  statusGranted?: ArtistStatus;
  conditions: string[];
  benefits: string[];
  obligations: string[];
  nextSteps: string[];
}