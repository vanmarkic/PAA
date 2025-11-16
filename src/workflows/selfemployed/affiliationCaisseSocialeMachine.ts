import { createMachine, assign } from 'xstate';

/**
 * Machine XState: Affiliation caisse sociale indépendant
 *
 * Base légale: AR n°38 du 27 juillet 1967 organisant le statut social des indépendants
 * Compétence: Caisses d'assurances sociales agréées
 * Délai: Affiliation dans 90 jours du début activité
 *
 * Terminologie consacrée:
 * - "Caisse d'assurances sociales" (non "caisse indépendants")
 * - "Statut social indépendant" (régime sécurité sociale)
 * - "Cotisations sociales trimestrielles" (paiement tous les 3 mois)
 * - "Revenus professionnels" (base de calcul - revenus nets)
 */

interface AffiliationCaisseContext {
  independant: {
    nom: string;
    activite: string;
    dateDebut: string;
  };
  caisse?: {
    nom: string;
    couts_gestion?: number;
  };
  cotisations?: {
    provisoires?: number;
    definitives?: number;
  };
}

type AffiliationCaisseEvent =
  | { type: 'DEMARRER_ACTIVITE'; data: AffiliationCaisseContext }
  | { type: 'CHOISIR_CAISSE'; nom: string }
  | { type: 'AFFILIATION_COMPLETE' }
  | { type: 'PREMIERE_COTISATION' };

export const affiliationCaisseSocialeMachine = createMachine<
  AffiliationCaisseContext,
  AffiliationCaisseEvent
>({
  id: 'affiliationCaisseSociale',
  initial: 'information',
  context: {
    independant: {
      nom: '',
      activite: '',
      dateDebut: '',
    },
  },
  states: {
    information: {
      meta: {
        description: 'Information affiliation statut social indépendant',
        obligation: {
          qui: 'TOUT indépendant (activité principale ou complémentaire)',
          delai: 'Dans les 90 jours du début activité',
          sanction: 'Amende + cotisations rétroactives si retard',
        },
        statut_social: {
          definition: 'Régime sécurité sociale des travailleurs indépendants',
          droits: [
            'Pension',
            'Allocations familiales',
            'Assurance soins de santé (mutuelle)',
            'Incapacité de travail',
            'Faillite (droit passerelle)',
          ],
          exclusions: [
            'Pas d\'assurance chômage',
            'Pas d\'accident du travail (sauf assurance privée)',
            'Pas de pécule vacances',
          ],
        },
        difference_BCE: {
          BCE: 'Banque-Carrefour Entreprises (numéro entreprise - TVA)',
          caisse: 'Caisse assurances sociales (sécurité sociale)',
          obligatoire: 'Les DEUX obligatoires (indépendants)',
        },
      },
      on: {
        DEMARRER_ACTIVITE: 'choix_caisse',
      },
    },
    choix_caisse: {
      meta: {
        description: 'Choix caisse d\'assurances sociales',
        caisses_principales: {
          Acerta: 'Caisse privée',
          Xerius: 'Caisse privée (ex-Zenito)',
          Liantis: 'Caisse privée',
          Partena: 'Caisse privée',
          UCM: 'Union Classes Moyennes (Wallonie/Bruxelles)',
          SNI: 'Syndicat Neutre Indépendants',
          CNASTI: 'Caisse nationale (moins avantageuse)',
        },
        services: {
          identiques: 'Droits sociaux identiques (toutes caisses)',
          difference: 'Services supplémentaires et accompagnement',
          conseil: 'Certaines caisses offrent conseils, formations',
        },
        couts_gestion: {
          principe: 'Frais de gestion trimestriels',
          montant2024: '± 80-100€/trimestre (selon caisse)',
          deductible: 'Déductible fiscalement',
        },
        criteres_choix: {
          proximite: 'Agences locales',
          services: 'Services additionnels (comptabilité, conseils)',
          reputation: 'Réputation, avis',
          outils: 'Outils digitaux (app, portail)',
        },
        changement: 'Possibilité changer caisse (1x/an)',
      },
      on: {
        CHOISIR_CAISSE: 'affiliation',
      },
    },
    affiliation: {
      meta: {
        description: 'Affiliation à la caisse choisie',
        procedure: {
          ou: 'En ligne, par courrier, ou agence',
          formulaire: 'Formulaire affiliation',
          delai_traitement: '1-2 semaines',
        },
        documentsNecessaires: [
          'Carte identité',
          'Numéro BCE (entreprise)',
          'Coordonnées bancaires (domiciliation cotisations)',
          'Attestation début activité',
        ],
        numero_ONSS: {
          attribution: 'Caisse attribue numéro ONSS indépendant',
          usage: 'Identification sécurité sociale',
          unique: 'Un seul numéro à vie',
        },
        mutuelle: {
          obligation: 'S\'affilier AUSSI à une mutuelle',
          delai: 'Dans 90 jours',
          preuve: 'Caisse vérifie affiliation mutuelle',
        },
      },
      on: {
        AFFILIATION_COMPLETE: 'cotisations',
      },
    },
    cotisations: {
      meta: {
        description: 'Paiement cotisations sociales',
        cotisations_provisoires: {
          principe: 'Basées sur revenus estimés ou forfait',
          frequence: 'Trimestrielles (tous les 3 mois)',
          montant_minimum_2024: {
            activite_principale: '± 850€/trimestre (± 3.400€/an)',
            activite_complementaire: '± 90€/trimestre (± 360€/an)',
          },
          calcul: 'Environ 20,5% des revenus nets professionnels',
          dates_paiement: '31 mars, 30 juin, 30 septembre, 31 décembre',
        },
        cotisations_definitives: {
          regularisation: 'Basées sur revenus RÉELS (impôts N-3)',
          delai: 'Calculées 3 ans plus tard',
          supplement: 'Supplément si revenus > estimés',
          remboursement: 'Remboursement si revenus < estimés',
        },
        exemple: {
          revenus_annuels: '30.000€ nets professionnels',
          cotisations: '30.000€ × 20,5% = ± 6.150€/an',
          trimestre: '± 1.537€/trimestre',
        },
        exonerations: {
          premiere_annee: 'Cotisations réduites possible (demande)',
          faibles_revenus: 'Cotisations minimales si revenus < seuil',
          maxi_statut: 'Statut étudiant-indépendant (cotisations réduites)',
        },
        defaut_paiement: {
          majorations: 'Majoration 7% + intérêts',
          poursuites: 'Poursuites ONSS',
          impact_droits: 'Perte droits sociaux (pension, maladie)',
        },
        plan_paiement: {
          possible: 'Plan étalement si difficultés',
          demande: 'Auprès de la caisse',
          conditions: 'Justifier difficultés financières',
        },
        droits_acquis: {
          pension: 'Constitution droits pension',
          maladie: 'Indemnités maladie après carence',
          maternite: 'Allocation maternité',
          faillite: 'Droit passerelle (si faillite)',
        },
      },
      type: 'final',
    },
  },
});
