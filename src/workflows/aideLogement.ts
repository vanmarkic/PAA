/**
 * Machine XState pour l'Aide au Logement
 *
 * Cette machine d'état représente le flux de traitement de l'aide au logement,
 * incluant allocations de loyer et primes à l'installation.
 */

import { createMachine, assign } from 'xstate';

interface Locataire {
  nom: string;
  numeroRegistreNational: string;
  revenus: number;
  compositionMenage: number;
  situationProfessionnelle: string;
}

interface Logement {
  adresse: string;
  typeLogement: string;
  loyerMensuel: number;
  surfaceHabitable: number;
  salubrite: boolean;
  performanceEnergetique: string;
}

interface MontantAide {
  allocationLoyer: number;
  primeInstallation: number;
  reductionCharges: number;
  montantTotal: number;
}

interface AideLogementContext {
  locataire: Locataire | null;
  logement: Logement | null;
  montantAide: MontantAide | null;
  controleAnnuel: boolean;
  bailEnregistre: boolean;
}

export const aideLogementMachine = createMachine({
  id: 'aideLogement',
  initial: 'inactif',

  schema: {
    context: {} as AideLogementContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; locataire: Locataire; logement: Logement }
      | { type: 'BAIL_VERIFIE'; enregistre: boolean }
      | { type: 'REVENUS_VERIFIES'; eligible: boolean }
      | { type: 'LOGEMENT_INSPECTE'; conforme: boolean }
      | { type: 'MONTANT_CALCULE'; montant: MontantAide }
      | { type: 'AIDE_APPROUVEE' }
      | { type: 'CONTROLE_ANNUEL' }
      | { type: 'CHANGEMENT_LOYER'; nouveauLoyer: number }
      | { type: 'CHANGEMENT_REVENUS'; nouveauxRevenus: number }
      | { type: 'DEMENAGEMENT' }
      | { type: 'REINITIALISER' }
  },

  context: {
    locataire: null,
    logement: null,
    montantAide: null,
    controleAnnuel: false,
    bailEnregistre: false,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'verificationBail',
          actions: assign({
            locataire: (_, event) => event.locataire,
            logement: (_, event) => event.logement,
          }),
        },
      },

      meta: {
        description: 'En attente de demande d\'aide au logement',
      },
    },

    verificationBail: {
      on: {
        BAIL_VERIFIE: [
          {
            target: 'verificationRevenus',
            cond: (_, event) => event.enregistre,
            actions: assign({
              bailEnregistre: true,
            }),
          },
          {
            target: 'demandeRejetee',
          },
        ],
      },

      meta: {
        description: 'Vérification du bail de location enregistré',
      },
    },

    verificationRevenus: {
      on: {
        REVENUS_VERIFIES: [
          {
            target: 'inspectionLogement',
            cond: (_, event) => event.eligible,
          },
          {
            target: 'demandeRejetee',
          },
        ],
      },

      meta: {
        description: 'Vérification que les revenus sont sous les plafonds régionaux',
      },
    },

    inspectionLogement: {
      on: {
        LOGEMENT_INSPECTE: [
          {
            target: 'calculMontant',
            cond: (_, event) => event.conforme,
          },
          {
            target: 'miseEnConformite',
          },
        ],
      },

      meta: {
        description: 'Inspection salubrité et performance énergétique du logement',
      },
    },

    miseEnConformite: {
      on: {
        LOGEMENT_INSPECTE: {
          target: 'calculMontant',
          cond: (_, event) => event.conforme,
        },
      },

      meta: {
        description: 'Attente mise en conformité du logement',
      },
    },

    calculMontant: {
      on: {
        MONTANT_CALCULE: {
          target: 'aideApprouvee',
          actions: assign({
            montantAide: (_, event) => event.montant,
          }),
        },
      },

      meta: {
        description: 'Calcul allocation selon loyer, revenus et composition du ménage',
      },
    },

    aideApprouvee: {
      on: {
        AIDE_APPROUVEE: {
          target: 'aideActive',
        },
      },

      meta: {
        description: 'Aide au logement approuvée',
      },
    },

    aideActive: {
      on: {
        CONTROLE_ANNUEL: {
          target: 'controleAnnuel',
        },
        CHANGEMENT_LOYER: {
          target: 'recalculMontant',
          actions: assign({
            logement: (context, event) => ({
              ...context.logement!,
              loyerMensuel: event.nouveauLoyer,
            }),
          }),
        },
        CHANGEMENT_REVENUS: {
          target: 'recalculMontant',
          actions: assign({
            locataire: (context, event) => ({
              ...context.locataire!,
              revenus: event.nouveauxRevenus,
            }),
          }),
        },
        DEMENAGEMENT: {
          target: 'verificationBail',
        },
      },

      meta: {
        description: 'Aide au logement versée mensuellement',
      },
    },

    controleAnnuel: {
      on: {
        REVENUS_VERIFIES: {
          target: 'recalculMontant',
          actions: assign({
            controleAnnuel: true,
          }),
        },
      },

      meta: {
        description: 'Contrôle annuel de la situation',
      },
    },

    recalculMontant: {
      on: {
        MONTANT_CALCULE: {
          target: 'aideActive',
          actions: assign({
            montantAide: (_, event) => event.montant,
            controleAnnuel: false,
          }),
        },
      },

      meta: {
        description: 'Recalcul suite à changement de loyer ou revenus',
      },
    },

    demandeRejetee: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Demande rejetée - conditions non remplies',
      },
    },
  },
});

/**
 * Visualisation du flux de l'aide au logement:
 *
 * inactif
 *   → verificationBail
 *   → verificationRevenus
 *   → inspectionLogement
 *       ↓ (conforme)
 *     calculMontant
 *       ↓
 *     aideApprouvee
 *       ↓
 *     aideActive
 *       ↓ (contrôle annuel)
 *     controleAnnuel → recalculMontant → aideActive
 */
