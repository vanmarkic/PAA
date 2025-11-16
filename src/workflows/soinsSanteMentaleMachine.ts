/**
 * XState machine for Soins de Santé Mentale (Mental Health Care) Workflow
 *
 * This state machine represents the workflow for accessing mental health care services,
 * including assessment, treatment plan, and ongoing therapy.
 */

import { createMachine, assign } from 'xstate';

interface PatientSanteMentale {
  nom: string;
  age: number;
  symptomes: string[];
  antecedents: string[];
}

interface PlanTraitement {
  typeTherapie: string;
  frequenceSeances: string;
  medicationPrescrite: boolean;
  dureeEstimee: number;
}

interface SoinsSanteMentaleContext {
  patient: PatientSanteMentale | null;
  plan: PlanTraitement | null;
  evaluationRealisee: boolean;
  traitementActif: boolean;
  seancesEffectuees: number;
  ameliorationObservee: boolean;
}

export const soinsSanteMentaleMachine = createMachine({
  id: 'soinsSanteMentale',
  initial: 'attente',

  schema: {
    context: {} as SoinsSanteMentaleContext,
    events: {} as
      | { type: 'DEMANDER_SOINS'; patient: PatientSanteMentale }
      | { type: 'EVALUATION_PSYCHIATRIQUE' }
      | { type: 'EVALUATION_TERMINEE' }
      | { type: 'ETABLIR_PLAN'; plan: PlanTraitement }
      | { type: 'COMMENCER_TRAITEMENT' }
      | { type: 'SEANCE_EFFECTUEE' }
      | { type: 'EVALUER_PROGRESSION' }
      | { type: 'AMELIORATION_OBSERVEE' }
      | { type: 'AJUSTER_TRAITEMENT' }
      | { type: 'TRAITEMENT_TERMINE' }
      | { type: 'CRISE_URGENCE' }
      | { type: 'CRISE_RESOLUE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    patient: null,
    plan: null,
    evaluationRealisee: false,
    traitementActif: false,
    seancesEffectuees: 0,
    ameliorationObservee: false,
  },

  states: {
    attente: {
      on: {
        DEMANDER_SOINS: {
          target: 'evaluationInitiale',
          actions: assign({
            patient: (_, event) => event.patient,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une nouvelle demande de soins de santé mentale',
      },
    },

    evaluationInitiale: {
      on: {
        EVALUATION_TERMINEE: {
          target: 'elaborationPlanTraitement',
          actions: assign({
            evaluationRealisee: true,
          }),
        },
        CRISE_URGENCE: {
          target: 'interventionCrise',
        },
      },

      meta: {
        description: 'Évaluation psychiatrique ou psychologique initiale',
      },
    },

    interventionCrise: {
      on: {
        CRISE_RESOLUE: {
          target: 'elaborationPlanTraitement',
        },
      },

      meta: {
        description: 'Intervention d\'urgence en cas de crise aiguë',
      },
    },

    elaborationPlanTraitement: {
      on: {
        ETABLIR_PLAN: {
          target: 'traitementEnCours',
          actions: assign({
            plan: (_, event) => event.plan,
            traitementActif: true,
          }),
        },
      },

      meta: {
        description: 'Élaboration du plan de traitement (thérapie, médication)',
      },
    },

    traitementEnCours: {
      on: {
        SEANCE_EFFECTUEE: {
          target: 'traitementEnCours',
          actions: assign({
            seancesEffectuees: (context) => context.seancesEffectuees + 1,
          }),
        },
        EVALUER_PROGRESSION: {
          target: 'evaluationProgression',
        },
        CRISE_URGENCE: {
          target: 'interventionCrise',
        },
        TRAITEMENT_TERMINE: {
          target: 'traitementTermine',
        },
      },

      meta: {
        description: 'Traitement en cours - séances régulières de thérapie',
      },
    },

    evaluationProgression: {
      on: {
        AMELIORATION_OBSERVEE: {
          target: 'traitementEnCours',
          actions: assign({
            ameliorationObservee: true,
          }),
        },
        AJUSTER_TRAITEMENT: {
          target: 'elaborationPlanTraitement',
        },
      },

      meta: {
        description: 'Évaluation de la progression et efficacité du traitement',
      },
    },

    traitementTermine: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Traitement terminé - amélioration significative ou objectifs atteints',
      },
    },
  },
});

/**
 * Visualization of the mental health care workflow:
 *
 * attente
 *   → evaluationInitiale
 *   → elaborationPlanTraitement
 *   → traitementEnCours
 *       ↓ [séances régulières]
 *     evaluationProgression
 *       ↓ (si amélioration)
 *     traitementEnCours
 *       ↓
 *     traitementTermine ✓
 */
