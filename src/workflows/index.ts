/**
 * Central export file for all Belgian Social and Fiscal Rights XState Machines
 *
 * This file exports 102 state machines covering:
 * - Social Benefits (Allocations sociales)
 * - Fiscal Rights (Droits fiscaux)
 * - Social Services (Services sociaux)
 * - Employment & Labor Rights (Droits du travail)
 */

// ============================================================================
// ORIGINAL MACHINES
// ============================================================================

export { risApplicationMachine } from './risMachine';
export { conversionMachine } from './conversionMachine';

// ============================================================================
// SOCIAL BENEFITS (Allocations sociales) - 25 machines
// ============================================================================

export { allocationsChomageMachine } from './allocationsChomage';
export { allocationsFamilialesMachine } from './allocationsFamiliales';
export { primeNaissanceMachine } from './primeNaissance';
export { allocationHandicapesMachine } from './allocationHandicapes';
export { pensionRetraiteMachine } from './pensionRetraite';
export { pensionSurvieMachine } from './pensionSurvie';
export { grapaMachine } from './grapa';
export { allocationIntegrationMachine } from './allocationIntegration';
export { aideSocialeMachine } from './aideSociale';
export { assuranceMaladieMachine } from './assuranceMaladie';
export { congeParentalMachine } from './congeParental';
export { congeMaterniteMachine } from './congeMaternite';
export { allocationsEtudesMachine } from './allocationsEtudes';
export { bourseEtudesMachine } from './bourseEtudes';
export { aideLogementMachine } from './aideLogement';
export { garantieLocativeMachine } from './garantieLocative';
export { aidePersonnesAgeesMachine } from './aidePersonnesAgees';
export { gardeEnfantsMachine } from './gardeEnfants';
export { carteMedicaleMachine } from './carteMedicale';
export { aideJuridiqueMachine } from './aideJuridique';
export { fondsSecuriteExistenceMachine } from './fondsSecuriteExistence';
export { allocationChauffageMachine } from './allocationChauffage';
export { tarifSocialEnergieMachine } from './tarifSocialEnergie';
export { abonnementSocialTransportMachine } from './abonnementSocialTransport';
export { revenuCadastralExonerationMachine } from './revenuCadastralExoneration';

// ============================================================================
// FISCAL RIGHTS (Droits fiscaux) - 25 machines
// ============================================================================

export { creditImpotMachine } from './creditImpotMachine';
export { deductionHabitationMachine } from './deductionHabitationMachine';
export { deductionInvestissementMachine } from './deductionInvestissementMachine';
export { reductionEpargnePensionMachine } from './reductionEpargnePensionMachine';
export { chequesRepasMachine } from './chequesRepasMachine';
export { ecoChequeMachine } from './ecoChequeMachine';
export { avantagesNatureMachine } from './avantagesNatureMachine';
export { tvaReduiteMachine } from './tvaReduiteMachine';
export { exonerationPrecompteMachine } from './exonerationPrecompteMachine';
export { bonusLogementMachine } from './bonusLogementMachine';
export { deductionFraisGardeMachine } from './deductionFraisGardeMachine';
export { creditImpotServiceLocalMachine } from './creditImpotServiceLocalMachine';
export { quotientConjugalMachine } from './quotientConjugalMachine';
export { renteAlimentaireMachine } from './renteAlimentaireMachine';
export { deductionDonsMachine } from './deductionDonsMachine';
export { fraisProfessionnelsMachine } from './fraisProfessionnelsMachine';
export { deductionVehiculeElectriqueMachine } from './deductionVehiculeElectriqueMachine';
export { primeRenovationMachine } from './primeRenovationMachine';
export { deductionIsolationMachine } from './deductionIsolationMachine';
export { creditImpotInvestissementDurableMachine } from './creditImpotInvestissementDurableMachine';
export { exonerationPlusValueMachine } from './exonerationPlusValueMachine';
export { deductionEmpruntHypothecaireMachine } from './deductionEmpruntHypothecaireMachine';
export { abattementSuccessionMachine } from './abattementSuccessionMachine';
export { droitsDonationReduitsMachine } from './droitsDonationReduitsMachine';
export { exonerationRevenusMobiliersMachine } from './exonerationRevenusMobiliersMachine';

// ============================================================================
// SOCIAL SERVICES (Services sociaux) - 25 machines
// ============================================================================

export { logementSocialMachine } from './logementSocialMachine';
export { inscriptionEcoleMachine } from './inscriptionEcoleMachine';
export { repasScolairesGratuitsMachine } from './repasScolairesGratuitsMachine';
export { transportScolaireMachine } from './transportScolaireMachine';
export { aideAlimentaireMachine } from './aideAlimentaireMachine';
export { banqueAlimentaireMachine } from './banqueAlimentaireMachine';
export { restaurantsSociauxMachine } from './restaurantsSociauxMachine';
export { mediationDettesMachine } from './mediationDettesMachine';
export { budgetEnergetiqueMachine } from './budgetEnergetiqueMachine';
export { fondsCreancesMachine } from './fondsCreancesMachine';
export { protectionJuridiqueMachine } from './protectionJuridiqueMachine';
export { accompagnementSocialMachine } from './accompagnementSocialMachine';
export { insertionProfessionnelleMachine } from './insertionProfessionnelleMachine';
export { formationProfessionnelleMachine } from './formationProfessionnelleMachine';
export { servicePublicEmploiMachine } from './servicePublicEmploiMachine';
export { aideMobiliteMachine } from './aideMobiliteMachine';
export { soinsSanteMentaleMachine } from './soinsSanteMentaleMachine';
export { aideSansAbriMachine } from './aideSansAbriMachine';
export { centreAccueilMachine } from './centreAccueilMachine';
export { mediationFamilialeMachine } from './mediationFamilialeMachine';
export { aideVictimesMachine } from './aideVictimesMachine';
export { protectionEnfanceMachine } from './protectionEnfanceMachine';
export { teleAssistanceMachine } from './teleAssistanceMachine';
export { aideMenagereMachine } from './aideMenagereMachine';
export { repasDomicileMachine } from './repasDomicileMachine';

// ============================================================================
// EMPLOYMENT & LABOR RIGHTS (Droits du travail) - 25 machines
// ============================================================================

export { contratTravailMachine } from './contratTravail';
export { preavisMachine } from './preavis';
export { licenciementMachine } from './licenciement';
export { demissionMachine } from './demission';
export { creditTempsMachine } from './creditTemps';
export { congeMaladieMachine } from './congeMaladie';
export { accidentTravailMachine } from './accidentTravail';
export { maladieProfessionnelleMachine } from './maladieProfessionnelle';
export { harcelementTravailMachine } from './harcelementTravail';
export { discriminationEmploiMachine } from './discriminationEmploi';
export { egaliteSalarialeMachine } from './egaliteSalariale';
export { travailEtudiantMachine } from './travailEtudiant';
export { stageMachine } from './stage';
export { flexiJobMachine } from './flexiJob';
export { travailInterimaireMachine } from './travailInterimaire';
export { contratDureeDetermineeMachine } from './contratDureeDeterminee';
export { contratDureeIndetermineeMachine } from './contratDureeIndeterminee';
export { tempsPartielMachine } from './tempsPartiel';
export { horaireFlexibleMachine } from './horaireFlexible';
export { teletravailMachine } from './teletravail';
export { droitGreveMachine } from './droitGreve';
export { representationSyndicaleMachine } from './representationSyndicale';
export { formationEntrepriseMachine } from './formationEntreprise';
export { outplacementMachine } from './outplacement';
export { pensionComplementaireMachine } from './pensionComplementaire';

// ============================================================================
// MACHINE CATEGORIES (for easy filtering/grouping)
// ============================================================================

export const MACHINE_CATEGORIES = {
  SOCIAL_BENEFITS: 'social_benefits',
  FISCAL_RIGHTS: 'fiscal_rights',
  SOCIAL_SERVICES: 'social_services',
  EMPLOYMENT_RIGHTS: 'employment_rights',
} as const;

export type MachineCategory = typeof MACHINE_CATEGORIES[keyof typeof MACHINE_CATEGORIES];

/**
 * Machine registry with metadata
 */
export const MACHINE_REGISTRY = {
  // Original machines
  risApplication: { id: 'risApplication', category: MACHINE_CATEGORIES.SOCIAL_BENEFITS },
  legalConversion: { id: 'legalConversion', category: MACHINE_CATEGORIES.SOCIAL_SERVICES },

  // Social Benefits
  allocationsChomage: { id: 'allocationsChomage', category: MACHINE_CATEGORIES.SOCIAL_BENEFITS },
  allocationsFamiliales: { id: 'allocationsFamiliales', category: MACHINE_CATEGORIES.SOCIAL_BENEFITS },
  primeNaissance: { id: 'primeNaissance', category: MACHINE_CATEGORIES.SOCIAL_BENEFITS },
  allocationHandicapes: { id: 'allocationHandicapes', category: MACHINE_CATEGORIES.SOCIAL_BENEFITS },
  pensionRetraite: { id: 'pensionRetraite', category: MACHINE_CATEGORIES.SOCIAL_BENEFITS },
  pensionSurvie: { id: 'pensionSurvie', category: MACHINE_CATEGORIES.SOCIAL_BENEFITS },
  grapa: { id: 'grapa', category: MACHINE_CATEGORIES.SOCIAL_BENEFITS },
  allocationIntegration: { id: 'allocationIntegration', category: MACHINE_CATEGORIES.SOCIAL_BENEFITS },
  aideSociale: { id: 'aideSociale', category: MACHINE_CATEGORIES.SOCIAL_BENEFITS },
  assuranceMaladie: { id: 'assuranceMaladie', category: MACHINE_CATEGORIES.SOCIAL_BENEFITS },
  congeParental: { id: 'congeParental', category: MACHINE_CATEGORIES.SOCIAL_BENEFITS },
  congeMaternite: { id: 'congeMaternite', category: MACHINE_CATEGORIES.SOCIAL_BENEFITS },
  allocationsEtudes: { id: 'allocationsEtudes', category: MACHINE_CATEGORIES.SOCIAL_BENEFITS },
  bourseEtudes: { id: 'bourseEtudes', category: MACHINE_CATEGORIES.SOCIAL_BENEFITS },
  aideLogement: { id: 'aideLogement', category: MACHINE_CATEGORIES.SOCIAL_BENEFITS },
  garantieLocative: { id: 'garantieLocative', category: MACHINE_CATEGORIES.SOCIAL_BENEFITS },
  aidePersonnesAgees: { id: 'aidePersonnesAgees', category: MACHINE_CATEGORIES.SOCIAL_BENEFITS },
  gardeEnfants: { id: 'gardeEnfants', category: MACHINE_CATEGORIES.SOCIAL_BENEFITS },
  carteMedicale: { id: 'carteMedicale', category: MACHINE_CATEGORIES.SOCIAL_BENEFITS },
  aideJuridique: { id: 'aideJuridique', category: MACHINE_CATEGORIES.SOCIAL_BENEFITS },
  fondsSecuriteExistence: { id: 'fondsSecuriteExistence', category: MACHINE_CATEGORIES.SOCIAL_BENEFITS },
  allocationChauffage: { id: 'allocationChauffage', category: MACHINE_CATEGORIES.SOCIAL_BENEFITS },
  tarifSocialEnergie: { id: 'tarifSocialEnergie', category: MACHINE_CATEGORIES.SOCIAL_BENEFITS },
  abonnementSocialTransport: { id: 'abonnementSocialTransport', category: MACHINE_CATEGORIES.SOCIAL_BENEFITS },
  revenuCadastralExoneration: { id: 'revenuCadastralExoneration', category: MACHINE_CATEGORIES.FISCAL_RIGHTS },

  // Fiscal Rights
  creditImpot: { id: 'creditImpot', category: MACHINE_CATEGORIES.FISCAL_RIGHTS },
  deductionHabitation: { id: 'deductionHabitation', category: MACHINE_CATEGORIES.FISCAL_RIGHTS },
  deductionInvestissement: { id: 'deductionInvestissement', category: MACHINE_CATEGORIES.FISCAL_RIGHTS },
  reductionEpargnePension: { id: 'reductionEpargnePension', category: MACHINE_CATEGORIES.FISCAL_RIGHTS },
  chequesRepas: { id: 'chequesRepas', category: MACHINE_CATEGORIES.FISCAL_RIGHTS },
  ecoCheque: { id: 'ecoCheque', category: MACHINE_CATEGORIES.FISCAL_RIGHTS },
  avantagesNature: { id: 'avantagesNature', category: MACHINE_CATEGORIES.FISCAL_RIGHTS },
  tvaReduite: { id: 'tvaReduite', category: MACHINE_CATEGORIES.FISCAL_RIGHTS },
  exonerationPrecompte: { id: 'exonerationPrecompte', category: MACHINE_CATEGORIES.FISCAL_RIGHTS },
  bonusLogement: { id: 'bonusLogement', category: MACHINE_CATEGORIES.FISCAL_RIGHTS },
  deductionFraisGarde: { id: 'deductionFraisGarde', category: MACHINE_CATEGORIES.FISCAL_RIGHTS },
  creditImpotServiceLocal: { id: 'creditImpotServiceLocal', category: MACHINE_CATEGORIES.FISCAL_RIGHTS },
  quotientConjugal: { id: 'quotientConjugal', category: MACHINE_CATEGORIES.FISCAL_RIGHTS },
  renteAlimentaire: { id: 'renteAlimentaire', category: MACHINE_CATEGORIES.FISCAL_RIGHTS },
  deductionDons: { id: 'deductionDons', category: MACHINE_CATEGORIES.FISCAL_RIGHTS },
  fraisProfessionnels: { id: 'fraisProfessionnels', category: MACHINE_CATEGORIES.FISCAL_RIGHTS },
  deductionVehiculeElectrique: { id: 'deductionVehiculeElectrique', category: MACHINE_CATEGORIES.FISCAL_RIGHTS },
  primeRenovation: { id: 'primeRenovation', category: MACHINE_CATEGORIES.FISCAL_RIGHTS },
  deductionIsolation: { id: 'deductionIsolation', category: MACHINE_CATEGORIES.FISCAL_RIGHTS },
  creditImpotInvestissementDurable: { id: 'creditImpotInvestissementDurable', category: MACHINE_CATEGORIES.FISCAL_RIGHTS },
  exonerationPlusValue: { id: 'exonerationPlusValue', category: MACHINE_CATEGORIES.FISCAL_RIGHTS },
  deductionEmpruntHypothecaire: { id: 'deductionEmpruntHypothecaire', category: MACHINE_CATEGORIES.FISCAL_RIGHTS },
  abattementSuccession: { id: 'abattementSuccession', category: MACHINE_CATEGORIES.FISCAL_RIGHTS },
  droitsDonationReduits: { id: 'droitsDonationReduits', category: MACHINE_CATEGORIES.FISCAL_RIGHTS },
  exonerationRevenusMobiliers: { id: 'exonerationRevenusMobiliers', category: MACHINE_CATEGORIES.FISCAL_RIGHTS },

  // Social Services
  logementSocial: { id: 'logementSocial', category: MACHINE_CATEGORIES.SOCIAL_SERVICES },
  inscriptionEcole: { id: 'inscriptionEcole', category: MACHINE_CATEGORIES.SOCIAL_SERVICES },
  repasScolairesGratuits: { id: 'repasScolairesGratuits', category: MACHINE_CATEGORIES.SOCIAL_SERVICES },
  transportScolaire: { id: 'transportScolaire', category: MACHINE_CATEGORIES.SOCIAL_SERVICES },
  aideAlimentaire: { id: 'aideAlimentaire', category: MACHINE_CATEGORIES.SOCIAL_SERVICES },
  banqueAlimentaire: { id: 'banqueAlimentaire', category: MACHINE_CATEGORIES.SOCIAL_SERVICES },
  restaurantsSociaux: { id: 'restaurantsSociaux', category: MACHINE_CATEGORIES.SOCIAL_SERVICES },
  mediationDettes: { id: 'mediationDettes', category: MACHINE_CATEGORIES.SOCIAL_SERVICES },
  budgetEnergetique: { id: 'budgetEnergetique', category: MACHINE_CATEGORIES.SOCIAL_SERVICES },
  fondsCreances: { id: 'fondsCreances', category: MACHINE_CATEGORIES.SOCIAL_SERVICES },
  protectionJuridique: { id: 'protectionJuridique', category: MACHINE_CATEGORIES.SOCIAL_SERVICES },
  accompagnementSocial: { id: 'accompagnementSocial', category: MACHINE_CATEGORIES.SOCIAL_SERVICES },
  insertionProfessionnelle: { id: 'insertionProfessionnelle', category: MACHINE_CATEGORIES.SOCIAL_SERVICES },
  formationProfessionnelle: { id: 'formationProfessionnelle', category: MACHINE_CATEGORIES.SOCIAL_SERVICES },
  servicePublicEmploi: { id: 'servicePublicEmploi', category: MACHINE_CATEGORIES.SOCIAL_SERVICES },
  aideMobilite: { id: 'aideMobilite', category: MACHINE_CATEGORIES.SOCIAL_SERVICES },
  soinsSanteMentale: { id: 'soinsSanteMentale', category: MACHINE_CATEGORIES.SOCIAL_SERVICES },
  aideSansAbri: { id: 'aideSansAbri', category: MACHINE_CATEGORIES.SOCIAL_SERVICES },
  centreAccueil: { id: 'centreAccueil', category: MACHINE_CATEGORIES.SOCIAL_SERVICES },
  mediationFamiliale: { id: 'mediationFamiliale', category: MACHINE_CATEGORIES.SOCIAL_SERVICES },
  aideVictimes: { id: 'aideVictimes', category: MACHINE_CATEGORIES.SOCIAL_SERVICES },
  protectionEnfance: { id: 'protectionEnfance', category: MACHINE_CATEGORIES.SOCIAL_SERVICES },
  teleAssistance: { id: 'teleAssistance', category: MACHINE_CATEGORIES.SOCIAL_SERVICES },
  aideMenagere: { id: 'aideMenagere', category: MACHINE_CATEGORIES.SOCIAL_SERVICES },
  repasDomicile: { id: 'repasDomicile', category: MACHINE_CATEGORIES.SOCIAL_SERVICES },

  // Employment & Labor Rights
  contratTravail: { id: 'contratTravail', category: MACHINE_CATEGORIES.EMPLOYMENT_RIGHTS },
  preavis: { id: 'preavis', category: MACHINE_CATEGORIES.EMPLOYMENT_RIGHTS },
  licenciement: { id: 'licenciement', category: MACHINE_CATEGORIES.EMPLOYMENT_RIGHTS },
  demission: { id: 'demission', category: MACHINE_CATEGORIES.EMPLOYMENT_RIGHTS },
  creditTemps: { id: 'creditTemps', category: MACHINE_CATEGORIES.EMPLOYMENT_RIGHTS },
  congeMaladie: { id: 'congeMaladie', category: MACHINE_CATEGORIES.EMPLOYMENT_RIGHTS },
  accidentTravail: { id: 'accidentTravail', category: MACHINE_CATEGORIES.EMPLOYMENT_RIGHTS },
  maladieProfessionnelle: { id: 'maladieProfessionnelle', category: MACHINE_CATEGORIES.EMPLOYMENT_RIGHTS },
  harcelementTravail: { id: 'harcelementTravail', category: MACHINE_CATEGORIES.EMPLOYMENT_RIGHTS },
  discriminationEmploi: { id: 'discriminationEmploi', category: MACHINE_CATEGORIES.EMPLOYMENT_RIGHTS },
  egaliteSalariale: { id: 'egaliteSalariale', category: MACHINE_CATEGORIES.EMPLOYMENT_RIGHTS },
  travailEtudiant: { id: 'travailEtudiant', category: MACHINE_CATEGORIES.EMPLOYMENT_RIGHTS },
  stage: { id: 'stage', category: MACHINE_CATEGORIES.EMPLOYMENT_RIGHTS },
  flexiJob: { id: 'flexiJob', category: MACHINE_CATEGORIES.EMPLOYMENT_RIGHTS },
  travailInterimaire: { id: 'travailInterimaire', category: MACHINE_CATEGORIES.EMPLOYMENT_RIGHTS },
  contratDureeDeterminee: { id: 'contratDureeDeterminee', category: MACHINE_CATEGORIES.EMPLOYMENT_RIGHTS },
  contratDureeIndeterminee: { id: 'contratDureeIndeterminee', category: MACHINE_CATEGORIES.EMPLOYMENT_RIGHTS },
  tempsPartiel: { id: 'tempsPartiel', category: MACHINE_CATEGORIES.EMPLOYMENT_RIGHTS },
  horaireFlexible: { id: 'horaireFlexible', category: MACHINE_CATEGORIES.EMPLOYMENT_RIGHTS },
  teletravail: { id: 'teletravail', category: MACHINE_CATEGORIES.EMPLOYMENT_RIGHTS },
  droitGreve: { id: 'droitGreve', category: MACHINE_CATEGORIES.EMPLOYMENT_RIGHTS },
  representationSyndicale: { id: 'representationSyndicale', category: MACHINE_CATEGORIES.EMPLOYMENT_RIGHTS },
  formationEntreprise: { id: 'formationEntreprise', category: MACHINE_CATEGORIES.EMPLOYMENT_RIGHTS },
  outplacement: { id: 'outplacement', category: MACHINE_CATEGORIES.EMPLOYMENT_RIGHTS },
  pensionComplementaire: { id: 'pensionComplementaire', category: MACHINE_CATEGORIES.EMPLOYMENT_RIGHTS },
} as const;
