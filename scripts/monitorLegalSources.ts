#!/usr/bin/env ts-node
/**
 * Legal Source Monitoring Script
 *
 * Usage:
 *   npm run monitor:legal              # Run monitoring scan
 *   npm run monitor:legal -- --github  # Generate GitHub issue format
 *   npm run monitor:legal -- --state   # Show monitoring state
 */

import {
  performMonitoringScan,
  printMonitoringReport,
  generateGitHubIssueBody,
  loadMonitoringState,
} from '../src/utils/legalSourceMonitor';

// Parse command line arguments
const args = process.argv.slice(2);
const githubMode = args.includes('--github');
const showState = args.includes('--state');

async function main() {
  if (showState) {
    // Show current monitoring state
    const state = loadMonitoringState();

    console.log('\n📊 État de la surveillance\n');
    console.log(`Dernière analyse: ${state.lastScanDate.toISOString()}`);
    console.log(`\nMontants connus (${Object.keys(state.knownAmounts).length} prestations):`);

    for (const [benefit, amounts] of Object.entries(state.knownAmounts)) {
      console.log(`\n  ${benefit.toUpperCase()}:`);
      for (const [type, value] of Object.entries(amounts)) {
        console.log(`    - ${type}: ${value}€`);
      }
    }

    console.log(`\nHistorique des analyses (${state.scanHistory.length} dernières):`);
    for (const entry of state.scanHistory.slice(-10)) {
      const date = new Date(entry.date).toISOString().split('T')[0];
      const statusEmoji = entry.status === 'no-changes' ? '✅' : '⚠️';
      console.log(`  ${statusEmoji} ${date}: ${entry.changesDetected} changement(s) - ${entry.status}`);
    }

    console.log('\n');
    return;
  }

  // Run monitoring scan
  console.log('🔍 Démarrage de la surveillance des sources légales belges...\n');
  console.log('Sources surveillées:');
  console.log('  - SPF Intégration Sociale (RIS)');
  console.log('  - ONEM (AGR)');
  console.log('  - SPF Sécurité Sociale (GRAPA)');
  console.log('  - ejustice.just.fgov.be (textes légaux)');
  console.log('\n');

  const report = await performMonitoringScan();

  if (githubMode) {
    // Output GitHub issue format
    console.log('\n<!-- GITHUB_ISSUE_START -->');
    console.log(generateGitHubIssueBody(report));
    console.log('<!-- GITHUB_ISSUE_END -->\n');

    // Exit with code 1 if action required (for CI/CD)
    if (report.requiresAction) {
      console.error('⚠️  Action requise: des changements ont été détectés');
      process.exit(1);
    }
  } else {
    // Console output
    printMonitoringReport(report);
  }

  // Summary
  const statusEmoji = report.requiresAction ? '⚠️' : '✅';
  console.log(`${statusEmoji} Surveillance terminée`);

  if (report.requiresAction) {
    console.log('\n💡 Conseil: Exécutez avec --github pour générer un rapport GitHub issue');
    process.exit(1);
  }

  process.exit(0);
}

main().catch(error => {
  console.error('❌ Erreur lors de la surveillance:', error);
  process.exit(1);
});
