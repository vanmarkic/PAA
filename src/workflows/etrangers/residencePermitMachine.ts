/**
 * XState machine for Residence Permit Application Workflow
 *
 * This state machine represents the complete workflow for applying for
 * residence permits in Belgium, including all card types (A, B, C, D, E, F, H)
 */

import { createMachine, assign } from 'xstate';
import {
  ForeignerProfile,
  ResidencePermitApplication,
  ProcedureResult,
  ApplicationStatus,
  ResidenceCardType,
  RESIDENCE_PERMIT_FEES,
} from '../../domain/etrangersTypes';

interface ResidencePermitContext {
  applicant: ForeignerProfile | null;
  application: ResidencePermitApplication | null;
  result: ProcedureResult | null;
  currentStep: string;
  documentsSubmitted: string[];
  residenceControlPassed: boolean;
  paymentCompleted: boolean;
  retryCount: number;
  errors: string[];
}

export const residencePermitMachine = createMachine({
  id: 'residencePermit',
  initial: 'idle',

  schemas: {
    context: {} as ResidencePermitContext,
    events: {} as
      | { type: 'START_APPLICATION'; applicant: ForeignerProfile; application: ResidencePermitApplication }
      | { type: 'SUBMIT_DOCUMENTS'; documents: string[] }
      | { type: 'DOCUMENTS_VALIDATED' }
      | { type: 'DOCUMENTS_INCOMPLETE'; missing: string[] }
      | { type: 'SCHEDULE_APPOINTMENT'; date: Date; reference: string }
      | { type: 'APPOINTMENT_ATTENDED' }
      | { type: 'PAY_FEES'; paymentReference: string }
      | { type: 'RESIDENCE_CONTROL_SCHEDULED' }
      | { type: 'RESIDENCE_CONTROL_PASSED' }
      | { type: 'RESIDENCE_CONTROL_FAILED'; reason: string }
      | { type: 'DECISION_MADE'; approved: boolean; reason?: string }
      | { type: 'CARD_READY' }
      | { type: 'CARD_COLLECTED' }
      | { type: 'APPEAL_FILED' }
      | { type: 'RETRY' }
      | { type: 'ABANDON' }
  },

  context: {
    applicant: null,
    application: null,
    result: null,
    currentStep: '',
    documentsSubmitted: [] as string[],
    residenceControlPassed: false,
    paymentCompleted: false,
    retryCount: 0,
    errors: [] as string[],
  },

  states: {
    idle: {
      on: {
        START_APPLICATION: {
          target: 'documentPreparation',
          actions: assign({
            applicant: ({ event }: { event: any }) => event.applicant,
            application: ({ event }: { event: any }) => event.application,
            currentStep: 'Document preparation',
            retryCount: 0,
          }),
        },
      },
      meta: {
        description: 'En attente du début de la procédure de demande de titre de séjour',
      },
    },

    documentPreparation: {
      on: {
        SUBMIT_DOCUMENTS: {
          target: 'documentValidation',
          actions: assign({
            documentsSubmitted: ({ event }: { event: any }) => event.documents,
            currentStep: 'Document validation',
          }),
        },
      },
      meta: {
        description: 'Préparation et rassemblement des documents requis',
      },
    },

    documentValidation: {
      on: {
        DOCUMENTS_VALIDATED: {
          target: 'appointmentScheduling',
        },
        DOCUMENTS_INCOMPLETE: {
          target: 'documentPreparation',
          actions: assign({
            errors: ({ event, context }: { event: any; context: any }) => [
              ...context.errors,
              `Documents manquants: ${event.missing.join(', ')}`,
            ],
          }),
        },
      },
      meta: {
        description: 'Validation de la complétude et conformité des documents',
      },
    },

    appointmentScheduling: {
      on: {
        SCHEDULE_APPOINTMENT: {
          target: 'appointmentWaiting',
          actions: assign({
            application: ({ event, context }: { event: any; context: any }) => ({
              ...context.application,
              appointmentDate: event.date,
              appointmentReference: event.reference,
            }),
            currentStep: 'Appointment scheduled',
          }),
        },
      },
      meta: {
        description: 'Prise de rendez-vous à la commune',
      },
    },

    appointmentWaiting: {
      on: {
        APPOINTMENT_ATTENDED: {
          target: 'feePayment',
        },
      },
      meta: {
        description: 'En attente du rendez-vous à la commune',
      },
    },

    feePayment: {
      on: {
        PAY_FEES: {
          target: 'residenceControl',
          actions: assign({
            paymentCompleted: true,
            application: ({ event, context }: { event: any; context: any }) => ({
              ...context.application,
              fees: {
                ...context.application.fees,
                paid: true,
                paymentDate: new Date(),
                paymentReference: event.paymentReference,
              },
            }),
            currentStep: 'Payment completed',
          }),
        },
      },
      meta: {
        description: 'Paiement des frais de dossier et de carte',
      },
    },

    residenceControl: {
      initial: 'scheduling',
      states: {
        scheduling: {
          on: {
            RESIDENCE_CONTROL_SCHEDULED: {
              target: 'waiting',
            },
          },
          meta: {
            description: 'Planification du contrôle de résidence par l\'agent de quartier',
          },
        },
        waiting: {
          on: {
            RESIDENCE_CONTROL_PASSED: {
              target: '#residencePermit.processing',
              actions: assign({
                residenceControlPassed: true,
                currentStep: 'Residence control passed',
              }),
            },
            RESIDENCE_CONTROL_FAILED: [
              {
                target: 'retry',
                guard: ({ context }: { context: any }) => context.retryCount < 2,
                actions: assign({
                  retryCount: ({ context }: { context: any }) => context.retryCount + 1,
                  errors: ({ event, context }: { event: any; context: any }) => [
                    ...context.errors,
                    `Contrôle échoué: ${event.reason}`,
                  ],
                }),
              },
              {
                target: '#residencePermit.rejected',
                actions: assign({
                  errors: ({ event, context }: { event: any; context: any }) => [
                    ...context.errors,
                    `Contrôle définitivement échoué: ${event.reason}`,
                  ],
                }),
              },
            ],
          },
          meta: {
            description: 'En attente du passage de l\'agent de quartier',
          },
        },
        retry: {
          on: {
            RESIDENCE_CONTROL_SCHEDULED: {
              target: 'waiting',
            },
          },
          meta: {
            description: 'Nouvelle tentative de contrôle de résidence',
          },
        },
      },
    },

    processing: {
      on: {
        DECISION_MADE: [
          {
            target: 'approved',
            guard: ({ event }: { event: any }) => event.approved === true,
            actions: assign({
              result: ({ event }: any) => ({
                success: true,
                decision: 'approved',
                referenceNumber: generateReferenceNumber(),
                validityPeriod: getValidityPeriod(event),
                notifications: [
                  {
                    type: 'success',
                    message: 'Votre demande de titre de séjour a été approuvée',
                    date: new Date(),
                  },
                ],
              }),
              currentStep: 'Application approved',
            } as any),
          },
          {
            target: 'rejected',
            actions: assign({
              result: ({ event }: any) => ({
                success: false,
                decision: 'rejected',
                reasons: [event.reason],
                appealDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                notifications: [
                  {
                    type: 'error',
                    message: `Demande refusée: ${event.reason}`,
                    date: new Date(),
                  },
                ],
              }),
              currentStep: 'Application rejected',
            } as any),
          },
        ],
      },
      meta: {
        description: 'Traitement de la demande par l\'Office des Étrangers',
      },
    },

    approved: {
      initial: 'cardProduction',
      states: {
        cardProduction: {
          on: {
            CARD_READY: {
              target: 'cardReady',
            },
          },
          meta: {
            description: 'Production de la carte de séjour',
          },
        },
        cardReady: {
          on: {
            CARD_COLLECTED: {
              target: '#residencePermit.completed',
            },
          },
          meta: {
            description: 'Carte prête à être récupérée à la commune',
          },
        },
      },
    },

    rejected: {
      on: {
        APPEAL_FILED: {
          target: 'appeal',
          actions: assign({
            currentStep: 'Appeal filed',
          }),
        },
        ABANDON: {
          target: 'abandoned',
        },
      },
      meta: {
        description: 'Demande refusée - possibilité de recours',
      },
    },

    appeal: {
      on: {
        DECISION_MADE: [
          {
            target: 'approved',
            guard: ({ event }: { event: any }) => event.approved === true,
          },
          {
            target: 'finalRejection',
          },
        ],
      },
      meta: {
        description: 'Procédure de recours au CCE en cours',
      },
    },

    finalRejection: {
      type: 'final',
      meta: {
        description: 'Rejet définitif après épuisement des recours',
      },
    },

    abandoned: {
      type: 'final',
      meta: {
        description: 'Procédure abandonnée par le demandeur',
      },
    },

    completed: {
      type: 'final',
      meta: {
        description: 'Procédure terminée avec succès - carte de séjour obtenue',
      },
    },
  },
});

/**
 * Helper functions
 */
function generateReferenceNumber(): string {
  return `BE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
}

function getValidityPeriod(event: any) {
  const startDate = new Date();
  const endDate = new Date();

  const cardValidityMap: Record<ResidenceCardType, number> = {
    A: 1, // 1 year
    B: 99, // Unlimited (represented as 99 years)
    C: 5, // 5 years
    D: 5, // 5 years
    E: 5, // 5 years
    'E+': 99, // Permanent
    F: 5, // 5 years
    'F+': 99, // Permanent
    H: 2, // 2 years (Blue Card)
    K: 5, // 5 years
    L: 1, // Duplicate validity
    M: 1, // Special
    N: 1, // Protection
    EU: 5, // EU official
    'EU+': 99, // EU permanent
    AI: 0.5, // 6 months
    'Annexe-3': 0, // OQT
    'Annexe-13': 0, // OQT with ban
    'Annexe-15': 0.25, // 3 months
    'Annexe-19': 1, // Student
    'Annexe-19ter': 1, // Family
    'Annexe-35': 0.5, // 6 months
  };

  const years = cardValidityMap[event.cardType as ResidenceCardType] || 1;
  endDate.setFullYear(endDate.getFullYear() + years);

  return {
    from: startDate,
    to: endDate,
  };
}

/**
 * Visualization of the residence permit workflow:
 *
 * idle
 *   → documentPreparation
 *       → documentValidation
 *           → appointmentScheduling
 *               → appointmentWaiting
 *                   → feePayment
 *                       → residenceControl
 *                           → processing
 *                               ↓ (approved)    ↓ (rejected)
 *                             approved         rejected
 *                               ↓                 ↓ (appeal)
 *                           cardProduction      appeal
 *                               ↓                 ↓
 *                           cardReady      (approved/finalRejection)
 *                               ↓
 *                           completed
 *
 * The workflow includes:
 * - Document preparation and validation
 * - Municipality appointment
 * - Fee payment
 * - Residence control by police
 * - Decision by immigration office
 * - Card production and collection
 * - Appeal procedures if rejected
 */