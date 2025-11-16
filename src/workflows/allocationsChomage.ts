/**
 * Machine XState pour les Allocations de Chômage
 *
 * Cette machine d'état représente le flux de traitement des allocations de chômage,
 * incluant la vérification d'éligibilité, l'inscription, et le suivi des obligations.
 */

import { createMachine, assign } from 'xstate';

interface DemandeurChomage {
  nom: string;
  age: number;
  joursTravailes: number;
  salaireMoyen: number;
  raisonFinContrat: string;
  situationFamiliale: string;
}

interface ResultatEligibilite {
  estEligible: boolean;
  montantJournalier: number;
  dureeMaximale: number;
  raisons?: string[];
}

interface AllocationsChomageContext {
  demandeur: DemandeurChomage | null;
  resultatEligibilite: ResultatEligibilite | null;
  inscriptionONEM: boolean;
  obligationsRespectees: boolean;
  controleCount: number;
  sanctionEnCours: boolean;
}

export const allocationsChomageMachine = createMachine({
  id: 'allocationsChomage',
  initial: 'inactif',

  schema: {
    context: {} as AllocationsChomageContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; demandeur: DemandeurChomage }
      | { type: 'ELIGIBILITE_VERIFIEE'; resultat: ResultatEligibilite }
      | { type: 'INSCRIPTION_COMPLETE' }
      | { type: 'RECHERCHE_EMPLOI_ACTIVE' }
      | { type: 'CONTROLE_DEMANDE' }
      | { type: 'CONTROLE_REUSSI' }
      | { type: 'MANQUEMENT_DETECTE' }
      | { type: 'SANCTION_APPLIQUEE' }
      | { type: 'SANCTION_LEVEE' }
      | { type: 'EMPLOI_TROUVE' }
      | { type: 'DUREE_EXPIREE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    demandeur: null,
    resultatEligibilite: null,
    inscriptionONEM: false,
    obligationsRespectees: true,
    controleCount: 0,
    sanctionEnCours: false,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'verificationEligibilite',
          actions: assign({
            demandeur: (_, event) => event.demandeur,
            controleCount: 0,
          }),
        },
      },

      meta: {
        description: 'En attente du démarrage de la demande d\'allocations de chômage',
      },
    },

    verificationEligibilite: {
      on: {
        ELIGIBILITE_VERIFIEE: [
          {
            target: 'eligible',
            cond: (_, event) => event.resultat.estEligible,
            actions: assign({
              resultatEligibilite: (_, event) => event.resultat,
            }),
          },
          {
            target: 'ineligible',
            actions: assign({
              resultatEligibilite: (_, event) => event.resultat,
            }),
          },
        ],
      },

      meta: {
        description: 'Vérification des conditions: jours travaillés, raison de fin de contrat, âge',
      },
    },

    eligible: {
      on: {
        INSCRIPTION_COMPLETE: {
          target: 'inscriptionONEM',
        },
      },

      meta: {
        description: 'Le demandeur est éligible aux allocations de chômage',
      },
    },

    ineligible: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Le demandeur n\'est pas éligible - afficher les raisons et alternatives',
      },
    },

    inscriptionONEM: {
      on: {
        RECHERCHE_EMPLOI_ACTIVE: {
          target: 'allocationActive',
          actions: assign({
            inscriptionONEM: true,
          }),
        },
      },

      meta: {
        description: 'Inscription comme demandeur d\'emploi auprès de l\'ONEM',
      },
    },

    allocationActive: {
      on: {
        CONTROLE_DEMANDE: {
          target: 'controleObligations',
        },
        EMPLOI_TROUVE: {
          target: 'termine',
        },
        DUREE_EXPIREE: {
          target: 'expire',
        },
      },

      meta: {
        description: 'Allocations versées - suivi des recherches d\'emploi et formations obligatoires',
      },
    },

    controleObligations: {
      on: {
        CONTROLE_REUSSI: {
          target: 'allocationActive',
          actions: assign({
            controleCount: (context) => context.controleCount + 1,
            obligationsRespectees: true,
          }),
        },
        MANQUEMENT_DETECTE: {
          target: 'avertissement',
          actions: assign({
            obligationsRespectees: false,
          }),
        },
      },

      meta: {
        description: 'Contrôle de la recherche active d\'emploi et disponibilité',
      },
    },

    avertissement: {
      on: {
        SANCTION_APPLIQUEE: {
          target: 'suspendu',
          actions: assign({
            sanctionEnCours: true,
          }),
        },
        CONTROLE_REUSSI: {
          target: 'allocationActive',
        },
      },

      meta: {
        description: 'Avertissement suite à un manquement aux obligations',
      },
    },

    suspendu: {
      on: {
        SANCTION_LEVEE: {
          target: 'allocationActive',
          actions: assign({
            sanctionEnCours: false,
          }),
        },
      },

      meta: {
        description: 'Allocations suspendues temporairement suite à sanction',
      },
    },

    termine: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Allocations terminées - emploi retrouvé',
      },
    },

    expire: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Durée maximale des allocations atteinte',
      },
    },
  },
});

/**
 * Visualisation du flux des allocations de chômage:
 *
 * inactif
 *   → verificationEligibilite
 *       ↓ (si éligible)
 *     eligible → inscriptionONEM → allocationActive
 *       ↓ (si non éligible)              ↓
 *     ineligible                   (contrôle périodique)
 *                                         ↓
 *                                   controleObligations
 *                                      ↓       ↓
 *                                    OK     MANQUEMENT
 *                                      ↓       ↓
 *                                   active  avertissement
 *                                              ↓
 *                                         suspendu
 *                                              ↓
 *                                    [levée ou terminé]
 */
