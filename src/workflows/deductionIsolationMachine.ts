/**
 * Machine d'état XState pour la Déduction isolation
 *
 * Cette machine d'état représente le flux de travail pour demander la déduction
 * fiscale pour travaux d'isolation, incluant la vérification des travaux, le calcul
 * de la déduction, et la validation.
 */

import { createMachine, assign } from 'xstate';

interface ProprietaireHabitation {
  id: string;
  nom: string;
  revenus: number;
  adresse: string;
  typeHabitation: 'principale' | 'secondaire';
}

interface TravauxIsolation {
  id: string;
  type: 'toiture' | 'murs' | 'sol' | 'fenetres' | 'portes';
  surface: number;
  montantDepense: number;
  coefficientIsolation: number;
  entrepreneurAgree: boolean;
  dateRealisation: Date;
}

interface DeductionIsolation {
  estEligible: boolean;
  montantDeductible: number;
  tauxDeduction: number;
  plafondAtteint: boolean;
  motifRefus?: string;
}

interface DeductionIsolationContext {
  proprietaire: ProprietaireHabitation | null;
  travaux: TravauxIsolation[];
  deduction: DeductionIsolation | null;
  certificatsPEB: string[];
  factures: string[];
  totalDeduction: number;
}

export const deductionIsolationMachine = createMachine({
  id: 'deductionIsolation',
  initial: 'inactif',

  schema: {
    context: {} as DeductionIsolationContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; proprietaire: ProprietaireHabitation }
      | { type: 'AJOUTER_TRAVAUX'; travaux: TravauxIsolation }
      | { type: 'VERIFIER_NORMES' }
      | { type: 'NORMES_VERIFIEES'; travauxConformes: TravauxIsolation[] }
      | { type: 'CALCULER_DEDUCTION' }
      | { type: 'DEDUCTION_CALCULEE'; deduction: DeductionIsolation }
      | { type: 'SOUMETTRE_DOCUMENTS'; factures: string[]; certificats: string[] }
      | { type: 'DOCUMENTS_VALIDES' }
      | { type: 'DOCUMENTS_INVALIDES' }
      | { type: 'DEDUCTION_APPROUVEE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    proprietaire: null,
    travaux: [],
    deduction: null,
    certificatsPEB: [],
    factures: [],
    totalDeduction: 0,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'saisieTravaux',
          actions: assign({
            proprietaire: (_, event) => event.proprietaire,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une demande de déduction pour travaux d\'isolation',
      },
    },

    saisieTravaux: {
      on: {
        AJOUTER_TRAVAUX: {
          target: 'saisieTravaux',
          actions: assign({
            travaux: (context, event) => [...context.travaux, event.travaux],
          }),
        },
        VERIFIER_NORMES: {
          target: 'verificationNormes',
        },
      },

      meta: {
        description: 'Saisie des travaux d\'isolation réalisés',
      },
    },

    verificationNormes: {
      on: {
        NORMES_VERIFIEES: {
          target: 'calculDeduction',
          actions: assign({
            travaux: (_, event) => event.travauxConformes,
          }),
        },
      },

      meta: {
        description: 'Vérification de la conformité aux normes d\'isolation (coefficient R)',
      },
    },

    calculDeduction: {
      on: {
        DEDUCTION_CALCULEE: [
          {
            target: 'eligible',
            cond: (_, event) => event.deduction.estEligible,
            actions: assign({
              deduction: (_, event) => event.deduction,
              totalDeduction: (_, event) => event.deduction.montantDeductible,
            }),
          },
          {
            target: 'nonEligible',
            actions: assign({
              deduction: (_, event) => event.deduction,
            }),
          },
        ],
      },

      meta: {
        description: 'Calcul de la déduction selon le type d\'isolation et les plafonds',
      },
    },

    eligible: {
      on: {
        SOUMETTRE_DOCUMENTS: {
          target: 'validationDocuments',
          actions: assign({
            factures: (_, event) => event.factures,
            certificatsPEB: (_, event) => event.certificats,
          }),
        },
      },

      meta: {
        description: 'Éligible à la déduction - soumission des documents requis',
      },
    },

    nonEligible: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Non éligible à la déduction pour travaux d\'isolation',
      },
    },

    validationDocuments: {
      on: {
        DOCUMENTS_VALIDES: {
          target: 'deductionApprouvee',
        },
        DOCUMENTS_INVALIDES: {
          target: 'eligible',
        },
      },

      meta: {
        description: 'Validation des factures et certificats PEB',
      },
    },

    deductionApprouvee: {
      on: {
        DEDUCTION_APPROUVEE: {
          target: 'approuve',
        },
      },

      meta: {
        description: 'Déduction pour travaux d\'isolation approuvée',
      },
    },

    approuve: {
      type: 'final',

      meta: {
        description: 'Déduction appliquée avec succès',
      },
    },
  },
});

/**
 * Visualisation du flux de travail de la déduction isolation:
 *
 * inactif
 *   → saisieTravaux → verificationNormes
 *       ↑ (ajouter)        ↓
 *       └──────────   calculDeduction
 *                          ↓ (si éligible)
 *                      eligible
 *                          ↓
 *                  validationDocuments
 *                          ↓
 *                  deductionApprouvee
 *                          ↓
 *                      approuve ✓
 */
