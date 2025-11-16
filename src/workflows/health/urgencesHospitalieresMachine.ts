/**
 * Machine XState pour Urgences Hospitalières
 */

import { createMachine, assign } from 'xstate';

interface PatientUrgence {
  nom: string;
  numeroINAMI: string;
  symptomes: string;
  niveauGravite: 'critique' | 'urgent' | 'non-urgent';
}

interface UrgencesContext {
  patient: PatientUrgence | null;
  heureArrivee: Date | null;
  numeroTriage: number;
  examensRealises: string[];
  traitementAdministre: boolean;
  hospitalisation: boolean;
}

export const urgencesHospitalieresMachine = createMachine({
  id: 'urgencesHospitalieres',
  initial: 'arrivee',
  schemas: {
    context: {} as UrgencesContext,
    events: {} as
      | { type: 'PATIENT_ARRIVE'; patient: PatientUrgence }
      | { type: 'TRIAGE_EFFECTUE'; gravite: 'critique' | 'urgent' | 'non-urgent' }
      | { type: 'EXAMEN_MEDICAL' }
      | { type: 'TRAITEMENT_ADMINISTRE' }
      | { type: 'HOSPITALISER' }
      | { type: 'AUTORISER_SORTIE' }
  },
  context: {
    patient: null,
    heureArrivee: null,
    numeroTriage: 0,
    examensRealises: [],
    traitementAdministre: false,
    hospitalisation: false,
  },
  states: {
    arrivee: {
      on: {
        PATIENT_ARRIVE: {
          target: 'triage',
          actions: assign({
            patient: ({ event }) => event.patient,
            heureArrivee: () => new Date(),
          }),
        },
      },
      meta: { description: 'Arrivée aux urgences' },
    },
    triage: {
      on: {
        TRIAGE_EFFECTUE: [
          {
            target: 'priseEnChargeImmediate',
            guard: ({ event }) => event.gravite === 'critique',
          },
          {
            target: 'salleAttente',
          },
        ],
      },
      meta: { description: 'Triage infirmier - évaluation priorité' },
    },
    priseEnChargeImmediate: {
      on: {
        EXAMEN_MEDICAL: { target: 'traitement' },
      },
      meta: { description: 'Prise en charge immédiate (cas critique)' },
    },
    salleAttente: {
      on: {
        EXAMEN_MEDICAL: { target: 'examenMedical' },
      },
      meta: { description: 'Salle d\'attente selon priorité triage' },
    },
    examenMedical: {
      on: {
        TRAITEMENT_ADMINISTRE: { target: 'traitement' },
      },
      meta: { description: 'Examen médical par médecin urgentiste' },
    },
    traitement: {
      on: {
        HOSPITALISER: {
          target: 'hospitalisation',
          actions: assign({ hospitalisation: true }),
        },
        AUTORISER_SORTIE: { target: 'sortie' },
      },
      meta: { description: 'Traitement médical d\'urgence' },
    },
    hospitalisation: {
      type: 'final',
      meta: { description: 'Transfert vers service hospitalisation' },
    },
    sortie: {
      type: 'final',
      meta: { description: 'Autorisation sortie avec ordonnance' },
    },
  },
});
