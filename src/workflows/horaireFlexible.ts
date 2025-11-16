/**
 * Machine XState pour l'Horaire Flexible
 *
 * Cette machine d'état représente le processus de mise en place et de gestion
 * d'horaires flexibles en Belgique, incluant les plages horaires et le compteur d'heures.
 */

import { createMachine, assign } from 'xstate';

interface HoraireFlexibleContext {
  employe: string | null;
  employeur: string | null;
  plagesFixes: { debut: string; fin: string }[];
  plagesFlexibles: { debut: string; fin: string }[];
  heuresHebdomadaires: number;
  compteurHeures: number;
  limiteReportHeures: number;
  accordEmployeur: boolean;
  periodeReference: string | null;
  retryCount: number;
}

export const horaireFlexibleMachine = createMachine({
  id: 'horaireFlexible',
  initial: 'idle',

  schemas: {
    context: {} as HoraireFlexibleContext,
    events: {} as
      | { type: 'DEMANDER_HORAIRE_FLEXIBLE'; employe: string; employeur: string }
      | { type: 'DEFINIR_PLAGES'; plagesFixes: { debut: string; fin: string }[]; plagesFlexibles: { debut: string; fin: string }[] }
      | { type: 'NEGOCIER_CONDITIONS'; heuresHebdomadaires: number; limiteReportHeures: number }
      | { type: 'EMPLOYEUR_ACCEPTE' }
      | { type: 'EMPLOYEUR_REFUSE' }
      | { type: 'SIGNER_ACCORD' }
      | { type: 'ACTIVER_HORAIRE_FLEXIBLE' }
      | { type: 'ENREGISTRER_HEURES'; heures: number }
      | { type: 'CALCULER_SOLDE' }
      | { type: 'SOLDE_POSITIF'; solde: number }
      | { type: 'SOLDE_NEGATIF'; solde: number }
      | { type: 'REPORTER_HEURES' }
      | { type: 'REGULARISER_HEURES' }
      | { type: 'NOUVELLE_PERIODE'; periodeReference: string }
      | { type: 'MODIFIER_PLAGES' }
      | { type: 'SUSPENDRE_FLEXIBILITE' }
      | { type: 'RETOUR_HORAIRE_FIXE' }
      | { type: 'RESET' }
  },

  context: {
    employe: null,
    employeur: null,
    plagesFixes: [],
    plagesFlexibles: [],
    heuresHebdomadaires: 38,
    compteurHeures: 0,
    limiteReportHeures: 20,
    accordEmployeur: false,
    periodeReference: null,
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        DEMANDER_HORAIRE_FLEXIBLE: {
          target: 'definitionPlages',
          actions: assign({
            employe: ({ event }) => event.employe,
            employeur: ({ event }) => event.employeur,
            retryCount: 0,
          }),
        },
      },

      meta: {
        description: 'Horaire fixe traditionnel',
      },
    },

    definitionPlages: {
      on: {
        DEFINIR_PLAGES: {
          target: 'negociationConditions',
          actions: assign({
            plagesFixes: ({ event }) => event.plagesFixes,
            plagesFlexibles: ({ event }) => event.plagesFlexibles,
          }),
        },
      },

      meta: {
        description: 'Définition des plages horaires fixes et flexibles',
      },
    },

    negociationConditions: {
      on: {
        EMPLOYEUR_ACCEPTE: {
          target: 'signatureAccord',
          actions: assign({
            accordEmployeur: true,
            heuresHebdomadaires: ({ event }) => event.heuresHebdomadaires || 38,
            limiteReportHeures: ({ event }) => event.limiteReportHeures || 20,
          }),
        },
        EMPLOYEUR_REFUSE: {
          target: 'demandeRefusee',
        },
      },

      meta: {
        description: 'Négociation des conditions d\'horaire flexible',
      },
    },

    demandeRefusee: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Demande d\'horaire flexible refusée',
      },
    },

    signatureAccord: {
      on: {
        SIGNER_ACCORD: {
          target: 'horaireFlexibleActif',
        },
      },

      meta: {
        description: 'Signature de l\'accord d\'horaire flexible',
      },
    },

    horaireFlexibleActif: {
      on: {
        ENREGISTRER_HEURES: {
          target: 'calculSolde',
          actions: assign({
            compteurHeures: ({ context, event }) => context.compteurHeures + event.heures,
          }),
        },
        MODIFIER_PLAGES: {
          target: 'modificationPlages',
        },
        SUSPENDRE_FLEXIBILITE: {
          target: 'suspension',
        },
        RETOUR_HORAIRE_FIXE: {
          target: 'retourHoraireFixe',
        },
      },

      meta: {
        description: 'Horaire flexible actif avec compteur d\'heures',
      },
    },

    calculSolde: {
      on: {
        SOLDE_POSITIF: {
          target: 'gestionSoldePositif',
        },
        SOLDE_NEGATIF: {
          target: 'gestionSoldeNegatif',
        },
        CALCULER_SOLDE: {
          target: 'horaireFlexibleActif',
        },
      },

      meta: {
        description: 'Calcul du solde d\'heures (positif ou négatif)',
      },
    },

    gestionSoldePositif: {
      on: {
        REPORTER_HEURES: {
          target: 'nouvellePeriode',
        },
        REGULARISER_HEURES: {
          target: 'horaireFlexibleActif',
          actions: assign({
            compteurHeures: 0,
          }),
        },
      },

      meta: {
        description: 'Gestion du solde positif (heures en plus)',
      },
    },

    gestionSoldeNegatif: {
      on: {
        REGULARISER_HEURES: {
          target: 'horaireFlexibleActif',
          actions: assign({
            compteurHeures: 0,
          }),
        },
      },

      meta: {
        description: 'Gestion du solde négatif (heures en moins à récupérer)',
      },
    },

    nouvellePeriode: {
      on: {
        NOUVELLE_PERIODE: {
          target: 'horaireFlexibleActif',
          actions: assign({
            periodeReference: ({ event }) => event.periodeReference,
          }),
        },
      },

      meta: {
        description: 'Début d\'une nouvelle période de référence',
      },
    },

    modificationPlages: {
      on: {
        DEFINIR_PLAGES: {
          target: 'horaireFlexibleActif',
          actions: assign({
            plagesFixes: ({ event }) => event.plagesFixes,
            plagesFlexibles: ({ event }) => event.plagesFlexibles,
          }),
        },
      },

      meta: {
        description: 'Modification des plages horaires',
      },
    },

    suspension: {
      on: {
        ACTIVER_HORAIRE_FLEXIBLE: {
          target: 'horaireFlexibleActif',
        },
        RETOUR_HORAIRE_FIXE: {
          target: 'retourHoraireFixe',
        },
      },

      meta: {
        description: 'Suspension temporaire de l\'horaire flexible',
      },
    },

    retourHoraireFixe: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Retour à un horaire fixe',
      },
    },
  },
});

/**
 * Visualisation du workflow de l'horaire flexible:
 *
 * idle
 *   → definitionPlages
 *   → negociationConditions
 *       ↓ (accepté)
 *     signatureAccord
 *       ↓
 *     horaireFlexibleActif
 *       ↓
 *     calculSolde
 *       ↓                    ↓
 *   soldePositif      soldeNegatif
 *       ↓                    ↓
 *   [report/régularisation]
 *       ↓
 *     horaireFlexibleActif
 */
