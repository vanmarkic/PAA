/**
 * Machine XState pour Expulsion du Domicile
 * Terminologie: Commandement de quitter les lieux, titre exécutoire
 */

import { createMachine, assign } from 'xstate';

interface LitigeLocatif {
  bailleur: string;
  locataire: string;
  motif: 'impaye-loyer' | 'fin-bail' | 'nuisances';
  arriereLoyer: number;
  conge: boolean; // Congé donné
}

interface ExpulsionContext {
  litige: LitigeLocatif | null;
  commandementDonne: boolean; // Terme juridique: commandement de quitter
  jugementObtenu: boolean; // Titre exécutoire
  huissierDesigne: boolean; // Huissier de justice
  expulsionRealisee: boolean;
  protectionHivernale: boolean; // Protection période hivernale
}

export const expulsionDomicileMachine = createMachine({
  id: 'expulsionDomicile',
  initial: 'congeLocatif',
  schemas: {
    context: {} as ExpulsionContext,
    events: {} as
      | { type: 'DONNER_CONGE'; litige: LitigeLocatif }
      | { type: 'DELAI_EXPIRE' }
      | { type: 'COMMANDEMENT_SIGNIFIE' }
      | { type: 'SAISIR_JUGE_PAIX' }
      | { type: 'JUGEMENT_EXPULSION' }
      | { type: 'HUISSIER_MANDATE' }
      | { type: 'EXPULSION_EXECUTEE' }
  },
  context: {
    litige: null,
    commandementDonne: false,
    jugementObtenu: false,
    huissierDesigne: false,
    expulsionRealisee: false,
    protectionHivernale: false,
  },
  states: {
    congeLocatif: {
      on: {
        DONNER_CONGE: {
          target: 'delaiPreavis',
          actions: assign({ litige: (_, event) => event.litige }),
        },
      },
      meta: {
        description: 'Congé donné au locataire (recommandé)',
        delais: {
          bail9ans: '6 mois de préavis (bailleur)',
          bailCourteDuree: '3 mois',
          locataire: '3 mois (bail 9 ans) ou 1 mois',
        },
      },
    },
    delaiPreavis: {
      on: {
        DELAI_EXPIRE: { target: 'commandementQuitter' },
      },
      meta: { description: 'Respect délai préavis légal' },
    },
    commandementQuitter: {
      on: {
        COMMANDEMENT_SIGNIFIE: {
          target: 'procedureJudiciaireExpulsion',
          actions: assign({ commandementDonne: true }),
        },
      },
      meta: {
        description: 'Commandement de quitter les lieux (huissier)',
        contenu: 'Acte authentique signifié par huissier',
      },
    },
    procedureJudiciaireExpulsion: {
      on: {
        SAISIR_JUGE_PAIX: { target: 'audienceJugePaix' },
      },
      meta: {
        description: 'Citation devant juge de paix',
        competence: 'Justice de paix du lieu du bien',
      },
    },
    audienceJugePaix: {
      on: {
        JUGEMENT_EXPULSION: {
          target: 'titreExecutoire',
          actions: assign({ jugementObtenu: true }),
        },
      },
      meta: {
        description: 'Audience juge de paix - requête en expulsion',
      },
    },
    titreExecutoire: {
      on: {
        HUISSIER_MANDATE: {
          target: 'executionExpulsion',
          actions: assign({ huissierDesigne: true }),
        },
      },
      meta: {
        description: 'Titre exécutoire (jugement définitif)',
        delai: 'Exécutable après délai recours (1 mois)',
      },
    },
    executionExpulsion: {
      on: {
        EXPULSION_EXECUTEE: {
          target: 'termine',
          actions: assign({ expulsionRealisee: true }),
        },
      },
      meta: {
        description: 'Exécution expulsion par huissier + force publique si nécessaire',
        protectionHivernale: 'Interdiction expulsion 1er nov - 15 mars (sauf exception)',
        presence: 'Huissier + officier police + serrurier',
      },
    },
    termine: {
      type: 'final',
      meta: {
        description: 'Expulsion réalisée - locataire expulsé',
        biens: 'Biens mis sous séquestre si locataire absent',
      },
    },
  },
});
