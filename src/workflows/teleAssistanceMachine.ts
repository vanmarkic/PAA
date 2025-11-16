/**
 * XState machine for Télé-Assistance (Tele-Assistance) Workflow
 *
 * This state machine represents the workflow for tele-assistance services for elderly,
 * including equipment setup, monitoring, alert handling, and emergency response.
 */

import { createMachine, assign } from 'xstate';

interface PersonneAgee {
  nom: string;
  age: number;
  autonomie: string;
  pathologies: string[];
  vieSeul: boolean;
}

interface EquipementTeleassistance {
  typeBoitier: string;
  dateInstallation: Date;
  contactsUrgence: string[];
}

interface TeleAssistanceContext {
  personne: PersonneAgee | null;
  equipement: EquipementTeleassistance | null;
  serviceActif: boolean;
  alertesRecues: number;
  interventionsEffectuees: number;
}

export const teleAssistanceMachine = createMachine({
  id: 'teleAssistance',
  initial: 'attente',

  schemas: {
    context: {} as TeleAssistanceContext,
    events: {} as
      | { type: 'DEMANDER_SERVICE'; personne: PersonneAgee }
      | { type: 'EVALUER_ELIGIBILITE' }
      | { type: 'ELIGIBLE' }
      | { type: 'NON_ELIGIBLE' }
      | { type: 'INSTALLER_EQUIPEMENT'; equipement: EquipementTeleassistance }
      | { type: 'ACTIVER_SERVICE' }
      | { type: 'ALERTE_RECUE' }
      | { type: 'VERIFIER_SITUATION' }
      | { type: 'FAUSSE_ALERTE' }
      | { type: 'URGENCE_CONFIRMEE' }
      | { type: 'INTERVENTION_EFFECTUEE' }
      | { type: 'TEST_EQUIPEMENT' }
      | { type: 'RESILIER_SERVICE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    personne: null,
    equipement: null,
    serviceActif: false,
    alertesRecues: 0,
    interventionsEffectuees: 0,
  },

  states: {
    attente: {
      on: {
        DEMANDER_SERVICE: {
          target: 'evaluationEligibilite',
          actions: assign({
            personne: ({ event }) => event.personne,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une nouvelle demande de télé-assistance',
      },
    },

    evaluationEligibilite: {
      on: {
        ELIGIBLE: {
          target: 'installationEquipement',
        },
        NON_ELIGIBLE: {
          target: 'demandeRefusee',
        },
      },

      meta: {
        description: 'Évaluation de l\'éligibilité (âge, autonomie, situation)',
      },
    },

    demandeRefusee: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Demande refusée - critères non remplis',
      },
    },

    installationEquipement: {
      on: {
        ACTIVER_SERVICE: {
          target: 'serviceActif',
          actions: assign({
            equipement: ({ event }) => ({
              typeBoitier: 'standard',
              dateInstallation: new Date(),
              contactsUrgence: [],
            }),
            serviceActif: true,
          }),
        },
      },

      meta: {
        description: 'Installation du boîtier de télé-assistance et formation',
      },
    },

    serviceActif: {
      on: {
        ALERTE_RECUE: {
          target: 'traitementAlerte',
          actions: assign({ alertesRecues: ({ context }) => context.alertesRecues + 1,
          }),
        },
        TEST_EQUIPEMENT: {
          target: 'testEquipement',
        },
        RESILIER_SERVICE: {
          target: 'serviceResilie',
        },
      },

      meta: {
        description: 'Service actif - surveillance 24h/24 et 7j/7',
      },
    },

    traitementAlerte: {
      on: {
        VERIFIER_SITUATION: {
          target: 'verificationAlerte',
        },
      },

      meta: {
        description: 'Réception d\'une alerte - prise en charge immédiate',
      },
    },

    verificationAlerte: {
      on: {
        FAUSSE_ALERTE: {
          target: 'serviceActif',
        },
        URGENCE_CONFIRMEE: {
          target: 'interventionUrgence',
        },
      },

      meta: {
        description: 'Vérification de la nature de l\'alerte (appel à la personne)',
      },
    },

    interventionUrgence: {
      on: {
        INTERVENTION_EFFECTUEE: {
          target: 'serviceActif',
          actions: assign({ interventionsEffectuees: ({ context }) => context.interventionsEffectuees + 1,
          }),
        },
      },

      meta: {
        description: 'Intervention d\'urgence - contact famille, voisins, ou SAMU',
      },
    },

    testEquipement: {
      on: {
        ACTIVER_SERVICE: {
          target: 'serviceActif',
        },
      },

      meta: {
        description: 'Test mensuel de l\'équipement et vérification du bon fonctionnement',
      },
    },

    serviceResilie: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Service résilié - fin de contrat ou décès',
      },
    },
  },
});

/**
 * Visualization of the tele-assistance workflow:
 *
 * attente
 *   → evaluationEligibilite
 *       ↓ (si eligible)
 *     installationEquipement
 *       ↓
 *     serviceActif
 *       ↓ [alerte reçue]
 *     traitementAlerte
 *       ↓
 *     verificationAlerte
 *       ↓ (si urgence)
 *     interventionUrgence
 *       ↓
 *     serviceActif
 */
