/**
 * Example: ECHR Individual Application Process
 *
 * This example demonstrates the complete workflow of filing an individual
 * application to the European Court of Human Rights, including admissibility
 * checks, interim measures, and potential outcomes.
 */

import { interpret } from 'xstate';
import {
  ECHRApplication,
  ECHRApplicant,
  ViolationClaim,
  DomesticRemedy,
  InterimMeasure,
  ApplicationStatus,
  ViolationType,
  ApplicationType,
  AdmissibilityAssessment
} from '../../domain/courEuropeenneTypes';
import { echrApplicationMachine } from '../../workflows/cour-europeenne/applicationMachine';
import { checkAdmissibility, quickAdmissibilityCheck } from '../../rules/cour-europeenne/admissibilityRules';
import { checkInterimMeasuresEligibility } from '../../rules/cour-europeenne/interimMeasuresRules';
import { assessUrgency } from '../../workflows/cour-europeenne/interimMeasuresMachine';

/**
 * Example 1: Standard Individual Application - Article 6 Violation
 */
async function exampleFairTrialApplication() {
  console.log('\n=== EXAMPLE 1: Fair Trial Violation (Article 6) ===\n');

  // Create applicant
  const applicant: ECHRApplicant = {
    id: 'APP-001',
    type: 'individual',
    name: 'Jean Dupont',
    dateOfBirth: new Date('1975-06-15'),
    nationality: 'BE',
    address: '123 Rue de la Loi, 1000 Brussels, Belgium',
    email: 'jean.dupont@example.com',
    phone: '+32 2 123 4567',
    hasLegalRepresentative: true,
    legalRepresentative: {
      name: 'Maître Sophie Martin',
      barAssociation: 'Brussels Bar',
      address: '45 Avenue Louise, 1050 Brussels',
      email: 'sophie.martin@law.be',
      phone: '+32 2 987 6543',
      powerOfAttorney: true,
      powerOfAttorneyDate: new Date('2024-10-01'),
    },
    isAnonymous: false,
    anonymityRequested: false,
    victimStatus: {
      isDirectVictim: true,
      isIndirectVictim: false,
      isPotentialVictim: false,
      harmDescription: 'Denied fair trial - proceedings lasted 8 years without justification',
      significantDisadvantage: {
        financialImpact: 25000,
        nonPecuniaryDamage: 'Severe stress and reputational damage',
        principleAtStake: 'Right to trial within reasonable time',
      },
    },
  };

  // Create violation claim
  const violationClaim: ViolationClaim = {
    article: 'article-6' as ViolationType,
    description: 'Excessive length of proceedings - 8 years for simple civil case',
    legalArguments: [
      'The proceedings lasted 8 years without any complexity justifying such delay',
      'Multiple unjustified postponements by the court',
      'No effective remedy available to expedite proceedings',
    ],
    evidence: [
      {
        type: 'document',
        description: 'Court file showing timeline of proceedings',
        date: new Date('2024-09-01'),
        source: 'Brussels Court of First Instance',
        reliability: 'high',
      },
      {
        type: 'document',
        description: 'Letters requesting expedition of case',
        date: new Date('2022-03-15'),
        source: 'Applicant\'s lawyer',
        reliability: 'high',
      },
    ],
    caseReferences: [
      {
        caseName: 'Kudła v. Poland',
        applicationNumber: '30210/96',
        judgmentDate: new Date('2000-10-26'),
        relevantParagraphs: ['§§ 123-124', '§ 156'],
        grandChamber: true,
      },
    ],
    violationPeriod: {
      start: new Date('2016-03-01'),
      end: new Date('2024-03-01'),
      ongoing: false,
    },
  };

  // Create domestic remedies
  const domesticRemedies: DomesticRemedy[] = [
    {
      courtName: 'Brussels Court of First Instance',
      caseNumber: '2016/CV/1234',
      dateInitiated: new Date('2016-03-01'),
      dateDecided: new Date('2024-03-01'),
      outcome: 'partially-successful',
      reasonsGiven: 'Case decided but no acknowledgment of delay',
      appealed: true,
      finalDecision: false,
    },
    {
      courtName: 'Brussels Court of Appeal',
      caseNumber: '2024/AR/567',
      dateInitiated: new Date('2024-03-15'),
      dateDecided: new Date('2024-09-01'),
      outcome: 'rejected',
      reasonsGiven: 'Appeal rejected - delay not considered excessive',
      appealed: false,
      finalDecision: true,
    },
  ];

  // Create application
  const application: ECHRApplication = {
    applicants: [applicant],
    respondentState: 'BE',
    type: 'individual' as ApplicationType,
    status: 'draft' as ApplicationStatus,
    dateSubmitted: new Date('2024-11-15'),
    dateFinalDomesticDecision: new Date('2024-09-01'),
    violations: [violationClaim],
    facts: {
      summary: 'Simple civil dispute took 8 years to resolve due to court delays',
      detailedFacts: [
        'March 2016: Civil proceedings initiated for contract dispute',
        'Multiple postponements between 2016-2020 without justification',
        'COVID-19 delays 2020-2021 (partially justified)',
        'Continued delays 2021-2024 without explanation',
        'Final judgment March 2024 after 8 years',
      ],
      chronology: [
        {
          date: new Date('2016-03-01'),
          description: 'Proceedings initiated',
          relevantToViolation: ['article-6' as ViolationType],
        },
        {
          date: new Date('2024-03-01'),
          description: 'First instance judgment',
          relevantToViolation: ['article-6' as ViolationType],
        },
      ],
      context: 'Belgian judicial system experiencing chronic delays',
    },
    domesticRemedies,
    interimMeasuresRequested: false,
    justSatisfaction: {
      pecuniaryDamage: {
        amount: 25000,
        currency: 'EUR',
        calculation: 'Lost business opportunities due to legal uncertainty',
        evidence: [],
      },
      nonPecuniaryDamage: {
        amount: 15000,
        currency: 'EUR',
        justification: 'Stress and anxiety caused by excessive delay',
        comparableCases: [],
      },
      costsAndExpenses: {
        legalFees: 12000,
        expertFees: 3000,
        translationCosts: 1000,
        currency: 'EUR',
        receipts: [],
      },
    },
    documents: [
      {
        type: 'application-form',
        title: 'ECHR Application Form',
        date: new Date('2024-11-15'),
        language: 'EN',
        pages: 40,
      },
      {
        type: 'power-of-attorney',
        title: 'Power of Attorney',
        date: new Date('2024-10-01'),
        language: 'FR',
        pages: 2,
        translation: {
          language: 'EN',
          certified: true,
        },
      },
    ],
    languageOfProceedings: 'EN',
    priorityRequested: false,
  };

  // Check admissibility
  console.log('1. Quick Admissibility Check:');
  const quickCheck = quickAdmissibilityCheck(
    application.dateFinalDomesticDecision!,
    true,
    true
  );
  console.log(`   - Likely admissible: ${quickCheck.likely}`);
  if (quickCheck.issues.length > 0) {
    console.log(`   - Issues: ${quickCheck.issues.join(', ')}`);
  }

  console.log('\n2. Detailed Admissibility Assessment:');
  const admissibility = await checkAdmissibility(application);
  console.log(`   - Overall admissible: ${admissibility.overallAdmissible}`);
  console.log(`   - Case strength: ${admissibility.caseStrength}`);
  if (admissibility.recommendations.length > 0) {
    console.log(`   - Recommendations:`);
    admissibility.recommendations.forEach(r => console.log(`     • ${r}`));
  }

  // Start workflow
  console.log('\n3. Starting Application Workflow:');
  const service = interpret(echrApplicationMachine);

  service.subscribe((state) => {
    console.log(`   → State: ${state.value}`);
    if (state.context.errors.length > 0) {
      console.log(`     Errors: ${state.context.errors.join(', ')}`);
    }
  });

  service.start();
  service.send({ type: 'START_APPLICATION', application });
  service.send({ type: 'SUBMIT_APPLICATION' });

  console.log('\n4. Expected Timeline:');
  console.log('   - Allocation: 1-2 weeks');
  console.log('   - Admissibility decision: 6-12 months');
  console.log('   - If admissible, merits examination: 2-3 years');
  console.log('   - Total expected duration: 3-4 years');
}

/**
 * Example 2: Urgent Application with Interim Measures - Article 3
 */
async function exampleExpulsionWithInterimMeasures() {
  console.log('\n=== EXAMPLE 2: Expulsion with Risk of Torture (Article 3) ===\n');

  // Create applicant facing expulsion
  const applicant: ECHRApplicant = {
    id: 'APP-002',
    type: 'individual',
    name: 'Ahmed Hassan',
    dateOfBirth: new Date('1985-03-20'),
    nationality: 'SY',
    address: 'Detention Center, Brussels',
    hasLegalRepresentative: true,
    legalRepresentative: {
      name: 'Maître Pierre Leblanc',
      barAssociation: 'Brussels Bar',
      address: '78 Rue Royale, 1000 Brussels',
      email: 'pierre.leblanc@refugee-law.be',
      phone: '+32 2 555 1234',
      powerOfAttorney: true,
      powerOfAttorneyDate: new Date('2024-11-10'),
    },
    isAnonymous: false,
    anonymityRequested: true,
    victimStatus: {
      isDirectVictim: false,
      isIndirectVictim: false,
      isPotentialVictim: true,
      harmDescription: 'Risk of torture and death if expelled to Syria',
      significantDisadvantage: {
        nonPecuniaryDamage: 'Risk of torture, inhuman treatment, and death',
        principleAtStake: 'Absolute prohibition of torture',
      },
    },
  };

  // Create interim measures request
  const interimMeasures: InterimMeasure = {
    rule39: true,
    requestDate: new Date('2024-11-17'),
    urgencyReason: 'Expulsion to Syria scheduled tomorrow at 14:00 - documented risk of torture',
    measuresRequested: [
      'Suspend expulsion to Syria',
      'Maintain applicant in Belgium pending ECHR proceedings',
      'Ensure access to legal counsel',
    ],
    riskDescription: 'Applicant faces death sentence in absentia in Syria for political opposition',
    irreparableHarm: 'Death or torture upon return to Syria - well-documented country situation',
  };

  // Create application with Article 3 violation
  const application: ECHRApplication = {
    applicants: [applicant],
    respondentState: 'BE',
    type: 'urgent' as ApplicationType,
    status: 'draft' as ApplicationStatus,
    dateSubmitted: new Date('2024-11-17'),
    violations: [
      {
        article: 'article-3' as ViolationType,
        description: 'Expulsion to country where applicant faces real risk of torture',
        legalArguments: [
          'Well-documented risk of torture in Syria for political opponents',
          'Applicant has death sentence in absentia',
          'UNHCR reports confirm systematic torture in Syrian prisons',
          'Diplomatic assurances insufficient to eliminate risk',
        ],
        evidence: [
          {
            type: 'document',
            description: 'Death sentence judgment from Syrian court',
            date: new Date('2023-06-15'),
            source: 'Syrian Military Court',
            reliability: 'high',
          },
          {
            type: 'expert-report',
            description: 'UNHCR report on torture in Syria',
            date: new Date('2024-10-01'),
            source: 'UNHCR',
            reliability: 'high',
          },
          {
            type: 'witness-statement',
            description: 'Statement from former detainee describing torture',
            date: new Date('2024-11-01'),
            source: 'Witness under protection',
            reliability: 'high',
          },
        ],
        caseReferences: [
          {
            caseName: 'Chahal v. United Kingdom',
            applicationNumber: '22414/93',
            judgmentDate: new Date('1996-11-15'),
            relevantParagraphs: ['§§ 79-80', '§ 105'],
            grandChamber: true,
          },
          {
            caseName: 'M.S.S. v. Belgium and Greece',
            applicationNumber: '30696/09',
            judgmentDate: new Date('2011-01-21'),
            relevantParagraphs: ['§§ 365-367'],
            grandChamber: true,
          },
        ],
        violationPeriod: {
          start: new Date('2024-11-18'), // Tomorrow
          ongoing: true,
        },
      },
    ],
    facts: {
      summary: 'Syrian political opponent facing expulsion despite death sentence in absentia',
      detailedFacts: [
        'Applicant fled Syria in 2015 after participating in protests',
        'Sentenced to death in absentia by Syrian military court in 2023',
        'Asylum application rejected in Belgium on procedural grounds',
        'Expulsion order issued on November 10, 2024',
        'Scheduled for forced removal on November 18, 2024',
      ],
      chronology: [],
      context: 'Ongoing conflict and systematic torture in Syria',
    },
    domesticRemedies: [
      {
        courtName: 'Council for Alien Law Litigation',
        caseNumber: '2024/AL/789',
        dateInitiated: new Date('2024-11-11'),
        outcome: 'pending',
        appealed: false,
        finalDecision: false,
        ineffectiveReason: 'No automatic suspensive effect - expulsion can proceed',
      },
    ],
    interimMeasuresRequested: true,
    interimMeasures,
    documents: [],
    languageOfProceedings: 'EN',
    priorityRequested: true,
    priorityReason: 'Imminent expulsion with risk of torture and death',
  };

  // Assess interim measures urgency
  console.log('1. Interim Measures Urgency Assessment:');
  const urgencyAssessment = assessUrgency(interimMeasures);
  console.log(`   - Urgency level: ${urgencyAssessment.urgencyLevel}`);
  console.log(`   - Immediate danger: ${urgencyAssessment.immediateDanger}`);
  console.log(`   - Irreparable harm risk: ${urgencyAssessment.irreparableHarmRisk}`);
  console.log(`   - Recommend Rule 39: ${urgencyAssessment.recommendRule39}`);
  console.log(`   - Justification: ${urgencyAssessment.justification}`);

  // Check interim measures eligibility
  console.log('\n2. Interim Measures Eligibility:');
  const interimEligibility = await checkInterimMeasuresEligibility(interimMeasures, application);
  console.log(`   - Urgency: ${interimEligibility.urgencyLevel}`);
  console.log(`   - Recommendation: ${interimEligibility.justification}`);

  console.log('\n3. Emergency Procedure:');
  console.log('   - Contact ECHR duty lawyer immediately');
  console.log('   - Submit via secure email: applications@echr.coe.int');
  console.log('   - Mark "RULE 39 - URGENT" in subject');
  console.log('   - Expected response: Within 6-24 hours');
  console.log('   - Include: Complete application, expulsion order, evidence of risk');

  console.log('\n4. If Interim Measures Granted:');
  console.log('   - Belgium must suspend expulsion immediately');
  console.log('   - Violation of Rule 39 is breach of Article 34 ECHR');
  console.log('   - Application proceeds to normal admissibility review');
  console.log('   - Measures remain until Court decides otherwise');
}

/**
 * Example 3: Group Application - Environmental Rights
 */
async function exampleGroupEnvironmentalApplication() {
  console.log('\n=== EXAMPLE 3: Group Application - Environmental Damage (Article 8) ===\n');

  // Create multiple applicants
  const applicants: ECHRApplicant[] = [
    {
      id: 'APP-003-1',
      type: 'individual',
      name: 'Marie Lecoq',
      nationality: 'BE',
      address: '12 Rue de l\'Industrie, Charleroi',
      hasLegalRepresentative: true,
      isAnonymous: false,
      anonymityRequested: false,
      victimStatus: {
        isDirectVictim: true,
        isIndirectVictim: false,
        isPotentialVictim: false,
        harmDescription: 'Health damage from industrial pollution',
        significantDisadvantage: {
          financialImpact: 5000,
          nonPecuniaryDamage: 'Respiratory problems, reduced quality of life',
        },
      },
    },
    // ... 14 more applicants would be added here
  ];

  console.log(`   Group of ${applicants.length} applicants affected by industrial pollution`);
  console.log('   - Violation: Article 8 (private and family life)');
  console.log('   - Issue: State failure to regulate polluting factory');
  console.log('   - Systematic problem affecting entire neighborhood');
  console.log('   - Potential for pilot judgment procedure');
}

/**
 * Main execution
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     ECHR APPLICATION EXAMPLES - COMPLETE PROCEDURES        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  await exampleFairTrialApplication();
  await exampleExpulsionWithInterimMeasures();
  await exampleGroupEnvironmentalApplication();

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    SUMMARY OF PROCEDURES                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  console.log('\nKey ECHR Procedures Demonstrated:');
  console.log('1. Individual application (standard procedure)');
  console.log('2. Interim measures (Rule 39)');
  console.log('3. Group applications');
  console.log('4. Admissibility assessments');
  console.log('5. Just satisfaction claims');
  console.log('6. Priority procedures');
  console.log('7. Anonymity requests');

  console.log('\nAdditional Procedures Available:');
  console.log('8. Grand Chamber referral');
  console.log('9. Friendly settlement');
  console.log('10. Third-party intervention');
  console.log('11. Revision requests');
  console.log('12. Advisory opinions (Protocol 16)');
  console.log('13. Pilot judgment procedures');
  console.log('14. Legal aid requests');
  console.log('15. Strike-out procedures');

  console.log('\n✅ Examples completed successfully');
}

// Run examples
if (require.main === module) {
  main().catch(console.error);
}

export {
  exampleFairTrialApplication,
  exampleExpulsionWithInterimMeasures,
  exampleGroupEnvironmentalApplication,
};