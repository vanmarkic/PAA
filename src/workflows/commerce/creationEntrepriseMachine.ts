/**
 * Machine XState pour Création d'Entreprise
 */

import { createMachine, assign } from 'xstate';

interface Entrepreneur {
  nom: string;
  prenom: string;
  adresse: string;
  capitalInitial: number;
  formeJuridique: 'SRL' | 'SA' | 'ASBL' | 'independant' | 'SC';
}

interface CreationEntrepriseContext {
  entrepreneur: Entrepreneur | null;
  numeroEntreprise: string | null;
  compteBancaireOuvert: boolean;
  planFinancierApprouve: boolean;
  immatriculationBCE: boolean;
  numeroTVA: string | null;
  affiliationCaisseAssurances: boolean;
}

export const creationEntrepriseMachine = createMachine({
  id: 'creationEntreprise',
  initial: 'inactif',

  schemas: {
    context: {} as CreationEntrepriseContext,
    events: {} as
      | { type: 'DEMARRER_CREATION'; entrepreneur: Entrepreneur }
      | { type: 'PLAN_FINANCIER_VALIDE' }
      | { type: 'COMPTE_BANCAIRE_OUVERT' }
      | { type: 'ACTE_CONSTITUTIF_REDIGE' }
      | { type: 'DEPOT_GUICHET_ENTREPRISE' }
      | { type: 'NUMERO_ENTREPRISE_ATTRIBUE'; numero: string }
      | { type: 'TVA_ACTIVEE'; numeroTVA: string }
      | { type: 'AFFILIATION_CAISSE_COMPLETE' }
      | { type: 'CREATION_FINALISEE' }
  },

  context: {
    entrepreneur: null,
    numeroEntreprise: null,
    compteBancaireOuvert: false,
    planFinancierApprouve: false,
    immatriculationBCE: false,
    numeroTVA: null,
    affiliationCaisseAssurances: false,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_CREATION: {
          target: 'planFinancier',
          actions: assign({
            entrepreneur: ({ event }) => event.entrepreneur,
          }),
        },
      },
      meta: { description: 'Projet de création non démarré' },
    },

    planFinancier: {
      on: {
        PLAN_FINANCIER_VALIDE: {
          target: 'ouvertureCompteBancaire',
          actions: assign({ planFinancierApprouve: true }),
        },
      },
      meta: { description: 'Rédaction plan financier obligatoire (SRL/SA)' },
    },

    ouvertureCompteBancaire: {
      on: {
        COMPTE_BANCAIRE_OUVERT: {
          target: 'redactionActes',
          actions: assign({ compteBancaireOuvert: true }),
        },
      },
      meta: { description: 'Ouverture compte bancaire professionnel' },
    },

    redactionActes: {
      on: {
        ACTE_CONSTITUTIF_REDIGE: { target: 'depotGuichetEntreprise' },
      },
      meta: { description: 'Rédaction statuts et acte constitutif (notaire si SA/SRL)' },
    },

    depotGuichetEntreprise: {
      on: {
        DEPOT_GUICHET_ENTREPRISE: { target: 'immatriculationBCE' },
      },
      meta: { description: 'Dépôt dossier au guichet d\'entreprise' },
    },

    immatriculationBCE: {
      on: {
        NUMERO_ENTREPRISE_ATTRIBUE: {
          target: 'activationTVA',
          actions: assign({
            numeroEntreprise: ({ event }) => event.numero,
            immatriculationBCE: true,
          }),
        },
      },
      meta: { description: 'Immatriculation Banque-Carrefour des Entreprises' },
    },

    activationTVA: {
      on: {
        TVA_ACTIVEE: {
          target: 'affiliationCaisseAssurances',
          actions: assign({ numeroTVA: ({ event }) => event.numeroTVA }),
        },
      },
      meta: { description: 'Activation numéro TVA auprès du SPF Finances' },
    },

    affiliationCaisseAssurances: {
      on: {
        AFFILIATION_CAISSE_COMPLETE: {
          target: 'entrepriseActive',
          actions: assign({ affiliationCaisseAssurances: true }),
        },
      },
      meta: { description: 'Affiliation caisse d\'assurances sociales' },
    },

    entrepriseActive: {
      on: {
        CREATION_FINALISEE: { target: 'termine' },
      },
      meta: { description: 'Entreprise créée et opérationnelle' },
    },

    termine: {
      type: 'final',
      meta: { description: 'Création d\'entreprise finalisée' },
    },
  },
});
