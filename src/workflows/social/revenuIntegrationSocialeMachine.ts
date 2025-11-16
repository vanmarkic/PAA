import { createMachine, assign } from 'xstate';

/**
 * Machine XState: Revenu d'Intégration Sociale (RIS) - CPAS
 *
 * Base légale: Loi du 26 mai 2002 concernant le droit à l'intégration sociale
 * Compétence: CPAS de la commune de résidence
 * Montants 2024: Cohabitant 870,91€ - Isolé 1.306,37€ - Famille à charge 1.774,98€
 *
 * Terminologie consacrée:
 * - "Revenu d'Intégration Sociale" - RIS (non "minimex" - ancien terme)
 * - "Enquête sociale" (investigation par assistant social)
 * - "Projet Individualisé d'Intégration Sociale" - PIIS (contrat avec bénéficiaire)
 * - "État de besoin" (indigence nécessitant aide sociale)
 */

interface RISContext {
  demandeur: {
    nom: string;
    age: number;
    nationalite: string;
    residence: string;
  };
  situation: {
    categorie?: 'cohabitant' | 'isole' | 'famille_a_charge';
    revenus?: number;
    patrimoine?: number;
  };
  montantRIS?: number;
  piis?: {
    objectifs?: string[];
    suivi?: boolean;
  };
}

type RISEvent =
  | { type: 'DEMANDER_RIS'; data: RISContext }
  | { type: 'ENQUETE_SOCIALE' }
  | { type: 'DECISION_OCTROI'; categorie: string; montant: number }
  | { type: 'DECISION_REFUS'; motif: string }
  | { type: 'SIGNER_PIIS'; objectifs: string[] };

export const revenuIntegrationSocialeMachine = createMachine({
  id: 'revenuIntegrationSociale',
  initial: 'demande',
  context: {
    demandeur: {
      nom: '',
      age: 0,
      nationalite: '',
      residence: '',
    },
    situation: {},
  },
  states: {
    demande: {
      meta: {
        description: 'Demande RIS auprès du CPAS',
        conditions: {
          age: 'Minimum 18 ans (ou émancipé/enceinte/enfant à charge)',
          nationalite: 'Belge, UE, apatride, réfugié reconnu, ou séjour > 3 mois',
          residence: 'Résidence effective en Belgique',
          etat_besoin: 'État de besoin (ressources insuffisantes)',
          disponibilite: 'Être disposé au travail (sauf motifs légitimes)',
        },
        exceptions_age: {
          mineur_emancipe: 'Si émancipé par mariage',
          mineure_enceinte: 'Si enceinte',
          mineur_enfant: 'Si enfant à charge',
        },
        exceptions_disponibilite: {
          etudes: 'Poursuivre études (avec autorisation)',
          sante: 'Incapacité médicale',
          famille: 'Charge famille (enfants jeunes)',
          age: '60+ ans',
        },
        ou_demander: 'CPAS de la commune où on réside effectivement',
        delai_decision: '30 jours maximum (8 jours si urgence)',
      },
      on: {
        DEMANDER_RIS: 'enquete',
      },
    },
    enquete: {
      meta: {
        description: 'Enquête sociale par assistant social CPAS',
        verification: {
          revenus: 'Tous revenus du demandeur et ménage',
          patrimoine: 'Biens immobiliers, comptes bancaires, véhicules',
          composition_menage: 'Personnes vivant sous même toit',
          disponibilite: 'Aptitude et volonté de travailler',
          tentatives_emploi: 'Démarches recherche emploi',
        },
        visite_domicile: 'Visite au domicile par assistant social',
        enquete_voisinage: 'Possible (controversé)',
        delai: '30 jours maximum pour décision',
        recevabilite: 'Accusé réception obligatoire (preuve demande)',
      },
      on: {
        DECISION_OCTROI: 'octroi',
        DECISION_REFUS: 'refus',
      },
    },
    octroi: {
      meta: {
        description: 'RIS accordé par le CPAS',
        montants2024: {
          cohabitant: {
            montant: '870,91 €/mois',
            definition: 'Vit avec d\'autres personnes (parents, colocataires)',
            remarque: 'Catégorie la moins élevée',
          },
          isole: {
            montant: '1.306,37 €/mois',
            definition: 'Vit seul(e)',
          },
          famille_a_charge: {
            montant: '1.774,98 €/mois',
            definition: 'Au moins 1 enfant mineur à charge OU personne à charge',
            conditions: 'Enfant doit vivre sous même toit',
          },
        },
        paiement: {
          frequence: 'Mensuel (généralement début mois)',
          mode: 'Virement ou paiement au CPAS',
          avance: 'Avance possible si urgence',
        },
        caractereFamilial: 'RIS tient compte revenus TOUT le ménage',
        indexation: 'Indexation automatique',
      },
      on: {
        SIGNER_PIIS: 'piis',
      },
    },
    piis: {
      meta: {
        description: 'Projet Individualisé d\'Intégration Sociale (PIIS)',
        obligation: {
          moins_25_ans: 'OBLIGATOIRE si < 25 ans',
          plus_25_ans: 'Souvent exigé aussi',
        },
        contenu: {
          objectifs: 'Emploi, formation, études, logement, santé',
          etapes: 'Actions concrètes et échéances',
          suivi: 'Rendez-vous réguliers avec assistant social',
          sanctions: 'Non-respect peut entraîner suspension RIS',
        },
        exemples_objectifs: [
          'Inscription Forem/VDAB/Actiris',
          'Postuler minimum X offres/mois',
          'Suivre formation professionnelle',
          'Poursuivre études (si autorisé)',
          'Soigner problème santé',
          'Chercher logement autonome',
        ],
        flexibilite: 'Adapté à situation personnelle',
        revision: 'Révision périodique (3-6 mois)',
      },
      on: {
        ENQUETE_SOCIALE: 'revision',
      },
    },
    revision: {
      meta: {
        description: 'Révision périodique de la situation',
        frequence: 'Tous les 3-6 mois',
        controles: {
          revenus: 'Vérification changements situation financière',
          piis: 'Respect engagements PIIS',
          composition: 'Changements composition ménage',
          domicile: 'Vérification résidence effective',
        },
        sanctions: {
          fausse_declaration: 'Récupération montants + sanctions pénales',
          absence_rdv: 'Suspension temporaire possible',
          refus_travail: 'Suspension si refus emploi convenable',
          piis_non_respecte: 'Suspension progressive',
        },
      },
      on: {
        DECISION_OCTROI: 'octroi',
        DECISION_REFUS: 'refus',
      },
    },
    refus: {
      meta: {
        description: 'RIS refusé',
        motifs_frequents: [
          'Revenus suffisants (propres ou ménage)',
          'Patrimoine important (immeuble, épargne)',
          'Pas de disponibilité travail (sans excuse)',
          'Résidence fictive (fraude)',
          'Nationalité sans titre séjour',
        ],
        recours: {
          tribunal_travail: 'Recours devant Tribunal du travail',
          delai: '3 mois à dater notification',
          gratuit: 'Pas de frais de justice',
          assistance: 'Aide juridique possible',
        },
        aide_equivalente: {
          alternative: 'CPAS peut accorder "aide sociale équivalente"',
          difference: 'Pas un droit (pouvoir discrétion), montants variables',
          cas: 'Si pas RIS mais état de besoin réel',
        },
      },
      type: 'final',
    },
  },
});
