/**
 * XState machine for ECHR Rule 39 Interim Measures Workflow
 *
 * This state machine manages urgent requests for interim measures
 * to prevent imminent and irreversible harm.
 */

import { createMachine, assign } from 'xstate';
import {
  InterimMeasure,
  InterimMeasuresAssessment,
  ECHRApplicant,
  Evidence
} from '../modele-metier/courEuropeenneTypes';

interface InterimMeasuresContext {
  request: InterimMeasure | null;
  assessment: InterimMeasuresAssessment | null;
  applicant: ECHRApplicant | null;
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low' | null;
  responseDeadline: Date | null;
  stateNotified: boolean;
  measureImplemented: boolean;
  monitoringReports: MonitoringReport[];
  retryCount: number;
  errors: string[];
}

interface MonitoringReport {
  date: Date;
  compliant: boolean;
  details: string;
  evidence?: Evidence[];
}

export const interimMeasuresMachine = createMachine({
  id: 'interimMeasures',
  initial: 'idle',

  schemas: {
    context: {} as InterimMeasuresContext,
    events: {} as
      | { type: 'REQUEST_MEASURES'; request: InterimMeasure; applicant: ECHRApplicant }
      | { type: 'ASSESS_URGENCY'; assessment: InterimMeasuresAssessment }
      | { type: 'GRANT_MEASURES'; decision: string }
      | { type: 'REFUSE_MEASURES'; reasons: string[] }
      | { type: 'NOTIFY_STATE' }
      | { type: 'STATE_ACKNOWLEDGED' }
      | { type: 'STATE_OBJECTION'; objections: string[] }
      | { type: 'MEASURE_IMPLEMENTED' }
      | { type: 'COMPLIANCE_CHECK'; report: MonitoringReport }
      | { type: 'NON_COMPLIANCE'; issues: string[] }
      | { type: 'EXTEND_MEASURES'; newDeadline: Date }
      | { type: 'LIFT_MEASURES' }
      | { type: 'EMERGENCY_ESCALATION' }
      | { type: 'RETRY' }
      | { type: 'TIMEOUT' }
  },

  context: {
    request: null as InterimMeasure | null,
    assessment: null as InterimMeasuresAssessment | null,
    applicant: null as ECHRApplicant | null,
    urgencyLevel: null as ('critical' | 'high' | 'medium' | 'low' | null),
    responseDeadline: null as Date | null,
    stateNotified: false,
    measureImplemented: false,
    monitoringReports: [] as MonitoringReport[],
    retryCount: 0,
    errors: [] as string[],
  },

  states: {
    // ============================================================================
    // Initial State
    // ============================================================================
    idle: {
      on: {
        REQUEST_MEASURES: {
          target: 'urgencyAssessment',
          actions: assign(({ event }) => {
            // Critical cases get 6-hour deadline
            const hours = event.request.urgencyReason.includes('imminent') ? 6 : 48;
            return {
              request: event.request,
              applicant: event.applicant,
              responseDeadline: new Date(Date.now() + hours * 60 * 60 * 1000),
            };
          }),
        },
      },
      meta: {
        description: 'Waiting for Rule 39 interim measures request',
      },
    },

    // ============================================================================
    // Urgency Assessment
    // ============================================================================
    urgencyAssessment: {
      on: {
        ASSESS_URGENCY: [
          {
            target: 'criticalReview',
            guard: ({ event }) => event.assessment.urgencyLevel === 'critical',
            actions: assign(({ event }) => ({
              assessment: event.assessment,
              urgencyLevel: 'critical' as const,
              responseDeadline: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
            })),
          },
          {
            target: 'priorityReview',
            guard: ({ event }) => event.assessment.urgencyLevel === 'high',
            actions: assign(({ event }) => ({
              assessment: event.assessment,
              urgencyLevel: 'high' as const,
              responseDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            })),
          },
          {
            target: 'standardReview',
            actions: assign(({ event }) => ({
              assessment: event.assessment,
              urgencyLevel: event.assessment.urgencyLevel,
            })),
          },
        ],
        TIMEOUT: {
          target: 'failed',
          actions: assign({
            errors: ({ context }) => [
              ...context.errors,
              'Urgency assessment timed out',
            ],
          }),
        },
      },
      meta: {
        description: 'Assessing urgency and risk of irreparable harm',
      },
    },

    // ============================================================================
    // Review Processes
    // ============================================================================
    criticalReview: {
      entry: assign(() => ({
        responseDeadline: new Date(Date.now() + 6 * 60 * 60 * 1000),
      })),
      on: {
        GRANT_MEASURES: {
          target: 'granted',
          actions: assign(({ context, event }) => ({
            request: context.request ? {
              ...context.request,
              granted: true,
              grantedDate: new Date(),
              courtDecision: event.decision,
            } : null,
          })),
        },
        REFUSE_MEASURES: {
          target: 'refused',
          actions: assign({
            errors: ({ event }) => event.reasons,
          }),
        },
      },
      meta: {
        description: 'Critical case - immediate review by duty judge',
      },
    },

    priorityReview: {
      on: {
        GRANT_MEASURES: {
          target: 'granted',
          actions: assign(({ context, event }) => ({
            request: context.request ? {
              ...context.request,
              granted: true,
              grantedDate: new Date(),
              courtDecision: event.decision,
            } : null,
          })),
        },
        REFUSE_MEASURES: {
          target: 'refused',
          actions: assign({
            errors: ({ event }) => event.reasons,
          }),
        },
        EMERGENCY_ESCALATION: {
          target: 'criticalReview',
          actions: assign(() => ({
            urgencyLevel: 'critical' as const,
          })),
        },
      },
      meta: {
        description: 'High priority - review within 24 hours',
      },
    },

    standardReview: {
      on: {
        GRANT_MEASURES: {
          target: 'granted',
          actions: assign(({ context, event }) => ({
            request: context.request ? {
              ...context.request,
              granted: true,
              grantedDate: new Date(),
              courtDecision: event.decision,
            } : null,
          })),
        },
        REFUSE_MEASURES: {
          target: 'refused',
          actions: assign({
            errors: ({ event }) => event.reasons,
          }),
        },
        EMERGENCY_ESCALATION: {
          target: 'priorityReview',
          actions: assign(() => ({
            urgencyLevel: 'high' as const,
          })),
        },
      },
      meta: {
        description: 'Standard review - within 48 hours',
      },
    },

    // ============================================================================
    // Decision States
    // ============================================================================
    refused: {
      on: {
        RETRY: {
          target: 'urgencyAssessment',
          guard: ({ context }) => context.retryCount < 1,
          actions: assign({
            retryCount: ({ context }) => context.retryCount + 1,
            errors: [],
          }),
        },
      },
      meta: {
        description: 'Interim measures refused - no immediate danger found',
      },
    },

    granted: {
      entry: assign({
        stateNotified: false,
      }),
      on: {
        NOTIFY_STATE: {
          target: 'notifyingState',
        },
      },
      meta: {
        description: 'Interim measures granted - must notify State immediately',
      },
    },

    // ============================================================================
    // State Notification Process
    // ============================================================================
    notifyingState: {
      on: {
        STATE_ACKNOWLEDGED: {
          target: 'awaitingImplementation',
          actions: assign({
            stateNotified: true,
          }),
        },
        STATE_OBJECTION: {
          target: 'reviewingObjection',
          actions: assign({
            stateNotified: true,
          }),
        },
        TIMEOUT: {
          target: 'stateNonResponsive',
        },
      },
      meta: {
        description: 'Notifying respondent State of interim measures',
      },
    },

    reviewingObjection: {
      on: {
        GRANT_MEASURES: {
          target: 'awaitingImplementation',
        },
        REFUSE_MEASURES: {
          target: 'measuresSuspended',
        },
      },
      meta: {
        description: 'Reviewing State objections to interim measures',
      },
    },

    stateNonResponsive: {
      on: {
        STATE_ACKNOWLEDGED: {
          target: 'awaitingImplementation',
        },
        EMERGENCY_ESCALATION: {
          target: 'escalated',
        },
      },
      meta: {
        description: 'State has not responded to interim measures notification',
      },
    },

    // ============================================================================
    // Implementation and Monitoring
    // ============================================================================
    awaitingImplementation: {
      on: {
        MEASURE_IMPLEMENTED: {
          target: 'monitoring',
          actions: assign({
            measureImplemented: true,
          }),
        },
        NON_COMPLIANCE: {
          target: 'nonCompliance',
          actions: assign({
            errors: ({ event }) => event.issues,
          }),
        },
        TIMEOUT: {
          target: 'nonCompliance',
        },
      },
      meta: {
        description: 'Waiting for State to implement interim measures',
      },
    },

    monitoring: {
      on: {
        COMPLIANCE_CHECK: [
          {
            target: 'monitoring',
            guard: ({ event }) => event.report.compliant,
            actions: assign(({ context, event }) => ({
              monitoringReports: [
                ...context.monitoringReports,
                event.report,
              ],
            })),
          },
          {
            target: 'nonCompliance',
            actions: assign(({ context, event }) => ({
              monitoringReports: [
                ...context.monitoringReports,
                event.report,
              ],
              errors: [
                `Non-compliance detected: ${event.report.details}`,
              ],
            })),
          },
        ],
        EXTEND_MEASURES: {
          target: 'extended',
          actions: assign(({ context, event }) => ({
            request: context.request && context.request.duration ? {
              ...context.request,
              duration: {
                ...context.request.duration,
                end: event.newDeadline,
              },
            } : null,
          })),
        },
        LIFT_MEASURES: {
          target: 'completed',
        },
      },
      meta: {
        description: 'Monitoring State compliance with interim measures',
      },
    },

    // ============================================================================
    // Non-Compliance Handling
    // ============================================================================
    nonCompliance: {
      on: {
        EMERGENCY_ESCALATION: {
          target: 'escalated',
        },
        MEASURE_IMPLEMENTED: {
          target: 'monitoring',
          actions: assign({
            measureImplemented: true,
            errors: [],
          }),
        },
      },
      meta: {
        description: 'State non-compliant with interim measures',
      },
    },

    escalated: {
      on: {
        MEASURE_IMPLEMENTED: {
          target: 'monitoring',
        },
      },
      meta: {
        description: 'Case escalated to Grand Chamber or Committee of Ministers',
      },
    },

    // ============================================================================
    // Extension and Completion
    // ============================================================================
    extended: {
      on: {
        COMPLIANCE_CHECK: {
          target: 'monitoring',
        },
      },
      meta: {
        description: 'Interim measures extended for additional period',
      },
    },

    measuresSuspended: {
      on: {
        REQUEST_MEASURES: {
          target: 'urgencyAssessment',
        },
      },
      meta: {
        description: 'Interim measures suspended or withdrawn',
      },
    },

    // ============================================================================
    // Final States
    // ============================================================================
    completed: {
      type: 'final' as const,
      meta: {
        description: 'Interim measures completed - risk addressed',
      },
    },

    failed: {
      on: {
        RETRY: {
          target: 'idle',
          guard: ({ context }) => context.retryCount < 3,
          actions: assign({
            retryCount: ({ context }) => context.retryCount + 1,
            errors: [],
          }),
        },
      },
      meta: {
        description: 'Interim measures process failed',
      },
    },
  },
});

/**
 * Create an interim measures workflow instance
 * In XState v5, context is configured via the machine definition
 */
export function createInterimMeasuresWorkflow(
  request: InterimMeasure,
  applicant: ECHRApplicant
) {
  // To use dynamic context, spawn the machine with initial input
  return interimMeasuresMachine;
}

/**
 * Assess urgency level for interim measures
 */
export function assessUrgency(request: InterimMeasure): InterimMeasuresAssessment {
  const urgencyKeywords = {
    critical: ['execution', 'death', 'torture', 'imminent', 'hours'],
    high: ['expulsion', 'deportation', 'medical', 'urgent', 'tomorrow'],
    medium: ['detention', 'treatment', 'week', 'soon'],
    low: ['property', 'financial', 'month', 'future'],
  };

  const urgencyReason = request.urgencyReason.toLowerCase();
  const irreparableHarm = request.irreparableHarm.toLowerCase();

  let urgencyLevel: 'critical' | 'high' | 'medium' | 'low' = 'low';
  let immediateDanger = false;
  let irreparableHarmRisk = false;

  // Check for critical urgency
  if (urgencyKeywords.critical.some(keyword =>
    urgencyReason.includes(keyword) || irreparableHarm.includes(keyword)
  )) {
    urgencyLevel = 'critical';
    immediateDanger = true;
    irreparableHarmRisk = true;
  }
  // Check for high urgency
  else if (urgencyKeywords.high.some(keyword =>
    urgencyReason.includes(keyword) || irreparableHarm.includes(keyword)
  )) {
    urgencyLevel = 'high';
    immediateDanger = true;
    irreparableHarmRisk = true;
  }
  // Check for medium urgency
  else if (urgencyKeywords.medium.some(keyword =>
    urgencyReason.includes(keyword)
  )) {
    urgencyLevel = 'medium';
    irreparableHarmRisk = true;
  }

  const recommendRule39 = urgencyLevel === 'critical' || urgencyLevel === 'high';

  return {
    urgencyLevel,
    immediateDanger,
    irreparableHarmRisk,
    recommendRule39,
    justification: `Based on the urgency reason and nature of harm, the case is classified as ${urgencyLevel} priority. ${
      recommendRule39 ? 'Rule 39 interim measures are recommended.' : 'Standard procedure may be sufficient.'
    }`,
  };
}