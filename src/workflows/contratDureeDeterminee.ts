/**
 * Machine XState pour le Contrat à Durée Déterminée (CDD)
 *
 * Cette machine d'état représente le processus de gestion d'un contrat à durée déterminée
 * en Belgique, incluant les motifs légaux, les renouvellements et la fin de contrat.
 */

import { createMachine, assign } from 'xstate';

interface ContratDureeDetermineeContext {
  employe: string | null;
  employeur: string | null;
  motifCDD: 'remplacement' | 'surcroit' | 'travaux_temporaires' | null;
  dateDebut: Date | null;
  dateFin: Date | null;
  dureeInitiale: number;
  renouvellements: number;
  dureeTotal: number;
  contratSigne: boolean;
  motifsJustifies: boolean;
  retryCount: number;
}

export const contratDureeDetermineeMachine = createMachine({
  id: 'contratDureeDeterminee',
  initial: 'idle',

  schemas: {
    context: {} as ContratDureeDetermineeContext,
    events: {} as
      | { type: 'CREER_CDD'; employe: string; employeur: string; motifCDD: 'remplacement' | 'surcroit' | 'travaux_temporaires' }
      | { type: 'DEFINIR_DUREE'; dateDebut: Date; dateFin: Date; dureeInitiale: number }
      | { type: 'JUSTIFIER_MOTIF' }
      | { type: 'MOTIF_VALIDE' }
      | { type: 'MOTIF_INVALIDE' }
      | { type: 'SIGNER_CONTRAT' }
      | { type: 'ACTIVER_CDD' }
      | { type: 'DEMANDER_RENOUVELLEMENT'; nouvelleDuree: number }
      | { type: 'RENOUVELLEMENT_ACCEPTE' }
      | { type: 'RENOUVELLEMENT_REFUSE' }
      | { type: 'VERIFIER_LIMITES' }
      | { type: 'LIMITES_RESPECTEES' }
      | { type: 'LIMITES_DEPASSEES' }
      | { type: 'ARRIVER_A_TERME' }
      | { type: 'CONVERSION_CDI' }
      | { type: 'RUPTURE_ANTICIPEE'; raison: string }
      | { type: 'RESET' }
  },

  context: {
    employe: null,
    employeur: null,
    motifCDD: null,
    dateDebut: null,
    dateFin: null,
    dureeInitiale: 0,
    renouvellements: 0,
    dureeTotal: 0,
    contratSigne: false,
    motifsJustifies: false,
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        CREER_CDD: {
          target: 'definitionDuree',
          actions: assign({
            employe: ({ event }) => event.employe,
            employeur: ({ event }) => event.employeur,
            motifCDD: ({ event }) => event.motifCDD,
            retryCount: 0,
          }),
        },
      },

      meta: {
        description: 'Pas de CDD en cours',
      },
    },

    definitionDuree: {
      on: {
        DEFINIR_DUREE: {
          target: 'justificationMotif',
          actions: assign({
            dateDebut: ({ event }) => event.dateDebut,
            dateFin: ({ event }) => event.dateFin,
            dureeInitiale: ({ event }) => event.dureeInitiale,
            dureeTotal: ({ event }) => event.dureeInitiale,
          }),
        },
      },

      meta: {
        description: 'Définition de la durée du contrat à durée déterminée',
      },
    },

    justificationMotif: {
      on: {
        MOTIF_VALIDE: {
          target: 'signature',
          actions: assign({
            motifsJustifies: true,
          }),
        },
        MOTIF_INVALIDE: {
          target: 'motifInvalide',
        },
      },

      meta: {
        description: 'Justification légale du recours au CDD',
      },
    },

    motifInvalide: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Motif de CDD invalide - contrat impossible',
      },
    },

    signature: {
      on: {
        SIGNER_CONTRAT: {
          target: 'cddActif',
          actions: assign({
            contratSigne: true,
          }),
        },
      },

      meta: {
        description: 'Signature du contrat à durée déterminée',
      },
    },

    cddActif: {
      on: {
        DEMANDER_RENOUVELLEMENT: {
          target: 'demandeRenouvellement',
        },
        ARRIVER_A_TERME: {
          target: 'finContrat',
        },
        RUPTURE_ANTICIPEE: {
          target: 'ruptureAnticipee',
        },
      },

      meta: {
        description: 'CDD actif - employé en cours de travail',
      },
    },

    demandeRenouvellement: {
      on: {
        VERIFIER_LIMITES: {
          target: 'verificationLimites',
        },
      },

      meta: {
        description: 'Demande de renouvellement du CDD',
      },
    },

    verificationLimites: {
      on: {
        LIMITES_RESPECTEES: {
          target: 'renouvellementPossible',
        },
        LIMITES_DEPASSEES: {
          target: 'conversionObligatoire',
        },
      },

      meta: {
        description: 'Vérification des limites légales (max 4 renouvellements, 2 ans total)',
      },
    },

    renouvellementPossible: {
      on: {
        RENOUVELLEMENT_ACCEPTE: {
          target: 'cddActif',
          actions: assign({ renouvellements: ({ context }) => context.renouvellements + 1,
            dureeTotal: ({ context, event }) => context.dureeTotal + event.nouvelleDuree,
          }),
        },
        RENOUVELLEMENT_REFUSE: {
          target: 'finContrat',
        },
      },

      meta: {
        description: 'Renouvellement possible dans les limites légales',
      },
    },

    conversionObligatoire: {
      on: {
        CONVERSION_CDI: {
          target: 'converti',
        },
      },

      meta: {
        description: 'Conversion obligatoire en CDI (limites dépassées)',
      },
    },

    finContrat: {
      on: {
        CONVERSION_CDI: {
          target: 'converti',
        },
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Fin du contrat à terme - possibilité de conversion en CDI',
      },
    },

    ruptureAnticipee: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Rupture anticipée du CDD (motif grave ou accord mutuel)',
      },
    },

    converti: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'CDD converti en contrat à durée indéterminée',
      },
    },
  },
});

/**
 * Visualisation du workflow du CDD:
 *
 * idle
 *   → definitionDuree
 *   → justificationMotif
 *       ↓ (validé)
 *     signature
 *       ↓
 *     cddActif
 *       ↓                    ↓
 *   demandeRenouvellement  terme
 *       ↓                    ↓
 *   verificationLimites   finContrat
 *       ↓ (ok)     ↓ (dépassé)
 *   renouvellement  conversion
 *       ↓              CDI
 *     cddActif
 */
