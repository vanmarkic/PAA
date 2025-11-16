/**
 * Machine XState pour Procédure d'Adoption
 * Terminologie: Adoption plénière, agrément adoption, apparentement
 */

import { createMachine, assign } from 'xstate';

interface CandidatsAdoption {
  adoptants: string[]; // Couple ou personne seule
  mariageCohabitation: 'marie' | 'cohabitant-legal' | 'celibataire';
  ageMin: number; // 25 ans minimum
  enfantsActuels: number;
}

interface AdoptionContext {
  candidats: CandidatsAdoption | null;
  agrementObtenu: boolean;
  typeAdoption: 'nationale' | 'internationale';
  apparentementRealise: boolean;
  periodePlacement: boolean;
  jugementAdoptionRendu: boolean;
}

export const adoptionProcedureMachine = createMachine({
  id: 'adoptionProcedure',
  initial: 'informationPrealable',
  schemas: {
    context: {} as AdoptionContext,
    events: {} as
      | { type: 'SEANCES_INFO'; candidats: CandidatsAdoption }
      | { type: 'DEMANDE_AGREMENT' }
      | { type: 'ENQUETE_SOCIALE_PSYCHOLOGIQUE' }
      | { type: 'AGREMENT_ACCORDE'; type: 'nationale' | 'internationale' }
      | { type: 'APPARENTEMENT_REALISE' }
      | { type: 'PLACEMENT_DEBUTE' }
      | { type: 'REQUETE_ADOPTION' }
      | { type: 'JUGEMENT_ADOPTION' }
  },
  context: {
    candidats: null,
    agrementObtenu: false,
    typeAdoption: 'nationale',
    apparentementRealise: false,
    periodePlacement: false,
    jugementAdoptionRendu: false,
  },
  states: {
    informationPrealable: {
      on: {
        SEANCES_INFO: {
          target: 'demandeAgrement',
          actions: assign({ candidats: ({ event }) => event.candidats }),
        },
      },
      meta: {
        description: 'Séances d\'information obligatoires (6x2h)',
        organisateur: 'Autorité Centrale Communautaire Adoption',
        gratuit: true,
      },
    },
    demandeAgrement: {
      on: {
        DEMANDE_AGREMENT: { target: 'enqueteSocioPsychologique' },
      },
      meta: {
        description: 'Dépôt demande agrément adoption',
        conditions: {
          age: '25 ans minimum (18 si adoption enfant conjoint)',
          difference: '≥ 15 ans différence adoptant-adopté',
          mariage: 'Couple: marié ≥ 2 ans ou cohabitation légale ≥ 3 ans',
        },
      },
    },
    enqueteSocioPsychologique: {
      on: {
        ENQUETE_SOCIALE_PSYCHOLOGIQUE: { target: 'decisionAgrement' },
      },
      meta: {
        description: 'Enquête sociale et psychologique approfondie',
        contenu: [
          'Entretiens psychologiques',
          'Visite domicile',
          'Vérification casier judiciaire',
          'Motivations adoption',
          'Capacités éducatives',
          'Stabilité familiale/professionnelle',
        ],
        duree: '4-6 mois',
      },
    },
    decisionAgrement: {
      on: {
        AGREMENT_ACCORDE: {
          target: 'apparentement',
          actions: assign({
            agrementObtenu: true,
            typeAdoption: ({ event }) => event.type,
          }),
        },
      },
      meta: {
        description: 'Décision agrément par Autorité Centrale',
        validite: '2 ans renouvelable',
      },
    },
    apparentement: {
      on: {
        APPARENTEMENT_REALISE: {
          target: 'periodePlacement',
          actions: assign({ apparentementRealise: true }),
        },
      },
      meta: {
        description: 'Apparentement enfant-adoptants',
        definition: 'Mise en relation enfant adoptable avec famille',
        nationale: 'Communes de Flandre/Wallonie/Bruxelles',
        internationale: 'Via organismes agréés adoption internationale (OAA)',
      },
    },
    periodePlacement: {
      on: {
        PLACEMENT_DEBUTE: {
          target: 'requeteAdoption',
          actions: assign({ periodePlacement: true }),
        },
      },
      meta: {
        description: 'Période de placement préadoptif',
        duree: 'Minimum 6 mois sous surveillance SAJ/SPJ',
        objectif: 'Vérifier adaptation mutuelle',
      },
    },
    requeteAdoption: {
      on: {
        REQUETE_ADOPTION: { target: 'jugementAdoption' },
      },
      meta: {
        description: 'Requête en adoption devant tribunal famille',
        pieces: [
          'Agrément adoption',
          'Rapport placement SAJ',
          'Acte naissance enfant',
          'Consentement parents biologiques (si applicable)',
        ],
      },
    },
    jugementAdoption: {
      on: {
        JUGEMENT_ADOPTION: {
          target: 'termine',
          actions: assign({ jugementAdoptionRendu: true }),
        },
      },
      meta: {
        description: 'Jugement d\'adoption plénière',
        effets: {
          filiation: 'Lien filiation irrévocable',
          nomFamille: 'Nom famille adoptive',
          nationalite: 'Nationalité belge automatique si adoptants belges',
          successionHeritiere: 'Droits succession complets',
        },
      },
    },
    termine: {
      type: 'final',
      meta: {
        description: 'Adoption prononcée - transcription état civil',
        soutien: 'Suivi post-adoption disponible (psychologique, administratif)',
      },
    },
  },
});
