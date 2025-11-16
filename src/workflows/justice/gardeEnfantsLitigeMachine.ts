/**
 * Machine XState pour Litige Garde des Enfants
 */

import { createMachine, assign } from 'xstate';

interface Parents {
  parent1: string;
  parent2: string;
  enfants: number;
  propositionGarde: 'exclusive' | 'alternee' | 'hebergement-secondaire';
}

interface GardeEnfantsContext {
  parents: Parents | null;
  mediationTentee: boolean;
  expertisePsychologique: boolean;
  decisionJuge: string | null;
  hebergementPrincipal: string | null;
}

export const gardeEnfantsLitigeMachine = createMachine({
  id: 'gardeEnfantsLitige',
  initial: 'demande',
  schemas: {
    context: {} as GardeEnfantsContext,
    events: {} as
      | { type: 'DEPOSER_DEMANDE'; parents: Parents }
      | { type: 'MEDIATION_ACCEPTEE' }
      | { type: 'MEDIATION_REFUSEE' }
      | { type: 'ACCORD_MEDIATION' }
      | { type: 'EXPERTISE_ORDONNEE' }
      | { type: 'EXPERTISE_RENDUE' }
      | { type: 'JUGEMENT'; decision: string; hebergementPrincipal: string }
  },
  context: {
    parents: null,
    mediationTentee: false,
    expertisePsychologique: false,
    decisionJuge: null,
    hebergementPrincipal: null,
  },
  states: {
    demande: {
      on: {
        DEPOSER_DEMANDE: {
          target: 'tentativeMediation',
          actions: assign({ parents: ({ event }) => event.parents }),
        },
      },
      meta: { description: 'Demande fixation hébergement au tribunal famille' },
    },
    tentativeMediation: {
      on: {
        MEDIATION_ACCEPTEE: {
          target: 'seancesMediation',
          actions: assign({ mediationTentee: true }),
        },
        MEDIATION_REFUSEE: { target: 'audienceTribunal' },
      },
      meta: { description: 'Tentative médiation familiale (recommandée)' },
    },
    seancesMediation: {
      on: {
        ACCORD_MEDIATION: { target: 'homologationAccord' },
        EXPERTISE_ORDONNEE: { target: 'expertisePsychologique' },
      },
      meta: { description: 'Séances médiation pour accord amiable' },
    },
    expertisePsychologique: {
      on: {
        EXPERTISE_RENDUE: {
          target: 'audienceTribunal',
          actions: assign({ expertisePsychologique: true }),
        },
      },
      meta: { description: 'Expertise psycho-sociale si désaccord majeur' },
    },
    audienceTribunal: {
      on: {
        JUGEMENT: {
          target: 'decisionJugement',
          actions: assign({
            decisionJuge: ({ event }) => event.decision,
            hebergementPrincipal: ({ event }) => event.hebergementPrincipal,
          }),
        },
      },
      meta: { description: 'Audience tribunal famille - audition parents et enfants' },
    },
    homologationAccord: {
      type: 'final',
      meta: { description: 'Homologation accord par juge' },
    },
    decisionJugement: {
      type: 'final',
      meta: { description: 'Jugement fixant hébergement (intérêt supérieur enfant)' },
    },
  },
});
