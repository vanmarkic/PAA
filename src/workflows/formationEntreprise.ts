/**
 * Machine XState pour la Formation en Entreprise
 *
 * Cette machine d'état représente le processus de formation professionnelle en entreprise
 * en Belgique, incluant le plan de formation et les congés éducation.
 */

import { createMachine, assign } from 'xstate';

interface FormationEntrepriseContext {
  employe: string | null;
  entreprise: string | null;
  typeFormation: 'interne' | 'externe' | 'conge_education' | null;
  domaineFormation: string | null;
  dureeHeures: number;
  coutFormation: number;
  financementObtenu: boolean;
  planFormationAnnuel: boolean;
  competencesAcquises: string[];
  certificationObtenue: boolean;
  retryCount: number;
}

export const formationEntrepriseMachine = createMachine({
  id: 'formationEntreprise',
  initial: 'idle',

  schemas: {
    context: {} as FormationEntrepriseContext,
    events: {} as
      | { type: 'IDENTIFIER_BESOIN'; employe: string; entreprise: string; domaineFormation: string }
      | { type: 'EVALUER_COMPETENCES' }
      | { type: 'COMPETENCES_EVALUEES'; lacunes: string[] }
      | { type: 'CHOISIR_TYPE_FORMATION'; typeFormation: 'interne' | 'externe' | 'conge_education' }
      | { type: 'SELECTIONNER_FORMATION'; dureeHeures: number; coutFormation: number }
      | { type: 'DEMANDER_FINANCEMENT' }
      | { type: 'FINANCEMENT_OBTENU' }
      | { type: 'FINANCEMENT_REFUSE' }
      | { type: 'INSCRIRE_FORMATION' }
      | { type: 'COMMENCER_FORMATION' }
      | { type: 'SUIVRE_PROGRESSION'; pourcentage: number }
      | { type: 'EVALUER_ACQUIS'; competencesAcquises: string[] }
      | { type: 'REUSSIR_FORMATION' }
      | { type: 'ECHOUER_FORMATION' }
      | { type: 'OBTENIR_CERTIFICATION' }
      | { type: 'APPLIQUER_COMPETENCES' }
      | { type: 'NOUVELLE_FORMATION' }
      | { type: 'RESET' }
  },

  context: {
    employe: null,
    entreprise: null,
    typeFormation: null,
    domaineFormation: null,
    dureeHeures: 0,
    coutFormation: 0,
    financementObtenu: false,
    planFormationAnnuel: true,
    competencesAcquises: [],
    certificationObtenue: false,
    retryCount: 0,
  },

  states: {
    idle: {
      on: {
        IDENTIFIER_BESOIN: {
          target: 'evaluationCompetences',
          actions: assign({
            employe: (_, event) => event.employe,
            entreprise: (_, event) => event.entreprise,
            domaineFormation: (_, event) => event.domaineFormation,
            retryCount: 0,
          }),
        },
      },

      meta: {
        description: 'Pas de formation en cours',
      },
    },

    evaluationCompetences: {
      on: {
        COMPETENCES_EVALUEES: {
          target: 'choixTypeFormation',
        },
      },

      meta: {
        description: 'Évaluation des compétences actuelles et identification des lacunes',
      },
    },

    choixTypeFormation: {
      on: {
        CHOISIR_TYPE_FORMATION: {
          target: 'selectionFormation',
          actions: assign({
            typeFormation: (_, event) => event.typeFormation,
          }),
        },
      },

      meta: {
        description: 'Choix du type de formation (interne, externe, congé-éducation)',
      },
    },

    selectionFormation: {
      on: {
        SELECTIONNER_FORMATION: {
          target: 'demandeFinancement',
          actions: assign({
            dureeHeures: (_, event) => event.dureeHeures,
            coutFormation: (_, event) => event.coutFormation,
          }),
        },
      },

      meta: {
        description: 'Sélection d\'une formation spécifique',
      },
    },

    demandeFinancement: {
      on: {
        FINANCEMENT_OBTENU: {
          target: 'inscriptionFormation',
          actions: assign({
            financementObtenu: true,
          }),
        },
        FINANCEMENT_REFUSE: {
          target: 'financementRefuse',
        },
      },

      meta: {
        description: 'Demande de financement (fonds de formation sectoriels, chèques-formation)',
      },
    },

    financementRefuse: {
      on: {
        SELECTIONNER_FORMATION: {
          target: 'inscriptionFormation',
        },
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Financement refusé - possibilité de formation autofinancée',
      },
    },

    inscriptionFormation: {
      on: {
        INSCRIRE_FORMATION: {
          target: 'formationEnCours',
        },
      },

      meta: {
        description: 'Inscription à la formation sélectionnée',
      },
    },

    formationEnCours: {
      on: {
        SUIVRE_PROGRESSION: {
          target: 'suiviProgression',
        },
        EVALUER_ACQUIS: {
          target: 'evaluationAcquis',
        },
      },

      meta: {
        description: 'Formation en cours de réalisation',
      },
    },

    suiviProgression: {
      on: {
        SUIVRE_PROGRESSION: {
          target: 'formationEnCours',
        },
        EVALUER_ACQUIS: {
          target: 'evaluationAcquis',
        },
      },

      meta: {
        description: 'Suivi de la progression dans la formation',
      },
    },

    evaluationAcquis: {
      on: {
        REUSSIR_FORMATION: {
          target: 'formationReussie',
          actions: assign({
            competencesAcquises: (_, event) => event.competencesAcquises,
          }),
        },
        ECHOUER_FORMATION: {
          target: 'formationEchouee',
        },
      },

      meta: {
        description: 'Évaluation des acquis de formation',
      },
    },

    formationReussie: {
      on: {
        OBTENIR_CERTIFICATION: {
          target: 'certificationObtenue',
        },
        APPLIQUER_COMPETENCES: {
          target: 'applicationCompetences',
        },
      },

      meta: {
        description: 'Formation réussie avec succès',
      },
    },

    certificationObtenue: {
      on: {
        APPLIQUER_COMPETENCES: {
          target: 'applicationCompetences',
        },
      },

      meta: {
        description: 'Certification ou diplôme obtenu',
      },
    },

    applicationCompetences: {
      on: {
        NOUVELLE_FORMATION: {
          target: 'idle',
        },
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Application des nouvelles compétences au poste de travail',
      },
    },

    formationEchouee: {
      on: {
        SELECTIONNER_FORMATION: {
          target: 'inscriptionFormation',
        },
        RESET: {
          target: 'idle',
        },
      },

      meta: {
        description: 'Formation échouée - possibilité de recommencer',
      },
    },
  },
});

/**
 * Visualisation du workflow de la formation en entreprise:
 *
 * idle
 *   → evaluationCompetences
 *   → choixTypeFormation
 *   → selectionFormation
 *   → demandeFinancement
 *       ↓ (obtenu)
 *     inscriptionFormation
 *       ↓
 *     formationEnCours
 *       ↓
 *     suiviProgression
 *       ↓
 *     evaluationAcquis
 *       ↓ (réussite)
 *     formationReussie
 *       ↓
 *     certificationObtenue
 *       ↓
 *     applicationCompetences
 */
