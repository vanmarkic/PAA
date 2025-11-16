/**
 * Machine XState pour Déclaration TVA
 */

import { createMachine, assign } from 'xstate';

interface EntrepriseTVA {
  numeroBCE: string;
  numeroTVA: string;
  regime: 'mensuel' | 'trimestriel';
  chiffreAffaires: number;
}

interface DeclarationTVAContext {
  entreprise: EntrepriseTVA | null;
  periode: string | null;
  tvaCollectee: number;
  tvaDeductible: number;
  solde: number;
  declarationTransmise: boolean;
  paiementEffectue: boolean;
}

export const declarationTVAMachine = createMachine({
  id: 'declarationTVA',
  initial: 'periode',
  schemas: {
    context: {} as DeclarationTVAContext,
    events: {} as
      | { type: 'NOUVELLE_PERIODE'; entreprise: EntrepriseTVA; periode: string }
      | { type: 'COMPTABILITE_FINALISEE'; collectee: number; deductible: number }
      | { type: 'DECLARATION_REMPLIE' }
      | { type: 'TRANSMISSION_INTERVAT' }
      | { type: 'PAIEMENT_EFFECTUE' }
  },
  context: {
    entreprise: null,
    periode: null,
    tvaCollectee: 0,
    tvaDeductible: 0,
    solde: 0,
    declarationTransmise: false,
    paiementEffectue: false,
  },
  states: {
    periode: {
      on: {
        NOUVELLE_PERIODE: {
          target: 'comptabilisation',
          actions: assign({
            entreprise: ({ event }) => event.entreprise,
            periode: ({ event }) => event.periode,
          }),
        },
      },
      meta: { description: 'Nouvelle période TVA (mois ou trimestre)' },
    },
    comptabilisation: {
      on: {
        COMPTABILITE_FINALISEE: {
          target: 'redactionDeclaration',
          actions: assign({
            tvaCollectee: ({ event }) => event.collectee,
            tvaDeductible: ({ event }) => event.deductible,
            solde: ({ event }) => event.collectee - event.deductible,
          }),
        },
      },
      meta: { description: 'Comptabilisation TVA collectée et déductible' },
    },
    redactionDeclaration: {
      on: {
        DECLARATION_REMPLIE: { target: 'transmissionIntervat' },
      },
      meta: { description: 'Rédaction déclaration périodique' },
    },
    transmissionIntervat: {
      on: {
        TRANSMISSION_INTERVAT: {
          target: 'paiement',
          actions: assign({ declarationTransmise: true }),
        },
      },
      meta: { description: 'Transmission électronique via Intervat (MyMinfin)' },
    },
    paiement: {
      on: {
        PAIEMENT_EFFECTUE: {
          target: 'termine',
          actions: assign({ paiementEffectue: true }),
        },
      },
      meta: { description: 'Paiement TVA due (délai: 20 du mois suivant)' },
    },
    termine: {
      type: 'final',
      meta: { description: 'Déclaration TVA clôturée' },
    },
  },
});
