/**
 * Core domain types for the Platform Aide Administrative
 */

// User and Employment Types
export interface User {
  id: string;
  employmentStatus: EmploymentStatus;
  monthlySalaryGross: number;
  workingHoursPerWeek: number;
  hasRightsMaintenance: boolean;
  currentBenefits: Benefit[];
}

export type EmploymentStatus =
  | 'part-time'
  | 'full-time'
  | 'unemployed'
  | 'student';

// Benefit Types
export interface Benefit {
  id: string;
  type: BenefitType;
  amount: number;
  conditions: Condition[];
  compatibleWith: string[];
  incompatibleWith: string[];
  /** Référence juridique de base pour cette prestation */
  legalReference?: LegalReference;
  /** Base juridique pour le calcul des montants */
  calculationLegalBasis?: string;
}

export type BenefitType =
  // Social Integration
  | 'agr' // Allocation de Garantie de Revenus
  | 'ris' // Revenu d'Intégration Sociale
  | 'grapa' // Garantie de Revenus aux Personnes Âgées
  | 'aide-sociale' // Aide Sociale CPAS
  | 'aide-personnes-agees' // Aide aux Personnes Âgées
  // Employment
  | 'unemployment' // Allocations de Chômage
  | 'professional-training' // Formation Professionnelle
  | 'professional-integration' // Insertion Professionnelle
  | 'time-credit' // Crédit-temps
  // Family & Child
  | 'family-allowance' // Allocations Familiales
  | 'birth-allowance' // Prime de Naissance
  | 'maternity-leave' // Congé Maternité
  | 'parental-leave' // Congé Parental
  | 'childcare' // Garde d'Enfants
  // Housing & Energy
  | 'housing-allowance' // Aide au Logement (legacy)
  | 'aide-logement' // Aide au Logement
  | 'logement-social' // Logement Social
  | 'allocation-chauffage' // Allocation Chauffage
  | 'tarif-social-energie' // Tarif Social Énergie
  | 'prime-renovation' // Prime Rénovation
  | 'garantie-locative' // Garantie Locative
  // Tax
  | 'childcare-deduction' // Déduction Frais de Garde
  | 'housing-deduction' // Déduction Habitation
  | 'tax-credit' // Crédit d'Impôt
  | 'mortgage-deduction' // Déduction Emprunt Hypothécaire
  | 'isolation-deduction' // Déduction Isolation
  | 'marital-quotient' // Quotient Conjugal
  // Healthcare & Disability
  | 'disability-allowance' // Allocations Handicapés
  | 'health-insurance' // Assurance Maladie
  | 'medical-card' // Carte Médicale
  | 'mental-health-care' // Soins Santé Mentale
  | 'sick-leave'; // Congé Maladie

export interface Condition {
  field: string;
  operator: 'eq' | 'lt' | 'gt' | 'lte' | 'gte' | 'in' | 'nin';
  value: any;
  description: string;
}

// Legal Conversion Types
export type LegislationType =
  | 'loi'              // Loi / Wet
  | 'arrete_royal'     // Arrêté royal / Koninklijk besluit
  | 'arrete_ministeriel' // Arrêté ministériel
  | 'code'             // Code (civil, pénal, etc.)
  | 'ordonnance'       // Ordonnance (Bruxelles)
  | 'decret';          // Décret (régional)

export interface LegalReference {
  /** Type de législation */
  type: LegislationType;

  /** Titre complet du texte légal */
  title: string;

  /** Date de promulgation (format ISO 8601) */
  date: string;

  /** Publication au Moniteur Belge */
  publication?: {
    date: string;
    reference?: string;
  };

  /** Articles pertinents */
  articles?: string[];

  /** URL officielle sur ejustice.just.fgov.be */
  officialUrl: string;

  /** URL alternative (etaamb, etc.) */
  alternativeUrls?: string[];

  /** Dernière modification connue (format ISO 8601) */
  lastAmended?: string;

  /** Autorité responsable */
  authority: string;
}

export interface LegalText {
  id: string;
  source: string;
  language: 'fr' | 'nl' | 'de';
  articleNumber?: string;
  rawText: string;
  /** Référence juridique authentique */
  legalReference?: LegalReference;
  metadata: {
    lastUpdated: Date;
    region?: 'wallonie' | 'flandre' | 'bruxelles';
    authority: string;
  };
}

export interface ConvertedText {
  originalId: string;
  versions: {
    simple: string;
    detailed: string;
    examples: Example[];
    warnings: string[];
  };
  structuredRule?: StructuredRule;
  readabilityScore: number;
  semanticAccuracy: number;
  validatedAt: Date;
  validatedBy?: string;
}

export interface Example {
  situation: string;
  consequence: string;
  icon?: string;
}

export interface StructuredRule {
  ruleId: string;
  conditions: Record<string, any>;
  benefit: {
    type: string;
    calculation: string;
    cumulAllowed: string[];
    cumulForbidden: string[];
  };
  optimizationHint?: string;
}

// Conversion Pipeline Types
export type ConversionLevel = 'simple' | 'detailed' | 'examples' | 'warnings' | 'optimizer';

export interface ConversionContext {
  legalText: LegalText;
  targetLevel: ConversionLevel;
  targetAudience: 'general' | 'cpas-beneficiary' | 'social-worker' | 'optimizer';
  extractedStructure?: any;
  identifiedConcepts?: string[];
  mappedTerms?: Record<string, string>;
  generatedVersions?: Partial<ConvertedText['versions']>;
  validationErrors?: string[];
  retryCount: number;
}

// Eligibility Check Types
export interface EligibilityCheck {
  benefitType: BenefitType;
  isEligible: boolean;
  reason?: string;
  calculatedAmount?: number;
  optimizationSuggestion?: string;
  // Additional optional properties
  obligations?: string[];
  notes?: string[];
  breakdown?: {
    baseAmount?: number;
    supplements?: Record<string, number>;
    deductions?: Record<string, number>;
    total?: number;
  };
  category?: string;
  duration?: string;
  nextSteps?: string[];
}

// Ambiguity Resolution Types
export interface Ambiguity {
  text: string;
  interpretations: string[];
  consensus?: string;
  divergences: string[];
  recommendation: string;
  riskLevel: 'low' | 'medium' | 'high';
}

// Structured explanation for eligibility decisions
export interface ExplanationStep {
  /**
   * Machine-readable code for this explanation step
   * e.g. 'AGE_MIN_NOT_MET', 'INCOME_ABOVE_THRESHOLD'
   */
  code: string;

  /**
   * Human-readable explanation in plain language
   */
  message: string;

  /**
   * Optional legal references (URLs or identifiers)
   */
  legalRefs?: string[];

  /**
   * Optional additional metadata (region, article numbers, etc.)
   */
  metadata?: Record<string, any>;
}

// Structured next steps for the user or social worker
export interface NextStep {
  /**
   * Short label for the step (UI-facing)
   */
  label: string;

  /**
   * Longer description or guidance
   */
  description?: string;

  /**
   * Optional URL (online form, documentation, CPAS portal, etc.)
   */
  url?: string;

  /**
   * Required documents for this step
   */
  requiredDocuments?: string[];

  /**
   * Suggested deadline or time window (e.g. '45 jours')
   */
  deadlineHint?: string;
}

// Generic request shape for eligibility checks across all benefits
export interface EligibilityRequest {
  benefitType: BenefitType;
  /**
   * Optional identifier of the person in the client system
   * (user id, dossier id, etc.)
   */
  personId?: string;
  /**
   * Normalized facts used by the rules engine.
   * Each benefit defines its own expected keys and types.
   */
  facts: Record<string, unknown>;
}

// Canonical response shape for eligibility checks
// Extends EligibilityCheck to remain backwards compatible
export interface EligibilityDecision extends EligibilityCheck {
  /**
   * Structured explanation steps (timeline of the reasoning)
   */
  explanationSteps?: ExplanationStep[];

  /**
   * Structured next steps for the user / social worker
   */
  structuredNextSteps?: NextStep[];

  /**
   * Raw engine result for debugging/traceability (not exposed to end-users)
   */
  rawResult?: any;
}
