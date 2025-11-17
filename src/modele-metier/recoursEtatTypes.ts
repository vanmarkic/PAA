/**
 * State Appeals (Recours contre l'État) Domain Types
 *
 * Comprehensive type definitions for 50 administrative appeal procedures
 * against the Belgian state and public authorities.
 *
 * BASE JURIDIQUE:
 * - Lois coordonnées sur le Conseil d'État (12 janvier 1973)
 * - Code judiciaire (Articles 1385bis à 1385undecies)
 * - Loi sur la motivation formelle des actes administratifs (29 juillet 1991)
 * - Code de procédure civile
 */

// ============================================================================
// CORE TYPES AND ENUMS
// ============================================================================

/**
 * Type of appeal procedure (50 procedures categorized)
 */
export type AppealProcedureType =
  // Administrative Appeals (1-10)
  | 'recours-administratif-gracieux'
  | 'recours-administratif-hierarchique'
  | 'recours-administratif-tutelle'
  | 'recours-contre-silence-administration'
  | 'recours-contre-decision-implicite'
  | 'mediation-administrative'
  | 'conciliation-administrative'
  | 'reclamation-administrative'
  | 'opposition-administrative'
  | 'revision-administrative'
  // Council of State Procedures (11-20)
  | 'conseil-etat-annulation'
  | 'conseil-etat-suspension'
  | 'conseil-etat-extreme-urgence'
  | 'conseil-etat-cassation'
  | 'conseil-etat-indemnite'
  | 'conseil-etat-avis'
  | 'conseil-etat-refere'
  | 'conseil-etat-revision'
  | 'conseil-etat-tierce-opposition'
  | 'conseil-etat-rectification'
  // Tax Appeals (21-25)
  | 'reclamation-fiscale'
  | 'recours-tribunal-fiscal'
  | 'recours-cour-appel-fiscal'
  | 'recours-cassation-fiscal'
  | 'procedure-amiable-fiscale'
  // Social Security Appeals (26-30)
  | 'recours-cpas'
  | 'recours-onem'
  | 'recours-inami'
  | 'recours-onss'
  | 'recours-tribunal-travail'
  // Ombudsman Procedures (31-35)
  | 'mediateur-federal'
  | 'mediateur-regional'
  | 'mediateur-communal'
  | 'mediateur-pensions'
  | 'mediateur-energie'
  // Building & Environment (36-40)
  | 'recours-permis-urbanisme'
  | 'recours-permis-environnement'
  | 'recours-permis-unique'
  | 'recours-expropriation'
  | 'recours-patrimoine-classe'
  // Police & Justice (41-45)
  | 'plainte-comite-p'
  | 'plainte-inspection-generale'
  | 'plainte-controle-detention'
  | 'recours-sanction-administrative'
  | 'recours-ordre-public'
  // Access to Information (46-50)
  | 'acces-documents-administratifs'
  | 'rectification-donnees-personnelles'
  | 'transparence-administrative'
  | 'consultation-dossier-administratif'
  | 'publicite-administration';

/**
 * Jurisdiction levels for appeals
 */
export type JurisdictionLevel =
  | 'administrative' // Internal to administration
  | 'quasi-judicial' // Administrative tribunals
  | 'judicial-first-instance' // First level courts
  | 'judicial-appeal' // Appeal courts
  | 'judicial-cassation' // Supreme court
  | 'constitutional' // Constitutional court
  | 'european'; // European courts

/**
 * Status of an appeal procedure
 */
export type AppealStatus =
  | 'draft' // Being prepared
  | 'filed' // Formally submitted
  | 'acknowledged' // Receipt confirmed
  | 'under-review' // Being examined
  | 'hearing-scheduled' // Court date set
  | 'hearing-held' // Hearing completed
  | 'decision-pending' // Awaiting decision
  | 'decided' // Decision rendered
  | 'appeal-filed' // Appeal against decision
  | 'executed' // Decision implemented
  | 'closed' // Procedure finalized
  | 'withdrawn' // Voluntarily abandoned
  | 'rejected' // Dismissed on procedural grounds
  | 'time-barred'; // Deadline expired

/**
 * Urgency level for procedures
 */
export type UrgencyLevel =
  | 'normal' // Standard deadlines apply
  | 'accelerated' // Shortened deadlines
  | 'urgent' // Priority treatment
  | 'extreme-urgent'; // Immediate action required

/**
 * Type of decision being appealed
 */
export type DecisionType =
  | 'administrative-act' // Acte administratif
  | 'regulatory-act' // Acte réglementaire
  | 'individual-decision' // Décision individuelle
  | 'implicit-refusal' // Refus implicite
  | 'material-act' // Acte matériel
  | 'contract' // Contrat administratif
  | 'sanction' // Sanction administrative
  | 'tax-assessment'; // Imposition fiscale

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Appellant (person filing the appeal)
 */
export interface Appellant {
  id: string;
  type: 'individual' | 'company' | 'association' | 'public-entity';
  firstName?: string;
  lastName?: string;
  companyName?: string;
  nationalRegisterNumber?: string;
  enterpriseNumber?: string;
  address: Address;
  email: string;
  phone?: string;
  lawyer?: Lawyer;
  legalCapacity: boolean;
  interest: string; // Description of legitimate interest
}

/**
 * Legal representative
 */
export interface Lawyer {
  id: string;
  firstName: string;
  lastName: string;
  barNumber: string;
  barAssociation: string;
  address: Address;
  email: string;
  phone: string;
  proxyDocument?: Document;
}

/**
 * Address structure
 */
export interface Address {
  street: string;
  number: string;
  box?: string;
  postalCode: string;
  city: string;
  country: string;
}

/**
 * Public authority being appealed against
 */
export interface PublicAuthority {
  id: string;
  name: string;
  type: 'federal' | 'regional' | 'community' | 'provincial' | 'municipal' | 'public-service';
  department?: string;
  address: Address;
  legalRepresentative?: string;
}

/**
 * Administrative or judicial decision
 */
export interface AdministrativeDecision {
  id: string;
  reference: string;
  date: Date;
  authority: PublicAuthority;
  type: DecisionType;
  subject: string;
  notificationDate?: Date;
  publicationDate?: Date;
  content?: string;
  attachments: Document[];
}

/**
 * Document attachment
 */
export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  category: 'decision' | 'evidence' | 'identity' | 'proxy' | 'other';
  confidential: boolean;
}

/**
 * Appeal deadline information
 */
export interface AppealDeadline {
  procedureType: AppealProcedureType;
  standardDelay: number; // Days
  startDate: Date;
  endDate: Date;
  isExtendable: boolean;
  suspensionPeriods?: {
    start: Date;
    end: Date;
    reason: string;
  }[];
  calculationMethod: 'calendar-days' | 'working-days' | 'judicial-days';
}

/**
 * Standing/Interest requirement
 */
export interface StandingRequirement {
  type: 'direct' | 'indirect' | 'collective' | 'general';
  description: string;
  verified: boolean;
  verificationNotes?: string;
}

// ============================================================================
// MAIN APPEAL APPLICATION INTERFACE
// ============================================================================

/**
 * Complete appeal application
 */
export interface AppealApplication {
  // Basic Information
  id: string;
  caseNumber?: string;
  procedureType: AppealProcedureType;
  status: AppealStatus;
  urgencyLevel: UrgencyLevel;

  // Parties
  appellant: Appellant;
  authority: PublicAuthority;
  interestedParties?: Appellant[];

  // Decision being appealed
  challengedDecision: AdministrativeDecision;

  // Legal basis
  legalGrounds: LegalGround[];
  factualGrounds: string[];
  requestedRelief: Relief[];

  // Procedural elements
  deadline: AppealDeadline;
  standing: StandingRequirement;
  language: 'fr' | 'nl' | 'de';

  // Supporting documents
  documents: Document[];

  // Fees
  filingFee: FilingFee;

  // Timeline
  filingDate?: Date;
  hearingDate?: Date;
  decisionDate?: Date;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
}

/**
 * Legal grounds for appeal
 */
export interface LegalGround {
  type: 'illegality' | 'incompetence' | 'procedural-defect' | 'abuse-of-power' | 'error-of-fact' | 'error-of-law';
  description: string;
  legalReferences: LegalReference[];
}

/**
 * Legal reference
 */
export interface LegalReference {
  type: 'law' | 'decree' | 'regulation' | 'jurisprudence' | 'doctrine';
  title: string;
  article?: string;
  date?: Date;
  url?: string;
}

/**
 * Relief sought
 */
export interface Relief {
  type: 'annulment' | 'suspension' | 'injunction' | 'damages' | 'modification';
  description: string;
  urgency?: boolean;
}

/**
 * Filing fee information
 */
export interface FilingFee {
  amount: number;
  currency: 'EUR';
  paid: boolean;
  paymentMethod?: 'bank-transfer' | 'online' | 'court-registry';
  paymentDate?: Date;
  paymentReference?: string;
  exemptionRequested?: boolean;
  exemptionGranted?: boolean;
}

// ============================================================================
// SPECIFIC PROCEDURE INTERFACES
// ============================================================================

/**
 * Council of State Annulment Procedure
 */
export interface ConseilEtatAnnulationProcedure extends AppealApplication {
  procedureType: 'conseil-etat-annulation';
  suspensionRequested: boolean;
  provisionalMeasuresRequested: boolean;
  administrativeFile: {
    requested: boolean;
    received: boolean;
    documents: Document[];
  };
}

/**
 * Tax Appeal Procedure
 */
export interface TaxAppealProcedure extends AppealApplication {
  procedureType: 'reclamation-fiscale' | 'recours-tribunal-fiscal';
  taxYear: number;
  taxType: 'income-tax' | 'vat' | 'corporate-tax' | 'property-tax' | 'other';
  contestedAmount: number;
  paymentSuspended: boolean;
}

/**
 * CPAS Social Aid Appeal
 */
export interface CPASAppealProcedure extends AppealApplication {
  procedureType: 'recours-cpas';
  benefitType: 'ris' | 'aide-sociale' | 'aide-medicale' | 'autre';
  monthlyAmount?: number;
  retroactiveFrom?: Date;
  urgentNeed: boolean;
}

/**
 * Building Permit Appeal
 */
export interface BuildingPermitAppeal extends AppealApplication {
  procedureType: 'recours-permis-urbanisme';
  permitType: 'construction' | 'renovation' | 'demolition' | 'subdivision';
  projectAddress: Address;
  environmentalImpact: boolean;
  publicInquiryHeld: boolean;
  neighborObjections: number;
}

/**
 * Ombudsman Complaint
 */
export interface OmbudsmanComplaint {
  id: string;
  type: 'mediateur-federal' | 'mediateur-regional' | 'mediateur-communal';
  complainant: Appellant;
  targetAuthority: PublicAuthority;
  subject: string;
  description: string;
  previousSteps: string[];
  desiredOutcome: string;
  status: 'received' | 'under-investigation' | 'recommendation-issued' | 'closed';
  recommendation?: string;
  followUp?: string;
}

/**
 * Access to Documents Request
 */
export interface AccessToDocumentsRequest {
  id: string;
  requester: Appellant;
  authority: PublicAuthority;
  documentsRequested: string[];
  purpose?: string;
  status: 'pending' | 'granted' | 'partially-granted' | 'refused';
  refusalReasons?: string[];
  appealFiled?: boolean;
  documentsProvided?: Document[];
}

// ============================================================================
// CALCULATION AND VALIDATION TYPES
// ============================================================================

/**
 * Deadline calculation result
 */
export interface DeadlineCalculation {
  procedureType: AppealProcedureType;
  notificationDate: Date;
  deadlineInDays: number;
  calculatedDeadline: Date;
  remainingDays: number;
  isExpired: boolean;
  warnings: string[];
}

/**
 * Admissibility check result
 */
export interface AdmissibilityCheck {
  isAdmissible: boolean;
  issues: AdmissibilityIssue[];
  canBeCorrected: boolean;
  correctionDeadline?: Date;
}

/**
 * Admissibility issue
 */
export interface AdmissibilityIssue {
  type: 'deadline' | 'standing' | 'form' | 'fee' | 'signature' | 'language' | 'competence';
  description: string;
  isFatal: boolean;
  correctionPossible: boolean;
}

/**
 * Procedure recommendation
 */
export interface ProcedureRecommendation {
  recommendedProcedure: AppealProcedureType;
  reason: string;
  alternativeProcedures: AppealProcedureType[];
  estimatedDuration: string;
  estimatedCost: number;
  successLikelihood: 'high' | 'medium' | 'low' | 'unknown';
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Standard deadlines for different procedures (in days)
 */
export const APPEAL_DEADLINES: Record<AppealProcedureType, number> = {
  // Administrative appeals
  'recours-administratif-gracieux': 60,
  'recours-administratif-hierarchique': 30,
  'recours-administratif-tutelle': 40,
  'recours-contre-silence-administration': 120,
  'recours-contre-decision-implicite': 60,
  'mediation-administrative': 0, // No specific deadline
  'conciliation-administrative': 0,
  'reclamation-administrative': 60,
  'opposition-administrative': 30,
  'revision-administrative': 60,

  // Council of State
  'conseil-etat-annulation': 60,
  'conseil-etat-suspension': 60,
  'conseil-etat-extreme-urgence': 5,
  'conseil-etat-cassation': 30,
  'conseil-etat-indemnite': 60,
  'conseil-etat-avis': 0,
  'conseil-etat-refere': 15,
  'conseil-etat-revision': 30,
  'conseil-etat-tierce-opposition': 60,
  'conseil-etat-rectification': 30,

  // Tax appeals
  'reclamation-fiscale': 180, // 6 months from assessment
  'recours-tribunal-fiscal': 90,
  'recours-cour-appel-fiscal': 30,
  'recours-cassation-fiscal': 90,
  'procedure-amiable-fiscale': 0,

  // Social security
  'recours-cpas': 90,
  'recours-onem': 90,
  'recours-inami': 90,
  'recours-onss': 90,
  'recours-tribunal-travail': 90,

  // Ombudsman (no strict deadlines)
  'mediateur-federal': 365,
  'mediateur-regional': 365,
  'mediateur-communal': 365,
  'mediateur-pensions': 365,
  'mediateur-energie': 365,

  // Building & Environment
  'recours-permis-urbanisme': 30,
  'recours-permis-environnement': 20,
  'recours-permis-unique': 30,
  'recours-expropriation': 60,
  'recours-patrimoine-classe': 60,

  // Police & Justice
  'plainte-comite-p': 0,
  'plainte-inspection-generale': 0,
  'plainte-controle-detention': 0,
  'recours-sanction-administrative': 30,
  'recours-ordre-public': 15,

  // Access to information
  'acces-documents-administratifs': 30,
  'rectification-donnees-personnelles': 60,
  'transparence-administrative': 30,
  'consultation-dossier-administratif': 30,
  'publicite-administration': 30,
};

/**
 * Filing fees by procedure type (in EUR)
 */
export const FILING_FEES: Record<AppealProcedureType, number> = {
  // Administrative appeals (usually free)
  'recours-administratif-gracieux': 0,
  'recours-administratif-hierarchique': 0,
  'recours-administratif-tutelle': 0,
  'recours-contre-silence-administration': 0,
  'recours-contre-decision-implicite': 0,
  'mediation-administrative': 0,
  'conciliation-administrative': 0,
  'reclamation-administrative': 0,
  'opposition-administrative': 0,
  'revision-administrative': 0,

  // Council of State
  'conseil-etat-annulation': 200,
  'conseil-etat-suspension': 200,
  'conseil-etat-extreme-urgence': 400,
  'conseil-etat-cassation': 200,
  'conseil-etat-indemnite': 200,
  'conseil-etat-avis': 0,
  'conseil-etat-refere': 200,
  'conseil-etat-revision': 200,
  'conseil-etat-tierce-opposition': 200,
  'conseil-etat-rectification': 0,

  // Tax appeals
  'reclamation-fiscale': 0,
  'recours-tribunal-fiscal': 50,
  'recours-cour-appel-fiscal': 100,
  'recours-cassation-fiscal': 375,
  'procedure-amiable-fiscale': 0,

  // Social security (pro deo possible)
  'recours-cpas': 0,
  'recours-onem': 0,
  'recours-inami': 0,
  'recours-onss': 0,
  'recours-tribunal-travail': 0,

  // Ombudsman (free)
  'mediateur-federal': 0,
  'mediateur-regional': 0,
  'mediateur-communal': 0,
  'mediateur-pensions': 0,
  'mediateur-energie': 0,

  // Building & Environment
  'recours-permis-urbanisme': 100,
  'recours-permis-environnement': 100,
  'recours-permis-unique': 150,
  'recours-expropriation': 200,
  'recours-patrimoine-classe': 100,

  // Police & Justice
  'plainte-comite-p': 0,
  'plainte-inspection-generale': 0,
  'plainte-controle-detention': 0,
  'recours-sanction-administrative': 50,
  'recours-ordre-public': 100,

  // Access to information (usually free)
  'acces-documents-administratifs': 0,
  'rectification-donnees-personnelles': 0,
  'transparence-administrative': 0,
  'consultation-dossier-administratif': 0,
  'publicite-administration': 0,
};

/**
 * Competent jurisdictions by procedure type
 */
export const COMPETENT_JURISDICTIONS: Record<AppealProcedureType, string> = {
  // Administrative level
  'recours-administratif-gracieux': 'Same authority that issued the decision',
  'recours-administratif-hierarchique': 'Hierarchical superior authority',
  'recours-administratif-tutelle': 'Supervisory authority',
  'recours-contre-silence-administration': 'Authority concerned or Council of State',
  'recours-contre-decision-implicite': 'Authority concerned or Council of State',
  'mediation-administrative': 'Administrative mediator',
  'conciliation-administrative': 'Conciliation commission',
  'reclamation-administrative': 'Issuing authority',
  'opposition-administrative': 'Issuing authority',
  'revision-administrative': 'Issuing authority',

  // Council of State
  'conseil-etat-annulation': 'Conseil d\'État - Section du contentieux administratif',
  'conseil-etat-suspension': 'Conseil d\'État - Section du contentieux administratif',
  'conseil-etat-extreme-urgence': 'Conseil d\'État - Référé',
  'conseil-etat-cassation': 'Conseil d\'État - Section du contentieux administratif',
  'conseil-etat-indemnite': 'Conseil d\'État - Section du contentieux administratif',
  'conseil-etat-avis': 'Conseil d\'État - Section de législation',
  'conseil-etat-refere': 'Conseil d\'État - Président ou conseiller désigné',
  'conseil-etat-revision': 'Conseil d\'État - Section du contentieux administratif',
  'conseil-etat-tierce-opposition': 'Conseil d\'État - Section du contentieux administratif',
  'conseil-etat-rectification': 'Conseil d\'État - Chambre qui a rendu l\'arrêt',

  // Tax
  'reclamation-fiscale': 'Directeur régional des contributions',
  'recours-tribunal-fiscal': 'Tribunal de première instance',
  'recours-cour-appel-fiscal': 'Cour d\'appel',
  'recours-cassation-fiscal': 'Cour de cassation',
  'procedure-amiable-fiscale': 'Service de conciliation fiscale',

  // Social security
  'recours-cpas': 'Tribunal du travail',
  'recours-onem': 'Tribunal du travail',
  'recours-inami': 'Tribunal du travail',
  'recours-onss': 'Tribunal du travail',
  'recours-tribunal-travail': 'Tribunal du travail',

  // Ombudsman
  'mediateur-federal': 'Médiateur fédéral',
  'mediateur-regional': 'Médiateur régional (Wallonie/Flandre/Bruxelles)',
  'mediateur-communal': 'Médiateur communal',
  'mediateur-pensions': 'Service de médiation pour les pensions',
  'mediateur-energie': 'Service de médiation de l\'énergie',

  // Building & Environment
  'recours-permis-urbanisme': 'Gouvernement régional ou provincial',
  'recours-permis-environnement': 'Gouvernement régional',
  'recours-permis-unique': 'Gouvernement régional',
  'recours-expropriation': 'Justice de paix puis Tribunal de première instance',
  'recours-patrimoine-classe': 'Gouvernement régional',

  // Police & Justice
  'plainte-comite-p': 'Comité permanent de contrôle des services de police',
  'plainte-inspection-generale': 'Inspection générale de la police',
  'plainte-controle-detention': 'Commission de surveillance pénitentiaire',
  'recours-sanction-administrative': 'Tribunal de police',
  'recours-ordre-public': 'Conseil d\'État ou Tribunal de première instance',

  // Access to information
  'acces-documents-administratifs': 'Commission d\'accès aux documents administratifs',
  'rectification-donnees-personnelles': 'Autorité de protection des données',
  'transparence-administrative': 'Commission d\'accès aux documents administratifs',
  'consultation-dossier-administratif': 'Authority holding the file',
  'publicite-administration': 'Commission d\'accès aux documents administratifs',
};