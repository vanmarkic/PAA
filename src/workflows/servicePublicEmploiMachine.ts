/**
 * XState machine for Service Public Emploi (Public Employment Service) Workflow
 *
 * This state machine represents the workflow for public employment service registration,
 * including job seeker registration, counseling, and job placement support.
 */

import { createMachine, assign } from 'xstate';

interface DemandeurEmploi {
  nom: string;
  age: number;
  qualification: string;
  experiencePro: string[];
  disponibilite: string;
}

interface ProjetProfessionnel {
  secteursCibles: string[];
  typeContrat: string;
  zonageGeographique: string;
}

interface ServicePublicEmploiContext {
  demandeur: DemandeurEmploi | null;
  projet: ProjetProfessionnel | null;
  inscriptionActive: boolean;
  entretiensCounseling: number;
  offresProposees: number;
  allocationsRecues: boolean;
}

export const servicePublicEmploiMachine = createMachine({
  id: 'servicePublicEmploi',
  initial: 'attente',

  schema: {
    context: {} as ServicePublicEmploiContext,
    events: {} as
      | { type: 'INSCRIRE_DEMANDEUR'; demandeur: DemandeurEmploi }
      | { type: 'INSCRIPTION_VALIDEE' }
      | { type: 'PREMIER_ENTRETIEN' }
      | { type: 'DEFINIR_PROJET'; projet: ProjetProfessionnel }
      | { type: 'PROPOSER_OFFRES'; nombre: number }
      | { type: 'DEMANDER_ALLOCATIONS' }
      | { type: 'ALLOCATIONS_ACCORDEES' }
      | { type: 'ALLOCATIONS_REFUSEES' }
      | { type: 'ENTRETIEN_SUIVI' }
      | { type: 'CONTROLE_RECHERCHE' }
      | { type: 'EMPLOI_TROUVE' }
      | { type: 'RADIATION' }
      | { type: 'REINITIALISER' }
  },

  context: {
    demandeur: null,
    projet: null,
    inscriptionActive: false,
    entretiensCounseling: 0,
    offresProposees: 0,
    allocationsRecues: false,
  },

  states: {
    attente: {
      on: {
        INSCRIRE_DEMANDEUR: {
          target: 'validationInscription',
          actions: assign({
            demandeur: (_, event) => event.demandeur,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une nouvelle inscription comme demandeur d\'emploi',
      },
    },

    validationInscription: {
      on: {
        INSCRIPTION_VALIDEE: {
          target: 'premierEntretien',
          actions: assign({
            inscriptionActive: true,
          }),
        },
      },

      meta: {
        description: 'Validation de l\'inscription et ouverture du dossier',
      },
    },

    premierEntretien: {
      on: {
        DEFINIR_PROJET: {
          target: 'demandeAllocations',
          actions: assign({
            projet: (_, event) => event.projet,
            entretiensCounseling: 1,
          }),
        },
      },

      meta: {
        description: 'Premier entretien de conseil pour définir le projet professionnel',
      },
    },

    demandeAllocations: {
      on: {
        ALLOCATIONS_ACCORDEES: {
          target: 'suiviActif',
          actions: assign({
            allocationsRecues: true,
          }),
        },
        ALLOCATIONS_REFUSEES: {
          target: 'suiviActif',
          actions: assign({
            allocationsRecues: false,
          }),
        },
      },

      meta: {
        description: 'Vérification de l\'éligibilité aux allocations de chômage',
      },
    },

    suiviActif: {
      on: {
        PROPOSER_OFFRES: {
          target: 'suiviActif',
          actions: assign({
            offresProposees: (context, event) => context.offresProposees + event.nombre,
          }),
        },
        ENTRETIEN_SUIVI: {
          target: 'suiviActif',
          actions: assign({
            entretiensCounseling: (context) => context.entretiensCounseling + 1,
          }),
        },
        CONTROLE_RECHERCHE: {
          target: 'controleActivite',
        },
        EMPLOI_TROUVE: {
          target: 'sortiePositive',
        },
        RADIATION: {
          target: 'inscriptionRadiee',
        },
      },

      meta: {
        description: 'Suivi actif - offres proposées et entretiens réguliers',
      },
    },

    controleActivite: {
      on: {
        ENTRETIEN_SUIVI: {
          target: 'suiviActif',
        },
        RADIATION: {
          target: 'inscriptionRadiee',
        },
      },

      meta: {
        description: 'Contrôle de la recherche active d\'emploi',
      },
    },

    sortiePositive: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Sortie positive - emploi trouvé',
      },
    },

    inscriptionRadiee: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Inscription radiée - non-respect des obligations ou fraude',
      },
    },
  },
});

/**
 * Visualization of the public employment service workflow:
 *
 * attente
 *   → validationInscription
 *   → premierEntretien
 *   → demandeAllocations
 *   → suiviActif
 *       ↓ [offres proposées, entretiens]
 *     suiviActif
 *       ↓
 *     sortiePositive ✓
 */
