/**
 * XState machine for Restaurants Sociaux (Social Restaurants) Workflow
 *
 * This state machine represents the workflow for accessing social restaurant services,
 * including registration, pricing tier assignment, and meal service.
 */

import { createMachine, assign } from 'xstate';

interface ClientRestaurant {
  nom: string;
  revenuMensuel: number;
  situationSociale: string;
}

interface RestaurantsSociauxContext {
  client: ClientRestaurant | null;
  estInscrit: boolean;
  categoriePrice: string | null;
  prixRepas: number;
  carteActive: boolean;
  soldeCarte: number;
}

export const restaurantsSociauxMachine = createMachine({
  id: 'restaurantsSociaux',
  initial: 'attente',

  schemas: {
    context: {} as RestaurantsSociauxContext,
    events: {} as
      | { type: 'INSCRIRE_CLIENT'; client: ClientRestaurant }
      | { type: 'CATEGORIE_ASSIGNEE'; categorie: string; prix: number }
      | { type: 'EMETTRE_CARTE' }
      | { type: 'CARTE_EMISE' }
      | { type: 'RECHARGER_CARTE'; montant: number }
      | { type: 'CONSOMMER_REPAS'; prix: number }
      | { type: 'SOLDE_INSUFFISANT' }
      | { type: 'REVALUER_CATEGORIE' }
      | { type: 'DESACTIVER_CARTE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    client: null,
    estInscrit: false,
    categoriePrice: null,
    prixRepas: 0,
    carteActive: false,
    soldeCarte: 0,
  },

  states: {
    attente: {
      on: {
        INSCRIRE_CLIENT: {
          target: 'evaluationCategorie',
          actions: assign({
            client: (_, event) => event.client,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une nouvelle inscription au restaurant social',
      },
    },

    evaluationCategorie: {
      on: {
        CATEGORIE_ASSIGNEE: {
          target: 'emissionCarte',
          actions: assign({
            categoriePrice: (_, event) => event.categorie,
            prixRepas: (_, event) => event.prix,
            estInscrit: true,
          }),
        },
      },

      meta: {
        description: 'Évaluation sociale pour déterminer le prix du repas (0.50€ à 3€)',
      },
    },

    emissionCarte: {
      on: {
        CARTE_EMISE: {
          target: 'carteActive',
          actions: assign({
            carteActive: true,
          }),
        },
      },

      meta: {
        description: 'Émission de la carte de membre du restaurant social',
      },
    },

    carteActive: {
      on: {
        RECHARGER_CARTE: {
          target: 'rechargementCarte',
          actions: assign({
            soldeCarte: (context, event) => context.soldeCarte + event.montant,
          }),
        },
        CONSOMMER_REPAS: [
          {
            target: 'repasServi',
            guard: (context, event) => context.soldeCarte >= event.prix,
            actions: assign({
              soldeCarte: (context, event) => context.soldeCarte - event.prix,
            }),
          },
          {
            target: 'soldeInsuffisant',
          },
        ],
        REVALUER_CATEGORIE: {
          target: 'evaluationCategorie',
        },
        DESACTIVER_CARTE: {
          target: 'carteDesactivee',
        },
      },

      meta: {
        description: 'Carte active - accès aux repas au tarif social attribué',
      },
    },

    rechargementCarte: {
      on: {
        CARTE_EMISE: {
          target: 'carteActive',
        },
      },

      meta: {
        description: 'Rechargement du solde de la carte',
      },
    },

    repasServi: {
      on: {
        CONSOMMER_REPAS: [
          {
            target: 'repasServi',
            guard: (context, event) => context.soldeCarte >= event.prix,
            actions: assign({
              soldeCarte: (context, event) => context.soldeCarte - event.prix,
            }),
          },
          {
            target: 'soldeInsuffisant',
          },
        ],
        RECHARGER_CARTE: {
          target: 'carteActive',
          actions: assign({
            soldeCarte: (context, event) => context.soldeCarte + event.montant,
          }),
        },
      },

      meta: {
        description: 'Repas servi - déduction du solde',
      },
    },

    soldeInsuffisant: {
      on: {
        RECHARGER_CARTE: {
          target: 'carteActive',
          actions: assign({
            soldeCarte: (context, event) => context.soldeCarte + event.montant,
          }),
        },
      },

      meta: {
        description: 'Solde insuffisant - rechargement nécessaire',
      },
    },

    carteDesactivee: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Carte désactivée - fin d\'utilisation du restaurant social',
      },
    },
  },
});

/**
 * Visualization of the social restaurant workflow:
 *
 * attente
 *   → evaluationCategorie
 *   → emissionCarte
 *   → carteActive
 *       ↓
 *     [consommer repas]
 *       ↓
 *     repasServi → carteActive
 *       ↓ (si solde insuffisant)
 *     soldeInsuffisant → [recharger]
 */
