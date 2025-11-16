/**
 * Machine XState pour le Tarif Social Énergie
 *
 * Cette machine d'état représente le flux de traitement du tarif social pour l'électricité et le gaz,
 * permettant aux ménages en difficulté de bénéficier de tarifs réduits.
 */

import { createMachine, assign } from 'xstate';

interface Beneficiaire {
  nom: string;
  numeroRegistreNational: string;
  adresseConsommation: string;
  numeroClient: string;
  fournisseurEnergie: string;
}

interface ConditionsEligibilite {
  beneficiaireBIM: boolean; // Intervention Majorée
  beneficiaireRIS: boolean;
  beneficiaireGRAPA: boolean;
  beneficiaireAllocationHandicap: boolean;
  revenusInferieursPlafond: boolean;
}

interface TarifSocial {
  tarifElectricite: number;
  tarifGaz: number;
  reductionMensuelle: number;
  dateDebut: Date;
  dateFin: Date;
}

interface TarifSocialEnergieContext {
  beneficiaire: Beneficiaire | null;
  conditionsEligibilite: ConditionsEligibilite | null;
  tarifSocial: TarifSocial | null;
  attestationFournie: boolean;
  activationAutomatique: boolean;
}

export const tarifSocialEnergieMachine = createMachine({
  id: 'tarifSocialEnergie',
  initial: 'inactif',

  schemas: {
    context: {} as TarifSocialEnergieContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; beneficiaire: Beneficiaire }
      | { type: 'VERIFICATION_AUTOMATIQUE' }
      | { type: 'ELIGIBILITE_VERIFIEE'; conditions: ConditionsEligibilite }
      | { type: 'ATTESTATION_FOURNIE' }
      | { type: 'TARIF_CALCULE'; tarif: TarifSocial }
      | { type: 'FOURNISSEUR_NOTIFIE' }
      | { type: 'TARIF_ACTIVE' }
      | { type: 'RENOUVELLEMENT_ANNUEL' }
      | { type: 'PERTE_ELIGIBILITE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    beneficiaire: null,
    conditionsEligibilite: null,
    tarifSocial: null,
    attestationFournie: false,
    activationAutomatique: false,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'verificationEligibilite',
          actions: assign({
            beneficiaire: (_, event) => event.beneficiaire,
          }),
        },
        VERIFICATION_AUTOMATIQUE: {
          target: 'verificationAutomatique',
        },
      },

      meta: {
        description: 'En attente de demande de tarif social énergie',
      },
    },

    verificationAutomatique: {
      on: {
        ELIGIBILITE_VERIFIEE: [
          {
            target: 'calculTarif',
            guard: (_, event) =>
              event.conditions.beneficiaireBIM ||
              event.conditions.beneficiaireRIS ||
              event.conditions.beneficiaireGRAPA ||
              event.conditions.beneficiaireAllocationHandicap,
            actions: assign({
              conditionsEligibilite: (_, event) => event.conditions,
              activationAutomatique: true,
            }),
          },
          {
            target: 'demandeRejetee',
          },
        ],
      },

      meta: {
        description: 'Vérification automatique via BIM, RIS, GRAPA ou allocation handicap',
      },
    },

    verificationEligibilite: {
      on: {
        ELIGIBILITE_VERIFIEE: [
          {
            target: 'demandeAttestation',
            guard: (_, event) => event.conditions.revenusInferieursPlafond,
            actions: assign({
              conditionsEligibilite: (_, event) => event.conditions,
            }),
          },
          {
            target: 'verificationAutomatique',
          },
        ],
      },

      meta: {
        description: 'Vérification des conditions d\'éligibilité',
      },
    },

    demandeAttestation: {
      on: {
        ATTESTATION_FOURNIE: {
          target: 'calculTarif',
          actions: assign({
            attestationFournie: true,
          }),
        },
      },

      meta: {
        description: 'Demande d\'attestation CPAS ou SPF Sécurité Sociale',
      },
    },

    calculTarif: {
      on: {
        TARIF_CALCULE: {
          target: 'notificationFournisseur',
          actions: assign({
            tarifSocial: (_, event) => event.tarif,
          }),
        },
      },

      meta: {
        description: 'Calcul du tarif social selon barème fédéral (CREG)',
      },
    },

    notificationFournisseur: {
      on: {
        FOURNISSEUR_NOTIFIE: {
          target: 'activationTarif',
        },
      },

      meta: {
        description: 'Notification au fournisseur d\'énergie pour application du tarif',
      },
    },

    activationTarif: {
      on: {
        TARIF_ACTIVE: {
          target: 'tarifActif',
        },
      },

      meta: {
        description: 'Activation du tarif social sur le compteur',
      },
    },

    tarifActif: {
      on: {
        RENOUVELLEMENT_ANNUEL: {
          target: 'verificationRenouvellement',
        },
        PERTE_ELIGIBILITE: {
          target: 'tarifSuspendu',
        },
      },

      meta: {
        description: 'Tarif social actif - facturation à tarif réduit',
      },
    },

    verificationRenouvellement: {
      on: {
        ELIGIBILITE_VERIFIEE: [
          {
            target: 'tarifActif',
            guard: (_, event) =>
              event.conditions.beneficiaireBIM ||
              event.conditions.beneficiaireRIS ||
              event.conditions.revenusInferieursPlafond,
            actions: assign({
              conditionsEligibilite: (_, event) => event.conditions,
            }),
          },
          {
            target: 'tarifSuspendu',
          },
        ],
      },

      meta: {
        description: 'Vérification annuelle automatique de l\'éligibilité',
      },
    },

    tarifSuspendu: {
      on: {
        REINITIALISER: {
          target: 'inactif',
        },
      },

      meta: {
        description: 'Tarif social suspendu - perte des conditions d\'éligibilité',
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
 * Visualisation du flux du tarif social énergie:
 *
 * inactif
 *   → verificationAutomatique (BIM/RIS/GRAPA)
 *       ↓ (automatique)
 *     calculTarif
 *       ↓
 *     notificationFournisseur
 *       ↓
 *     activationTarif
 *       ↓
 *     tarifActif
 *       ↓ (renouvellement annuel)
 *     verificationRenouvellement → tarifActif
 *       ↓ (perte éligibilité)
 *     tarifSuspendu
 */
