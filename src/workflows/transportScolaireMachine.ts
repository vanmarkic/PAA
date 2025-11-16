/**
 * XState machine for Transport Scolaire (School Transport) Workflow
 *
 * This state machine represents the workflow for applying for subsidized school transport,
 * including distance verification, route assignment, and pass issuance.
 */

import { createMachine, assign } from 'xstate';

interface EleveTransport {
  nom: string;
  prenom: string;
  ecole: string;
  adresseDomicile: string;
}

interface TransportScolaireContext {
  eleve: EleveTransport | null;
  distanceKm: number;
  estEligible: boolean;
  itineraire: string | null;
  abonnementActif: boolean;
  typeAbonnement: string | null;
}

export const transportScolaireMachine = createMachine({
  id: 'transportScolaire',
  initial: 'attente',

  schemas: {
    context: {} as TransportScolaireContext,
    events: {} as
      | { type: 'DEMANDER_TRANSPORT'; eleve: EleveTransport }
      | { type: 'DISTANCE_CALCULEE'; distance: number }
      | { type: 'ITINERAIRE_ASSIGNE'; itineraire: string }
      | { type: 'ABONNEMENT_EMIS'; type: string }
      | { type: 'RENOUVELER_ABONNEMENT' }
      | { type: 'SIGNALER_PROBLEME' }
      | { type: 'PROBLEME_RESOLU' }
      | { type: 'RESILIER_ABONNEMENT' }
      | { type: 'REINITIALISER' }
  },

  context: {
    eleve: null,
    distanceKm: 0,
    estEligible: false,
    itineraire: null,
    abonnementActif: false,
    typeAbonnement: null,
  },

  states: {
    attente: {
      on: {
        DEMANDER_TRANSPORT: {
          target: 'calculDistance',
          actions: assign({
            eleve: (_, event) => event.eleve,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une nouvelle demande de transport scolaire',
      },
    },

    calculDistance: {
      on: {
        DISTANCE_CALCULEE: [
          {
            target: 'assignationItineraire',
            guard: (_, event) => event.distance >= 4,
            actions: assign({
              distanceKm: (_, event) => event.distance,
              estEligible: true,
            }),
          },
          {
            target: 'tropProche',
            actions: assign({
              distanceKm: (_, event) => event.distance,
              estEligible: false,
            }),
          },
        ],
      },

      meta: {
        description: 'Calcul de la distance domicile-école (éligible si >= 4 km)',
      },
    },

    tropProche: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Distance insuffisante pour bénéficier du transport scolaire gratuit',
      },
    },

    assignationItineraire: {
      on: {
        ITINERAIRE_ASSIGNE: {
          target: 'emissionAbonnement',
          actions: assign({
            itineraire: (_, event) => event.itineraire,
          }),
        },
      },

      meta: {
        description: 'Attribution d\'un itinéraire de bus scolaire adapté',
      },
    },

    emissionAbonnement: {
      on: {
        ABONNEMENT_EMIS: {
          target: 'abonnementActif',
          actions: assign({
            abonnementActif: true,
            typeAbonnement: (_, event) => event.type,
          }),
        },
      },

      meta: {
        description: 'Émission de la carte d\'abonnement de transport scolaire',
      },
    },

    abonnementActif: {
      on: {
        RENOUVELER_ABONNEMENT: {
          target: 'calculDistance',
        },
        SIGNALER_PROBLEME: {
          target: 'gestionProbleme',
        },
        RESILIER_ABONNEMENT: {
          target: 'resilie',
        },
      },

      meta: {
        description: 'Abonnement actif - transport scolaire disponible quotidiennement',
      },
    },

    gestionProbleme: {
      on: {
        PROBLEME_RESOLU: {
          target: 'abonnementActif',
        },
        ITINERAIRE_ASSIGNE: {
          target: 'abonnementActif',
          actions: assign({
            itineraire: (_, event) => event.itineraire,
          }),
        },
      },

      meta: {
        description: 'Gestion des problèmes (retards, itinéraire, carte perdue)',
      },
    },

    resilie: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Abonnement résilié - fin du transport scolaire',
      },
    },
  },
});

/**
 * Visualization of the school transport workflow:
 *
 * attente
 *   → calculDistance
 *       ↓ (si >= 4km)
 *     assignationItineraire
 *       ↓
 *     emissionAbonnement
 *       ↓
 *     abonnementActif → [renouvellement annuel]
 *       ↓
 *     calculDistance
 */
