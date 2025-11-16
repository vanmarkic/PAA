/**
 * XState machine for Accompagnement Social (Social Support) Workflow
 *
 * This state machine represents the workflow for social support services,
 * including assessment, personalized action plan, and ongoing support.
 */

import { createMachine, assign } from 'xstate';

interface Beneficiaire {
  nom: string;
  age: number;
  situationSociale: string;
  problematiques: string[];
}

interface PlanAccompagnement {
  objectifs: string[];
  dureeEnMois: number;
  frequenceRendezVous: string;
}

interface AccompagnementSocialContext {
  beneficiaire: Beneficiaire | null;
  plan: PlanAccompagnement | null;
  evaluationRealisee: boolean;
  accompagnementActif: boolean;
  rendezvousEffectues: number;
  objectifsAtteints: number;
}

export const accompagnementSocialMachine = createMachine({
  id: 'accompagnementSocial',
  initial: 'attente',

  schemas: {
    context: {} as AccompagnementSocialContext,
    events: {} as
      | { type: 'DEMANDER_ACCOMPAGNEMENT'; beneficiaire: Beneficiaire }
      | { type: 'REALISER_EVALUATION' }
      | { type: 'EVALUATION_TERMINEE' }
      | { type: 'ETABLIR_PLAN'; plan: PlanAccompagnement }
      | { type: 'PLAN_ACCEPTE' }
      | { type: 'PLAN_REFUSE' }
      | { type: 'RENDEZVOUS_EFFECTUE' }
      | { type: 'OBJECTIF_ATTEINT' }
      | { type: 'REEVALUER_SITUATION' }
      | { type: 'SUSPENDRE_ACCOMPAGNEMENT' }
      | { type: 'ACCOMPAGNEMENT_TERMINE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    beneficiaire: null,
    plan: null,
    evaluationRealisee: false,
    accompagnementActif: false,
    rendezvousEffectues: 0,
    objectifsAtteints: 0,
  },

  states: {
    attente: {
      on: {
        DEMANDER_ACCOMPAGNEMENT: {
          target: 'evaluationSociale',
          actions: assign({
            beneficiaire: (_, event) => event.beneficiaire,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une nouvelle demande d\'accompagnement social',
      },
    },

    evaluationSociale: {
      on: {
        EVALUATION_TERMINEE: {
          target: 'elaborationPlan',
          actions: assign({
            evaluationRealisee: true,
          }),
        },
      },

      meta: {
        description: 'Évaluation globale de la situation sociale et des besoins',
      },
    },

    elaborationPlan: {
      on: {
        ETABLIR_PLAN: {
          target: 'validationPlan',
          actions: assign({
            plan: (_, event) => event.plan,
          }),
        },
      },

      meta: {
        description: 'Élaboration d\'un plan d\'accompagnement personnalisé',
      },
    },

    validationPlan: {
      on: {
        PLAN_ACCEPTE: {
          target: 'accompagnementEnCours',
          actions: assign({
            accompagnementActif: true,
          }),
        },
        PLAN_REFUSE: {
          target: 'elaborationPlan',
        },
      },

      meta: {
        description: 'Validation du plan avec le bénéficiaire',
      },
    },

    accompagnementEnCours: {
      on: {
        RENDEZVOUS_EFFECTUE: {
          target: 'accompagnementEnCours',
          actions: assign({
            rendezvousEffectues: (context) => context.rendezvousEffectues + 1,
          }),
        },
        OBJECTIF_ATTEINT: {
          target: 'accompagnementEnCours',
          actions: assign({
            objectifsAtteints: (context) => context.objectifsAtteints + 1,
          }),
        },
        REEVALUER_SITUATION: {
          target: 'reevaluation',
        },
        ACCOMPAGNEMENT_TERMINE: {
          target: 'accompagnementTermine',
        },
        SUSPENDRE_ACCOMPAGNEMENT: {
          target: 'suspendu',
        },
      },

      meta: {
        description: 'Accompagnement actif - rendez-vous réguliers et suivi des objectifs',
      },
    },

    reevaluation: {
      on: {
        EVALUATION_TERMINEE: {
          target: 'elaborationPlan',
        },
      },

      meta: {
        description: 'Réévaluation de la situation pour ajuster le plan',
      },
    },

    suspendu: {
      on: {
        RENDEZVOUS_EFFECTUE: {
          target: 'accompagnementEnCours',
        },
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Accompagnement suspendu temporairement',
      },
    },

    accompagnementTermine: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Accompagnement terminé - objectifs atteints ou situation stabilisée',
      },
    },
  },
});

/**
 * Visualization of the social support workflow:
 *
 * attente
 *   → evaluationSociale
 *   → elaborationPlan
 *   → validationPlan
 *       ↓ (si accepté)
 *     accompagnementEnCours
 *       ↓ [rendez-vous réguliers]
 *     accompagnementEnCours
 *       ↓
 *     accompagnementTermine ✓
 */
