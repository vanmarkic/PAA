/**
 * Machine XState pour Pharmacie et Médicaments
 */

import { createMachine, assign } from 'xstate';

interface Prescription {
  numeroOrdonnance: string;
  medicamentsPrescrits: string[];
  medecin: string;
  dateValidite: Date;
}

interface PharmacieContext {
  patient: { nom: string; numeroINAMI: string } | null;
  prescription: Prescription | null;
  medicamentsRembourses: string[];
  coutTotal: number;
  montantRembourse: number;
  ticketModerateur: number;
}

export const pharmacieMachine = createMachine({
  id: 'pharmacie',
  initial: 'inactif',

  schema: {
    context: {} as PharmacieContext,
    events: {} as
      | { type: 'PRESENTER_ORDONNANCE'; prescription: Prescription; patient: any }
      | { type: 'ORDONNANCE_VALIDE' }
      | { type: 'MEDICAMENTS_DISPONIBLES' }
      | { type: 'REMBOURSEMENT_CALCULE'; montant: number; ticket: number }
      | { type: 'PAIEMENT_EFFECTUE' }
  },

  context: {
    patient: null,
    prescription: null,
    medicamentsRembourses: [],
    coutTotal: 0,
    montantRembourse: 0,
    ticketModerateur: 0,
  },

  states: {
    inactif: {
      on: {
        PRESENTER_ORDONNANCE: {
          target: 'validationOrdonnance',
          actions: assign({
            prescription: (_, event) => event.prescription,
            patient: (_, event) => event.patient,
          }),
        },
      },
      meta: { description: 'En attente d\'ordonnance' },
    },

    validationOrdonnance: {
      on: {
        ORDONNANCE_VALIDE: { target: 'verificationStock' },
      },
      meta: { description: 'Validation de l\'ordonnance et vérification médecin prescripteur' },
    },

    verificationStock: {
      on: {
        MEDICAMENTS_DISPONIBLES: { target: 'calculRemboursement' },
      },
      meta: { description: 'Vérification disponibilité des médicaments' },
    },

    calculRemboursement: {
      on: {
        REMBOURSEMENT_CALCULE: {
          target: 'delivrance',
          actions: assign({
            montantRembourse: (_, event) => event.montant,
            ticketModerateur: (_, event) => event.ticket,
          }),
        },
      },
      meta: { description: 'Calcul remboursement mutuelle (40%-100% selon catégorie)' },
    },

    delivrance: {
      on: {
        PAIEMENT_EFFECTUE: { target: 'termine' },
      },
      meta: { description: 'Délivrance des médicaments' },
    },

    termine: {
      type: 'final',
      meta: { description: 'Médicaments délivrés' },
    },
  },
});
