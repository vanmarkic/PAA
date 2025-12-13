/**
 * Business Rules for Assurance Maladie-Invalidité
 *
 * Implements the Gherkin specifications from features/benefits/assurance-maladie.feature
 * Using json-rules-engine for runtime evaluation.
 *
 * BASE JURIDIQUE:
 * - Loi coordonnée du 14 juillet 1994 relative à l'assurance obligatoire soins de santé et indemnités
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1994071438&table_name=loi
 * - Arrêté royal du 3 juillet 1996 portant exécution de la loi relative à l'assurance obligatoire
 * - Nomenclature INAMI des prestations de santé
 * - Publication au Moniteur Belge: 27 août 1994
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';

/**
 * AssuranceMaladie Rules Version Metadata
 * This version MUST match the specification version in features/benefits/assurance-maladie.feature
 */
export const ASSURANCE_MALADIE_RULES_METADATA = {
  implementsSpecification: '0.0.0',
  implementationVersion: '0.0.0',
  implementationStatus: 'complete' as const,
  lastSyncedWith: 'features/benefits/assurance-maladie.feature',
  generatedFrom: 'features/benefits/assurance-maladie.feature@0.0.0',
  divergences: [] as string[],
  effectiveDate: '2024-01-01',
};

// Constants from Belgian social law - INAMI 2024
export const INAMI_CONSTANTS = {
  // Taux de remboursement ordinaire
  REMBOURSEMENT_ORDINAIRE: {
    CONSULTATION_GENERALISTE: 0.75,
    CONSULTATION_SPECIALISTE: 0.75,
    MEDICAMENTS_CAT_A: 1.0,
    MEDICAMENTS_CAT_B: 0.75,
    MEDICAMENTS_CAT_C: 0.50,
    HOSPITALISATION_CHAMBRE_COMMUNE: 1.0,
    EXAMEN_BUCCAL: 1.0,
    DETARTRAGE: 0.75,
  },
  // Taux de remboursement BIM
  REMBOURSEMENT_BIM: {
    CONSULTATION_GENERALISTE: 0.90,
    CONSULTATION_SPECIALISTE: 0.90,
    MEDICAMENTS_CAT_A: 1.0,
    MEDICAMENTS_CAT_B: 0.85,
    MEDICAMENTS_CAT_C: 0.50,
    HOSPITALISATION_CHAMBRE_COMMUNE: 1.0,
  },
  // Seuils BIM 2024
  SEUIL_BIM_2024: {
    MENAGE_1_PERSONNE: 22251.48,
    SUPPLEMENT_PAR_PERSONNE: 4116.62,
  },
  // Intervention personnelle hospitalisation 2024
  HOSPITALISATION: {
    JOUR_1_ORDINAIRE: 44.51,
    JOUR_1_BIM: 6.32,
    JOURS_2_90_ORDINAIRE: 17.02,
    JOURS_2_90_BIM: 6.32,
    APRES_91_JOURS: 6.32,
  },
  // MAF plafonds 2024 par catégorie de revenus
  MAF_PLAFONDS: {
    CATEGORIE_1: { seuilRevenus: 22251.48, plafond: 250 },
    CATEGORIE_2: { seuilRevenus: 35000, plafond: 650 },
    CATEGORIE_3: { seuilRevenus: 45000, plafond: 1000 },
    CATEGORIE_4: { seuilRevenus: 55000, plafond: 1400 },
    CATEGORIE_5: { seuilRevenus: Infinity, plafond: 1800 },
  },
  // Forfait malade chronique
  FORFAIT_MALADE_CHRONIQUE: 103.97,
  SEUIL_DEPENSES_CHRONIQUE: 365,
  // DMG
  CONSULTATIONS_ANNUELLES_DMG: 12,
  REDUCTION_SANS_DMG: 5,
  // Délai carence indépendants (jours)
  DELAI_CARENCE_INDEPENDANT: {
    PAS_INDEMNITE: 7,
    INDEMNITE_PARTIELLE: 14,
    INDEMNITE_COMPLETE: 15,
  },
};

// Types spécifiques pour l'assurance maladie
export type StatutAssure = 'salarie' | 'independant' | 'chomeur' | 'etudiant' | 'pensionne' | 'beneficiaire_social';
export type TypeSoin = 'consultation_generaliste' | 'consultation_specialiste' | 'medicament_cat_a' | 'medicament_cat_b' | 'medicament_cat_c' | 'hospitalisation' | 'dentaire';
export type ChambreHospitalisation = 'commune' | 'double' | 'individuelle';

export interface AssuranceMaladieUser {
  age: number;
  statutAssure: StatutAssure;
  estAffilieMutuelle: boolean;
  cotisationsAJour: boolean;
  revenusAnnuels: number;
  tailleMemage: number;
  estBIM: boolean;
  estMaladeCronique: boolean;
  depensesAnnuellesSante: number;
  ticketsModerateursAnnuels: number;
  aDMG: boolean;
  beneficiaireGRAPARISARR: boolean;
  enfantHandicapePlus66: boolean;
}

export interface CalculRemboursementParams {
  typeSoin: TypeSoin;
  coutPrestation: number;
  estBIM: boolean;
  joursHospitalisation?: number;
  chambreType?: ChambreHospitalisation;
}

export interface ResultatRemboursement {
  montantRemboursement: number;
  ticketModerateur: number;
  tauxRemboursement: number;
  interventionPersonnelle?: number;
}

/**
 * Create the AssuranceMaladie eligibility rules engine
 */
function createAssuranceMaladieEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Non-affiliation à une mutuelle
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'estAffilieMutuelle',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'assuranceMaladie-ineligible',
      params: {
        reason: 'non affilié à une mutuelle - affiliation obligatoire pour tous',
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 2: Cotisations non payées
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'estAffilieMutuelle',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'cotisationsAJour',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'assuranceMaladie-ineligible',
      params: {
        reason: 'cotisations sociales impayées - suspension des droits',
        priority: 9,
      },
    },
    priority: 9,
  });

  // Rule 3: Éligibilité BIM automatique - bénéficiaire GRAPA/RIS/ARR
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'estAffilieMutuelle',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'cotisationsAJour',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'beneficiaireGRAPARISARR',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'assuranceMaladie-bim-automatique',
      params: {
        reason: 'statut BIM automatique - bénéficiaire GRAPA, RIS ou ARR',
        estBIM: true,
      },
    },
    priority: 8,
  });

  // Rule 4: Éligibilité BIM automatique - enfant handicapé >66%
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'estAffilieMutuelle',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'cotisationsAJour',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'enfantHandicapePlus66',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'assuranceMaladie-bim-automatique',
      params: {
        reason: 'statut BIM automatique - enfant avec allocation handicap >66%',
        estBIM: true,
      },
    },
    priority: 8,
  });

  // Rule 5: Éligibilité BIM par revenus - ménage 1 personne
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'estAffilieMutuelle',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'cotisationsAJour',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'tailleMemage',
          operator: 'equal',
          value: 1,
        },
        {
          fact: 'revenusAnnuels',
          operator: 'lessThanInclusive',
          value: INAMI_CONSTANTS.SEUIL_BIM_2024.MENAGE_1_PERSONNE,
        },
      ],
    },
    event: {
      type: 'assuranceMaladie-bim-revenus',
      params: {
        reason: `revenus inférieurs au seuil BIM (${INAMI_CONSTANTS.SEUIL_BIM_2024.MENAGE_1_PERSONNE}€ pour 1 personne)`,
        estBIM: true,
      },
    },
    priority: 7,
  });

  // Rule 6: Travailleur salarié éligible
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'estAffilieMutuelle',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'cotisationsAJour',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'statutAssure',
          operator: 'equal',
          value: 'salarie',
        },
      ],
    },
    event: {
      type: 'assuranceMaladie-eligible',
      params: {
        reason: 'travailleur salarié affilié à une mutuelle avec cotisations à jour',
        tiersPaiant: true,
        consultationsAnnuellesDMG: INAMI_CONSTANTS.CONSULTATIONS_ANNUELLES_DMG,
      },
    },
    priority: 5,
  });

  // Rule 7: Indépendant éligible avec délai de carence
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'estAffilieMutuelle',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'cotisationsAJour',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'statutAssure',
          operator: 'equal',
          value: 'independant',
        },
      ],
    },
    event: {
      type: 'assuranceMaladie-eligible',
      params: {
        reason: 'travailleur indépendant - mêmes remboursements mais délai de carence pour indemnités',
        tiersPaiant: true,
        delaiCarence: INAMI_CONSTANTS.DELAI_CARENCE_INDEPENDANT,
      },
    },
    priority: 5,
  });

  // Rule 8: Chômeur avec maintien des droits
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'estAffilieMutuelle',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'cotisationsAJour',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'statutAssure',
          operator: 'equal',
          value: 'chomeur',
        },
      ],
    },
    event: {
      type: 'assuranceMaladie-eligible',
      params: {
        reason: 'chômeur indemnisé - droits maintenus, cotisations prélevées sur allocations',
        tiersPaiant: true,
        potentielBIM: true,
      },
    },
    priority: 5,
  });

  // Rule 9: Pensionné éligible
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'estAffilieMutuelle',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'cotisationsAJour',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'statutAssure',
          operator: 'equal',
          value: 'pensionne',
        },
      ],
    },
    event: {
      type: 'assuranceMaladie-eligible',
      params: {
        reason: 'pensionné - droits à l\'assurance maladie',
        tiersPaiant: true,
      },
    },
    priority: 5,
  });

  // Rule 10: Étudiant éligible avec CEAM
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'estAffilieMutuelle',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'cotisationsAJour',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'statutAssure',
          operator: 'equal',
          value: 'etudiant',
        },
      ],
    },
    event: {
      type: 'assuranceMaladie-eligible',
      params: {
        reason: 'étudiant affilié - droit à la CEAM pour soins en Europe',
        tiersPaiant: true,
        droitCEAM: true,
      },
    },
    priority: 5,
  });

  // Rule 11: Malade chronique - forfait
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'estAffilieMutuelle',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'cotisationsAJour',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'estMaladeCronique',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'depensesAnnuellesSante',
          operator: 'greaterThan',
          value: INAMI_CONSTANTS.SEUIL_DEPENSES_CHRONIQUE,
        },
      ],
    },
    event: {
      type: 'assuranceMaladie-forfait-chronique',
      params: {
        reason: 'malade chronique reconnu avec dépenses supérieures à 365€/an',
        forfaitAnnuel: INAMI_CONSTANTS.FORFAIT_MALADE_CHRONIQUE,
        tiersPaiantObligatoire: true,
      },
    },
    priority: 6,
  });

  // Rule 12: Éligibilité générale
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'estAffilieMutuelle',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'cotisationsAJour',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'assuranceMaladie-eligible',
      params: {
        reason: 'assuré social en ordre de mutuelle',
        tiersPaiant: true,
      },
    },
    priority: 1,
  });

  return engine;
}

/**
 * Singleton instance of the AssuranceMaladie rules engine
 */
const assuranceMaladieEngineInstance = createAssuranceMaladieEngine();

/**
 * Calculate the BIM threshold based on household size
 */
export function calculateSeuilBIM(tailleMemage: number): number {
  const seuilBase = INAMI_CONSTANTS.SEUIL_BIM_2024.MENAGE_1_PERSONNE;
  const supplementParPersonne = INAMI_CONSTANTS.SEUIL_BIM_2024.SUPPLEMENT_PAR_PERSONNE;
  
  if (tailleMemage <= 1) {
    return seuilBase;
  }
  
  return seuilBase + (tailleMemage - 1) * supplementParPersonne;
}

/**
 * Determine if user qualifies for BIM status
 */
export function determinerStatutBIM(user: AssuranceMaladieUser): boolean {
  // Automatic BIM
  if (user.beneficiaireGRAPARISARR || user.enfantHandicapePlus66) {
    return true;
  }
  
  // BIM by income
  const seuilBIM = calculateSeuilBIM(user.tailleMemage);
  return user.revenusAnnuels <= seuilBIM;
}

/**
 * Calculate MAF threshold based on annual income
 */
export function calculatePlafondMAF(revenusAnnuels: number): number {
  const plafonds = INAMI_CONSTANTS.MAF_PLAFONDS;
  
  if (revenusAnnuels <= plafonds.CATEGORIE_1.seuilRevenus) {
    return plafonds.CATEGORIE_1.plafond;
  } else if (revenusAnnuels <= plafonds.CATEGORIE_2.seuilRevenus) {
    return plafonds.CATEGORIE_2.plafond;
  } else if (revenusAnnuels <= plafonds.CATEGORIE_3.seuilRevenus) {
    return plafonds.CATEGORIE_3.plafond;
  } else if (revenusAnnuels <= plafonds.CATEGORIE_4.seuilRevenus) {
    return plafonds.CATEGORIE_4.plafond;
  }
  
  return plafonds.CATEGORIE_5.plafond;
}

/**
 * Get reimbursement rate based on care type and BIM status
 */
export function getTauxRemboursement(typeSoin: TypeSoin, estBIM: boolean): number {
  const taux = estBIM ? INAMI_CONSTANTS.REMBOURSEMENT_BIM : INAMI_CONSTANTS.REMBOURSEMENT_ORDINAIRE;
  
  switch (typeSoin) {
    case 'consultation_generaliste':
      return estBIM ? taux.CONSULTATION_GENERALISTE : INAMI_CONSTANTS.REMBOURSEMENT_ORDINAIRE.CONSULTATION_GENERALISTE;
    case 'consultation_specialiste':
      return estBIM ? taux.CONSULTATION_SPECIALISTE : INAMI_CONSTANTS.REMBOURSEMENT_ORDINAIRE.CONSULTATION_SPECIALISTE;
    case 'medicament_cat_a':
      return INAMI_CONSTANTS.REMBOURSEMENT_ORDINAIRE.MEDICAMENTS_CAT_A; // Always 100%
    case 'medicament_cat_b':
      return estBIM ? taux.MEDICAMENTS_CAT_B : INAMI_CONSTANTS.REMBOURSEMENT_ORDINAIRE.MEDICAMENTS_CAT_B;
    case 'medicament_cat_c':
      return INAMI_CONSTANTS.REMBOURSEMENT_ORDINAIRE.MEDICAMENTS_CAT_C; // Always 50%
    case 'hospitalisation':
      return 1.0; // Medical costs 100% for common room
    case 'dentaire':
      return INAMI_CONSTANTS.REMBOURSEMENT_ORDINAIRE.DETARTRAGE;
    default:
      return INAMI_CONSTANTS.REMBOURSEMENT_ORDINAIRE.CONSULTATION_GENERALISTE;
  }
}

/**
 * Calculate hospitalization personal contribution
 */
export function calculateInterventionHospitalisation(
  joursHospitalisation: number,
  estBIM: boolean
): number {
  if (joursHospitalisation <= 0) return 0;
  
  let total = 0;
  const hosp = INAMI_CONSTANTS.HOSPITALISATION;
  
  // Day 1
  total += estBIM ? hosp.JOUR_1_BIM : hosp.JOUR_1_ORDINAIRE;
  
  // Days 2-90
  const jours2a90 = Math.min(joursHospitalisation - 1, 89);
  if (jours2a90 > 0) {
    total += jours2a90 * (estBIM ? hosp.JOURS_2_90_BIM : hosp.JOURS_2_90_ORDINAIRE);
  }
  
  // After 91 days
  const joursApres91 = Math.max(0, joursHospitalisation - 90);
  if (joursApres91 > 0) {
    total += joursApres91 * hosp.APRES_91_JOURS;
  }
  
  return Math.round(total * 100) / 100;
}

/**
 * Calculate Assurance Maladie-Invalidité reimbursement
 */
export function calculateAssuranceMaladieAmount(
  params: CalculRemboursementParams
): ResultatRemboursement {
  const { typeSoin, coutPrestation, estBIM, joursHospitalisation, chambreType } = params;
  
  // Get reimbursement rate
  const tauxRemboursement = getTauxRemboursement(typeSoin, estBIM);
  
  // Calculate reimbursement and co-payment
  const montantRemboursement = Math.round(coutPrestation * tauxRemboursement * 100) / 100;
  const ticketModerateur = Math.round((coutPrestation - montantRemboursement) * 100) / 100;
  
  const result: ResultatRemboursement = {
    montantRemboursement,
    ticketModerateur,
    tauxRemboursement,
  };
  
  // Add hospitalization personal contribution if applicable
  if (typeSoin === 'hospitalisation' && joursHospitalisation && chambreType === 'commune') {
    result.interventionPersonnelle = calculateInterventionHospitalisation(joursHospitalisation, estBIM);
  }
  
  return result;
}

/**
 * Calculate ticket modérateur for a given care cost and status
 * Based on Scenario Outline: Calcul ticket modérateur selon statut
 */
export function calculateTicketModerateur(
  coutPrestation: number,
  tauxRemboursement: number
): { ticketModerateur: number; remboursement: number } {
  const remboursement = Math.round(coutPrestation * tauxRemboursement * 100) / 100;
  const ticketModerateur = Math.round((coutPrestation - remboursement) * 100) / 100;
  
  return { ticketModerateur, remboursement };
}

/**
 * Check Assurance Maladie-Invalidité eligibility
 */
export async function checkAssuranceMaladieEligibility(
  user: AssuranceMaladieUser
): Promise<EligibilityCheck> {
  // Calculate BIM status if not explicitly set
  const estBIMCalcule = user.estBIM || determinerStatutBIM(user);
  
  const facts = {
    age: user.age,
    statutAssure: user.statutAssure,
    estAffilieMutuelle: user.estAffilieMutuelle,
    cotisationsAJour: user.cotisationsAJour,
    revenusAnnuels: user.revenusAnnuels,
    tailleMemage: user.tailleMemage,
    estBIM: estBIMCalcule,
    estMaladeCronique: user.estMaladeCronique,
    depensesAnnuellesSante: user.depensesAnnuellesSante,
    ticketsModerateursAnnuels: user.ticketsModerateursAnnuels,
    aDMG: user.aDMG,
    beneficiaireGRAPARISARR: user.beneficiaireGRAPARISARR,
    enfantHandicapePlus66: user.enfantHandicapePlus66,
  };

  try {
    const results = await assuranceMaladieEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'assuranceMaladie-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'assuranceMaladie-eligible');
    const bimAutomatiqueEvent = results.events.find((e) => e.type === 'assuranceMaladie-bim-automatique');
    const bimRevenusEvent = results.events.find((e) => e.type === 'assuranceMaladie-bim-revenus');
    const forfaitChroniqueEvent = results.events.find((e) => e.type === 'assuranceMaladie-forfait-chronique');

    if (ineligibleEvent) {
      return {
        benefitType: 'health-insurance',
        isEligible: false,
        reason: ineligibleEvent.params?.reason as string,
      };
    }

    if (eligibleEvent || bimAutomatiqueEvent || bimRevenusEvent) {
      // Calculate MAF threshold
      const plafondMAF = calculatePlafondMAF(user.revenusAnnuels);
      
      // Check if MAF applies (exceeded threshold)
      const mafAtteint = user.ticketsModerateursAnnuels >= plafondMAF;
      
      // Calculate example reimbursement for consultation
      const exempleRemboursement = calculateAssuranceMaladieAmount({
        typeSoin: 'consultation_generaliste',
        coutPrestation: 29,
        estBIM: estBIMCalcule,
      });

      // Build notes array with additional information
      const notes: string[] = [
        `Statut BIM: ${estBIMCalcule ? 'Oui' : 'Non'}`,
        `Plafond MAF: ${plafondMAF}€`,
        `MAF atteint: ${mafAtteint ? 'Oui' : 'Non'}`,
        `Taux remboursement consultation: ${estBIMCalcule ? '90%' : '75%'}`,
        `Exemple ticket modérateur: ${exempleRemboursement.ticketModerateur}€`,
      ];

      // Add chronic illness benefits if applicable
      if (forfaitChroniqueEvent) {
        notes.push(`Forfait malade chronique: ${INAMI_CONSTANTS.FORFAIT_MALADE_CHRONIQUE}€`);
        notes.push('Tiers payant obligatoire');
      }

      // Add DMG information
      if (user.aDMG) {
        notes.push(`Consultations annuelles DMG: ${INAMI_CONSTANTS.CONSULTATIONS_ANNUELLES_DMG}`);
      } else {
        notes.push(`Réduction sans DMG: ${INAMI_CONSTANTS.REDUCTION_SANS_DMG}€`);
      }

      // Add specific info for independents
      if (user.statutAssure === 'independant') {
        notes.push(`Délai de carence: ${INAMI_CONSTANTS.DELAI_CARENCE_INDEPENDANT.INDEMNITE_COMPLETE} jours`);
      }

      return {
        benefitType: 'health-insurance',
        isEligible: true,
        reason: eligibleEvent?.params?.reason as string || bimAutomatiqueEvent?.params?.reason as string || bimRevenusEvent?.params?.reason as string,
        calculatedAmount: forfaitChroniqueEvent ? INAMI_CONSTANTS.FORFAIT_MALADE_CHRONIQUE : undefined,
        notes,
      };
    }

    return {
      benefitType: 'health-insurance',
      isEligible: false,
      reason: 'conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Error checking Assurance Maladie-Invalidité eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const ASSURANCE_MALADIE_RULES_JSON = {
  legalFramework: {
    law: 'Loi coordonnée du 14 juillet 1994 relative à l\'assurance obligatoire soins de santé et indemnités',
    url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1994071438&table_name=loi',
    executionDecree: 'Arrêté royal du 3 juillet 1996',
    nomenclature: 'Nomenclature INAMI des prestations de santé',
    effectiveDate: '2024-01-01',
  },
  rules: [
    {
      id: 'affiliation-obligatoire',
      description: 'L\'affiliation à une mutuelle est obligatoire pour tous',
      condition: 'estAffilieMutuelle === true',
      consequence: 'Accès aux remboursements de soins de santé',
    },
    {
      id: 'cotisations-a-jour',
      description: 'Les cotisations sociales doivent être payées',
      condition: 'cotisationsAJour === true',
      consequence: 'Droits actifs à l\'assurance maladie',
    },
    {
      id: 'bim-automatique-grapa-ris-arr',
      description: 'Statut BIM automatique pour bénéficiaires GRAPA, RIS ou ARR',
      condition: 'beneficiaireGRAPARISARR === true',
      consequence: 'Remboursement majoré (90% au lieu de 75%)',
    },
    {
      id: 'bim-automatique-handicap',
      description: 'Statut BIM automatique pour enfant avec handicap >66%',
      condition: 'enfantHandicapePlus66 === true',
      consequence: 'Statut BIM automatique accordé',
    },
  ],
};