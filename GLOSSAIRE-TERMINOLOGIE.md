# Glossaire de Terminologie PAA

Ce document définit la terminologie officielle du projet PAA, remplaçant les termes anglophones par des termes français explicites adaptés au contexte administratif belge.

## Objectifs

1. Rendre le code **plus accessible** aux parties prenantes belges (experts juridiques, travailleurs sociaux)
2. Assurer la **cohérence linguistique** avec le contexte administratif belge
3. Réduire la **barrière cognitive** pour les non-développeurs
4. Améliorer la **maintenabilité** par des équipes locales

## Terminologie Principale

### Concepts Métier de Base

| Ancien Terme | Nouveau Terme FR | NL | DE | Usage |
|--------------|------------------|----|----|-------|
| **rules** | `regles-eligibilite` | `toelatingsregels` | `zulassungsregeln` | Règles déterminant l'éligibilité aux prestations |
| **workflows** | `processus-administratifs` | `administratief-proces` | `verwaltungsprozess` | Parcours administratif d'une demande |
| **features** | `specifications-metier` | `bedrijfsspecificaties` | `geschaeftsspezifikationen` | Spécifications fonctionnelles en Gherkin |
| **state machine** | `automate-etats` | `toestandsautomaat` | `zustandsautomat` | Machine à états finis (XState) |
| **domain** | `modele-metier` | `bedrijfsmodel` | `geschaeftsmodell` | Modèle de domaine métier (DDD) |

### Architecture et Services

| Ancien Terme | Nouveau Terme FR | NL | DE | Usage |
|--------------|------------------|----|----|-------|
| **service** | `gestionnaire-operations` | `operatiebeheerder` | `operationsverwalter` | Coordination des opérations métier |
| **controller** | `controleur-requetes` | `aanvraagcontroleur` | `anfragenkontrolleur` | Gestion des requêtes HTTP/API |
| **middleware** | `intercepteur-requetes` | `aanvraaginterceptor` | `anfrageinterceptor` | Filtrage et interception des requêtes |
| **handler** | `gestionnaire-evenements` | `gebeurtenisbeheerder` | `ereignisverwalter` | Traitement d'événements |
| **builder/factory** | `constructeur-objets` | `objectbouwer` | `objektkonstruktor` | Patterns de création |

### Infrastructure

| Ancien Terme | Nouveau Terme FR | NL | DE | Usage |
|--------------|------------------|----|----|-------|
| **cache** | `memoire-temporaire` | `tijdelijk-geheugen` | `zwischenspeicher` | Stockage temporaire rapide |
| **queue** | `file-traitement` | `verwerkingswachtrij` | `verarbeitungsqueue` | File d'attente de traitement |
| **utils/helper** | `outils-assistance` | `hulpmiddelen` | `hilfswerkzeuge` | Fonctions utilitaires |
| **test** | `verification-conformite` | `conformiteitscontrole` | `konformitaetspruefung` | Tests et validations |

## Structure des Répertoires

### Avant (Anglais)
```
src/
├── rules/
├── workflows/
├── domain/
├── services/
├── api/
│   └── controllers/
├── middleware/
├── cache/
├── queue/
└── utils/

features/
```

### Après (Français Explicite)
```
src/
├── regles-eligibilite/
├── processus-administratifs/
├── modele-metier/
├── gestionnaires-operations/
├── api/
│   └── controleurs-requetes/
├── intercepteurs-requetes/
├── memoire-temporaire/
├── file-traitement/
└── outils-assistance/

specifications-metier/
```

## Conventions de Nommage

### Répertoires
- **Format:** `kebab-case` (minuscules avec tirets)
- **Langue:** Français
- **Exemples:**
  - ✅ `regles-eligibilite/`
  - ✅ `processus-administratifs/`
  - ✅ `modele-metier/`

### Fichiers TypeScript
- **Format:** `kebab-case.ts` avec suffixe descriptif
- **Exemples:**
  - ✅ `regles-eligibilite-ris.ts`
  - ✅ `automate-demande-ris.ts`
  - ✅ `gestionnaire-conversion-textes.ts`

### Classes
- **Format:** `PascalCase` en français
- **Exemples:**
  - ✅ `EvaluateurEligibiliteRIS`
  - ✅ `AutomateEtatsConversion`
  - ✅ `GestionnaireOperationsAGR`

### Fonctions
- **Format:** `camelCase` avec verbe français
- **Exemples:**
  - ✅ `verifierEligibilite()`
  - ✅ `calculerMontantPrestation()`
  - ✅ `validerCriteresResidence()`

### Variables
- **Format:** `camelCase` en français
- **Exemples:**
  - ✅ `utilisateur`
  - ✅ `montantPrestation`
  - ✅ `criteresEligibilite`

## Cas Spéciaux

### Technologies Externes (à conserver)
Les noms de technologies, protocoles et standards restent en anglais :
- ✅ API, REST, HTTP, HTTPS
- ✅ JWT, OAuth
- ✅ Redis, PostgreSQL, TypeORM
- ✅ Docker, npm
- ✅ Swagger, OpenAPI

### Wrappers pour Bibliothèques
Encapsuler les bibliothèques externes avec des noms français :
- `json-rules-engine` → Classe: `MoteurReglesDynamiques`
- `XState` → Classe: `GestionnaireAutomatesXState`
- `TypeORM entities` → Répertoire: `entites-persistantes/`

### Formats Gherkin
- Répertoire: `specifications-metier/`
- Extension: Conserver `.feature`
- Contenu: Français

## Phases d'Implémentation

### 🔴 Phase 1 - URGENT (Semaine 1)
Changements structurels critiques :
1. `rules/` → `regles-eligibilite/`
2. `workflows/` → `processus-administratifs/`
3. `features/` → `specifications-metier/`
4. `domain/` → `modele-metier/`

### 🟡 Phase 2 - MOYEN (Semaines 2-3)
Changements architecturaux :
5. `services/` → `gestionnaires-operations/`
6. `controllers/` → `controleurs-requetes/`
7. `middleware/` → `intercepteurs-requetes/`
8. `utils/` → `outils-assistance/`

### 🟢 Phase 3 - OPTIONNEL (Mois 2)
Changements d'infrastructure :
9. `cache/` → `memoire-temporaire/`
10. `queue/` → `file-traitement/`
11. Tests → `verifications-conformite/`

## Exemples de Refactoring

### Exemple 1: Règles d'Éligibilité

**Avant:**
```typescript
// src/rules/risRules.ts
export class RISRuleEngine {
  checkEligibility(user: User): boolean {
    // ...
  }
}
```

**Après:**
```typescript
// src/regles-eligibilite/regles-eligibilite-ris.ts
export class EvaluateurEligibiliteRIS {
  verifierCriteresEligibilite(utilisateur: Utilisateur): boolean {
    // ...
  }
}
```

### Exemple 2: Processus Administratif

**Avant:**
```typescript
// src/workflows/conversionMachine.ts
export const conversionMachine = createMachine({
  id: 'conversion',
  initial: 'idle',
  // ...
});
```

**Après:**
```typescript
// src/processus-administratifs/automate-conversion-texte-legal.ts
export const automateConversionTexteLegal = createMachine({
  id: 'conversion-texte-legal',
  initial: 'attente',
  // ...
});
```

### Exemple 3: Spécifications Métier

**Avant:**
```gherkin
# features/benefits/ris.feature
Feature: RIS eligibility check
```

**Après:**
```gherkin
# specifications-metier/prestations/ris.specification
Fonctionnalité: Vérification d'éligibilité au RIS
```

## Migration des Imports

### Script de Remplacement Automatique

```bash
# Mise à jour des imports TypeScript
find . -name "*.ts" -exec sed -i 's|from.*\/rules\/|from "@/regles-eligibilite/|g' {} \;
find . -name "*.ts" -exec sed -i 's|from.*\/workflows\/|from "@/processus-administratifs/|g' {} \;
find . -name "*.ts" -exec sed -i 's|from.*\/domain\/|from "@/modele-metier/|g' {} \;
find . -name "*.ts" -exec sed -i 's|from.*\/services\/|from "@/gestionnaires-operations/|g' {} \;
```

## Validation

### Checklist de Cohérence

- [ ] Tous les répertoires utilisent `kebab-case` français
- [ ] Tous les fichiers TypeScript ont des noms français explicites
- [ ] Toutes les classes utilisent `PascalCase` français
- [ ] Toutes les fonctions utilisent `camelCase` avec verbes français
- [ ] Les imports sont mis à jour
- [ ] La documentation est synchronisée
- [ ] Les tests passent sans régression
- [ ] Les trois langues (FR/NL/DE) sont cohérentes

## Ressources

- **CLAUDE.md** - Instructions de développement
- **README.md** - Documentation projet
- **Documentation XState** - https://xstate.js.org/
- **TypeORM** - https://typeorm.io/
- **Gherkin/Cucumber** - https://cucumber.io/

## Maintenance

Ce glossaire doit être mis à jour à chaque introduction de nouveau concept ou pattern architectural. Tout ajout de terminologie anglophone doit être justifié et documenté.

---

**Version:** 1.0.0
**Date:** 2025-11-17
**Statut:** En cours d'implémentation (Phase 1)
