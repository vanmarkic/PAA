/**
 * XState machine for Insertion Professionnelle (Professional Integration) Workflow
 *
 * This state machine represents the workflow for professional integration services,
 * including skills assessment, job search support, and employment placement.
 */

import { createMachine, assign } from 'xstate';

interface Demandeur {
  nom: string;
  age: number;
  niveauEtudes: string;
  experiencePro: string[];
  competences: string[];
}

interface BilanCompetences {
  competencesProfessionnelles: string[];
  competencesTransversales: string[];
  objectifsProfessionnels: string[];
}

interface InsertionProfessionnelleContext {
  demandeur: Demandeur | null;
  bilan: BilanCompetences | null;
  offresTrouvees: number;
  candidaturesSoumises: number;
  entretiensObtenus: number;
  emploiTrouve: boolean;
}

export const insertionProfessionnelleMachine = createMachine({
  id: 'insertionProfessionnelle',
  initial: 'attente',

  schemas: {
    context: {} as InsertionProfessionnelleContext,
    events: {} as
      | { type: 'INSCRIRE_DEMANDEUR'; demandeur: Demandeur }
      | { type: 'REALISER_BILAN' }
      | { type: 'BILAN_TERMINE'; bilan: BilanCompetences }
      | { type: 'RECHERCHER_OFFRES'; nombre: number }
      | { type: 'SOUMETTRE_CANDIDATURE' }
      | { type: 'ENTRETIEN_OBTENU' }
      | { type: 'REFUS_RECU' }
      | { type: 'EMPLOI_OBTENU' }
      | { type: 'SUIVRE_FORMATION' }
      | { type: 'ABANDON' }
      | { type: 'REINITIALISER' }
  },

  context: {
    demandeur: null,
    bilan: null,
    offresTrouvees: 0,
    candidaturesSoumises: 0,
    entretiensObtenus: 0,
    emploiTrouve: false,
  },

  states: {
    attente: {
      on: {
        INSCRIRE_DEMANDEUR: {
          target: 'bilanCompetences',
          actions: assign({
            demandeur: (_, event) => event.demandeur,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une nouvelle inscription pour insertion professionnelle',
      },
    },

    bilanCompetences: {
      on: {
        BILAN_TERMINE: {
          target: 'rechercheEmploi',
          actions: assign({
            bilan: (_, event) => event.bilan,
          }),
        },
        SUIVRE_FORMATION: {
          target: 'orientationFormation',
        },
      },

      meta: {
        description: 'Réalisation du bilan de compétences et définition du projet professionnel',
      },
    },

    orientationFormation: {
      on: {
        BILAN_TERMINE: {
          target: 'rechercheEmploi',
        },
      },

      meta: {
        description: 'Orientation vers formation professionnelle si compétences insuffisantes',
      },
    },

    rechercheEmploi: {
      on: {
        RECHERCHER_OFFRES: {
          target: 'offresTrouvees',
          actions: assign({
            offresTrouvees: (_, event) => event.nombre,
          }),
        },
      },

      meta: {
        description: 'Recherche active d\'offres d\'emploi adaptées au profil',
      },
    },

    offresTrouvees: {
      on: {
        SOUMETTRE_CANDIDATURE: {
          target: 'candidaturesSoumises',
          actions: assign({
            candidaturesSoumises: (context) => context.candidaturesSoumises + 1,
          }),
        },
        RECHERCHER_OFFRES: {
          target: 'offresTrouvees',
          actions: assign({
            offresTrouvees: (context, event) => context.offresTrouvees + event.nombre,
          }),
        },
      },

      meta: {
        description: 'Offres trouvées - préparation et soumission des candidatures',
      },
    },

    candidaturesSoumises: {
      on: {
        ENTRETIEN_OBTENU: {
          target: 'preparationEntretien',
          actions: assign({
            entretiensObtenus: (context) => context.entretiensObtenus + 1,
          }),
        },
        REFUS_RECU: {
          target: 'offresTrouvees',
        },
        SOUMETTRE_CANDIDATURE: {
          target: 'candidaturesSoumises',
          actions: assign({
            candidaturesSoumises: (context) => context.candidaturesSoumises + 1,
          }),
        },
      },

      meta: {
        description: 'Candidatures envoyées - attente de réponses',
      },
    },

    preparationEntretien: {
      on: {
        EMPLOI_OBTENU: {
          target: 'emploiObtenu',
          actions: assign({
            emploiTrouve: true,
          }),
        },
        REFUS_RECU: {
          target: 'offresTrouvees',
        },
      },

      meta: {
        description: 'Préparation et accompagnement pour l\'entretien d\'embauche',
      },
    },

    emploiObtenu: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Emploi obtenu - accompagnement pendant période d\'essai',
      },
    },

    abandon: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Démarche d\'insertion abandonnée',
      },
    },
  },
});

/**
 * Visualization of the professional integration workflow:
 *
 * attente
 *   → bilanCompetences
 *   → rechercheEmploi
 *   → offresTrouvees
 *   → candidaturesSoumises
 *   → preparationEntretien
 *   → emploiObtenu ✓
 */
