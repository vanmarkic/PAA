/**
 * Machine XState pour le Contrat de Travail
 *
 * Cette machine d'état représente le processus de création et de gestion
 * d'un contrat de travail en Belgique, incluant la négociation, la signature
 * et la gestion du contrat.
 */

import { createMachine, assign } from 'xstate';

interface ContratTravailContext {
  employeur: string | null;
  employe: string | null;
  typeContrat: 'CDI' | 'CDD' | 'interim' | null;
  salaireBrut: number;
  dateDebut: Date | null;
  dateFin: Date | null;
  conditions: string[];
  documentsSigne: boolean;
  retryCount: number;
}

export const contratTravailMachine = createMachine({
  id: 'contratTravail',
  initial: 'idle',

  schemas: {
    context: {} as ContratTravailContext,
    events: {} as
      | { type: 'DEMARRER_NEGOCIATION'; employeur: string; employe: string }
      | { type: 'CHOISIR_TYPE'; typeContrat: 'CDI' | 'CDD' | 'interim' }
      | { type: 'DEFINIR_CONDITIONS'; salaireBrut: number; dateDebut: Date; dateFin?: Date; conditions: string[] }
      | { type: 'SOUMETTRE_VALIDATION' }
      | { type: 'VALIDATION_OK' }
      | { type: 'VALIDATION_REFUSEE'; raison: string }
      | { type: 'SIGNER_CONTRAT' }
      | { type: 'ACTIVER_CONTRAT' }
      | { type: 'MODIFIER_CONTRAT' }
      | { type: 'RESILIER_CONTRAT' }
      | { type: 'RESET' }
  },

  context: {
    employeur: null,
    employe: null,
    typeContrat: null,
    salaireBrut: 0,
    dateDebut: null,
    dateFin: null,
    conditions: [],
    documentsSigne: false,
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        DEMARRER_NEGOCIATION: {
          target: 'negociation',
          actions: assign({
            employeur: ({ event }) => event.employeur,
            employe: ({ event }) => event.employe,
            retryCount: 0,
          }),
        },
      },

      meta: {
        description: 'En attente du démarrage de la négociation du contrat de travail',
      },
    },

    negociation: {
      on: {
        CHOISIR_TYPE: {
          target: 'definitionConditions',
          actions: assign({
            typeContrat: ({ event }) => event.typeContrat,
          }),
        },
      },

      meta: {
        description: 'Négociation du type de contrat (CDI, CDD, intérim)',
      },
    },

    definitionConditions: {
      on: {
        DEFINIR_CONDITIONS: {
          target: 'validation',
          actions: assign({
            salaireBrut: ({ event }) => event.salaireBrut,
            dateDebut: ({ event }) => event.dateDebut,
            dateFin: ({ event }) => event.dateFin || null,
            conditions: ({ event }) => event.conditions,
          }),
        },
      },

      meta: {
        description: 'Définition des conditions de travail (salaire, dates, clauses)',
      },
    },

    validation: {
      on: {
        VALIDATION_OK: {
          target: 'pretPourSignature',
        },
        VALIDATION_REFUSEE: {
          target: 'negociation',
          actions: assign({ retryCount: ({ context }) => context.retryCount + 1,
          }),
        },
      },

      meta: {
        description: 'Validation légale du contrat par les services juridiques',
      },
    },

    pretPourSignature: {
      on: {
        SIGNER_CONTRAT: {
          target: 'signe',
          actions: assign({
            documentsSigne: true,
          }),
        },
      },

      meta: {
        description: 'Contrat prêt pour signature par les deux parties',
      },
    },

    signe: {
      on: {
        ACTIVER_CONTRAT: {
          target: 'actif',
        },
      },

      meta: {
        description: 'Contrat signé en attente d\'activation',
      },
    },

    actif: {
      on: {
        MODIFIER_CONTRAT: {
          target: 'modification',
        },
        RESILIER_CONTRAT: {
          target: 'resilie',
        },
      },

      meta: {
        description: 'Contrat actif - employé en cours de travail',
      },
    },

    modification: {
      on: {
        DEFINIR_CONDITIONS: {
          target: 'validation',
        },
      },

      meta: {
        description: 'Modification des conditions du contrat existant',
      },
    },

    resilie: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Contrat résilié - relation de travail terminée',
      },
    },
  },
});

/**
 * Visualisation du workflow du contrat de travail:
 *
 * idle
 *   → negociation
 *   → definitionConditions
 *   → validation
 *       ↓ (si validé)
 *     pretPourSignature
 *       ↓
 *     signe
 *       ↓
 *     actif → [modification] → validation
 *       ↓
 *     [résiliation]
 *       ↓
 *     resilie
 */
