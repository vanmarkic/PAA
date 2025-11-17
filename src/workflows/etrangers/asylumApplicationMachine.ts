/**
 * XState machine for Asylum Application Workflow in Belgium
 *
 * This state machine represents the complete asylum procedure from
 * initial application through decision and potential appeals.
 *
 * Key authorities:
 * - OE (Office des Étrangers): Registration
 * - CGRA (Commissariat général aux réfugiés): Decision
 * - CCE (Conseil du Contentieux): Appeals
 * - Fedasil: Accommodation
 */

import { createMachine, assign } from 'xstate';
import {
  ForeignerProfile,
  AsylumApplication,
  AsylumStatus,
  ProcedureResult,
  Notification,
} from '../../domain/etrangersTypes';

interface AsylumContext {
  applicant: ForeignerProfile | null;
  application: AsylumApplication | null;
  dublinCheck: DublinCheckResult | null;
  interviewDate: Date | null;
  decision: AsylumDecision | null;
  accommodation: AccommodationAssignment | null;
  legalAid: LegalAidAssignment | null;
  retryCount: number;
  notifications: Notification[];
  currentPhase: string;
}

interface DublinCheckResult {
  isDublinCase: boolean;
  responsibleCountry?: string;
  transferDeadline?: Date;
}

interface AsylumDecision {
  type: 'refugee' | 'subsidiary-protection' | 'rejected';
  reasons: string[];
  decisionDate: Date;
  appealDeadline: Date;
}

interface AccommodationAssignment {
  type: 'fedasil-center' | 'ila' | 'private';
  location: string;
  assignedDate: Date;
}

interface LegalAidAssignment {
  lawyerName: string;
  organization: string;
  contactInfo: string;
}

export const asylumApplicationMachine = createMachine({
  id: 'asylumApplication',
  initial: 'idle',

  schemas: {
    context: {} as AsylumContext,
    events: {} as
      | { type: 'START_APPLICATION'; applicant: ForeignerProfile; application: AsylumApplication }
      | { type: 'REGISTER_AT_OE' }
      | { type: 'DUBLIN_CHECK_COMPLETE'; result: DublinCheckResult }
      | { type: 'DUBLIN_TRANSFER_ACCEPTED' }
      | { type: 'DUBLIN_TRANSFER_CONTESTED' }
      | { type: 'ASSIGN_ACCOMMODATION'; assignment: AccommodationAssignment }
      | { type: 'ASSIGN_LEGAL_AID'; assignment: LegalAidAssignment }
      | { type: 'SCHEDULE_INTERVIEW'; date: Date }
      | { type: 'INTERVIEW_COMPLETED' }
      | { type: 'SUBMIT_ADDITIONAL_EVIDENCE'; documents: string[] }
      | { type: 'CGRA_DECISION'; decision: AsylumDecision }
      | { type: 'FILE_APPEAL' }
      | { type: 'APPEAL_HEARING_SCHEDULED'; date: Date }
      | { type: 'APPEAL_DECISION'; approved: boolean }
      | { type: 'REQUEST_VOLUNTARY_RETURN' }
      | { type: 'ABANDON_PROCEDURE' }
  },

  context: {
    applicant: null,
    application: null,
    dublinCheck: null,
    interviewDate: null,
    decision: null,
    accommodation: null,
    legalAid: null,
    retryCount: 0,
    notifications: [],
    currentPhase: '',
  },

  states: {
    idle: {
      on: {
        START_APPLICATION: {
          target: 'registration',
          actions: assign({
            applicant: ({ event }: { event: any }) => event.applicant,
            application: ({ event }: { event: any }) => event.application,
            currentPhase: 'Registration',
            notifications: () => [{
              type: 'info',
              message: 'Procédure d\'asile initiée',
              date: new Date(),
              actionRequired: true,
            }],
          }),
        },
      },
      meta: {
        description: 'En attente du début de la procédure d\'asile',
      },
    },

    registration: {
      on: {
        REGISTER_AT_OE: {
          target: 'dublinCheck',
          actions: assign({
            application: ({ context }: { context: any }) => ({
              ...context.application,
              status: 'application-submitted',
            }),
            currentPhase: 'Dublin check',
            notifications: ({ context }: { context: any }) => [
              ...context.notifications,
              {
                type: 'success',
                message: 'Demande enregistrée à l\'Office des Étrangers',
                date: new Date(),
                actionRequired: false,
              },
            ],
          }),
        },
      },
      meta: {
        description: 'Enregistrement de la demande à l\'Office des Étrangers (OE)',
      },
    },

    dublinCheck: {
      on: {
        DUBLIN_CHECK_COMPLETE: [
          {
            target: 'dublinProcedure',
            guard: ({ event }: { event: any }) => event.result.isDublinCase === true,
            actions: assign({
              dublinCheck: ({ event }: { event: any }) => event.result,
              currentPhase: 'Dublin procedure',
            }),
          },
          {
            target: 'accommodation',
            actions: assign({
              dublinCheck: ({ event }: { event: any }) => event.result,
              currentPhase: 'Accommodation assignment',
            }),
          },
        ],
      },
      meta: {
        description: 'Vérification Dublin III - détermination du pays responsable',
      },
    },

    dublinProcedure: {
      on: {
        DUBLIN_TRANSFER_ACCEPTED: {
          target: 'dublinTransfer',
        },
        DUBLIN_TRANSFER_CONTESTED: {
          target: 'dublinAppeal',
        },
      },
      meta: {
        description: 'Procédure Dublin - transfert vers un autre pays européen',
      },
    },

    dublinAppeal: {
      on: {
        APPEAL_DECISION: [
          {
            target: 'accommodation',
            guard: ({ event }: { event: any }) => event.approved === true,
          },
          {
            target: 'dublinTransfer',
          },
        ],
      },
      meta: {
        description: 'Recours contre la décision Dublin',
      },
    },

    dublinTransfer: {
      type: 'final',
      meta: {
        description: 'Transfert vers le pays responsable selon Dublin III',
      },
    },

    accommodation: {
      on: {
        ASSIGN_ACCOMMODATION: {
          target: 'legalAidAssignment',
          actions: assign({
            accommodation: ({ event }: { event: any }) => event.assignment,
            currentPhase: 'Legal aid assignment',
            notifications: ({ context, event }: { context: any; event: any }) => [
              ...context.notifications,
              {
                type: 'info',
                message: `Hébergement assigné: ${event.assignment.location}`,
                date: new Date(),
                actionRequired: true,
              },
            ],
          }),
        },
      },
      meta: {
        description: 'Attribution d\'un centre d\'accueil Fedasil ou ILA',
      },
    },

    legalAidAssignment: {
      on: {
        ASSIGN_LEGAL_AID: {
          target: 'preparingInterview',
          actions: assign({
            legalAid: ({ event }: { event: any }) => event.assignment,
            currentPhase: 'Interview preparation',
          }),
        },
      },
      meta: {
        description: 'Attribution d\'un avocat pro deo pour l\'aide juridique',
      },
    },

    preparingInterview: {
      on: {
        SCHEDULE_INTERVIEW: {
          target: 'awaitingInterview',
          actions: assign({
            interviewDate: ({ event }: { event: any }) => event.date,
            notifications: ({ context, event }: { context: any; event: any }) => [
              ...context.notifications,
              {
                type: 'info',
                message: `Interview CGRA programmé le ${event.date.toLocaleDateString('fr-BE')}`,
                date: new Date(),
                actionRequired: true,
              },
            ],
          }),
        },
      },
      meta: {
        description: 'Préparation de l\'interview avec l\'avocat',
      },
    },

    awaitingInterview: {
      on: {
        INTERVIEW_COMPLETED: {
          target: 'examination',
          actions: assign({
            currentPhase: 'CGRA examination',
            application: ({ context }: { context: any }) => ({
              ...context.application,
              status: 'examination-ongoing',
            }),
          }),
        },
        SUBMIT_ADDITIONAL_EVIDENCE: {
          actions: assign({
            notifications: ({ context }: { context: any }) => [
              ...context.notifications,
              {
                type: 'info',
                message: 'Documents supplémentaires soumis',
                date: new Date(),
                actionRequired: false,
              },
            ],
          }),
        },
      },
      meta: {
        description: 'En attente de l\'interview au CGRA',
      },
    },

    examination: {
      on: {
        CGRA_DECISION: [
          {
            target: 'refugeeStatus',
            guard: ({ event }: { event: any }) => event.decision.type === 'refugee',
            actions: assign({
              decision: ({ event }: { event: any }) => event.decision,
              currentPhase: 'Refugee status granted',
            }),
          },
          {
            target: 'subsidiaryProtection',
            guard: ({ event }: { event: any }) => event.decision.type === 'subsidiary-protection',
            actions: assign({
              decision: ({ event }: { event: any }) => event.decision,
              currentPhase: 'Subsidiary protection granted',
            }),
          },
          {
            target: 'rejected',
            actions: assign({
              decision: ({ event }: { event: any }) => event.decision,
              currentPhase: 'Application rejected',
            }),
          },
        ],
      },
      meta: {
        description: 'Examen de la demande par le CGRA',
      },
    },

    refugeeStatus: {
      type: 'final',
      entry: assign({
        application: ({ context }: { context: any }) => ({
          ...context.application,
          status: 'refugee-recognized',
        }),
        notifications: ({ context }: { context: any }) => [
          ...context.notifications,
          {
            type: 'success',
            message: 'Statut de réfugié reconnu - Carte A de 5 ans',
            date: new Date(),
            actionRequired: true,
          },
        ],
      }),
      meta: {
        description: 'Reconnaissance du statut de réfugié - Convention de Genève',
      },
    },

    subsidiaryProtection: {
      type: 'final',
      entry: assign({
        application: ({ context }: { context: any }) => ({
          ...context.application,
          status: 'subsidiary-protection-granted',
        }),
        notifications: ({ context }: { context: any }) => [
          ...context.notifications,
          {
            type: 'success',
            message: 'Protection subsidiaire accordée - Carte A d\'1 an',
            date: new Date(),
            actionRequired: true,
          },
        ],
      }),
      meta: {
        description: 'Octroi de la protection subsidiaire',
      },
    },

    rejected: {
      on: {
        FILE_APPEAL: {
          target: 'appeal',
          actions: assign({
            currentPhase: 'Appeal at CCE',
            application: ({ context }: { context: any }) => ({
              ...context.application,
              status: 'appeal-ongoing',
            }),
          }),
        },
        REQUEST_VOLUNTARY_RETURN: {
          target: 'voluntaryReturn',
        },
        ABANDON_PROCEDURE: {
          target: 'abandoned',
        },
      },
      meta: {
        description: 'Demande rejetée par le CGRA',
      },
    },

    appeal: {
      initial: 'pending',
      states: {
        pending: {
          on: {
            APPEAL_HEARING_SCHEDULED: {
              target: 'hearing',
            },
          },
          meta: {
            description: 'Recours déposé au CCE - en attente d\'audience',
          },
        },
        hearing: {
          on: {
            APPEAL_DECISION: [
              {
                target: '#asylumApplication.refugeeStatus',
                guard: ({ event }: { event: any }) => event.approved === true,
              },
              {
                target: '#asylumApplication.finalRejection',
              },
            ],
          },
          meta: {
            description: 'Audience au CCE',
          },
        },
      },
    },

    finalRejection: {
      on: {
        REQUEST_VOLUNTARY_RETURN: {
          target: 'voluntaryReturn',
        },
      },
      type: 'final',
      meta: {
        description: 'Rejet définitif après épuisement des recours',
      },
    },

    voluntaryReturn: {
      type: 'final',
      meta: {
        description: 'Programme de retour volontaire avec l\'OIM',
      },
    },

    abandoned: {
      type: 'final',
      meta: {
        description: 'Procédure abandonnée par le demandeur',
      },
    },
  },
});

/**
 * Visualization of the asylum workflow:
 *
 * idle
 *   → registration (OE)
 *       → dublinCheck
 *           ↓ (if Dublin)     ↓ (if not Dublin)
 *       dublinProcedure    accommodation
 *           ↓                   ↓
 *       dublinTransfer     legalAidAssignment
 *                               ↓
 *                         preparingInterview
 *                               ↓
 *                         awaitingInterview
 *                               ↓
 *                           examination (CGRA)
 *                          ↙    ↓    ↘
 *                   refugee  subsidiary  rejected
 *                   status   protection     ↓
 *                                        appeal (CCE)
 *                                           ↓
 *                                    (granted/finalRejection)
 *
 * The workflow includes:
 * - Registration at OE
 * - Dublin III check
 * - Accommodation assignment (Fedasil)
 * - Legal aid assignment
 * - CGRA interview and examination
 * - Decision (refugee/subsidiary/rejection)
 * - Appeal procedures at CCE
 * - Final outcomes
 */