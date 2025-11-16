/**
 * Machine XState pour Logement Insalubre - Procédure
 * Terminologie: Arrêté d'insalubrité (Code wallon du logement)
 */

import { createMachine, assign } from 'xstate';

interface SignalementInsalubrite {
  adresse: string;
  locataire: string;
  problemes: string[]; // humidité, moisissures, installation électrique défectueuse
  photosPreuves: boolean;
}

interface LogementInsalubreContext {
  signalement: SignalementInsalubrite | null;
  inspectionRealisee: boolean;
  arreteInsalubrite: boolean; // Terme juridique consacré
  travauxImposes: string[];
  delaiTravaux: number; // jours
  sanctionBailleur: boolean;
}

export const logementInsalubreMachine = createMachine({
  id: 'logementInsalubre',
  initial: 'signalement',
  schemas: {
    context: {} as LogementInsalubreContext,
    events: {} as
      | { type: 'SIGNALER'; signalement: SignalementInsalubrite }
      | { type: 'INSPECTION_PROGRAMMEE' }
      | { type: 'INSPECTION_EFFECTUEE' }
      | { type: 'ARRETE_INSALUBRITE'; travaux: string[]; delai: number }
      | { type: 'TRAVAUX_REALISES' }
      | { type: 'SANCTION_BAILLEUR' }
  },
  context: {
    signalement: null,
    inspectionRealisee: false,
    arreteInsalubrite: false,
    travauxImposes: [],
    delaiTravaux: 0,
    sanctionBailleur: false,
  },
  states: {
    signalement: {
      on: {
        SIGNALER: {
          target: 'enregistrementPlainte',
          actions: assign({ signalement: (_, event) => event.signalement }),
        },
      },
      meta: {
        description: 'Signalement logement insalubre au service communal du logement',
        ou: 'Direction générale opérationnelle du Logement (DGO4) - Wallonie',
      },
    },
    enregistrementPlainte: {
      on: {
        INSPECTION_PROGRAMMEE: { target: 'inspectionTechnique' },
      },
      meta: { description: 'Enregistrement plainte par service logement communal' },
    },
    inspectionTechnique: {
      on: {
        INSPECTION_EFFECTUEE: {
          target: 'evaluationConformite',
          actions: assign({ inspectionRealisee: true }),
        },
      },
      meta: {
        description: 'Visite inspection par agent technique',
        delai: '30 jours maximum après signalement',
      },
    },
    evaluationConformite: {
      on: {
        ARRETE_INSALUBRITE: {
          target: 'arreteInsalubrite',
          actions: assign({
            arreteInsalubrite: true,
            travauxImposes: (_, event) => event.travaux,
            delaiTravaux: (_, event) => event.delai,
          }),
        },
      },
      meta: {
        description: 'Évaluation conformité Code wallon du logement',
        criteres: 'Sécurité, salubrité, équipement minimal',
      },
    },
    arreteInsalubrite: {
      on: {
        TRAVAUX_REALISES: { target: 'leveeArrete' },
        SANCTION_BAILLEUR: {
          target: 'procedureSanction',
          actions: assign({ sanctionBailleur: true }),
        },
      },
      meta: {
        description: 'Arrêté d\'insalubrité notifié au bailleur',
        obligations: 'Travaux dans délai imposé (généralement 6-12 mois)',
        interdiction: 'Interdiction location si insalubrité grave',
      },
    },
    procedureSanction: {
      on: {
        TRAVAUX_REALISES: { target: 'leveeArrete' },
      },
      meta: {
        description: 'Sanction bailleur défaillant',
        sanctions: 'Amende, astreinte, interdiction louer, réquisition',
      },
    },
    leveeArrete: {
      type: 'final',
      meta: {
        description: 'Levée arrêté insalubrité après travaux conformité',
      },
    },
  },
});
