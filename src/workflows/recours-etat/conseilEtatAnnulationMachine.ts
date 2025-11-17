/**
 * XState machine for Council of State Annulment Procedure
 *
 * This state machine represents the complete workflow for filing
 * and processing an annulment appeal before the Council of State.
 */

import { createMachine, assign } from 'xstate';
import {
  AppealApplication,
  AppealStatus,
  AdmissibilityCheck,
  AdmissibilityIssue,
  ConseilEtatAnnulationProcedure,
} from '../../domain/recoursEtatTypes';

interface ConseilEtatContext {
  application: ConseilEtatAnnulationProcedure | null;
  admissibilityCheck: AdmissibilityCheck | null;
  corrections: string[];
  hearingScheduled: boolean;
  decisionRendered: boolean;
  errors: string[];
  retryCount: number;
  administrativeFileReceived: boolean;
}

export const conseilEtatAnnulationMachine = createMachine({
  id: 'conseilEtatAnnulation',
  initial: 'idle',

  schemas: {
    context: {} as ConseilEtatContext,
    events: {} as
      | { type: 'START_APPEAL'; application: ConseilEtatAnnulationProcedure }
      | { type: 'SUBMIT_APPLICATION' }
      | { type: 'ADMISSIBILITY_CHECKED'; result: AdmissibilityCheck }
      | { type: 'CORRECT_ISSUES'; corrections: string[] }
      | { type: 'PAY_FEES' }
      | { type: 'REQUEST_SUSPENSION' }
      | { type: 'ADMINISTRATIVE_FILE_RECEIVED' }
      | { type: 'SCHEDULE_HEARING'; date: Date }
      | { type: 'HEARING_HELD' }
      | { type: 'DECISION_RENDERED'; decision: 'annulled' | 'rejected' }
      | { type: 'APPEAL_DECISION' }
      | { type: 'WITHDRAW' }
      | { type: 'TIMEOUT' }
      | { type: 'RETRY' }
  },

  context: {
    application: null,
    admissibilityCheck: null,
    corrections: [],
    hearingScheduled: false,
    decisionRendered: false,
    errors: [],
    retryCount: 0,
    administrativeFileReceived: false,
  },

  states: {
    idle: {
      on: {
        START_APPEAL: {
          target: 'preparing',
          actions: assign({
            application: ({ event }) => event.application,
            retryCount: 0,
          }),
        },
      },
      meta: {
        description: 'En attente du début de la procédure de recours',
      },
    },

    preparing: {
      on: {
        SUBMIT_APPLICATION: {
          target: 'checkingAdmissibility',
        },
        WITHDRAW: {
          target: 'withdrawn',
        },
      },
      meta: {
        description: 'Préparation de la requête en annulation avec exposition des moyens',
      },
    },

    checkingAdmissibility: {
      on: {
        ADMISSIBILITY_CHECKED: [
          {
            target: 'admissible',
            guard: ({ event }) => event.result.isAdmissible,
            actions: assign({
              admissibilityCheck: ({ event }) => event.result,
            }),
          },
          {
            target: 'correctableIssues',
            guard: ({ event }) => event.result.canBeCorrected,
            actions: assign({
              admissibilityCheck: ({ event }) => event.result,
            }),
          },
          {
            target: 'inadmissible',
            actions: assign({
              admissibilityCheck: ({ event }) => event.result,
            }),
          },
        ],
      },
      meta: {
        description: 'Vérification des conditions de recevabilité (délai, intérêt, forme)',
      },
    },

    correctableIssues: {
      on: {
        CORRECT_ISSUES: {
          target: 'checkingAdmissibility',
          actions: assign({
            corrections: ({ event }) => event.corrections,
          }),
        },
        PAY_FEES: {
          target: 'checkingAdmissibility',
          actions: assign({
            application: ({ context }: { context: any }) =>
              context.application ? {
                ...context.application,
                filingFee: {
                  ...context.application.filingFee,
                  paid: true,
                  paymentDate: new Date(),
                },
              } : null,
          }),
        },
        TIMEOUT: {
          target: 'inadmissible',
        },
      },
      meta: {
        description: 'Problèmes de recevabilité corrigibles (paiement, signature, etc.)',
      },
    },

    inadmissible: {
      type: 'final',
      meta: {
        description: 'Recours déclaré irrecevable - procédure terminée',
      },
    },

    admissible: {
      initial: 'notifyingParties',
      states: {
        notifyingParties: {
          on: {
            ADMINISTRATIVE_FILE_RECEIVED: {
              target: 'instructionPhase',
              actions: assign({
                administrativeFileReceived: true,
              }),
            },
          },
          meta: {
            description: 'Notification aux parties et demande du dossier administratif',
          },
        },

        instructionPhase: {
          on: {
            REQUEST_SUSPENSION: {
              target: 'suspensionRequested',
            },
            SCHEDULE_HEARING: {
              target: 'awaitingHearing',
              actions: assign({
                hearingScheduled: true,
              }),
            },
          },
          meta: {
            description: 'Phase d\'instruction - échange de mémoires et examen du dossier',
          },
        },

        suspensionRequested: {
          on: {
            SCHEDULE_HEARING: {
              target: 'awaitingHearing',
              actions: assign({
                hearingScheduled: true,
              }),
            },
          },
          meta: {
            description: 'Demande de suspension examinée en parallèle',
          },
        },

        awaitingHearing: {
          on: {
            HEARING_HELD: {
              target: 'deliberation',
            },
          },
          meta: {
            description: 'En attente de l\'audience publique',
          },
        },

        deliberation: {
          on: {
            DECISION_RENDERED: [
              {
                target: 'annulled',
                guard: ({ event }) => event.decision === 'annulled',
                actions: assign({
                  decisionRendered: true,
                }),
              },
              {
                target: 'rejected',
                guard: ({ event }) => event.decision === 'rejected',
                actions: assign({
                  decisionRendered: true,
                }),
              },
            ],
          },
          meta: {
            description: 'Délibération du Conseil d\'État après audience',
          },
        },

        annulled: {
          on: {
            APPEAL_DECISION: {
              target: '#conseilEtatAnnulation.cassation',
            },
          },
          meta: {
            description: 'Acte administratif annulé - victoire du requérant',
          },
        },

        rejected: {
          on: {
            APPEAL_DECISION: {
              target: '#conseilEtatAnnulation.cassation',
            },
          },
          meta: {
            description: 'Recours rejeté - acte administratif maintenu',
          },
        },
      },
    },

    cassation: {
      on: {
        RETRY: {
          target: 'preparing',
          guard: ({ context }) => context.retryCount < 1,
          actions: assign({
            retryCount: ({ context }) => context.retryCount + 1,
          }),
        },
      },
      meta: {
        description: 'Pourvoi en cassation possible dans certains cas limités',
      },
    },

    withdrawn: {
      type: 'final',
      meta: {
        description: 'Recours retiré volontairement par le requérant',
      },
    },
  },
});

/**
 * Helper function to check if suspension should be requested
 */
export function shouldRequestSuspension(
  urgency: boolean,
  irreversibleDamage: boolean,
  executionDate?: Date
): boolean {
  if (!urgency && !irreversibleDamage) return false;

  if (executionDate) {
    const daysUntilExecution = Math.ceil(
      (executionDate.getTime() - Date.now()) / (1000 * 3600 * 24)
    );
    return daysUntilExecution < 60;
  }

  return irreversibleDamage;
}

/**
 * Calculate estimated timeline for the procedure
 */
export function estimateConseilEtatTimeline(
  suspensionRequested: boolean,
  urgencyLevel: 'normal' | 'urgent' | 'extreme-urgent'
): {
  phase: string;
  estimatedDuration: string;
}[] {
  const timeline = [
    {
      phase: 'Dépôt et enregistrement',
      estimatedDuration: '1-2 semaines',
    },
    {
      phase: 'Examen de recevabilité',
      estimatedDuration: '1-2 mois',
    },
  ];

  if (suspensionRequested) {
    if (urgencyLevel === 'extreme-urgent') {
      timeline.push({
        phase: 'Procédure d\'extrême urgence',
        estimatedDuration: '3-5 jours',
      });
    } else {
      timeline.push({
        phase: 'Examen de la demande de suspension',
        estimatedDuration: '2-3 mois',
      });
    }
  }

  timeline.push(
    {
      phase: 'Phase d\'instruction',
      estimatedDuration: '6-12 mois',
    },
    {
      phase: 'Audience',
      estimatedDuration: '1 jour',
    },
    {
      phase: 'Délibération et arrêt',
      estimatedDuration: '2-6 mois',
    }
  );

  return timeline;
}

/**
 * Generate checklist for Council of State appeal
 */
export function generateConseilEtatChecklist(): {
  item: string;
  required: boolean;
  completed: boolean;
}[] {
  return [
    {
      item: 'Identifier l\'acte administratif à attaquer',
      required: true,
      completed: false,
    },
    {
      item: 'Vérifier le délai de 60 jours',
      required: true,
      completed: false,
    },
    {
      item: 'Établir l\'intérêt à agir',
      required: true,
      completed: false,
    },
    {
      item: 'Rédiger la requête avec exposé des moyens',
      required: true,
      completed: false,
    },
    {
      item: 'Payer le droit de timbre (200€)',
      required: true,
      completed: false,
    },
    {
      item: 'Joindre la décision attaquée',
      required: true,
      completed: false,
    },
    {
      item: 'Joindre la preuve de notification',
      required: true,
      completed: false,
    },
    {
      item: 'Évaluer le besoin de suspension',
      required: false,
      completed: false,
    },
    {
      item: 'Considérer l\'assistance d\'un avocat',
      required: false,
      completed: false,
    },
    {
      item: 'Préparer les pièces justificatives',
      required: true,
      completed: false,
    },
  ];
}