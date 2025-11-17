/**
 * XState machine for Patent Application Workflow
 *
 * This state machine manages the complete lifecycle of a patent application
 * from initial filing through examination to grant or rejection
 */

import { createMachine, assign } from 'xstate';
import { PatentApplication, PatentStatus, IP_CONSTANTS } from '../../domain/proprieteIntellectuelleTypes';

interface PatentApplicationContext {
  application: PatentApplication | null;
  searchReport: any | null;
  examinationReport: any | null;
  oppositions: any[];
  fees: {
    filing: boolean;
    search: boolean;
    examination: boolean;
    grant: boolean;
  };
  retryCount: number;
  errors: string[];
}

export const patentApplicationMachine = createMachine({
  id: 'patentApplication',
  initial: 'idle',

  schemas: {
    context: {} as PatentApplicationContext,
    events: {} as
      | { type: 'SUBMIT_APPLICATION'; application: PatentApplication }
      | { type: 'APPLICATION_FILED'; applicationNumber: string }
      | { type: 'PAYMENT_RECEIVED'; feeType: string }
      | { type: 'SEARCH_COMPLETED'; report: any }
      | { type: 'REQUEST_EXAMINATION' }
      | { type: 'EXAMINATION_COMPLETED'; report: any }
      | { type: 'RESPOND_TO_OBJECTION'; response: any }
      | { type: 'GRANT_PATENT'; patentNumber: string }
      | { type: 'REJECT_APPLICATION'; reason: string }
      | { type: 'FILE_OPPOSITION'; opposition: any }
      | { type: 'WITHDRAW_APPLICATION' }
      | { type: 'ABANDON_APPLICATION' }
      | { type: 'RETRY' }
  },

  context: {
    application: null,
    searchReport: null,
    examinationReport: null,
    oppositions: [],
    fees: {
      filing: false,
      search: false,
      examination: false,
      grant: false,
    },
    retryCount: 0,
    errors: [],
  },

  states: {
    idle: {
      on: {
        SUBMIT_APPLICATION: {
          target: 'filing',
          actions: assign({
            application: ({ event }: { event: any }) => event.application,
          }),
        },
      },
      meta: {
        description: 'En attente de soumission de demande de brevet',
      },
    },

    filing: {
      on: {
        APPLICATION_FILED: {
          target: 'pendingSearch',
          actions: assign({
            application: ({ context, event }: { context: any; event: any }) => ({
              ...context.application,
              applicationNumber: event.applicationNumber,
              status: 'demande-deposee',
              filingDate: new Date(),
            }),
            fees: ({ context }: { context: any }) => ({
              ...context.fees,
              filing: true,
            }),
          }),
        },
        WITHDRAW_APPLICATION: {
          target: 'withdrawn',
        },
      },
      meta: {
        description: 'Dépôt de la demande et attribution du numéro',
      },
    },

    pendingSearch: {
      on: {
        PAYMENT_RECEIVED: [
          {
            guard: ({ event }: { event: any }) => event.feeType === 'search',
            target: 'searching',
            actions: assign({
              fees: ({ context }: { context: any }) => ({
                ...context.fees,
                search: true,
              }),
            }),
          },
        ],
      },
      after: {
        // 1 month deadline for search fee
        2592000000: {
          target: 'abandoned',
        },
      },
      meta: {
        description: 'En attente du paiement des frais de recherche (300€)',
      },
    },

    searching: {
      on: {
        SEARCH_COMPLETED: {
          target: 'searchReportIssued',
          actions: assign({
            searchReport: ({ event }: { event: any }) => event.report,
            application: ({ context }: { context: any }) => ({
              ...context.application,
              status: 'en-examen',
            }),
          }),
        },
      },
      meta: {
        description: 'Recherche d\'antériorités en cours (3-6 mois)',
      },
    },

    searchReportIssued: {
      on: {
        REQUEST_EXAMINATION: {
          target: 'pendingExaminationFee',
        },
        WITHDRAW_APPLICATION: {
          target: 'withdrawn',
        },
      },
      after: {
        // 6 months to request examination
        15552000000: {
          target: 'abandoned',
        },
      },
      meta: {
        description: 'Rapport de recherche émis - décision sur la poursuite',
      },
    },

    pendingExaminationFee: {
      on: {
        PAYMENT_RECEIVED: [
          {
            guard: ({ event }: { event: any }) => event.feeType === 'examination',
            target: 'examination',
            actions: assign({
              fees: ({ context }: { context: any }) => ({
                ...context.fees,
                examination: true,
              }),
            }),
          },
        ],
      },
      after: {
        // 1 month for payment
        2592000000: {
          target: 'abandoned',
        },
      },
      meta: {
        description: 'En attente du paiement des frais d\'examen (150€)',
      },
    },

    examination: {
      on: {
        EXAMINATION_COMPLETED: [
          {
            guard: ({ event }: { event: any }) => !event.report.hasObjections,
            target: 'allowable',
          },
          {
            target: 'officeAction',
            actions: assign({
              examinationReport: ({ event }: { event: any }) => event.report,
            }),
          },
        ],
      },
      meta: {
        description: 'Examen au fond en cours - vérification des critères de brevetabilité',
      },
    },

    officeAction: {
      on: {
        RESPOND_TO_OBJECTION: {
          target: 'examination',
          actions: assign({
            application: ({ context, event }: { context: any; event: any }) => ({
              ...context.application,
              amendments: event.response.amendments,
            }),
          }),
        },
        ABANDON_APPLICATION: {
          target: 'abandoned',
        },
      },
      after: {
        // 2 months to respond (can be extended)
        5184000000: {
          target: 'abandoned',
        },
      },
      meta: {
        description: 'Notification d\'objections - réponse requise dans 2 mois',
      },
    },

    allowable: {
      on: {
        PAYMENT_RECEIVED: [
          {
            guard: ({ event }: { event: any }) => event.feeType === 'grant',
            target: 'granted',
            actions: assign({
              fees: ({ context }: { context: any }) => ({
                ...context.fees,
                grant: true,
              }),
            }),
          },
        ],
      },
      after: {
        // 3 months to pay grant fee
        7776000000: {
          target: 'abandoned',
        },
      },
      meta: {
        description: 'Demande acceptée - en attente des frais de délivrance (40€)',
      },
    },

    granted: {
      on: {
        FILE_OPPOSITION: {
          target: 'oppositionProcedure',
          actions: assign({
            oppositions: ({ context, event }: { context: any; event: any }) => [
              ...context.oppositions,
              event.opposition,
            ],
          }),
        },
      },
      meta: {
        description: 'Brevet délivré - protection de 20 ans sous réserve des annuités',
      },
    },

    oppositionProcedure: {
      on: {
        OPPOSITION_RESOLVED: [
          {
            guard: ({ event }: { event: any }) => event.maintained,
            target: 'granted',
          },
          {
            target: 'revoked',
          },
        ],
      },
      meta: {
        description: 'Procédure d\'opposition en cours (9 mois après délivrance)',
      },
    },

    rejected: {
      on: {
        APPEAL: {
          target: 'appealProcedure',
        },
      },
      meta: {
        description: 'Demande rejetée - appel possible dans 2 mois',
      },
    },

    appealProcedure: {
      on: {
        APPEAL_DECISION: [
          {
            guard: ({ event }: { event: any }) => event.granted,
            target: 'granted',
          },
          {
            target: 'finalRejection',
          },
        ],
      },
      meta: {
        description: 'Procédure d\'appel devant la chambre de recours',
      },
    },

    withdrawn: {
      meta: {
        description: 'Demande retirée volontairement',
      },
    },

    abandoned: {
      on: {
        RESTORE: {
          target: 'restoration',
          guard: ({ context }) => context.retryCount < 1,
        },
      },
      meta: {
        description: 'Demande abandonnée - restauration possible dans 12 mois',
      },
    },

    restoration: {
      on: {
        RESTORATION_GRANTED: {
          target: 'pendingSearch', // Return to appropriate state
          actions: assign({
            retryCount: ({ context }) => context.retryCount + 1,
          }),
        },
        RESTORATION_REFUSED: {
          target: 'finalAbandonment',
        },
      },
      meta: {
        description: 'Procédure de restauration - preuve du caractère non intentionnel',
      },
    },

    revoked: {
      meta: {
        description: 'Brevet révoqué suite à opposition ou nullité',
      },
    },

    finalRejection: {
      meta: {
        description: 'Rejet définitif après épuisement des recours',
      },
    },

    finalAbandonment: {
      meta: {
        description: 'Abandon définitif - aucune restauration possible',
      },
    },
  },
});

/**
 * Visual representation of the patent application workflow:
 *
 * idle → filing → pendingSearch → searching → searchReportIssued
 *                     ↓                              ↓
 *                 abandoned              pendingExaminationFee
 *                                              ↓
 *                                         examination
 *                                         ↙        ↘
 *                               officeAction    allowable
 *                                    ↓              ↓
 *                                examination    granted
 *                                                   ↓
 *                                          oppositionProcedure
 *                                               ↙        ↘
 *                                          granted    revoked
 */