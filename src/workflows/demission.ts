/**
 * Machine XState pour la Démission
 *
 * Cette machine d'état représente le processus de démission d'un employé en Belgique,
 * incluant la notification, le préavis et la finalisation.
 */

import { createMachine, assign } from 'xstate';

interface DemissionContext {
  employe: string | null;
  dateNotification: Date | null;
  motifDemission: string | null;
  dureePreavis: number;
  dateFinContrat: Date | null;
  documentsRemis: boolean;
  indemniteAPayer: number;
  retryCount: number;
}

export const demissionMachine = createMachine({
  id: 'demission',
  initial: 'idle',

  schemas: {
    context: {} as DemissionContext,
    events: {} as
      | { type: 'NOTIFIER_DEMISSION'; employe: string; motifDemission: string }
      | { type: 'ENREGISTRER_NOTIFICATION'; dateNotification: Date }
      | { type: 'CALCULER_PREAVIS'; dureePreavis: number }
      | { type: 'CONFIRMER_DATE_FIN'; dateFinContrat: Date }
      | { type: 'DEMANDER_DISPENSE' }
      | { type: 'DISPENSE_ACCORDEE' }
      | { type: 'DISPENSE_REFUSEE' }
      | { type: 'RACHETER_PREAVIS'; indemnite: number }
      | { type: 'COMPLETER_PREAVIS' }
      | { type: 'REMETTRE_DOCUMENTS' }
      | { type: 'FINALISER_DEMISSION' }
      | { type: 'RESET' }
  },

  context: {
    employe: null,
    dateNotification: null,
    motifDemission: null,
    dureePreavis: 0,
    dateFinContrat: null,
    documentsRemis: false,
    indemniteAPayer: 0,
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        NOTIFIER_DEMISSION: {
          target: 'notificationEnregistree',
          actions: assign({
            employe: ({ event }) => event.employe,
            motifDemission: ({ event }) => event.motifDemission,
            retryCount: 0,
          }),
        },
      },

      meta: {
        description: 'En attente de notification de démission',
      },
    },

    notificationEnregistree: {
      on: {
        ENREGISTRER_NOTIFICATION: {
          target: 'calculPreavis',
          actions: assign({
            dateNotification: ({ event }) => event.dateNotification,
          }),
        },
      },

      meta: {
        description: 'Démission notifiée et enregistrée officiellement',
      },
    },

    calculPreavis: {
      on: {
        CALCULER_PREAVIS: {
          target: 'confirmationDateFin',
          actions: assign({
            dureePreavis: ({ event }) => event.dureePreavis,
          }),
        },
      },

      meta: {
        description: 'Calcul de la durée légale du préavis de démission',
      },
    },

    confirmationDateFin: {
      on: {
        CONFIRMER_DATE_FIN: {
          target: 'optionsPreavis',
          actions: assign({
            dateFinContrat: ({ event }) => event.dateFinContrat,
          }),
        },
      },

      meta: {
        description: 'Confirmation de la date de fin du contrat',
      },
    },

    optionsPreavis: {
      on: {
        DEMANDER_DISPENSE: {
          target: 'demandeDispense',
        },
        RACHETER_PREAVIS: {
          target: 'rachatPreavis',
        },
        COMPLETER_PREAVIS: {
          target: 'executionPreavis',
        },
      },

      meta: {
        description: 'Choix des options pour le préavis (dispense, rachat, exécution)',
      },
    },

    demandeDispense: {
      on: {
        DISPENSE_ACCORDEE: {
          target: 'remiseDocuments',
        },
        DISPENSE_REFUSEE: {
          target: 'executionPreavis',
        },
      },

      meta: {
        description: 'Demande de dispense de prestations de préavis',
      },
    },

    rachatPreavis: {
      on: {
        RACHETER_PREAVIS: {
          target: 'remiseDocuments',
          actions: assign({
            indemniteAPayer: ({ event }) => event.indemnite,
          }),
        },
      },

      meta: {
        description: 'Rachat du préavis par paiement d\'indemnité',
      },
    },

    executionPreavis: {
      on: {
        COMPLETER_PREAVIS: {
          target: 'remiseDocuments',
        },
      },

      meta: {
        description: 'Exécution du préavis de démission',
      },
    },

    remiseDocuments: {
      on: {
        REMETTRE_DOCUMENTS: {
          target: 'demissionFinalisee',
          actions: assign({
            documentsRemis: true,
          }),
        },
      },

      meta: {
        description: 'Remise des documents de fin de contrat (C4, attestation)',
      },
    },

    demissionFinalisee: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Démission finalisée - contrat terminé',
      },
    },
  },
});

/**
 * Visualisation du workflow de démission:
 *
 * idle
 *   → notificationEnregistree
 *   → calculPreavis
 *   → confirmationDateFin
 *   → optionsPreavis
 *       ↓                    ↓                  ↓
 *   demandeDispense    rachatPreavis    executionPreavis
 *       ↓                    ↓                  ↓
 *   remiseDocuments ← ← ← ← ← ← ← ← ← ← ← ← ← ←
 *       ↓
 *   demissionFinalisee
 */
