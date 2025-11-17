#!/usr/bin/env ts-node
/**
 * Version Compliance Validation Script
 *
 * Usage:
 *   npm run check:versions              # Check all benefits
 *   npm run check:versions -- ris       # Check specific benefit
 *   npm run check:versions -- --strict  # Exit with error if non-compliant
 */

import {
  checkVersionCompliance,
  checkAllCompliance,
  printComplianceReport,
  ComplianceReport,
} from '../src/utils/versionCompliance';

// Parse command line arguments
const args = process.argv.slice(2);
const specificBenefit = args.find(arg => !arg.startsWith('--'));
const strictMode = args.includes('--strict');
const jsonOutput = args.includes('--json');

function main() {
  console.log('🔍 Checking version compliance...\n');

  let reports: Record<string, ComplianceReport>;

  if (specificBenefit) {
    // Check specific benefit
    const report = checkVersionCompliance(specificBenefit);
    reports = { [specificBenefit]: report };
  } else {
    // Check all benefits
    reports = checkAllCompliance();
  }

  // JSON output for CI/CD
  if (jsonOutput) {
    console.log(JSON.stringify(reports, null, 2));
    process.exit(0);
  }

  // Print reports
  Object.values(reports).forEach(report => {
    printComplianceReport(report);
  });

  // Summary
  const totalCount = Object.keys(reports).length;
  const compliantCount = Object.values(reports).filter(r => r.overallStatus === 'compliant').length;
  const needsUpdateCount = Object.values(reports).filter(r => r.overallStatus === 'needs-update').length;
  const criticalCount = Object.values(reports).filter(r => r.overallStatus === 'critical').length;
  const errorCount = Object.values(reports).filter(r => r.overallStatus === 'error').length;

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total benefits checked: ${totalCount}`);
  console.log(`✅ Compliant: ${compliantCount}`);
  console.log(`⚠️  Needs update: ${needsUpdateCount}`);
  console.log(`❌ Critical: ${criticalCount}`);
  console.log(`🔴 Error: ${errorCount}`);
  console.log('='.repeat(60) + '\n');

  // Exit with error in strict mode if any non-compliant
  if (strictMode && (needsUpdateCount > 0 || criticalCount > 0 || errorCount > 0)) {
    console.error('❌ Version compliance check failed in strict mode');
    process.exit(1);
  }

  // Exit with error if critical errors
  if (criticalCount > 0 || errorCount > 0) {
    console.error('❌ Critical version compliance issues found');
    process.exit(1);
  }

  console.log('✅ Version compliance check completed');
  process.exit(0);
}

main();
