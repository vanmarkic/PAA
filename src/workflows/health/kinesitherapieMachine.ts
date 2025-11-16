/**
 * Machine XState pour Kinésithérapie
 */

import { createMachine, assign } from 'xstate';

interface PrescriptionKine {
  pathologie: string;
  nombreSeances: number;
  frequence: 'quotidien' | 'hebdomadaire';
}

interface KinesitherapieContext {
  patient: { nom: string; numeroINAMI: string } | null;
  prescription: PrescriptionKine | null;
  seancesEffectuees: number;
  progressionEvaluee: boolean;
}

export const kinesitherapieMachine = createMachine({
  id: 'kinesitherapie',
  initial: 'prescription',
  schemas: {
    context: {} as KinesitherapieContext,
    events: {} as
      | { type: 'PRESCRIRE'; prescription: PrescriptionKine; patient: any }
      | { type: 'EVALUER' }
      | { type: 'SEANCE_EFFECTUEE' }
      | { type: 'PROGRAMME_COMPLETE' }
  },
  context: {
    patient: null,
    prescription: null,
    seancesEffectuees: 0,
    progressionEvaluee: false,
  },
  states: {
    prescription: {
      on: {
        PRESCRIRE: {
          target: 'evaluationInitiale',
          actions: assign({
            prescription: (_, event) => event.prescription,
            patient: (_, event) => event.patient,
          }),
        },
      },
      meta: { description: 'Prescription médicale kinésithérapie' },
    },
    evaluationInitiale: {
      on: {
        EVALUER: {
          target: 'traitement',
          actions: assign({ progressionEvaluee: true }),
        },
      },
      meta: { description: 'Bilan kinésithérapique initial' },
    },
    traitement: {
      on: {
        SEANCE_EFFECTUEE: {
          target: 'traitement',
          actions: assign({
            seancesEffectuees: (context) => context.seancesEffectuees + 1,
          }),
        },
        PROGRAMME_COMPLETE: { target: 'evaluationFinale' },
      },
      meta: { description: 'Séances de rééducation fonctionnelle' },
    },
    evaluationFinale: {
      type: 'final',
      meta: { description: 'Bilan final et rapport au médecin prescripteur' },
    },
  },
});
