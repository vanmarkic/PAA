/**
 * Example demonstrating the RIS application workflow state machine
 */

import { createActor } from 'xstate';
import { risApplicationMachine } from '../workflows/risMachine';
import { RISUser, PIISContract } from '../domain/risTypes';

function runRISWorkflowExample() {
  console.log('=== RIS Application Workflow Example ===\n');

  // Sample user
  const user: RISUser = {
    id: 'user-001',
    age: 25,
    category: 'isolé',
    residencyStatus: 'belgian-citizen',
    monthlyIncome: 0,
    patrimonyValue: 3000,
    isFullTimeStudent: false,
    childrenInCharge: 0,
    isCurrentlyReceivingRIS: false,
  };

  // Create and start the state machine
  const actor = createActor(risApplicationMachine);

  actor.subscribe((snapshot) => {
    console.log(`State: ${snapshot.value}`);

    if (snapshot.getMeta) {
      const meta = snapshot.getMeta();
      if (meta && meta.description) {
        console.log(`  → ${meta.description}`);
      }
    }

    // Show context at key stages
    if (
      snapshot.value === 'eligible' ||
      snapshot.value === 'active' ||
      snapshot.value === 'complianceWarning'
    ) {
      console.log('Context:', JSON.stringify(snapshot.context, null, 2));
    }

    console.log();
  });

  actor.start();

  console.log('Starting RIS application workflow...\n');

  // 1. Start application
  actor.send({
    type: 'START_APPLICATION',
    user,
  });

  // 2. Eligibility checked - eligible
  setTimeout(() => {
    actor.send({
      type: 'ELIGIBILITY_CHECKED',
      result: {
        isEligible: true,
        category: 'isolé',
        monthlyAmount: 1070.49,
        obligations: [
          'Signer un contrat PIIS',
          'Être disponible pour le marché de l\'emploi',
          'Déclarer toute modification de votre situation',
          'Résider effectivement en Belgique',
        ],
      },
    });
  }, 100);

  // 3. User accepts RIS
  setTimeout(() => {
    console.log('→ User accepts RIS offer\n');
    actor.send({
      type: 'ACCEPT_RIS',
    });
  }, 200);

  // 4. PIIS contract signed
  setTimeout(() => {
    const contract: PIISContract = {
      userId: 'user-001',
      signedAt: new Date(),
      obligations: [
        'Chercher activement un emploi',
        'Se présenter aux convocations du CPAS',
        'Participer aux formations proposées',
      ],
      goals: [
        'Trouver un emploi stable dans les 6 mois',
        'Suivre une formation en informatique',
      ],
      followUpFrequency: 'monthly',
    };

    actor.send({
      type: 'PIIS_SIGNED',
      contract,
    });
  }, 300);

  // 5. Income change (user finds part-time work)
  setTimeout(() => {
    console.log('→ User finds part-time work (400€/month)\n');
    actor.send({
      type: 'INCOME_CHANGE',
      newIncome: 400,
    });
  }, 400);

  // 6. Recalculate RIS with exemption
  setTimeout(() => {
    actor.send({
      type: 'ELIGIBILITY_CHECKED',
      result: {
        isEligible: true,
        category: 'isolé',
        monthlyAmount: 918.49, // Reduced but with exemption applied
        exoneration: {
          workIncome: 400,
          exemptedAmount: 252,
          netIncome: 148,
        },
      },
    });
  }, 500);

  // 7. Compliance check
  setTimeout(() => {
    console.log('→ Regular compliance check\n');
    actor.send({
      type: 'COMPLIANCE_CHECK',
    });
  }, 600);

  // 8. Compliance issue detected
  setTimeout(() => {
    console.log('→ Compliance issue detected!\n');
    actor.send({
      type: 'COMPLIANCE_ISSUE',
      issues: [
        'Revenus non déclarés détectés',
        'Absence à une convocation du CPAS',
      ],
    });
  }, 700);

  // 9. Issue resolved
  setTimeout(() => {
    console.log('→ User resolves compliance issues\n');
    actor.send({
      type: 'ISSUE_RESOLVED',
    });

    console.log('✓ RIS application workflow completed successfully!\n');
    console.log('Final state: User is receiving RIS with partial work income\n');

    // Stop the actor
    actor.stop();
  }, 800);
}

// Example of ineligible scenario
function runRISIneligibleExample() {
  console.log('=== RIS Ineligible Workflow Example ===\n');

  const tooYoungUser: RISUser = {
    id: 'user-002',
    age: 17,
    category: 'isolé',
    residencyStatus: 'belgian-citizen',
    monthlyIncome: 0,
    patrimonyValue: 1000,
    isFullTimeStudent: false,
    childrenInCharge: 0,
    isCurrentlyReceivingRIS: false,
  };

  const actor = createActor(risApplicationMachine);

  actor.subscribe((snapshot: any) => {
    console.log(`State: ${snapshot.value}`);
    if (snapshot.context.eligibilityResult?.reason) {
      console.log(`  Reason: ${snapshot.context.eligibilityResult.reason}`);
    }
  });

  actor.start();

  // Start application
  actor.send({
    type: 'START_APPLICATION',
    user: tooYoungUser,
  });

  // Check eligibility - ineligible due to age
  setTimeout(() => {
    actor.send({
      type: 'ELIGIBILITY_CHECKED',
      result: {
        isEligible: false,
        reason: 'âge minimum non atteint (18 ans requis)',
      },
    });

    console.log('\n→ User is ineligible for RIS');
    console.log('Suggestion: Apply again when you turn 18\n');

    actor.stop();
  }, 100);
}

// Run examples if this file is executed directly
if (require.main === module) {
  runRISWorkflowExample();

  setTimeout(() => {
    console.log('\n' + '='.repeat(60) + '\n');
    runRISIneligibleExample();
  }, 1200);
}

export { runRISWorkflowExample, runRISIneligibleExample };
