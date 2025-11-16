/**
 * Machine XState pour les Services de Garde d'Enfants
 *
 * Cette machine d'état représente le flux de traitement des demandes de garde d'enfants,
 * incluant crèches, gardiennes et garderies subventionnées.
 */

import { createMachine, assign } from 'xstate';

interface Parent {
  nom: string;
  numeroRegistreNational: string;
  situationProfessionnelle: string;
  horaireTravail: string;
  revenus: number;
  commune: string;
}

interface Enfant {
  nom: string;
  dateNaissance: Date;
  age: number;
  besoinSpeciaux: boolean;
  regimeAlimentaire: string;
}

interface PlaceGarde {
  typeGarde: 'crèche' | 'gardienne' | 'garderie' | 'préGardiennat';
  adresse: string;
  horaires: string;
  capaciteAccueil: number;
  placesDisponibles: number;
}

interface TarifGarde {
  tarifHoraire: number;
  tarifJournalier: number;
  participationParentale: number;
  subventionONE: number;
}

interface GardeEnfantsContext {
  parent: Parent | null;
  enfant: Enfant | null;
  placeGarde: PlaceGarde | null;
  tarif: TarifGarde | null;
  inscriptionValidee: boolean;
  listeAttente: boolean;
}

export const gardeEnfantsMachine = createMachine({
  id: 'gardeEnfants',
  initial: 'inactif',

  schemas: {
    context: {} as GardeEnfantsContext,
    events: {} as
      | { type: 'DEMARRER_DEMANDE'; parent: Parent; enfant: Enfant }
      | { type: 'PLACES_VERIFIEES'; disponible: boolean }
      | { type: 'REVENUS_EVALUES' }
      | { type: 'TARIF_CALCULE'; tarif: TarifGarde }
      | { type: 'PLACE_ATTRIBUEE'; place: PlaceGarde }
      | { type: 'INSCRIPTION_VALIDEE' }
      | { type: 'GARDE_COMMENCE' }
      | { type: 'PLACE_LIBEREE' }
      | { type: 'CHANGEMENT_REVENUS'; nouveauxRevenus: number }
      | { type: 'ENTREE_MATERNELLE' }
      | { type: 'REINITIALISER' }
  },

  context: {
    parent: null,
    enfant: null,
    placeGarde: null,
    tarif: null,
    inscriptionValidee: false,
    listeAttente: false,
  },

  states: {
    inactif: {
      on: {
        DEMARRER_DEMANDE: {
          target: 'recherchePlaces',
          actions: assign({
            parent: (_, event) => event.parent,
            enfant: (_, event) => event.enfant,
          }),
        },
      },

      meta: {
        description: 'En attente de demande de place en garde d\'enfants',
      },
    },

    recherchePlaces: {
      on: {
        PLACES_VERIFIEES: [
          {
            target: 'evaluationRevenus',
            guard: (_, event) => event.disponible,
          },
          {
            target: 'listeAttente',
            actions: assign({
              listeAttente: true,
            }),
          },
        ],
      },

      meta: {
        description: 'Recherche de places disponibles dans la commune',
      },
    },

    listeAttente: {
      on: {
        PLACE_LIBEREE: {
          target: 'evaluationRevenus',
          actions: assign({
            listeAttente: false,
          }),
        },
      },

      meta: {
        description: 'Inscription sur liste d\'attente - aucune place disponible',
      },
    },

    evaluationRevenus: {
      on: {
        REVENUS_EVALUES: {
          target: 'calculTarif',
        },
      },

      meta: {
        description: 'Évaluation des revenus pour calcul de la participation parentale',
      },
    },

    calculTarif: {
      on: {
        TARIF_CALCULE: {
          target: 'attributionPlace',
          actions: assign({
            tarif: (_, event) => event.tarif,
          }),
        },
      },

      meta: {
        description: 'Calcul du tarif selon barème ONE (revenus et composition familiale)',
      },
    },

    attributionPlace: {
      on: {
        PLACE_ATTRIBUEE: {
          target: 'inscription',
          actions: assign({
            placeGarde: (_, event) => event.place,
          }),
        },
      },

      meta: {
        description: 'Attribution d\'une place dans une structure d\'accueil',
      },
    },

    inscription: {
      on: {
        INSCRIPTION_VALIDEE: {
          target: 'periodeAdaptation',
          actions: assign({
            inscriptionValidee: true,
          }),
        },
      },

      meta: {
        description: 'Inscription administrative et signature du contrat',
      },
    },

    periodeAdaptation: {
      on: {
        GARDE_COMMENCE: {
          target: 'gardeActive',
        },
      },

      meta: {
        description: 'Période d\'adaptation progressive de l\'enfant (1-2 semaines)',
      },
    },

    gardeActive: {
      on: {
        CHANGEMENT_REVENUS: {
          target: 'recalculTarif',
          actions: assign({
            parent: (context, event) => ({
              ...context.parent!,
              revenus: event.nouveauxRevenus,
            }),
          }),
        },
        ENTREE_MATERNELLE: {
          target: 'finGarde',
        },
      },

      meta: {
        description: 'Garde active - suivi régulier et facturation mensuelle',
      },
    },

    recalculTarif: {
      on: {
        TARIF_CALCULE: {
          target: 'gardeActive',
          actions: assign({
            tarif: (_, event) => event.tarif,
          }),
        },
      },

      meta: {
        description: 'Recalcul du tarif suite à changement de revenus',
      },
    },

    finGarde: {
      type: 'final',

      meta: {
        description: 'Fin de la garde - entrée en maternelle',
      },
    },
  },
});

/**
 * Visualisation du flux des services de garde d'enfants:
 *
 * inactif
 *   → recherchePlaces
 *       ↓ (places disponibles)
 *     evaluationRevenus
 *       ↓
 *     calculTarif
 *       ↓
 *     attributionPlace
 *       ↓
 *     inscription
 *       ↓
 *     periodeAdaptation
 *       ↓
 *     gardeActive
 *       ↓ (entrée maternelle)
 *     finGarde ✓
 *       ↓ (aucune place)
 *     listeAttente → evaluationRevenus
 */
