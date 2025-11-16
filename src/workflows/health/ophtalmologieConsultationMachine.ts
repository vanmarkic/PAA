/**
 * Machine XState pour Consultation Ophtalmologie
 * Terminologie: Ophtalmologue, optométriste, lunettes/lentilles correctrices
 */

import { createMachine, assign } from 'xstate';

interface PatientOphtalmo {
  nom: string;
  numeroINAMI: string;
  age: number;
  porteLunettes: boolean;
  derniereVisite: Date | null;
}

interface OphtalmologieContext {
  patient: PatientOphtalmo | null;
  examenVue: boolean;
  prescription: string | null; // Correction dioptries
  typeLunettes: 'unifocales' | 'bifocales' | 'progressives' | 'lentilles';
  montantLunettes: number;
  interventionMutuelle: number;
}

export const ophtalmologieConsultationMachine = createMachine({
  id: 'ophtalmologieConsultation',
  initial: 'consultation',
  schema: {
    context: {} as OphtalmologieContext,
    events: {} as
      | { type: 'CONSULTER'; patient: PatientOphtalmo }
      | { type: 'EXAMEN_REALISE' }
      | { type: 'PRESCRIPTION_ETABLIE'; correction: string }
      | { type: 'CHOISIR_LUNETTES'; type: 'unifocales' | 'bifocales' | 'progressives' | 'lentilles'; montant: number }
      | { type: 'INTERVENTION_CALCULEE'; intervention: number }
  },
  context: {
    patient: null,
    examenVue: false,
    prescription: null,
    typeLunettes: 'unifocales',
    montantLunettes: 0,
    interventionMutuelle: 0,
  },
  states: {
    consultation: {
      on: {
        CONSULTER: {
          target: 'examenOphtalmologique',
          actions: assign({ patient: (_, event) => event.patient }),
        },
      },
      meta: {
        description: 'Consultation ophtalmologue',
        remboursement: '60% (spécialiste)',
      },
    },
    examenOphtalmologique: {
      on: {
        EXAMEN_REALISE: {
          target: 'prescriptionLunettes',
          actions: assign({ examenVue: true }),
        },
      },
      meta: {
        description: 'Examen complet de la vue',
        tests: [
          'Acuité visuelle',
          'Réfraction (myopie, hypermétropie, astigmatisme)',
          'Pression intraoculaire (glaucome)',
          'Fond d\'œil',
        ],
      },
    },
    prescriptionLunettes: {
      on: {
        PRESCRIPTION_ETABLIE: {
          target: 'choixLunettes',
          actions: assign({ prescription: (_, event) => event.correction }),
        },
      },
      meta: {
        description: 'Prescription correction visuelle',
        validite: '5 ans (adulte), 1 an (< 16 ans)',
      },
    },
    choixLunettes: {
      on: {
        CHOISIR_LUNETTES: {
          target: 'interventionOptique',
          actions: assign({
            typeLunettes: (_, event) => event.type,
            montantLunettes: (_, event) => event.montant,
          }),
        },
      },
      meta: {
        description: 'Choix lunettes/lentilles chez opticien',
        ou: 'Optométriste agréé',
      },
    },
    interventionOptique: {
      on: {
        INTERVENTION_CALCULEE: {
          target: 'termine',
          actions: assign({ interventionMutuelle: (_, event) => event.intervention }),
        },
      },
      meta: {
        description: 'Intervention mutuelle pour lunettes',
        remboursementLegal: {
          verres: {
            adulte: '±25€ (tous 5 ans)',
            enfant: '±25-50€ (chaque année)',
          },
          monture: '±7€',
        },
        interventionComplementaire: {
          mutuelles: 'Intervention supplémentaire selon mutuelle (50-200€)',
          frequence: 'Tous les 2-3 ans généralement',
        },
        coutMoyen: {
          unifocales: '100-300€',
          progressives: '300-600€',
          lentilles: '200-400€/an',
        },
      },
    },
    termine: {
      type: 'final',
      meta: {
        description: 'Lunettes/lentilles obtenues',
        conseil: 'Contrôle vue tous les 2 ans recommandé (annuel si < 16 ans ou > 45 ans)',
      },
    },
  },
});
