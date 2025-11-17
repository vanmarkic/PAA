/**
 * XState machine for Artist Status Application Workflow
 *
 * This state machine represents the complete workflow for applying
 * for artist status, including eligibility checking, commission review,
 * and status maintenance.
 */

import { createMachine, assign } from 'xstate';
import { Artist, ArtistStatusEligibility, ArtistStatus } from '../modele-metier/statutArtisteTypes';

interface ArtistStatusContext {
  applicant: Artist | null;
  eligibilityResult: ArtistStatusEligibility | null;
  commissionDecision: {
    approved: boolean;
    visaNumber?: string;
    validUntil?: Date;
    conditions?: string[];
  } | null;
  documents: {
    cv: boolean;
    portfolio: boolean;
    contracts: boolean;
    taxReturns: boolean;
    socialSecurity: boolean;
  };
  retryCount: number;
  errors: string[];
  currentStatus: ArtistStatus | null;
}

export const artistStatusMachine = createMachine({
  id: 'artistStatus',
  initial: 'idle',

  schemas: {
    context: {} as ArtistStatusContext,
    events: {} as
      | { type: 'START_APPLICATION'; applicant: Artist }
      | { type: 'DOCUMENTS_PROVIDED'; documents: Partial<ArtistStatusContext['documents']> }
      | { type: 'ELIGIBILITY_CHECKED'; result: ArtistStatusEligibility }
      | { type: 'SUBMIT_TO_COMMISSION' }
      | { type: 'COMMISSION_DECISION'; decision: ArtistStatusContext['commissionDecision'] }
      | { type: 'ACCEPT_STATUS' }
      | { type: 'DECLINE_STATUS' }
      | { type: 'REQUEST_REVIEW' }
      | { type: 'STATUS_EXPIRED' }
      | { type: 'RENEW_STATUS' }
      | { type: 'UPDATE_ACTIVITY'; activity: Partial<Artist['professionalActivity']> }
      | { type: 'RETRY' }
      | { type: 'CANCEL' }
      | { type: 'RESET' }
  },

  context: {
    applicant: null,
    eligibilityResult: null,
    commissionDecision: null,
    documents: {
      cv: false,
      portfolio: false,
      contracts: false,
      taxReturns: false,
      socialSecurity: false,
    },
    retryCount: 0,
    errors: [],
    currentStatus: null,
  },

  states: {
    idle: {
      on: {
        START_APPLICATION: {
          target: 'collectingDocuments',
          actions: assign({
            applicant: ({ event }: { event: any }) => event.applicant,
            retryCount: 0,
            errors: [],
          }),
        },
      },
      meta: {
        description: 'En attente du début de la demande de statut d\'artiste',
      },
    },

    collectingDocuments: {
      on: {
        DOCUMENTS_PROVIDED: {
          actions: assign({
            documents: ({ context, event }: { context: any; event: any }) => ({
              ...context.documents,
              ...event.documents,
            }),
          }),
        },
        SUBMIT_TO_COMMISSION: {
          target: 'checkingEligibility',
          guard: ({ context }: { context: any }) => {
            const docs = context.documents;
            return docs.cv && docs.portfolio && docs.contracts &&
                   docs.taxReturns && docs.socialSecurity;
          },
        },
        CANCEL: {
          target: 'cancelled',
        },
      },
      meta: {
        description: 'Collecte des documents requis (CV, portfolio, contrats, déclarations fiscales)',
      },
    },

    checkingEligibility: {
      entry: assign({
        retryCount: ({ context }: { context: any }) => context.retryCount + 1,
      }),
      on: {
        ELIGIBILITY_CHECKED: [
          {
            target: 'eligibleForReview',
            guard: ({ event }: { event: any }) => event.result.isEligible,
            actions: assign({
              eligibilityResult: ({ event }: { event: any }) => event.result,
            }),
          },
          {
            target: 'ineligible',
            actions: assign({
              eligibilityResult: ({ event }: { event: any }) => event.result,
            }),
          },
        ],
      },
      meta: {
        description: 'Vérification des critères d\'éligibilité (jours prestés, revenus, etc.)',
      },
    },

    eligibleForReview: {
      on: {
        SUBMIT_TO_COMMISSION: {
          target: 'commissionReview',
        },
        REQUEST_REVIEW: {
          target: 'preparingAppeal',
        },
        CANCEL: {
          target: 'cancelled',
        },
      },
      meta: {
        description: 'Éligible - en attente de soumission à la Commission des Artistes',
      },
    },

    ineligible: {
      on: {
        REQUEST_REVIEW: {
          target: 'preparingAppeal',
        },
        RETRY: {
          target: 'collectingDocuments',
          guard: ({ context }: { context: any }) => context.retryCount < 3,
        },
        RESET: {
          target: 'idle',
        },
      },
      meta: {
        description: 'Non éligible - conditions non remplies',
      },
    },

    commissionReview: {
      on: {
        COMMISSION_DECISION: [
          {
            target: 'approved',
            guard: ({ event }: { event: any }) => event.decision?.approved === true,
            actions: assign({
              commissionDecision: ({ event }: { event: any }) => event.decision,
              currentStatus: ({ context, event }: { context: any; event: any }) =>
                event.decision?.statusType || 'professionnel' as ArtistStatus,
            }),
          },
          {
            target: 'rejected',
            actions: assign({
              commissionDecision: ({ event }: { event: any }) => event.decision,
              errors: ({ event }: { event: any }) =>
                event.decision?.conditions || ['Décision négative de la Commission'],
            }),
          },
        ],
      },
      meta: {
        description: 'Examen du dossier par la Commission des Artistes (délai 30 jours)',
      },
    },

    approved: {
      entry: assign({
        currentStatus: ({ context }: { context: any }) =>
          context.eligibilityResult?.statusType || 'professionnel',
      }),
      on: {
        ACCEPT_STATUS: {
          target: 'active',
        },
        DECLINE_STATUS: {
          target: 'declined',
        },
      },
      meta: {
        description: 'Statut d\'artiste approuvé par la Commission',
      },
    },

    rejected: {
      on: {
        REQUEST_REVIEW: {
          target: 'preparingAppeal',
        },
        RETRY: {
          target: 'collectingDocuments',
          guard: ({ context }: { context: any }) => context.retryCount < 3,
        },
        RESET: {
          target: 'idle',
        },
      },
      meta: {
        description: 'Demande rejetée par la Commission',
      },
    },

    preparingAppeal: {
      on: {
        DOCUMENTS_PROVIDED: {
          target: 'appealReview',
          actions: assign({
            documents: ({ context, event }: { context: any; event: any }) => ({
              ...context.documents,
              ...event.documents,
            }),
          }),
        },
        CANCEL: {
          target: 'cancelled',
        },
      },
      meta: {
        description: 'Préparation du recours (délai 30 jours)',
      },
    },

    appealReview: {
      on: {
        COMMISSION_DECISION: [
          {
            target: 'approved',
            guard: ({ event }: { event: any }) => event.decision?.approved === true,
            actions: assign({
              commissionDecision: ({ event }: { event: any }) => event.decision,
            }),
          },
          {
            target: 'finalRejection',
            actions: assign({
              commissionDecision: ({ event }: { event: any }) => event.decision,
            }),
          },
        ],
      },
      meta: {
        description: 'Examen du recours par la Commission',
      },
    },

    active: {
      on: {
        UPDATE_ACTIVITY: {
          actions: assign({
            applicant: ({ context, event }: { context: any; event: any }) => ({
              ...context.applicant,
              professionalActivity: {
                ...context.applicant?.professionalActivity,
                ...event.activity,
              },
            }),
          }),
        },
        STATUS_EXPIRED: {
          target: 'expired',
        },
        RENEW_STATUS: {
          target: 'renewalProcess',
        },
      },
      meta: {
        description: 'Statut d\'artiste actif - suivi de l\'activité et renouvellement',
      },
    },

    renewalProcess: {
      on: {
        ELIGIBILITY_CHECKED: [
          {
            target: 'active',
            guard: ({ event }: { event: any }) => event.result.isEligible,
            actions: assign({
              eligibilityResult: ({ event }: { event: any }) => event.result,
              commissionDecision: ({ context, event }: { context: any; event: any }) => ({
                ...context.commissionDecision,
                validUntil: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000), // +5 years
              }),
            }),
          },
          {
            target: 'renewalDenied',
            actions: assign({
              eligibilityResult: ({ event }: { event: any }) => event.result,
            }),
          },
        ],
      },
      meta: {
        description: 'Processus de renouvellement du statut (tous les 5 ans)',
      },
    },

    renewalDenied: {
      on: {
        REQUEST_REVIEW: {
          target: 'preparingAppeal',
        },
        RESET: {
          target: 'idle',
        },
      },
      meta: {
        description: 'Renouvellement refusé - conditions non maintenues',
      },
    },

    expired: {
      on: {
        RENEW_STATUS: {
          target: 'renewalProcess',
        },
        START_APPLICATION: {
          target: 'collectingDocuments',
          actions: assign({
            applicant: ({ event }: { event: any }) => event.applicant,
            retryCount: 0,
            errors: [],
          }),
        },
        RESET: {
          target: 'idle',
        },
      },
      meta: {
        description: 'Statut expiré - renouvellement requis',
      },
    },

    declined: {
      on: {
        RESET: {
          target: 'idle',
        },
      },
      meta: {
        description: 'Statut décliné par l\'artiste',
      },
    },

    cancelled: {
      on: {
        RESET: {
          target: 'idle',
        },
      },
      meta: {
        description: 'Demande annulée',
      },
    },

    finalRejection: {
      type: 'final',
      meta: {
        description: 'Rejet définitif après recours',
      },
    },
  },
});

/**
 * Visualization of the Artist Status workflow:
 *
 * idle
 *   → collectingDocuments
 *       → checkingEligibility
 *           ↓ (if eligible)        ↓ (if not eligible)
 *         eligibleForReview      ineligible
 *           ↓                      ↓ (appeal)
 *         commissionReview       preparingAppeal
 *           ↓        ↓             ↓
 *       approved  rejected      appealReview
 *           ↓        ↓             ↓
 *        active   (appeal)     approved/finalRejection
 *           ↓
 *   (renewal/expiry)
 *           ↓
 *     renewalProcess → active
 *                    → renewalDenied
 */