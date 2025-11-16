import { createMachine, assign } from 'xstate';

/**
 * Machine XState: GRAPA - Garantie de Revenus aux Personnes Âgées
 *
 * Base légale: Loi du 22 mars 2001 instituant la garantie de revenus aux personnes âgées
 * Compétence: SPF Pensions
 * Montants 2024: Isolé 1.545,07€/mois - Ménage 1.030,05€/mois (par personne)
 *
 * Terminologie consacrée:
 * - "GRAPA" (acronyme officiel - non "minimum vieillesse" ou "allocation vieillesse")
 * - "Garantie de revenus" (nature: complément, pas pension)
 * - "Personne isolée" vs "Cohabitant"
 * - "Enquête sur les ressources" (examen revenus du ménage)
 */

interface GRAPAContext {
  demandeur: {
    nom: string;
    dateNaissance: string;
    age: number;
    registreNational: string;
  };
  situation: {
    statut?: 'isole' | 'cohabitant';
    nombreCohabitants?: number;
    residence?: string; // Adresse en Belgique
    dureeResidence?: number; // Années résidence Belgique
  };
  revenus: {
    propres?: number; // Revenus annuels propres
    menage?: number; // Revenus totaux du ménage si cohabitant
    pensionEtrangere?: number;
    autresRevenus?: number;
  };
  montantGRAPA?: number;
  depassementPlafond?: boolean;
}

type GRAPAEvent =
  | { type: 'SOUMETTRE_DEMANDE'; data: GRAPAContext }
  | { type: 'ENQUETE_TERMINEE'; statut: 'isole' | 'cohabitant'; revenusMenage: number }
  | { type: 'DECISION_OCTROI'; montant: number }
  | { type: 'DECISION_REFUS'; motif: string }
  | { type: 'REVISION_ANNUELLE' };

export const grapaMachine = createMachine({
  id: 'grapa',
  initial: 'verification',
  context: {
    demandeur: {
      nom: '',
      dateNaissance: '',
      age: 0,
      registreNational: '',
    },
    situation: {},
    revenus: {},
  },
  states: {
    verification: {
      meta: {
        description: 'Vérification conditions d\'accès GRAPA',
        conditionsObligatoires: {
          age: '65 ans minimum (âge légal pension)',
          nationalite: [
            'Belge',
            'Ressortissant UE',
            'Apatride',
            'Réfugié reconnu',
            'Titre séjour illimité (non-UE)',
          ],
          residence: 'Résidence effective et principale en Belgique',
          dureeResidence: 'Minimum 10 ans dont 5 ans ininterrompus',
        },
        exceptions_residence: {
          refugies: 'Pas de condition de durée si réfugié reconnu',
          apatrides: 'Pas de condition de durée',
        },
        nature: {
          allocation: 'Prestation d\'assistance (non contributive)',
          difference_pension: 'Pas besoin carrière - condition = ressources faibles',
          subsidiaire: 'Complément si pension trop faible ou pas de pension',
        },
        demande: {
          automatique: 'Non automatique - demande explicite nécessaire',
          quand: 'Dès 65 ans ou dès que revenus diminuent',
          ou: 'SPF Pensions ou commune',
        },
      },
      on: {
        SOUMETTRE_DEMANDE: {
          target: 'enqueteRessources',
          actions: assign(({ context, event }) => ({
            ...context,
            ...event.data,
          })),
        },
      },
    },
    enqueteRessources: {
      meta: {
        description: 'Enquête sur les ressources (revenus du ménage)',
        principe: 'GRAPA = allocation sous conditions de ressources',
        revenus_pris_en_compte: {
          pensions: 'Pension de retraite belge ou étrangère',
          revenus_professionnels: 'Salaires, revenus indépendant',
          revenus_remplacement: 'Chômage, maladie, invalidité',
          revenus_capitaux: 'Intérêts, dividendes (après déduction forfaitaire)',
          revenus_immobiliers: 'Revenus cadastraux (×3 si non habitation principale)',
          revenus_conjoint: 'TOUS les revenus du conjoint/cohabitant',
        },
        revenus_exclus: {
          allocations_familiales: 'Non comptabilisées',
          aide_sociale_CPAS: 'Non comptabilisée',
          allocations_handicap: 'ARR et AI non comptabilisées',
          allocations_chauffage: 'Non comptabilisées',
        },
        montantsPlafonds2024: {
          isole: {
            montantGRAPA: '1.545,07 €/mois (18.540,84 €/an)',
            plafond: 'Revenus propres doivent être < 18.540,84 €/an',
            complement: 'Si revenus 10.000€/an → GRAPA 8.540,84€/an',
          },
          cohabitant: {
            montantGRAPA: '1.030,05 €/mois par personne (12.360,60 €/an)',
            plafond: 'Revenus du MÉNAGE doivent être < 24.721,20 €/an (2 pers.)',
            remarque: 'Divisé par nombre de cohabitants',
          },
        },
        statuts: {
          isole: {
            definition: 'Personne vivant seule (pas de cohabitant)',
            preuve: 'Composition de ménage (commune)',
          },
          cohabitant: {
            definition: 'Vit avec une ou plusieurs personnes',
            revenus: 'Revenus de TOUS les membres du ménage comptabilisés',
            exception: 'Enfants mineurs non comptés',
          },
        },
        calculComplement: {
          formule: 'GRAPA = Montant max - revenus propres',
          exemple1: 'Revenus 500€/mois → GRAPA = 1.545 - 500 = 1.045€/mois (isolé)',
          exemple2: 'Pas de revenus → GRAPA = 1.545€/mois (montant complet)',
        },
      },
      on: {
        ENQUETE_TERMINEE: {
          target: 'decision',
          actions: assign({
            situation: ({ context, event }) => ({
              ...context.situation,
              statut: event.statut,
            }),
            revenus: ({ context, event }) => ({
              ...context.revenus,
              menage: event.revenusMenage,
            }),
          }),
        },
      },
    },
    decision: {
      meta: {
        description: 'Décision octroi ou refus GRAPA',
        delai: '3-6 mois traitement',
        verification: 'Contrôle croisé SPF Finances, ONSS, Registre National',
      },
      on: {
        DECISION_OCTROI: {
          target: 'paiement',
          actions: assign({
            montantGRAPA: ({ context, event }) => event.montant,
          }),
        },
        DECISION_REFUS: 'refus',
      },
    },
    paiement: {
      meta: {
        description: 'Paiement GRAPA',
        modalites: {
          frequence: 'Mensuel (fin de mois)',
          virement: 'Compte bancaire belge (IBAN)',
          dateEffet: 'Premier jour du mois suivant 65e anniversaire (si demande à temps)',
          retro: 'Maximum 12 mois rétroactifs',
        },
        indexation: {
          automatique: 'Indexation santé + adaptation bien-être',
          frequence: 'Annuelle',
        },
        montants2024: {
          isole_complet: '1.545,07 €/mois',
          cohabitant_complet: '1.030,05 €/mois',
          complement_partiel: 'Variable selon revenus propres',
        },
        fiscalite: {
          imposable: 'OUI - GRAPA = revenu imposable',
          precompte: 'Précompte professionnel retenu à la source',
          declaration: 'À déclarer annuellement',
          taux_reduit: 'Souvent faible taxation (revenus modestes)',
        },
        obligations: {
          declaration_revenus: 'Annuelle obligatoire (tous revenus du ménage)',
          changement_situation: [
            'Mariage/cohabitation = révision',
            'Décès cohabitant = passage "isolé"',
            'Nouveau revenu = déclaration immédiate',
            'Déménagement étranger = perte GRAPA',
          ],
          residence_effective: 'Rester en Belgique (séjours < 29 jours/an autorisés)',
        },
        controles: {
          annuels: 'Révision automatique chaque année',
          croises: 'Contrôle SPF Finances (déclaration impôts)',
          inopines: 'Enquêtes sociales possibles',
        },
        cumuls: {
          pension: 'OUI - GRAPA = complément si pension faible',
          pension_survie: 'OUI cumulable',
          ARR_AI: 'OUI cumulable (non comptabilisés dans ressources)',
          aide_CPAS: 'NON - GRAPA prioritaire sur CPAS',
          allocations_familiales: 'OUI cumulable',
        },
        avantagesLies: {
          tarif_social_energie: 'Automatique',
          reduction_taxe_regionale: 'Selon région',
          intervention_majoree: 'Mutuelle (BIM automatique)',
          abonnement_social_telecom: 'Possible',
        },
        sanctions: {
          fausse_declaration: 'Récupération montants indus + amende',
          residence_fictive: 'Perte GRAPA + récupération',
          non_declaration_revenus: 'Suspension paiement',
        },
      },
      on: {
        REVISION_ANNUELLE: 'enqueteRessources',
      },
    },
    refus: {
      meta: {
        description: 'GRAPA refusée',
        motifsFrequents: [
          'Revenus dépassent plafonds',
          'Âge < 65 ans',
          'Résidence < 10 ans (sauf exceptions)',
          'Pas de résidence effective en Belgique',
          'Nationalité sans titre séjour valable',
        ],
        recours: {
          tribunal: 'Tribunal du travail',
          delai: '3 mois',
          gratuit: 'Pas de frais de justice',
        },
        alternatives: {
          pension_faible: 'Vérifier si éligible majoration pension minimum',
          pas_65_ans: 'RIS au CPAS si indigence',
          etranger: 'Vérifier conventions bilatérales (pensions étrangères)',
        },
        conseil: 'Refaire demande si situation évolue (baisse revenus, atteinte 65 ans)',
      },
      type: 'final',
    },
  },
});
