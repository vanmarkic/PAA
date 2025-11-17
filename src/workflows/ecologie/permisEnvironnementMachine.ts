/**
 * XState machine for Environmental Permit Application Workflow
 *
 * This state machine represents the workflow for applying for an environmental permit
 * including classification, impact assessment, public inquiry, and decision process.
 */

import { createMachine, assign } from 'xstate';
import {
  PermitType,
  Region,
  EcologieApplication,
  EcologieEligibilityResult,
} from '../../domain/ecologieTypes';

interface PermitContext {
  application: EcologieApplication | null;
  classification: PermitType | null;
  impactStudy: {
    required: boolean;
    status: 'pending' | 'in-progress' | 'completed' | 'approved' | 'rejected';
    findings?: string[];
  };
  publicInquiry: {
    required: boolean;
    status: 'pending' | 'open' | 'closed';
    objections: number;
    startDate?: Date;
    endDate?: Date;
  };
  decision: {
    result: 'pending' | 'approved' | 'rejected' | 'conditional';
    conditions?: string[];
    validUntil?: Date;
  };
  retryCount: number;
  errors: string[];
}

export const permisEnvironnementMachine = createMachine({
  id: 'permisEnvironnement',
  initial: 'idle',

  schemas: {
    context: {} as PermitContext,
    events: {} as
      | { type: 'SUBMIT_APPLICATION'; application: EcologieApplication }
      | { type: 'CLASSIFICATION_DETERMINED'; permitType: PermitType }
      | { type: 'START_IMPACT_STUDY' }
      | { type: 'IMPACT_STUDY_COMPLETED'; findings: string[] }
      | { type: 'IMPACT_STUDY_REJECTED'; reason: string }
      | { type: 'START_PUBLIC_INQUIRY' }
      | { type: 'PUBLIC_INQUIRY_CLOSED'; objections: number }
      | { type: 'TECHNICAL_REVIEW_COMPLETE' }
      | { type: 'APPROVE'; conditions?: string[] }
      | { type: 'REJECT'; reason: string }
      | { type: 'REQUEST_ADDITIONAL_INFO' }
      | { type: 'INFO_PROVIDED' }
      | { type: 'APPEAL' }
      | { type: 'RESET' },
  },

  context: {
    application: null,
    classification: null,
    impactStudy: {
      required: false,
      status: 'pending',
    },
    publicInquiry: {
      required: false,
      status: 'pending',
      objections: 0,
    },
    decision: {
      result: 'pending',
    },
    retryCount: 0,
    errors: [] as string[],
  },

  states: {
    idle: {
      on: {
        SUBMIT_APPLICATION: {
          target: 'classification',
          actions: assign({
            application: ({ event }) => event.application,
            retryCount: 0,
            errors: [],
          }),
        },
      },
      meta: {
        description: 'En attente de soumission de demande de permis',
      },
    },

    classification: {
      entry: assign({
        classification: ({ context }: any) => {
          const app = (context as PermitContext).application;
          return app?.type === 'environmental-permits' ? 'classe-1' : 'classe-2';
        },
      } as any),
      always: [
        {
          target: 'impactAssessment',
          guard: ({ context }) => context.classification === 'classe-1',
          actions: assign({
            impactStudy: {
              required: true,
              status: 'pending',
            },
            publicInquiry: {
              required: true,
              status: 'pending',
              objections: 0,
            },
          }),
        },
        {
          target: 'technicalReview',
          guard: ({ context }) => context.classification === 'classe-3',
          actions: assign({
            impactStudy: {
              required: false,
              status: 'pending',
            },
            publicInquiry: {
              required: false,
              status: 'pending',
              objections: 0,
            },
          }),
        },
        {
          target: 'publicConsultation',
          actions: assign({
            impactStudy: {
              required: false,
              status: 'pending',
            },
            publicInquiry: {
              required: true,
              status: 'pending',
              objections: 0,
            },
          }),
        },
      ],
      meta: {
        description: 'Classification de l\'installation selon l\'impact environnemental',
      },
    },

    impactAssessment: {
      initial: 'studying',
      states: {
        studying: {
          on: {
            IMPACT_STUDY_COMPLETED: {
              target: 'reviewing',
              actions: assign({
                impactStudy: ({ context, event }) => ({
                  ...context.impactStudy,
                  status: 'completed',
                  findings: event.findings,
                }),
              }),
            },
          },
          meta: {
            description: 'Étude d\'incidences en cours (délai: 180 jours)',
          },
        },
        reviewing: {
          on: {
            IMPACT_STUDY_REJECTED: [
              {
                target: 'studying',
                guard: ({ context }) => context.retryCount < 2,
                actions: assign({
                  impactStudy: ({ context }) => ({
                    ...context.impactStudy,
                    status: 'rejected',
                  }),
                  retryCount: ({ context }) => context.retryCount + 1,
                }),
              },
              {
                target: '#permisEnvironnement.rejected',
                guard: ({ context }) => context.retryCount >= 2,
              },
            ],
            TECHNICAL_REVIEW_COMPLETE: {
              target: '#permisEnvironnement.publicConsultation',
              actions: assign({
                impactStudy: ({ context }) => ({
                  ...context.impactStudy,
                  status: 'approved',
                }),
              }),
            },
          },
          meta: {
            description: 'Examen de l\'étude d\'incidences par l\'administration',
          },
        },
      },
    },

    publicConsultation: {
      initial: 'preparing',
      states: {
        preparing: {
          on: {
            START_PUBLIC_INQUIRY: {
              target: 'open',
              actions: assign({
                publicInquiry: ({ context }) => ({
                  ...context.publicInquiry,
                  status: 'open',
                  startDate: new Date(),
                  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                }),
              }),
            },
          },
          meta: {
            description: 'Préparation de l\'enquête publique',
          },
        },
        open: {
          after: {
            // 30 days timeout
            2592000000: {
              target: 'analyzing',
              actions: assign({
                publicInquiry: ({ context }) => ({
                  ...context.publicInquiry,
                  status: 'closed',
                }),
              }),
            },
          },
          on: {
            PUBLIC_INQUIRY_CLOSED: {
              target: 'analyzing',
              actions: assign({
                publicInquiry: ({ context, event }) => ({
                  ...context.publicInquiry,
                  status: 'closed',
                  objections: event.objections,
                }),
              }),
            },
          },
          meta: {
            description: 'Enquête publique ouverte (30 jours)',
          },
        },
        analyzing: {
          on: {
            TECHNICAL_REVIEW_COMPLETE: {
              target: '#permisEnvironnement.technicalReview',
            },
          },
          meta: {
            description: 'Analyse des observations du public',
          },
        },
      },
    },

    technicalReview: {
      on: {
        REQUEST_ADDITIONAL_INFO: {
          target: 'waitingForInfo',
        },
        APPROVE: {
          target: 'approved',
          actions: assign({
            decision: ({ event }) => ({
              result: 'approved',
              conditions: event.conditions || [],
              validUntil: new Date(Date.now() + 20 * 365 * 24 * 60 * 60 * 1000), // 20 years
            }),
          }),
        },
        REJECT: {
          target: 'rejected',
          actions: assign({
            decision: ({ event }) => ({
              result: 'rejected',
              conditions: [event.reason],
            }),
          }),
        },
      },
      meta: {
        description: 'Examen technique du dossier par les services compétents',
      },
    },

    waitingForInfo: {
      on: {
        INFO_PROVIDED: {
          target: 'technicalReview',
        },
      },
      after: {
        // 60 days timeout
        5184000000: {
          target: 'rejected',
          actions: assign({
            decision: () => ({
              result: 'rejected',
              conditions: ['Délai de réponse dépassé'],
            }),
          }),
        },
      },
      meta: {
        description: 'En attente d\'informations complémentaires (délai: 60 jours)',
      },
    },

    approved: {
      type: 'final',
      entry: assign({
        application: ({ context }: any) => {
          const ctx = context as PermitContext;
          if (!ctx.application) {
            throw new Error('Application must exist in approved state');
          }
          return {
            ...ctx.application,
            status: 'approved',
            decisionDate: new Date(),
            validUntil: ctx.decision.validUntil,
          };
        },
      } as any),
      meta: {
        description: 'Permis d\'environnement approuvé',
      },
    },

    rejected: {
      on: {
        APPEAL: {
          target: 'appeal',
        },
        RESET: {
          target: 'idle',
        },
      },
      meta: {
        description: 'Demande de permis rejetée',
      },
    },

    appeal: {
      initial: 'processing',
      states: {
        processing: {
          on: {
            APPROVE: {
              target: '#permisEnvironnement.approved',
              actions: assign({
                decision: ({ event }) => ({
                  result: 'approved',
                  conditions: event.conditions || ['Approuvé en appel'],
                  validUntil: new Date(Date.now() + 20 * 365 * 24 * 60 * 60 * 1000),
                }),
              }),
            },
            REJECT: {
              target: 'finalRejection',
            },
          },
          meta: {
            description: 'Recours en cours d\'examen (délai: 60 jours)',
          },
        },
        finalRejection: {
          type: 'final',
          meta: {
            description: 'Recours rejeté - décision finale',
          },
        },
      },
    },
  },
});

/**
 * Helper function to determine if public inquiry is required
 */
export function isPublicInquiryRequired(permitType: PermitType): boolean {
  return permitType === 'classe-1' || permitType === 'classe-2';
}

/**
 * Helper function to determine if impact assessment is required
 */
export function isImpactAssessmentRequired(
  permitType: PermitType,
  natura2000: boolean
): boolean {
  return permitType === 'classe-1' || natura2000;
}

/**
 * Calculate permit validity period based on type
 */
export function calculatePermitValidity(permitType: PermitType): number {
  const validityYears = {
    'classe-1': 20,
    'classe-2': 20,
    'classe-3': 10,
    'unique': 30,
    'environnement': 20,
    'declassé': 5,
  };
  return validityYears[permitType] || 20;
}

/**
 * Generate permit conditions based on classification and findings
 */
export function generatePermitConditions(
  permitType: PermitType,
  impactFindings?: string[],
  publicObjections?: number
): string[] {
  const conditions: string[] = [
    'Respect permanent des normes d\'émission',
    'Tenue d\'un registre des incidents',
    'Déclaration annuelle des émissions',
  ];

  if (permitType === 'classe-1') {
    conditions.push(
      'Application des Meilleures Techniques Disponibles (MTD)',
      'Surveillance continue des émissions',
      'Audit environnemental annuel',
      'Plan de gestion environnementale actualisé'
    );
  }

  if (impactFindings && impactFindings.length > 0) {
    conditions.push('Mise en œuvre des mesures d\'atténuation identifiées');
  }

  if (publicObjections && publicObjections > 10) {
    conditions.push(
      'Création d\'un comité de suivi avec riverains',
      'Communication trimestrielle des données environnementales'
    );
  }

  return conditions;
}