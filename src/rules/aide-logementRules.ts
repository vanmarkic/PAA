/**
 * Business Rules for Aide au Logement
 *
 * Implements the Gherkin specifications from features/benefits/aide-logement.feature
 * Using json-rules-engine for runtime evaluation.
 *
 * BASE JURIDIQUE:
 * - Région de Bruxelles-Capitale: Ordonnance du 21 décembre 2018 relative à l'allocation loyer
 * - Wallonie: Code wallon de l'Habitation durable - Décret du 1er juin 2017 (ADeL)
 * - Wallonie: Arrêté du Gouvernement wallon du 21 septembre 2017 (AAL)
 * - Flandres: Besluit Vlaamse Codex Wonen 2021
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';

/**
 * AideLogement Rules Version Metadata
 * This version MUST match the specification version in features/benefits/aide-logement.feature
 */
export const AIDE_LOGEMENT_RULES_METADATA = {
  implementsSpecification: '0.0.0',
  implementationVersion: '0.0.0',
  implementationStatus: 'complete' as const,
  lastSyncedWith: 'features/benefits/aide-logement.feature',
  generatedFrom: 'features/benefits/aide-logement.feature@0.0.0',
  divergences: [] as string[],
  effectiveDate: '2024-01-01',
};

// Constants from Belgian social law - Housing Aid 2024
export const AIDE_LOGEMENT_CONSTANTS = {
  // Brussels-Capital Region
  BRUXELLES: {
    ALLOCATION_LOYER_PRIORITE_SOCIALE: 186.67,
    ALLOCATION_LOYER_REVENUS_MOYENS: 140.00,
    PLAFOND_REVENUS_ANNUELS: 27550.86,
    PLAFOND_REVENUS_PRIORITE_SOCIALE: 20895.43,
    PLAFOND_REVENUS_RELOGEMENT_BASE: 24370.47,
    PLAFOND_REVENUS_RELOGEMENT_PAR_COHABITANT: 7071.79,
    ALLOCATION_RELOGEMENT_DUREE_MAX_ANNEES: 5,
    AIDE_DEMENAGEMENT_BASE: 1180.00,
    POINTS_PRIORITE_MIN: 6,
    DELAI_TRAITEMENT_JOURS: 45,
  },
  // Wallonia Region
  WALLONIE: {
    ADEL_ALLOCATION_LOYER_BASE: 100.00,
    ADEL_ALLOCATION_PAR_ENFANT: 20.00,
    ADEL_ALLOCATION_DEMENAGEMENT_BASE: 400.00,
    ADEL_ALLOCATION_DEMENAGEMENT_PAR_ENFANT: 80.00,
    ADEL_DUREE_MAX_ANNEES: 2,
    PLAFOND_REVENUS_ISOLE: 17000.00,
    PLAFOND_REVENUS_COUPLE: 23200.00,
    AAL_MONTANT_MIN: 125.00,
    AAL_MONTANT_MAX: 185.00,
    AAL_ATTENTE_MIN_MOIS: 18,
    DELAI_TRAITEMENT_JOURS: 30,
  },
  // Flanders Region
  FLANDRES: {
    ATTENTE_MIN_ANNEES: 4,
    DELAI_TRAITEMENT_JOURS: 60,
  },
};

export type Region = 'bruxelles-capitale' | 'wallonie' | 'flandres';
export type SituationFamiliale = 'personne-isolee' | 'parent-isole' | 'couple' | 'couple-avec-enfants';
export type StatutLogement = 'locataire' | 'proprietaire' | 'sans-abri';
export type TypeAide = 'allocation-loyer' | 'adel' | 'aal' | 'allocation-relogement';

export interface AideLogementUser {
  age: number;
  region: Region;
  situationFamiliale: SituationFamiliale;
  nombreEnfants: number;
  revenuAnnuel: number;
  loyerMensuel: number;
  statutLogement: StatutLogement;
  pointsPrioriteListeSociale?: number;
  moisAttenteListeSociale?: number;
  conditionSpecifique?: string;
  estExpulse?: boolean;
  sortDeLaRue?: boolean;
  quitteLogementInsalubre?: boolean;
  quitteLogementSurpeuple?: boolean;
  beneficieRIS?: boolean;
  montantRIS?: number;
}

export interface AideLogementResult {
  isEligible: boolean;
  typeAide?: TypeAide;
  montantMensuel?: number;
  montantDemenagement?: number;
  dureeMaxAnnees?: number;
  reason: string;
  calculDetails?: string;
  documentsRequis?: string[];
  delaiTraitementJours?: number;
}

/**
 * Create the AideLogement eligibility rules engine
 */
function createAideLogementEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Owner ineligibility (highest priority - absolute exclusion)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'statutLogement',
          operator: 'equal',
          value: 'proprietaire',
        },
      ],
    },
    event: {
      type: 'aideLogement-ineligible',
      params: {
        reason: 'propriétaire du logement - aide réservée aux locataires',
        priority: 100,
      },
    },
    priority: 100,
  });

  // Rule 2: Brussels - Income too high
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'bruxelles-capitale',
        },
        {
          fact: 'revenuAnnuel',
          operator: 'greaterThan',
          value: AIDE_LOGEMENT_CONSTANTS.BRUXELLES.PLAFOND_REVENUS_ANNUELS,
        },
      ],
    },
    event: {
      type: 'aideLogement-ineligible',
      params: {
        reason: 'revenus annuels > 27,550.86€',
        priority: 90,
      },
    },
    priority: 90,
  });

  // Rule 3: Brussels - Allocation relogement for evicted persons
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'bruxelles-capitale',
        },
        {
          fact: 'estExpulse',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'revenuAnnuel',
          operator: 'lessThanInclusive',
          value: AIDE_LOGEMENT_CONSTANTS.BRUXELLES.PLAFOND_REVENUS_RELOGEMENT_BASE,
        },
        {
          fact: 'statutLogement',
          operator: 'equal',
          value: 'locataire',
        },
      ],
    },
    event: {
      type: 'aideLogement-eligible',
      params: {
        typeAide: 'allocation-relogement',
        reason: 'expulsion avec revenus éligibles - allocation de relogement',
        dureeMaxAnnees: AIDE_LOGEMENT_CONSTANTS.BRUXELLES.ALLOCATION_RELOGEMENT_DUREE_MAX_ANNEES,
        priority: 85,
      },
    },
    priority: 85,
  });

  // Rule 4: Brussels - Single parent with social priority (high priority aid)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'bruxelles-capitale',
        },
        {
          fact: 'situationFamiliale',
          operator: 'equal',
          value: 'parent-isole',
        },
        {
          fact: 'revenuAnnuel',
          operator: 'lessThanInclusive',
          value: AIDE_LOGEMENT_CONSTANTS.BRUXELLES.PLAFOND_REVENUS_PRIORITE_SOCIALE,
        },
        {
          fact: 'pointsPrioriteListeSociale',
          operator: 'greaterThanInclusive',
          value: AIDE_LOGEMENT_CONSTANTS.BRUXELLES.POINTS_PRIORITE_MIN,
        },
        {
          fact: 'statutLogement',
          operator: 'equal',
          value: 'locataire',
        },
      ],
    },
    event: {
      type: 'aideLogement-eligible',
      params: {
        typeAide: 'allocation-loyer',
        montantMensuel: AIDE_LOGEMENT_CONSTANTS.BRUXELLES.ALLOCATION_LOYER_PRIORITE_SOCIALE,
        reason: 'famille monoparentale avec revenus <= 20,895.43€',
        priority: 80,
      },
    },
    priority: 80,
  });

  // Rule 5: Brussels - Couple/isolated with medium income (standard aid)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'bruxelles-capitale',
        },
        {
          fact: 'revenuAnnuel',
          operator: 'greaterThan',
          value: AIDE_LOGEMENT_CONSTANTS.BRUXELLES.PLAFOND_REVENUS_PRIORITE_SOCIALE,
        },
        {
          fact: 'revenuAnnuel',
          operator: 'lessThanInclusive',
          value: AIDE_LOGEMENT_CONSTANTS.BRUXELLES.PLAFOND_REVENUS_ANNUELS,
        },
        {
          fact: 'pointsPrioriteListeSociale',
          operator: 'greaterThanInclusive',
          value: AIDE_LOGEMENT_CONSTANTS.BRUXELLES.POINTS_PRIORITE_MIN,
        },
        {
          fact: 'statutLogement',
          operator: 'equal',
          value: 'locataire',
        },
      ],
    },
    event: {
      type: 'aideLogement-eligible',
      params: {
        typeAide: 'allocation-loyer',
        montantMensuel: AIDE_LOGEMENT_CONSTANTS.BRUXELLES.ALLOCATION_LOYER_REVENUS_MOYENS,
        reason: 'revenus entre 20,895.43€ et 27,550.86€',
        priority: 70,
      },
    },
    priority: 70,
  });

  // Rule 6: Brussels - Low income with social priority (priorité sociale)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'bruxelles-capitale',
        },
        {
          fact: 'revenuAnnuel',
          operator: 'lessThanInclusive',
          value: AIDE_LOGEMENT_CONSTANTS.BRUXELLES.PLAFOND_REVENUS_PRIORITE_SOCIALE,
        },
        {
          fact: 'pointsPrioriteListeSociale',
          operator: 'greaterThanInclusive',
          value: AIDE_LOGEMENT_CONSTANTS.BRUXELLES.POINTS_PRIORITE_MIN,
        },
        {
          fact: 'statutLogement',
          operator: 'equal',
          value: 'locataire',
        },
      ],
    },
    event: {
      type: 'aideLogement-eligible',
      params: {
        typeAide: 'allocation-loyer',
        montantMensuel: AIDE_LOGEMENT_CONSTANTS.BRUXELLES.ALLOCATION_LOYER_PRIORITE_SOCIALE,
        reason: 'priorité sociale avec revenus <= 20,895.43€',
        priority: 75,
      },
    },
    priority: 75,
  });

  // Rule 7: Wallonia - Income too high for isolated person
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'wallonie',
        },
        {
          fact: 'situationFamiliale',
          operator: 'equal',
          value: 'personne-isolee',
        },
        {
          fact: 'revenuAnnuel',
          operator: 'greaterThan',
          value: AIDE_LOGEMENT_CONSTANTS.WALLONIE.PLAFOND_REVENUS_ISOLE,
        },
      ],
    },
    event: {
      type: 'aideLogement-ineligible',
      params: {
        reason: 'revenus dépassent plafond isolé (17,000€)',
        priority: 88,
      },
    },
    priority: 88,
  });

  // Rule 8: Wallonia - Income too high for couple
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'wallonie',
        },
        {
          any: [
            {
              fact: 'situationFamiliale',
              operator: 'equal',
              value: 'couple',
            },
            {
              fact: 'situationFamiliale',
              operator: 'equal',
              value: 'couple-avec-enfants',
            },
          ],
        },
        {
          fact: 'revenuAnnuel',
          operator: 'greaterThan',
          value: AIDE_LOGEMENT_CONSTANTS.WALLONIE.PLAFOND_REVENUS_COUPLE,
        },
      ],
    },
    event: {
      type: 'aideLogement-ineligible',
      params: {
        reason: 'revenus dépassent plafond couple (23,200€)',
        priority: 87,
      },
    },
    priority: 87,
  });

  // Rule 9: Wallonia - Homeless person accessing housing (ADeL)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'wallonie',
        },
        {
          fact: 'sortDeLaRue',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'statutLogement',
          operator: 'equal',
          value: 'locataire',
        },
      ],
    },
    event: {
      type: 'aideLogement-eligible',
      params: {
        typeAide: 'adel',
        montantMensuel: AIDE_LOGEMENT_CONSTANTS.WALLONIE.ADEL_ALLOCATION_LOYER_BASE,
        dureeMaxAnnees: AIDE_LOGEMENT_CONSTANTS.WALLONIE.ADEL_DUREE_MAX_ANNEES,
        reason: 'sortie de rue - ADeL forfaitaire sans preuve logement antérieur',
        priority: 82,
      },
    },
    priority: 82,
  });

  // Rule 10: Wallonia - Isolated person eligible for ADeL (unhealthy housing)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'wallonie',
        },
        {
          fact: 'situationFamiliale',
          operator: 'equal',
          value: 'personne-isolee',
        },
        {
          fact: 'revenuAnnuel',
          operator: 'lessThan',
          value: AIDE_LOGEMENT_CONSTANTS.WALLONIE.PLAFOND_REVENUS_ISOLE,
        },
        {
          fact: 'quitteLogementInsalubre',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'statutLogement',
          operator: 'equal',
          value: 'locataire',
        },
      ],
    },
    event: {
      type: 'aideLogement-eligible',
      params: {
        typeAide: 'adel',
        montantMensuel: AIDE_LOGEMENT_CONSTANTS.WALLONIE.ADEL_ALLOCATION_LOYER_BASE,
        montantDemenagement: AIDE_LOGEMENT_CONSTANTS.WALLONIE.ADEL_ALLOCATION_DEMENAGEMENT_BASE,
        dureeMaxAnnees: AIDE_LOGEMENT_CONSTANTS.WALLONIE.ADEL_DUREE_MAX_ANNEES,
        reason: 'revenus < 17,000€ et déménagement logement salubre',
        priority: 65,
      },
    },
    priority: 65,
  });

  // Rule 11: Wallonia - Family with children eligible for ADeL (overcrowded housing)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'wallonie',
        },
        {
          any: [
            {
              fact: 'situationFamiliale',
              operator: 'equal',
              value: 'couple-avec-enfants',
            },
            {
              fact: 'situationFamiliale',
              operator: 'equal',
              value: 'parent-isole',
            },
          ],
        },
        {
          fact: 'revenuAnnuel',
          operator: 'lessThanInclusive',
          value: AIDE_LOGEMENT_CONSTANTS.WALLONIE.PLAFOND_REVENUS_COUPLE,
        },
        {
          any: [
            {
              fact: 'quitteLogementSurpeuple',
              operator: 'equal',
              value: true,
            },
            {
              fact: 'quitteLogementInsalubre',
              operator: 'equal',
              value: true,
            },
          ],
        },
        {
          fact: 'statutLogement',
          operator: 'equal',
          value: 'locataire',
        },
        {
          fact: 'nombreEnfants',
          operator: 'greaterThan',
          value: 0,
        },
      ],
    },
    event: {
      type: 'aideLogement-eligible',
      params: {
        typeAide: 'adel',
        dureeMaxAnnees: AIDE_LOGEMENT_CONSTANTS.WALLONIE.ADEL_DUREE_MAX_ANNEES,
        reason: 'famille avec enfants quittant logement inadapté - ADeL avec majoration enfants',
        priority: 60,
      },
    },
    priority: 60,
  });

  // Rule 12: Wallonia - AAL (waiting list > 18 months)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'wallonie',
        },
        {
          fact: 'moisAttenteListeSociale',
          operator: 'greaterThan',
          value: AIDE_LOGEMENT_CONSTANTS.WALLONIE.AAL_ATTENTE_MIN_MOIS,
        },
        {
          fact: 'statutLogement',
          operator: 'equal',
          value: 'locataire',
        },
      ],
    },
    event: {
      type: 'aideLogement-eligible',
      params: {
        typeAide: 'aal',
        montantMin: AIDE_LOGEMENT_CONSTANTS.WALLONIE.AAL_MONTANT_MIN,
        montantMax: AIDE_LOGEMENT_CONSTANTS.WALLONIE.AAL_MONTANT_MAX,
        reason: 'inscrit liste attente > 18 mois',
        priority: 55,
      },
    },
    priority: 55,
  });

  // Rule 13: Flanders - Waiting list > 4 years
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'flandres',
        },
        {
          fact: 'moisAttenteListeSociale',
          operator: 'greaterThanInclusive',
          value: AIDE_LOGEMENT_CONSTANTS.FLANDRES.ATTENTE_MIN_ANNEES * 12,
        },
        {
          fact: 'statutLogement',
          operator: 'equal',
          value: 'locataire',
        },
      ],
    },
    event: {
      type: 'aideLogement-eligible',
      params: {
        typeAide: 'allocation-loyer',
        reason: 'liste attente sociale >= 4 ans en Flandres',
        montantVariable: true,
        priority: 50,
      },
    },
    priority: 50,
  });

  // Rule 14: Wallonia - Excessive rent warning (partial eligibility)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'region',
          operator: 'equal',
          value: 'wallonie',
        },
        {
          fact: 'loyerMensuel',
          operator: 'greaterThan',
          value: 1000,
        },
        {
          fact: 'statutLogement',
          operator: 'equal',
          value: 'locataire',
        },
      ],
    },
    event: {
      type: 'aideLogement-partial',
      params: {
        reason: 'loyer excessif par rapport aux plafonds régionaux',
        priority: 45,
      },
    },
    priority: 45,
  });

  return engine;
}

/**
 * Singleton instance of the AideLogement rules engine
 */
const aideLogementEngineInstance = createAideLogementEngine();

/**
 * Calculate Aide au Logement amount based on region and family situation
 */
export function calculateAideLogementAmount(
  user: AideLogementUser,
  typeAide: TypeAide
): { montantMensuel: number; montantDemenagement?: number; calculDetails: string } {
  let montantMensuel = 0;
  let montantDemenagement: number | undefined;
  let calculDetails = '';

  if (user.region === 'bruxelles-capitale') {
    if (typeAide === 'allocation-loyer') {
      if (user.revenuAnnuel <= AIDE_LOGEMENT_CONSTANTS.BRUXELLES.PLAFOND_REVENUS_PRIORITE_SOCIALE) {
        montantMensuel = AIDE_LOGEMENT_CONSTANTS.BRUXELLES.ALLOCATION_LOYER_PRIORITE_SOCIALE;
        calculDetails = 'Allocation loyer priorité sociale: 186.67€/mois';
      } else if (user.revenuAnnuel <= AIDE_LOGEMENT_CONSTANTS.BRUXELLES.PLAFOND_REVENUS_ANNUELS) {
        montantMensuel = AIDE_LOGEMENT_CONSTANTS.BRUXELLES.ALLOCATION_LOYER_REVENUS_MOYENS;
        calculDetails = 'Allocation loyer revenus moyens: 140€/mois';
      }
    } else if (typeAide === 'allocation-relogement') {
      montantDemenagement = AIDE_LOGEMENT_CONSTANTS.BRUXELLES.AIDE_DEMENAGEMENT_BASE;
      if (user.nombreEnfants > 0) {
        calculDetails = `Aide déménagement: ${montantDemenagement}€ avec majoration pour ${user.nombreEnfants} enfant(s) à charge`;
      } else {
        calculDetails = `Aide déménagement: ${montantDemenagement}€`;
      }
      montantMensuel = AIDE_LOGEMENT_CONSTANTS.BRUXELLES.ALLOCATION_LOYER_PRIORITE_SOCIALE;
    }
  } else if (user.region === 'wallonie') {
    if (typeAide === 'adel') {
      const baseLoyer = AIDE_LOGEMENT_CONSTANTS.WALLONIE.ADEL_ALLOCATION_LOYER_BASE;
      const parEnfant = AIDE_LOGEMENT_CONSTANTS.WALLONIE.ADEL_ALLOCATION_PAR_ENFANT;
      montantMensuel = baseLoyer + (parEnfant * user.nombreEnfants);
      
      const baseDemenagement = AIDE_LOGEMENT_CONSTANTS.WALLONIE.ADEL_ALLOCATION_DEMENAGEMENT_BASE;
      const demenagementParEnfant = AIDE_LOGEMENT_CONSTANTS.WALLONIE.ADEL_ALLOCATION_DEMENAGEMENT_PAR_ENFANT;
      montantDemenagement = baseDemenagement + (demenagementParEnfant * user.nombreEnfants);
      
      if (user.nombreEnfants > 0) {
        calculDetails = `100€ + (20€ × ${user.nombreEnfants} enfants) = ${montantMensuel}€/mois; Déménagement: ${montantDemenagement}€`;
      } else {
        calculDetails = `Allocation loyer: ${montantMensuel}€/mois; Allocation déménagement: ${montantDemenagement}€`;
      }
    } else if (typeAide === 'aal') {
      // AAL amount varies based on situation - use middle value for estimation
      montantMensuel = (AIDE_LOGEMENT_CONSTANTS.WALLONIE.AAL_MONTANT_MIN + 
                        AIDE_LOGEMENT_CONSTANTS.WALLONIE.AAL_MONTANT_MAX) / 2;
      calculDetails = `AAL: entre ${AIDE_LOGEMENT_CONSTANTS.WALLONIE.AAL_MONTANT_MIN}€ et ${AIDE_LOGEMENT_CONSTANTS.WALLONIE.AAL_MONTANT_MAX}€/mois`;
    }
  } else if (user.region === 'flandres') {
    calculDetails = 'Montant variable selon situation - contacter Wonen Vlaanderen';
  }

  return { montantMensuel, montantDemenagement, calculDetails };
}

/**
 * Get required documents based on region and aid type
 */
function getRequiredDocuments(region: Region, typeAide?: TypeAide): string[] {
  const baseDocuments = [
    'Contrat de bail',
    'Preuve de revenus',
    'Composition de ménage',
  ];

  if (region === 'bruxelles-capitale') {
    baseDocuments.push('Attestation liste attente sociale (si applicable)');
  } else if (region === 'wallonie' && typeAide === 'adel') {
    baseDocuments.push('Certificat salubrité');
  }

  return baseDocuments;
}

/**
 * Get processing delay based on region
 */
function getDelaiTraitement(region: Region): number {
  switch (region) {
    case 'bruxelles-capitale':
      return AIDE_LOGEMENT_CONSTANTS.BRUXELLES.DELAI_TRAITEMENT_JOURS;
    case 'wallonie':
      return AIDE_LOGEMENT_CONSTANTS.WALLONIE.DELAI_TRAITEMENT_JOURS;
    case 'flandres':
      return AIDE_LOGEMENT_CONSTANTS.FLANDRES.DELAI_TRAITEMENT_JOURS;
    default:
      return 60;
  }
}

/**
 * Check Aide au Logement eligibility
 */
export async function checkAideLogementEligibility(
  user: AideLogementUser
): Promise<AideLogementResult> {
  const facts = {
    age: user.age,
    region: user.region,
    situationFamiliale: user.situationFamiliale,
    nombreEnfants: user.nombreEnfants,
    revenuAnnuel: user.revenuAnnuel,
    loyerMensuel: user.loyerMensuel,
    statutLogement: user.statutLogement,
    pointsPrioriteListeSociale: user.pointsPrioriteListeSociale || 0,
    moisAttenteListeSociale: user.moisAttenteListeSociale || 0,
    conditionSpecifique: user.conditionSpecifique || '',
    estExpulse: user.estExpulse || false,
    sortDeLaRue: user.sortDeLaRue || false,
    quitteLogementInsalubre: user.quitteLogementInsalubre || false,
    quitteLogementSurpeuple: user.quitteLogementSurpeuple || false,
    beneficieRIS: user.beneficieRIS || false,
    montantRIS: user.montantRIS || 0,
  };

  try {
    const results = await aideLogementEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'aideLogement-ineligible');
    const partialEvent = results.events.find((e) => e.type === 'aideLogement-partial');
    const eligibleEvent = results.events.find((e) => e.type === 'aideLogement-eligible');

    if (ineligibleEvent) {
      return {
        isEligible: false,
        reason: ineligibleEvent.params?.reason as string,
        delaiTraitementJours: getDelaiTraitement(user.region),
      };
    }

    if (partialEvent) {
      const typeAide = (eligibleEvent?.params?.typeAide as TypeAide) || 'allocation-loyer';
      const calculation = calculateAideLogementAmount(user, typeAide);
      
      return {
        isEligible: true,
        typeAide,
        montantMensuel: calculation.montantMensuel,
        montantDemenagement: calculation.montantDemenagement,
        reason: partialEvent.params?.reason as string,
        calculDetails: calculation.calculDetails + ' (montant potentiellement plafonné)',
        documentsRequis: getRequiredDocuments(user.region, typeAide),
        delaiTraitementJours: getDelaiTraitement(user.region),
      };
    }

    if (eligibleEvent) {
      const typeAide = eligibleEvent.params?.typeAide as TypeAide;
      const calculation = calculateAideLogementAmount(user, typeAide);
      
      let montantMensuel = calculation.montantMensuel;
      if (eligibleEvent.params?.montantMensuel) {
        montantMensuel = eligibleEvent.params.montantMensuel as number;
      }

      return {
        isEligible: true,
        typeAide,
        montantMensuel,
        montantDemenagement: calculation.montantDemenagement || (eligibleEvent.params?.montantDemenagement as number),
        dureeMaxAnnees: eligibleEvent.params?.dureeMaxAnnees as number,
        reason: eligibleEvent.params?.reason as string,
        calculDetails: calculation.calculDetails,
      };
    }

    return {
      isEligible: false,
      reason: 'Conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Error checking Aide Logement eligibility: ${error}`);
  }
};