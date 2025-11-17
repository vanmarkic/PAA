/**
 * Example usage of Copropriété domain
 *
 * This example demonstrates:
 * - AG convocation and quorum calculation
 * - Charges calculation and payment tracking
 * - State machine workflows
 */

import { interpret } from 'xstate';
import {
  Copropriete,
  Coproprietaire,
  AssembleeGenerale,
  Budget,
  Lot,
  Syndic,
  COPROPRIETE_CONSTANTS
} from '../../domain/coproprieteTypes';
import {
  calculateQuorum,
  validateVote,
  checkConvocationValidity
} from '../../rules/copropriete/assembleeGeneraleRules';
import {
  calculateCharges,
  calculateInterets,
  checkPaiementStatus,
  generateAppelFonds
} from '../../rules/copropriete/chargesRules';
import { assembleeGeneraleMachine } from '../../workflows/copropriete/assembleeGeneraleMachine';
import { chargesPaymentMachine } from '../../workflows/copropriete/chargesPaymentMachine';

/**
 * Example 1: Create a copropriété with sample data
 */
function createSampleCopropriete(): Copropriete {
  const syndic: Syndic = {
    id: 'syndic-001',
    type: 'professionnel',
    nom: 'Gestion Immobilière SA',
    numeroIPI: 'IPI-123456',
    numeroEntreprise: 'BE0123456789',
    email: 'contact@gestion-immo.be',
    telephone: '02/123.45.67',
    adresse: 'Rue de la Loi 1, 1000 Bruxelles',
    dateDesignation: new Date('2023-01-01'),
    dateFinMandat: new Date('2026-01-01'),
    remuneration: 500,
    contratGestion: 'contrat-2023-001',
  };

  return {
    id: 'copro-001',
    nom: 'Résidence Bellevue',
    adresse: 'Avenue Louise 100, 1050 Bruxelles',
    numeroEntreprise: 'BE0987654321',
    nombreLots: 30,
    status: 'copropriete_moyenne',
    syndic,
    dateCreation: new Date('2000-01-01'),
    dateDerniereAG: new Date('2024-03-15'),
    fondsReserve: 25000,
    fondsRoulement: 5000,
    acteBase: {
      dateActe: new Date('2000-01-01'),
      notaire: 'Maître Dupont',
      reference: 'Rep 2000/123',
    },
  };
}

/**
 * Example 2: Create sample copropriétaires
 */
function createSampleCoproprietaires(): Coproprietaire[] {
  const lot1: Lot = {
    id: 'lot-001',
    numero: 'A1',
    type: 'appartement',
    etage: 3,
    surface: 85,
    milliemes: 85,
    coproprietaireId: 'copro-001',
    description: 'Appartement 2 chambres avec terrasse',
  };

  const lot2: Lot = {
    id: 'lot-002',
    numero: 'B2',
    type: 'studio',
    etage: 1,
    surface: 45,
    milliemes: 45,
    coproprietaireId: 'copro-002',
    description: 'Studio avec balcon',
  };

  return [
    {
      id: 'copro-001',
      nom: 'Dubois',
      prenom: 'Jean',
      type: 'proprietaire_occupant',
      email: 'jean.dubois@email.be',
      telephone: '0470/12.34.56',
      adresse: 'Avenue Louise 100/A1, 1050 Bruxelles',
      lots: [lot1],
      quotePartMilliemes: 85,
      statutPaiement: 'a_jour',
      montantImpayes: 0,
      dateEntreeVigueur: new Date('2020-01-01'),
    },
    {
      id: 'copro-002',
      nom: 'Martin',
      prenom: 'Sophie',
      type: 'proprietaire_bailleur',
      email: 'sophie.martin@email.be',
      telephone: '0471/23.45.67',
      adresse: 'Rue de la Paix 50, 1000 Bruxelles',
      lots: [lot2],
      quotePartMilliemes: 45,
      statutPaiement: 'retard_leger',
      montantImpayes: 350,
      dateEntreeVigueur: new Date('2018-06-01'),
    },
  ];
}

/**
 * Example 3: Check AG convocation validity
 */
async function exampleCheckConvocation() {
  console.log('\n=== Exemple: Vérification validité convocation AG ===\n');

  const convocationData = {
    assemblee_type: 'ordinaire_annuelle' as const,
    delai_convocation: 16, // jours
    copropriete_status: 'copropriete_moyenne' as const,
    documents_joints: {
      comptes_annuels: true,
      budget_previsionnel: true,
      rapport_syndic: true,
    },
  };

  const result = await checkConvocationValidity(convocationData);

  console.log('Convocation valide:', result.isValid);
  if (result.errors.length > 0) {
    console.log('Erreurs:', result.errors);
  }
  if (result.warnings.length > 0) {
    console.log('Avertissements:', result.warnings);
  }
}

/**
 * Example 4: Calculate and validate quorum
 */
function exampleCalculateQuorum() {
  console.log('\n=== Exemple: Calcul et validation du quorum ===\n');

  const scenarios = [
    {
      name: 'Vote budget (majorité absolue)',
      totalMilliemes: 1000,
      presents: 420,
      representes: 130,
      decisionType: 'majorite_absolue' as const,
    },
    {
      name: 'Désignation syndic (2/3)',
      totalMilliemes: 1000,
      presents: 580,
      representes: 100,
      decisionType: 'deux_tiers' as const,
    },
    {
      name: 'Travaux amélioration (3/4)',
      totalMilliemes: 1000,
      presents: 600,
      representes: 160,
      decisionType: 'trois_quarts' as const,
    },
  ];

  scenarios.forEach(scenario => {
    const quorum = calculateQuorum(
      scenario.totalMilliemes,
      scenario.presents,
      scenario.representes,
      scenario.decisionType
    );

    console.log(`${scenario.name}:`);
    console.log(`  - Millièmes requis: ${quorum.milliemesRequis}`);
    console.log(`  - Millièmes présents/représentés: ${scenario.presents + scenario.representes}`);
    console.log(`  - Quorum atteint: ${quorum.quorumAtteint ? 'OUI' : 'NON'}`);
    console.log('');
  });
}

/**
 * Example 5: Vote validation
 */
function exampleVoteValidation() {
  console.log('\n=== Exemple: Validation des votes ===\n');

  const votes = [
    {
      description: 'Approbation des comptes',
      type: 'majorite_absolue' as const,
      pour: 520,
      contre: 350,
      abstention: 130,
    },
    {
      description: 'Installation ascenseur',
      type: 'trois_quarts' as const,
      pour: 760,
      contre: 180,
      abstention: 60,
    },
    {
      description: 'Vente partie commune',
      type: 'unanimite' as const,
      pour: 980,
      contre: 20,
      abstention: 0,
    },
  ];

  votes.forEach(vote => {
    const result = validateVote(
      vote.type,
      vote.pour,
      vote.contre,
      vote.abstention,
      1000
    );

    console.log(`${vote.description}:`);
    console.log(`  - Pour: ${vote.pour} (${result.pourcentagePour}%)`);
    console.log(`  - Contre: ${vote.contre}`);
    console.log(`  - Abstention: ${vote.abstention}`);
    console.log(`  - Majorité requise: ${result.majoriteRequise}%`);
    console.log(`  - Résultat: ${result.isAccepted ? 'ACCEPTÉ' : 'REJETÉ'}`);
    console.log(`  - ${result.reason}`);
    console.log('');
  });
}

/**
 * Example 6: Calculate charges for copropriétaire
 */
function exampleCalculateCharges() {
  console.log('\n=== Exemple: Calcul des charges ===\n');

  const budget: Budget = {
    annee: 2024,
    montantTotal: 60000,
    approuveAG: true,
    dateApprobation: new Date('2024-03-15'),
    repartition: [
      {
        type: 'charge_generale',
        description: 'Entretien parties communes',
        montant: 15000,
        cleRepartition: 'milliemes',
      },
      {
        type: 'charge_generale',
        description: 'Électricité communs',
        montant: 8000,
        cleRepartition: 'milliemes',
      },
      {
        type: 'charge_generale',
        description: 'Assurances',
        montant: 6000,
        cleRepartition: 'milliemes',
      },
      {
        type: 'charge_generale',
        description: 'Honoraires syndic',
        montant: 7500,
        cleRepartition: 'milliemes',
      },
      {
        type: 'charge_particuliere',
        description: 'Entretien ascenseur',
        montant: 4000,
        cleRepartition: 'custom',
        details: 'ascenseur',
      },
    ],
  };

  const coproprietaires = createSampleCoproprietaires();

  coproprietaires.forEach(copro => {
    const charges = calculateCharges(copro, budget, 'mensuel');

    console.log(`Charges pour ${copro.prenom} ${copro.nom} (${copro.quotePartMilliemes} millièmes):`);
    console.log(`  - Charges générales: ${charges.chargesGenerales}€/mois`);
    console.log(`  - Charges spéciales: ${charges.chargesSpeciales}€/mois`);
    console.log(`  - Fonds de réserve: ${charges.fondsReserve}€/mois`);
    console.log(`  - TOTAL: ${charges.total}€/mois`);
    console.log('  Détail:');
    charges.detail.forEach(d => {
      console.log(`    • ${d.type}: ${d.montant}€`);
    });
    console.log('');
  });
}

/**
 * Example 7: Calculate late payment interests
 */
function exampleCalculateInterets() {
  console.log('\n=== Exemple: Calcul des intérêts de retard ===\n');

  const scenarios = [
    { montant: 1000, jours: 30 },
    { montant: 2500, jours: 60 },
    { montant: 5000, jours: 120 },
  ];

  scenarios.forEach(s => {
    const result = calculateInterets(s.montant, s.jours);
    console.log(`Montant impayé: ${s.montant}€, Retard: ${s.jours} jours`);
    console.log(`  - Taux annuel: ${result.tauxAnnuel}%`);
    console.log(`  - Intérêts dus: ${result.interets}€`);
    console.log(`  - Total à payer: ${s.montant + result.interets}€`);
    console.log('');
  });
}

/**
 * Example 8: Check payment status and penalties
 */
async function exampleCheckPaiementStatus() {
  console.log('\n=== Exemple: Vérification statut paiement ===\n');

  const scenarios = [
    {
      name: 'Retard léger',
      montant_impayes: 500,
      jours_retard: 25,
      rappels_envoyes: 0,
    },
    {
      name: 'Retard important',
      montant_impayes: 1500,
      jours_retard: 45,
      rappels_envoyes: 1,
    },
    {
      name: 'Impayés graves',
      montant_impayes: 3000,
      jours_retard: 120,
      rappels_envoyes: 2,
    },
  ];

  for (const scenario of scenarios) {
    const result = await checkPaiementStatus(scenario);
    console.log(`${scenario.name}:`);
    console.log(`  - Statut: ${result.status}`);
    console.log(`  - Frais: ${result.frais}€`);
    console.log(`  - Intérêts: ${result.interets}€`);
    console.log(`  - Actions: ${result.actions.join(', ')}`);
    console.log('');
  }
}

/**
 * Example 9: AG workflow with state machine
 */
function exampleAGWorkflow() {
  console.log('\n=== Exemple: Workflow Assemblée Générale ===\n');

  const agService = interpret(assembleeGeneraleMachine)
    .onTransition(state => {
      console.log(`État: ${state.value}`);
      if (state.meta[`assembleeGenerale.${state.value}`]) {
        console.log(`  Description: ${state.meta[`assembleeGenerale.${state.value}`].description}`);
      }
    })
    .start();

  // Planifier AG
  const ag: AssembleeGenerale = {
    id: 'ag-2024-001',
    type: 'ordinaire_annuelle',
    dateConvocation: new Date('2024-11-01'),
    dateReunion: new Date('2024-11-20'),
    lieu: 'Salle de réunion - Résidence Bellevue',
    ordreJour: [
      {
        numero: 1,
        titre: 'Approbation des comptes 2023',
        description: 'Présentation et vote des comptes annuels',
        typeDecision: 'majorite_absolue',
      },
      {
        numero: 2,
        titre: 'Budget 2025',
        description: 'Présentation et vote du budget prévisionnel',
        typeDecision: 'majorite_absolue',
      },
    ],
    quorum: {
      milliemesRequis: 500,
      milliemesPresents: 0,
      milliemesRepresentes: 0,
      quorumAtteint: false,
    },
    decisions: [],
    presences: [],
  };

  console.log('1. Planification de l\'AG');
  agService.send({ type: 'PLANIFIER_AG', assemblee: ag });

  console.log('\n2. Envoi des convocations');
  agService.send({
    type: 'ENVOYER_CONVOCATION',
    documents: ['comptes_2023.pdf', 'budget_2025.pdf', 'rapport_syndic.pdf'],
  });
  agService.send({ type: 'CONVOCATION_ENVOYEE' });

  console.log('\n3. Jour de l\'AG - Vérification du quorum');
  agService.send({ type: 'DEMARRER_AG' });
  agService.send({
    type: 'VERIFIER_QUORUM',
    quorum: {
      milliemesRequis: 500,
      milliemesPresents: 450,
      milliemesRepresentes: 120,
      quorumAtteint: true,
    },
  });
  agService.send({ type: 'QUORUM_ATTEINT' });

  console.log('\n4. Vote des résolutions');
  agService.send({
    type: 'VOTER_DECISION',
    decision: {
      id: 'decision-001',
      assembleeId: ag.id,
      pointOrdreJour: 1,
      description: 'Approbation des comptes 2023',
      typeDecision: 'majorite_absolue',
      status: 'votee_acceptee',
      votePour: 520,
      voteContre: 50,
      abstention: 0,
    },
  });

  console.log('\n5. Clôture et rédaction du PV');
  agService.send({ type: 'CLOTURER_AG' });

  agService.stop();
}

/**
 * Example 10: Payment workflow with state machine
 */
function examplePaymentWorkflow() {
  console.log('\n=== Exemple: Workflow Paiement Charges ===\n');

  const paymentService = interpret(chargesPaymentMachine)
    .onTransition(state => {
      console.log(`État: ${state.value}`);
      if (state.meta[`chargesPayment.${state.value}`]) {
        console.log(`  Description: ${state.meta[`chargesPayment.${state.value}`].description}`);
      }
    })
    .start();

  const copro = createSampleCoproprietaires()[1]; // Sophie Martin avec retard
  const budget = {
    annee: 2024,
    montantTotal: 60000,
    approuveAG: true,
    dateApprobation: new Date('2024-03-15'),
    repartition: [],
  };

  const appelFonds = generateAppelFonds(budget, [copro], 'ordinaire', 'T2-2024');

  console.log('1. Émission appel de fonds');
  paymentService.send({
    type: 'EMETTRE_APPEL',
    coproprietaire: copro,
    appelFonds,
    montant: 350,
  });

  console.log('\n2. Échéance dépassée');
  paymentService.send({ type: 'ECHEANCE_DEPASSEE' });

  console.log('\n3. Envoi rappel');
  paymentService.send({ type: 'ENVOYER_RAPPEL' });
  paymentService.send({
    type: 'RAPPEL_ENVOYE',
    rappel: {
      numero: 1,
      date: new Date(),
      montantDu: 350,
      fraisRappel: 7.5,
    },
  });

  console.log('\n4. Paiement reçu avec pénalités');
  paymentService.send({
    type: 'PAIEMENT_RECU',
    montant: 357.5,
    date: new Date(),
  });

  paymentService.stop();
}

/**
 * Main execution
 */
async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║        EXEMPLE COMPLET - DOMAINE COPROPRIÉTÉ                 ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');

  const copropriete = createSampleCopropriete();
  console.log(`\nCopropriété: ${copropriete.nom}`);
  console.log(`Adresse: ${copropriete.adresse}`);
  console.log(`Nombre de lots: ${copropriete.nombreLots}`);
  console.log(`Syndic: ${copropriete.syndic.nom}`);

  await exampleCheckConvocation();
  exampleCalculateQuorum();
  exampleVoteValidation();
  exampleCalculateCharges();
  exampleCalculateInterets();
  await exampleCheckPaiementStatus();
  exampleAGWorkflow();
  examplePaymentWorkflow();

  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                    FIN DES EXEMPLES                          ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
}

// Execute examples if run directly
if (require.main === module) {
  main().catch(console.error);
}

export {
  createSampleCopropriete,
  createSampleCoproprietaires,
  exampleCheckConvocation,
  exampleCalculateQuorum,
  exampleVoteValidation,
  exampleCalculateCharges,
  exampleCalculateInterets,
  exampleCheckPaiementStatus,
  exampleAGWorkflow,
  examplePaymentWorkflow,
};