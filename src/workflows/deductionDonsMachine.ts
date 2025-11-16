/**
 * Machine d'état XState pour la Déduction dons
 *
 * Cette machine d'état représente le flux de travail pour demander la déduction
 * fiscale pour dons à des organismes reconnus, incluant la vérification des
 * organismes, le calcul de la déduction, et la validation.
 */

import { createMachine, assign } from 'xstate';

interface Donateur {
  id: string;
  nom: string;
  revenus: number;
}

interface Don {
  id: string;
  organismeId: string;
  organismeNom: string;
  organismeAgree: boolean;
  montant: number;
  dateDon: Date;
  typeDon: 'argent' | 'nature';
}

interface DeductionDons {
  estEligible: boolean;
  montantDeductible: number;
  tauxDeduction: number;
  plafondAtteint: boolean;
  donsNonDeductibles: number;
  motifRefus?: string;
}

interface DeductionDonsContext {
  donateur: Donateur | null;
  dons: Don[];
  deduction: DeductionDons | null;
  attestationsDons: string[];
  totalDons: number;
  anneeFiscale: number;
}

export const deductionDonsMachine = createMachine({
  id: 'deductionDons',
  initial: 'inactif',

  schema: {
    context: {} as DeductionDonsContext,
    events: {} as
      | { type: 'DEMARRER_DECLARATION'; donateur: Donateur }
      | { type: 'AJOUTER_DON'; don: Don }
      | { type: 'VERIFIER_ORGANISMES' }
      | { type: 'ORGANISMES_VERIFIES'; donsValides: Don[] }
      | { type: 'CALCULER_DEDUCTION' }
      | { type: 'DEDUCTION_CALCULEE'; deduction: DeductionDons }
      | { type: 'SOUMETTRE_ATTESTATIONS'; documents: string[] }
      | { type: 'ATTESTATIONS_VALIDEES' }
      | { type: 'ATTESTATIONS_INVALIDES' }
      | { type: 'DEDUCTION_APPROUVEE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    donateur: null,
    dons: [],
    deduction: null,
    attestationsDons: [],
    totalDons: 0,
    anneeFiscale: new Date().getFullYear(),
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DECLARATION: {
          target: 'saisieDons',
          actions: assign({
            donateur: (_, event) => event.donateur,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une déclaration de dons',
      },
    },

    saisieDons: {
      on: {
        AJOUTER_DON: {
          target: 'saisieDons',
          actions: assign({
            dons: (context, event) => [...context.dons, event.don],
            totalDons: (context, event) => context.totalDons + event.don.montant,
          }),
        },
        VERIFIER_ORGANISMES: {
          target: 'verificationOrganismes',
        },
      },

      meta: {
        description: 'Saisie des dons effectués durant l\'année fiscale',
      },
    },

    verificationOrganismes: {
      on: {
        ORGANISMES_VERIFIES: {
          target: 'calculDeduction',
          actions: assign({
            dons: (_, event) => event.donsValides,
          }),
        },
      },

      meta: {
        description: 'Vérification de l\'agrément des organismes bénéficiaires',
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
        description: 'Calcul de la déduction selon le type d\'organisme et les plafonds',
      },
    },

    eligible: {
      on: {
        SOUMETTRE_ATTESTATIONS: {
          target: 'validationAttestations',
          actions: assign({
            attestationsDons: (_, event) => event.documents,
          }),
        },
      },

      meta: {
        description: 'Éligible à la déduction - soumission des attestations fiscales',
      },
    },

    nonEligible: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Non éligible à la déduction pour dons',
      },
    },

    validationAttestations: {
      on: {
        ATTESTATIONS_VALIDEES: {
          target: 'deductionApprouvee',
        },
        ATTESTATIONS_INVALIDES: {
          target: 'eligible',
        },
      },

      meta: {
        description: 'Validation des attestations fiscales délivrées par les organismes',
      },
    },

    deductionApprouvee: {
      on: {
        DEDUCTION_APPROUVEE: {
          target: 'approuve',
        },
      },

      meta: {
        description: 'Déduction pour dons approuvée',
      },
    },

    approuve: {
      type: 'final',

      meta: {
        description: 'Déduction pour dons approuvée et appliquée',
      },
    },
  },
});

/**
 * Visualisation du flux de travail de la déduction dons:
 *
 * inactif
 *   → saisieDons → verificationOrganismes
 *       ↑ (ajouter)       ↓
 *       └──────────   calculDeduction
 *                          ↓ (si éligible)
 *                      eligible
 *                          ↓
 *                  validationAttestations
 *                          ↓
 *                  deductionApprouvee
 *                          ↓
 *                      approuve ✓
 */
