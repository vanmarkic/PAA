/**
 * Machine XState pour Regroupement Familial
 * Terminologie: Regroupement familial (Loi sur le séjour des étrangers)
 */

import { createMachine, assign } from 'xstate';

interface DemandeRegroupement {
  regroupant: string; // Personne en Belgique
  membresF amille: string[]; // Conjoint, enfants < 18 ans, ascendants
  lienParente: 'conjoint' | 'enfant' | 'ascendant';
  ressourcesSuffisantes: boolean;
  logementAdapte: boolean;
  assuranceMaladie: boolean;
}

interface RegroupementFamilialContext {
  demande: DemandeRegroupement | null;
  conditionsRemplies: boolean;
  visaRegroupementAccorde: boolean;
  carteSejourFamille: boolean;
}

export const regroupementFamilialMachine = createMachine({
  id: 'regroupementFamilial',
  initial: 'verificationConditions',
  schema: {
    context: {} as RegroupementFamilialContext,
    events: {} as
      | { type: 'DEPOSER_DEMANDE'; demande: DemandeRegroupement }
      | { type: 'CONDITIONS_VERIFIEES' }
      | { type: 'CONDITIONS_NON_REMPLIES' }
      | { type: 'VISA_ACCORDE' }
      | { type: 'ENTREE_BELGIQUE' }
      | { type: 'CARTE_F_DELIVREE' }
  },
  context: {
    demande: null,
    conditionsRemplies: false,
    visaRegroupementAccorde: false,
    carteSejourFamille: false,
  },
  states: {
    verificationConditions: {
      on: {
        DEPOSER_DEMANDE: {
          target: 'evaluationEligibilite',
          actions: assign({ demande: (_, event) => event.demande }),
        },
      },
      meta: {
        description: 'Vérification conditions préalables',
        conditionsLegales: {
          ressources: 'Revenus mensuels ≥ 150% RIS (± 2 400€ + 150€/personne)',
          logement: 'Logement conforme et superficie suffisante',
          assurance: 'Assurance maladie couvrant membres famille',
          lien: 'Lien de parenté prouvé (acte mariage, naissance)',
        },
      },
    },
    evaluationEligibilite: {
      on: {
        CONDITIONS_VERIFIEES: {
          target: 'demandeVisaRegroupement',
          actions: assign({ conditionsRemplies: true }),
        },
        CONDITIONS_NON_REMPLIES: { target: 'refus' },
      },
      meta: {
        description: 'Évaluation complétude et conformité conditions',
      },
    },
    demandeVisaRegroupement: {
      on: {
        VISA_ACCORDE: {
          target: 'entreeBelgique',
          actions: assign({ visaRegroupementAccorde: true }),
        },
      },
      meta: {
        description: 'Demande visa D long séjour (regroupement familial)',
        ou: 'Poste diplomatique/consulaire belge pays origine',
        delai: '4 mois maximum (directive UE)',
      },
    },
    entreeBelgique: {
      on: {
        ENTREE_BELGIQUE: { target: 'delivranceCarteF' },
      },
      meta: {
        description: 'Entrée sur territoire belge avec visa D',
      },
    },
    delivranceCarteF: {
      on: {
        CARTE_F_DELIVREE: {
          target: 'termine',
          actions: assign({ carteSejourFamille: true }),
        },
      },
      meta: {
        description: 'Délivrance carte F (séjour membre famille)',
        validite: '5 ans renouvelable',
        droits: 'Accès marché travail sans permis supplémentaire',
      },
    },
    refus: {
      type: 'final',
      meta: {
        description: 'Refus regroupement familial (conditions non remplies)',
        recours: 'Conseil Contentieux Étrangers (CCE)',
      },
    },
    termine: {
      type: 'final',
      meta: {
        description: 'Regroupement familial réalisé',
      },
    },
  },
});
