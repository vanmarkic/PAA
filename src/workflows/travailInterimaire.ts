/**
 * Machine XState pour le Travail Intérimaire
 *
 * Cette machine d'état représente le processus de travail intérimaire en Belgique,
 * incluant l'inscription en agence, les missions et les droits spécifiques.
 */

import { createMachine, assign } from 'xstate';

interface TravailInterimaireContext {
  interimaire: string | null;
  agence: string | null;
  entrepriseUtilisatrice: string | null;
  typeMission: 'remplacement' | 'surcroit' | 'temporaire' | null;
  dureeMission: number;
  dateDebut: Date | null;
  dateFin: Date | null;
  salaire: number;
  missionsCompletes: number;
  formationSecurite: boolean;
  retryCount: number;
}

export const travailInterimaireMachine = createMachine({
  id: 'travailInterimaire',
  initial: 'idle',

  schemas: {
    context: {} as TravailInterimaireContext,
    events: {} as
      | { type: 'INSCRIRE_AGENCE'; interimaire: string; agence: string }
      | { type: 'EVALUER_COMPETENCES' }
      | { type: 'COMPETENCES_EVALUEES' }
      | { type: 'RECHERCHER_MISSION' }
      | { type: 'MISSION_PROPOSEE'; entrepriseUtilisatrice: string; typeMission: 'remplacement' | 'surcroit' | 'temporaire'; dureeMission: number }
      | { type: 'ACCEPTER_MISSION' }
      | { type: 'REFUSER_MISSION' }
      | { type: 'SIGNER_CONTRAT'; salaire: number; dateDebut: Date; dateFin: Date }
      | { type: 'FORMATION_SECURITE' }
      | { type: 'COMMENCER_MISSION' }
      | { type: 'PROLONGER_MISSION'; nouvelleDuree: number }
      | { type: 'TERMINER_MISSION' }
      | { type: 'EVALUER_MISSION' }
      | { type: 'MISSION_REUSSIE' }
      | { type: 'MISSION_PROBLEMATIQUE' }
      | { type: 'NOUVELLE_MISSION' }
      | { type: 'CDI_PROPOSE' }
      | { type: 'ACCEPTER_CDI' }
      | { type: 'REFUSER_CDI' }
      | { type: 'RESET' }
  },

  context: {
    interimaire: null,
    agence: null,
    entrepriseUtilisatrice: null,
    typeMission: null,
    dureeMission: 0,
    dateDebut: null,
    dateFin: null,
    salaire: 0,
    missionsCompletes: 0,
    formationSecurite: false,
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        INSCRIRE_AGENCE: {
          target: 'evaluationCompetences',
          actions: assign({
            interimaire: (_, event) => event.interimaire,
            agence: (_, event) => event.agence,
            retryCount: 0,
          }),
        },
      },

      meta: {
        description: 'Candidat non inscrit en agence d\'intérim',
      },
    },

    evaluationCompetences: {
      on: {
        COMPETENCES_EVALUEES: {
          target: 'disponible',
        },
      },

      meta: {
        description: 'Évaluation des compétences par l\'agence d\'intérim',
      },
    },

    disponible: {
      on: {
        MISSION_PROPOSEE: {
          target: 'missionProposee',
          actions: assign({
            entrepriseUtilisatrice: (_, event) => event.entrepriseUtilisatrice,
            typeMission: (_, event) => event.typeMission,
            dureeMission: (_, event) => event.dureeMission,
          }),
        },
      },

      meta: {
        description: 'Intérimaire disponible en attente de mission',
      },
    },

    missionProposee: {
      on: {
        ACCEPTER_MISSION: {
          target: 'signatureContrat',
        },
        REFUSER_MISSION: {
          target: 'disponible',
        },
      },

      meta: {
        description: 'Mission proposée en attente d\'acceptation',
      },
    },

    signatureContrat: {
      on: {
        SIGNER_CONTRAT: {
          target: 'formationSecurite',
          actions: assign({
            salaire: (_, event) => event.salaire,
            dateDebut: (_, event) => event.dateDebut,
            dateFin: (_, event) => event.dateFin,
          }),
        },
      },

      meta: {
        description: 'Signature du contrat de mission intérimaire',
      },
    },

    formationSecurite: {
      on: {
        FORMATION_SECURITE: {
          target: 'missionActive',
          actions: assign({
            formationSecurite: true,
          }),
        },
      },

      meta: {
        description: 'Formation sécurité obligatoire avant début de mission',
      },
    },

    missionActive: {
      on: {
        PROLONGER_MISSION: {
          target: 'prolongation',
        },
        TERMINER_MISSION: {
          target: 'evaluationMission',
        },
        CDI_PROPOSE: {
          target: 'propositionCDI',
        },
      },

      meta: {
        description: 'Mission intérimaire en cours',
      },
    },

    prolongation: {
      on: {
        PROLONGER_MISSION: {
          target: 'missionActive',
          actions: assign({
            dureeMission: (_, event) => event.nouvelleDuree,
          }),
        },
      },

      meta: {
        description: 'Prolongation de la mission intérimaire',
      },
    },

    evaluationMission: {
      on: {
        MISSION_REUSSIE: {
          target: 'missionTerminee',
          actions: assign({
            missionsCompletes: (context) => context.missionsCompletes + 1,
          }),
        },
        MISSION_PROBLEMATIQUE: {
          target: 'missionTerminee',
        },
      },

      meta: {
        description: 'Évaluation de fin de mission',
      },
    },

    missionTerminee: {
      on: {
        NOUVELLE_MISSION: {
          target: 'disponible',
        },
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Mission terminée - retour en disponibilité',
      },
    },

    propositionCDI: {
      on: {
        ACCEPTER_CDI: {
          target: 'conversionCDI',
        },
        REFUSER_CDI: {
          target: 'missionActive',
        },
      },

      meta: {
        description: 'Proposition de CDI par l\'entreprise utilisatrice',
      },
    },

    conversionCDI: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Conversion en CDI - fin du statut intérimaire',
      },
    },
  },
});

/**
 * Visualisation du workflow du travail intérimaire:
 *
 * idle
 *   → evaluationCompetences
 *   → disponible
 *   → missionProposee
 *       ↓ (acceptée)
 *     signatureContrat
 *       ↓
 *     formationSecurite
 *       ↓
 *     missionActive
 *       ↓                    ↓
 *   [prolongation]      [proposition CDI]
 *       ↓                    ↓
 *   evaluationMission    conversionCDI
 *       ↓
 *   missionTerminee
 *       ↓
 *   disponible
 */
