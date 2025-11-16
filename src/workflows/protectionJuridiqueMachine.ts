/**
 * XState machine for Protection Juridique (Legal Protection) Workflow
 *
 * This state machine represents the workflow for legal protection services,
 * including case assessment, legal aid eligibility, and representation assignment.
 */

import { createMachine, assign } from 'xstate';

interface Justiciable {
  nom: string;
  revenuMensuel: number;
  situationFamiliale: string;
}

interface DossierJuridique {
  typeLitige: string;
  dateDebut: Date;
  partiAdverse: string;
}

interface ProtectionJuridiqueContext {
  justiciable: Justiciable | null;
  dossier: DossierJuridique | null;
  eligibleAideJuridique: boolean;
  avocatDesigne: string | null;
  niveauAide: string | null;
  dossierActif: boolean;
}

export const protectionJuridiqueMachine = createMachine({
  id: 'protectionJuridique',
  initial: 'attente',

  schemas: {
    context: {} as ProtectionJuridiqueContext,
    events: {} as
      | { type: 'DEMANDER_PROTECTION'; justiciable: Justiciable; dossier: DossierJuridique }
      | { type: 'EVALUER_ELIGIBILITE' }
      | { type: 'ELIGIBLE'; niveau: string }
      | { type: 'NON_ELIGIBLE' }
      | { type: 'DESIGNER_AVOCAT'; avocat: string }
      | { type: 'COMMENCER_PROCEDURE' }
      | { type: 'PROCEDURE_EN_COURS' }
      | { type: 'JUGEMENT_RENDU' }
      | { type: 'APPEL_INTERJETE' }
      | { type: 'DOSSIER_CLOTURE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    justiciable: null,
    dossier: null,
    eligibleAideJuridique: false,
    avocatDesigne: null,
    niveauAide: null,
    dossierActif: false,
  },

  states: {
    attente: {
      on: {
        DEMANDER_PROTECTION: {
          target: 'evaluationEligibilite',
          actions: assign({
            justiciable: (_, event) => event.justiciable,
            dossier: (_, event) => event.dossier,
          }),
        },
      },

      meta: {
        description: 'En attente d\'une nouvelle demande de protection juridique',
      },
    },

    evaluationEligibilite: {
      on: {
        ELIGIBLE: {
          target: 'designationAvocat',
          actions: assign({
            eligibleAideJuridique: true,
            niveauAide: (_, event) => event.niveau,
          }),
        },
        NON_ELIGIBLE: {
          target: 'nonEligible',
          actions: assign({
            eligibleAideJuridique: false,
          }),
        },
      },

      meta: {
        description: 'Évaluation de l\'éligibilité à l\'aide juridique (revenus, mérites)',
      },
    },

    nonEligible: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Non éligible à l\'aide juridique - orientation vers autres options',
      },
    },

    designationAvocat: {
      on: {
        DESIGNER_AVOCAT: {
          target: 'representationAttribuee',
          actions: assign({
            avocatDesigne: (_, event) => event.avocat,
          }),
        },
      },

      meta: {
        description: 'Désignation d\'un avocat du bureau d\'aide juridique',
      },
    },

    representationAttribuee: {
      on: {
        COMMENCER_PROCEDURE: {
          target: 'procedureEnCours',
          actions: assign({
            dossierActif: true,
          }),
        },
      },

      meta: {
        description: 'Avocat désigné - préparation de la procédure juridique',
      },
    },

    procedureEnCours: {
      on: {
        JUGEMENT_RENDU: {
          target: 'jugementRendu',
        },
      },

      meta: {
        description: 'Procédure en cours - audiences, plaidoiries, négociations',
      },
    },

    jugementRendu: {
      on: {
        APPEL_INTERJETE: {
          target: 'procedureAppel',
        },
        DOSSIER_CLOTURE: {
          target: 'dossierCloture',
        },
      },

      meta: {
        description: 'Jugement rendu - décision de première instance',
      },
    },

    procedureAppel: {
      on: {
        JUGEMENT_RENDU: {
          target: 'dossierCloture',
        },
      },

      meta: {
        description: 'Procédure d\'appel en cours',
      },
    },

    dossierCloture: {
      on: {
        REINITIALISER: {
          target: 'attente',
        },
      },

      meta: {
        description: 'Dossier clôturé - procédure terminée',
      },
    },
  },
});

/**
 * Visualization of the legal protection workflow:
 *
 * attente
 *   → evaluationEligibilite
 *       ↓ (si eligible)
 *     designationAvocat
 *       ↓
 *     representationAttribuee
 *       ↓
 *     procedureEnCours
 *       ↓
 *     jugementRendu
 *       ↓
 *     dossierCloture ✓
 */
