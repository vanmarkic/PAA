/**
 * Machine XState pour Permis d'Environnement
 */

import { createMachine, assign } from 'xstate';

interface DemandePermis {
  nomEntreprise: string;
  typeActivite: string;
  classePermis: '1' | '2' | '3';
  commune: string;
  impactEnvironnemental: 'faible' | 'moyen' | 'eleve';
}

interface PermisEnvironnementContext {
  demande: DemandePermis | null;
  enquetePubliqueRequise: boolean;
  etudeImpactRequise: boolean;
  avisFavorable: boolean;
  conditionsImposees: string[];
  dureeValidite: number;
}

export const permisEnvironnementMachine = createMachine({
  id: 'permisEnvironnement',
  initial: 'inactif',

  schemas: {
    context: {} as PermisEnvironnementContext,
    events: {} as
      | { type: 'DEPOSER_DEMANDE'; demande: DemandePermis }
      | { type: 'DOSSIER_COMPLET' }
      | { type: 'ETUDE_IMPACT_REALISEE' }
      | { type: 'ENQUETE_PUBLIQUE_LANCEE' }
      | { type: 'ENQUETE_TERMINEE' }
      | { type: 'AVIS_FAVORABLE' }
      | { type: 'AVIS_DEFAVORABLE' }
      | { type: 'PERMIS_DELIVRE' }
  },

  context: {
    demande: null,
    enquetePubliqueRequise: false,
    etudeImpactRequise: false,
    avisFavorable: false,
    conditionsImposees: [],
    dureeValidite: 20,
  },

  states: {
    inactif: {
      on: {
        DEPOSER_DEMANDE: {
          target: 'examenRecevabilite',
          actions: assign({
            demande: (_, event) => event.demande,
            enquetePubliqueRequise: (_, event) => event.demande.classePermis === '1',
            etudeImpactRequise: (_, event) => event.demande.impactEnvironnemental === 'eleve',
          }),
        },
      },
      meta: { description: 'Pas de demande en cours' },
    },

    examenRecevabilite: {
      on: {
        DOSSIER_COMPLET: [
          {
            target: 'etudeImpact',
            guard: (context) => context.etudeImpactRequise,
          },
          {
            target: 'enquetePublique',
            guard: (context) => context.enquetePubliqueRequise,
          },
          {
            target: 'instructionTechnique',
          },
        ],
      },
      meta: { description: 'Examen de la recevabilité du dossier' },
    },

    etudeImpact: {
      on: {
        ETUDE_IMPACT_REALISEE: { target: 'enquetePublique' },
      },
      meta: { description: 'Réalisation étude d\'impact environnemental (classe 1)' },
    },

    enquetePublique: {
      on: {
        ENQUETE_PUBLIQUE_LANCEE: { target: 'enqueteEnCours' },
      },
      meta: { description: 'Lancement enquête publique obligatoire' },
    },

    enqueteEnCours: {
      on: {
        ENQUETE_TERMINEE: { target: 'instructionTechnique' },
      },
      meta: { description: 'Enquête publique (30 jours) - avis citoyens' },
    },

    instructionTechnique: {
      on: {
        AVIS_FAVORABLE: {
          target: 'delivrancePermis',
          actions: assign({ avisFavorable: true }),
        },
        AVIS_DEFAVORABLE: { target: 'refuse' },
      },
      meta: { description: 'Instruction technique par le service environnement' },
    },

    delivrancePermis: {
      on: {
        PERMIS_DELIVRE: { target: 'termine' },
      },
      meta: { description: 'Délivrance du permis avec conditions' },
    },

    refuse: {
      type: 'final',
      meta: { description: 'Demande refusée - possibilité de recours' },
    },

    termine: {
      type: 'final',
      meta: { description: 'Permis délivré - validité 20 ans' },
    },
  },
});
