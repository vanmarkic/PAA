import { createMachine, assign } from 'xstate';

export type Nationality = 'belge' | 'eu' | 'apatride' | 'refugie' | 'autre';

export interface LoiDu26Mai2002User {
  id: string;
  age: number;
  nationality: Nationality;
  legalResidenceMonths: number;
  hasInsufficientResources: boolean;
  isStudent?: boolean;
  hasHealthIssues?: boolean;
  hasEquityReasons?: boolean;
}

export interface LoiDu26Mai2002Result {
  eligible: boolean;
  reason: string;
  hasWorkRequirement: boolean;
  hasWorkExemption: boolean;
}

interface LoiDu26Mai2002Context {
  user: LoiDu26Mai2002User | null;
  eligibilityResult: LoiDu26Mai2002Result | null;
  isEligible: boolean;
  hasWorkRequirement: boolean;
  hasWorkExemption: boolean;
  validationErrors: string[];
  checkComplete: boolean;
}

type LoiDu26Mai2002Event =
  | { type: 'START_CHECK'; user: LoiDu26Mai2002User }
  | { type: 'CHECK_AGE' }
  | { type: 'CHECK_NATIONALITY' }
  | { type: 'CHECK_RESIDENCE' }
  | { type: 'CHECK_RESOURCES' }
  | { type: 'CHECK_WORK_REQUIREMENT' }
  | { type: 'loiDu26Mai2002ConcernantLeDroitLIntGrati-ineligible'; reason: string }
  | { type: 'loiDu26Mai2002ConcernantLeDroitLIntGrati-eligible' }
  | { type: 'loiDu26Mai2002ConcernantLeDroitLIntGrati-work-requirement' }
  | { type: 'loiDu26Mai2002ConcernantLeDroitLIntGrati-work-exemption' }
  | { type: 'COMPLETE_CHECK' }
  | { type: 'RESET' };

const MAJORITY_AGE = 18;
const EU_RESIDENCE_MIN_MONTHS = 3;

export const loiDu26Mai2002Machine = createMachine({
  id: 'loiDu26Mai2002ConcernantLeDroitLIntGrati',
  initial: 'idle',

  types: {} as {
    context: LoiDu26Mai2002Context;
    events: LoiDu26Mai2002Event;
  },

  context: {
    user: null,
    eligibilityResult: null,
    isEligible: false,
    hasWorkRequirement: false,
    hasWorkExemption: false,
    validationErrors: [] as string[],
    checkComplete: false,
  },

  states: {
    idle: {
      on: {
        START_CHECK: {
          target: 'checkingAge',
          actions: assign({
            user: ({ event }) => event.user,
            isEligible: false,
            hasWorkRequirement: false,
            hasWorkExemption: false,
            validationErrors: [],
            checkComplete: false,
          }),
        },
      },
    },

    checkingAge: {
      always: [
        {
          target: 'checkingNationality',
          guard: ({ context }) => {
            if (!context.user) return false;
            return context.user.age >= MAJORITY_AGE;
          },
        },
        {
          target: 'ineligible',
          actions: assign({
            validationErrors: ({ context }) => [`User age ${context.user?.age} is below minimum age ${MAJORITY_AGE}`],
          }),
        },
      ],
    },

    checkingNationality: {
      always: [
        {
          target: 'checkingResidence',
          guard: ({ context }) => {
            if (!context.user) return false;
            return context.user.nationality === 'belge' || 
                   context.user.nationality === 'eu' || 
                   context.user.nationality === 'apatride' ||
                   context.user.nationality === 'refugie';
          },
        },
        {
          target: 'ineligible',
          actions: assign({
            validationErrors: ({ context }) => [`Nationality ${context.user?.nationality} is not eligible`],
          }),
        },
      ],
    },

    checkingResidence: {
      always: [
        {
          target: 'checkingResources',
          guard: ({ context }) => {
            if (!context.user) return false;
            
            if (context.user.nationality === 'belge' || 
                context.user.nationality === 'apatride' ||
                context.user.nationality === 'refugie') {
              return context.user.legalResidenceMonths >= 0;
            }
            
            if (context.user.nationality === 'eu') {
              return context.user.legalResidenceMonths >= EU_RESIDENCE_MIN_MONTHS;
            }
            
            return false;
          },
        },
        {
          target: 'ineligible',
          actions: assign({
            validationErrors: ({ context }) => {
              if (context.user?.nationality === 'eu') {
                return [`EU citizen requires ${EU_RESIDENCE_MIN_MONTHS} months of residence, has ${context.user?.legalResidenceMonths}`];
              }
              return [`Insufficient legal residence: ${context.user?.legalResidenceMonths} months`];
            },
          }),
        },
      ],
    },

    checkingResources: {
      always: [
        {
          target: 'checkingWorkRequirement',
          guard: ({ context }) => {
            if (!context.user) return false;
            return context.user.hasInsufficientResources === true;
          },
        },
        {
          target: 'ineligible',
          actions: assign({
            validationErrors: () => [`User has sufficient resources`],
          }),
        },
      ],
    },

    checkingWorkRequirement: {
      always: [
        {
          target: 'workExempt',
          guard: ({ context }) => {
            if (!context.user) return false;
            return context.user.isStudent === true ||
                   context.user.hasHealthIssues === true ||
                   context.user.hasEquityReasons === true;
          },
        },
        {
          target: 'workRequired',
          guard: ({ context }) => {
            if (!context.user) return false;
            return context.user.age < 25;
          },
        },
        {
          target: 'eligible',
        },
      ],
    },

    workRequired: {
      entry: [
        assign({
          hasWorkRequirement: true,
        }),
        { type: 'loiDu26Mai2002ConcernantLeDroitLIntGrati-work-requirement' },
      ],
      on: {
        COMPLETE_CHECK: 'finalizing',
      },
    },

    workExempt: {
      entry: [
        assign({
          hasWorkExemption: true,
        }),
        { type: 'loiDu26Mai2002ConcernantLeDroitLIntGrati-work-exemption' },
      ],
      on: {
        COMPLETE_CHECK: 'finalizing',
      },
    },

    eligible: {
      entry: [
        assign({
          isEligible: true,
        }),
        { type: 'loiDu26Mai2002ConcernantLeDroitLIntGrati-eligible' },
      ],
      on: {
        COMPLETE_CHECK: 'finalizing',
      },
    },

    ineligible: {
      entry: [
        assign({
          isEligible: false,
        }),
        ({ context }) => ({
          type: 'loiDu26Mai2002ConcernantLeDroitLIntGrati-ineligible' as const,
          reason: context.validationErrors.join(', '),
        }),
      ],
      on: {
        COMPLETE_CHECK: 'finalizing',
      },
    },

    finalizing: {
      entry: assign({
        checkComplete: true,
        eligibilityResult: ({ context }) => ({
          eligible: context.isEligible,
          reason: context.isEligible 
            ? 'User meets all eligibility criteria'
            : context.validationErrors.join(', '),
          hasWorkRequirement: context.hasWorkRequirement,
          hasWorkExemption: context.hasWorkExemption,
        }),
      }),
      always: 'complete',
    },

    complete: {
      on: {
        RESET: {
          target: 'idle',
          actions: assign({
            user: null,
            eligibilityResult: null,
            isEligible: false,
            hasWorkRequirement: false,
            hasWorkExemption: false,
            validationErrors: [],
            checkComplete: false,
          }),
        },
      },
    },
  },
});