#!/usr/bin/env ts-node
/**
 * Automated Legal Update Script
 *
 * This script orchestrates the full automation pipeline:
 * 1. Monitor Belgian legal sources for changes
 * 2. Use Claude AI to rewrite affected features and rules
 * 3. Run version compliance checks
 * 4. Create a git branch and commit changes
 * 5. Optionally create a pull request
 *
 * Usage:
 *   npm run auto-update              # Full automation
 *   npm run auto-update -- --dry-run # Preview only, no commits
 *   npm run auto-update -- --no-ai   # Skip AI rewriting (manual only)
 */

import { performMonitoringScan, printMonitoringReport } from '../src/utils/legalSourceMonitor';
import {
  processMonitoringReportWithAI,
  ClaudeAPIConfig,
  AIRewriteResult,
} from '../src/ai/claudeIntegration';
import { checkVersionCompliance } from '../src/utils/versionCompliance';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// ============================================================================
// CONFIGURATION
// ============================================================================

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const skipAI = args.includes('--no-ai');
const createPR = args.includes('--create-pr');

const CLAUDE_API_CONFIG: ClaudeAPIConfig = {
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
  maxTokens: 8000,
};

// ============================================================================
// MAIN ORCHESTRATION
// ============================================================================

async function main() {
  console.log('🚀 Starting Automated Legal Update Pipeline\n');
  console.log('Configuration:');
  console.log(`  - Dry run: ${dryRun ? 'YES (no commits)' : 'NO'}`);
  console.log(`  - AI rewriting: ${skipAI ? 'DISABLED' : 'ENABLED'}`);
  console.log(`  - Create PR: ${createPR ? 'YES' : 'NO'}`);
  console.log('');

  // Step 1: Monitor legal sources
  console.log('📡 Step 1/6: Monitoring legal sources...\n');
  const report = await performMonitoringScan();
  printMonitoringReport(report);

  if (!report.requiresAction) {
    console.log('✅ No changes detected. Exiting.');
    process.exit(0);
  }

  console.log(`⚠️  Changes detected affecting: ${report.affectedBenefits.join(', ').toUpperCase()}\n`);

  // Step 2: AI Rewriting (if enabled)
  let aiResults: Map<string, { feature: AIRewriteResult; rules: AIRewriteResult }> | null = null;

  if (!skipAI) {
    if (!CLAUDE_API_CONFIG.apiKey) {
      console.error('❌ ANTHROPIC_API_KEY not set. Either set it or use --no-ai flag.');
      process.exit(1);
    }

    console.log('🤖 Step 2/6: Rewriting features and rules with Claude AI...\n');
    aiResults = await processMonitoringReportWithAI(report, CLAUDE_API_CONFIG);

    // Review AI results
    let allSuccessful = true;
    for (const [benefitId, results] of aiResults.entries()) {
      console.log(`\n${benefitId.toUpperCase()}:`);
      console.log(`  Feature: ${results.feature.success ? '✅' : '❌'} (confidence: ${results.feature.confidence})`);
      console.log(`  Rules:   ${results.rules.success ? '✅' : '❌'} (confidence: ${results.rules.confidence})`);

      if (results.feature.requiresHumanReview || results.rules.requiresHumanReview) {
        console.log(`  ⚠️  Requires human review`);
        allSuccessful = false;
      }
    }

    if (!allSuccessful && !dryRun) {
      console.log('\n⚠️  Some AI rewrites require human review.');
      console.log('Run with --dry-run to preview changes before committing.\n');
    }
  } else {
    console.log('⏭️  Step 2/6: AI rewriting SKIPPED (--no-ai flag)\n');
  }

  // Step 3: Write files (if not dry-run and AI succeeded)
  if (!dryRun && aiResults) {
    console.log('💾 Step 3/6: Writing updated files...\n');

    for (const [benefitId, results] of aiResults.entries()) {
      if (results.feature.success && results.feature.newContent) {
        const featurePath = getFeaturePath(benefitId);
        fs.writeFileSync(featurePath, results.feature.newContent, 'utf-8');
        console.log(`  ✅ Updated: ${featurePath}`);
      }

      if (results.rules.success && results.rules.newContent) {
        const rulesPath = getRulesPath(benefitId);
        fs.writeFileSync(rulesPath, results.rules.newContent, 'utf-8');
        console.log(`  ✅ Updated: ${rulesPath}`);
      }
    }

    console.log('');
  } else if (dryRun) {
    console.log('⏭️  Step 3/6: Writing files SKIPPED (dry-run mode)\n');
  }

  // Step 4: Run version compliance check
  console.log('🔍 Step 4/6: Checking version compliance...\n');

  for (const benefitId of report.affectedBenefits) {
    const compliance = checkVersionCompliance(benefitId);
    const statusEmoji = compliance.overallStatus === 'compliant' ? '✅' : '⚠️';
    console.log(`  ${statusEmoji} ${benefitId.toUpperCase()}: ${compliance.overallStatus}`);
  }

  console.log('');

  // Step 5: Git operations (if not dry-run)
  if (!dryRun) {
    console.log('🌿 Step 5/6: Creating git branch and commit...\n');

    const branchName = `auto-update/legal-changes-${new Date().toISOString().split('T')[0]}`;

    try {
      // Create and checkout branch
      execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
      console.log(`  ✅ Created branch: ${branchName}`);

      // Stage changes
      execSync('git add features/ src/rules/', { stdio: 'inherit' });
      console.log(`  ✅ Staged changes`);

      // Create commit message
      const commitMessage = generateCommitMessage(report, aiResults);

      // Commit
      execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
      console.log(`  ✅ Created commit`);

      // Push
      execSync(`git push -u origin ${branchName}`, { stdio: 'inherit' });
      console.log(`  ✅ Pushed to remote`);

      console.log('');
    } catch (error) {
      console.error('❌ Git operations failed:', error);
      process.exit(1);
    }
  } else {
    console.log('⏭️  Step 5/6: Git operations SKIPPED (dry-run mode)\n');
  }

  // Step 6: Create PR (if requested)
  if (createPR && !dryRun) {
    console.log('🔀 Step 6/6: Creating pull request...\n');

    const prTitle = `[Auto-Update] Legal changes detected - ${new Date().toISOString().split('T')[0]}`;
    const prBody = generatePRBody(report, aiResults);

    try {
      // Note: Requires 'gh' CLI to be installed and authenticated
      execSync(
        `gh pr create --title "${prTitle}" --body "${prBody}" --label "automated,legal-update"`,
        { stdio: 'inherit' }
      );

      console.log('  ✅ Pull request created');
    } catch (error) {
      console.error('  ⚠️  Could not create PR automatically. Please create manually.');
      console.error('  Make sure GitHub CLI (gh) is installed and authenticated.');
    }
  } else {
    console.log('⏭️  Step 6/6: PR creation SKIPPED\n');
  }

  // Summary
  console.log('='.repeat(70));
  console.log('✅ Automated update pipeline completed!');
  console.log('='.repeat(70));

  if (dryRun) {
    console.log('\n💡 This was a dry-run. Run without --dry-run to apply changes.');
  } else {
    console.log('\n✅ Changes have been committed and pushed.');
    console.log('🔍 Review the changes and merge the PR when ready.');
  }

  console.log('');
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getFeaturePath(benefitId: string): string {
  const aliases: Record<string, string> = {
    'agr': 'income-guarantee',
    'ris': 'ris',
  };

  const fileName = aliases[benefitId] || benefitId;
  return path.join(process.cwd(), 'features', 'benefits', `${fileName}.feature`);
}

function getRulesPath(benefitId: string): string {
  return path.join(process.cwd(), 'src', 'rules', `${benefitId}Rules.ts`);
}

function generateCommitMessage(
  report: any,
  aiResults: Map<string, any> | null
): string {
  const lines: string[] = [];

  lines.push('feat(auto-update): legal changes detected and applied');
  lines.push('');
  lines.push('This is an automated update generated by the legal source monitoring system.');
  lines.push('');

  if (report.amountChanges.length > 0) {
    lines.push('Amount changes:');
    for (const change of report.amountChanges) {
      lines.push(`- ${change.benefitId}: ${change.amountType} ${change.oldValue}€ → ${change.newValue}€`);
    }
    lines.push('');
  }

  if (report.legalTextChanges.length > 0) {
    lines.push('Legal text changes:');
    for (const change of report.legalTextChanges) {
      lines.push(`- ${change.benefitId}: ${change.changeType}`);
    }
    lines.push('');
  }

  lines.push(`Affected benefits: ${report.affectedBenefits.join(', ').toUpperCase()}`);
  lines.push('');

  if (aiResults) {
    lines.push('AI-assisted rewriting: YES');
    lines.push('');
  }

  lines.push('Scan date: ' + report.scanDate.toISOString());

  return lines.join('\\n');
}

function generatePRBody(report: any, aiResults: Map<string, any> | null): string {
  const lines: string[] = [];

  lines.push('## 🤖 Automated Legal Update');
  lines.push('');
  lines.push('This PR was automatically generated by the legal source monitoring system.');
  lines.push('');

  lines.push('### 📊 Changes Detected');
  lines.push('');

  if (report.amountChanges.length > 0) {
    lines.push('**Amount Changes:**');
    lines.push('| Benefit | Type | Old → New | Effective |');
    lines.push('|---------|------|-----------|-----------|');

    for (const change of report.amountChanges) {
      lines.push(
        `| ${change.benefitId.toUpperCase()} | ${change.amountType} | ${change.oldValue}€ → ${change.newValue}€ | ${change.effectiveDate} |`
      );
    }
    lines.push('');
  }

  lines.push('### ✅ Actions Taken');
  lines.push('');
  lines.push('- [x] Monitored Belgian legal sources');

  if (aiResults) {
    lines.push('- [x] Used Claude AI to rewrite features and rules');
  }

  lines.push('- [x] Updated feature files with new versions');
  lines.push('- [x] Updated rules files to match specifications');
  lines.push('- [x] Ran version compliance checks');
  lines.push('');

  lines.push('### 🔍 Review Checklist');
  lines.push('');
  lines.push('- [ ] Verify amounts match official sources');
  lines.push('- [ ] Review AI-generated changes for accuracy');
  lines.push('- [ ] Run: `npm run check:versions`');
  lines.push('- [ ] Run: `npm test`');
  lines.push('- [ ] Verify legal references are correct');
  lines.push('');

  return lines.join('\\n');
}

// ============================================================================
// RUN
// ============================================================================

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
