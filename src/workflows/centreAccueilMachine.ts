/**
 * XState machine for Centre d'Accueil (Reception Center) Workflow
 *
 * This state machine represents the workflow for reception center services,
 * including intake, needs assessment, orientation, and service provision.
 */

import { createMachine, assign } from 'xstate';

interface PersonneAccueillie {
  nom: string;
  age: number;
  nationalite: string;
  situationAdministrative: string;
  besoinsImmerdiats: string[];
}

interface PlanAccueil {
  dureeEstimee: number;
  servicesAttribues: string[];
  accompagnement: string;
}

interface CentreAccueilContext {
  personne: PersonneAccueillie | null;
  plan: PlanAccueil | null;
  accueilActif: boolean;
  servicesRecus: number;
  situationRegularisee: boolean;
}

export const centreAccueilMachine = createMachine({
  id: 'centreAccueil',
  initial: 'attente',

  schemas: {
    context: {} as CentreAccueilContext,
    events: {} as
      | { type: 'ACCUEILLIR_PERSONNE'; personne: PersonneAccueillie }
      | { type: 'EVALUER_BESOINS' }
      | { type: 'BESOINS_IDENTIFIES' }
      | { type: 'ETABLIR_PLAN'; plan: PlanAccueil }
      | { type: 'FOURNIR_SERVICE' }
      | { type: 'REGULARISER_SITUATION' }
      | { type: 'SITUATION_REGULARISEE' }
      | { type: 'ORIENTER_SERVICES_SPECIALISES' }
      | { type: 'SORTIE_CENTRE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    personne: null,
    plan: null,
    accueilActif: false,
    servicesRecus: 0,
    situationRegularisee: false,
  },

  states: {
    attente: {
      on: {
        ACCUEILLIR_PERSONNE: {
          target: 'accueilInitial',
          actions: assign({
            personne: (_, event) => event.personne,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une nouvelle arrivée au centre d\'accueil',
      },
    },

    accueilInitial: {
      on: {
        EVALUER_BESOINS: {
          target: 'evaluationBesoins',
        },
      },

      meta: {
        description: 'Accueil initial - enregistrement et premiers soins si nécessaire',
      },
    },

    evaluationBesoins: {
      on: {
        BESOINS_IDENTIFIES: {
          target: 'elaborationPlan',
        },
      },

      meta: {
        description: 'Évaluation des besoins (hébergement, santé, administratif, social)',
      },
    },

    elaborationPlan: {
      on: {
        ETABLIR_PLAN: {
          target: 'sejourCentre',
          actions: assign({
            plan: (_, event) => event.plan,
            accueilActif: true,
          }),
        },
      },

      meta: {
        description: 'Élaboration du plan d\'accueil et d\'accompagnement',
      },
    },

    sejourCentre: {
      on: {
        FOURNIR_SERVICE: {
          target: 'sejourCentre',
          actions: assign({
            servicesRecus: (context) => context.servicesRecus + 1,
          }),
        },
        REGULARISER_SITUATION: {
          target: 'regularisationAdministrative',
        },
        ORIENTER_SERVICES_SPECIALISES: {
          target: 'orientationExterne',
        },
        SORTIE_CENTRE: {
          target: 'sortieCentre',
        },
      },

      meta: {
        description: 'Séjour au centre - services quotidiens et accompagnement',
      },
    },

    regularisationAdministrative: {
      on: {
        SITUATION_REGULARISEE: {
          target: 'sejourCentre',
          actions: assign({
            situationRegularisee: true,
          }),
        },
      },

      meta: {
        description: 'Régularisation de la situation administrative (titre de séjour, etc.)',
      },
    },

    orientationExterne: {
      on: {
        SORTIE_CENTRE: {
          target: 'sortieCentre',
        },
      },

      meta: {
        description: 'Orientation vers services spécialisés externes',
      },
    },

    sortieCentre: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Sortie du centre - transition vers autonomie ou structure adaptée',
      },
    },
  },
});

/**
 * Visualization of the reception center workflow:
 *
 * attente
 *   → accueilInitial
 *   → evaluationBesoins
 *   → elaborationPlan
 *   → sejourCentre
 *       ↓ [services quotidiens]
 *     regularisationAdministrative
 *       ↓
 *     sejourCentre
 *       ↓
 *     sortieCentre ✓
 */
