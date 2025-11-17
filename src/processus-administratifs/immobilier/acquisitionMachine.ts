/**
 * XState machine for Property Acquisition Workflow
 *
 * This state machine represents the complete workflow for purchasing property in Belgium,
 * including search, offer, financing, and completion stages.
 */

import { createMachine, assign } from 'xstate';
import {
  PropertyBuyer,
  PropertyDetails,
  MortgageCapacity,
  AcquisitionStatus,
  CompromisVente,
} from '../modele-metier/immobilierTypes';

interface AcquisitionContext {
  buyer: PropertyBuyer | null;
  property: PropertyDetails | null;
  offerPrice: number | null;
  mortgageCapacity: MortgageCapacity | null;
  compromis: CompromisVente | null;
  mortgageApproved: boolean;
  conditionsFulfilled: {
    mortgage: boolean;
    urbanism: boolean;
    servitudes: boolean;
    soilPollution?: boolean;
  };
  notaryAppointment: Date | null;
  errors: string[];
  retryCount: number;
}

export const acquisitionMachine = createMachine({
  id: 'propertyAcquisition',
  initial: 'searching',

  schemas: {
    context: {} as AcquisitionContext,
    events: {} as
      | { type: 'START_SEARCH'; buyer: PropertyBuyer }
      | { type: 'PROPERTY_FOUND'; property: PropertyDetails }
      | { type: 'MAKE_OFFER'; price: number }
      | { type: 'OFFER_ACCEPTED' }
      | { type: 'OFFER_REJECTED' }
      | { type: 'OFFER_COUNTERED'; counterPrice: number }
      | { type: 'SIGN_COMPROMIS'; compromis: CompromisVente }
      | { type: 'APPLY_MORTGAGE' }
      | { type: 'MORTGAGE_APPROVED' }
      | { type: 'MORTGAGE_REFUSED' }
      | { type: 'CONDITION_FULFILLED'; condition: string }
      | { type: 'CONDITION_FAILED'; condition: string; reason: string }
      | { type: 'SCHEDULE_NOTARY'; date: Date }
      | { type: 'SIGN_DEED' }
      | { type: 'CANCEL' }
      | { type: 'RESET' },
  },

  context: {
    buyer: null,
    property: null,
    offerPrice: null,
    mortgageCapacity: null,
    compromis: null,
    mortgageApproved: false,
    conditionsFulfilled: {
      mortgage: false,
      urbanism: false,
      servitudes: false,
    },
    notaryAppointment: null,
    errors: [],
    retryCount: 0,
  },

  states: {
    searching: {
      on: {
        PROPERTY_FOUND: {
          target: 'viewing',
          actions: assign({
            property: ({ event }: { event: any }) => event.property,
          }),
        },
      },
      meta: {
        description: 'Recherche de biens immobiliers correspondant aux critères',
      },
    },

    viewing: {
      on: {
        MAKE_OFFER: {
          target: 'offering',
          actions: assign({
            offerPrice: ({ event }: { event: any }) => event.price,
          }),
        },
        PROPERTY_FOUND: {
          target: 'viewing',
          actions: assign({
            property: ({ event }: { event: any }) => event.property,
          }),
        },
      },
      meta: {
        description: 'Visite du bien et évaluation',
      },
    },

    offering: {
      on: {
        OFFER_ACCEPTED: {
          target: 'compromis_preparation',
        },
        OFFER_REJECTED: {
          target: 'searching',
          actions: assign({
            property: null,
            offerPrice: null,
          }),
        },
        OFFER_COUNTERED: {
          target: 'negotiating',
          actions: assign({
            offerPrice: ({ event }: { event: any }) => event.counterPrice,
          }),
        },
      },
      meta: {
        description: 'Offre d\'achat soumise au vendeur',
      },
    },

    negotiating: {
      on: {
        MAKE_OFFER: {
          target: 'offering',
          actions: assign({
            offerPrice: ({ event }: { event: any }) => event.price,
          }),
        },
        OFFER_ACCEPTED: {
          target: 'compromis_preparation',
        },
        CANCEL: {
          target: 'searching',
          actions: assign({
            property: null,
            offerPrice: null,
          }),
        },
      },
      meta: {
        description: 'Négociation du prix et des conditions',
      },
    },

    compromis_preparation: {
      on: {
        SIGN_COMPROMIS: {
          target: 'compromis_signed',
          actions: assign({
            compromis: ({ event }: { event: any }) => event.compromis,
          }),
        },
        CANCEL: {
          target: 'cancelled',
        },
      },
      meta: {
        description: 'Préparation du compromis de vente avec conditions suspensives',
      },
    },

    compromis_signed: {
      initial: 'mortgage_application',
      states: {
        mortgage_application: {
          on: {
            APPLY_MORTGAGE: {
              target: 'mortgage_pending',
            },
          },
          meta: {
            description: 'Demande de crédit hypothécaire en cours',
          },
        },

        mortgage_pending: {
          on: {
            MORTGAGE_APPROVED: {
              target: 'conditions_verification',
              actions: assign({
                mortgageApproved: true,
                conditionsFulfilled: ({ context }: { context: any }) => ({
                  ...context.conditionsFulfilled,
                  mortgage: true,
                }),
              }),
            },
            MORTGAGE_REFUSED: {
              target: '#propertyAcquisition.mortgage_failed',
            },
          },
          meta: {
            description: 'En attente de la décision de la banque',
          },
        },

        conditions_verification: {
          on: {
            CONDITION_FULFILLED: {
              actions: assign({
                conditionsFulfilled: ({ context, event }: { context: any; event: any }) => ({
                  ...context.conditionsFulfilled,
                  [event.condition]: true,
                }),
              }),
            },
            CONDITION_FAILED: {
              target: '#propertyAcquisition.condition_failed',
              actions: assign({
                errors: ({ context, event }: { context: any; event: any }) => [
                  ...context.errors,
                  `Condition non remplie: ${event.reason}`,
                ],
              }),
            },
          },
          always: {
            target: '#propertyAcquisition.notary_preparation',
            guard: ({ context }: { context: any }) =>
              context.conditionsFulfilled.mortgage &&
              context.conditionsFulfilled.urbanism &&
              context.conditionsFulfilled.servitudes,
          },
          meta: {
            description: 'Vérification des conditions suspensives (urbanisme, servitudes, etc.)',
          },
        },
      },
      meta: {
        description: 'Compromis signé - conditions suspensives en cours',
      },
    },

    mortgage_failed: {
      on: {
        APPLY_MORTGAGE: {
          target: 'compromis_signed.mortgage_pending',
          guard: ({ context }: { context: any }) => context.retryCount < 2,
          actions: assign({
            retryCount: ({ context }: { context: any }) => context.retryCount + 1,
          }),
        },
        CANCEL: {
          target: 'cancelled',
        },
      },
      meta: {
        description: 'Crédit hypothécaire refusé - possibilité de nouvelle demande ou annulation',
      },
    },

    condition_failed: {
      on: {
        CANCEL: {
          target: 'cancelled',
        },
      },
      meta: {
        description: 'Condition suspensive non remplie - annulation possible sans pénalité',
      },
    },

    notary_preparation: {
      on: {
        SCHEDULE_NOTARY: {
          target: 'deed_signing_scheduled',
          actions: assign({
            notaryAppointment: ({ event }: { event: any }) => event.date,
          }),
        },
      },
      meta: {
        description: 'Préparation de l\'acte authentique chez le notaire',
      },
    },

    deed_signing_scheduled: {
      on: {
        SIGN_DEED: {
          target: 'completed',
        },
        CANCEL: {
          target: 'cancelled',
          actions: assign({
            errors: ({ context }: { context: any }) => [
              ...context.errors,
              'Annulation après conditions remplies - pénalités applicables',
            ],
          }),
        },
      },
      meta: {
        description: 'Signature de l\'acte authentique programmée',
      },
    },

    completed: {
      type: 'final',
      meta: {
        description: 'Acquisition complétée - propriétaire du bien',
      },
    },

    cancelled: {
      on: {
        RESET: {
          target: 'searching',
          actions: assign({
            buyer: null,
            property: null,
            offerPrice: null,
            mortgageCapacity: null,
            compromis: null,
            mortgageApproved: false,
            conditionsFulfilled: {
              mortgage: false,
              urbanism: false,
              servitudes: false,
            },
            notaryAppointment: null,
            errors: [],
            retryCount: 0,
          }),
        },
      },
      meta: {
        description: 'Processus d\'acquisition annulé',
      },
    },
  },
});

/**
 * Visualization of the acquisition workflow:
 *
 * searching → viewing → offering → negotiating
 *                           ↓
 *                    compromis_preparation
 *                           ↓
 *                    compromis_signed
 *                           ↓
 *                  [mortgage_application → mortgage_pending]
 *                           ↓
 *                  [conditions_verification]
 *                           ↓
 *                    notary_preparation
 *                           ↓
 *                  deed_signing_scheduled
 *                           ↓
 *                      completed
 *
 * Failure paths:
 * - mortgage_failed → retry or cancel
 * - condition_failed → cancel without penalty
 * - Any stage → cancelled (with potential penalties after compromis)
 */