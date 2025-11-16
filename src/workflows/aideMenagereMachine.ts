/**
 * XState machine for Aide Ménagère (Home Help) Workflow
 *
 * This state machine represents the workflow for home help services,
 * including assessment, service planning, aide assignment, and ongoing support.
 */

import { createMachine, assign } from 'xstate';

interface BeneficiaireAide {
  nom: string;
  age: number;
  niveauAutonomie: string;
  pathologies: string[];
  vieFamiliale: string;
}

interface PlanAide {
  heuresHebdomadaires: number;
  tachesAssignees: string[];
  frequence: string;
  participation: number;
}

interface AideMenagereContext {
  beneficiaire: BeneficiaireAide | null;
  plan: PlanAide | null;
  aideDesignee: string | null;
  serviceActif: boolean;
  interventionsEffectuees: number;
}

export const aideMenagereMachine = createMachine({
  id: 'aideMenagere',
  initial: 'attente',

  schema: {
    context: {} as AideMenagereContext,
    events: {} as
      | { type: 'DEMANDER_AIDE'; beneficiaire: BeneficiaireAide }
      | { type: 'EVALUER_BESOINS' }
      | { type: 'BESOINS_IDENTIFIES' }
      | { type: 'ETABLIR_PLAN'; plan: PlanAide }
      | { type: 'DESIGNER_AIDE'; nom: string }
      | { type: 'COMMENCER_SERVICE' }
      | { type: 'INTERVENTION_EFFECTUEE' }
      | { type: 'REEVALUER_BESOINS' }
      | { type: 'AJUSTER_PLAN'; plan: PlanAide }
      | { type: 'SUSPENDRE_SERVICE' }
      | { type: 'REPRENDRE_SERVICE' }
      | { type: 'ARRETER_SERVICE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    beneficiaire: null,
    plan: null,
    aideDesignee: null,
    serviceActif: false,
    interventionsEffectuees: 0,
  },

  states: {
    attente: {
      on: {
        DEMANDER_AIDE: {
          target: 'evaluationBesoins',
          actions: assign({
            beneficiaire: (_, event) => event.beneficiaire,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une nouvelle demande d\'aide ménagère',
      },
    },

    evaluationBesoins: {
      on: {
        BESOINS_IDENTIFIES: {
          target: 'elaborationPlan',
        },
      },

      meta: {
        description: 'Évaluation des besoins à domicile (autonomie, tâches nécessaires)',
      },
    },

    elaborationPlan: {
      on: {
        ETABLIR_PLAN: {
          target: 'attributionAide',
          actions: assign({
            plan: (_, event) => event.plan,
          }),
        },
      },

      meta: {
        description: 'Élaboration du plan d\'aide (heures, tâches, participation financière)',
      },
    },

    attributionAide: {
      on: {
        DESIGNER_AIDE: {
          target: 'serviceEnCours',
          actions: assign({
            aideDesignee: (_, event) => event.nom,
            serviceActif: true,
          }),
        },
      },

      meta: {
        description: 'Attribution d\'une aide ménagère qualifiée',
      },
    },

    serviceEnCours: {
      on: {
        INTERVENTION_EFFECTUEE: {
          target: 'serviceEnCours',
          actions: assign({
            interventionsEffectuees: (context) => context.interventionsEffectuees + 1,
          }),
        },
        REEVALUER_BESOINS: {
          target: 'reevaluationBesoins',
        },
        SUSPENDRE_SERVICE: {
          target: 'serviceSuspendu',
        },
        ARRETER_SERVICE: {
          target: 'serviceArrete',
        },
      },

      meta: {
        description: 'Service actif - interventions régulières selon planning',
      },
    },

    reevaluationBesoins: {
      on: {
        AJUSTER_PLAN: {
          target: 'serviceEnCours',
          actions: assign({
            plan: (_, event) => event.plan,
          }),
        },
        ARRETER_SERVICE: {
          target: 'serviceArrete',
        },
      },

      meta: {
        description: 'Réévaluation périodique des besoins et ajustement du plan',
      },
    },

    serviceSuspendu: {
      on: {
        REPRENDRE_SERVICE: {
          target: 'serviceEnCours',
        },
        ARRETER_SERVICE: {
          target: 'serviceArrete',
        },
      },

      meta: {
        description: 'Service suspendu temporairement (hospitalisation, vacances)',
      },
    },

    serviceArrete: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Service arrêté - amélioration autonomie ou décès',
      },
    },
  },
});

/**
 * Visualization of the home help workflow:
 *
 * attente
 *   → evaluationBesoins
 *   → elaborationPlan
 *   → attributionAide
 *   → serviceEnCours
 *       ↓ [interventions régulières]
 *     serviceEnCours
 *       ↓
 *     reevaluationBesoins
 *       ↓
 *     serviceEnCours
 */
