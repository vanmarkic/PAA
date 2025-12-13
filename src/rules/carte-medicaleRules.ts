/**
 * Business Rules for Carte Médicale et Aide Médicale Urgente (AMU)
 *
 * Implements the Gherkin specifications from features/benefits/carte-medicale.feature
 * Using json-rules-engine for runtime evaluation.
 *
 * BASE JURIDIQUE:
 * - Loi du 26 mai 2002 concernant le droit à l'intégration sociale (articles relatifs à l'aide médicale)
 * - Loi du 2 avril 1965 relative à la prise en charge des secours accordés par les CPAS
 * - Arrêté royal du 12 décembre 1996 relatif à l'aide médicale urgente
 * - Circulaire du 14 juillet 2014 concernant l'aide médicale urgente
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';

/**
 * CarteMedicale Rules Version Metadata
 * This version MUST match the specification version in features/benefits/carte-medicale.feature
 */
export const CARTE_MEDICALE_RULES_METADATA = {
  implementsSpecification: '0.0.0',
  implementationVersion: '0.0.0',
  implementationStatus: 'complete' as const,
  lastSyncedWith: 'features/benefits/carte-medicale.feature',
  generatedFrom: 'features/benefits/carte-medicale.feature@0.0.0',
  divergences: [] as string[],
  effectiveDate: '2025-12-13',
};

// Constants from Belgian social law
export const CARTE_MEDICALE_CONSTANTS = {
  // Validity periods
  VALIDITY_MONTHS: 3,
  RENEWAL_DAYS: 15,
  DECISION_DAYS_NORMAL: 30,
  DECISION_DAYS_URGENT: 1,
  
  // Coverage amounts
  LUNETTES_FORFAIT_ENFANTS: 150,
  LUNETTES_FORFAIT_ADULTES: 200,
  LUNETTES_VALIDITY_YEARS: 2,
  KINE_MAX_SESSIONS_YEAR: 18,
  
  // Coverage percentages
  COVERAGE_FULL: 100,
  COVERAGE_PARTIAL: 50,
  
  // Residence requirements (in months)
  EU_CITIZEN_MIN_RESIDENCE_MONTHS: 3,
  
  // Income thresholds (based on RIS amounts 2024)
  RIS_ISOLE: 1263.17,
  RIS_COHABITANT: 842.11,
  RIS_FAMILLE: 1707.11,
  
  // Minimum remaining after expenses thresholds
  MIN_RESTE_A_VIVRE_ISOLE: 500,
  MIN_RESTE_A_VIVRE_COUPLE: 600,
  MIN_RESTE_A_VIVRE_FAMILLE: 900,
};

export type ResidencyStatus = 
  | 'belgian_resident'
  | 'legal_resident'
  | 'irregular_stay'
  | 'asylum_seeker_rejected'
  | 'eu_citizen'
  | 'eu_student';

export type FamilySituation = 
  | 'isolated'
  | 'couple'
  | 'single_parent'
  | 'family';

export type CarteMedicaleType = 
  | 'full'
  | 'partial'
  | 'amu'
  | 'amu_temporary';

export type CoverageType = {
  medecin_generaliste: boolean;
  medicaments_essentiels: boolean;
  hospitalisation_urgente: boolean;
  soins_dentaires_urgents: boolean;
  analyses_laboratoire: boolean;
  kinesitherapie: boolean;
  lunettes: boolean;
  psychologue: boolean;
  planning_familial: boolean;
  sante_mentale: boolean;
};

export interface CarteMedicaleUser {
  age: number;
  residencyStatus: ResidencyStatus;
  monthsInBelgium: number;
  monthlyIncome: number;
  monthlyRent: number;
  monthlyCharges: number;
  hasMutuelle: boolean;
  mutuelleActive: boolean;
  hasChronicHealthIssues: boolean;
  hasUrgentMedicalNeed: boolean;
  hasMedicalCertificateUrgency: boolean;
  familySituation: FamilySituation;
  numberOfChildren: number;
  childrenSchooled: boolean;
  receivesRIS: boolean;
  canReturnToCountry: boolean;
  isIndigent: boolean;
}

export interface CarteMedicaleEligibilityResult {
  benefitType: 'carte-medicale';
  isEligible: boolean;
  cardType?: CarteMedicaleType;
  validityMonths?: number;
  coverage?: Partial<CoverageType>;
  lunettesAmount?: number;
  reason?: string;
  familyCovered?: boolean;
  renewalRequired?: boolean;
  decisionDays?: number;
}

/**
 * Create the CarteMedicale eligibility rules engine
 */
function createCarteMedicaleEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Belgian resident without resources - Full medical card
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'residencyStatus',
          operator: 'in',
          value: ['belgian_resident', 'legal_resident'],
        },
        {
          fact: 'monthlyIncome',
          operator: 'lessThan',
          value: CARTE_MEDICALE_CONSTANTS.RIS_ISOLE,
        },
        {
          fact: 'mutuelleActive',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'carteMedicale-eligible',
      params: {
        cardType: 'full',
        reason: 'Résident belge/légal sans ressources suffisantes et sans mutuelle active',
        validityMonths: CARTE_MEDICALE_CONSTANTS.VALIDITY_MONTHS,
        decisionDays: CARTE_MEDICALE_CONSTANTS.DECISION_DAYS_NORMAL,
      },
    },
    priority: 8,
  });

  // Rule 2: RIS beneficiary - Automatic full card
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'receivesRIS',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'carteMedicale-eligible',
      params: {
        cardType: 'full',
        reason: 'Bénéficiaire du RIS - carte médicale automatique',
        validityMonths: CARTE_MEDICALE_CONSTANTS.VALIDITY_MONTHS,
        decisionDays: CARTE_MEDICALE_CONSTANTS.DECISION_DAYS_NORMAL,
      },
    },
    priority: 10,
  });

  // Rule 3: Irregular stay with urgent medical need - AMU
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'residencyStatus',
          operator: 'equal',
          value: 'irregular_stay',
        },
        {
          fact: 'hasUrgentMedicalNeed',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasMedicalCertificateUrgency',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'isIndigent',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'carteMedicale-eligible',
      params: {
        cardType: 'amu',
        reason: 'Sans-papiers en état d\'indigence avec besoin médical urgent attesté',
        validityMonths: CARTE_MEDICALE_CONSTANTS.VALIDITY_MONTHS,
        decisionDays: CARTE_MEDICALE_CONSTANTS.DECISION_DAYS_URGENT,
      },
    },
    priority: 9,
  });

  // Rule 4: Rejected asylum seeker - Full AMU
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'residencyStatus',
          operator: 'equal',
          value: 'asylum_seeker_rejected',
        },
        {
          fact: 'isIndigent',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'carteMedicale-eligible',
      params: {
        cardType: 'amu',
        reason: 'Demandeur d\'asile débouté - AMU complète',
        validityMonths: CARTE_MEDICALE_CONSTANTS.VALIDITY_MONTHS,
        decisionDays: CARTE_MEDICALE_CONSTANTS.DECISION_DAYS_URGENT,
      },
    },
    priority: 9,
  });

  // Rule 5: EU citizen less than 3 months - Temporary AMU only
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'residencyStatus',
          operator: 'in',
          value: ['eu_citizen', 'eu_student'],
        },
        {
          fact: 'monthsInBelgium',
          operator: 'lessThan',
          value: CARTE_MEDICALE_CONSTANTS.EU_CITIZEN_MIN_RESIDENCE_MONTHS,
        },
        {
          fact: 'isIndigent',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasUrgentMedicalNeed',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'carteMedicale-eligible',
      params: {
        cardType: 'amu_temporary',
        reason: 'Européen sans ressources depuis moins de 3 mois - AMU temporaire uniquement',
        validityMonths: 1,
        decisionDays: CARTE_MEDICALE_CONSTANTS.DECISION_DAYS_URGENT,
      },
    },
    priority: 7,
  });

  // Rule 6: EU student cannot return and in urgent need
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'residencyStatus',
          operator: 'equal',
          value: 'eu_student',
        },
        {
          fact: 'monthsInBelgium',
          operator: 'lessThan',
          value: CARTE_MEDICALE_CONSTANTS.EU_CITIZEN_MIN_RESIDENCE_MONTHS,
        },
        {
          fact: 'canReturnToCountry',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'isIndigent',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'carteMedicale-eligible',
      params: {
        cardType: 'amu_temporary',
        reason: 'Étudiant européen sans ressources ne pouvant rentrer - AMU temporaire',
        validityMonths: 1,
        decisionDays: CARTE_MEDICALE_CONSTANTS.DECISION_DAYS_URGENT,
      },
    },
    priority: 6,
  });

  // Rule 7: Partial card for workers with insufficient income
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'residencyStatus',
          operator: 'in',
          value: ['belgian_resident', 'legal_resident'],
        },
        {
          fact: 'monthlyIncome',
          operator: 'greaterThan',
          value: 0,
        },
        {
          fact: 'monthlyIncome',
          operator: 'lessThan',
          value: CARTE_MEDICALE_CONSTANTS.RIS_COHABITANT,
        },
        {
          fact: 'hasMutuelle',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'carteMedicale-eligible',
      params: {
        cardType: 'partial',
        reason: 'Travailleur précaire avec mutuelle mais revenus insuffisants - aide partielle',
        validityMonths: CARTE_MEDICALE_CONSTANTS.VALIDITY_MONTHS,
        decisionDays: CARTE_MEDICALE_CONSTANTS.DECISION_DAYS_NORMAL,
      },
    },
    priority: 5,
  });

  // Rule 8: Family card for single parent with children on RIS
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'familySituation',
          operator: 'equal',
          value: 'single_parent',
        },
        {
          fact: 'receivesRIS',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'numberOfChildren',
          operator: 'greaterThan',
          value: 0,
        },
        {
          fact: 'childrenSchooled',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'carteMedicale-eligible',
      params: {
        cardType: 'full',
        reason: 'Parent isolé bénéficiaire RIS avec enfants scolarisés - carte familiale',
        validityMonths: CARTE_MEDICALE_CONSTANTS.VALIDITY_MONTHS,
        familyCovered: true,
        decisionDays: CARTE_MEDICALE_CONSTANTS.DECISION_DAYS_NORMAL,
      },
    },
    priority: 9,
  });

  // Rule 9: Elderly person with insufficient resources after expenses
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: 65,
        },
        {
          fact: 'familySituation',
          operator: 'equal',
          value: 'isolated',
        },
        {
          fact: 'resteAVivre',
          operator: 'lessThan',
          value: CARTE_MEDICALE_CONSTANTS.MIN_RESTE_A_VIVRE_ISOLE,
        },
        {
          fact: 'hasChronicHealthIssues',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'carteMedicale-eligible',
      params: {
        cardType: 'full',
        reason: 'Personne âgée isolée avec reste à vivre insuffisant et problèmes de santé chroniques',
        validityMonths: CARTE_MEDICALE_CONSTANTS.VALIDITY_MONTHS,
        decisionDays: CARTE_MEDICALE_CONSTANTS.DECISION_DAYS_NORMAL,
      },
    },
    priority: 8,
  });

  // Rule 10: Insufficient income - refused (with mutuelle active and income above threshold)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'monthlyIncome',
          operator: 'greaterThanInclusive',
          value: CARTE_MEDICALE_CONSTANTS.RIS_ISOLE,
        },
        {
          fact: 'mutuelleActive',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'resteAVivre',
          operator: 'greaterThanInclusive',
          value: CARTE_MEDICALE_CONSTANTS.MIN_RESTE_A_VIVRE_ISOLE,
        },
      ],
    },
    event: {
      type: 'carteMedicale-ineligible',
      params: {
        reason: 'Revenus et reste à vivre suffisants avec mutuelle active - carte refusée',
      },
    },
    priority: 4,
  });

  // Rule 11: Irregular stay without urgent need - ineligible
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'residencyStatus',
          operator: 'equal',
          value: 'irregular_stay',
        },
        {
          fact: 'hasUrgentMedicalNeed',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'carteMedicale-ineligible',
      params: {
        reason: 'Séjour irrégulier sans besoin médical urgent attesté - pas d\'AMU',
      },
    },
    priority: 3,
  });

  // Rule 12: EU citizen without indigence proof
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'residencyStatus',
          operator: 'in',
          value: ['eu_citizen', 'eu_student'],
        },
        {
          fact: 'monthsInBelgium',
          operator: 'lessThan',
          value: CARTE_MEDICALE_CONSTANTS.EU_CITIZEN_MIN_RESIDENCE_MONTHS,
        },
        {
          fact: 'isIndigent',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'carteMedicale-ineligible',
      params: {
        reason: 'Européen depuis moins de 3 mois sans état d\'indigence prouvé - pas d\'aide sociale',
      },
    },
    priority: 3,
  });

  return engine;
}

/**
 * Singleton instance of the CarteMedicale rules engine
 */
const carteMedicaleEngineInstance = createCarteMedicaleEngine();

/**
 * Calculate remaining resources (reste à vivre)
 */
export function calculateResteAVivre(
  monthlyIncome: number,
  monthlyRent: number,
  monthlyCharges: number
): number {
  return Math.max(0, monthlyIncome - monthlyRent - monthlyCharges);
}

/**
 * Get minimum threshold for reste à vivre based on family situation
 */
export function getMinResteAVivre(
  familySituation: FamilySituation,
  numberOfPersons: number
): number {
  switch (familySituation) {
    case 'isolated':
      return CARTE_MEDICALE_CONSTANTS.MIN_RESTE_A_VIVRE_ISOLE;
    case 'couple':
      return CARTE_MEDICALE_CONSTANTS.MIN_RESTE_A_VIVRE_COUPLE;
    case 'single_parent':
    case 'family':
      return CARTE_MEDICALE_CONSTANTS.MIN_RESTE_A_VIVRE_FAMILLE;
    default:
      return CARTE_MEDICALE_CONSTANTS.MIN_RESTE_A_VIVRE_ISOLE;
  }
}

/**
 * Determine card decision based on reste à vivre evaluation
 */
export function evaluateResteAVivre(
  familySituation: FamilySituation,
  resteAVivre: number,
  numberOfPersons: number
): 'carte accordée' | 'carte refusée' | 'carte partielle' {
  const minThreshold = getMinResteAVivre(familySituation, numberOfPersons);
  
  if (resteAVivre < minThreshold * 0.6) {
    return 'carte accordée';
  } else if (resteAVivre < minThreshold) {
    return 'carte partielle';
  } else {
    return 'carte refusée';
  }
}

/**
 * Get coverage based on card type
 */
export function getCoverageForCardType(cardType: CarteMedicaleType): Partial<CoverageType> {
  switch (cardType) {
    case 'full':
      return {
        medecin_generaliste: true,
        medicaments_essentiels: true,
        hospitalisation_urgente: true,
        soins_dentaires_urgents: true,
        analyses_laboratoire: true,
        kinesitherapie: true,
        lunettes: true,
        psychologue: true,
        planning_familial: true,
        sante_mentale: true,
      };
    case 'partial':
      return {
        medecin_generaliste: true,
        medicaments_essentiels: false, // Only 50% category C
        hospitalisation_urgente: true,
        soins_dentaires_urgents: true,
        analyses_laboratoire: true,
        kinesitherapie: false,
        lunettes: true,
        psychologue: false,
        planning_familial: false,
        sante_mentale: false,
      };
    case 'amu':
      return {
        medecin_generaliste: true, // Urgent consultations only
        medicaments_essentiels: true, // On prescription
        hospitalisation_urgente: true,
        soins_dentaires_urgents: false,
        analyses_laboratoire: true,
        kinesitherapie: false,
        lunettes: false,
        psychologue: false,
        planning_familial: true, // Pregnancy and birth covered
        sante_mentale: false,
      };
    case 'amu_temporary':
      return {
        medecin_generaliste: true, // Urgent only
        medicaments_essentiels: true, // Urgent only
        hospitalisation_urgente: true,
        soins_dentaires_urgents: false,
        analyses_laboratoire: false,
        kinesitherapie: false,
        lunettes: false,
        psychologue: false,
        planning_familial: false,
        sante_mentale: false,
      };
    default:
      return {};
  }
}

/**
 * Calculate lunettes amount based on user profile
 */
export function calculateLunettesAmount(
  cardType: CarteMedicaleType,
  isChild: boolean
): number {
  if (cardType === 'amu' || cardType === 'amu_temporary') {
    return 0;
  }
  
  if (isChild) {
    return CARTE_MEDICALE_CONSTANTS.LUNETTES_FORFAIT_ENFANTS;
  }
  
  if (cardType === 'partial') {
    return CARTE_MEDICALE_CONSTANTS.LUNETTES_FORFAIT_ADULTES;
  }
  
  return 0; // Full card covers through network
}

/**
 * Calculate Carte Médicale et Aide Médicale Urgente (AMU) amount
 * Note: The carte médicale doesn't provide a monetary amount but rather coverage
 * This function returns the maximum monthly value of covered services
 */
export function calculateCarteMedicaleAmount(
  cardType: CarteMedicaleType,
  hasChronicCondition: boolean,
  numberOfFamilyMembers: number
): number {
  // Estimated monthly value of medical coverage
  const baseValues: Record<CarteMedicaleType, number> = {
    full: 500,
    partial: 200,
    amu: 350,
    amu_temporary: 150,
  };
  
  let amount = baseValues[cardType] || 0;
  
  if (hasChronicCondition) {
    amount *= 1.5; // 50% increase for chronic conditions
  }
  
  if (numberOfFamilyMembers > 1) {
    amount *= (1 + (numberOfFamilyMembers - 1) * 0.3); // 30% per additional family member
  }
  
  return Math.round(amount);
}

/**
 * Check Carte Médicale et Aide Médicale Urgente (AMU) eligibility
 */
export async function checkCarteMedicaleEligibility(
  user: CarteMedicaleUser
): Promise<CarteMedicaleEligibilityResult> {
  const resteAVivre = calculateResteAVivre(
    user.monthlyIncome,
    user.monthlyRent,
    user.monthlyCharges
  );
  
  const numberOfPersons = user.familySituation === 'isolated' ? 1 :
    user.familySituation === 'couple' ? 2 :
    1 + user.numberOfChildren;
  
  const facts = {
    age: user.age,
    residencyStatus: user.residencyStatus,
    monthsInBelgium: user.monthsInBelgium,
    monthlyIncome: user.monthlyIncome,
    monthlyRent: user.monthlyRent,
    monthlyCharges: user.monthlyCharges,
    hasMutuelle: user.hasMutuelle,
    mutuelleActive: user.mutuelleActive,
    hasChronicHealthIssues: user.hasChronicHealthIssues,
    hasUrgentMedicalNeed: user.hasUrgentMedicalNeed,
    hasMedicalCertificateUrgency: user.hasMedicalCertificateUrgency,
    familySituation: user.familySituation,
    numberOfChildren: user.numberOfChildren,
    childrenSchooled: user.childrenSchooled,
    receivesRIS: user.receivesRIS,
    canReturnToCountry: user.canReturnToCountry,
    isIndigent: user.isIndigent,
    resteAVivre: resteAVivre,
    numberOfPersons: numberOfPersons,
  };

  try {
    const results = await carteMedicaleEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'carteMedicale-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'carteMedicale-eligible');

    if (ineligibleEvent) {
      return {
        benefitType: 'carte-medicale',
        isEligible: false,
        reason: ineligibleEvent.params?.reason as string,
      };
    }

    if (eligibleEvent) {
      const cardType = eligibleEvent.params?.cardType as CarteMedicaleType;
      const familyCovered = eligibleEvent.params?.familyCovered as boolean || false;
      
      return {
        benefitType: 'carte-medicale',
        isEligible: true,
        cardType: cardType,
        validityMonths: eligibleEvent.params?.validityMonths as number,
        coverage: getCoverageForCardType(cardType),
        lunettesAmount: calculateLunettesAmount(cardType, false),
        reason: eligibleEvent.params?.reason as string,
        familyCovered: familyCovered,
        renewalRequired: true,
        decisionDays: eligibleEvent.params?.decisionDays as number,
      };
    }

    return {
      benefitType: 'carte-medicale',
      isEligible: false,
      reason: 'conditions non remplies - enquête sociale nécessaire',
    };
  } catch (error) {
    throw new Error(`Error checking Carte Médicale et Aide Médicale Urgente (AMU) eligibility: ${error}`);
  }
}

/**
 * Get required documents for application
 */
export function getRequiredDocuments(
  residencyStatus: ResidencyStatus,
  hasUrgentNeed: boolean
): string[] {
  const baseDocuments = [
    'Carte d\'identité ou passeport',
    'Composition de ménage',
    'Preuves de revenus (salaire, allocations)',
    'Preuves de charges (loyer, factures)',
  ];
  
  if (hasUrgentNeed) {
    baseDocuments.push('Attestation médicale d\'urgence');
  }
  
  if (residencyStatus === 'irregular_stay' || residencyStatus === 'asylum_seeker_rejected') {
    baseDocuments.push('Attestation d\'indigence');
  }
  
  return baseDocuments;
}

/**
 * Get appeal information
 */
export function getAppealInfo(): {
  internalAppealDays: number;
  tribunalAppealMonths: number;
  legalAidAvailable: boolean;
  urgentCareAccessDuringAppeal: boolean;
} {
  return {
    internalAppealDays: 15,
    tribunalAppealMonths: 3,
    legalAidAvailable: true,
    urgentCareAccessDuringAppeal: true,
  };
}

/**
 * Export rules in JSON format for transparency
 */
export const CARTE_MEDICALE_RULES_JSON = {
  legalFramework: {
    primaryLaw: 'Loi du 26 mai 2002 concernant le droit à l\'intégration sociale',
    secondaryLaw: 'Loi du 2 avril 1965 relative à la prise en charge des secours accordés par les CPAS',
    amuLaw: 'Arrêté royal du 12 décembre 1996 relatif à l\'aide médicale urgente',
    circular: 'Circulaire du 14 juillet 2014 concernant l\'aide médicale urgente',
  },
  rules: [
    {
      id: 'belgian-resident-full-card',
      description: 'Résident belge sans ressources - carte médicale complète',
      conditions: [
        'Résidence belge ou légale',
        'Revenus inférieurs au RIS',
        'Pas de mutuelle active',
      ],
      outcome: 'Carte médicale complète valable 3 mois',
    },
    {
      id: 'ris-beneficiary',
      description: 'Bénéficiaire RIS - carte automatique',
      conditions: [
        'Bénéficie du RIS',
      ],
      outcome: 'Carte médicale complète automatique',
    },
    {
      id: 'irregular-stay-amu',
      description: 'Sans-papiers avec besoin urgent - AMU',
      conditions: [
        'Séjour irrégulier',
        'Besoin médical urgent attesté',
        'État d\'indigence vérifié',
      ],
      outcome: 'AMU pour soins urgents',
    },
    {
      id: 'rejected-asylum-seeker',
      description: 'Demandeur d\'asile débouté - AMU complète',
      conditions: [
        'Procédure d\'asile terminée négativement',
        'État d\'indigence',
      ],
      outcome: 'AMU complète',
    },
    {
      id: 'eu-citizen-temporary',
      description: 'Européen moins de 3 mois - AMU temporaire',
      conditions: [
        'Citoyen UE ou étudiant européen',
        'Moins de 3 mois en Belgique',
        'État d\'indigence prouvé',
        'Besoin médical urgent',
      ],
      outcome: 'AMU temporaire uniquement',
    },
    {
      id: 'partial-card-worker',
      description: 'Travailleur précaire - carte partielle',
      conditions: [
        'Résidence légale',
        'Revenus insuffisants mais présents',
        'Mutuelle existante',
      ],
      outcome: 'Aide partielle complémentaire à la mutuelle',
    },
    {
      id: 'family-card',
      description: 'Parent isolé RIS avec enfants - carte familiale',
      conditions: [
        'Parent isolé',
        'Bénéficiaire RIS',