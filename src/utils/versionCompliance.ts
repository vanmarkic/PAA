/**
 * Version Compliance Checker
 *
 * Ensures that all components (Rules, Types, State Machines) are in sync
 * with the Feature specifications (source of truth).
 *
 * Dependency Flow:
 * Features (Specification) → Rules (Implementation) → Types + State Machines
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// TYPES
// ============================================================================

export interface ComponentVersion {
  version: string;
  implementsSpecification?: string;
  compatibleWithSpec?: string[];
  status?: 'complete' | 'partial' | 'outdated';
  divergences?: string[];
  lastSyncedWith?: string;
}

export interface FeatureMetadata extends ComponentVersion {
  filePath: string;
  effectiveDate?: string;
  legalBasis?: string;
  changeReason?: string;
}

export interface RulesMetadata extends ComponentVersion {
  implementationVersion: string;
  generatedFrom?: string;
}

export interface TypesMetadata extends ComponentVersion {
  schemaVersion: string;
  requiredBy?: string;
}

export interface WorkflowMetadata extends ComponentVersion {
  workflowVersion: string;
  minTypesVersion?: string;
  compatibleWithRules?: string[];
}

export interface ComplianceReport {
  benefitId: string;
  specificationVersion: string;
  timestamp: Date;
  components: {
    feature: {
      found: boolean;
      version?: string;
      filePath?: string;
      metadata?: FeatureMetadata;
    };
    rules: {
      found: boolean;
      implementsVersion?: string;
      status: 'synced' | 'outdated' | 'ahead' | 'missing';
      divergences: string[];
      metadata?: RulesMetadata;
    };
    types: {
      found: boolean;
      schemaVersion?: string;
      compatible: boolean;
      metadata?: TypesMetadata;
    };
    stateMachine?: {
      found: boolean;
      workflowVersion?: string;
      compatible: boolean;
      metadata?: WorkflowMetadata;
    };
  };
  overallStatus: 'compliant' | 'needs-update' | 'critical' | 'error';
  issues: string[];
  recommendations: string[];
}

// ============================================================================
// BENEFIT ID ALIASES
// ============================================================================

/**
 * Map benefit IDs to their feature file names
 * Some benefits have different IDs than their feature file names
 */
const BENEFIT_ALIASES: Record<string, string> = {
  'agr': 'income-guarantee',
  'income-guarantee': 'income-guarantee',
  'ris': 'ris',
};

function resolveFeatureFileName(benefitId: string): string {
  return BENEFIT_ALIASES[benefitId] || benefitId;
}

// ============================================================================
// METADATA EXTRACTION
// ============================================================================

/**
 * Extract version metadata from Gherkin feature file
 */
export function extractFeatureVersion(benefitId: string): FeatureMetadata | null {
  const featureFileName = resolveFeatureFileName(benefitId);
  const featurePath = path.join(process.cwd(), 'features', 'benefits', `${featureFileName}.feature`);

  if (!fs.existsSync(featurePath)) {
    return null;
  }

  const content = fs.readFileSync(featurePath, 'utf-8');
  const lines = content.split('\n');

  const metadata: FeatureMetadata = {
    version: '0.0.0',
    filePath: featurePath,
  };

  // Extract metadata from comments
  for (const line of lines) {
    const trimmed = line.trim();

    // @specification-version:2024.1.0
    if (trimmed.startsWith('# @specification-version:')) {
      metadata.version = trimmed.split(':')[1]?.trim() || '0.0.0';
    }

    // @version:2024.1.0 (alternative format)
    if (trimmed.startsWith('# @version:')) {
      metadata.version = trimmed.split(':')[1]?.trim() || '0.0.0';
    }

    // @effective-date:2024-01-01
    if (trimmed.startsWith('# @effective-date:')) {
      metadata.effectiveDate = trimmed.split(':')[1]?.trim();
    }

    // @legal-basis:Loi du 26 mai 2002
    if (trimmed.startsWith('# @legal-basis:')) {
      metadata.legalBasis = trimmed.substring(trimmed.indexOf(':') + 1).trim();
    }

    // @change-reason:Indexation semestrielle
    if (trimmed.startsWith('# @change-reason:')) {
      metadata.changeReason = trimmed.substring(trimmed.indexOf(':') + 1).trim();
    }
  }

  return metadata;
}

/**
 * Extract version metadata from rules file
 */
export function extractRulesVersion(benefitId: string): RulesMetadata | null {
  const rulesPath = path.join(process.cwd(), 'src', 'rules', `${benefitId}Rules.ts`);

  if (!fs.existsSync(rulesPath)) {
    return null;
  }

  const content = fs.readFileSync(rulesPath, 'utf-8');

  // Look for exported metadata constant
  const metadataMatch = content.match(/export const \w+_RULES_METADATA\s*=\s*{([^}]+)}/s);

  if (metadataMatch) {
    try {
      // Extract version info from metadata object
      const implementsMatch = content.match(/implementsSpecification:\s*['"]([^'"]+)['"]/);
      const implVersionMatch = content.match(/implementationVersion:\s*['"]([^'"]+)['"]/);
      const statusMatch = content.match(/implementationStatus:\s*['"]([^'"]+)['"]/);
      const generatedMatch = content.match(/generatedFrom:\s*['"]([^'"]+)['"]/);

      return {
        version: implementsMatch?.[1] || '0.0.0',
        implementsSpecification: implementsMatch?.[1],
        implementationVersion: implVersionMatch?.[1] || implementsMatch?.[1] || '0.0.0',
        status: (statusMatch?.[1] as any) || 'complete',
        generatedFrom: generatedMatch?.[1],
      };
    } catch (error) {
      console.error(`Error parsing rules metadata for ${benefitId}:`, error);
    }
  }

  // Fallback: look for version constant
  const versionMatch = content.match(/export const \w+_LEGAL_VERSION\s*=\s*['"]([^'"]+)['"]/);
  if (versionMatch) {
    return {
      version: versionMatch[1],
      implementsSpecification: versionMatch[1],
      implementationVersion: versionMatch[1],
      status: 'complete',
    };
  }

  return null;
}

/**
 * Extract version metadata from types file
 */
export function extractTypesVersion(benefitId: string): TypesMetadata | null {
  const typesPath = path.join(process.cwd(), 'src', 'domain', `${benefitId}Types.ts`);

  if (!fs.existsSync(typesPath)) {
    // Check in domain/types.ts for embedded types
    const mainTypesPath = path.join(process.cwd(), 'src', 'domain', 'types.ts');
    if (fs.existsSync(mainTypesPath)) {
      const content = fs.readFileSync(mainTypesPath, 'utf-8');

      // Look for type metadata constant for this benefit
      const metadataMatch = content.match(new RegExp(`export const ${benefitId.toUpperCase()}_TYPES_METADATA\\s*=\\s*{([^}]+)}`, 's'));

      if (metadataMatch) {
        const schemaMatch = content.match(/schemaVersion:\s*['"]([^'"]+)['"]/);
        const compatMatch = content.match(/compatibleWithSpec:\s*\[([^\]]+)\]/);

        return {
          version: schemaMatch?.[1] || '1.0.0',
          schemaVersion: schemaMatch?.[1] || '1.0.0',
          compatibleWithSpec: compatMatch?.[1]?.split(',').map(v => v.trim().replace(/['"]/g, '')) || [],
        };
      }
    }
    return null;
  }

  const content = fs.readFileSync(typesPath, 'utf-8');

  const metadataMatch = content.match(/export const \w+_TYPES_METADATA\s*=\s*{([^}]+)}/s);

  if (metadataMatch) {
    const schemaMatch = content.match(/schemaVersion:\s*['"]([^'"]+)['"]/);
    const compatMatch = content.match(/compatibleWithSpec:\s*\[([^\]]+)\]/);
    const requiredMatch = content.match(/requiredBy:\s*['"]([^'"]+)['"]/);

    return {
      version: schemaMatch?.[1] || '1.0.0',
      schemaVersion: schemaMatch?.[1] || '1.0.0',
      compatibleWithSpec: compatMatch?.[1]?.split(',').map(v => v.trim().replace(/['"]/g, '')) || [],
      requiredBy: requiredMatch?.[1],
    };
  }

  return null;
}

/**
 * Extract version metadata from workflow/state machine file
 */
export function extractWorkflowVersion(benefitId: string): WorkflowMetadata | null {
  // Try multiple possible locations
  const possiblePaths = [
    path.join(process.cwd(), 'src', 'workflows', `${benefitId}Machine.ts`),
    path.join(process.cwd(), 'src', 'workflows', `${benefitId}Workflow.ts`),
    path.join(process.cwd(), 'src', 'workflows', `${benefitId}.ts`),
  ];

  for (const workflowPath of possiblePaths) {
    if (!fs.existsSync(workflowPath)) {
      continue;
    }

    const content = fs.readFileSync(workflowPath, 'utf-8');

    const metadataMatch = content.match(/export const \w+_WORKFLOW_METADATA\s*=\s*{([^}]+)}/s);

    if (metadataMatch) {
      const workflowVersionMatch = content.match(/workflowVersion:\s*['"]([^'"]+)['"]/);
      const compatRulesMatch = content.match(/compatibleWithRules:\s*\[([^\]]+)\]/);
      const minTypesMatch = content.match(/minTypesVersion:\s*['"]([^'"]+)['"]/);

      return {
        version: workflowVersionMatch?.[1] || '1.0.0',
        workflowVersion: workflowVersionMatch?.[1] || '1.0.0',
        compatibleWithRules: compatRulesMatch?.[1]?.split(',').map(v => v.trim().replace(/['"]/g, '')) || [],
        minTypesVersion: minTypesMatch?.[1],
      };
    }

    // Fallback: look for version in machine config
    const versionMatch = content.match(/version:\s*['"]([^'"]+)['"]/);
    if (versionMatch) {
      return {
        version: versionMatch[1],
        workflowVersion: versionMatch[1],
      };
    }
  }

  return null;
}

// ============================================================================
// COMPLIANCE CHECKING
// ============================================================================

/**
 * Check version compliance for a specific benefit
 */
export function checkVersionCompliance(benefitId: string): ComplianceReport {
  const report: ComplianceReport = {
    benefitId,
    specificationVersion: '0.0.0',
    timestamp: new Date(),
    components: {
      feature: {
        found: false,
      },
      rules: {
        found: false,
        status: 'missing',
        divergences: [],
      },
      types: {
        found: false,
        compatible: false,
      },
    },
    overallStatus: 'error',
    issues: [],
    recommendations: [],
  };

  // 1. Extract feature version (source of truth)
  const featureMetadata = extractFeatureVersion(benefitId);
  if (!featureMetadata) {
    report.issues.push(`Feature file not found: features/benefits/${benefitId}.feature`);
    report.overallStatus = 'critical';
    return report;
  }

  report.components.feature = {
    found: true,
    version: featureMetadata.version,
    filePath: featureMetadata.filePath,
    metadata: featureMetadata,
  };
  report.specificationVersion = featureMetadata.version;

  // 2. Check rules implementation
  const rulesMetadata = extractRulesVersion(benefitId);
  if (!rulesMetadata) {
    report.components.rules = {
      found: false,
      status: 'missing',
      divergences: [],
    };
    report.issues.push(`Rules file not found: src/rules/${benefitId}Rules.ts`);
  } else {
    const rulesStatus = compareVersions(
      rulesMetadata.implementsSpecification || rulesMetadata.version,
      featureMetadata.version
    );

    report.components.rules = {
      found: true,
      implementsVersion: rulesMetadata.implementsSpecification || rulesMetadata.version,
      status: rulesStatus,
      divergences: [],
      metadata: rulesMetadata,
    };

    if (rulesStatus === 'outdated') {
      report.issues.push(
        `Rules version ${rulesMetadata.version} is outdated. Feature version is ${featureMetadata.version}`
      );
      report.recommendations.push(
        `Update src/rules/${benefitId}Rules.ts to implement specification v${featureMetadata.version}`
      );
    } else if (rulesStatus === 'ahead') {
      report.issues.push(
        `Rules version ${rulesMetadata.version} is ahead of feature version ${featureMetadata.version}`
      );
      report.recommendations.push(
        `Update features/benefits/${benefitId}.feature to version ${rulesMetadata.version}`
      );
    }
  }

  // 3. Check types compatibility
  const typesMetadata = extractTypesVersion(benefitId);
  if (typesMetadata) {
    const typesCompatible =
      typesMetadata.compatibleWithSpec?.includes(featureMetadata.version) ||
      typesMetadata.version === featureMetadata.version;

    report.components.types = {
      found: true,
      schemaVersion: typesMetadata.schemaVersion,
      compatible: typesCompatible,
      metadata: typesMetadata,
    };

    if (!typesCompatible) {
      report.issues.push(
        `Types schema v${typesMetadata.schemaVersion} may not be compatible with spec v${featureMetadata.version}`
      );
      report.recommendations.push(
        `Verify types compatibility or add '${featureMetadata.version}' to compatibleWithSpec array`
      );
    }
  } else {
    report.components.types = {
      found: false,
      compatible: true, // Assume compatible if not explicitly tracked
    };
  }

  // 4. Check state machine compatibility (optional)
  const workflowMetadata = extractWorkflowVersion(benefitId);
  if (workflowMetadata) {
    const workflowCompatible =
      workflowMetadata.compatibleWithRules?.includes(featureMetadata.version) ||
      workflowMetadata.version === featureMetadata.version;

    report.components.stateMachine = {
      found: true,
      workflowVersion: workflowMetadata.workflowVersion,
      compatible: workflowCompatible,
      metadata: workflowMetadata,
    };

    if (!workflowCompatible) {
      report.issues.push(
        `Workflow v${workflowMetadata.workflowVersion} may not be compatible with spec v${featureMetadata.version}`
      );
      report.recommendations.push(
        `Verify workflow compatibility or add '${featureMetadata.version}' to compatibleWithRules array`
      );
    }
  }

  // 5. Determine overall status
  report.overallStatus = determineOverallStatus(report);

  return report;
}

/**
 * Compare two semantic versions
 */
function compareVersions(
  implementedVersion: string,
  specVersion: string
): 'synced' | 'outdated' | 'ahead' | 'missing' {
  if (!implementedVersion) return 'missing';
  if (implementedVersion === specVersion) return 'synced';

  // Simple semantic version comparison
  const impl = implementedVersion.split('.').map(Number);
  const spec = specVersion.split('.').map(Number);

  for (let i = 0; i < Math.max(impl.length, spec.length); i++) {
    const implPart = impl[i] || 0;
    const specPart = spec[i] || 0;

    if (implPart > specPart) return 'ahead';
    if (implPart < specPart) return 'outdated';
  }

  return 'synced';
}

/**
 * Determine overall compliance status
 */
function determineOverallStatus(report: ComplianceReport): 'compliant' | 'needs-update' | 'critical' | 'error' {
  if (!report.components.feature.found) return 'error';
  if (!report.components.rules.found) return 'critical';

  if (report.components.rules.status === 'outdated') return 'needs-update';
  if (report.components.rules.status === 'ahead') return 'needs-update';

  if (!report.components.types.compatible) return 'needs-update';
  if (report.components.stateMachine && !report.components.stateMachine.compatible) {
    return 'needs-update';
  }

  if (report.components.rules.status === 'synced') return 'compliant';

  return 'needs-update';
}

/**
 * Resolve benefit ID from feature file name
 * This is the reverse of resolveFeatureFileName
 */
function resolveBenefitId(featureFileName: string): string {
  // Find the benefit ID that maps to this feature file name
  for (const [benefitId, fileName] of Object.entries(BENEFIT_ALIASES)) {
    if (fileName === featureFileName) {
      return benefitId;
    }
  }
  // If no alias found, use the feature file name as-is
  return featureFileName;
}

/**
 * Check compliance for all benefits
 */
export function checkAllCompliance(): Record<string, ComplianceReport> {
  const benefitsDir = path.join(process.cwd(), 'features', 'benefits');

  if (!fs.existsSync(benefitsDir)) {
    console.error('Benefits directory not found:', benefitsDir);
    return {};
  }

  const featureFiles = fs.readdirSync(benefitsDir).filter(f => f.endsWith('.feature'));
  const reports: Record<string, ComplianceReport> = {};

  // Get unique benefit IDs (accounting for aliases)
  const processedBenefitIds = new Set<string>();

  for (const file of featureFiles) {
    const featureFileName = file.replace('.feature', '');
    const benefitId = resolveBenefitId(featureFileName);

    // Skip if we've already processed this benefit ID
    if (processedBenefitIds.has(benefitId)) {
      continue;
    }

    processedBenefitIds.add(benefitId);
    reports[benefitId] = checkVersionCompliance(benefitId);
  }

  return reports;
}

/**
 * Print compliance report to console
 */
export function printComplianceReport(report: ComplianceReport): void {
  const statusEmoji = {
    compliant: '✅',
    'needs-update': '⚠️',
    critical: '❌',
    error: '🔴',
  };

  console.log(`\n${statusEmoji[report.overallStatus]} ${report.benefitId.toUpperCase()} - ${report.overallStatus.toUpperCase()}`);
  console.log(`   Specification Version: ${report.specificationVersion}`);

  console.log(`\n   Components:`);

  // Feature
  if (report.components.feature.found) {
    console.log(`   ✓ Feature: v${report.components.feature.version}`);
  } else {
    console.log(`   ✗ Feature: NOT FOUND`);
  }

  // Rules
  if (report.components.rules.found) {
    const statusIcon = report.components.rules.status === 'synced' ? '✓' : '⚠';
    console.log(`   ${statusIcon} Rules: v${report.components.rules.implementsVersion} (${report.components.rules.status})`);
  } else {
    console.log(`   ✗ Rules: NOT FOUND`);
  }

  // Types
  if (report.components.types.found) {
    const compatIcon = report.components.types.compatible ? '✓' : '⚠';
    console.log(`   ${compatIcon} Types: v${report.components.types.schemaVersion} (${report.components.types.compatible ? 'compatible' : 'check needed'})`);
  } else {
    console.log(`   - Types: Not tracked`);
  }

  // State Machine
  if (report.components.stateMachine?.found) {
    const compatIcon = report.components.stateMachine.compatible ? '✓' : '⚠';
    console.log(`   ${compatIcon} Workflow: v${report.components.stateMachine.workflowVersion} (${report.components.stateMachine.compatible ? 'compatible' : 'check needed'})`);
  }

  // Issues
  if (report.issues.length > 0) {
    console.log(`\n   Issues:`);
    report.issues.forEach(issue => console.log(`   - ${issue}`));
  }

  // Recommendations
  if (report.recommendations.length > 0) {
    console.log(`\n   Recommendations:`);
    report.recommendations.forEach(rec => console.log(`   - ${rec}`));
  }
}
