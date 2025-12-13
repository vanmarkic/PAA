/**
 * Business Rules for Congé de Maternité
 *
 * Implements the Gherkin specifications from features/benefits/conge-maternite.feature
 * Using json-rules-engine for runtime evaluation.
 *
 * BASE JURIDIQUE:
 * - Loi du 16 mars 1971 sur le travail (articles 39 et suivants)
 * - Arrêté royal du 3 juillet 1996 portant exécution de la loi relative à l'assurance obligatoire soins de santé et indemnités
 * - Loi relative à l'assurance obligatoire soins de santé et indemnités, coordonnée le 14 juillet 1994
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';

/**
 * CongeMaternite Rules Version Metadata
 * This version MUST match the specification version in features/benefits/conge-maternite.feature
 */
export const CONGE_MATERNITE_RULES_METADATA = {
  implementsSpecification: '0.0.0',
  implementationVersion: '0.0.0',
  implementationStatus: 'complete' as const,
  lastSyncedWith: 'features/benefits/conge-maternite.feature',
  generatedFrom: 'features/benefits/conge-maternite.feature@0.0.0',
  divergences: [] as string[],
  effectiveDate: '2024-01-01',
};

// Constants from Belgian social law
export const CONGE_MATERNITE_CONSTANTS = {
  // Durées standard
  DUREE_PRENATALE_STANDARD: 6, // semaines
  DUREE_POSTNATALE_STANDARD: 9, // semaines
  DUREE_TOTALE_STANDARD: 15, // semaines
  
  // Durées grossesse multiple
  DUREE_PRENATALE_MULTIPLE: 8, // semaines
  DUREE_POSTNATALE_MULTIPLE_MIN: 9, // semaines
  DUREE_POSTNATALE_MULTIPLE_MAX: 11, // semaines
  DUREE_TOTALE_MULTIPLE_MIN: 17, // semaines
  DUREE_TOTALE_MULTIPLE_MAX: 19, // semaines
  
  // Durée travailleuses indépendantes
  DUREE_INDEPENDANTE: 12, // semaines
  
  // Repos obligatoire
  REPOS_PRENATAL_OBLIGATOIRE: 1, // semaine
  REPOS_REPORTABLE_MAX: 5, // semaines
  
  // Taux d'indemnisation
  TAUX_30_PREMIERS_JOURS: 0.82, // 82%
  TAUX_APRES_30_JOURS: 0.75, // 75%
  PLAFOND_JOURNALIER: 120, // €/jour approximatif
  
  // Seuils
  JOURS_PREMIER_TAUX: 30,
  DUREE_COTISATION_MIN_MOIS: 6,
  
  // Hospitalisation nouveau-né
  HOSPITALISATION_SEUIL_JOURS: 7,
  PROLONGATION_HOSPITALISATION_MAX_SEMAINES: 24,
  
  // Allaitement
  PAUSE_ALLAITEMENT_MINUTES: 30,
  TRANCHE_HEURES_ALLAITEMENT: 4,
  AGE_MAX_ALLAITEMENT_MOIS: 9,
  
  // Protection
  PROTECTION_APRES_CONGE_MOIS: 1,
};

export const TAUX_INDEMNISATION_2024 = {
  PREMIERS_30_JOURS: {
    taux: 0.82,
    plafond: null, // Pas de plafond
  },
  APRES_30_JOURS: {
    taux: 0.75,
    plafond: 120, // €/jour approximatif
  },
};

export type StatutProfessionnel = 'employee' | 'independante' | 'chomeuse' | 'incapacite';
export type TypeGrossesse = 'simple' | 'multiple';

export interface CongeMaterniteUser {
  enceinte: boolean;
  moisGrossesse?: number;
  statutProfessionnel: StatutProfessionnel;
  dureeEmploi?: number; // en mois
  salaireBrutMensuel?: number;
  revenusAnnuels?: number;
  cotisationSecuriteSociale: boolean;
  dureeCotisation?: number; // en mois
  typeGrossesse: TypeGrossesse;
  tempsPartiel?: boolean;
  heuresSemaine?: number;
  accouchementPremature?: boolean;
  semainesPrenatalesPrises?: number;
  hospitalisationBebe?: boolean;
  dureeHospitalisation?: number; // en jours
  decesBebe?: boolean;
  incapaciteLieeGrossesse?: boolean;
  accordMedecin?: boolean;
  souhaiteTravaillerJusquAccouchement?: boolean;
  allaitement?: boolean;
  employeurInforme?: boolean;
}

export interface CongeMaterniteResult extends EligibilityCheck {
  dureeTotaleSemaines?: number;
  dureePrenatale?: number;
  dureePostnatale?: number;
  indemniteJournaliere30Jours?: number;
  indemniteJournaliereApres30Jours?: number;
  montantMensuelEstime?: number;
  titresServicesGratuits?: boolean;
  prolongationPossible?: boolean;
  dureeProlongation?: number;
  reportPrenatalPossible?: boolean;
  semainesReportables?: number;
  pausesAllaitement?: boolean;
  protectionLicenciement?: boolean;
  droitsCPAS?: boolean;
}

/**
 * Create the CongeMaternite eligibility rules engine
 */
function createCongeMaterniteEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Non enceinte - inéligible
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'enceinte',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'accouchementPremature',
          operator: 'notEqual',
          value: true,
        },
      ],
    },
    event: {
      type: 'congeMaternite-ineligible',
      params: {
        reason: 'doit être enceinte ou avoir accouché récemment',
      },
    },
    priority: 100,
  });

  // Rule 2: Cotisations insuffisantes
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'cotisationSecuriteSociale',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'statutProfessionnel',
          operator: 'notEqual',
          value: 'chomeuse',
        },
      ],
    },
    event: {
      type: 'congeMaternite-cotisations-insuffisantes',
      params: {
        reason: 'cotisations à la sécurité sociale insuffisantes',
        droitReposNonPaye: true,
        verifierCPAS: true,
      },
    },
    priority: 90,
  });

  // Rule 3: Durée de cotisation insuffisante
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'dureeCotisation',
          operator: 'lessThan',
          value: CONGE_MATERNITE_CONSTANTS.DUREE_COTISATION_MIN_MOIS,
        },
        {
          fact: 'cotisationSecuriteSociale',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'congeMaternite-cotisations-insuffisantes',
      params: {
        reason: 'durée de cotisation insuffisante (minimum 6 mois requis)',
        droitReposNonPaye: true,
        verifierCPAS: true,
      },
    },
    priority: 85,
  });

  // Rule 4: Employée éligible - grossesse simple
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'enceinte',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'statutProfessionnel',
          operator: 'equal',
          value: 'employee',
        },
        {
          fact: 'cotisationSecuriteSociale',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'typeGrossesse',
          operator: 'equal',
          value: 'simple',
        },
      ],
    },
    event: {
      type: 'congeMaternite-eligible',
      params: {
        message: 'Éligible pour Congé de Maternité - Employée',
        dureeTotaleSemaines: CONGE_MATERNITE_CONSTANTS.DUREE_TOTALE_STANDARD,
        dureePrenatale: CONGE_MATERNITE_CONSTANTS.DUREE_PRENATALE_STANDARD,
        dureePostnatale: CONGE_MATERNITE_CONSTANTS.DUREE_POSTNATALE_STANDARD,
        typeIndemnite: 'salaire',
      },
    },
    priority: 50,
  });

  // Rule 5: Employée éligible - grossesse multiple
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'enceinte',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'statutProfessionnel',
          operator: 'equal',
          value: 'employee',
        },
        {
          fact: 'cotisationSecuriteSociale',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'typeGrossesse',
          operator: 'equal',
          value: 'multiple',
        },
      ],
    },
    event: {
      type: 'congeMaternite-eligible-multiple',
      params: {
        message: 'Éligible pour Congé de Maternité - Grossesse Multiple',
        dureeTotaleSemainesMin: CONGE_MATERNITE_CONSTANTS.DUREE_TOTALE_MULTIPLE_MIN,
        dureeTotaleSemainesMax: CONGE_MATERNITE_CONSTANTS.DUREE_TOTALE_MULTIPLE_MAX,
        dureePrenatale: CONGE_MATERNITE_CONSTANTS.DUREE_PRENATALE_MULTIPLE,
        dureePostnataleMin: CONGE_MATERNITE_CONSTANTS.DUREE_POSTNATALE_MULTIPLE_MIN,
        dureePostnataleMax: CONGE_MATERNITE_CONSTANTS.DUREE_POSTNATALE_MULTIPLE_MAX,
        typeIndemnite: 'salaire',
      },
    },
    priority: 55,
  });

  // Rule 6: Travailleuse indépendante éligible
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'enceinte',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'statutProfessionnel',
          operator: 'equal',
          value: 'independante',
        },
        {
          fact: 'dureeCotisation',
          operator: 'greaterThanInclusive',
          value: CONGE_MATERNITE_CONSTANTS.DUREE_COTISATION_MIN_MOIS,
        },
      ],
    },
    event: {
      type: 'congeMaternite-eligible-independante',
      params: {
        message: 'Éligible pour Congé de Maternité - Indépendante',
        dureeTotaleSemaines: CONGE_MATERNITE_CONSTANTS.DUREE_INDEPENDANTE,
        typeIndemnite: 'forfaitaire',
        titresServicesGratuits: true,
      },
    },
    priority: 50,
  });

  // Rule 7: Chômeuse éligible
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'enceinte',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'statutProfessionnel',
          operator: 'equal',
          value: 'chomeuse',
        },
      ],
    },
    event: {
      type: 'congeMaternite-eligible-chomeuse',
      params: {
        message: 'Éligible pour Congé de Maternité - Chômeuse',
        dureeTotaleSemaines: CONGE_MATERNITE_CONSTANTS.DUREE_TOTALE_STANDARD,
        typeIndemnite: 'conversion-chomage',
        conservationDroitsChomage: true,
      },
    },
    priority: 50,
  });

  // Rule 8: Report du repos prénatal
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'souhaiteTravaillerJusquAccouchement',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'accordMedecin',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'statutProfessionnel',
          operator: 'equal',
          value: 'employee',
        },
      ],
    },
    event: {
      type: 'congeMaternite-report-prenatal',
      params: {
        message: 'Report du repos prénatal autorisé',
        semainesReportables: CONGE_MATERNITE_CONSTANTS.REPOS_REPORTABLE_MAX,
        reposPrenatalObligatoire: CONGE_MATERNITE_CONSTANTS.REPOS_PRENATAL_OBLIGATOIRE,
      },
    },
    priority: 40,
  });

  // Rule 9: Accouchement prématuré
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'accouchementPremature',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'congeMaternite-premature',
      params: {
        message: 'Accouchement prématuré - semaines prénatales non prises sont perdues',
        dureePostnataleMinimum: CONGE_MATERNITE_CONSTANTS.DUREE_POSTNATALE_STANDARD,
        prolongationPossibleSiHospitalisation: true,
      },
    },
    priority: 45,
  });

  // Rule 10: Hospitalisation prolongée du nouveau-né
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hospitalisationBebe',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'dureeHospitalisation',
          operator: 'greaterThan',
          value: CONGE_MATERNITE_CONSTANTS.HOSPITALISATION_SEUIL_JOURS,
        },
      ],
    },
    event: {
      type: 'congeMaternite-prolongation-hospitalisation',
      params: {
        message: 'Prolongation possible pour hospitalisation du nouveau-né',
        prolongationMaxSemaines: CONGE_MATERNITE_CONSTANTS.PROLONGATION_HOSPITALISATION_MAX_SEMAINES,
      },
    },
    priority: 35,
  });

  // Rule 11: Décès du nouveau-né
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'decesBebe',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'congeMaternite-deces-bebe',
      params: {
        message: 'Droit au congé de maternité complet maintenu',
        indemnitesMaintenues: true,
        accompagnementPsychologique: true,
      },
    },
    priority: 30,
  });

  // Rule 12: Incapacité de travail liée à la grossesse
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'statutProfessionnel',
          operator: 'equal',
          value: 'incapacite',
        },
        {
          fact: 'incapaciteLieeGrossesse',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'enceinte',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'congeMaternite-transition-incapacite',
      params: {
        message: 'Passage automatique en congé de maternité',
        tauxPlusAvantageux: true,
      },
    },
    priority: 48,
  });

  // Rule 13: Allaitement après congé
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'allaitement',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'congeMaternite-allaitement',
      params: {
        message: 'Droit aux pauses d\'allaitement',
        pauseMinutes: CONGE_MATERNITE_CONSTANTS.PAUSE_ALLAITEMENT_MINUTES,
        parTrancheHeures: CONGE_MATERNITE_CONSTANTS.TRANCHE_HEURES_ALLAITEMENT,
        jusquAuxMoisEnfant: CONGE_MATERNITE_CONSTANTS.AGE_MAX_ALLAITEMENT_MOIS,
        certificatMedicalMensuel: true,
      },
    },
    priority: 20,
  });

  // Rule 14: Protection contre le licenciement
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'enceinte',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'employeurInforme',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'statutProfessionnel',
          operator: 'equal',
          value: 'employee',
        },
      ],
    },
    event: {
      type: 'congeMaternite-protection',
      params: {
        message: 'Protection contre le licenciement active',
        debutProtection: 'annonce grossesse',
        finProtection: '1 mois après fin congé maternité',
        exceptionMotifGrave: true,
      },
    },
    priority: 25,
  });

  return engine;
}

/**
 * Singleton instance of the CongeMaternite rules engine
 */
const congeMaterniteEngineInstance = createCongeMaterniteEngine();

/**
 * Calculate daily indemnity based on gross salary and day of leave
 */
export function calculateIndemniteJournaliere(
  salaireBrutMensuel: number,
  jourConge: number
): number {
  // Calcul du salaire journalier (mois = 30 jours en moyenne)
  const salaireJournalier = salaireBrutMensuel / 30;
  
  if (jourConge <= CONGE_MATERNITE_CONSTANTS.JOURS_PREMIER_TAUX) {
    // 82% sans plafond pour les 30 premiers jours
    return Math.round(salaireJournalier * CONGE_MATERNITE_CONSTANTS.TAUX_30_PREMIERS_JOURS * 100) / 100;
  } else {
    // 75% avec plafond après 30 jours
    const indemnite = salaireJournalier * CONGE_MATERNITE_CONSTANTS.TAUX_APRES_30_JOURS;
    return Math.round(Math.min(indemnite, CONGE_MATERNITE_CONSTANTS.PLAFOND_JOURNALIER) * 100) / 100;
  }
}

/**
 * Calculate Congé de Maternité amount
 */
export function calculateCongeMaterniteAmount(
  salaireBrutMensuel: number,
  dureeTotaleSemaines: number = CONGE_MATERNITE_CONSTANTS.DUREE_TOTALE_STANDARD,
  statutProfessionnel: StatutProfessionnel = 'employee'
): {
  indemnite30Jours: number;
  indemniteApres30Jours: number;
  montantTotal: number;
  montantMensuelMoyen: number;
} {
  if (statutProfessionnel === 'independante') {
    // Forfait pour indépendantes (montant approximatif 2024)
    const forfaitHebdomadaire = 504.86; // Montant forfaitaire approximatif
    const montantTotal = forfaitHebdomadaire * dureeTotaleSemaines;
    return {
      indemnite30Jours: forfaitHebdomadaire / 7,
      indemniteApres30Jours: forfaitHebdomadaire / 7,
      montantTotal,
      montantMensuelMoyen: montantTotal / (dureeTotaleSemaines / 4.33),
    };
  }

  const indemnite30Jours = calculateIndemniteJournaliere(salaireBrutMensuel, 1);
  const indemniteApres30Jours = calculateIndemniteJournaliere(salaireBrutMensuel, 31);
  
  const joursTotal = dureeTotaleSemaines * 7;
  const jours30Premiers = Math.min(30, joursTotal);
  const joursRestants = Math.max(0, joursTotal - 30);
  
  const montantTotal = (jours30Premiers * indemnite30Jours) + (joursRestants * indemniteApres30Jours);
  const montantMensuelMoyen = montantTotal / (dureeTotaleSemaines / 4.33);

  return {
    indemnite30Jours,
    indemniteApres30Jours,
    montantTotal: Math.round(montantTotal * 100) / 100,
    montantMensuelMoyen: Math.round(montantMensuelMoyen * 100) / 100,
  };
}

/**
 * Calculate prolongation for baby hospitalization
 */
export function calculateProlongationHospitalisation(
  dureeHospitalisationJours: number
): number {
  if (dureeHospitalisationJours <= CONGE_MATERNITE_CONSTANTS.HOSPITALISATION_SEUIL_JOURS) {
    return 0;
  }
  
  const joursSupplementaires = dureeHospitalisationJours - CONGE_MATERNITE_CONSTANTS.HOSPITALISATION_SEUIL_JOURS;
  const semainesSupplementaires = Math.ceil(joursSupplementaires / 7);
  
  return Math.min(semainesSupplementaires, CONGE_MATERNITE_CONSTANTS.PROLONGATION_HOSPITALISATION_MAX_SEMAINES);
}

/**
 * Check Congé de Maternité eligibility
 */
export async function checkCongeMaterniteEligibility(
  user: CongeMaterniteUser
): Promise<CongeMaterniteResult> {
  const facts = {
    enceinte: user.enceinte,
    moisGrossesse: user.moisGrossesse || 0,
    statutProfessionnel: user.statutProfessionnel,
    dureeEmploi: user.dureeEmploi || 0,
    salaireBrutMensuel: user.salaireBrutMensuel || 0,
    revenusAnnuels: user.revenusAnnuels || 0,
    cotisationSecuriteSociale: user.cotisationSecuriteSociale,
    dureeCotisation: user.dureeCotisation || 0,
    typeGrossesse: user.typeGrossesse,
    tempsPartiel: user.tempsPartiel || false,
    heuresSemaine: user.heuresSemaine || 38,
    accouchementPremature: user.accouchementPremature || false,
    semainesPrenatalesPrises: user.semainesPrenatalesPrises || 0,
    hospitalisationBebe: user.hospitalisationBebe || false,
    dureeHospitalisation: user.dureeHospitalisation || 0,
    decesBebe: user.decesBebe || false,
    incapaciteLieeGrossesse: user.incapaciteLieeGrossesse || false,
    accordMedecin: user.accordMedecin || false,
    souhaiteTravaillerJusquAccouchement: user.souhaiteTravaillerJusquAccouchement || false,
    allaitement: user.allaitement || false,
    employeurInforme: user.employeurInforme || false,
  };

  try {
    const results = await congeMaterniteEngineInstance.run(facts);

    // Check for ineligibility first
    const ineligibleEvent = results.events.find((e) => e.type === 'congeMaternite-ineligible');
    if (ineligibleEvent) {
      return {
        benefitType: 'conge-maternite' as any,
        isEligible: false,
        reason: ineligibleEvent.params?.reason as string,
      };
    }

    // Check for insufficient contributions
    const cotisationsEvent = results.events.find((e) => e.type === 'congeMaternite-cotisations-insuffisantes');
    if (cotisationsEvent) {
      return {
        benefitType: 'conge-maternite' as any,
        isEligible: false,
        reason: cotisationsEvent.params?.reason as string,
        droitsCPAS: cotisationsEvent.params?.verifierCPAS as boolean,
      };
    }

    // Check for eligible events
    const eligibleEvent = results.events.find((e) => 
      e.type === 'congeMaternite-eligible' ||
      e.type === 'congeMaternite-eligible-multiple' ||
      e.type === 'congeMaternite-eligible-independante' ||
      e.type === 'congeMaternite-eligible-chomeuse'
    );

    if (eligibleEvent) {
      const params = eligibleEvent.params || {};
      let dureeTotale = params.dureeTotaleSemaines as number || CONGE_MATERNITE_CONSTANTS.DUREE_TOTALE_STANDARD;
      let dureePrenatale = params.dureePrenatale as number || CONGE_MATERNITE_CONSTANTS.DUREE_PRENATALE_STANDARD;
      let dureePostnatale = params.dureePostnatale as number || CONGE_MATERNITE_CONSTANTS.DUREE_POSTNATALE_STANDARD;

      // Handle multiple pregnancy
      if (eligibleEvent.type === 'congeMaternite-eligible-multiple') {
        dureeTotale = params.dureeTotaleSemainesMin as number || CONGE_MATERNITE_CONSTANTS.DUREE_TOTALE_MULTIPLE_MIN;
        dureePrenatale = params.dureePrenatale as number || CONGE_MATERNITE_CONSTANTS.DUREE_PRENATALE_MULTIPLE;
        dureePostnatale = params.dureePostnataleMin as number || CONGE_MATERNITE_CONSTANTS.DUREE_POSTNATALE_MULTIPLE_MIN;
      }

      // Calculate amounts
      const salaire = user.salaireBrutMensuel || 0;
      const amounts = calculateCongeMaterniteAmount(salaire, dureeTotale, user.statutProfessionnel);

      // Check for report event
      const reportEvent = results.events.find((e) => e.type === 'congeMaternite-report-prenatal');
      
      // Check for hospitalization prolongation
      const hospitalisationEvent = results.events.find((e) => e.type === 'congeMaternite-prolongation-hospitalisation');
      let prolongation = 0;
      if (hospitalisationEvent && user.dureeHospitalisation) {
        prolongation = calculateProlongationHospitalisation(user.dureeHospitalisation);
      }

      // Check for protection
      const protectionEvent = results.events.find((e) => e.type === 'congeMaternite-protection');

      // Check for allaitement
      const allaitementEvent = results.events.find((e) => e.type === 'congeMaternite-allaitement');

      const result: CongeMaterniteResult = {
        benefitType: 'conge-maternite' as any,
        isEligible: true,
        calculatedAmount: amounts.montantTotal,
        dureeTotaleSemaines: dureeTotale + prolongation,
        dureePrenatale,
        dureePostnatale: dureePostnatale + prolongation,
        indemniteJournaliere30Jours: amounts.indemnite30Jours,
        indemniteJournaliereApres30Jours: amounts.indemniteApres30Jours,
        montantMensuelEstime: amounts.montantMensuelMoyen,
        titresServicesGratuits: params.titresServicesGratuits as boolean || false,
        prolongationPossible: hospitalisationEvent !== undefined,
        dureeProlongation: prolongation,
        reportPrenatalPossible: reportEvent !== undefined,
        semainesReportables: reportEvent?.params?.semainesReportables as number,
        pausesAllaitement: allaitementEvent !== undefined,
        protectionLicenciement: protectionEvent !== undefined,
      };

      return result;
    }

    return {
      benefitType: 'conge-maternite' as any,
      isEligible: false,
      reason: 'conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Error checking Congé de Maternité eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const CONGE_MATERNITE_RULES_JSON = {
  legalFramework: {
    primaryLaw: 'Loi du 16 mars 1971 sur le travail',
    articles: 'Articles 39 et suivants',
    executionDecree: 'Arrêté royal du 3 juillet 1996',
    coordinatedLaw: 'Loi relative à l\'assurance obligatoire soins de santé et indemnités du 14 juillet 1994',
    effectiveDate: '2024-01-01',
  },
  durations: {
    standard: {
      prenatal: '6 semaines',
      postnatal: '9 semaines',
      total: '15 semaines',
    },
    multiplePregnancy: {