/**
 * Machine XState pour la Pension de Survie
 *
 * Cette machine d'état représente le flux de traitement de la pension de survie,
 * incluant la vérification du décès, calcul des droits et versement.
 */

import { createMachine, assign } from 'xstate';

interface Survivant {
  nom: string;
  age: number;
  numeroRegistreNational: string;
  dateDecesConjoint: Date;
  enfantsACharge: number;
  revenus: number;
  situationFamiliale: string;
}

interface DefuntInfo {
  numeroRegistreNational: string;
  anneesCarriere: number;
  montantPensionAcquise: number;
  regimes: string[];
}

interface MontantPensionSurvie {
  tauxApplicable: number; // 80% de la pension du défunt
  montantBase: number;
  supplementEnfants: number;
  montantTotal: number;
}

interface PensionSurvieContext {
  survivant: Survivant | null;
  defuntInfo: DefuntInfo | null;
  montantPension: MontantPensionSurvie | null;
  conditionsRemplies: boolean;
  periodeTransition: boolean;
}

export const pensionSurvieMachine = createMachine({
  id: 'pensionSurvie',
  initial: 'inactif',

  schemas: {
    context: {} as PensionSurvieContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; survivant: Survivant; defunt: DefuntInfo }
      | { type: 'DECES_VERIFIE' }
      | { type: 'CONDITIONS_VERIFIEES'; remplies: boolean }
      | { type: 'MONTANT_CALCULE'; montant: MontantPensionSurvie }
      | { type: 'REMARIAGE' }
      | { type: 'COHABITATION_LEGALE' }
      | { type: 'CHANGEMENT_REVENUS'; nouveauxRevenus: number }
      | { type: 'ENFANT_INDEPENDANT' }
      | { type: 'PENSION_APPROUVEE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    survivant: null,
    defuntInfo: null,
    montantPension: null,
    conditionsRemplies: false,
    periodeTransition: true,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'verificationDeces',
          actions: assign({
            survivant: ({ event }: { event: any }) => event.survivant,
            defuntInfo: ({ event }: { event: any }) => event.defunt,
          }),
        },
      },

      meta: {
        description: 'En attente de demande de pension de survie',
      },
    },

    verificationDeces: {
      on: {
        DECES_VERIFIE: {
          target: 'verificationConditions',
        },
      },

      meta: {
        description: 'Vérification de l\'acte de décès et lien conjugal',
      },
    },

    verificationConditions: {
      on: {
        CONDITIONS_VERIFIEES: [
          {
            target: 'calculMontant',
            guard: ({ event }: { event: any }) => event.remplies,
            actions: assign({
              conditionsRemplies: true,
            }),
          },
          {
            target: 'demandeRejetee',
            actions: assign({
              conditionsRemplies: false,
            }),
          },
        ],
      },

      meta: {
        description: 'Vérification âge, durée mariage, enfants à charge, revenus',
      },
    },

    calculMontant: {
      on: {
        MONTANT_CALCULE: {
          target: 'periodeTransition',
          actions: assign({
            montantPension: ({ event }: { event: any }) => event.montant,
          }),
        },
      },

      meta: {
        description: 'Calcul du montant: 80% de la pension du défunt + suppléments',
      },
    },

    periodeTransition: {
      on: {
        PENSION_APPROUVEE: {
          target: 'pensionActive',
          actions: assign({
            periodeTransition: false,
          }),
        },
      },

      meta: {
        description: 'Période de transition de 12 mois avec allocation transitoire',
      },
    },

    pensionActive: {
      on: {
        REMARIAGE: {
          target: 'pensionSuspendue',
        },
        COHABITATION_LEGALE: {
          target: 'pensionSuspendue',
        },
        CHANGEMENT_REVENUS: {
          target: 'recalculMontant',
          actions: assign({
            survivant: ({ context, event }: { context: any; event: any }) => ({
              ...((context.survivant as any) || {}),
              revenus: event.nouveauxRevenus,
            }),
          }),
        },
        ENFANT_INDEPENDANT: {
          target: 'recalculMontant',
        },
      },

      meta: {
        description: 'Pension de survie versée mensuellement',
      },
    },

    recalculMontant: {
      on: {
        MONTANT_CALCULE: {
          target: 'pensionActive',
          actions: assign({
            montantPension: ({ event }) => event.montant,
          }),
        },
      },

      meta: {
        description: 'Recalcul suite à changement de revenus ou situation familiale',
      },
    },

    pensionSuspendue: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Pension suspendue suite à remariage ou cohabitation légale',
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
 * Visualisation du flux de la pension de survie:
 *
 * inactif
 *   → verificationDeces
 *   → verificationConditions
 *       ↓ (conditions OK)
 *     calculMontant
 *       ↓
 *     periodeTransition (12 mois)
 *       ↓
 *     pensionActive
 *       ↓ (changement situation)
 *     recalculMontant → pensionActive
 *       ↓ (remariage/cohabitation)
 *     pensionSuspendue
 */
