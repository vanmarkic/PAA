/**
 * Central export file for all Business Rules
 *
 * This file exports all rules engines and eligibility check functions
 * for Belgian social and fiscal rights.
 */

// ============================================================================
// EXISTING RULES (with legal sources)
// ============================================================================

export * from './risRules';
export * from './agrRules';

// ============================================================================
// SOCIAL BENEFITS RULES
// ============================================================================

// Export everything except BelgianRegion from allocationsFamilialesRules
export { checkFamilyAllowancesEligibility, calculateFamilyAllowanceAmount, calculateTotalFamilyAllowances, FAMILY_ALLOWANCES_RULES_JSON } from './allocationsFamilialesRules';
export * from './allocationsChomageRules';
// Export everything including BelgianRegion from primeNaissanceRules
export * from './primeNaissanceRules';
export * from './allocationHandicapesRules';
export * from './grapaRules';
export * from './aideLogementRules';
export * from './pensionRetraiteRules';
export * from './pensionSurvieRules';
export * from './allocationIntegrationRules';
export * from './aideSocialeRules';
export * from './assuranceMaladieRules';
export * from './congeParentalRules';
export * from './congeMaterniteRules';
export * from './allocationsEtudesRules';
export * from './bourseEtudesRules';
export * from './garantieLocativeRules';
export * from './aidePersonnesAgeesRules';
export * from './gardeEnfantsRules';
export * from './carteMedicaleRules';
export * from './aideJuridiqueRules';
export * from './fondsSecuriteExistenceRules';
export * from './allocationChauffageRules';
export * from './tarifSocialEnergieRules';
export * from './abonnementSocialTransportRules';
export * from './revenuCadastralExonerationRules';

// ============================================================================
// FISCAL RIGHTS RULES
// ============================================================================

export * from './deductionHabitationRules';
export * from './deductionInvestissementRules';
export * from './reductionEpargnePensionRules';
export * from './chequesRepasRules';
export * from './ecoChequeRules';
export * from './avantagesNatureRules';
export * from './tvaReduiteRules';
export * from './exonerationPrecompteRules';
export * from './bonusLogementRules';
export * from './deductionFraisGardeRules';
export * from './creditImpotServiceLocalRules';
export * from './quotientConjugalRules';
export * from './renteAlimentaireRules';
export * from './deductionDonsRules';
export * from './fraisProfessionnelsRules';
export * from './deductionVehiculeElectriqueRules';
export * from './primeRenovationRules';
export * from './deductionIsolationRules';
export * from './creditImpotInvestissementDurableRules';
export * from './exonerationPlusValueRules';
export * from './deductionEmpruntHypothecaireRules';
export * from './abattementSuccessionRules';
export * from './droitsDonationReduitsRules';
export * from './exonerationRevenusMobiliersRules';

// ============================================================================
// SOCIAL SERVICES RULES
// ============================================================================

export * from './logementSocialRules';
export * from './inscriptionEcoleRules';
export * from './repasScolairesGratuitsRules';
export * from './transportScolaireRules';
export * from './aideAlimentaireRules';
export * from './banqueAlimentaireRules';
export * from './restaurantsSociauxRules';
export * from './mediationDettesRules';
export * from './budgetEnergetiqueRules';
export * from './fondsCreancesRules';
export * from './protectionJuridiqueRules';
export * from './accompagnementSocialRules';
export * from './insertionProfessionnelleRules';
export * from './formationProfessionnelleRules';
export * from './servicePublicEmploiRules';
export * from './aideMobiliteRules';
export * from './soinsSanteMentaleRules';
export * from './aideSansAbriRules';
export * from './centreAccueilRules';
export * from './mediationFamilialeRules';
export * from './aideVictimesRules';
export * from './protectionEnfanceRules';
export * from './teleAssistanceRules';
export * from './aideMenagereRules';
export * from './repasDomicileRules';

// ============================================================================
// EMPLOYMENT RIGHTS RULES
// ============================================================================

export * from './contratTravailRules';
export * from './preavisRules';
export * from './licenciementRules';
export * from './demissionRules';
export * from './creditTempsRules';
export * from './congeMaladieRules';
export * from './accidentTravailRules';
export * from './maladieProfessionnelleRules';
export * from './harcelementTravailRules';
export * from './discriminationEmploiRules';
export * from './egaliteSalarialeRules';
export * from './travailEtudiantRules';
export * from './stageRules';
export * from './flexiJobRules';
export * from './travailInterimaireRules';
export * from './contratDureeDetermineeRules';
export * from './contratDureeIndetermineeRules';
export * from './tempsPartielRules';
export * from './horaireFlexibleRules';
export * from './teletravailRules';
export * from './droitGreveRules';
export * from './representationSyndicaleRules';
export * from './formationEntrepriseRules';
export * from './outplacementRules';
export * from './pensionComplementaireRules';

// ============================================================================
// RULES REGISTRY
// ============================================================================

import { RIS_RULES_JSON } from './risRules';
import { AGR_RULES_JSON } from './agrRules';
import { FAMILY_ALLOWANCES_RULES_JSON } from './allocationsFamilialesRules';
import { UNEMPLOYMENT_RULES_JSON } from './allocationsChomageRules';
import { BIRTH_ALLOWANCE_RULES_JSON } from './primeNaissanceRules';
import { HANDICAP_RULES_JSON } from './allocationHandicapesRules';
import { GRAPA_RULES_JSON } from './grapaRules';
import { HOUSING_AID_RULES_JSON } from './aideLogementRules';

/**
 * Registry of all available rules with their JSON exports
 * Note: Only rules with complete JSON exports are listed here.
 * Other rules have basic structures that can be expanded.
 */
export const RULES_REGISTRY = {
  ris: {
    id: 'ris',
    name: 'Revenu d\'Intégration Sociale',
    rulesJson: RIS_RULES_JSON,
  },
  agr: {
    id: 'agr',
    name: 'Allocation de Garantie de Revenus',
    rulesJson: AGR_RULES_JSON,
  },
  allocationsFamiliales: {
    id: 'allocationsFamiliales',
    name: 'Allocations Familiales',
    rulesJson: FAMILY_ALLOWANCES_RULES_JSON,
  },
  allocationsChomage: {
    id: 'allocationsChomage',
    name: 'Allocations de Chômage',
    rulesJson: UNEMPLOYMENT_RULES_JSON,
  },
  primeNaissance: {
    id: 'primeNaissance',
    name: 'Prime de Naissance',
    rulesJson: BIRTH_ALLOWANCE_RULES_JSON,
  },
  allocationHandicapes: {
    id: 'allocationHandicapes',
    name: 'Allocation pour Personnes Handicapées',
    rulesJson: HANDICAP_RULES_JSON,
  },
  grapa: {
    id: 'grapa',
    name: 'Garantie de Revenus aux Personnes Âgées',
    rulesJson: GRAPA_RULES_JSON,
  },
  aideLogement: {
    id: 'aideLogement',
    name: 'Aide au Logement',
    rulesJson: HOUSING_AID_RULES_JSON,
  },
} as const;

/**
 * Get rules JSON for a specific benefit type
 */
export function getRulesJson(benefitId: keyof typeof RULES_REGISTRY) {
  return RULES_REGISTRY[benefitId]?.rulesJson;
}

/**
 * List all available rules
 */
export function listAllRules() {
  return Object.values(RULES_REGISTRY).map((rule) => ({
    id: rule.id,
    name: rule.name,
  }));
}

/**
 * Get count of all rules files
 */
export function getRulesCount(): number {
  // This would ideally be dynamic, but for now returns the known count
  return 102; // Total number of rules files generated
}
