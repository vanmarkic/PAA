/**
 * Machine d'état XState pour les Droits de donation réduits
 *
 * Cette machine d'état représente le flux de travail pour bénéficier de droits de
 * donation réduits, incluant la vérification du lien de parenté, l'évaluation du
 * don, et le calcul des droits applicables.
 */

import { createMachine, assign } from 'xstate';

interface Donateur {
  id: string;
  nom: string;
  age: number;
  domicile: string;
}

interface Donataire {
  id: string;
  nom: string;
  age: number;
  lienParente: 'enfant' | 'petit_enfant' | 'neveu_niece' | 'conjoint' | 'autre';
}

interface Donation {
  id: string;
  type: 'argent' | 'immobilier' | 'mobilier' | 'entreprise';
  description: string;
  valeur: number;
  dateDonation: Date;
  typeDonation: 'donation_simple' | 'donation_partage' | 'donation_residuelle';
}

interface DroitsDonation {
  tauxNormal: number;
  tauxReduit: number;
  montantDroitsNormal: number;
  montantDroitsReduit: number;
  economieRealisee: number;
  conditionsRemplies: boolean;
}

interface DroitsDonationReduitsContext {
  donateur: Donateur | null;
  donataire: Donataire | null;
  donation: Donation | null;
  droits: DroitsDonation | null;
  acteNotarie: string | null;
  evaluations: string[];
}

export const droitsDonationReduitsMachine = createMachine({
  id: 'droitsDonationReduits',
  initial: 'inactif',

  schema: {
    context: {} as DroitsDonationReduitsContext,
    events: {} as
      | { type: 'DEMARRER_DONATION'; donateur: Donateur; donataire: Donataire; donation: Donation }
      | { type: 'VERIFIER_CONDITIONS' }
      | { type: 'CONDITIONS_VERIFIEES'; eligible: boolean }
      | { type: 'CALCULER_DROITS' }
      | { type: 'DROITS_CALCULES'; droits: DroitsDonation }
      | { type: 'ACCEPTER_DONATION' }
      | { type: 'REFUSER_DONATION' }
      | { type: 'SOUMETTRE_ACTE'; acte: string }
      | { type: 'ACTE_VALIDE' }
      | { type: 'ACTE_INVALIDE' }
      | { type: 'SOUMETTRE_EVALUATIONS'; documents: string[] }
      | { type: 'EVALUATIONS_VALIDEES' }
      | { type: 'DROITS_PAYES' }
      | { type: 'REINITIALISER' }
  },

  context: {
    donateur: null,
    donataire: null,
    donation: null,
    droits: null,
    acteNotarie: null,
    evaluations: [],
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DONATION: {
          target: 'verificationConditions',
          actions: assign({
            donateur: (_, event) => event.donateur,
            donataire: (_, event) => event.donataire,
            donation: (_, event) => event.donation,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une déclaration de donation',
      },
    },

    verificationConditions: {
      on: {
        CONDITIONS_VERIFIEES: [
          {
            target: 'calculDroits',
            cond: (_, event) => event.eligible,
          },
          {
            target: 'nonEligible',
          },
        ],
      },

      meta: {
        description: 'Vérification des conditions pour droits réduits (âge, lien parenté)',
      },
    },

    nonEligible: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Non éligible aux droits de donation réduits',
      },
    },

    calculDroits: {
      on: {
        DROITS_CALCULES: {
          target: 'droitsCalcules',
          actions: assign({
            droits: (_, event) => event.droits,
          }),
        },
      },

      meta: {
        description: 'Calcul des droits de donation avec taux réduit',
      },
    },

    droitsCalcules: {
      on: {
        ACCEPTER_DONATION: {
          target: 'soumissionActe',
        },
        REFUSER_DONATION: {
          target: 'refuse',
        },
      },

      meta: {
        description: 'Droits calculés - décision d\'acceptation de la donation',
      },
    },

    refuse: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Donation refusée par le donataire',
      },
    },

    soumissionActe: {
      on: {
        SOUMETTRE_ACTE: {
          target: 'validationActe',
          actions: assign({
            acteNotarie: (_, event) => event.acte,
          }),
        },
      },

      meta: {
        description: 'Soumission de l\'acte notarié de donation',
      },
    },

    validationActe: {
      on: {
        ACTE_VALIDE: {
          target: 'soumissionEvaluations',
        },
        ACTE_INVALIDE: {
          target: 'soumissionActe',
        },
      },

      meta: {
        description: 'Validation de l\'acte de donation par le notaire',
      },
    },

    soumissionEvaluations: {
      on: {
        SOUMETTRE_EVALUATIONS: {
          target: 'validationEvaluations',
          actions: assign({
            evaluations: (_, event) => event.documents,
          }),
        },
      },

      meta: {
        description: 'Soumission des évaluations des biens donnés',
      },
    },

    validationEvaluations: {
      on: {
        EVALUATIONS_VALIDEES: {
          target: 'paiementDroits',
        },
      },

      meta: {
        description: 'Validation des évaluations par l\'administration fiscale',
      },
    },

    paiementDroits: {
      on: {
        DROITS_PAYES: {
          target: 'enregistre',
        },
      },

      meta: {
        description: 'Paiement des droits de donation réduits',
      },
    },

    enregistre: {
      type: 'final',

      meta: {
        description: 'Donation enregistrée avec droits réduits appliqués',
      },
    },
  },
});

/**
 * Visualisation du flux de travail des droits de donation réduits:
 *
 * inactif
 *   → verificationConditions
 *       ↓ (si éligible)
 *     calculDroits
 *       ↓
 *     droitsCalcules → soumissionActe → validationActe
 *                                           ↓
 *                                   soumissionEvaluations
 *                                           ↓
 *                                   validationEvaluations
 *                                           ↓
 *                                     paiementDroits
 *                                           ↓
 *                                      enregistre ✓
 */
