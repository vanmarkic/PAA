/**
 * XState machine for Repas Scolaires Gratuits (Free School Meals) Workflow
 *
 * This state machine represents the workflow for applying for free school meals,
 * including income verification, eligibility assessment, and meal voucher issuance.
 */

import { createMachine, assign } from 'xstate';

interface FamilleDemandeuse {
  nombreEnfants: number;
  revenuMensuel: number;
  situationFamiliale: string;
}

interface RepasScolairesContext {
  famille: FamilleDemandeuse | null;
  estEligible: boolean;
  montantAide: number;
  periode: { debut: Date; fin: Date } | null;
  justificatifsValides: boolean;
  erreurs: string[];
}

export const repasScolairesGratuitsMachine = createMachine({
  id: 'repasScolairesGratuits',
  initial: 'attente',

  schemas: {
    context: {} as RepasScolairesContext,
    events: {} as
      | { type: 'DEMANDER_AIDE'; famille: FamilleDemandeuse }
      | { type: 'SOUMETTRE_JUSTIFICATIFS' }
      | { type: 'JUSTIFICATIFS_VALIDES' }
      | { type: 'JUSTIFICATIFS_INVALIDES'; erreurs: string[] }
      | { type: 'ELIGIBILITE_VERIFIEE'; eligible: boolean; montant?: number }
      | { type: 'APPROUVER_AIDE'; periode: { debut: Date; fin: Date } }
      | { type: 'RENOUVELER_DEMANDE' }
      | { type: 'SUSPENDRE_AIDE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    famille: null,
    estEligible: false,
    montantAide: 0,
    periode: null,
    justificatifsValides: false,
    erreurs: [],
  },

  states: {
    attente: {
      on: {
        DEMANDER_AIDE: {
          target: 'verificationJustificatifs',
          actions: assign({
            famille: ({ event }) => event.famille,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une nouvelle demande de repas scolaires gratuits',
      },
    },

    verificationJustificatifs: {
      on: {
        JUSTIFICATIFS_VALIDES: {
          target: 'verificationEligibilite',
          actions: assign({
            justificatifsValides: true,
          }),
        },
        JUSTIFICATIFS_INVALIDES: {
          target: 'justificatifsManquants',
          actions: assign({
            justificatifsValides: false,
            erreurs: ({ event }) => event.erreurs,
          }),
        },
      },

      meta: {
        description: 'Vérification des justificatifs de revenus et composition familiale',
      },
    },

    justificatifsManquants: {
      on: {
        SOUMETTRE_JUSTIFICATIFS: {
          target: 'verificationJustificatifs',
        },
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Documents manquants ou invalides - demande de compléments',
      },
    },

    verificationEligibilite: {
      on: {
        ELIGIBILITE_VERIFIEE: [
          {
            target: 'aideApprouvee',
            guard: ({ event }) => event.eligible,
            actions: assign({
              estEligible: true,
              montantAide: ({ event }) => event.montant || 0,
            }),
          },
          {
            target: 'nonEligible',
            actions: assign({
              estEligible: false,
            }),
          },
        ],
      },

      meta: {
        description: 'Calcul de l\'éligibilité basé sur les revenus et le nombre d\'enfants',
      },
    },

    aideApprouvee: {
      on: {
        APPROUVER_AIDE: {
          target: 'aideActive',
          actions: assign({
            periode: ({ event }) => event.periode,
          }),
        },
      },

      meta: {
        description: 'Aide approuvée - préparation de l\'attribution',
      },
    },

    aideActive: {
      on: {
        RENOUVELER_DEMANDE: {
          target: 'verificationJustificatifs',
        },
        SUSPENDRE_AIDE: {
          target: 'suspendue',
        },
      },

      meta: {
        description: 'Aide active - repas gratuits distribués pendant la période scolaire',
      },
    },

    suspendue: {
      on: {
        RENOUVELER_DEMANDE: {
          target: 'verificationJustificatifs',
        },
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Aide suspendue - changement de situation ou non-conformité',
      },
    },

    nonEligible: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Famille non éligible - revenus trop élevés',
      },
    },
  },
});

/**
 * Visualization of the free school meals workflow:
 *
 * attente
 *   → verificationJustificatifs
 *       ↓ (si valides)
 *     verificationEligibilite
 *       ↓ (si eligible)
 *     aideApprouvee
 *       ↓
 *     aideActive → [renouvellement annuel]
 *       ↓
 *     verificationJustificatifs
 */
