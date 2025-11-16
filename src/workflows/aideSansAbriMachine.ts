/**
 * XState machine for Aide aux Sans-Abri (Homeless Assistance) Workflow
 *
 * This state machine represents the workflow for homeless assistance services,
 * including emergency shelter, social reintegration, and permanent housing.
 */

import { createMachine, assign } from 'xstate';

interface PersonneSansAbri {
  nom: string;
  age: number;
  dureeSansAbri: number;
  situationMedicale: string;
  addictions: boolean;
}

interface PlanReintegration {
  hebergementType: string;
  accompagnementSocial: boolean;
  soinsMedicaux: boolean;
  objectifsReintegration: string[];
}

interface AideSansAbriContext {
  personne: PersonneSansAbri | null;
  plan: PlanReintegration | null;
  hebergementActif: boolean;
  etapesCompletees: number;
  logementPermanent: boolean;
}

export const aideSansAbriMachine = createMachine({
  id: 'aideSansAbri',
  initial: 'attente',

  schemas: {
    context: {} as AideSansAbriContext,
    events: {} as
      | { type: 'SIGNALER_PERSONNE'; personne: PersonneSansAbri }
      | { type: 'EVALUATION_SOCIALE' }
      | { type: 'EVALUATION_TERMINEE' }
      | { type: 'HEBERGEMENT_URGENCE' }
      | { type: 'ETABLIR_PLAN'; plan: PlanReintegration }
      | { type: 'INTEGRER_STRUCTURE' }
      | { type: 'ETAPE_COMPLETEE' }
      | { type: 'LOGEMENT_TROUVE' }
      | { type: 'REINTEGRATION_REUSSIE' }
      | { type: 'RETOUR_RUE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    personne: null,
    plan: null,
    hebergementActif: false,
    etapesCompletees: 0,
    logementPermanent: false,
  },

  states: {
    attente: {
      on: {
        SIGNALER_PERSONNE: {
          target: 'premierContact',
          actions: assign({
            personne: (_, event) => event.personne,
          }),
        },
      },

      meta: {
        description: 'En attente d\'un nouveau signalement de personne sans-abri',
      },
    },

    premierContact: {
      on: {
        HEBERGEMENT_URGENCE: {
          target: 'hebergementUrgence',
        },
        EVALUATION_SOCIALE: {
          target: 'evaluationSituation',
        },
      },

      meta: {
        description: 'Premier contact et évaluation des besoins immédiats',
      },
    },

    hebergementUrgence: {
      on: {
        EVALUATION_TERMINEE: {
          target: 'elaborationPlanReintegration',
          actions: assign({
            hebergementActif: true,
          }),
        },
      },

      meta: {
        description: 'Hébergement d\'urgence - mise à l\'abri immédiate',
      },
    },

    evaluationSituation: {
      on: {
        EVALUATION_TERMINEE: {
          target: 'elaborationPlanReintegration',
        },
      },

      meta: {
        description: 'Évaluation approfondie de la situation sociale et médicale',
      },
    },

    elaborationPlanReintegration: {
      on: {
        ETABLIR_PLAN: {
          target: 'accompagnementReintegration',
          actions: assign({
            plan: (_, event) => event.plan,
          }),
        },
      },

      meta: {
        description: 'Élaboration d\'un plan de réintégration personnalisé',
      },
    },

    accompagnementReintegration: {
      on: {
        INTEGRER_STRUCTURE: {
          target: 'hebergementTransition',
        },
        RETOUR_RUE: {
          target: 'retourRue',
        },
      },

      meta: {
        description: 'Accompagnement social et orientation vers structures adaptées',
      },
    },

    hebergementTransition: {
      on: {
        ETAPE_COMPLETEE: {
          target: 'hebergementTransition',
          actions: assign({
            etapesCompletees: (context) => context.etapesCompletees + 1,
          }),
        },
        LOGEMENT_TROUVE: {
          target: 'rechercheLogement',
        },
        RETOUR_RUE: {
          target: 'retourRue',
        },
      },

      meta: {
        description: 'Hébergement de transition - stabilisation progressive',
      },
    },

    rechercheLogement: {
      on: {
        REINTEGRATION_REUSSIE: {
          target: 'logementPermanent',
          actions: assign({
            logementPermanent: true,
          }),
        },
      },

      meta: {
        description: 'Recherche et attribution d\'un logement permanent',
      },
    },

    logementPermanent: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Réintégration réussie - logement permanent attribué',
      },
    },

    retourRue: {
      on: {
        SIGNALER_PERSONNE: {
          target: 'premierContact',
        },
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Retour à la rue - échec de la réintégration',
      },
    },
  },
});

/**
 * Visualization of the homeless assistance workflow:
 *
 * attente
 *   → premierContact
 *   → hebergementUrgence
 *   → elaborationPlanReintegration
 *   → accompagnementReintegration
 *   → hebergementTransition
 *   → rechercheLogement
 *   → logementPermanent ✓
 */
