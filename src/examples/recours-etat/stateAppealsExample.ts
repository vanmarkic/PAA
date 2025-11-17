/**
 * Examples demonstrating the State Appeals (Recours contre l'État) system
 *
 * This file shows how to use the various appeal procedures, including:
 * - Council of State appeals
 * - Administrative appeals
 * - Tax appeals
 * - Ombudsman complaints
 * - Access to documents requests
 */

import {
  checkConseilEtatAdmissibility,
  calculateConseilEtatDeadline,
  calculateTotalFees,
  determineUrgencyLevel,
  getRequiredDocuments
} from '../../rules/recours-etat/conseilEtatRules';

import {
  checkAdministrativeAppealAdmissibility,
  recommendAppealProcedure,
  processOmbudsmanComplaint,
  calculateAdministrativeSilence
} from '../../rules/recours-etat/administrativeAppealRules';

import {
  AppealApplication,
  ConseilEtatAnnulationProcedure,
  OmbudsmanComplaint,
  AccessToDocumentsRequest,
  TaxAppealProcedure
} from '../../domain/recoursEtatTypes';

import { interpret } from 'xstate';
import { conseilEtatAnnulationMachine } from '../../workflows/recours-etat/conseilEtatAnnulationMachine';
import { ombudsmanMachine } from '../../workflows/recours-etat/ombudsmanMachine';
import { taxAppealMachine } from '../../workflows/recours-etat/taxAppealMachine';

// ============================================================================
// EXAMPLE 1: Council of State Annulment Appeal
// ============================================================================

async function example1_ConseilEtatAnnulation() {
  console.log('\\n=== EXAMPLE 1: Council of State Annulment Appeal ===\\n');

  // Scenario: Building permit refused by municipality
  const permitRefusalDate = new Date('2024-01-15');
  const currentDate = new Date('2024-02-20');

  // 1. Check deadline
  const deadlineCalc = calculateConseilEtatDeadline(
    'conseil-etat-annulation',
    permitRefusalDate,
    currentDate
  );

  console.log('Deadline Calculation:');
  console.log(`- Notification date: ${permitRefusalDate.toLocaleDateString()}`);
  console.log(`- Deadline: ${deadlineCalc.calculatedDeadline.toLocaleDateString()}`);
  console.log(`- Days remaining: ${deadlineCalc.remainingDays}`);
  console.log(`- Is expired: ${deadlineCalc.isExpired}`);
  deadlineCalc.warnings.forEach(w => console.log(`⚠️ ${w}`));

  // 2. Create appeal application
  const appealApplication: Partial<ConseilEtatAnnulationProcedure> = {
    procedureType: 'conseil-etat-annulation',
    appellant: {
      id: 'app-001',
      type: 'individual',
      firstName: 'Jean',
      lastName: 'Dupont',
      address: {
        street: 'Rue de la Loi',
        number: '16',
        postalCode: '1000',
        city: 'Bruxelles',
        country: 'Belgique'
      },
      email: 'jean.dupont@example.be',
      legalCapacity: true,
      interest: 'Propriétaire du terrain concerné par le refus de permis'
    },
    authority: {
      id: 'auth-001',
      name: 'Commune de Bruxelles',
      type: 'municipal',
      department: 'Service Urbanisme',
      address: {
        street: 'Grand Place',
        number: '1',
        postalCode: '1000',
        city: 'Bruxelles',
        country: 'Belgique'
      }
    },
    challengedDecision: {
      id: 'dec-001',
      reference: 'URB/2024/001',
      date: permitRefusalDate,
      authority: {
        id: 'auth-001',
        name: 'Commune de Bruxelles',
        type: 'municipal',
        address: {
          street: 'Grand Place',
          number: '1',
          postalCode: '1000',
          city: 'Bruxelles',
          country: 'Belgique'
        }
      },
      type: 'individual-decision',
      subject: "Refus de permis d'urbanisme",
      notificationDate: permitRefusalDate,
      attachments: []
    },
    legalGrounds: [
      {
        type: 'illegality',
        description: 'Violation du CoBAT - critères non respectés',
        legalReferences: []
      },
      {
        type: 'error-of-fact',
        description: "Erreur manifeste d'appréciation des circonstances",
        legalReferences: []
      }
    ],
    factualGrounds: [
      'Le projet respecte toutes les prescriptions urbanistiques',
      'Les voisins ont donné leur accord',
      "Aucune objection lors de l'enquête publique"
    ],
    requestedRelief: [
      {
        type: 'annulment',
        description: 'Annulation de la décision de refus',
        urgency: false
      }
    ],
    deadline: {
      procedureType: 'conseil-etat-annulation',
      standardDelay: 60,
      startDate: permitRefusalDate,
      endDate: deadlineCalc.calculatedDeadline,
      isExtendable: false,
      calculationMethod: 'calendar-days'
    },
    standing: {
      type: 'direct',
      description: 'Propriétaire directement affecté par le refus',
      verified: true
    },
    language: 'fr',
    documents: [],
    filingFee: {
      amount: 200,
      currency: 'EUR',
      paid: false
    },
    suspensionRequested: false,
    provisionalMeasuresRequested: false,
    administrativeFile: {
      requested: false,
      received: false,
      documents: []
    }
  };

  // 3. Check admissibility
  const admissibilityCheck = await checkConseilEtatAdmissibility(appealApplication);

  console.log('\\nAdmissibility Check:');
  console.log(`- Is admissible: ${admissibilityCheck.isAdmissible}`);
  console.log(`- Can be corrected: ${admissibilityCheck.canBeCorrected}`);
  if (admissibilityCheck.issues.length > 0) {
    console.log('Issues found:');
    admissibilityCheck.issues.forEach(issue => {
      console.log(`  - ${issue.description} (Fatal: ${issue.isFatal}, Correctable: ${issue.correctionPossible})`);
    });
  }

  // 4. Calculate fees
  const fees = calculateTotalFees('conseil-etat-annulation', false, 1);
  console.log('\\nFees Calculation:');
  fees.breakdown.forEach(item => console.log(`- ${item}`));
  console.log(`Total: ${fees.total}€`);

  // 5. Get required documents
  const documents = getRequiredDocuments('conseil-etat-annulation');
  console.log('\\nRequired Documents:');
  documents.forEach(doc => {
    console.log(`- ${doc.document}: ${doc.description}`);
  });

  // 6. Start workflow
  console.log('\\nStarting Council of State Workflow...');
  const service = interpret(conseilEtatAnnulationMachine);

  service.subscribe((state) => {
    const meta = state.getMeta();
    console.log(`State: ${state.value} - ${meta?.description || ''}`);
  });

  service.start();
  service.send({ type: 'START_APPEAL', application: appealApplication as ConseilEtatAnnulationProcedure });
  service.send({ type: 'SUBMIT_APPLICATION' });

  // Simulate admissibility check
  service.send({
    type: 'ADMISSIBILITY_CHECKED',
    result: admissibilityCheck
  });

  service.stop();
}

// ============================================================================
// EXAMPLE 2: Ombudsman Complaint
// ============================================================================

async function example2_OmbudsmanComplaint() {
  console.log('\\n=== EXAMPLE 2: Federal Ombudsman Complaint ===\\n');

  const complaint: OmbudsmanComplaint = {
    id: 'complaint-001',
    type: 'mediateur-federal',
    complainant: {
      id: 'comp-001',
      type: 'individual',
      firstName: 'Marie',
      lastName: 'Martin',
      address: {
        street: 'Avenue Louise',
        number: '251',
        postalCode: '1050',
        city: 'Ixelles',
        country: 'Belgique'
      },
      email: 'marie.martin@example.be',
      legalCapacity: true,
      interest: 'Bénéficiaire de pension'
    },
    targetAuthority: {
      id: 'sfp-001',
      name: 'Service Fédéral des Pensions',
      type: 'federal',
      department: 'Service des paiements',
      address: {
        street: 'Tour du Midi',
        number: '1',
        postalCode: '1060',
        city: 'Saint-Gilles',
        country: 'Belgique'
      }
    },
    subject: 'Erreur de calcul de pension',
    description: 'Ma pension a été incorrectement calculée depuis 6 mois',
    previousSteps: [
      'Contact téléphonique le 15/01/2024 - sans suite',
      'Email le 20/01/2024 - réponse insatisfaisante',
      'Courrier recommandé le 01/02/2024 - pas de réponse'
    ],
    desiredOutcome: 'Rectification du calcul et paiement rétroactif',
    status: 'received'
  };

  // Process complaint
  const processing = processOmbudsmanComplaint(complaint);

  console.log('Ombudsman Complaint Processing:');
  console.log(`- Admissible: ${processing.isAdmissible}`);
  if (processing.issues.length > 0) {
    console.log('Issues:');
    processing.issues.forEach(issue => console.log(`  - ${issue}`));
  }
  console.log('Next steps:');
  processing.nextSteps.forEach(step => console.log(`  - ${step}`));

  // Start ombudsman workflow
  console.log('\\nStarting Ombudsman Workflow...');
  const ombudsmanService = interpret(ombudsmanMachine);

  ombudsmanService.subscribe((state) => {
    const meta = state.getMeta();
    console.log(`State: ${state.value} - ${meta?.description || ''}`);
  });

  ombudsmanService.start();
  ombudsmanService.send({ type: 'START_COMPLAINT', complaint });
  ombudsmanService.send({
    type: 'PRIOR_CONTACT_CONFIRMED',
    attempts: complaint.previousSteps
  });
  ombudsmanService.send({ type: 'SUBMIT_COMPLAINT' });
  ombudsmanService.send({ type: 'COMPLAINT_RECEIVED' });

  ombudsmanService.stop();
}

// ============================================================================
// EXAMPLE 3: Tax Appeal
// ============================================================================

async function example3_TaxAppeal() {
  console.log('\\n=== EXAMPLE 3: Tax Appeal Procedure ===\\n');

  const taxAppeal: TaxAppealProcedure = {
    id: 'tax-001',
    procedureType: 'reclamation-fiscale',
    status: 'filed',
    urgencyLevel: 'normal',
    appellant: {
      id: 'tax-app-001',
      type: 'individual',
      firstName: 'Pierre',
      lastName: 'Leroy',
      nationalRegisterNumber: '85.01.15-123.45',
      address: {
        street: 'Rue Neuve',
        number: '123',
        postalCode: '4000',
        city: 'Liège',
        country: 'Belgique'
      },
      email: 'pierre.leroy@example.be',
      legalCapacity: true,
      interest: 'Contribuable'
    },
    authority: {
      id: 'spf-fin-001',
      name: 'SPF Finances',
      type: 'federal',
      department: 'Contributions directes - Liège',
      address: {
        street: 'Rue de Fragnée',
        number: '2',
        postalCode: '4000',
        city: 'Liège',
        country: 'Belgique'
      }
    },
    challengedDecision: {
      id: 'aer-001',
      reference: 'IPP/2024/123456',
      date: new Date('2024-06-15'),
      authority: {
        id: 'spf-fin-001',
        name: 'SPF Finances',
        type: 'federal',
        address: {
          street: 'Rue de Fragnée',
          number: '2',
          postalCode: '4000',
          city: 'Liège',
          country: 'Belgique'
        }
      },
      type: 'tax-assessment',
      subject: 'Avertissement-extrait de rôle IPP 2023',
      notificationDate: new Date('2024-06-15'),
      attachments: []
    },
    legalGrounds: [
      {
        type: 'error-of-law',
        description: 'Frais professionnels incorrectement rejetés',
        legalReferences: []
      }
    ],
    factualGrounds: [
      'Justificatifs fournis pour tous les frais',
      'Erreur de calcul manifeste'
    ],
    requestedRelief: [
      {
        type: 'modification',
        description: 'Dégrèvement de 2.500€',
        urgency: false
      }
    ],
    deadline: {
      procedureType: 'reclamation-fiscale',
      standardDelay: 180,
      startDate: new Date('2024-06-15'),
      endDate: new Date('2024-12-15'),
      isExtendable: false,
      calculationMethod: 'calendar-days'
    },
    standing: {
      type: 'direct',
      description: 'Contribuable directement concerné',
      verified: true
    },
    language: 'fr',
    documents: [],
    filingFee: {
      amount: 0,
      currency: 'EUR',
      paid: true
    },
    taxYear: 2023,
    taxType: 'income-tax',
    contestedAmount: 2500,
    paymentSuspended: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  console.log('Tax Appeal Details:');
  console.log(`- Tax Type: ${taxAppeal.taxType}`);
  console.log(`- Tax Year: ${taxAppeal.taxYear}`);
  console.log(`- Contested Amount: ${taxAppeal.contestedAmount}€`);
  console.log(`- Deadline: ${taxAppeal.deadline.endDate.toLocaleDateString()}`);

  // Start tax appeal workflow
  console.log('\\nStarting Tax Appeal Workflow...');
  const taxService = interpret(taxAppealMachine);

  taxService.subscribe((state) => {
    const meta = state.getMeta();
    console.log(`State: ${state.value} - ${meta?.description || ''}`);
  });

  taxService.start();
  taxService.send({ type: 'START_TAX_APPEAL', appeal: taxAppeal });
  taxService.send({ type: 'FILE_ADMINISTRATIVE_COMPLAINT' });
  taxService.send({ type: 'REQUEST_PAYMENT_SUSPENSION' });

  taxService.stop();
}

// ============================================================================
// EXAMPLE 4: Administrative Silence
// ============================================================================

async function example4_AdministrativeSilence() {
  console.log('\\n=== EXAMPLE 4: Administrative Silence ===\\n');

  const requestDate = new Date('2024-01-01');
  const silenceCalc = calculateAdministrativeSilence(requestDate);

  console.log('Administrative Silence Calculation:');
  console.log(`- Request date: ${requestDate.toLocaleDateString()}`);
  console.log(`- Silence date: ${silenceCalc.silenceDate.toLocaleDateString()}`);
  console.log(`- Is implicit refusal: ${silenceCalc.isImplicitRefusal}`);
  console.log(`- Can appeal: ${silenceCalc.canAppeal}`);

  if (silenceCalc.canAppeal) {
    console.log('\\nAppeal options after administrative silence:');
    console.log("1. Recours gracieux auprès de l'administration");
    console.log("2. Recours au Conseil d'État (60 jours)");
    console.log('3. Saisine du médiateur fédéral');
  }
}

// ============================================================================
// EXAMPLE 5: Recommend Appropriate Procedure
// ============================================================================

async function example5_ProcedureRecommendation() {
  console.log('\\n=== EXAMPLE 5: Procedure Recommendation ===\\n');

  const scenarios = [
    {
      decisionType: 'tax-assessment',
      authority: 'SPF Finances',
      hasTriedInternally: false,
      urgency: false
    },
    {
      decisionType: 'administrative-act',
      authority: 'Commune de Namur',
      hasTriedInternally: true,
      urgency: true
    },
    {
      decisionType: 'aide-sociale',
      authority: 'CPAS de Charleroi',
      hasTriedInternally: true,
      urgency: false
    }
  ];

  scenarios.forEach((scenario, index) => {
    console.log(`\\nScenario ${index + 1}:`);
    console.log(`- Decision: ${scenario.decisionType}`);
    console.log(`- Authority: ${scenario.authority}`);
    console.log(`- Tried internally: ${scenario.hasTriedInternally}`);
    console.log(`- Urgent: ${scenario.urgency}`);

    const recommendation = recommendAppealProcedure(
      scenario.decisionType,
      scenario.authority,
      scenario.hasTriedInternally,
      scenario.urgency
    );

    console.log('\\nRecommendation:');
    console.log(`- Procedure: ${recommendation.recommendedProcedure}`);
    console.log(`- Reason: ${recommendation.reason}`);
    console.log(`- Estimated duration: ${recommendation.estimatedDuration}`);
    console.log(`- Estimated cost: ${recommendation.estimatedCost}€`);
    console.log(`- Success likelihood: ${recommendation.successLikelihood}`);
    console.log(`- Alternatives: ${recommendation.alternativeProcedures.join(', ')}`);
  });
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('========================================');
  console.log('STATE APPEALS SYSTEM EXAMPLES');
  console.log('========================================');

  try {
    await example1_ConseilEtatAnnulation();
    await example2_OmbudsmanComplaint();
    await example3_TaxAppeal();
    await example4_AdministrativeSilence();
    await example5_ProcedureRecommendation();

    console.log('\\n========================================');
    console.log('ALL EXAMPLES COMPLETED SUCCESSFULLY');
    console.log('========================================');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Run examples if executed directly
if (require.main === module) {
  main();
}

export {
  example1_ConseilEtatAnnulation,
  example2_OmbudsmanComplaint,
  example3_TaxAppeal,
  example4_AdministrativeSilence,
  example5_ProcedureRecommendation
};