/**
 * Business Rules for Garantie Locative
 *
 * Implements the Gherkin specifications from features/benefits/garantie-locative.feature
 * Using json-rules-engine for runtime evaluation.
 *
 * BASE JURIDIQUE:
 * - Code civil belge - Articles relatifs au bail de résidence principale
 * - Loi du 20 février 1991 modifiant les dispositions du Code civil relatives aux baux à loyer
 * - Ordonnance bruxelloise du 27 juillet 2017 relative aux baux d'habitation
 * - Décret wallon du 15 mars 2018 relatif au bail d'habitation
 * - Décret flamand du 9 novembre 2018 contenant des dispositions relatives à la location de biens destinés à l'habitation
 * - Loi organique des CPAS du 8 juillet 1976
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';

/**
 * GarantieLocative Rules Version Metadata
 * This version MUST match the specification version in features/benefits/garantie-locative.feature
 */
export const GARANTIE_LOCATIVE_RULES_METADATA = {
  implementsSpecification: '0.0.0',
  implementationVersion: '0.0.0',
  implementationStatus: 'complete' as const,
  lastSyncedWith: 'features/benefits/garantie-locative.feature',
  generatedFrom: 'features/benefits/garantie-locative.feature@0.0.0',
  divergences: [] as string[],
  effectiveDate: '2024-01-01',
};

// Constants from Belgian social law
export const GARANTIE_LOCATIVE_CONSTANTS = {
  // Maximum guarantee amounts by region
  MAX_MONTHS_BRUSSELS: 2,
  MAX_MONTHS_WALLONIA_BLOCKED_ACCOUNT: 2,
  MAX_MONTHS_WALLONIA_BANK_GUARANTEE: 3,
  MAX_MONTHS_WALLONIA_CPAS: 3,
  MAX_MONTHS_FLANDERS: 3,
  
  // RIS amounts 2024
  RIS_ISOLEE: 1070.49,
  
  // Repayment thresholds
  MAX_MONTHLY_DEDUCTION_FROM_RIS: 100,
  DEFAULT_MONTHLY_REPAYMENT_MIN: 50,
  DEFAULT_MONTHLY_REPAYMENT_MAX: 150,
  MAX_REPAYMENT_MONTHS: 36,
  
  // Income thresholds for eligibility
  HIGH_INCOME_THRESHOLD: 2500,
  HIGH_SAVINGS_THRESHOLD: 5000,
  
  // Housing Fund loan rates
  HOUSING_FUND_MIN_RATE: 0,
  HOUSING_FUND_MAX_RATE: 2,
  HOUSING_FUND_MIN_MONTHS: 24,
  HOUSING_FUND_MAX_MONTHS: 36,
};

export type Region = 'bruxelles' | 'wallonie' | 'flandres';
export type ConstitutionType = 'compte_bloque' | 'garantie_bancaire' | 'via_cpas' | 'tous_types';
export type AideType = 'avance_directe' | 'garantie_bancaire' | 'pret_sans_interet' | 'don' | 'don_accompagnement' | 'pret_adapte' | 'aucune';
export type Situation = 'beneficiaire_ris' | 'travailleur_pauvre' | 'famille_nombreuse' | 'jeune_18_ans' | 'mediation_dettes' | 'revenus_eleves' | 'sans_abri_reloge' | 'jeune_sortant_institution';

export interface GarantieLocativeRequest {
  revenus: number;
  loyer: number;
  garantieDemandee: number;
  epargne: number;
  region: Region;
  situation: Situation;
  tailleMemage: number;
  age?: number;
  estBeneficiaireRIS: boolean;
  estEnMediationDettes: boolean;
  estSortantInstitution: boolean;
  estSansAbri: boolean;
  aFamille: boolean;
  estLogementSocial: boolean;
  constitutionType?: ConstitutionType;
}

export interface GarantieLocativeResult extends EligibilityCheck {
  typeAide: AideType;
  montantAccorde: number;
  mensualiteRemboursement?: number;
  dureeRemboursementMois?: number;
  accompagnementSocial: boolean;
  suiviBudgetaire: boolean;
  motifRefus?: string;
}

/**
 * Create the GarantieLocative eligibility rules engine
 */
function createGarantieLocativeEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Reject if income and savings are sufficient
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'revenus',
          operator: 'greaterThanInclusive',
          value: GARANTIE_LOCATIVE_CONSTANTS.HIGH_INCOME_THRESHOLD,
        },
        {
          fact: 'epargne',
          operator: 'greaterThanInclusive',
          value: GARANTIE_LOCATIVE_CONSTANTS.HIGH_SAVINGS_THRESHOLD,
        },
      ],
    },
    event: {
      type: 'garantieLocative-ineligible',
      params: {
        reason: 'ressources suffisantes disponibles',
        typeAide: 'aucune',
        montantAccorde: 0,
        orientation: 'solution bancaire classique',
      },
    },
    priority: 100, // Highest priority - check this first
  });

  // Rule 2: RIS beneficiary with no savings - direct advance
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'estBeneficiaireRIS',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'epargne',
          operator: 'equal',
          value: 0,
        },
      ],
    },
    event: {
      type: 'garantieLocative-eligible',
      params: {
        typeAide: 'avance_directe',
        message: 'Éligible - Avance directe sur compte bloqué',
        accompagnementSocial: true,
        suiviBudgetaire: true,
      },
    },
    priority: 90,
  });

  // Rule 3: Young person (18-19) leaving institution - exceptional donation
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'estSortantInstitution',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'age',
          operator: 'lessThanInclusive',
          value: 21,
        },
        {
          fact: 'epargne',
          operator: 'equal',
          value: 0,
        },
        {
          fact: 'aFamille',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'garantieLocative-eligible',
      params: {
        typeAide: 'don',
        message: 'Situation prioritaire - Don exceptionnel possible',
        accompagnementSocial: true,
        suiviBudgetaire: true,
        prioritaire: true,
      },
    },
    priority: 95,
  });

  // Rule 4: Young person (18) with no income - exceptional donation
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'lessThanInclusive',
          value: 18,
        },
        {
          fact: 'revenus',
          operator: 'equal',
          value: 0,
        },
        {
          fact: 'epargne',
          operator: 'equal',
          value: 0,
        },
      ],
    },
    event: {
      type: 'garantieLocative-eligible',
      params: {
        typeAide: 'don',
        message: 'Jeune sans ressources - Don exceptionnel',
        accompagnementSocial: true,
        suiviBudgetaire: true,
      },
    },
    priority: 94,
  });

  // Rule 5: Homeless person being rehoused - donation with support
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'estSansAbri',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'revenus',
          operator: 'equal',
          value: 0,
        },
        {
          fact: 'epargne',
          operator: 'equal',
          value: 0,
        },
      ],
    },
    event: {
      type: 'garantieLocative-eligible',
      params: {
        typeAide: 'don_accompagnement',
        message: 'Sans-abri relogé - Don avec accompagnement',
        accompagnementSocial: true,
        suiviBudgetaire: true,
      },
    },
    priority: 93,
  });

  // Rule 6: Person in debt mediation - adapted loan
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'estEnMediationDettes',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'garantieLocative-eligible',
      params: {
        typeAide: 'pret_adapte',
        message: 'Médiation de dettes - Prêt adapté au plan de médiation',
        accompagnementSocial: true,
        suiviBudgetaire: true,
        integrationPlanMediation: true,
      },
    },
    priority: 85,
  });

  // Rule 7: Family in Wallonia requesting bank guarantee
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'wallonie',
        },
        {
          fact: 'tailleMemage',
          operator: 'greaterThanInclusive',
          value: 3,
        },
        {
          fact: 'constitutionType',
          operator: 'equal',
          value: 'garantie_bancaire',
        },
      ],
    },
    event: {
      type: 'garantieLocative-eligible',
      params: {
        typeAide: 'garantie_bancaire',
        message: 'Famille - Garantie bancaire via CPAS',
        accompagnementSocial: false,
        suiviBudgetaire: false,
        sansInteret: true,
      },
    },
    priority: 80,
  });

  // Rule 8: Working poor - interest-free loan
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'revenus',
          operator: 'greaterThan',
          value: 0,
        },
        {
          fact: 'revenus',
          operator: 'lessThan',
          value: 1800,
        },
        {
          fact: 'epargne',
          operator: 'lessThan',
          value: 500,
        },
        {
          fact: 'estBeneficiaireRIS',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'garantieLocative-eligible',
      params: {
        typeAide: 'pret_sans_interet',
        message: 'Travailleur avec revenus modestes - Prêt sans intérêt',
        accompagnementSocial: false,
        suiviBudgetaire: false,
      },
    },
    priority: 70,
  });

  // Rule 9: Social housing - simplified procedure
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'estLogementSocial',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'estBeneficiaireRIS',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'garantieLocative-eligible',
      params: {
        typeAide: 'avance_directe',
        message: 'Logement social - Procédure simplifiée avec déduction RIS',
        accompagnementSocial: true,
        suiviBudgetaire: true,
        procedureSimplifiee: true,
        deductionRIS: true,
      },
    },
    priority: 88,
  });

  // Rule 10: General eligibility - moderate income with insufficient savings
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'revenus',
          operator: 'lessThan',
          value: GARANTIE_LOCATIVE_CONSTANTS.HIGH_INCOME_THRESHOLD,
        },
        {
          fact: 'epargne',
          operator: 'lessThan',
          value: GARANTIE_LOCATIVE_CONSTANTS.HIGH_SAVINGS_THRESHOLD,
        },
      ],
    },
    event: {
      type: 'garantieLocative-eligible',
      params: {
        typeAide: 'pret_sans_interet',
        message: 'Éligible - Prêt sans intérêt CPAS',
        accompagnementSocial: false,
        suiviBudgetaire: false,
      },
    },
    priority: 50, // Lower priority - fallback rule
  });

  return engine;
}

/**
 * Singleton instance of the GarantieLocative rules engine
 */
const garantieLocativeEngineInstance = createGarantieLocativeEngine();

/**
 * Calculate maximum guarantee amount based on region and constitution type
 */
export function calculateMaxGarantieByRegion(
  loyer: number,
  region: Region,
  constitutionType: ConstitutionType = 'tous_types'
): number {
  switch (region) {
    case 'bruxelles':
      return loyer * GARANTIE_LOCATIVE_CONSTANTS.MAX_MONTHS_BRUSSELS;
    case 'wallonie':
      if (constitutionType === 'compte_bloque') {
        return loyer * GARANTIE_LOCATIVE_CONSTANTS.MAX_MONTHS_WALLONIA_BLOCKED_ACCOUNT;
      }
      return loyer * GARANTIE_LOCATIVE_CONSTANTS.MAX_MONTHS_WALLONIA_BANK_GUARANTEE;
    case 'flandres':
      return loyer * GARANTIE_LOCATIVE_CONSTANTS.MAX_MONTHS_FLANDERS;
    default:
      return loyer * 2; // Default to 2 months
  }
}

/**
 * Calculate Garantie Locative amount based on request parameters
 */
export function calculateGarantieLocativeAmount(
  request: GarantieLocativeRequest
): number {
  const { revenus, loyer, garantieDemandee, epargne, region, situation, constitutionType } = request;
  
  // Maximum allowed by region
  const maxByRegion = calculateMaxGarantieByRegion(loyer, region, constitutionType);
  
  // Cannot exceed the amount requested
  let montantAccorde = Math.min(garantieDemandee, maxByRegion);
  
  // Deduct available savings for partial coverage
  if (epargne > 0 && epargne < garantieDemandee) {
    montantAccorde = Math.min(montantAccorde, garantieDemandee - epargne);
  }
  
  // Special cases based on situation
  switch (situation) {
    case 'beneficiaire_ris':
    case 'jeune_18_ans':
    case 'sans_abri_reloge':
    case 'jeune_sortant_institution':
      // Full guarantee coverage
      montantAccorde = Math.min(garantieDemandee, maxByRegion);
      break;
    case 'travailleur_pauvre':
      // Partial coverage based on savings gap
      montantAccorde = Math.min(garantieDemandee - epargne, maxByRegion);
      break;
    case 'famille_nombreuse':
      // May need higher amount, but capped by savings
      montantAccorde = Math.min(garantieDemandee - epargne, maxByRegion);
      break;
    case 'mediation_dettes':
      // Full coverage needed
      montantAccorde = Math.min(garantieDemandee, maxByRegion);
      break;
    case 'revenus_eleves':
      // No assistance
      montantAccorde = 0;
      break;
  }
  
  return Math.max(0, montantAccorde);
}

/**
 * Calculate monthly repayment amount based on income
 */
export function calculateMonthlyRepayment(
  revenus: number,
  estBeneficiaireRIS: boolean,
  estEnMediationDettes: boolean
): number {
  if (estBeneficiaireRIS) {
    return GARANTIE_LOCATIVE_CONSTANTS.MAX_MONTHLY_DEDUCTION_FROM_RIS;
  }
  
  if (estEnMediationDettes) {
    return GARANTIE_LOCATIVE_CONSTANTS.DEFAULT_MONTHLY_REPAYMENT_MIN;
  }
  
  // Calculate based on income (approximately 5-10% of income)
  const repaymentRate = revenus < 1500 ? 0.05 : 0.08;
  const calculatedRepayment = Math.round(revenus * repaymentRate);
  
  return Math.max(
    GARANTIE_LOCATIVE_CONSTANTS.DEFAULT_MONTHLY_REPAYMENT_MIN,
    Math.min(calculatedRepayment, GARANTIE_LOCATIVE_CONSTANTS.DEFAULT_MONTHLY_REPAYMENT_MAX)
  );
}

/**
 * Determine the type of aid based on situation
 */
export function determineAideType(request: GarantieLocativeRequest): AideType {
  const { situation, revenus, epargne, estEnMediationDettes, estSortantInstitution, estSansAbri, region, constitutionType } = request;
  
  // High income with savings - no aid
  if (revenus >= GARANTIE_LOCATIVE_CONSTANTS.HIGH_INCOME_THRESHOLD && 
      epargne >= GARANTIE_LOCATIVE_CONSTANTS.HIGH_SAVINGS_THRESHOLD) {
    return 'aucune';
  }
  
  // Special situations that warrant donations
  if (situation === 'jeune_18_ans' && revenus === 0 && epargne === 0) {
    return 'don';
  }
  
  if (estSortantInstitution && epargne === 0) {
    return 'don';
  }
  
  if (estSansAbri && revenus === 0) {
    return 'don_accompagnement';
  }
  
  // Debt mediation
  if (estEnMediationDettes) {
    return 'pret_adapte';
  }
  
  // RIS beneficiaries
  if (situation === 'beneficiaire_ris') {
    return 'avance_directe';
  }
  
  // Bank guarantee in Wallonia for families
  if (region === 'wallonie' && constitutionType === 'garantie_bancaire') {
    return 'garantie_bancaire';
  }
  
  // Default to interest-free loan
  return 'pret_sans_interet';
}

/**
 * Check Garantie Locative eligibility
 */
export async function checkGarantieLocativeEligibility(
  request: GarantieLocativeRequest
): Promise<GarantieLocativeResult> {
  const facts = {
    revenus: request.revenus,
    loyer: request.loyer,
    garantieDemandee: request.garantieDemandee,
    epargne: request.epargne,
    region: request.region,
    situation: request.situation,
    tailleMemage: request.tailleMemage,
    age: request.age || 30,
    estBeneficiaireRIS: request.estBeneficiaireRIS,
    estEnMediationDettes: request.estEnMediationDettes,
    estSortantInstitution: request.estSortantInstitution,
    estSansAbri: request.estSansAbri,
    aFamille: request.aFamille,
    estLogementSocial: request.estLogementSocial,
    constitutionType: request.constitutionType || 'tous_types',
  };

  try {
    const results = await garantieLocativeEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'garantieLocative-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'garantieLocative-eligible');

    if (ineligibleEvent) {
      return {
        benefitType: 'garantie-locative' as any,
        isEligible: false,
        reason: ineligibleEvent.params?.reason,
        typeAide: 'aucune',
        montantAccorde: 0,
        accompagnementSocial: false,
        suiviBudgetaire: false,
        motifRefus: ineligibleEvent.params?.reason,
      };
    }

    if (eligibleEvent) {
      const typeAide = eligibleEvent.params?.typeAide as AideType || determineAideType(request);
      const montantAccorde = calculateGarantieLocativeAmount(request);
      const mensualite = calculateMonthlyRepayment(
        request.revenus,
        request.estBeneficiaireRIS,
        request.estEnMediationDettes
      );
      
      // Calculate repayment duration
      const dureeRemboursement = typeAide !== 'don' && typeAide !== 'don_accompagnement' && montantAccorde > 0
        ? Math.min(Math.ceil(montantAccorde / mensualite), GARANTIE_LOCATIVE_CONSTANTS.MAX_REPAYMENT_MONTHS)
        : undefined;

      return {
        benefitType: 'garantie-locative' as any,
        isEligible: true,
        calculatedAmount: montantAccorde,
        typeAide,
        montantAccorde,
        mensualiteRemboursement: typeAide !== 'don' && typeAide !== 'don_accompagnement' ? mensualite : undefined,
        dureeRemboursementMois: dureeRemboursement,
        accompagnementSocial: eligibleEvent.params?.accompagnementSocial || false,
        suiviBudgetaire: eligibleEvent.params?.suiviBudgetaire || false,
      };
    }

    return {
      benefitType: 'garantie-locative' as any,
      isEligible: false,
      reason: 'conditions non remplies',
      typeAide: 'aucune',
      montantAccorde: 0,
      accompagnementSocial: false,
      suiviBudgetaire: false,
    };
  } catch (error) {
    throw new Error(`Error checking Garantie Locative eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const GARANTIE_LOCATIVE_RULES_JSON = {
  legalFramework: {
    primaryLaw: 'Loi organique des CPAS du 8 juillet 1976',
    civilCode: 'Code civil belge - Articles relatifs au bail de résidence principale',
    brusselsOrdonnance: 'Ordonnance bruxelloise du 27 juillet 2017',
    walloniaDecret: 'Décret wallon du 15 mars 2018',
    flandersDecret: 'Décret flamand du 9 novembre 2018',
  },
  constants: {
    maxMonthsBrussels: GARANTIE_LOCATIVE_CONSTANTS.MAX_MONTHS_BRUSSELS,
    maxMonthsWalloniaBlocked: GARANTIE_LOCATIVE_CONSTANTS.MAX_MONTHS_WALLONIA_BLOCKED_ACCOUNT,
    maxMonthsWalloniaBank: GARANTIE_LOCATIVE_CONSTANTS.MAX_MONTHS_WALLONIA_BANK_GUARANTEE,
    maxMonthsFlanders: GARANTIE_LOCATIVE_CONSTANTS.MAX_MONTHS_FLANDERS,
    highIncomeThreshold: GARANTIE_LOCATIVE_CONSTANTS.HIGH_INCOME_THRESHOLD,
    highSavingsThreshold: GARANTIE_LOCATIVE_CONSTANTS.HIGH_SAVINGS_THRESHOLD,
    maxRepaymentMonths: GARANTIE_LOCATIVE_CONSTANTS.MAX_REPAYMENT_MONTHS,
  },
  interventionTypes: [
    {
      type: 'avance_directe',
      description: 'CPAS place l\'argent sur compte bloqué',
      maxMonths: 2,
    },
    {
      type: 'garantie_bancaire',
      description: 'Banque s\'engage via CPAS',
      maxMonths: 3,
    },
    {
      type: 'pret_sans_interet',
      description: 'CPAS prête avec plan de remboursement',
      maxMonths: 3,
    },
    {
      type: 'don',
      description: 'CPAS offre la garantie (cas exceptionnels)',
      maxMonths: 'variable',
    },
  ],
  rules: [
    {
      name: 'Ressources suffisantes',
      condition: 'revenus >= 2500€ ET épargne >= 5000€',
      result: 'Inéligible - orientation vers solution bancaire classique',
      priority: 100,
    },
    {
      name: 'Bénéficiaire RIS sans épargne',
      condition: 'RIS ET épargne = 0',
      result: 'Avance directe sur compte bloqué',
      priority: 90,
    },
    {
      name: 'Jeune sortant institution',
      condition: 'sortant institution ET age <= 21 ET épargne = 0 ET sans famille',
      result: 'Don exceptionnel avec accompagnement',
      priority: 95,
    },
    {
      name: 'Sans-abri relogé',
      condition: 'sans-abri ET revenus = 0',
      result: 'Don avec accompagnement social',
      priority: 93,
    },
    {
      name: 'Médiation de dettes',
      condition: 'en médiation de dettes',
      result: 'Prêt adapté intégré au plan de médiation',
      priority: 85,
    },
    {
      name: 'Famille Wallonie garantie bancaire',
      condition: 'région = Wallonie ET taille ménage >= 3 ET type = garantie bancaire',
      result: 'Garantie bancaire via CPAS',
      priority: 80,
    },
    {
      name: 'Travailleur pauvre',
      condition: 'revenus > 0 ET revenus < 1800 ET épargne < 500',
      result: 'Prêt sans intérêt',
      priority: 70,
    },
    {
      name: 'Logement social avec RIS',
      condition: 'logement social ET bénéficiaire RIS',
      result: 'Procédure simplifiée avec déduction RIS (max 100€/mois)',
      priority: 88,
    },
    {
      name: 'Éligibilité générale',
      condition: 'revenus < 2500€ ET épargne < 5000€',
      result: 'Prêt sans intérêt CPAS',
      priority: 50,
    },
  ],
  procedure: {
    steps: [
      { etape: 'Dépôt de la demande', delai: 'Immédiat', documents: 'Formulaire + carte identité' },
      { etape: 'Accusé de réception', delai: 'Immédiat', documents: 'Preuve de dépôt avec date' },
      { etape: 'Enquête sociale', delai: '8-15 jours', documents: 'Visite à domicile possible' },
      { etape: 'Documents à fournir', delai: 'Variable', documents: 'Contrat bail, preuves revenus' },
      { etape: 'Décision du conseil', delai: 'Max 30 jours', documents: 'Notification écrite' },
      { etape: 'Versement si accepté', delai: '8 jours', documents: 'Sur compte bloqué ou au propriétaire' },
    ],
    enqueteSociale: [
      { critere: 'Situation financière', verification: 'Revenus, charges, dettes' },
      { critere: 'Composition du ménage', verification: 'Registre national' },
      { critere: 'Nécessité du déménagement', verification: 'Raisons (insalubrité, expulsion)' },
      { critere: 'Capacité de remboursement', verification: 'Budget disponible mensuel' },
      { critere: 'Autres aides possibles', verification: 'Famille, employeur, associations' },
    ],
  },
  remboursement: {
    mensualiteAdaptee: '50-150€ selon revenus',
    dureeMaximale: '36 mois',
    revisionPossible: 'Si changement situation',
    suspensionPossible: 'En cas de difficultés temporaires',
    remboursementAnticipe: 'Toujours possible sans pénalité',
  },
  nonRemboursement: {
    rappels: '3 rappels avant poursuites',
    mediation: 'Tentative de nouvel accord',
    recuperation: 'Sur prestations sociales futures',
    poursuites: 'En dernier recours uniquement',
  },
};