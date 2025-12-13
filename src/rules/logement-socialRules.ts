/**
 * Business Rules for Logement Social
 *
 * Implements the Gherkin specifications from features/benefits/logement-social.feature
 * Using json-rules-engine for runtime evaluation.
 *
 * BASE JURIDIQUE:
 * - Code bruxellois du Logement (Ordonnance du 17 juillet 2003)
 * - Code wallon de l'Habitation durable (décret du 29 octobre 1998)
 * - Vlaamse Wooncode (decreet van 15 juli 1997)
 * - Arrêté du Gouvernement flamand du 12 octobre 2007 réglementant le régime de location sociale
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';

/**
 * LogementSocial Rules Version Metadata
 * This version MUST match the specification version in features/benefits/logement-social.feature
 */
export const LOGEMENT_SOCIAL_RULES_METADATA = {
  implementsSpecification: '0.0.0',
  implementationVersion: '0.0.0',
  implementationStatus: 'complete' as const,
  lastSyncedWith: 'features/benefits/logement-social.feature',
  generatedFrom: 'features/benefits/logement-social.feature@0.0.0',
  divergences: [] as string[],
  effectiveDate: '2025-12-13',
};

// Constants from Belgian social housing law
export const LOGEMENT_SOCIAL_CONSTANTS = {
  // Wallonia income thresholds 2024
  WALLONIE_PLAFOND_ISOLE: 69800,
  WALLONIE_PLAFOND_MENAGE: 85100,
  WALLONIE_MAJORATION_ENFANT: 3200,

  // Flanders income thresholds 2024
  FLANDRES_2024_PLAFOND_ISOLE: 29515,
  FLANDRES_2024_PLAFOND_ISOLE_HANDICAP: 31987,
  FLANDRES_2024_PLAFOND_AUTRES: 44270,
  FLANDRES_2024_MAJORATION_ENFANT: 2475,

  // Flanders income thresholds 2025
  FLANDRES_2025_PLAFOND_ISOLE: 30636,
  FLANDRES_2025_PLAFOND_ISOLE_HANDICAP: 33202,
  FLANDRES_2025_PLAFOND_AUTRES: 45952,
  FLANDRES_2025_MAJORATION_ENFANT: 2569,

  // Brussels child allowance
  BRUXELLES_MAJORATION_ENFANT: 2702.77,

  // Flanders patrimony limit (since 2024)
  FLANDRES_PATRIMOINE_LIMITE_2025: 30636,

  // Rent calculation percentages
  RENT_PERCENTAGE_MIN: 0.20,
  RENT_PERCENTAGE_MAX: 0.30,

  // Priority points (Wallonia)
  POINTS_MONOPARENTAL: 3,
  POINTS_PAR_ENFANT: 1,
  POINTS_INSALUBRITE: 5,

  // Minimum disability percentage for priority
  HANDICAP_MINIMUM_PERCENTAGE: 66,
};

export type Region = 'Bruxelles-Capitale' | 'Wallonie' | 'Flandres';
export type SituationFamiliale = 'personne_isolee' | 'couple' | 'famille' | 'monoparental';

export interface LogementSocialUser {
  age: number;
  region: Region;
  situationFamiliale: SituationFamiliale;
  revenuImposable: number;
  nombreEnfants: number;
  estProprietaire: boolean;
  estInscritRegistre: boolean;
  handicapReconnu: boolean;
  pourcentageHandicap?: number;
  patrimoineMobilier?: number;
  logementInsalubre?: boolean;
  certificatInsalubrite?: boolean;
  estSansAbri?: boolean;
  accompagnementCPAS?: boolean;
  estEtudiant?: boolean;
  estAutonomeFinancierement?: boolean;
  anneeReference?: number;
  bienInhabitable?: boolean;
  certificatInhabitabilite?: boolean;
}

export interface LogementSocialEligibilityResult extends EligibilityCheck {
  plafondApplicable?: number;
  delaiAttenteEstime?: string;
  pointsPriorite?: number;
  documentsRequis?: string[];
  loyerEstime?: number;
  prioriteSupplementaire?: boolean;
  motifsPriorite?: string[];
}

/**
 * Create the LogementSocial eligibility rules engine
 */
function createLogementSocialEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Property ownership check (highest priority - absolute exclusion)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'estProprietaire',
          operator: 'equal',
          value: true,
        },
        {
          any: [
            {
              fact: 'bienInhabitable',
              operator: 'equal',
              value: false,
            },
            {
              fact: 'bienInhabitable',
              operator: 'equal',
              value: undefined,
            },
          ],
        },
      ],
    },
    event: {
      type: 'logementSocial-ineligible',
      params: {
        reason: 'propriétaire d\'un bien immobilier',
        note: 'l\'exception existe uniquement si le bien est inhabitable avec certificat',
      },
    },
    priority: 100,
  });

  // Rule 2: Registration requirement
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'estInscritRegistre',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'estSansAbri',
          operator: 'notEqual',
          value: true,
        },
      ],
    },
    event: {
      type: 'logementSocial-ineligible',
      params: {
        reason: 'non inscrit au registre de la population',
      },
    },
    priority: 95,
  });

  // Rule 3: Wallonia - Single person income check
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'Wallonie',
        },
        {
          fact: 'situationFamiliale',
          operator: 'equal',
          value: 'personne_isolee',
        },
        {
          fact: 'revenuImposable',
          operator: 'greaterThan',
          value: LOGEMENT_SOCIAL_CONSTANTS.WALLONIE_PLAFOND_ISOLE,
        },
      ],
    },
    event: {
      type: 'logementSocial-ineligible',
      params: {
        reason: `revenus > plafond (${LOGEMENT_SOCIAL_CONSTANTS.WALLONIE_PLAFOND_ISOLE}€)`,
        plafond: LOGEMENT_SOCIAL_CONSTANTS.WALLONIE_PLAFOND_ISOLE,
      },
    },
    priority: 80,
  });

  // Rule 4: Wallonia - Household income check (with children adjustment)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'Wallonie',
        },
        {
          fact: 'situationFamiliale',
          operator: 'notEqual',
          value: 'personne_isolee',
        },
        {
          fact: 'revenuDepasse_wallonie_menage',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'logementSocial-ineligible',
      params: {
        reason: 'revenus dépassent le plafond adapté pour ménage en Wallonie',
      },
    },
    priority: 79,
  });

  // Rule 5: Flanders 2024 - Single person income check
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'Flandres',
        },
        {
          fact: 'anneeReference',
          operator: 'equal',
          value: 2024,
        },
        {
          fact: 'situationFamiliale',
          operator: 'equal',
          value: 'personne_isolee',
        },
        {
          fact: 'handicapReconnu',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'revenuImposable',
          operator: 'greaterThan',
          value: LOGEMENT_SOCIAL_CONSTANTS.FLANDRES_2024_PLAFOND_ISOLE,
        },
      ],
    },
    event: {
      type: 'logementSocial-ineligible',
      params: {
        reason: `revenus > plafond (${LOGEMENT_SOCIAL_CONSTANTS.FLANDRES_2024_PLAFOND_ISOLE}€)`,
        plafond: LOGEMENT_SOCIAL_CONSTANTS.FLANDRES_2024_PLAFOND_ISOLE,
      },
    },
    priority: 78,
  });

  // Rule 6: Flanders 2024 - Single person with disability income check
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'Flandres',
        },
        {
          fact: 'anneeReference',
          operator: 'equal',
          value: 2024,
        },
        {
          fact: 'situationFamiliale',
          operator: 'equal',
          value: 'personne_isolee',
        },
        {
          fact: 'handicapReconnu',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'revenuImposable',
          operator: 'greaterThan',
          value: LOGEMENT_SOCIAL_CONSTANTS.FLANDRES_2024_PLAFOND_ISOLE_HANDICAP,
        },
      ],
    },
    event: {
      type: 'logementSocial-ineligible',
      params: {
        reason: `revenus > plafond handicap (${LOGEMENT_SOCIAL_CONSTANTS.FLANDRES_2024_PLAFOND_ISOLE_HANDICAP}€)`,
        plafond: LOGEMENT_SOCIAL_CONSTANTS.FLANDRES_2024_PLAFOND_ISOLE_HANDICAP,
      },
    },
    priority: 77,
  });

  // Rule 7: Flanders 2024 - Other cases (couples, families) income check
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'Flandres',
        },
        {
          fact: 'anneeReference',
          operator: 'equal',
          value: 2024,
        },
        {
          fact: 'situationFamiliale',
          operator: 'notEqual',
          value: 'personne_isolee',
        },
        {
          fact: 'revenuDepasse_flandres_2024_autres',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'logementSocial-ineligible',
      params: {
        reason: 'revenus dépassent le plafond adapté pour ménage en Flandres 2024',
      },
    },
    priority: 76,
  });

  // Rule 8: Flanders 2025 - Patrimony check (new rule since 2024)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'Flandres',
        },
        {
          fact: 'anneeReference',
          operator: 'greaterThanInclusive',
          value: 2024,
        },
        {
          fact: 'patrimoineMobilier',
          operator: 'greaterThan',
          value: LOGEMENT_SOCIAL_CONSTANTS.FLANDRES_PATRIMOINE_LIMITE_2025,
        },
      ],
    },
    event: {
      type: 'logementSocial-ineligible',
      params: {
        reason: `patrimoine mobilier > limite (${LOGEMENT_SOCIAL_CONSTANTS.FLANDRES_PATRIMOINE_LIMITE_2025}€)`,
        note: 'cette règle s\'applique uniquement aux nouvelles inscriptions depuis janvier 2024',
      },
    },
    priority: 85,
  });

  // Rule 9: Flanders 2025 - Single person income check
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'Flandres',
        },
        {
          fact: 'anneeReference',
          operator: 'equal',
          value: 2025,
        },
        {
          fact: 'situationFamiliale',
          operator: 'equal',
          value: 'personne_isolee',
        },
        {
          fact: 'handicapReconnu',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'revenuImposable',
          operator: 'greaterThan',
          value: LOGEMENT_SOCIAL_CONSTANTS.FLANDRES_2025_PLAFOND_ISOLE,
        },
      ],
    },
    event: {
      type: 'logementSocial-ineligible',
      params: {
        reason: `revenus > plafond 2025 (${LOGEMENT_SOCIAL_CONSTANTS.FLANDRES_2025_PLAFOND_ISOLE}€)`,
        plafond: LOGEMENT_SOCIAL_CONSTANTS.FLANDRES_2025_PLAFOND_ISOLE,
      },
    },
    priority: 75,
  });

  // Rule 10: Flanders 2025 - Single person with disability income check
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'Flandres',
        },
        {
          fact: 'anneeReference',
          operator: 'equal',
          value: 2025,
        },
        {
          fact: 'situationFamiliale',
          operator: 'equal',
          value: 'personne_isolee',
        },
        {
          fact: 'handicapReconnu',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'revenuImposable',
          operator: 'greaterThan',
          value: LOGEMENT_SOCIAL_CONSTANTS.FLANDRES_2025_PLAFOND_ISOLE_HANDICAP,
        },
      ],
    },
    event: {
      type: 'logementSocial-ineligible',
      params: {
        reason: `revenus > plafond handicap 2025 (${LOGEMENT_SOCIAL_CONSTANTS.FLANDRES_2025_PLAFOND_ISOLE_HANDICAP}€)`,
        plafond: LOGEMENT_SOCIAL_CONSTANTS.FLANDRES_2025_PLAFOND_ISOLE_HANDICAP,
      },
    },
    priority: 74,
  });

  // Rule 11: Homeless with CPAS support - Emergency eligibility
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'estSansAbri',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'accompagnementCPAS',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'logementSocial-eligible-urgence',
      params: {
        message: 'Éligible en urgence via Housing First',
        priorite: 'urgence',
        accompagnementObligatoire: true,
        logementTransit: true,
      },
    },
    priority: 90,
  });

  // Rule 12: Brussels - Eligible single person
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'Bruxelles-Capitale',
        },
        {
          fact: 'estProprietaire',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'estInscritRegistre',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'logementSocial-eligible',
      params: {
        message: 'Éligible au logement social à Bruxelles-Capitale',
        delaiAttente: '11-12 ans pour un studio',
        societe: 'société de logement social bruxelloise',
      },
    },
    priority: 50,
  });

  // Rule 13: Wallonia - Eligible household
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'Wallonie',
        },
        {
          fact: 'estProprietaire',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'estInscritRegistre',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'revenuDansLimites_wallonie',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'logementSocial-eligible',
      params: {
        message: 'Éligible au logement social en Wallonie',
        delaiAttente: '3-5 ans',
        societe: 'société wallonne du logement',
      },
    },
    priority: 50,
  });

  // Rule 14: Flanders - Eligible person
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'Flandres',
        },
        {
          fact: 'estProprietaire',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'revenuDansLimites_flandres',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'patrimoineDansLimites_flandres',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'logementSocial-eligible',
      params: {
        message: 'Éligible au logement social en Flandres',
        delaiAttente: '2-5 ans',
      },
    },
    priority: 50,
  });

  // Rule 15: Priority for disability in Flanders
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'Flandres',
        },
        {
          fact: 'handicapReconnu',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'pourcentageHandicap',
          operator: 'greaterThanInclusive',
          value: LOGEMENT_SOCIAL_CONSTANTS.HANDICAP_MINIMUM_PERCENTAGE,
        },
      ],
    },
    event: {
      type: 'logementSocial-priorite',
      params: {
        priorite: 'handicap',
        message: 'Priorité supplémentaire sur la liste d\'attente',
        logementAdapte: true,
      },
    },
    priority: 40,
  });

  // Rule 16: Priority for large family with insalubrious housing in Wallonia
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'Wallonie',
        },
        {
          fact: 'logementInsalubre',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'certificatInsalubrite',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'logementSocial-priorite',
      params: {
        priorite: 'insalubrite',
        points: LOGEMENT_SOCIAL_CONSTANTS.POINTS_INSALUBRITE,
        message: 'Points de priorité pour logement insalubre',
      },
    },
    priority: 40,
  });

  // Rule 17: Priority for single parent
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'situationFamiliale',
          operator: 'equal',
          value: 'monoparental',
        },
      ],
    },
    event: {
      type: 'logementSocial-priorite',
      params: {
        priorite: 'monoparental',
        points: LOGEMENT_SOCIAL_CONSTANTS.POINTS_MONOPARENTAL,
        message: 'Points de priorité pour famille monoparentale',
      },
    },
    priority: 40,
  });

  return engine;
}

/**
 * Singleton instance of the LogementSocial rules engine
 */
const logementSocialEngineInstance = createLogementSocialEngine();

/**
 * Calculate income threshold for Wallonia based on family composition
 */
export function calculateWalloniaPlafond(
  situationFamiliale: SituationFamiliale,
  nombreEnfants: number
): number {
  const basePlafond = situationFamiliale === 'personne_isolee'
    ? LOGEMENT_SOCIAL_CONSTANTS.WALLONIE_PLAFOND_ISOLE
    : LOGEMENT_SOCIAL_CONSTANTS.WALLONIE_PLAFOND_MENAGE;

  return basePlafond + (nombreEnfants * LOGEMENT_SOCIAL_CONSTANTS.WALLONIE_MAJORATION_ENFANT);
}

/**
 * Calculate income threshold for Flanders based on family composition and year
 */
export function calculateFlandresPlafond(
  situationFamiliale: SituationFamiliale,
  nombreEnfants: number,
  handicapReconnu: boolean,
  annee: number = 2024
): number {
  let basePlafond: number;
  let majorationEnfant: number;

  if (annee >= 2025) {
    majorationEnfant = LOGEMENT_SOCIAL_CONSTANTS.FLANDRES_2025_MAJORATION_ENFANT;
    if (situationFamiliale === 'personne_isolee') {
      basePlafond = handicapReconnu
        ? LOGEMENT_SOCIAL_CONSTANTS.FLANDRES_2025_PLAFOND_ISOLE_HANDICAP
        : LOGEMENT_SOCIAL_CONSTANTS.FLANDRES_2025_PLAFOND_ISOLE;
    } else {
      basePlafond = LOGEMENT_SOCIAL_CONSTANTS.FLANDRES_2025_PLAFOND_AUTRES;
    }
  } else {
    majorationEnfant = LOGEMENT_SOCIAL_CONSTANTS.FLANDRES_2024_MAJORATION_ENFANT;
    if (situationFamiliale === 'personne_isolee') {
      basePlafond = handicapReconnu
        ? LOGEMENT_SOCIAL_CONSTANTS.FLANDRES_2024_PLAFOND_ISOLE_HANDICAP
        : LOGEMENT_SOCIAL_CONSTANTS.FLANDRES_2024_PLAFOND_ISOLE;
    } else {
      basePlafond = LOGEMENT_SOCIAL_CONSTANTS.FLANDRES_2024_PLAFOND_AUTRES;
    }
  }

  return basePlafond + (nombreEnfants * majorationEnfant);
}

/**
 * Calculate estimated social rent based on income and region
 */
export function calculateLogementSocialRent(
  revenuAnnuel: number,
  region: Region
): number {
  // Social rent is approximately 20-30% of income, calculated monthly
  const rentPercentage = 0.20; // Base percentage
  const monthlyIncome = revenuAnnuel / 12;
  const estimatedRent = Math.round(monthlyIncome * rentPercentage);

  // Apply regional adjustments based on Gherkin examples
  switch (region) {
    case 'Bruxelles-Capitale':
      // Examples: 15000 -> 250, 25000 -> 416
      return Math.round(revenuAnnuel / 60);
    case 'Wallonie':
      // Examples: 18000 -> 300, 30000 -> 500
      return Math.round(revenuAnnuel / 60);
    case 'Flandres':
      // Example: 20000 -> 333
      return Math.round(revenuAnnuel / 60);
    default:
      return estimatedRent;
  }
}

/**
 * Calculate priority points for Wallonia
 */
export function calculatePriorityPoints(user: LogementSocialUser): number {
  let points = 0;

  if (user.situationFamiliale === 'monoparental') {
    points += LOGEMENT_SOCIAL_CONSTANTS.POINTS_MONOPARENTAL;
  }

  if (user.nombreEnfants > 0) {
    points += user.nombreEnfants * LOGEMENT_SOCIAL_CONSTANTS.POINTS_PAR_ENFANT;
  }

  if (user.logementInsalubre && user.certificatInsalubrite) {
    points += LOGEMENT_SOCIAL_CONSTANTS.POINTS_INSALUBRITE;
  }

  return points;
}

/**
 * Get estimated waiting time based on region and housing type
 */
export function getEstimatedWaitingTime(
  region: Region,
  nombreChambres: number = 1
): string {
  switch (region) {
    case 'Bruxelles-Capitale':
      if (nombreChambres <= 1) {
        return '11-12 ans';
      } else if (nombreChambres === 2) {
        return '8-10 ans';
      } else {
        return '8-12 ans';
      }
    case 'Wallonie':
      return '3-5 ans';
    case 'Flandres':
      return '2-5 ans';
    default:
      return 'inconnu';
  }
}

/**
 * Get list of required documents
 */
export function getRequiredDocuments(user: LogementSocialUser): Array<{document: string, obligatoire: boolean, remarque: string}> {
  const documents = [
    { document: 'Carte d\'identité', obligatoire: true, remarque: 'Tous les membres du ménage' },
    { document: 'Composition de ménage', obligatoire: true, remarque: 'Datée de moins de 3 mois' },
    { document: 'Avertissement-extrait de rôle', obligatoire: true, remarque: 'Année de référence N-3' },
    { document: 'Preuve de non-propriété', obligatoire: true, remarque: 'Attestation notariale' },
  ];

  if (user.handicapReconnu) {
    documents.push({ document: 'Certificat médical handicap', obligatoire: true, remarque: 'Pour priorité/adaptation' });
  }

  if (user.situationFamiliale === 'monoparental') {
    documents.push({ document: 'Jugement de garde enfants', obligatoire: true, remarque: 'Parents séparés' });
  }

  if (user.accompagnementCPAS || user.revenuImposable === 0) {
    documents.push({ document: 'Attestation CPAS/chômage', obligatoire: true, remarque: 'Pour revenus de remplacement' });
  }

  return documents;
}

/**
 * Check Logement Social eligibility
 */
export async function checkLogementSocialEligibility(
  user: LogementSocialUser
): Promise<LogementSocialEligibilityResult> {
  const annee = user.anneeReference || new Date().getFullYear();

  // Calculate derived facts for the rules engine
  let plafondApplicable: number;
  let revenuDansLimites_wallonie = false;
  let revenuDansLimites_flandres = false;
  let revenuDepasse_wallonie_menage = false;
  let revenuDepasse_flandres_2024_autres = false;
  let patrimoineDansLimites_flandres = true;

  if (user.region === 'Wallonie') {
    plafondApplicable = calculateWalloniaPlafond(user.situationFamiliale, user.nombreEnfants);
    revenuDansLimites_wallonie = user.revenuImposable <= plafondApplicable;
    revenuDepasse_wallonie_menage = user.situationFamiliale !== 'personne_isolee' && user.revenuImposable > plafondApplicable;
  } else if (user.region === 'Flandres') {
    plafondApplicable = calculateFlandresPlafond(
      user.situationFamiliale,
      user.nombreEnfants,
      user.handicapReconnu,
      annee
    );
    revenuDansLimites_flandres = user.revenuImposable <= plafondApplicable;
    
    const plafondAutres = annee >= 2025
      ? LOGEMENT_SOCIAL_CONSTANTS.FLANDRES_2025_PLAFOND_AUTRES + (user.nombreEnfants * LOGEMENT_SOCIAL_CONSTANTS.FLANDRES_2025_MAJORATION_ENFANT)
      : LOGEMENT_SOCIAL_CONSTANTS.FLANDRES_2024_PLAFOND_AUTRES + (user.nombreEnfants * LOGEMENT_SOCIAL_CONSTANTS.FLANDRES_2024_MAJORATION_ENFANT);
    revenuDepasse_flandres_2024_autres = user.situationFamiliale !== 'personne_isolee' && user.revenuImposable > plafondAutres;

    // Patrimony check for Flanders (since 2024)
    if (user.patrimoineMobilier !== undefined && annee >= 2024) {
      patrimoineDansLimites_flandres = user.patrimoineMobilier <= LOGEMENT_SOCIAL_CONSTANTS.FLANDRES_PATRIMOINE_LIMITE_2025;
    }
  } else {
    // Brussels - Variable thresholds, using Wall