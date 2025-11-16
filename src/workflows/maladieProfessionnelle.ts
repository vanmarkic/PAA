/**
 * Machine XState pour la Maladie Professionnelle
 *
 * Cette machine d'état représente le processus de reconnaissance et de gestion
 * d'une maladie professionnelle en Belgique.
 */

import { createMachine, assign } from 'xstate';

interface MaladieProfessionnelleContext {
  employe: string | null;
  typeMaladie: string | null;
  expositionProfessionnelle: string | null;
  dateApparition: Date | null;
  preuvesMedicales: string[];
  preuveExposition: string[];
  reconnaissance: boolean;
  tauxIncapacite: number;
  indemnisation: number;
  retryCount: number;
}

export const maladieProfessionnelleMachine = createMachine({
  id: 'maladieProfessionnelle',
  initial: 'idle',

  schemas: {
    context: {} as MaladieProfessionnelleContext,
    events: {} as
      | { type: 'DECLARER_SYMPTOMES'; employe: string; typeMaladie: string; dateApparition: Date }
      | { type: 'IDENTIFIER_EXPOSITION'; expositionProfessionnelle: string }
      | { type: 'RASSEMBLER_PREUVES_MEDICALES'; preuvesMedicales: string[] }
      | { type: 'RASSEMBLER_PREUVES_EXPOSITION'; preuveExposition: string[] }
      | { type: 'SOUMETTRE_DEMANDE' }
      | { type: 'EXPERTISE_MEDICALE' }
      | { type: 'RECONNUE'; tauxIncapacite: number }
      | { type: 'REFUSEE'; raison: string }
      | { type: 'CONTESTER_DECISION' }
      | { type: 'APPEL_ACCEPTE' }
      | { type: 'APPEL_REFUSE' }
      | { type: 'CALCULER_INDEMNISATION'; indemnisation: number }
      | { type: 'SUIVI_MEDICAL' }
      | { type: 'AGGRAVATION'; nouveauTaux: number }
      | { type: 'STABILISATION' }
      | { type: 'RESET' }
  },

  context: {
    employe: null,
    typeMaladie: null,
    expositionProfessionnelle: null,
    dateApparition: null,
    preuvesMedicales: [],
    preuveExposition: [],
    reconnaissance: false,
    tauxIncapacite: 0,
    indemnisation: 0,
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        DECLARER_SYMPTOMES: {
          target: 'identificationExposition',
          actions: assign({
            employe: ({ event }) => event.employe,
            typeMaladie: ({ event }) => event.typeMaladie,
            dateApparition: ({ event }) => event.dateApparition,
            retryCount: 0,
          }),
        },
      },

      meta: {
        description: 'Pas de maladie professionnelle déclarée',
      },
    },

    identificationExposition: {
      on: {
        IDENTIFIER_EXPOSITION: {
          target: 'collectePreuvesMedicales',
          actions: assign({
            expositionProfessionnelle: ({ event }) => event.expositionProfessionnelle,
          }),
        },
      },

      meta: {
        description: 'Identification du lien entre maladie et exposition professionnelle',
      },
    },

    collectePreuvesMedicales: {
      on: {
        RASSEMBLER_PREUVES_MEDICALES: {
          target: 'collectePreuvesExposition',
          actions: assign({
            preuvesMedicales: ({ event }) => event.preuvesMedicales,
          }),
        },
      },

      meta: {
        description: 'Collecte des preuves médicales (diagnostics, examens)',
      },
    },

    collectePreuvesExposition: {
      on: {
        RASSEMBLER_PREUVES_EXPOSITION: {
          target: 'demandeSoumise',
          actions: assign({
            preuveExposition: ({ event }) => event.preuveExposition,
          }),
        },
      },

      meta: {
        description: 'Collecte des preuves d\'exposition (historique, conditions de travail)',
      },
    },

    demandeSoumise: {
      on: {
        SOUMETTRE_DEMANDE: {
          target: 'expertiseMedicale',
        },
      },

      meta: {
        description: 'Demande de reconnaissance soumise à Fedris',
      },
    },

    expertiseMedicale: {
      on: {
        RECONNUE: {
          target: 'reconnue',
          actions: assign({
            reconnaissance: true,
            tauxIncapacite: ({ event }) => event.tauxIncapacite,
          }),
        },
        REFUSEE: {
          target: 'refusee',
        },
      },

      meta: {
        description: 'Expertise médicale par Fedris (ex-Fonds des maladies professionnelles)',
      },
    },

    reconnue: {
      on: {
        CALCULER_INDEMNISATION: {
          target: 'indemnisation',
          actions: assign({
            indemnisation: ({ event }) => event.indemnisation,
          }),
        },
      },

      meta: {
        description: 'Maladie professionnelle reconnue officiellement',
      },
    },

    refusee: {
      on: {
        CONTESTER_DECISION: {
          target: 'appel',
        },
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Demande refusée - possibilité de contestation',
      },
    },

    appel: {
      on: {
        APPEL_ACCEPTE: {
          target: 'expertiseMedicale',
        },
        APPEL_REFUSE: {
          target: 'definitifRefuse',
        },
      },

      meta: {
        description: 'Procédure d\'appel de la décision',
      },
    },

    indemnisation: {
      on: {
        SUIVI_MEDICAL: {
          target: 'suiviMedical',
        },
      },

      meta: {
        description: 'Indemnisation active selon le taux d\'incapacité',
      },
    },

    suiviMedical: {
      on: {
        AGGRAVATION: {
          target: 'reevaluation',
        },
        STABILISATION: {
          target: 'indemnisation',
        },
      },

      meta: {
        description: 'Suivi médical régulier de l\'évolution de la maladie',
      },
    },

    reevaluation: {
      on: {
        AGGRAVATION: {
          target: 'indemnisation',
          actions: assign({
            tauxIncapacite: ({ event }) => event.nouveauTaux,
          }),
        },
      },

      meta: {
        description: 'Réévaluation du taux d\'incapacité en cas d\'aggravation',
      },
    },

    definitifRefuse: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Refus définitif - toutes voies de recours épuisées',
      },
    },
  },
});

/**
 * Visualisation du workflow de la maladie professionnelle:
 *
 * idle
 *   → identificationExposition
 *   → collectePreuvesMedicales
 *   → collectePreuvesExposition
 *   → demandeSoumise
 *   → expertiseMedicale
 *       ↓ (reconnue)          ↓ (refusée)
 *     reconnue              refusee
 *       ↓                      ↓
 *     indemnisation        [appel]
 *       ↓                      ↓
 *     suiviMedical      definitifRefuse
 *       ↓
 *     [aggravation/stabilisation]
 */
