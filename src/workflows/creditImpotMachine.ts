/**
 * Machine d'état XState pour le Crédit d'impôt
 *
 * Cette machine d'état représente le flux de travail pour demander et gérer
 * un crédit d'impôt, incluant la vérification d'éligibilité, le calcul du montant,
 * et le suivi du remboursement.
 */

import { createMachine, assign } from 'xstate';

interface Contribuable {
  id: string;
  nom: string;
  revenus: number;
  depensesEligibles: number;
  situationFamiliale: 'celibataire' | 'marie' | 'cohabitant';
}

interface ResultatEligibilite {
  estEligible: boolean;
  montantCredit: number;
  motifRefus?: string;
}

interface CreditImpotContext {
  contribuable: Contribuable | null;
  resultatEligibilite: ResultatEligibilite | null;
  documentsJustificatifs: string[];
  montantFinal: number;
  tentativesVerification: number;
}

export const creditImpotMachine = createMachine({
  id: 'creditImpot',
  initial: 'inactif',

  schema: {
    context: {} as CreditImpotContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; contribuable: Contribuable }
      | { type: 'ELIGIBILITE_VERIFIEE'; resultat: ResultatEligibilite }
      | { type: 'ACCEPTER_CREDIT' }
      | { type: 'REFUSER_CREDIT' }
      | { type: 'DOCUMENTS_SOUMIS'; documents: string[] }
      | { type: 'DOCUMENTS_VALIDES' }
      | { type: 'DOCUMENTS_INVALIDES'; raison: string }
      | { type: 'CREDIT_APPROUVE'; montant: number }
      | { type: 'CREDIT_VERSE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    contribuable: null,
    resultatEligibilite: null,
    documentsJustificatifs: [],
    montantFinal: 0,
    tentativesVerification: 0,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'verificationEligibilite',
          actions: assign({
            contribuable: (_, event) => event.contribuable,
            tentativesVerification: 0,
          }),
        },
      },

      meta: {
        description: 'En attente du démarrage d\'une demande de crédit d\'impôt',
      },
    },

    verificationEligibilite: {
      on: {
        ELIGIBILITE_VERIFIEE: [
          {
            target: 'eligible',
            cond: (_, event) => event.resultat.estEligible,
            actions: assign({
              resultatEligibilite: (_, event) => event.resultat,
            }),
          },
          {
            target: 'nonEligible',
            actions: assign({
              resultatEligibilite: (_, event) => event.resultat,
            }),
          },
        ],
      },

      meta: {
        description: 'Vérification des critères d\'éligibilité (revenus, dépenses, situation)',
      },
    },

    eligible: {
      on: {
        ACCEPTER_CREDIT: {
          target: 'soumissionDocuments',
        },
        REFUSER_CREDIT: {
          target: 'refuse',
        },
      },

      meta: {
        description: 'Contribuable éligible au crédit d\'impôt - en attente de décision',
      },
    },

    nonEligible: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Contribuable non éligible - afficher le motif de refus',
      },
    },

    refuse: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Crédit d\'impôt refusé par le contribuable',
      },
    },

    soumissionDocuments: {
      on: {
        DOCUMENTS_SOUMIS: {
          target: 'validationDocuments',
          actions: assign({
            documentsJustificatifs: (_, event) => event.documents,
          }),
        },
      },

      meta: {
        description: 'Soumission des documents justificatifs requis',
      },
    },

    validationDocuments: {
      on: {
        DOCUMENTS_VALIDES: {
          target: 'calculMontant',
        },
        DOCUMENTS_INVALIDES: {
          target: 'soumissionDocuments',
          actions: assign({
            tentativesVerification: (context) => context.tentativesVerification + 1,
          }),
        },
      },

      meta: {
        description: 'Validation des documents justificatifs soumis',
      },
    },

    calculMontant: {
      on: {
        CREDIT_APPROUVE: {
          target: 'approuve',
          actions: assign({
            montantFinal: (_, event) => event.montant,
          }),
        },
      },

      meta: {
        description: 'Calcul du montant final du crédit d\'impôt',
      },
    },

    approuve: {
      on: {
        CREDIT_VERSE: {
          target: 'verse',
        },
      },

      meta: {
        description: 'Crédit d\'impôt approuvé - en attente de versement',
      },
    },

    verse: {
      type: 'final',

      meta: {
        description: 'Crédit d\'impôt versé avec succès',
      },
    },
  },
});

/**
 * Visualisation du flux de travail du crédit d'impôt:
 *
 * inactif
 *   → verificationEligibilite
 *       ↓ (si éligible)
 *     eligible → [accepter] → soumissionDocuments
 *       ↓ (si non éligible)         ↓
 *     nonEligible              validationDocuments
 *                                   ↓
 *                              calculMontant
 *                                   ↓
 *                              approuve → verse ✓
 */
