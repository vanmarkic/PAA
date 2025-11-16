/**
 * Machine d'état XState pour les Chèques repas
 *
 * Cette machine d'état représente le flux de travail pour la gestion des chèques repas,
 * incluant l'inscription de l'employeur, la distribution aux employés, et le suivi
 * de l'utilisation.
 */

import { createMachine, assign } from 'xstate';

interface Employeur {
  id: string;
  nom: string;
  nombreEmployes: number;
  secteurActivite: string;
}

interface Employe {
  id: string;
  nom: string;
  joursPresence: number;
}

interface DistributionCheques {
  mois: string;
  nombreCheques: number;
  valeurUnitaire: number;
  employesBeneficiaires: string[];
}

interface ChequesRepasContext {
  employeur: Employeur | null;
  distribution: DistributionCheques | null;
  employes: Employe[];
  totalDistribue: number;
  avantagesFiscaux: number;
}

export const chequesRepasMachine = createMachine({
  id: 'chequesRepas',
  initial: 'inactif',

  schemas: {
    context: {} as ChequesRepasContext,
    events: {} as
      | { type: 'INSCRIRE_EMPLOYEUR'; employeur: Employeur }
      | { type: 'INSCRIPTION_APPROUVEE' }
      | { type: 'INSCRIPTION_REFUSEE'; raison: string }
      | { type: 'AJOUTER_EMPLOYES'; employes: Employe[] }
      | { type: 'CALCULER_DISTRIBUTION'; mois: string }
      | { type: 'DISTRIBUTION_CALCULEE'; distribution: DistributionCheques }
      | { type: 'VALIDER_DISTRIBUTION' }
      | { type: 'CHEQUES_DISTRIBUES' }
      | { type: 'MOIS_SUIVANT' }
      | { type: 'RESILIER' }
  },

  context: {
    employeur: null,
    distribution: null,
    employes: [],
    totalDistribue: 0,
    avantagesFiscaux: 0,
  },

  states: {
    inactif: {
      on: {
        INSCRIRE_EMPLOYEUR: {
          target: 'inscriptionEnCours',
          actions: assign({
            employeur: (_, event) => event.employeur,
          }),
        },
      },

      meta: {
        description: 'En attente d\'inscription d\'un employeur au système de chèques repas',
      },
    },

    inscriptionEnCours: {
      on: {
        INSCRIPTION_APPROUVEE: {
          target: 'inscrit',
        },
        INSCRIPTION_REFUSEE: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Vérification des conditions d\'accès au système de chèques repas',
      },
    },

    inscrit: {
      on: {
        AJOUTER_EMPLOYES: {
          target: 'gestionEmployes',
          actions: assign({
            employes: (_, event) => event.employes,
          }),
        },
      },

      meta: {
        description: 'Employeur inscrit - ajout des employés bénéficiaires',
      },
    },

    gestionEmployes: {
      on: {
        CALCULER_DISTRIBUTION: {
          target: 'calculDistribution',
        },
      },

      meta: {
        description: 'Gestion de la liste des employés et leurs jours de présence',
      },
    },

    calculDistribution: {
      on: {
        DISTRIBUTION_CALCULEE: {
          target: 'distributionPrete',
          actions: assign({
            distribution: (_, event) => event.distribution,
          }),
        },
      },

      meta: {
        description: 'Calcul du nombre de chèques par employé selon la présence',
      },
    },

    distributionPrete: {
      on: {
        VALIDER_DISTRIBUTION: {
          target: 'distribution',
        },
      },

      meta: {
        description: 'Distribution calculée - validation avant émission',
      },
    },

    distribution: {
      on: {
        CHEQUES_DISTRIBUES: {
          target: 'actif',
          actions: assign({
            totalDistribue: (context) =>
              context.totalDistribue +
              ((context.distribution?.nombreCheques || 0) * (context.distribution?.valeurUnitaire || 0)),
          }),
        },
      },

      meta: {
        description: 'Distribution des chèques repas aux employés',
      },
    },

    actif: {
      on: {
        MOIS_SUIVANT: {
          target: 'gestionEmployes',
        },
        RESILIER: {
          target: 'resilie',
        },
      },

      meta: {
        description: 'Système actif - préparation pour le mois suivant',
      },
    },

    resilie: {
      type: 'final',

      meta: {
        description: 'Convention de chèques repas résiliée',
      },
    },
  },
});

/**
 * Visualisation du flux de travail des chèques repas:
 *
 * inactif
 *   → inscriptionEnCours → inscrit
 *                            ↓
 *                       gestionEmployes
 *                            ↓
 *                       calculDistribution
 *                            ↓
 *                       distributionPrete
 *                            ↓
 *                       distribution → actif
 *                                       ↓
 *                                (mois suivant)
 *                                       ↓
 *                                gestionEmployes
 */
