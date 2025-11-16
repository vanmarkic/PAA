/**
 * Machine XState pour l'Aide aux Personnes Âgées
 *
 * Cette machine d'état représente le flux de traitement de l'aide aux personnes âgées,
 * incluant soins à domicile, aide ménagère et adaptation du logement.
 */

import { createMachine, assign } from 'xstate';

interface PersonneAgee {
  nom: string;
  age: number;
  numeroRegistreNational: string;
  degreeAutonomie: number;
  revenus: number;
  vieSoloOuCouple: string;
  logementAdapte: boolean;
}

interface EvaluationBesoins {
  besoinsSoins: string[];
  besoinsAideMenagere: boolean;
  besoinsAdaptationLogement: string[];
  frequenceInterventions: number;
  urgence: boolean;
}

interface PlanAide {
  aidesMenageres: number; // heures/semaine
  soinsInfirmiers: number; // heures/semaine
  adaptationsLogement: string[];
  telealarme: boolean;
  repasDomicile: boolean;
  montantParticipation: number;
}

interface AidePersonnesAgeesContext {
  personne: PersonneAgee | null;
  evaluationBesoins: EvaluationBesoins | null;
  planAide: PlanAide | null;
  serviceAttribue: boolean;
  reevaluationSemestrielle: boolean;
}

export const aidePersonnesAgeesMachine = createMachine({
  id: 'aidePersonnesAgees',
  initial: 'inactif',

  schema: {
    context: {} as AidePersonnesAgeesContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; personne: PersonneAgee }
      | { type: 'EVALUATION_COMPLETE'; evaluation: EvaluationBesoins }
      | { type: 'PLAN_ETABLI'; plan: PlanAide }
      | { type: 'SERVICES_ATTRIBUES' }
      | { type: 'AIDE_COMMENCEE' }
      | { type: 'DEGRADATION_SANTE' }
      | { type: 'AMELIORATION_AUTONOMIE' }
      | { type: 'REEVALUATION_SEMESTRIELLE' }
      | { type: 'PLACEMENT_INSTITUTION' }
      | { type: 'REINITIALISER' }
  },

  context: {
    personne: null,
    evaluationBesoins: null,
    planAide: null,
    serviceAttribue: false,
    reevaluationSemestrielle: false,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'evaluationBesoins',
          actions: assign({
            personne: (_, event) => event.personne,
          }),
        },
      },

      meta: {
        description: 'En attente de demande d\'aide pour personne âgée',
      },
    },

    evaluationBesoins: {
      on: {
        EVALUATION_COMPLETE: {
          target: 'etablissementPlan',
          actions: assign({
            evaluationBesoins: (_, event) => event.evaluation,
          }),
        },
      },

      meta: {
        description: 'Évaluation à domicile par assistant social et/ou infirmier',
      },
    },

    etablissementPlan: {
      on: {
        PLAN_ETABLI: {
          target: 'attributionServices',
          actions: assign({
            planAide: (_, event) => event.plan,
          }),
        },
      },

      meta: {
        description: 'Établissement du plan d\'aide personnalisé',
      },
    },

    attributionServices: {
      on: {
        SERVICES_ATTRIBUES: {
          target: 'aideActive',
          actions: assign({
            serviceAttribue: true,
          }),
        },
      },

      meta: {
        description: 'Attribution des services d\'aide à domicile',
      },
    },

    aideActive: {
      on: {
        DEGRADATION_SANTE: {
          target: 'renforcementAide',
        },
        AMELIORATION_AUTONOMIE: {
          target: 'reductionAide',
        },
        REEVALUATION_SEMESTRIELLE: {
          target: 'reevaluationBesoins',
        },
        PLACEMENT_INSTITUTION: {
          target: 'aideTerminee',
        },
      },

      meta: {
        description: 'Services d\'aide à domicile actifs',
      },
    },

    renforcementAide: {
      on: {
        PLAN_ETABLI: {
          target: 'aideActive',
          actions: assign({
            planAide: (_, event) => event.plan,
          }),
        },
      },

      meta: {
        description: 'Augmentation des heures d\'aide suite à dégradation',
      },
    },

    reductionAide: {
      on: {
        PLAN_ETABLI: {
          target: 'aideActive',
          actions: assign({
            planAide: (_, event) => event.plan,
          }),
        },
      },

      meta: {
        description: 'Réduction progressive de l\'aide suite à amélioration',
      },
    },

    reevaluationBesoins: {
      on: {
        EVALUATION_COMPLETE: {
          target: 'etablissementPlan',
          actions: assign({
            evaluationBesoins: (_, event) => event.evaluation,
            reevaluationSemestrielle: true,
          }),
        },
      },

      meta: {
        description: 'Réévaluation semestrielle des besoins',
      },
    },

    aideTerminee: {
      type: 'final',

      meta: {
        description: 'Aide terminée - placement en institution ou décès',
      },
    },
  },
});

/**
 * Visualisation du flux de l'aide aux personnes âgées:
 *
 * inactif
 *   → evaluationBesoins (visite domicile)
 *   → etablissementPlan
 *   → attributionServices
 *   → aideActive
 *       ↓ (dégradation)
 *     renforcementAide → aideActive
 *       ↓ (amélioration)
 *     reductionAide → aideActive
 *       ↓ (réévaluation semestrielle)
 *     reevaluationBesoins → etablissementPlan
 */
