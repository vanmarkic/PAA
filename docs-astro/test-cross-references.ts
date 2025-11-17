/**
 * Test script for verifying cross-references between workflows, features, and rules
 */

import {
  generateCrossReferenceStats,
  getRelatedFeatures,
  getRelatedRules,
  getRelatedWorkflows,
  getRelatedRulesForFeature,
  getRelatedWorkflowsForRule,
  getRelatedFeaturesForRule
} from './src/lib/cross-references.ts';
import { loadMachinesMetadata } from './src/lib/machines.ts';
import { loadFeaturesMetadata } from './src/lib/features.ts';
import { loadRulesMetadata, getAllRules } from './src/lib/rules.ts';

async function testCrossReferences() {
  console.log('🔍 Testing Cross-References System\n');
  console.log('=' .repeat(50));

  try {
    // Load metadata
    const [machinesMetadata, featuresMetadata, rulesMetadata] = await Promise.all([
      loadMachinesMetadata(),
      loadFeaturesMetadata(),
      loadRulesMetadata()
    ]);

    const allRules = getAllRules(rulesMetadata);

    console.log('\n📊 Data Summary:');
    console.log(`  - Workflows: ${machinesMetadata.machines.length}`);
    console.log(`  - Features: ${featuresMetadata.features.length}`);
    console.log(`  - Rules: ${allRules.length}`);

    // Test specific workflow cross-references
    console.log('\n🔗 Testing Workflow Cross-References:');
    const testWorkflows = ['risApplication', 'agrEligibility', 'legalConversion'];

    for (const workflowId of testWorkflows) {
      const workflow = machinesMetadata.machines.find(m => m.id === workflowId);
      if (workflow) {
        const relatedFeatures = await getRelatedFeatures(workflowId);
        const relatedRules = await getRelatedRules(workflowId);

        console.log(`\n  📋 ${workflow.name} (${workflowId}):`);
        console.log(`     → ${relatedFeatures.length} related features`);
        if (relatedFeatures.length > 0) {
          console.log(`        Top match: "${relatedFeatures[0].name}" (score: ${relatedFeatures[0].matchScore})`);
        }
        console.log(`     → ${relatedRules.length} related rules`);
        if (relatedRules.length > 0) {
          console.log(`        Top match: "${relatedRules[0].name}" (score: ${relatedRules[0].matchScore})`);
        }
      }
    }

    // Test specific feature cross-references
    console.log('\n📝 Testing Feature Cross-References:');
    const testFeatures = featuresMetadata.features.slice(0, 3).map(f => f.id);

    for (const featureId of testFeatures) {
      const feature = featuresMetadata.features.find(f => f.id === featureId);
      if (feature) {
        const relatedWorkflows = await getRelatedWorkflows(featureId);
        const relatedRules = await getRelatedRulesForFeature(featureId);

        console.log(`\n  📄 ${feature.name} (${featureId}):`);
        console.log(`     → ${relatedWorkflows.length} related workflows`);
        if (relatedWorkflows.length > 0) {
          console.log(`        Top match: "${relatedWorkflows[0].name}" (score: ${relatedWorkflows[0].matchScore})`);
        }
        console.log(`     → ${relatedRules.length} related rules`);
        if (relatedRules.length > 0) {
          console.log(`        Top match: "${relatedRules[0].name}" (score: ${relatedRules[0].matchScore})`);
        }
      }
    }

    // Test specific rule cross-references
    console.log('\n📐 Testing Rule Cross-References:');
    const testRules = ['ris-rule-1', 'agr-rule-1'];

    for (const ruleId of testRules) {
      const rule = allRules.find(r => r.id === ruleId);
      if (rule) {
        const relatedWorkflows = await getRelatedWorkflowsForRule(ruleId);
        const relatedFeatures = await getRelatedFeaturesForRule(ruleId);

        console.log(`\n  📏 ${rule.description} (${ruleId}):`);
        console.log(`     → ${relatedWorkflows.length} related workflows`);
        if (relatedWorkflows.length > 0) {
          console.log(`        Top match: "${relatedWorkflows[0].name}" (score: ${relatedWorkflows[0].matchScore})`);
        }
        console.log(`     → ${relatedFeatures.length} related features`);
        if (relatedFeatures.length > 0) {
          console.log(`        Top match: "${relatedFeatures[0].name}" (score: ${relatedFeatures[0].matchScore})`);
        }
      }
    }

    // Generate overall statistics
    console.log('\n📈 Generating Overall Statistics...');
    const stats = await generateCrossReferenceStats();

    console.log('\n🎯 Cross-Reference Statistics:');
    console.log(`  Total Workflows: ${stats.totalWorkflows}`);
    console.log(`  Total Features: ${stats.totalFeatures}`);
    console.log(`  Total Rules: ${stats.totalRules}`);
    console.log(`  \n  Cross-References Found:`);
    console.log(`    - Workflow connections: ${stats.totalWorkflowCrossReferences} (avg: ${stats.averageWorkflowLinks} per workflow)`);
    console.log(`    - Feature connections: ${stats.totalFeatureCrossReferences} (avg: ${stats.averageFeatureLinks} per feature)`);
    console.log(`    - Rule connections: ${stats.totalRuleCrossReferences} (avg: ${stats.averageRuleLinks} per rule)`);
    console.log(`    - Total connections: ${stats.totalCrossReferences}`);

    // Find items with most cross-references
    console.log('\n🏆 Top Connected Items:');

    // Find workflow with most connections
    let maxWorkflowConnections = 0;
    let topWorkflow = null;
    for (const machine of machinesMetadata.machines) {
      const features = await getRelatedFeatures(machine.id);
      const rules = await getRelatedRules(machine.id);
      const total = features.length + rules.length;
      if (total > maxWorkflowConnections) {
        maxWorkflowConnections = total;
        topWorkflow = machine;
      }
    }
    if (topWorkflow) {
      console.log(`  🥇 Most connected workflow: "${topWorkflow.name}" with ${maxWorkflowConnections} connections`);
    }

    // Find feature with most connections
    let maxFeatureConnections = 0;
    let topFeature = null;
    for (const feature of featuresMetadata.features.slice(0, 10)) { // Sample first 10 for speed
      const workflows = await getRelatedWorkflows(feature.id);
      const rules = await getRelatedRulesForFeature(feature.id);
      const total = workflows.length + rules.length;
      if (total > maxFeatureConnections) {
        maxFeatureConnections = total;
        topFeature = feature;
      }
    }
    if (topFeature) {
      console.log(`  🥈 Most connected feature: "${topFeature.name}" with ${maxFeatureConnections} connections`);
    }

    console.log('\n✅ Cross-reference system test completed successfully!');

  } catch (error) {
    console.error('\n❌ Error testing cross-references:', error);
    process.exit(1);
  }
}

// Run the test
testCrossReferences().catch(console.error);