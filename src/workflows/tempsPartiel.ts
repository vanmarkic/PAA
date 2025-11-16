/**
 * Machine XState pour le Temps Partiel
 *
 * Cette machine d'état représente le processus de travail à temps partiel en Belgique,
 * incluant les droits, le maintien des droits sociaux et les adaptations.
 */

import { createMachine, assign } from 'xstate';

interface tempsPartielContext {
  employe: string | null;
  employeur: string | null;
  heuresHebdomadaires: number;
  pourcentageTempsPlein: number;
  horaireFixes: boolean;
  horaireVariable: boolean;
  maintienDroits: boolean;
  allocationGarantieRevenus: number;
  dateDebut: Date | null;
  retryCount: number;
}

export const tempsPartielMachine = createMachine({
  id: 'tempsPartiel',
  initial: 'idle',

  schemas: {
    context: {} as tempsPartielContext,
    events: {} as
      | { type: 'DEMANDER_TEMPS_PARTIEL'; employe: string; employeur: string; heuresHebdomadaires: number }
      | { type: 'CALCULER_POURCENTAGE'; pourcentageTempsPlein: number }
      | { type: 'CHOISIR_HORAIRE'; typeHoraire: 'fixe' | 'variable' }
      | { type: 'NEGOCIER_CONDITIONS' }
      | { type: 'ACCORD_TROUVE' }
      | { type: 'DESACCORD' }
      | { type: 'SIGNER_CONTRAT'; dateDebut: Date }
      | { type: 'VERIFIER_DROITS_SOCIAUX' }
      | { type: 'DROITS_MAINTENUS' }
      | { type: 'DEMANDER_AGR' }
      | { type: 'AGR_ACCORDEE'; montant: number }
      | { type: 'AGR_REFUSEE' }
      | { type: 'COMMENCER_TEMPS_PARTIEL' }
      | { type: 'AUGMENTER_HEURES'; nouvellesHeures: number }
      | { type: 'DIMINUER_HEURES'; nouvellesHeures: number }
      | { type: 'RETOUR_TEMPS_PLEIN' }
      | { type: 'RESET' }
  },

  context: {
    employe: null,
    employeur: null,
    heuresHebdomadaires: 0,
    pourcentageTempsPlein: 0,
    horaireFixes: false,
    horaireVariable: false,
    maintienDroits: false,
    allocationGarantieRevenus: 0,
    dateDebut: null,
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        DEMANDER_TEMPS_PARTIEL: {
          target: 'calculPourcentage',
          actions: assign({
            employe: ({ event }) => event.employe,
            employeur: ({ event }) => event.employeur,
            heuresHebdomadaires: ({ event }) => event.heuresHebdomadaires,
            retryCount: 0,
          }),
        },
      },

      meta: {
        description: 'Emploi à temps plein ou pas d\'emploi',
      },
    },

    calculPourcentage: {
      on: {
        CALCULER_POURCENTAGE: {
          target: 'choixHoraire',
          actions: assign({
            pourcentageTempsPlein: ({ event }) => event.pourcentageTempsPlein,
          }),
        },
      },

      meta: {
        description: 'Calcul du pourcentage par rapport au temps plein',
      },
    },

    choixHoraire: {
      on: {
        CHOISIR_HORAIRE: {
          target: 'negociationConditions',
          actions: assign({
            horaireFixes: ({ event }) => event.type === 'fixe',
            horaireVariable: ({ event }) => event.type === 'variable',
          }),
        },
      },

      meta: {
        description: 'Choix entre horaire fixe ou variable',
      },
    },

    negociationConditions: {
      on: {
        ACCORD_TROUVE: {
          target: 'signatureContrat',
        },
        DESACCORD: {
          target: 'negociationEchouee',
        },
      },

      meta: {
        description: 'Négociation des conditions de temps partiel',
      },
    },

    negociationEchouee: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Négociation échouée - maintien du contrat actuel',
      },
    },

    signatureContrat: {
      on: {
        SIGNER_CONTRAT: {
          target: 'verificationDroits',
          actions: assign({
            dateDebut: ({ event }) => event.dateDebut,
          }),
        },
      },

      meta: {
        description: 'Signature du contrat ou avenant à temps partiel',
      },
    },

    verificationDroits: {
      on: {
        DROITS_MAINTENUS: {
          target: 'tempsPartielActif',
          actions: assign({
            maintienDroits: true,
          }),
        },
        DEMANDER_AGR: {
          target: 'demandeAGR',
        },
      },

      meta: {
        description: 'Vérification du maintien des droits sociaux',
      },
    },

    demandeAGR: {
      on: {
        AGR_ACCORDEE: {
          target: 'tempsPartielActif',
          actions: assign({
            allocationGarantieRevenus: ({ event }) => event.montant,
          }),
        },
        AGR_REFUSEE: {
          target: 'tempsPartielActif',
        },
      },

      meta: {
        description: 'Demande d\'Allocation de Garantie de Revenus (AGR) auprès de l\'ONEM',
      },
    },

    tempsPartielActif: {
      on: {
        AUGMENTER_HEURES: {
          target: 'modificationHeures',
        },
        DIMINUER_HEURES: {
          target: 'modificationHeures',
        },
        RETOUR_TEMPS_PLEIN: {
          target: 'retourTempsPlein',
        },
      },

      meta: {
        description: 'Travail à temps partiel actif',
      },
    },

    modificationHeures: {
      on: {
        AUGMENTER_HEURES: {
          target: 'tempsPartielActif',
          actions: assign({
            heuresHebdomadaires: ({ event }) => event.nouvellesHeures,
          }),
        },
        DIMINUER_HEURES: {
          target: 'verificationDroits',
          actions: assign({
            heuresHebdomadaires: ({ event }) => event.nouvellesHeures,
          }),
        },
      },

      meta: {
        description: 'Modification du nombre d\'heures de travail',
      },
    },

    retourTempsPlein: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Retour à un travail à temps plein',
      },
    },
  },
});

/**
 * Visualisation du workflow du temps partiel:
 *
 * idle
 *   → calculPourcentage
 *   → choixHoraire
 *   → negociationConditions
 *       ↓ (accord)
 *     signatureContrat
 *       ↓
 *     verificationDroits
 *       ↓               ↓
 *   (maintien)      (AGR)
 *       ↓               ↓
 *   tempsPartielActif ← ←
 *       ↓
 *   [modifications/retour temps plein]
 */
