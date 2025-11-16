/**
 * Example demonstrating the legal text conversion workflow
 */

import { createActor } from 'xstate';
import { conversionMachine } from '../workflows/conversionMachine';
import { LegalText } from '../domain/types';

function runConversionWorkflowExample() {
  console.log('=== Legal Text Conversion Workflow Example ===\n');

  // Sample legal text (Article 1382 Code Civil)
  const legalText: LegalText = {
    id: 'cc-1382',
    source: 'Code Civil',
    language: 'fr',
    articleNumber: '1382',
    rawText:
      'Tout fait quelconque de l\'homme, qui cause à autrui un dommage, oblige celui par la faute duquel il est arrivé à le réparer.',
    metadata: {
      lastUpdated: new Date('2023-01-01'),
      authority: 'Législateur belge',
    },
  };

  // Create and start the state machine
  const actor = createActor(conversionMachine);

  actor.subscribe((snapshot) => {
      console.log(`State: ${snapshot.value}`);

      if (snapshot.getMeta) {
        const meta = snapshot.getMeta();
        if (meta && meta.description) {
          console.log(`  → ${meta.description}`);
        }
      }

      // Show context at key stages
      if (snapshot.value === 'validating' || snapshot.value === 'completed') {
        console.log('Context:', JSON.stringify(snapshot.context, null, 2));
      }

      console.log();
    });

  actor.start();

  // Simulate the workflow
  console.log('Starting conversion workflow...\n');

  // 1. Start conversion
  actor.send({
    type: 'START_CONVERSION',
    legalText,
    targetLevel: 'simple',
    targetAudience: 'general',
  });

  // 2. Structure extracted (simulated async operation)
  setTimeout(() => {
    actor.send({
      type: 'STRUCTURE_EXTRACTED',
      structure: {
        type: 'obligation',
        subject: 'personne causant dommage',
        action: 'réparer',
      },
    });
  }, 100);

  // 3. Concepts identified
  setTimeout(() => {
    actor.send({
      type: 'CONCEPTS_IDENTIFIED',
      concepts: ['responsabilité civile', 'dommage', 'obligation de réparer'],
    });
  }, 200);

  // 4. Terms mapped
  setTimeout(() => {
    actor.send({
      type: 'TERMS_MAPPED',
      mappedTerms: {
        'responsabilité civile': 'devoir de réparer',
        dommage: 'dégâts',
      },
    });
  }, 300);

  // 5. Versions generated
  setTimeout(() => {
    actor.send({
      type: 'VERSIONS_GENERATED',
      versions: {
        simple: 'Si vous causez des dégâts à quelqu\'un, vous devez les réparer.',
        detailed: 'Si vous cassez quelque chose ou blessez quelqu\'un par votre faute, vous devez payer les réparations.',
        examples: [
          {
            situation: 'Vélo qui griffe voiture',
            consequence: 'Payer réparation',
          },
        ],
        warnings: ['Même si c\'est un accident, vous êtes responsable'],
      },
    });
  }, 400);

  // 6. Validation passed
  setTimeout(() => {
    actor.send({
      type: 'VALIDATION_PASSED',
    });

    console.log('✓ Conversion completed successfully!\n');

    // Visualize final state
    console.log('Final converted text:');
    console.log('  Simple: "Si vous causez des dégâts à quelqu\'un, vous devez les réparer."');
    console.log('  Readability score: 85/100');
    console.log('  Semantic accuracy: 94%\n');

    // Stop the actor
    actor.stop();
  }, 500);
}

// Example of retry scenario
function runConversionWithRetryExample() {
  console.log('=== Conversion with Retry Example ===\n');

  const actor = createActor(conversionMachine);

  actor.subscribe((snapshot) => {
      console.log(`State: ${snapshot.value}`);
      if (snapshot.context.retryCount > 0) {
        console.log(`  Retry count: ${snapshot.context.retryCount}`);
      }
    });

  actor.start();

  // Start conversion
  actor.send({
    type: 'START_CONVERSION',
    legalText: {} as any,
    targetLevel: 'simple',
    targetAudience: 'general',
  });

  // Fast-forward through pipeline
  setTimeout(() => actor.send({ type: 'STRUCTURE_EXTRACTED', structure: {} }), 50);
  setTimeout(() => actor.send({ type: 'CONCEPTS_IDENTIFIED', concepts: [] }), 100);
  setTimeout(() => actor.send({ type: 'TERMS_MAPPED', mappedTerms: {} }), 150);
  setTimeout(() => actor.send({ type: 'VERSIONS_GENERATED', versions: {} }), 200);

  // Fail validation first time
  setTimeout(() => {
    console.log('  ⚠ Validation failed - regenerating...\n');
    actor.send({
      type: 'VALIDATION_FAILED',
      errors: ['Semantic accuracy too low'],
    });
  }, 250);

  // Retry
  setTimeout(() => {
    actor.send({ type: 'RETRY' });
  }, 300);

  setTimeout(() => actor.send({ type: 'VERSIONS_GENERATED', versions: {} }), 350);

  // Pass validation on second attempt
  setTimeout(() => {
    console.log('  ✓ Validation passed on retry!\n');
    actor.send({ type: 'VALIDATION_PASSED' });
    actor.stop();
  }, 400);
}

// Run examples if this file is executed directly
if (require.main === module) {
  runConversionWorkflowExample();

  setTimeout(() => {
    console.log('\n' + '='.repeat(60) + '\n');
    runConversionWithRetryExample();
  }, 1000);
}

export { runConversionWorkflowExample, runConversionWithRetryExample };
