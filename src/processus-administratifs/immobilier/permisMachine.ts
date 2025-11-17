/**
 * XState machine for Urban Planning Permit Application Workflow
 *
 * This state machine represents the permit application process for construction,
 * renovation, and urban development projects in Belgium.
 */

import { createMachine, assign } from 'xstate';
import {
  UrbanPermit,
  UrbanPermitStatus,
  BelgianRegion,
} from '../../domain/immobilierTypes';

interface PermitContext {
  permit: UrbanPermit | null;
  region: BelgianRegion | null;
  publicInquiryRequired: boolean;
  publicObjections: {
    count: number;
    details: string[];
  };
  technicalReports: {
    urbanism: boolean;
    environment: boolean;
    heritage: boolean;
    mobility: boolean;
  };
  conditions: string[];
  processingDays: number;
  maxProcessingDays: number;
  appealFiled: boolean;
  errors: string[];
  retryCount: number;
}

export const permisMachine = createMachine({
  id: 'permitApplication',
  initial: 'preparation',

  schemas: {
    context: {} as PermitContext,
    events: {} as
      | { type: 'SUBMIT_APPLICATION'; permit: UrbanPermit; region: BelgianRegion }
      | { type: 'APPLICATION_INCOMPLETE'; missingDocuments: string[] }
      | { type: 'APPLICATION_COMPLETE' }
      | { type: 'START_PUBLIC_INQUIRY' }
      | { type: 'RECEIVE_OBJECTIONS'; objections: string[] }
      | { type: 'PUBLIC_INQUIRY_CLOSED' }
      | { type: 'REQUEST_TECHNICAL_REPORT'; department: string }
      | { type: 'RECEIVE_TECHNICAL_REPORT'; department: string; favorable: boolean }
      | { type: 'APPROVE' }
      | { type: 'APPROVE_WITH_CONDITIONS'; conditions: string[] }
      | { type: 'REFUSE'; reasons: string[] }
      | { type: 'FILE_APPEAL' }
      | { type: 'APPEAL_DECISION'; approved: boolean }
      | { type: 'START_WORKS' }
      | { type: 'COMPLETE_WORKS' }
      | { type: 'CANCEL' }
      | { type: 'RESET' },
  },

  context: {
    permit: null,
    region: null,
    publicInquiryRequired: false,
    publicObjections: {
      count: 0,
      details: [],
    },
    technicalReports: {
      urbanism: false,
      environment: false,
      heritage: false,
      mobility: false,
    },
    conditions: [],
    processingDays: 0,
    maxProcessingDays: 115,
    appealFiled: false,
    errors: [],
    retryCount: 0,
  },

  states: {
    preparation: {
      on: {
        SUBMIT_APPLICATION: {
          target: 'submitted',
          actions: assign({
            permit: ({ event }: { event: any }) => event.permit,
            region: ({ event }: { event: any }) => event.region,
            maxProcessingDays: ({ event }: { event: any }) => {
              // Set max processing days based on type
              if (event.permit.publicInquiryRequired) {
                return 115; // With public inquiry
              }
              return 75; // Without public inquiry
            },
          }),
        },
      },
      meta: {
        description: 'Préparation du dossier de demande de permis',
      },
    },

    submitted: {
      on: {
        APPLICATION_INCOMPLETE: {
          target: 'incomplete',
          actions: assign({
            errors: ({ event }: { event: any }) => event.missingDocuments,
          }),
        },
        APPLICATION_COMPLETE: {
          target: 'completeness_verified',
        },
      },
      after: {
        // Automatic transition after 20 days if no response
        '20000': {
          target: 'completeness_verified',
        },
      },
      meta: {
        description: 'Demande soumise - vérification de complétude en cours',
      },
    },

    incomplete: {
      on: {
        SUBMIT_APPLICATION: {
          target: 'submitted',
          actions: assign({
            errors: [],
            retryCount: ({ context }: { context: any }) => context.retryCount + 1,
          }),
        },
        CANCEL: {
          target: 'cancelled',
        },
      },
      meta: {
        description: 'Dossier incomplet - documents manquants à fournir',
      },
    },

    completeness_verified: {
      always: [
        {
          target: 'public_inquiry',
          guard: ({ context }: { context: any }) => context.permit?.publicInquiryRequired === true,
        },
        {
          target: 'technical_review',
        },
      ],
      meta: {
        description: 'Dossier complet et recevable',
      },
    },

    public_inquiry: {
      initial: 'announcing',
      states: {
        announcing: {
          after: {
            '5000': { // 5 days for announcement
              target: 'ongoing',
            },
          },
          meta: {
            description: 'Annonce de l\'enquête publique (affichage jaune)',
          },
        },
        ongoing: {
          on: {
            RECEIVE_OBJECTIONS: {
              actions: assign({
                publicObjections: ({ context, event }: { context: any; event: any }) => ({
                  count: context.publicObjections.count + event.objections.length,
                  details: [...context.publicObjections.details, ...event.objections],
                }),
              }),
            },
            PUBLIC_INQUIRY_CLOSED: {
              target: '#permitApplication.technical_review',
            },
          },
          after: {
            '30000': { // 30 days public inquiry
              target: '#permitApplication.technical_review',
            },
          },
          meta: {
            description: 'Enquête publique en cours (30 jours)',
          },
        },
      },
      meta: {
        description: 'Enquête publique obligatoire',
      },
    },

    technical_review: {
      on: {
        REQUEST_TECHNICAL_REPORT: {
          actions: assign({
            processingDays: ({ context }: { context: any }) => context.processingDays + 1,
          }),
        },
        RECEIVE_TECHNICAL_REPORT: {
          actions: assign({
            technicalReports: ({ context, event }: { context: any; event: any }) => ({
              ...context.technicalReports,
              [event.department]: event.favorable,
            }),
          }),
        },
        APPROVE: {
          target: 'approved',
        },
        APPROVE_WITH_CONDITIONS: {
          target: 'approved_with_conditions',
          actions: assign({
            conditions: ({ event }: { event: any }) => event.conditions,
          }),
        },
        REFUSE: {
          target: 'refused',
          actions: assign({
            errors: ({ event }: { event: any }) => event.reasons,
          }),
        },
      },
      after: {
        // Automatic approval if no decision within legal deadline
        '115000': {
          target: 'approved',
          guard: ({ context }: { context: any }) =>
            context.permit?.publicInquiryRequired === true,
        },
        '75000': {
          target: 'approved',
          guard: ({ context }: { context: any }) =>
            context.permit?.publicInquiryRequired === false,
        },
      },
      meta: {
        description: 'Analyse technique par les services compétents',
      },
    },

    approved: {
      on: {
        START_WORKS: {
          target: 'execution',
        },
      },
      meta: {
        description: 'Permis approuvé sans conditions',
      },
    },

    approved_with_conditions: {
      on: {
        START_WORKS: {
          target: 'execution',
        },
        FILE_APPEAL: {
          target: 'appeal',
          actions: assign({
            appealFiled: true,
          }),
        },
      },
      meta: {
        description: 'Permis approuvé avec conditions à respecter',
      },
    },

    refused: {
      on: {
        FILE_APPEAL: {
          target: 'appeal',
          actions: assign({
            appealFiled: true,
          }),
        },
        RESET: {
          target: 'preparation',
          actions: assign({
            permit: null,
            publicObjections: { count: 0, details: [] },
            conditions: [],
            errors: [],
            retryCount: 0,
          }),
        },
      },
      meta: {
        description: 'Permis refusé - recours possible',
      },
    },

    appeal: {
      on: {
        APPEAL_DECISION: [
          {
            target: 'approved',
            guard: ({ event }: { event: any }) => event.approved === true,
          },
          {
            target: 'appeal_rejected',
            guard: ({ event }: { event: any }) => event.approved === false,
          },
        ],
      },
      after: {
        '60000': { // 60 days for appeal decision
          target: 'appeal_rejected',
        },
      },
      meta: {
        description: 'Recours en cours d\'examen',
      },
    },

    appeal_rejected: {
      on: {
        RESET: {
          target: 'preparation',
        },
      },
      meta: {
        description: 'Recours rejeté - décision finale',
      },
    },

    execution: {
      on: {
        COMPLETE_WORKS: {
          target: 'completed',
        },
      },
      meta: {
        description: 'Travaux en cours d\'exécution conformément au permis',
      },
    },

    completed: {
      type: 'final',
      meta: {
        description: 'Travaux terminés et conformes au permis',
      },
    },

    cancelled: {
      on: {
        RESET: {
          target: 'preparation',
        },
      },
      meta: {
        description: 'Demande de permis annulée',
      },
    },
  },
});

/**
 * Visualization of the permit workflow:
 *
 * preparation → submitted → completeness_verified
 *                                    ↓
 *                    [public_inquiry?] → technical_review
 *                                              ↓
 *                          approved / approved_with_conditions / refused
 *                                              ↓
 *                                    [appeal?] → appeal_decision
 *                                              ↓
 *                                         execution
 *                                              ↓
 *                                         completed
 *
 * Special flows:
 * - Automatic approval if no decision within legal deadline
 * - Appeal process for refused or conditional permits
 * - Public inquiry mandatory for certain project types
 */