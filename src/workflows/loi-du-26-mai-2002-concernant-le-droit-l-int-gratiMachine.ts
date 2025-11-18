```typescript
/**
 * XState machine for Droit à l'Intégration Sociale (DIS) Eligibility
 *
 * This state machine orchestrates the eligibility determination workflow
 * based on the Loi du 26 mai 2002 concernant le droit à l'intégration sociale
 * 
 * Workflow:
 * 1. Check nationality requirements
 * 2. Verify residence conditions
 * 3. Validate age requirements
 * 4. Assess resource availability
 * 5. Determine work disposition requirements
 * 6. Provide final eligibility decision
 */

import { createMachine, assign } from 'xstate';

export interface DISUser {
  nationality: 'belgian' | 'eu_citizen' | 'foreign_registered' | 'refugee' | 'subsidiary_protection' | 'other';
  hasEffectiveResidence: boolean;
  age: number;
  hasSufficientResources: boolean;
  canClaimResources: boolean;
  canObtainResourcesByOwnMeans: boolean;
  euResidencyDuration?: number;
  isAbleToWork?: boolean;
  hasHealthReasonsPreventingWork?: boolean;
  hasEquityReasonsForExemption?: boolean;
}

export interface DISContext {
  user: DISUser | null;
  eligible: boolean;
  reasons: string[];
  requiresWorkDisposition: boolean;
  exemptFromWorkDisposition: boolean;
  exemptionReason: string | null;
  currentCheck: string | null;
}

export const disMachine = createMachine({
  id: 'disEligibility',
  initial: 'idle',

  schemas: {
    context: {} as DISContext,
    events: {} as
      | { type: 'START_EVALUATION'; user: DISUser }
      | { type: 'NATIONALITY_VALID' }
      | { type: 'NATIONALITY_INVALID' }
      | { type: 'RESIDENCE_VALID' }
      | { type: 'RESIDENCE_INVALID' }
      | { type: 'AGE_VALID' }
      | { type: 'AGE_INVALID' }
      | { type: 'RESOURCES_INSUFFICIENT' }
      | { type: 'RESOURCES_AVAILABLE' }
      | { type: 'WORK_DISPOSITION_REQUIRED' }
      | { type: 'WORK_DISPOSITION_EXEMPTED'; reason: string }
      | { type: 'DIS_ELIGIBLE' }
      | { type: 'DIS_INELIGIBLE'; reason: string }
      | { type: 'RESET' }
  },

  context: {
    user: null,
    eligible: false,
    reasons: [],
    requiresWorkDisposition: false,
    exemptFromWorkDisposition: false,
    exemptionReason: null,
    currentCheck: null,
  },

  states: {
    idle: {
      on: {
        START_EVALUATION: {
          target: 'checkingNationality',
          actions: assign({
            user: ({ event }) => event.user,
            eligible: false,
            reasons: [],
            requiresWorkDisposition: false,
            exemptFromWorkDisposition: false,
            exemptionReason: null,
            currentCheck: 'nationality',
          }),
        },
      },
    },

    checkingNationality: {
      always: [
        {
          target: 'checkingResidence',
          guard: ({ context }) => {
            const { user } = context;
            if (!user) return false;
            
            return user.nationality === 'belgian' ||
                   user.nationality === 'eu_citizen' ||
                   user.nationality === 'foreign_registered' ||
                   user.nationality === 'refugee' ||
                   user.nationality === 'subsidiary_protection';
          },
          actions: assign({
            currentCheck: 'residence',
          }),
        },
        {
          target: 'ineligible',
          actions: assign({
            reasons: ({ context }) => [...context.reasons, 'Nationality requirements not met'],
          }),
        },
      ],
    },

    checkingResidence: {
      always: [
        {
          target: 'checkingEuResidency',
          guard: ({ context }) => {
            const { user } = context;
            return user?.nationality === 'eu_citizen';
          },
        },
        {
          target: 'checkingAge',
          guard: ({ context }) => context.user?.hasEffectiveResidence === true,
          actions: assign({
            currentCheck: 'age',
          }),
        },
        {
          target: 'ineligible',
          actions: assign({
            reasons: ({ context }) => [...context.reasons, 'No effective residence in Belgium'],
          }),
        },
      ],
    },

    checkingEuResidency: {
      always: [
        {
          target: 'checkingAge',
          guard: ({ context }) => {
            const { user } = context;
            return user?.euResidencyDuration !== undefined && user.euResidencyDuration >= 3;
          },
          actions: assign({
            currentCheck: 'age',
          }),
        },
        {
          target: 'ineligible',
          actions: assign({
            reasons: ({ context }) => [...context.reasons, 'EU citizens must have at least 3 months of residency'],
          }),
        },
      ],
    },

    checkingAge: {
      always: [
        {
          target: 'checkingResources',
          guard: ({ context }) => {
            const { user } = context;
            return user?.age !== undefined && user.age >= 18;
          },
          actions: assign({
            currentCheck: 'resources',
          }),
        },
        {
          target: 'ineligible',
          actions: assign({
            reasons: ({ context }) => [...context.reasons, 'Must be at least 18 years old'],
          }),
        },
      ],
    },

    checkingResources: {
      always: [
        {
          target: 'eligible',
          guard: ({ context }) => {
            const { user } = context;
            return user?.hasSufficientResources === true;
          },
          actions: assign({
            reasons: ({ context }) => [...context.reasons, 'Has sufficient resources'],
          }),
        },
        {
          target: 'checkingResourceClaim',
          guard: ({ context }) => context.user?.hasSufficientResources === false,
          actions: assign({
            currentCheck: 'resource_claim',
          }),
        },
      ],
    },

    checkingResourceClaim: {
      always: [
        {
          target: 'checkingOwnMeans',
          guard: ({ context }) => context.user?.canClaimResources === true,
          actions: assign({
            currentCheck: 'own_means',
          }),
        },
        {
          target: 'checkingWorkDisposition',
          actions: assign({
            currentCheck: 'work_disposition',
          }),
        },
      ],
    },

    checkingOwnMeans: {
      always: [
        {
          target: 'checkingWorkDisposition',
          guard: ({ context }) => context.user?.canObtainResourcesByOwnMeans === false,
          actions: assign({
            currentCheck: 'work_disposition',
          }),
        },
        {
          target: 'ineligible',
          actions: assign({
            reasons: ({ context }) => [...context.reasons, 'Can obtain resources by own means'],
          }),
        },
      ],
    },

    checkingWorkDisposition: {
      always: [
        {
          target: 'eligible',
          guard: ({ context }) => {
            const { user } = context;
            return user?.hasHealthReasonsPreventingWork === true;
          },
          actions: assign({
            exemptFromWorkDisposition: true,
            exemptionReason: 'Health reasons prevent work',
            eligible: true,
            reasons: ({ context }) => [...context.reasons, 'Eligible for DIS - Exempt from work disposition (health)'],
          }),
        },
        {
          target: 'eligible',
          guard: ({ context }) => {
            const { user } = context;
            return user?.hasEquityReasonsForExemption === true;
          },
          actions: assign({
            exemptFromWorkDisposition: true,
            exemptionReason: 'Equity reasons for exemption',
            eligible: true,
            reasons: ({ context }) => [...context.reasons, 'Eligible for DIS - Exempt from work disposition (equity)'],
          }),
        },
        {
          target: 'eligible',
          guard: ({ context }) => context.user?.isAbleToWork === true,
          actions: assign({
            requiresWorkDisposition: true,
            eligible: true,
            reasons: ({ context }) => [...context.reasons, 'Eligible for DIS - Work disposition required'],
          }),
        },
        {
          target: 'eligible',
          actions: assign({
            eligible: true,
            reasons: ({ context }) => [...context.reasons, 'Eligible for DIS'],
          }),
        },
      ],
    },

    eligible: {
      type: 'final',
      entry: assign({
        eligible: true,
      }),
      on: {
        RESET: {
          target: 'idle',
          actions: assign({
            user: null,
            eligible: false,
            reasons: [],
            requiresWorkDisposition: false,
            exemptFromWorkDisposition: false,
            exemptionReason: null,
            currentCheck: null,
          }),
        },
      },
    },

    ineligible: {
      type: 'final',
      entry: assign({
        eligible: false,
      }),
      on: {
        RESET: {
          target: 'idle',
          actions: assign({
            user: null,
            eligible: false,
            reasons: [],
            requiresWorkDisposition: false,
            exemptFromWorkDisposition: false,
            exemptionReason: null,
            currentCheck: null,
          }),
        },
      },
    },
  },

  on: {
    DIS_ELIGIBLE: {
      target: 'eligible',
      actions: assign({
        eligible: true,
      }),
    },
    DIS_INELIGIBLE: {
      target: 'ineligible',
      actions: assign({
        eligible: false,
        reasons: ({ event, context }) => [...context.reasons, event.reason],
      }),
    },
    WORK_DISPOSITION_REQUIRED: {
      actions: assign({
        requiresWorkDisposition: true,
      }),
    },
    WORK_DISPOSITION_EXEMPTED: {
      actions: assign({
        exemptFromWorkDisposition: true,
        exemptionReason: ({ event }) => event.reason,
      }),
    },
  },
});
```