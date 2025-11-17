/**
 * Machine XState pour Vaccination Enfants
 */

import { createMachine, assign } from 'xstate';

interface EnfantVaccination {
  nom: string;
  dateNaissance: Date;
  ageEnMois: number;
}

interface VaccinationContext {
  enfant: EnfantVaccination | null;
  calendrierVaccins: string[];
  vaccinsAdministres: string[];
  prochainRappel: Date | null;
}

export const vaccinationEnfantsMachine = createMachine({
  id: 'vaccinationEnfants',
  initial: 'calendrierVaccinal',
  schemas: {
    context: {} as VaccinationContext,
    events: {} as
      | { type: 'INSCRIRE_ENFANT'; enfant: EnfantVaccination }
      | { type: 'VACCINER'; vaccin: string }
      | { type: 'RAPPEL_PLANIFIE'; date: Date }
      | { type: 'CALENDRIER_COMPLET' }
  },
  context: {
    enfant: null,
    calendrierVaccins: [] as string[],
    vaccinsAdministres: [] as string[],
    prochainRappel: null,
  },
  states: {
    calendrierVaccinal: {
      on: {
        INSCRIRE_ENFANT: {
          target: 'premieresVaccinations',
          actions: assign({
            enfant: ({ event }) => event.enfant,
            calendrierVaccins: [
              'Polio (2, 3, 4, 13 mois)',
              'Diphtérie-Tétanos (2, 3, 4, 13 mois)',
              'Coqueluche (2, 3, 4, 13 mois)',
              'Haemophilus (2, 3, 4, 13 mois)',
              'Hépatite B (2, 3, 4, 13 mois)',
              'Pneumocoque (2, 4, 13 mois)',
              'RRO - Rougeole-Rubéole-Oreillons (12 mois, 10-13 ans)',
              'Méningocoque C (13 mois)',
            ],
          }),
        },
      },
      meta: { description: 'Calendrier vaccinal obligatoire ONE/Kind&Gezin' },
    },
    premieresVaccinations: {
      on: {
        VACCINER: {
          target: 'premieresVaccinations',
          actions: assign({
            vaccinsAdministres: ({ context, event }) => [
              ...context.vaccinsAdministres,
              event.vaccin,
            ],
          }),
        },
        RAPPEL_PLANIFIE: {
          target: 'rappels',
          actions: assign({ prochainRappel: ({ event }) => event.date }),
        },
      },
      meta: { description: 'Vaccinations 2-13 mois (GRATUIT)' },
    },
    rappels: {
      on: {
        VACCINER: {
          target: 'rappels',
          actions: assign({
            vaccinsAdministres: ({ context, event }) => [
              ...context.vaccinsAdministres,
              event.vaccin,
            ],
          }),
        },
        CALENDRIER_COMPLET: { target: 'termine' },
      },
      meta: { description: 'Rappels 5-6 ans et 10-13 ans' },
    },
    termine: {
      type: 'final',
      meta: { description: 'Calendrier vaccinal complet' },
    },
  },
});
