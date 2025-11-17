/**
 * Data loader for business rules metadata
 * Loads the generated rules-metadata.json
 */

import metadata from '../../public/rules-metadata.json';

export interface RuleCondition {
  fact: string;
  operator: string;
  value: any;
  path?: string;
}

export interface RuleMeta {
  id: string;
  fileName: string;
  category: string;
  benefitType?: string;
  description: string;
  priority: number;
  conditions: {
    all?: RuleCondition[];
    any?: RuleCondition[];
  };
  event: {
    type: string;
    params?: any;
  };
}

export interface RuleFile {
  fileName: string;
  path: string;
  category: string;
  benefitType?: string;
  rules: RuleMeta[];
}

export interface RulesMetadata {
  generated: string;
  totalFiles: number;
  totalRules: number;
  categories: string[];
  ruleFiles: RuleFile[];
  rulesByCategory?: Record<string, RuleMeta[]>; // optional for backward compatibility
  statistics?: {
    totalConditions: number;
    uniqueFacts: string[];
    uniqueOperators: string[];
    averageConditionsPerRule: string;
  };
}

/**
 * Load rules metadata from JSON
 */
export async function loadRulesMetadata(): Promise<RulesMetadata> {
  return metadata as RulesMetadata;
}

/**
 * Get a single rule by ID
 */
export function getRuleById(
  metadata: RulesMetadata,
  id: string
): RuleMeta | undefined {
  // Handle new structure with ruleFiles
  if (metadata.ruleFiles) {
    for (const ruleFile of metadata.ruleFiles) {
      const rule = ruleFile.rules.find(r => r.id === id);
      if (rule) {
        // Ensure category and benefitType are set from parent file if not already present
        return {
          ...rule,
          category: rule.category || ruleFile.category,
          benefitType: rule.benefitType || ruleFile.benefitType
        };
      }
    }
  }

  // Fallback to old structure for backward compatibility
  if (metadata.rulesByCategory) {
    for (const category of Object.keys(metadata.rulesByCategory)) {
      const rule = metadata.rulesByCategory[category].find(r => r.id === id);
      if (rule) return rule;
    }
  }

  return undefined;
}

/**
 * Get all rules (flattened)
 */
export function getAllRules(metadata: RulesMetadata): RuleMeta[] {
  const allRules: RuleMeta[] = [];

  // Handle new structure with ruleFiles
  if (metadata.ruleFiles) {
    for (const ruleFile of metadata.ruleFiles) {
      // Add category and benefitType to each rule from parent file if not present
      const rulesWithMetadata = ruleFile.rules.map(rule => ({
        ...rule,
        category: rule.category || ruleFile.category,
        benefitType: rule.benefitType || ruleFile.benefitType,
        fileName: rule.fileName || ruleFile.fileName.replace('.ts', '')
      }));
      allRules.push(...rulesWithMetadata);
    }
  }

  // Fallback to old structure for backward compatibility
  else if (metadata.rulesByCategory) {
    for (const category of Object.keys(metadata.rulesByCategory)) {
      allRules.push(...metadata.rulesByCategory[category]);
    }
  }

  return allRules;
}

/**
 * Get all rules in a category
 */
export function getRulesByCategory(
  metadata: RulesMetadata,
  category: string
): RuleMeta[] {
  const rules: RuleMeta[] = [];

  // Handle new structure with ruleFiles
  if (metadata.ruleFiles) {
    for (const ruleFile of metadata.ruleFiles) {
      if (ruleFile.category === category) {
        const rulesWithMetadata = ruleFile.rules.map(rule => ({
          ...rule,
          category: rule.category || ruleFile.category,
          benefitType: rule.benefitType || ruleFile.benefitType,
          fileName: rule.fileName || ruleFile.fileName.replace('.ts', '')
        }));
        rules.push(...rulesWithMetadata);
      }
    }
  }

  // Fallback to old structure for backward compatibility
  else if (metadata.rulesByCategory) {
    return metadata.rulesByCategory[category] || [];
  }

  return rules;
}

/**
 * Get category statistics
 */
export function getCategoryStats(
  metadata: RulesMetadata,
  category: string
): {
  count: number;
  totalConditions: number;
  uniqueFacts: string[];
} {
  const rules = getRulesByCategory(metadata, category);
  const uniqueFacts = new Set<string>();
  let totalConditions = 0;

  rules.forEach(rule => {
    if (rule.conditions.all) {
      rule.conditions.all.forEach(cond => {
        uniqueFacts.add(cond.fact);
        totalConditions++;
      });
    }
    if (rule.conditions.any) {
      rule.conditions.any.forEach(cond => {
        uniqueFacts.add(cond.fact);
        totalConditions++;
      });
    }
  });

  return {
    count: rules.length,
    totalConditions,
    uniqueFacts: Array.from(uniqueFacts)
  };
}

/**
 * Format operator for display
 */
export function formatOperator(operator: string): string {
  const operatorMap: Record<string, string> = {
    'equal': '=',
    'notEqual': '≠',
    'lessThan': '<',
    'lessThanInclusive': '≤',
    'greaterThan': '>',
    'greaterThanInclusive': '≥',
    'contains': 'contient',
    'doesNotContain': 'ne contient pas',
    'in': 'dans',
    'notIn': 'pas dans'
  };
  return operatorMap[operator] || operator;
}

/**
 * Get operator badge color
 */
export function getOperatorColor(operator: string): string {
  if (['equal', 'in', 'contains'].includes(operator)) {
    return 'green';
  }
  if (['notEqual', 'notIn', 'doesNotContain'].includes(operator)) {
    return 'red';
  }
  if (['lessThan', 'lessThanInclusive', 'greaterThan', 'greaterThanInclusive'].includes(operator)) {
    return 'blue';
  }
  return 'gray';
}

/**
 * Category display names
 */
export const CATEGORY_NAMES: Record<string, string> = {
  emploi: 'Emploi & Chômage',
  social: 'Aide Sociale',
  logement: 'Logement & Énergie',
  famille: 'Famille & Enfants',
  handicap: 'Handicap & Intégration',
  pension: 'Pension & Retraite',
  fiscal: 'Avantages Fiscaux',
  sante: 'Santé & Soins',
  education: 'Éducation & Formation',
  autre: 'Autres Prestations'
};

/**
 * Category icons (SVG icons from heroicons)
 */
export const CATEGORY_ICONS: Record<string, string> = {
  emploi: 'briefcase',
  social: 'users',
  logement: 'home',
  famille: 'heart',
  handicap: 'hand',
  pension: 'clock',
  fiscal: 'calculator',
  sante: 'medical',
  education: 'book',
  autre: 'folder'
};

/**
 * Get priority badge color
 */
export function getPriorityColor(priority: number): string {
  if (priority >= 9) return 'red';
  if (priority >= 7) return 'orange';
  if (priority >= 5) return 'yellow';
  return 'green';
}

/**
 * Get priority label
 */
export function getPriorityLabel(priority: number): string {
  if (priority >= 9) return 'Critique';
  if (priority >= 7) return 'Haute';
  if (priority >= 5) return 'Moyenne';
  return 'Basse';
}

/**
 * Get benefit type display name
 */
export function getBenefitDisplayName(benefitType: string): string {
  const names: Record<string, string> = {
    'agr': 'AGR - Allocation de Garantie de Revenus',
    'ris': 'RIS - Revenu d\'Intégration Sociale',
    'chomage': 'Allocations de Chômage',
    'allocations-familiales': 'Allocations Familiales',
    'grapa': 'GRAPA - Garantie de revenus aux personnes âgées',
    'handicap': 'Allocations Handicap',
    'logement-social': 'Logement Social',
    'prime-energie': 'Prime Énergie',
    'carte-medicale': 'Carte Médicale',
    'formation-professionnelle': 'Formation Professionnelle'
  };
  return names[benefitType] || benefitType;
}

/**
 * Search rules by various criteria
 */
export function searchRules(
  metadata: RulesMetadata,
  query: {
    text?: string;
    category?: string;
    priority?: number;
    fact?: string;
    eventType?: string;
  }
): RuleMeta[] {
  let rules = getAllRules(metadata);

  if (query.text) {
    const searchTerm = query.text.toLowerCase();
    rules = rules.filter(r =>
      r.description.toLowerCase().includes(searchTerm) ||
      r.benefitType?.toLowerCase().includes(searchTerm) ||
      r.event.type.toLowerCase().includes(searchTerm)
    );
  }

  if (query.category) {
    rules = rules.filter(r => r.category === query.category);
  }

  if (query.priority !== undefined) {
    rules = rules.filter(r => r.priority >= query.priority);
  }

  if (query.fact) {
    rules = rules.filter(r => {
      const allFacts = [
        ...(r.conditions.all?.map(c => c.fact) || []),
        ...(r.conditions.any?.map(c => c.fact) || [])
      ];
      return allFacts.includes(query.fact);
    });
  }

  if (query.eventType) {
    rules = rules.filter(r => r.event.type === query.eventType);
  }

  return rules;
}