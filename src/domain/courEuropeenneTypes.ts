/**
 * European Court of Human Rights (ECHR) Domain Types
 *
 * Legal basis:
 * - European Convention on Human Rights (ECHR)
 *   https://www.echr.coe.int/documents/convention_eng.pdf
 * - Rules of Court (January 2024)
 *   https://www.echr.coe.int/documents/rules_court_eng.pdf
 * - Practice Directions
 *   https://www.echr.coe.int/documents/pd_institution_proceedings_eng.pdf
 */

// ============================================================================
// Core Types
// ============================================================================

export type ApplicationType =
  | 'individual'           // Article 34 ECHR
  | 'group'                // Multiple applicants
  | 'inter-state'          // Article 33 ECHR
  | 'priority'             // Rule 41 priority treatment
  | 'urgent'               // Immediate danger
  | 'anonymous'            // Rule 47 § 3.1
  | 'repetitive'           // Similar to pending cases
  | 'pilot-judgment'       // Systemic issue
  | 'advisory-opinion';    // Protocol 16

export type ApplicationStatus =
  | 'draft'                // Being prepared
  | 'submitted'            // Sent to Court
  | 'allocated'            // Assigned to judicial formation
  | 'pending-admissibility' // Under admissibility review
  | 'admissible'           // Declared admissible
  | 'inadmissible'         // Declared inadmissible
  | 'communicated'         // Sent to respondent State
  | 'pending-merits'       // Merits examination
  | 'friendly-settlement'  // Settlement negotiations
  | 'struck-out'           // Removed from list
  | 'judgment-delivered'   // Final judgment
  | 'grand-chamber'        // Before Grand Chamber
  | 'closed';              // Case closed

export type ViolationType =
  | 'article-2'            // Right to life
  | 'article-3'            // Prohibition of torture
  | 'article-4'            // Prohibition of slavery
  | 'article-5'            // Liberty and security
  | 'article-6'            // Fair trial
  | 'article-7'            // No punishment without law
  | 'article-8'            // Private and family life
  | 'article-9'            // Freedom of thought
  | 'article-10'           // Freedom of expression
  | 'article-11'           // Freedom of assembly
  | 'article-12'           // Right to marry
  | 'article-13'           // Effective remedy
  | 'article-14'           // Prohibition of discrimination
  | 'protocol-1-article-1' // Property
  | 'protocol-1-article-2' // Education
  | 'protocol-1-article-3' // Elections
  | 'protocol-4'           // Freedom of movement
  | 'protocol-6'           // Death penalty
  | 'protocol-7'           // Criminal appeals
  | 'protocol-12'          // General discrimination
  | 'protocol-13';         // Abolition of death penalty

export type AdmissibilityCriteria =
  | 'exhaustion-domestic-remedies' // Article 35 § 1
  | 'six-month-rule'                // Article 35 § 1
  | 'victim-status'                 // Article 34
  | 'significant-disadvantage'      // Article 35 § 3(b)
  | 'manifestly-ill-founded'        // Article 35 § 3(a)
  | 'abuse-of-right'                // Article 35 § 3(a)
  | 'anonymous-incomplete'          // Article 35 § 2(a)
  | 'substantially-same'            // Article 35 § 2(b)
  | 'incompatible-ratione-personae' // Outside personal scope
  | 'incompatible-ratione-materiae' // Outside subject matter
  | 'incompatible-ratione-temporis' // Outside temporal scope
  | 'incompatible-ratione-loci';    // Outside territorial scope

export type ProcedureType =
  | 'application-filing'        // Initial application
  | 'admissibility-review'     // Admissibility examination
  | 'interim-measures'         // Rule 39
  | 'priority-treatment'       // Rule 41
  | 'friendly-settlement'      // Article 39
  | 'unilateral-declaration'   // Government declaration
  | 'strike-out'              // Article 37
  | 'third-party-intervention' // Article 36
  | 'grand-chamber-referral'   // Article 43
  | 'grand-chamber-relinquishment' // Article 30
  | 'just-satisfaction'        // Article 41
  | 'revision'                // Rule 80
  | 'interpretation'          // Rule 79
  | 'pilot-judgment'          // Rule 61
  | 'advisory-opinion'        // Protocol 16
  | 'legal-aid'              // Rule 105
  | 'confidentiality'        // Rule 33
  | 'execution-supervision';  // Committee of Ministers

// ============================================================================
// Applicant and Application Data
// ============================================================================

export interface ECHRApplicant {
  id: string;
  type: 'individual' | 'ngo' | 'company' | 'state';
  name: string;
  dateOfBirth?: Date;
  nationality: string;
  address: string;
  email?: string;
  phone?: string;
  hasLegalRepresentative: boolean;
  legalRepresentative?: LegalRepresentative;
  isAnonymous: boolean;
  anonymityRequested: boolean;
  victimStatus: VictimStatus;
}

export interface LegalRepresentative {
  name: string;
  barAssociation?: string;
  address: string;
  email: string;
  phone: string;
  powerOfAttorney: boolean;
  powerOfAttorneyDate?: Date;
}

export interface VictimStatus {
  isDirectVictim: boolean;
  isIndirectVictim: boolean;
  isPotentialVictim: boolean;
  harmDescription: string;
  significantDisadvantage?: {
    financialImpact?: number;
    nonPecuniaryDamage?: string;
    principleAtStake?: string;
  };
}

export interface ECHRApplication {
  applicationNumber?: string;  // Assigned by Court
  applicants: ECHRApplicant[];
  respondentState: string;     // ISO country code
  type: ApplicationType;
  status: ApplicationStatus;
  dateSubmitted: Date;
  dateFinalDomesticDecision?: Date;
  violations: ViolationClaim[];
  facts: FactualBasis;
  domesticRemedies: DomesticRemedy[];
  interimMeasuresRequested: boolean;
  interimMeasures?: InterimMeasure;
  justSatisfaction?: JustSatisfactionClaim;
  documents: ApplicationDocument[];
  admissibilityDecision?: AdmissibilityDecision;
  judgment?: ECHRJudgment;
  friendlySettlement?: FriendlySettlement;
  languageOfProceedings: 'EN' | 'FR';
  priorityRequested: boolean;
  priorityReason?: string;
}

// ============================================================================
// Violation Claims and Legal Arguments
// ============================================================================

export interface ViolationClaim {
  article: ViolationType;
  description: string;
  legalArguments: string[];
  evidence: Evidence[];
  caseReferences: CaseLawReference[];
  violationPeriod?: {
    start: Date;
    end?: Date;
    ongoing: boolean;
  };
}

export interface Evidence {
  type: 'document' | 'witness-statement' | 'expert-report' | 'photo' | 'video' | 'audio';
  description: string;
  date?: Date;
  source: string;
  reliability: 'high' | 'medium' | 'low';
}

export interface CaseLawReference {
  caseName: string;
  applicationNumber: string;
  judgmentDate: Date;
  relevantParagraphs?: string[];
  grandChamber: boolean;
}

// ============================================================================
// Procedural Elements
// ============================================================================

export interface FactualBasis {
  summary: string;
  detailedFacts: string[];
  chronology: ChronologyEvent[];
  context: string;
}

export interface ChronologyEvent {
  date: Date;
  description: string;
  relevantToViolation: ViolationType[];
  documentReference?: string;
}

export interface DomesticRemedy {
  courtName: string;
  caseNumber?: string;
  dateInitiated: Date;
  dateDecided?: Date;
  outcome: 'pending' | 'rejected' | 'partially-successful' | 'successful';
  reasonsGiven?: string;
  appealed: boolean;
  finalDecision: boolean;
  ineffectiveReason?: string;  // Why remedy was ineffective
}

export interface InterimMeasure {
  rule39: boolean;
  requestDate: Date;
  urgencyReason: string;
  measuresRequested: string[];
  riskDescription: string;
  irreparableHarm: string;
  granted?: boolean;
  grantedDate?: Date;
  courtDecision?: string;
  duration?: {
    start: Date;
    end?: Date;
    indefinite: boolean;
  };
}

export interface JustSatisfactionClaim {
  pecuniaryDamage?: {
    amount: number;
    currency: string;
    calculation: string;
    evidence: Evidence[];
  };
  nonPecuniaryDamage?: {
    amount: number;
    currency: string;
    justification: string;
    comparableCases: CaseLawReference[];
  };
  costsAndExpenses?: {
    legalFees: number;
    expertFees?: number;
    translationCosts?: number;
    travelCosts?: number;
    otherCosts?: number;
    currency: string;
    receipts: Evidence[];
  };
}

// ============================================================================
// Court Decisions and Procedures
// ============================================================================

export interface AdmissibilityDecision {
  date: Date;
  formation: 'single-judge' | 'committee' | 'chamber' | 'grand-chamber';
  admissible: boolean;
  inadmissibleGrounds?: AdmissibilityCriteria[];
  reasoning: string[];
  partialAdmissibility?: {
    admissibleClaims: ViolationType[];
    inadmissibleClaims: ViolationType[];
  };
}

export interface ECHRJudgment {
  date: Date;
  formation: 'committee' | 'chamber' | 'grand-chamber';
  unanimous: boolean;
  violations: ViolationFinding[];
  noViolations: ViolationType[];
  justSatisfaction?: JustSatisfactionAward;
  separateOpinions?: SeparateOpinion[];
  pilotJudgment: boolean;
  generalMeasures?: string[];
  individualMeasures?: string[];
  executionDeadline?: Date;
}

export interface ViolationFinding {
  article: ViolationType;
  unanimousOnViolation: boolean;
  keyFindings: string[];
  remedialMeasures?: string[];
}

export interface JustSatisfactionAward {
  pecuniaryDamage?: number;
  nonPecuniaryDamage?: number;
  costsAndExpenses?: number;
  currency: string;
  paymentDeadline: Date;
  defaultInterest?: number;
}

export interface SeparateOpinion {
  type: 'concurring' | 'partly-dissenting' | 'dissenting';
  judges: string[];
  summary: string;
}

export interface FriendlySettlement {
  dateAgreed: Date;
  terms: SettlementTerms;
  approved: boolean;
  approvalDate?: Date;
  executionDeadline: Date;
  confidential: boolean;
}

export interface SettlementTerms {
  admission?: string;
  compensation?: {
    amount: number;
    currency: string;
  };
  otherMeasures?: string[];
  nonDisclosure?: boolean;
  withdrawalOfApplication: boolean;
}

// ============================================================================
// Third Party and Special Procedures
// ============================================================================

export interface ThirdPartyIntervention {
  intervener: string;
  type: 'government' | 'ngo' | 'individual' | 'international-org';
  requestDate: Date;
  granted: boolean;
  scope: 'written-comments' | 'oral-hearing' | 'both';
  submissions?: string[];
}

export interface AdvisoryOpinion {
  requestingCourt: string;
  country: string;
  requestDate: Date;
  questions: string[];
  context: string;
  accepted: boolean;
  opinionDate?: Date;
  opinion?: string;
  dissenting?: SeparateOpinion[];
}

export interface PilotJudgmentProcedure {
  systemicProblem: string;
  numberOfSimilarCases: number;
  generalMeasuresRequired: string[];
  implementationDeadline: Date;
  actionPlanSubmitted: boolean;
  actionPlan?: {
    measures: string[];
    timeline: Date[];
    monitoring: string;
  };
}

// ============================================================================
// Application Documents
// ============================================================================

export interface ApplicationDocument {
  type: DocumentType;
  title: string;
  date: Date;
  language: string;
  pages: number;
  translation?: {
    language: 'EN' | 'FR';
    certified: boolean;
  };
}

export type DocumentType =
  | 'application-form'
  | 'power-of-attorney'
  | 'domestic-decision'
  | 'evidence'
  | 'legal-submission'
  | 'witness-statement'
  | 'expert-report'
  | 'medical-report'
  | 'official-document'
  | 'correspondence';

// ============================================================================
// Procedural Constants and Deadlines
// ============================================================================

export const ECHR_DEADLINES = {
  ADMISSIBILITY_DEADLINE_MONTHS: 4,      // New deadline from Feb 2024
  OLD_DEADLINE_MONTHS: 6,                // For violations before Feb 2024
  GRAND_CHAMBER_REFERRAL_MONTHS: 3,      // Article 43
  JUST_SATISFACTION_SUBMISSION_WEEKS: 12, // Rule 60
  GOVERNMENT_RESPONSE_WEEKS: 16,         // Standard communication
  INTERIM_MEASURES_RESPONSE_HOURS: 48,   // Urgent Rule 39
  REVISION_REQUEST_MONTHS: 6,            // Rule 80
  EXECUTION_STANDARD_MONTHS: 3,          // Payment deadline
  FRIENDLY_SETTLEMENT_WEEKS: 12,         // Negotiation period
};

export const ECHR_THRESHOLDS = {
  SIGNIFICANT_DISADVANTAGE_AMOUNT: 5000, // EUR - indicative threshold
  MIN_AGE_INDIVIDUAL_APPLICATION: 16,    // With representative
  MIN_AGE_DIRECT_APPLICATION: 18,        // Without representative
  LEGAL_AID_INCOME_THRESHOLD: 15000,     // EUR annual - indicative
  MAX_APPLICATION_PAGES: 40,             // Rule 47
  MAX_FACTS_PAGES: 20,                   // Practice direction
};

// ============================================================================
// Workflow Context Types
// ============================================================================

export interface ApplicationWorkflowContext {
  application: ECHRApplication | null;
  currentProcedure: ProcedureType | null;
  validationErrors: string[];
  admissibilityChecks: AdmissibilityCheck[];
  communications: Communication[];
  deadlines: Deadline[];
  retryCount: number;
  errors: string[];
}

export interface AdmissibilityCheck {
  criteria: AdmissibilityCriteria;
  satisfied: boolean;
  reason?: string;
  evidence?: string[];
}

export interface Communication {
  date: Date;
  from: 'applicant' | 'court' | 'government';
  to: 'applicant' | 'court' | 'government';
  subject: string;
  deadline?: Date;
}

export interface Deadline {
  type: string;
  date: Date;
  description: string;
  mandatory: boolean;
  completed: boolean;
}

// ============================================================================
// Result Types
// ============================================================================

export interface ECHRProcedureResult {
  procedureType: ProcedureType;
  success: boolean;
  message: string;
  nextSteps?: string[];
  deadlines?: Deadline[];
  documentsRequired?: DocumentType[];
  warnings?: string[];
}

export interface AdmissibilityAssessment {
  overallAdmissible: boolean;
  criteria: AdmissibilityCheck[];
  recommendations: string[];
  missingElements?: string[];
  caseStrength: 'strong' | 'moderate' | 'weak';
}

export interface InterimMeasuresAssessment {
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low';
  immediateDanger: boolean;
  irreparableHarmRisk: boolean;
  recommendRule39: boolean;
  justification: string;
}

export interface CaseManagementDecision {
  priority: 'immediate' | 'high' | 'normal' | 'low';
  formation: 'single-judge' | 'committee' | 'chamber' | 'grand-chamber';
  communication: boolean;
  joinWithCases?: string[];
  pilotProcedure: boolean;
}

// ============================================================================
// Statistics and Analytics Types
// ============================================================================

export interface ECHRStatistics {
  totalApplications: number;
  pendingApplications: number;
  admissibilityRate: number;
  violationRate: number;
  averageProcessingDays: number;
  byCountry: CountryStatistics[];
  byArticle: ArticleStatistics[];
  friendlySettlementRate: number;
  executionCompliance: number;
}

export interface CountryStatistics {
  country: string;
  applications: number;
  violations: number;
  pendingExecution: number;
  repetitiveCases: number;
}

export interface ArticleStatistics {
  article: ViolationType;
  violations: number;
  percentage: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

// ============================================================================
// Helper Functions Types
// ============================================================================

export interface DeadlineCalculation {
  event: 'domestic-decision' | 'court-communication' | 'judgment' | 'interim-measure';
  eventDate: Date;
  deadlineType: keyof typeof ECHR_DEADLINES;
  calculatedDeadline: Date;
  remainingDays: number;
  expired: boolean;
}

export interface DocumentValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingTranslations?: string[];
  exceedsPageLimit?: boolean;
}

export interface CaseLawSearch {
  query: string;
  articles?: ViolationType[];
  countries?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  grandChamberOnly?: boolean;
  pilotJudgments?: boolean;
  results: CaseLawReference[];
}

// ============================================================================
// Execution and Monitoring Types
// ============================================================================

export interface ExecutionStatus {
  applicationNumber: string;
  judgmentDate: Date;
  state: string;
  generalMeasures: ExecutionMeasure[];
  individualMeasures: ExecutionMeasure[];
  paymentStatus?: PaymentStatus;
  supervisionLevel: 'standard' | 'enhanced';
  closureDate?: Date;
}

export interface ExecutionMeasure {
  type: 'legislative' | 'regulatory' | 'administrative' | 'practical' | 'payment';
  description: string;
  deadline: Date;
  completed: boolean;
  completionDate?: Date;
  verificationMethod?: string;
}

export interface PaymentStatus {
  awarded: number;
  paid: number;
  currency: string;
  paymentDate?: Date;
  defaultInterestApplied: boolean;
  defaultInterestAmount?: number;
}

// ============================================================================
// Legal References
// ============================================================================

export const ECHR_LEGAL_REFERENCES = {
  convention: {
    title: "European Convention on Human Rights",
    adopted: new Date('1950-11-04'),
    enteredIntoForce: new Date('1953-09-03'),
    url: "https://www.echr.coe.int/documents/convention_eng.pdf"
  },
  rulesOfCourt: {
    title: "Rules of Court",
    version: "January 2024",
    url: "https://www.echr.coe.int/documents/rules_court_eng.pdf"
  },
  practiceDirections: {
    title: "Practice Directions",
    url: "https://www.echr.coe.int/documents/pd_institution_proceedings_eng.pdf"
  },
  protocol16: {
    title: "Protocol No. 16 to the Convention",
    enteredIntoForce: new Date('2018-08-01'),
    url: "https://www.echr.coe.int/documents/protocol_16_eng.pdf"
  },
  admissibilityCriteria: {
    title: "Practical Guide on Admissibility Criteria",
    version: "2022",
    url: "https://www.echr.coe.int/documents/admissibility_guide_eng.pdf"
  },
  interimMeasures: {
    title: "Practice Direction on Requests for Interim Measures",
    url: "https://www.echr.coe.int/documents/pd_interim_measures_eng.pdf"
  }
};