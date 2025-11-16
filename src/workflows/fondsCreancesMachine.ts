/**
 * XState machine for Fonds de Créances (Claims Fund) Workflow
 *
 * This state machine represents the workflow for accessing the claims fund for unpaid debts,
 * including claim submission, validation, and payment processing.
 */

import { createMachine, assign } from 'xstate';

interface Creancier {
  nom: string;
  typeCreance: string;
  montantCreance: number;
  dateCreance: Date;
}

interface Debiteur {
  nom: string;
  situationFinanciere: string;
}

interface FondsCreancesContext {
  creancier: Creancier | null;
  debiteur: Debiteur | null;
  dossierComplet: boolean;
  montantRecuperable: number;
  montantPaye: number;
  documentsManquants: string[];
}

export const fondsCreancesMachine = createMachine({
  id: 'fondsCreances',
  initial: 'attente',

  schema: {
    context: {} as FondsCreancesContext,
    events: {} as
      | { type: 'SOUMETTRE_CREANCE'; creancier: Creancier; debiteur: Debiteur }
      | { type: 'VERIFIER_DOSSIER' }
      | { type: 'DOSSIER_COMPLET' }
      | { type: 'DOSSIER_INCOMPLET'; documents: string[] }
      | { type: 'COMPLETER_DOSSIER' }
      | { type: 'EVALUER_CREANCE'; montant: number }
      | { type: 'APPROUVER_PAIEMENT' }
      | { type: 'REFUSER_CREANCE' }
      | { type: 'EFFECTUER_PAIEMENT'; montant: number }
      | { type: 'RECUPERER_AUPRES_DEBITEUR' }
      | { type: 'REINITIALISER' }
  },

  context: {
    creancier: null,
    debiteur: null,
    dossierComplet: false,
    montantRecuperable: 0,
    montantPaye: 0,
    documentsManquants: [],
  },

  states: {
    attente: {
      on: {
        SOUMETTRE_CREANCE: {
          target: 'verificationDossier',
          actions: assign({
            creancier: (_, event) => event.creancier,
            debiteur: (_, event) => event.debiteur,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une nouvelle soumission de créance au fonds',
      },
    },

    verificationDossier: {
      on: {
        DOSSIER_COMPLET: {
          target: 'evaluationCreance',
          actions: assign({
            dossierComplet: true,
          }),
        },
        DOSSIER_INCOMPLET: {
          target: 'attenteDossier',
          actions: assign({
            dossierComplet: false,
            documentsManquants: (_, event) => event.documents,
          }),
        },
      },

      meta: {
        description: 'Vérification de la complétude du dossier de créance',
      },
    },

    attenteDossier: {
      on: {
        COMPLETER_DOSSIER: {
          target: 'verificationDossier',
        },
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Attente de compléments de dossier (factures, preuves, jugement)',
      },
    },

    evaluationCreance: {
      on: {
        APPROUVER_PAIEMENT: {
          target: 'paiementApprouve',
          actions: assign({
            montantRecuperable: (_, event) => event.montant || 0,
          }),
        },
        REFUSER_CREANCE: {
          target: 'creanceRefusee',
        },
      },

      meta: {
        description: 'Évaluation du bien-fondé et du montant récupérable',
      },
    },

    paiementApprouve: {
      on: {
        EFFECTUER_PAIEMENT: {
          target: 'paiementEffectue',
          actions: assign({
            montantPaye: (_, event) => event.montant,
          }),
        },
      },

      meta: {
        description: 'Paiement approuvé - préparation du versement au créancier',
      },
    },

    paiementEffectue: {
      on: {
        RECUPERER_AUPRES_DEBITEUR: {
          target: 'recuperationEnCours',
        },
      },

      meta: {
        description: 'Paiement effectué au créancier - début de récupération auprès du débiteur',
      },
    },

    recuperationEnCours: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Récupération en cours auprès du débiteur (plan de paiement)',
      },
    },

    creanceRefusee: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Créance refusée - non éligible ou insuffisamment documentée',
      },
    },
  },
});

/**
 * Visualization of the claims fund workflow:
 *
 * attente
 *   → verificationDossier
 *       ↓ (si complet)
 *     evaluationCreance
 *       ↓ (si approuvé)
 *     paiementApprouve
 *       ↓
 *     paiementEffectue
 *       ↓
 *     recuperationEnCours
 */
