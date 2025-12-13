/**
 * Business Rules for Soins de Santé Mentale
 *
 * Implements the Gherkin specifications from features/benefits/soins-sante-mentale.feature
 * Using json-rules-engine for runtime evaluation.
 *
 * BASE JURIDIQUE:
 * - Arrêté royal du 18 juillet 2022 relatif aux soins psychologiques de première ligne
 * - Convention nationale INAMI - Psychologues cliniciens 2024
 * - Loi coordonnée du 14 juillet 1994 relative à l'assurance obligatoire soins de santé
 * - Arrêté royal du 23 mars 1982 portant fixation de l'intervention personnelle
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';

/**
 * SoinsSanteMentale Rules Version Metadata
 * This version MUST match the specification version in features/benefits/soins-sante-mentale.feature
 */
export const SOINS_SANTE_MENTALE_RULES_METADATA = {
  implementsSpecification: '0.0.0',
  implementationVersion: '0.0.0',
  implementationStatus: 'complete' as const,
  lastSyncedWith: 'features/benefits/soins-sante-mentale.feature',
  generatedFrom: 'features/benefits/soins-sante-mentale.feature@0.0.0',
  divergences: [] as string[],
  effectiveDate: '2024-01-01',
};

// Constants from Belgian social law - INAMI 2024 rates
export const SOINS_SANTE_MENTALE_CONSTANTS = {
  AGE_JEUNE_MAX: 23,
  AGE_ENFANT_MAX: 18,
  
  // Tarifs INAMI séances individuelles
  TARIF_SEANCE_INDIVIDUELLE_ADULTE: 60,
  TARIF_SEANCE_INDIVIDUELLE_ENFANT: 60,
  TARIF_PSYCHIATRE_CONVENTIONNE: 79.54,
  
  // Quote-parts patients - séances individuelles adultes
  QUOTE_PART_ORDINAIRE: 11,
  QUOTE_PART_BIM: 4,
  
  // Quote-parts patients - séances de groupe
  QUOTE_PART_GROUPE: 2.50,
  
  // Quote-parts patients - psychiatre
  QUOTE_PART_PSYCHIATRE_ORDINAIRE: 19.89,
  QUOTE_PART_PSYCHIATRE_BIM: 7.96,
  
  // Nombre de séances
  SEANCES_SERIE_1: 8,
  SEANCES_SERIE_2: 8,
  SEANCES_PAR_AN_ADULTE: 8,
  SEANCES_PAR_AN_JEUNE: 10,
  
  // Hospitalisation psychiatrique - intervention personnelle par jour
  HOSPI_JOURS_1_5_ORDINAIRE: 44.51,
  HOSPI_JOURS_1_5_BIM: 6.32,
  HOSPI_JOURS_6_365_ORDINAIRE: 17.02,
  HOSPI_JOURS_6_365_BIM: 6.32,
  HOSPI_APRES_1_AN: 6.32,
  
  // Remboursements mutuelles complémentaires
  MUTUELLES: {
    MUTUALITE_CHRETIENNE: { montantAnnuel: 360, parSeance: 20, maxSeances: 18 },
    SOLIDARIS: { montantAnnuel: 400, parSeance: 20, maxSeances: 20 },
    PARTENAMUT: { montantAnnuel: 400, parSeance: 20, maxSeances: 20 },
    MUTUALITE_NEUTRE: { montantAnnuel: 180, parSeance: 15, maxSeances: 12 },
  },
};

export type TypeSoin = 'premiere_seance' | 'seance_individuelle' | 'seance_groupe' | 'psychiatre' | 'hospitalisation';
export type StatutPatient = 'ordinaire' | 'BIM';
export type TypeMutuelle = 'MUTUALITE_CHRETIENNE' | 'SOLIDARIS' | 'PARTENAMUT' | 'MUTUALITE_NEUTRE';

export interface SoinsSanteMentaleInput {
  age: number;
  statut: StatutPatient;
  numeroSeance: number;
  typeSoin: TypeSoin;
  mutuelle?: TypeMutuelle;
  estEnCrise?: boolean;
  joursHospitalisation?: number;
  aProblemeAddiction?: boolean;
}

export interface SoinsSanteMentaleResult {
  coutPatient: number;
  remboursementINAMI: number;
  remboursementMutuelle: number;
  coutFinal: number;
  seancesRestantes?: number;
  gratuit: boolean;
  message: string;
}

/**
 * Create the SoinsSanteMentale eligibility rules engine
 */
function createSoinsSanteMentaleEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Première séance gratuite pour tous (bilan)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'numeroSeance',
          operator: 'equal',
          value: 1,
        },
        {
          fact: 'typeSoin',
          operator: 'in',
          value: ['premiere_seance', 'seance_individuelle'],
        },
      ],
    },
    event: {
      type: 'soinsSanteMentale-premiere-seance-gratuite',
      params: {
        message: 'Première séance gratuite (bilan)',
        coutPatient: 0,
        gratuit: true,
      },
    },
    priority: 100,
  });

  // Rule 2: Enfants et jeunes < 23 ans - séances gratuites
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'lessThan',
          value: SOINS_SANTE_MENTALE_CONSTANTS.AGE_JEUNE_MAX,
        },
        {
          fact: 'typeSoin',
          operator: 'equal',
          value: 'seance_individuelle',
        },
        {
          fact: 'numeroSeance',
          operator: 'greaterThan',
          value: 1,
        },
      ],
    },
    event: {
      type: 'soinsSanteMentale-jeune-gratuit',
      params: {
        message: 'Séances gratuites pour les moins de 23 ans',
        coutPatient: 0,
        gratuit: true,
      },
    },
    priority: 90,
  });

  // Rule 3: Adulte avec statut ordinaire - séances individuelles
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: SOINS_SANTE_MENTALE_CONSTANTS.AGE_JEUNE_MAX,
        },
        {
          fact: 'statut',
          operator: 'equal',
          value: 'ordinaire',
        },
        {
          fact: 'typeSoin',
          operator: 'equal',
          value: 'seance_individuelle',
        },
        {
          fact: 'numeroSeance',
          operator: 'greaterThan',
          value: 1,
        },
      ],
    },
    event: {
      type: 'soinsSanteMentale-adulte-ordinaire',
      params: {
        message: 'Séance individuelle adulte - tarif ordinaire',
        coutPatient: SOINS_SANTE_MENTALE_CONSTANTS.QUOTE_PART_ORDINAIRE,
        gratuit: false,
      },
    },
    priority: 80,
  });

  // Rule 4: Adulte avec statut BIM - séances individuelles
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: SOINS_SANTE_MENTALE_CONSTANTS.AGE_JEUNE_MAX,
        },
        {
          fact: 'statut',
          operator: 'equal',
          value: 'BIM',
        },
        {
          fact: 'typeSoin',
          operator: 'equal',
          value: 'seance_individuelle',
        },
        {
          fact: 'numeroSeance',
          operator: 'greaterThan',
          value: 1,
        },
      ],
    },
    event: {
      type: 'soinsSanteMentale-adulte-bim',
      params: {
        message: 'Séance individuelle adulte - tarif BIM',
        coutPatient: SOINS_SANTE_MENTALE_CONSTANTS.QUOTE_PART_BIM,
        gratuit: false,
      },
    },
    priority: 80,
  });

  // Rule 5: Séances de groupe - addiction et autres
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'typeSoin',
          operator: 'equal',
          value: 'seance_groupe',
        },
      ],
    },
    event: {
      type: 'soinsSanteMentale-groupe',
      params: {
        message: 'Séance de groupe - tarif unique',
        coutPatient: SOINS_SANTE_MENTALE_CONSTANTS.QUOTE_PART_GROUPE,
        gratuit: false,
      },
    },
    priority: 70,
  });

  // Rule 6: Psychiatre conventionné - statut ordinaire
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'typeSoin',
          operator: 'equal',
          value: 'psychiatre',
        },
        {
          fact: 'statut',
          operator: 'equal',
          value: 'ordinaire',
        },
      ],
    },
    event: {
      type: 'soinsSanteMentale-psychiatre-ordinaire',
      params: {
        message: 'Consultation psychiatre - tarif ordinaire',
        coutPatient: SOINS_SANTE_MENTALE_CONSTANTS.QUOTE_PART_PSYCHIATRE_ORDINAIRE,
        gratuit: false,
      },
    },
    priority: 60,
  });

  // Rule 7: Psychiatre conventionné - statut BIM
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'typeSoin',
          operator: 'equal',
          value: 'psychiatre',
        },
        {
          fact: 'statut',
          operator: 'equal',
          value: 'BIM',
        },
      ],
    },
    event: {
      type: 'soinsSanteMentale-psychiatre-bim',
      params: {
        message: 'Consultation psychiatre - tarif BIM',
        coutPatient: SOINS_SANTE_MENTALE_CONSTANTS.QUOTE_PART_PSYCHIATRE_BIM,
        gratuit: false,
      },
    },
    priority: 60,
  });

  // Rule 8: Urgence psychiatrique - admission couverte 100%
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'estEnCrise',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'typeSoin',
          operator: 'equal',
          value: 'hospitalisation',
        },
      ],
    },
    event: {
      type: 'soinsSanteMentale-urgence',
      params: {
        message: 'Urgence psychiatrique - admission couverte',
        coutPatient: 0,
        gratuit: true,
      },
    },
    priority: 100,
  });

  // Rule 9: Hospitalisation jours 1-5 - ordinaire
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'typeSoin',
          operator: 'equal',
          value: 'hospitalisation',
        },
        {
          fact: 'joursHospitalisation',
          operator: 'lessThanInclusive',
          value: 5,
        },
        {
          fact: 'statut',
          operator: 'equal',
          value: 'ordinaire',
        },
        {
          fact: 'estEnCrise',
          operator: 'notEqual',
          value: true,
        },
      ],
    },
    event: {
      type: 'soinsSanteMentale-hospi-debut-ordinaire',
      params: {
        message: 'Hospitalisation jours 1-5 - tarif ordinaire',
        coutPatientParJour: SOINS_SANTE_MENTALE_CONSTANTS.HOSPI_JOURS_1_5_ORDINAIRE,
        gratuit: false,
      },
    },
    priority: 50,
  });

  // Rule 10: Hospitalisation jours 1-5 - BIM
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'typeSoin',
          operator: 'equal',
          value: 'hospitalisation',
        },
        {
          fact: 'joursHospitalisation',
          operator: 'lessThanInclusive',
          value: 5,
        },
        {
          fact: 'statut',
          operator: 'equal',
          value: 'BIM',
        },
        {
          fact: 'estEnCrise',
          operator: 'notEqual',
          value: true,
        },
      ],
    },
    event: {
      type: 'soinsSanteMentale-hospi-debut-bim',
      params: {
        message: 'Hospitalisation jours 1-5 - tarif BIM',
        coutPatientParJour: SOINS_SANTE_MENTALE_CONSTANTS.HOSPI_JOURS_1_5_BIM,
        gratuit: false,
      },
    },
    priority: 50,
  });

  // Rule 11: Éligibilité générale aux soins de santé mentale
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: 0,
        },
      ],
    },
    event: {
      type: 'soinsSanteMentale-eligible',
      params: {
        message: 'Éligible aux soins de santé mentale remboursés',
      },
    },
    priority: 1,
  });

  return engine;
}

/**
 * Singleton instance of the SoinsSanteMentale rules engine
 */
const soinsSanteMentaleEngineInstance = createSoinsSanteMentaleEngine();

/**
 * Calculate patient cost for mental health care
 */
export function calculateCoutPatient(
  age: number,
  statut: StatutPatient,
  numeroSeance: number,
  typeSoin: TypeSoin
): number {
  // Première séance toujours gratuite
  if (numeroSeance === 1 && (typeSoin === 'premiere_seance' || typeSoin === 'seance_individuelle')) {
    return 0;
  }

  // Jeunes < 23 ans - gratuit
  if (age < SOINS_SANTE_MENTALE_CONSTANTS.AGE_JEUNE_MAX && typeSoin === 'seance_individuelle') {
    return 0;
  }

  // Séances de groupe
  if (typeSoin === 'seance_groupe') {
    return SOINS_SANTE_MENTALE_CONSTANTS.QUOTE_PART_GROUPE;
  }

  // Psychiatre
  if (typeSoin === 'psychiatre') {
    return statut === 'BIM'
      ? SOINS_SANTE_MENTALE_CONSTANTS.QUOTE_PART_PSYCHIATRE_BIM
      : SOINS_SANTE_MENTALE_CONSTANTS.QUOTE_PART_PSYCHIATRE_ORDINAIRE;
  }

  // Séances individuelles adultes
  if (typeSoin === 'seance_individuelle' && age >= SOINS_SANTE_MENTALE_CONSTANTS.AGE_JEUNE_MAX) {
    return statut === 'BIM'
      ? SOINS_SANTE_MENTALE_CONSTANTS.QUOTE_PART_BIM
      : SOINS_SANTE_MENTALE_CONSTANTS.QUOTE_PART_ORDINAIRE;
  }

  return 0;
}

/**
 * Calculate mutual insurance reimbursement
 */
export function calculateRemboursementMutuelle(
  coutPatient: number,
  mutuelle?: TypeMutuelle,
  numeroSeance?: number
): number {
  if (!mutuelle || coutPatient === 0) {
    return 0;
  }

  const configMutuelle = SOINS_SANTE_MENTALE_CONSTANTS.MUTUELLES[mutuelle];
  if (!configMutuelle) {
    return 0;
  }

  // Vérifier si on est dans la limite des séances
  if (numeroSeance && numeroSeance > configMutuelle.maxSeances) {
    return 0;
  }

  // Rembourser le minimum entre le coût patient et le montant par séance
  return Math.min(coutPatient, configMutuelle.parSeance);
}

/**
 * Calculate hospitalization cost
 */
export function calculateCoutHospitalisation(
  joursHospitalisation: number,
  statut: StatutPatient
): number {
  let coutTotal = 0;

  for (let jour = 1; jour <= joursHospitalisation; jour++) {
    if (jour <= 5) {
      coutTotal += statut === 'BIM'
        ? SOINS_SANTE_MENTALE_CONSTANTS.HOSPI_JOURS_1_5_BIM
        : SOINS_SANTE_MENTALE_CONSTANTS.HOSPI_JOURS_1_5_ORDINAIRE;
    } else if (jour <= 365) {
      coutTotal += statut === 'BIM'
        ? SOINS_SANTE_MENTALE_CONSTANTS.HOSPI_JOURS_6_365_BIM
        : SOINS_SANTE_MENTALE_CONSTANTS.HOSPI_JOURS_6_365_ORDINAIRE;
    } else {
      coutTotal += SOINS_SANTE_MENTALE_CONSTANTS.HOSPI_APRES_1_AN;
    }
  }

  return Math.round(coutTotal * 100) / 100;
}

/**
 * Calculate Soins de Santé Mentale amount and reimbursement
 */
export function calculateSoinsSanteMentaleAmount(
  input: SoinsSanteMentaleInput
): SoinsSanteMentaleResult {
  const { age, statut, numeroSeance, typeSoin, mutuelle, estEnCrise, joursHospitalisation } = input;

  // Urgence psychiatrique - admission 100% couverte
  if (estEnCrise && typeSoin === 'hospitalisation') {
    return {
      coutPatient: 0,
      remboursementINAMI: SOINS_SANTE_MENTALE_CONSTANTS.TARIF_SEANCE_INDIVIDUELLE_ADULTE,
      remboursementMutuelle: 0,
      coutFinal: 0,
      gratuit: true,
      message: 'Urgence psychiatrique - admission couverte à 100%',
    };
  }

  // Hospitalisation non-urgente
  if (typeSoin === 'hospitalisation' && joursHospitalisation) {
    const coutPatient = calculateCoutHospitalisation(joursHospitalisation, statut);
    return {
      coutPatient,
      remboursementINAMI: 0, // Variable selon durée
      remboursementMutuelle: 0,
      coutFinal: coutPatient,
      gratuit: false,
      message: `Hospitalisation ${joursHospitalisation} jours - intervention personnelle`,
    };
  }

  // Calcul du coût patient
  const coutPatient = calculateCoutPatient(age, statut, numeroSeance, typeSoin);
  
  // Calcul remboursement INAMI
  let tarifTotal = 0;
  if (typeSoin === 'seance_individuelle') {
    tarifTotal = SOINS_SANTE_MENTALE_CONSTANTS.TARIF_SEANCE_INDIVIDUELLE_ADULTE;
  } else if (typeSoin === 'psychiatre') {
    tarifTotal = SOINS_SANTE_MENTALE_CONSTANTS.TARIF_PSYCHIATRE_CONVENTIONNE;
  }
  const remboursementINAMI = tarifTotal - coutPatient;

  // Calcul remboursement mutuelle
  const remboursementMutuelle = calculateRemboursementMutuelle(coutPatient, mutuelle, numeroSeance);

  // Coût final après remboursement mutuelle
  const coutFinal = Math.max(0, coutPatient - remboursementMutuelle);

  // Détermination du nombre de séances restantes
  let seancesRestantes: number | undefined;
  if (age < SOINS_SANTE_MENTALE_CONSTANTS.AGE_JEUNE_MAX) {
    seancesRestantes = undefined; // Pas de limite pour les jeunes
  } else {
    const seancesUtilisees = numeroSeance - 1; // La première est gratuite
    const seancesMaxSerie1 = SOINS_SANTE_MENTALE_CONSTANTS.SEANCES_SERIE_1;
    seancesRestantes = Math.max(0, seancesMaxSerie1 - seancesUtilisees);
  }

  // Message
  let message = '';
  if (coutPatient === 0) {
    if (numeroSeance === 1) {
      message = 'Première séance gratuite (bilan)';
    } else if (age < SOINS_SANTE_MENTALE_CONSTANTS.AGE_JEUNE_MAX) {
      message = `Séances gratuites pour les moins de ${SOINS_SANTE_MENTALE_CONSTANTS.AGE_JEUNE_MAX} ans`;
    }
  } else {
    message = `Quote-part patient: ${coutPatient}€` + 
      (remboursementMutuelle > 0 ? ` - Remboursement mutuelle: ${remboursementMutuelle}€` : '');
  }

  return {
    coutPatient,
    remboursementINAMI,
    remboursementMutuelle,
    coutFinal,
    seancesRestantes,
    gratuit: coutPatient === 0,
    message,
  };
}

/**
 * Check Soins de Santé Mentale eligibility
 */
export async function checkSoinsSanteMentaleEligibility(
  input: SoinsSanteMentaleInput
): Promise<EligibilityCheck> {
  const facts = {
    age: input.age,
    statut: input.statut,
    numeroSeance: input.numeroSeance,
    typeSoin: input.typeSoin,
    estEnCrise: input.estEnCrise || false,
    joursHospitalisation: input.joursHospitalisation || 0,
    aProblemeAddiction: input.aProblemeAddiction || false,
  };

  try {
    const results = await soinsSanteMentaleEngineInstance.run(facts);

    const ineligibleEvent = results.events.find((e) => e.type === 'soinsSanteMentale-ineligible');
    const eligibleEvent = results.events.find((e) => e.type === 'soinsSanteMentale-eligible');

    if (ineligibleEvent) {
      return {
        benefitType: 'soins-sante-mentale' as any,
        isEligible: false,
        reason: ineligibleEvent.params?.reason as string,
      };
    }

    if (eligibleEvent) {
      const result = calculateSoinsSanteMentaleAmount(input);
      return {
        benefitType: 'soins-sante-mentale' as any,
        isEligible: true,
        calculatedAmount: result.coutFinal,
        details: {
          coutPatient: result.coutPatient,
          remboursementINAMI: result.remboursementINAMI,
          remboursementMutuelle: result.remboursementMutuelle,
          gratuit: result.gratuit,
          seancesRestantes: result.seancesRestantes,
          message: result.message,
        },
      };
    }

    return {
      benefitType: 'soins-sante-mentale' as any,
      isEligible: false,
      reason: 'conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Error checking Soins de Santé Mentale eligibility: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const SOINS_SANTE_MENTALE_RULES_JSON = {
  legalFramework: {
    primaryLaw: 'Arrêté royal du 18 juillet 2022 relatif aux soins psychologiques de première ligne',
    secondaryLaw: 'Convention nationale INAMI - Psychologues cliniciens 2024',
    healthInsuranceLaw: 'Loi coordonnée du 14 juillet 1994 relative à l\'assurance obligatoire soins de santé',
    effectiveDate: '2024-01-01',
  },
  rules: [
    {
      id: 'premiere-seance-gratuite',
      description: 'La première séance (bilan) est gratuite pour tous',
      condition: 'numeroSeance === 1',
      outcome: 'coutPatient = 0€',
    },
    {
      id: 'jeunes-moins-23-ans',
      description: 'Séances gratuites pour les personnes de moins de 23 ans',
      condition: 'age < 23',
      outcome: 'coutPatient = 0€, pas de limite de séances',
    },
    {
      id: 'adulte-ordinaire',
      description: 'Quote-part adulte statut ordinaire',
      condition: 'age >= 23 && statut === ordinaire',
      outcome: 'coutPatient = 11€ par séance',
    },
    {
      id: 'adulte-bim',
      description: 'Quote-part adulte statut BIM',
      condition: 'age >= 23 && statut === BIM',
      outcome: 'coutPatient = 4€ par séance',
    },
    {
      id: 'seance-groupe',
      description: 'Séances de groupe - tarif unique',
      condition: 'typeSoin === seance_groupe',
      outcome: 'coutPatient = 2.50€',
    },
    {
      id: 'psychiatre-ordinaire',
      description: 'Consultation psychiatre - statut ordinaire',
      condition: 'typeSoin === psychiatre && statut === ordinaire',
      outcome: 'coutPatient = 19.89€',
    },
    {
      id: 'psychiatre-bim',
      description: 'Consultation psychiatre - statut BIM',
      condition: 'typeSoin === psychiatre && statut === BIM',
      outcome: 'coutPatient = 7.96€',
    },
    {
      id: 'urgence-psychiatrique',
      description: 'Urgence psychiatrique - admission couverte à 100%',
      condition: 'estEnCrise === true',
      outcome: 'coutPatient = 0€',
    },
    {
      id: 'hospitalisation',
      description: 'Hospitalisation psychiatrique avec intervention personnelle par jour',
      condition: 'typeSoin === hospitalisation',
      outcome: 'Variable selon durée et statut',
    },
  ],
  amounts: {
    tarifSeanceIndividuelleAdulte: SOINS_SANTE_MENTALE_CONSTANTS.TARIF_SEANCE_INDIVIDUELLE_ADULTE,
    tarifPsychiatreConventionne: SOINS_SANTE_MENTALE_CONSTANTS.TARIF_PSYCHIATRE_CONVENTIONNE,
    quotePartOrdinaire: SOINS_SANTE_MENTALE_CONSTANTS.QUOTE_PART_ORDINAIRE,
    quotePartBIM: SOINS_SANTE_MENTALE_CONSTANTS.QUOTE_PART_BIM,
    quotePartGroupe: SOINS_SANTE_MENTALE_CONSTANTS.QUOTE_PART_GROUPE,
    quotePartPsychiatreOrdinaire: SOINS_SANTE_MENTALE_CONSTANTS.QUOTE_PART_PSYCHIATRE_ORDINAIRE,
    quotePartPsychiatreBIM: SOINS_SANTE_MENTALE_CONSTANTS.QUOTE_PART_PSYCHIATRE_BIM,
  },
  mutuelles: SOINS_SANTE_MENTALE_CONSTANTS.MUTUELLES,
  seances: {
    serie1: SOINS_SANTE_MENTALE_CONSTANTS.SEANCES_SERIE_1,
    serie2: SOINS_SANTE_MENTALE_CONSTANTS.SEANCES_SERIE_2,
    parAnAdulte: SOINS_SANTE_MENTALE_CONSTANTS.SEANCES_PAR_AN_ADULTE,
    parAnJeune: SOINS_SANTE_MENTALE_CONSTANTS.SEANCES_PAR_AN_JEUNE,
  },
};