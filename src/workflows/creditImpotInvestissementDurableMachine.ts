/**
 * Machine d'état XState pour le Crédit d'impôt investissement durable
 *
 * Cette machine d'état représente le flux de travail pour demander un crédit d'impôt
 * pour investissement durable (panneaux solaires, pompes à chaleur, etc.), incluant
 * la vérification de l'installation et le calcul du crédit.
 */

import { createMachine, assign } from 'xstate';

interface InvestisseurDurable {
  id: string;
  nom: string;
  revenus: number;
  adresse: string;
}

interface InvestissementDurable {
  id: string;
  type: 'panneaux_solaires' | 'pompe_chaleur' | 'chaudiere_condensation' | 'isolation_thermique' | 'borne_rechargement';
  montantInvestissement: number;
  capaciteProduction?: number;
  rendementEnergetique: number;
  dateInstallation: Date;
  installateurAgree: boolean;
}

interface CreditInvestissementDurable {
  estEligible: boolean;
  montantCredit: number;
  tauxCredit: number;
  plafondApplicable: number;
  motifRefus?: string;
}

interface CreditImpotInvestissementDurableContext {
  investisseur: InvestisseurDurable | null;
  investissement: InvestissementDurable | null;
  credit: CreditInvestissementDurable | null;
  certificatsEnergetiques: string[];
  factures: string[];
  totalCredit: number;
}

export const creditImpotInvestissementDurableMachine = createMachine({
  id: 'creditImpotInvestissementDurable',
  initial: 'inactif',

  schemas: {
    context: {} as CreditImpotInvestissementDurableContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; investisseur: InvestisseurDurable; investissement: InvestissementDurable }
      | { type: 'VERIFIER_ELIGIBILITE' }
      | { type: 'ELIGIBILITE_VERIFIEE'; credit: CreditInvestissementDurable }
      | { type: 'ACCEPTER_CREDIT' }
      | { type: 'REFUSER_CREDIT' }
      | { type: 'SOUMETTRE_DOCUMENTS'; factures: string[]; certificats: string[] }
      | { type: 'DOCUMENTS_VALIDES' }
      | { type: 'DOCUMENTS_INVALIDES' }
      | { type: 'CREDIT_ACCORDE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    investisseur: null,
    investissement: null,
    credit: null,
    certificatsEnergetiques: [],
    factures: [],
    totalCredit: 0,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'verificationEligibilite',
          actions: assign({
            investisseur: ({ event }) => event.investisseur,
            investissement: ({ event }) => event.investissement,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une demande de crédit d\'impôt pour investissement durable',
      },
    },

    verificationEligibilite: {
      on: {
        ELIGIBILITE_VERIFIEE: [
          {
            target: 'eligible',
            guard: ({ event }) => event.credit.estEligible,
            actions: assign({
              credit: ({ event }) => event.credit,
              totalCredit: ({ event }) => event.credit.montantCredit,
            }),
          },
          {
            target: 'nonEligible',
            actions: assign({
              credit: ({ event }) => event.credit,
            }),
          },
        ],
      },

      meta: {
        description: 'Vérification de l\'éligibilité de l\'investissement (type, normes, installateur)',
      },
    },

    eligible: {
      on: {
        ACCEPTER_CREDIT: {
          target: 'soumissionDocuments',
        },
        REFUSER_CREDIT: {
          target: 'refuse',
        },
      },

      meta: {
        description: 'Investissement éligible au crédit d\'impôt',
      },
    },

    nonEligible: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Investissement non éligible au crédit d\'impôt',
      },
    },

    refuse: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Crédit d\'impôt refusé par l\'investisseur',
      },
    },

    soumissionDocuments: {
      on: {
        SOUMETTRE_DOCUMENTS: {
          target: 'validationDocuments',
          actions: assign({
            factures: ({ event }) => event.factures,
            certificatsEnergetiques: ({ event }) => event.certificats,
          }),
        },
      },

      meta: {
        description: 'Soumission des factures et certificats énergétiques',
      },
    },

    validationDocuments: {
      on: {
        DOCUMENTS_VALIDES: {
          target: 'creditAccorde',
        },
        DOCUMENTS_INVALIDES: {
          target: 'soumissionDocuments',
        },
      },

      meta: {
        description: 'Validation des documents et conformité de l\'installation',
      },
    },

    creditAccorde: {
      on: {
        CREDIT_ACCORDE: {
          target: 'verse',
        },
      },

      meta: {
        description: 'Crédit d\'impôt pour investissement durable accordé',
      },
    },

    verse: {
      type: 'final',

      meta: {
        description: 'Crédit d\'impôt appliqué avec succès',
      },
    },
  },
});

/**
 * Visualisation du flux de travail du crédit d'impôt investissement durable:
 *
 * inactif
 *   → verificationEligibilite
 *       ↓ (si éligible)
 *     eligible → soumissionDocuments → validationDocuments
 *       ↓                                     ↓
 *     nonEligible                      creditAccorde → verse ✓
 */
