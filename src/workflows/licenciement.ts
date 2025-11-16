/**
 * Machine XState pour le Licenciement
 *
 * Cette machine d'état représente le processus de licenciement en Belgique,
 * incluant la justification, la procédure légale et les indemnités.
 */

import { createMachine, assign } from 'xstate';

interface LicenciementContext {
  employe: string | null;
  motif: string | null;
  typeMotif: 'grave' | 'economique' | 'reorganisation' | null;
  preuves: string[];
  dateNotification: Date | null;
  indemnite: number;
  contestation: boolean;
  retryCount: number;
}

export const licenciementMachine = createMachine({
  id: 'licenciement',
  initial: 'idle',

  schema: {
    context: {} as LicenciementContext,
    events: {} as
      | { type: 'INITIER_LICENCIEMENT'; employe: string; motif: string; typeMotif: 'grave' | 'economique' | 'reorganisation' }
      | { type: 'RASSEMBLER_PREUVES'; preuves: string[] }
      | { type: 'VALIDER_MOTIF' }
      | { type: 'MOTIF_VALIDE' }
      | { type: 'MOTIF_INSUFFISANT' }
      | { type: 'NOTIFIER_EMPLOYE'; dateNotification: Date }
      | { type: 'CALCULER_INDEMNITE'; indemnite: number }
      | { type: 'CONTESTER_LICENCIEMENT' }
      | { type: 'ACCEPTER_LICENCIEMENT' }
      | { type: 'MEDIATION_REUSSIE' }
      | { type: 'MEDIATION_ECHOUEE' }
      | { type: 'JUGEMENT_FAVORABLE' }
      | { type: 'JUGEMENT_DEFAVORABLE' }
      | { type: 'FINALISER_LICENCIEMENT' }
      | { type: 'RESET' }
  },

  context: {
    employe: null,
    motif: null,
    typeMotif: null,
    preuves: [],
    dateNotification: null,
    indemnite: 0,
    contestation: false,
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        INITIER_LICENCIEMENT: {
          target: 'collectePreuves',
          actions: assign({
            employe: (_, event) => event.employe,
            motif: (_, event) => event.motif,
            typeMotif: (_, event) => event.typeMotif,
            retryCount: 0,
          }),
        },
      },

      meta: {
        description: 'En attente d\'initiation de procédure de licenciement',
      },
    },

    collectePreuves: {
      on: {
        RASSEMBLER_PREUVES: {
          target: 'validationMotif',
          actions: assign({
            preuves: (_, event) => event.preuves,
          }),
        },
      },

      meta: {
        description: 'Collecte des preuves justifiant le licenciement',
      },
    },

    validationMotif: {
      on: {
        MOTIF_VALIDE: {
          target: 'notification',
        },
        MOTIF_INSUFFISANT: {
          target: 'collectePreuves',
          actions: assign({
            retryCount: (context) => context.retryCount + 1,
          }),
        },
      },

      meta: {
        description: 'Validation juridique du motif de licenciement',
      },
    },

    notification: {
      on: {
        NOTIFIER_EMPLOYE: {
          target: 'calculIndemnite',
          actions: assign({
            dateNotification: (_, event) => event.dateNotification,
          }),
        },
      },

      meta: {
        description: 'Notification officielle du licenciement à l\'employé',
      },
    },

    calculIndemnite: {
      on: {
        CALCULER_INDEMNITE: {
          target: 'attentReaction',
          actions: assign({
            indemnite: (_, event) => event.indemnite,
          }),
        },
      },

      meta: {
        description: 'Calcul des indemnités de licenciement',
      },
    },

    attentReaction: {
      on: {
        CONTESTER_LICENCIEMENT: {
          target: 'contestation',
          actions: assign({
            contestation: true,
          }),
        },
        ACCEPTER_LICENCIEMENT: {
          target: 'finalise',
        },
      },

      meta: {
        description: 'En attente de la réaction de l\'employé',
      },
    },

    contestation: {
      on: {
        MEDIATION_REUSSIE: {
          target: 'finalise',
        },
        MEDIATION_ECHOUEE: {
          target: 'procedure_judiciaire',
        },
      },

      meta: {
        description: 'Processus de contestation et médiation',
      },
    },

    procedure_judiciaire: {
      on: {
        JUGEMENT_FAVORABLE: {
          target: 'finalise',
        },
        JUGEMENT_DEFAVORABLE: {
          target: 'reintegration',
        },
      },

      meta: {
        description: 'Procédure judiciaire au tribunal du travail',
      },
    },

    reintegration: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Licenciement annulé - réintégration de l\'employé',
      },
    },

    finalise: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Licenciement finalisé et accepté',
      },
    },
  },
});

/**
 * Visualisation du workflow du licenciement:
 *
 * idle
 *   → collectePreuves
 *   → validationMotif
 *   → notification
 *   → calculIndemnite
 *   → attentReaction
 *       ↓ (accepté)              ↓ (contesté)
 *     finalise                 contestation
 *                                  ↓
 *                            procedure_judiciaire
 *                              ↓            ↓
 *                         (favorable)  (défavorable)
 *                              ↓            ↓
 *                           finalise    reintegration
 */
