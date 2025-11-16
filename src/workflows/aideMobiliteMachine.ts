/**
 * XState machine for Aide à la Mobilité (Mobility Assistance) Workflow
 *
 * This state machine represents the workflow for mobility assistance services,
 * including assessment, vehicle/transport subsidy, and ongoing support.
 */

import { createMachine, assign } from 'xstate';

interface BeneficiaireMobilite {
  nom: string;
  situationEmploi: string;
  distanceTravail: number;
  handicap: boolean;
}

interface AideMobilite {
  typeAide: string;
  montantMensuel: number;
  dureeEnMois: number;
}

interface AideMobiliteContext {
  beneficiaire: BeneficiaireMobilite | null;
  aide: AideMobilite | null;
  besoinEvalue: boolean;
  aideActive: boolean;
  mensualitesVersees: number;
}

export const aideMobiliteMachine = createMachine({
  id: 'aideMobilite',
  initial: 'attente',

  schema: {
    context: {} as AideMobiliteContext,
    events: {} as
      | { type: 'DEMANDER_AIDE'; beneficiaire: BeneficiaireMobilite }
      | { type: 'EVALUER_BESOIN' }
      | { type: 'BESOIN_VALIDE' }
      | { type: 'BESOIN_REFUSE' }
      | { type: 'ATTRIBUER_AIDE'; aide: AideMobilite }
      | { type: 'VERSER_MENSUALITE' }
      | { type: 'VERIFIER_ELIGIBILITE' }
      | { type: 'TOUJOURS_ELIGIBLE' }
      | { type: 'PLUS_ELIGIBLE' }
      | { type: 'AIDE_TERMINEE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    beneficiaire: null,
    aide: null,
    besoinEvalue: false,
    aideActive: false,
    mensualitesVersees: 0,
  },

  states: {
    attente: {
      on: {
        DEMANDER_AIDE: {
          target: 'evaluationBesoin',
          actions: assign({
            beneficiaire: (_, event) => event.beneficiaire,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une nouvelle demande d\'aide à la mobilité',
      },
    },

    evaluationBesoin: {
      on: {
        BESOIN_VALIDE: {
          target: 'attributionAide',
          actions: assign({
            besoinEvalue: true,
          }),
        },
        BESOIN_REFUSE: {
          target: 'demandeRefusee',
        },
      },

      meta: {
        description: 'Évaluation du besoin de mobilité (distance, transports disponibles)',
      },
    },

    demandeRefusee: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Demande refusée - distance insuffisante ou alternatives disponibles',
      },
    },

    attributionAide: {
      on: {
        ATTRIBUER_AIDE: {
          target: 'aideActive',
          actions: assign({
            aide: (_, event) => event.aide,
            aideActive: true,
          }),
        },
      },

      meta: {
        description: 'Attribution de l\'aide (abonnement transport, vélo, véhicule)',
      },
    },

    aideActive: {
      on: {
        VERSER_MENSUALITE: {
          target: 'aideActive',
          actions: assign({
            mensualitesVersees: (context) => context.mensualitesVersees + 1,
          }),
        },
        VERIFIER_ELIGIBILITE: {
          target: 'verificationEligibilite',
        },
        AIDE_TERMINEE: {
          target: 'aideTerminee',
        },
      },

      meta: {
        description: 'Aide active - versements mensuels pour la mobilité',
      },
    },

    verificationEligibilite: {
      on: {
        TOUJOURS_ELIGIBLE: {
          target: 'aideActive',
        },
        PLUS_ELIGIBLE: {
          target: 'aideSuspendue',
        },
      },

      meta: {
        description: 'Vérification périodique de l\'éligibilité (emploi toujours actif)',
      },
    },

    aideSuspendue: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Aide suspendue - changement de situation (perte emploi, déménagement)',
      },
    },

    aideTerminee: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Aide terminée - durée maximale atteinte',
      },
    },
  },
});

/**
 * Visualization of the mobility assistance workflow:
 *
 * attente
 *   → evaluationBesoin
 *       ↓ (si validé)
 *     attributionAide
 *       ↓
 *     aideActive
 *       ↓ [versements mensuels]
 *     aideActive
 *       ↓
 *     aideTerminee ✓
 */
