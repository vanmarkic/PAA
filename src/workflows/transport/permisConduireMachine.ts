/**
 * Machine XState pour Permis de Conduire
 * Terminologie: Permis de conduire provisoire (18 mois ou 36 mois), permis définitif
 */

import { createMachine, assign } from 'xstate';

interface CandidatPermis {
  nom: string;
  age: number;
  categoriePermis: 'B' | 'A' | 'C' | 'D'; // B = voiture, A = moto
  filiere: '3h' | '6h' | '12h' | '20h' | 'libre'; // Heures formation obligatoires
}

interface PermisConduireContext {
  candidat: CandidatPermis | null;
  examenTheoriqueReussi: boolean;
  heuresFormation: number;
  permisProvisoire: boolean;
  dureeProvisoire: 18 | 36; // 18 mois (filière guidée) ou 36 mois (libre)
  examenPratiqueReussi: boolean;
  permisDefinitif: boolean;
}

export const permisConduireMachine = createMachine({
  id: 'permisConduire',
  initial: 'inscriptionAutoEcole',
  schema: {
    context: {} as PermisConduireContext,
    events: {} as
      | { type: 'INSCRIRE'; candidat: CandidatPermis }
      | { type: 'EXAMEN_THEORIQUE' }
      | { type: 'THEORIQUE_REUSSI' }
      | { type: 'FORMATION_PRATIQUE'; heures: number }
      | { type: 'PERMIS_PROVISOIRE_DELIVRE'; duree: 18 | 36 }
      | { type: 'EXAMEN_PRATIQUE' }
      | { type: 'PRATIQUE_REUSSI' }
      | { type: 'PERMIS_DEFINITIF_DELIVRE' }
  },
  context: {
    candidat: null,
    examenTheoriqueReussi: false,
    heuresFormation: 0,
    permisProvisoire: false,
    dureeProvisoire: 18,
    examenPratiqueReussi: false,
    permisDefinitif: false,
  },
  states: {
    inscriptionAutoEcole: {
      on: {
        INSCRIRE: {
          target: 'formationTheorique',
          actions: assign({ candidat: (_, event) => event.candidat }),
        },
      },
      meta: {
        description: 'Inscription auto-école agréée',
        ageMinimum: {
          B: '17 ans (formation précoce)',
          A2: '18 ans (moto < 35kW)',
          A: '24 ans (moto > 35kW) ou 20 ans (progression A2)',
        },
      },
    },
    formationTheorique: {
      on: {
        EXAMEN_THEORIQUE: { target: 'examenTheorique' },
      },
      meta: {
        description: 'Formation théorique (code de la route)',
        contenu: '50 heures cours (recommandé)',
      },
    },
    examenTheorique: {
      on: {
        THEORIQUE_REUSSI: {
          target: 'formationPratique',
          actions: assign({ examenTheoriqueReussi: true }),
        },
      },
      meta: {
        description: 'Examen théorique centres agréés (Goca/Bureau Véritas)',
        questionnaire: '50 questions, max 5 fautes',
        coutExamen: '15€',
      },
    },
    formationPratique: {
      on: {
        FORMATION_PRATIQUE: {
          target: 'permisProvisoire',
          actions: assign({ heuresFormation: (_, event) => event.heures }),
        },
      },
      meta: {
        description: 'Formation pratique obligatoire',
        filieres: {
          '3h': '3h minimum (+ guide privé) - durée 18 mois',
          '6h': '6h minimum (+ guide privé) - durée 18 mois',
          '12h': '12h minimum (+ guide privé) - durée 18 mois',
          '20h': '20h minimum (sans guide) - durée 18 mois',
          libre: 'Avec guide privé uniquement - durée 36 mois',
        },
      },
    },
    permisProvisoire: {
      on: {
        PERMIS_PROVISOIRE_DELIVRE: {
          target: 'conduiteProvisoire',
          actions: assign({
            permisProvisoire: true,
            dureeProvisoire: (_, event) => event.duree,
          }),
        },
      },
      meta: {
        description: 'Délivrance permis provisoire (18 ou 36 mois)',
        conditions: {
          guide: 'Accompagnateur 8+ ans permis (si filière guidée)',
          plaque: 'Plaque "L" obligatoire',
          interdictions: 'Autoroute interdite 6 premiers mois',
        },
      },
    },
    conduiteProvisoire: {
      on: {
        EXAMEN_PRATIQUE: { target: 'examenPratique' },
      },
      meta: {
        description: 'Période conduite avec permis provisoire',
        duree: '18 mois (filière guidée) ou 36 mois (libre)',
      },
    },
    examenPratique: {
      on: {
        PRATIQUE_REUSSI: {
          target: 'permisDefinitif',
          actions: assign({ examenPratiqueReussi: true }),
        },
      },
      meta: {
        description: 'Examen pratique avec examinateur agréé',
        epreuves: 'Manœuvres + conduite 45 minutes',
        coutExamen: '30€',
      },
    },
    permisDefinitif: {
      on: {
        PERMIS_DEFINITIF_DELIVRE: {
          target: 'termine',
          actions: assign({ permisDefinitif: true }),
        },
      },
      meta: {
        description: 'Délivrance permis de conduire définitif',
        validite: {
          jeuneConducteur: '3 ans (2 ans probatoires)',
          ensuite: '10 ans (renouvelable)',
          apres70ans: '3 ou 5 ans (examen médical)',
        },
      },
    },
    termine: {
      type: 'final',
      meta: {
        description: 'Permis de conduire obtenu',
      },
    },
  },
});
