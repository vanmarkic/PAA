/**
 * Business Rules for Congé Maladie et Indemnités d'Incapacité de Travail
 *
 * Implements the Gherkin specifications from features/benefits/conge-maladie.feature
 * Using json-rules-engine for runtime evaluation.
 *
 * BASE JURIDIQUE:
 * - Loi relative à l'assurance obligatoire soins de santé et indemnités (coordonnée le 14 juillet 1994)
 * - Arrêté royal du 3 juillet 1996 portant exécution de la loi relative à l'assurance obligatoire
 * - Règlement INAMI sur les indemnités d'incapacité de travail
 * - Code du travail belge - Titre IV: Salaire garanti
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';

/**
 * CongeMaladie Rules Version Metadata
 * This version MUST match the specification version in features/benefits/conge-maladie.feature
 */
export const CONGE_MALADIE_RULES_METADATA = {
  implementsSpecification: '0.0.0',
  implementationVersion: '0.0.0',
  implementationStatus: 'complete' as const,
  lastSyncedWith: 'features/benefits/conge-maladie.feature',
  generatedFrom: 'features/benefits/conge-maladie.feature@0.0.0',
  divergences: [] as string[],
  effectiveDate: '2024-01-01',
};

// Constants from Belgian social law - INAMI 2024
export const CONGE_MALADIE_CONSTANTS = {
  // Plafonds journaliers
  PLAFOND_INCAPACITE_PRIMAIRE: 170.66,
  
  // Taux incapacité primaire (jours 31-365)
  TAUX_INCAPACITE_PRIMAIRE: 0.60,
  
  // Taux invalidité par situation familiale
  TAUX_INVALIDITE_CHARGE_FAMILLE: 0.65,
  TAUX_INVALIDITE_ISOLE: 0.55,
  TAUX_INVALIDITE_COHABITANT: 0.40,
  
  // Minimums journaliers invalidité
  MIN_JOUR_CHARGE_FAMILLE: 76.42,
  MIN_JOUR_ISOLE: 60.56,
  MIN_JOUR_COHABITANT: 51.93,
  
  // Maximums journaliers invalidité
  MAX_JOUR_CHARGE_FAMILLE: 114.41,
  MAX_JOUR_ISOLE: 96.81,
  MAX_JOUR_COHABITANT: 70.41,
  
  // Périodes salaire garanti employé
  SALAIRE_GARANTI_EMPLOYE_JOURS: 30,
  
  // Périodes salaire garanti ouvrier
  SALAIRE_GARANTI_OUVRIER_100_JOURS: 7,
  SALAIRE_GARANTI_OUVRIER_85_JOURS: 14,
  SALAIRE_GARANTI_OUVRIER_MIXTE_JOURS: 30,
  
  // Taux ouvrier
  TAUX_OUVRIER_SEMAINE_2: 0.8588,
  TAUX_OUVRIER_SEMAINE_3_4_EMPLOYEUR: 0.2588,
  
  // Indépendants
  INDEPENDANT_CARENCE_JOURS: 7,
  INDEPENDANT_PARTIEL_FIN: 14,
  INDEPENDANT_INDEMNITE_PARTIELLE: 38.44,
  INDEPENDANT_INDEMNITE_COMPLETE: 57.52,
  
  // Maternité
  TAUX_MATERNITE_DEBUT: 0.82,
  TAUX_MATERNITE_SUITE: 0.75,
  
  // Accident travail/maladie professionnelle
  TAUX_ACCIDENT_TRAVAIL: 0.90,
  
  // Délais
  DELAI_CERTIFICAT_HEURES: 48,
  JOURS_PAR_MOIS: 26,
  
  // Seuil invalidité
  SEUIL_INVALIDITE_JOURS: 365,
};

export type StatutTravailleur = 'salarie' | 'employe' | 'ouvrier' | 'independant' | 'chomeur';
export type SituationFamiliale = 'charge_famille' | 'isole' | 'cohabitant';
export type TypeIncapacite = 'maladie' | 'accident_prive' | 'accident_travail' | 'maladie_professionnelle' | 'maternite';

export interface CongeMaladieInput {
  statut: StatutTravailleur;
  salaireBrutMensuel: number;
  dureeIncapaciteJours: number;
  situationFamiliale: SituationFamiliale;
  typeIncapacite: TypeIncapacite;
  certificatMedicalFourni: boolean;
  cotisationsSocialesPayees: boolean;
  estEnceinte?: boolean;
  semainesAvantAccouchement?: number;
  allocationChomage?: number;
  repriseProgressive?: boolean;
  tauxReprise?: number;
}

/**
 * Create the CongeMaladie eligibility rules engine
 */
function createCongeMaladieEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Certificat médical obligatoire
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'certificatMedicalFourni',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'congeMaladie-ineligible',
      params: {
        reason: 'Certificat médical obligatoire non fourni (délai: 48h)',
        code: 'CERTIFICAT_MANQUANT',
      },
    },
    priority: 100,
  });

  // Rule 2: Indépendant - cotisations sociales obligatoires
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'statut',
          operator: 'equal',
          value: 'independant',
        },
        {
          fact: 'cotisationsSocialesPayees',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'congeMaladie-ineligible',
      params: {
        reason: 'Cotisations sociales non payées - indépendant non éligible',
        code: 'COTISATIONS_IMPAYEES',
      },
    },
    priority: 90,
  });

  // Rule 3: Salarié/Employé - Salaire garanti (jours 1-30)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'statut',
          operator: 'in',
          value: ['salarie', 'employe'],
        },
        {
          fact: 'dureeIncapaciteJours',
          operator: 'lessThanInclusive',
          value: CONGE_MALADIE_CONSTANTS.SALAIRE_GARANTI_EMPLOYE_JOURS,
        },
        {
          fact: 'certificatMedicalFourni',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'congeMaladie-eligible',
      params: {
        type: 'salaire_garanti_employe',
        message: 'Salaire garanti par employeur (100%)',
        payeur: 'employeur',
        tauxBase: 1.0,
      },
    },
    priority: 80,
  });

  // Rule 4: Ouvrier - Semaine 1 (100%)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'statut',
          operator: 'equal',
          value: 'ouvrier',
        },
        {
          fact: 'dureeIncapaciteJours',
          operator: 'lessThanInclusive',
          value: CONGE_MALADIE_CONSTANTS.SALAIRE_GARANTI_OUVRIER_100_JOURS,
        },
        {
          fact: 'certificatMedicalFourni',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'congeMaladie-eligible',
      params: {
        type: 'salaire_garanti_ouvrier_100',
        message: 'Salaire garanti ouvrier - Semaine 1 (100%)',
        payeur: 'employeur',
        tauxBase: 1.0,
      },
    },
    priority: 79,
  });

  // Rule 5: Ouvrier - Semaine 2 (85.88%)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'statut',
          operator: 'equal',
          value: 'ouvrier',
        },
        {
          fact: 'dureeIncapaciteJours',
          operator: 'greaterThan',
          value: CONGE_MALADIE_CONSTANTS.SALAIRE_GARANTI_OUVRIER_100_JOURS,
        },
        {
          fact: 'dureeIncapaciteJours',
          operator: 'lessThanInclusive',
          value: CONGE_MALADIE_CONSTANTS.SALAIRE_GARANTI_OUVRIER_85_JOURS,
        },
        {
          fact: 'certificatMedicalFourni',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'congeMaladie-eligible',
      params: {
        type: 'salaire_garanti_ouvrier_85',
        message: 'Salaire garanti ouvrier - Semaine 2 (85.88%)',
        payeur: 'employeur',
        tauxBase: CONGE_MALADIE_CONSTANTS.TAUX_OUVRIER_SEMAINE_2,
      },
    },
    priority: 78,
  });

  // Rule 6: Ouvrier - Semaines 3-4 (mixte employeur + mutuelle)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'statut',
          operator: 'equal',
          value: 'ouvrier',
        },
        {
          fact: 'dureeIncapaciteJours',
          operator: 'greaterThan',
          value: CONGE_MALADIE_CONSTANTS.SALAIRE_GARANTI_OUVRIER_85_JOURS,
        },
        {
          fact: 'dureeIncapaciteJours',
          operator: 'lessThanInclusive',
          value: CONGE_MALADIE_CONSTANTS.SALAIRE_GARANTI_OUVRIER_MIXTE_JOURS,
        },
        {
          fact: 'certificatMedicalFourni',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'congeMaladie-eligible',
      params: {
        type: 'salaire_garanti_ouvrier_mixte',
        message: 'Salaire garanti ouvrier - Semaines 3-4 (25.88% employeur + 60% mutuelle)',
        payeur: 'mixte',
        tauxEmployeur: CONGE_MALADIE_CONSTANTS.TAUX_OUVRIER_SEMAINE_3_4_EMPLOYEUR,
        tauxMutuelle: CONGE_MALADIE_CONSTANTS.TAUX_INCAPACITE_PRIMAIRE,
      },
    },
    priority: 77,
  });

  // Rule 7: Incapacité primaire (jours 31-365) - Mutuelle
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'statut',
          operator: 'in',
          value: ['salarie', 'employe', 'ouvrier'],
        },
        {
          fact: 'dureeIncapaciteJours',
          operator: 'greaterThan',
          value: CONGE_MALADIE_CONSTANTS.SALAIRE_GARANTI_EMPLOYE_JOURS,
        },
        {
          fact: 'dureeIncapaciteJours',
          operator: 'lessThanInclusive',
          value: CONGE_MALADIE_CONSTANTS.SEUIL_INVALIDITE_JOURS,
        },
        {
          fact: 'certificatMedicalFourni',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'congeMaladie-eligible',
      params: {
        type: 'incapacite_primaire',
        message: 'Incapacité primaire - Indemnités mutuelle (60% plafonné)',
        payeur: 'mutuelle',
        tauxBase: CONGE_MALADIE_CONSTANTS.TAUX_INCAPACITE_PRIMAIRE,
        plafond: CONGE_MALADIE_CONSTANTS.PLAFOND_INCAPACITE_PRIMAIRE,
      },
    },
    priority: 70,
  });

  // Rule 8: Invalidité (> 365 jours) - Charge de famille
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'statut',
          operator: 'in',
          value: ['salarie', 'employe', 'ouvrier'],
        },
        {
          fact: 'dureeIncapaciteJours',
          operator: 'greaterThan',
          value: CONGE_MALADIE_CONSTANTS.SEUIL_INVALIDITE_JOURS,
        },
        {
          fact: 'situationFamiliale',
          operator: 'equal',
          value: 'charge_famille',
        },
        {
          fact: 'certificatMedicalFourni',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'congeMaladie-eligible',
      params: {
        type: 'invalidite_charge_famille',
        message: 'Invalidité - Avec charge de famille (65%)',
        payeur: 'mutuelle',
        tauxBase: CONGE_MALADIE_CONSTANTS.TAUX_INVALIDITE_CHARGE_FAMILLE,
        minimum: CONGE_MALADIE_CONSTANTS.MIN_JOUR_CHARGE_FAMILLE,
        maximum: CONGE_MALADIE_CONSTANTS.MAX_JOUR_CHARGE_FAMILLE,
      },
    },
    priority: 60,
  });

  // Rule 9: Invalidité (> 365 jours) - Isolé
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'statut',
          operator: 'in',
          value: ['salarie', 'employe', 'ouvrier'],
        },
        {
          fact: 'dureeIncapaciteJours',
          operator: 'greaterThan',
          value: CONGE_MALADIE_CONSTANTS.SEUIL_INVALIDITE_JOURS,
        },
        {
          fact: 'situationFamiliale',
          operator: 'equal',
          value: 'isole',
        },
        {
          fact: 'certificatMedicalFourni',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'congeMaladie-eligible',
      params: {
        type: 'invalidite_isole',
        message: 'Invalidité - Isolé (55%)',
        payeur: 'mutuelle',
        tauxBase: CONGE_MALADIE_CONSTANTS.TAUX_INVALIDITE_ISOLE,
        minimum: CONGE_MALADIE_CONSTANTS.MIN_JOUR_ISOLE,
        maximum: CONGE_MALADIE_CONSTANTS.MAX_JOUR_ISOLE,
      },
    },
    priority: 59,
  });

  // Rule 10: Invalidité (> 365 jours) - Cohabitant
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'statut',
          operator: 'in',
          value: ['salarie', 'employe', 'ouvrier'],
        },
        {
          fact: 'dureeIncapaciteJours',
          operator: 'greaterThan',
          value: CONGE_MALADIE_CONSTANTS.SEUIL_INVALIDITE_JOURS,
        },
        {
          fact: 'situationFamiliale',
          operator: 'equal',
          value: 'cohabitant',
        },
        {
          fact: 'certificatMedicalFourni',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'congeMaladie-eligible',
      params: {
        type: 'invalidite_cohabitant',
        message: 'Invalidité - Cohabitant (40%)',
        payeur: 'mutuelle',
        tauxBase: CONGE_MALADIE_CONSTANTS.TAUX_INVALIDITE_COHABITANT,
        minimum: CONGE_MALADIE_CONSTANTS.MIN_JOUR_COHABITANT,
        maximum: CONGE_MALADIE_CONSTANTS.MAX_JOUR_COHABITANT,
      },
    },
    priority: 58,
  });

  // Rule 11: Indépendant - Période de carence (jours 1-7)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'statut',
          operator: 'equal',
          value: 'independant',
        },
        {
          fact: 'dureeIncapaciteJours',
          operator: 'lessThanInclusive',
          value: CONGE_MALADIE_CONSTANTS.INDEPENDANT_CARENCE_JOURS,
        },
        {
          fact: 'certificatMedicalFourni',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'cotisationsSocialesPayees',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'congeMaladie-eligible',
      params: {
        type: 'independant_carence',
        message: 'Indépendant - Période de carence (pas d\'indemnité)',
        payeur: 'aucun',
        indemniteJournaliere: 0,
      },
    },
    priority: 55,
  });

  // Rule 12: Indépendant - Indemnité partielle (jours 8-14)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'statut',
          operator: 'equal',
          value: 'independant',
        },
        {
          fact: 'dureeIncapaciteJours',
          operator: 'greaterThan',
          value: CONGE_MALADIE_CONSTANTS.INDEPENDANT_CARENCE_JOURS,
        },
        {
          fact: 'dureeIncapaciteJours',
          operator: 'lessThanInclusive',
          value: CONGE_MALADIE_CONSTANTS.INDEPENDANT_PARTIEL_FIN,
        },
        {
          fact: 'certificatMedicalFourni',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'cotisationsSocialesPayees',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'congeMaladie-eligible',
      params: {
        type: 'independant_partiel',
        message: 'Indépendant - Indemnité partielle',
        payeur: 'mutuelle',
        indemniteJournaliere: CONGE_MALADIE_CONSTANTS.INDEPENDANT_INDEMNITE_PARTIELLE,
      },
    },
    priority: 54,
  });

  // Rule 13: Indépendant - Indemnité complète (après jour 15)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'statut',
          operator: 'equal',
          value: 'independant',
        },
        {
          fact: 'dureeIncapaciteJours',
          operator: 'greaterThan',
          value: CONGE_MALADIE_CONSTANTS.INDEPENDANT_PARTIEL_FIN,
        },
        {
          fact: 'certificatMedicalFourni',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'cotisationsSocialesPayees',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'congeMaladie-eligible',
      params: {
        type: 'independant_complet',
        message: 'Indépendant - Indemnité complète',
        payeur: 'mutuelle',
        indemniteJournaliere: CONGE_MALADIE_CONSTANTS.INDEPENDANT_INDEMNITE_COMPLETE,
      },
    },
    priority: 53,
  });

  // Rule 14: Chômeur malade - minimum garanti
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'statut',
          operator: 'equal',
          value: 'chomeur',
        },
        {
          fact: 'certificatMedicalFourni',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'congeMaladie-eligible',
      params: {
        type: 'chomeur_malade',
        message: 'Chômeur malade - Indemnités maladie avec minimum garanti',
        payeur: 'mutuelle',
        tauxBase: CONGE_MALADIE_CONSTANTS.TAUX_INCAPACITE_PRIMAIRE,
        suspensionControleONEM: true,
      },
    },
    priority: 50,
  });

  // Rule 15: Accident du travail
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'typeIncapacite',
          operator: 'equal',
          value: 'accident_travail',
        },
        {
          fact: 'certificatMedicalFourni',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'congeMaladie-eligible',
      params: {
        type: 'accident_travail',
        message: 'Accident du travail - Couverture assurance AT (90%)',
        payeur: 'assurance_at',
        tauxBase: CONGE_MALADIE_CONSTANTS.TAUX_ACCIDENT_TRAVAIL,
        plafond: null,
      },
    },
    priority: 95,
  });

  // Rule 16: Maladie professionnelle
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'typeIncapacite',
          operator: 'equal',
          value: 'maladie_professionnelle',
        },
        {
          fact: 'certificatMedicalFourni',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'congeMaladie-eligible',
      params: {
        type: 'maladie_professionnelle',
        message: 'Maladie professionnelle - Couverture Fedris (90%)',
        payeur: 'fedris',
        tauxBase: CONGE_MALADIE_CONSTANTS.TAUX_ACCIDENT_TRAVAIL,
        plafond: null,
      },
    },
    priority: 94,
  });

  // Rule 17: Maternité
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'typeIncapacite',
          operator: 'equal',
          value: 'maternite',
        },
        {
          fact: 'estEnceinte',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'certificatMedicalFourni',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'congeMaladie-eligible',
      params: {
        type: 'conge_maternite',
        message: 'Congé de maternité - 82% puis 75% du salaire',
        payeur: 'mutuelle',
        tauxDebut: CONGE_MALADIE_CONSTANTS.TAUX_MATERNITE_DEBUT,
        tauxSuite: CONGE_MALADIE_CONSTANTS.TAUX_MATERNITE_SUITE,
        protectionLicenciement: true,
      },
    },
    priority: 85,
  });

  // Rule 18: Reprise progressive (mi-temps médical)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'repriseProgressive',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'certificatMedicalFourni',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'congeMaladie-eligible',
      params: {
        type: 'reprise_progressive',
        message: 'Reprise progressive - Cumul salaire partiel + indemnité partielle',
        payeur: 'mixte',
        autorisationMedecinConseil: true,
        reevaluationTrimestrielle: true,
      },
    },
    priority: 45,
  });

  return engine;
}

/**
 * Singleton instance of the CongeMaladie rules engine
 */
const congeMaladieEngineInstance = createCongeMaladieEngine();

/**
 * Calculate daily salary base
 */
function calculateSalaireJournalier(salaireMensuel: number): number {
  return salaireMensuel / CONGE_MALADIE_CONSTANTS.JOURS_PAR_MOIS;
}

/**
 * Calculate Congé Maladie et Indemnités d'Incapacité de Travail amount
 */
export function calculateCongeMaladieAmount(input: CongeMaladieInput): number {
  const salaireJournalier = calculateSalaireJournalier(input.salaireBrutMensuel);
  
  // Accident du travail ou maladie professionnelle
  if (input.typeIncapacite === 'accident_travail' || input.typeIncapacite === 'maladie_professionnelle') {
    return salaireJournalier * CONGE_MALADIE_CONSTANTS.TAUX_ACCIDENT_TRAVAIL;
  }
  
  // Maternité
  if (input.typeIncapacite === 'maternite' && input.estEnceinte) {
    // Simplifié: retourne le taux de début (82%)
    return salaireJournalier * CONGE_MALADIE_CONSTANTS.TAUX_MATERNITE_DEBUT;
  }
  
  // Indépendant
  if (input.statut === 'independant') {
    if (input.dureeIncapaciteJours <= CONGE_MALADIE_CONSTANTS.INDEPENDANT_CARENCE_JOURS) {
      return 0;
    } else if (input.dureeIncapaciteJours <= CONGE_MALADIE_CONSTANTS.INDEPENDANT_PARTIEL_FIN) {
      return CONGE_MALADIE_CONSTANTS.INDEPENDANT_INDEMNITE_PARTIELLE;
    } else {
      return CONGE_MALADIE_CONSTANTS.INDEPENDANT_INDEMNITE_COMPLETE;
    }
  }
  
  // Chômeur
  if (input.statut === 'chomeur') {
    const allocationJournaliere = (input.allocationChomage || 0) / CONGE_MALADIE_CONSTANTS.JOURS_PAR_MOIS;
    const indemniteCalculee = allocationJournaliere * CONGE_MALADIE_CONSTANTS.TAUX_INCAPACITE_PRIMAIRE;
    // Appliquer le minimum selon situation
    const minimum = input.situationFamiliale === 'charge_famille' 
      ? CONGE_MALADIE_CONSTANTS.MIN_JOUR_CHARGE_FAMILLE
      : input.situationFamiliale === 'isole'
        ? CONGE_MALADIE_CONSTANTS.MIN_JOUR_ISOLE
        : CONGE_MALADIE_CONSTANTS.MIN_JOUR_COHABITANT;
    return Math.max(indemniteCalculee, minimum);
  }
  
  // Salarié/Employé/Ouvrier - Période de salaire garanti
  if (input.statut === 'employe' || input.statut === 'salarie') {
    if (input.dureeIncapaciteJours <= CONGE_MALADIE_CONSTANTS.SALAIRE_GARANTI_EMPLOYE_JOURS) {
      return salaireJournalier; // 100% salaire garanti
    }
  }
  
  if (input.statut === 'ouvrier') {
    if (input.dureeIncapaciteJours <= CONGE_MALADIE_CONSTANTS.SALAIRE_GARANTI_OUVRIER_100_JOURS) {
      return salaireJournalier; // 100%
    } else if (input.dureeIncapaciteJours <= CONGE_MALADIE_CONSTANTS.SALAIRE_GARANTI_OUVRIER_85_JOURS) {
      return salaireJournalier * CONGE_MALADIE_CONSTANTS.TAUX_OUVRIER_SEMAINE_2; // 85.88%
    } else if (input.dureeIncapaciteJours <= CONGE_MALADIE_CONSTANTS.SALAIRE_GARANTI_OUVRIER_MIXTE_JOURS) {
      // Mixte: 25.88% employeur + 60% mutuelle
      const partEmployeur = salaireJournalier * CONGE_MALADIE_