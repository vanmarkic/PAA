/**
 * Machine XState pour l'Outplacement
 *
 * Cette machine d'état représente le processus d'outplacement en Belgique,
 * un accompagnement obligatoire pour certains licenciements afin de faciliter
 * la recherche d'un nouvel emploi.
 */

import { createMachine, assign } from 'xstate';

interface OutplacementContext {
  employe: string | null;
  employeur: string | null;
  age: number;
  anciennete: number;
  obligatoireOutplacement: boolean;
  dureeOutplacement: number;
  bureauOutplacement: string | null;
  bilanCompetences: boolean;
  cv: boolean;
  candidatures: number;
  entretiens: number;
  offreRecue: boolean;
  retryCount: number;
}

export const outplacementMachine = createMachine({
  id: 'outplacement',
  initial: 'idle',

  schemas: {
    context: {} as OutplacementContext,
    events: {} as
      | { type: 'NOTIFIER_LICENCIEMENT'; employe: string; employeur: string; age: number; anciennete: number }
      | { type: 'VERIFIER_OBLIGATION' }
      | { type: 'OUTPLACEMENT_OBLIGATOIRE'; dureeOutplacement: number }
      | { type: 'OUTPLACEMENT_NON_OBLIGATOIRE' }
      | { type: 'CHOISIR_BUREAU'; bureauOutplacement: string }
      | { type: 'SIGNER_CONVENTION' }
      | { type: 'REALISER_BILAN_COMPETENCES' }
      | { type: 'BILAN_COMPLETE' }
      | { type: 'DEFINIR_PROJET_PROFESSIONNEL' }
      | { type: 'PREPARER_CV' }
      | { type: 'FORMATION_ENTRETIEN' }
      | { type: 'RECHERCHE_ACTIVE' }
      | { type: 'ENVOYER_CANDIDATURE'; nombreCandidatures: number }
      | { type: 'OBTENIR_ENTRETIEN'; nombreEntretiens: number }
      | { type: 'RECEVOIR_OFFRE' }
      | { type: 'ACCEPTER_OFFRE' }
      | { type: 'REFUSER_OFFRE' }
      | { type: 'FIN_PERIODE_OUTPLACEMENT' }
      | { type: 'PROLONGATION'; nouvelleDuree: number }
      | { type: 'RESET' }
  },

  context: {
    employe: null,
    employeur: null,
    age: 0,
    anciennete: 0,
    obligatoireOutplacement: false,
    dureeOutplacement: 0,
    bureauOutplacement: null,
    bilanCompetences: false,
    cv: false,
    candidatures: 0,
    entretiens: 0,
    offreRecue: false,
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        NOTIFIER_LICENCIEMENT: {
          target: 'verificationObligation',
          actions: assign({
            employe: (_, event) => event.employe,
            employeur: (_, event) => event.employeur,
            age: (_, event) => event.age,
            anciennete: (_, event) => event.anciennete,
            retryCount: 0,
          }),
        },
      },

      meta: {
        description: 'Pas de procédure d\'outplacement en cours',
      },
    },

    verificationObligation: {
      on: {
        OUTPLACEMENT_OBLIGATOIRE: {
          target: 'choixBureau',
          actions: assign({
            obligatoireOutplacement: true,
            dureeOutplacement: (_, event) => event.dureeOutplacement,
          }),
        },
        OUTPLACEMENT_NON_OBLIGATOIRE: {
          target: 'nonObligatoire',
        },
      },

      meta: {
        description: 'Vérification de l\'obligation (45+ ans ou 1 an ancienneté)',
      },
    },

    nonObligatoire: {
      on: {
        CHOISIR_BUREAU: {
          target: 'choixBureau',
        },
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Outplacement non obligatoire - possibilité volontaire',
      },
    },

    choixBureau: {
      on: {
        CHOISIR_BUREAU: {
          target: 'signatureConvention',
          actions: assign({
            bureauOutplacement: (_, event) => event.bureauOutplacement,
          }),
        },
      },

      meta: {
        description: 'Choix du bureau d\'outplacement agréé',
      },
    },

    signatureConvention: {
      on: {
        SIGNER_CONVENTION: {
          target: 'bilanCompetences',
        },
      },

      meta: {
        description: 'Signature de la convention tripartite (employeur, employé, bureau)',
      },
    },

    bilanCompetences: {
      on: {
        BILAN_COMPLETE: {
          target: 'definitionProjetProfessionnel',
          actions: assign({
            bilanCompetences: true,
          }),
        },
      },

      meta: {
        description: 'Réalisation du bilan de compétences approfondi',
      },
    },

    definitionProjetProfessionnel: {
      on: {
        DEFINIR_PROJET_PROFESSIONNEL: {
          target: 'preparationOutils',
        },
      },

      meta: {
        description: 'Définition du projet professionnel et objectifs de carrière',
      },
    },

    preparationOutils: {
      on: {
        PREPARER_CV: {
          target: 'formationEntretien',
          actions: assign({
            cv: true,
          }),
        },
      },

      meta: {
        description: 'Préparation du CV et de la lettre de motivation',
      },
    },

    formationEntretien: {
      on: {
        FORMATION_ENTRETIEN: {
          target: 'rechercheActive',
        },
      },

      meta: {
        description: 'Formation aux techniques d\'entretien d\'embauche',
      },
    },

    rechercheActive: {
      on: {
        ENVOYER_CANDIDATURE: {
          target: 'suiviCandidatures',
          actions: assign({
            candidatures: (_, event) => event.nombreCandidatures,
          }),
        },
        FIN_PERIODE_OUTPLACEMENT: {
          target: 'finPeriode',
        },
      },

      meta: {
        description: 'Recherche active d\'emploi avec accompagnement',
      },
    },

    suiviCandidatures: {
      on: {
        OBTENIR_ENTRETIEN: {
          target: 'processusEntretien',
          actions: assign({
            entretiens: (_, event) => event.nombreEntretiens,
          }),
        },
        ENVOYER_CANDIDATURE: {
          target: 'rechercheActive',
        },
      },

      meta: {
        description: 'Suivi des candidatures envoyées',
      },
    },

    processusEntretien: {
      on: {
        RECEVOIR_OFFRE: {
          target: 'offreRecue',
          actions: assign({
            offreRecue: true,
          }),
        },
        ENVOYER_CANDIDATURE: {
          target: 'rechercheActive',
        },
      },

      meta: {
        description: 'Passage d\'entretiens d\'embauche',
      },
    },

    offreRecue: {
      on: {
        ACCEPTER_OFFRE: {
          target: 'reclassementReussi',
        },
        REFUSER_OFFRE: {
          target: 'rechercheActive',
        },
      },

      meta: {
        description: 'Offre d\'emploi reçue',
      },
    },

    reclassementReussi: {
      on: {
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Reclassement réussi - nouvel emploi trouvé',
      },
    },

    finPeriode: {
      on: {
        PROLONGATION: {
          target: 'rechercheActive',
          actions: assign({
            dureeOutplacement: (_, event) => event.nouvelleDuree,
          }),
        },
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Fin de la période d\'outplacement',
      },
    },
  },
});

/**
 * Visualisation du workflow de l'outplacement:
 *
 * idle
 *   → verificationObligation
 *       ↓ (obligatoire)
 *     choixBureau
 *       ↓
 *     signatureConvention
 *       ↓
 *     bilanCompetences
 *       ↓
 *     definitionProjetProfessionnel
 *       ↓
 *     preparationOutils
 *       ↓
 *     formationEntretien
 *       ↓
 *     rechercheActive
 *       ↓
 *     suiviCandidatures
 *       ↓
 *     processusEntretien
 *       ↓
 *     offreRecue
 *       ↓ (acceptée)
 *     reclassementReussi
 */
