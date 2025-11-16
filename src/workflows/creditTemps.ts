/**
 * Machine XState pour le Crédit-temps
 *
 * Cette machine d'état représente le processus de demande et de gestion
 * du crédit-temps en Belgique, permettant une réduction temporaire du temps de travail.
 */

import { createMachine, assign } from 'xstate';

interface CreditTempsContext {
  employe: string | null;
  typeCredit: 'complet' | 'mi-temps' | 'un-cinquieme' | null;
  motif: string | null;
  duree: number;
  dateDebut: Date | null;
  dateFin: Date | null;
  allocationsONEM: number;
  accordEmployeur: boolean;
  retryCount: number;
}

export const creditTempsMachine = createMachine({
  id: 'creditTemps',
  initial: 'idle',

  schema: {
    context: {} as CreditTempsContext,
    events: {} as
      | { type: 'DEMANDER_CREDIT_TEMPS'; employe: string; typeCredit: 'complet' | 'mi-temps' | 'un-cinquieme'; motif: string }
      | { type: 'VERIFIER_ELIGIBILITE' }
      | { type: 'ELIGIBLE' }
      | { type: 'NON_ELIGIBLE'; raison: string }
      | { type: 'SOUMETTRE_EMPLOYEUR'; duree: number; dateDebut: Date }
      | { type: 'EMPLOYEUR_ACCEPTE' }
      | { type: 'EMPLOYEUR_REFUSE'; raison: string }
      | { type: 'SOUMETTRE_ONEM' }
      | { type: 'ONEM_APPROUVE'; allocations: number }
      | { type: 'ONEM_REFUSE' }
      | { type: 'ACTIVER_CREDIT' }
      | { type: 'PROLONGER_CREDIT'; nouvelleDuree: number }
      | { type: 'TERMINER_CREDIT' }
      | { type: 'REPRENDRE_TRAVAIL_COMPLET' }
      | { type: 'RESET' }
  },

  context: {
    employe: null,
    typeCredit: null,
    motif: null,
    duree: 0,
    dateDebut: null,
    dateFin: null,
    allocationsONEM: 0,
    accordEmployeur: false,
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        DEMANDER_CREDIT_TEMPS: {
          target: 'verificationEligibilite',
          actions: assign({
            employe: (_, event) => event.employe,
            typeCredit: (_, event) => event.typeCredit,
            motif: (_, event) => event.motif,
            retryCount: 0,
          }),
        },
      },

      meta: {
        description: 'En attente de demande de crédit-temps',
      },
    },

    verificationEligibilite: {
      on: {
        ELIGIBLE: {
          target: 'demandeEmployeur',
        },
        NON_ELIGIBLE: {
          target: 'refuse',
        },
      },

      meta: {
        description: 'Vérification de l\'éligibilité (ancienneté, conditions)',
      },
    },

    demandeEmployeur: {
      on: {
        SOUMETTRE_EMPLOYEUR: {
          target: 'attentAccordEmployeur',
          actions: assign({
            duree: (_, event) => event.duree,
            dateDebut: (_, event) => event.dateDebut,
          }),
        },
      },

      meta: {
        description: 'Préparation de la demande pour l\'employeur',
      },
    },

    attentAccordEmployeur: {
      on: {
        EMPLOYEUR_ACCEPTE: {
          target: 'demandeONEM',
          actions: assign({
            accordEmployeur: true,
          }),
        },
        EMPLOYEUR_REFUSE: {
          target: 'refuse',
        },
      },

      meta: {
        description: 'En attente de l\'accord de l\'employeur',
      },
    },

    demandeONEM: {
      on: {
        ONEM_APPROUVE: {
          target: 'approuve',
          actions: assign({
            allocationsONEM: (_, event) => event.allocations,
          }),
        },
        ONEM_REFUSE: {
          target: 'refuse',
        },
      },

      meta: {
        description: 'Demande d\'allocations auprès de l\'ONEM',
      },
    },

    approuve: {
      on: {
        ACTIVER_CREDIT: {
          target: 'actif',
        },
      },

      meta: {
        description: 'Crédit-temps approuvé par employeur et ONEM',
      },
    },

    actif: {
      on: {
        PROLONGER_CREDIT: {
          target: 'demandeProlongation',
        },
        TERMINER_CREDIT: {
          target: 'repriseTravail',
        },
      },

      meta: {
        description: 'Crédit-temps actif - régime de travail réduit',
      },
    },

    demandeProlongation: {
      on: {
        PROLONGER_CREDIT: {
          target: 'attentAccordEmployeur',
          actions: assign({
            duree: (_, event) => event.nouvelleDuree,
          }),
        },
      },

      meta: {
        description: 'Demande de prolongation du crédit-temps',
      },
    },

    repriseTravail: {
      on: {
        REPRENDRE_TRAVAIL_COMPLET: {
          target: 'termine',
        },
      },

      meta: {
        description: 'Préparation à la reprise du travail à temps plein',
      },
    },

    termine: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Crédit-temps terminé - retour au travail complet',
      },
    },

    refuse: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Demande de crédit-temps refusée',
      },
    },
  },
});

/**
 * Visualisation du workflow du crédit-temps:
 *
 * idle
 *   → verificationEligibilite
 *       ↓ (éligible)
 *     demandeEmployeur
 *       ↓
 *     attentAccordEmployeur
 *       ↓ (accepté)
 *     demandeONEM
 *       ↓ (approuvé)
 *     approuve
 *       ↓
 *     actif → [prolongation] → demandeProlongation → attentAccordEmployeur
 *       ↓
 *     repriseTravail
 *       ↓
 *     termine
 */
