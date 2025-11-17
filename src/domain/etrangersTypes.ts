/**
 * FOREIGNERS' RIGHTS (DROITS DES ÉTRANGERS) Domain Types
 *
 * Comprehensive type definitions for 50 immigration and foreigners' rights procedures
 * in Belgium covering residence permits, visas, asylum, naturalization, and more.
 *
 * Legal basis:
 * - Loi du 15 décembre 1980 sur l'accès au territoire, le séjour, l'établissement et l'éloignement des étrangers
 * - Code de la nationalité belge (CNB)
 * - Directives européennes applicables
 * - Règlements CGRA (Commissariat général aux réfugiés et aux apatrides)
 */

// ==================== CORE TYPES ====================

export type Nationality =
  | 'belgian'
  | 'eu-citizen'
  | 'eea-citizen'
  | 'swiss'
  | 'third-country';

export type ResidenceStatus =
  | 'no-status'
  | 'short-stay' // Court séjour (max 90 jours)
  | 'long-stay' // Long séjour
  | 'temporary-residence' // Séjour temporaire (Carte A)
  | 'permanent-residence' // Séjour permanent (Carte B)
  | 'eu-long-term-resident' // Résident de longue durée-UE (Carte D)
  | 'eu-citizen-registration' // Citoyen UE (Carte E/E+)
  | 'eu-permanent-residence' // Séjour permanent UE (Carte F/F+)
  | 'refugee-status' // Statut de réfugié
  | 'subsidiary-protection' // Protection subsidiaire
  | 'temporary-protection' // Protection temporaire
  | 'stateless' // Apatride
  | 'awaiting-decision'; // En attente de décision

export type VisaType =
  | 'schengen-short-stay' // Visa C (max 90 jours)
  | 'national-long-stay' // Visa D (plus de 90 jours)
  | 'airport-transit' // Visa A (transit aéroportuaire)
  | 'student' // Visa étudiant
  | 'work' // Visa travail
  | 'family-reunification' // Regroupement familial
  | 'medical-treatment' // Traitement médical
  | 'business' // Affaires
  | 'tourism' // Tourisme
  | 'cultural-sports' // Culturel/Sportif
  | 'diplomatic' // Diplomatique
  | 'service' // Service
  | 'official'; // Officiel

export type ResidenceCardType =
  | 'A' // Certificat d'inscription au registre des étrangers - séjour temporaire
  | 'B' // Certificat d'inscription au registre des étrangers - séjour illimité
  | 'C' // Carte d'identité d'étranger
  | 'D' // Résident de longue durée-UE
  | 'E' // Attestation d'enregistrement - citoyen UE
  | 'E+' // Document attestant de la permanence du séjour - citoyen UE
  | 'F' // Carte de séjour de membre de la famille d'un citoyen de l'Union
  | 'F+' // Carte de séjour permanent de membre de la famille d'un citoyen de l'Union
  | 'H' // Carte bleue européenne
  | 'K' // Carte de résident de longue durée-UE (ancienne carte)
  | 'L' // Duplicate (perte/vol)
  | 'M' // Titre de séjour de ressortissant non-UE, petit trafic frontalier
  | 'N' // Document spécial de séjour (protection internationale)
  | 'EU' // Carte pour fonctionnaire UE et famille
  | 'EU+' // Carte permanente pour fonctionnaire UE et famille
  | 'AI' // Attestation d'immatriculation (orange)
  | 'Annexe-3' // Ordre de quitter le territoire
  | 'Annexe-13' // OQT avec interdiction d'entrée
  | 'Annexe-15' // Attestation de séjour temporaire
  | 'Annexe-19' // Demande de séjour étudiant
  | 'Annexe-19ter' // Demande de regroupement familial
  | 'Annexe-35' // Document spécial de séjour';

export type WorkPermitType =
  | 'A' // Durée illimitée, tous employeurs
  | 'B' // Durée limitée, employeur spécifique
  | 'C' // Durée limitée, changement d'employeur possible
  | 'single-permit' // Permis unique (travail + séjour)
  | 'blue-card' // Carte bleue européenne
  | 'seasonal' // Travailleur saisonnier
  | 'intra-corporate-transfer' // Transfert intra-entreprise
  | 'researcher' // Chercheur
  | 'highly-skilled' // Hautement qualifié
  | 'self-employed' // Indépendant
  | 'professional-card'; // Carte professionnelle

export type AsylumStatus =
  | 'not-applied'
  | 'application-submitted'
  | 'dublin-procedure' // Procédure Dublin III
  | 'admissible-procedure' // Procédure recevable
  | 'examination-ongoing' // Examen en cours
  | 'refugee-recognized' // Reconnu réfugié
  | 'subsidiary-protection-granted' // Protection subsidiaire accordée
  | 'rejected-first-instance' // Rejeté en première instance
  | 'appeal-ongoing' // Recours en cours
  | 'appeal-rejected' // Recours rejeté
  | 'temporary-protection' // Protection temporaire
  | 'humanitarian-regularization' // Régularisation humanitaire (9bis)
  | 'medical-regularization'; // Régularisation médicale (9ter)

export type FamilyRelationship =
  | 'spouse' // Époux/épouse
  | 'registered-partner' // Partenaire enregistré
  | 'de-facto-partner' // Cohabitant de fait
  | 'minor-child' // Enfant mineur
  | 'adult-child-dependent' // Enfant majeur à charge
  | 'parent' // Parent
  | 'grandparent' // Grand-parent
  | 'sibling' // Frère/sœur
  | 'other-dependent'; // Autre personne à charge

export type IntegrationRequirement =
  | 'language-french-a2' // Français niveau A2
  | 'language-dutch-a2' // Néerlandais niveau A2
  | 'language-german-a2' // Allemand niveau A2
  | 'civic-integration-course' // Cours d'intégration civique
  | 'economic-participation' // Participation économique
  | 'social-integration' // Intégration sociale
  | 'professional-activity'; // Activité professionnelle

export type AppealType =
  | 'ccce' // Conseil du Contentieux des Étrangers (CCE)
  | 'conseil-etat' // Conseil d'État
  | 'cassation' // Cassation
  | 'suspension' // Suspension
  | 'annulation' // Annulation
  | 'extreme-urgency' // Extrême urgence
  | 'european-court' // Cour européenne
  | 'constitutional-court'; // Cour constitutionnelle

// ==================== USER PROFILE ====================

export interface ForeignerProfile {
  // Personal Information
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  nationality: Nationality;
  countryOfOrigin: string;
  gender: 'M' | 'F' | 'X';

  // Current Status
  currentResidenceStatus: ResidenceStatus;
  currentCardType?: ResidenceCardType;
  cardExpiryDate?: Date;
  nationalRegisterNumber?: string; // Numéro de registre national
  foreignerFileNumber?: string; // Numéro de dossier étranger

  // Entry and Stay
  dateOfEntry: Date;
  purposeOfStay: string;
  currentAddress?: Address;
  registeredMunicipality?: string;

  // Family Situation
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | 'registered-partnership';
  familyMembers: FamilyMember[];

  // Economic Situation
  employmentStatus: 'employed' | 'self-employed' | 'unemployed' | 'student' | 'retired' | 'other';
  monthlyIncome?: number;
  hasFinancialSupport: boolean;
  financialGuarantor?: FinancialGuarantor;

  // Integration
  languageSkills: LanguageSkill[];
  integrationCourseCompleted: boolean;
  integrationCertificate?: IntegrationCertificate;

  // Legal History
  hasConvictions: boolean;
  hasPublicOrderIssues: boolean;
  hasOQT: boolean; // Ordre de quitter le territoire
  hasEntryBan: boolean;

  // Documents
  passport?: PassportInfo;
  documents: Document[];
}

export interface Address {
  street: string;
  number: string;
  box?: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface FamilyMember {
  relationship: FamilyRelationship;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  nationality: Nationality;
  residenceStatus?: ResidenceStatus;
  livingTogether: boolean;
  financiallyDependent: boolean;
}

export interface FinancialGuarantor {
  type: 'individual' | 'organization';
  name: string;
  nationalRegisterNumber?: string;
  companyNumber?: string;
  monthlyIncome: number;
  engagementDocument?: string;
}

export interface LanguageSkill {
  language: 'french' | 'dutch' | 'german' | 'english';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  certificateDate?: Date;
  certificateNumber?: string;
}

export interface IntegrationCertificate {
  type: 'inburgering' | 'parcours-integration' | 'other';
  issuedDate: Date;
  issuedBy: string;
  certificateNumber: string;
}

export interface PassportInfo {
  number: string;
  issuedBy: string;
  issuedDate: Date;
  expiryDate: Date;
  type: 'ordinary' | 'diplomatic' | 'service' | 'special';
}

export interface Document {
  type: string;
  reference: string;
  issuedDate: Date;
  expiryDate?: Date;
  verified: boolean;
}

// ==================== PROCEDURE APPLICATIONS ====================

export interface ResidencePermitApplication {
  applicationType: 'new' | 'renewal' | 'modification' | 'permanent';
  requestedCardType: ResidenceCardType;
  basisForResidence: string;
  municipality: string;
  appointmentDate?: Date;
  appointmentReference?: string;
  supportingDocuments: string[];
  fees: ApplicationFees;
  status: ApplicationStatus;
}

export interface VisaApplication {
  visaType: VisaType;
  duration: number; // in days
  entries: 'single' | 'multiple';
  purpose: string;
  intendedArrival: Date;
  intendedDeparture: Date;
  invitingPerson?: InvitingPerson;
  accommodation: AccommodationInfo;
  travelInsurance: TravelInsurance;
  biometricsCollected: boolean;
  consulate: string;
  status: ApplicationStatus;
}

export interface FamilyReunificationApplication {
  sponsor: ForeignerProfile;
  applicant: ForeignerProfile;
  relationship: FamilyRelationship;
  proofOfRelationship: string[];
  housingProof: HousingProof;
  incomeProof: IncomeProof;
  healthInsurance: HealthInsurance;
  status: ApplicationStatus;
}

export interface AsylumApplication {
  applicationType: 'first-time' | 'subsequent' | 'reopening';
  fearOfPersecution: string;
  countryOfPersecution: string;
  dublinCountry?: string;
  vulnerabilities: string[];
  languagePreference: 'french' | 'dutch';
  legalAid: boolean;
  fedasilAccommodation: boolean;
  status: AsylumStatus;
}

export interface WorkPermitApplication {
  permitType: WorkPermitType;
  employer?: Employer;
  jobDescription: string;
  salary: number;
  contractType: 'permanent' | 'fixed-term' | 'interim';
  contractDuration?: number; // in months
  qualifications: string[];
  laborMarketTest: boolean;
  status: ApplicationStatus;
}

export interface NaturalizationApplication {
  type: 'naturalization' | 'nationality-declaration' | 'option';
  yearsOfResidence: number;
  uninterruptedResidence: boolean;
  economicParticipation: EconomicParticipation;
  socialIntegration: SocialIntegration;
  languageProof: LanguageSkill;
  noConvictions: boolean;
  noFiscalDebts: boolean;
  status: ApplicationStatus;
}

export interface AppealApplication {
  appealType: AppealType;
  contestedDecision: string;
  decisionDate: Date;
  grounds: string[];
  urgency: boolean;
  legalRepresentation: LegalRepresentation;
  proofOfPayment?: PaymentProof;
  status: AppealStatus;
}

// ==================== SUPPORTING TYPES ====================

export interface ApplicationStatus {
  stage: 'preparation' | 'submitted' | 'under-review' | 'additional-docs-requested' |
         'interview-scheduled' | 'decision-pending' | 'approved' | 'rejected' | 'withdrawn';
  lastUpdate: Date;
  nextAction?: string;
  estimatedDecisionDate?: Date;
}

export interface AppealStatus {
  stage: 'filed' | 'registered' | 'hearing-scheduled' | 'hearing-held' |
         'decision-pending' | 'granted' | 'rejected' | 'withdrawn';
  hearingDate?: Date;
  decisionDate?: Date;
  nextDeadline?: Date;
}

export interface ApplicationFees {
  baseFee: number;
  additionalFees?: number;
  expeditedProcessing?: number;
  totalFee: number;
  paid: boolean;
  paymentDate?: Date;
  paymentReference?: string;
}

export interface InvitingPerson {
  name: string;
  relationship: string;
  address: Address;
  nationalRegisterNumber?: string;
  engagementLetter?: string;
}

export interface AccommodationInfo {
  type: 'hotel' | 'private' | 'family' | 'other';
  address: Address;
  bookingConfirmation?: string;
  ownerConsent?: string;
}

export interface TravelInsurance {
  provider: string;
  policyNumber: string;
  coverage: number;
  validFrom: Date;
  validTo: Date;
}

export interface HousingProof {
  type: 'ownership' | 'rental' | 'hosted';
  surface: number; // in m²
  rooms: number;
  conformityCertificate?: string;
  rentAmount?: number;
}

export interface IncomeProof {
  type: 'employment' | 'self-employment' | 'pension' | 'benefits' | 'other';
  monthlyAmount: number;
  stability: 'permanent' | 'temporary' | 'variable';
  documents: string[];
}

export interface HealthInsurance {
  provider: string;
  coverage: 'basic' | 'comprehensive';
  familyMembers: string[];
  validUntil: Date;
}

export interface Employer {
  name: string;
  companyNumber: string;
  sector: string;
  address: Address;
  contactPerson: string;
  limosaDeclaration?: string;
}

export interface EconomicParticipation {
  workDays: number; // over 5 years
  selfEmploymentYears?: number;
  studyYears?: number;
  contributionProof: string[];
}

export interface SocialIntegration {
  diploma?: string;
  professionalTraining?: string;
  integrationCourse?: string;
  volunteerWork?: string;
  communityInvolvement: string[];
}

export interface LegalRepresentation {
  hasLawyer: boolean;
  lawyerName?: string;
  lawyerBarNumber?: string;
  proBonoAid?: boolean;
}

export interface PaymentProof {
  amount: number;
  paymentDate: Date;
  paymentMethod: 'bank-transfer' | 'online' | 'cash';
  reference: string;
}

// ==================== RESULT TYPES ====================

export interface EligibilityResult {
  isEligible: boolean;
  procedure: string;
  requirements: RequirementCheck[];
  missingDocuments?: string[];
  estimatedProcessingTime?: number; // in days
  fees?: ApplicationFees;
  nextSteps?: string[];
  warnings?: string[];
  alternativeProcedures?: string[];
}

export interface RequirementCheck {
  requirement: string;
  met: boolean;
  details?: string;
  documents?: string[];
}

export interface ProcedureResult {
  success: boolean;
  applicationId?: string;
  referenceNumber?: string;
  decision?: 'approved' | 'rejected' | 'partially-approved';
  reasons?: string[];
  validityPeriod?: {
    from: Date;
    to: Date;
  };
  conditions?: string[];
  appealDeadline?: Date;
  notifications: Notification[];
}

export interface Notification {
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  date: Date;
  actionRequired?: boolean;
}

// ==================== CONSTANTS ====================

export const RESIDENCE_PERMIT_FEES = {
  CARD_A_NEW: 180,
  CARD_A_RENEWAL: 60,
  CARD_B: 200,
  CARD_C: 215,
  CARD_D: 215,
  CARD_E: 60,
  CARD_E_PLUS: 60,
  CARD_F: 200,
  CARD_F_PLUS: 200,
  CARD_H: 350, // Carte bleue
  BIOMETRIC_CARD_FEE: 20,
  EXPEDITED_PROCESSING: 180,
};

export const VISA_FEES = {
  SCHENGEN_SHORT_STAY: 80,
  SCHENGEN_CHILD: 40,
  SCHENGEN_REDUCED: 35,
  NATIONAL_LONG_STAY: 180,
  STUDENT: 200,
  WORK: 350,
  FAMILY_REUNIFICATION_EU: 0,
  FAMILY_REUNIFICATION_NON_EU: 180,
};

export const APPEAL_FEES = {
  CCE_STANDARD: 200,
  CCE_URGENT: 200,
  CONSEIL_ETAT: 200,
  CASSATION_ADMINISTRATIVE: 200,
};

export const PROCESSING_TIMES = {
  VISA_SHORT_STAY: 15,
  VISA_LONG_STAY: 90,
  RESIDENCE_PERMIT_NEW: 120,
  RESIDENCE_PERMIT_RENEWAL: 45,
  FAMILY_REUNIFICATION_EU: 180,
  FAMILY_REUNIFICATION_NON_EU: 270,
  ASYLUM_FIRST_INSTANCE: 180,
  WORK_PERMIT_B: 30,
  SINGLE_PERMIT: 120,
  BLUE_CARD: 90,
  NATURALIZATION: 365,
  APPEAL_CCE: 60,
};

export const INCOME_REQUIREMENTS = {
  FAMILY_REUNIFICATION_SPONSOR: 1953.00, // 120% du RIS famille
  STUDENT_SUFFICIENT_MEANS: 730.00, // per month
  BLUE_CARD_MINIMUM_SALARY_MULTIPLIER: 1.5, // x average salary
  SELF_EMPLOYED_MINIMUM: 1500.00,
};

export const INTEGRATION_LEVELS = {
  LANGUAGE_MINIMUM: 'A2' as const,
  LANGUAGE_NATURALIZATION: 'A2' as const,
  LANGUAGE_PERMANENT_RESIDENCE: 'A2' as const,
};

export const AGE_REQUIREMENTS = {
  MINOR: 18,
  STUDENT_MAX: 25,
  FAMILY_REUNIFICATION_CHILD_MAX: 18,
  RETIREMENT: 65,
};

export const RESIDENCE_DURATION_REQUIREMENTS = {
  PERMANENT_RESIDENCE_EU: 5, // years
  LONG_TERM_RESIDENT_EU: 5, // years
  NATURALIZATION_STANDARD: 5, // years
  NATURALIZATION_REFUGEE: 5, // years from recognition
  NATURALIZATION_MARRIED: 3, // years if married to Belgian
};