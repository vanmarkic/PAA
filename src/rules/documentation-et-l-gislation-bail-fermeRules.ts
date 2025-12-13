/**
 * Business Rules for Bail à ferme en Wallonie
 *
 * Implements the Gherkin specifications from features/benefits/documentation-et-l-gislation-bail-ferme.feature
 * Using json-rules-engine for runtime evaluation.
 *
 * BASE JURIDIQUE:
 * - Documentation et législation - Bail à ferme
 *   https://agriculture.wallonie.be/home/ruralite-et-foncier/foncier/foncier-agricole/louer/bail-a-ferme/legislation-et-documentation.html
 */

import { Engine } from 'json-rules-engine';
import { User, EligibilityCheck } from '../domain/types';

/**
 * DocumentationEtLGislationBailFerme Rules Version Metadata
 * This version MUST match the specification version in features/benefits/documentation-et-l-gislation-bail-ferme.feature
 */
export const DOCUMENTATION_ET_L_GISLATION_BAIL_FERME_RULES_METADATA = {
  implementsSpecification: '1.0.0',
  implementationVersion: '1.0.0',
  implementationStatus: 'complete' as const,
  lastSyncedWith: 'features/benefits/documentation-et-l-gislation-bail-ferme.feature',
  generatedFrom: 'features/benefits/documentation-et-l-gislation-bail-ferme.feature@1.0.0',
  divergences: [] as string[],
  effectiveDate: '2025-12-13',
};

// Constants from Belgian agricultural law - Bail à ferme
export const BAIL_FERME_CONSTANTS = {
  REGION: 'Wallonie',
  SUPERVISING_AUTHORITY: 'Agence du foncier agricole',
  NOTIFICATION_AUTHORITY: 'Observatoire du foncier agricole',
  REGISTRATION_AUTHORITY: 'SPF Finances',
};

export const BAIL_TYPES = [
  'Bail classique',
  'Bail de carrière',
  'Bail de longue durée',
  'Bail de fin de carrière',
  'Bail de courte durée',
] as const;

export type BailType = (typeof BAIL_TYPES)[number];

export type RoleType = 'bailleur' | 'preneur' | 'personne_publique';

export type ActionType =
  | 'conclusion_bail'
  | 'cession_bail'
  | 'alienation_bien'
  | 'sous_location'
  | 'echange_culture'
  | 'contrat_culture'
  | 'resiliation_amiable'
  | 'donation'
  | 'succession';

export type EventType =
  | 'deces_preneur'
  | 'deces_bailleur'
  | 'fin_plein_droit'
  | 'declaration_revenus'
  | 'location_biens_publics';

export interface BailFermeInput {
  role: RoleType;
  actionType?: ActionType;
  eventType?: EventType;
  bailType?: BailType;
  hasWrittenContract: boolean;
  hasEtatDesLieux: boolean;
  isNotifiedToObservatoire: boolean;
  isRegisteredSPF: boolean;
  isPublicProperty: boolean;
  hasMutualAgreement: boolean;
  coefficientFermage?: number;
  surfaceHectares?: number;
}

/**
 * Create the DocumentationEtLGislationBailFerme eligibility rules engine
 *
 * IMPLEMENTATION NOTES:
 * - Extract conditions from "Étant donné" steps in Gherkin scenarios
 * - Map conditions to json-rules-engine facts
 * - Extract events from "Quand" steps
 * - Extract outcomes from "Alors" steps
 * - Use priority to order rule evaluation (higher = checked first)
 */
function createDocumentationEtLGislationBailFermeEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Bail type selection - validate bail type choice
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'actionType',
          operator: 'equal',
          value: 'conclusion_bail',
        },
        {
          fact: 'bailType',
          operator: 'in',
          value: BAIL_TYPES,
        },
      ],
    },
    event: {
      type: 'bail-type-valid',
      params: {
        message: 'Type de bail valide sélectionné',
        requirement: 'choix_type_bail',
      },
    },
    priority: 100,
  });

  // Rule 2: Written contract obligation
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'actionType',
          operator: 'equal',
          value: 'conclusion_bail',
        },
        {
          fact: 'hasWrittenContract',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'documentationEtLGislationBailFerme-ineligible',
      params: {
        reason: 'Un écrit est obligatoire pour formaliser le bail à ferme',
        requirement: 'ecrit_obligatoire',
      },
    },
    priority: 90,
  });

  // Rule 3: État des lieux requirement
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'actionType',
          operator: 'equal',
          value: 'conclusion_bail',
        },
        {
          fact: 'hasEtatDesLieux',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'documentationEtLGislationBailFerme-ineligible',
      params: {
        reason: "Un état des lieux doit être réalisé lors de l'entrée en vigueur du bail",
        requirement: 'etat_des_lieux',
      },
    },
    priority: 85,
  });

  // Rule 4: Notification to Observatoire du foncier agricole
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'actionType',
          operator: 'equal',
          value: 'conclusion_bail',
        },
        {
          fact: 'isNotifiedToObservatoire',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'documentationEtLGislationBailFerme-ineligible',
      params: {
        reason: "Le bail doit être notifié à l'Observatoire du foncier agricole",
        requirement: 'notification_observatoire',
      },
    },
    priority: 80,
  });

  // Rule 5: Registration at SPF Finances
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'actionType',
          operator: 'equal',
          value: 'conclusion_bail',
        },
        {
          fact: 'isRegisteredSPF',
          operator: 'equal',
          value: false,
        },
      ],
    },
    event: {
      type: 'documentationEtLGislationBailFerme-ineligible',
      params: {
        reason: 'Le bail doit être enregistré au SPF Finances',
        requirement: 'enregistrement_spf',
      },
    },
    priority: 75,
  });

  // Rule 6: Fermage calculation requirement
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'role',
          operator: 'in',
          value: ['bailleur', 'preneur'],
        },
        {
          fact: 'coefficientFermage',
          operator: 'greaterThan',
          value: 0,
        },
      ],
    },
    event: {
      type: 'fermage-calculation-applicable',
      params: {
        message: 'Le fermage est calculé selon les coefficients de fermage en vigueur',
        requirement: 'calcul_fermage',
      },
    },
    priority: 70,
  });

  // Rule 7: Public property specific rules
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isPublicProperty',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'role',
          operator: 'equal',
          value: 'personne_publique',
        },
      ],
    },
    event: {
      type: 'public-property-rules-apply',
      params: {
        message: 'Règles spécifiques de mise en location de biens publics applicables',
        additionalInfo: 'Des contrats de gestion peuvent être conclus',
        requirement: 'biens_publics',
      },
    },
    priority: 65,
  });

  // Rule 8: Transmission by death of tenant (preneur)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'eventType',
          operator: 'equal',
          value: 'deces_preneur',
        },
      ],
    },
    event: {
      type: 'transmission-deces-preneur',
      params: {
        message: 'Les règles de transmission du bail par décès du preneur s\'appliquent',
        requirement: 'transmission_deces_preneur',
      },
    },
    priority: 60,
  });

  // Rule 9: Transmission by death of landlord (bailleur)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'eventType',
          operator: 'equal',
          value: 'deces_bailleur',
        },
      ],
    },
    event: {
      type: 'transmission-deces-bailleur',
      params: {
        message: 'Les règles de transmission du bail par décès du bailleur s\'appliquent',
        requirement: 'transmission_deces_bailleur',
      },
    },
    priority: 60,
  });

  // Rule 10: Lease assignment (cession)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'role',
          operator: 'equal',
          value: 'preneur',
        },
        {
          fact: 'actionType',
          operator: 'equal',
          value: 'cession_bail',
        },
      ],
    },
    event: {
      type: 'cession-rules-apply',
      params: {
        message: 'Les règles de cession prévues par la législation doivent être respectées',
        requirement: 'cession_bail',
      },
    },
    priority: 55,
  });

  // Rule 11: Alienation of rented property
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'role',
          operator: 'equal',
          value: 'bailleur',
        },
        {
          fact: 'actionType',
          operator: 'equal',
          value: 'alienation_bien',
        },
      ],
    },
    event: {
      type: 'alienation-rules-apply',
      params: {
        message: "Les règles d'aliénation des biens s'appliquent",
        requirement: 'alienation_biens',
      },
    },
    priority: 55,
  });

  // Rule 12: Subletting
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'role',
          operator: 'equal',
          value: 'preneur',
        },
        {
          fact: 'actionType',
          operator: 'equal',
          value: 'sous_location',
        },
      ],
    },
    event: {
      type: 'sous-location-rules-apply',
      params: {
        message: 'Les conditions relatives aux sous-locations doivent être respectées',
        requirement: 'sous_location',
      },
    },
    priority: 50,
  });

  // Rule 13: Crop exchange
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'actionType',
          operator: 'equal',
          value: 'echange_culture',
        },
      ],
    },
    event: {
      type: 'echange-culture-rules-apply',
      params: {
        message: 'Les règles relatives aux échanges de culture doivent être respectées',
        requirement: 'echange_culture',
      },
    },
    priority: 50,
  });

  // Rule 14: Crop contract
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'actionType',
          operator: 'equal',
          value: 'contrat_culture',
        },
      ],
    },
    event: {
      type: 'contrat-culture-rules-apply',
      params: {
        message: 'Les dispositions spécifiques aux contrats de culture s\'appliquent',
        requirement: 'contrat_culture',
      },
    },
    priority: 50,
  });

  // Rule 15: End of lease by operation of law
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'eventType',
          operator: 'equal',
          value: 'fin_plein_droit',
        },
      ],
    },
    event: {
      type: 'fin-plein-droit',
      params: {
        message: 'Le bail prend fin automatiquement',
        requirement: 'fin_plein_droit',
      },
    },
    priority: 45,
  });

  // Rule 16: Amicable termination
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'actionType',
          operator: 'equal',
          value: 'resiliation_amiable',
        },
        {
          fact: 'hasMutualAgreement',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'resiliation-amiable-possible',
      params: {
        message: 'Une résiliation amiable peut être conclue',
        requirement: 'resiliation_amiable',
      },
    },
    priority: 45,
  });

  // Rule 17: Personal income tax on bail à ferme revenues
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'eventType',
          operator: 'equal',
          value: 'declaration_revenus',
        },
      ],
    },
    event: {
      type: 'fiscalite-ipp-apply',
      params: {
        message: "Les règles d'impôt des personnes physiques relatives au bail à ferme s'appliquent",
        requirement: 'fiscalite_ipp',
      },
    },
    priority: 40,
  });

  // Rule 18: Donation rights
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'actionType',
          operator: 'equal',
          value: 'donation',
        },
      ],
    },
    event: {
      type: 'droits-donation-apply',
      params: {
        message: 'Les droits de donation spécifiques s\'appliquent',
        requirement: 'droits_donation',
      },
    },
    priority: 40,
  });

  // Rule 19: Succession rights
  engine.addRule({
    conditions: {
      all: [
        { fact: 'bailType', operator: 'equal', value: 'bail-ferme' },
        { fact: 'succession', operator: 'equal', value: true },
      ],
    },
    event: {
      type: 'succession-rights',
      params: { message: 'Droits de succession applicables au bail à ferme' },
    },
    priority: 35,
  });

  return engine;
}