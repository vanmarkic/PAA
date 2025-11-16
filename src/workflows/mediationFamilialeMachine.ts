/**
 * XState machine for Service de Médiation Familiale (Family Mediation Service) Workflow
 *
 * This state machine represents the workflow for family mediation services,
 * including conflict assessment, mediation sessions, and agreement formalization.
 */

import { createMachine, assign } from 'xstate';

interface PartiesMediation {
  partie1: string;
  partie2: string;
  typeConflit: string;
  enfantsImpliques: boolean;
}

interface AccordMediation {
  points: string[];
  dateAccord: Date;
  homologation: boolean;
}

interface MediationFamilialeContext {
  parties: PartiesMediation | null;
  accord: AccordMediation | null;
  seancesEffectuees: number;
  accordTrouve: boolean;
  mediationReussie: boolean;
}

export const mediationFamilialeMachine = createMachine({
  id: 'mediationFamiliale',
  initial: 'attente',

  schema: {
    context: {} as MediationFamilialeContext,
    events: {} as
      | { type: 'DEMANDER_MEDIATION'; parties: PartiesMediation }
      | { type: 'SEANCE_INFORMATION' }
      | { type: 'ACCEPTER_MEDIATION' }
      | { type: 'REFUSER_MEDIATION' }
      | { type: 'SEANCE_MEDIATION' }
      | { type: 'ACCORD_PARTIEL' }
      | { type: 'ACCORD_TOTAL'; accord: AccordMediation }
      | { type: 'IMPASSE' }
      | { type: 'HOMOLOGUER_ACCORD' }
      | { type: 'MEDIATION_TERMINEE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    parties: null,
    accord: null,
    seancesEffectuees: 0,
    accordTrouve: false,
    mediationReussie: false,
  },

  states: {
    attente: {
      on: {
        DEMANDER_MEDIATION: {
          target: 'seanceInformation',
          actions: assign({
            parties: (_, event) => event.parties,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une nouvelle demande de médiation familiale',
      },
    },

    seanceInformation: {
      on: {
        ACCEPTER_MEDIATION: {
          target: 'processusMediation',
        },
        REFUSER_MEDIATION: {
          target: 'mediationRefusee',
        },
      },

      meta: {
        description: 'Séance d\'information sur le processus de médiation',
      },
    },

    mediationRefusee: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Médiation refusée par l\'une des parties',
      },
    },

    processusMediation: {
      on: {
        SEANCE_MEDIATION: {
          target: 'processusMediation',
          actions: assign({
            seancesEffectuees: (context) => context.seancesEffectuees + 1,
          }),
        },
        ACCORD_PARTIEL: {
          target: 'processusMediation',
        },
        ACCORD_TOTAL: {
          target: 'redactionAccord',
          actions: assign({
            accord: (_, event) => event.accord,
            accordTrouve: true,
          }),
        },
        IMPASSE: {
          target: 'mediationEchouee',
        },
      },

      meta: {
        description: 'Séances de médiation en cours - négociation et dialogue',
      },
    },

    redactionAccord: {
      on: {
        HOMOLOGUER_ACCORD: {
          target: 'homologationAccord',
        },
        MEDIATION_TERMINEE: {
          target: 'mediationReussie',
        },
      },

      meta: {
        description: 'Rédaction de l\'accord de médiation familiale',
      },
    },

    homologationAccord: {
      on: {
        MEDIATION_TERMINEE: {
          target: 'mediationReussie',
          actions: assign({
            mediationReussie: true,
          }),
        },
      },

      meta: {
        description: 'Homologation de l\'accord par le tribunal de la famille',
      },
    },

    mediationReussie: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Médiation réussie - accord trouvé et formalisé',
      },
    },

    mediationEchouee: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Médiation échouée - impasse, orientation vers procédure judiciaire',
      },
    },
  },
});

/**
 * Visualization of the family mediation workflow:
 *
 * attente
 *   → seanceInformation
 *       ↓ (si acceptée)
 *     processusMediation
 *       ↓ [séances de médiation]
 *     processusMediation
 *       ↓ (si accord)
 *     redactionAccord
 *       ↓
 *     homologationAccord
 *       ↓
 *     mediationReussie ✓
 */
