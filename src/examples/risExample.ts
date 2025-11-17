/**
 * Example demonstrating RIS eligibility checking
 */

import { RISUser } from '../modele-metier/risTypes';
import { checkRISEligibility, determineOptimalCategory, compareWithOtherBenefits } from '../regles-eligibilite/risRules';

async function runRISExample() {
  console.log('=== RIS Eligibility Check Examples ===\n');

  // Example 1: Eligible isolated person
  const isolatedPerson: RISUser = {
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

  console.log('Example 1: Isolated person without income');
  console.log('Age: 25, Belgian citizen, No income, Patrimony: 3000€');
  const result1 = await checkRISEligibility(isolatedPerson);
  console.log('Result:', JSON.stringify(result1, null, 2));
  console.log('\n---\n');

  // Example 2: Single parent with child
  const singleParent: RISUser = {
    id: 'user-002',
    age: 28,
    category: 'famille monoparentale',
    residencyStatus: 'belgian-citizen',
    monthlyIncome: 400,
    patrimonyValue: 2000,
    isFullTimeStudent: false,
    childrenInCharge: 1,
    isCurrentlyReceivingRIS: false,
  };

  console.log('Example 2: Single parent with 1 child and partial income');
  console.log('Age: 28, 1 child, Income: 400€/month');
  const result2 = await checkRISEligibility(singleParent);
  console.log('Result:', JSON.stringify(result2, null, 2));

  // Show optimal category suggestion
  const optimal = determineOptimalCategory(singleParent);
  console.log('Optimal category suggestion:', optimal);
  console.log('\n---\n');

  // Example 3: Too young for RIS
  const tooYoung: RISUser = {
    id: 'user-003',
    age: 17,
    category: 'isolé',
    residencyStatus: 'belgian-citizen',
    monthlyIncome: 0,
    patrimonyValue: 1000,
    isFullTimeStudent: false,
    childrenInCharge: 0,
    isCurrentlyReceivingRIS: false,
  };

  console.log('Example 3: Person too young for RIS');
  console.log('Age: 17, Belgian citizen, No income');
  const result3 = await checkRISEligibility(tooYoung);
  console.log('Result:', JSON.stringify(result3, null, 2));
  console.log('\n---\n');

  // Example 4: No valid residency status
  const noStatus: RISUser = {
    id: 'user-004',
    age: 25,
    category: 'isolé',
    residencyStatus: 'no-valid-status',
    monthlyIncome: 0,
    patrimonyValue: 1000,
    isFullTimeStudent: false,
    childrenInCharge: 0,
    isCurrentlyReceivingRIS: false,
  };

  console.log('Example 4: No valid residency status');
  console.log('Age: 25, No valid status, No income');
  const result4 = await checkRISEligibility(noStatus);
  console.log('Result:', JSON.stringify(result4, null, 2));
  console.log('\n---\n');

  // Example 5: Patrimony too high
  const highPatrimony: RISUser = {
    id: 'user-005',
    age: 25,
    category: 'isolé',
    residencyStatus: 'belgian-citizen',
    monthlyIncome: 0,
    patrimonyValue: 15000,
    isFullTimeStudent: false,
    childrenInCharge: 0,
    isCurrentlyReceivingRIS: false,
  };

  console.log('Example 5: Patrimony too high');
  console.log('Age: 25, Belgian citizen, Patrimony: 15000€');
  const result5 = await checkRISEligibility(highPatrimony);
  console.log('Result:', JSON.stringify(result5, null, 2));
  console.log('\n---\n');

  // Example 6: Full-time student
  const student: RISUser = {
    id: 'user-006',
    age: 20,
    category: 'isolé',
    residencyStatus: 'belgian-citizen',
    monthlyIncome: 0,
    patrimonyValue: 1000,
    isFullTimeStudent: true,
    childrenInCharge: 0,
    isCurrentlyReceivingRIS: false,
  };

  console.log('Example 6: Full-time student');
  console.log('Age: 20, Belgian citizen, Full-time student');
  const result6 = await checkRISEligibility(student);
  console.log('Result:', JSON.stringify(result6, null, 2));
  console.log('\n---\n');

  // Example 7: Cohabitant with partial income
  const cohabitant: RISUser = {
    id: 'user-007',
    age: 30,
    category: 'cohabitant',
    residencyStatus: 'belgian-citizen',
    monthlyIncome: 200,
    householdIncome: 500,
    patrimonyValue: 2000,
    isFullTimeStudent: false,
    childrenInCharge: 0,
    isCurrentlyReceivingRIS: false,
  };

  console.log('Example 7: Cohabitant with partial income');
  console.log('Age: 30, Income: 200€, Household income: 500€');
  const result7 = await checkRISEligibility(cohabitant);
  console.log('Result:', JSON.stringify(result7, null, 2));
  console.log('\n---\n');

  // Example 8: Compare with unemployment benefit
  console.log('Example 8: Comparing RIS with unemployment benefit');
  const comparison = compareWithOtherBenefits(1070.49, [
    { type: 'unemployment', amount: 850 },
  ]);
  console.log('RIS amount: 1070.49€');
  console.log('Unemployment amount: 850€');
  console.log('Recommendation:', comparison);
  console.log('\n---\n');

  // Example 9: Person receiving RIS who starts working
  const workingRIS: RISUser = {
    id: 'user-009',
    age: 25,
    category: 'isolé',
    residencyStatus: 'belgian-citizen',
    monthlyIncome: 400, // Work income
    patrimonyValue: 2000,
    isFullTimeStudent: false,
    childrenInCharge: 0,
    isCurrentlyReceivingRIS: true, // Already receiving RIS
  };

  console.log('Example 9: Person receiving RIS who starts working');
  console.log('Age: 25, Work income: 400€, Currently on RIS');
  const result9 = await checkRISEligibility(workingRIS);
  console.log('Result (with work exemption):', JSON.stringify(result9, null, 2));
}

// Run examples if this file is executed directly
if (require.main === module) {
  runRISExample().catch(console.error);
}

export { runRISExample };
