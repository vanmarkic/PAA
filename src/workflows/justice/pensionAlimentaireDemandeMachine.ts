/**
 * Machine XState pour Demande Pension Alimentaire
 */

import { createMachine, assign } from 'xstate';

interface PartiePension {
  creancier: string; // parent gardien
  debiteur: string; // parent payeur
  enfants: number;
  revenuCreancier: number;
  revenuDebiteur: number;
}

interface PensionAlimentaireContext {
  parties: PartiePension | null;
  montantPropose: number;
  montantFixe: number;
  indexation: boolean;
}

export const pensionAlimentaireDemandeMachine = createMachine({
  id: 'pensionAlimentaireDemande',
  initial: 'demande',
  schemas: {
    context: {} as PensionAlimentaireContext,
    events: {} as
      | { type: 'DEPOSER_DEMANDE'; parties: PartiePension }
      | { type: 'REVENUS_EVALUES' }
      | { type: 'MONTANT_PROPOSE'; montant: number }
      | { type: 'ACCORD_PARTIES' }
      | { type: 'JUGEMENT_RENDU'; montant: number }
  },
  context: {
    parties: null,
    montantPropose: 0,
    montantFixe: 0,
    indexation: true,
  },
  states: {
    demande: {
      on: {
        DEPOSER_DEMANDE: {
          target: 'evaluationRessources',
          actions: assign({ parties: ({ event }) => event.parties }),
        },
      },
      meta: { description: 'Demande contribution alimentaire' },
    },
    evaluationRessources: {
      on: {
        REVENUS_EVALUES: { target: 'calculMontant' },
      },
      meta: { description: 'Évaluation revenus et charges des 2 parents' },
    },
    calculMontant: {
      on: {
        MONTANT_PROPOSE: {
          target: 'audienceConciliation',
          actions: assign({ montantPropose: ({ event }) => event.montant }),
        },
      },
      meta: { description: 'Calcul selon grille indicative (± 150-300€/enfant/mois)' },
    },
    audienceConciliation: {
      on: {
        ACCORD_PARTIES: { target: 'homologation' },
        JUGEMENT_RENDU: {
          target: 'decisionJugement',
          actions: assign({ montantFixe: ({ event }) => event.montant }),
        },
      },
      meta: { description: 'Audience conciliation tribunal famille' },
    },
    homologation: {
      type: 'final',
      meta: { description: 'Homologation accord amiable' },
    },
    decisionJugement: {
      type: 'final',
      meta: { description: 'Jugement fixant pension + indexation annuelle automatique' },
    },
  },
});
