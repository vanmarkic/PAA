/**
 * XState machine for Service de Repas à Domicile (Meal Delivery Service) Workflow
 *
 * This state machine represents the workflow for meal delivery services,
 * including assessment, menu planning, delivery scheduling, and service management.
 */

import { createMachine, assign } from 'xstate';

interface BeneficiaireRepas {
  nom: string;
  age: number;
  regimeAlimentaire: string[];
  allergies: string[];
  autonomieCuisine: string;
}

interface PlanRepas {
  frequenceLivraison: string;
  typeRepas: string[];
  prixParRepas: number;
  joursLivraison: string[];
}

interface RepasDomicileContext {
  beneficiaire: BeneficiaireRepas | null;
  plan: PlanRepas | null;
  serviceActif: boolean;
  repasLivres: number;
  menuPersonnalise: boolean;
}

export const repasDomicileMachine = createMachine({
  id: 'repasDomicile',
  initial: 'attente',

  schemas: {
    context: {} as RepasDomicileContext,
    events: {} as
      | { type: 'DEMANDER_SERVICE'; beneficiaire: BeneficiaireRepas }
      | { type: 'EVALUER_BESOINS' }
      | { type: 'BESOINS_IDENTIFIES' }
      | { type: 'ETABLIR_PLAN'; plan: PlanRepas }
      | { type: 'PERSONNALISER_MENU' }
      | { type: 'COMMENCER_LIVRAISONS' }
      | { type: 'LIVRER_REPAS' }
      | { type: 'MODIFIER_MENU' }
      | { type: 'SUSPENDRE_LIVRAISONS' }
      | { type: 'REPRENDRE_LIVRAISONS' }
      | { type: 'ARRETER_SERVICE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    beneficiaire: null,
    plan: null,
    serviceActif: false,
    repasLivres: 0,
    menuPersonnalise: false,
  },

  states: {
    attente: {
      on: {
        DEMANDER_SERVICE: {
          target: 'evaluationBesoins',
          actions: assign({
            beneficiaire: ({ event }) => event.beneficiaire,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une nouvelle demande de service de repas à domicile',
      },
    },

    evaluationBesoins: {
      on: {
        BESOINS_IDENTIFIES: {
          target: 'planificationRepas',
        },
      },

      meta: {
        description: 'Évaluation des besoins nutritionnels et préférences alimentaires',
      },
    },

    planificationRepas: {
      on: {
        ETABLIR_PLAN: {
          target: 'personnalisationMenu',
          actions: assign({
            plan: ({ event }) => event.plan,
          }),
        },
      },

      meta: {
        description: 'Planification du service (fréquence, type de repas, tarification)',
      },
    },

    personnalisationMenu: {
      on: {
        PERSONNALISER_MENU: {
          target: 'livraisonsActives',
          actions: assign({
            menuPersonnalise: true,
            serviceActif: true,
          }),
        },
      },

      meta: {
        description: 'Personnalisation du menu selon régime et préférences',
      },
    },

    livraisonsActives: {
      on: {
        LIVRER_REPAS: {
          target: 'livraisonsActives',
          actions: assign({ repasLivres: ({ context }) => context.repasLivres + 1,
          }),
        },
        MODIFIER_MENU: {
          target: 'modificationMenu',
        },
        SUSPENDRE_LIVRAISONS: {
          target: 'livraisonsSuspendues',
        },
        ARRETER_SERVICE: {
          target: 'serviceArrete',
        },
      },

      meta: {
        description: 'Livraisons actives - repas préparés et livrés selon planning',
      },
    },

    modificationMenu: {
      on: {
        PERSONNALISER_MENU: {
          target: 'livraisonsActives',
          actions: assign({
            menuPersonnalise: true,
          }),
        },
      },

      meta: {
        description: 'Modification du menu suite à changement de besoins ou préférences',
      },
    },

    livraisonsSuspendues: {
      on: {
        REPRENDRE_LIVRAISONS: {
          target: 'livraisonsActives',
        },
        ARRETER_SERVICE: {
          target: 'serviceArrete',
        },
      },

      meta: {
        description: 'Livraisons suspendues temporairement (hospitalisation, vacances)',
      },
    },

    serviceArrete: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Service arrêté - fin de contrat ou amélioration autonomie',
      },
    },
  },
});

/**
 * Visualization of the meal delivery workflow:
 *
 * attente
 *   → evaluationBesoins
 *   → planificationRepas
 *   → personnalisationMenu
 *   → livraisonsActives
 *       ↓ [livraisons quotidiennes]
 *     livraisonsActives
 *       ↓
 *     modificationMenu → livraisonsActives
 */
