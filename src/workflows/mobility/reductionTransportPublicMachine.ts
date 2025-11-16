import { createMachine, assign } from 'xstate';

/**
 * Machine XState: Réductions transport public
 *
 * Base légale: Règlements SNCB, STIB, TEC, De Lijn
 * Compétence: Sociétés de transport (SNCB, STIB, De Lijn, TEC)
 *
 * Terminologie consacrée:
 * - "Carte de réduction" (divers types selon statut)
 * - "Tarif préférentiel" (prix réduit)
 * - "BIM" - Intervention Majorée (critère social)
 * - "Omnipas" (Bruxelles), "Mobib" (support électronique)
 */

interface ReductionTransportContext {
  beneficiaire: {
    nom: string;
    age: number;
    statut?: string; // BIM, étudiant, 65+, handicap
  };
  carte?: {
    type: string;
    reduction: number; // %
    gratuite?: boolean;
  };
}

type ReductionTransportEvent =
  | { type: 'VERIFIER_ELIGIBILITE'; data: ReductionTransportContext }
  | { type: 'ELIGIBLE'; type: string }
  | { type: 'DEMANDER_CARTE' }
  | { type: 'CARTE_OBTENUE' };

export const reductionTransportPublicMachine = createMachine<
  ReductionTransportContext,
  ReductionTransportEvent
>({
  id: 'reductionTransportPublic',
  initial: 'information',
  context: {
    beneficiaire: {
      nom: '',
      age: 0,
    },
  },
  states: {
    information: {
      meta: {
        description: 'Information réductions transport public',
        reductions_principales: {
          seniors_65plus: {
            SNCB: 'Carte Senior (6€/an) - 50% réduction (hors pointe)',
            STIB: 'Gratuit dès 65 ans (Bruxelles)',
            TEC: 'Gratuit dès 65 ans (Wallonie)',
            De_Lijn: 'Gratuit dès 65 ans (Flandre)',
          },
          BIM: {
            SNCB: 'Tarif social BIM (50% réduction)',
            STIB: 'Omnipas (12,30€/an - quasi gratuit)',
            TEC: 'TEC Horizons+ (24€/an)',
            De_Lijn: 'Omnipas (Flandre - gratuit ou très réduit)',
          },
          handicap: {
            SNCB: 'Carte invalidité (gratuite) - 50% ou 100% selon %',
            invalidite_66plus: 'Gratuit si invalidité ≥ 66%',
            accompagnateur: 'Accompagnateur gratuit si carte spécifique',
          },
          jeunes: {
            moins_25ans: 'Go Pass 10 (53€ - 10 trajets)',
            etudiants: 'Réductions variables selon région',
          },
          chomage: {
            SNCB: 'Billet gratuit pour entretien embauche',
            conditions: 'Sur présentation convocation',
          },
        },
        support_mobib: {
          definition: 'Carte électronique rechargeable',
          usage: 'STIB, TEC, De Lijn, SNCB (interopérable)',
          obtention: 'Points de vente, gares, en ligne',
        },
      },
      on: {
        VERIFIER_ELIGIBILITE: 'verification',
      },
    },
    verification: {
      meta: {
        description: 'Vérification éligibilité réductions',
        criteres: {
          age_65plus: {
            condition: '≥ 65 ans',
            avantage: 'Gratuité TEC, STIB, De Lijn / 50% SNCB',
            documents: 'Carte identité',
          },
          BIM: {
            condition: 'Statut BIM mutuelle',
            avantage: 'Omnipas/TEC Horizons+ (quasi gratuit)',
            preuve: 'Vignette mutuelle',
          },
          invalidite: {
            condition: 'Invalidité reconnue',
            taux: {
              moins_66: '50% réduction SNCB',
              plus_66: 'Gratuit SNCB + accompagnateur',
            },
            document: 'Attestation SPF Sécurité Sociale',
          },
          jeune: {
            condition: '< 25 ans',
            avantages: 'Go Pass, Campus, abonnements étudiants',
          },
        },
      },
      on: {
        ELIGIBLE: 'demande',
      },
    },
    demande: {
      meta: {
        description: 'Demande carte de réduction',
        procedures: {
          SNCB_senior: {
            ou: 'Guichets SNCB, en ligne',
            prix: '6€/an',
            documents: 'Carte identité',
            validite: '1 an',
          },
          SNCB_BIM: {
            ou: 'Guichets SNCB',
            prix: 'Selon formule (réduit)',
            documents: 'Vignette BIM mutuelle',
          },
          SNCB_invalidite: {
            ou: 'Guichets SNCB',
            gratuit: 'OUI',
            documents: 'Attestation invalidité SPF',
          },
          Omnipas_STIB: {
            ou: 'Points STIB, communes (Bruxelles)',
            prix: '12,30€/an (BIM)',
            documents: 'Vignette BIM, composition ménage',
          },
          TEC_65plus: {
            ou: 'Points TEC, en ligne',
            gratuit: 'OUI (dès 65 ans)',
            documents: 'Carte identité',
          },
        },
      },
      on: {
        DEMANDER_CARTE: 'octroi',
      },
    },
    octroi: {
      meta: {
        description: 'Carte de réduction obtenue',
        utilisation: {
          SNCB: 'Présenter carte lors achat billet',
          STIB_TEC_DeLijn: 'Valider Mobib à chaque trajet',
          controles: 'Carte + pièce identité obligatoires',
        },
        validite: {
          senior_SNCB: '1 an (renouvellement annuel)',
          BIM: 'Tant que statut BIM valide',
          gratuite_65: 'Tant que résident région',
          invalidite: 'Tant que reconnaissance valide',
        },
        avantages_specifiques: {
          hors_pointe: 'SNCB: réduction maximale hors heures pointe',
          weekend: 'SNCB: réductions week-end',
          accompagnateur: 'Gratuit si invalidité ≥ 66%',
          famille: 'Réductions famille nombreuse (≥ 3 enfants)',
        },
        restrictions: {
          heures_pointe: 'Parfois réduction moindre heures pointe (SNCB)',
          validite_geographique: 'Omnipas valable uniquement dans région',
        },
      },
      type: 'final',
    },
  },
});
