/**
 * XState machine for the Legal Text Conversion Pipeline
 *
 * This state machine represents the workflow described in the architecture:
 * 1. Extract legal structure
 * 2. Identify key concepts
 * 3. Map to common vocabulary
 * 4. Generate multiple versions
 * 5. Validate semantic accuracy
 * 6. Retry if validation fails
 */

import { createMachine, assign } from 'xstate';
import { ConversionContext, ConversionLevel } from '../domain/types';

export const conversionMachine = createMachine({
  id: 'legalConversion',
  initial: 'idle',

  schema: {
    context: {} as ConversionContext,
    events: {} as
      | { type: 'START_CONVERSION'; legalText: any; targetLevel: ConversionLevel; targetAudience: string }
      | { type: 'STRUCTURE_EXTRACTED'; structure: any }
      | { type: 'CONCEPTS_IDENTIFIED'; concepts: string[] }
      | { type: 'TERMS_MAPPED'; mappedTerms: Record<string, string> }
      | { type: 'VERSIONS_GENERATED'; versions: any }
      | { type: 'VALIDATION_PASSED' }
      | { type: 'VALIDATION_FAILED'; errors: string[] }
      | { type: 'RETRY' }
      | { type: 'MAX_RETRIES_REACHED' }
      | { type: 'RESET' }
  },

  context: {
    legalText: null as any,
    targetLevel: 'simple' as ConversionLevel,
    targetAudience: 'general' as any,
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        START_CONVERSION: {
          target: 'extractingStructure',
          actions: assign({
            legalText: (_, event) => event.legalText,
            targetLevel: (_, event) => event.targetLevel,
            targetAudience: (_, event) => event.targetAudience,
            retryCount: 0,
          }),
        },
      },
    },

    extractingStructure: {
      on: {
        STRUCTURE_EXTRACTED: {
          target: 'identifyingConcepts',
          actions: assign({
            extractedStructure: (_, event) => event.structure,
          }),
        },
      },

      meta: {
        description: 'Extract the legal structure from the raw text using NLP and legal patterns',
      },
    },

    identifyingConcepts: {
      on: {
        CONCEPTS_IDENTIFIED: {
          target: 'mappingVocabulary',
          actions: assign({
            identifiedConcepts: (_, event) => event.concepts,
          }),
        },
      },

      meta: {
        description: 'Identify key legal concepts that need to be simplified',
      },
    },

    mappingVocabulary: {
      on: {
        TERMS_MAPPED: {
          target: 'generatingVersions',
          actions: assign({
            mappedTerms: (_, event) => event.mappedTerms,
          }),
        },
      },

      meta: {
        description: 'Map legal terminology to common vocabulary',
      },
    },

    generatingVersions: {
      on: {
        VERSIONS_GENERATED: {
          target: 'validating',
          actions: assign({
            generatedVersions: (_, event) => event.versions,
          }),
        },
      },

      meta: {
        description: 'Generate multiple versions (simple, detailed, examples, warnings) using LLM',
      },
    },

    validating: {
      on: {
        VALIDATION_PASSED: {
          target: 'completed',
        },
        VALIDATION_FAILED: {
          target: 'checkingRetries',
          actions: assign({
            validationErrors: (_, event) => event.errors,
          }),
        },
      },

      meta: {
        description: 'Validate semantic accuracy of converted text against original legal text',
      },
    },

    checkingRetries: {
      always: [
        {
          target: 'regeneratingWithConstraints',
          cond: (context) => context.retryCount < 3,
          actions: assign({
            retryCount: (context) => context.retryCount + 1,
          }),
        },
        {
          target: 'failed',
        },
      ],

      meta: {
        description: 'Check if we should retry with stricter constraints',
      },
    },

    regeneratingWithConstraints: {
      on: {
        RETRY: {
          target: 'generatingVersions',
        },
      },

      meta: {
        description: 'Regenerate with additional constraints based on validation errors',
      },
    },

    completed: {
      type: 'final',

      meta: {
        description: 'Conversion successfully completed and validated',
      },
    },

    failed: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Conversion failed after maximum retries - requires human intervention',
      },
    },
  },
});

/**
 * Simplified visualization of the state machine:
 *
 * idle
 *   → extractingStructure
 *   → identifyingConcepts
 *   → mappingVocabulary
 *   → generatingVersions
 *   → validating
 *       ↓ (if pass)
 *     completed ✓
 *       ↓ (if fail)
 *     checkingRetries
 *       ↓ (retry count < 3)
 *     regeneratingWithConstraints → generatingVersions
 *       ↓ (retry count >= 3)
 *     failed ✗
 */
