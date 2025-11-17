import { createMachine, assign } from 'xstate';

/**
 * Machine XState: Droits de donation
 *
 * Base légale: Code des droits de succession et de donation (régional)
 * Compétence: Régionale (Flandre, Wallonie, Bruxelles)
 * Taux 2024: 3% à 30% selon montant, lien familial et région
 *
 * Terminologie consacrée:
 * - "Droits de donation" (taxe régionale)
 * - "Donation mobilière" (argent, titres) vs "Donation immobilière" (biens immeubles)
 * - "Acte authentique" (obligatoire devant notaire pour enregistrement)
 * - "Don manuel" (non enregistré - risque requalification succession)
 */

interface DroitsDonationContext {
  donation: {
    montant: number;
    nature: 'mobiliere' | 'immobiliere';
    region: 'wallonie' | 'flandre' | 'bruxelles';
  };
  parties: {
    donateur: string;
    donataire: string;
    lienParente: 'ligne_directe' | 'entre_epoux' | 'autre';
  };
  droitsCalcules?: number;
  tauxApplique?: number;
}

type DroitsDonationEvent =
  | { type: 'CALCULER_DROITS'; data: DroitsDonationContext }
  | { type: 'ENREGISTRER_DONATION' }
  | { type: 'PAYER_DROITS'; montant: number };

export const droitsDonationMachine = createMachine({
  id: 'droitsDonation',
  initial: 'preparation',
  context: {
    donation: {
      montant: 0,
      nature: 'mobiliere',
      region: 'wallonie',
    },
    parties: {
      donateur: '',
      donataire: '',
      lienParente: 'autre',
    },
  },
  states: {
    preparation: {
      meta: {
        description: 'Préparation donation et calcul droits',
        principes: {
          definition: 'Donation = transfert gratuit et irrévocable de biens',
          taxation: 'Taxe régionale sur donations enregistrées',
          obligation_enregistrement: 'Immobilier = OBLIGATOIRE / Mobilier = CONSEILLÉ',
        },
        types_donations: {
          mobiliere: {
            definition: 'Argent, titres, actions, meubles',
            enregistrement: 'Non obligatoire mais recommandé',
            risque_non_enregistrement: 'Requalification en succession (taux supérieurs)',
          },
          immobiliere: {
            definition: 'Maisons, terrains, immeubles',
            enregistrement: 'OBLIGATOIRE devant notaire',
            acte: 'Acte authentique notarié requis',
          },
        },
        avantages_enregistrement: [
          'Taux réduits (vs droits de succession)',
          'Sécurité juridique',
          'Preuve opposable au fisc',
          'Évite contestations héritiers',
        ],
        delai_enregistrement: '4 mois après donation (Bruxelles/Wallonie)',
      },
      on: {
        CALCULER_DROITS: 'calcul',
      },
    },
    calcul: {
      meta: {
        description: 'Calcul droits de donation selon région et lien parenté',
        tauxWallonie2024: {
          ligne_directe: {
            titre: 'Parents/enfants, grands-parents/petits-enfants',
            tranches: [
              '0 - 12.500€: 3%',
              '12.500 - 25.000€: 4%',
              '25.000 - 50.000€: 5%',
              '50.000 - 100.000€: 7%',
              '100.000 - 150.000€: 10%',
              '150.000 - 200.000€: 14%',
              '200.000 - 250.000€: 18%',
              '250.000 - 500.000€: 24%',
              'Au-delà 500.000€: 30%',
            ],
          },
          entre_epoux: {
            titre: 'Entre époux ou cohabitants légaux',
            tranches: 'Mêmes tranches que ligne directe',
          },
          autres: {
            titre: 'Frères/sœurs, oncles/tantes, sans lien',
            tranches: [
              '0 - 12.500€: 20%',
              '12.500 - 25.000€: 25%',
              '25.000 - 75.000€: 35%',
              '75.000 - 175.000€: 50%',
              'Au-delà 175.000€: 65-80%',
            ],
          },
        },
        tauxFlandre2024: {
          ligne_directe: '3% (taux fixe jusqu\'à 250.000€, puis progressif)',
          entre_epoux: '3% (taux fixe)',
          autres: '7% (taux fixe frères/sœurs), 25-55% (autres)',
        },
        tauxBruxelles2024: {
          ligne_directe: '3% à 30% (barème progressif)',
          entre_epoux: '3% à 30%',
          autres: '20% à 80%',
        },
        reductionsSpeciales: {
          entreprise_familiale: 'Transmission PME familiale (réduction Flandre/Wallonie)',
          habitation_familiale: 'Donation habitation familiale (abattements)',
          jeunes_enfants: 'Abattement enfants < 21 ans (Flandre)',
        },
        exemple: {
          don: '100.000€ d\'un parent à un enfant en Wallonie',
          calcul: [
            '12.500€ × 3% = 375€',
            '12.500€ × 4% = 500€',
            '25.000€ × 5% = 1.250€',
            '50.000€ × 7% = 3.500€',
            'Total droits = 5.625€ (5,625%)',
          ],
        },
      },
      on: {
        ENREGISTRER_DONATION: 'enregistrement',
      },
    },
    enregistrement: {
      meta: {
        description: 'Enregistrement donation auprès de SPF Finances',
        procedure_mobiliere: {
          etape1: 'Rédiger acte devant notaire (recommandé)',
          etape2: 'Notaire enregistre auprès bureau Sécurité juridique',
          etape3: 'Paiement droits de donation',
          delai: '4 mois maximum après donation',
        },
        procedure_immobiliere: {
          obligatoire: 'Acte authentique notarié OBLIGATOIRE',
          notaire: 'Notaire enregistre automatiquement',
          paiement: 'Droits payés au moment de l\'acte',
        },
        frais_notaire: {
          immobilier: '± 1% à 2% de la valeur (honoraires + frais)',
          mobilier: 'Honoraires négociables (quelques centaines €)',
        },
        documents: [
          'Pièces identité donateur et donataire',
          'Preuve lien de parenté (acte naissance, mariage)',
          'Estimation bien si immobilier',
          'Compte bancaire pour virement (mobilier)',
        ],
      },
      on: {
        PAYER_DROITS: 'finalisation',
      },
    },
    finalisation: {
      meta: {
        description: 'Donation enregistrée et droits payés',
        effets: {
          irrevocabilite: 'Donation définitive (sauf conditions résolutoires)',
          opposabilite: 'Opposable aux tiers et au fisc',
          succession: 'Pris en compte dans succession (rapport/réduction si nécessaire)',
        },
        obligations_futures: {
          rapport: 'Donataire doit rapporter donation à succession (sauf dispense)',
          reserve_hereditaire: 'Donation ne peut léser réserve héritiers réservataires',
          action_reduction: 'Héritiers peuvent demander réduction si réserve lésée',
        },
        avantages_fiscaux: {
          vs_succession: 'Taux donations souvent inférieurs aux successions',
          anticiper: 'Permet transmission patrimoine de son vivant',
          pluralite: 'Donations répétées tous les 3 ans (délai reconstitution)',
        },
        clause_retour: {
          definition: 'Bien revient au donateur si donataire décède avant lui',
          usage: 'Protège donateur (surtout donations parents âgés)',
          enregistrement: 'Doit être dans acte authentique',
        },
      },
      type: 'final',
    },
  },
});
