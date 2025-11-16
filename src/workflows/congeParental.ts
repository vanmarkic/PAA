/**
 * Machine XState pour le Congé Parental
 *
 * Cette machine d'état représente le flux de traitement du congé parental,
 * incluant la demande, planification et suivi des allocations.
 */

import { createMachine, assign } from 'xstate';

interface ParentDemandeur {
  nom: string;
  numeroRegistreNational: string;
  employeur: string;
  anciennete: number;
  typeContrat: string;
  salaireMensuel: number;
}

interface EnfantConcerne {
  nom: string;
  dateNaissance: Date;
  age: number;
  adoption: boolean;
}

interface CongeParentalPlan {
  typeConge: 'plein' | 'mi-temps' | 'cinquième';
  dureeEnMois: number;
  dateDebut: Date;
  dateFin: Date;
  allocationMensuelle: number;
}

interface CongeParentalContext {
  parent: ParentDemandeur | null;
  enfant: EnfantConcerne | null;
  planConge: CongeParentalPlan | null;
  accordEmployeur: boolean;
  allocationEnCours: boolean;
}

export const congeParentalMachine = createMachine({
  id: 'congeParental',
  initial: 'inactif',

  schema: {
    context: {} as CongeParentalContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; parent: ParentDemandeur; enfant: EnfantConcerne }
      | { type: 'ELIGIBILITE_VERIFIEE'; eligible: boolean }
      | { type: 'PLAN_ETABLI'; plan: CongeParentalPlan }
      | { type: 'EMPLOYEUR_NOTIFIE' }
      | { type: 'ACCORD_OBTENU' }
      | { type: 'REFUS_EMPLOYEUR'; raison: string }
      | { type: 'CONGE_DEMARRE' }
      | { type: 'DEMANDE_PROLONGATION' }
      | { type: 'REPRISE_ANTICIPEE' }
      | { type: 'CONGE_TERMINE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    parent: null,
    enfant: null,
    planConge: null,
    accordEmployeur: false,
    allocationEnCours: false,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'verificationEligibilite',
          actions: assign({
            parent: (_, event) => event.parent,
            enfant: (_, event) => event.enfant,
          }),
        },
      },

      meta: {
        description: 'En attente de demande de congé parental',
      },
    },

    verificationEligibilite: {
      on: {
        ELIGIBILITE_VERIFIEE: [
          {
            target: 'etablissementPlan',
            cond: (_, event) => event.eligible,
          },
          {
            target: 'demandeRejetee',
          },
        ],
      },

      meta: {
        description: 'Vérification ancienneté (12 mois) et âge de l\'enfant (max 12 ans)',
      },
    },

    etablissementPlan: {
      on: {
        PLAN_ETABLI: {
          target: 'notificationEmployeur',
          actions: assign({
            planConge: (_, event) => event.plan,
          }),
        },
      },

      meta: {
        description: 'Établissement du plan: type de congé, durée, dates',
      },
    },

    notificationEmployeur: {
      on: {
        EMPLOYEUR_NOTIFIE: {
          target: 'attenteAccord',
        },
      },

      meta: {
        description: 'Notification à l\'employeur (3 mois avant pour temps plein)',
      },
    },

    attenteAccord: {
      on: {
        ACCORD_OBTENU: {
          target: 'congeApprouve',
          actions: assign({
            accordEmployeur: true,
          }),
        },
        REFUS_EMPLOYEUR: {
          target: 'negociation',
        },
      },

      meta: {
        description: 'Attente de l\'accord de l\'employeur',
      },
    },

    negociation: {
      on: {
        PLAN_ETABLI: {
          target: 'notificationEmployeur',
          actions: assign({
            planConge: (_, event) => event.plan,
          }),
        },
      },

      meta: {
        description: 'Négociation des dates avec l\'employeur',
      },
    },

    congeApprouve: {
      on: {
        CONGE_DEMARRE: {
          target: 'congeEnCours',
        },
      },

      meta: {
        description: 'Congé approuvé - en attente du début',
      },
    },

    congeEnCours: {
      on: {
        DEMANDE_PROLONGATION: {
          target: 'etablissementPlan',
        },
        REPRISE_ANTICIPEE: {
          target: 'repriseAnticipee',
        },
        CONGE_TERMINE: {
          target: 'repriseNormale',
        },
      },

      meta: {
        description: 'Congé parental en cours - allocations versées par ONEM',
      },
    },

    repriseAnticipee: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Reprise anticipée du travail - fin du congé',
      },
    },

    repriseNormale: {
      type: 'final',

      meta: {
        description: 'Fin normale du congé parental - reprise du travail',
      },
    },

    demandeRejetee: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Demande rejetée - conditions non remplies',
      },
    },
  },
});

/**
 * Visualisation du flux du congé parental:
 *
 * inactif
 *   → verificationEligibilite
 *   → etablissementPlan
 *   → notificationEmployeur
 *   → attenteAccord
 *       ↓ (accord)
 *     congeApprouve
 *       ↓
 *     congeEnCours
 *       ↓ (fin normale)
 *     repriseNormale ✓
 *       ↓ (prolongation)
 *     etablissementPlan
 */
