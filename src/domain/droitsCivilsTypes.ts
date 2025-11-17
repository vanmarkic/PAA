/**
 * DROITS CIVILS (Civil Rights) Domain Types
 *
 * Complete type system for 50 Belgian civil rights and civil status procedures
 *
 * Legal basis:
 * - Code Civil belge
 * - Code de la nationalité belge
 * - Loi RGPD et vie privée
 * - Loi sur la cohabitation légale
 * - Code consulaire
 */

// ========================================
// 1. IDENTITY DOCUMENTS (10 procedures)
// ========================================

export type IdentityDocumentType =
  | 'carte-identite'           // Belgian ID card
  | 'carte-identite-enfant'     // Kids ID
  | 'passeport'                 // Passport
  | 'titre-voyage-refugie'      // Refugee travel document
  | 'titre-voyage-apatride'     // Stateless travel document
  | 'carte-a'                   // Foreigner card A
  | 'carte-b'                   // Foreigner card B
  | 'carte-c'                   // Permanent resident card C
  | 'carte-f'                   // EU family member card F
  | 'carte-f-plus';             // Permanent EU family member card F+

export type DocumentStatus =
  | 'valide'
  | 'expire'
  | 'perdu'
  | 'vole'
  | 'endommage'
  | 'en-production'
  | 'annule';

export interface IdentityDocument {
  type: IdentityDocumentType;
  number: string;
  issuedDate: Date;
  expiryDate: Date;
  status: DocumentStatus;
  holderNationalNumber: string;
  biometric: boolean;
  urgentProcedure: boolean;
}

// ========================================
// 2. CIVIL STATUS (10 procedures)
// ========================================

export type CivilStatusType =
  | 'acte-naissance'            // Birth certificate
  | 'acte-mariage'              // Marriage certificate
  | 'acte-divorce'              // Divorce certificate
  | 'acte-deces'                // Death certificate
  | 'acte-reconnaissance'       // Recognition act
  | 'acte-adoption'             // Adoption act
  | 'extrait-casier-judiciaire' // Criminal record extract
  | 'certificat-nationalite'    // Nationality certificate
  | 'certificat-residence'      // Residence certificate
  | 'certificat-vie';           // Life certificate

export interface CivilStatusDocument {
  type: CivilStatusType;
  personConcerned: string; // National number
  issueDate: Date;
  commune: string;
  language: 'fr' | 'nl' | 'de';
  purpose: string;
  international: boolean; // Apostille/legalization
}

// ========================================
// 3. MARRIAGE & PARTNERSHIP (10 procedures)
// ========================================

export type MarriageStatus =
  | 'celibataire'
  | 'marie'
  | 'divorce'
  | 'veuf'
  | 'cohabitant-legal';

export type MarriageProcedureType =
  | 'declaration-mariage'       // Marriage declaration
  | 'celebration-mariage'       // Marriage celebration
  | 'cohabitation-legale'       // Legal cohabitation
  | 'fin-cohabitation'          // End cohabitation
  | 'divorce-consentement'      // Divorce by consent
  | 'divorce-desunion'          // Divorce for breakdown
  | 'separation-corps'          // Legal separation
  | 'contrat-mariage'           // Marriage contract
  | 'regime-matrimonial'        // Matrimonial regime change
  | 'reconnaissance-mariage';    // Foreign marriage recognition

export interface MarriageProcedure {
  type: MarriageProcedureType;
  partner1: PersonDetails;
  partner2: PersonDetails;
  dateSubmitted: Date;
  plannedDate?: Date;
  notary?: string;
  witnesses?: PersonDetails[];
  minorChildren?: number;
  propertyRegime?: 'communaute' | 'separation' | 'participation';
}

// ========================================
// 4. NAME & GENDER (5 procedures)
// ========================================

export type NameChangeType =
  | 'changement-nom'            // Name change
  | 'changement-prenom'          // First name change
  | 'changement-genre'           // Gender change
  | 'rectification-acte'        // Act rectification
  | 'transcription-acte';        // Foreign act transcription

export interface NameGenderChange {
  type: NameChangeType;
  currentValue: string;
  requestedValue: string;
  reason: string;
  judicialProcedure: boolean;
  minorConsent?: boolean; // For minors 12-16
}

// ========================================
// 5. PRIVACY & DATA RIGHTS (10 procedures)
// ========================================

export type PrivacyRightType =
  | 'acces-donnees'             // Data access right
  | 'rectification-donnees'     // Data rectification
  | 'effacement-donnees'        // Right to be forgotten
  | 'opposition-traitement'     // Opposition to processing
  | 'portabilite-donnees'       // Data portability
  | 'limitation-traitement'     // Processing limitation
  | 'notification-violation'    // Breach notification
  | 'consultation-registre'     // Registry consultation
  | 'copie-dossier-medical'     // Medical file copy
  | 'acces-camera-surveillance'; // CCTV footage access

export interface PrivacyRequest {
  type: PrivacyRightType;
  dataController: string;
  justification: string;
  urgency: 'normal' | 'urgent' | 'immediate';
  responseDeadline: Date; // GDPR: 30 days
  concernedData: string[];
}

// ========================================
// 6. INHERITANCE & SUCCESSION (5 procedures)
// ========================================

export type SuccessionType =
  | 'declaration-succession'    // Succession declaration
  | 'renonciation-succession'   // Succession renunciation
  | 'acceptation-benefice'      // Acceptance under benefit
  | 'certificat-heredite'       // Inheritance certificate
  | 'partage-succession';        // Succession division

export interface SuccessionProcedure {
  type: SuccessionType;
  deceased: PersonDetails;
  heirs: Heir[];
  notary: string;
  declarationDeadline: Date; // 4 months in Belgium
  estimatedValue: number;
  debts: number;
}

// ========================================
// 7. ADOPTION & PARENTHOOD (5 procedures)
// ========================================

export type AdoptionType =
  | 'adoption-simple'           // Simple adoption
  | 'adoption-pleniere'         // Full adoption
  | 'adoption-internationale'   // International adoption
  | 'reconnaissance-paternite'  // Paternity recognition
  | 'recherche-paternite';      // Paternity search

export interface AdoptionProcedure {
  type: AdoptionType;
  adoptiveParents: PersonDetails[];
  child: PersonDetails;
  biologicalParentsConsent?: boolean;
  courtApproval: boolean;
  internationalConvention?: string; // Hague Convention
}

// ========================================
// 8. LEGAL CAPACITY (5 procedures)
// ========================================

export type LegalCapacityType =
  | 'protection-judiciaire'     // Judicial protection
  | 'administration-biens'      // Property administration
  | 'mandat-protection'         // Protection mandate
  | 'emancipation-mineur'       // Minor emancipation
  | 'declaration-absence';      // Declaration of absence

export interface LegalCapacityProcedure {
  type: LegalCapacityType;
  concernedPerson: PersonDetails;
  representative?: PersonDetails;
  courtDecision?: string;
  medicalCertificate?: boolean;
  duration?: number; // months
}

// ========================================
// COMMON TYPES & INTERFACES
// ========================================

export interface PersonDetails {
  nationalNumber: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  birthPlace: string;
  nationality: string;
  address: Address;
  civilStatus: MarriageStatus;
  email?: string;
  phone?: string;
}

export interface Address {
  street: string;
  number: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface Heir {
  person: PersonDetails;
  relationship: 'spouse' | 'child' | 'parent' | 'sibling' | 'other';
  legalShare: number; // percentage
  testamentaryShare?: number;
}

// ========================================
// REQUEST & RESULT TYPES
// ========================================

export interface CivilRightsRequest {
  id: string;
  type: string; // One of the 50 procedure types
  applicant: PersonDetails;
  submittedAt: Date;
  commune: string;
  status: RequestStatus;
  documents: RequiredDocument[];
  fees: ProcedureFees;
  processingTime: ProcessingTime;
}

export type RequestStatus =
  | 'draft'
  | 'submitted'
  | 'documents-missing'
  | 'under-review'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'archived';

export interface RequiredDocument {
  name: string;
  type: string;
  mandatory: boolean;
  submitted: boolean;
  validatedAt?: Date;
  rejectionReason?: string;
}

export interface ProcedureFees {
  baseFee: number;
  urgentFee?: number;
  stampDuty: number;
  notaryFees?: number;
  translationFees?: number;
  total: number;
  paid: boolean;
  paymentMethod?: 'card' | 'bank-transfer' | 'cash';
}

export interface ProcessingTime {
  standard: number; // days
  urgent?: number; // days
  currentEstimate: number;
  legalDeadline?: number;
  startedAt?: Date;
  completedAt?: Date;
}

// ========================================
// ELIGIBILITY & VALIDATION
// ========================================

export interface EligibilityCriteria {
  minAge?: number;
  maxAge?: number;
  nationality?: string[];
  residence?: string[];
  civilStatus?: MarriageStatus[];
  parentalConsent?: boolean;
  judicialApproval?: boolean;
  notaryRequired?: boolean;
  specificConditions?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
  missingDocuments: string[];
  estimatedFees: number;
  estimatedTime: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

// ========================================
// LEGAL REFERENCES & METADATA
// ========================================

export interface CivilRightsProcedureMetadata {
  procedureId: string;
  name: string;
  description: string;
  category: string;
  legalBasis: LegalBasis[];
  competentAuthority: string;
  availableLanguages: ('fr' | 'nl' | 'de')[];
  onlineAvailable: boolean;
  requiresAppointment: boolean;
}

export interface LegalBasis {
  type: 'code-civil' | 'loi' | 'arrete-royal' | 'ordonnance' | 'reglement-eu';
  reference: string;
  articles: string[];
  url: string;
  lastUpdated: Date;
}

// ========================================
// CONSTANTS
// ========================================

export const CIVIL_RIGHTS_CONSTANTS = {
  // Identity documents
  ID_CARD_VALIDITY_ADULT: 10, // years
  ID_CARD_VALIDITY_MINOR: 5,  // years
  PASSPORT_VALIDITY: 10,       // years
  URGENT_PROCEDURE_DAYS: 2,

  // Marriage & Partnership
  MARRIAGE_MIN_AGE: 18,
  MARRIAGE_DECLARATION_DAYS: 14, // minimum before celebration
  DIVORCE_SEPARATION_MONTHS: 12, // for breakdown

  // Name & Gender
  NAME_CHANGE_WAITING_PERIOD: 3, // months
  GENDER_CHANGE_MIN_AGE: 16,     // with parental consent from 16-18

  // Privacy (GDPR)
  GDPR_RESPONSE_DAYS: 30,
  GDPR_COMPLEX_EXTENSION: 60,     // additional days for complex requests
  DATA_BREACH_NOTIFICATION: 72,   // hours

  // Succession
  SUCCESSION_DECLARATION_MONTHS: 4,
  SUCCESSION_TAX_PAYMENT_MONTHS: 2,
  RENUNCIATION_MONTHS: 3,

  // Adoption
  ADOPTION_MIN_AGE_DIFFERENCE: 15, // years between adoptive parent and child
  ADOPTION_MIN_PARENT_AGE: 25,

  // Fees (EUR)
  ID_CARD_FEE: 20,
  ID_CARD_URGENT_FEE: 90,
  PASSPORT_FEE: 65,
  PASSPORT_URGENT_FEE: 240,
  NAME_CHANGE_FEE: 490,
  GENDER_CHANGE_FEE: 135,
  MARRIAGE_CERTIFICATE_FEE: 25,
  GDPR_REQUEST_FEE: 0, // first request free
  GDPR_ADDITIONAL_COPY_FEE: 10,
};

// ========================================
// PROCEDURE CATEGORIES
// ========================================

export const CIVIL_RIGHTS_CATEGORIES = {
  IDENTITY: [
    'carte-identite',
    'carte-identite-enfant',
    'passeport',
    'titre-voyage-refugie',
    'titre-voyage-apatride',
    'carte-a',
    'carte-b',
    'carte-c',
    'carte-f',
    'carte-f-plus',
  ],

  CIVIL_STATUS: [
    'acte-naissance',
    'acte-mariage',
    'acte-divorce',
    'acte-deces',
    'acte-reconnaissance',
    'acte-adoption',
    'extrait-casier-judiciaire',
    'certificat-nationalite',
    'certificat-residence',
    'certificat-vie',
  ],

  MARRIAGE_PARTNERSHIP: [
    'declaration-mariage',
    'celebration-mariage',
    'cohabitation-legale',
    'fin-cohabitation',
    'divorce-consentement',
    'divorce-desunion',
    'separation-corps',
    'contrat-mariage',
    'regime-matrimonial',
    'reconnaissance-mariage',
  ],

  NAME_GENDER: [
    'changement-nom',
    'changement-prenom',
    'changement-genre',
    'rectification-acte',
    'transcription-acte',
  ],

  PRIVACY_DATA: [
    'acces-donnees',
    'rectification-donnees',
    'effacement-donnees',
    'opposition-traitement',
    'portabilite-donnees',
    'limitation-traitement',
    'notification-violation',
    'consultation-registre',
    'copie-dossier-medical',
    'acces-camera-surveillance',
  ],

  SUCCESSION: [
    'declaration-succession',
    'renonciation-succession',
    'acceptation-benefice',
    'certificat-heredite',
    'partage-succession',
  ],

  ADOPTION_PARENTHOOD: [
    'adoption-simple',
    'adoption-pleniere',
    'adoption-internationale',
    'reconnaissance-paternite',
    'recherche-paternite',
  ],

  LEGAL_CAPACITY: [
    'protection-judiciaire',
    'administration-biens',
    'mandat-protection',
    'emancipation-mineur',
    'declaration-absence',
  ],
};

// Total: 50 procedures across 8 categories
export const TOTAL_CIVIL_RIGHTS_PROCEDURES = 50;