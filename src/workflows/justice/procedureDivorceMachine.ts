/**
 * Machine XState pour Procédure de Divorce
 */

import { createMachine, assign } from 'xstate';

interface Epoux {
  nom: string;
  avocatDesigne: boolean;
  accordSurMesures: boolean;
}

interface ProcedureDivorceContext {
  epoux1: Epoux | null;
  epoux2: Epoux | null;
  typeDivorce: 'consentement-mutuel' | 'desunion-irremediale' | 'faute';
  enfantsMineurs: number;
  accordGardeEnfants: boolean;
  accordPensionAlimentaire: boolean;
  accordPartagePatrimoine: boolean;
  mediationTentee: boolean;
  jugementRendu: boolean;
}

export const procedureDivorceMachine = createMachine({
  id: 'procedureDivorce',
  initial: 'inactif',

  schema: {
    context: {} as ProcedureDivorceContext,
    events: {} as
      | { type: 'DEMARRER_PROCEDURE'; epoux1: Epoux; epoux2: Epoux; type: 'consentement-mutuel' | 'desunion-irremediale' | 'faute' }
      | { type: 'AVOCATS_DESIGNES' }
      | { type: 'MEDIATION_ACCEPTEE' }
      | { type: 'MEDIATION_REFUSEE' }
      | { type: 'ACCORD_TROUVE' }
      | { type: 'DESACCORD' }
      | { type: 'REQUETE_DEPOSEE' }
      | { type: 'AUDIENCE_FIXEE' }
      | { type: 'JUGEMENT_RENDU' }
      | { type: 'DIVORCE_PRONONCE' }
  },

  context: {
    epoux1: null,
    epoux2: null,
    typeDivorce: 'consentement-mutuel',
    enfantsMineurs: 0,
    accordGardeEnfants: false,
    accordPensionAlimentaire: false,
    accordPartagePatrimoine: false,
    mediationTentee: false,
    jugementRendu: false,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_PROCEDURE: {
          target: 'designationAvocats',
          actions: assign({
            epoux1: (_, event) => event.epoux1,
            epoux2: (_, event) => event.epoux2,
            typeDivorce: (_, event) => event.type,
          }),
        },
      },
      meta: {
        description: 'Procédure de divorce non démarrée',
      },
    },

    designationAvocats: {
      on: {
        AVOCATS_DESIGNES: {
          target: 'tentativeMediation',
        },
      },
      meta: {
        description: 'Désignation des avocats pour chaque époux',
      },
    },

    tentativeMediation: {
      on: {
        MEDIATION_ACCEPTEE: {
          target: 'mediation',
          actions: assign({
            mediationTentee: true,
          }),
        },
        MEDIATION_REFUSEE: {
          target: 'depotRequete',
        },
      },
      meta: {
        description: 'Tentative de médiation familiale obligatoire',
      },
    },

    mediation: {
      on: {
        ACCORD_TROUVE: {
          target: 'redactionConvention',
        },
        DESACCORD: {
          target: 'depotRequete',
        },
      },
      meta: {
        description: 'Séances de médiation pour trouver un accord',
      },
    },

    redactionConvention: {
      on: {
        REQUETE_DEPOSEE: {
          target: 'depotRequete',
        },
      },
      meta: {
        description: 'Rédaction de la convention de divorce',
      },
    },

    depotRequete: {
      on: {
        AUDIENCE_FIXEE: {
          target: 'audienceTribunal',
        },
      },
      meta: {
        description: 'Dépôt de la requête en divorce au tribunal de la famille',
      },
    },

    audienceTribunal: {
      on: {
        JUGEMENT_RENDU: {
          target: 'jugementDivorce',
          actions: assign({
            jugementRendu: true,
          }),
        },
      },
      meta: {
        description: 'Audience devant le tribunal de la famille',
      },
    },

    jugementDivorce: {
      on: {
        DIVORCE_PRONONCE: {
          target: 'termine',
        },
      },
      meta: {
        description: 'Jugement de divorce prononcé',
      },
    },

    termine: {
      type: 'final',
      meta: {
        description: 'Divorce définitif - transcription à l\'état civil',
      },
    },
  },
});
