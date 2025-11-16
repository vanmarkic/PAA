/**
 * Machine XState pour l'Allocation pour Personnes Handicapées
 *
 * Cette machine d'état représente le flux de traitement de l'allocation pour personnes handicapées,
 * incluant l'évaluation médicale, détermination du degré d'autonomie et versement.
 */

import { createMachine, assign } from 'xstate';

interface PersonneHandicapee {
  nom: string;
  age: number;
  numeroRegistreNational: string;
  typeHandicap: string;
  revenus: number;
  situationFamiliale: string;
}

interface EvaluationMedicale {
  degreAutonomie: number; // 0-18 points
  categorieARR: 1 | 2 | 3 | 4 | null;
  dateEvaluation: Date;
  validiteAnnees: number;
}

interface MontantAllocation {
  categorie: 1 | 2 | 3 | 4;
  montantMensuel: number;
  reductionRevenus: number;
  montantNet: number;
}

interface AllocationHandicapesContext {
  personne: PersonneHandicapee | null;
  evaluationMedicale: EvaluationMedicale | null;
  montantAllocation: MontantAllocation | null;
  reevaluationProgrammee: boolean;
  dateReevaluation: Date | null;
}

export const allocationHandicapesMachine = createMachine({
  id: 'allocationHandicapes',
  initial: 'inactif',

  schemas: {
    context: {} as AllocationHandicapesContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; personne: PersonneHandicapee }
      | { type: 'EVALUATION_PROGRAMMEE' }
      | { type: 'EVALUATION_COMPLETE'; evaluation: EvaluationMedicale }
      | { type: 'MONTANT_CALCULE'; montant: MontantAllocation }
      | { type: 'CHANGEMENT_REVENUS'; nouveauxRevenus: number }
      | { type: 'CHANGEMENT_SITUATION_MEDICALE' }
      | { type: 'REEVALUATION_REQUISE' }
      | { type: 'ALLOCATION_APPROUVEE' }
      | { type: 'ALLOCATION_REFUSEE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    personne: null,
    evaluationMedicale: null,
    montantAllocation: null,
    reevaluationProgrammee: false,
    dateReevaluation: null,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'demandeRecue',
          actions: assign({
            personne: (_, event) => event.personne,
          }),
        },
      },

      meta: {
        description: 'En attente de demande d\'allocation pour personne handicapée',
      },
    },

    demandeRecue: {
      on: {
        EVALUATION_PROGRAMMEE: {
          target: 'evaluationMedicale',
        },
      },

      meta: {
        description: 'Demande reçue - programmation de l\'évaluation médicale',
      },
    },

    evaluationMedicale: {
      on: {
        EVALUATION_COMPLETE: [
          {
            target: 'determinationCategorie',
            guard: (_, event) => event.evaluation.categorieARR !== null,
            actions: assign({
              evaluationMedicale: (_, event) => event.evaluation,
            }),
          },
          {
            target: 'demandeRejetee',
            actions: assign({
              evaluationMedicale: (_, event) => event.evaluation,
            }),
          },
        ],
      },

      meta: {
        description: 'Évaluation du degré d\'autonomie par médecin du SPF Sécurité Sociale',
      },
    },

    determinationCategorie: {
      on: {
        MONTANT_CALCULE: {
          target: 'calculMontant',
          actions: assign({
            montantAllocation: (_, event) => event.montant,
          }),
        },
      },

      meta: {
        description: 'Détermination de la catégorie ARR (1-4) selon le degré d\'autonomie',
      },
    },

    calculMontant: {
      on: {
        ALLOCATION_APPROUVEE: {
          target: 'allocationActive',
        },
      },

      meta: {
        description: 'Calcul du montant selon catégorie, revenus et situation familiale',
      },
    },

    allocationActive: {
      on: {
        CHANGEMENT_REVENUS: {
          target: 'recalculMontant',
          actions: assign({
            personne: (context, event) => ({
              ...context.personne!,
              revenus: event.nouveauxRevenus,
            }),
          }),
        },
        CHANGEMENT_SITUATION_MEDICALE: {
          target: 'reevaluationMedicale',
        },
        REEVALUATION_REQUISE: {
          target: 'reevaluationMedicale',
        },
      },

      meta: {
        description: 'Allocation versée mensuellement - suivi des changements de situation',
      },
    },

    recalculMontant: {
      on: {
        MONTANT_CALCULE: {
          target: 'allocationActive',
          actions: assign({
            montantAllocation: (_, event) => event.montant,
          }),
        },
      },

      meta: {
        description: 'Recalcul du montant suite à changement de revenus',
      },
    },

    reevaluationMedicale: {
      on: {
        EVALUATION_COMPLETE: [
          {
            target: 'determinationCategorie',
            guard: (_, event) => event.evaluation.categorieARR !== null,
            actions: assign({
              evaluationMedicale: (_, event) => event.evaluation,
            }),
          },
          {
            target: 'allocationSuspendue',
            actions: assign({
              evaluationMedicale: (_, event) => event.evaluation,
            }),
          },
        ],
      },

      meta: {
        description: 'Réévaluation médicale périodique ou suite à changement',
      },
    },

    allocationSuspendue: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Allocation suspendue - degré d\'autonomie insuffisant',
      },
    },

    demandeRejetee: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Demande rejetée - degré d\'autonomie insuffisant pour catégorie ARR',
      },
    },
  },
});

/**
 * Visualisation du flux de l'allocation pour personnes handicapées:
 *
 * inactif
 *   → demandeRecue
 *   → evaluationMedicale
 *       ↓ (catégorie ARR attribuée)
 *     determinationCategorie
 *       ↓
 *     calculMontant
 *       ↓
 *     allocationActive
 *       ↓ (changement revenus)
 *     recalculMontant → allocationActive
 *       ↓ (réévaluation périodique)
 *     reevaluationMedicale
 *       ↓
 *     determinationCategorie ou allocationSuspendue
 */
