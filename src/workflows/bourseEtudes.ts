/**
 * Machine XState pour les Bourses d'Études
 *
 * Cette machine d'état représente le flux de traitement des bourses d'études
 * pour l'enseignement supérieur, incluant critères académiques et sociaux.
 */

import { createMachine, assign } from 'xstate';

interface EtudiantSuperieur {
  nom: string;
  numeroRegistreNational: string;
  age: number;
  etablissement: string;
  cycleEtudes: 'bachelier' | 'master' | 'doctorat';
  resultatsPrecedents: number; // crédits validés
  creditsTentesAnnee: number;
}

interface CriteresSociaux {
  revenusReferenceParents: number;
  nombreEnfantsEtudes: number;
  distanceDomicileEcole: number;
  logementEtudiant: boolean;
  situationParticuliere: boolean;
}

interface MontantBourse {
  bourse: number;
  allocationEtudes: number;
  aideComplementaire: number;
  montantTotal: number;
}

interface BourseEtudesContext {
  etudiant: EtudiantSuperieur | null;
  criteresSociaux: CriteresSociaux | null;
  montantBourse: MontantBourse | null;
  performanceAcademique: boolean;
  dossierComplet: boolean;
}

export const bourseEtudesMachine = createMachine({
  id: 'bourseEtudes',
  initial: 'inactif',

  schema: {
    context: {} as BourseEtudesContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; etudiant: EtudiantSuperieur; criteres: CriteresSociaux }
      | { type: 'DOCUMENTS_COMPLETS' }
      | { type: 'CRITERES_ACADEMIQUES_VERIFIES'; valide: boolean }
      | { type: 'CRITERES_SOCIAUX_VERIFIES'; eligible: boolean }
      | { type: 'MONTANT_CALCULE'; montant: MontantBourse }
      | { type: 'BOURSE_APPROUVEE' }
      | { type: 'SEMESTRE_VALIDE' }
      | { type: 'ECHEC_ACADEMIQUE' }
      | { type: 'CHANGEMENT_SITUATION' }
      | { type: 'DIPLOME_OBTENU' }
      | { type: 'REINITIALISER' }
  },

  context: {
    etudiant: null,
    criteresSociaux: null,
    montantBourse: null,
    performanceAcademique: true,
    dossierComplet: false,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'constitutionDossier',
          actions: assign({
            etudiant: (_, event) => event.etudiant,
            criteresSociaux: (_, event) => event.criteres,
          }),
        },
      },

      meta: {
        description: 'En attente de demande de bourse d\'études supérieures',
      },
    },

    constitutionDossier: {
      on: {
        DOCUMENTS_COMPLETS: {
          target: 'verificationCriteresAcademiques',
          actions: assign({
            dossierComplet: true,
          }),
        },
      },

      meta: {
        description: 'Constitution du dossier: attestations, relevés de notes, avis fiscal',
      },
    },

    verificationCriteresAcademiques: {
      on: {
        CRITERES_ACADEMIQUES_VERIFIES: [
          {
            target: 'verificationCriteresSociaux',
            cond: (_, event) => event.valide,
            actions: assign({
              performanceAcademique: true,
            }),
          },
          {
            target: 'demandeRejetee',
            actions: assign({
              performanceAcademique: false,
            }),
          },
        ],
      },

      meta: {
        description: 'Vérification progression études: 50% crédits minimum validés',
      },
    },

    verificationCriteresSociaux: {
      on: {
        CRITERES_SOCIAUX_VERIFIES: [
          {
            target: 'calculMontant',
            cond: (_, event) => event.eligible,
          },
          {
            target: 'demandeRejetee',
          },
        ],
      },

      meta: {
        description: 'Vérification revenus de référence et composition familiale',
      },
    },

    calculMontant: {
      on: {
        MONTANT_CALCULE: {
          target: 'bourseApprouvee',
          actions: assign({
            montantBourse: (_, event) => event.montant,
          }),
        },
      },

      meta: {
        description: 'Calcul selon revenus, distance, logement, et performance',
      },
    },

    bourseApprouvee: {
      on: {
        BOURSE_APPROUVEE: {
          target: 'bourseActive',
        },
      },

      meta: {
        description: 'Bourse approuvée - versements programmés',
      },
    },

    bourseActive: {
      on: {
        SEMESTRE_VALIDE: {
          target: 'verificationContinuite',
        },
        ECHEC_ACADEMIQUE: {
          target: 'suspensionBourse',
        },
        CHANGEMENT_SITUATION: {
          target: 'recalculMontant',
        },
        DIPLOME_OBTENU: {
          target: 'bourseTerminee',
        },
      },

      meta: {
        description: 'Bourse versée par tranches - suivi semestriel',
      },
    },

    verificationContinuite: {
      on: {
        CRITERES_ACADEMIQUES_VERIFIES: [
          {
            target: 'bourseActive',
            cond: (_, event) => event.valide,
          },
          {
            target: 'suspensionBourse',
          },
        ],
      },

      meta: {
        description: 'Vérification semestrielle de la progression',
      },
    },

    recalculMontant: {
      on: {
        MONTANT_CALCULE: {
          target: 'bourseActive',
          actions: assign({
            montantBourse: (_, event) => event.montant,
          }),
        },
      },

      meta: {
        description: 'Recalcul suite à changement de situation familiale ou académique',
      },
    },

    suspensionBourse: {
      on: {
        CRITERES_ACADEMIQUES_VERIFIES: {
          target: 'bourseActive',
          cond: (_, event) => event.valide,
        },
      },

      meta: {
        description: 'Bourse suspendue - performance académique insuffisante',
      },
    },

    bourseTerminee: {
      type: 'final',

      meta: {
        description: 'Études terminées avec succès',
      },
    },

    demandeRejetee: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Demande rejetée - critères non remplis',
      },
    },
  },
});

/**
 * Visualisation du flux des bourses d'études:
 *
 * inactif
 *   → constitutionDossier
 *   → verificationCriteresAcademiques
 *   → verificationCriteresSociaux
 *   → calculMontant
 *   → bourseApprouvee
 *   → bourseActive
 *       ↓ (semestre validé)
 *     verificationContinuite → bourseActive
 *       ↓ (échec)
 *     suspensionBourse
 *       ↓ (diplôme)
 *     bourseTerminee ✓
 */
