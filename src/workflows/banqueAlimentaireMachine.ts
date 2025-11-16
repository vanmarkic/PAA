/**
 * XState machine for Banque Alimentaire (Food Bank) Workflow
 *
 * This state machine represents the workflow for accessing food bank services,
 * including registration, eligibility verification, and food parcel collection.
 */

import { createMachine, assign } from 'xstate';

interface MembreBanqueAlimentaire {
  nom: string;
  tailleMenuage: number;
  revenuMensuel: number;
  enfantsMineurs: number;
}

interface BanqueAlimentaireContext {
  membre: MembreBanqueAlimentaire | null;
  estInscrit: boolean;
  numeroMembre: string | null;
  dernierRetrait: Date | null;
  prochainRetrait: Date | null;
  quotaAtteint: boolean;
}

export const banqueAlimentaireMachine = createMachine({
  id: 'banqueAlimentaire',
  initial: 'attente',

  schemas: {
    context: {} as BanqueAlimentaireContext,
    events: {} as
      | { type: 'INSCRIRE_MEMBRE'; membre: MembreBanqueAlimentaire }
      | { type: 'INSCRIPTION_VALIDEE'; numeroMembre: string }
      | { type: 'INSCRIPTION_REFUSEE' }
      | { type: 'DEMANDER_COLIS' }
      | { type: 'VERIFIER_QUOTA' }
      | { type: 'QUOTA_OK'; prochainRetrait: Date }
      | { type: 'QUOTA_DEPASSE' }
      | { type: 'DISTRIBUER_COLIS'; date: Date }
      | { type: 'RENOUVELER_INSCRIPTION' }
      | { type: 'DESINSCRIRE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    membre: null,
    estInscrit: false,
    numeroMembre: null,
    dernierRetrait: null,
    prochainRetrait: null,
    quotaAtteint: false,
  },

  states: {
    attente: {
      on: {
        INSCRIRE_MEMBRE: {
          target: 'verificationInscription',
          actions: assign({
            membre: (_, event) => event.membre,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une nouvelle inscription à la banque alimentaire',
      },
    },

    verificationInscription: {
      on: {
        INSCRIPTION_VALIDEE: {
          target: 'membreActif',
          actions: assign({
            estInscrit: true,
            numeroMembre: (_, event) => event.numeroMembre,
          }),
        },
        INSCRIPTION_REFUSEE: {
          target: 'inscriptionRefusee',
          actions: assign({
            estInscrit: false,
          }),
        },
      },

      meta: {
        description: 'Vérification de l\'éligibilité et validation de l\'inscription',
      },
    },

    inscriptionRefusee: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Inscription refusée - critères non remplis',
      },
    },

    membreActif: {
      on: {
        DEMANDER_COLIS: {
          target: 'verificationQuota',
        },
        RENOUVELER_INSCRIPTION: {
          target: 'verificationInscription',
        },
        DESINSCRIRE: {
          target: 'desinscrit',
        },
      },

      meta: {
        description: 'Membre actif - peut demander des colis alimentaires',
      },
    },

    verificationQuota: {
      on: {
        QUOTA_OK: {
          target: 'preparationColis',
          actions: assign({
            quotaAtteint: false,
            prochainRetrait: (_, event) => event.prochainRetrait,
          }),
        },
        QUOTA_DEPASSE: {
          target: 'attenteProchainQuota',
          actions: assign({
            quotaAtteint: true,
          }),
        },
      },

      meta: {
        description: 'Vérification du quota mensuel (généralement 1 colis par mois)',
      },
    },

    attenteProchainQuota: {
      on: {
        VERIFIER_QUOTA: {
          target: 'verificationQuota',
        },
      },

      meta: {
        description: 'Quota atteint - attente du prochain mois pour nouveau retrait',
      },
    },

    preparationColis: {
      on: {
        DISTRIBUER_COLIS: {
          target: 'membreActif',
          actions: assign({
            dernierRetrait: (_, event) => event.date,
          }),
        },
      },

      meta: {
        description: 'Préparation et distribution du colis alimentaire',
      },
    },

    desinscrit: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Membre désinscrit de la banque alimentaire',
      },
    },
  },
});

/**
 * Visualization of the food bank workflow:
 *
 * attente
 *   → verificationInscription
 *       ↓ (si validée)
 *     membreActif
 *       ↓
 *     [demander colis]
 *       ↓
 *     verificationQuota
 *       ↓ (si quota ok)
 *     preparationColis
 *       ↓
 *     membreActif
 */
