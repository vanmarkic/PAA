/**
 * Aide Sociale CPAS specific domain types
 * Belgian social assistance provided by Public Centers for Social Action
 */

/**
 * Types of social assistance available from CPAS
 */
export type AideSocialeType =
  | 'aide-financiere'          // Financial aid equivalent to RIS
  | 'aide-en-nature'           // Aid in kind (food, clothing, etc.)
  | 'aide-medicale-urgente'    // Emergency medical aid
  | 'avance-sur-prestations'   // Advance on social benefits
  | 'aide-complementaire'      // Complementary aid to other benefits
  | 'aide-urgence'            // Emergency assistance
  | 'aide-logement'           // Housing assistance
  | 'garantie-locative';      // Rental guarantee

/**
 * Beneficiary categories for social assistance
 */
export type AideSocialeCategory =
  | 'personne-sans-papiers'   // Undocumented persons
  | 'mineur-non-accompagne'    // Unaccompanied minors
  | 'etudiant-etranger'       // Foreign students
  | 'europeen-court-sejour'   // EU citizens < 3 months
  | 'demandeur-asile'         // Asylum seekers
  | 'personne-agee'           // Elderly with insufficient GRAPA
  | 'personne-handicapee'     // Disabled persons
  | 'famille-monoparentale'   // Single parent families
  | 'personne-isolee'         // Isolated persons
  | 'cohabitant';             // Cohabitants

/**
 * User status for social assistance evaluation
 */
export type UserLegalStatus =
  | 'belgian-citizen'
  | 'eu-citizen-short-stay'    // < 3 months
  | 'eu-citizen-long-stay'     // > 3 months
  | 'refugee-recognized'
  | 'asylum-seeker'
  | 'student-visa'
  | 'work-permit'
  | 'no-legal-status'
  | 'subsidiary-protection'
  | 'temporary-protection';

/**
 * Aid in nature types
 */
export interface AideEnNature {
  /** Food packages from food bank */
  colisAlimentaires?: boolean;
  /** Purchase vouchers for clothing/supplies */
  bonsAchat?: number;
  /** Public transport subscription */
  abonnementTransport?: boolean;
  /** Sport/culture vouchers for children */
  chequesSportCulture?: number;
  /** School supplies */
  fournituresScolaires?: boolean;
  /** Emergency clothing from social wardrobe */
  vestimentsSociaux?: boolean;
  /** Restaurant tickets */
  ticketsRestaurant?: number;
}

/**
 * Medical assistance details
 */
export interface AideMedicale {
  /** Type of medical care needed */
  typeOfCare: 'urgent' | 'essential' | 'preventive' | 'chronic';
  /** Medical requisition issued */
  requisitionMedicale: boolean;
  /** Hospital costs covered */
  fraisHospitaliers?: number;
  /** Pharmacy costs covered */
  fraisPharmaceutiques?: number;
  /** Specialist consultations */
  consultationsSpecialistes?: boolean;
  /** Dental care covered */
  soinsDentaires?: boolean;
}

/**
 * Housing assistance details
 */
export interface AideLogement {
  /** Type of housing assistance */
  type: 'garantie-locative' | 'premier-loyer' | 'arrieres-loyer' | 'frais-demenagement';
  /** Amount of assistance */
  amount: number;
  /** Maximum months of rent for guarantee */
  maxMonthsRent?: number;
  /** Emergency shelter provided */
  hebergementUrgence?: boolean;
  /** Social housing application assistance */
  aideDemarcheLogementSocial?: boolean;
}

/**
 * Aide Sociale user profile
 */
export interface AideSocialeUser {
  /** Unique identifier */
  id: string;
  /** Age in years */
  age: number;
  /** Legal status in Belgium */
  legalStatus: UserLegalStatus;
  /** Category of beneficiary */
  category: AideSocialeCategory;
  /** Effective residence in Belgium */
  residesInBelgium: boolean;
  /** Current monthly income */
  monthlyIncome: number;
  /** Household total income if applicable */
  householdIncome?: number;
  /** Number of children in charge */
  childrenInCharge: number;
  /** Currently receiving other benefits */
  receivingOtherBenefits: string[];
  /** Has a guarantor (for students) */
  hasGuarantor?: boolean;
  /** Guarantor is defaulting */
  guarantorDefaulting?: boolean;
  /** Waiting for other social benefits */
  waitingForBenefits?: string[];
  /** Special needs (disability, chronic illness) */
  specialNeeds?: string[];
  /** Current housing situation */
  housingSituation: 'housed' | 'homeless' | 'emergency-shelter' | 'precarious';
  /** Monthly rent if applicable */
  monthlyRent?: number;
  /** Current CPAS client */
  isCurrentCPASClient: boolean;
}

/**
 * Aide Sociale amounts structure
 */
export interface AideSocialeAmounts {
  /** Equivalent to RIS isolated person */
  aidefinanciereIsolé: number;
  /** Equivalent to RIS cohabitant */
  aidefinanciereCohabitant: number;
  /** Equivalent to RIS single parent family */
  aidefinanciereFamilleMonoparentale: number;
  /** Maximum rental guarantee (months) */
  garantieLocativeMaxMois: number;
  /** Emergency aid daily amount */
  aideUrgenceJournaliere: number;
  /** Minimum pocket money in institution */
  argentPocheMinimum: number;
}

/**
 * Social assistance eligibility result
 */
export interface AideSocialeEligibilityResult {
  /** Eligibility status */
  isEligible: boolean;
  /** Types of aid eligible for */
  eligibleAidTypes?: AideSocialeType[];
  /** Monthly financial amount if applicable */
  monthlyFinancialAmount?: number;
  /** Aid in nature details */
  aideEnNature?: AideEnNature;
  /** Medical aid details */
  aideMedicale?: AideMedicale;
  /** Housing aid details */
  aideLogement?: AideLogement;
  /** Reason for decision */
  reason?: string;
  /** Recovery conditions if advance */
  isRecoverable?: boolean;
  /** Recovery details */
  recoveryConditions?: string[];
  /** Duration of aid */
  aidDuration?: 'temporary' | 'renewable' | 'permanent';
  /** Review frequency */
  reviewFrequency?: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
  /** Specific obligations */
  obligations?: string[];
  /** Legal basis */
  legalBasis?: string;
  /** Administrative notes */
  notes?: string[];
}

/**
 * CPAS procedure information
 */
export interface CPASProcedure {
  /** Application date */
  applicationDate: Date;
  /** Receipt acknowledgment issued */
  accuseReception: boolean;
  /** Social inquiry status */
  enqueteSociale: {
    scheduled: boolean;
    completedDate?: Date;
    homeVisitDate?: Date;
    socialWorkerAssigned?: string;
  };
  /** Hearing before council */
  audition?: {
    scheduled: boolean;
    date?: Date;
    attended?: boolean;
  };
  /** Decision information */
  decision?: {
    date: Date;
    positive: boolean;
    motivation: string;
    notificationDate: Date;
  };
  /** Payment information */
  payment?: {
    startDate: Date;
    frequency: 'monthly' | 'bi-weekly' | 'weekly';
    method: 'bank-transfer' | 'cash' | 'vouchers';
  };
  /** Appeal information if applicable */
  appeal?: {
    filed: boolean;
    filingDate?: Date;
    tribunal: string;
    deadline: Date;
  };
}

/**
 * Social contract (PIIS) for aid recipients
 */
export interface ContratPIIS {
  /** User identifier */
  userId: string;
  /** Contract signature date */
  signedDate: Date;
  /** Specific obligations */
  obligations: string[];
  /** Integration goals */
  goals: string[];
  /** Follow-up frequency */
  followUpFrequency: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly';
  /** Evaluation dates */
  evaluationDates: Date[];
  /** Sanctions for non-compliance */
  sanctions?: {
    level: number;
    description: string;
    reductionPercentage?: number;
  };
}

/**
 * Aid recovery conditions
 */
export interface AideRecovery {
  /** Recovery case type */
  recoveryCase:
    | 'retour-meilleure-fortune'  // Return to better fortune
    | 'debiteurs-aliments'        // From family support obligors
    | 'erreur-fraude'             // Error or fraud
    | 'avance-prestations';       // Advance on benefits
  /** Amount to recover */
  amountToRecover: number;
  /** Recovery period */
  recoveryPeriod: 'immediate' | '5-years' | 'unlimited';
  /** Monthly recovery amount if installments */
  monthlyRecoveryAmount?: number;
  /** Recovery start date */
  recoveryStartDate?: Date;
  /** Recovery exemptions */
  exemptions?: string[];
}

// Constants for 2024
export const AIDE_SOCIALE_AMOUNTS_2024: AideSocialeAmounts = {
  aidefinanciereIsolé: 1070.49,                    // Same as RIS isolated
  aidefinanciereCohabitant: 713.66,               // Same as RIS cohabitant
  aidefinanciereFamilleMonoparentale: 1450.52,    // Same as RIS single parent
  garantieLocativeMaxMois: 3,                      // Maximum 3 months rent
  aideUrgenceJournaliere: 35.70,                  // Daily emergency aid amount
  argentPocheMinimum: 111.24,                     // Minimum pocket money in institution
};

/**
 * CPAS constants and deadlines
 */
export const CPAS_CONSTANTS = {
  /** Maximum decision delay in days */
  MAX_DECISION_DELAY_DAYS: 30,
  /** Maximum payment delay after decision in days */
  MAX_PAYMENT_DELAY_DAYS: 15,
  /** Appeal deadline in months */
  APPEAL_DEADLINE_MONTHS: 3,
  /** Maximum emergency aid duration in days */
  MAX_EMERGENCY_AID_DAYS: 30,
  /** Recovery period in years for better fortune */
  RECOVERY_PERIOD_YEARS: 5,
  /** Maximum absence from Belgium in days */
  MAX_ABSENCE_DAYS: 28,
  /** Minimum age for financial aid (except minors) */
  MIN_AGE_FINANCIAL_AID: 18,
  /** Social inquiry validity in months */
  SOCIAL_INQUIRY_VALIDITY_MONTHS: 12,
};

/**
 * Aid types by legal status
 */
export const AID_BY_STATUS = {
  'no-legal-status': ['aide-medicale-urgente'],
  'asylum-seeker': ['aide-financiere', 'aide-en-nature', 'aide-medicale-urgente'],
  'student-visa': ['aide-urgence', 'aide-medicale-urgente'],
  'eu-citizen-short-stay': ['aide-urgence', 'aide-medicale-urgente'],
  'eu-citizen-long-stay': ['aide-financiere', 'aide-en-nature', 'aide-medicale-urgente'],
  'belgian-citizen': ['aide-financiere', 'aide-en-nature', 'aide-medicale-urgente', 'avance-sur-prestations', 'aide-complementaire'],
};

/**
 * Obligations for aid recipients
 */
export const AIDE_SOCIALE_OBLIGATIONS = [
  'Déclarer tout changement de situation',
  'Collaborer à l\'enquête sociale',
  'Faire valoir ses droits aux autres prestations',
  'Résider effectivement en Belgique',
  'Respecter le contrat PIIS si applicable',
  'Chercher activement du travail si apte',
  'Suivre une formation si demandée',
  'Accepter un emploi convenable proposé',
];

/**
 * Emergency aid components
 */
export const EMERGENCY_AID_COMPONENTS = {
  hebergement: 'Maison d\'accueil ou hôtel social',
  repas: 'Tickets restaurant ou colis alimentaire',
  soinsMedicaux: 'Réquisitoire médical pour soins urgents',
  vetements: 'Vestiaire social pour vêtements de base',
  transport: 'Ticket de transport pour démarches urgentes',
};

/**
 * Check if user can receive financial aid based on status
 */
export function canReceiveFinancialAid(status: UserLegalStatus): boolean {
  const eligibleStatuses: UserLegalStatus[] = [
    'belgian-citizen',
    'eu-citizen-long-stay',
    'refugee-recognized',
    'asylum-seeker',
    'subsidiary-protection',
    'temporary-protection'
  ];
  return eligibleStatuses.includes(status);
}

/**
 * Determine aid duration based on status and category
 */
export function determineAidDuration(
  status: UserLegalStatus,
  category: AideSocialeCategory
): 'temporary' | 'renewable' | 'permanent' {
  if (status === 'no-legal-status' || status === 'eu-citizen-short-stay') {
    return 'temporary';
  }
  if (category === 'etudiant-etranger' || category === 'europeen-court-sejour') {
    return 'temporary';
  }
  if (status === 'belgian-citizen' || status === 'refugee-recognized') {
    return 'renewable';
  }
  return 'renewable';
}

/**
 * Calculate total aid amount including all components
 */
export function calculateTotalAidAmount(
  financialAid: number = 0,
  aideEnNature: AideEnNature = {},
  monthlyRent: number = 0,
  needsRentalGuarantee: boolean = false
): number {
  let total = financialAid;

  // Add value of aid in nature
  if (aideEnNature.bonsAchat) total += aideEnNature.bonsAchat;
  if (aideEnNature.ticketsRestaurant) total += aideEnNature.ticketsRestaurant;
  if (aideEnNature.chequesSportCulture) total += aideEnNature.chequesSportCulture;
  if (aideEnNature.abonnementTransport) total += 49; // STIB monthly subscription

  // Add rental guarantee if needed (one-time, spread over 12 months for calculation)
  if (needsRentalGuarantee && monthlyRent > 0) {
    const guarantee = Math.min(monthlyRent * 3, monthlyRent * AIDE_SOCIALE_AMOUNTS_2024.garantieLocativeMaxMois);
    total += guarantee / 12; // Spread over a year for monthly calculation
  }

  return total;
}