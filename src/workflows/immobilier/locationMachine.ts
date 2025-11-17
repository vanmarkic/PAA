/**
 * XState machine for Rental Application and Tenancy Workflow
 *
 * This state machine represents the complete rental lifecycle in Belgium,
 * from application to tenancy termination.
 */

import { createMachine, assign } from 'xstate';
import {
  RentalContract,
  TenantRights,
  RentalDispute,
  RentalApplicationState,
} from '../../domain/immobilierTypes';

interface LocationContext {
  tenantId: string | null;
  propertyId: string | null;
  contract: RentalContract | null;
  deposit: {
    amount: number;
    type: 'bank_guarantee' | 'blocked_account' | 'cpas' | null;
    paid: boolean;
  };
  inventory: {
    entryCompleted: boolean;
    exitCompleted: boolean;
    disputes: string[];
  };
  rights: TenantRights | null;
  disputes: RentalDispute[];
  noticeGiven: {
    byTenant: boolean;
    byLandlord: boolean;
    effectiveDate: Date | null;
  };
  errors: string[];
  retryCount: number;
}

export const locationMachine = createMachine({
  id: 'rentalApplication',
  initial: 'searching',

  schemas: {
    context: {} as LocationContext,
    events: {} as
      | { type: 'START_SEARCH'; tenantId: string }
      | { type: 'PROPERTY_FOUND'; propertyId: string }
      | { type: 'SUBMIT_APPLICATION'; documents: string[] }
      | { type: 'APPLICATION_ACCEPTED' }
      | { type: 'APPLICATION_REJECTED'; reason: string }
      | { type: 'SIGN_CONTRACT'; contract: RentalContract }
      | { type: 'PAY_DEPOSIT'; type: string; amount: number }
      | { type: 'COMPLETE_INVENTORY' }
      | { type: 'RECEIVE_KEYS' }
      | { type: 'REPORT_ISSUE'; issue: RentalDispute }
      | { type: 'ISSUE_RESOLVED'; disputeId: string }
      | { type: 'GIVE_NOTICE'; effectiveDate: Date }
      | { type: 'LANDLORD_NOTICE'; effectiveDate: Date; reason: string }
      | { type: 'EXIT_INVENTORY' }
      | { type: 'DEPOSIT_RETURNED' }
      | { type: 'DEPOSIT_DISPUTED'; reason: string }
      | { type: 'RESET' },
  },

  context: {
    tenantId: null,
    propertyId: null,
    contract: null,
    deposit: {
      amount: 0,
      type: null,
      paid: false,
    },
    inventory: {
      entryCompleted: false,
      exitCompleted: false,
      disputes: [],
    },
    rights: null,
    disputes: [],
    noticeGiven: {
      byTenant: false,
      byLandlord: false,
      effectiveDate: null,
    },
    errors: [],
    retryCount: 0,
  },

  states: {
    searching: {
      on: {
        PROPERTY_FOUND: {
          target: 'viewing',
          actions: assign({
            propertyId: ({ event }: { event: any }) => event.propertyId,
          }),
        },
      },
      meta: {
        description: 'Recherche d\'un logement à louer',
      },
    },

    viewing: {
      on: {
        SUBMIT_APPLICATION: {
          target: 'application_submitted',
        },
        PROPERTY_FOUND: {
          actions: assign({
            propertyId: ({ event }: { event: any }) => event.propertyId,
          }),
        },
      },
      meta: {
        description: 'Visite du bien et préparation du dossier',
      },
    },

    application_submitted: {
      on: {
        APPLICATION_ACCEPTED: {
          target: 'contract_preparation',
        },
        APPLICATION_REJECTED: {
          target: 'searching',
          actions: assign({
            propertyId: null,
            errors: ({ event }: { event: any }) => [event.reason],
          }),
        },
      },
      meta: {
        description: 'Candidature soumise - vérification des documents',
      },
    },

    contract_preparation: {
      on: {
        SIGN_CONTRACT: {
          target: 'contract_signed',
          actions: assign({
            contract: ({ event }: { event: any }) => event.contract,
          }),
        },
      },
      meta: {
        description: 'Préparation et révision du contrat de bail',
      },
    },

    contract_signed: {
      on: {
        PAY_DEPOSIT: {
          target: 'deposit_paid',
          actions: assign({
            deposit: ({ event }: { event: any }) => ({
              amount: event.amount,
              type: event.type,
              paid: true,
            }),
          }),
        },
      },
      meta: {
        description: 'Bail signé - en attente du paiement de la garantie',
      },
    },

    deposit_paid: {
      on: {
        COMPLETE_INVENTORY: {
          target: 'inventory_completed',
          actions: assign({
            inventory: ({ context }: { context: any }) => ({
              ...context.inventory,
              entryCompleted: true,
            }),
          }),
        },
      },
      meta: {
        description: 'Garantie locative constituée',
      },
    },

    inventory_completed: {
      on: {
        RECEIVE_KEYS: {
          target: 'active_tenancy',
        },
      },
      meta: {
        description: 'État des lieux d\'entrée complété',
      },
    },

    active_tenancy: {
      initial: 'normal',
      states: {
        normal: {
          on: {
            REPORT_ISSUE: {
              target: 'with_dispute',
              actions: assign({
                disputes: ({ context, event }: { context: any; event: any }) => [
                  ...context.disputes,
                  event.issue,
                ],
              }),
            },
            GIVE_NOTICE: {
              target: 'notice_period',
              actions: assign({
                noticeGiven: ({ event }: { event: any }) => ({
                  byTenant: true,
                  byLandlord: false,
                  effectiveDate: event.effectiveDate,
                }),
              }),
            },
            LANDLORD_NOTICE: {
              target: 'notice_period',
              actions: assign({
                noticeGiven: ({ event }: { event: any }) => ({
                  byTenant: false,
                  byLandlord: true,
                  effectiveDate: event.effectiveDate,
                }),
              }),
            },
          },
          meta: {
            description: 'Location active sans problème',
          },
        },

        with_dispute: {
          on: {
            ISSUE_RESOLVED: {
              target: 'normal',
              actions: assign({
                disputes: ({ context, event }: { context: any; event: any }) =>
                  context.disputes.map((d: RentalDispute) =>
                    d.description === event.disputeId
                      ? { ...d, status: 'resolved' }
                      : d
                  ),
              }),
            },
            GIVE_NOTICE: {
              target: 'notice_period',
              actions: assign({
                noticeGiven: ({ event }: { event: any }) => ({
                  byTenant: true,
                  byLandlord: false,
                  effectiveDate: event.effectiveDate,
                }),
              }),
            },
          },
          meta: {
            description: 'Location avec litige en cours',
          },
        },

        notice_period: {
          on: {
            EXIT_INVENTORY: {
              target: '#rentalApplication.exit_process',
              actions: assign({
                inventory: ({ context }: { context: any }) => ({
                  ...context.inventory,
                  exitCompleted: true,
                }),
              }),
            },
          },
          meta: {
            description: 'Période de préavis en cours',
          },
        },
      },
      meta: {
        description: 'Bail actif - location en cours',
      },
    },

    exit_process: {
      initial: 'inventory_exit',
      states: {
        inventory_exit: {
          on: {
            DEPOSIT_RETURNED: {
              target: 'deposit_released',
            },
            DEPOSIT_DISPUTED: {
              target: 'deposit_dispute',
              actions: assign({
                inventory: ({ context, event }: { context: any; event: any }) => ({
                  ...context.inventory,
                  disputes: [...context.inventory.disputes, event.reason],
                }),
              }),
            },
          },
          meta: {
            description: 'État des lieux de sortie',
          },
        },

        deposit_dispute: {
          on: {
            DEPOSIT_RETURNED: {
              target: 'deposit_released',
            },
          },
          meta: {
            description: 'Litige sur la restitution de la garantie',
          },
        },

        deposit_released: {
          on: {
            RESET: {
              target: '#rentalApplication.terminated',
            },
          },
          meta: {
            description: 'Garantie locative restituée',
          },
        },
      },
      meta: {
        description: 'Processus de sortie du logement',
      },
    },

    terminated: {
      type: 'final',
      meta: {
        description: 'Location terminée',
      },
    },
  },
});

/**
 * Visualization of the rental workflow:
 *
 * searching → viewing → application_submitted
 *                              ↓
 *                     contract_preparation
 *                              ↓
 *                      contract_signed
 *                              ↓
 *                       deposit_paid
 *                              ↓
 *                    inventory_completed
 *                              ↓
 *                      active_tenancy
 *                    /        |        \
 *              normal   with_dispute   notice_period
 *                              ↓
 *                       exit_process
 *                    /        |        \
 *          inventory_exit  dispute  deposit_released
 *                              ↓
 *                         terminated
 */