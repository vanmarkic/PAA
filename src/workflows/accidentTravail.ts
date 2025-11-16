/**
 * Machine XState pour l'Accident de Travail
 *
 * Cette machine d'état représente le processus de déclaration et de gestion
 * d'un accident de travail en Belgique, incluant la déclaration, l'indemnisation
 * et le suivi médical.
 */

import { createMachine, assign } from 'xstate';

interface AccidentTravailContext {
  employe: string | null;
  dateAccident: Date | null;
  lieuAccident: string | null;
  description: string | null;
  temoins: string[];
  gravite: 'leger' | 'moyen' | 'grave' | null;
  incapaciteTravail: boolean;
  declarationFaite: boolean;
  indemniteJournaliere: number;
  dateReprise: Date | null;
  retryCount: number;
}

export const accidentTravailMachine = createMachine({
  id: 'accidentTravail',
  initial: 'idle',

  schemas: {
    context: {} as AccidentTravailContext,
    events: {} as
      | { type: 'DECLARER_ACCIDENT'; employe: string; dateAccident: Date; lieuAccident: string; description: string }
      | { type: 'AJOUTER_TEMOINS'; temoins: string[] }
      | { type: 'EVALUER_GRAVITE'; gravite: 'leger' | 'moyen' | 'grave' }
      | { type: 'SOINS_MEDICAUX' }
      | { type: 'NOTIFIER_EMPLOYEUR' }
      | { type: 'EMPLOYEUR_DECLARE' }
      | { type: 'SOUMETTRE_ASSURANCE' }
      | { type: 'ASSURANCE_ACCEPTE'; indemnite: number }
      | { type: 'ASSURANCE_CONTESTE' }
      | { type: 'EXPERTISE_MEDICALE' }
      | { type: 'EXPERTISE_FAVORABLE' }
      | { type: 'EXPERTISE_DEFAVORABLE' }
      | { type: 'INCAPACITE_TEMPORAIRE' }
      | { type: 'INCAPACITE_PERMANENTE' }
      | { type: 'GUERISON_COMPLETE' }
      | { type: 'PLANIFIER_REPRISE'; dateReprise: Date }
      | { type: 'RESET' }
  },

  context: {
    employe: null,
    dateAccident: null,
    lieuAccident: null,
    description: null,
    temoins: [],
    gravite: null,
    incapaciteTravail: false,
    declarationFaite: false,
    indemniteJournaliere: 0,
    dateReprise: null,
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        DECLARER_ACCIDENT: {
          target: 'declaration',
          actions: assign({
            employe: (_, event) => event.employe,
            dateAccident: (_, event) => event.dateAccident,
            lieuAccident: (_, event) => event.lieuAccident,
            description: (_, event) => event.description,
            retryCount: 0,
          }),
        },
      },

      meta: {
        description: 'Pas d\'accident de travail déclaré',
      },
    },

    declaration: {
      on: {
        AJOUTER_TEMOINS: {
          target: 'evaluationGravite',
          actions: assign({
            temoins: (_, event) => event.temoins,
          }),
        },
      },

      meta: {
        description: 'Déclaration initiale de l\'accident avec témoins',
      },
    },

    evaluationGravite: {
      on: {
        EVALUER_GRAVITE: {
          target: 'soinsMedicaux',
          actions: assign({
            gravite: (_, event) => event.gravite,
          }),
        },
      },

      meta: {
        description: 'Évaluation de la gravité de l\'accident',
      },
    },

    soinsMedicaux: {
      on: {
        SOINS_MEDICAUX: {
          target: 'notificationEmployeur',
        },
      },

      meta: {
        description: 'Administration des premiers soins médicaux',
      },
    },

    notificationEmployeur: {
      on: {
        NOTIFIER_EMPLOYEUR: {
          target: 'declarationOfficielle',
        },
      },

      meta: {
        description: 'Notification de l\'employeur (obligatoire dans les 48h)',
      },
    },

    declarationOfficielle: {
      on: {
        EMPLOYEUR_DECLARE: {
          target: 'soumissionAssurance',
          actions: assign({
            declarationFaite: true,
          }),
        },
      },

      meta: {
        description: 'Déclaration officielle par l\'employeur auprès de l\'assurance',
      },
    },

    soumissionAssurance: {
      on: {
        ASSURANCE_ACCEPTE: {
          target: 'indemnisation',
          actions: assign({
            indemniteJournaliere: (_, event) => event.indemnite,
          }),
        },
        ASSURANCE_CONTESTE: {
          target: 'expertiseMedicale',
        },
      },

      meta: {
        description: 'Soumission du dossier à l\'assurance accidents du travail',
      },
    },

    expertiseMedicale: {
      on: {
        EXPERTISE_FAVORABLE: {
          target: 'indemnisation',
        },
        EXPERTISE_DEFAVORABLE: {
          target: 'litige',
        },
      },

      meta: {
        description: 'Expertise médicale en cas de contestation',
      },
    },

    indemnisation: {
      on: {
        INCAPACITE_TEMPORAIRE: {
          target: 'incapaciteTemporaire',
        },
        INCAPACITE_PERMANENTE: {
          target: 'incapacitePermanente',
        },
        GUERISON_COMPLETE: {
          target: 'reprise',
        },
      },

      meta: {
        description: 'Indemnisation de l\'accident de travail',
      },
    },

    incapaciteTemporaire: {
      on: {
        GUERISON_COMPLETE: {
          target: 'reprise',
        },
        INCAPACITE_PERMANENTE: {
          target: 'incapacitePermanente',
        },
      },

      meta: {
        description: 'Incapacité temporaire de travail avec indemnités',
      },
    },

    incapacitePermanente: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Incapacité permanente - rente viagère',
      },
    },

    reprise: {
      on: {
        PLANIFIER_REPRISE: {
          target: 'termine',
          actions: assign({
            dateReprise: (_, event) => event.dateReprise,
          }),
        },
      },

      meta: {
        description: 'Planification de la reprise du travail',
      },
    },

    litige: {
      on: {
        EXPERTISE_FAVORABLE: {
          target: 'indemnisation',
        },
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Litige avec l\'assurance - procédure judiciaire',
      },
    },

    termine: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Accident de travail résolu - reprise effective',
      },
    },
  },
});

/**
 * Visualisation du workflow de l'accident de travail:
 *
 * idle
 *   → declaration
 *   → evaluationGravite
 *   → soinsMedicaux
 *   → notificationEmployeur
 *   → declarationOfficielle
 *   → soumissionAssurance
 *       ↓ (accepté)          ↓ (contesté)
 *     indemnisation      expertiseMedicale
 *       ↓                      ↓
 *   [type incapacité]    (favorable/défavorable)
 *       ↓                      ↓
 *   incapaciteTemporaire   litige
 *       ↓
 *   reprise
 *       ↓
 *   termine
 */
