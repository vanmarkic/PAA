import { createMachine, assign } from 'xstate';

/**
 * Machine XState: Congé parental
 *
 * Base légale: CCT n°64 (secteur privé) / AR du 10 juin 2002 (secteur public)
 * Compétence: ONEM (indemnités) + employeur (congé)
 * Montant 2024: ± 900-1.000€/mois (temps plein) - ± 450€ (mi-temps)
 *
 * Terminologie consacrée:
 * - "Congé parental" (droit individuel chaque parent)
 * - "Allocation d'interruption" (indemnité ONEM pendant congé)
 * - "Formules" (temps plein, mi-temps, 1/5 temps)
 * - "Crédit de 4 mois" (durée totale par parent et par enfant)
 */

interface CongeParentalContext {
  travailleur: {
    nom: string;
    anciennete: number; // mois
    secteur: 'prive' | 'public';
  };
  enfant: {
    dateNaissance: string;
    age: number; // mois
  };
  formule?: {
    type: 'temps_plein' | 'mi_temps' | 'un_cinquieme';
    duree_mois?: number;
  };
  allocation?: {
    montantMensuel: number;
  };
}

type CongeParentalEvent =
  | { type: 'DEMANDER_CONGE'; data: CongeParentalContext }
  | { type: 'CHOISIR_FORMULE'; formule: 'temps_plein' | 'mi_temps' | 'un_cinquieme' }
  | { type: 'EMPLOYEUR_ACCEPTE' }
  | { type: 'EMPLOYEUR_REPORTE'; motif: string }
  | { type: 'ONEM_OCTROIE'; montant: number };

export const congeParentalMachine = createMachine({
  id: 'congeParental',
  initial: 'information',
  context: {
    travailleur: {
      nom: '',
      anciennete: 0,
      secteur: 'prive',
    },
    enfant: {
      dateNaissance: '',
      age: 0,
    },
  },
  states: {
    information: {
      meta: {
        description: 'Information sur le congé parental',
        principe: {
          droit: 'Droit individuel de chaque parent (père ET mère)',
          credit: '4 mois équivalent temps plein par enfant',
          flexibilite: 'Différentes formules possibles',
          indemnisation: 'Allocation ONEM (forfaitaire)',
        },
        conditions: {
          anciennete: 'Minimum 12 mois ancienneté chez employeur actuel',
          lien_filiation: 'Parent biologique, adoptif, ou parent social',
          age_enfant: 'Jusqu\'à 12 ans de l\'enfant (21 ans si handicap)',
        },
        formules: {
          temps_plein: {
            duree: '4 mois maximum (en une ou plusieurs fois)',
            interruption: '100% du temps de travail',
            allocation2024: '± 900-1.000€/mois',
            remarque: 'Suspension complète du contrat',
          },
          mi_temps: {
            duree: '8 mois maximum (= 4 mois équivalent temps plein)',
            interruption: '50% du temps de travail',
            allocation2024: '± 450-500€/mois',
            condition: 'Régime au moins mi-temps avant congé',
          },
          un_cinquieme: {
            duree: '20 mois maximum (= 4 mois équivalent temps plein)',
            interruption: '1/5 temps (1 jour/semaine)',
            allocation2024: '± 180-200€/mois',
            condition: 'Régime temps plein avant congé',
          },
        },
        delai_demande: {
          employeur: '2 mois avant (secteur privé) ou 3 mois (public)',
          ONEM: '2 mois avant début',
          forme: 'Demande écrite recommandée',
        },
      },
      on: {
        DEMANDER_CONGE: 'demande_employeur',
      },
    },
    demande_employeur: {
      meta: {
        description: 'Demande congé parental à l\'employeur',
        procedure: {
          lettre: 'Lettre recommandée à employeur',
          delai: 'Minimum 2 mois avant date souhaitée (privé)',
          contenu: [
            'Dates début et fin',
            'Formule choisie (temps plein, mi-temps, 1/5)',
            'Copie acte naissance enfant',
          ],
        },
        reaction_employeur: {
          acceptation: 'Généralement obligé d\'accepter',
          report_possible: 'Report max 6 mois si raisons organisationnelles graves',
          refus_illegal: 'Refus sans motif = illégal',
        },
        protection: {
          licenciement: 'Protection contre licenciement pendant demande',
          motif_grave: 'Licenciement motif grave reste possible',
        },
      },
      on: {
        CHOISIR_FORMULE: 'demande_ONEM',
        EMPLOYEUR_REPORTE: 'report',
      },
    },
    demande_ONEM: {
      meta: {
        description: 'Demande allocation auprès ONEM',
        procedure: {
          formulaire: 'Formulaire C61 (ONEM)',
          ou: 'Bureau ONEM ou organisme paiement (CGSLB, CSC, FGTB)',
          delai: 'Introduire 2 mois avant début congé',
        },
        documentsNecessaires: [
          'Formulaire C61 complété',
          'Attestation employeur (preuve congé parental)',
          'Acte naissance enfant',
          'Preuve ancienneté (si nécessaire)',
        ],
        verification: {
          anciennete: 'Contrôle 12 mois ancienneté',
          formule: 'Vérification formule choisie',
          credit: 'Calcul crédit restant (4 mois)',
        },
      },
      on: {
        ONEM_OCTROIE: 'conge_en_cours',
      },
    },
    conge_en_cours: {
      meta: {
        description: 'Congé parental en cours',
        montants2024: {
          temps_plein: {
            montant: '± 966,40€/mois (1er mois)',
            montant_suivants: '± 847,14€/mois (mois suivants)',
            remarque: 'Montant majoré 1er mois',
          },
          mi_temps: {
            montant: '± 483,20€/mois (1er mois)',
            montant_suivants: '± 423,57€/mois (mois suivants)',
          },
          un_cinquieme: {
            montant: '± 193,28€/mois (1er mois)',
            montant_suivants: '± 169,43€/mois (mois suivants)',
          },
        },
        paiement: {
          frequence: 'Mensuel',
          organisme: 'Organisme paiement (syndicat ou CAPAC)',
          delai: 'Généralement fin de mois',
        },
        fiscalite: {
          imposable: 'OUI - allocation imposable',
          precompte: 'Précompte professionnel retenu',
        },
        droits_sociaux: {
          pension: 'Assimilé pour pension (périodes comptabilisées)',
          vacances: 'Pas de pécule vacances pendant congé',
          anciennete: 'Ancienneté continue',
          mutuelle: 'Affiliation mutuelle maintenue',
        },
        fractionnement: {
          possible: 'Congé peut être fractionné',
          minimum: 'Périodes minimum 1 mois',
          etalement: 'Jusqu\'à 12 ans enfant (ou 21 si handicap)',
        },
        obligations: {
          notification_fin: 'Prévenir employeur avant retour',
          changement: 'Notifier tout changement situation',
        },
      },
      type: 'final',
    },
    report: {
      meta: {
        description: 'Employeur reporte le congé',
        motifs_valables: {
          organisationnel: 'Raisons organisationnelles graves',
          periode: 'Période déjà plusieurs absences',
          remplacement: 'Impossibilité trouver remplaçant',
        },
        duree_report: 'Maximum 6 mois',
        nouvelle_date: 'Accord sur nouvelle date',
        recours: 'Si report abusif → Tribunal du travail',
      },
      on: {
        CHOISIR_FORMULE: 'demande_ONEM',
      },
    },
  },
});
