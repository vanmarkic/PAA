/**
 * XState machine for Aide Alimentaire (Food Assistance) Workflow
 *
 * This state machine represents the workflow for accessing food assistance programs,
 * including need assessment, eligibility verification, and food voucher distribution.
 */

import { createMachine, assign } from 'xstate';

interface BeneficiaireAide {
  nom: string;
  nombrePersonnes: number;
  revenuMensuel: number;
  situationEmploi: string;
}

interface AideAlimentaireContext {
  beneficiaire: BeneficiaireAide | null;
  estEligible: boolean;
  montantBons: number;
  frequenceDistribution: string | null;
  derniereDistribution: Date | null;
  raisonRefus: string[];
}

export const aideAlimentaireMachine = createMachine({
  id: 'aideAlimentaire',
  initial: 'attente',

  schemas: {
    context: {} as AideAlimentaireContext,
    events: {} as
      | { type: 'DEMANDER_AIDE'; beneficiaire: BeneficiaireAide }
      | { type: 'EVALUER_BESOIN' }
      | { type: 'BESOIN_CONFIRME'; montant: number; frequence: string }
      | { type: 'BESOIN_NON_JUSTIFIE'; raisons: string[] }
      | { type: 'DISTRIBUER_BONS' }
      | { type: 'BONS_DISTRIBUES'; date: Date }
      | { type: 'RENOUVELER_AIDE' }
      | { type: 'CESSER_AIDE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    beneficiaire: null,
    estEligible: false,
    montantBons: 0,
    frequenceDistribution: null,
    derniereDistribution: null,
    raisonRefus: [],
  },

  states: {
    attente: {
      on: {
        DEMANDER_AIDE: {
          target: 'evaluationBesoin',
          actions: assign({
            beneficiaire: ({ event }) => event.beneficiaire,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une nouvelle demande d\'aide alimentaire',
      },
    },

    evaluationBesoin: {
      on: {
        BESOIN_CONFIRME: {
          target: 'aideApprouvee',
          actions: assign({
            estEligible: true,
            montantBons: ({ event }) => event.montant,
            frequenceDistribution: ({ event }) => event.frequence,
          }),
        },
        BESOIN_NON_JUSTIFIE: {
          target: 'refusee',
          actions: assign({
            estEligible: false,
            raisonRefus: ({ event }) => event.raisons,
          }),
        },
      },

      meta: {
        description: 'Évaluation sociale du besoin et vérification des revenus',
      },
    },

    aideApprouvee: {
      on: {
        DISTRIBUER_BONS: {
          target: 'distributionBons',
        },
      },

      meta: {
        description: 'Aide approuvée - préparation des bons alimentaires',
      },
    },

    distributionBons: {
      on: {
        BONS_DISTRIBUES: {
          target: 'aideActive',
          actions: assign({
            derniereDistribution: ({ event }) => event.date,
          }),
        },
      },

      meta: {
        description: 'Distribution des bons alimentaires au bénéficiaire',
      },
    },

    aideActive: {
      on: {
        DISTRIBUER_BONS: {
          target: 'distributionBons',
        },
        RENOUVELER_AIDE: {
          target: 'evaluationBesoin',
        },
        CESSER_AIDE: {
          target: 'terminee',
        },
      },

      meta: {
        description: 'Aide active - distribution régulière selon la fréquence établie',
      },
    },

    refusee: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Demande refusée - revenus suffisants ou besoin non justifié',
      },
    },

    terminee: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Aide terminée - amélioration de la situation ou fin de période',
      },
    },
  },
});

/**
 * Visualization of the food assistance workflow:
 *
 * attente
 *   → evaluationBesoin
 *       ↓ (si besoin confirmé)
 *     aideApprouvee
 *       ↓
 *     distributionBons
 *       ↓
 *     aideActive → [distribution régulière]
 *       ↓
 *     distributionBons
 */
