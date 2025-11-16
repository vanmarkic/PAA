/**
 * Machine XState pour le Congé Maladie
 *
 * Cette machine d'état représente le processus de gestion d'un congé maladie
 * en Belgique, incluant la notification, le suivi médical et la reprise.
 */

import { createMachine, assign } from 'xstate';

interface CongeMaladieContext {
  employe: string | null;
  dateDebut: Date | null;
  dureePrevue: number;
  certificatMedical: boolean;
  controleMedical: boolean;
  prolongations: number;
  indemniteMutuelle: number;
  dateReprise: Date | null;
  retryCount: number;
}

export const congeMaladieMachine = createMachine({
  id: 'congeMaladie',
  initial: 'idle',

  schema: {
    context: {} as CongeMaladieContext,
    events: {} as
      | { type: 'DECLARER_MALADIE'; employe: string; dateDebut: Date; dureePrevue: number }
      | { type: 'FOURNIR_CERTIFICAT' }
      | { type: 'NOTIFIER_EMPLOYEUR' }
      | { type: 'DEMANDER_CONTROLE' }
      | { type: 'CONTROLE_VALIDE' }
      | { type: 'CONTROLE_CONTESTE' }
      | { type: 'PROLONGER_CONGE'; nouvelleDuree: number }
      | { type: 'DECLARER_APTE' }
      | { type: 'PLANIFIER_REPRISE'; dateReprise: Date }
      | { type: 'REPRENDRE_TRAVAIL' }
      | { type: 'RECHUTE' }
      | { type: 'RESET' }
  },

  context: {
    employe: null,
    dateDebut: null,
    dureePrevue: 0,
    certificatMedical: false,
    controleMedical: false,
    prolongations: 0,
    indemniteMutuelle: 0,
    dateReprise: null,
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        DECLARER_MALADIE: {
          target: 'certificatRequis',
          actions: assign({
            employe: (_, event) => event.employe,
            dateDebut: (_, event) => event.dateDebut,
            dureePrevue: (_, event) => event.dureePrevue,
            retryCount: 0,
          }),
        },
      },

      meta: {
        description: 'Employé en bonne santé - pas de congé maladie',
      },
    },

    certificatRequis: {
      on: {
        FOURNIR_CERTIFICAT: {
          target: 'notificationEmployeur',
          actions: assign({
            certificatMedical: true,
          }),
        },
      },

      meta: {
        description: 'En attente du certificat médical (obligatoire dès le 1er jour)',
      },
    },

    notificationEmployeur: {
      on: {
        NOTIFIER_EMPLOYEUR: {
          target: 'congeMaladieActif',
        },
      },

      meta: {
        description: 'Notification de l\'employeur du congé maladie',
      },
    },

    congeMaladieActif: {
      on: {
        DEMANDER_CONTROLE: {
          target: 'controleMedical',
        },
        PROLONGER_CONGE: {
          target: 'prolongation',
        },
        DECLARER_APTE: {
          target: 'planificationReprise',
        },
      },

      meta: {
        description: 'Congé maladie actif - employé en arrêt',
      },
    },

    controleMedical: {
      on: {
        CONTROLE_VALIDE: {
          target: 'congeMaladieActif',
          actions: assign({
            controleMedical: true,
          }),
        },
        CONTROLE_CONTESTE: {
          target: 'litigeControle',
        },
      },

      meta: {
        description: 'Contrôle médical par le médecin-contrôleur de l\'employeur',
      },
    },

    litigeControle: {
      on: {
        CONTROLE_VALIDE: {
          target: 'congeMaladieActif',
        },
        DECLARER_APTE: {
          target: 'planificationReprise',
        },
      },

      meta: {
        description: 'Litige sur le contrôle médical - médiation nécessaire',
      },
    },

    prolongation: {
      on: {
        PROLONGER_CONGE: {
          target: 'congeMaladieActif',
          actions: assign({
            dureePrevue: (_, event) => event.nouvelleDuree,
            prolongations: (context) => context.prolongations + 1,
          }),
        },
      },

      meta: {
        description: 'Prolongation du congé maladie avec nouveau certificat',
      },
    },

    planificationReprise: {
      on: {
        PLANIFIER_REPRISE: {
          target: 'reprise',
          actions: assign({
            dateReprise: (_, event) => event.dateReprise,
          }),
        },
      },

      meta: {
        description: 'Planification de la reprise du travail',
      },
    },

    reprise: {
      on: {
        REPRENDRE_TRAVAIL: {
          target: 'termine',
        },
        RECHUTE: {
          target: 'certificatRequis',
        },
      },

      meta: {
        description: 'Reprise du travail après congé maladie',
      },
    },

    termine: {
      on: {
        RECHUTE: {
          target: 'certificatRequis',
        },
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Congé maladie terminé - employé au travail',
      },
    },
  },
});

/**
 * Visualisation du workflow du congé maladie:
 *
 * idle
 *   → certificatRequis
 *   → notificationEmployeur
 *   → congeMaladieActif
 *       ↓                ↓                    ↓
 *   controleMedical  prolongation     declarer apte
 *       ↓                ↓                    ↓
 *   (validé/contesté)    →              planificationReprise
 *       ↓                                     ↓
 *   litigeControle                        reprise
 *       ↓                                     ↓
 *   congeMaladieActif                     termine
 */
