/**
 * XState machine for Petition Lifecycle Workflow
 *
 * This state machine manages the complete lifecycle of a petition
 * from creation through signature collection to authority response.
 */

import { createMachine, assign } from 'xstate';
import {
  Petition,
  SignaturePetition,
  ReponsePetition,
  DemocraticCitizen,
  PetitionType,
  DEMOCRATIE_CONSTANTS,
} from '../modele-metier/democratieTypes';

interface PetitionContext {
  petition: Petition | null;
  organizer: DemocraticCitizen | null;
  signatures: SignaturePetition[];
  verifiedSignatures: number;
  rejectedSignatures: number;
  authorityResponse: ReponsePetition | null;
  verificationQueue: SignaturePetition[];
  verificationBatch: number;
  errors: string[];
  retryCount: number;
  maxRetries: number;
  thresholdReached: boolean;
  submissionReference: string | null;
}

export const petitionMachine = createMachine({
  id: 'petition',
  initial: 'idle',

  schemas: {
    context: {} as PetitionContext,
    events: {} as
      | { type: 'CREATE_PETITION'; organizer: DemocraticCitizen; details: any }
      | { type: 'PETITION_CREATED'; petition: Petition }
      | { type: 'OPEN_FOR_SIGNATURES' }
      | { type: 'ADD_SIGNATURE'; signature: SignaturePetition }
      | { type: 'BATCH_SIGNATURES'; signatures: SignaturePetition[] }
      | { type: 'VERIFY_SIGNATURE'; signature: SignaturePetition }
      | { type: 'SIGNATURE_VERIFIED'; signatureId: string; valid: boolean; reason?: string }
      | { type: 'CHECK_THRESHOLD' }
      | { type: 'THRESHOLD_REACHED' }
      | { type: 'DEADLINE_EXPIRED' }
      | { type: 'SUBMIT_TO_AUTHORITY' }
      | { type: 'SUBMISSION_CONFIRMED'; reference: string }
      | { type: 'AUTHORITY_RESPONSE'; response: ReponsePetition }
      | { type: 'CLOSE_PETITION' }
      | { type: 'ARCHIVE' }
      | { type: 'FRAUD_DETECTED'; signatures: string[] }
      | { type: 'RETRY' }
      | { type: 'RESET' }
  },

  context: {
    petition: null as Petition | null,
    organizer: null as DemocraticCitizen | null,
    signatures: [] as SignaturePetition[],
    verifiedSignatures: 0,
    rejectedSignatures: 0,
    authorityResponse: null as ReponsePetition | null,
    verificationQueue: [] as SignaturePetition[],
    verificationBatch: 100,
    errors: [] as string[],
    retryCount: 0,
    maxRetries: 3,
    thresholdReached: false,
    submissionReference: null as string | null,
  },

  states: {
    idle: {
      on: {
        CREATE_PETITION: {
          target: 'creating',
          actions: assign({
            organizer: ({ event }) => event.organizer,
            errors: [],
            retryCount: 0,
          }),
        },
      },

      meta: {
        description: 'En attente de création de pétition',
      },
    },

    creating: {
      on: {
        PETITION_CREATED: {
          target: 'draft',
          actions: assign({
            petition: ({ event }) => event.petition,
          }),
        },
      },

      meta: {
        description: 'Création de la pétition avec validation des paramètres',
      },
    },

    draft: {
      on: {
        OPEN_FOR_SIGNATURES: {
          target: 'collecting',
          actions: assign(({ context }) => ({
            petition: context.petition ? {
              ...context.petition,
              statut: 'ouverte' as const,
            } : null,
          })),
        },
      },

      meta: {
        description: 'Pétition en brouillon - préparation avant ouverture',
      },
    },

    collecting: {
      initial: 'accepting',

      states: {
        accepting: {
          on: {
            ADD_SIGNATURE: {
              actions: assign({
                signatures: ({ context, event }) => [...context.signatures, event.signature],
                verificationQueue: ({ context, event }) =>
                  [...context.verificationQueue, event.signature],
              }),
              target: 'verifying',
            },
            BATCH_SIGNATURES: {
              actions: assign({
                signatures: ({ context, event }) =>
                  [...context.signatures, ...event.signatures],
                verificationQueue: ({ context, event }) =>
                  [...context.verificationQueue, ...event.signatures],
              }),
              target: 'verifying',
            },
            CHECK_THRESHOLD: {
              target: 'checkingThreshold',
            },
            DEADLINE_EXPIRED: {
              target: '#petition.expired',
            },
          },

          meta: {
            description: 'Acceptation des signatures',
          },
        },

        verifying: {
          entry: assign({
            verificationBatch: ({ context }) =>
              Math.min(100, context.verificationQueue.length),
          }),

          on: {
            SIGNATURE_VERIFIED: [
              {
                actions: assign({
                  verifiedSignatures: ({ context, event }) =>
                    event.valid ? context.verifiedSignatures + 1 : context.verifiedSignatures,
                  rejectedSignatures: ({ context, event }) =>
                    !event.valid ? context.rejectedSignatures + 1 : context.rejectedSignatures,
                  signatures: ({ context, event }) =>
                    context.signatures.map(sig =>
                      sig.id === event.signatureId
                        ? { ...sig, verifiee: true, valide: event.valid, motifRejet: event.reason }
                        : sig
                    ),
                  verificationQueue: ({ context, event }) =>
                    context.verificationQueue.filter(sig => sig.id !== event.signatureId),
                }),
                target: 'checkingProgress',
              },
            ],
            FRAUD_DETECTED: {
              target: 'fraudInvestigation',
              actions: assign({
                errors: ({ context, event }) =>
                  [...context.errors, `Fraude détectée: ${event.signatures.length} signatures`],
              }),
            },
          },

          meta: {
            description: 'Vérification des signatures (numéro national, résidence, âge)',
          },
        },

        checkingProgress: {
          always: [
            {
              target: 'checkingThreshold',
              guard: ({ context }) => context.verificationQueue.length === 0,
            },
            {
              target: 'verifying',
              guard: ({ context }) => context.verificationQueue.length > 0,
            },
            {
              target: 'accepting',
            },
          ],

          meta: {
            description: 'Vérification de l\'état d\'avancement',
          },
        },

        checkingThreshold: {
          entry: assign({
            thresholdReached: ({ context }) => {
              if (!context.petition) return false;
              return context.verifiedSignatures >= context.petition.objectifSignatures;
            },
          }),

          always: [
            {
              target: '#petition.thresholdReached',
              guard: ({ context }) => context.thresholdReached,
            },
            {
              target: 'accepting',
              guard: ({ context }) => {
                if (!context.petition?.dateCloture) return true;
                return new Date() < context.petition.dateCloture;
              },
            },
            {
              target: '#petition.expired',
            },
          ],

          meta: {
            description: 'Vérification du seuil de signatures requis',
          },
        },

        fraudInvestigation: {
          on: {
            FRAUD_DETECTED: {
              actions: assign({
                verifiedSignatures: ({ context, event }) => {
                  const fraudCount = event.signatures.length;
                  return Math.max(0, context.verifiedSignatures - fraudCount);
                },
                signatures: ({ context, event }) =>
                  context.signatures.map(sig =>
                    event.signatures.includes(sig.id)
                      ? { ...sig, valide: false, motifRejet: 'Signature frauduleuse' }
                      : sig
                  ),
              }),
              target: 'checkingProgress',
            },
          },

          meta: {
            description: 'Investigation de fraude sur les signatures',
          },
        },
      },
    },

    thresholdReached: {
      entry: assign(({ context }) => ({
        petition: context.petition ? {
          ...context.petition,
          statut: 'fermee' as const,
        } : null,
      })),

      on: {
        SUBMIT_TO_AUTHORITY: {
          target: 'submitting',
        },
      },

      meta: {
        description: 'Seuil de signatures atteint - prêt pour soumission',
      },
    },

    submitting: {
      on: {
        SUBMISSION_CONFIRMED: {
          target: 'submitted',
          actions: assign(({ context, event }) => ({
            submissionReference: event.reference,
            petition: context.petition ? {
              ...context.petition,
              statut: 'examinee' as const,
            } : null,
          })),
        },
        RETRY: {
          target: 'thresholdReached',
          guard: ({ context }) => context.retryCount < context.maxRetries,
          actions: assign({
            retryCount: ({ context }) => context.retryCount + 1,
          }),
        },
      },

      meta: {
        description: 'Soumission de la pétition aux autorités compétentes',
      },
    },

    submitted: {
      on: {
        AUTHORITY_RESPONSE: {
          target: 'responded',
          actions: assign(({ context, event }) => ({
            authorityResponse: event.response,
            petition: context.petition ? {
              ...context.petition,
              statut: event.response.decision === 'acceptee' ? 'acceptee' : ('rejetee' as const),
              reponseAutorite: event.response,
            } : null,
          })),
        },
      },

      after: {
        // 3 months timeout for authority response
        7776000000: {
          target: 'noResponse',
        },
      },

      meta: {
        description: 'Pétition soumise - en attente de réponse des autorités',
      },
    },

    responded: {
      on: {
        ARCHIVE: {
          target: 'archived',
        },
      },

      meta: {
        description: 'Réponse reçue des autorités',
      },
    },

    noResponse: {
      entry: assign({
        errors: ({ context }) =>
          [...context.errors, 'Aucune réponse reçue dans le délai de 3 mois'],
      }),

      on: {
        AUTHORITY_RESPONSE: {
          target: 'responded',
          actions: assign({
            authorityResponse: ({ event }) => event.response,
          }),
        },
        ARCHIVE: {
          target: 'archived',
        },
      },

      meta: {
        description: 'Délai de réponse dépassé - relance possible',
      },
    },

    expired: {
      entry: assign(({ context }) => ({
        petition: context.petition ? {
          ...context.petition,
          statut: 'fermee' as const,
        } : null,
      })),

      on: {
        ARCHIVE: {
          target: 'archived',
        },
      },

      meta: {
        description: 'Pétition expirée - seuil non atteint dans les délais',
      },
    },

    archived: {
      type: 'final',

      meta: {
        description: 'Pétition archivée - processus terminé',
      },
    },
  },
});

/**
 * Visualization of the petition workflow:
 *
 * idle
 *   → creating
 *   → draft
 *   → collecting
 *       ├─→ accepting (signatures)
 *       ├─→ verifying (validation)
 *       ├─→ checkingThreshold
 *       └─→ fraudInvestigation
 *
 * Outcomes:
 *   → thresholdReached → submitting → submitted → responded → archived
 *   → expired → archived
 *   → noResponse → archived
 *
 * The petition can be in various states during collection:
 * - Accepting new signatures
 * - Verifying signatures in batches
 * - Checking if threshold is reached
 * - Investigating potential fraud
 */