/**
 * XState machine for Energy Subsidy Application Workflow
 *
 * This state machine manages the process of applying for energy subsidies
 * including eligibility check, document submission, technical validation, and payment.
 */

import { createMachine, assign } from 'xstate';
import {
  EnergySubsidyType,
  EnergySubsidyRequest,
  EcologieEligibilityResult,
  Region,
} from '../../domain/ecologieTypes';

interface EnergySubsidyContext {
  request: EnergySubsidyRequest | null;
  eligibilityResult: EcologieEligibilityResult | null;
  documents: {
    submitted: string[];
    required: string[];
    validated: boolean;
  };
  technicalControl: {
    required: boolean;
    scheduled: boolean;
    completed: boolean;
    result: 'pending' | 'approved' | 'rejected' | null;
    remarks?: string[];
  };
  payment: {
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    date?: Date;
    reference?: string;
  };
  auditRequired: boolean;
  retryCount: number;
  errors: string[];
}

export const primeEnergieMachine = createMachine({
  id: 'primeEnergie',
  initial: 'idle',

  schemas: {
    context: {} as EnergySubsidyContext,
    events: {} as
      | { type: 'START_APPLICATION'; request: EnergySubsidyRequest }
      | { type: 'ELIGIBILITY_CHECKED'; result: EcologieEligibilityResult }
      | { type: 'SUBMIT_DOCUMENTS'; documents: string[] }
      | { type: 'DOCUMENTS_VALIDATED' }
      | { type: 'DOCUMENTS_REJECTED'; missing: string[] }
      | { type: 'SCHEDULE_CONTROL'; date: Date }
      | { type: 'CONTROL_COMPLETED'; result: 'approved' | 'rejected'; remarks?: string[] }
      | { type: 'CALCULATE_SUBSIDY'; amount: number }
      | { type: 'PROCESS_PAYMENT' }
      | { type: 'PAYMENT_COMPLETED'; reference: string }
      | { type: 'PAYMENT_FAILED'; reason: string }
      | { type: 'RETRY' }
      | { type: 'CANCEL' }
      | { type: 'RESET' },
  },

  context: {
    request: null,
    eligibilityResult: null,
    documents: {
      submitted: [] as string[],
      required: [] as string[],
      validated: false,
    },
    technicalControl: {
      required: false,
      scheduled: false,
      completed: false,
      result: null,
    },
    payment: {
      amount: 0,
      status: 'pending',
    },
    auditRequired: false,
    retryCount: 0,
    errors: [] as string[],
  },

  states: {
    idle: {
      on: {
        START_APPLICATION: {
          target: 'checkingEligibility',
          actions: assign({
            request: ({ event }) => event.request,
            retryCount: 0,
            errors: [],
          }),
        },
      },
      meta: {
        description: 'En attente de demande de prime énergie',
      },
    },

    checkingEligibility: {
      entry: assign({
        auditRequired: ({ context }: any) => {
          const ctx = context as EnergySubsidyContext;
          return (ctx.request?.estimatedCost ?? 0) > 25000;
        },
      } as any),
      on: {
        ELIGIBILITY_CHECKED: [
          {
            target: 'documentSubmission',
            guard: ({ event }) => event.result.isEligible === true,
            actions: assign({
              eligibilityResult: ({ event }: any) => event.result,
              documents: ({ event }: any) => ({
                submitted: [],
                required: event.result.requiredDocuments || [],
                validated: false,
              }),
              technicalControl: ({ context }: any) => {
                const ctx = context as EnergySubsidyContext;
                return {
                  ...ctx.technicalControl,
                  required: ctx.request?.type === 'panneaux-solaires' ||
                           ctx.request?.type === 'pompe-chaleur',
                };
              },
            } as any),
          },
          {
            target: 'ineligible',
            actions: assign({
              eligibilityResult: ({ event }) => event.result,
            }),
          },
        ],
      },
      meta: {
        description: 'Vérification des conditions d\'éligibilité',
      },
    },

    documentSubmission: {
      initial: 'waiting',
      states: {
        waiting: {
          on: {
            SUBMIT_DOCUMENTS: {
              target: 'validating',
              actions: assign({
                documents: ({ context, event }) => ({
                  ...context.documents,
                  submitted: event.documents,
                }),
              }),
            },
          },
          meta: {
            description: 'En attente des documents justificatifs',
          },
        },
        validating: {
          on: {
            DOCUMENTS_VALIDATED: [
              {
                target: '#primeEnergie.technicalValidation',
                guard: ({ context }) => context.technicalControl.required,
                actions: assign({
                  documents: ({ context }) => ({
                    ...context.documents,
                    validated: true,
                  }),
                }),
              },
              {
                target: '#primeEnergie.subsidyCalculation',
                guard: ({ context }) => !context.technicalControl.required,
                actions: assign({
                  documents: ({ context }) => ({
                    ...context.documents,
                    validated: true,
                  }),
                }),
              },
            ],
            DOCUMENTS_REJECTED: [
              {
                target: 'waiting',
                guard: ({ context }) => context.retryCount < 3,
                actions: assign({
                  documents: ({ context, event }) => ({
                    ...context.documents,
                    required: event.missing,
                    validated: false,
                  }),
                  retryCount: ({ context }) => context.retryCount + 1,
                  errors: ({ context, event }) => [
                    ...context.errors,
                    `Documents manquants: ${event.missing.join(', ')}`,
                  ],
                }),
              },
              {
                target: '#primeEnergie.rejected',
                guard: ({ context }) => context.retryCount >= 3,
              },
            ],
          },
          meta: {
            description: 'Validation des documents soumis',
          },
        },
      },
    },

    technicalValidation: {
      initial: 'scheduling',
      states: {
        scheduling: {
          on: {
            SCHEDULE_CONTROL: {
              target: 'waiting',
              actions: assign({
                technicalControl: ({ context }) => ({
                  ...context.technicalControl,
                  scheduled: true,
                }),
              }),
            },
          },
          meta: {
            description: 'Planification du contrôle technique',
          },
        },
        waiting: {
          on: {
            CONTROL_COMPLETED: [
              {
                target: '#primeEnergie.subsidyCalculation',
                guard: ({ event }) => event.result === 'approved',
                actions: assign({
                  technicalControl: ({ context, event }) => ({
                    ...context.technicalControl,
                    completed: true,
                    result: event.result,
                    remarks: event.remarks,
                  }),
                }),
              },
              {
                target: 'remediation',
                guard: ({ event }) => event.result === 'rejected',
                actions: assign({
                  technicalControl: ({ context, event }) => ({
                    ...context.technicalControl,
                    completed: true,
                    result: event.result,
                    remarks: event.remarks,
                  }),
                }),
              },
            ],
          },
          meta: {
            description: 'En attente du contrôle technique sur site',
          },
        },
        remediation: {
          on: {
            RETRY: {
              target: 'scheduling',
              guard: ({ context }) => context.retryCount < 2,
              actions: assign({
                retryCount: ({ context }) => context.retryCount + 1,
                technicalControl: ({ context }) => ({
                  ...context.technicalControl,
                  scheduled: false,
                  completed: false,
                  result: null,
                }),
              }),
            },
            CANCEL: {
              target: '#primeEnergie.cancelled',
            },
          },
          meta: {
            description: 'Corrections requises suite au contrôle technique',
          },
        },
      },
    },

    subsidyCalculation: {
      entry: assign({
        payment: ({ context }: any) => {
          const ctx = context as EnergySubsidyContext;
          return {
            ...ctx.payment,
            amount: ctx.eligibilityResult?.subsidyAmount || 0,
          };
        },
      } as any),
      on: {
        CALCULATE_SUBSIDY: {
          target: 'payment',
          actions: assign({
            payment: ({ context, event }: any) => {
              const ctx = context as EnergySubsidyContext;
              return {
                ...ctx.payment,
                amount: event.amount,
              };
            },
          } as any),
        },
      },
      meta: {
        description: 'Calcul du montant de la prime',
      },
    },

    payment: {
      initial: 'processing',
      states: {
        processing: {
          on: {
            PAYMENT_COMPLETED: {
              target: 'completed',
              actions: assign({
                payment: ({ context, event }) => ({
                  ...context.payment,
                  status: 'completed',
                  date: new Date(),
                  reference: event.reference,
                }),
              }),
            },
            PAYMENT_FAILED: {
              target: 'failed',
              actions: assign({
                payment: ({ context }) => ({
                  ...context.payment,
                  status: 'failed',
                }),
                errors: ({ context, event }) => [
                  ...context.errors,
                  `Échec du paiement: ${event.reason}`,
                ],
              }),
            },
          },
          meta: {
            description: 'Traitement du paiement de la prime',
          },
        },
        completed: {
          type: 'final',
          meta: {
            description: 'Prime versée avec succès',
          },
        },
        failed: {
          on: {
            RETRY: {
              target: 'processing',
              guard: ({ context }) => context.retryCount < 3,
              actions: assign({
                retryCount: ({ context }) => context.retryCount + 1,
              }),
            },
          },
          meta: {
            description: 'Échec du paiement - nouvelle tentative possible',
          },
        },
      },
    },

    ineligible: {
      on: {
        RESET: {
          target: 'idle',
        },
      },
      meta: {
        description: 'Non éligible à la prime énergie',
      },
    },

    rejected: {
      on: {
        RESET: {
          target: 'idle',
        },
      },
      meta: {
        description: 'Demande rejetée après plusieurs tentatives',
      },
    },

    cancelled: {
      type: 'final',
      meta: {
        description: 'Demande annulée par le demandeur',
      },
    },
  },
});

/**
 * Calculate subsidy amount with bonuses
 */
export function calculateTotalSubsidy(
  baseAmount: number,
  incomeCategory: 'base' | 'modeste' | 'précaire',
  performanceBonus: boolean,
  cumulativeWorks: number
): number {
  let total = baseAmount;

  // Income multiplier
  const incomeMultipliers = {
    base: 1.0,
    modeste: 1.5,
    précaire: 2.0,
  };
  total *= incomeMultipliers[incomeCategory];

  // Performance bonus (25% for reaching A label)
  if (performanceBonus) {
    total *= 1.25;
  }

  // Cumulative works bonus (10% for 3+ measures)
  if (cumulativeWorks >= 3) {
    total *= 1.1;
  }

  // Cap at maximum allowed
  const maxSubsidy = 15000;
  return Math.min(total, maxSubsidy);
}

/**
 * Determine technical control requirements
 */
export function requiresTechnicalControl(
  subsidyType: EnergySubsidyType,
  amount: number
): boolean {
  // Always require control for certain types
  const alwaysControl = [
    'panneaux-solaires',
    'pompe-chaleur',
    'chaudière-biomasse',
  ];

  if (alwaysControl.includes(subsidyType)) {
    return true;
  }

  // Require control for high amounts
  return amount > 5000;
}

/**
 * Generate payment reference
 */
export function generatePaymentReference(
  region: Region,
  subsidyType: EnergySubsidyType,
  applicationId: string
): string {
  const regionCode = {
    wallonie: 'W',
    flandre: 'VL',
    bruxelles: 'BXL',
    federal: 'FED',
  }[region];

  const typeCode = {
    'panneaux-solaires': 'SOL',
    'pompe-chaleur': 'PAC',
    'isolation': 'ISO',
    'chaudière-biomasse': 'BIO',
    'audit-énergétique': 'AUD',
    'rénovation-énergétique': 'REN',
  }[subsidyType];

  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

  return `${regionCode}-${typeCode}-${year}-${random}`;
}

/**
 * Validate document completeness
 */
export function validateDocuments(
  submitted: string[],
  required: string[]
): {
  isValid: boolean;
  missing: string[];
} {
  const missing = required.filter(doc => !submitted.includes(doc));

  return {
    isValid: missing.length === 0,
    missing,
  };
}