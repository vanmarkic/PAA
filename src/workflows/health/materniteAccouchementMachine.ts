/**
 * Machine XState pour Maternité et Accouchement
 */

import { createMachine, assign } from 'xstate';

interface Grossesse {
  termeGrossesse: number; // semaines
  grossesseRisque: boolean;
  dateAccouchement: Date;
}

interface MaterniteContext {
  patiente: { nom: string; numeroINAMI: string } | null;
  grossesse: Grossesse | null;
  consultationsPrenatales: number;
  accouchementEffectue: boolean;
  sejourJours: number;
}

export const materniteAccouchementMachine = createMachine({
  id: 'materniteAccouchement',
  initial: 'suiviPrenatal',
  schema: {
    context: {} as MaterniteContext,
    events: {} as
      | { type: 'GROSSESSE_CONFIRMEE'; grossesse: Grossesse; patiente: any }
      | { type: 'CONSULTATION_PRENATALE' }
      | { type: 'TRAVAIL_DEBUTE' }
      | { type: 'ADMISSION_MATERNITE' }
      | { type: 'ACCOUCHEMENT' }
      | { type: 'SURVEILLANCE_OK' }
      | { type: 'AUTORISER_SORTIE' }
  },
  context: {
    patiente: null,
    grossesse: null,
    consultationsPrenatales: 0,
    accouchementEffectue: false,
    sejourJours: 0,
  },
  states: {
    suiviPrenatal: {
      on: {
        GROSSESSE_CONFIRMEE: {
          target: 'consultationsRegulieress',
          actions: assign({
            grossesse: (_, event) => event.grossesse,
            patiente: (_, event) => event.patiente,
          }),
        },
      },
      meta: { description: 'Confirmation grossesse et inscription ONE/Kind&Gezin' },
    },
    consultationsRegulieres: {
      on: {
        CONSULTATION_PRENATALE: {
          target: 'consultationsRegulieres',
          actions: assign({
            consultationsPrenatales: (context) => context.consultationsPrenatales + 1,
          }),
        },
        TRAVAIL_DEBUTE: { target: 'admissionMaternite' },
      },
      meta: { description: 'Consultations prénatales mensuelles (7 remboursées)' },
    },
    admissionMaternite: {
      on: {
        ADMISSION_MATERNITE: { target: 'accouchement' },
      },
      meta: { description: 'Admission maternité - début travail' },
    },
    accouchement: {
      on: {
        ACCOUCHEMENT: {
          target: 'sejourPostnatal',
          actions: assign({ accouchementEffectue: true }),
        },
      },
      meta: { description: 'Accouchement avec équipe médicale' },
    },
    sejourPostnatal: {
      on: {
        SURVEILLANCE_OK: { target: 'sortieMaison' },
      },
      meta: { description: 'Séjour postnatal 3-5 jours (mère + bébé)' },
    },
    sortieMaison: {
      on: {
        AUTORISER_SORTIE: { target: 'termine' },
      },
      meta: { description: 'Préparation retour maison + suivi sage-femme' },
    },
    termine: {
      type: 'final',
      meta: { description: 'Sortie maternité - suivi ONE/K&G à domicile' },
    },
  },
});
