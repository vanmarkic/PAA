/**
 * Business Rules for Travaux (Works) Management
 *
 * BASE JURIDIQUE:
 * - Code Civil Belge, articles 577-8 et 577-9
 * - Loi du 18 juin 2018 - Classification des travaux
 */

import { Engine } from 'json-rules-engine';
import {
  Travaux,
  TravauxType,
  UrgenceLevel,
  DecisionType,
  COPROPRIETE_CONSTANTS
} from '../../domain/coproprieteTypes';

/**
 * Create travaux validation engine
 */
function createTravauxEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Travaux urgents - intervention immédiate
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'urgence',
          operator: 'equal',
          value: 'immediat',
        },
      ],
    },
    event: {
      type: 'intervention-immediate',
      params: {
        autorisation_syndic: true,
        vote_ag_requis: false,
        delai_max: '24h',
        notification_conseil: true,
      },
    },
    priority: 10,
  });

  // Rule 2: Travaux conservatoires - majorité 2/3
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'type_travaux',
          operator: 'equal',
          value: 'renovation_conservatoire',
        },
        {
          fact: 'montant',
          operator: 'greaterThan',
          value: 5000,
        },
      ],
    },
    event: {
      type: 'vote-requis',
      params: {
        majorite: 'deux_tiers',
        justification: 'Travaux de conservation nécessitant vote AG',
      },
    },
    priority: 8,
  });

  // Rule 3: Travaux d'amélioration - majorité 3/4
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'type_travaux',
          operator: 'equal',
          value: 'amelioration',
        },
      ],
    },
    event: {
      type: 'vote-requis',
      params: {
        majorite: 'trois_quarts',
        justification: 'Travaux d\'amélioration nécessitant majorité qualifiée',
      },
    },
    priority: 8,
  });

  // Rule 4: Transformation - majorité 4/5
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'type_travaux',
          operator: 'equal',
          value: 'transformation',
        },
      ],
    },
    event: {
      type: 'vote-requis',
      params: {
        majorite: 'quatre_cinquiemes',
        justification: 'Transformation majeure de l\'immeuble',
      },
    },
    priority: 9,
  });

  // Rule 5: Dépassement budget syndic
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'montant',
          operator: 'greaterThan',
          value: { fact: 'plafond_syndic' },
        },
        {
          fact: 'urgence',
          operator: 'notEqual',
          value: 'immediat',
        },
      ],
    },
    event: {
      type: 'autorisation-ag',
      params: {
        raison: 'Montant dépassant les pouvoirs du syndic',
        consultation_conseil: true,
      },
    },
    priority: 7,
  });

  // Rule 6: Travaux affectant structure
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'affecte_structure',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'expertise-requise',
      params: {
        type_expert: 'ingénieur stabilité',
        permis_urbanisme: 'probable',
        vote_minimum: 'quatre_cinquiemes',
      },
    },
    priority: 9,
  });

  return engine;
}

const travauxEngineInstance = createTravauxEngine();

/**
 * Determine required majority for works
 */
export function determineRequiredMajority(
  type: TravauxType,
  montant: number,
  affecteStructure: boolean
): {
  majorite: DecisionType;
  justification: string;
} {
  // Transformation ou travaux structurels majeurs
  if (type === 'transformation' || (affecteStructure && montant > 50000)) {
    return {
      majorite: 'quatre_cinquiemes',
      justification: 'Transformation ou modification structurelle majeure',
    };
  }

  // Amélioration
  if (type === 'amelioration') {
    return {
      majorite: 'trois_quarts',
      justification: 'Travaux d\'amélioration de l\'immeuble',
    };
  }

  // Rénovation conservatoire importante
  if (type === 'renovation_conservatoire' && montant > 10000) {
    return {
      majorite: 'deux_tiers',
      justification: 'Travaux de conservation importants',
    };
  }

  // Entretien ordinaire ou réparation simple
  if (type === 'entretien_ordinaire' || montant < 5000) {
    return {
      majorite: 'majorite_simple',
      justification: 'Entretien ordinaire ou travaux mineurs',
    };
  }

  // Par défaut: majorité absolue
  return {
    majorite: 'majorite_absolue',
    justification: 'Travaux standards',
  };
}

/**
 * Check if works can be executed by syndic
 */
export async function checkSyndicAuthority(data: {
  type_travaux: TravauxType;
  urgence: UrgenceLevel;
  montant: number;
  plafond_syndic: number;
  affecte_structure: boolean;
}): Promise<{
  canExecute: boolean;
  requiresVote: boolean;
  majoriteRequise?: DecisionType;
  actions: string[];
}> {
  const results = await travauxEngineInstance.run(data);

  let canExecute = false;
  let requiresVote = false;
  let majoriteRequise: DecisionType | undefined;
  const actions: string[] = [];

  for (const event of results.events) {
    switch (event.type) {
      case 'intervention-immediate':
        canExecute = true;
        requiresVote = false;
        actions.push('Intervention immédiate autorisée');
        actions.push(`Notification conseil sous ${event.params?.delai_max}`);
        break;

      case 'vote-requis':
        requiresVote = true;
        majoriteRequise = event.params?.majorite;
        actions.push(event.params?.justification);
        break;

      case 'autorisation-ag':
        requiresVote = true;
        actions.push(event.params?.raison);
        if (event.params?.consultation_conseil) {
          actions.push('Consultation du conseil de copropriété requise');
        }
        break;

      case 'expertise-requise':
        actions.push(`Expertise ${event.params?.type_expert} requise`);
        if (event.params?.permis_urbanisme) {
          actions.push('Permis d\'urbanisme probablement nécessaire');
        }
        break;
    }
  }

  // Cas spécial: urgence immédiate
  if (data.urgence === 'immediat') {
    canExecute = true;
    requiresVote = false;
  }
  // Travaux mineurs dans limite syndic
  else if (data.montant <= data.plafond_syndic && !data.affecte_structure) {
    canExecute = true;
    requiresVote = false;
  }

  return {
    canExecute,
    requiresVote,
    majoriteRequise,
    actions,
  };
}

/**
 * Calculate cost distribution for works
 */
export function calculateTravauxRepartition(
  travaux: Travaux,
  totalMilliemes: number,
  beneficiaires?: Array<{ coproprietaireId: string; milliemes: number; coefficient?: number }>
): Array<{ coproprietaireId: string; montant: number; pourcentage: number }> {
  const montantTotal = travaux.montantEstime || 0;

  // Si pas de bénéficiaires spécifiques, répartition générale aux millièmes
  if (!beneficiaires || beneficiaires.length === 0) {
    // Retour simplifié pour répartition générale
    return [];
  }

  // Calcul avec coefficients spéciaux si applicable
  const totalCoefficients = beneficiaires.reduce((sum, b) => {
    return sum + (b.coefficient || 1) * b.milliemes;
  }, 0);

  return beneficiaires.map(b => {
    const coefficient = b.coefficient || 1;
    const part = (coefficient * b.milliemes) / totalCoefficients;
    const montant = Math.round(montantTotal * part * 100) / 100;
    const pourcentage = Math.round(part * 10000) / 100;

    return {
      coproprietaireId: b.coproprietaireId,
      montant,
      pourcentage,
    };
  });
}

/**
 * Estimate ROI for improvement works
 */
export function estimateROI(
  type: TravauxType,
  cout: number,
  economiesAnnuelles?: number
): {
  hasROI: boolean;
  retourInvestissement?: number;
  valorisationEstimee?: number;
  recommandation: string;
} {
  // Travaux énergétiques avec économies
  if (economiesAnnuelles && economiesAnnuelles > 0) {
    const roi = Math.ceil(cout / economiesAnnuelles);
    return {
      hasROI: true,
      retourInvestissement: roi,
      recommandation: roi <= 10
        ? 'Investissement recommandé - ROI favorable'
        : 'ROI long - évaluer alternatives',
    };
  }

  // Estimation valorisation selon type
  let valorisationPct = 0;
  switch (type) {
    case 'amelioration':
      valorisationPct = 0.05; // 5% valorisation moyenne
      break;
    case 'renovation_conservatoire':
      valorisationPct = 0.02; // 2% maintien valeur
      break;
    case 'transformation':
      valorisationPct = 0.08; // 8% si bien conçu
      break;
    default:
      valorisationPct = 0;
  }

  const valorisation = cout * valorisationPct;

  return {
    hasROI: valorisationPct > 0,
    valorisationEstimee: valorisation,
    recommandation: valorisationPct > 0
      ? `Valorisation estimée: +${(valorisationPct * 100).toFixed(0)}%`
      : 'Travaux d\'entretien nécessaires sans valorisation',
  };
}

/**
 * Priority scoring for works planning
 */
export function scoreTravauxPriority(travaux: Travaux): {
  score: number;
  niveau: 'critique' | 'haute' | 'moyenne' | 'basse';
  justification: string;
} {
  let score = 0;
  const factors: string[] = [];

  // Facteur urgence (0-40 points)
  switch (travaux.urgence) {
    case 'immediat':
      score += 40;
      factors.push('Urgence immédiate');
      break;
    case 'urgent':
      score += 30;
      factors.push('Caractère urgent');
      break;
    case 'prioritaire':
      score += 20;
      factors.push('Prioritaire');
      break;
    case 'normal':
      score += 10;
      break;
    case 'reportable':
      score += 0;
      break;
  }

  // Facteur type (0-30 points)
  switch (travaux.type) {
    case 'reparation_urgente':
      score += 30;
      factors.push('Réparation nécessaire');
      break;
    case 'renovation_conservatoire':
      score += 20;
      factors.push('Conservation du patrimoine');
      break;
    case 'amelioration':
      score += 10;
      factors.push('Amélioration');
      break;
    default:
      score += 5;
  }

  // Facteur sécurité (0-30 points)
  if (travaux.description.toLowerCase().includes('sécurité') ||
      travaux.description.toLowerCase().includes('danger')) {
    score += 30;
    factors.push('Enjeu sécurité');
  }

  // Déterminer le niveau
  let niveau: 'critique' | 'haute' | 'moyenne' | 'basse';
  if (score >= 70) {
    niveau = 'critique';
  } else if (score >= 50) {
    niveau = 'haute';
  } else if (score >= 30) {
    niveau = 'moyenne';
  } else {
    niveau = 'basse';
  }

  return {
    score,
    niveau,
    justification: factors.join(', ') || 'Travaux standards',
  };
}

/**
 * Export travaux rules
 */
export const TRAVAUX_RULES_JSON = {
  legalFramework: {
    code_civil: 'Articles 577-8 et 577-9',
    loi_2018: 'Classification des travaux',
  },
  majorites: {
    entretien_ordinaire: 'Majorité simple',
    conservation: '2/3 des voix',
    amelioration: '3/4 des voix',
    transformation: '4/5 des voix',
  },
  pouvoirs_syndic: {
    urgence_immediate: 'Intervention sans autorisation',
    plafond_normal: '5000€ sauf AG contraire',
    notification: 'Conseil sous 24h si urgence',
  },
  obligations: {
    devis_multiples: '3 devis si > 10000€',
    permis_urbanisme: 'Si modification façade/structure',
    expertise: 'Si impact structurel',
  },
};