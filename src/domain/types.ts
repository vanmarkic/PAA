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
export interface LegalText {
  id: string;
  source: string;
  language: 'fr' | 'nl' | 'de';
  articleNumber?: string;
  rawText: string;
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
