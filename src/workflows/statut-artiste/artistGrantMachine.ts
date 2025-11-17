/**
 * XState machine for Artist Grant Application Workflow
 *
 * This state machine manages the complete lifecycle of artist grant applications,
 * from submission through evaluation, funding, and reporting.
 */

import { createMachine, assign } from 'xstate';
import { ArtistGrant, Artist } from '../../domain/statutArtisteTypes';

interface GrantApplicationContext {
  applicant: Artist | null;
  grant: ArtistGrant | null;
  evaluationScores: {
    artisticQuality: number;
    feasibility: number;
    impact: number;
    innovation: number;
  };
  reportingStatus: {
    interim: boolean;
    final: boolean;
    financial: boolean;
  };
  disbursements: Array<{
    date: Date;
    amount: number;
    status: 'pending' | 'paid' | 'withheld';
  }>;
  retryCount: number;
  errors: string[];
}

export const artistGrantMachine = createMachine({
  id: 'artistGrant',
  initial: 'idle',

  schemas: {
    context: {} as GrantApplicationContext,
    events: {} as
      | { type: 'START_GRANT_APPLICATION'; applicant: Artist; grantType: string }
      | { type: 'SUBMIT_PROJECT'; projectDetails: any }
      | { type: 'SAVE_DRAFT' }
      | { type: 'SUBMIT_APPLICATION' }
      | { type: 'JURY_EVALUATION'; scores: GrantApplicationContext['evaluationScores'] }
      | { type: 'GRANT_DECISION'; approved: boolean; amount?: number; conditions?: string[] }
      | { type: 'ACCEPT_GRANT' }
      | { type: 'DECLINE_GRANT' }
      | { type: 'REQUEST_DISBURSEMENT' }
      | { type: 'SUBMIT_REPORT'; reportType: 'interim' | 'final' | 'financial' }
      | { type: 'REPORT_APPROVED' }
      | { type: 'REPORT_REJECTED'; reasons: string[] }
      | { type: 'PROJECT_COMPLETED' }
      | { type: 'ABANDON_PROJECT' }
      | { type: 'RETRY' }
      | { type: 'RESET' }
  },

  context: {
    applicant: null,
    grant: null,
    evaluationScores: {
      artisticQuality: 0,
      feasibility: 0,
      impact: 0,
      innovation: 0,
    },
    reportingStatus: {
      interim: false,
      final: false,
      financial: false,
    },
    disbursements: [],
    retryCount: 0,
    errors: [],
  },

  states: {
    idle: {
      on: {
        START_GRANT_APPLICATION: {
          target: 'drafting',
          actions: assign({
            applicant: ({ event }: { event: any }) => event.applicant,
            grant: ({ event }: { event: any }) => ({
              id: `grant-${Date.now()}`,
              userId: event.applicant.id,
              grantType: event.grantType,
              application: {
                submittedDate: new Date(),
                projectTitle: '',
                requestedAmount: 0,
                projectDuration: 0,
                status: 'draft',
              },
            }),
          }),
        },
      },
      meta: {
        description: 'En attente du début d\'une demande de bourse',
      },
    },

    drafting: {
      on: {
        SUBMIT_PROJECT: {
          actions: assign({
            grant: ({ context, event }: { context: any; event: any }) => ({
              ...context.grant,
              application: {
                ...context.grant?.application,
                ...event.projectDetails,
              },
            }),
          }),
        },
        SAVE_DRAFT: {
          actions: [],
          meta: {
            description: 'Sauvegarde automatique du brouillon',
          },
        },
        SUBMIT_APPLICATION: {
          target: 'submitted',
          guard: ({ context }: { context: any }) => {
            const app = context.grant?.application;
            return app?.projectTitle && app?.requestedAmount > 0 && app?.projectDuration > 0;
          },
          actions: assign({
            grant: ({ context }: { context: any }) => ({
              ...context.grant,
              application: {
                ...context.grant?.application,
                status: 'submitted',
                submittedDate: new Date(),
              },
            }),
          }),
        },
      },
      meta: {
        description: 'Rédaction de la demande de bourse (projet, budget, calendrier)',
      },
    },

    submitted: {
      after: {
        2000: 'underEvaluation', // Simulate processing time
      },
      meta: {
        description: 'Demande soumise - en attente d\'évaluation',
      },
    },

    underEvaluation: {
      on: {
        JURY_EVALUATION: {
          target: 'evaluated',
          actions: assign({
            evaluationScores: ({ event }: { event: any }) => event.scores,
            grant: ({ context, event }: { context: any; event: any }) => ({
              ...context.grant,
              evaluation: {
                ...event.scores,
                totalScore:
                  (event.scores.artisticQuality +
                   event.scores.feasibility +
                   event.scores.impact +
                   event.scores.innovation) / 4,
              },
            }),
          }),
        },
      },
      meta: {
        description: 'Évaluation par le jury (qualité artistique, faisabilité, impact)',
      },
    },

    evaluated: {
      on: {
        GRANT_DECISION: [
          {
            target: 'approved',
            guard: ({ event }: { event: any }) => event.approved === true,
            actions: assign({
              grant: ({ context, event }: { context: any; event: any }) => ({
                ...context.grant,
                application: {
                  ...context.grant?.application,
                  status: 'approved',
                },
                funding: {
                  approvedAmount: event.amount,
                  disbursements: [
                    {
                      date: new Date(),
                      amount: event.amount * 0.5, // 50% upfront
                      condition: 'Signature de la convention',
                    },
                    {
                      date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                      amount: event.amount * 0.25, // 25% interim
                      condition: 'Rapport intermédiaire approuvé',
                    },
                    {
                      date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
                      amount: event.amount * 0.25, // 25% final
                      condition: 'Rapport final approuvé',
                    },
                  ],
                  reporting: [],
                },
              }),
              disbursements: ({ event }: { event: any }) => [
                { date: new Date(), amount: event.amount * 0.5, status: 'pending' },
                { date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), amount: event.amount * 0.25, status: 'pending' },
                { date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), amount: event.amount * 0.25, status: 'pending' },
              ],
            }),
          },
          {
            target: 'rejected',
            actions: assign({
              grant: ({ context }: { context: any }) => ({
                ...context.grant,
                application: {
                  ...context.grant?.application,
                  status: 'rejected',
                },
              }),
              errors: ({ event }: { event: any }) =>
                event.conditions || ['Score insuffisant ou budget non disponible'],
            }),
          },
        ],
      },
      meta: {
        description: 'Décision du jury rendue',
      },
    },

    approved: {
      on: {
        ACCEPT_GRANT: {
          target: 'contractSigning',
        },
        DECLINE_GRANT: {
          target: 'declined',
        },
      },
      meta: {
        description: 'Bourse approuvée - en attente d\'acceptation',
      },
    },

    rejected: {
      on: {
        RETRY: {
          target: 'drafting',
          guard: ({ context }: { context: any }) => context.retryCount < 2,
          actions: assign({
            retryCount: ({ context }: { context: any }) => context.retryCount + 1,
          }),
        },
        RESET: {
          target: 'idle',
        },
      },
      meta: {
        description: 'Demande rejetée - possibilité de resoumettre',
      },
    },

    contractSigning: {
      after: {
        1000: 'projectExecution',
      },
      meta: {
        description: 'Signature de la convention de subvention',
      },
    },

    projectExecution: {
      initial: 'inProgress',
      states: {
        inProgress: {
          on: {
            REQUEST_DISBURSEMENT: {
              target: 'awaitingDisbursement',
              actions: assign({
                disbursements: ({ context }: { context: any }) =>
                  context.disbursements.map((d, i) =>
                    i === 0 ? { ...d, status: 'paid' as const } : d
                  ),
              }),
            },
            SUBMIT_REPORT: {
              target: 'reportReview',
            },
            ABANDON_PROJECT: {
              target: '#artistGrant.abandoned',
            },
          },
          meta: {
            description: 'Projet en cours d\'exécution',
          },
        },

        awaitingDisbursement: {
          after: {
            2000: 'inProgress',
          },
          meta: {
            description: 'Traitement du versement',
          },
        },

        reportReview: {
          on: {
            REPORT_APPROVED: {
              target: 'inProgress',
              actions: assign({
                reportingStatus: ({ context, event }: { context: any; event: any }) => ({
                  ...context.reportingStatus,
                  // Update based on report type
                }),
              }),
            },
            REPORT_REJECTED: {
              target: 'reportRevision',
              actions: assign({
                errors: ({ event }: { event: any }) => event.reasons,
              }),
            },
          },
          meta: {
            description: 'Examen du rapport soumis',
          },
        },

        reportRevision: {
          on: {
            SUBMIT_REPORT: {
              target: 'reportReview',
            },
          },
          meta: {
            description: 'Révision du rapport demandée',
          },
        },
      },

      on: {
        PROJECT_COMPLETED: {
          target: 'finalReporting',
          guard: ({ context }: { context: any }) =>
            context.reportingStatus.interim === true,
        },
      },
    },

    finalReporting: {
      on: {
        SUBMIT_REPORT: {
          target: 'finalReview',
        },
      },
      meta: {
        description: 'Phase de rapport final et justificatifs',
      },
    },

    finalReview: {
      on: {
        REPORT_APPROVED: {
          target: 'completed',
          actions: assign({
            disbursements: ({ context }: { context: any }) =>
              context.disbursements.map((d) => ({ ...d, status: 'paid' as const })),
            grant: ({ context }: { context: any }) => ({
              ...context.grant,
              application: {
                ...context.grant?.application,
                status: 'completed' as const,
              },
            }),
          }),
        },
        REPORT_REJECTED: {
          target: 'finalReporting',
          actions: assign({
            errors: ({ event }: { event: any }) => event.reasons,
          }),
        },
      },
      meta: {
        description: 'Validation finale et solde de la bourse',
      },
    },

    completed: {
      type: 'final',
      meta: {
        description: 'Projet terminé avec succès - bourse entièrement versée',
      },
    },

    declined: {
      type: 'final',
      meta: {
        description: 'Bourse déclinée par l\'artiste',
      },
    },

    abandoned: {
      type: 'final',
      meta: {
        description: 'Projet abandonné - remboursement potentiel requis',
      },
    },
  },
});

/**
 * Visualization of the Grant Application workflow:
 *
 * idle → drafting → submitted → underEvaluation → evaluated
 *                                                    ↓     ↓
 *                                              approved  rejected
 *                                                   ↓
 *                                          contractSigning
 *                                                   ↓
 *                                          projectExecution
 *                                           (inProgress ↔ reports)
 *                                                   ↓
 *                                            finalReporting
 *                                                   ↓
 *                                             finalReview
 *                                                   ↓
 *                                              completed
 */