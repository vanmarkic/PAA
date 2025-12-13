# Guide de Contribution - PAA

Ce guide explique comment ajouter de nouvelles prestations, lois, règles et procédures à la Plateforme d'Aide Administrative.

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Rôles Humain vs LLM](#rôles-humain-vs-llm)
- [Ajouter une nouvelle prestation](#ajouter-une-nouvelle-prestation)
  - [Étape 1 : Types de domaine](#étape-1--types-de-domaine)
  - [Étape 2 : Sources juridiques](#étape-2--sources-juridiques)
  - [Étape 3 : Spécification Gherkin](#étape-3--spécification-gherkin)
  - [Étape 4 : Règles d'éligibilité](#étape-4--règles-déligibilité)
  - [Étape 5 : Machine à états](#étape-5--machine-à-états-procédure)
  - [Étape 6 : Exemple exécutable](#étape-6--exemple-exécutable)
- [Automatisation avec LLM](#automatisation-avec-llm)
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

## Rôles Humain vs LLM

Chaque étape peut être réalisée par un **humain**, un **LLM** (via API Anthropic, OpenAI, etc.), ou une **combinaison** des deux.

### Matrice des responsabilités

| Étape | Humain | LLM | Commentaire |
|-------|:------:|:---:|-------------|
| **1. Types de domaine** | ⚪ | 🟢 | **LLM recommandé** - Génération de code TypeScript standard |
| **2. Sources juridiques** | 🟡 | 🟡 | **Hybride** - LLM extrait, humain valide les URLs officielles |
| **3. Spécification Gherkin** | 🟡 | 🟡 | **Hybride** - LLM génère, juriste/expert valide la logique |
| **4. Règles d'éligibilité** | ⚪ | 🟢 | **LLM recommandé** - Traduction Gherkin → json-rules-engine |
| **5. Machine à états** | ⚪ | 🟢 | **LLM recommandé** - Pattern XState standardisé |
| **6. Exemple exécutable** | ⚪ | 🟢 | **LLM recommandé** - Génération automatique de cas de test |
| **Validation finale** | 🟢 | ⚪ | **Humain requis** - Revue juridique et tests d'acceptation |

**Légende :** 🟢 Principal | 🟡 Collaboratif | ⚪ Support/Optionnel

### Détail par étape

#### Étapes automatisables par LLM (🤖)

| Étape | Automatisation | Prérequis |
|-------|----------------|-----------|
| **1. Types de domaine** | ✅ 100% | Texte de loi + montants en entrée |
| **4. Règles d'éligibilité** | ✅ 95% | Spécification Gherkin validée |
| **5. Machine à états** | ✅ 90% | Description du workflow |
| **6. Exemple exécutable** | ✅ 100% | Types + Règles générés |

#### Étapes nécessitant validation humaine (👤)

| Étape | Rôle humain | Risque si omis |
|-------|-------------|----------------|
| **2. Sources juridiques** | Vérifier URLs ejustice.just.fgov.be | Liens cassés, références incorrectes |
| **3. Spécification Gherkin** | Valider interprétation juridique | Règles métier erronées |
| **Validation finale** | Revue par expert métier/juriste | Erreurs de calcul, cas limites |

### Workflow recommandé

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW HUMAIN + LLM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  👤 HUMAIN                      🤖 LLM (Anthropic API)          │
│  ────────                       ──────────────────────          │
│                                                                 │
│  1. Fournit le texte de loi ──────► Extrait structure,         │
│     + montants actuels              catégories, conditions      │
│                                            │                    │
│                                            ▼                    │
│  2. Valide les URLs ◄──────────── Génère sources juridiques    │
│     ejustice.just.fgov.be                  │                    │
│                                            ▼                    │
│  3. Valide la logique ◄────────── Génère spec Gherkin          │
│     métier (juriste)                       │                    │
│                                            ▼                    │
│                                   Génère Types, Rules,          │
│                                   Machine, Example               │
│                                            │                    │
│                                            ▼                    │
│  4. Exécute tests ◄──────────────  npm test && npm run cucumber │
│     + revue finale                         │                    │
│                                            ▼                    │
│  5. Merge si OK ────────────────────────► ✅ Déployé           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
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

## Automatisation avec LLM

Cette section explique comment utiliser un LLM (Claude, GPT, etc.) pour automatiser la création de prestations.

### Configuration requise

```bash
# Variables d'environnement pour l'automatisation
export ANTHROPIC_API_KEY="sk-ant-..."      # Pour Claude API
# ou
export OPENAI_API_KEY="sk-..."             # Pour GPT API
```

### Prompts types pour chaque étape

#### Prompt 1 : Extraction de structure juridique (Étape 2-3)

```
Tu es un expert en droit social belge. Analyse le texte de loi suivant et extrait :

1. Les CONDITIONS D'ÉLIGIBILITÉ (âge, résidence, revenus, patrimoine, etc.)
2. Les CATÉGORIES de bénéficiaires avec les MONTANTS associés
3. Les OBLIGATIONS du bénéficiaire
4. Les CAS D'EXCLUSION

Texte de loi :
[COLLER LE TEXTE ICI]

Réponds en JSON structuré.
```

#### Prompt 2 : Génération de spécification Gherkin (Étape 3)

```
À partir de cette structure JSON de conditions d'éligibilité, génère une
spécification Gherkin en français pour PAA.

Inclure :
- Un Contexte avec les montants actuels
- Des scénarios positifs (cas éligibles)
- Des scénarios négatifs (chaque condition de refus)
- Un Plan du Scénario pour les calculs

Structure JSON :
[COLLER LE JSON ICI]

Utilise le format de features/benefits/ris.feature comme modèle.
```

#### Prompt 3 : Génération des règles (Étape 4)

```
À partir de cette spécification Gherkin, génère le fichier de règles
json-rules-engine pour PAA.

Spécification :
[COLLER LE .FEATURE ICI]

Utilise src/rules/risRules.ts comme modèle. Inclure :
- Les métadonnées de version
- Toutes les règles avec priorités (10 = bloquant, 5 = éligibilité de base)
- La fonction de calcul des montants
- L'export JSON des règles
```

#### Prompt 4 : Génération de la machine à états (Étape 5)

```
Génère une machine à états XState pour le workflow de demande de [PRESTATION].

États requis :
- idle → checkingEligibility → eligible/ineligible
- eligible → processing → active
- active (avec monitoring de conformité)
- États terminaux : declined, terminated

Utilise src/workflows/risMachine.ts comme modèle.
```

### Script d'automatisation complet

```typescript
// scripts/generate-benefit.ts
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';

const client = new Anthropic();

interface BenefitInput {
  name: string;           // ex: "aide-logement"
  legalText: string;      // Texte de loi brut
  amounts: Record<string, number>;  // Montants actuels
  officialUrl: string;    // URL ejustice.just.fgov.be
}

async function generateBenefit(input: BenefitInput) {
  // Étape 1: Extraire la structure
  const structureResponse = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `Analyse ce texte de loi belge et extrait les conditions
                d'éligibilité, catégories, montants et obligations en JSON:

                ${input.legalText}`
    }]
  });

  const structure = JSON.parse(structureResponse.content[0].text);

  // Étape 2: Générer le Gherkin
  const gherkinResponse = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `Génère une spec Gherkin en français pour cette prestation:
                ${JSON.stringify(structure)}

                Montants: ${JSON.stringify(input.amounts)}
                URL légale: ${input.officialUrl}`
    }]
  });

  // Étape 3: Générer les fichiers TypeScript
  // ... (Types, Rules, Machine, Example)

  // Écrire les fichiers
  fs.writeFileSync(
    `features/benefits/${input.name}.feature`,
    gherkinResponse.content[0].text
  );

  console.log(`✅ Prestation ${input.name} générée`);
  console.log('⚠️  Validation humaine requise pour :');
  console.log('   - URLs juridiques');
  console.log('   - Logique métier Gherkin');
  console.log('   - Montants et seuils');
}
```

### Commande tout-en-un : `npm run add-law`

Le script `add-new-law.ts` intègre toutes les étapes en une seule commande :

```bash
# Mode 1: Recherche automatique de sources (🔎 recommandé)
npm run add-law -- --benefit="allocation-chauffage"

# Mode 2: Recherche auto + sélection automatique de la meilleure source
npm run add-law -- --benefit="allocation-chauffage" --auto

# Mode 3: Dry-run (voir les sources trouvées sans générer de fichiers)
npm run add-law -- --benefit="allocation-chauffage" --dry-run

# Mode 4: URL directe (si vous connaissez déjà la source)
npm run add-law -- --url="https://ejustice.just.fgov.be/..."

# Mode 5: Texte brut (copié depuis un PDF/document)
npm run add-law -- --text="Article 1. ..." --title="Loi du..." --authority="SPF"
```

#### Fonctionnement du mode `--benefit`

```
┌─────────────────────────────────────────────────────────────────┐
│                  npm run add-law --benefit="..."                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 🔍 Recherche de sources officielles                        │
│     └─► Claude analyse le nom de la prestation                 │
│     └─► Retourne des URLs ejustice.just.fgov.be, moniteur.be   │
│                                                                 │
│  2. 📊 Scoring des sources trouvées                            │
│     ┌────────────────────────────────────────┐                 │
│     │ Score │ Source                         │                 │
│     │  10   │ ejustice.just.fgov.be          │                 │
│     │  10   │ etaamb.openjustice.be          │                 │
│     │   9   │ moniteur.be                    │                 │
│     │   8   │ belgium.be / onem.be           │                 │
│     │   5   │ Sources inconnues              │                 │
│     └────────────────────────────────────────┘                 │
│                                                                 │
│  3. ✅ Sélection automatique                                   │
│     └─► Score ≥ 9 : auto-sélection                             │
│     └─► Score 7-8 : warning, vérification recommandée          │
│     └─► Score < 7 : vérification humaine requise               │
│                                                                 │
│  4. 🚀 Pipeline de génération                                  │
│     └─► Extraction du texte légal                              │
│     └─► Génération Gherkin, Rules, Machine                     │
│     └─► Validation de conformité                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Options disponibles

| Option | Description |
|--------|-------------|
| `--benefit="..."` | Nom de la prestation (déclenche recherche auto) |
| `--url="https://..."` | URL directe vers la source légale |
| `--text="..."` | Texte légal brut |
| `--title="..."` | Titre de la loi (requis avec --text) |
| `--authority="..."` | Autorité compétente (requis avec --text) |
| `--auto` | Sélectionne automatiquement la meilleure source |
| `--dry-run` | Affiche les sources sans générer de fichiers |

#### Exemple de sortie

```
═══════════════════════════════════════════════════════════
🔎 MODE: Recherche automatique de sources
   Prestation: "allocation-chauffage"
═══════════════════════════════════════════════════════════

🔍 Searching official sources for "allocation-chauffage"...

📋 Found sources:

   1. ✅ [10/10] Arrêté royal du 21 janvier 2003 concernant l'allocation chauffage
      https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?...
      Official Belgian legal database (ejustice.just.fgov.be)

   2. 🟡 [8/10] Allocation chauffage - SPF Économie
      https://economie.fgov.be/fr/themes/energie/...
      Official Belgian government website

✅ Auto-selecting best source (score 10/10):
   Arrêté royal du 21 janvier 2003 concernant l'allocation chauffage
   https://www.ejustice.just.fgov.be/...

🚀 Starting pipeline...

✅ Success! Generated:
   📄 Feature: features/benefits/allocation-chauffage.feature
   ⚙️  Rules: src/rules/allocationChauffageRules.ts
   🤖 Machine: src/workflows/allocationChauffageMachine.ts

💡 Next steps:
   1. Review generated files
   2. Update src/domain/legalMetadata.ts with legal source
   3. Run tests: npm test
   4. Check compliance: npm run check:versions
```

### Coût estimé par prestation

| Modèle | Tokens (~) | Coût estimé |
|--------|-----------|-------------|
| Claude Sonnet | ~15k input, ~8k output | ~$0.15 |
| Claude Opus | ~15k input, ~8k output | ~$0.75 |
| GPT-4o | ~15k input, ~8k output | ~$0.20 |

**Recommandation :** Utiliser Sonnet pour la génération, Opus pour la validation complexe.

### Validation automatisée

```bash
# Après génération LLM, exécuter la validation
npm run typecheck           # Vérifier types TypeScript
npm run lint               # Vérifier style de code
npm test                   # Tests unitaires
npm run cucumber           # Tests BDD

# Si tout passe → PR pour revue humaine
```

### Limitations connues des LLM

| Aspect | Limitation | Mitigation |
|--------|------------|------------|
| **URLs** | Peut inventer des URLs | Toujours vérifier sur ejustice.just.fgov.be |
| **Montants** | Peut utiliser des montants obsolètes | Fournir les montants actuels en entrée |
| **Cas limites** | Peut manquer des exceptions légales | Revue par expert juridique |
| **Calculs complexes** | Peut mal interpréter les formules | Tests avec cas réels |

---

## Checklist finale

Avant de soumettre votre nouvelle prestation, vérifiez :

| # | Étape | Fichier | Acteur | Vérifié |
|---|-------|---------|:------:|:-------:|
| 1 | Type ajouté à `BenefitType` | `src/domain/types.ts` | 🤖 | ☐ |
| 2 | Types spécifiques créés | `src/domain/[nom]Types.ts` | 🤖 | ☐ |
| 3 | Sources juridiques ajoutées | `src/legal-sources/belgianLegalSources.ts` | 🤖+👤 | ☐ |
| 4 | Spécification Gherkin créée | `features/benefits/[nom].feature` | 🤖+👤 | ☐ |
| 5 | Règles d'éligibilité implémentées | `src/rules/[nom]Rules.ts` | 🤖 | ☐ |
| 6 | Machine à états créée | `src/workflows/[nom]Machine.ts` | 🤖 | ☐ |
| 7 | Exemple exécutable créé | `src/examples/[nom]Example.ts` | 🤖 | ☐ |
| 8 | Script npm ajouté | `package.json` | 🤖 | ☐ |
| 9 | Tests unitaires passent | `npm test` | 🤖 | ☐ |
| 10 | Tests BDD passent | `npm run cucumber` | 🤖 | ☐ |
| 11 | TypeScript compile | `npm run typecheck` | 🤖 | ☐ |
| 12 | Linting OK | `npm run lint` | 🤖 | ☐ |
| 13 | **URLs vérifiées** | Sources juridiques | 👤 | ☐ |
| 14 | **Logique métier validée** | Spec Gherkin | 👤 | ☐ |
| 15 | **Revue finale** | Tous les fichiers | 👤 | ☐ |

**Légende :** 🤖 LLM | 👤 Humain | 🤖+👤 Collaboration

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
