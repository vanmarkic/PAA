/**
 * XState machine for Budget Énergétique (Energy Budget) Workflow
 *
 * This state machine represents the workflow for energy budget assistance,
 * including consumption analysis, budget plan creation, and payment support.
 */

import { createMachine, assign } from 'xstate';

interface MenageEnergie {
  nom: string;
  revenuMensuel: number;
  consommationAnnuelle: number;
  typeLogement: string;
}

interface BudgetEnergetique {
  mensualite: number;
  aideAttribuee: number;
  dureeEnMois: number;
}

interface BudgetEnergetiqueContext {
  menage: MenageEnergie | null;
  consommationAnalysee: boolean;
  budget: BudgetEnergetique | null;
  tarifSocial: boolean;
  planActif: boolean;
  mensualitesPayees: number;
}

export const budgetEnergetiqueMachine = createMachine({
  id: 'budgetEnergetique',
  initial: 'attente',

  schemas: {
    context: {} as BudgetEnergetiqueContext,
    events: {} as
      | { type: 'DEMANDER_BUDGET'; menage: MenageEnergie }
      | { type: 'ANALYSER_CONSOMMATION' }
      | { type: 'CONSOMMATION_ANALYSEE' }
      | { type: 'VERIFIER_TARIF_SOCIAL' }
      | { type: 'TARIF_SOCIAL_ACCORDE' }
      | { type: 'CREER_BUDGET'; budget: BudgetEnergetique }
      | { type: 'ACTIVER_PLAN' }
      | { type: 'PAYER_MENSUALITE' }
      | { type: 'RETARD_PAIEMENT' }
      | { type: 'REAJUSTER_BUDGET' }
      | { type: 'BUDGET_TERMINE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    menage: null,
    consommationAnalysee: false,
    budget: null,
    tarifSocial: false,
    planActif: false,
    mensualitesPayees: 0,
  } as BudgetEnergetiqueContext,

  states: {
    attente: {
      on: {
        DEMANDER_BUDGET: {
          target: 'analyseConsommation',
          actions: assign({
            menage: ({ event }) => event.menage,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une nouvelle demande de budget énergétique',
      },
    },

    analyseConsommation: {
      on: {
        CONSOMMATION_ANALYSEE: {
          target: 'verificationTarifSocial',
          actions: assign({
            consommationAnalysee: true,
          }),
        },
      },

      meta: {
        description: 'Analyse de la consommation énergétique et des factures',
      },
    },

    verificationTarifSocial: {
      on: {
        TARIF_SOCIAL_ACCORDE: {
          target: 'creationBudget',
          actions: assign({
            tarifSocial: true,
          }),
        },
        CREER_BUDGET: {
          target: 'creationBudget',
        },
      },

      meta: {
        description: 'Vérification de l\'éligibilité au tarif social (VIPO)',
      },
    },

    creationBudget: {
      on: {
        ACTIVER_PLAN: {
          target: 'budgetActif',
          actions: assign({
            budget: () => ({ mensualite: 0, aideAttribuee: 0, dureeEnMois: 12 }),
            planActif: true,
          }),
        },
      },

      meta: {
        description: 'Création du budget mensuel avec lissage des paiements',
      },
    },

    budgetActif: {
      on: {
        PAYER_MENSUALITE: {
          target: 'budgetActif',
          actions: assign({
            mensualitesPayees: ({ context }) => context.mensualitesPayees + 1,
          }),
        },
        RETARD_PAIEMENT: {
          target: 'gestionRetard',
        },
        REAJUSTER_BUDGET: {
          target: 'creationBudget',
        },
        BUDGET_TERMINE: {
          target: 'budgetTermine',
        },
      },

      meta: {
        description: 'Budget actif - paiements mensuels lissés sur l\'année',
      },
    },

    gestionRetard: {
      on: {
        PAYER_MENSUALITE: {
          target: 'budgetActif',
          actions: assign({
            mensualitesPayees: ({ context }) => context.mensualitesPayees + 1,
          }),
        },
        REAJUSTER_BUDGET: {
          target: 'creationBudget',
        },
      },

      meta: {
        description: 'Gestion du retard de paiement - risque de coupure évité',
      },
    },

    budgetTermine: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Budget terminé - fin de période de lissage',
      },
    },
  },
});

/**
 * Visualization of the energy budget workflow:
 *
 * attente
 *   → analyseConsommation
 *   → verificationTarifSocial
 *   → creationBudget
 *   → budgetActif
 *       ↓ [paiements mensuels]
 *     budgetActif
 *       ↓
 *     budgetTermine ✓
 */
