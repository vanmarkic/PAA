/**
 * Machine XState pour le Flexi-job
 *
 * Cette machine d'état représente le processus de flexi-job en Belgique,
 * un régime de travail flexible dans certains secteurs (horeca, commerce de détail).
 */

import { createMachine, assign } from 'xstate';

interface FlexiJobContext {
  travailleur: string | null;
  employeurPrincipal: string | null;
  employeurFlexijob: string | null;
  secteur: 'horeca' | 'commerce' | null;
  heuresEmployeurPrincipal: number;
  heuresFlexijob: number;
  tarifHoraire: number;
  cotisationsSociales: number;
  declarationFaite: boolean;
  retryCount: number;
}

export const flexiJobMachine = createMachine({
  id: 'flexiJob',
  initial: 'idle',

  schemas: {
    context: {} as FlexiJobContext,
    events: {} as
      | { type: 'DEMANDER_FLEXIJOB'; travailleur: string; employeurFlexijob: string; secteur: 'horeca' | 'commerce' }
      | { type: 'VERIFIER_ELIGIBILITE'; employeurPrincipal: string; heuresEmployeurPrincipal: number }
      | { type: 'ELIGIBLE' }
      | { type: 'NON_ELIGIBLE'; raison: string }
      | { type: 'ENREGISTRER_EMPLOYEUR' }
      | { type: 'CREER_CONTRAT'; tarifHoraire: number }
      | { type: 'DECLARER_ONSS' }
      | { type: 'COMMENCER_FLEXIJOB' }
      | { type: 'ENREGISTRER_HEURES'; heures: number }
      | { type: 'CALCULER_COTISATIONS'; cotisations: number }
      | { type: 'VERIFIER_CONDITIONS' }
      | { type: 'CONDITIONS_RESPECTEES' }
      | { type: 'CONDITIONS_NON_RESPECTEES' }
      | { type: 'TERMINER_FLEXIJOB' }
      | { type: 'RESET' }
  },

  context: {
    travailleur: null,
    employeurPrincipal: null,
    employeurFlexijob: null,
    secteur: null,
    heuresEmployeurPrincipal: 0,
    heuresFlexijob: 0,
    tarifHoraire: 0,
    cotisationsSociales: 0,
    declarationFaite: false,
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        DEMANDER_FLEXIJOB: {
          target: 'verificationEligibilite',
          actions: assign({
            travailleur: ({ event }) => event.travailleur,
            employeurFlexijob: ({ event }) => event.employeurFlexijob,
            secteur: ({ event }) => event.secteur,
            retryCount: 0,
          }),
        },
      },

      meta: {
        description: 'Pas de flexi-job actif',
      },
    },

    verificationEligibilite: {
      on: {
        ELIGIBLE: {
          target: 'enregistrementEmployeur',
        },
        NON_ELIGIBLE: {
          target: 'nonEligible',
        },
      },

      meta: {
        description: 'Vérification d\'éligibilité (min 4/5 temps chez employeur principal)',
      },
    },

    nonEligible: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Non éligible au flexi-job (conditions non remplies)',
      },
    },

    enregistrementEmployeur: {
      on: {
        ENREGISTRER_EMPLOYEUR: {
          target: 'creationContrat',
          actions: assign({
            employeurPrincipal: ({ event }) => event.employeurPrincipal || null,
            heuresEmployeurPrincipal: ({ event }) => event.heuresEmployeurPrincipal || 0,
          }),
        },
      },

      meta: {
        description: 'Enregistrement de l\'employeur principal et du flexi-job',
      },
    },

    creationContrat: {
      on: {
        CREER_CONTRAT: {
          target: 'declarationONSS',
          actions: assign({
            tarifHoraire: ({ event }) => event.tarifHoraire,
          }),
        },
      },

      meta: {
        description: 'Création du contrat flexi-job',
      },
    },

    declarationONSS: {
      on: {
        DECLARER_ONSS: {
          target: 'flexijobActif',
          actions: assign({
            declarationFaite: true,
          }),
        },
      },

      meta: {
        description: 'Déclaration ONSS avec cotisations spéciales flexi-job (25%)',
      },
    },

    flexijobActif: {
      on: {
        ENREGISTRER_HEURES: {
          target: 'calculCotisations',
          actions: assign({
            heuresFlexijob: ({ context, event }) => context.heuresFlexijob + event.heures,
          }),
        },
        VERIFIER_CONDITIONS: {
          target: 'verificationConditions',
        },
        TERMINER_FLEXIJOB: {
          target: 'termine',
        },
      },

      meta: {
        description: 'Flexi-job actif avec régime fiscal et social avantageux',
      },
    },

    calculCotisations: {
      on: {
        CALCULER_COTISATIONS: {
          target: 'flexijobActif',
          actions: assign({
            cotisationsSociales: ({ event }) => event.cotisations,
          }),
        },
      },

      meta: {
        description: 'Calcul des cotisations sociales réduites (25%)',
      },
    },

    verificationConditions: {
      on: {
        CONDITIONS_RESPECTEES: {
          target: 'flexijobActif',
        },
        CONDITIONS_NON_RESPECTEES: {
          target: 'suspensionFlexijob',
        },
      },

      meta: {
        description: 'Vérification périodique des conditions (4/5 temps principal)',
      },
    },

    suspensionFlexijob: {
      on: {
        VERIFIER_CONDITIONS: {
          target: 'verificationConditions',
        },
        TERMINER_FLEXIJOB: {
          target: 'termine',
        },
      },

      meta: {
        description: 'Flexi-job suspendu - conditions non respectées',
      },
    },

    termine: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Flexi-job terminé',
      },
    },
  },
});

/**
 * Visualisation du workflow du flexi-job:
 *
 * idle
 *   → verificationEligibilite
 *       ↓ (éligible)
 *     enregistrementEmployeur
 *       ↓
 *     creationContrat
 *       ↓
 *     declarationONSS
 *       ↓
 *     flexijobActif
 *       ↓
 *     calculCotisations
 *       ↓
 *     verificationConditions
 *       ↓ (respectées)        ↓ (non respectées)
 *     flexijobActif      suspensionFlexijob
 *       ↓
 *     termine
 */
