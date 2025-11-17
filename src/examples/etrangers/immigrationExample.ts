#!/usr/bin/env ts-node

/**
 * Example: Immigration and Foreigners' Rights Procedures
 *
 * This example demonstrates various immigration procedures including:
 * - Residence permit applications
 * - Family reunification
 * - Asylum applications
 * - Work permits
 * - Naturalization
 *
 * Run with: npx ts-node src/examples/etrangers/immigrationExample.ts
 */

import {
  ForeignerProfile,
  ResidencePermitApplication,
  FamilyReunificationApplication,
  AsylumApplication,
  Nationality,
  ResidenceStatus,
} from '../../domain/etrangersTypes';

import {
  checkResidencePermitEligibility,
  RESIDENCE_PERMIT_RULES_JSON,
} from '../../rules/etrangers/residencePermitRules';

import {
  checkFamilyReunificationEligibility,
  FAMILY_REUNIFICATION_RULES_JSON,
} from '../../rules/etrangers/familyReunificationRules';

import {
  checkAsylumEligibility,
  ASYLUM_RULES_JSON,
} from '../../rules/etrangers/asylumRules';

import { interpret } from 'xstate';
import { residencePermitMachine } from '../../workflows/etrangers/residencePermitMachine';
import { asylumApplicationMachine } from '../../workflows/etrangers/asylumApplicationMachine';

// ANSI color codes for better console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function printHeader(title: string) {
  console.log('\n' + '='.repeat(80));
  console.log(colors.bright + colors.blue + title.toUpperCase() + colors.reset);
  console.log('='.repeat(80));
}

function printSubHeader(title: string) {
  console.log('\n' + colors.bright + colors.cyan + '📋 ' + title + colors.reset);
  console.log('-'.repeat(60));
}

function printResult(label: string, value: any, indent = 0) {
  const indentation = '  '.repeat(indent);
  if (typeof value === 'boolean') {
    const color = value ? colors.green : colors.red;
    console.log(`${indentation}${label}: ${color}${value}${colors.reset}`);
  } else if (typeof value === 'object' && value !== null) {
    console.log(`${indentation}${colors.yellow}${label}:${colors.reset}`);
    Object.entries(value).forEach(([key, val]) => {
      printResult(key, val, indent + 1);
    });
  } else {
    console.log(`${indentation}${label}: ${colors.magenta}${value}${colors.reset}`);
  }
}

// ==================== TEST PROFILES ====================

const studentProfile: ForeignerProfile = {
  id: 'student-001',
  firstName: 'Ahmed',
  lastName: 'Hassan',
  dateOfBirth: new Date('2000-03-15'),
  nationality: 'third-country' as Nationality,
  countryOfOrigin: 'Morocco',
  gender: 'M',
  currentResidenceStatus: 'long-stay' as ResidenceStatus,
  dateOfEntry: new Date('2023-09-01'),
  purposeOfStay: 'Higher education - Master in Computer Science',
  currentAddress: {
    street: 'Rue de la Loi',
    number: '42',
    postalCode: '1000',
    city: 'Bruxelles',
    country: 'Belgium',
  },
  registeredMunicipality: 'Bruxelles',
  maritalStatus: 'single',
  familyMembers: [],
  employmentStatus: 'student',
  monthlyIncome: 750,
  hasFinancialSupport: true,
  financialGuarantor: {
    type: 'individual',
    name: 'Hassan Family',
    monthlyIncome: 3000,
    engagementDocument: 'Annexe 32',
  },
  languageSkills: [
    { language: 'french', level: 'B1', certificateDate: new Date('2023-06-15') },
  ],
  integrationCourseCompleted: false,
  hasConvictions: false,
  hasPublicOrderIssues: false,
  hasOQT: false,
  hasEntryBan: false,
  passport: {
    number: 'MA1234567',
    issuedBy: 'Morocco',
    issuedDate: new Date('2020-01-15'),
    expiryDate: new Date('2030-01-15'),
    type: 'ordinary',
  },
  documents: [
    {
      type: 'visa-d',
      reference: 'BE2023/STU/001',
      issuedDate: new Date('2023-08-15'),
      expiryDate: new Date('2024-08-15'),
      verified: true,
    },
  ],
};

const refugeeProfile: ForeignerProfile = {
  id: 'refugee-001',
  firstName: 'Amina',
  lastName: 'Khalil',
  dateOfBirth: new Date('1992-07-20'),
  nationality: 'third-country' as Nationality,
  countryOfOrigin: 'Syria',
  gender: 'F',
  currentResidenceStatus: 'awaiting-decision' as ResidenceStatus,
  dateOfEntry: new Date('2024-01-15'),
  purposeOfStay: 'Seeking international protection',
  maritalStatus: 'married',
  familyMembers: [
    {
      relationship: 'spouse',
      firstName: 'Omar',
      lastName: 'Khalil',
      dateOfBirth: new Date('1990-03-10'),
      nationality: 'third-country' as Nationality,
      livingTogether: false,
      financiallyDependent: false,
    },
    {
      relationship: 'minor-child',
      firstName: 'Sara',
      lastName: 'Khalil',
      dateOfBirth: new Date('2018-11-25'),
      nationality: 'third-country' as Nationality,
      livingTogether: true,
      financiallyDependent: true,
    },
  ],
  employmentStatus: 'unemployed',
  monthlyIncome: 0,
  hasFinancialSupport: false,
  languageSkills: [],
  integrationCourseCompleted: false,
  hasConvictions: false,
  hasPublicOrderIssues: false,
  hasOQT: false,
  hasEntryBan: false,
  documents: [],
};

const euCitizenProfile: ForeignerProfile = {
  id: 'eu-001',
  firstName: 'Maria',
  lastName: 'Rodriguez',
  dateOfBirth: new Date('1985-04-10'),
  nationality: 'eu-citizen' as Nationality,
  countryOfOrigin: 'Spain',
  gender: 'F',
  currentResidenceStatus: 'eu-citizen-registration' as ResidenceStatus,
  currentCardType: 'E',
  cardExpiryDate: new Date('2029-04-10'),
  nationalRegisterNumber: '85.04.10-123.45',
  dateOfEntry: new Date('2022-03-01'),
  purposeOfStay: 'Employment',
  currentAddress: {
    street: 'Avenue Louise',
    number: '200',
    postalCode: '1050',
    city: 'Ixelles',
    country: 'Belgium',
  },
  registeredMunicipality: 'Ixelles',
  maritalStatus: 'married',
  familyMembers: [
    {
      relationship: 'spouse',
      firstName: 'Carlos',
      lastName: 'Rodriguez',
      dateOfBirth: new Date('1983-08-22'),
      nationality: 'third-country' as Nationality,
      residenceStatus: 'no-status' as ResidenceStatus,
      livingTogether: true,
      financiallyDependent: false,
    },
  ],
  employmentStatus: 'employed',
  monthlyIncome: 3500,
  hasFinancialSupport: false,
  languageSkills: [
    { language: 'french', level: 'B2' },
    { language: 'dutch', level: 'A2' },
  ],
  integrationCourseCompleted: true,
  hasConvictions: false,
  hasPublicOrderIssues: false,
  hasOQT: false,
  hasEntryBan: false,
  passport: {
    number: 'ES9876543',
    issuedBy: 'Spain',
    issuedDate: new Date('2019-06-01'),
    expiryDate: new Date('2029-06-01'),
    type: 'ordinary',
  },
  documents: [],
};

// ==================== EXAMPLE 1: RESIDENCE PERMIT ====================

async function exampleResidencePermit() {
  printHeader('Example 1: Student Residence Permit (Card A)');

  const application: ResidencePermitApplication = {
    applicationType: 'new',
    requestedCardType: 'A',
    basisForResidence: 'Higher education',
    municipality: 'Bruxelles',
    supportingDocuments: [
      'University enrollment certificate',
      'Proof of sufficient means (730€/month)',
      'Health insurance',
      'Housing proof',
      'Valid visa D',
    ],
    fees: {
      baseFee: 180,
      additionalFees: 20,
      totalFee: 200,
      paid: false,
    },
    status: {
      stage: 'preparation',
      lastUpdate: new Date(),
      nextAction: 'Submit documents to municipality',
    },
  };

  printSubHeader('Applicant Profile');
  printResult('Name', `${studentProfile.firstName} ${studentProfile.lastName}`);
  printResult('Nationality', studentProfile.countryOfOrigin);
  printResult('Purpose', studentProfile.purposeOfStay);
  printResult('Monthly Income', `€${studentProfile.monthlyIncome}`);

  printSubHeader('Checking Eligibility');
  const eligibility = await checkResidencePermitEligibility(studentProfile, application);

  printResult('Eligible', eligibility.isEligible);
  if (eligibility.requirements) {
    console.log('\n' + colors.yellow + 'Requirements:' + colors.reset);
    eligibility.requirements.forEach((req) => {
      const status = req.met ? '✅' : '❌';
      console.log(`  ${status} ${req.requirement}`);
      if (req.documents) {
        req.documents.forEach((doc) => {
          console.log(`     📄 ${doc}`);
        });
      }
    });
  }

  if (eligibility.fees) {
    printSubHeader('Fees');
    printResult('Base Fee', `€${eligibility.fees.baseFee}`);
    printResult('Additional Fees', `€${eligibility.fees.additionalFees || 0}`);
    printResult('Total', `€${eligibility.fees.totalFee}`);
  }

  printSubHeader('Processing Time');
  printResult('Estimated Days', eligibility.estimatedProcessingTime);

  // Test workflow
  printSubHeader('Testing Workflow State Machine');
  const service = interpret(residencePermitMachine);

  service.subscribe((state) => {
    console.log(`  State: ${colors.cyan}${state.value}${colors.reset}`);
    if (state.context.currentStep) {
      console.log(`  Step: ${state.context.currentStep}`);
    }
  });

  service.start();
  service.send({ type: 'START_APPLICATION', applicant: studentProfile, application });
  service.send({ type: 'SUBMIT_DOCUMENTS', documents: application.supportingDocuments });
  service.send({ type: 'DOCUMENTS_VALIDATED' });
  service.stop();
}

// ==================== EXAMPLE 2: FAMILY REUNIFICATION ====================

async function exampleFamilyReunification() {
  printHeader('Example 2: Family Reunification (EU Citizen Spouse)');

  const application: FamilyReunificationApplication = {
    sponsor: euCitizenProfile,
    applicant: {
      id: 'family-001',
      firstName: 'Carlos',
      lastName: 'Rodriguez',
      dateOfBirth: new Date('1983-08-22'),
      nationality: 'third-country' as Nationality,
      countryOfOrigin: 'Peru',
      gender: 'M',
      currentResidenceStatus: 'no-status' as ResidenceStatus,
      dateOfEntry: new Date('2024-06-15'),
      purposeOfStay: 'Family reunification with EU citizen spouse',
      currentAddress: euCitizenProfile.currentAddress,
      maritalStatus: 'married',
      familyMembers: [],
      employmentStatus: 'unemployed',
      monthlyIncome: 0,
      hasFinancialSupport: true,
      languageSkills: [{ language: 'french', level: 'A2' }],
      integrationCourseCompleted: false,
      hasConvictions: false,
      hasPublicOrderIssues: false,
      hasOQT: false,
      hasEntryBan: false,
      documents: [],
    } as ForeignerProfile,
    relationship: 'spouse',
    proofOfRelationship: [
      'marriage-certificate',
      'cohabitation-proof',
      'joint-bank-account',
    ],
    housingProof: {
      type: 'rental',
      surface: 85,
      rooms: 2,
      conformityCertificate: 'Yes',
      rentAmount: 1200,
    },
    incomeProof: {
      type: 'employment',
      monthlyAmount: 3500,
      stability: 'permanent',
      documents: ['Work contract', 'Pay slips last 3 months'],
    },
    healthInsurance: {
      provider: 'Mutualité Chrétienne',
      coverage: 'comprehensive',
      familyMembers: ['Carlos Rodriguez'],
      validUntil: new Date('2025-12-31'),
    },
    status: {
      stage: 'preparation',
      lastUpdate: new Date(),
      nextAction: 'Submit visa application at consulate',
    },
  };

  printSubHeader('Sponsor Information');
  printResult('Name', `${euCitizenProfile.firstName} ${euCitizenProfile.lastName}`);
  printResult('Status', 'EU Citizen with Card E');
  printResult('Income', `€${euCitizenProfile.monthlyIncome}/month`);

  printSubHeader('Applicant Information');
  printResult('Name', `${application.applicant.firstName} ${application.applicant.lastName}`);
  printResult('Relationship', application.relationship);
  printResult('Current Status', application.applicant.currentResidenceStatus);

  printSubHeader('Checking Family Reunification Eligibility');
  const eligibility = await checkFamilyReunificationEligibility(application);

  printResult('Eligible', eligibility.isEligible);

  if (eligibility.warnings) {
    console.log('\n' + colors.yellow + '⚠️  Warnings:' + colors.reset);
    eligibility.warnings.forEach((warning) => {
      console.log(`  • ${warning}`);
    });
  }

  if (eligibility.nextSteps) {
    console.log('\n' + colors.green + '📌 Next Steps:' + colors.reset);
    eligibility.nextSteps.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step}`);
    });
  }

  printResult('\nEstimated Processing Time', `${eligibility.estimatedProcessingTime} days`);
}

// ==================== EXAMPLE 3: ASYLUM APPLICATION ====================

async function exampleAsylumApplication() {
  printHeader('Example 3: Asylum Application');

  const asylumApp: AsylumApplication = {
    applicationType: 'first-time',
    fearOfPersecution: 'Political persecution due to opposition activities',
    countryOfPersecution: 'Syria',
    vulnerabilities: ['torture', 'mental-health'],
    languagePreference: 'french',
    legalAid: true,
    fedasilAccommodation: true,
    status: 'application-submitted',
  };

  printSubHeader('Applicant Information');
  printResult('Name', `${refugeeProfile.firstName} ${refugeeProfile.lastName}`);
  printResult('Country of Origin', refugeeProfile.countryOfOrigin);
  printResult('Family Members', refugeeProfile.familyMembers.length);

  printSubHeader('Asylum Application Details');
  printResult('Type', asylumApp.applicationType);
  printResult('Fear of Persecution', asylumApp.fearOfPersecution);
  printResult('Vulnerabilities', asylumApp.vulnerabilities.join(', '));

  printSubHeader('Checking Asylum Eligibility');
  const eligibility = await checkAsylumEligibility(refugeeProfile, asylumApp);

  printResult('Eligible for Protection', eligibility.isEligible);

  if (eligibility.warnings) {
    console.log('\n' + colors.yellow + '⚠️  Special Procedures:' + colors.reset);
    eligibility.warnings.forEach((warning) => {
      console.log(`  • ${warning}`);
    });
  }

  // Test asylum workflow
  printSubHeader('Testing Asylum Workflow');
  const asylumService = interpret(asylumApplicationMachine);

  asylumService.subscribe((state) => {
    console.log(`  State: ${colors.cyan}${state.value}${colors.reset}`);
    if (state.context.currentPhase) {
      console.log(`  Phase: ${state.context.currentPhase}`);
    }
  });

  asylumService.start();
  asylumService.send({ type: 'START_APPLICATION', applicant: refugeeProfile, application: asylumApp });
  asylumService.send({ type: 'REGISTER_AT_OE' });
  asylumService.send({
    type: 'DUBLIN_CHECK_COMPLETE',
    result: { isDublinCase: false },
  });
  asylumService.stop();
}

// ==================== EXAMPLE 4: LEGAL FRAMEWORK ====================

function exampleLegalFramework() {
  printHeader('Example 4: Legal Framework Information');

  printSubHeader('Residence Permit Legal Framework');
  console.log(colors.cyan + 'Primary Legislation:' + colors.reset);
  console.log(`  • ${RESIDENCE_PERMIT_RULES_JSON.legalFramework.primaryLaw.title}`);
  console.log(`    ${RESIDENCE_PERMIT_RULES_JSON.legalFramework.primaryLaw.url}`);

  printSubHeader('Card Types and Fees');
  Object.entries(RESIDENCE_PERMIT_RULES_JSON.cardTypes).forEach(([type, description]) => {
    const fee = RESIDENCE_PERMIT_RULES_JSON.fees[`CARD_${type}_NEW` as keyof typeof RESIDENCE_PERMIT_RULES_JSON.fees];
    console.log(`  • Card ${type}: ${description} (€${fee})`);
  });

  printSubHeader('Family Reunification Legal Framework');
  console.log(colors.cyan + 'Income Requirements:' + colors.reset);
  console.log(`  • Standard: €${FAMILY_REUNIFICATION_RULES_JSON.incomeRequirements.standard}/month`);
  console.log(`  • Exemptions: ${FAMILY_REUNIFICATION_RULES_JSON.incomeRequirements.exemptions.join(', ')}`);

  printSubHeader('Asylum Legal Framework');
  console.log(colors.cyan + 'International Conventions:' + colors.reset);
  console.log(`  • ${ASYLUM_RULES_JSON.legalFramework.international.genevaConvention}`);
  console.log(`  • ${ASYLUM_RULES_JSON.legalFramework.international.protocol1967}`);

  console.log('\n' + colors.cyan + 'Belgian Authorities:' + colors.reset);
  Object.entries(ASYLUM_RULES_JSON.authorities).forEach(([key, description]) => {
    console.log(`  • ${key}: ${description}`);
  });
}

// ==================== MAIN EXECUTION ====================

async function main() {
  console.log(colors.bright + colors.magenta);
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║           IMMIGRATION & FOREIGNERS\' RIGHTS PROCEDURES EXAMPLES            ║');
  console.log('║                         Belgian Immigration System                         ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log(colors.reset);

  try {
    await exampleResidencePermit();
    await exampleFamilyReunification();
    await exampleAsylumApplication();
    exampleLegalFramework();

    console.log('\n' + colors.bright + colors.green);
    console.log('✅ All examples completed successfully!');
    console.log(colors.reset);

    console.log('\n' + colors.yellow + 'Summary:' + colors.reset);
    console.log('  • Residence Permit: Card A for students');
    console.log('  • Family Reunification: EU citizen spouse');
    console.log('  • Asylum: Protection procedures');
    console.log('  • Legal Framework: Belgian immigration law');
  } catch (error) {
    console.error(colors.red + '❌ Error running examples:' + colors.reset, error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}