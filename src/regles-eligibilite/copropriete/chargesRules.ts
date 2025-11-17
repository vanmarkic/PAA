/**
 * Business Rules for Charges de Copropriété
 *
 * BASE JURIDIQUE:
 * - Code Civil Belge, article 577-5
 * - Arrêté royal du 12 décembre 2023 fixant les taux d'intérêt de retard
 */

import { Engine } from 'json-rules-engine';
import {
  Coproprietaire,
  ChargeType,
  PaiementStatus,
  Budget,
  AppelFonds,
  COPROPRIETE_CONSTANTS
} from '../../domain/coproprieteTypes';

/**
 * Create charges calculation engine
 */
function createChargesEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Retard de paiement léger (< 30 jours)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'jours_retard',
          operator: 'greaterThan',
          value: 0,
        },
        {
          fact: 'jours_retard',
          operator: 'lessThanInclusive',
          value: 30,
        },
      ],
    },
    event: {
      type: 'retard-leger',
      params: {
        frais_rappel: COPROPRIETE_CONSTANTS.FRAIS_RAPPEL_1,
        action: 'Premier rappel simple',
      },
    },
    priority: 5,
  });

  // Rule 2: Retard important (30-90 jours)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'jours_retard',
          operator: 'greaterThan',
          value: 30,
        },
        {
          fact: 'jours_retard',
          operator: 'lessThanInclusive',
          value: 90,
        },
      ],
    },
    event: {
      type: 'retard-important',
      params: {
        frais_rappel: COPROPRIETE_CONSTANTS.FRAIS_RAPPEL_2,
        action: 'Rappel recommandé',
        interet_applicable: true,
      },
    },
    priority: 7,
  });

  // Rule 3: Impayés graves (> 90 jours)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'jours_retard',
          operator: 'greaterThan',
          value: 90,
        },
      ],
    },
    event: {
      type: 'impayes-graves',
      params: {
        frais_mise_demeure: COPROPRIETE_CONSTANTS.FRAIS_MISE_DEMEURE,
        action: 'Mise en demeure + procédure judiciaire',
        interet_applicable: true,
        saisie_possible: true,
      },
    },
    priority: 10,
  });

  // Rule 4: Montant impayé significatif
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'montant_impayes',
          operator: 'greaterThan',
          value: 2000,
        },
        {
          fact: 'jours_retard',
          operator: 'greaterThan',
          value: 180,
        },
      ],
    },
    event: {
      type: 'saisie-conservatoire',
      params: {
        action: 'Saisie conservatoire autorisée',
        vote_ag_requis: false,
        notification_huissier: true,
      },
    },
    priority: 10,
  });

  return engine;
}

const chargesEngineInstance = createChargesEngine();

/**
 * Calculate charges for a copropriétaire
 */
export function calculateCharges(
  coproprietaire: Coproprietaire,
  budget: Budget,
  periode: 'mensuel' | 'trimestriel' | 'annuel'
): {
  chargesGenerales: number;
  chargesSpeciales: number;
  fondsReserve: number;
  total: number;
  detail: Array<{ type: string; montant: number }>;
} {
  const detail: Array<{ type: string; montant: number }> = [];

  // Charges générales au prorata des millièmes
  const chargesGenerales = budget.repartition
    .filter(r => r.type === 'charge_generale')
    .reduce((sum, r) => {
      const montant = (r.montant * coproprietaire.quotePartMilliemes) / 1000;
      detail.push({ type: r.description, montant });
      return sum + montant;
    }, 0);

  // Charges spéciales selon clé de répartition
  const chargesSpeciales = budget.repartition
    .filter(r => r.type === 'charge_particuliere')
    .reduce((sum, r) => {
      // Logique spécifique selon le type (ex: ascenseur par étage)
      const montant = calculateSpecialCharge(r, coproprietaire);
      if (montant > 0) {
        detail.push({ type: r.description, montant });
      }
      return sum + montant;
    }, 0);

  // Fonds de réserve
  const fondsReserve = (budget.montantTotal * 0.05 * coproprietaire.quotePartMilliemes) / 1000;
  detail.push({ type: 'Fonds de réserve', montant: fondsReserve });

  const totalAnnuel = chargesGenerales + chargesSpeciales + fondsReserve;

  // Ajuster selon la période
  let diviseur = 1;
  switch (periode) {
    case 'mensuel':
      diviseur = 12;
      break;
    case 'trimestriel':
      diviseur = 4;
      break;
  }

  return {
    chargesGenerales: Math.round((chargesGenerales / diviseur) * 100) / 100,
    chargesSpeciales: Math.round((chargesSpeciales / diviseur) * 100) / 100,
    fondsReserve: Math.round((fondsReserve / diviseur) * 100) / 100,
    total: Math.round((totalAnnuel / diviseur) * 100) / 100,
    detail: detail.map(d => ({
      type: d.type,
      montant: Math.round((d.montant / diviseur) * 100) / 100,
    })),
  };
}

/**
 * Calculate special charges (e.g., elevator by floor)
 */
function calculateSpecialCharge(
  charge: { type: ChargeType; montant: number; cleRepartition: string; details?: string },
  coproprietaire: Coproprietaire
): number {
  // Exemple: ascenseur selon l'étage
  if (charge.details?.includes('ascenseur')) {
    const etage = coproprietaire.lots[0]?.etage || 0;
    const coefficients: Record<number, number> = {
      0: 0,    // RDC ne paie pas
      1: 0.5,  // 1er étage coefficient 0.5
      2: 1.0,  // 2ème étage coefficient 1
      3: 1.5,  // 3ème étage coefficient 1.5
      4: 2.0,  // 4ème étage coefficient 2
      5: 2.5,  // 5ème étage coefficient 2.5
    };

    const coefficient = coefficients[etage] || 0;
    const totalCoefficients = 7.5; // Somme des coefficients

    return (charge.montant * coefficient) / totalCoefficients;
  }

  // Par défaut, répartition aux millièmes
  return (charge.montant * coproprietaire.quotePartMilliemes) / 1000;
}

/**
 * Calculate late payment interests
 */
export function calculateInterets(
  montantDu: number,
  joursRetard: number
): {
  interets: number;
  tauxAnnuel: number;
  tauxJournalier: number;
} {
  const tauxAnnuel = COPROPRIETE_CONSTANTS.TAUX_INTERET_RETARD / 100;
  const tauxJournalier = tauxAnnuel / 365;
  const interets = montantDu * tauxJournalier * joursRetard;

  return {
    interets: Math.round(interets * 100) / 100,
    tauxAnnuel: COPROPRIETE_CONSTANTS.TAUX_INTERET_RETARD,
    tauxJournalier: Math.round(tauxJournalier * 10000) / 10000,
  };
}

/**
 * Check payment status and calculate penalties
 */
export async function checkPaiementStatus(data: {
  montant_impayes: number;
  jours_retard: number;
  rappels_envoyes: number;
}): Promise<{
  status: PaiementStatus;
  frais: number;
  interets: number;
  actions: string[];
}> {
  const results = await chargesEngineInstance.run(data);

  let status: PaiementStatus = 'a_jour';
  let frais = 0;
  const actions: string[] = [];

  for (const event of results.events) {
    switch (event.type) {
      case 'retard-leger':
        status = 'retard_leger';
        frais += event.params?.frais_rappel || 0;
        actions.push(event.params?.action);
        break;
      case 'retard-important':
        status = 'retard_important';
        frais += event.params?.frais_rappel || 0;
        actions.push(event.params?.action);
        break;
      case 'impayes-graves':
        status = 'impayes_graves';
        frais += event.params?.frais_mise_demeure || 0;
        actions.push(event.params?.action);
        break;
      case 'saisie-conservatoire':
        status = 'saisie';
        actions.push(event.params?.action);
        break;
    }
  }

  const { interets } = calculateInterets(data.montant_impayes, data.jours_retard);

  return {
    status,
    frais: Math.round(frais * 100) / 100,
    interets,
    actions: actions.filter(Boolean),
  };
}

/**
 * Generate appel de fonds
 */
export function generateAppelFonds(
  budget: Budget,
  coproprietaires: Coproprietaire[],
  type: 'ordinaire' | 'extraordinaire',
  periode: string
): AppelFonds {
  const details = coproprietaires.map(copro => {
    const charges = calculateCharges(copro, budget, 'trimestriel');

    return {
      coproprietaireId: copro.id,
      montant: charges.total,
      paye: false,
      rappels: [],
    };
  });

  const montantTotal = details.reduce((sum, d) => sum + d.montant, 0);

  const dateEmission = new Date();
  const dateEcheance = new Date();
  dateEcheance.setDate(dateEcheance.getDate() + 30);

  return {
    id: `AF-${Date.now()}`,
    periode,
    montantTotal: Math.round(montantTotal * 100) / 100,
    dateEmission,
    dateEcheance,
    type,
    details,
  };
}

/**
 * Export charges rules
 */
export const CHARGES_RULES_JSON = {
  legalFramework: {
    code_civil: 'Article 577-5',
    taux_interet: `${COPROPRIETE_CONSTANTS.TAUX_INTERET_RETARD}% annuel`,
  },
  frais_rappel: {
    premier: COPROPRIETE_CONSTANTS.FRAIS_RAPPEL_1,
    deuxieme: COPROPRIETE_CONSTANTS.FRAIS_RAPPEL_2,
    mise_demeure: COPROPRIETE_CONSTANTS.FRAIS_MISE_DEMEURE,
  },
  delais: {
    rappel_simple: '30 jours',
    rappel_recommande: '45 jours',
    mise_demeure: '60 jours',
    saisie: '90 jours',
  },
};