/**
 * XState machine for Trademark Registration Workflow
 *
 * This state machine manages the trademark registration process
 * for Benelux trademarks through BOIP
 */

import { createMachine, assign } from 'xstate';
import { TrademarkApplication, TrademarkStatus, IP_CONSTANTS } from '../../domain/proprieteIntellectuelleTypes';

interface TrademarkContext {
  application: TrademarkApplication | null;
  searchResults: any | null;
  oppositions: any[];
  registrationCertificate: any | null;
  fees: {
    filing: boolean;
    additionalClasses: boolean;
    renewal: boolean;
  };
  retryCount: number;
  errors: string[];
}

export const trademarkRegistrationMachine = createMachine({
  id: 'trademarkRegistration',
  initial: 'idle',

  schemas: {
    context: {} as TrademarkContext,
    events: {} as
      | { type: 'START_APPLICATION'; application: TrademarkApplication }
      | { type: 'SEARCH_PRIOR_MARKS' }
      | { type: 'SEARCH_COMPLETED'; results: any }
      | { type: 'FILE_APPLICATION' }
      | { type: 'APPLICATION_ACCEPTED'; number: string }
      | { type: 'APPLICATION_REFUSED'; reason: string }
      | { type: 'MARK_PUBLISHED' }
      | { type: 'OPPOSITION_FILED'; opposition: any }
      | { type: 'OPPOSITION_RESOLVED'; outcome: 'rejected' | 'accepted' | 'partial' }
      | { type: 'MARK_REGISTERED'; certificate: any }
      | { type: 'REQUEST_RENEWAL' }
      | { type: 'RENEWAL_COMPLETED' }
      | { type: 'ABANDON' }
  },

  context: {
    application: null,
    searchResults: null,
    oppositions: [],
    registrationCertificate: null,
    fees: {
      filing: false,
      additionalClasses: false,
      renewal: false,
    },
    retryCount: 0,
    errors: [],
  },

  states: {
    idle: {
      on: {
        START_APPLICATION: {
          target: 'preparation',
          actions: assign({
            application: ({ event }: { event: any }) => event.application,
          }),
        },
      },
      meta: {
        description: 'En attente de début de procédure de marque',
      },
    },

    preparation: {
      on: {
        SEARCH_PRIOR_MARKS: {
          target: 'searching',
        },
        FILE_APPLICATION: {
          target: 'filing',
        },
      },
      meta: {
        description: 'Préparation de la demande - recherche d\'antériorités recommandée',
      },
    },

    searching: {
      on: {
        SEARCH_COMPLETED: {
          target: 'searchAnalysis',
          actions: assign({
            searchResults: ({ event }: { event: any }) => event.results,
          }),
        },
      },
      meta: {
        description: 'Recherche de marques similaires en cours (150€ optionnel)',
      },
    },

    searchAnalysis: {
      on: {
        FILE_APPLICATION: {
          target: 'filing',
        },
        ABANDON: {
          target: 'abandoned',
        },
      },
      meta: {
        description: 'Analyse des résultats - évaluation des risques de conflit',
      },
    },

    filing: {
      on: {
        APPLICATION_ACCEPTED: {
          target: 'formalExamination',
          actions: assign({
            application: ({ context, event }: { context: any; event: any }) => ({
              ...context.application,
              applicationNumber: event.number,
              filingDate: new Date(),
              status: 'demande-deposee',
            }),
            fees: ({ context }: { context: any }) => ({
              ...context.fees,
              filing: true,
            }),
          }),
        },
      },
      meta: {
        description: 'Dépôt de la demande au BOIP (244€ pour 3 classes)',
      },
    },

    formalExamination: {
      on: {
        EXAMINATION_PASSED: {
          target: 'publication',
        },
        APPLICATION_REFUSED: {
          target: 'refused',
          actions: assign({
            errors: ({ context, event }: { context: any; event: any }) => [
              ...context.errors,
              event.reason,
            ],
          }),
        },
      },
      meta: {
        description: 'Examen formel - vérification des conditions absolues',
      },
    },

    publication: {
      on: {
        MARK_PUBLISHED: {
          target: 'oppositionPeriod',
          actions: assign({
            application: ({ context }: { context: any }) => ({
              ...context.application,
              publicationDate: new Date(),
              status: 'publie',
            }),
          }),
        },
      },
      meta: {
        description: 'Publication de la marque dans le registre',
      },
    },

    oppositionPeriod: {
      on: {
        OPPOSITION_FILED: {
          target: 'oppositionProceedings',
          actions: assign({
            oppositions: ({ context, event }: { context: any; event: any }) => [
              ...context.oppositions,
              event.opposition,
            ],
          }),
        },
      },
      after: {
        // 2 months opposition period
        5184000000: {
          target: 'registration',
        },
      },
      meta: {
        description: `Période d\'opposition de ${IP_CONSTANTS.TRADEMARK_OPPOSITION_PERIOD} mois`,
      },
    },

    oppositionProceedings: {
      initial: 'coolingOff',
      states: {
        coolingOff: {
          after: {
            // 2 months cooling-off period
            5184000000: {
              target: 'adversarial',
            },
          },
          on: {
            SETTLEMENT_REACHED: {
              target: 'settled',
            },
          },
          meta: {
            description: 'Période de cooling-off pour négociation amiable',
          },
        },
        adversarial: {
          on: {
            OPPOSITION_RESOLVED: [
              {
                guard: ({ event }: { event: any }) => event.outcome === 'rejected',
                target: '#trademarkRegistration.registration',
              },
              {
                guard: ({ event }: { event: any }) => event.outcome === 'accepted',
                target: '#trademarkRegistration.refused',
              },
              {
                guard: ({ event }: { event: any }) => event.outcome === 'partial',
                target: '#trademarkRegistration.partialRegistration',
              },
            ],
          },
          meta: {
            description: 'Phase contradictoire - échange d\'arguments',
          },
        },
        settled: {
          on: {
            PROCEED_WITH_AGREEMENT: {
              target: '#trademarkRegistration.registration',
            },
          },
          meta: {
            description: 'Accord de coexistence négocié',
          },
        },
      },
    },

    registration: {
      on: {
        MARK_REGISTERED: {
          target: 'registered',
          actions: assign({
            registrationCertificate: ({ event }: { event: any }) => event?.certificate,
            application: ({ context, event }: { context: any; event: any }) => ({
              ...context.application,
              registrationDate: new Date(),
              registrationNumber: event?.certificate?.number,
              status: 'enregistre',
              expiryDate: new Date(Date.now() + IP_CONSTANTS.TRADEMARK_TERM * 365 * 24 * 60 * 60 * 1000),
            }),
          }),
        },
      },
      meta: {
        description: 'Enregistrement de la marque - émission du certificat',
      },
    },

    partialRegistration: {
      on: {
        MARK_REGISTERED: {
          target: 'registered',
          actions: assign({
            registrationCertificate: ({ event }: { event: any }) => event.certificate,
          }),
        },
      },
      meta: {
        description: 'Enregistrement partiel après limitation des produits/services',
      },
    },

    registered: {
      on: {
        REQUEST_RENEWAL: {
          target: 'renewalProcedure',
          guard: ({ context }: { context: any }) => {
            const expiryDate = context.application?.expiryDate;
            if (!expiryDate) return false;
            const monthsUntilExpiry = (expiryDate.getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000);
            return monthsUntilExpiry <= 6; // Can renew 6 months before
          },
        },
        CANCELLATION_ACTION: {
          target: 'cancellationProceedings',
        },
      },
      meta: {
        description: `Marque enregistrée - valable ${IP_CONSTANTS.TRADEMARK_TERM} ans`,
      },
    },

    renewalProcedure: {
      on: {
        RENEWAL_COMPLETED: {
          target: 'registered',
          actions: assign({
            application: ({ context }: { context: any }) => ({
              ...context.application,
              renewalDate: new Date(),
              expiryDate: new Date(
                Date.now() + IP_CONSTANTS.TRADEMARK_RENEWAL_PERIOD * 365 * 24 * 60 * 60 * 1000
              ),
            }),
            fees: ({ context }: { context: any }) => ({
              ...context.fees,
              renewal: true,
            }),
          }),
        },
        RENEWAL_MISSED: {
          target: 'gracePeriod',
        },
      },
      meta: {
        description: `Procédure de renouvellement (${IP_CONSTANTS.FEES.TRADEMARK.RENEWAL}€)`,
      },
    },

    gracePeriod: {
      on: {
        LATE_RENEWAL: {
          target: 'registered',
          actions: assign({
            fees: ({ context }: { context: any }) => ({
              ...context.fees,
              renewal: true,
              lateFee: true,
            }),
          }),
        },
      },
      after: {
        // 6 months grace period
        15552000000: {
          target: 'expired',
        },
      },
      meta: {
        description: `Délai de grâce de ${IP_CONSTANTS.TRADEMARK_GRACE_PERIOD} mois avec surtaxe`,
      },
    },

    cancellationProceedings: {
      on: {
        CANCELLATION_DECIDED: [
          {
            guard: ({ event }: { event: any }) => event.maintained,
            target: 'registered',
          },
          {
            target: 'cancelled',
          },
        ],
      },
      meta: {
        description: 'Action en déchéance ou nullité en cours',
      },
    },

    refused: {
      on: {
        APPEAL: {
          target: 'appealProceedings',
        },
      },
      meta: {
        description: 'Demande refusée - appel possible dans 2 mois',
      },
    },

    appealProceedings: {
      on: {
        APPEAL_DECIDED: [
          {
            guard: ({ event }: { event: any }) => event.accepted,
            target: 'registration',
          },
          {
            target: 'finalRefusal',
          },
        ],
      },
      meta: {
        description: 'Procédure d\'appel devant la Cour d\'appel',
      },
    },

    abandoned: {
      meta: {
        description: 'Demande abandonnée volontairement',
      },
    },

    expired: {
      meta: {
        description: 'Marque expirée - peut être re-déposée par un tiers',
      },
    },

    cancelled: {
      meta: {
        description: 'Marque radiée suite à action en déchéance/nullité',
      },
    },

    finalRefusal: {
      meta: {
        description: 'Refus définitif après épuisement des recours',
      },
    },
  },
});

/**
 * Visual representation of trademark registration workflow:
 *
 * idle → preparation → searching → searchAnalysis
 *            ↓                          ↓
 *         filing ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
 *            ↓
 *     formalExamination
 *            ↓
 *       publication
 *            ↓
 *     oppositionPeriod → oppositionProceedings
 *            ↓                    ↓
 *      registration ← ─ ─ ─ ─ ─ ─ ┘
 *            ↓
 *       registered → renewalProcedure
 *            ↓              ↓
 *    cancellationProceedings  gracePeriod
 *            ↓                    ↓
 *        cancelled            expired
 */