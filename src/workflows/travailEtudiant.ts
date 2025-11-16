/**
 * Machine XState pour le Travail Étudiant
 *
 * Cette machine d'état représente le processus de travail étudiant en Belgique,
 * incluant le quota d'heures, les cotisations réduites et les obligations légales.
 */

import { createMachine, assign } from 'xstate';

interface TravailEtudiantContext {
  etudiant: string | null;
  employeur: string | null;
  contratSigne: boolean;
  heuresDisponibles: number;
  heuresUtilisees: number;
  trimestre: number;
  salaireBrut: number;
  cotisationsReduites: boolean;
  dimona: boolean;
  retryCount: number;
}

export const travailEtudiantMachine = createMachine({
  id: 'travailEtudiant',
  initial: 'idle',

  schema: {
    context: {} as TravailEtudiantContext,
    events: {} as
      | { type: 'CREER_CONTRAT'; etudiant: string; employeur: string; salaireBrut: number }
      | { type: 'VERIFIER_ELIGIBILITE' }
      | { type: 'ELIGIBLE' }
      | { type: 'NON_ELIGIBLE'; raison: string }
      | { type: 'CONSULTER_QUOTA'; heuresDisponibles: number }
      | { type: 'SIGNER_CONTRAT' }
      | { type: 'DECLARER_DIMONA' }
      | { type: 'COMMENCER_TRAVAIL' }
      | { type: 'ENREGISTRER_HEURES'; heures: number }
      | { type: 'QUOTA_DEPASSE' }
      | { type: 'BASCULER_COTISATIONS_NORMALES' }
      | { type: 'NOUVEAU_TRIMESTRE'; trimestre: number }
      | { type: 'FIN_CONTRAT' }
      | { type: 'VERIFIER_CONFORMITE' }
      | { type: 'CONFORME' }
      | { type: 'NON_CONFORME'; infractions: string[] }
      | { type: 'RESET' }
  },

  context: {
    etudiant: null,
    employeur: null,
    contratSigne: false,
    heuresDisponibles: 600,
    heuresUtilisees: 0,
    trimestre: 1,
    salaireBrut: 0,
    cotisationsReduites: true,
    dimona: false,
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        CREER_CONTRAT: {
          target: 'verificationEligibilite',
          actions: assign({
            etudiant: (_, event) => event.etudiant,
            employeur: (_, event) => event.employeur,
            salaireBrut: (_, event) => event.salaireBrut,
            retryCount: 0,
          }),
        },
      },

      meta: {
        description: 'Pas de contrat de travail étudiant en cours',
      },
    },

    verificationEligibilite: {
      on: {
        ELIGIBLE: {
          target: 'consultationQuota',
        },
        NON_ELIGIBLE: {
          target: 'nonEligible',
        },
      },

      meta: {
        description: 'Vérification de l\'éligibilité (âge, statut étudiant)',
      },
    },

    nonEligible: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Étudiant non éligible au travail étudiant',
      },
    },

    consultationQuota: {
      on: {
        CONSULTER_QUOTA: {
          target: 'preparationContrat',
          actions: assign({
            heuresDisponibles: (_, event) => event.heuresDisponibles,
          }),
        },
      },

      meta: {
        description: 'Consultation du quota d\'heures disponibles (max 600h/an)',
      },
    },

    preparationContrat: {
      on: {
        SIGNER_CONTRAT: {
          target: 'declarationDimona',
          actions: assign({
            contratSigne: true,
          }),
        },
      },

      meta: {
        description: 'Préparation et signature du contrat étudiant',
      },
    },

    declarationDimona: {
      on: {
        DECLARER_DIMONA: {
          target: 'travailActif',
          actions: assign({
            dimona: true,
          }),
        },
      },

      meta: {
        description: 'Déclaration Dimona obligatoire avant début de travail',
      },
    },

    travailActif: {
      on: {
        ENREGISTRER_HEURES: {
          target: 'verificationQuota',
          actions: assign({
            heuresUtilisees: (context, event) => context.heuresUtilisees + event.heures,
          }),
        },
        FIN_CONTRAT: {
          target: 'verificationConformite',
        },
      },

      meta: {
        description: 'Travail étudiant en cours avec cotisations réduites',
      },
    },

    verificationQuota: {
      on: {
        QUOTA_DEPASSE: {
          target: 'cotisationsNormales',
        },
        ENREGISTRER_HEURES: {
          target: 'travailActif',
        },
      },

      meta: {
        description: 'Vérification du quota d\'heures (limite: 600h/an)',
      },
    },

    cotisationsNormales: {
      on: {
        BASCULER_COTISATIONS_NORMALES: {
          target: 'travailHorsQuota',
          actions: assign({
            cotisationsReduites: false,
          }),
        },
      },

      meta: {
        description: 'Quota dépassé - basculement vers cotisations normales',
      },
    },

    travailHorsQuota: {
      on: {
        NOUVEAU_TRIMESTRE: {
          target: 'travailActif',
          actions: assign({
            trimestre: (_, event) => event.trimestre,
            heuresUtilisees: 0,
            cotisationsReduites: true,
          }),
        },
        FIN_CONTRAT: {
          target: 'verificationConformite',
        },
      },

      meta: {
        description: 'Travail étudiant avec cotisations normales (quota dépassé)',
      },
    },

    verificationConformite: {
      on: {
        CONFORME: {
          target: 'termine',
        },
        NON_CONFORME: {
          target: 'nonConforme',
        },
      },

      meta: {
        description: 'Vérification de la conformité du contrat et des déclarations',
      },
    },

    nonConforme: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Non-conformité détectée - sanctions possibles',
      },
    },

    termine: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Contrat de travail étudiant terminé en conformité',
      },
    },
  },
});

/**
 * Visualisation du workflow du travail étudiant:
 *
 * idle
 *   → verificationEligibilite
 *       ↓ (éligible)
 *     consultationQuota
 *       ↓
 *     preparationContrat
 *       ↓
 *     declarationDimona
 *       ↓
 *     travailActif
 *       ↓
 *     verificationQuota
 *       ↓ (quota dépassé)
 *     cotisationsNormales
 *       ↓
 *     travailHorsQuota
 *       ↓
 *     verificationConformite
 *       ↓
 *     termine
 */
