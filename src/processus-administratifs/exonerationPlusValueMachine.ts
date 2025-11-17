/**
 * Machine d'état XState pour l'Exonération plus-value
 *
 * Cette machine d'état représente le flux de travail pour demander l'exonération
 * de la plus-value sur la vente d'un bien immobilier ou mobilier, incluant la
 * vérification des conditions et le calcul de l'exonération.
 */

import { createMachine, assign } from 'xstate';

interface Vendeur {
  id: string;
  nom: string;
  typeVendeur: 'personne_physique' | 'personne_morale';
}

interface BienVendu {
  id: string;
  type: 'immobilier' | 'actions' | 'obligations' | 'crypto';
  description: string;
  prixAchat: number;
  dateAchat: Date;
  prixVente: number;
  dateVente: Date;
  fraisAcquisition: number;
  fraisVente: number;
}

interface PlusValue {
  montantBrut: number;
  montantNet: number;
  fraisDeductibles: number;
}

interface ExonerationPlusValue {
  estExonere: boolean;
  montantExoneration: number;
  montantImposable: number;
  motifExoneration?: string;
  motifRefus?: string;
}

interface ExonerationPlusValueContext {
  vendeur: Vendeur | null;
  bien: BienVendu | null;
  plusValue: PlusValue | null;
  exoneration: ExonerationPlusValue | null;
  documentsTransaction: string[];
  dureeDetention: number;
}

export const exonerationPlusValueMachine = createMachine({
  id: 'exonerationPlusValue',
  initial: 'inactif',

  schemas: {
    context: {} as ExonerationPlusValueContext,
    events: {} as
      | { type: 'DEMARRER_DECLARATION'; vendeur: Vendeur; bien: BienVendu }
      | { type: 'CALCULER_PLUS_VALUE' }
      | { type: 'PLUS_VALUE_CALCULEE'; plusValue: PlusValue; duree: number }
      | { type: 'VERIFIER_EXONERATION' }
      | { type: 'EXONERATION_VERIFIEE'; exoneration: ExonerationPlusValue }
      | { type: 'SOUMETTRE_DOCUMENTS'; documents: string[] }
      | { type: 'DOCUMENTS_VALIDES' }
      | { type: 'DOCUMENTS_INVALIDES' }
      | { type: 'EXONERATION_ACCORDEE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    vendeur: null,
    bien: null,
    plusValue: null,
    exoneration: null,
    documentsTransaction: [],
    dureeDetention: 0,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DECLARATION: {
          target: 'calculPlusValue',
          actions: assign({
            vendeur: ({ event }) => event.vendeur,
            bien: ({ event }) => event.bien,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une déclaration de plus-value',
      },
    },

    calculPlusValue: {
      on: {
        PLUS_VALUE_CALCULEE: {
          target: 'verificationExoneration',
          actions: assign({
            plusValue: ({ event }) => event.plusValue,
            dureeDetention: ({ event }) => event.duree,
          }),
        },
      },

      meta: {
        description: 'Calcul de la plus-value (prix vente - prix achat - frais)',
      },
    },

    verificationExoneration: {
      on: {
        EXONERATION_VERIFIEE: [
          {
            target: 'exonere',
            guard: ({ event }) => event.exoneration.estExonere,
            actions: assign({
              exoneration: ({ event }) => event.exoneration,
            }),
          },
          {
            target: 'imposable',
            actions: assign({
              exoneration: ({ event }) => event.exoneration,
            }),
          },
        ],
      },

      meta: {
        description: 'Vérification des conditions d\'exonération (durée détention, usage, etc.)',
      },
    },

    exonere: {
      on: {
        SOUMETTRE_DOCUMENTS: {
          target: 'validationDocuments',
          actions: assign({
            documentsTransaction: ({ event }) => event.documents,
          }),
        },
      },

      meta: {
        description: 'Exonération applicable - soumission des justificatifs',
      },
    },

    imposable: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Plus-value imposable - pas d\'exonération possible',
      },
    },

    validationDocuments: {
      on: {
        DOCUMENTS_VALIDES: {
          target: 'exonerationAccordee',
        },
        DOCUMENTS_INVALIDES: {
          target: 'exonere',
        },
      },

      meta: {
        description: 'Validation des documents de transaction (acte achat/vente)',
      },
    },

    exonerationAccordee: {
      on: {
        EXONERATION_ACCORDEE: {
          target: 'approuve',
        },
      },

      meta: {
        description: 'Exonération de plus-value accordée',
      },
    },

    approuve: {
      type: 'final',

      meta: {
        description: 'Exonération de plus-value approuvée et appliquée',
      },
    },
  },
});

/**
 * Visualisation du flux de travail de l'exonération plus-value:
 *
 * inactif
 *   → calculPlusValue
 *   → verificationExoneration
 *       ↓ (si exonéré)
 *     exonere → validationDocuments → exonerationAccordee
 *       ↓                                    ↓
 *     imposable                          approuve ✓
 */
