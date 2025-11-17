/**
 * Business Rules for Electoral Registration (Inscription Électorale)
 *
 * BASE JURIDIQUE:
 * - Code électoral belge (12 avril 1894, coordonné)
 *   https://www.ejustice.just.fgov.be/eli/code/1894/04/12/1894041255/justel
 * - Constitution belge - Articles 61-64 (droits politiques)
 *   https://www.ejustice.just.fgov.be/eli/constitution/1994/02/17/1994021048/justel
 * - Loi du 19 mars 2004 visant à octroyer le droit de vote aux élections communales
 *   aux étrangers non ressortissants de l'Union européenne
 */

import { Engine } from 'json-rules-engine';
import {
  DemocraticCitizen,
  InscriptionElectorale,
  ElectoralRight,
  EligibilityResult,
  DEMOCRATIE_CONSTANTS,
  isEligibleToVote,
} from '../../domain/democratieTypes';

/**
 * Create the electoral registration rules engine
 */
function createInscriptionEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Age requirement for voting
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'age',
          operator: 'lessThan',
          value: DEMOCRATIE_CONSTANTS.AGE_MAJORITE_ELECTORALE,
        },
      ],
    },
    event: {
      type: 'inscription-ineligible',
      params: {
        reason: `âge minimum non atteint (${DEMOCRATIE_CONSTANTS.AGE_MAJORITE_ELECTORALE} ans requis)`,
        priority: 10,
        legalRef: 'Constitution Art. 61',
      },
    },
    priority: 10,
  });

  // Rule 2: Belgian citizens - automatic registration
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'nationalite',
          operator: 'equal',
          value: 'belge',
        },
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: DEMOCRATIE_CONSTANTS.AGE_MAJORITE_ELECTORALE,
        },
        {
          fact: 'droitsCiviquesActifs',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'inscription-automatique',
      params: {
        message: 'Inscription automatique pour les citoyens belges majeurs',
        droits: ['elections-federales', 'elections-regionales', 'elections-communales', 'elections-europeennes'],
        obligatoire: true,
        legalRef: 'Code électoral Art. 1',
      },
    },
    priority: 9,
  });

  // Rule 3: EU citizens - voluntary registration for local elections
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'nationalite',
          operator: 'equal',
          value: 'eu-citoyen',
        },
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: DEMOCRATIE_CONSTANTS.AGE_MAJORITE_ELECTORALE,
        },
        {
          fact: 'dureeResidence',
          operator: 'greaterThanInclusive',
          value: 0, // No minimum residence for EU citizens
        },
      ],
    },
    event: {
      type: 'inscription-volontaire-eu',
      params: {
        message: 'Inscription volontaire possible pour citoyens européens',
        droits: ['elections-communales', 'elections-europeennes'],
        obligatoire: false,
        documentsRequis: ['preuve-residence', 'declaration-non-double-vote'],
        legalRef: 'Loi du 23 mars 1989',
      },
    },
    priority: 8,
  });

  // Rule 4: Non-EU residents - conditional registration for local elections
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'nationalite',
          operator: 'equal',
          value: 'non-eu-resident',
        },
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: DEMOCRATIE_CONSTANTS.AGE_MAJORITE_ELECTORALE,
        },
        {
          fact: 'dureeResidence',
          operator: 'greaterThanInclusive',
          value: 5, // 5 years minimum residence
        },
        {
          fact: 'titreSejour',
          operator: 'equal',
          value: 'valide',
        },
      ],
    },
    event: {
      type: 'inscription-conditionnelle-non-eu',
      params: {
        message: 'Inscription possible pour résidents non-EU après 5 ans',
        droits: ['elections-communales'],
        obligatoire: false,
        documentsRequis: ['titre-sejour', 'preuve-residence-5ans', 'engagement-constitution'],
        legalRef: 'Loi du 19 mars 2004',
      },
    },
    priority: 7,
  });

  // Rule 5: Suspension of civil rights
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'suspensionDroitsCiviques',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'inscription-suspendue',
      params: {
        reason: 'Suspension des droits civiques en cours',
        priority: 11,
        legalRef: 'Code pénal Art. 31-34',
      },
    },
    priority: 11,
  });

  // Rule 6: Non-payment of electoral fines
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'amendesElectoralesImpayees',
          operator: 'greaterThan',
          value: 0,
        },
        {
          fact: 'montantAmendesImpayees',
          operator: 'greaterThan',
          value: DEMOCRATIE_CONSTANTS.AMENDE_NON_VOTE_MIN,
        },
      ],
    },
    event: {
      type: 'inscription-bloquee-amendes',
      params: {
        reason: 'Amendes électorales impayées',
        action: 'Payer les amendes pour débloquer l\'inscription',
        priority: 8,
        legalRef: 'Code électoral Art. 209',
      },
    },
    priority: 8,
  });

  // Rule 7: Residence verification
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'residenceVerifiee',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'verification-residence-requise',
      params: {
        message: 'Vérification de la résidence principale requise',
        action: 'Visite de l\'agent de quartier nécessaire',
        priority: 6,
        legalRef: 'Loi du 19 juillet 1991 (registres de population)',
      },
    },
    priority: 6,
  });

  return engine;
}

/**
 * Singleton instance of the inscription engine
 */
const inscriptionEngineInstance = createInscriptionEngine();

/**
 * Check electoral registration eligibility
 */
export async function checkInscriptionEligibility(
  citizen: DemocraticCitizen
): Promise<EligibilityResult> {
  const facts = {
    age: citizen.age,
    nationalite: citizen.nationalite,
    dureeResidence: calculateResidenceDuration(citizen.residenceLegale.dateInscription),
    droitsCiviquesActifs: !hasSuspendedRights(citizen),
    suspensionDroitsCiviques: hasSuspendedRights(citizen),
    amendesElectoralesImpayees: countUnpaidFines(citizen),
    montantAmendesImpayees: calculateUnpaidFinesAmount(citizen),
    residenceVerifiee: true, // Assuming verified for this example
    titreSejour: 'valide', // Would need proper validation
  };

  try {
    const results = await inscriptionEngineInstance.run(facts);

    // Check for ineligibility
    const ineligibleEvent = results.events.find((e) =>
      ['inscription-ineligible', 'inscription-suspendue', 'inscription-bloquee-amendes'].includes(e.type)
    );

    if (ineligibleEvent) {
      return {
        eligible: false,
        droitsActifs: [],
        restrictions: [{
          type: 'elections-federales' as ElectoralRight,
          raison: ineligibleEvent.params?.reason,
          dateDebut: new Date(),
          recoursPossible: ineligibleEvent.type === 'inscription-bloquee-amendes',
        }],
      };
    }

    // Check for automatic registration (Belgian citizens)
    const automatiqueEvent = results.events.find((e) => e.type === 'inscription-automatique');
    if (automatiqueEvent) {
      return {
        eligible: true,
        droitsActifs: automatiqueEvent.params?.droits || [],
        restrictions: [],
        recommandations: ['Vote obligatoire - amendes en cas d\'absence non justifiée'],
      };
    }

    // Check for voluntary registration (EU citizens)
    const volontaireEuEvent = results.events.find((e) => e.type === 'inscription-volontaire-eu');
    if (volontaireEuEvent) {
      return {
        eligible: true,
        droitsActifs: volontaireEuEvent.params?.droits || [],
        restrictions: [],
        recommandations: [
          'Inscription volontaire nécessaire',
          'Fournir déclaration de non-double vote',
          'Vote facultatif une fois inscrit',
        ],
      };
    }

    // Check for conditional registration (non-EU residents)
    const conditionnelEvent = results.events.find((e) => e.type === 'inscription-conditionnelle-non-eu');
    if (conditionnelEvent) {
      return {
        eligible: true,
        droitsActifs: conditionnelEvent.params?.droits || [],
        restrictions: [],
        recommandations: [
          'Inscription après 5 ans de résidence légale',
          'Signer engagement de respecter la Constitution',
          'Droits limités aux élections communales',
        ],
      };
    }

    // Default case
    return {
      eligible: false,
      droitsActifs: [],
      restrictions: [{
        type: 'elections-federales' as ElectoralRight,
        raison: 'Conditions non remplies',
        dateDebut: new Date(),
        recoursPossible: true,
      }],
    };
  } catch (error) {
    throw new Error(`Erreur lors de la vérification d'éligibilité: ${error}`);
  }
}

/**
 * Process electoral registration request
 */
export async function processInscriptionRequest(
  citizen: DemocraticCitizen,
  electionType: ElectoralRight
): Promise<InscriptionElectorale> {
  const eligibility = await checkInscriptionEligibility(citizen);

  if (!eligibility.eligible) {
    throw new Error(`Inscription refusée: ${eligibility.restrictions[0]?.raison}`);
  }

  if (!eligibility.droitsActifs.includes(electionType)) {
    throw new Error(`Pas éligible pour ${electionType}`);
  }

  // Generate electoral number
  const numeroElecteur = generateNumeroElecteur(citizen);

  // Assign voting bureau
  const bureauVote = assignBureauVote(citizen.residenceLegale.commune);

  return {
    citoyenId: citizen.id,
    typeElection: electionType,
    commune: citizen.residenceLegale.commune,
    bureauVote,
    numeroElecteur,
    dateInscription: new Date(),
    statut: 'active',
  };
}

/**
 * Calculate voting penalties for non-participation
 */
export function calculateAbsencePenalty(
  absences: number,
  justified: boolean
): { amount: number; reason: string } {
  if (justified) {
    return { amount: 0, reason: 'Absence justifiée' };
  }

  let amount = 0;
  let reason = '';

  if (absences === 1) {
    amount = DEMOCRATIE_CONSTANTS.AMENDE_NON_VOTE_MIN;
    reason = 'Première absence non justifiée';
  } else if (absences === 2) {
    amount = DEMOCRATIE_CONSTANTS.AMENDE_NON_VOTE_RECIDIVE_MIN;
    reason = 'Deuxième absence non justifiée';
  } else if (absences >= 3) {
    amount = DEMOCRATIE_CONSTANTS.AMENDE_NON_VOTE_RECIDIVE_MAX;
    reason = `${absences} absences non justifiées - amende maximale`;
  }

  return { amount, reason };
}

/**
 * Verify double voting prevention
 */
export function checkDoubleVotingPrevention(
  citizen: DemocraticCitizen,
  otherRegistrations: InscriptionElectorale[]
): boolean {
  // Check if citizen is registered elsewhere for same election type
  const duplicates = otherRegistrations.filter(
    (reg) => reg.citoyenId === citizen.id && reg.statut === 'active'
  );

  return duplicates.length === 0;
}

// Helper functions
function calculateResidenceDuration(dateInscription: Date): number {
  const now = new Date();
  const years = (now.getTime() - dateInscription.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  return Math.floor(years);
}

function hasSuspendedRights(citizen: DemocraticCitizen): boolean {
  return citizen.sanctionsElectorales.some(
    (sanction) => sanction.type === 'suspension-droits' &&
    (!sanction.dureeJours || new Date() < addDays(sanction.date, sanction.dureeJours))
  );
}

function countUnpaidFines(citizen: DemocraticCitizen): number {
  return citizen.sanctionsElectorales.filter(
    (sanction) => sanction.type === 'amende' && sanction.montantEuros && sanction.montantEuros > 0
  ).length;
}

function calculateUnpaidFinesAmount(citizen: DemocraticCitizen): number {
  return citizen.sanctionsElectorales
    .filter((sanction) => sanction.type === 'amende' && sanction.montantEuros)
    .reduce((sum, sanction) => sum + (sanction.montantEuros || 0), 0);
}

function generateNumeroElecteur(citizen: DemocraticCitizen): string {
  const year = new Date().getFullYear();
  const commune = citizen.residenceLegale.codePostal;
  const random = Math.floor(Math.random() * 100000);
  return `${year}-${commune}-${random.toString().padStart(5, '0')}`;
}

function assignBureauVote(commune: string): string {
  // Simplified bureau assignment
  const bureaux = ['BV001', 'BV002', 'BV003', 'BV004', 'BV005'];
  const index = Math.floor(Math.random() * bureaux.length);
  return `${commune}-${bureaux[index]}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Export rules in JSON format for transparency
 */
export const INSCRIPTION_RULES_JSON = {
  legalFramework: {
    codeElectoral: {
      title: 'Code électoral belge',
      date: '12 avril 1894',
      url: 'https://www.ejustice.just.fgov.be/eli/code/1894/04/12/1894041255/justel',
    },
    constitution: {
      title: 'Constitution belge - Droits politiques',
      articles: '61-64',
      url: 'https://www.ejustice.just.fgov.be/eli/constitution/1994/02/17/1994021048/justel',
    },
  },
  rules: [
    {
      id: 'age-majorite',
      description: `Âge minimum de ${DEMOCRATIE_CONSTANTS.AGE_MAJORITE_ELECTORALE} ans`,
      condition: `age >= ${DEMOCRATIE_CONSTANTS.AGE_MAJORITE_ELECTORALE}`,
      priority: 10,
    },
    {
      id: 'nationalite-belge',
      description: 'Citoyens belges inscrits automatiquement',
      condition: 'nationalite == belge && age >= 18',
      voteObligatoire: true,
      priority: 9,
    },
    {
      id: 'citoyen-eu',
      description: 'Citoyens EU peuvent s\'inscrire volontairement',
      condition: 'nationalite == eu-citoyen && age >= 18',
      voteObligatoire: false,
      electionsAutorisees: ['communales', 'européennes'],
      priority: 8,
    },
    {
      id: 'resident-non-eu',
      description: 'Résidents non-EU après 5 ans',
      condition: 'nationalite == non-eu && residence >= 5 ans',
      voteObligatoire: false,
      electionsAutorisees: ['communales'],
      priority: 7,
    },
  ],
  sanctions: {
    absenceNonJustifiee: {
      premiere: DEMOCRATIE_CONSTANTS.AMENDE_NON_VOTE_MIN,
      recidive: DEMOCRATIE_CONSTANTS.AMENDE_NON_VOTE_RECIDIVE_MIN,
      multiple: DEMOCRATIE_CONSTANTS.AMENDE_NON_VOTE_RECIDIVE_MAX,
    },
    radiation: {
      condition: '4 absences consécutives non justifiées',
      consequence: 'Radiation des listes électorales',
    },
  },
};