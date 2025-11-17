/**
 * Business Rules for Assemblée Générale (General Assembly)
 *
 * BASE JURIDIQUE:
 * - Code Civil Belge, articles 577-6 à 577-7
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1804032133&table_name=loi
 * - Loi du 2 juin 2010 modifiant le Code civil - copropriété
 * - Loi du 18 juin 2018 - réforme de la copropriété
 */

import { Engine } from 'json-rules-engine';
import {
  AssembleeGenerale,
  AssembleeType,
  CoproprieteStatus,
  DecisionType,
  QuorumInfo,
  COPROPRIETE_CONSTANTS
} from '../modele-metier/coproprieteTypes';

/**
 * Create rules engine for AG validation
 */
function createAssembleeEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Délai de convocation AG ordinaire
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'assemblee_type',
          operator: 'equal',
          value: 'ordinaire_annuelle',
        },
        {
          fact: 'delai_convocation',
          operator: 'lessThan',
          value: COPROPRIETE_CONSTANTS.DELAI_CONVOCATION_AG_ORDINAIRE,
        },
      ],
    },
    event: {
      type: 'convocation-invalide',
      params: {
        reason: `Délai minimum de ${COPROPRIETE_CONSTANTS.DELAI_CONVOCATION_AG_ORDINAIRE} jours non respecté pour AG ordinaire`,
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 2: Délai de convocation AG extraordinaire
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'assemblee_type',
          operator: 'equal',
          value: 'extraordinaire',
        },
        {
          fact: 'delai_convocation',
          operator: 'lessThan',
          value: COPROPRIETE_CONSTANTS.DELAI_CONVOCATION_AG_EXTRAORDINAIRE,
        },
      ],
    },
    event: {
      type: 'convocation-invalide',
      params: {
        reason: `Délai minimum de ${COPROPRIETE_CONSTANTS.DELAI_CONVOCATION_AG_EXTRAORDINAIRE} jours non respecté pour AG extraordinaire`,
        priority: 10,
      },
    },
    priority: 10,
  });

  // Rule 3: Petite copropriété - AG biannuelle autorisée
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'copropriete_status',
          operator: 'equal',
          value: 'petite_copropriete',
        },
        {
          fact: 'regime_biannuel',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'mois_depuis_derniere_ag',
          operator: 'greaterThan',
          value: 24,
        },
      ],
    },
    event: {
      type: 'ag-obligatoire',
      params: {
        reason: 'AG obligatoire après 24 mois en régime biannuel',
        priority: 9,
      },
    },
    priority: 9,
  });

  // Rule 4: Documents obligatoires AG ordinaire
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'assemblee_type',
          operator: 'equal',
          value: 'ordinaire_annuelle',
        },
        {
          any: [
            {
              fact: 'comptes_annuels_joints',
              operator: 'equal',
              value: false,
            },
            {
              fact: 'budget_previsionnel_joint',
              operator: 'equal',
              value: false,
            },
            {
              fact: 'rapport_syndic_joint',
              operator: 'equal',
              value: false,
            },
          ],
        },
      ],
    },
    event: {
      type: 'documents-manquants',
      params: {
        reason: 'Documents obligatoires manquants pour AG ordinaire',
        priority: 8,
      },
    },
    priority: 8,
  });

  // Rule 5: Convocation AG à la demande des copropriétaires
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'milliemes_demandeurs',
          operator: 'greaterThanInclusive',
          value: 200, // 1/5 de 1000 millièmes
        },
        {
          fact: 'demande_ecrite',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'convocation-obligatoire',
      params: {
        reason: '1/5 des copropriétaires demande une AG extraordinaire',
        delai_max: 30,
      },
    },
    priority: 7,
  });

  return engine;
}

const assembleeEngineInstance = createAssembleeEngine();

/**
 * Calculate quorum for assembly
 */
export function calculateQuorum(
  totalMilliemes: number,
  milliemesPresents: number,
  milliemesRepresentes: number,
  decisionType: DecisionType
): QuorumInfo & { isValid: boolean } {
  const totalPresentsRepresentes = milliemesPresents + milliemesRepresentes;
  const pourcentage = (totalPresentsRepresentes / totalMilliemes) * 100;

  let milliemesRequis = 500; // Majorité simple par défaut

  switch (decisionType) {
    case 'unanimite':
      milliemesRequis = totalMilliemes;
      break;
    case 'quatre_cinquiemes':
      milliemesRequis = Math.ceil(totalMilliemes * 0.8);
      break;
    case 'trois_quarts':
      milliemesRequis = Math.ceil(totalMilliemes * 0.75);
      break;
    case 'deux_tiers':
      milliemesRequis = Math.ceil(totalMilliemes * 0.667);
      break;
    case 'majorite_absolue':
      milliemesRequis = Math.ceil(totalMilliemes * 0.5);
      break;
    case 'majorite_simple':
      milliemesRequis = Math.ceil(totalMilliemes * 0.5);
      break;
  }

  const quorumAtteint = totalPresentsRepresentes >= milliemesRequis;

  return {
    milliemesRequis,
    milliemesPresents,
    milliemesRepresentes,
    quorumAtteint,
    isValid: quorumAtteint,
  };
}

/**
 * Validate vote result
 */
export function validateVote(
  decisionType: DecisionType,
  votePour: number,
  voteContre: number,
  abstention: number,
  totalMilliemes: number
): {
  isAccepted: boolean;
  pourcentagePour: number;
  majoriteRequise: number;
  reason?: string;
} {
  const totalVotes = votePour + voteContre + abstention;
  const pourcentagePour = (votePour / totalMilliemes) * 100;

  let majoriteRequise = 50;
  let isAccepted = false;

  switch (decisionType) {
    case 'unanimite':
      majoriteRequise = 100;
      isAccepted = votePour === totalMilliemes;
      break;
    case 'quatre_cinquiemes':
      majoriteRequise = 80;
      isAccepted = votePour >= totalMilliemes * 0.8;
      break;
    case 'trois_quarts':
      majoriteRequise = 75;
      isAccepted = votePour >= totalMilliemes * 0.75;
      break;
    case 'deux_tiers':
      majoriteRequise = 66.67;
      isAccepted = votePour >= totalMilliemes * 0.667;
      break;
    case 'majorite_absolue':
      majoriteRequise = 50;
      isAccepted = votePour > totalMilliemes * 0.5;
      break;
    case 'majorite_simple':
      majoriteRequise = 50;
      isAccepted = votePour > voteContre;
      break;
  }

  return {
    isAccepted,
    pourcentagePour: Math.round(pourcentagePour * 100) / 100,
    majoriteRequise,
    reason: isAccepted
      ? `Résolution adoptée avec ${pourcentagePour.toFixed(2)}%`
      : `Résolution rejetée - ${majoriteRequise}% requis, seulement ${pourcentagePour.toFixed(2)}% obtenus`,
  };
}

/**
 * Check AG convocation validity
 */
export async function checkConvocationValidity(data: {
  assemblee_type: AssembleeType;
  delai_convocation: number;
  copropriete_status: CoproprieteStatus;
  documents_joints: {
    comptes_annuels: boolean;
    budget_previsionnel: boolean;
    rapport_syndic: boolean;
  };
}): Promise<{
  isValid: boolean;
  errors: string[];
  warnings: string[];
}> {
  const facts = {
    assemblee_type: data.assemblee_type,
    delai_convocation: data.delai_convocation,
    copropriete_status: data.copropriete_status,
    comptes_annuels_joints: data.documents_joints.comptes_annuels,
    budget_previsionnel_joint: data.documents_joints.budget_previsionnel,
    rapport_syndic_joint: data.documents_joints.rapport_syndic,
  };

  const results = await assembleeEngineInstance.run(facts);
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const event of results.events) {
    if (event.type === 'convocation-invalide') {
      errors.push(event.params?.reason || 'Convocation invalide');
    } else if (event.type === 'documents-manquants') {
      errors.push(event.params?.reason || 'Documents manquants');
    } else if (event.type === 'ag-obligatoire') {
      warnings.push(event.params?.reason || 'AG obligatoire');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calculate penalties for late convocation
 */
export function calculateConvocationPenalties(
  delaiEffectif: number,
  delaiLegal: number,
  assemblee: AssembleeGenerale
): {
  isDefermentRequired: boolean;
  newDate?: Date;
  penalties?: string[];
} {
  if (delaiEffectif >= delaiLegal) {
    return { isDefermentRequired: false };
  }

  const joursManquants = delaiLegal - delaiEffectif;
  const newDate = new Date(assemblee.dateReunion);
  newDate.setDate(newDate.getDate() + joursManquants);

  return {
    isDefermentRequired: true,
    newDate,
    penalties: [
      `Report obligatoire de ${joursManquants} jours`,
      'Nouvelle convocation à envoyer',
      'Frais supplémentaires à la charge du syndic si faute',
    ],
  };
}

/**
 * Export rules for transparency
 */
export const AG_RULES_JSON = {
  legalFramework: {
    code_civil: 'Articles 577-6 à 577-7',
    loi_2010: 'Loi du 2 juin 2010',
    loi_2018: 'Loi du 18 juin 2018',
  },
  delais_convocation: {
    ordinaire: COPROPRIETE_CONSTANTS.DELAI_CONVOCATION_AG_ORDINAIRE,
    extraordinaire: COPROPRIETE_CONSTANTS.DELAI_CONVOCATION_AG_EXTRAORDINAIRE,
  },
  majorites_requises: {
    unanimite: '100% - Modification acte de base',
    quatre_cinquiemes: '80% - Aliénation parties communes',
    trois_quarts: '75% - Travaux amélioration',
    deux_tiers: '66.67% - Désignation syndic',
    majorite_absolue: '50% - Budget et comptes',
    majorite_simple: 'Majorité présents - Questions diverses',
  },
};