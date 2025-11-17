/**
 * XState machine for Tax Appeal Procedures
 *
 * This state machine represents the workflow for contesting tax assessments
 * through administrative and judicial channels.
 */

import { createMachine, assign } from 'xstate';
import {
  TaxAppealProcedure,
  AppealStatus,
} from '../modele-metier/recoursEtatTypes';

interface TaxAppealContext {
  appeal: TaxAppealProcedure | null;
  administrativeDecision: 'accepted' | 'rejected' | 'partial' | null;
  judicialDecision: 'favorable' | 'unfavorable' | null;
  paymentSuspended: boolean;
  conciliationAttempted: boolean;
  refundAmount: number;
  interestDue: number;
  errors: string[];
  retryCount: number;
}

export const taxAppealMachine = createMachine({
  id: 'taxAppeal',
  initial: 'idle',

  schemas: {
    context: {} as TaxAppealContext,
    events: {} as
      | { type: 'START_TAX_APPEAL'; appeal: TaxAppealProcedure }
      | { type: 'FILE_ADMINISTRATIVE_COMPLAINT' }
      | { type: 'REQUEST_PAYMENT_SUSPENSION' }
      | { type: 'SUSPENSION_GRANTED' }
      | { type: 'SUSPENSION_DENIED' }
      | { type: 'ADMINISTRATIVE_DECISION'; decision: 'accepted' | 'rejected' | 'partial' }
      | { type: 'ACCEPT_DECISION' }
      | { type: 'FILE_JUDICIAL_APPEAL' }
      | { type: 'REQUEST_CONCILIATION' }
      | { type: 'CONCILIATION_SUCCESS'; agreement: string }
      | { type: 'CONCILIATION_FAILED' }
      | { type: 'COURT_HEARING' }
      | { type: 'JUDGMENT_RENDERED'; decision: 'favorable' | 'unfavorable' }
      | { type: 'APPEAL_TO_HIGHER_COURT' }
      | { type: 'CALCULATE_REFUND'; amount: number; interest: number }
      | { type: 'PROCESS_REFUND' }
      | { type: 'CLOSE_FILE' }
      | { type: 'WITHDRAW' }
  },

  context: {
    appeal: null,
    administrativeDecision: null,
    judicialDecision: null,
    paymentSuspended: false,
    conciliationAttempted: false,
    refundAmount: 0,
    interestDue: 0,
    errors: [],
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        START_TAX_APPEAL: {
          target: 'administrativePhase',
          actions: assign({
            appeal: ({ event }) => event.appeal,
            retryCount: 0,
          }),
        },
      },
      meta: {
        description: 'En attente du début de la procédure fiscale',
      },
    },

    administrativePhase: {
      initial: 'preparingComplaint',
      states: {
        preparingComplaint: {
          on: {
            FILE_ADMINISTRATIVE_COMPLAINT: {
              target: 'complaintFiled',
            },
            WITHDRAW: {
              target: '#taxAppeal.withdrawn',
            },
          },
          meta: {
            description: 'Préparation de la réclamation fiscale (délai: 6 mois)',
          },
        },

        complaintFiled: {
          on: {
            REQUEST_PAYMENT_SUSPENSION: {
              target: 'suspensionRequest',
            },
            REQUEST_CONCILIATION: {
              target: 'conciliation',
            },
            ADMINISTRATIVE_DECISION: {
              target: 'decisionReceived',
              actions: assign({
                administrativeDecision: ({ event }) => event.decision,
              }),
            },
          },
          after: {
            // 6 months timeout for administration to respond
            15552000000: 'implicitRejection',
          },
          meta: {
            description: 'Réclamation déposée - attente de décision (max 6 mois + 3 mois prolongation)',
          },
        },

        suspensionRequest: {
          on: {
            SUSPENSION_GRANTED: {
              target: 'complaintFiled',
              actions: assign({
                paymentSuspended: true,
              }),
            },
            SUSPENSION_DENIED: {
              target: 'complaintFiled',
            },
          },
          meta: {
            description: 'Demande de surséance au recouvrement',
          },
        },

        conciliation: {
          on: {
            CONCILIATION_SUCCESS: {
              target: '#taxAppeal.resolved',
              actions: assign({
                conciliationAttempted: true,
              }),
            },
            CONCILIATION_FAILED: {
              target: 'complaintFiled',
              actions: assign({
                conciliationAttempted: true,
              }),
            },
          },
          meta: {
            description: 'Procédure de conciliation fiscale amiable',
          },
        },

        decisionReceived: {
          on: {
            ACCEPT_DECISION: {
              target: '#taxAppeal.resolved',
            },
            FILE_JUDICIAL_APPEAL: {
              target: '#taxAppeal.judicialPhase',
            },
          },
          meta: {
            description: 'Décision administrative reçue - 3 mois pour recours judiciaire',
          },
        },

        implicitRejection: {
          on: {
            FILE_JUDICIAL_APPEAL: {
              target: '#taxAppeal.judicialPhase',
            },
            WITHDRAW: {
              target: '#taxAppeal.withdrawn',
            },
          },
          meta: {
            description: 'Rejet implicite après silence de l\'administration',
          },
        },
      },
    },

    judicialPhase: {
      initial: 'firstInstance',
      states: {
        firstInstance: {
          on: {
            COURT_HEARING: {
              target: 'awaitingJudgment',
            },
          },
          meta: {
            description: 'Procédure devant le tribunal de première instance',
          },
        },

        awaitingJudgment: {
          on: {
            JUDGMENT_RENDERED: [
              {
                target: 'judgmentFavorable',
                guard: ({ event }: { event: any }) => event.decision === 'favorable',
                actions: assign({
                  judicialDecision: ({ event }: { event: any }) => event.decision as any,
                }),
              },
              {
                target: 'judgmentUnfavorable',
                guard: ({ event }: { event: any }) => event.decision === 'unfavorable',
                actions: assign({
                  judicialDecision: ({ event }: { event: any }) => event.decision as any,
                }),
              },
            ],
          },
          meta: {
            description: 'En attente du jugement du tribunal',
          },
        },

        judgmentFavorable: {
          on: {
            CALCULATE_REFUND: {
              target: '#taxAppeal.refundProcess',
              actions: assign({
                refundAmount: ({ event }) => event.amount,
                interestDue: ({ event }) => event.interest,
              }),
            },
            APPEAL_TO_HIGHER_COURT: {
              target: 'appealCourt',
            },
          },
          meta: {
            description: 'Jugement favorable au contribuable',
          },
        },

        judgmentUnfavorable: {
          on: {
            APPEAL_TO_HIGHER_COURT: {
              target: 'appealCourt',
            },
            ACCEPT_DECISION: {
              target: '#taxAppeal.closed',
            },
          },
          meta: {
            description: 'Jugement défavorable au contribuable',
          },
        },

        appealCourt: {
          on: {
            JUDGMENT_RENDERED: [
              {
                target: 'cassation',
                guard: ({ context }) => context.retryCount < 1,
              },
              {
                target: '#taxAppeal.closed',
              },
            ],
          },
          meta: {
            description: 'Procédure devant la cour d\'appel',
          },
        },

        cassation: {
          on: {
            JUDGMENT_RENDERED: {
              target: '#taxAppeal.closed',
            },
          },
          meta: {
            description: 'Pourvoi en cassation (points de droit uniquement)',
          },
        },
      },
    },

    refundProcess: {
      on: {
        PROCESS_REFUND: {
          target: 'resolved',
        },
      },
      meta: {
        description: 'Traitement du remboursement et des intérêts moratoires',
      },
    },

    resolved: {
      on: {
        CLOSE_FILE: {
          target: 'closed',
        },
      },
      meta: {
        description: 'Litige fiscal résolu (amiable ou judiciaire)',
      },
    },

    closed: {
      type: 'final',
      meta: {
        description: 'Dossier fiscal clôturé',
      },
    },

    withdrawn: {
      type: 'final',
      meta: {
        description: 'Procédure abandonnée par le contribuable',
      },
    },
  },
});

/**
 * Calculate tax appeal deadlines based on notification date
 */
export function calculateTaxDeadlines(
  assessmentDate: Date,
  currentDate: Date = new Date()
): {
  complaintDeadline: Date;
  complaintRemaining: number;
  judicialDeadline?: Date;
  judicialRemaining?: number;
  isComplaintExpired: boolean;
  isJudicialExpired?: boolean;
} {
  // Administrative complaint: 6 months from assessment
  const complaintDeadline = new Date(assessmentDate);
  complaintDeadline.setMonth(complaintDeadline.getMonth() + 6);

  const complaintRemaining = Math.ceil(
    (complaintDeadline.getTime() - currentDate.getTime()) / (1000 * 3600 * 24)
  );

  const result: any = {
    complaintDeadline,
    complaintRemaining: Math.max(0, complaintRemaining),
    isComplaintExpired: complaintRemaining <= 0,
  };

  // If administrative decision received, calculate judicial deadline (3 months)
  if (complaintRemaining < 0) {
    const judicialDeadline = new Date(assessmentDate);
    judicialDeadline.setMonth(judicialDeadline.getMonth() + 9); // 6 + 3 months

    const judicialRemaining = Math.ceil(
      (judicialDeadline.getTime() - currentDate.getTime()) / (1000 * 3600 * 24)
    );

    result.judicialDeadline = judicialDeadline;
    result.judicialRemaining = Math.max(0, judicialRemaining);
    result.isJudicialExpired = judicialRemaining <= 0;
  }

  return result;
}

/**
 * Calculate potential refund with legal interest
 */
export function calculateTaxRefund(
  overpaidAmount: number,
  paymentDate: Date,
  refundDate: Date = new Date()
): {
  principal: number;
  interestRate: number;
  interestAmount: number;
  totalRefund: number;
  daysElapsed: number;
} {
  const daysElapsed = Math.ceil(
    (refundDate.getTime() - paymentDate.getTime()) / (1000 * 3600 * 24)
  );

  // Belgian legal interest rate for tax matters (2024)
  const annualInterestRate = 0.04; // 4% per year
  const dailyRate = annualInterestRate / 365;

  const interestAmount = overpaidAmount * dailyRate * daysElapsed;

  return {
    principal: overpaidAmount,
    interestRate: annualInterestRate,
    interestAmount: Math.round(interestAmount * 100) / 100,
    totalRefund: Math.round((overpaidAmount + interestAmount) * 100) / 100,
    daysElapsed,
  };
}

/**
 * Determine if payment suspension should be requested
 */
export function shouldRequestPaymentSuspension(
  contestedAmount: number,
  financialSituation: 'good' | 'moderate' | 'difficult',
  likelihoodOfSuccess: 'high' | 'medium' | 'low'
): {
  recommend: boolean;
  reason: string;
  requiresGuarantee: boolean;
} {
  // High amounts may require guarantee
  const requiresGuarantee = contestedAmount > 10000;

  if (financialSituation === 'difficult') {
    return {
      recommend: true,
      reason: 'Situation financière difficile - risque de préjudice grave',
      requiresGuarantee,
    };
  }

  if (likelihoodOfSuccess === 'high' && contestedAmount > 5000) {
    return {
      recommend: true,
      reason: 'Forte probabilité de succès et montant significatif',
      requiresGuarantee,
    };
  }

  if (contestedAmount > 25000) {
    return {
      recommend: true,
      reason: 'Montant très élevé justifiant la suspension',
      requiresGuarantee: true,
    };
  }

  return {
    recommend: false,
    reason: 'Paiement recommandé pour éviter les intérêts de retard',
    requiresGuarantee: false,
  };
}

/**
 * Generate tax complaint template
 */
export function generateTaxComplaintTemplate(
  taxType: string,
  taxYear: number,
  contestedAmount: number,
  grounds: string[]
): string {
  return `
À l'attention du Directeur régional des contributions

OBJET: Réclamation contre l'imposition - ${taxType} - Exercice ${taxYear}

Madame, Monsieur le Directeur,

Je soussigné(e), [NOM Prénom], conteste par la présente l'imposition suivante:

IDENTIFICATION DE L'IMPOSITION:
- Nature de l'impôt: ${taxType}
- Exercice d'imposition: ${taxYear}
- Numéro d'article: [À compléter]
- Montant contesté: ${contestedAmount}€
- Date de l'avertissement-extrait de rôle: [Date]

MOYENS DE LA RÉCLAMATION:
${grounds.map((g, i) => `${i + 1}. ${g}`).join('\n')}

DEMANDE:
Je demande:
1. Le dégrèvement total/partiel de l'imposition contestée
2. La suspension du recouvrement pendant l'examen de ma réclamation
3. Le remboursement des sommes indûment perçues avec intérêts

PIÈCES JOINTES:
- Copie de l'avertissement-extrait de rôle
- Pièces justificatives numérotées
- [Autres documents]

Je reste à votre disposition pour tout complément d'information.

Veuillez agréer, Madame, Monsieur le Directeur, l'expression de ma considération distinguée.

Date et signature
`;
}

/**
 * Tax appeal strategy recommendations
 */
export function recommendTaxAppealStrategy(
  taxType: string,
  contestedAmount: number,
  hasStrongGrounds: boolean
): {
  strategy: string;
  steps: string[];
  estimatedCost: number;
  estimatedDuration: string;
  risks: string[];
} {
  if (contestedAmount < 1000 && !hasStrongGrounds) {
    return {
      strategy: 'Réclamation administrative uniquement',
      steps: [
        'Introduire une réclamation motivée',
        'Attendre la décision administrative',
        'Accepter la décision si partiellement favorable',
      ],
      estimatedCost: 0,
      estimatedDuration: '6-9 mois',
      risks: ['Rejet possible sans recours ultérieur'],
    };
  }

  if (hasStrongGrounds && contestedAmount > 5000) {
    return {
      strategy: 'Procédure complète avec assistance',
      steps: [
        'Consulter un conseiller fiscal',
        'Réclamation administrative détaillée',
        'Demander la suspension du paiement',
        'Tenter la conciliation fiscale',
        'Recours judiciaire si nécessaire',
        'Appel si jugement défavorable',
      ],
      estimatedCost: 2000 + (contestedAmount * 0.05), // Honoraires estimés
      estimatedDuration: '12-36 mois',
      risks: [
        'Frais de justice si échec',
        'Intérêts de retard si pas de suspension',
        'Durée longue de la procédure',
      ],
    };
  }

  return {
    strategy: 'Approche pragmatique avec conciliation',
    steps: [
      'Réclamation administrative',
      'Privilégier la conciliation fiscale',
      'Négocier une solution amiable',
      'Éviter le contentieux judiciaire',
    ],
    estimatedCost: 500,
    estimatedDuration: '6-12 mois',
    risks: ['Accord potentiellement moins favorable qu\'en justice'],
  };
}