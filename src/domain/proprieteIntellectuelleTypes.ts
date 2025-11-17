/**
 * Intellectual Property Domain Types for Belgium
 *
 * Legal Framework:
 * - Loi du 28 mars 1984 sur les brevets d'invention
 * - Code de droit économique (Livre XI - Propriété intellectuelle)
 * - Loi Benelux sur les marques
 * - Convention Benelux en matière de propriété intellectuelle
 * - Règlement européen sur les dessins et modèles
 */

// Main IP categories
export type IPCategory =
  | 'brevet' // Patents
  | 'marque' // Trademarks
  | 'droit-auteur' // Copyright
  | 'dessin-modele' // Design
  | 'secret-commercial' // Trade secret
  | 'nom-domaine' // Domain name
  | 'obtention-vegetale' // Plant variety
  | 'topographie-semiconducteur' // Semiconductor topography
  | 'indication-geographique' // Geographical indication
  | 'appellation-origine'; // Designation of origin

// Patent types
export type PatentType =
  | 'brevet-belge' // Belgian patent
  | 'brevet-europeen' // European patent
  | 'brevet-pct' // PCT patent
  | 'certificat-utilite' // Utility certificate
  | 'certificat-complementaire-protection'; // Supplementary protection certificate

// Patent status
export type PatentStatus =
  | 'en-preparation' // In preparation
  | 'demande-deposee' // Application filed
  | 'en-examen' // Under examination
  | 'publie' // Published
  | 'delivre' // Granted
  | 'oppose' // Opposed
  | 'revoque' // Revoked
  | 'expire' // Expired
  | 'abandonne'; // Abandoned

// Trademark types
export type TrademarkType =
  | 'marque-verbale' // Word mark
  | 'marque-figurative' // Figurative mark
  | 'marque-mixte' // Combined mark
  | 'marque-tridimensionnelle' // 3D mark
  | 'marque-sonore' // Sound mark
  | 'marque-couleur' // Color mark
  | 'marque-position' // Position mark
  | 'marque-mouvement' // Motion mark
  | 'marque-hologramme' // Hologram mark
  | 'marque-collective' // Collective mark
  | 'marque-certification'; // Certification mark

// Trademark status
export type TrademarkStatus =
  | 'demande-deposee' // Application filed
  | 'en-examen' // Under examination
  | 'publie' // Published
  | 'enregistre' // Registered
  | 'oppose' // Opposed
  | 'renouvele' // Renewed
  | 'radie' // Cancelled
  | 'expire'; // Expired

// Copyright types
export type CopyrightType =
  | 'oeuvre-litteraire' // Literary work
  | 'oeuvre-artistique' // Artistic work
  | 'oeuvre-musicale' // Musical work
  | 'oeuvre-audiovisuelle' // Audiovisual work
  | 'logiciel' // Software
  | 'base-donnees' // Database
  | 'oeuvre-architecturale' // Architectural work
  | 'photographie'; // Photography

// Design protection type
export type DesignType =
  | 'dessin-benelux' // Benelux design
  | 'dessin-communautaire' // EU design
  | 'modele-benelux' // Benelux model
  | 'modele-communautaire'; // EU model

// License types
export type LicenseType =
  | 'licence-exclusive' // Exclusive license
  | 'licence-non-exclusive' // Non-exclusive license
  | 'licence-sole' // Sole license
  | 'sous-licence' // Sublicense
  | 'licence-obligatoire' // Compulsory license
  | 'licence-croisee'; // Cross-license

// Opposition types
export type OppositionType =
  | 'opposition-marque' // Trademark opposition
  | 'opposition-brevet' // Patent opposition
  | 'opposition-dessin' // Design opposition
  | 'opposition-aop-igp'; // AOP/IGP opposition

// Infringement types
export type InfringementType =
  | 'contrefacon-directe' // Direct infringement
  | 'contrefacon-indirecte' // Indirect infringement
  | 'importation-parallele' // Parallel import
  | 'concurrence-deloyale' // Unfair competition
  | 'parasitisme' // Parasitism
  | 'piratage' // Piracy
  | 'cybersquatting'; // Cybersquatting

// Applicant information
export interface IPApplicant {
  id: string;
  type: 'personne-physique' | 'personne-morale';
  name: string;
  nationality: string;
  address: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
  };
  email: string;
  phone?: string;
  representativeId?: string; // Mandataire agréé
  inventorInfo?: {
    isInventor: boolean;
    inventors?: Inventor[];
  };
}

// Inventor information
export interface Inventor {
  id: string;
  name: string;
  nationality: string;
  address: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
  };
  contributionPercentage?: number;
}

// Representative information
export interface IPRepresentative {
  id: string;
  registrationNumber: string; // Numéro d'agrément
  name: string;
  firm?: string;
  address: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
  };
  email: string;
  phone: string;
  specializations: IPCategory[];
}

// Patent application
export interface PatentApplication {
  id: string;
  applicationNumber: string;
  filingDate: Date;
  priorityDate?: Date;
  priorityNumber?: string;
  priorityCountry?: string;
  type: PatentType;
  status: PatentStatus;
  title: string;
  abstract: string;
  claims: PatentClaim[];
  description: string;
  drawings?: string[];
  ipcClasses: string[]; // International Patent Classification
  applicant: IPApplicant;
  inventors: Inventor[];
  representative?: IPRepresentative;
  publicationDate?: Date;
  publicationNumber?: string;
  grantDate?: Date;
  patentNumber?: string;
  fees: PatentFee[];
  examReports?: ExaminationReport[];
}

// Patent claim
export interface PatentClaim {
  number: number;
  type: 'independent' | 'dependent';
  dependsOn?: number[];
  text: string;
}

// Patent fees
export interface PatentFee {
  type: 'depot' | 'recherche' | 'examen' | 'delivrance' | 'annuite' | 'restauration';
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  year?: number; // For annuities
  status: 'due' | 'paid' | 'overdue' | 'waived';
}

// Examination report
export interface ExaminationReport {
  id: string;
  date: Date;
  type: 'recherche' | 'examen-fond' | 'notification';
  examiner: string;
  objections: string[];
  citations: Citation[];
  deadline?: Date;
  response?: {
    date: Date;
    arguments: string;
    amendments: string;
  };
}

// Citation
export interface Citation {
  documentNumber: string;
  country: string;
  date: Date;
  relevance: 'X' | 'Y' | 'A' | 'O' | 'P' | 'E' | 'D' | 'L';
  claimsAffected: number[];
}

// Trademark application
export interface TrademarkApplication {
  id: string;
  applicationNumber: string;
  filingDate: Date;
  type: TrademarkType;
  status: TrademarkStatus;
  mark: {
    text?: string;
    image?: string;
    description?: string;
    colors?: string[];
    disclaimer?: string;
  };
  niceClasses: number[]; // Nice classification
  goodsAndServices: {
    class: number;
    description: string;
  }[];
  applicant: IPApplicant;
  representative?: IPRepresentative;
  priority?: {
    date: Date;
    number: string;
    country: string;
  };
  publicationDate?: Date;
  registrationDate?: Date;
  registrationNumber?: string;
  expiryDate?: Date;
  renewalDate?: Date;
  fees: TrademarkFee[];
  oppositions?: TrademarkOpposition[];
}

// Trademark fees
export interface TrademarkFee {
  type: 'depot' | 'classe-supplementaire' | 'renouvellement' | 'restauration';
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'due' | 'paid' | 'overdue';
  classes?: number[];
}

// Trademark opposition
export interface TrademarkOpposition {
  id: string;
  opponent: IPApplicant;
  filingDate: Date;
  grounds: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'settled';
  decision?: {
    date: Date;
    outcome: string;
    reasoning: string;
  };
}

// Copyright registration
export interface CopyrightRegistration {
  id: string;
  registrationNumber?: string;
  type: CopyrightType;
  title: string;
  author: IPApplicant;
  creationDate: Date;
  publicationDate?: Date;
  depositDate?: Date;
  description: string;
  rightHolder: IPApplicant;
  duration: {
    startDate: Date;
    endDate: Date; // Usually 70 years post mortem
  };
  relatedRights?: {
    type: 'performance' | 'recording' | 'broadcast';
    holder: string;
    duration: number;
  }[];
}

// Design registration
export interface DesignRegistration {
  id: string;
  applicationNumber: string;
  filingDate: Date;
  type: DesignType;
  status: 'pending' | 'registered' | 'expired' | 'cancelled';
  title: string;
  locarnoClasses: string[]; // Locarno classification
  images: string[];
  description?: string;
  applicant: IPApplicant;
  designer: string;
  representative?: IPRepresentative;
  publicationDate?: Date;
  registrationDate?: Date;
  registrationNumber?: string;
  expiryDate?: Date;
  renewalPeriods: number; // Max 5 periods of 5 years
  fees: DesignFee[];
}

// Design fees
export interface DesignFee {
  type: 'depot' | 'publication' | 'ajournement' | 'renouvellement';
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  period?: number;
  status: 'due' | 'paid' | 'overdue';
}

// License agreement
export interface LicenseAgreement {
  id: string;
  type: LicenseType;
  ipType: IPCategory;
  ipRights: string[]; // Patent numbers, trademark numbers, etc.
  licensor: IPApplicant;
  licensee: IPApplicant;
  territory: string[];
  fieldOfUse?: string;
  duration: {
    startDate: Date;
    endDate?: Date;
  };
  royalties?: {
    type: 'fixed' | 'percentage' | 'running' | 'minimum';
    amount: number;
    paymentFrequency: 'monthly' | 'quarterly' | 'annual';
  };
  exclusivity: boolean;
  sublicenseRights: boolean;
  recordedWithOffice: boolean;
  recordingDate?: Date;
}

// Domain name dispute
export interface DomainNameDispute {
  id: string;
  domainName: string;
  tld: string;
  complainant: IPApplicant;
  respondent: IPApplicant;
  procedure: 'udrp' | 'udr' | 'court';
  grounds: ('trademark' | 'bad-faith' | 'no-legitimate-interest')[];
  filingDate: Date;
  status: 'pending' | 'transfer' | 'cancellation' | 'denied' | 'withdrawn';
  panel?: {
    provider: 'wipo' | 'forum' | 'adndrc' | 'car';
    arbitrators: string[];
  };
  decision?: {
    date: Date;
    outcome: 'transfer' | 'cancellation' | 'denied';
    reasoning: string;
  };
}

// Infringement case
export interface InfringementCase {
  id: string;
  type: InfringementType;
  ipRights: string[];
  rightHolder: IPApplicant;
  allegedInfringer: IPApplicant;
  description: string;
  evidence: Evidence[];
  damagesClamed?: number;
  filingDate: Date;
  court?: {
    name: string;
    caseNumber: string;
    judge?: string;
  };
  status: 'investigation' | 'filed' | 'pending' | 'decided' | 'appealed' | 'settled';
  preliminaryMeasures?: {
    type: 'seizure' | 'injunction' | 'description';
    granted: boolean;
    date: Date;
  };
  decision?: {
    date: Date;
    outcome: 'infringement' | 'no-infringement' | 'invalid';
    damages?: number;
    injunction?: boolean;
    reasoning: string;
  };
}

// Evidence
export interface Evidence {
  id: string;
  type: 'document' | 'physical' | 'witness' | 'expert';
  description: string;
  dateCollected: Date;
  bailiff?: boolean; // Huissier de justice
  chain_of_custody: {
    date: Date;
    holder: string;
    action: string;
  }[];
}

// Trade secret
export interface TradeSecret {
  id: string;
  owner: IPApplicant;
  type: 'technical' | 'commercial' | 'organizational';
  description: string;
  value: 'high' | 'medium' | 'low';
  protectionMeasures: string[];
  employees_with_access: number;
  nda_agreements: NDAgreement[];
}

// NDA Agreement
export interface NDAgreement {
  id: string;
  parties: IPApplicant[];
  type: 'unilateral' | 'bilateral' | 'multilateral';
  purpose: string;
  confidentialInfo: string;
  duration: {
    startDate: Date;
    endDate?: Date;
  };
  territory?: string[];
  exceptions: string[];
  penalties?: number;
}

// Plant variety
export interface PlantVariety {
  id: string;
  species: string;
  variety: string;
  denomination: string;
  breeder: IPApplicant;
  applicationNumber: string;
  filingDate: Date;
  dus_test: { // Distinctness, Uniformity, Stability
    distinct: boolean;
    uniform: boolean;
    stable: boolean;
    testDate: Date;
  };
  status: 'pending' | 'granted' | 'expired' | 'cancelled';
  grantDate?: Date;
  certificateNumber?: string;
  expiryDate?: Date;
}

// Geographical indication
export interface GeographicalIndication {
  id: string;
  name: string;
  type: 'aop' | 'igp' | 'stg'; // Appellation d'Origine Protégée, Indication Géographique Protégée, Spécialité Traditionnelle Garantie
  productType: string;
  geographicalArea: string;
  productSpecification: string;
  controlBody: string;
  applicantGroup: {
    name: string;
    members: number;
    representative: IPApplicant;
  };
  applicationDate: Date;
  registrationDate?: Date;
  status: 'pending' | 'registered' | 'cancelled';
}

// IP search request
export interface IPSearchRequest {
  id: string;
  type: 'patent' | 'trademark' | 'design';
  searchType: 'novelty' | 'freedom-to-operate' | 'invalidity' | 'infringement';
  keywords?: string[];
  classes?: string[];
  applicant?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  territories: string[];
  requester: IPApplicant;
  urgency: 'normal' | 'urgent' | 'express';
  deliveryDate: Date;
  cost: number;
}

// IP valuation
export interface IPValuation {
  id: string;
  ipRights: {
    type: IPCategory;
    identifiers: string[];
  }[];
  purpose: 'sale' | 'licensing' | 'financing' | 'litigation' | 'accounting';
  method: 'cost' | 'market' | 'income' | 'combined';
  valuationDate: Date;
  value: {
    min: number;
    max: number;
    mostLikely: number;
  };
  assumptions: string[];
  expert: {
    name: string;
    qualification: string;
  };
}

// IP portfolio
export interface IPPortfolio {
  id: string;
  owner: IPApplicant;
  patents: PatentApplication[];
  trademarks: TrademarkApplication[];
  designs: DesignRegistration[];
  copyrights: CopyrightRegistration[];
  tradeSecrets: TradeSecret[];
  licenses: LicenseAgreement[];
  totalValue?: number;
  managementStrategy?: string;
  renewalCalendar: RenewalItem[];
}

// Renewal item
export interface RenewalItem {
  ipType: IPCategory;
  ipIdentifier: string;
  dueDate: Date;
  fee: number;
  status: 'pending' | 'renewed' | 'expired' | 'abandoned';
  instructions?: 'renew' | 'abandon' | 'evaluate';
}

// Technology transfer
export interface TechnologyTransfer {
  id: string;
  technology: string;
  ipRights: string[];
  transferor: IPApplicant;
  transferee: IPApplicant;
  type: 'assignment' | 'license' | 'joint-venture' | 'spin-off';
  consideration: {
    type: 'monetary' | 'equity' | 'mixed';
    amount?: number;
    equityPercentage?: number;
  };
  effectiveDate: Date;
  recordingRequired: boolean;
  recordingDate?: Date;
}

// IP audit result
export interface IPAuditResult {
  id: string;
  company: IPApplicant;
  auditDate: Date;
  auditor: string;
  identified_ip: {
    registered: IPPortfolio;
    unregistered: {
      tradeSecrets: number;
      knowHow: string[];
      unregisteredDesigns: number;
    };
  };
  risks: {
    description: string;
    severity: 'high' | 'medium' | 'low';
    recommendation: string;
  }[];
  opportunities: string[];
  recommendations: string[];
}

// Constants
export const IP_CONSTANTS = {
  // Patent constants
  PATENT_TERM: 20, // years from filing
  PATENT_GRACE_PERIOD: 6, // months for late payment
  PATENT_PRIORITY_PERIOD: 12, // months
  PATENT_PCT_PERIOD: 30, // months for national phase

  // Trademark constants
  TRADEMARK_TERM: 10, // years
  TRADEMARK_RENEWAL_PERIOD: 10, // years
  TRADEMARK_GRACE_PERIOD: 6, // months
  TRADEMARK_OPPOSITION_PERIOD: 2, // months from publication

  // Design constants
  DESIGN_TERM: 5, // years
  DESIGN_MAX_TERM: 25, // years total
  DESIGN_GRACE_PERIOD: 12, // months disclosure

  // Copyright constants
  COPYRIGHT_TERM_AUTHOR: 70, // years post mortem
  COPYRIGHT_TERM_CORPORATE: 70, // years from publication
  COPYRIGHT_TERM_ANONYMOUS: 70, // years from publication

  // Fees (EUR) - 2024
  FEES: {
    PATENT: {
      FILING: 50,
      SEARCH: 300,
      EXAMINATION: 150,
      GRANT: 40,
      ANNUITY_YEAR_3: 40,
      ANNUITY_YEAR_10: 260,
      ANNUITY_YEAR_20: 1200,
    },
    TRADEMARK: {
      FILING_BENELUX: 244, // base fee
      CLASS_ADDITIONAL: 37,
      RENEWAL: 268,
      FILING_EU: 850,
    },
    DESIGN: {
      FILING_SINGLE: 140,
      FILING_MULTIPLE: 366,
      PUBLICATION: 127,
      RENEWAL_PERIOD_1: 94,
      RENEWAL_PERIOD_5: 198,
    },
  },

  // Time limits
  DEADLINES: {
    PATENT_RESPONSE: 2, // months to respond to office action
    TRADEMARK_RESPONSE: 2, // months
    OPPOSITION_FILING: 3, // months
    APPEAL_FILING: 2, // months
    COURT_APPEAL: 1, // month
  },
};

// Validation result
export interface IPValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
  suggestions?: string[];
}

// Fee calculation result
export interface FeeCalculationResult {
  baseFee: number;
  additionalFees: {
    type: string;
    amount: number;
  }[];
  totalFee: number;
  dueDate: Date;
  latePaymentSurcharge?: number;
}

// Eligibility check result
export interface IPEligibilityResult {
  isEligible: boolean;
  requirements?: string[];
  missingDocuments?: string[];
  recommendations?: string[];
}

// Priority claim
export interface PriorityClaim {
  applicationNumber: string;
  country: string;
  filingDate: Date;
  isValid: boolean;
  certified_copy?: {
    received: boolean;
    date?: Date;
  };
}

// Classification
export interface Classification {
  system: 'ipc' | 'nice' | 'locarno' | 'vienna';
  code: string;
  description: string;
  version: string;
}

// Office action
export interface OfficeAction {
  id: string;
  type: 'objection' | 'rejection' | 'requirement' | 'notice';
  date: Date;
  deadline: Date;
  issues: string[];
  requirements?: string[];
  response?: {
    date: Date;
    arguments: string;
    amendments?: string;
    evidence?: string[];
  };
}

// IP monitoring alert
export interface IPMonitoringAlert {
  id: string;
  type: 'similar-mark' | 'citation' | 'opposition' | 'infringement' | 'deadline';
  ipRight: string;
  description: string;
  date: Date;
  severity: 'high' | 'medium' | 'low';
  actionRequired?: string;
  deadline?: Date;
}