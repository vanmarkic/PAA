/**
 * Machine XState pour le Fonds de Sécurité d'Existence
 *
 * Cette machine d'état représente le flux de traitement des droits du Fonds de Sécurité d'Existence,
 * incluant primes, allocations sectorielles et avantages complémentaires pour travailleurs.
 */

import { createMachine, assign } from 'xstate';

interface Travailleur {
  nom: string;
  numeroRegistreNational: string;
  secteurActivite: string;
  employeur: string;
  anciennete: number;
  typeContrat: string;
  salaireMensuel: number;
}

interface DroitsFonds {
  primeFinAnnee: number;
  primesVacances: number;
  complementRetraite: number;
  assuranceGroupe: boolean;
  formationProfessionnelle: boolean;
}

interface FondsSecuriteExistenceContext {
  travailleur: Travailleur | null;
  droitsFonds: DroitsFonds | null;
  secteurFonds: string | null;
  cotisationsEmployeur: boolean;
  anneeReference: number;
}

export const fondsSecuriteExistenceMachine = createMachine({
  id: 'fondsSecuriteExistence',
  initial: 'inactif',

  schemas: {
    context: {} as FondsSecuriteExistenceContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; travailleur: Travailleur }
      | { type: 'SECTEUR_IDENTIFIE'; secteur: string }
      | { type: 'COTISATIONS_VERIFIEES'; ajour: boolean }
      | { type: 'DROITS_CALCULES'; droits: DroitsFonds }
      | { type: 'FIN_ANNEE' }
      | { type: 'PRIME_VERSEE' }
      | { type: 'DEPART_RETRAITE' }
      | { type: 'CHANGEMENT_EMPLOYEUR'; nouvelEmployeur: string }
      | { type: 'FORMATION_DEMANDEE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    travailleur: null,
    droitsFonds: null,
    secteurFonds: null,
    cotisationsEmployeur: true,
    anneeReference: new Date().getFullYear(),
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'identificationSecteur',
          actions: assign({
            travailleur: ({ event }) => event.travailleur,
          }),
        },
      },

      meta: {
        description: 'En attente de demande auprès du Fonds de Sécurité d\'Existence',
      },
    },

    identificationSecteur: {
      on: {
        SECTEUR_IDENTIFIE: {
          target: 'verificationCotisations',
          actions: assign({
            secteurFonds: ({ event }) => event.secteur,
          }),
        },
      },

      meta: {
        description: 'Identification du fonds sectoriel (CP 200, 124, etc.)',
      },
    },

    verificationCotisations: {
      on: {
        COTISATIONS_VERIFIEES: [
          {
            target: 'calculDroits',
            guard: ({ event }) => event.ajour,
            actions: assign({
              cotisationsEmployeur: true,
            }),
          },
          {
            target: 'attenteCotisations',
            actions: assign({
              cotisationsEmployeur: false,
            }),
          },
        ],
      },

      meta: {
        description: 'Vérification des cotisations employeur au fonds',
      },
    },

    attenteCotisations: {
      on: {
        COTISATIONS_VERIFIEES: {
          target: 'calculDroits',
          guard: ({ event }) => event.ajour,
          actions: assign({
            cotisationsEmployeur: true,
          }),
        },
      },

      meta: {
        description: 'Attente régularisation cotisations par l\'employeur',
      },
    },

    calculDroits: {
      on: {
        DROITS_CALCULES: {
          target: 'droitsActifs',
          actions: assign({
            droitsFonds: ({ event }) => event.droits,
          }),
        },
      },

      meta: {
        description: 'Calcul des droits selon ancienneté et barèmes sectoriels',
      },
    },

    droitsActifs: {
      on: {
        FIN_ANNEE: {
          target: 'versementPrimeAnnuelle',
        },
        FORMATION_DEMANDEE: {
          target: 'formationProfessionnelle',
        },
        CHANGEMENT_EMPLOYEUR: {
          target: 'transfertDroits',
        },
        DEPART_RETRAITE: {
          target: 'versementCapitalRetraite',
        },
      },

      meta: {
        description: 'Droits actifs - accès aux avantages du fonds sectoriel',
      },
    },

    versementPrimeAnnuelle: {
      on: {
        PRIME_VERSEE: {
          target: 'droitsActifs',
          actions: assign({
            anneeReference: ({ context }) => context.anneeReference + 1,
          }),
        },
      },

      meta: {
        description: 'Versement de la prime de fin d\'année',
      },
    },

    formationProfessionnelle: {
      on: {
        COTISATIONS_VERIFIEES: {
          target: 'droitsActifs',
        },
      },

      meta: {
        description: 'Accès à la formation professionnelle financée par le fonds',
      },
    },

    transfertDroits: {
      on: {
        SECTEUR_IDENTIFIE: {
          target: 'calculDroits',
          actions: assign({
            travailleur: ({ context, event }) => {
              const currentTravailleur = context.travailleur;
              if (!currentTravailleur) return null;
              return Object.assign({}, currentTravailleur, { employeur: event.secteur });
            },
          }),
        },
      },

      meta: {
        description: 'Transfert des droits lors de changement d\'employeur dans le secteur',
      },
    },

    versementCapitalRetraite: {
      type: 'final',

      meta: {
        description: 'Versement du capital ou de la rente complémentaire de retraite',
      },
    },
  },
});

/**
 * Visualisation du flux du Fonds de Sécurité d'Existence:
 *
 * inactif
 *   → identificationSecteur
 *   → verificationCotisations
 *   → calculDroits
 *   → droitsActifs
 *       ↓ (fin d'année)
 *     versementPrimeAnnuelle → droitsActifs
 *       ↓ (formation)
 *     formationProfessionnelle → droitsActifs
 *       ↓ (retraite)
 *     versementCapitalRetraite ✓
 */
