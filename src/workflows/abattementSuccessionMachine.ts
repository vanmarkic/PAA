/**
 * Machine d'état XState pour l'Abattement succession
 *
 * Cette machine d'état représente le flux de travail pour calculer et appliquer
 * l'abattement sur les droits de succession, incluant la détermination du lien
 * de parenté, l'évaluation des biens, et le calcul des droits réduits.
 */

import { createMachine, assign } from 'xstate';

interface Defunt {
  id: string;
  nom: string;
  dateDecès: Date;
  domicile: string;
}

interface Heritier {
  id: string;
  nom: string;
  lienParente: 'conjoint' | 'enfant' | 'petit_enfant' | 'parent' | 'frere_soeur' | 'autre';
  partSuccession: number;
}

interface BienSuccession {
  id: string;
  type: 'immobilier' | 'mobilier' | 'financier' | 'entreprise';
  description: string;
  valeur: number;
}

interface AbattementSuccession {
  montantAbattement: number;
  tauxAbattement: number;
  baseImposable: number;
  montantDroits: number;
  economieRealisee: number;
}

interface AbattementSuccessionContext {
  defunt: Defunt | null;
  heritiers: Heritier[];
  biens: BienSuccession[];
  abattement: AbattementSuccession | null;
  acteSuccession: string | null;
  evaluations: string[];
  totalSuccession: number;
}

export const abattementSuccessionMachine = createMachine({
  id: 'abattementSuccession',
  initial: 'inactif',

  schemas: {
    context: {} as AbattementSuccessionContext,
    events: {} as
      | { type: 'DEMARRER_DECLARATION'; defunt: Defunt; heritiers: Heritier[] }
      | { type: 'AJOUTER_BIEN'; bien: BienSuccession }
      | { type: 'EVALUER_BIENS' }
      | { type: 'BIENS_EVALUES'; total: number }
      | { type: 'CALCULER_ABATTEMENT' }
      | { type: 'ABATTEMENT_CALCULE'; abattement: AbattementSuccession }
      | { type: 'SOUMETTRE_ACTE'; acte: string }
      | { type: 'ACTE_VALIDE' }
      | { type: 'ACTE_INVALIDE' }
      | { type: 'SOUMETTRE_EVALUATIONS'; documents: string[] }
      | { type: 'EVALUATIONS_VALIDEES' }
      | { type: 'EVALUATIONS_INVALIDES' }
      | { type: 'ABATTEMENT_APPLIQUE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    defunt: null,
    heritiers: [],
    biens: [],
    abattement: null,
    acteSuccession: null,
    evaluations: [],
    totalSuccession: 0,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DECLARATION: {
          target: 'inventaireBiens',
          actions: assign({
            defunt: ({ event }) => event.defunt,
            heritiers: ({ event }) => event.heritiers,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une déclaration de succession',
      },
    },

    inventaireBiens: {
      on: {
        AJOUTER_BIEN: {
          target: 'inventaireBiens',
          actions: assign({
            biens: ({ context, event }) => [...context.biens, event.bien],
          }) as any,
        },
        EVALUER_BIENS: {
          target: 'evaluationBiens',
        },
      },

      meta: {
        description: 'Inventaire des biens de la succession',
      },
    },

    evaluationBiens: {
      on: {
        BIENS_EVALUES: {
          target: 'calculAbattement',
          actions: assign({
            totalSuccession: ({ event }) => event.total,
          }),
        },
      },

      meta: {
        description: 'Évaluation de la valeur totale de la succession',
      },
    },

    calculAbattement: {
      on: {
        ABATTEMENT_CALCULE: {
          target: 'abattementCalcule',
          actions: assign({
            abattement: ({ event }) => event.abattement,
          }),
        },
      },

      meta: {
        description: 'Calcul de l\'abattement selon le lien de parenté et la valeur',
      },
    },

    abattementCalcule: {
      on: {
        SOUMETTRE_ACTE: {
          target: 'validationActe',
          actions: assign({
            acteSuccession: ({ event }) => event.acte,
          }),
        },
      },

      meta: {
        description: 'Abattement calculé - soumission de l\'acte de succession',
      },
    },

    validationActe: {
      on: {
        ACTE_VALIDE: {
          target: 'soumissionEvaluations',
        },
        ACTE_INVALIDE: {
          target: 'abattementCalcule',
        },
      },

      meta: {
        description: 'Validation de l\'acte de succession par le notaire',
      },
    },

    soumissionEvaluations: {
      on: {
        SOUMETTRE_EVALUATIONS: {
          target: 'validationEvaluations',
          actions: assign({
            evaluations: ({ event }) => event.documents,
          }),
        },
      },

      meta: {
        description: 'Soumission des évaluations des biens immobiliers et mobiliers',
      },
    },

    validationEvaluations: {
      on: {
        EVALUATIONS_VALIDEES: {
          target: 'abattementApprouve',
        },
        EVALUATIONS_INVALIDES: {
          target: 'soumissionEvaluations',
        },
      },

      meta: {
        description: 'Validation des évaluations par l\'administration fiscale',
      },
    },

    abattementApprouve: {
      on: {
        ABATTEMENT_APPLIQUE: {
          target: 'applique',
        },
      },

      meta: {
        description: 'Abattement succession approuvé',
      },
    },

    applique: {
      type: 'final',

      meta: {
        description: 'Abattement appliqué - droits de succession réduits',
      },
    },
  },
});

/**
 * Visualisation du flux de travail de l'abattement succession:
 *
 * inactif
 *   → inventaireBiens → evaluationBiens
 *       ↑ (ajouter)         ↓
 *       └──────────    calculAbattement
 *                           ↓
 *                   abattementCalcule
 *                           ↓
 *                     validationActe
 *                           ↓
 *                   soumissionEvaluations
 *                           ↓
 *                   validationEvaluations
 *                           ↓
 *                   abattementApprouve
 *                           ↓
 *                       applique ✓
 */
