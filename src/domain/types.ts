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
  | 'agr' // Allocation de Garantie de Revenus
  | 'ris' // Revenu d'Intégration Sociale
  | 'unemployment'
  | 'family-allowance'
  | 'housing-allowance';

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
