/**
 * Machine d'état XState pour la Déduction investissement
 *
 * Cette machine d'état représente le flux de travail pour demander une déduction
 * fiscale pour investissement, incluant la vérification du type d'investissement,
 * le calcul de la déduction, et le suivi pluriannuel.
 */

import { createMachine, assign } from 'xstate';

interface Investisseur {
  id: string;
  nom: string;
  typeEntreprise: 'PME' | 'grande_entreprise' | 'independant';
  montantInvestissement: number;
  typeInvestissement: 'materiel' | 'immobilier' | 'innovation' | 'environnemental';
}

interface ResultatInvestissement {
  estEligible: boolean;
  montantDeductible: number;
  tauxDeduction: number;
  periodeAmortissement: number;
  motifRefus?: string;
}

interface DeductionInvestissementContext {
  investisseur: Investisseur | null;
  resultat: ResultatInvestissement | null;
  documentsInvestissement: string[];
  montantDeductAnnuellement: number;
  anneesRestantes: number;
}

export const deductionInvestissementMachine = createMachine({
  id: 'deductionInvestissement',
  initial: 'inactif',

  schemas: {
    context: {} as DeductionInvestissementContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; investisseur: Investisseur }
      | { type: 'INVESTISSEMENT_VERIFIE'; resultat: ResultatInvestissement }
      | { type: 'ACCEPTER_DEDUCTION' }
      | { type: 'REFUSER_DEDUCTION' }
      | { type: 'DOCUMENTS_SOUMIS'; documents: string[] }
      | { type: 'DOCUMENTS_APPROUVES' }
      | { type: 'DOCUMENTS_REJETES'; raison: string }
      | { type: 'ANNEE_ECOULEE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    investisseur: null,
    resultat: null,
    documentsInvestissement: [],
    montantDeductAnnuellement: 0,
    anneesRestantes: 0,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'verificationInvestissement',
          actions: assign({
            investisseur: ({ event }) => event.investisseur,
          }),
        },
      },

      meta: {
        description: 'En attente du démarrage d\'une demande de déduction investissement',
      },
    },

    verificationInvestissement: {
      on: {
        INVESTISSEMENT_VERIFIE: [
          {
            target: 'eligible',
            guard: ({ event }) => event.resultat.estEligible,
            actions: assign({
              resultat: ({ event }) => event.resultat,
              anneesRestantes: ({ event }) => event.resultat.periodeAmortissement,
            }),
          },
          {
            target: 'nonEligible',
            actions: assign({
              resultat: ({ event }) => event.resultat,
            }),
          },
        ],
      },

      meta: {
        description: 'Vérification du type d\'investissement et des critères d\'éligibilité',
      },
    },

    eligible: {
      on: {
        ACCEPTER_DEDUCTION: {
          target: 'soumissionDocuments',
        },
        REFUSER_DEDUCTION: {
          target: 'refuse',
        },
      },

      meta: {
        description: 'Investissement éligible à la déduction fiscale',
      },
    },

    nonEligible: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Investissement non éligible à la déduction',
      },
    },

    refuse: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Déduction refusée par l\'investisseur',
      },
    },

    soumissionDocuments: {
      on: {
        DOCUMENTS_SOUMIS: {
          target: 'validationDocuments',
          actions: assign({
            documentsInvestissement: ({ event }) => event.documents,
          }),
        },
      },

      meta: {
        description: 'Soumission des factures et preuves d\'investissement',
      },
    },

    validationDocuments: {
      on: {
        DOCUMENTS_APPROUVES: {
          target: 'deductionActive',
          actions: assign({ montantDeductAnnuellement: ({ context }) =>
              (context.resultat?.montantDeductible || 0) / (context.anneesRestantes || 1),
          }),
        },
        DOCUMENTS_REJETES: {
          target: 'soumissionDocuments',
        },
      },

      meta: {
        description: 'Validation des documents d\'investissement',
      },
    },

    deductionActive: {
      on: {
        ANNEE_ECOULEE: [
          {
            target: 'deductionActive',
            guard: (context) => context.anneesRestantes > 1,
            actions: assign({ anneesRestantes: ({ context }) => context.anneesRestantes - 1,
            }),
          },
          {
            target: 'termine',
          },
        ],
      },

      meta: {
        description: 'Déduction active - amortissement sur plusieurs années',
      },
    },

    termine: {
      type: 'final',

      meta: {
        description: 'Période d\'amortissement terminée',
      },
    },
  },
});

/**
 * Visualisation du flux de travail de la déduction investissement:
 *
 * inactif
 *   → verificationInvestissement
 *       ↓ (si éligible)
 *     eligible → soumissionDocuments → validationDocuments
 *       ↓                                     ↓
 *     nonEligible                      deductionActive
 *                                            ↓ (année écoulée)
 *                                      deductionActive ou termine
 */
