# 📦 Architecture des Métadonnées - Design Optimisé

## 🎯 Problème Résolu

**Avant**: Fichiers JSON énormes (20k-50k lignes) contenant toutes les métadonnées
- `machines-metadata.json`: ~50k lignes
- `features-metadata.json`: ~47k lignes  
- `rules-metadata.json`: ~20k lignes

**Après**: Fichiers individuels par item (~1-5 KB chacun)
- `machines/{machineId}.json`: ~2-5 KB
- `rules/{ruleId}.json`: ~1-3 KB
- `features/{featureId}.json`: ~2-4 KB

## 📁 Structure des Fichiers

```
docs-astro/public/
├── machines/
│   ├── risApplication.json          # ~3 KB
│   ├── allocationChomage.json       # ~4 KB
│   └── ... (131 fichiers)
├── rules/
│   ├── ris-eligible.json            # ~2 KB
│   ├── ris-income-check.json        # ~1.5 KB
│   └── ... (178 fichiers)
├── features/
│   ├── benefits-ris.json            # ~3 KB
│   ├── benefits-agr.json            # ~2.5 KB
│   └── ... (178 fichiers)
├── machines-index.json              # ~5 KB (liste seulement)
├── rules-index.json                 # ~4 KB (liste seulement)
└── features-index.json              # ~4 KB (liste seulement)
```

## 🚀 Avantages

### Performance
- ✅ **Chargement à la demande**: Seulement le fichier nécessaire est chargé
- ✅ **Cache efficace**: Un seul fichier modifié = seulement ce fichier est re-téléchargé
- ✅ **Taille réduite**: 2-5 KB par page vs 50 KB pour tout
- ✅ **Build plus rapide**: Génération incrémentale possible

### Maintenabilité
- ✅ **Mise à jour ciblée**: Modifier une machine ne nécessite pas de re-générer tout
- ✅ **Versioning**: Chaque fichier peut avoir sa propre version
- ✅ **Debugging**: Plus facile de voir quel fichier pose problème

### Développement
- ✅ **Hot reload**: Astro peut recharger seulement le fichier modifié
- ✅ **Tests**: Plus facile de tester avec des fichiers individuels
- ✅ **CI/CD**: Builds plus rapides

## 🔧 Génération

### Scripts

```bash
# Génère les fichiers individuels
npm run docs:individual

# Build complet (inclut individual)
npm run docs:build
```

### Processus

1. **Génération des métadonnées agrégées** (pour compatibilité)
   ```bash
   npm run docs:metadata      # machines-metadata.json
   npm run rules:metadata      # rules-metadata.json
   npm run features:metadata   # features-metadata.json
   ```

2. **Génération des fichiers individuels**
   ```bash
   npm run docs:individual
   ```
   
   Ce script:
   - Lit les fichiers agrégés
   - Extrait les sources légales depuis `legalMetadata.ts`
   - Génère un fichier JSON par machine/règle/feature
   - Crée des index légers pour la navigation

## 📊 Structure d'un Fichier Individuel

### Machine (`machines/{id}.json`)

```json
{
  "id": "risApplication",
  "name": "RIS Application Workflow",
  "category": "social",
  "description": "...",
  "states": [...],
  "events": [...],
  "initial": "idle",
  "legalSources": {
    "sources": [
      {
        "authority": "SPF Intégration Sociale",
        "title": "Revenu d'Intégration Sociale",
        "officialUrl": "https://www.mi-is.be/fr/cpas/ris",
        "publicationDate": "2024-01-01T00:00:00.000Z",
        "effectiveDate": "2024-01-01T00:00:00.000Z"
      }
    ],
    "extractionDate": "2024-11-16T00:00:00.000Z",
    "lastLegislativeUpdate": "2024-01-01T00:00:00.000Z",
    "version": "2024.1.0",
    "dataFreshness": {
      "status": "current",
      "label": "Données à jour (30 jours)",
      "daysOld": 30
    }
  },
  "generated": "2025-11-18T08:48:41.115Z"
}
```

### Règle (`rules/{id}.json`)

```json
{
  "id": "ris-eligible",
  "description": "Vérifie l'éligibilité au RIS",
  "category": "social",
  "benefitType": "RIS",
  "priority": 1,
  "conditions": {...},
  "event": {...},
  "legalSources": {
    "sources": [...]
  },
  "generated": "..."
}
```

## 🔌 Utilisation dans Astro

### Chargement d'une Machine

```typescript
// docs-astro/src/pages/workflows/[id].astro
import { loadMachine } from '../../lib/loadIndividual';

const machine = await loadMachine(machineId);
```

### Affichage des Sources

```astro
---
import LegalSources from '../../components/LegalSources.astro';
---

<LegalSources machineId={machine.id} />
```

Le composant `LegalSources` charge automatiquement les sources depuis le fichier individuel.

## 📈 Métriques

### Taille des Fichiers

| Type | Avant | Après | Réduction |
|------|-------|-------|-----------|
| Machines | 50 KB | 2-5 KB/file | 90-96% |
| Rules | 20 KB | 1-3 KB/file | 85-95% |
| Features | 47 KB | 2-4 KB/file | 91-96% |

### Temps de Chargement

- **Avant**: 50 KB chargé même pour une seule page
- **Après**: 2-5 KB chargé seulement pour la page visitée
- **Gain**: ~90% de données en moins par page

## 🔄 Migration

Les anciens fichiers (`*-metadata.json`) sont toujours générés pour:
- Compatibilité avec le code existant
- Index de navigation
- Fallback si fichiers individuels manquants

Le code Astro utilise les fichiers individuels en priorité, avec fallback vers les fichiers agrégés.

## 🎨 Affichage des Sources

Les sources légales sont affichées automatiquement sur:
- `/workflows/{id}` - Procédures
- `/rules/{id}` - Règles d'éligibilité  
- `/features/{id}` - Spécifications Gherkin

Chaque source affiche:
- ✅ Titre et autorité
- ✅ Lien vers le site officiel
- ✅ Date de publication et d'entrée en vigueur
- ✅ Région et langue
- ✅ Métadonnées de fraîcheur des données

