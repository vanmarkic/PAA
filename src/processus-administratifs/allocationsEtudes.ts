/**
 * Machine XState pour les Allocations d'Études
 *
 * Cette machine d'état représente le flux de traitement des allocations d'études,
 * incluant la vérification des revenus et situation familiale.
 */

import { createMachine, assign } from 'xstate';

interface Etudiant {
  nom: string;
  numeroRegistreNational: string;
  age: number;
  niveauEtudes: string;
  etablissement: string;
  residenceParents: boolean;
}

interface SituationFamiliale {
  revenusParents: number;
  nombreEnfantsACharge: number;
  situationSpeciale: boolean;
  orphelin: boolean;
  handicap: boolean;
}

interface MontantAllocation {
  montantBase: number;
  supplementResidence: number;
  supplementEtudes: number;
  montantTotal: number;
}

interface AllocationsEtudesContext {
  etudiant: Etudiant | null;
  situationFamiliale: SituationFamiliale | null;
  montantAllocation: MontantAllocation | null;
  attestationInscription: boolean;
  attestationRevenus: boolean;
}

export const allocationsEtudesMachine = createMachine({
  id: 'allocationsEtudes',
  initial: 'inactif',

  schemas: {
    context: {} as AllocationsEtudesContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; etudiant: Etudiant; situation: SituationFamiliale }
      | { type: 'DOCUMENTS_FOURNIS' }
      | { type: 'REVENUS_VERIFIES'; eligible: boolean }
      | { type: 'MONTANT_CALCULE'; montant: MontantAllocation }
      | { type: 'ALLOCATION_APPROUVEE' }
      | { type: 'ANNEE_VALIDEE' }
      | { type: 'ANNEE_ECHOUEE' }
      | { type: 'RENOUVELLEMENT_DEMANDE' }
      | { type: 'FIN_ETUDES' }
      | { type: 'REINITIALISER' }
  },

  context: {
    etudiant: null,
    situationFamiliale: null,
    montantAllocation: null,
    attestationInscription: false,
    attestationRevenus: false,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'verificationDocuments',
          actions: assign({
            etudiant: ({ event }) => event.etudiant,
            situationFamiliale: ({ event }) => event.situation,
          }),
        },
      },

      meta: {
        description: 'En attente de demande d\'allocations d\'études',
      },
    },

    verificationDocuments: {
      on: {
        DOCUMENTS_FOURNIS: {
          target: 'verificationRevenus',
          actions: assign({
            attestationInscription: true,
            attestationRevenus: true,
          }),
        },
      },

      meta: {
        description: 'Vérification attestation inscription et avertissement-extrait de rôle',
      },
    },

    verificationRevenus: {
      on: {
        REVENUS_VERIFIES: [
          {
            target: 'calculMontant',
            guard: ({ event }) => event.eligible,
          },
          {
            target: 'demandeRejetee',
          },
        ],
      },

      meta: {
        description: 'Vérification que les revenus sont sous les plafonds légaux',
      },
    },

    calculMontant: {
      on: {
        MONTANT_CALCULE: {
          target: 'allocationApprouvee',
          actions: assign({
            montantAllocation: ({ event }) => event.montant,
          }),
        },
      },

      meta: {
        description: 'Calcul basé sur revenus, nombre d\'enfants, niveau d\'études',
      },
    },

    allocationApprouvee: {
      on: {
        ALLOCATION_APPROUVEE: {
          target: 'allocationActive',
        },
      },

      meta: {
        description: 'Allocation approuvée - paiement en attente',
      },
    },

    allocationActive: {
      on: {
        ANNEE_VALIDEE: {
          target: 'renouvellementAnnuel',
        },
        ANNEE_ECHOUEE: {
          target: 'verificationProgression',
        },
        FIN_ETUDES: {
          target: 'allocationTerminee',
        },
      },

      meta: {
        description: 'Allocation versée pendant l\'année scolaire',
      },
    },

    verificationProgression: {
      on: {
        RENOUVELLEMENT_DEMANDE: {
          target: 'verificationDocuments',
        },
      },

      meta: {
        description: 'Vérification de la progression des études',
      },
    },

    renouvellementAnnuel: {
      on: {
        RENOUVELLEMENT_DEMANDE: {
          target: 'verificationDocuments',
        },
        FIN_ETUDES: {
          target: 'allocationTerminee',
        },
      },

      meta: {
        description: 'Renouvellement pour l\'année suivante',
      },
    },

    allocationTerminee: {
      type: 'final',

      meta: {
        description: 'Fin des études - allocation terminée',
      },
    },

    demandeRejetee: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Demande rejetée - revenus trop élevés',
      },
    },
  },
});

/**
 * Visualisation du flux des allocations d'études:
 *
 * inactif
 *   → verificationDocuments
 *   → verificationRevenus
 *       ↓ (revenus OK)
 *     calculMontant
 *       ↓
 *     allocationApprouvee
 *       ↓
 *     allocationActive
 *       ↓ (année validée)
 *     renouvellementAnnuel → verificationDocuments
 *       ↓ (fin études)
 *     allocationTerminee ✓
 */
