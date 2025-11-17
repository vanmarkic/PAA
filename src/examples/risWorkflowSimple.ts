/**
 * Simplified RIS application workflow demonstration
 * (without XState complexity for POC purposes)
 */

import { RISUser, PIISContract, RISEligibilityResult } from '../modele-metier/risTypes';
import { checkRISEligibility } from '../regles-eligibilite/risRules';

/**
 * Simple state machine representation showing the workflow
 */
type RISWorkflowState =
  | 'idle'
  | 'checkingEligibility'
  | 'eligible'
  | 'ineligible'
  | 'declined'
  | 'creatingPIIS'
  | 'active'
  | 'recalculating'
  | 'checkingCompliance'
  | 'complianceWarning'
  | 'terminated';

async function runRISWorkflow() {
  console.log('=== RIS Application Workflow (Simplified) ===\n');

  let state: RISWorkflowState = 'idle';
  let eligibilityResult: RISEligibilityResult | null = null;
  let piisContract: PIISContract | null = null;

  // 1. START APPLICATION
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

  console.log(`[${state}] → Application started`);
  console.log(`User: ${user.age} years old, ${user.category}, ${user.residencyStatus}\n`);

  // 2. CHECK ELIGIBILITY
  state = 'checkingEligibility';
  console.log(`[${state}] → Checking eligibility criteria...`);
  eligibilityResult = await checkRISEligibility(user);

  if (eligibilityResult.isEligible) {
    state = 'eligible';
    console.log(`[${state}] ✓ User is eligible for RIS`);
    console.log(`  Amount: ${eligibilityResult.monthlyAmount}€`);
    console.log(`  Category: ${eligibilityResult.category}`);
    console.log(`  Obligations:`);
    eligibilityResult.obligations?.forEach((o) => console.log(`    - ${o}`));
    console.log();
  } else {
    state = 'ineligible';
    console.log(`[${state}] ✗ User is NOT eligible`);
    console.log(`  Reason: ${eligibilityResult.reason}\n`);
    return; // End workflow
  }

  // 3. USER ACCEPTS RIS
  console.log(`→ User accepts RIS offer\n`);

  // 4. CREATE PIIS CONTRACT
  state = 'creatingPIIS';
  console.log(`[${state}] → Creating PIIS contract...`);
  piisContract = {
    userId: user.id,
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
  console.log(`  Contract signed: ${piisContract.signedAt.toLocaleDateString()}`);
  console.log(`  Goals: ${piisContract.goals.join(', ')}`);
  console.log();

  // 5. RIS IS ACTIVE
  state = 'active';
  console.log(`[${state}] ✓ RIS is now active`);
  console.log(`  Monthly payment: ${eligibilityResult.monthlyAmount}€\n`);

  // 6. INCOME CHANGE (User finds part-time work)
  console.log(`→ Income change: User finds part-time work (400€/month)\n`);
  state = 'recalculating';
  console.log(`[${state}] → Recalculating RIS with work income...`);

  user.monthlyIncome = 400;
  user.isCurrentlyReceivingRIS = true;
  eligibilityResult = await checkRISEligibility(user);

  console.log(`  New RIS amount: ${eligibilityResult.monthlyAmount}€`);
  if (eligibilityResult.exoneration) {
    console.log(`  Work income: ${eligibilityResult.exoneration.workIncome}€`);
    console.log(`  Exempted amount: ${eligibilityResult.exoneration.exemptedAmount}€`);
    console.log(`  Net income counted: ${eligibilityResult.exoneration.netIncome}€`);
  }
  console.log();

  state = 'active';
  console.log(`[${state}] ✓ RIS recalculated, still active\n`);

  // 7. COMPLIANCE CHECK
  state = 'checkingCompliance';
  console.log(`[${state}] → Regular compliance check...`);
  const complianceOK = Math.random() > 0.5; // Simulate check

  if (complianceOK) {
    console.log(`  ✓ Compliance check passed\n`);
    state = 'active';
  } else {
    state = 'complianceWarning';
    console.log(`  ⚠ Compliance issues detected:`);
    console.log(`    - Absence à une convocation du CPAS`);
    console.log(`    - Revenus non déclarés\n`);

    console.log(`→ User resolves compliance issues\n`);
    state = 'active';
    console.log(`[${state}] ✓ Issues resolved, RIS continues\n`);
  }

  // 8. FINAL STATE
  console.log('=== Workflow Summary ===');
  console.log(`Final state: ${state}`);
  console.log(`Monthly RIS: ${eligibilityResult.monthlyAmount}€`);
  console.log(`Work income: ${user.monthlyIncome}€`);
  console.log(`Total monthly: ${(eligibilityResult.monthlyAmount || 0) + user.monthlyIncome}€`);
  console.log('\n✓ RIS workflow completed successfully!\n');
}

/**
 * Example of ineligible user workflow
 */
async function runIneligibleWorkflow() {
  console.log('=== RIS Ineligible Workflow ===\n');

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

  console.log(`[idle] → Application started`);
  console.log(`User: ${tooYoungUser.age} years old\n`);

  console.log(`[checkingEligibility] → Checking eligibility...`);
  const result = await checkRISEligibility(tooYoungUser);

  console.log(`[ineligible] ✗ User is NOT eligible`);
  console.log(`  Reason: ${result.reason}`);
  console.log(`  Suggestion: Apply again when you turn 18\n`);
}

/**
 * State transition diagram (ASCII art)
 */
function printStateDiagram() {
  console.log('=== RIS Application State Machine ===\n');
  console.log(`
    idle
      ↓ (START_APPLICATION)
    checkingEligibility
      ↓               ↓
  (eligible)    (ineligible) → [END]
      ↓
    eligible
      ↓ (ACCEPT)    ↓ (DECLINE)
      ↓             declined → [END]
      ↓
    creatingPIIS
      ↓ (PIIS_SIGNED)
    active ←─────┐
      ↓          │
  (INCOME_CHANGE)│
      ↓          │
    recalculating
      ├─────────→┘
      ↓
  (COMPLIANCE_CHECK)
      ↓
    checkingCompliance
      ↓           ↓
    (OK)      (ISSUE)
      ↓           ↓
    active   complianceWarning
                  ↓
            (RESOLVED)
                  ↓
                active
  `);
  console.log();
}

// Run examples if this file is executed directly
if (require.main === module) {
  (async () => {
    await runRISWorkflow();

    console.log('\n' + '='.repeat(60) + '\n');

    await runIneligibleWorkflow();

    console.log('\n' + '='.repeat(60) + '\n');

    printStateDiagram();
  })();
}

export { runRISWorkflow, runIneligibleWorkflow };
