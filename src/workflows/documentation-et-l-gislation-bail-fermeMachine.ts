/**
 * XState machine for Bail à ferme en Wallonie
 *
 * This state machine orchestrates the evaluation of bail à ferme (farm lease) rules
 * in the Walloon region of Belgium, implementing the legal framework for agricultural leases.
 *
 * BASE JURIDIQUE:
 * - Documentation et législation - Bail à ferme
 *   https://agriculture.wallonie.be/home/ruralite-et-foncier/foncier/foncier-agricole/louer/bail-a-ferme/legislation-et-documentation.html
 */

import { createMachine, assign } from 'xstate';

// Types for the bail à ferme context
export type BailType = 
  | 'Bail classique'
  | 'Bail de carrière'
  | 'Bail de fin de carrière'
  | 'Bail de courte durée'
  | 'Bail à long terme';

export type PropertyType = 'private' | 'public';

export interface BailFermeContext {
  // Application data
  applicantId: string | null;
  region: string | null;
  bailType: BailType | null;
  propertyType: PropertyType | null;
  
  // Eligibility flags
  isRegionValid: boolean;
  isBailTypeValid: boolean;
  isPropertyPublic: boolean;
  
  // Contract details
  contractStartDate: string | null;
  contractDuration: number | null;
  fermageAmount: number | null;
  fermageCalculated: boolean;
  
  // Transmission scenarios
  preneurDeceased: boolean;
  bailleurDeceased: boolean;
  cessionRequested: boolean;
  alienationRequested: boolean;
  sousLocationRequested: boolean;
  echangeCultureRequested: boolean;
  contratCultureRequested: boolean;
  
  // Termination scenarios
  finPleinDroit: boolean;
  resiliationAmiable: boolean;
  
  // Fiscal aspects
  fiscaliteIPPApplicable: boolean;
  droitsDonationApplicable: boolean;
  
  // Validation and errors
  validationErrors: string[];
  eligibilityResult: 'eligible' | 'ineligible' | 'pending' | null;
  
  // Processing metadata
  currentStep: string;
  processedRules: string[];
}

// Event types for the state machine
export type BailFermeEvent =
  | { type: 'START_EVALUATION'; applicantId: string; region: string }
  | { type: 'SET_BAIL_TYPE'; bailType: BailType }
  | { type: 'SET_PROPERTY_TYPE'; propertyType: PropertyType }
  | { type: 'bail-type-valid' }
  | { type: 'documentationEtLGislationBailFerme-ineligible'; reason: string }
  | { type: 'fermage-calculation-applicable'; fermageAmount: number }
  | { type: 'public-property-rules-apply' }
  | { type: 'transmission-deces-preneur' }
  | { type: 'transmission-deces-bailleur' }
  | { type: 'cession-rules-apply' }
  | { type: 'alienation-rules-apply' }
  | { type: 'sous-location-rules-apply' }
  | { type: 'echange-culture-rules-apply' }
  | { type: 'contrat-culture-rules-apply' }
  | { type: 'fin-plein-droit' }
  | { type: 'resiliation-amiable-possible' }
  | { type: 'fiscalite-ipp-apply' }
  | { type: 'droits-donation-apply' }
  | { type: 'VALIDATE_ELIGIBILITY' }
  | { type: 'PROCESS_TRANSMISSION' }
  | { type: 'PROCESS_TERMINATION' }
  | { type: 'PROCESS_FISCAL' }
  | { type: 'COMPLETE_EVALUATION' }
  | { type: 'RESET' }
  | { type: 'RETRY' };

// Initial context
const initialContext: BailFermeContext = {
  applicantId: null,
  region: null,
  bailType: null,
  propertyType: null,
  isRegionValid: false,
  isBailTypeValid: false,
  isPropertyPublic: false,
  contractStartDate: null,
  contractDuration: null,
  fermageAmount: null,
  fermageCalculated: false,
  preneurDeceased: false,
  bailleurDeceased: false,
  cessionRequested: false,
  alienationRequested: false,
  sousLocationRequested: false,
  echangeCultureRequested: false,
  contratCultureRequested: false,
  finPleinDroit: false,
  resiliationAmiable: false,
  fiscaliteIPPApplicable: false,
  droitsDonationApplicable: false,
  validationErrors: [],
  eligibilityResult: null,
  currentStep: 'idle',
  processedRules: [],
};

export const bailFermeMachine = createMachine({
  id: 'documentationEtLGislationBailFerme',
  initial: 'idle',

  schemas: {
    context: {} as BailFermeContext,
    events: {} as BailFermeEvent,
  },

  context: initialContext,

  states: {
    idle: {
      on: {
        START_EVALUATION: {
          target: 'validatingRegion',
          actions: assign({
            applicantId: ({ event }) => event.applicantId,
            region: ({ event }) => event.region,
            currentStep: 'validatingRegion',
            validationErrors: [],
            processedRules: [],
          }),
        },
      },
    },

    validatingRegion: {
      always: [
        {
          target: 'selectingBailType',
          guard: ({ context }) => context.region === 'Wallonie',
          actions: assign({
            isRegionValid: true,
            currentStep: 'selectingBailType',
          }),
        },
        {
          target: 'ineligible',
          actions: assign({
            isRegionValid: false,
            validationErrors: ({ context }) => [
              ...context.validationErrors,
              'La région doit être la Wallonie pour bénéficier du bail à ferme wallon',
            ],
            eligibilityResult: 'ineligible' as const,
          }),
        },
      ],
    },

    selectingBailType: {
      on: {
        SET_BAIL_TYPE: {
          target: 'validatingBailType',
          actions: assign({
            bailType: ({ event }) => event.bailType,
            currentStep: 'validatingBailType',
          }),
        },
        'documentationEtLGislationBailFerme-ineligible': {
          target: 'ineligible',
          actions: assign({
            validationErrors: ({ context, event }) => [
              ...context.validationErrors,
              event.reason,
            ],
            eligibilityResult: 'ineligible' as const,
          }),
        },
      },
    },

    validatingBailType: {
      always: [
        {
          target: 'selectingPropertyType',
          guard: ({ context }) => context.bailType !== null,
          actions: assign({
            isBailTypeValid: true,
            currentStep: 'selectingPropertyType',
            processedRules: ({ context }) => [...context.processedRules, 'bail-type-valid'],
          }),
        },
        {
          target: 'selectingBailType',
          actions: assign({
            validationErrors: ({ context }) => [
              ...context.validationErrors,
              'Type de bail non valide',
            ],
          }),
        },
      ],
      on: {
        'bail-type-valid': {
          target: 'selectingPropertyType',
          actions: assign({
            isBailTypeValid: true,
            processedRules: ({ context }) => [...context.processedRules, 'bail-type-valid'],
          }),
        },
      },
    },

    selectingPropertyType: {
      on: {
        SET_PROPERTY_TYPE: {
          target: 'evaluatingPropertyRules',
          actions: assign({
            propertyType: ({ event }) => event.propertyType,
            isPropertyPublic: ({ event }) => event.propertyType === 'public',
            currentStep: 'evaluatingPropertyRules',
          }),
        },
      },
    },

    evaluatingPropertyRules: {
      always: [
        {
          target: 'calculatingFermage',
          guard: ({ context }) => context.propertyType === 'public',
          actions: assign({
            processedRules: ({ context }) => [...context.processedRules, 'public-property-rules-apply'],
            currentStep: 'calculatingFermage',
          }),
        },
        {
          target: 'calculatingFermage',
          guard: ({ context }) => context.propertyType === 'private',
          actions: assign({
            currentStep: 'calculatingFermage',
          }),
        },
      ],
      on: {
        'public-property-rules-apply': {
          actions: assign({
            processedRules: ({ context }) => [...context.processedRules, 'public-property-rules-apply'],
          }),
        },
      },
    },

    calculatingFermage: {
      on: {
        'fermage-calculation-applicable': {
          target: 'evaluatingTransmission',
          actions: assign({
            fermageCalculated: true,
            fermageAmount: ({ event }) => event.fermageAmount,
            processedRules: ({ context }) => [...context.processedRules, 'fermage-calculation-applicable'],
            currentStep: 'evaluatingTransmission',
          }),
        },
        PROCESS_TRANSMISSION: {
          target: 'evaluatingTransmission',
          actions: assign({
            currentStep: 'evaluatingTransmission',
          }),
        },
      },
    },

    evaluatingTransmission: {
      on: {
        'transmission-deces-preneur': {
          actions: assign({
            preneurDeceased: true,
            processedRules: ({ context }) => [...context.processedRules, 'transmission-deces-preneur'],
          }),
        },
        'transmission-deces-bailleur': {
          actions: assign({
            bailleurDeceased: true,
            processedRules: ({ context }) => [...context.processedRules, 'transmission-deces-bailleur'],
          }),
        },
        'cession-rules-apply': {
          actions: assign({
            cessionRequested: true,
            processedRules: ({ context }) => [...context.processedRules, 'cession-rules-apply'],
          }),
        },
        'alienation-rules-apply': {
          actions: assign({
            alienationRequested: true,
            processedRules: ({ context }) => [...context.processedRules, 'alienation-rules-apply'],
          }),
        },
        'sous-location-rules-apply': {
          actions: assign({
            sousLocationRequested: true,
            processedRules: ({ context }) => [...context.processedRules, 'sous-location-rules-apply'],
          }),
        },
        'echange-culture-rules-apply': {
          actions: assign({
            echangeCultureRequested: true,
            processedRules: ({ context }) => [...context.processedRules, 'echange-culture-rules-apply'],
          }),
        },
        'contrat-culture-rules-apply': {
          actions: assign({
            contratCultureRequested: true,
            processedRules: ({ context }) => [...context.processedRules, 'contrat-culture-rules-apply'],
          }),
        },
        PROCESS_TERMINATION: {
          target: 'evaluatingTermination',
          actions: assign({
            currentStep: 'evaluatingTermination',
          }),
        },
      },
    },

    evaluatingTermination: {
      on: {
        'fin-plein-droit': {
          actions: assign({
            finPleinDroit: true,
            processedRules: ({ context }) => [...context.processedRules, 'fin-plein-droit'],
          }),
        },
        'resiliation-amiable-possible': {
          actions: assign({
            resiliationAmiable: true,
            processedRules: ({ context }) => [...context.processedRules, 'resiliation-amiable-possible'],
          }),
        },
        PROCESS_FISCAL: {
          target: 'evaluatingFiscal',
          actions: assign({
            currentStep: 'evaluatingFiscal',
          }),
        },
      },
    },

    evaluatingFiscal: {
      on: {
        'fiscalite-ipp-apply': {
          actions: assign({
            fiscaliteIPPApplicable: true,
            processedRules: ({ context }) => [...context.processedRules, 'fiscalite-ipp-apply'],
          }),
        },
        'droits-donation-apply': {
          actions: assign({
            droitsDonationApplicable: true,
            processedRules: ({ context }) => [...context.processedRules, 'droits-donation-apply'],
          }),
        },
        VALIDATE_ELIGIBILITY: {
          target: 'validatingEligibility',
          actions: assign({
            currentStep: 'validatingEligibility',
          }),
        },
        COMPLETE_EVALUATION: {
          target: 'validatingEligibility',
        },
      },
    },

    validatingEligibility: {
      always: [
        {
          target: 'eligible',
          guard: ({ context }) =>
            context.isRegionValid &&
            context.isBailTypeValid &&
            context.validationErrors.length === 0,
          actions: assign({
            eligibilityResult: 'eligible' as const,
            currentStep: 'eligible',
          }),
        },
        {
          target: 'ineligible',
          actions: assign({
            eligibilityResult: 'ineligible' as const,
            currentStep: 'ineligible',
          }),
        },
      ],
    },

    eligible: {
      type: 'final',
      entry: assign({
        currentStep: 'completed-eligible',
      }),
    },

    ineligible: {
      on: {
        RETRY: {
          target: 'selectingBailType',
          actions: assign({
            validationErrors: [],
            eligibilityResult: 'pending' as const,
            currentStep: 'selectingBailType',
          }),
        },
        RESET: {
          target: 'idle',
          actions: assign(initialContext),
        },
        'documentationEtLGislationBailFerme-ineligible': {
          actions: assign({
            validationErrors: ({ context, event }) => [
              ...context.validationErrors,
              event.reason,
            ],
          }),
        },
      },
    },
  },
});

export default bailFermeMachine;