/**
 * Example demonstrating AGR eligibility checking
 */

import { User } from '../modele-metier/types';
import { checkAGREligibility } from '../regles-eligibilite/agrRules';

async function runAGRExample() {
  console.log('=== AGR Eligibility Check Examples ===\n');

  // Example 1: Eligible user
  const eligibleUser: User = {
    id: 'user-001',
    employmentStatus: 'part-time',
    monthlySalaryGross: 1200,
    workingHoursPerWeek: 24,
    hasRightsMaintenance: true,
    currentBenefits: [],
  };

  console.log('Example 1: Part-time worker with rights maintenance');
  console.log('Salary: 1200€, Hours: 24h/week');
  const result1 = await checkAGREligibility(eligibleUser);
  console.log('Result:', JSON.stringify(result1, null, 2));
  console.log('\n---\n');

  // Example 2: Salary too high
  const highSalaryUser: User = {
    id: 'user-002',
    employmentStatus: 'part-time',
    monthlySalaryGross: 1700,
    workingHoursPerWeek: 32,
    hasRightsMaintenance: true,
    currentBenefits: [],
  };

  console.log('Example 2: Part-time worker with salary above minimum');
  console.log('Salary: 1700€, Hours: 32h/week');
  const result2 = await checkAGREligibility(highSalaryUser);
  console.log('Result:', JSON.stringify(result2, null, 2));
  console.log('\n---\n');

  // Example 3: No rights maintenance
  const noRightsUser: User = {
    id: 'user-003',
    employmentStatus: 'part-time',
    monthlySalaryGross: 1200,
    workingHoursPerWeek: 20,
    hasRightsMaintenance: false,
    currentBenefits: [],
  };

  console.log('Example 3: Part-time worker without rights maintenance');
  console.log('Salary: 1200€, Hours: 20h/week, No rights maintenance');
  const result3 = await checkAGREligibility(noRightsUser);
  console.log('Result:', JSON.stringify(result3, null, 2));
  console.log('\n---\n');

  // Example 4: Incompatible with unemployment
  const unemploymentUser: User = {
    id: 'user-004',
    employmentStatus: 'part-time',
    monthlySalaryGross: 1200,
    workingHoursPerWeek: 20,
    hasRightsMaintenance: true,
    currentBenefits: [
      {
        id: 'benefit-001',
        type: 'unemployment',
        amount: 800,
        conditions: [],
        compatibleWith: [],
        incompatibleWith: ['agr'],
      },
    ],
  };

  console.log('Example 4: Part-time worker already receiving unemployment');
  console.log('Salary: 1200€, Hours: 20h/week, Receiving unemployment');
  const result4 = await checkAGREligibility(unemploymentUser);
  console.log('Result:', JSON.stringify(result4, null, 2));
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAGRExample().catch(console.error);
}

export { runAGRExample };
