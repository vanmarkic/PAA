/**
 * Machine XState pour Chirurgie Ambulatoire
 */

import { createMachine, assign } from 'xstate';

interface PatientChirurgie {
  nom: string;
  typeIntervention: string;
  anesthesie: 'locale' | 'generale';
}

interface ChirurgieContext {
  patient: PatientChirurgie | null;
  bilanPreoperatoire: boolean;
  interventionReussie: boolean;
  tempsReveil: number;
}

export const chirurgieAmbulatoireMachine = createMachine({
  id: 'chirurgieAmbulatoire',
  initial: 'consultationPreoperatoire',
  schemas: {
    context: {} as ChirurgieContext,
    events: {} as
      | { type: 'PLANIFIER'; patient: PatientChirurgie }
      | { type: 'BILAN_OK' }
      | { type: 'ANESTHESIE_ADMINISTREE' }
      | { type: 'INTERVENTION_REUSSIE' }
      | { type: 'REVEIL_COMPLET' }
      | { type: 'AUTORISER_SORTIE' }
  },
  context: {
    patient: null,
    bilanPreoperatoire: false,
    interventionReussie: false,
    tempsReveil: 0,
  },
  states: {
    consultationPreoperatoire: {
      on: {
        PLANIFIER: {
          target: 'bilanPreoperatoire',
          actions: assign({ patient: ({ event }) => event.patient }),
        },
      },
      meta: { description: 'Consultation chirurgien + anesthésiste' },
    },
    bilanPreoperatoire: {
      on: {
        BILAN_OK: {
          target: 'jourIntervention',
          actions: assign({ bilanPreoperatoire: true }),
        },
      },
      meta: { description: 'Bilan sanguin, ECG, radiographies si nécessaire' },
    },
    jourIntervention: {
      on: {
        ANESTHESIE_ADMINISTREE: { target: 'intervention' },
      },
      meta: { description: 'Admission jour J - à jeun' },
    },
    intervention: {
      on: {
        INTERVENTION_REUSSIE: {
          target: 'salleReveil',
          actions: assign({ interventionReussie: true }),
        },
      },
      meta: { description: 'Intervention chirurgicale' },
    },
    salleReveil: {
      on: {
        REVEIL_COMPLET: { target: 'surveillance' },
      },
      meta: { description: 'Salle de réveil post-opératoire' },
    },
    surveillance: {
      on: {
        AUTORISER_SORTIE: { target: 'sortie' },
      },
      meta: { description: 'Surveillance 2-6h selon intervention' },
    },
    sortie: {
      type: 'final',
      meta: { description: 'Sortie le jour même avec accompagnant obligatoire' },
    },
  },
});
