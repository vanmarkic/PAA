/**
 * Machine d'état XState pour les Avantages de toute nature
 *
 * Cette machine d'état représente le flux de travail pour la déclaration et
 * l'imposition des avantages de toute nature, incluant la valorisation,
 * le calcul fiscal, et la déclaration.
 */

import { createMachine, assign } from 'xstate';

interface AvantageNature {
  id: string;
  type: 'voiture_societe' | 'logement' | 'telephone' | 'internet' | 'autres';
  description: string;
  valeurReelle: number;
  valeurForfaitaire: number;
}

interface BeneficiaireAvantage {
  id: string;
  nom: string;
  emploi: string;
  avantages: AvantageNature[];
}

interface ValorisationFiscale {
  montantTotal: number;
  montantImposable: number;
  cotisationsSociales: number;
  details: Record<string, number>;
}

interface AvantagesNatureContext {
  beneficiaire: BeneficiaireAvantage | null;
  valorisation: ValorisationFiscale | null;
  avantagesDeclarés: AvantageNature[];
  totalImposable: number;
  anneeFiscale: number;
}

export const avantagesNatureMachine = createMachine({
  id: 'avantagesNature',
  initial: 'inactif',

  schemas: {
    context: {} as AvantagesNatureContext,
    events: {} as
      | { type: 'DEMARRER_DECLARATION'; beneficiaire: BeneficiaireAvantage }
      | { type: 'AJOUTER_AVANTAGE'; avantage: AvantageNature }
      | { type: 'CALCULER_VALORISATION' }
      | { type: 'VALORISATION_CALCULEE'; valorisation: ValorisationFiscale }
      | { type: 'VALIDER_DECLARATION' }
      | { type: 'DECLARATION_APPROUVEE' }
      | { type: 'DECLARATION_REJETEE'; raison: string }
      | { type: 'CORRIGER_DECLARATION' }
      | { type: 'REINITIALISER' }
  },

  context: {
    beneficiaire: null,
    valorisation: null,
    avantagesDeclarés: [],
    totalImposable: 0,
    anneeFiscale: new Date().getFullYear(),
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DECLARATION: {
          target: 'declarationAvantages',
          actions: assign({
            beneficiaire: ({ event }) => event.beneficiaire,
            avantagesDeclarés: ({ event }) => event.beneficiaire.avantages,
          }),
        },
      },

      meta: {
        description: 'En attente du démarrage de la déclaration des avantages de toute nature',
      },
    },

    declarationAvantages: {
      on: {
        AJOUTER_AVANTAGE: {
          target: 'declarationAvantages',
          actions: assign({
            avantagesDeclarés: ({ context, event }) => [...context.avantagesDeclarés, event.avantage],
          }),
        },
        CALCULER_VALORISATION: {
          target: 'valorisation',
        },
      },

      meta: {
        description: 'Déclaration des avantages de toute nature reçus',
      },
    },

    valorisation: {
      on: {
        VALORISATION_CALCULEE: {
          target: 'verificationValorisatioin',
          actions: assign({
            valorisation: ({ event }) => event.valorisation,
            totalImposable: ({ event }) => event.valorisation.montantImposable,
          }),
        },
      },

      meta: {
        description: 'Calcul de la valorisation fiscale selon les barèmes légaux',
      },
    },

    verificationValorisatioin: {
      on: {
        VALIDER_DECLARATION: {
          target: 'validationAdministration',
        },
        CORRIGER_DECLARATION: {
          target: 'declarationAvantages',
        },
      },

      meta: {
        description: 'Vérification de la valorisation avant soumission',
      },
    },

    validationAdministration: {
      on: {
        DECLARATION_APPROUVEE: {
          target: 'approuve',
        },
        DECLARATION_REJETEE: {
          target: 'declarationAvantages',
        },
      },

      meta: {
        description: 'Validation de la déclaration par l\'administration fiscale',
      },
    },

    approuve: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Déclaration approuvée - montant intégré à la base imposable',
      },
    },
  },
});

/**
 * Visualisation du flux de travail des avantages de toute nature:
 *
 * inactif
 *   → declarationAvantages → valorisation
 *          ↑ (ajouter)            ↓
 *          └──────────────  verificationValorisatioin
 *                                 ↓
 *                          validationAdministration
 *                              ↓       ↓
 *                        (approuvé) (rejeté)
 *                              ↓       ↓
 *                          approuve  declarationAvantages
 */
