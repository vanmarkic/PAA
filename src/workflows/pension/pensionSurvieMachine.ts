import { createMachine, assign } from 'xstate';

/**
 * Machine XState: Pension de survie
 *
 * Base légale: AR n°50 du 24 octobre 1967 - Loi du 30 mars 2018 (réforme pension de survie)
 * Compétence: SPF Pensions
 * Montant 2024: 80% pension défunt (si pas de revenus propres)
 *
 * Terminologie consacrée:
 * - "Pension de survie" (non "pension de veuvage")
 * - "Conjoint survivant" (terme légal)
 * - "Exonération de revenus" (montant revenus autorisés sans réduction)
 * - "Plafond de revenus" (au-delà = réduction proportionnelle)
 */

interface PensionSurvieContext {
  demandeur: {
    nom: string;
    dateNaissance: string;
    age: number;
  };
  conjointDecede: {
    nom: string;
    dateDecès: string;
    pensionAcquise?: number;
    anneesCarriere?: number;
  };
  situation: {
    enfantsACharge?: number;
    agePlusjeuneEnfant?: number;
    revenus_propres?: number;
    cohabitation?: boolean;
  };
  montantPension?: number;
  reductionAppliquee?: boolean;
}

type PensionSurvieEvent =
  | { type: 'SOUMETTRE_DEMANDE'; data: PensionSurvieContext }
  | { type: 'EVALUATION_COMPLETE' }
  | { type: 'OCTROI'; montant: number }
  | { type: 'REFUS'; motif: string }
  | { type: 'REVISION_REVENUS'; nouveauxRevenus: number };

export const pensionSurvieMachine = createMachine({
  id: 'pensionSurvie',
  initial: 'verification',
  context: {
    demandeur: {
      nom: '',
      dateNaissance: '',
      age: 0,
    },
    conjointDecede: {
      nom: '',
      dateDecès: '',
    },
    situation: {},
  },
  states: {
    verification: {
      meta: {
        description: 'Vérification conditions pension de survie',
        conditionsGenerales: {
          lienFamilial: 'Conjoint marié légalement (pas cohabitant légal ni partenaire de fait)',
          duree_mariage: 'Minimum 1 an de mariage (sauf exceptions)',
          age_minimum: '45 ans OU enfant à charge',
          residence: 'Résider en Belgique',
        },
        exceptions_duree: {
          enfantCommun: 'Pas de condition durée si enfant commun',
          deces_accident: 'Pas de condition durée si décès accidentel',
        },
        reforme2018: {
          avant2018: 'Pas de condition âge ni revenus',
          depuis2018: 'Conditions âge 45+ ET limites revenus',
          transition: 'Droits acquis avant 2018 maintenus (clause grand-père)',
        },
        remarque: 'Si veuf(ve) remarié(e) ou cohabite légalement = perte pension survie',
      },
      on: {
        SOUMETTRE_DEMANDE: {
          target: 'evaluation',
          actions: assign(({ context, event }) => ({
            ...context,
            ...event.data,
          })),
        },
      },
    },
    evaluation: {
      meta: {
        description: 'Évaluation droits et calcul montant',
        calculMontant: {
          base: '80% de la pension de retraite du conjoint décédé',
          si_pension_incomplete: 'Calcul sur base carrière du défunt',
          minimum: 'Pension minimum garantie si carrière complète du défunt',
        },
        conditionsRevenus2024: {
          exoneration: '21.382,08 €/an revenus propres sans réduction',
          plafond: '32.073,12 €/an maximum (au-delà = perte totale)',
          reduction: 'Réduction proportionnelle si revenus entre exonération et plafond',
          formule: 'Réduction = (revenus - exonération) × pourcentage',
        },
        revenus_pris_en_compte: [
          'Revenus professionnels (salaire, indépendant)',
          'Revenus de remplacement (chômage, maladie)',
          'Pensions propres',
          'Revenus immobiliers (revenus cadastraux)',
        ],
        revenus_exclus: [
          'Allocations familiales',
          'Pension alimentaire reçue',
          'Revenu d\'intégration sociale (CPAS)',
          'Allocation handicap (ARR, AI)',
        ],
        enfantsACharge: {
          exonerationMajoree: 'Exonération plus élevée si enfants',
          montant2024: '+5.345,52 €/an par enfant à charge',
        },
      },
      on: {
        EVALUATION_COMPLETE: 'decision',
      },
    },
    decision: {
      meta: {
        description: 'Décision octroi pension de survie',
        delai: '3-6 mois traitement',
        notification: 'Lettre recommandée avec calcul détaillé',
      },
      on: {
        OCTROI: {
          target: 'paiement',
          actions: assign({
            montantPension: ({ context, event }) => event.montant,
          }),
        },
        REFUS: 'refus',
      },
    },
    paiement: {
      meta: {
        description: 'Paiement pension de survie',
        modalites: {
          frequence: 'Mensuel (fin de mois)',
          dateEffet: 'Premier jour du mois suivant décès',
          retro: 'Paiement rétroactif si demande dans 12 mois décès',
          indexation: 'Indexation automatique (index santé + bien-être)',
        },
        montantsMoyens2024: {
          salaries: 'Entre 1.000€ et 1.800€/mois (selon carrière défunt)',
          minimum: '1.545,07€/mois (carrière complète salariés)',
          avec_propre_pension: 'Cumul limité - max 110% meilleure pension',
        },
        fiscalite: {
          imposable: 'OUI - pension de survie = revenu imposable',
          precompte: 'Précompte professionnel retenu',
          declaration: 'À déclarer aux impôts annuellement',
        },
        obligations: {
          revenus: 'Déclarer TOUS revenus annuellement',
          changementSituation: [
            'Remariage = perte pension survie (définitive)',
            'Cohabitation légale = perte pension survie',
            'Revenus dépassent plafond = suspension',
            'Déménagement à l\'étranger = impact paiement',
          ],
          controles: 'Croisement données ONSS, SPF Finances',
        },
        cumuls: {
          propre_pension: 'OUI mais plafonné (max 110% meilleure pension)',
          pension_garantie_revenus: 'OUI cumulable avec GRAPA',
          chomage: 'OUI mais compte pour plafond revenus',
          salaire: 'OUI mais compte pour plafond revenus',
        },
        avantagesLies: {
          sante: 'Maintien mutuelle conjoint décédé (1 an gratuit)',
          allocations_familiales: 'Majoration orphelins si enfants',
        },
      },
      on: {
        REVISION_REVENUS: {
          target: 'evaluation',
        },
      },
    },
    refus: {
      meta: {
        description: 'Pension de survie refusée',
        motifsFrequents: [
          'Âge < 45 ans et pas d\'enfant à charge',
          'Mariage < 1 an (sauf exceptions)',
          'Pas de lien matrimonial légal (cohabitant de fait)',
          'Revenus dépassent plafond',
          'Déjà remarié(e) ou cohabitant légal',
        ],
        recours: {
          tribunal: 'Tribunal du travail',
          delai: '3 mois à dater notification',
          gratuit: 'Pas de frais de justice',
        },
        alternatives: {
          si_jeune: 'Allocation de transition (temporaire, max 24 mois)',
          si_faibles_revenus: 'GRAPA si 65+ ans',
          si_indigence: 'Revenu intégration sociale (CPAS)',
        },
      },
      type: 'final',
    },
  },
});
