/**
 * Machine XState pour l'Exonération du Revenu Cadastral
 *
 * Cette machine d'état représente le flux de traitement de l'exonération du revenu cadastral
 * (précompte immobilier) pour les ménages à faibles revenus.
 */

import { createMachine, assign } from 'xstate';

interface Proprietaire {
  nom: string;
  numeroRegistreNational: string;
  revenus: number;
  personnesACharge: number;
  situationFamiliale: string;
}

interface BienImmobilier {
  adresse: string;
  revenuCadastral: number;
  typeHabitation: 'principale' | 'secondaire';
  anneeConstruction: number;
  surfaceHabitable: number;
}

interface CalculExoneration {
  revenuCadastralTotal: number;
  montantExoneration: number;
  montantPrecompteAvant: number;
  montantPrecompteApres: number;
  tauxReduction: number;
}

interface RevenuCadastralExonerationContext {
  proprietaire: Proprietaire | null;
  bienImmobilier: BienImmobilier | null;
  calculExoneration: CalculExoneration | null;
  exonerationPartielle: boolean;
  exonerationComplete: boolean;
}

export const revenuCadastralExonerationMachine = createMachine({
  id: 'revenuCadastralExoneration',
  initial: 'inactif',

  schema: {
    context: {} as RevenuCadastralExonerationContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; proprietaire: Proprietaire; bien: BienImmobilier }
      | { type: 'HABITATION_PRINCIPALE_VERIFIEE'; confirme: boolean }
      | { type: 'REVENUS_VERIFIES'; eligible: boolean }
      | { type: 'EXONERATION_CALCULEE'; calcul: CalculExoneration }
      | { type: 'EXONERATION_ACCORDEE' }
      | { type: 'RENOUVELLEMENT_ANNUEL' }
      | { type: 'CHANGEMENT_REVENUS'; nouveauxRevenus: number }
      | { type: 'VENTE_BIEN' }
      | { type: 'REINITIALISER' }
  },

  context: {
    proprietaire: null,
    bienImmobilier: null,
    calculExoneration: null,
    exonerationPartielle: false,
    exonerationComplete: false,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'verificationHabitationPrincipale',
          actions: assign({
            proprietaire: (_, event) => event.proprietaire,
            bienImmobilier: (_, event) => event.bien,
          }),
        },
      },

      meta: {
        description: 'En attente de demande d\'exonération du revenu cadastral',
      },
    },

    verificationHabitationPrincipale: {
      on: {
        HABITATION_PRINCIPALE_VERIFIEE: [
          {
            target: 'verificationRevenus',
            cond: (_, event) => event.confirme,
          },
          {
            target: 'demandeRejetee',
          },
        ],
      },

      meta: {
        description: 'Vérification que le bien est l\'habitation principale',
      },
    },

    verificationRevenus: {
      on: {
        REVENUS_VERIFIES: [
          {
            target: 'calculExoneration',
            cond: (_, event) => event.eligible,
          },
          {
            target: 'demandeRejetee',
          },
        ],
      },

      meta: {
        description: 'Vérification que les revenus sont sous les plafonds régionaux',
      },
    },

    calculExoneration: {
      on: {
        EXONERATION_CALCULEE: {
          target: 'exonerationApprouvee',
          actions: assign({
            calculExoneration: (_, event) => event.calcul,
            exonerationPartielle: (_, event) => event.calcul.tauxReduction < 100,
            exonerationComplete: (_, event) => event.calcul.tauxReduction === 100,
          }),
        },
      },

      meta: {
        description: 'Calcul de l\'exonération selon revenus et revenu cadastral',
      },
    },

    exonerationApprouvee: {
      on: {
        EXONERATION_ACCORDEE: {
          target: 'exonerationActive',
        },
      },

      meta: {
        description: 'Exonération approuvée par l\'administration régionale',
      },
    },

    exonerationActive: {
      on: {
        RENOUVELLEMENT_ANNUEL: {
          target: 'verificationRenouvellement',
        },
        CHANGEMENT_REVENUS: {
          target: 'recalculExoneration',
          actions: assign({
            proprietaire: (context, event) => ({
              ...context.proprietaire!,
              revenus: event.nouveauxRevenus,
            }),
          }),
        },
        VENTE_BIEN: {
          target: 'exonerationTerminee',
        },
      },

      meta: {
        description: 'Exonération active - réduction ou exemption du précompte immobilier',
      },
    },

    verificationRenouvellement: {
      on: {
        REVENUS_VERIFIES: [
          {
            target: 'calculExoneration',
            cond: (_, event) => event.eligible,
          },
          {
            target: 'exonerationSuspendue',
          },
        ],
      },

      meta: {
        description: 'Vérification annuelle des revenus pour renouvellement',
      },
    },

    recalculExoneration: {
      on: {
        EXONERATION_CALCULEE: {
          target: 'exonerationActive',
          actions: assign({
            calculExoneration: (_, event) => event.calcul,
            exonerationPartielle: (_, event) => event.calcul.tauxReduction < 100,
            exonerationComplete: (_, event) => event.calcul.tauxReduction === 100,
          }),
        },
      },

      meta: {
        description: 'Recalcul suite à changement de revenus',
      },
    },

    exonerationSuspendue: {
      on: {
        REVENUS_VERIFIES: {
          target: 'calculExoneration',
          cond: (_, event) => event.eligible,
        },
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Exonération suspendue - revenus dépassent le plafond',
      },
    },

    exonerationTerminee: {
      type: 'final',

      meta: {
        description: 'Exonération terminée - vente du bien ou autre raison',
      },
    },

    demandeRejetee: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Demande rejetée - conditions non remplies',
      },
    },
  },
});

/**
 * Visualisation du flux de l'exonération du revenu cadastral:
 *
 * inactif
 *   → verificationHabitationPrincipale
 *   → verificationRevenus
 *   → calculExoneration
 *   → exonerationApprouvee
 *   → exonerationActive
 *       ↓ (renouvellement annuel)
 *     verificationRenouvellement → calculExoneration
 *       ↓ (changement revenus)
 *     recalculExoneration → exonerationActive
 *       ↓ (vente)
 *     exonerationTerminee ✓
 */
