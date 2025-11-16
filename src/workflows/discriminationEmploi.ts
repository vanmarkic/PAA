/**
 * Machine XState pour la Discrimination à l'Emploi
 *
 * Cette machine d'état représente le processus de signalement et de traitement
 * de la discrimination à l'emploi en Belgique, conformément à la législation anti-discrimination.
 */

import { createMachine, assign } from 'xstate';

interface DiscriminationEmploiContext {
  victime: string | null;
  typeDiscrimination: 'age' | 'genre' | 'origine' | 'handicap' | 'orientation' | 'religion' | 'autre' | null;
  contexte: 'recrutement' | 'remuneration' | 'promotion' | 'conditions_travail' | 'licenciement' | null;
  dateIncident: Date | null;
  preuves: string[];
  temoins: string[];
  signalementFait: boolean;
  mediationTentee: boolean;
  sanctionAppliquee: boolean;
  retryCount: number;
}

export const discriminationEmploiMachine = createMachine({
  id: 'discriminationEmploi',
  initial: 'idle',

  schemas: {
    context: {} as DiscriminationEmploiContext,
    events: {} as
      | { type: 'SIGNALER_DISCRIMINATION'; victime: string; typeDiscrimination: 'age' | 'genre' | 'origine' | 'handicap' | 'orientation' | 'religion' | 'autre'; contexte: 'recrutement' | 'remuneration' | 'promotion' | 'conditions_travail' | 'licenciement' }
      | { type: 'DOCUMENTER_INCIDENT'; dateIncident: Date; preuves: string[] }
      | { type: 'AJOUTER_TEMOINS'; temoins: string[] }
      | { type: 'ANALYSER_CAS' }
      | { type: 'DISCRIMINATION_PRESUMEE' }
      | { type: 'PAS_DISCRIMINATION' }
      | { type: 'SIGNALEMENT_INTERNE' }
      | { type: 'MEDIATION' }
      | { type: 'MEDIATION_REUSSIE' }
      | { type: 'MEDIATION_ECHOUEE' }
      | { type: 'SAISIR_UNIA' }
      | { type: 'UNIA_INTERVIENT' }
      | { type: 'SAISIR_INSTITUT_EGALITE' }
      | { type: 'PLAINTE_TRIBUNAL' }
      | { type: 'JUGEMENT_FAVORABLE' }
      | { type: 'JUGEMENT_DEFAVORABLE' }
      | { type: 'SANCTIONS_APPLIQUEES' }
      | { type: 'REPARATION_ACCORDEE'; montant: number }
      | { type: 'RESET' }
  },

  context: {
    victime: null,
    typeDiscrimination: null,
    contexte: null,
    dateIncident: null,
    preuves: [],
    temoins: [],
    signalementFait: false,
    mediationTentee: false,
    sanctionAppliquee: false,
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        SIGNALER_DISCRIMINATION: {
          target: 'documentationIncident',
          actions: assign({
            victime: ({ event }) => event.victime,
            typeDiscrimination: ({ event }) => event.typeDiscrimination,
            contexte: ({ event }) => event.contexte,
            retryCount: 0,
          }),
        },
      },

      meta: {
        description: 'Pas de discrimination signalée',
      },
    },

    documentationIncident: {
      on: {
        DOCUMENTER_INCIDENT: {
          target: 'collectePreuves',
          actions: assign({
            dateIncident: ({ event }) => event.dateIncident,
            preuves: ({ event }) => event.preuves,
          }),
        },
      },

      meta: {
        description: 'Documentation détaillée de l\'incident discriminatoire',
      },
    },

    collectePreuves: {
      on: {
        AJOUTER_TEMOINS: {
          target: 'analyseCas',
          actions: assign({
            temoins: ({ event }) => event.temoins,
          }),
        },
      },

      meta: {
        description: 'Collecte des preuves et témoignages',
      },
    },

    analyseCas: {
      on: {
        DISCRIMINATION_PRESUMEE: {
          target: 'choixProcedure',
        },
        PAS_DISCRIMINATION: {
          target: 'classeSansSuite',
        },
      },

      meta: {
        description: 'Analyse juridique du cas pour déterminer la présomption de discrimination',
      },
    },

    choixProcedure: {
      on: {
        SIGNALEMENT_INTERNE: {
          target: 'procedureInterne',
        },
        SAISIR_UNIA: {
          target: 'interventionUnia',
        },
        SAISIR_INSTITUT_EGALITE: {
          target: 'interventionInstitut',
        },
        PLAINTE_TRIBUNAL: {
          target: 'procedureJudiciaire',
        },
      },

      meta: {
        description: 'Choix de la procédure (interne, Unia, Institut pour l\'égalité, tribunal)',
      },
    },

    procedureInterne: {
      on: {
        MEDIATION: {
          target: 'mediation',
          actions: assign({
            signalementFait: true,
            mediationTentee: true,
          }),
        },
      },

      meta: {
        description: 'Procédure interne de traitement de la discrimination',
      },
    },

    mediation: {
      on: {
        MEDIATION_REUSSIE: {
          target: 'resolu',
        },
        MEDIATION_ECHOUEE: {
          target: 'choixProcedure',
        },
      },

      meta: {
        description: 'Tentative de médiation entre les parties',
      },
    },

    interventionUnia: {
      on: {
        UNIA_INTERVIENT: {
          target: 'procedureJudiciaire',
        },
        MEDIATION_REUSSIE: {
          target: 'resolu',
        },
      },

      meta: {
        description: 'Intervention d\'Unia (Centre interfédéral pour l\'égalité des chances)',
      },
    },

    interventionInstitut: {
      on: {
        MEDIATION_REUSSIE: {
          target: 'resolu',
        },
        PLAINTE_TRIBUNAL: {
          target: 'procedureJudiciaire',
        },
      },

      meta: {
        description: 'Intervention de l\'Institut pour l\'égalité des femmes et des hommes',
      },
    },

    procedureJudiciaire: {
      on: {
        JUGEMENT_FAVORABLE: {
          target: 'reparation',
        },
        JUGEMENT_DEFAVORABLE: {
          target: 'rejete',
        },
      },

      meta: {
        description: 'Procédure judiciaire au tribunal du travail',
      },
    },

    reparation: {
      on: {
        REPARATION_ACCORDEE: {
          target: 'resolu',
        },
        SANCTIONS_APPLIQUEES: {
          target: 'resolu',
          actions: assign({
            sanctionAppliquee: true,
          }),
        },
      },

      meta: {
        description: 'Réparation du préjudice (dommages et intérêts, réintégration)',
      },
    },

    classeSansSuite: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Cas classé sans suite - pas de discrimination avérée',
      },
    },

    rejete: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Plainte rejetée par le tribunal',
      },
    },

    resolu: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Cas de discrimination résolu',
      },
    },
  },
});

/**
 * Visualisation du workflow de discrimination à l'emploi:
 *
 * idle
 *   → documentationIncident
 *   → collectePreuves
 *   → analyseCas
 *       ↓ (présumée)           ↓ (pas discrimination)
 *     choixProcedure        classeSansSuite
 *       ↓
 *   [interne/Unia/Institut/tribunal]
 *       ↓
 *   mediation/intervention
 *       ↓
 *   procedureJudiciaire
 *       ↓
 *   (favorable/défavorable)
 *       ↓
 *   reparation/rejete
 *       ↓
 *   resolu
 */
