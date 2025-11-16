/**
 * Machine XState pour le Télétravail
 *
 * Cette machine d'état représente le processus de mise en place et de gestion
 * du télétravail en Belgique, incluant les droits, les obligations et les équipements.
 */

import { createMachine, assign } from 'xstate';

interface TeletravailContext {
  employe: string | null;
  employeur: string | null;
  typeTeletravail: 'occasionnel' | 'regulier' | 'structurel' | null;
  joursParSemaine: number;
  lieuTravail: string | null;
  equipementFourni: string[];
  indemniteBureau: number;
  accordSigne: boolean;
  evaluationRisques: boolean;
  droitDeconnexion: boolean;
  retryCount: number;
}

export const teletravailMachine = createMachine({
  id: 'teletravail',
  initial: 'idle',

  schemas: {
    context: {} as TeletravailContext,
    events: {} as
      | { type: 'DEMANDER_TELETRAVAIL'; employe: string; employeur: string; typeTeletravail: 'occasionnel' | 'regulier' | 'structurel' }
      | { type: 'DEFINIR_MODALITES'; joursParSemaine: number; lieuTravail: string }
      | { type: 'EVALUER_FAISABILITE' }
      | { type: 'FAISABLE' }
      | { type: 'NON_FAISABLE'; raison: string }
      | { type: 'ETABLIR_ACCORD'; equipementFourni: string[]; indemniteBureau: number }
      | { type: 'SIGNER_ACCORD' }
      | { type: 'EVALUATION_RISQUES' }
      | { type: 'INSTALLER_EQUIPEMENT' }
      | { type: 'COMMENCER_TELETRAVAIL' }
      | { type: 'VERIFIER_CONFORMITE' }
      | { type: 'CONFORME' }
      | { type: 'NON_CONFORME'; problemes: string[] }
      | { type: 'MODIFIER_ACCORD'; nouveauxJours: number }
      | { type: 'INCIDENT_TECHNIQUE' }
      | { type: 'INCIDENT_RESOLU' }
      | { type: 'SUSPENDRE_TELETRAVAIL' }
      | { type: 'REPRENDRE_TELETRAVAIL' }
      | { type: 'METTRE_FIN_TELETRAVAIL' }
      | { type: 'RESET' }
  },

  context: {
    employe: null,
    employeur: null,
    typeTeletravail: null,
    joursParSemaine: 0,
    lieuTravail: null,
    equipementFourni: [],
    indemniteBureau: 0,
    accordSigne: false,
    evaluationRisques: false,
    droitDeconnexion: true,
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        DEMANDER_TELETRAVAIL: {
          target: 'definitionModalites',
          actions: assign({
            employe: ({ event }) => event.employe,
            employeur: ({ event }) => event.employeur,
            typeTeletravail: ({ event }) => event.typeTeletravail,
            retryCount: 0,
          }),
        },
      },

      meta: {
        description: 'Travail en présentiel uniquement',
      },
    },

    definitionModalites: {
      on: {
        DEFINIR_MODALITES: {
          target: 'evaluationFaisabilite',
          actions: assign({
            joursParSemaine: ({ event }) => event.joursParSemaine,
            lieuTravail: ({ event }) => event.lieuTravail,
          }),
        },
      },

      meta: {
        description: 'Définition des modalités de télétravail (jours, lieu)',
      },
    },

    evaluationFaisabilite: {
      on: {
        FAISABLE: {
          target: 'preparationAccord',
        },
        NON_FAISABLE: {
          target: 'demandeRefusee',
        },
      },

      meta: {
        description: 'Évaluation de la faisabilité du télétravail pour le poste',
      },
    },

    demandeRefusee: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Demande de télétravail refusée (fonction incompatible)',
      },
    },

    preparationAccord: {
      on: {
        ETABLIR_ACCORD: {
          target: 'signatureAccord',
          actions: assign({
            equipementFourni: ({ event }) => event.equipementFourni,
            indemniteBureau: ({ event }) => event.indemniteBureau,
          }),
        },
      },

      meta: {
        description: 'Préparation de l\'accord de télétravail',
      },
    },

    signatureAccord: {
      on: {
        SIGNER_ACCORD: {
          target: 'evaluationRisques',
          actions: assign({
            accordSigne: true,
          }),
        },
      },

      meta: {
        description: 'Signature de l\'accord de télétravail (obligatoire pour télétravail structurel)',
      },
    },

    evaluationRisques: {
      on: {
        EVALUATION_RISQUES: {
          target: 'installationEquipement',
          actions: assign({
            evaluationRisques: true,
          }),
        },
      },

      meta: {
        description: 'Évaluation des risques psychosociaux et ergonomiques',
      },
    },

    installationEquipement: {
      on: {
        INSTALLER_EQUIPEMENT: {
          target: 'teletravailActif',
        },
      },

      meta: {
        description: 'Installation de l\'équipement fourni par l\'employeur',
      },
    },

    teletravailActif: {
      on: {
        VERIFIER_CONFORMITE: {
          target: 'verificationConformite',
        },
        MODIFIER_ACCORD: {
          target: 'modificationAccord',
        },
        INCIDENT_TECHNIQUE: {
          target: 'gestionIncident',
        },
        SUSPENDRE_TELETRAVAIL: {
          target: 'suspension',
        },
        METTRE_FIN_TELETRAVAIL: {
          target: 'finTeletravail',
        },
      },

      meta: {
        description: 'Télétravail actif avec respect du droit à la déconnexion',
      },
    },

    verificationConformite: {
      on: {
        CONFORME: {
          target: 'teletravailActif',
        },
        NON_CONFORME: {
          target: 'misesEnConformite',
        },
      },

      meta: {
        description: 'Vérification de la conformité aux accords et à la loi',
      },
    },

    misesEnConformite: {
      on: {
        VERIFIER_CONFORMITE: {
          target: 'verificationConformite',
        },
      },

      meta: {
        description: 'Mise en conformité suite aux problèmes détectés',
      },
    },

    modificationAccord: {
      on: {
        MODIFIER_ACCORD: {
          target: 'teletravailActif',
          actions: assign({
            joursParSemaine: ({ event }) => event.nouveauxJours,
          }),
        },
      },

      meta: {
        description: 'Modification de l\'accord de télétravail',
      },
    },

    gestionIncident: {
      on: {
        INCIDENT_RESOLU: {
          target: 'teletravailActif',
        },
        SUSPENDRE_TELETRAVAIL: {
          target: 'suspension',
        },
      },

      meta: {
        description: 'Gestion d\'un incident technique',
      },
    },

    suspension: {
      on: {
        REPRENDRE_TELETRAVAIL: {
          target: 'teletravailActif',
        },
        METTRE_FIN_TELETRAVAIL: {
          target: 'finTeletravail',
        },
      },

      meta: {
        description: 'Suspension temporaire du télétravail',
      },
    },

    finTeletravail: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Fin du télétravail - retour au travail en présentiel',
      },
    },
  },
});

/**
 * Visualisation du workflow du télétravail:
 *
 * idle
 *   → definitionModalites
 *   → evaluationFaisabilite
 *       ↓ (faisable)
 *     preparationAccord
 *       ↓
 *     signatureAccord
 *       ↓
 *     evaluationRisques
 *       ↓
 *     installationEquipement
 *       ↓
 *     teletravailActif
 *       ↓
 *   [vérifications/modifications/incidents]
 *       ↓
 *     finTeletravail
 */
