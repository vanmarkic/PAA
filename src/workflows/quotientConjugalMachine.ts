/**
 * Machine d'état XState pour le Quotient conjugal
 *
 * Cette machine d'état représente le flux de travail pour appliquer le quotient
 * conjugal, permettant le transfert de revenus entre conjoints pour optimiser
 * la fiscalité du couple.
 */

import { createMachine, assign } from 'xstate';

interface Conjoint {
  id: string;
  nom: string;
  revenus: number;
  revenusProfessionnels: number;
  autrésRevenus: number;
}

interface Couple {
  conjoint1: Conjoint;
  conjoint2: Conjoint;
  statutMarital: 'marie' | 'cohabitant_legal';
  anneeDeclaration: number;
}

interface QuotientConjugal {
  estApplicable: boolean;
  montantTransferable: number;
  pourcentageTransfert: number;
  economieImpot: number;
  nouveauRevenusConjoint1: number;
  nouveauRevenusConjoint2: number;
  motifRefus?: string;
}

interface QuotientConjugalContext {
  couple: Couple | null;
  quotient: QuotientConjugal | null;
  documentsIdentite: string[];
  declarationValidee: boolean;
}

export const quotientConjugalMachine = createMachine({
  id: 'quotientConjugal',
  initial: 'inactif',

  schemas: {
    context: {} as QuotientConjugalContext,
    events: {} as
      | { type: 'DEMARRER_CALCUL'; couple: Couple }
      | { type: 'VERIFIER_ELIGIBILITE' }
      | { type: 'ELIGIBILITE_VERIFIEE'; quotient: QuotientConjugal }
      | { type: 'ACCEPTER_QUOTIENT' }
      | { type: 'REFUSER_QUOTIENT' }
      | { type: 'SOUMETTRE_DOCUMENTS'; documents: string[] }
      | { type: 'DOCUMENTS_VALIDES' }
      | { type: 'DOCUMENTS_INVALIDES' }
      | { type: 'QUOTIENT_APPLIQUE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    couple: null,
    quotient: null,
    documentsIdentite: [],
    declarationValidee: false,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_CALCUL: {
          target: 'verificationEligibilite',
          actions: assign({
            couple: (_, event) => event.couple,
          }),
        },
      },

      meta: {
        description: 'En attente du démarrage du calcul du quotient conjugal',
      },
    },

    verificationEligibilite: {
      on: {
        ELIGIBILITE_VERIFIEE: [
          {
            target: 'applicable',
            guard: (_, event) => event.quotient.estApplicable,
            actions: assign({
              quotient: (_, event) => event.quotient,
            }),
          },
          {
            target: 'nonApplicable',
            actions: assign({
              quotient: (_, event) => event.quotient,
            }),
          },
        ],
      },

      meta: {
        description: 'Vérification de l\'applicabilité du quotient conjugal (revenus, statut)',
      },
    },

    applicable: {
      on: {
        ACCEPTER_QUOTIENT: {
          target: 'soumissionDocuments',
        },
        REFUSER_QUOTIENT: {
          target: 'refuse',
        },
      },

      meta: {
        description: 'Quotient conjugal applicable - optimisation fiscale possible',
      },
    },

    nonApplicable: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Quotient conjugal non applicable pour ce couple',
      },
    },

    refuse: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Quotient conjugal refusé par le couple',
      },
    },

    soumissionDocuments: {
      on: {
        SOUMETTRE_DOCUMENTS: {
          target: 'validationDocuments',
          actions: assign({
            documentsIdentite: (_, event) => event.documents,
          }),
        },
      },

      meta: {
        description: 'Soumission des documents d\'identité et de mariage/cohabitation',
      },
    },

    validationDocuments: {
      on: {
        DOCUMENTS_VALIDES: {
          target: 'applicationQuotient',
          actions: assign({
            declarationValidee: true,
          }),
        },
        DOCUMENTS_INVALIDES: {
          target: 'soumissionDocuments',
        },
      },

      meta: {
        description: 'Validation des documents de statut conjugal',
      },
    },

    applicationQuotient: {
      on: {
        QUOTIENT_APPLIQUE: {
          target: 'applique',
        },
      },

      meta: {
        description: 'Application du quotient conjugal à la déclaration fiscale',
      },
    },

    applique: {
      type: 'final',

      meta: {
        description: 'Quotient conjugal appliqué avec succès',
      },
    },
  },
});

/**
 * Visualisation du flux de travail du quotient conjugal:
 *
 * inactif
 *   → verificationEligibilite
 *       ↓ (si applicable)
 *     applicable → soumissionDocuments → validationDocuments
 *       ↓                                       ↓
 *     nonApplicable                      applicationQuotient
 *                                               ↓
 *                                          applique ✓
 */
