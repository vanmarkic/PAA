/**
 * XState machine for RIS Application Workflow
 *
 * This state machine represents the workflow for applying to RIS (Revenu d'Intégration Sociale)
 * including eligibility checking, PIIS contract creation, and ongoing compliance monitoring.
 */

import { createMachine, assign } from 'xstate';
import { RISUser, RISEligibilityResult, PIISContract } from '../domain/risTypes';

interface RISApplicationContext {
  user: RISUser | null;
  eligibilityResult: RISEligibilityResult | null;
  piisContract: PIISContract | null;
  complianceIssues: string[];
  retryCount: number;
}

export const risApplicationMachine = createMachine({
  id: 'risApplication',
  initial: 'idle',

  schemas: {
    context: {} as RISApplicationContext,
    events: {} as
      | { type: 'START_APPLICATION'; user: RISUser }
      | { type: 'ELIGIBILITY_CHECKED'; result: RISEligibilityResult }
      | { type: 'ACCEPT_RIS' }
      | { type: 'DECLINE_RIS' }
      | { type: 'PIIS_SIGNED'; contract: PIISContract }
      | { type: 'INCOME_CHANGE'; newIncome: number }
      | { type: 'COMPLIANCE_CHECK' }
      | { type: 'COMPLIANCE_OK' }
      | { type: 'COMPLIANCE_ISSUE'; issues: string[] }
      | { type: 'ISSUE_RESOLVED' }
      | { type: 'TERMINATE_RIS' }
      | { type: 'RESET' }
  },

  context: {
    user: null,
    eligibilityResult: null,
    piisContract: null,
    complianceIssues: [],
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        START_APPLICATION: {
          target: 'checkingEligibility',
          actions: assign({
            user: ({ event }) => event.user,
            retryCount: 0,
          }),
        },
      },

      meta: {
        description: 'Waiting for RIS application to start',
      },
    },

    checkingEligibility: {
      on: {
        ELIGIBILITY_CHECKED: [
          {
            target: 'eligible',
            guard: ({ event }) => event.result.isEligible,
            actions: assign({
              eligibilityResult: ({ event }) => event.result,
            }),
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
        description: 'Checking age, residency, patrimony, and other eligibility criteria',
      },
    },

    eligible: {
      on: {
        ACCEPT_RIS: {
          target: 'creatingPIIS',
        },
        DECLINE_RIS: {
          target: 'declined',
        },
      },

      meta: {
        description: 'User is eligible for RIS - waiting for acceptance decision',
      },
    },

    ineligible: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'User is not eligible for RIS - show reason and alternatives',
      },
    },

    declined: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'User declined RIS offer',
      },
    },

    creatingPIIS: {
      on: {
        PIIS_SIGNED: {
          target: 'active',
          actions: assign({
            piisContract: ({ event }) => event.contract,
          }),
        },
      },

      meta: {
        description: 'Creating PIIS (Projet Individualisé d\'Intégration Sociale) contract',
      },
    },

    active: {
      on: {
        INCOME_CHANGE: {
          target: 'recalculating',
          actions: assign({
            user: ({ context, event }) => ({
              ...context.user!,
              monthlyIncome: event.newIncome,
            }),
          }),
        },
        COMPLIANCE_CHECK: {
          target: 'checkingCompliance',
        },
        TERMINATE_RIS: {
          target: 'terminated',
        },
      },

      meta: {
        description: 'RIS is active - monitoring for income changes and compliance',
      },
    },

    recalculating: {
      on: {
        ELIGIBILITY_CHECKED: {
          target: 'active',
          actions: assign({
            eligibilityResult: ({ event }) => event.result,
          }),
        },
      },

      meta: {
        description: 'Recalculating RIS amount based on new income',
      },
    },

    checkingCompliance: {
      on: {
        COMPLIANCE_OK: {
          target: 'active',
        },
        COMPLIANCE_ISSUE: {
          target: 'complianceWarning',
          actions: assign({
            complianceIssues: ({ event }) => event.issues,
          }),
        },
      },

      meta: {
        description: 'Checking compliance with PIIS obligations and residency requirements',
      },
    },

    complianceWarning: {
      on: {
        ISSUE_RESOLVED: {
          target: 'active',
          actions: assign({
            complianceIssues: [],
          }),
        },
        TERMINATE_RIS: {
          target: 'terminated',
        },
      },

      meta: {
        description: 'Compliance issues detected - user must resolve or risk termination',
      },
    },

    terminated: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'RIS has been terminated - user can reapply later if eligible',
      },
    },
  },
});

/**
 * Visualization of the RIS application workflow:
 *
 * idle
 *   → checkingEligibility
 *       ↓ (if eligible)
 *     eligible → [accept] → creatingPIIS → active
 *       ↓ (if not eligible)              ↓
 *     ineligible                    (income change)
 *                                         ↓
 *                                   recalculating → active
 *                                         ↓
 *                                   (compliance check)
 *                                         ↓
 *                                   checkingCompliance
 *                                      ↓       ↓
 *                                    OK     ISSUE
 *                                      ↓       ↓
 *                                   active  complianceWarning
 *                                              ↓
 *                                         [resolved or terminated]
 */
