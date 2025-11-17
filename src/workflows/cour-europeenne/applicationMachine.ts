/**
 * XState machine for ECHR Individual Application Workflow
 *
 * This state machine manages the complete lifecycle of an individual application
 * to the European Court of Human Rights, from initial filing through judgment execution.
 */

import { createMachine, assign } from 'xstate';
import {
  ECHRApplication,
  ApplicationStatus,
  AdmissibilityAssessment,
  ECHRProcedureResult,
  InterimMeasuresAssessment,
  ECHRJudgment,
  FriendlySettlement,
  ApplicationWorkflowContext,
  ProcedureType,
  AdmissibilityCheck,
  Communication,
  Deadline
} from '../../domain/courEuropeenneTypes';

export const echrApplicationMachine = createMachine({
  id: 'echrApplication',
  initial: 'idle',

  schemas: {
    context: {} as ApplicationWorkflowContext,
    events: {} as
      | { type: 'START_APPLICATION'; application: ECHRApplication }
      | { type: 'SUBMIT_APPLICATION' }
      | { type: 'REQUEST_INTERIM_MEASURES'; assessment: InterimMeasuresAssessment }
      | { type: 'INTERIM_MEASURES_GRANTED' }
      | { type: 'INTERIM_MEASURES_REFUSED' }
      | { type: 'ALLOCATED_TO_FORMATION'; formation: string }
      | { type: 'ADMISSIBILITY_ASSESSED'; assessment: AdmissibilityAssessment }
      | { type: 'DECLARED_ADMISSIBLE' }
      | { type: 'DECLARED_INADMISSIBLE'; reasons: string[] }
      | { type: 'COMMUNICATED_TO_STATE' }
      | { type: 'STATE_OBSERVATIONS_RECEIVED' }
      | { type: 'INITIATE_FRIENDLY_SETTLEMENT' }
      | { type: 'SETTLEMENT_REACHED'; settlement: FriendlySettlement }
      | { type: 'SETTLEMENT_FAILED' }
      | { type: 'HEARING_SCHEDULED' }
      | { type: 'JUDGMENT_DELIVERED'; judgment: ECHRJudgment }
      | { type: 'REQUEST_GRAND_CHAMBER' }
      | { type: 'GRAND_CHAMBER_ACCEPTED' }
      | { type: 'GRAND_CHAMBER_REJECTED' }
      | { type: 'EXECUTION_STARTED' }
      | { type: 'EXECUTION_COMPLETED' }
      | { type: 'STRIKE_OUT' }
      | { type: 'RETRY' }
      | { type: 'RESET' }
  },

  context: {
    application: null as ECHRApplication | null,
    currentProcedure: null as ProcedureType | null,
    validationErrors: [] as string[],
    admissibilityChecks: [] as AdmissibilityCheck[],
    communications: [] as Communication[],
    deadlines: [] as Deadline[],
    retryCount: 0,
    errors: [] as string[],
  },

  states: {
    // ============================================================================
    // Initial State
    // ============================================================================
    idle: {
      on: {
        START_APPLICATION: {
          target: 'drafting',
          actions: assign({
            application: ({ event }: { event: any }) => ({
              ...event.application,
              status: 'draft' as ApplicationStatus,
            }),
            retryCount: 0,
            errors: [],
          }),
        },
      },
      meta: {
        description: 'Waiting for new ECHR application to start',
      },
    },

    // ============================================================================
    // Application Preparation
    // ============================================================================
    drafting: {
      on: {
        SUBMIT_APPLICATION: {
          target: 'validating',
        },
        REQUEST_INTERIM_MEASURES: {
          target: 'interimMeasures',
          actions: assign(({ context }) => ({
            currentProcedure: 'interim-measures' as ProcedureType,
          })),
        },
      },
      meta: {
        description: 'Preparing application form and gathering documents',
      },
    },

    validating: {
      always: [
        {
          target: 'submitted',
          guard: ({ context }: { context: any }) =>
            context.validationErrors.length === 0,
        },
        {
          target: 'drafting',
          actions: assign({
            retryCount: ({ context }: { context: any }) => context.retryCount + 1,
          }),
        },
      ],
      meta: {
        description: 'Validating application completeness and requirements',
      },
    },

    // ============================================================================
    // Interim Measures Process
    // ============================================================================
    interimMeasures: {
      initial: 'assessing',
      states: {
        assessing: {
          on: {
            INTERIM_MEASURES_GRANTED: {
              target: 'granted',
            },
            INTERIM_MEASURES_REFUSED: {
              target: 'refused',
            },
          },
          meta: {
            description: 'Court assessing Rule 39 interim measures request',
          },
        },
        granted: {
          type: 'final' as const,
          entry: assign({
            application: ({ context }: { context: any }) => ({
              ...context.application,
              interimMeasures: {
                ...context.application.interimMeasures,
                granted: true,
                grantedDate: new Date(),
              },
            }),
          }),
          meta: {
            description: 'Interim measures granted - State must comply',
          },
        },
        refused: {
          type: 'final' as const,
          meta: {
            description: 'Interim measures refused - continue normal procedure',
          },
        },
      },
      on: {
        SUBMIT_APPLICATION: {
          target: 'validating',
        },
      },
    },

    // ============================================================================
    // Submission and Allocation
    // ============================================================================
    submitted: {
      entry: assign({
        application: ({ context }: { context: any }) => ({
          ...context.application,
          status: 'submitted' as ApplicationStatus,
          dateSubmitted: new Date(),
        }),
        deadlines: ({ context }: { context: any }) => [
          ...context.deadlines,
          {
            type: 'allocation',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            description: 'Application allocation to judicial formation',
            mandatory: false,
            completed: false,
          },
        ],
      }),
      on: {
        ALLOCATED_TO_FORMATION: {
          target: 'allocated',
        },
      },
      meta: {
        description: 'Application submitted and pending allocation',
      },
    },

    allocated: {
      entry: assign({
        application: ({ context }: { context: any }) => ({
          ...context.application,
          status: 'allocated' as ApplicationStatus,
        }),
      }),
      on: {
        ADMISSIBILITY_ASSESSED: {
          target: 'admissibilityReview',
        },
      },
      meta: {
        description: 'Application allocated to single judge, committee, or chamber',
      },
    },

    // ============================================================================
    // Admissibility Review
    // ============================================================================
    admissibilityReview: {
      entry: assign({
        application: ({ context }: { context: any }) => ({
          ...context.application,
          status: 'pending-admissibility' as ApplicationStatus,
        }),
        currentProcedure: 'admissibility-review' as ProcedureType,
      }),
      on: {
        DECLARED_ADMISSIBLE: {
          target: 'admissible',
          actions: assign({
            application: ({ context }: { context: any }) => ({
              ...context.application,
              status: 'admissible' as ApplicationStatus,
            }),
          }),
        },
        DECLARED_INADMISSIBLE: {
          target: 'inadmissible',
          actions: assign({
            application: ({ context }: { context: any }) => ({
              ...context.application,
              status: 'inadmissible' as ApplicationStatus,
            }),
            errors: ({ event }: { event: any }) => event.reasons,
          }),
        },
      },
      meta: {
        description: 'Court reviewing admissibility under Article 35',
      },
    },

    inadmissible: {
      on: {
        RESET: {
          target: 'idle',
        },
      },
      meta: {
        description: 'Application declared inadmissible - procedure ends',
      },
    },

    // ============================================================================
    // Merits Examination
    // ============================================================================
    admissible: {
      on: {
        COMMUNICATED_TO_STATE: {
          target: 'communicated',
        },
        INITIATE_FRIENDLY_SETTLEMENT: {
          target: 'friendlySettlement',
        },
      },
      meta: {
        description: 'Application admissible - proceeding to merits',
      },
    },

    communicated: {
      entry: assign({
        application: ({ context }: { context: any }) => ({
          ...context.application,
          status: 'communicated' as ApplicationStatus,
        }),
        deadlines: ({ context }: { context: any }) => [
          ...context.deadlines,
          {
            type: 'state-observations',
            date: new Date(Date.now() + 16 * 7 * 24 * 60 * 60 * 1000), // 16 weeks
            description: 'Deadline for State observations',
            mandatory: true,
            completed: false,
          },
        ],
      }),
      on: {
        STATE_OBSERVATIONS_RECEIVED: {
          target: 'meritsExamination',
        },
        INITIATE_FRIENDLY_SETTLEMENT: {
          target: 'friendlySettlement',
        },
      },
      meta: {
        description: 'Application communicated to respondent State',
      },
    },

    // ============================================================================
    // Friendly Settlement Process
    // ============================================================================
    friendlySettlement: {
      entry: assign({
        application: ({ context }: { context: any }) => ({
          ...context.application,
          status: 'friendly-settlement' as ApplicationStatus,
        }),
        currentProcedure: 'friendly-settlement' as ProcedureType,
      }),
      on: {
        SETTLEMENT_REACHED: {
          target: 'settlementApproval',
          actions: assign({
            application: ({ context, event }: { context: any; event: any }) => ({
              ...context.application,
              friendlySettlement: event.settlement,
            }),
          }),
        },
        SETTLEMENT_FAILED: {
          target: 'meritsExamination',
        },
      },
      meta: {
        description: 'Parties negotiating friendly settlement under Article 39',
      },
    },

    settlementApproval: {
      on: {
        STRIKE_OUT: {
          target: 'struckOut',
        },
      },
      meta: {
        description: 'Court reviewing and approving settlement terms',
      },
    },

    struckOut: {
      entry: assign({
        application: ({ context }: { context: any }) => ({
          ...context.application,
          status: 'struck-out' as ApplicationStatus,
        }),
      }),
      type: 'final' as const,
      meta: {
        description: 'Case struck out following settlement or withdrawal',
      },
    },

    // ============================================================================
    // Merits and Judgment
    // ============================================================================
    meritsExamination: {
      entry: assign({
        application: ({ context }: { context: any }) => ({
          ...context.application,
          status: 'pending-merits' as ApplicationStatus,
        }),
      }),
      on: {
        HEARING_SCHEDULED: {
          target: 'hearing',
        },
        JUDGMENT_DELIVERED: {
          target: 'judgment',
        },
      },
      meta: {
        description: 'Court examining merits of the case',
      },
    },

    hearing: {
      on: {
        JUDGMENT_DELIVERED: {
          target: 'judgment',
        },
      },
      meta: {
        description: 'Oral hearing before the Court',
      },
    },

    judgment: {
      entry: assign({
        application: ({ context, event }: { context: any; event: any }) => ({
          ...context.application,
          status: 'judgment-delivered' as ApplicationStatus,
          judgment: event.judgment,
        }),
        deadlines: ({ context }: { context: any }) => [
          ...context.deadlines,
          {
            type: 'grand-chamber-referral',
            date: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000), // 3 months
            description: 'Deadline to request Grand Chamber referral',
            mandatory: true,
            completed: false,
          },
        ],
      }),
      on: {
        REQUEST_GRAND_CHAMBER: {
          target: 'grandChamberRequest',
        },
        EXECUTION_STARTED: {
          target: 'execution',
        },
      },
      meta: {
        description: 'Judgment delivered - waiting for finality or appeal',
      },
    },

    // ============================================================================
    // Grand Chamber Process
    // ============================================================================
    grandChamberRequest: {
      on: {
        GRAND_CHAMBER_ACCEPTED: {
          target: 'grandChamber',
        },
        GRAND_CHAMBER_REJECTED: {
          target: 'execution',
        },
      },
      meta: {
        description: 'Panel reviewing Grand Chamber referral request',
      },
    },

    grandChamber: {
      entry: assign({
        application: ({ context }: { context: any }) => ({
          ...context.application,
          status: 'grand-chamber' as ApplicationStatus,
        }),
      }),
      on: {
        HEARING_SCHEDULED: {
          target: 'grandChamberHearing',
        },
        JUDGMENT_DELIVERED: {
          target: 'finalJudgment',
        },
      },
      meta: {
        description: 'Case before Grand Chamber for re-examination',
      },
    },

    grandChamberHearing: {
      on: {
        JUDGMENT_DELIVERED: {
          target: 'finalJudgment',
        },
      },
      meta: {
        description: 'Grand Chamber oral hearing',
      },
    },

    finalJudgment: {
      entry: assign({
        application: ({ context, event }: { context: any; event: any }) => ({
          ...context.application,
          judgment: event.judgment,
        }),
      }),
      on: {
        EXECUTION_STARTED: {
          target: 'execution',
        },
      },
      meta: {
        description: 'Final Grand Chamber judgment - no further appeal',
      },
    },

    // ============================================================================
    // Execution Supervision
    // ============================================================================
    execution: {
      entry: assign({
        currentProcedure: 'execution-supervision' as ProcedureType,
        deadlines: ({ context }: { context: any }) => [
          ...context.deadlines,
          {
            type: 'payment',
            date: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000), // 3 months
            description: 'Deadline for payment of just satisfaction',
            mandatory: true,
            completed: false,
          },
        ],
      }),
      on: {
        EXECUTION_COMPLETED: {
          target: 'completed',
        },
      },
      meta: {
        description: 'Committee of Ministers supervising judgment execution',
      },
    },

    // ============================================================================
    // Final State
    // ============================================================================
    completed: {
      entry: assign({
        application: ({ context }: { context: any }) => ({
          ...context.application,
          status: 'closed' as ApplicationStatus,
        }),
      }),
      type: 'final' as const,
      meta: {
        description: 'Case closed - judgment fully executed',
      },
    },
  },
});

/**
 * Create an ECHR application workflow instance with initial context
 */
export function createApplicationWorkflow(application: ECHRApplication) {
  // In XState v5, context is configured via the machine definition
  // To use a dynamic context, spawn the machine with the initial context
  return echrApplicationMachine;
}