/**
 * Machine d'état XState pour la TVA réduite
 *
 * Cette machine d'état représente le flux de travail pour l'application de la TVA
 * réduite, incluant la vérification d'éligibilité des produits/services, le calcul
 * du taux applicable, et la validation.
 */

import { createMachine, assign } from 'xstate';

interface TransactionTVA {
  id: string;
  produits: ProduitTVA[];
  montantHT: number;
  montantTTC: number;
  client: string;
  date: Date;
}

interface ProduitTVA {
  nom: string;
  categorie: 'alimentation' | 'renovation' | 'energie' | 'services_proximite' | 'autres';
  montant: number;
  tauxNormal: number;
  tauxReduit?: number;
}

interface CalculTVA {
  montantHTTotal: number;
  montantTVANormale: number;
  montantTVAReduite: number;
  montantTTCTotal: number;
  economieRealisee: number;
}

interface TvaReduiteContext {
  transaction: TransactionTVA | null;
  produitsEligibles: ProduitTVA[];
  produitsNonEligibles: ProduitTVA[];
  calcul: CalculTVA | null;
  justificatifs: string[];
}

export const tvaReduiteMachine = createMachine({
  id: 'tvaReduite',
  initial: 'inactif',

  schema: {
    context: {} as TvaReduiteContext,
    events: {} as
      | { type: 'DEMARRER_TRANSACTION'; transaction: TransactionTVA }
      | { type: 'VERIFIER_ELIGIBILITE' }
      | { type: 'ELIGIBILITE_DETERMINEE'; eligibles: ProduitTVA[]; nonEligibles: ProduitTVA[] }
      | { type: 'CALCULER_TVA' }
      | { type: 'TVA_CALCULEE'; calcul: CalculTVA }
      | { type: 'SOUMETTRE_JUSTIFICATIFS'; documents: string[] }
      | { type: 'JUSTIFICATIFS_VALIDES' }
      | { type: 'JUSTIFICATIFS_INVALIDES'; raison: string }
      | { type: 'APPLIQUER_TVA_REDUITE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    transaction: null,
    produitsEligibles: [],
    produitsNonEligibles: [],
    calcul: null,
    justificatifs: [],
  },

  states: {
    inactif: {
      on: {
        DEMARRER_TRANSACTION: {
          target: 'verificationEligibilite',
          actions: assign({
            transaction: (_, event) => event.transaction,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une transaction pour application de la TVA réduite',
      },
    },

    verificationEligibilite: {
      on: {
        ELIGIBILITE_DETERMINEE: {
          target: 'eligibiliteVerifiee',
          actions: assign({
            produitsEligibles: (_, event) => event.eligibles,
            produitsNonEligibles: (_, event) => event.nonEligibles,
          }),
        },
      },

      meta: {
        description: 'Vérification de l\'éligibilité des produits/services à la TVA réduite',
      },
    },

    eligibiliteVerifiee: {
      on: {
        CALCULER_TVA: {
          target: 'calculTVA',
        },
      },

      meta: {
        description: 'Éligibilité vérifiée - séparation des produits éligibles et non éligibles',
      },
    },

    calculTVA: {
      on: {
        TVA_CALCULEE: {
          target: 'tvaCalculee',
          actions: assign({
            calcul: (_, event) => event.calcul,
          }),
        },
      },

      meta: {
        description: 'Calcul de la TVA avec application du taux réduit pour produits éligibles',
      },
    },

    tvaCalculee: {
      on: {
        SOUMETTRE_JUSTIFICATIFS: {
          target: 'validationJustificatifs',
          actions: assign({
            justificatifs: (_, event) => event.documents,
          }),
        },
      },

      meta: {
        description: 'TVA calculée - soumission des justificatifs pour validation',
      },
    },

    validationJustificatifs: {
      on: {
        JUSTIFICATIFS_VALIDES: {
          target: 'applicationTVA',
        },
        JUSTIFICATIFS_INVALIDES: {
          target: 'tvaCalculee',
        },
      },

      meta: {
        description: 'Validation des justificatifs d\'éligibilité à la TVA réduite',
      },
    },

    applicationTVA: {
      on: {
        APPLIQUER_TVA_REDUITE: {
          target: 'termine',
        },
      },

      meta: {
        description: 'Application de la TVA réduite validée',
      },
    },

    termine: {
      type: 'final',

      meta: {
        description: 'Transaction complétée avec TVA réduite appliquée',
      },
    },
  },
});

/**
 * Visualisation du flux de travail de la TVA réduite:
 *
 * inactif
 *   → verificationEligibilite
 *   → eligibiliteVerifiee
 *   → calculTVA
 *   → tvaCalculee
 *   → validationJustificatifs
 *       ↓ (si valides)
 *     applicationTVA → termine ✓
 *       ↓ (si invalides)
 *     tvaCalculee
 */
