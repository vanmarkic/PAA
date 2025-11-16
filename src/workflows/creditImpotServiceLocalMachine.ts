/**
 * Machine d'état XState pour le Crédit d'impôt service local
 *
 * Cette machine d'état représente le flux de travail pour demander un crédit d'impôt
 * pour services locaux (aide ménagère, jardinage, etc.), incluant la vérification
 * des prestataires agréés et le calcul du crédit.
 */

import { createMachine, assign } from 'xstate';

interface Beneficiaire {
  id: string;
  nom: string;
  age: number;
  revenus: number;
  adresse: string;
}

interface ServiceLocal {
  id: string;
  type: 'aide_menagere' | 'jardinage' | 'petit_entretien' | 'assistance_personnes';
  prestataireId: string;
  prestataireAgree: boolean;
  montantDepense: number;
  dateService: Date;
  heuresPresees: number;
}

interface CreditServiceLocal {
  estEligible: boolean;
  montantCredit: number;
  pourcentageCredit: number;
  plafondAtteint: boolean;
  montantNonEligible: number;
  motifRefus?: string;
}

interface CreditImpotServiceLocalContext {
  beneficiaire: Beneficiaire | null;
  services: ServiceLocal[];
  credit: CreditServiceLocal | null;
  attestationsPrestataires: string[];
  totalDepenses: number;
  totalCredit: number;
}

export const creditImpotServiceLocalMachine = createMachine({
  id: 'creditImpotServiceLocal',
  initial: 'inactif',

  schemas: {
    context: {} as CreditImpotServiceLocalContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; beneficiaire: Beneficiaire }
      | { type: 'AJOUTER_SERVICE'; service: ServiceLocal }
      | { type: 'VERIFIER_PRESTATAIRES' }
      | { type: 'PRESTATAIRES_VERIFIES'; servicesValides: ServiceLocal[] }
      | { type: 'CALCULER_CREDIT' }
      | { type: 'CREDIT_CALCULE'; credit: CreditServiceLocal }
      | { type: 'SOUMETTRE_ATTESTATIONS'; documents: string[] }
      | { type: 'ATTESTATIONS_VALIDEES' }
      | { type: 'ATTESTATIONS_INVALIDES' }
      | { type: 'CREDIT_ACCORDE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    beneficiaire: null,
    services: [],
    credit: null,
    attestationsPrestataires: [],
    totalDepenses: 0,
    totalCredit: 0,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'saisieServices',
          actions: assign({
            beneficiaire: (_, event) => event.beneficiaire,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une demande de crédit d\'impôt pour services locaux',
      },
    },

    saisieServices: {
      on: {
        AJOUTER_SERVICE: {
          target: 'saisieServices',
          actions: assign({
            services: (context, event) => [...context.services, event.service],
            totalDepenses: (context, event) => context.totalDepenses + event.service.montantDepense,
          }),
        },
        VERIFIER_PRESTATAIRES: {
          target: 'verificationPrestataires',
        },
      },

      meta: {
        description: 'Saisie des services locaux utilisés durant l\'année',
      },
    },

    verificationPrestataires: {
      on: {
        PRESTATAIRES_VERIFIES: {
          target: 'calculCredit',
          actions: assign({
            services: (_, event) => event.servicesValides,
          }),
        },
      },

      meta: {
        description: 'Vérification de l\'agrément des prestataires de services',
      },
    },

    calculCredit: {
      on: {
        CREDIT_CALCULE: [
          {
            target: 'eligible',
            guard: (_, event) => event.credit.estEligible,
            actions: assign({
              credit: (_, event) => event.credit,
              totalCredit: (_, event) => event.credit.montantCredit,
            }),
          },
          {
            target: 'nonEligible',
            actions: assign({
              credit: (_, event) => event.credit,
            }),
          },
        ],
      },

      meta: {
        description: 'Calcul du crédit d\'impôt selon le type de service et les plafonds',
      },
    },

    eligible: {
      on: {
        SOUMETTRE_ATTESTATIONS: {
          target: 'validationAttestations',
          actions: assign({
            attestationsPrestataires: (_, event) => event.documents,
          }),
        },
      },

      meta: {
        description: 'Éligible au crédit d\'impôt - soumission des attestations',
      },
    },

    nonEligible: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Non éligible au crédit d\'impôt pour services locaux',
      },
    },

    validationAttestations: {
      on: {
        ATTESTATIONS_VALIDEES: {
          target: 'creditAccorde',
        },
        ATTESTATIONS_INVALIDES: {
          target: 'eligible',
        },
      },

      meta: {
        description: 'Validation des attestations des prestataires agréés',
      },
    },

    creditAccorde: {
      on: {
        CREDIT_ACCORDE: {
          target: 'termine',
        },
      },

      meta: {
        description: 'Crédit d\'impôt pour services locaux accordé',
      },
    },

    termine: {
      type: 'final',

      meta: {
        description: 'Crédit d\'impôt traité avec succès',
      },
    },
  },
});

/**
 * Visualisation du flux de travail du crédit d'impôt service local:
 *
 * inactif
 *   → saisieServices → verificationPrestataires
 *       ↑ (ajouter)         ↓
 *       └──────────    calculCredit
 *                           ↓ (si éligible)
 *                       eligible
 *                           ↓
 *                   validationAttestations
 *                           ↓
 *                   creditAccorde → termine ✓
 */
