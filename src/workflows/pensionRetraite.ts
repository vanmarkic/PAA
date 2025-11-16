/**
 * Machine XState pour la Pension de Retraite
 *
 * Cette machine d'état représente le flux de traitement de la pension de retraite,
 * incluant le calcul de la carrière, détermination du montant et versement.
 */

import { createMachine, assign } from 'xstate';

interface Pensionnaire {
  nom: string;
  dateNaissance: Date;
  numeroRegistreNational: string;
  anneesCarriere: number;
  salaireMoyenCarriere: number;
  situationFamiliale: string;
  regimes: string[];
}

interface CalculCarriere {
  anneesRegimeSalarie: number;
  anneesRegimeIndependant: number;
  anneesRegimeFonctionnaire: number;
  anneesTotal: number;
  periodesAssimilees: number;
}

interface MontantPension {
  montantBrut: number;
  retenueSociale: number;
  prelevementImpot: number;
  montantNet: number;
}

interface PensionRetraiteContext {
  pensionnaire: Pensionnaire | null;
  calculCarriere: CalculCarriere | null;
  montantPension: MontantPension | null;
  ageRetraite: number;
  demandeAnticipee: boolean;
}

export const pensionRetraiteMachine = createMachine({
  id: 'pensionRetraite',
  initial: 'inactif',

  schemas: {
    context: {} as PensionRetraiteContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; pensionnaire: Pensionnaire }
      | { type: 'DEMANDE_ANTICIPEE' }
      | { type: 'CARRIERE_CALCULEE'; carriere: CalculCarriere }
      | { type: 'MONTANT_CALCULE'; montant: MontantPension }
      | { type: 'PENSION_APPROUVEE' }
      | { type: 'AGE_INSUFFISANT' }
      | { type: 'CUMUL_REVENUS'; revenus: number }
      | { type: 'REGULARISATION_NECESSAIRE' }
      | { type: 'REGULARISATION_COMPLETE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    pensionnaire: null,
    calculCarriere: null,
    montantPension: null,
    ageRetraite: 65,
    demandeAnticipee: false,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'verificationAge',
          actions: assign({
            pensionnaire: (_, event) => event.pensionnaire,
          }),
        },
      },

      meta: {
        description: 'En attente de demande de pension de retraite',
      },
    },

    verificationAge: {
      on: {
        DEMANDE_ANTICIPEE: {
          target: 'calculCarriere',
          actions: assign({
            demandeAnticipee: true,
          }),
        },
        CARRIERE_CALCULEE: {
          target: 'calculCarriere',
        },
        AGE_INSUFFISANT: {
          target: 'demandeRejetee',
        },
      },

      meta: {
        description: 'Vérification de l\'âge légal de la retraite (65 ans ou retraite anticipée)',
      },
    },

    calculCarriere: {
      on: {
        CARRIERE_CALCULEE: {
          target: 'calculMontant',
          actions: assign({
            calculCarriere: (_, event) => event.carriere,
          }),
        },
      },

      meta: {
        description: 'Calcul de la carrière: années travaillées, régimes multiples, périodes assimilées',
      },
    },

    calculMontant: {
      on: {
        MONTANT_CALCULE: {
          target: 'verificationDroits',
          actions: assign({
            montantPension: (_, event) => event.montant,
          }),
        },
      },

      meta: {
        description: 'Calcul du montant selon la carrière, salaires et situation familiale',
      },
    },

    verificationDroits: {
      on: {
        PENSION_APPROUVEE: {
          target: 'pensionActive',
        },
        REGULARISATION_NECESSAIRE: {
          target: 'regularisation',
        },
      },

      meta: {
        description: 'Vérification finale des droits et validation du dossier',
      },
    },

    regularisation: {
      on: {
        REGULARISATION_COMPLETE: {
          target: 'calculMontant',
        },
      },

      meta: {
        description: 'Régularisation de périodes manquantes ou incomplètes',
      },
    },

    pensionActive: {
      on: {
        CUMUL_REVENUS: {
          target: 'verificationCumul',
        },
      },

      meta: {
        description: 'Pension versée mensuellement - suivi des cumuls éventuels',
      },
    },

    verificationCumul: {
      on: {
        MONTANT_CALCULE: {
          target: 'pensionActive',
          actions: assign({
            montantPension: (_, event) => event.montant,
          }),
        },
      },

      meta: {
        description: 'Vérification et ajustement en cas de cumul pension-revenus professionnels',
      },
    },

    demandeRejetee: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Demande rejetée - âge ou conditions de carrière non remplies',
      },
    },
  },
});

/**
 * Visualisation du flux de la pension de retraite:
 *
 * inactif
 *   → verificationAge
 *       ↓ (âge OK)
 *     calculCarriere
 *       ↓
 *     calculMontant
 *       ↓
 *     verificationDroits
 *       ↓ (approuvé)
 *     pensionActive
 *       ↓ (cumul revenus)
 *     verificationCumul → pensionActive
 *       ↓ (régularisation)
 *     regularisation → calculMontant
 */
