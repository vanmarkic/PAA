/**
 * XState machine for Assemblée Générale Workflow
 *
 * This state machine manages the complete lifecycle of a general assembly
 * from convocation to execution of decisions
 */

import { createMachine, assign } from 'xstate';
import {
  AssembleeGenerale,
  AssembleeType,
  Decision,
  QuorumInfo,
  Presence,
  ProcesVerbal,
  PointOrdreJour
} from '../../domain/coproprieteTypes';

interface AGContext {
  assemblee: AssembleeGenerale | null;
  convocationSent: boolean;
  documentsAttached: string[];
  quorumInfo: QuorumInfo | null;
  decisions: Decision[];
  pvReady: boolean;
  errors: string[];
  retryCount: number;
}

export const assembleeGeneraleMachine = createMachine({
  id: 'assembleeGenerale',
  initial: 'idle',

  schemas: {
    context: {} as AGContext,
    events: {} as
      | { type: 'PLANIFIER_AG'; assemblee: AssembleeGenerale }
      | { type: 'ENVOYER_CONVOCATION'; documents: string[] }
      | { type: 'CONVOCATION_ENVOYEE' }
      | { type: 'CONVOCATION_ECHOUEE'; error: string }
      | { type: 'DEMARRER_AG' }
      | { type: 'VERIFIER_QUORUM'; quorum: QuorumInfo }
      | { type: 'QUORUM_ATTEINT' }
      | { type: 'QUORUM_INSUFFISANT' }
      | { type: 'VOTER_DECISION'; decision: Decision }
      | { type: 'CLOTURER_AG' }
      | { type: 'REDIGER_PV'; pv: ProcesVerbal }
      | { type: 'SIGNER_PV' }
      | { type: 'EXECUTER_DECISIONS' }
      | { type: 'REPORTER_AG'; nouvelleDate: Date }
      | { type: 'ANNULER_AG'; motif: string }
      | { type: 'RESET' }
  },

  context: {
    assemblee: null,
    convocationSent: false,
    documentsAttached: [],
    quorumInfo: null,
    decisions: [],
    pvReady: false,
    errors: [],
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        PLANIFIER_AG: {
          target: 'planification',
          actions: assign({
            assemblee: ({ event }: { event: any }) => event.assemblee,
            errors: [],
            retryCount: 0,
          }),
        },
      },
      meta: {
        description: 'En attente de planification d\'une AG',
      },
    },

    planification: {
      on: {
        ENVOYER_CONVOCATION: {
          target: 'convocation',
          actions: assign({
            documentsAttached: ({ event }: { event: any }) => event.documents,
          }),
        },
        ANNULER_AG: {
          target: 'annulee',
          actions: assign({
            errors: ({ event }: { event: any }) => [event.motif],
          }),
        },
      },
      meta: {
        description: 'AG planifiée, préparation de la convocation',
      },
    },

    convocation: {
      on: {
        CONVOCATION_ENVOYEE: {
          target: 'convoquee',
          actions: assign({
            convocationSent: true,
          }),
        },
        CONVOCATION_ECHOUEE: [
          {
            target: 'convocation',
            guard: ({ context }) => context.retryCount < 3,
            actions: assign({
              retryCount: ({ context }) => context.retryCount + 1,
              errors: ({ context, event }: { context: any; event: any }) =>
                [...context.errors, event.error],
            }),
          },
          {
            target: 'erreur',
            actions: assign({
              errors: ({ context, event }: { context: any; event: any }) =>
                [...context.errors, 'Échec définitif de convocation'],
            }),
          },
        ],
      },
      meta: {
        description: 'Envoi des convocations en cours',
      },
    },

    convoquee: {
      on: {
        DEMARRER_AG: {
          target: 'verification_quorum',
        },
        REPORTER_AG: {
          target: 'reportee',
          actions: assign({
            assemblee: ({ context, event }: { context: any; event: any }) => ({
              ...context.assemblee,
              dateReunion: event.nouvelleDate,
            }),
          }),
        },
        ANNULER_AG: {
          target: 'annulee',
        },
      },
      meta: {
        description: 'AG convoquée, en attente de la date de réunion',
      },
    },

    verification_quorum: {
      on: {
        VERIFIER_QUORUM: {
          actions: assign({
            quorumInfo: ({ event }: { event: any }) => event.quorum,
          }),
        },
        QUORUM_ATTEINT: {
          target: 'en_cours',
        },
        QUORUM_INSUFFISANT: {
          target: 'quorum_insuffisant',
        },
      },
      meta: {
        description: 'Vérification du quorum',
      },
    },

    quorum_insuffisant: {
      on: {
        REPORTER_AG: {
          target: 'seconde_convocation',
          actions: assign({
            assemblee: ({ context, event }: { context: any; event: any }) => ({
              ...context.assemblee,
              dateReunion: event.nouvelleDate,
            }),
          }),
        },
        ANNULER_AG: {
          target: 'annulee',
        },
      },
      meta: {
        description: 'Quorum non atteint, AG doit être reportée',
      },
    },

    seconde_convocation: {
      on: {
        DEMARRER_AG: {
          target: 'en_cours', // Pas de quorum requis en 2ème convocation
        },
        ANNULER_AG: {
          target: 'annulee',
        },
      },
      meta: {
        description: 'Seconde convocation, pas de quorum minimum requis',
      },
    },

    en_cours: {
      on: {
        VOTER_DECISION: {
          actions: assign({
            decisions: ({ context, event }: { context: any; event: any }) =>
              [...context.decisions, event.decision],
          }),
        },
        CLOTURER_AG: {
          target: 'redaction_pv',
        },
      },
      meta: {
        description: 'AG en cours, vote des résolutions',
      },
    },

    redaction_pv: {
      on: {
        REDIGER_PV: {
          target: 'signature_pv',
          actions: assign({
            pvReady: true,
          }),
        },
      },
      meta: {
        description: 'Rédaction du procès-verbal',
      },
    },

    signature_pv: {
      on: {
        SIGNER_PV: {
          target: 'execution_decisions',
        },
      },
      meta: {
        description: 'Signature du PV par président et secrétaire',
      },
    },

    execution_decisions: {
      on: {
        EXECUTER_DECISIONS: {
          target: 'terminee',
        },
      },
      meta: {
        description: 'Exécution des décisions votées',
      },
    },

    reportee: {
      on: {
        ENVOYER_CONVOCATION: {
          target: 'convocation',
        },
        ANNULER_AG: {
          target: 'annulee',
        },
      },
      meta: {
        description: 'AG reportée à une date ultérieure',
      },
    },

    terminee: {
      on: {
        RESET: {
          target: 'idle',
          actions: assign({
            assemblee: null,
            convocationSent: false,
            documentsAttached: [],
            quorumInfo: null,
            decisions: [],
            pvReady: false,
            errors: [],
            retryCount: 0,
          }),
        },
      },
      meta: {
        description: 'AG terminée avec succès',
      },
    },

    annulee: {
      on: {
        RESET: {
          target: 'idle',
        },
      },
      meta: {
        description: 'AG annulée',
      },
    },

    erreur: {
      on: {
        RESET: {
          target: 'idle',
        },
      },
      meta: {
        description: 'Erreur dans le processus AG',
      },
    },
  },
});

/**
 * Visualization of AG workflow:
 *
 * idle → planification → convocation → convoquee
 *                                         ↓
 *                              verification_quorum
 *                                    ↓        ↓
 *                            quorum_atteint  quorum_insuffisant
 *                                    ↓              ↓
 *                               en_cours    seconde_convocation
 *                                    ↓              ↓
 *                            redaction_pv      en_cours
 *                                    ↓
 *                             signature_pv
 *                                    ↓
 *                          execution_decisions
 *                                    ↓
 *                               terminee
 */