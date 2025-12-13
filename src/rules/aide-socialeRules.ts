/**
 * Business Rules for Aide Sociale du CPAS
 *
 * Implements the Gherkin specifications from features/benefits/aide-sociale.feature
 * Using json-rules-engine for runtime evaluation.
 *
 * BASE JURIDIQUE:
 * - Loi organique des CPAS du 8 juillet 1976
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1976070860&table_name=loi
 * - Loi du 26 mai 2002 concernant le droit à l'intégration sociale
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2002052647&table_name=loi
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';

/**
 * AideSociale Rules Version Metadata
 * This version MUST match the specification version in features/benefits/aide-sociale.feature
 */
export const AIDE_SOCIALE_RULES_METADATA = {
  implementsSpecification: '0.0.0',
  implementationVersion: '0.0.0',
  implementationStatus: 'complete' as const,
  lastSyncedWith: 'features/benefits/aide-sociale.feature',
  generatedFrom: 'features/benefits/aide-sociale.feature@0.0.0',
  divergences: [] as string[],
  effectiveDate: '2025-12-13',
};

// Constants from Belgian social law
export const AIDE_SOCIALE_CONSTANTS = {
  MIN_AGE_RIS: 18,
  MIN_STAY_EU_MONTHS: 3,
  ENQUETE_SOCIALE_DELAI_JOURS: 30,
  DECISION_DELAI_JOURS: 30,
  PAIEMENT_DELAI_JOURS: 15,
  RECOURS_DELAI_MOIS: 3,
  RECUPERATION_DELAI_ANS: 5,
  AIDE_URGENCE_MAX_MOIS: 1,
  REEVALUATION_AIDE_NATURE_MOIS: 3,
};

export const AIDE_SOCIALE_AMOUNTS_2024 = {
  RIS_ISOLE: 1070.49,
  RIS_COHABITANT: 713.66,
  RIS_FAMILLE_MONOPARENTALE: 1449.83,
  RIS_COHABITANT_FAMILLE: 1449.83,
  GRAPA_REFERENCE: 1549.42,
  GARANTIE_LOCATIVE_MAX_MOIS: 3,
};

export type AideSocialeType =
  | 'aide_medicale_urgente'
  | 'aide_sociale_mineurs'
  | 'aide_sociale_limitee_etudiant'
  | 'avance_allocations'
  | 'aide_nature'
  | 'aide_complementaire'
  | 'aide_urgence'
  | 'aide_equivalente_ris'
  | 'non_eligible';

export type SituationType =
  | 'sans_papiers'
  | 'mineur_non_accompagne'
  | 'etudiant_hors_ue'
  | 'demandeur_emploi'
  | 'parent_isole'
  | 'personne_agee'
  | 'europeen_court_sejour'
  | 'personne_handicap'
  | 'demandeur_asile'
  | 'autre';

export interface AideSocialeUser {
  age: number;
  nationalite: 'belge' | 'ue' | 'hors_ue';
  titreSejour: boolean;
  dureeSejourMois: number;
  residenceEffectiveBelgique: boolean;
  situation: SituationType;
  revenus: number;
  demandeChomageEnCours: boolean;
  moisAttenteChomage?: number;
  beneficiaireRIS: boolean;
  categorieRIS?: 'isole' | 'cohabitant' | 'famille_monoparentale';
  nombreEnfants: number;
  beneficiaireGRAPA: boolean;
  montantGRAPA?: number;
  loyer?: number;
  fraisMedicauxImportants: boolean;
  handicap: boolean;
  allocationsHandicap?: number;
  besoinSoinsMedicauxUrgents: boolean;
  representantLegalBelgique: boolean;
  visaEtudiant: boolean;
  engagementPriseEnCharge: boolean;
  situationUrgence: boolean;
  risqueRue: boolean;
}

export interface AideSocialeEligibilityResult {
  isEligible: boolean;
  typeAide: AideSocialeType;
  montant?: number;
  motif: string;
  aideDetails?: string[];
  obligations?: string[];
  recuperable: boolean;
  delaiRecours?: number;
}

/**
 * Create the AideSociale eligibility rules engine
 */
function createAideSocialeEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Personne sans titre de séjour - aide médicale urgente uniquement
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'titreSejour',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'residenceEffectiveBelgique',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'besoinSoinsMedicauxUrgents',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'aide-sociale-eligible',
      params: {
        typeAide: 'aide_medicale_urgente',
        montant: 0,
        motif: 'aide médicale urgente pour personnes sans titre de séjour',
        aideDetails: ['Prise en charge des frais médicaux urgents par le CPAS'],
        recuperable: false,
      },
    },
    priority: 100,
  });

  // Rule 2: Personne sans papiers demandant aide financière (exclusion)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'titreSejour',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'besoinSoinsMedicauxUrgents',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'aide-sociale-ineligible',
      params: {
        typeAide: 'non_eligible',
        motif: 'pas de titre de séjour valide - aide financière régulière non accessible',
        recuperable: false,
      },
    },
    priority: 99,
  });

  // Rule 3: Mineur non accompagné - aide sociale spécifique
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'lessThan',
          value: AIDE_SOCIALE_CONSTANTS.MIN_AGE_RIS,
        },
        {
          fact: 'representantLegalBelgique',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'situation',
          operator: 'equal',
          value: 'mineur_non_accompagne',
        },
      ],
    },
    event: {
      type: 'aide-sociale-eligible',
      params: {
        typeAide: 'aide_sociale_mineurs',
        montant: AIDE_SOCIALE_AMOUNTS_2024.RIS_ISOLE,
        motif: 'mineurs exclus du RIS - aide sociale spécifique',
        aideDetails: [
          'Hébergement en centre d\'accueil',
          'Nourriture',
          'Vêtements',
          'Frais scolaires',
          'Désignation d\'un tuteur par le service des tutelles',
        ],
        recuperable: false,
      },
    },
    priority: 95,
  });

  // Rule 4: Étudiant étranger hors UE avec garant défaillant
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'nationalite',
          operator: 'equal',
          value: 'hors_ue',
        },
        {
          fact: 'visaEtudiant',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'engagementPriseEnCharge',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'revenus',
          operator: 'lessThan',
          value: AIDE_SOCIALE_AMOUNTS_2024.RIS_ISOLE,
        },
      ],
    },
    event: {
      type: 'aide-sociale-eligible',
      params: {
        typeAide: 'aide_sociale_limitee_etudiant',
        montant: 0,
        motif: 'étudiant avec garant défaillant',
        aideDetails: [
          'Aide exceptionnelle et temporaire',
          'Vérification de l\'engagement de prise en charge par le CPAS',
        ],
        recuperable: true,
      },
    },
    priority: 90,
  });

  // Rule 5: Personne en attente d'allocations de chômage
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'demandeChomageEnCours',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'revenus',
          operator: 'equal',
          value: 0,
        },
        {
          fact: 'nationalite',
          operator: 'equal',
          value: 'belge',
        },
      ],
    },
    event: {
      type: 'aide-sociale-eligible',
      params: {
        typeAide: 'avance_allocations',
        montant: AIDE_SOCIALE_AMOUNTS_2024.RIS_ISOLE,
        motif: 'avance sur allocations de chômage en attente',
        aideDetails: [
          'Montant équivalent au RIS catégorie isolé',
          'Le CPAS contacte l\'ONEM pour accélérer le traitement',
        ],
        recuperable: true,
      },
    },
    priority: 85,
  });

  // Rule 6: Famille avec enfants - aide en nature complémentaire
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'beneficiaireRIS',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'nombreEnfants',
          operator: 'greaterThan',
          value: 0,
        },
        {
          fact: 'situation',
          operator: 'equal',
          value: 'parent_isole',
        },
      ],
    },
    event: {
      type: 'aide-sociale-eligible',
      params: {
        typeAide: 'aide_nature',
        montant: 0,
        motif: 'aide complémentaire en nature pour famille avec enfants',
        aideDetails: [
          'Colis alimentaires via banque alimentaire',
          'Bons d\'achat pour vêtements et fournitures',
          'Abonnement STIB - transport public gratuit',
          'Chèques sport/culture pour activités des enfants',
          'Réévaluation tous les 3 mois',
        ],
        recuperable: false,
      },
    },
    priority: 80,
  });

  // Rule 7: Personne âgée avec GRAPA insuffisante
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: 65,
        },
        {
          fact: 'beneficiaireGRAPA',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'fraisMedicauxImportants',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'aide-sociale-eligible',
      params: {
        typeAide: 'aide_complementaire',
        montant: 0,
        motif: 'aide sociale complémentaire pour personne âgée avec GRAPA',
        aideDetails: [
          'Garantie locative (maximum 3 mois de loyer)',
          'Frais pharmaceutiques non remboursés par la mutuelle',
          'Frais de chauffage via Fonds social mazout/gaz',
          'Aide ménagère via titres-services subsidiés',
          'Enquête sociale complète par le CPAS',
        ],
        recuperable: false,
      },
    },
    priority: 75,
  });

  // Rule 8: Européen en séjour de moins de 3 mois
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'nationalite',
          operator: 'equal',
          value: 'ue',
        },
        {
          fact: 'dureeSejourMois',
          operator: 'lessThan',
          value: AIDE_SOCIALE_CONSTANTS.MIN_STAY_EU_MONTHS,
        },
        {
          fact: 'revenus',
          operator: 'lessThan',
          value: AIDE_SOCIALE_AMOUNTS_2024.RIS_ISOLE,
        },
      ],
    },
    event: {
      type: 'aide-sociale-eligible',
      params: {
        typeAide: 'aide_urgence',
        montant: 0,
        motif: 'aide sociale d\'urgence limitée pour citoyen européen en court séjour',
        aideDetails: [
          'Non éligible au RIS',
          'Aide d\'urgence limitée dans le temps',
          'Ne peut pas créer une charge déraisonnable',
          'Le CPAS peut proposer un retour volontaire',
        ],
        recuperable: false,
      },
    },
    priority: 70,
  });

  // Rule 9: Personne avec handicap - aide sociale spécifique
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'handicap',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'fraisMedicauxImportants',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'aide-sociale-eligible',
      params: {
        typeAide: 'aide_complementaire',
        montant: 0,
        motif: 'aide sociale complémentaire pour personne avec handicap',
        aideDetails: [
          'Adaptation logement (rampe d\'accès, salle de bain)',
          'Matériel médical non couvert par l\'INAMI',
          'Transport adapté vers centres de soins',
          'Aide familiale - heures supplémentaires',
          'Collaboration avec l\'AVIQ/PHARE',
          'Projet individualisé établi',
        ],
        recuperable: false,
      },
    },
    priority: 65,
  });

  // Rule 10: Situation d'urgence - aide immédiate
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'situationUrgence',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'revenus',
          operator: 'equal',
          value: 0,
        },
        {
          fact: 'risqueRue',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'aide-sociale-eligible',
      params: {
        typeAide: 'aide_urgence',
        montant: 0,
        motif: 'aide d\'urgence immédiate pour personne en situation critique',
        aideDetails: [
          'Hébergement d\'urgence en maison d\'accueil ou hôtel social',
          'Repas via tickets restaurant ou colis',
          'Soins médicaux urgents via réquisitoire médical',
          'Vêtements de base via vestiaire social',
          'Enquête sociale complète dans les 30 jours',
          'Aide limitée à maximum 1 mois',
        ],
        recuperable: false,
      },
    },
    priority: 100,
  });

  // Rule 11: Demandeur d'asile - aide équivalente RIS
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'situation',
          operator: 'equal',
          value: 'demandeur_asile',
        },
        {
          fact: 'residenceEffectiveBelgique',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'aide-sociale-eligible',
      params: {
        typeAide: 'aide_equivalente_ris',
        montant: AIDE_SOCIALE_AMOUNTS_2024.RIS_ISOLE,
        motif: 'aide équivalente au RIS pour demandeur d\'asile en procédure',
        aideDetails: [
          'Montant équivalent au RIS catégorie isolé',
          'Procédure d\'asile en cours',
        ],
        recuperable: false,
      },
    },
    priority: 60,
  });

  // Rule 12: Condition générale - âge minimum non atteint (hors mineurs non accompagnés)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'lessThan',
          value: AIDE_SOCIALE_CONSTANTS.MIN_AGE_RIS,
        },
        {
          fact: 'situation',
          operator: 'notEqual',
          value: 'mineur_non_accompagne',
        },
      ],
    },
    event: {
      type: 'aide-sociale-ineligible',
      params: {
        typeAide: 'non_eligible',
        motif: 'âge minimum non atteint - orientation vers services jeunesse',
        recuperable: false,
      },
    },
    priority: 50,
  });

  return engine;
}

/**
 * Singleton instance of the AideSociale rules engine
 */
const aideSocialeEngineInstance = createAideSocialeEngine();

/**
 * Calculate Aide Sociale du CPAS amount
 */
export function calculateAideSocialeAmount(
  user: AideSocialeUser,
  typeAide: AideSocialeType
): number {
  switch (typeAide) {
    case 'aide_medicale_urgente':
      return 0; // Prise en charge directe des frais médicaux

    case 'aide_sociale_mineurs':
      return AIDE_SOCIALE_AMOUNTS_2024.RIS_ISOLE;

    case 'aide_sociale_limitee_etudiant':
      return 0; // Aide variable selon situation

    case 'avance_allocations':
      return AIDE_SOCIALE_AMOUNTS_2024.RIS_ISOLE;

    case 'aide_nature':
      return 0; // Aide en nature, pas de montant fixe

    case 'aide_complementaire':
      // Calcul basé sur les besoins spécifiques
      if (user.beneficiaireGRAPA && user.loyer) {
        const chargesExcessives = user.loyer - (user.montantGRAPA || 0) * 0.4;
        return chargesExcessives > 0 ? chargesExcessives : 0;
      }
      return 0;

    case 'aide_urgence':
      return 0; // Aide d'urgence variable

    case 'aide_equivalente_ris':
      if (user.situation === 'demandeur_asile') {
        return AIDE_SOCIALE_AMOUNTS_2024.RIS_ISOLE;
      }
      if (user.situation === 'mineur_non_accompagne' && user.age >= 17) {
        return AIDE_SOCIALE_AMOUNTS_2024.RIS_ISOLE;
      }
      return 0;

    case 'non_eligible':
    default:
      return 0;
  }
}

/**
 * Check Aide Sociale du CPAS eligibility
 */
export async function checkAideSocialeEligibility(
  user: AideSocialeUser
): Promise<EligibilityCheck> {
  const facts = {
    age: user.age,
    nationalite: user.nationalite,
    titreSejour: user.titreSejour,
    dureeSejourMois: user.dureeSejourMois,
    residenceEffectiveBelgique: user.residenceEffectiveBelgique,
    situation: user.situation,
    revenus: user.revenus,
    demandeChomageEnCours: user.demandeChomageEnCours,
    moisAttenteChomage: user.moisAttenteChomage || 0,
    beneficiaireRIS: user.beneficiaireRIS,
    categorieRIS: user.categorieRIS,
    nombreEnfants: user.nombreEnfants,
    beneficiaireGRAPA: user.beneficiaireGRAPA,
    montantGRAPA: user.montantGRAPA || 0,
    loyer: user.loyer || 0,
    fraisMedicauxImportants: user.fraisMedicauxImportants,
    handicap: user.handicap,
    allocationsHandicap: user.allocationsHandicap || 0,
    besoinSoinsMedicauxUrgents: user.besoinSoinsMedicauxUrgents,
    representantLegalBelgique: user.representantLegalBelgique,
    visaEtudiant: user.visaEtudiant,
    engagementPriseEnCharge: user.engagementPriseEnCharge,
    situationUrgence: user.situationUrgence,
    risqueRue: user.risqueRue,
  };

  try {
    const results = await aideSocialeEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'aide-sociale-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'aide-sociale-eligible');

    if (ineligibleEvent) {
      return {
        benefitType: 'aide-sociale',
        isEligible: false,
        reason: ineligibleEvent.params?.motif as string,
      };
    }

    if (eligibleEvent) {
      const typeAide = eligibleEvent.params?.typeAide as AideSocialeType;
      const montant = eligibleEvent.params?.montant as number || calculateAideSocialeAmount(user, typeAide);

      return {
        benefitType: 'aide-sociale',
        isEligible: true,
        calculatedAmount: montant,
        reason: eligibleEvent.params?.motif as string,
        notes: eligibleEvent.params?.aideDetails as string[],
      };
    }

    return {
      benefitType: 'aide-sociale',
      isEligible: false,
      reason: 'conditions non remplies - veuillez contacter le CPAS pour une évaluation personnalisée',
    };
  } catch (error) {
    throw new Error(`Error checking Aide Sociale du CPAS eligibility: ${error}`);
  }
}

/**
 * Get obligations for aide sociale beneficiary
 */
export function getObligationsBeneficiaire(): string[] {
  return [
    'Déclarer tout changement de situation (conséquence: suspension/récupération de l\'aide)',
    'Collaborer à l\'enquête sociale (conséquence: refus ou suspension de l\'aide)',
    'Faire valoir ses droits - obligation de demander autres aides',
    'Résider effectivement en Belgique (conséquence: suspension après absence prolongée)',
    'Respecter le contrat PIIS si applicable (conséquence: sanctions graduelles)',
  ];
}

/**
 * Get procedure steps for aide sociale request
 */
export function getProcedureDemande(): Array<{ etape: string; delai: string; description: string }> {
  return [
    { etape: 'Accusé de réception', delai: 'Immédiat', description: 'Preuve de dépôt de demande' },
    { etape: 'Enquête sociale', delai: '30 jours max', description: 'Visite à domicile, vérifications' },
    { etape: 'Audition', delai: 'Facultative', description: 'Présentation devant le conseil' },
    { etape: 'Décision', delai: '30 jours', description: 'Notification écrite motivée' },
    { etape: 'Paiement', delai: '15 jours', description: 'Après décision positive' },
    { etape: 'Recours', delai: '3 mois', description: 'Tribunal du travail si refus' },
  ];
}

/**
 * Get recovery conditions for aide sociale
 */
export function getConditionsRecuperation(): Array<{ cas: string; modalites: string }> {
  return [
    { cas: 'Retour à meilleure fortune', modalites: 'Dans les 5 ans, montants raisonnables' },
    { cas: 'Auprès des débiteurs d\'aliments', modalites: 'Parents, enfants selon capacité' },
    { cas: 'Erreur ou fraude', modalites: 'Récupération totale obligatoire' },
    { cas: 'Avance sur prestations', modalites: 'Récupération automatique' },
  ];
}

/**
 * Export rules in JSON format for transparency
 */
export const AIDE_SOCIALE_RULES_JSON = {
  legalFramework: {
    laws: [
      {
        name: 'Loi organique des CPAS',
        date: '1976-07-08',
        reference: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1976070860&table_name=loi',
      },
      {
        name: 'Loi sur le droit à l\'intégration sociale',
        date: '2002-05-26',
        reference: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2002052647&table_name=loi',
      },
    ],
  },
  amounts2024: AIDE_SOCIALE_AMOUNTS_2024,
  constants: AIDE_SOCIALE_CONSTANTS,
  rules: [
    {
      id: 'aide-medicale-urgente',
      description: 'Personne sans titre de séjour - aide médicale urgente uniquement',
      conditions: ['Pas de titre de séjour', 'Résidence effective en Belgique', 'Besoin de soins médicaux urgents'],
      result: 'Éligible à l\'aide médicale urgente uniquement',
      priority: 100,
    },
    {
      id: 'mineur-non-accompagne',
      description: 'Mineur non accompagné - aide sociale spécifique',
      conditions: ['Âge < 18 ans', 'Pas de représentant légal en Belgique', 'Situation de mineur non accompagné'],
      result: 'Éligible à l\'aide sociale (hébergement, nourriture, vêtements, frais scolaires)',
      priority: 95,
    },
    {
      id: 'etudiant-hors-ue',
      description: 'Étudiant étranger hors UE - aide sociale limitée',
      conditions: ['Nationalité hors UE', 'Visa étudiant valide', 'Engagement de prise en charge', 'Ressources insuffisantes'],
      result: 'Aide exceptionnelle et temporaire',
      priority: 90,
    },
    {
      id: 'avance-chomage',
      description: 'Personne en attente d\'allocations de chômage',
      conditions: ['Demande de chômage en cours', 'Aucun revenu', 'Nationalité belge'],
      result: 'Avance sur allocations équivalente au RIS isolé (1070.49€)',
      priority: 85,
    },
    {
      id: 'aide-nature-famille',
      description: 'Famille avec enfants - aide en nature complémentaire',
      conditions: ['Bénéficiaire RIS', 'Enfants à charge', 'Parent isolé'],
      result: 'Aide en nature (colis alimentaires, bons d\'achat, transport, activités enfants)',
      priority: 80,
    },
    {
      id: 'aide-personne-agee',
      description: 'Personne âgée avec GRAPA insuffisante',
      conditions: ['Âge >= 65 ans', 'Bénéficiaire GRAPA', 'Frais médicaux importants'],
      result: 'Aide complémentaire (garantie locative, frais pharmaceutiques, chauffage, aide ménagère)',
      priority: 75,
    },
    {
      id: 'europeen-court-sejour',
      description: 'Européen en séjour de moins de 3 mois',
      conditions: ['Nationalité UE', 'Durée séjour < 3 mois', 'Ressources insuffisantes'],
      result: 'Aide d\'urgence limitée dans le temps',
      priority: 70,
    },
    {
      id: 'aide-handicap',
      description: 'Personne avec handicap - aide sociale spécifique',
      conditions: ['Handicap reconnu', 'Frais médicaux importants liés au handicap'],
      result: 'Aide complémentaire (adaptation logement, matériel médical, transport adapté, aide familiale)',
      priority: 65,
    },
    {
      id: 'aide-urgence',
      description: 'Situation d\'urgence - aide immédiate',
      conditions: ['Situation d\'urgence', 'Aucun revenu', 'Risque immédiat'],
      result: 'Aide d\'urgence immédiate',
      priority: 60,
    },
  ],
};