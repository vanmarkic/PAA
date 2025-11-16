/**
 * XState machine for Protection de l'Enfance (Child Protection) Workflow
 *
 * This state machine represents the workflow for child protection services,
 * including risk assessment, safety planning, and protective measures.
 */

import { createMachine, assign } from 'xstate';

interface Enfant {
  nom: string;
  age: number;
  situationFamiliale: string;
  signauxAlarme: string[];
}

interface EvaluationRisque {
  niveauDanger: string;
  facteurs: string[];
  mesuresRecommandees: string[];
}

interface ProtectionEnfanceContext {
  enfant: Enfant | null;
  evaluation: EvaluationRisque | null;
  signalementRecu: boolean;
  mesuresProtection: string[];
  placementEffectue: boolean;
  suiviActif: boolean;
}

export const protectionEnfanceMachine = createMachine({
  id: 'protectionEnfance',
  initial: 'attente',

  types: {} as {
    context: ProtectionEnfanceContext;
    events:
      | { type: 'SIGNALEMENT_RECU'; enfant: Enfant }
      | { type: 'EVALUER_SITUATION' }
      | { type: 'EVALUATION_TERMINEE'; evaluation: EvaluationRisque }
      | { type: 'DANGER_IMMEDIAT' }
      | { type: 'RISQUE_MODERE' }
      | { type: 'PAS_DE_DANGER' }
      | { type: 'PLACER_ENFANT' }
      | { type: 'AIDE_EDUCATIVE' }
      | { type: 'SUIVRE_FAMILLE' }
      | { type: 'SITUATION_AMELIOREE' }
      | { type: 'RETOUR_FAMILLE' }
      | { type: 'CLOTURER_DOSSIER' }
      | { type: 'REINITIALISER' };
  },

  context: {
    enfant: null,
    evaluation: null,
    signalementRecu: false,
    mesuresProtection: [] as string[],
    placementEffectue: false,
    suiviActif: false,
  },

  states: {
    attente: {
      on: {
        SIGNALEMENT_RECU: {
          target: 'evaluationSignalement',
          actions: assign({
            enfant: ({ event }) => event.enfant,
            signalementRecu: true,
          }),
        },
      },

      meta: {
        description: 'En attente d\'un nouveau signalement concernant un enfant en danger',
      },
    },

    evaluationSignalement: {
      on: {
        EVALUATION_TERMINEE: {
          target: 'analyseDanger',
          actions: assign({
            evaluation: ({ event }) => event.evaluation,
          }),
        },
      },

      meta: {
        description: 'Évaluation initiale du signalement et de la situation',
      },
    },

    analyseDanger: {
      on: {
        DANGER_IMMEDIAT: {
          target: 'mesuresUrgence',
        },
        RISQUE_MODERE: {
          target: 'aideEducative',
        },
        PAS_DE_DANGER: {
          target: 'signalementNonFonde',
        },
      },

      meta: {
        description: 'Analyse du niveau de danger et détermination des mesures',
      },
    },

    signalementNonFonde: {
      on: {
        CLOTURER_DOSSIER: {
          target: 'dossierCloture',
        },
      },

      meta: {
        description: 'Signalement non fondé - pas de danger avéré',
      },
    },

    mesuresUrgence: {
      on: {
        PLACER_ENFANT: {
          target: 'placementProtection',
          actions: assign({
            placementEffectue: true,
            mesuresProtection: ['placement_urgence'],
          }),
        },
      },

      meta: {
        description: 'Mesures d\'urgence - retrait immédiat de l\'enfant si danger grave',
      },
    },

    placementProtection: {
      on: {
        SUIVRE_FAMILLE: {
          target: 'suiviFamilial',
        },
        RETOUR_FAMILLE: {
          target: 'retourProgessif',
        },
      },

      meta: {
        description: 'Placement en famille d\'accueil ou institution de protection',
      },
    },

    aideEducative: {
      on: {
        SUIVRE_FAMILLE: {
          target: 'suiviFamilial',
          actions: assign({
            suiviActif: true,
            mesuresProtection: ['aide_educative'],
          }),
        },
      },

      meta: {
        description: 'Aide éducative en milieu ouvert - soutien à la famille',
      },
    },

    suiviFamilial: {
      on: {
        SITUATION_AMELIOREE: {
          target: 'evaluationProgression',
        },
        DANGER_IMMEDIAT: {
          target: 'mesuresUrgence',
        },
      },

      meta: {
        description: 'Suivi régulier de la famille et évaluation de l\'évolution',
      },
    },

    evaluationProgression: {
      on: {
        RETOUR_FAMILLE: {
          target: 'retourProgessif',
        },
        CLOTURER_DOSSIER: {
          target: 'dossierCloture',
        },
      },

      meta: {
        description: 'Évaluation de la progression et décision sur la suite',
      },
    },

    retourProgessif: {
      on: {
        SUIVRE_FAMILLE: {
          target: 'suiviFamilial',
        },
        CLOTURER_DOSSIER: {
          target: 'dossierCloture',
        },
      },

      meta: {
        description: 'Retour progressif de l\'enfant dans sa famille avec suivi',
      },
    },

    dossierCloture: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Dossier clôturé - situation stabilisée ou enfant protégé',
      },
    },
  },
});

/**
 * Visualization of the child protection workflow:
 *
 * attente
 *   → evaluationSignalement
 *   → analyseDanger
 *       ↓ (selon niveau de danger)
 *     [mesuresUrgence / aideEducative / signalementNonFonde]
 *       ↓
 *     placementProtection ou suiviFamilial
 *       ↓
 *     evaluationProgression
 *       ↓
 *     dossierCloture ✓
 */
