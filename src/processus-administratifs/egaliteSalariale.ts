/**
 * Machine XState pour l'Égalité Salariale
 *
 * Cette machine d'état représente le processus de vérification et de correction
 * des inégalités salariales en Belgique, conformément à la loi sur l'égalité de rémunération.
 */

import { createMachine, assign } from 'xstate';

interface EgaliteSalarialeContext {
  employe: string | null;
  genreEmploye: 'homme' | 'femme' | 'autre' | null;
  fonction: string | null;
  salaireActuel: number;
  salaireReference: number;
  ecartConstate: number;
  preuves: string[];
  analyseFaite: boolean;
  discriminationAveree: boolean;
  rappelSalarial: number;
  retryCount: number;
}

export const egaliteSalarialeMachine = createMachine({
  id: 'egaliteSalariale',
  initial: 'idle',

  schemas: {
    context: {} as EgaliteSalarialeContext,
    events: {} as
      | { type: 'DEMANDER_ANALYSE'; employe: string; genreEmploye: 'homme' | 'femme' | 'autre'; fonction: string; salaireActuel: number }
      | { type: 'IDENTIFIER_COMPARATEURS'; salaireReference: number }
      | { type: 'CALCULER_ECART'; ecartConstate: number }
      | { type: 'COLLECTER_PREUVES'; preuves: string[] }
      | { type: 'ANALYSER_JUSTIFICATION' }
      | { type: 'ECART_JUSTIFIE' }
      | { type: 'ECART_NON_JUSTIFIE' }
      | { type: 'NEGOCIATION_INTERNE' }
      | { type: 'EMPLOYEUR_CORRIGE' }
      | { type: 'EMPLOYEUR_REFUSE' }
      | { type: 'SAISIR_INSPECTION' }
      | { type: 'PLAINTE_TRIBUNAL' }
      | { type: 'JUGEMENT_FAVORABLE'; rappelSalarial: number }
      | { type: 'JUGEMENT_DEFAVORABLE' }
      | { type: 'APPLIQUER_RAPPEL' }
      | { type: 'AJUSTER_SALAIRE' }
      | { type: 'RESET' }
  },

  context: {
    employe: null,
    genreEmploye: null,
    fonction: null,
    salaireActuel: 0,
    salaireReference: 0,
    ecartConstate: 0,
    preuves: [],
    analyseFaite: false,
    discriminationAveree: false,
    rappelSalarial: 0,
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        DEMANDER_ANALYSE: {
          target: 'identificationComparateurs',
          actions: assign({
            employe: ({ event }) => event.employe,
            genreEmploye: ({ event }) => event.genreEmploye,
            fonction: ({ event }) => event.fonction,
            salaireActuel: ({ event }) => event.salaireActuel,
            retryCount: 0,
          }),
        },
      },

      meta: {
        description: 'Pas d\'analyse d\'égalité salariale en cours',
      },
    },

    identificationComparateurs: {
      on: {
        IDENTIFIER_COMPARATEURS: {
          target: 'calculEcart',
          actions: assign({
            salaireReference: ({ event }) => event.salaireReference,
          }),
        },
      },

      meta: {
        description: 'Identification de salariés de référence (même fonction, compétences similaires)',
      },
    },

    calculEcart: {
      on: {
        CALCULER_ECART: {
          target: 'collectePreuves',
          actions: assign({
            ecartConstate: ({ event }) => event.ecartConstate,
          }),
        },
      },

      meta: {
        description: 'Calcul de l\'écart salarial constaté',
      },
    },

    collectePreuves: {
      on: {
        COLLECTER_PREUVES: {
          target: 'analyseJustification',
          actions: assign({
            preuves: ({ event }) => event.preuves,
            analyseFaite: true,
          }),
        },
      },

      meta: {
        description: 'Collecte des preuves (fiches de paie, descriptions de fonction)',
      },
    },

    analyseJustification: {
      on: {
        ECART_JUSTIFIE: {
          target: 'ecartJustifie',
        },
        ECART_NON_JUSTIFIE: {
          target: 'discriminationConstatee',
          actions: assign({
            discriminationAveree: true,
          }),
        },
      },

      meta: {
        description: 'Analyse de la justification de l\'écart (ancienneté, diplômes, responsabilités)',
      },
    },

    ecartJustifie: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Écart salarial justifié par des critères objectifs',
      },
    },

    discriminationConstatee: {
      on: {
        NEGOCIATION_INTERNE: {
          target: 'negociation',
        },
        SAISIR_INSPECTION: {
          target: 'inspectionTravail',
        },
        PLAINTE_TRIBUNAL: {
          target: 'procedureJudiciaire',
        },
      },

      meta: {
        description: 'Discrimination salariale constatée - choix de la procédure',
      },
    },

    negociation: {
      on: {
        EMPLOYEUR_CORRIGE: {
          target: 'correctionSalariale',
        },
        EMPLOYEUR_REFUSE: {
          target: 'discriminationConstatee',
        },
      },

      meta: {
        description: 'Négociation avec l\'employeur pour correction',
      },
    },

    correctionSalariale: {
      on: {
        AJUSTER_SALAIRE: {
          target: 'egaliteRetablie',
        },
        APPLIQUER_RAPPEL: {
          target: 'rappelSalarial',
        },
      },

      meta: {
        description: 'Correction du salaire pour établir l\'égalité',
      },
    },

    rappelSalarial: {
      on: {
        APPLIQUER_RAPPEL: {
          target: 'egaliteRetablie',
          actions: assign({
            rappelSalarial: ({ event }) => event.rappelSalarial || 0,
          }),
        },
      },

      meta: {
        description: 'Calcul et application du rappel salarial rétroactif',
      },
    },

    inspectionTravail: {
      on: {
        EMPLOYEUR_CORRIGE: {
          target: 'correctionSalariale',
        },
        PLAINTE_TRIBUNAL: {
          target: 'procedureJudiciaire',
        },
      },

      meta: {
        description: 'Intervention de l\'inspection du travail',
      },
    },

    procedureJudiciaire: {
      on: {
        JUGEMENT_FAVORABLE: {
          target: 'rappelSalarial',
          actions: assign({
            rappelSalarial: ({ event }) => event.rappelSalarial,
          }),
        },
        JUGEMENT_DEFAVORABLE: {
          target: 'plainteRejetee',
        },
      },

      meta: {
        description: 'Procédure judiciaire au tribunal du travail',
      },
    },

    plainteRejetee: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Plainte rejetée - écart considéré comme justifié',
      },
    },

    egaliteRetablie: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Égalité salariale rétablie',
      },
    },
  },
});

/**
 * Visualisation du workflow de l'égalité salariale:
 *
 * idle
 *   → identificationComparateurs
 *   → calculEcart
 *   → collectePreuves
 *   → analyseJustification
 *       ↓ (justifié)           ↓ (non justifié)
 *     ecartJustifie      discriminationConstatee
 *                                ↓
 *                         [négociation/inspection/tribunal]
 *                                ↓
 *                         correctionSalariale
 *                                ↓
 *                         rappelSalarial
 *                                ↓
 *                         egaliteRetablie
 */
