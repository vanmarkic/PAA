/**
 * Machine XState pour l'Allocation d'Intégration
 *
 * Cette machine d'état représente le flux de traitement de l'allocation d'intégration,
 * un complément à l'allocation pour personnes handicapées pour frais supplémentaires.
 */

import { createMachine, assign } from 'xstate';

interface BeneficiaireIntegration {
  nom: string;
  numeroRegistreNational: string;
  categorieARR: 1 | 2 | 3 | 4;
  degreAutonomie: number;
  fraisSupplementaires: number;
  aideTiersPersonne: boolean;
}

interface EvaluationAutonomie {
  pointsAutonomie: number;
  categorieIntegration: 1 | 2 | 3 | 4 | 5;
  besoinsSpecifiques: string[];
  aideNecessaire: string[];
}

interface MontantIntegration {
  categorieIntegration: number;
  montantMensuel: number;
  complementAideTiers: number;
  montantTotal: number;
}

interface AllocationIntegrationContext {
  beneficiaire: BeneficiaireIntegration | null;
  evaluationAutonomie: EvaluationAutonomie | null;
  montantIntegration: MontantIntegration | null;
  dateReevaluation: Date | null;
}

export const allocationIntegrationMachine = createMachine({
  id: 'allocationIntegration',
  initial: 'inactif',

  schema: {
    context: {} as AllocationIntegrationContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; beneficiaire: BeneficiaireIntegration }
      | { type: 'EVALUATION_COMPLETE'; evaluation: EvaluationAutonomie }
      | { type: 'MONTANT_CALCULE'; montant: MontantIntegration }
      | { type: 'ALLOCATION_APPROUVEE' }
      | { type: 'CHANGEMENT_AUTONOMIE' }
      | { type: 'REEVALUATION_PROGRAMMEE' }
      | { type: 'INTEGRATION_AMELIOREE' }
      | { type: 'INTEGRATION_DEGRADEE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    beneficiaire: null,
    evaluationAutonomie: null,
    montantIntegration: null,
    dateReevaluation: null,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'verificationARR',
          actions: assign({
            beneficiaire: (_, event) => event.beneficiaire,
          }),
        },
      },

      meta: {
        description: 'En attente de demande d\'allocation d\'intégration',
      },
    },

    verificationARR: {
      on: {
        EVALUATION_COMPLETE: {
          target: 'evaluationBesoinsIntegration',
        },
      },

      meta: {
        description: 'Vérification de l\'attribution préalable d\'une catégorie ARR',
      },
    },

    evaluationBesoinsIntegration: {
      on: {
        EVALUATION_COMPLETE: {
          target: 'determinationCategorie',
          actions: assign({
            evaluationAutonomie: (_, event) => event.evaluation,
          }),
        },
      },

      meta: {
        description: 'Évaluation des difficultés d\'intégration et besoins d\'aide',
      },
    },

    determinationCategorie: {
      on: {
        MONTANT_CALCULE: {
          target: 'calculMontant',
          actions: assign({
            montantIntegration: (_, event) => event.montant,
          }),
        },
      },

      meta: {
        description: 'Détermination de la catégorie d\'intégration (1-5)',
      },
    },

    calculMontant: {
      on: {
        ALLOCATION_APPROUVEE: {
          target: 'allocationActive',
        },
      },

      meta: {
        description: 'Calcul du montant selon la catégorie d\'intégration',
      },
    },

    allocationActive: {
      on: {
        CHANGEMENT_AUTONOMIE: {
          target: 'reevaluationBesoins',
        },
        REEVALUATION_PROGRAMMEE: {
          target: 'reevaluationBesoins',
        },
      },

      meta: {
        description: 'Allocation d\'intégration versée mensuellement',
      },
    },

    reevaluationBesoins: {
      on: {
        EVALUATION_COMPLETE: [
          {
            target: 'determinationCategorie',
            cond: (_, event) => event.evaluation.categorieIntegration > 0,
            actions: assign({
              evaluationAutonomie: (_, event) => event.evaluation,
            }),
          },
          {
            target: 'allocationSuspendue',
          },
        ],
      },

      meta: {
        description: 'Réévaluation périodique des besoins d\'intégration',
      },
    },

    allocationSuspendue: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Allocation suspendue - besoins d\'intégration insuffisants',
      },
    },
  },
});

/**
 * Visualisation du flux de l'allocation d'intégration:
 *
 * inactif
 *   → verificationARR
 *   → evaluationBesoinsIntegration
 *   → determinationCategorie (1-5)
 *   → calculMontant
 *   → allocationActive
 *       ↓ (changement ou réévaluation)
 *     reevaluationBesoins
 *       ↓
 *     determinationCategorie ou allocationSuspendue
 */
