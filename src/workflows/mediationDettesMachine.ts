/**
 * XState machine for Médiation de Dettes (Debt Mediation) Workflow
 *
 * This state machine represents the workflow for debt mediation services,
 * including debt assessment, creditor negotiation, and payment plan establishment.
 */

import { createMachine, assign } from 'xstate';

interface Debiteur {
  nom: string;
  revenuMensuel: number;
  montantDettes: number;
  nombreCreanciers: number;
}

interface PlanRemboursement {
  montantMensuel: number;
  dureeEnMois: number;
  creanciers: string[];
}

interface MediationDettesContext {
  debiteur: Debiteur | null;
  dettesAnalysees: boolean;
  planRemboursement: PlanRemboursement | null;
  creanciersAccord: number;
  planActif: boolean;
  mensualitesPayees: number;
}

export const mediationDettesMachine = createMachine({
  id: 'mediationDettes',
  initial: 'attente',

  schemas: {
    context: {} as MediationDettesContext,
    events: {} as
      | { type: 'DEMANDER_MEDIATION'; debiteur: Debiteur }
      | { type: 'ANALYSER_DETTES' }
      | { type: 'DETTES_ANALYSEES' }
      | { type: 'ETABLIR_PLAN'; plan: PlanRemboursement }
      | { type: 'NEGOCIER_CREANCIERS' }
      | { type: 'CREANCIERS_ACCEPTENT' }
      | { type: 'CREANCIERS_REFUSENT' }
      | { type: 'PLAN_HOMOLOGUE' }
      | { type: 'MENSUALITE_PAYEE' }
      | { type: 'MENSUALITE_IMPAYEE' }
      | { type: 'PLAN_TERMINE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    debiteur: null,
    dettesAnalysees: false,
    planRemboursement: null,
    creanciersAccord: 0,
    planActif: false,
    mensualitesPayees: 0,
  },

  states: {
    attente: {
      on: {
        DEMANDER_MEDIATION: {
          target: 'analyseDettes',
          actions: assign({
            debiteur: ({ event }) => event.debiteur,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une nouvelle demande de médiation de dettes',
      },
    },

    analyseDettes: {
      on: {
        DETTES_ANALYSEES: {
          target: 'elaborationPlan',
          actions: assign({
            dettesAnalysees: true,
          }),
        },
      },

      meta: {
        description: 'Analyse complète de la situation financière et des dettes',
      },
    },

    elaborationPlan: {
      on: {
        ETABLIR_PLAN: {
          target: 'negociationCreanciers',
          actions: assign({
            planRemboursement: ({ event }) => event.plan,
          }),
        },
      },

      meta: {
        description: 'Élaboration d\'un plan de remboursement adapté aux capacités',
      },
    },

    negociationCreanciers: {
      on: {
        CREANCIERS_ACCEPTENT: {
          target: 'homologationPlan',
          actions: assign({ creanciersAccord: ({ context }) => (context.debiteur?.nombreCreanciers || 0),
          }),
        },
        CREANCIERS_REFUSENT: {
          target: 'echec',
        },
      },

      meta: {
        description: 'Négociation avec les créanciers pour acceptation du plan',
      },
    },

    homologationPlan: {
      on: {
        PLAN_HOMOLOGUE: {
          target: 'planEnCours',
          actions: assign({
            planActif: true,
          }),
        },
      },

      meta: {
        description: 'Homologation du plan par le tribunal du travail',
      },
    },

    planEnCours: {
      on: {
        MENSUALITE_PAYEE: {
          target: 'planEnCours',
          actions: assign({ mensualitesPayees: ({ context }) => context.mensualitesPayees + 1,
          }),
        },
        MENSUALITE_IMPAYEE: {
          target: 'incidentPaiement',
        },
        PLAN_TERMINE: {
          target: 'planReussi',
        },
      },

      meta: {
        description: 'Plan actif - paiements mensuels en cours selon accord',
      },
    },

    incidentPaiement: {
      on: {
        MENSUALITE_PAYEE: {
          target: 'planEnCours',
          actions: assign({ mensualitesPayees: ({ context }) => context.mensualitesPayees + 1,
          }),
        },
        ETABLIR_PLAN: {
          target: 'negociationCreanciers',
          actions: assign({
            planRemboursement: ({ event }) => event.plan,
          }),
        },
      },

      meta: {
        description: 'Incident de paiement - risque de rupture du plan',
      },
    },

    planReussi: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Plan terminé avec succès - dettes remboursées',
      },
    },

    echec: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Médiation échouée - orientation vers règlement collectif de dettes',
      },
    },
  },
});

/**
 * Visualization of the debt mediation workflow:
 *
 * attente
 *   → analyseDettes
 *   → elaborationPlan
 *   → negociationCreanciers
 *       ↓ (si acceptation)
 *     homologationPlan
 *       ↓
 *     planEnCours → [paiements mensuels]
 *       ↓
 *     planReussi ✓
 */
