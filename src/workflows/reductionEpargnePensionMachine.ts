/**
 * Machine d'état XState pour la Réduction d'impôt épargne-pension
 *
 * Cette machine d'état représente le flux de travail pour bénéficier d'une réduction
 * d'impôt sur l'épargne-pension, incluant la vérification des versements, le calcul
 * de la réduction, et le suivi annuel.
 */

import { createMachine, assign } from 'xstate';

interface Epargnant {
  id: string;
  nom: string;
  age: number;
  revenus: number;
  montantVerse: number;
  typeContrat: 'assurance_vie' | 'fonds_pension' | 'epargne_pension_bancaire';
}

interface ReductionEpargne {
  estEligible: boolean;
  montantReduction: number;
  plafondUtilise: number;
  plafondMaximal: number;
  motifRefus?: string;
}

interface ReductionEpargnePensionContext {
  epargnant: Epargnant | null;
  reduction: ReductionEpargne | null;
  attestationsVersement: string[];
  totalVersements: number;
  anneeFiscale: number;
}

export const reductionEpargnePensionMachine = createMachine({
  id: 'reductionEpargnePension',
  initial: 'inactif',

  schemas: {
    context: {} as ReductionEpargnePensionContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; epargnant: Epargnant }
      | { type: 'VERSEMENTS_VERIFIES'; total: number }
      | { type: 'REDUCTION_CALCULEE'; reduction: ReductionEpargne }
      | { type: 'ATTESTATIONS_SOUMISES'; documents: string[] }
      | { type: 'ATTESTATIONS_VALIDEES' }
      | { type: 'ATTESTATIONS_INVALIDES' }
      | { type: 'REDUCTION_APPLIQUEE' }
      | { type: 'NOUVELLE_ANNEE'; annee: number }
      | { type: 'REINITIALISER' }
  },

  context: {
    epargnant: null,
    reduction: null,
    attestationsVersement: [],
    totalVersements: 0,
    anneeFiscale: new Date().getFullYear(),
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'verificationVersements',
          actions: assign({
            epargnant: ({ event }) => event.epargnant,
            anneeFiscale: new Date().getFullYear(),
          }),
        },
      },

      meta: {
        description: 'En attente d\'une demande de réduction épargne-pension',
      },
    },

    verificationVersements: {
      on: {
        VERSEMENTS_VERIFIES: {
          target: 'calculReduction',
          actions: assign({
            totalVersements: ({ event }) => event.total,
          }),
        },
      },

      meta: {
        description: 'Vérification des versements effectués durant l\'année fiscale',
      },
    },

    calculReduction: {
      on: {
        REDUCTION_CALCULEE: [
          {
            target: 'eligible',
            guard: ({ event }) => event.reduction.estEligible,
            actions: assign({
              reduction: ({ event }) => event.reduction,
            }),
          },
          {
            target: 'nonEligible',
            actions: assign({
              reduction: ({ event }) => event.reduction,
            }),
          },
        ],
      },

      meta: {
        description: 'Calcul de la réduction d\'impôt selon le plafond applicable',
      },
    },

    eligible: {
      on: {
        ATTESTATIONS_SOUMISES: {
          target: 'validationAttestations',
          actions: assign({
            attestationsVersement: ({ event }) => event.documents,
          }),
        },
      },

      meta: {
        description: 'Éligible à la réduction - soumission des attestations',
      },
    },

    nonEligible: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Non éligible à la réduction épargne-pension',
      },
    },

    validationAttestations: {
      on: {
        ATTESTATIONS_VALIDEES: {
          target: 'reductionApprouvee',
        },
        ATTESTATIONS_INVALIDES: {
          target: 'eligible',
        },
      },

      meta: {
        description: 'Validation des attestations de versement par l\'administration fiscale',
      },
    },

    reductionApprouvee: {
      on: {
        REDUCTION_APPLIQUEE: {
          target: 'active',
        },
      },

      meta: {
        description: 'Réduction d\'impôt approuvée pour l\'année fiscale',
      },
    },

    active: {
      on: {
        NOUVELLE_ANNEE: {
          target: 'inactif',
          actions: assign({
            anneeFiscale: ({ event }) => event.annee,
          }),
        },
      },

      meta: {
        description: 'Réduction active - renouvellement annuel requis',
      },
    },
  },
});

/**
 * Visualisation du flux de travail de la réduction épargne-pension:
 *
 * inactif
 *   → verificationVersements
 *   → calculReduction
 *       ↓ (si éligible)
 *     eligible → validationAttestations → reductionApprouvee
 *       ↓                                        ↓
 *     nonEligible                             active
 *                                               ↓
 *                                        (nouvelle année)
 *                                               ↓
 *                                            inactif
 */
