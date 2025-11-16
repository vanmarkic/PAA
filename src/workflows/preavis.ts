/**
 * Machine XState pour le Préavis
 *
 * Cette machine d'état représente le processus de préavis en Belgique,
 * incluant le calcul de la durée, la notification et le respect des délais légaux.
 */

import { createMachine, assign } from 'xstate';

interface PreavisContext {
  employe: string | null;
  employeur: string | null;
  anciennete: number;
  dureePreavis: number;
  dateNotification: Date | null;
  dateFinPreavis: Date | null;
  indemnite: number;
  respecteDelais: boolean;
  retryCount: number;
}

export const preavisMachine = createMachine({
  id: 'preavis',
  initial: 'idle',

  schema: {
    context: {} as PreavisContext,
    events: {} as
      | { type: 'NOTIFIER_PREAVIS'; employe: string; employeur: string; anciennete: number }
      | { type: 'CALCULER_DUREE'; dureePreavis: number }
      | { type: 'CONFIRMER_DATES'; dateNotification: Date; dateFinPreavis: Date }
      | { type: 'VALIDER_CONFORMITE' }
      | { type: 'CONFORMITE_OK' }
      | { type: 'CONFORMITE_NON_RESPECTEE'; raisons: string[] }
      | { type: 'CALCULER_INDEMNITE'; indemnite: number }
      | { type: 'DEMANDER_DISPENSE' }
      | { type: 'DISPENSE_ACCORDEE' }
      | { type: 'DISPENSE_REFUSEE' }
      | { type: 'COMPLETER_PREAVIS' }
      | { type: 'RESET' }
  },

  context: {
    employe: null,
    employeur: null,
    anciennete: 0,
    dureePreavis: 0,
    dateNotification: null,
    dateFinPreavis: null,
    indemnite: 0,
    respecteDelais: false,
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        NOTIFIER_PREAVIS: {
          target: 'calculDuree',
          actions: assign({
            employe: (_, event) => event.employe,
            employeur: (_, event) => event.employeur,
            anciennete: (_, event) => event.anciennete,
            retryCount: 0,
          }),
        },
      },

      meta: {
        description: 'En attente de notification de préavis',
      },
    },

    calculDuree: {
      on: {
        CALCULER_DUREE: {
          target: 'confirmationDates',
          actions: assign({
            dureePreavis: (_, event) => event.dureePreavis,
          }),
        },
      },

      meta: {
        description: 'Calcul de la durée légale du préavis selon l\'ancienneté',
      },
    },

    confirmationDates: {
      on: {
        CONFIRMER_DATES: {
          target: 'validationConformite',
          actions: assign({
            dateNotification: (_, event) => event.dateNotification,
            dateFinPreavis: (_, event) => event.dateFinPreavis,
          }),
        },
      },

      meta: {
        description: 'Confirmation des dates de début et fin du préavis',
      },
    },

    validationConformite: {
      on: {
        CONFORMITE_OK: {
          target: 'enCours',
          actions: assign({
            respecteDelais: true,
          }),
        },
        CONFORMITE_NON_RESPECTEE: {
          target: 'calculIndemnite',
        },
      },

      meta: {
        description: 'Validation de la conformité du préavis avec la législation',
      },
    },

    calculIndemnite: {
      on: {
        CALCULER_INDEMNITE: {
          target: 'indemniteCalculee',
          actions: assign({
            indemnite: (_, event) => event.indemnite,
          }),
        },
      },

      meta: {
        description: 'Calcul de l\'indemnité compensatoire de préavis',
      },
    },

    indemniteCalculee: {
      on: {
        COMPLETER_PREAVIS: {
          target: 'termine',
        },
      },

      meta: {
        description: 'Indemnité calculée et notifiée',
      },
    },

    enCours: {
      on: {
        DEMANDER_DISPENSE: {
          target: 'demandeDispense',
        },
        COMPLETER_PREAVIS: {
          target: 'termine',
        },
      },

      meta: {
        description: 'Période de préavis en cours',
      },
    },

    demandeDispense: {
      on: {
        DISPENSE_ACCORDEE: {
          target: 'termine',
        },
        DISPENSE_REFUSEE: {
          target: 'enCours',
        },
      },

      meta: {
        description: 'Demande de dispense de prestations de préavis',
      },
    },

    termine: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Période de préavis terminée',
      },
    },
  },
});

/**
 * Visualisation du workflow du préavis:
 *
 * idle
 *   → calculDuree
 *   → confirmationDates
 *   → validationConformite
 *       ↓ (conforme)              ↓ (non conforme)
 *     enCours                   calculIndemnite
 *       ↓                           ↓
 *     [dispense?]              indemniteCalculee
 *       ↓                           ↓
 *     termine ← ← ← ← ← ← ← ← ← ← ←
 */
