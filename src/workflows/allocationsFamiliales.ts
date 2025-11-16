/**
 * Machine XState pour les Allocations Familiales
 *
 * Cette machine d'état représente le flux de traitement des allocations familiales,
 * incluant l'enregistrement des enfants, calcul des montants et versements.
 */

import { createMachine, assign } from 'xstate';

interface Enfant {
  nom: string;
  dateNaissance: Date;
  numeroRegistreNational: string;
  handicape: boolean;
  enEtudes: boolean;
}

interface Famille {
  nomParent: string;
  numeroCompte: string;
  region: 'Flandre' | 'Wallonie' | 'Bruxelles';
  enfants: Enfant[];
}

interface CalculMontant {
  montantMensuel: number;
  supplements: number;
  montantTotal: number;
}

interface AllocationsFamilialesContext {
  famille: Famille | null;
  calculMontant: CalculMontant | null;
  enfantsEnregistres: boolean;
  verificationAnnuelle: boolean;
  changementsPendants: any[];
}

export const allocationsFamilialesMachine = createMachine({
  id: 'allocationsFamiliales',
  initial: 'inactif',

  schemas: {
    context: {} as AllocationsFamilialesContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; famille: Famille }
      | { type: 'ENFANTS_ENREGISTRES' }
      | { type: 'MONTANT_CALCULE'; calcul: CalculMontant }
      | { type: 'NAISSANCE_ENFANT'; enfant: Enfant }
      | { type: 'CHANGEMENT_SITUATION'; changements: any }
      | { type: 'VERIFICATION_ANNUELLE' }
      | { type: 'VERIFICATION_REUSSIE' }
      | { type: 'IRREGULARITE_DETECTEE' }
      | { type: 'ENFANT_MAJEUR'; enfantId: string }
      | { type: 'REINITIALISER' }
  },

  context: {
    famille: null,
    calculMontant: null,
    enfantsEnregistres: false,
    verificationAnnuelle: false,
    changementsPendants: [],
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'enregistrementEnfants',
          actions: assign({
            famille: ({ event }) => event.famille,
          }),
        },
      },

      meta: {
        description: 'En attente de la demande d\'allocations familiales',
      },
    },

    enregistrementEnfants: {
      on: {
        ENFANTS_ENREGISTRES: {
          target: 'calculMontant',
          actions: assign({
            enfantsEnregistres: true,
          }),
        },
      },

      meta: {
        description: 'Enregistrement des enfants dans le système des allocations familiales',
      },
    },

    calculMontant: {
      on: {
        MONTANT_CALCULE: {
          target: 'paiementActif',
          actions: assign({
            calculMontant: ({ event }) => event.calcul,
          }),
        },
      },

      meta: {
        description: 'Calcul du montant basé sur le nombre d\'enfants, âge, et suppléments',
      },
    },

    paiementActif: {
      on: {
        NAISSANCE_ENFANT: {
          target: 'recalculMontant',
          actions: assign({
            famille: ({ context, event }) => ({
              ...context.famille!,
              enfants: [...context.famille!.enfants, event.enfant],
            }),
          }),
        },
        CHANGEMENT_SITUATION: {
          target: 'recalculMontant',
          actions: assign({
            changementsPendants: ({ event }) => event.changements,
          }),
        },
        VERIFICATION_ANNUELLE: {
          target: 'verificationAnnuelleSituation',
        },
        ENFANT_MAJEUR: {
          target: 'verificationContinuite',
        },
      },

      meta: {
        description: 'Paiement mensuel actif des allocations familiales',
      },
    },

    recalculMontant: {
      on: {
        MONTANT_CALCULE: {
          target: 'paiementActif',
          actions: assign({
            calculMontant: ({ event }) => event.calcul,
            changementsPendants: [],
          }),
        },
      },

      meta: {
        description: 'Recalcul du montant suite à changement de situation',
      },
    },

    verificationAnnuelleSituation: {
      on: {
        VERIFICATION_REUSSIE: {
          target: 'paiementActif',
          actions: assign({
            verificationAnnuelle: true,
          }),
        },
        IRREGULARITE_DETECTEE: {
          target: 'suspensionTemporaire',
        },
      },

      meta: {
        description: 'Vérification annuelle de la situation familiale et scolaire',
      },
    },

    verificationContinuite: {
      on: {
        MONTANT_CALCULE: {
          target: 'paiementActif',
        },
        IRREGULARITE_DETECTEE: {
          target: 'suspensionTemporaire',
        },
      },

      meta: {
        description: 'Vérification de la continuité des droits pour enfant majeur (études, handicap)',
      },
    },

    suspensionTemporaire: {
      on: {
        VERIFICATION_REUSSIE: {
          target: 'paiementActif',
        },
      },

      meta: {
        description: 'Suspension temporaire en attente de justificatifs',
      },
    },
  },
});

/**
 * Visualisation du flux des allocations familiales:
 *
 * inactif
 *   → enregistrementEnfants
 *   → calculMontant
 *   → paiementActif
 *       ↓
 *   (changements de situation)
 *       ↓
 *   recalculMontant → paiementActif
 *       ↓
 *   (vérification annuelle)
 *       ↓
 *   verificationAnnuelleSituation
 *       ↓
 *   paiementActif ou suspensionTemporaire
 */
