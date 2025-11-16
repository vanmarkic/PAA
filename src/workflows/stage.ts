/**
 * Machine XState pour le Stage
 *
 * Cette machine d'état représente le processus de stage en Belgique,
 * incluant la convention de stage, le suivi et l'évaluation.
 */

import { createMachine, assign } from 'xstate';

interface StageContext {
  stagiaire: string | null;
  entreprise: string | null;
  etablissementEnseignement: string | null;
  typeStage: 'observation' | 'immersion' | 'insertion' | null;
  duree: number;
  dateDebut: Date | null;
  dateFin: Date | null;
  conventionSignee: boolean;
  assuranceValide: boolean;
  tuteur: string | null;
  evaluations: number[];
  retryCount: number;
}

export const stageMachine = createMachine({
  id: 'stage',
  initial: 'idle',

  schemas: {
    context: {} as StageContext,
    events: {} as
      | { type: 'INITIER_STAGE'; stagiaire: string; entreprise: string; etablissementEnseignement: string; typeStage: 'observation' | 'immersion' | 'insertion' }
      | { type: 'DEFINIR_MODALITES'; duree: number; dateDebut: Date; dateFin: Date }
      | { type: 'VERIFIER_ASSURANCE' }
      | { type: 'ASSURANCE_VALIDE' }
      | { type: 'ASSURANCE_INVALIDE' }
      | { type: 'PREPARER_CONVENTION' }
      | { type: 'SIGNER_CONVENTION' }
      | { type: 'DESIGNER_TUTEUR'; tuteur: string }
      | { type: 'COMMENCER_STAGE' }
      | { type: 'EVALUATION_INTERMEDIAIRE'; note: number }
      | { type: 'PROBLEME_DETECTE'; description: string }
      | { type: 'PROBLEME_RESOLU' }
      | { type: 'INTERROMPRE_STAGE'; raison: string }
      | { type: 'EVALUATION_FINALE'; note: number }
      | { type: 'STAGE_REUSSI' }
      | { type: 'STAGE_ECHOUE' }
      | { type: 'EMETTRE_ATTESTATION' }
      | { type: 'RESET' }
  },

  context: {
    stagiaire: null,
    entreprise: null,
    etablissementEnseignement: null,
    typeStage: null,
    duree: 0,
    dateDebut: null,
    dateFin: null,
    conventionSignee: false,
    assuranceValide: false,
    tuteur: null,
    evaluations: [],
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        INITIER_STAGE: {
          target: 'definitionModalites',
          actions: assign({
            stagiaire: (_, event) => event.stagiaire,
            entreprise: (_, event) => event.entreprise,
            etablissementEnseignement: (_, event) => event.etablissementEnseignement,
            typeStage: (_, event) => event.typeStage,
            retryCount: 0,
          }),
        },
      },

      meta: {
        description: 'Pas de stage en cours',
      },
    },

    definitionModalites: {
      on: {
        DEFINIR_MODALITES: {
          target: 'verificationAssurance',
          actions: assign({
            duree: (_, event) => event.duree,
            dateDebut: (_, event) => event.dateDebut,
            dateFin: (_, event) => event.dateFin,
          }),
        },
      },

      meta: {
        description: 'Définition des modalités du stage (durée, dates, objectifs)',
      },
    },

    verificationAssurance: {
      on: {
        ASSURANCE_VALIDE: {
          target: 'preparationConvention',
          actions: assign({
            assuranceValide: true,
          }),
        },
        ASSURANCE_INVALIDE: {
          target: 'assuranceManquante',
        },
      },

      meta: {
        description: 'Vérification de l\'assurance responsabilité civile',
      },
    },

    assuranceManquante: {
      on: {
        VERIFIER_ASSURANCE: {
          target: 'verificationAssurance',
        },
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Assurance manquante ou invalide - stage impossible',
      },
    },

    preparationConvention: {
      on: {
        PREPARER_CONVENTION: {
          target: 'signatureConvention',
        },
      },

      meta: {
        description: 'Préparation de la convention tripartite de stage',
      },
    },

    signatureConvention: {
      on: {
        SIGNER_CONVENTION: {
          target: 'designationTuteur',
          actions: assign({
            conventionSignee: true,
          }),
        },
      },

      meta: {
        description: 'Signature de la convention par les trois parties',
      },
    },

    designationTuteur: {
      on: {
        DESIGNER_TUTEUR: {
          target: 'pretPourDebut',
          actions: assign({
            tuteur: (_, event) => event.tuteur,
          }),
        },
      },

      meta: {
        description: 'Désignation d\'un tuteur/maître de stage',
      },
    },

    pretPourDebut: {
      on: {
        COMMENCER_STAGE: {
          target: 'stageEnCours',
        },
      },

      meta: {
        description: 'Toutes les formalités complètes - prêt pour début',
      },
    },

    stageEnCours: {
      on: {
        EVALUATION_INTERMEDIAIRE: {
          target: 'evaluationIntermediaire',
        },
        PROBLEME_DETECTE: {
          target: 'gestionProbleme',
        },
        EVALUATION_FINALE: {
          target: 'evaluationFinale',
        },
        INTERROMPRE_STAGE: {
          target: 'interrompu',
        },
      },

      meta: {
        description: 'Stage en cours - stagiaire en entreprise',
      },
    },

    evaluationIntermediaire: {
      on: {
        EVALUATION_INTERMEDIAIRE: {
          target: 'stageEnCours',
          actions: assign({
            evaluations: (context, event) => [...context.evaluations, event.note],
          }),
        },
      },

      meta: {
        description: 'Évaluation intermédiaire du stagiaire',
      },
    },

    gestionProbleme: {
      on: {
        PROBLEME_RESOLU: {
          target: 'stageEnCours',
        },
        INTERROMPRE_STAGE: {
          target: 'interrompu',
        },
      },

      meta: {
        description: 'Gestion d\'un problème durant le stage',
      },
    },

    evaluationFinale: {
      on: {
        STAGE_REUSSI: {
          target: 'reussi',
        },
        STAGE_ECHOUE: {
          target: 'echoue',
        },
      },

      meta: {
        description: 'Évaluation finale et notation du stage',
      },
    },

    reussi: {
      on: {
        EMETTRE_ATTESTATION: {
          target: 'termine',
        },
      },

      meta: {
        description: 'Stage réussi - émission de l\'attestation',
      },
    },

    echoue: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Stage échoué - objectives non atteints',
      },
    },

    interrompu: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Stage interrompu prématurément',
      },
    },

    termine: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Stage terminé avec succès et attestation émise',
      },
    },
  },
});

/**
 * Visualisation du workflow du stage:
 *
 * idle
 *   → definitionModalites
 *   → verificationAssurance
 *   → preparationConvention
 *   → signatureConvention
 *   → designationTuteur
 *   → pretPourDebut
 *   → stageEnCours
 *       ↓
 *   [évaluations/problèmes]
 *       ↓
 *   evaluationFinale
 *       ↓ (réussi)        ↓ (échoué)
 *     reussi            echoue
 *       ↓
 *     termine
 */
