/**
 * Machine d'état XState pour les Éco-chèques
 *
 * Cette machine d'état représente le flux de travail pour la gestion des éco-chèques,
 * incluant l'attribution par l'employeur, la validation des produits écologiques,
 * et le suivi de l'utilisation.
 */

import { createMachine, assign } from 'xstate';

interface EmployeurEco {
  id: string;
  nom: string;
  nombreEmployes: number;
  montantAnnuelParEmploye: number;
}

interface EmployeEco {
  id: string;
  nom: string;
  montantAttribue: number;
  montantUtilise: number;
}

interface TransactionEco {
  id: string;
  employeId: string;
  montant: number;
  produits: string[];
  commerce: string;
  date: Date;
}

interface EcoChequeContext {
  employeur: EmployeurEco | null;
  employes: EmployeEco[];
  transactions: TransactionEco[];
  montantTotalAttribue: number;
  montantTotalUtilise: number;
  anneeEnCours: number;
}

export const ecoChequeMachine = createMachine({
  id: 'ecoCheque',
  initial: 'inactif',

  schema: {
    context: {} as EcoChequeContext,
    events: {} as
      | { type: 'ACTIVER_PROGRAMME'; employeur: EmployeurEco }
      | { type: 'PROGRAMME_ACTIVE' }
      | { type: 'ATTRIBUER_ECOCHEQUES'; employes: EmployeEco[] }
      | { type: 'ATTRIBUTION_VALIDEE' }
      | { type: 'UTILISER_ECOCHEQUE'; transaction: TransactionEco }
      | { type: 'PRODUITS_VALIDES' }
      | { type: 'PRODUITS_NON_ELIGIBLES'; raison: string }
      | { type: 'TRANSACTION_CONFIRMEE' }
      | { type: 'NOUVELLE_ANNEE'; annee: number }
      | { type: 'DESACTIVER' }
  },

  context: {
    employeur: null,
    employes: [],
    transactions: [],
    montantTotalAttribue: 0,
    montantTotalUtilise: 0,
    anneeEnCours: new Date().getFullYear(),
  },

  states: {
    inactif: {
      on: {
        ACTIVER_PROGRAMME: {
          target: 'activation',
          actions: assign({
            employeur: (_, event) => event.employeur,
          }),
        },
      },

      meta: {
        description: 'En attente de l\'activation du programme éco-chèques',
      },
    },

    activation: {
      on: {
        PROGRAMME_ACTIVE: {
          target: 'attribution',
        },
      },

      meta: {
        description: 'Activation du programme éco-chèques pour l\'employeur',
      },
    },

    attribution: {
      on: {
        ATTRIBUER_ECOCHEQUES: {
          target: 'validationAttribution',
          actions: assign({
            employes: (_, event) => event.employes,
            montantTotalAttribue: (_, event) =>
              event.employes.reduce((sum, emp) => sum + emp.montantAttribue, 0),
          }),
        },
      },

      meta: {
        description: 'Attribution des éco-chèques aux employés',
      },
    },

    validationAttribution: {
      on: {
        ATTRIBUTION_VALIDEE: {
          target: 'actif',
        },
      },

      meta: {
        description: 'Validation de l\'attribution selon les plafonds légaux',
      },
    },

    actif: {
      on: {
        UTILISER_ECOCHEQUE: {
          target: 'validationProduits',
        },
        NOUVELLE_ANNEE: {
          target: 'attribution',
          actions: assign({
            anneeEnCours: (_, event) => event.annee,
            employes: (context) =>
              context.employes.map(emp => ({ ...emp, montantUtilise: 0 })),
          }),
        },
        DESACTIVER: {
          target: 'desactive',
        },
      },

      meta: {
        description: 'Programme actif - utilisation des éco-chèques possible',
      },
    },

    validationProduits: {
      on: {
        PRODUITS_VALIDES: {
          target: 'traitementTransaction',
        },
        PRODUITS_NON_ELIGIBLES: {
          target: 'actif',
        },
      },

      meta: {
        description: 'Validation de l\'éligibilité écologique des produits achetés',
      },
    },

    traitementTransaction: {
      on: {
        TRANSACTION_CONFIRMEE: {
          target: 'actif',
          actions: assign({
            transactions: (context, event: any) => [...context.transactions, event.transaction],
            montantTotalUtilise: (context, event: any) =>
              context.montantTotalUtilise + event.transaction.montant,
            employes: (context, event: any) =>
              context.employes.map(emp =>
                emp.id === event.transaction.employeId
                  ? { ...emp, montantUtilise: emp.montantUtilise + event.transaction.montant }
                  : emp
              ),
          }),
        },
      },

      meta: {
        description: 'Traitement de la transaction éco-chèque',
      },
    },

    desactive: {
      type: 'final',

      meta: {
        description: 'Programme éco-chèques désactivé',
      },
    },
  },
});

/**
 * Visualisation du flux de travail des éco-chèques:
 *
 * inactif
 *   → activation → attribution → validationAttribution → actif
 *                                                          ↓
 *                                                   (utilisation)
 *                                                          ↓
 *                                                  validationProduits
 *                                                      ↓       ↓
 *                                              (valides)    (non valides)
 *                                                      ↓       ↓
 *                                            traitementTransaction → actif
 */
