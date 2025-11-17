/**
 * XState machine for Identity Document Application Workflow
 *
 * This state machine handles the complete lifecycle of identity document applications
 * including initial request, document verification, production, and delivery.
 */

import { createMachine, assign } from 'xstate';
import {
  IdentityDocument,
  PersonDetails,
  RequestStatus,
  ValidationResult,
  RequiredDocument
} from '../../domain/droitsCivilsTypes';

interface IdentityDocumentContext {
  applicant: PersonDetails | null;
  documentType: string | null;
  currentDocument: IdentityDocument | null;
  urgentProcedure: boolean;
  documents: RequiredDocument[];
  validationResult: ValidationResult | null;
  appointmentDate: Date | null;
  productionId: string | null;
  deliveryMethod: 'commune' | 'home' | 'post' | null;
  status: RequestStatus;
  retryCount: number;
  errors: string[];
}

export const identityDocumentMachine = createMachine({
  id: 'identityDocument',
  initial: 'idle',

  schemas: {
    context: {} as IdentityDocumentContext,
    events: {} as
      | { type: 'START_APPLICATION'; applicant: PersonDetails; documentType: string }
      | { type: 'SUBMIT_DOCUMENTS'; documents: RequiredDocument[] }
      | { type: 'DOCUMENTS_VALIDATED'; result: ValidationResult }
      | { type: 'DOCUMENTS_REJECTED'; reasons: string[] }
      | { type: 'SCHEDULE_APPOINTMENT'; date: Date }
      | { type: 'APPOINTMENT_COMPLETED' }
      | { type: 'BIOMETRICS_CAPTURED' }
      | { type: 'PAYMENT_RECEIVED'; amount: number }
      | { type: 'PRODUCTION_STARTED'; productionId: string }
      | { type: 'PRODUCTION_COMPLETED' }
      | { type: 'READY_FOR_PICKUP' }
      | { type: 'DOCUMENT_DELIVERED' }
      | { type: 'RETRY' }
      | { type: 'CANCEL' }
      | { type: 'RESET' }
  },

  context: {
    applicant: null,
    documentType: null,
    currentDocument: null,
    urgentProcedure: false,
    documents: [],
    validationResult: null,
    appointmentDate: null,
    productionId: null,
    deliveryMethod: null,
    status: 'draft',
    retryCount: 0,
    errors: [],
  },

  states: {
    idle: {
      on: {
        START_APPLICATION: {
          target: 'documentCollection',
          actions: assign({
            applicant: ({ event }) => event.applicant,
            documentType: ({ event }) => event.documentType,
            status: 'submitted',
            retryCount: 0,
          }),
        },
      },
      meta: {
        description: 'En attente du début de la demande de document d\'identité',
      },
    },

    documentCollection: {
      on: {
        SUBMIT_DOCUMENTS: {
          target: 'validatingDocuments',
          actions: assign({
            documents: ({ event }) => event.documents,
          }),
        },
        CANCEL: {
          target: 'cancelled',
        },
      },
      meta: {
        description: 'Collecte des documents requis (photo, acte de naissance, etc.)',
      },
    },

    validatingDocuments: {
      on: {
        DOCUMENTS_VALIDATED: {
          target: 'schedulingAppointment',
          actions: assign({
            validationResult: ({ event }) => event.result,
            status: 'under-review',
          }),
        },
        DOCUMENTS_REJECTED: [
          {
            target: 'documentCorrection',
            guard: ({ context }) => context.retryCount < 3,
            actions: assign({
              errors: ({ event }) => event.reasons,
              retryCount: ({ context }) => context.retryCount + 1,
            }),
          },
          {
            target: 'rejected',
            actions: assign({
              errors: ({ event }) => event.reasons,
              status: 'rejected',
            }),
          },
        ],
      },
      meta: {
        description: 'Vérification de la conformité des documents fournis',
      },
    },

    documentCorrection: {
      on: {
        SUBMIT_DOCUMENTS: {
          target: 'validatingDocuments',
          actions: assign({
            documents: ({ event }) => event.documents,
            errors: [],
          }),
        },
        CANCEL: {
          target: 'cancelled',
        },
      },
      meta: {
        description: 'Correction des documents non conformes',
      },
    },

    schedulingAppointment: {
      on: {
        SCHEDULE_APPOINTMENT: {
          target: 'awaitingAppointment',
          actions: assign({
            appointmentDate: ({ event }) => event.date,
          }),
        },
      },
      meta: {
        description: 'Prise de rendez-vous à la commune pour finaliser la demande',
      },
    },

    awaitingAppointment: {
      on: {
        APPOINTMENT_COMPLETED: {
          target: 'biometricCapture',
        },
        CANCEL: {
          target: 'cancelled',
        },
      },
      meta: {
        description: 'En attente du rendez-vous à la commune',
      },
    },

    biometricCapture: {
      on: {
        BIOMETRICS_CAPTURED: {
          target: 'paymentProcessing',
        },
      },
      meta: {
        description: 'Capture des données biométriques (photo, empreintes)',
      },
    },

    paymentProcessing: {
      on: {
        PAYMENT_RECEIVED: {
          target: 'production',
          actions: assign({
            status: 'approved',
          }),
        },
        CANCEL: {
          target: 'cancelled',
        },
      },
      meta: {
        description: 'Traitement du paiement des frais administratifs',
      },
    },

    production: {
      on: {
        PRODUCTION_STARTED: {
          actions: assign({
            productionId: ({ event }) => event.productionId,
          }),
        },
        PRODUCTION_COMPLETED: [
          {
            target: 'qualityControl',
            guard: ({ context }) => !context.urgentProcedure,
          },
          {
            target: 'readyForDelivery',
            guard: ({ context }) => context.urgentProcedure,
          },
        ],
      },
      meta: {
        description: 'Production du document d\'identité',
      },
    },

    qualityControl: {
      on: {
        READY_FOR_PICKUP: {
          target: 'readyForDelivery',
        },
        PRODUCTION_STARTED: {
          target: 'production',
          actions: assign({
            productionId: ({ event }) => event.productionId,
            retryCount: ({ context }) => context.retryCount + 1,
          }),
        },
      },
      meta: {
        description: 'Contrôle qualité du document produit',
      },
    },

    readyForDelivery: {
      on: {
        DOCUMENT_DELIVERED: {
          target: 'completed',
        },
      },
      meta: {
        description: 'Document prêt pour retrait ou livraison',
      },
    },

    completed: {
      on: {
        RESET: {
          target: 'idle',
          actions: assign({
            applicant: null,
            documentType: null,
            currentDocument: null,
            documents: [],
            validationResult: null,
            appointmentDate: null,
            productionId: null,
            status: 'completed',
            errors: [],
            retryCount: 0,
          }),
        },
      },
      meta: {
        description: 'Document d\'identité délivré avec succès',
      },
    },

    rejected: {
      on: {
        RETRY: {
          target: 'documentCollection',
          guard: ({ context }) => context.retryCount < 3,
          actions: assign({
            retryCount: ({ context }) => context.retryCount + 1,
            errors: [],
            status: 'submitted',
          }),
        },
        RESET: {
          target: 'idle',
        },
      },
      meta: {
        description: 'Demande rejetée - documents non conformes ou conditions non remplies',
      },
    },

    cancelled: {
      on: {
        RESET: {
          target: 'idle',
        },
      },
      meta: {
        description: 'Demande annulée par l\'utilisateur',
      },
    },
  },
});

/**
 * Workflow visualization:
 *
 * idle
 *   ↓
 * documentCollection
 *   ↓
 * validatingDocuments
 *   ↓ (valid)        ↓ (invalid)
 * schedulingAppointment   documentCorrection
 *   ↓                        ↓ (retry)
 * awaitingAppointment ←------┘
 *   ↓
 * biometricCapture
 *   ↓
 * paymentProcessing
 *   ↓
 * production
 *   ↓
 * qualityControl
 *   ↓
 * readyForDelivery
 *   ↓
 * completed
 *
 * Side paths:
 * - rejected (after 3 failed attempts)
 * - cancelled (user cancellation)
 */

/**
 * Helper function to determine required documents
 */
export function getRequiredDocuments(
  documentType: string,
  isFirstRequest: boolean,
  replacementReason?: string
): RequiredDocument[] {
  const baseDocuments: RequiredDocument[] = [
    {
      name: 'Photo d\'identité conforme ICAO',
      type: 'photo',
      mandatory: true,
      submitted: false,
    },
  ];

  if (isFirstRequest) {
    baseDocuments.push(
      {
        name: 'Acte de naissance',
        type: 'birth-certificate',
        mandatory: true,
        submitted: false,
      },
      {
        name: 'Certificat de résidence',
        type: 'residence-certificate',
        mandatory: true,
        submitted: false,
      }
    );
  }

  if (replacementReason === 'vole' || replacementReason === 'perdu') {
    baseDocuments.push({
      name: 'Déclaration de perte/vol (PV police)',
      type: 'police-declaration',
      mandatory: true,
      submitted: false,
    });
  }

  if (documentType === 'passeport') {
    baseDocuments.push({
      name: 'Ancienne carte d\'identité ou passeport',
      type: 'old-document',
      mandatory: false,
      submitted: false,
    });
  }

  return baseDocuments;
}

/**
 * Calculate estimated completion time
 */
export function calculateEstimatedCompletionTime(
  urgentProcedure: boolean,
  documentType: string
): {
  minDays: number;
  maxDays: number;
  steps: { name: string; duration: number }[];
} {
  const steps = [
    { name: 'Validation documents', duration: 1 },
    { name: 'Rendez-vous commune', duration: urgentProcedure ? 1 : 3 },
    { name: 'Production', duration: urgentProcedure ? 2 : 7 },
    { name: 'Livraison', duration: 1 },
  ];

  const totalMin = steps.reduce((sum, step) => sum + step.duration, 0);
  const totalMax = urgentProcedure ? totalMin + 1 : totalMin + 3;

  return {
    minDays: totalMin,
    maxDays: totalMax,
    steps,
  };
}