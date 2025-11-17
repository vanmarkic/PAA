/**
 * Machine XState pour Prime Rénovation Énergétique
 */

import { createMachine, assign } from 'xstate';

interface DemandeRenovation {
  typeLogement: 'maison' | 'appartement';
  travaux: string[];
  montantInvestissement: number;
  categorie: 'I' | 'II' | 'III' | 'IV'; // revenus
}

interface PrimeRenovationContext {
  demande: DemandeRenovation | null;
  auditEnergetique: boolean;
  montantPrime: number;
  travauxRealises: boolean;
  controleEffectue: boolean;
}

export const primeRenovationEnergetiqueMachine = createMachine({
  id: 'primeRenovationEnergetique',
  initial: 'auditEnergetique',
  schemas: {
    context: {} as PrimeRenovationContext,
    events: {} as
      | { type: 'DEMANDER_AUDIT' }
      | { type: 'AUDIT_REALISE' }
      | { type: 'DEMANDE_PRIME'; demande: DemandeRenovation }
      | { type: 'PRIME_ACCORDEE'; montant: number }
      | { type: 'TRAVAUX_REALISES' }
      | { type: 'CONTROLE_OK' }
      | { type: 'PAIEMENT_EFFECTUE' }
  },
  context: {
    demande: null,
    auditEnergetique: false,
    montantPrime: 0,
    travauxRealises: false,
    controleEffectue: false,
  },
  states: {
    auditEnergetique: {
      on: {
        DEMANDER_AUDIT: { target: 'realisationAudit' },
      },
      meta: { description: 'Audit énergétique préalable obligatoire' },
    },
    realisationAudit: {
      on: {
        AUDIT_REALISE: {
          target: 'depotDemande',
          actions: assign({ auditEnergetique: true }),
        },
      },
      meta: { description: 'Audit par auditeur agréé (subsidié à 80-90%)' },
    },
    depotDemande: {
      on: {
        DEMANDE_PRIME: {
          target: 'analyseDemande',
          actions: assign({ demande: ({ event }) => event.demande }),
        },
      },
      meta: { description: 'Dépôt demande AVANT début travaux' },
    },
    analyseDemande: {
      on: {
        PRIME_ACCORDEE: {
          target: 'realisationTravaux',
          actions: assign({ montantPrime: ({ event }) => event.montant }),
        },
      },
      meta: { description: 'Analyse conformité et calcul prime (30-70% selon revenus)' },
    },
    realisationTravaux: {
      on: {
        TRAVAUX_REALISES: {
          target: 'controle',
          actions: assign({ travauxRealises: true }),
        },
      },
      meta: { description: 'Travaux par entrepreneur qualifié (max 2 ans)' },
    },
    controle: {
      on: {
        CONTROLE_OK: {
          target: 'paiement',
          actions: assign({ controleEffectue: true }),
        },
      },
      meta: { description: 'Contrôle conformité travaux' },
    },
    paiement: {
      on: {
        PAIEMENT_EFFECTUE: { target: 'termine' },
      },
      meta: { description: 'Versement prime (délai 4-6 mois)' },
    },
    termine: {
      type: 'final',
      meta: { description: 'Prime versée' },
    },
  },
});
