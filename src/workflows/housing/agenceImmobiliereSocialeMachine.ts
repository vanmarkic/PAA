import { createMachine, assign } from 'xstate';

/**
 * Machine XState: Location via Agence Immobilière Sociale (AIS)
 *
 * Base légale: Code wallon du logement / Décret flamand / Ordonnance bruxelloise
 * Compétence: Régionale (Wallonie, Flandre, Bruxelles)
 *
 * Terminologie consacrée:
 * - "Agence Immobilière Sociale" - AIS (non "agence sociale")
 * - "Mandat de gestion" (contrat entre propriétaire et AIS)
 * - "Sous-location" (AIS loue au locataire)
 * - "Loyer conventionné" (prix plafonné selon revenus)
 */

interface AISContext {
  demandeur: {
    nom: string;
    composition_menage: number;
    revenus_annuels: number;
  };
  eligibilite?: {
    plafond_revenus?: number;
    eligible?: boolean;
  };
  logement?: {
    commune: string;
    loyerMensuel?: number;
    superficie?: number;
  };
}

type AISEvent =
  | { type: 'VERIFIER_ELIGIBILITE'; data: AISContext }
  | { type: 'ELIGIBLE' }
  | { type: 'INELIGIBLE'; motif: string }
  | { type: 'INSCRIPTION' }
  | { type: 'LOGEMENT_PROPOSE'; loyer: number }
  | { type: 'ACCEPTER_LOGEMENT' };

export const agenceImmobiliereSocialeMachine = createMachine<AISContext, AISEvent>({
  id: 'agenceImmobiliereSociale',
  initial: 'information',
  context: {
    demandeur: {
      nom: '',
      composition_menage: 1,
      revenus_annuels: 0,
    },
  },
  states: {
    information: {
      meta: {
        description: 'Information sur le système AIS',
        principe: {
          fonctionnement: 'AIS = intermédiaire entre propriétaires privés et locataires à revenus modestes',
          schemas: 'Propriétaire → (mandat) → AIS → (sous-location) → Locataire',
          avantage_proprietaire: 'Garantie loyer, pas de gestion, avantages fiscaux',
          avantage_locataire: 'Loyer réduit, accompagnement social',
        },
        differences_logement_social: {
          AIS: 'Logements privés gérés par AIS - délais courts',
          logement_social: 'Logements publics - listes d\'attente longues (années)',
          complementarite: 'AIS = solution temporaire ou alternative',
        },
        plafonds_revenus_approximatifs: {
          personne_isolee: '± 30.000 €/an (varie selon région)',
          couple: '± 40.000 €/an',
          famille_enfants: '+ 2.500 €/enfant',
        },
      },
      on: {
        VERIFIER_ELIGIBILITE: 'verification',
      },
    },
    verification: {
      meta: {
        description: 'Vérification éligibilité conditions revenus',
        conditions: {
          revenus: 'Revenus sous plafonds régionaux',
          composition: 'Selon taille du ménage',
          residence: 'Résider dans la région',
        },
      },
      on: {
        ELIGIBLE: 'inscription',
        INELIGIBLE: 'refus',
      },
    },
    inscription: {
      meta: {
        description: 'Inscription auprès d\'une AIS',
        procedure: [
          'Contacter AIS de la commune/région',
          'Compléter dossier (revenus, composition ménage)',
          'Entretien social',
          'Inscription sur liste d\'attente',
        ],
        delais: '1-12 mois selon disponibilité logements',
        accompagnement: 'Assistant social référent',
      },
      on: {
        LOGEMENT_PROPOSE: 'proposition',
      },
    },
    proposition: {
      meta: {
        description: 'Proposition logement AIS',
        loyer_conventionne: 'Plafonné selon revenus (souvent 20-25% revenus)',
        garantie_locative: 'Réduite ou étalée',
        bail: 'Bail classique 3/6/9 ans',
      },
      on: {
        ACCEPTER_LOGEMENT: 'location',
      },
    },
    location: {
      meta: {
        description: 'Location active via AIS',
        obligations_locataire: [
          'Payer loyer à temps',
          'Entretenir logement',
          'Accepter visites accompagnement social',
          'Déclarer changements situation',
        ],
        avantages: [
          'Loyer adapté aux revenus',
          'Accompagnement social',
          'Médiation en cas de problème',
          'Logement décent garanti',
        ],
      },
      type: 'final',
    },
    refus: {
      meta: {
        description: 'Non éligible AIS',
        alternatives: [
          'Logement social classique (SLRB/SWHL)',
          'Allocations loyer (AIS parfois compatible)',
          'Médiation de dettes si surendettement',
        ],
      },
      type: 'final',
    },
  },
});
