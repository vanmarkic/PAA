# Guide de Contribution - PAA

Ce guide explique comment ajouter de nouvelles prestations, lois, règles et procédures à la Plateforme d'Aide Administrative.

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Ajouter une nouvelle prestation](#ajouter-une-nouvelle-prestation)
  - [Étape 1 : Types de domaine](#étape-1--types-de-domaine)
  - [Étape 2 : Sources juridiques](#étape-2--sources-juridiques)
  - [Étape 3 : Spécification Gherkin](#étape-3--spécification-gherkin)
  - [Étape 4 : Règles d'éligibilité](#étape-4--règles-déligibilité)
  - [Étape 5 : Machine à états](#étape-5--machine-à-états-procédure)
  - [Étape 6 : Exemple exécutable](#étape-6--exemple-exécutable)
- [Checklist finale](#checklist-finale)
- [Conventions de nommage](#conventions-de-nommage)

---

## Vue d'ensemble

PAA utilise une **architecture hybride** avec 4 technologies complémentaires :

| Technologie | Rôle | Localisation |
|-------------|------|--------------|
| **Gherkin/Cucumber** | Spécifications lisibles par les juristes | `features/` |
| **XState** | Orchestration des procédures (machines à états) | `src/workflows/` |
| **json-rules-engine** | Évaluation dynamique des règles d'éligibilité | `src/rules/` |
| **TypeScript** | Sécurité des types pour les calculs critiques | `src/domain/` |

### Flux de création d'une nouvelle prestation

```
1. Types de domaine     →  src/domain/[nom]Types.ts
2. Sources juridiques   →  src/legal-sources/belgianLegalSources.ts
3. Spécification BDD    →  features/benefits/[nom].feature
4. Règles d'éligibilité →  src/rules/[nom]Rules.ts
5. Machine à états      →  src/workflows/[nom]Machine.ts
6. Exemple exécutable   →  src/examples/[nom]Example.ts
```

---

## Ajouter une nouvelle prestation

### Étape 1 : Types de domaine

#### 1.1 Ajouter le type de prestation

**Fichier : `src/domain/types.ts`**

Ajouter le nouveau type dans l'enum `BenefitType` :

```typescript
export type BenefitType =
  // ... types existants ...
  | 'ma-nouvelle-prestation'; // Ajouter ici
```

#### 1.2 Créer les types spécifiques

**Fichier : `src/domain/[nom]Types.ts`** (nouveau fichier)

```typescript
/**
 * Types spécifiques pour [Nom de la prestation]
 *
 * BASE JURIDIQUE:
 * - Loi du XX mois YYYY concernant...
 *   https://www.ejustice.just.fgov.be/...
 */

// Catégories de bénéficiaires
export type MaPrestationCategory = 'categorie1' | 'categorie2' | 'categorie3';

// Statut de résidence (si applicable)
export type ResidencyStatus =
  | 'belgian-citizen'
  | 'eu-citizen'
  | 'long-term-resident'
  | 'refugee'
  | 'no-valid-status';

// Interface utilisateur/demandeur
export interface MaPrestationUser {
  id: string;
  age: number;
  category: MaPrestationCategory;
  residencyStatus?: ResidencyStatus;
  monthlyIncome: number;
  householdIncome?: number;
  patrimonyValue?: number;
  // Ajouter les champs spécifiques à la prestation
}

// Interface résultat d'éligibilité
export interface MaPrestationResult {
  isEligible: boolean;
  category?: MaPrestationCategory;
  monthlyAmount?: number;
  reason?: string;
  obligations?: string[];
  // Champs spécifiques si besoin
}

// Montants en vigueur (année courante)
export const MA_PRESTATION_AMOUNTS_2024 = {
  categorie1: 500.00,
  categorie2: 750.00,
  categorie3: 1000.00,
};

// Constantes réglementaires
export const MA_PRESTATION_CONSTANTS = {
  MIN_AGE: 18,
  MAX_INCOME: 2000,
  MAX_PATRIMONY: 10000,
};
```

---

### Étape 2 : Sources juridiques

**Fichier : `src/legal-sources/belgianLegalSources.ts`**

Ajouter les références juridiques authentiques :

```typescript
/**
 * Framework juridique pour [Nom de la prestation]
 */
export const MA_PRESTATION_LEGAL_FRAMEWORK = {
  primaryLegislation: {
    type: 'loi' as const,
    title: 'Loi du XX mois YYYY concernant...',
    date: 'YYYY-MM-DD',
    publication: {
      date: 'YYYY-MM-DD',
      reference: 'M.B. du XX/XX/XXXX',
    },
    officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=YYYYMMDDXX&table_name=loi',
    authority: 'SPF Sécurité Sociale', // ou autre autorité
  },
  implementingLegislation: [
    {
      type: 'arrete_royal' as const,
      title: 'Arrêté royal du XX mois YYYY portant...',
      date: 'YYYY-MM-DD',
      officialUrl: 'https://www.ejustice.just.fgov.be/...',
      authority: 'SPF Sécurité Sociale',
    },
  ],
  notes: [
    'Note importante sur l\'application',
    'Modification récente le XX/XX/XXXX',
  ],
};

/**
 * Articles clés de la législation
 */
export const MA_PRESTATION_KEY_ARTICLES = {
  'Article 3': {
    title: 'Conditions d\'octroi',
    conditions: [
      'Être majeur (18 ans minimum)',
      'Résider effectivement en Belgique',
      'Ne pas disposer de ressources suffisantes',
      'Être disposé à travailler (sauf exceptions)',
    ],
  },
  'Article 14': {
    title: 'Montants et catégories',
    paragraph1: {
      categories: {
        categorie1: {
          description: 'Description de la catégorie 1',
          amount: '500,00 EUR par mois',
        },
        categorie2: {
          description: 'Description de la catégorie 2',
          amount: '750,00 EUR par mois',
        },
      },
      indexation: 'Les montants sont liés à l\'indice des prix à la consommation',
    },
  },
};
```

---

### Étape 3 : Spécification Gherkin

**Fichier : `features/benefits/[nom].feature`**

```gherkin
# language: fr
# @specification-version:2024.1.0
# @effective-date:2024-01-01
# @legal-basis:Loi du XX mois YYYY concernant...
# @legal-url:https://www.ejustice.just.fgov.be/...
# @implemented-by:src/rules/[nom]Rules.ts

Fonctionnalité: [Nom de la Prestation]
  Version: 2024.1.0
  En tant que personne sans ressources suffisantes
  Je veux savoir si j'ai droit à [cette prestation]
  Afin de [objectif principal]

  Contexte:
    Étant donné que les montants 2024 sont:
      | Catégorie   | Montant mensuel |
      | Catégorie 1 | 500€            |
      | Catégorie 2 | 750€            |
      | Catégorie 3 | 1000€           |

  # Scénarios positifs (éligibilité)

  Scénario: Personne éligible - cas standard
    Étant donné que je suis dans la catégorie 1
    Et que j'ai 25 ans
    Et que je suis Belge
    Et que mon revenu mensuel est de 200€
    Et que mon patrimoine est de 3000€
    Quand je vérifie mon éligibilité
    Alors je devrais être éligible
    Et le montant devrait être 500€
    Et la catégorie devrait être "categorie1"

  Scénario: Personne éligible - catégorie 2
    Étant donné que je suis dans la catégorie 2
    Et que j'ai 30 ans
    Et que je suis Belge
    Et que mon revenu mensuel est de 0€
    Quand je vérifie mon éligibilité
    Alors je devrais être éligible
    Et le montant devrait être 750€

  # Scénarios négatifs (inéligibilité)

  Scénario: Personne trop jeune
    Étant donné que je suis dans la catégorie 1
    Et que j'ai 17 ans
    Et que je suis Belge
    Quand je vérifie mon éligibilité
    Alors je ne devrais pas être éligible
    Et le motif devrait être "âge minimum non atteint (18 ans requis)"

  Scénario: Revenu trop élevé
    Étant donné que je suis dans la catégorie 1
    Et que j'ai 25 ans
    Et que mon revenu mensuel est de 3000€
    Quand je vérifie mon éligibilité
    Alors je ne devrais pas être éligible
    Et le motif devrait être "revenu supérieur au plafond"

  Scénario: Patrimoine trop élevé
    Étant donné que je suis dans la catégorie 1
    Et que j'ai 25 ans
    Et que mon patrimoine est de 50000€
    Quand je vérifie mon éligibilité
    Alors je ne devrais pas être éligible
    Et le motif devrait être "patrimoine supérieur au plafond"

  Scénario: Sans titre de séjour valide
    Étant donné que je suis dans la catégorie 1
    Et que j'ai 25 ans
    Et que je n'ai pas de titre de séjour valide
    Quand je vérifie mon éligibilité
    Alors je ne devrais pas être éligible
    Et le motif devrait être "pas de titre de séjour valide"

  # Scénarios de calcul

  Plan du Scénario: Calcul selon revenus et catégorie
    Étant donné que je suis <catégorie>
    Et que j'ai 25 ans
    Et que je suis Belge
    Et que mon revenu mensuel est de <revenu>€
    Quand je calcule ma prestation
    Alors le montant devrait être <montant_calculé>€

    Exemples:
      | catégorie   | revenu | montant_calculé |
      | catégorie 1 | 0      | 500             |
      | catégorie 1 | 200    | 300             |
      | catégorie 2 | 0      | 750             |
      | catégorie 2 | 300    | 450             |

  # Obligations

  Scénario: Obligations liées à la prestation
    Étant donné que je suis éligible
    Quand j'accepte la prestation
    Alors je dois [obligation 1]
    Et je dois [obligation 2]
    Et je dois déclarer toute modification de ma situation
```

---

### Étape 4 : Règles d'éligibilité

**Fichier : `src/rules/[nom]Rules.ts`**

```typescript
/**
 * Business Rules for [Nom de la Prestation]
 *
 * Implements the Gherkin specifications from features/benefits/[nom].feature
 *
 * BASE JURIDIQUE:
 * - Loi du XX mois YYYY concernant...
 *   https://www.ejustice.just.fgov.be/...
 */

import { Engine } from 'json-rules-engine';
import {
  MaPrestationUser,
  MaPrestationResult,
  MA_PRESTATION_AMOUNTS_2024,
  MA_PRESTATION_CONSTANTS,
  MaPrestationCategory,
} from '../domain/[nom]Types';
import {
  MA_PRESTATION_LEGAL_FRAMEWORK,
  MA_PRESTATION_KEY_ARTICLES,
} from '../legal-sources/belgianLegalSources';

/**
 * Rules Version Metadata
 * This version MUST match the specification version in features/benefits/[nom].feature
 */
export const MA_PRESTATION_RULES_METADATA = {
  implementsSpecification: '2024.1.0',
  implementationVersion: '2024.1.0',
  implementationStatus: 'complete' as const,
  lastSyncedWith: 'features/benefits/[nom].feature',
  generatedFrom: 'features/benefits/[nom].feature@2024.1.0',
  divergences: [] as string[],
  effectiveDate: '2024-01-01',
};

/**
 * Create the eligibility rules engine
 */
function createEngine(): Engine {
  const engine = new Engine();

  // Règle 1: Âge minimum (priorité haute - condition absolue)
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'age',
          operator: 'lessThan',
          value: MA_PRESTATION_CONSTANTS.MIN_AGE,
        },
      ],
    },
    event: {
      type: 'ineligible',
      params: {
        reason: `âge minimum non atteint (${MA_PRESTATION_CONSTANTS.MIN_AGE} ans requis)`,
        code: 'AGE_MIN_NOT_MET',
      },
    },
    priority: 10,
  });

  // Règle 2: Titre de séjour valide
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'residencyStatus',
          operator: 'equal',
          value: 'no-valid-status',
        },
      ],
    },
    event: {
      type: 'ineligible',
      params: {
        reason: 'pas de titre de séjour valide',
        code: 'NO_VALID_RESIDENCY',
      },
    },
    priority: 10,
  });

  // Règle 3: Revenu maximum
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'monthlyIncome',
          operator: 'greaterThan',
          value: MA_PRESTATION_CONSTANTS.MAX_INCOME,
        },
      ],
    },
    event: {
      type: 'ineligible',
      params: {
        reason: `revenu supérieur au plafond (${MA_PRESTATION_CONSTANTS.MAX_INCOME}€)`,
        code: 'INCOME_TOO_HIGH',
      },
    },
    priority: 9,
  });

  // Règle 4: Patrimoine maximum
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'patrimonyValue',
          operator: 'greaterThan',
          value: MA_PRESTATION_CONSTANTS.MAX_PATRIMONY,
        },
      ],
    },
    event: {
      type: 'ineligible',
      params: {
        reason: `patrimoine supérieur au plafond (${MA_PRESTATION_CONSTANTS.MAX_PATRIMONY}€)`,
        code: 'PATRIMONY_TOO_HIGH',
      },
    },
    priority: 9,
  });

  // Règle 5: Éligibilité de base (toutes conditions remplies)
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: MA_PRESTATION_CONSTANTS.MIN_AGE,
        },
        {
          fact: 'residencyStatus',
          operator: 'notIn',
          value: ['no-valid-status'],
        },
        {
          fact: 'monthlyIncome',
          operator: 'lessThanInclusive',
          value: MA_PRESTATION_CONSTANTS.MAX_INCOME,
        },
      ],
    },
    event: {
      type: 'eligible-basic',
      params: {
        message: 'Conditions de base remplies',
      },
    },
    priority: 5,
  });

  return engine;
}

/**
 * Singleton instance of the rules engine
 * Performance: réutilisation au lieu de recréation à chaque appel
 */
const engineInstance = createEngine();

/**
 * Calculate benefit amount based on category and income
 */
export function calculateAmount(
  category: MaPrestationCategory,
  monthlyIncome: number
): number {
  const baseAmount = MA_PRESTATION_AMOUNTS_2024[category];
  const calculatedAmount = Math.max(0, baseAmount - monthlyIncome);
  return Math.round(calculatedAmount * 100) / 100;
}

/**
 * Check eligibility for a user
 */
export async function checkEligibility(
  user: MaPrestationUser
): Promise<MaPrestationResult> {
  // Préparer les facts pour le moteur de règles
  const facts = {
    age: user.age,
    residencyStatus: user.residencyStatus || 'belgian-citizen',
    monthlyIncome: user.monthlyIncome,
    patrimonyValue: user.patrimonyValue || 0,
  };

  try {
    const results = await engineInstance.run(facts);

    // Vérifier les raisons d'inéligibilité
    const ineligibleEvent = results.events.find((e) => e.type === 'ineligible');

    if (ineligibleEvent) {
      return {
        isEligible: false,
        reason: ineligibleEvent.params?.reason,
      };
    }

    // Vérifier l'éligibilité de base
    const eligibleEvent = results.events.find((e) => e.type === 'eligible-basic');

    if (eligibleEvent) {
      const monthlyAmount = calculateAmount(user.category, user.monthlyIncome);

      return {
        isEligible: true,
        category: user.category,
        monthlyAmount,
        obligations: [
          'Déclarer toute modification de situation',
          'Résider effectivement en Belgique',
          // Ajouter les obligations spécifiques
        ],
      };
    }

    return {
      isEligible: false,
      reason: 'conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Erreur lors de la vérification d'éligibilité: ${error}`);
  }
}

/**
 * Export rules in JSON format for transparency
 */
export const MA_PRESTATION_RULES_JSON = {
  legalFramework: MA_PRESTATION_LEGAL_FRAMEWORK,
  keyArticles: MA_PRESTATION_KEY_ARTICLES,
  rules: [
    {
      id: 'age-requirement',
      description: `Âge minimum: ${MA_PRESTATION_CONSTANTS.MIN_AGE} ans`,
      condition: `age >= ${MA_PRESTATION_CONSTANTS.MIN_AGE}`,
      priority: 10,
    },
    {
      id: 'residency-requirement',
      description: 'Titre de séjour valide requis',
      condition: 'residencyStatus != no-valid-status',
      priority: 10,
    },
    {
      id: 'income-limit',
      description: `Revenu maximum: ${MA_PRESTATION_CONSTANTS.MAX_INCOME}€`,
      condition: `monthlyIncome <= ${MA_PRESTATION_CONSTANTS.MAX_INCOME}`,
      priority: 9,
    },
  ],
  amounts: MA_PRESTATION_AMOUNTS_2024,
  constants: MA_PRESTATION_CONSTANTS,
};
```

---

### Étape 5 : Machine à états (procédure)

**Fichier : `src/workflows/[nom]Machine.ts`**

```typescript
/**
 * XState machine for [Nom de la Prestation] Application Workflow
 *
 * This state machine represents the workflow for applying to [prestation]
 * including eligibility checking and ongoing compliance monitoring.
 */

import { createMachine, assign } from 'xstate';
import { MaPrestationUser, MaPrestationResult } from '../domain/[nom]Types';

interface ApplicationContext {
  user: MaPrestationUser | null;
  eligibilityResult: MaPrestationResult | null;
  complianceIssues: string[];
  retryCount: number;
}

export const maPrestationMachine = createMachine({
  id: 'maPrestation',
  initial: 'idle',

  schemas: {
    context: {} as ApplicationContext,
    events: {} as
      | { type: 'START_APPLICATION'; user: MaPrestationUser }
      | { type: 'ELIGIBILITY_CHECKED'; result: MaPrestationResult }
      | { type: 'ACCEPT' }
      | { type: 'DECLINE' }
      | { type: 'INCOME_CHANGE'; newIncome: number }
      | { type: 'COMPLIANCE_CHECK' }
      | { type: 'COMPLIANCE_OK' }
      | { type: 'COMPLIANCE_ISSUE'; issues: string[] }
      | { type: 'ISSUE_RESOLVED' }
      | { type: 'TERMINATE' }
      | { type: 'RESET' },
  },

  context: {
    user: null,
    eligibilityResult: null,
    complianceIssues: [],
    retryCount: 0,
  },

  states: {
    // État initial - en attente de démarrage
    idle: {
      on: {
        START_APPLICATION: {
          target: 'checkingEligibility',
          actions: assign({
            user: ({ event }: { event: any }) => event.user,
            retryCount: 0,
          }),
        },
      },
      meta: {
        description: 'En attente de démarrage de la demande',
      },
    },

    // Vérification de l'éligibilité
    checkingEligibility: {
      on: {
        ELIGIBILITY_CHECKED: [
          {
            target: 'eligible',
            guard: ({ event }: { event: any }) => event.result.isEligible,
            actions: assign({
              eligibilityResult: ({ event }: { event: any }) => event.result,
            }),
          },
          {
            target: 'ineligible',
            actions: assign({
              eligibilityResult: ({ event }: { event: any }) => event.result,
            }),
          },
        ],
      },
      meta: {
        description: 'Vérification des conditions d\'éligibilité',
      },
    },

    // Éligible - en attente de décision
    eligible: {
      on: {
        ACCEPT: {
          target: 'processing',
        },
        DECLINE: {
          target: 'declined',
        },
      },
      meta: {
        description: 'Personne éligible - en attente de décision d\'acceptation',
      },
    },

    // Non éligible - état final avec motif
    ineligible: {
      on: {
        RESET: {
          target: 'idle',
        },
      },
      meta: {
        description: 'Non éligible - afficher le motif et les alternatives',
      },
    },

    // Décliné par l'utilisateur
    declined: {
      on: {
        RESET: {
          target: 'idle',
        },
      },
      meta: {
        description: 'L\'utilisateur a décliné la prestation',
      },
    },

    // Traitement de la demande
    processing: {
      on: {
        ELIGIBILITY_CHECKED: {
          target: 'active',
          actions: assign({
            eligibilityResult: ({ event }: { event: any }) => event.result,
          }),
        },
      },
      meta: {
        description: 'Traitement administratif de la demande en cours',
      },
    },

    // Prestation active
    active: {
      on: {
        INCOME_CHANGE: {
          target: 'recalculating',
          actions: assign({
            user: ({ context, event }: { context: any; event: any }) => ({
              ...((context.user as any) || {}),
              monthlyIncome: event.newIncome,
            }),
          }),
        },
        COMPLIANCE_CHECK: {
          target: 'checkingCompliance',
        },
        TERMINATE: {
          target: 'terminated',
        },
      },
      meta: {
        description: 'Prestation active - suivi des changements de situation',
      },
    },

    // Recalcul suite à changement de revenus
    recalculating: {
      on: {
        ELIGIBILITY_CHECKED: {
          target: 'active',
          actions: assign({
            eligibilityResult: ({ event }: { event: any }) => event.result,
          }),
        },
      },
      meta: {
        description: 'Recalcul du montant suite à changement de revenus',
      },
    },

    // Vérification de conformité
    checkingCompliance: {
      on: {
        COMPLIANCE_OK: {
          target: 'active',
        },
        COMPLIANCE_ISSUE: {
          target: 'complianceWarning',
          actions: assign({
            complianceIssues: ({ event }: { event: any }) => event.issues,
          }),
        },
      },
      meta: {
        description: 'Vérification du respect des obligations',
      },
    },

    // Avertissement de non-conformité
    complianceWarning: {
      on: {
        ISSUE_RESOLVED: {
          target: 'active',
          actions: assign({
            complianceIssues: [],
          }),
        },
        TERMINATE: {
          target: 'terminated',
        },
      },
      meta: {
        description: 'Problème de conformité détecté - résolution requise',
      },
    },

    // Prestation terminée
    terminated: {
      on: {
        RESET: {
          target: 'idle',
        },
      },
      meta: {
        description: 'Prestation terminée - possibilité de nouvelle demande',
      },
    },
  },
});

/**
 * Visualization of the workflow:
 *
 * idle
 *   → checkingEligibility
 *       ↓ (if eligible)
 *     eligible → [accept] → processing → active
 *       ↓ (if not eligible)              ↓
 *     ineligible                    (income change)
 *                                         ↓
 *                                   recalculating → active
 *                                         ↓
 *                                   (compliance check)
 *                                         ↓
 *                                   checkingCompliance
 *                                      ↓       ↓
 *                                    OK     ISSUE
 *                                      ↓       ↓
 *                                   active  complianceWarning
 *                                              ↓
 *                                         [resolved or terminated]
 */
```

---

### Étape 6 : Exemple exécutable

**Fichier : `src/examples/[nom]Example.ts`**

```typescript
/**
 * Example demonstrating [Nom de la Prestation] eligibility checking
 */

import { MaPrestationUser } from '../domain/[nom]Types';
import { checkEligibility, calculateAmount } from '../rules/[nom]Rules';

async function runExample() {
  console.log('=== [Nom de la Prestation] - Exemples d\'éligibilité ===\n');

  // Exemple 1: Personne éligible
  const eligiblePerson: MaPrestationUser = {
    id: 'user-001',
    age: 25,
    category: 'categorie1',
    residencyStatus: 'belgian-citizen',
    monthlyIncome: 200,
    patrimonyValue: 3000,
  };

  console.log('Exemple 1: Personne éligible');
  console.log('Age: 25, Citoyen belge, Revenu: 200€, Patrimoine: 3000€');
  const result1 = await checkEligibility(eligiblePerson);
  console.log('Résultat:', JSON.stringify(result1, null, 2));
  console.log('\n---\n');

  // Exemple 2: Personne trop jeune
  const tooYoung: MaPrestationUser = {
    id: 'user-002',
    age: 17,
    category: 'categorie1',
    residencyStatus: 'belgian-citizen',
    monthlyIncome: 0,
    patrimonyValue: 1000,
  };

  console.log('Exemple 2: Personne trop jeune');
  console.log('Age: 17, Citoyen belge, Revenu: 0€');
  const result2 = await checkEligibility(tooYoung);
  console.log('Résultat:', JSON.stringify(result2, null, 2));
  console.log('\n---\n');

  // Exemple 3: Revenu trop élevé
  const highIncome: MaPrestationUser = {
    id: 'user-003',
    age: 30,
    category: 'categorie1',
    residencyStatus: 'belgian-citizen',
    monthlyIncome: 3000,
    patrimonyValue: 2000,
  };

  console.log('Exemple 3: Revenu trop élevé');
  console.log('Age: 30, Citoyen belge, Revenu: 3000€');
  const result3 = await checkEligibility(highIncome);
  console.log('Résultat:', JSON.stringify(result3, null, 2));
  console.log('\n---\n');

  // Exemple 4: Sans titre de séjour valide
  const noStatus: MaPrestationUser = {
    id: 'user-004',
    age: 25,
    category: 'categorie1',
    residencyStatus: 'no-valid-status',
    monthlyIncome: 0,
    patrimonyValue: 1000,
  };

  console.log('Exemple 4: Sans titre de séjour valide');
  console.log('Age: 25, Pas de titre valide, Revenu: 0€');
  const result4 = await checkEligibility(noStatus);
  console.log('Résultat:', JSON.stringify(result4, null, 2));
  console.log('\n---\n');

  // Exemple 5: Patrimoine trop élevé
  const highPatrimony: MaPrestationUser = {
    id: 'user-005',
    age: 25,
    category: 'categorie1',
    residencyStatus: 'belgian-citizen',
    monthlyIncome: 0,
    patrimonyValue: 50000,
  };

  console.log('Exemple 5: Patrimoine trop élevé');
  console.log('Age: 25, Citoyen belge, Patrimoine: 50000€');
  const result5 = await checkEligibility(highPatrimony);
  console.log('Résultat:', JSON.stringify(result5, null, 2));
  console.log('\n---\n');

  // Exemple 6: Calcul de montant
  console.log('Exemple 6: Calcul de montant selon revenu');
  const amounts = [
    { category: 'categorie1' as const, income: 0 },
    { category: 'categorie1' as const, income: 200 },
    { category: 'categorie2' as const, income: 0 },
    { category: 'categorie2' as const, income: 300 },
  ];

  amounts.forEach(({ category, income }) => {
    const amount = calculateAmount(category, income);
    console.log(`  ${category}, revenu ${income}€ → montant: ${amount}€`);
  });
}

// Exécuter si appelé directement
if (require.main === module) {
  runExample().catch(console.error);
}

export { runExample };
```

**Ajouter dans `package.json` :**

```json
{
  "scripts": {
    "example:maprestation": "ts-node src/examples/[nom]Example.ts"
  }
}
```

---

## Checklist finale

Avant de soumettre votre nouvelle prestation, vérifiez :

| # | Étape | Fichier | Vérifié |
|---|-------|---------|:-------:|
| 1 | Type ajouté à `BenefitType` | `src/domain/types.ts` | ☐ |
| 2 | Types spécifiques créés | `src/domain/[nom]Types.ts` | ☐ |
| 3 | Sources juridiques ajoutées | `src/legal-sources/belgianLegalSources.ts` | ☐ |
| 4 | Spécification Gherkin créée | `features/benefits/[nom].feature` | ☐ |
| 5 | Règles d'éligibilité implémentées | `src/rules/[nom]Rules.ts` | ☐ |
| 6 | Machine à états créée | `src/workflows/[nom]Machine.ts` | ☐ |
| 7 | Exemple exécutable créé | `src/examples/[nom]Example.ts` | ☐ |
| 8 | Script npm ajouté | `package.json` | ☐ |
| 9 | Tests unitaires passent | `npm test` | ☐ |
| 10 | Tests BDD passent | `npm run cucumber` | ☐ |
| 11 | TypeScript compile | `npm run typecheck` | ☐ |
| 12 | Linting OK | `npm run lint` | ☐ |

---

## Conventions de nommage

| Élément | Convention | Exemple |
|---------|------------|---------|
| Type de prestation | kebab-case | `aide-logement` |
| Fichier Types | camelCase + `Types.ts` | `aideLogementTypes.ts` |
| Fichier Rules | camelCase + `Rules.ts` | `aideLogementRules.ts` |
| Fichier Machine | camelCase + `Machine.ts` | `aideLogementMachine.ts` |
| Fichier Example | camelCase + `Example.ts` | `aideLogementExample.ts` |
| Fichier Feature | kebab-case + `.feature` | `aide-logement.feature` |
| Constantes | SCREAMING_SNAKE_CASE | `AIDE_LOGEMENT_CONSTANTS` |
| Interfaces | PascalCase | `AideLogementUser` |

---

## Ressources

- [Documentation json-rules-engine](https://github.com/CacheControl/json-rules-engine)
- [Documentation XState](https://xstate.js.org/docs/)
- [Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)
- [ejustice.just.fgov.be](https://www.ejustice.just.fgov.be/) - Sources juridiques belges
