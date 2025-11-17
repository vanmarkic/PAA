# Tests de Visualisation

Ce dossier contient tous les tests pour le système de génération automatique de visualisations Mermaid.

## Structure des Tests

```
visualization/
├── README.md                           # Ce fichier
├── machineMetadataGeneration.test.ts  # Tests unitaires du parsing
├── visualizationIntegration.test.ts   # Tests d'intégration end-to-end
├── dynamicHtmlValidation.test.ts      # Tests de validation HTML/DOM
└── fixtures/                          # Fichiers de test (créés dynamiquement)
```

## Types de Tests

### 1. Tests Unitaires (`machineMetadataGeneration.test.ts`)

Tests des fonctions de base du système :

**Parsing de fichiers machines**
- ✅ Parse correctement un fichier machine simple
- ✅ Extrait tous les événements
- ✅ Gère les machines sans commentaires JSDoc
- ✅ Retourne null pour les fichiers invalides
- ✅ Identifie la catégorie depuis le chemin

**Découverte de machines**
- ✅ Trouve récursivement tous les fichiers `*Machine.ts`
- ✅ Ignore les dossiers `node_modules` et `__tests__`

**Génération de métadonnées JSON**
- ✅ Génère une structure JSON valide
- ✅ Calcule les statistiques correctement
- ✅ Moyenne des états et événements par machine

**Génération de diagrammes Mermaid**
- ✅ Génère une syntaxe `stateDiagram-v2` valide
- ✅ Gère les machines avec un seul état
- ✅ N'inclut pas de caractères invalides

**Couverture :** ~85%

### 2. Tests d'Intégration (`visualizationIntegration.test.ts`)

Tests du flux complet de génération :

**Script de génération**
- ✅ Exécute `npm run docs:metadata` avec succès
- ✅ Crée `machines-metadata.json`
- ✅ JSON valide et parsable
- ✅ Structure de données complète

**Validation des données**
- ✅ Chaque machine a les propriétés requises
- ✅ Types de données corrects
- ✅ État initial existe dans la liste des états
- ✅ Statistiques calculées correctement
- ✅ Catégories uniques et triées
- ✅ IDs de machines uniques

**Page HTML dynamique**
- ✅ Fichier `machines-dynamic.html` existe
- ✅ Contient les éléments structurels requis
- ✅ Références correctes au JSON
- ✅ Import de Mermaid
- ✅ Fonctions JavaScript présentes
- ✅ Classes CSS définies

**Performance**
- ✅ JSON < 500KB
- ✅ HTML < 100KB

**Gestion d'erreurs**
- ✅ Gère 0 machines gracieusement
- ✅ Cas limites (1 état, 20+ états)

**Couverture :** ~90%

### 3. Tests de Validation HTML (`dynamicHtmlValidation.test.ts`)

Tests avec JSDOM pour valider l'interface :

**Structure HTML**
- ✅ DOCTYPE et métadonnées
- ✅ Titre de page
- ✅ Import Mermaid depuis CDN
- ✅ En-tête avec titre

**Contrôles de recherche/filtrage**
- ✅ Input de recherche présent
- ✅ Container de filtres
- ✅ Bouton "Toutes" par défaut

**Affichage**
- ✅ Container de statistiques
- ✅ Grille de machines
- ✅ Indicateur de chargement
- ✅ Container d'erreur (caché)

**JavaScript**
- ✅ Fonctions définies dans window
- ✅ Gestion du chargement de données
- ✅ Gestion des erreurs
- ✅ Génération de cartes de machines
- ✅ Génération de diagrammes Mermaid

**Styles**
- ✅ Design responsive
- ✅ Dégradé de fond
- ✅ Layout en cartes
- ✅ Styles de recherche et filtres

**Accessibilité**
- ✅ Hiérarchie de titres
- ✅ Labels et placeholders
- ✅ Texte sur tous les boutons

**Couverture :** ~80%

## Exécution des Tests

### Tous les tests de visualisation

```bash
npm run test:visualization
```

### Tests unitaires uniquement

```bash
npm test -- machineMetadataGeneration
```

### Tests d'intégration uniquement

```bash
npm test -- visualizationIntegration
```

### Tests HTML uniquement

```bash
npm test -- dynamicHtmlValidation
```

### Avec couverture

```bash
npm test -- --coverage visualization/
```

### En mode watch

```bash
npm run test:watch -- visualization/
```

## Fixtures de Test

Les tests créent dynamiquement des fichiers de test dans `fixtures/` :

- Machines simples pour tester le parsing de base
- Machines complexes pour tester les cas limites
- Fichiers invalides pour tester la gestion d'erreurs
- Structures de dossiers pour tester la découverte récursive

**Important :** Les fixtures sont nettoyées automatiquement après chaque test.

## Métriques de Couverture

**Objectifs :**
- Couverture globale : > 80%
- Parsing : > 85%
- Génération JSON : > 90%
- Génération Mermaid : > 85%
- Intégration : > 75%

**Vérifier la couverture :**
```bash
npm run test:coverage -- visualization/
```

Un rapport HTML est généré dans `coverage/lcov-report/index.html`.

## Tests CI/CD

Ces tests s'exécutent automatiquement dans la CI :

```yaml
# .github/processus-administratifs/test.yml
- name: Run visualization tests
  run: npm run test:visualization

- name: Check coverage
  run: npm run test:coverage -- visualization/
```

## Ajout de Nouveaux Tests

### Test unitaire

```typescript
// machineMetadataGeneration.test.ts
test('should handle new feature', () => {
  const result = myNewFunction(input);
  expect(result).toBe(expected);
});
```

### Test d'intégration

```typescript
// visualizationIntegration.test.ts
test('should validate new JSON field', () => {
  const data = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
  expect(data).toHaveProperty('newField');
});
```

### Test HTML/DOM

```typescript
// dynamicHtmlValidation.test.ts
test('should have new UI element', () => {
  const element = document.getElementById('new-element');
  expect(element).toBeTruthy();
});
```

## Debugging

### Voir les logs des tests

```bash
npm test -- --verbose visualization/
```

### Débugger un test spécifique

```typescript
test.only('should debug this', () => {
  console.log('Debug info:', data);
  expect(data).toBe(expected);
});
```

### Voir le HTML généré

```typescript
test('debug HTML', () => {
  console.log(document.body.innerHTML);
});
```

## Best Practices

1. **Isolation** : Chaque test doit être indépendant
2. **Cleanup** : Toujours nettoyer les fixtures créées
3. **Nommage** : Descriptions claires et descriptives
4. **Assertion unique** : Un concept par test
5. **Mocking** : Éviter les dépendances externes réelles

## Troubleshooting

### Tests qui échouent de manière intermittente

Souvent dû à des fichiers non nettoyés. Vérifier :
```bash
ls -la src/__tests__/visualization/fixtures/
```

### Erreurs de timeout

Augmenter le timeout pour les tests d'intégration :
```typescript
test('slow test', async () => {
  // test code
}, 30000); // 30 secondes
```

### JSDOM errors

S'assurer que le HTML est bien formé :
```typescript
beforeEach(() => {
  const html = fs.readFileSync(htmlPath, 'utf-8');
  // Vérifier que le HTML est valide
  expect(html).toContain('<!DOCTYPE html>');
});
```

## Ressources

- [Jest Documentation](https://jestjs.io/)
- [JSDOM Documentation](https://github.com/jsdom/jsdom)
- [Mermaid Syntax](https://mermaid.js.org/)
- [XState Testing](https://xstate.js.org/docs/guides/testing.html)

## Contribution

Pour ajouter de nouveaux tests :

1. Créer le fichier de test dans ce dossier
2. Suivre la structure existante
3. Ajouter la documentation ici
4. Exécuter `npm run test:coverage` pour vérifier la couverture
5. Commit avec le message : `test: Add tests for [feature]`
