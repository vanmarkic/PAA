/**
 * XState machine for Formation Professionnelle (Professional Training) Workflow
 *
 * This state machine represents the workflow for professional training programs,
 * including orientation, enrollment, training completion, and certification.
 */

import { createMachine, assign } from 'xstate';

interface Stagiaire {
  nom: string;
  age: number;
  niveauActuel: string;
  domaineInteresse: string;
}

interface FormationChoisie {
  titre: string;
  dureeEnHeures: number;
  typeFormation: string;
  certification: string;
}

interface FormationProfessionnelleContext {
  stagiaire: Stagiaire | null;
  formation: FormationChoisie | null;
  orientationRealisee: boolean;
  inscriptionValidee: boolean;
  heuresCompletees: number;
  evaluationsReussies: number;
  certificationObtenue: boolean;
}

export const formationProfessionnelleMachine = createMachine({
  id: 'formationProfessionnelle',
  initial: 'attente',

  schemas: {
    context: {} as FormationProfessionnelleContext,
    events: {} as
      | { type: 'DEMANDER_FORMATION'; stagiaire: Stagiaire }
      | { type: 'ORIENTATION_TERMINEE' }
      | { type: 'CHOISIR_FORMATION'; formation: FormationChoisie }
      | { type: 'VALIDER_INSCRIPTION' }
      | { type: 'INSCRIPTION_REFUSEE' }
      | { type: 'COMMENCER_FORMATION' }
      | { type: 'COMPLETER_MODULE'; heures: number }
      | { type: 'REUSSIR_EVALUATION' }
      | { type: 'ECHOUER_EVALUATION' }
      | { type: 'PASSER_EXAMEN_FINAL' }
      | { type: 'OBTENIR_CERTIFICATION' }
      | { type: 'ABANDONNER' }
      | { type: 'REINITIALISER' }
  },

  context: {
    stagiaire: null,
    formation: null,
    orientationRealisee: false,
    inscriptionValidee: false,
    heuresCompletees: 0,
    evaluationsReussies: 0,
    certificationObtenue: false,
  },

  states: {
    attente: {
      on: {
        DEMANDER_FORMATION: {
          target: 'orientationProfessionnelle',
          actions: assign({
            stagiaire: ({ event }) => event.stagiaire,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une nouvelle demande de formation professionnelle',
      },
    },

    orientationProfessionnelle: {
      on: {
        ORIENTATION_TERMINEE: {
          target: 'selectionFormation',
          actions: assign({
            orientationRealisee: true,
          }),
        },
      },

      meta: {
        description: 'Orientation professionnelle pour identifier le parcours adapté',
      },
    },

    selectionFormation: {
      on: {
        CHOISIR_FORMATION: {
          target: 'inscriptionFormation',
          actions: assign({
            formation: ({ event }) => event.formation,
          }),
        },
      },

      meta: {
        description: 'Sélection de la formation adaptée aux objectifs professionnels',
      },
    },

    inscriptionFormation: {
      on: {
        VALIDER_INSCRIPTION: {
          target: 'formationEnCours',
          actions: assign({
            inscriptionValidee: true,
          }),
        },
        INSCRIPTION_REFUSEE: {
          target: 'inscriptionRefusee',
        },
      },

      meta: {
        description: 'Inscription à la formation (vérification prérequis et places)',
      },
    },

    inscriptionRefusee: {
      on: {
        CHOISIR_FORMATION: {
          target: 'inscriptionFormation',
          actions: assign({
            formation: ({ event }) => event.formation,
          }),
        },
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Inscription refusée - places complètes ou prérequis non satisfaits',
      },
    },

    formationEnCours: {
      on: {
        COMPLETER_MODULE: {
          target: 'formationEnCours',
          actions: assign({
            heuresCompletees: ({ context, event }) => context.heuresCompletees + event.heures,
          }),
        },
        REUSSIR_EVALUATION: {
          target: 'formationEnCours',
          actions: assign({ evaluationsReussies: ({ context }) => context.evaluationsReussies + 1,
          }),
        },
        ECHOUER_EVALUATION: {
          target: 'rattrapageEvaluation',
        },
        PASSER_EXAMEN_FINAL: {
          target: 'examenFinal',
        },
        ABANDONNER: {
          target: 'formationAbandonnee',
        },
      },

      meta: {
        description: 'Formation en cours - modules théoriques et pratiques',
      },
    },

    rattrapageEvaluation: {
      on: {
        REUSSIR_EVALUATION: {
          target: 'formationEnCours',
          actions: assign({ evaluationsReussies: ({ context }) => context.evaluationsReussies + 1,
          }),
        },
        ECHOUER_EVALUATION: {
          target: 'formationAbandonnee',
        },
      },

      meta: {
        description: 'Rattrapage d\'évaluation échouée',
      },
    },

    examenFinal: {
      on: {
        OBTENIR_CERTIFICATION: {
          target: 'formationTerminee',
          actions: assign({
            certificationObtenue: true,
          }),
        },
        ECHOUER_EVALUATION: {
          target: 'formationAbandonnee',
        },
      },

      meta: {
        description: 'Examen final pour obtention de la certification',
      },
    },

    formationTerminee: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Formation terminée avec succès - certification obtenue',
      },
    },

    formationAbandonnee: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Formation abandonnée ou échec aux évaluations',
      },
    },
  },
});

/**
 * Visualization of the professional training workflow:
 *
 * attente
 *   → orientationProfessionnelle
 *   → selectionFormation
 *   → inscriptionFormation
 *       ↓ (si validée)
 *     formationEnCours
 *       ↓ [modules et évaluations]
 *     examenFinal
 *       ↓
 *     formationTerminee ✓
 */
