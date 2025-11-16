/**
 * Machine XState pour Comptes Annuels (dépôt BCE)
 */

import { createMachine, assign } from 'xstate';

interface Societe {
  nom: string;
  numeroBCE: string;
  formeJuridique: 'SRL' | 'SA' | 'ASBL';
  exercice: number;
}

interface ComptabiliteAnnuelleContext {
  societe: Societe | null;
  dateClotureExercice: Date | null;
  comptesEtablis: boolean;
  comptesApprouves: boolean;
  comptesDeposes: boolean;
  delaiDepot: Date | null;
}

export const comptabiliteAnnuelleMachine = createMachine({
  id: 'comptabiliteAnnuelle',
  initial: 'clotureExercice',
  schema: {
    context: {} as ComptabiliteAnnuelleContext,
    events: {} as
      | { type: 'CLOTURER_EXERCICE'; societe: Societe; date: Date }
      | { type: 'COMPTES_ETABLIS' }
      | { type: 'AG_CONVOQUEE' }
      | { type: 'COMPTES_APPROUVES' }
      | { type: 'DEPOT_BCE' }
      | { type: 'PUBLICATION_CONFIRMEE' }
  },
  context: {
    societe: null,
    dateClotureExercice: null,
    comptesEtablis: false,
    comptesApprouves: false,
    comptesDeposes: false,
    delaiDepot: null,
  },
  states: {
    clotureExercice: {
      on: {
        CLOTURER_EXERCICE: {
          target: 'etablissementComptes',
          actions: assign({
            societe: (_, event) => event.societe,
            dateClotureExercice: (_, event) => event.date,
            delaiDepot: (_, event) => {
              const date = new Date(event.date);
              date.setMonth(date.getMonth() + 7); // 7 mois après clôture
              return date;
            },
          }),
        },
      },
      meta: { description: 'Clôture exercice comptable (généralement 31/12)' },
    },
    etablissementComptes: {
      on: {
        COMPTES_ETABLIS: {
          target: 'assemblee Generale',
          actions: assign({ comptesEtablis: true }),
        },
      },
      meta: { description: 'Établissement bilan, compte résultats, annexes' },
    },
    assembleeGenerale: {
      on: {
        AG_CONVOQUEE: { target: 'approbationAG' },
      },
      meta: { description: 'Convocation AG ordinaire (dans 6 mois clôture)' },
    },
    approbationAG: {
      on: {
        COMPTES_APPROUVES: {
          target: 'depotBCE',
          actions: assign({ comptesApprouves: true }),
        },
      },
      meta: { description: 'Approbation comptes annuels par AG' },
    },
    depotBCE: {
      on: {
        DEPOT_BCE: {
          target: 'publication',
          actions: assign({ comptesDeposes: true }),
        },
      },
      meta: { description: 'Dépôt électronique BCE (dans 30 jours AG, max 7 mois clôture)' },
    },
    publication: {
      on: {
        PUBLICATION_CONFIRMEE: { target: 'termine' },
      },
      meta: { description: 'Publication Moniteur Belge (automatique)' },
    },
    termine: {
      type: 'final',
      meta: { description: 'Comptes annuels déposés et publiés' },
    },
  },
});
