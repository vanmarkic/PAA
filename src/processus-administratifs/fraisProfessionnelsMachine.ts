/**
 * Machine d'état XState pour les Frais professionnels
 *
 * Cette machine d'état représente le flux de travail pour déclarer les frais
 * professionnels, choisir entre déduction forfaitaire ou frais réels, et calculer
 * la déduction fiscale applicable.
 */

import { createMachine, assign } from 'xstate';

interface Travailleur {
  id: string;
  nom: string;
  revenus: number;
  typeContrat: 'salarie' | 'independant' | 'fonction_publique';
  distanceDomicileTravail: number;
}

interface FraisProfessionnels {
  id: string;
  type: 'transport' | 'repas' | 'vetements' | 'formation' | 'materiel' | 'autres';
  montant: number;
  description: string;
  date: Date;
}

interface DeductionFrais {
  modeForfaitaire: number;
  modeReels: number;
  modeOptimal: 'forfaitaire' | 'reels';
  economie: number;
}

interface FraisProfessionnelsContext {
  travailleur: Travailleur | null;
  frais: FraisProfessionnels[];
  deduction: DeductionFrais | null;
  modeChoisi: 'forfaitaire' | 'reels' | null;
  justificatifs: string[];
  totalFrais: number;
}

export const fraisProfessionnelsMachine = createMachine({
  id: 'fraisProfessionnels',
  initial: 'inactif',

  schemas: {
    context: {} as FraisProfessionnelsContext,
    events: {} as
      | { type: 'DEMARRER_DECLARATION'; travailleur: Travailleur }
      | { type: 'AJOUTER_FRAIS'; frais: FraisProfessionnels }
      | { type: 'CALCULER_OPTIONS' }
      | { type: 'OPTIONS_CALCULEES'; deduction: DeductionFrais }
      | { type: 'CHOISIR_FORFAITAIRE' }
      | { type: 'CHOISIR_REELS' }
      | { type: 'SOUMETTRE_JUSTIFICATIFS'; documents: string[] }
      | { type: 'JUSTIFICATIFS_VALIDES' }
      | { type: 'JUSTIFICATIFS_INVALIDES' }
      | { type: 'DEDUCTION_APPLIQUEE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    travailleur: null,
    frais: [] as FraisProfessionnels[],
    deduction: null,
    modeChoisi: null as 'forfaitaire' | 'reels' | null,
    justificatifs: [] as string[],
    totalFrais: 0,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DECLARATION: {
          target: 'saisieFrais',
          actions: assign({
            travailleur: ({ event }) => event.travailleur,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une déclaration de frais professionnels',
      },
    },

    saisieFrais: {
      on: {
        AJOUTER_FRAIS: {
          target: 'saisieFrais',
          actions: assign({
            frais: ({ context, event }) => [...context.frais, event.frais],
            totalFrais: ({ context, event }) => context.totalFrais + event.frais.montant,
          }),
        },
        CALCULER_OPTIONS: {
          target: 'calculOptions',
        },
      },

      meta: {
        description: 'Saisie des frais professionnels réels encourus',
      },
    },

    calculOptions: {
      on: {
        OPTIONS_CALCULEES: {
          target: 'choixMode',
          actions: assign({
            deduction: ({ event }) => event.deduction,
          }),
        },
      },

      meta: {
        description: 'Calcul et comparaison des déductions forfaitaire vs frais réels',
      },
    },

    choixMode: {
      on: {
        CHOISIR_FORFAITAIRE: {
          target: 'forfaitaireChoisi',
          actions: assign({
            modeChoisi: () => 'forfaitaire',
          }),
        },
        CHOISIR_REELS: {
          target: 'reelsChoisi',
          actions: assign({
            modeChoisi: () => 'reels',
          }),
        },
      },

      meta: {
        description: 'Choix entre déduction forfaitaire ou frais réels',
      },
    },

    forfaitaireChoisi: {
      on: {
        DEDUCTION_APPLIQUEE: {
          target: 'termine',
        },
      },

      meta: {
        description: 'Déduction forfaitaire choisie - aucun justificatif requis',
      },
    },

    reelsChoisi: {
      on: {
        SOUMETTRE_JUSTIFICATIFS: {
          target: 'validationJustificatifs',
          actions: assign({
            justificatifs: ({ event }) => event.documents,
          }),
        },
      },

      meta: {
        description: 'Frais réels choisis - soumission des justificatifs requise',
      },
    },

    validationJustificatifs: {
      on: {
        JUSTIFICATIFS_VALIDES: {
          target: 'justificatifsValides',
        },
        JUSTIFICATIFS_INVALIDES: {
          target: 'reelsChoisi',
        },
      },

      meta: {
        description: 'Validation des justificatifs de frais professionnels',
      },
    },

    justificatifsValides: {
      on: {
        DEDUCTION_APPLIQUEE: {
          target: 'termine',
        },
      },

      meta: {
        description: 'Justificatifs validés - déduction pour frais réels approuvée',
      },
    },

    termine: {
      type: 'final',

      meta: {
        description: 'Frais professionnels traités - déduction appliquée',
      },
    },
  },
});

/**
 * Visualisation du flux de travail des frais professionnels:
 *
 * inactif
 *   → saisieFrais → calculOptions → choixMode
 *       ↑ (ajouter)       ↓              ↓
 *       └──────────      (calcul)   (forfaitaire) ou (réels)
 *                                        ↓              ↓
 *                              forfaitaireChoisi   reelsChoisi
 *                                        ↓              ↓
 *                                     termine    validationJustificatifs
 *                                                       ↓
 *                                              justificatifsValides
 *                                                       ↓
 *                                                   termine ✓
 */
