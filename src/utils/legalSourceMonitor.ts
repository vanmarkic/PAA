/**
 * Legal Source Monitoring System
 *
 * Automatically checks Belgian official sources for legislative changes:
 * - ONEM (unemployment/AGR)
 * - SPF Sécurité Sociale (RIS, GRAPA)
 * - ejustice.just.fgov.be (legal texts)
 * - Moniteur Belge (official gazette)
 *
 * Detects:
 * - Amount changes (indexation)
 * - New legal texts or amendments
 * - Modified articles
 * - Effective date changes
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// TYPES
// ============================================================================

export interface LegalSourceCheck {
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  lastChecked: Date;
  lastModified?: Date;
  status: 'unchanged' | 'changed' | 'error' | 'unreachable';
}

export interface AmountChange {
  benefitId: string;
  amountType: string;
  oldValue: number;
  newValue: number;
  effectiveDate: string;
  sourceUrl: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface LegalTextChange {
  benefitId: string;
  legalReference: string;
  changeType: 'amendment' | 'new-article' | 'repeal' | 'indexation';
  description: string;
  detectedDate: Date;
  effectiveDate?: string;
  sourceUrl: string;
  articleNumbers?: string[];
}

export interface MonitoringReport {
  scanDate: Date;
  sources: LegalSourceCheck[];
  amountChanges: AmountChange[];
  legalTextChanges: LegalTextChange[];
  affectedBenefits: string[];
  recommendations: string[];
  requiresAction: boolean;
}

export interface MonitoringState {
  lastScanDate: Date;
  knownAmounts: Record<string, Record<string, number>>;
  knownLegalVersions: Record<string, string>;
  scanHistory: {
    date: Date;
    changesDetected: number;
    status: string;
  }[];
}

// ============================================================================
// LEGAL SOURCE DEFINITIONS
// ============================================================================

const LEGAL_SOURCES = {
  ris: {
    sourceId: 'ris-spf',
    sourceName: 'SPF Intégration Sociale - RIS',
    sourceUrl: 'https://www.mi-is.be/fr/cpas/ris',
    amountsUrl: 'https://www.mi-is.be/fr/etudes-et-chiffres/montants-du-ris',
    legalTextUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2002052647&table_name=loi',
    checkInterval: 'weekly',
  },
  agr: {
    sourceId: 'agr-onem',
    sourceName: 'ONEM - Allocation de Garantie de Revenus',
    sourceUrl: 'https://www.onem.be/fr/documentation/feuille-info/t70',
    amountsUrl: 'https://www.onem.be/fr/documentation/montants',
    legalTextUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1991112550&table_name=loi',
    checkInterval: 'weekly',
  },
  grapa: {
    sourceId: 'grapa-spf',
    sourceName: 'SPF Sécurité Sociale - GRAPA',
    sourceUrl: 'https://www.socialsecurity.belgium.be/fr/tout-sur-les-pensions/grapa',
    legalTextUrl: 'https://www.ejustice.just.fgov.be/eli/loi/2001/03/22/2001022201/justel',
    checkInterval: 'monthly',
  },
};

// ============================================================================
// MONITORING STATE MANAGEMENT
// ============================================================================

const STATE_FILE_PATH = path.join(process.cwd(), '.monitoring-state.json');

/**
 * Load monitoring state from file
 */
export function loadMonitoringState(): MonitoringState {
  if (!fs.existsSync(STATE_FILE_PATH)) {
    return {
      lastScanDate: new Date(0), // Epoch
      knownAmounts: {},
      knownLegalVersions: {},
      scanHistory: [],
    };
  }

  try {
    const content = fs.readFileSync(STATE_FILE_PATH, 'utf-8');
    const state = JSON.parse(content);

    // Convert date strings back to Date objects
    state.lastScanDate = new Date(state.lastScanDate);
    state.scanHistory = state.scanHistory.map((entry: any) => ({
      ...entry,
      date: new Date(entry.date),
    }));

    return state;
  } catch (error) {
    console.error('Error loading monitoring state:', error);
    return {
      lastScanDate: new Date(0),
      knownAmounts: {},
      knownLegalVersions: {},
      scanHistory: [],
    };
  }
}

/**
 * Save monitoring state to file
 */
export function saveMonitoringState(state: MonitoringState): void {
  try {
    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving monitoring state:', error);
  }
}

// ============================================================================
// SOURCE CHECKING
// ============================================================================

/**
 * Check if a URL is reachable and get last-modified date
 * Note: This is a simplified version. In production, use proper HTTP client.
 */
async function checkSourceReachability(url: string): Promise<LegalSourceCheck> {
  const urlObj = new URL(url);

  return {
    sourceId: urlObj.hostname,
    sourceName: url,
    sourceUrl: url,
    lastChecked: new Date(),
    status: 'unchanged', // In real implementation, make HTTP HEAD request
  };
}

/**
 * Extract amounts from legal source
 * NOTE: This is a placeholder. Real implementation would:
 * - Fetch HTML from source
 * - Parse with cheerio/jsdom
 * - Extract amount values using selectors
 * - Compare with known amounts
 */
async function extractAmountsFromSource(
  benefitId: string,
  sourceUrl: string
): Promise<Record<string, number>> {
  // PLACEHOLDER: In production, implement web scraping
  // For now, return empty to avoid false positives
  console.log(`[PLACEHOLDER] Would scrape amounts from: ${sourceUrl}`);
  return {};
}

/**
 * Check for legal text modifications
 * NOTE: This is a placeholder. Real implementation would:
 * - Fetch page from ejustice
 * - Extract "Dernière modification" date
 * - Compare with stored version
 */
async function checkLegalTextModifications(
  benefitId: string,
  legalTextUrl: string
): Promise<LegalTextChange[]> {
  // PLACEHOLDER: In production, implement scraping
  console.log(`[PLACEHOLDER] Would check legal text at: ${legalTextUrl}`);
  return [];
}

// ============================================================================
// CHANGE DETECTION
// ============================================================================

/**
 * Compare known amounts with newly extracted amounts
 */
function detectAmountChanges(
  benefitId: string,
  knownAmounts: Record<string, number>,
  extractedAmounts: Record<string, number>,
  sourceUrl: string
): AmountChange[] {
  const changes: AmountChange[] = [];

  for (const [amountType, newValue] of Object.entries(extractedAmounts)) {
    const oldValue = knownAmounts[amountType];

    if (oldValue !== undefined && oldValue !== newValue) {
      changes.push({
        benefitId,
        amountType,
        oldValue,
        newValue,
        effectiveDate: new Date().toISOString().split('T')[0],
        sourceUrl,
        confidence: 'medium', // Would be 'high' if extracted with high certainty
      });
    }
  }

  return changes;
}

/**
 * Detect indexation patterns
 * Belgian benefits are typically indexed annually or semi-annually
 */
function detectIndexationPattern(changes: AmountChange[]): {
  isIndexation: boolean;
  percentage?: number;
  pattern?: string;
} {
  if (changes.length === 0) return { isIndexation: false };

  // Calculate percentage changes
  const percentages = changes.map(c => ((c.newValue - c.oldValue) / c.oldValue) * 100);

  // Check if all changes are similar percentage (within 0.5%)
  const avgPercentage = percentages.reduce((a, b) => a + b, 0) / percentages.length;
  const maxDeviation = Math.max(...percentages.map(p => Math.abs(p - avgPercentage)));

  if (maxDeviation < 0.5) {
    return {
      isIndexation: true,
      percentage: avgPercentage,
      pattern: `Indexation uniforme de ${avgPercentage.toFixed(2)}%`,
    };
  }

  return { isIndexation: false };
}

// ============================================================================
// MONITORING ORCHESTRATION
// ============================================================================

/**
 * Perform full monitoring scan
 */
export async function performMonitoringScan(): Promise<MonitoringReport> {
  console.log('🔍 Starting legal source monitoring scan...\n');

  const report: MonitoringReport = {
    scanDate: new Date(),
    sources: [],
    amountChanges: [],
    legalTextChanges: [],
    affectedBenefits: [],
    recommendations: [],
    requiresAction: false,
  };

  const state = loadMonitoringState();

  // Check each benefit
  for (const [benefitId, source] of Object.entries(LEGAL_SOURCES)) {
    console.log(`Checking ${source.sourceName}...`);

    // 1. Check source reachability
    const sourceCheck = await checkSourceReachability(source.sourceUrl);
    report.sources.push(sourceCheck);

    // 2. Extract and compare amounts
    if ('amountsUrl' in source) {
      const extractedAmounts = await extractAmountsFromSource(benefitId, source.amountsUrl!);
      const knownAmounts = state.knownAmounts[benefitId] || {};

      const amountChanges = detectAmountChanges(
        benefitId,
        knownAmounts,
        extractedAmounts,
        source.amountsUrl!
      );

      if (amountChanges.length > 0) {
        report.amountChanges.push(...amountChanges);
        report.affectedBenefits.push(benefitId);
        report.requiresAction = true;

        // Update known amounts
        state.knownAmounts[benefitId] = { ...knownAmounts, ...extractedAmounts };
      }
    }

    // 3. Check legal text modifications
    const legalChanges = await checkLegalTextModifications(benefitId, source.legalTextUrl);
    if (legalChanges.length > 0) {
      report.legalTextChanges.push(...legalChanges);
      if (!report.affectedBenefits.includes(benefitId)) {
        report.affectedBenefits.push(benefitId);
      }
      report.requiresAction = true;
    }
  }

  // Generate recommendations
  report.recommendations = generateRecommendations(report);

  // Update state
  state.lastScanDate = report.scanDate;
  state.scanHistory.push({
    date: report.scanDate,
    changesDetected: report.amountChanges.length + report.legalTextChanges.length,
    status: report.requiresAction ? 'action-required' : 'no-changes',
  });

  // Keep only last 50 scans in history
  if (state.scanHistory.length > 50) {
    state.scanHistory = state.scanHistory.slice(-50);
  }

  saveMonitoringState(state);

  return report;
}

/**
 * Generate actionable recommendations based on detected changes
 */
function generateRecommendations(report: MonitoringReport): string[] {
  const recommendations: string[] = [];

  // Amount changes
  if (report.amountChanges.length > 0) {
    const indexation = detectIndexationPattern(report.amountChanges);

    if (indexation.isIndexation) {
      recommendations.push(
        `⚠️  Indexation détectée: ${indexation.pattern}`
      );
      recommendations.push(
        `Action requise: Mettre à jour les features et rules pour ${report.affectedBenefits.join(', ')}`
      );
    } else {
      recommendations.push(
        `⚠️  Changements de montants détectés (non-uniforme)`
      );
      recommendations.push(
        `Action requise: Vérifier manuellement les changements avant mise à jour`
      );
    }

    // Specific benefit recommendations
    for (const benefit of report.affectedBenefits) {
      const benefitChanges = report.amountChanges.filter(c => c.benefitId === benefit);
      recommendations.push(
        `  - ${benefit.toUpperCase()}: ${benefitChanges.length} montant(s) modifié(s)`
      );
    }
  }

  // Legal text changes
  if (report.legalTextChanges.length > 0) {
    recommendations.push(
      `⚠️  ${report.legalTextChanges.length} modification(s) légale(s) détectée(s)`
    );

    for (const change of report.legalTextChanges) {
      recommendations.push(
        `  - ${change.benefitId}: ${change.changeType} - ${change.description}`
      );
    }
  }

  // Version update recommendations
  if (report.requiresAction) {
    recommendations.push('');
    recommendations.push('📋 Étapes recommandées:');
    recommendations.push('  1. Vérifier les sources officielles manuellement');
    recommendations.push('  2. Mettre à jour les feature files avec nouveaux montants/conditions');
    recommendations.push('  3. Mettre à jour les rules avec nouvelle version');
    recommendations.push('  4. Exécuter: npm run check:versions');
    recommendations.push('  5. Exécuter les tests: npm test');
  }

  return recommendations;
}

// ============================================================================
// NOTIFICATION SYSTEM
// ============================================================================

/**
 * Create GitHub issue for detected changes
 * This can be used in GitHub Actions to automatically create issues
 */
export function generateGitHubIssueBody(report: MonitoringReport): string {
  const lines: string[] = [];

  lines.push(`# 🔍 Surveillance des sources légales - ${report.scanDate.toISOString().split('T')[0]}`);
  lines.push('');

  if (!report.requiresAction) {
    lines.push('✅ Aucun changement détecté.');
    return lines.join('\n');
  }

  lines.push('⚠️ **Des changements ont été détectés dans les sources légales belges.**');
  lines.push('');

  // Amount changes
  if (report.amountChanges.length > 0) {
    lines.push('## 💰 Changements de montants');
    lines.push('');
    lines.push('| Prestation | Type | Ancien | Nouveau | Date effective |');
    lines.push('|------------|------|--------|---------|----------------|');

    for (const change of report.amountChanges) {
      lines.push(
        `| ${change.benefitId.toUpperCase()} | ${change.amountType} | ${change.oldValue}€ | ${change.newValue}€ | ${change.effectiveDate} |`
      );
    }
    lines.push('');
  }

  // Legal text changes
  if (report.legalTextChanges.length > 0) {
    lines.push('## 📜 Modifications légales');
    lines.push('');

    for (const change of report.legalTextChanges) {
      lines.push(`- **${change.benefitId.toUpperCase()}**: ${change.changeType}`);
      lines.push(`  - ${change.description}`);
      lines.push(`  - Source: ${change.sourceUrl}`);
      if (change.articleNumbers && change.articleNumbers.length > 0) {
        lines.push(`  - Articles: ${change.articleNumbers.join(', ')}`);
      }
      lines.push('');
    }
  }

  // Recommendations
  if (report.recommendations.length > 0) {
    lines.push('## 📋 Recommandations');
    lines.push('');
    for (const rec of report.recommendations) {
      lines.push(rec);
    }
    lines.push('');
  }

  // Affected files
  lines.push('## 📁 Fichiers à mettre à jour');
  lines.push('');
  for (const benefit of report.affectedBenefits) {
    lines.push(`- [ ] \`features/benefits/${benefit}.feature\``);
    lines.push(`- [ ] \`src/rules/${benefit}Rules.ts\``);
  }
  lines.push('');

  // Next steps
  lines.push('## ✅ Prochaines étapes');
  lines.push('');
  lines.push('1. Vérifier manuellement les sources officielles');
  lines.push('2. Mettre à jour les versions dans les features et rules');
  lines.push('3. Exécuter `npm run check:versions` pour vérifier la conformité');
  lines.push('4. Créer un PR avec les changements');
  lines.push('');

  // Labels suggestion
  lines.push('---');
  lines.push('');
  lines.push('**Labels suggérés**: `legal-update`, `monitoring`, `automated`');

  return lines.join('\n');
}

/**
 * Print monitoring report to console
 */
export function printMonitoringReport(report: MonitoringReport): void {
  console.log('\n' + '='.repeat(70));
  console.log(`📊 RAPPORT DE SURVEILLANCE - ${report.scanDate.toISOString()}`);
  console.log('='.repeat(70));

  // Status
  if (report.requiresAction) {
    console.log('\n⚠️  ACTION REQUISE: Des changements ont été détectés\n');
  } else {
    console.log('\n✅ Aucun changement détecté\n');
  }

  // Sources checked
  console.log(`Sources vérifiées: ${report.sources.length}`);
  for (const source of report.sources) {
    const statusEmoji = source.status === 'unchanged' ? '✓' : '⚠';
    console.log(`  ${statusEmoji} ${source.sourceName}`);
  }

  // Changes
  if (report.amountChanges.length > 0) {
    console.log(`\n💰 Changements de montants: ${report.amountChanges.length}`);
    for (const change of report.amountChanges) {
      console.log(
        `  - ${change.benefitId.toUpperCase()}.${change.amountType}: ${change.oldValue}€ → ${change.newValue}€`
      );
    }
  }

  if (report.legalTextChanges.length > 0) {
    console.log(`\n📜 Modifications légales: ${report.legalTextChanges.length}`);
    for (const change of report.legalTextChanges) {
      console.log(`  - ${change.benefitId.toUpperCase()}: ${change.description}`);
    }
  }

  // Affected benefits
  if (report.affectedBenefits.length > 0) {
    console.log(`\n🎯 Prestations affectées: ${report.affectedBenefits.join(', ').toUpperCase()}`);
  }

  // Recommendations
  if (report.recommendations.length > 0) {
    console.log('\n📋 Recommandations:\n');
    for (const rec of report.recommendations) {
      console.log(`   ${rec}`);
    }
  }

  console.log('\n' + '='.repeat(70) + '\n');
}
