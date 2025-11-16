/**
 * Machine XState pour Hospitalisation
 */

import { createMachine, assign } from 'xstate';

interface PatientHospitalisation {
  nom: string;
  numeroINAMI: string;
  assuranceHospitalisation: boolean;
  typeChambre: 'commune' | 'double' | 'individuelle';
}

interface HospitalisationContext {
  patient: PatientHospitalisation | null;
  dureeSejourJours: number;
  coutTotal: number;
  montantRembourse: number;
  supplementChambre: number;
}

export const hospitalisationMachine = createMachine({
  id: 'hospitalisation',
  initial: 'inactif',

  schemas: {
    context: {} as HospitalisationContext,
    events: {} as
      | { type: 'ADMISSION'; patient: PatientHospitalisation }
      | { type: 'TRAITEMENT_DEBUTE'; duree: number }
      | { type: 'TRAITEMENT_TERMINE' }
      | { type: 'FACTURE_GENEREE'; cout: number }
      | { type: 'SORTIE' }
  },

  context: {
    patient: null,
    dureeSejourJours: 0,
    coutTotal: 0,
    montantRembourse: 0,
    supplementChambre: 0,
  },

  states: {
    inactif: {
      on: {
        ADMISSION: {
          target: 'admission',
          actions: assign({
            patient: (_, event) => event.patient,
          }),
        },
      },
      meta: {
        description: 'En attente d\'admission',
      },
    },

    admission: {
      on: {
        TRAITEMENT_DEBUTE: {
          target: 'hospitalise',
          actions: assign({
            dureeSejourJours: (_, event) => event.duree,
          }),
        },
      },
      meta: {
        description: 'Admission du patient - vérification des documents et assurance',
      },
    },

    hospitalise: {
      on: {
        TRAITEMENT_TERMINE: {
          target: 'facturation',
        },
      },
      meta: {
        description: 'Patient hospitalisé - traitement en cours',
      },
    },

    facturation: {
      on: {
        FACTURE_GENEREE: {
          target: 'remboursement',
          actions: assign({
            coutTotal: (_, event) => event.cout,
          }),
        },
      },
      meta: {
        description: 'Génération de la facture hospitalière',
      },
    },

    remboursement: {
      on: {
        SORTIE: {
          target: 'termine',
        },
      },
      meta: {
        description: 'Traitement du remboursement par la mutuelle',
      },
    },

    termine: {
      type: 'final',
      meta: {
        description: 'Hospitalisation terminée et facturée',
      },
    },
  },
});
