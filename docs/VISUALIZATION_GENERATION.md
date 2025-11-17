# Génération automatique de la documentation de visualisation

## Vue d'ensemble

Ce système permet de générer automatiquement des visualisations Mermaid pour toutes les 109 machines XState du projet PAA.

## Avantages de la génération dynamique

✅ **Toujours à jour** : Les diagrammes sont générés directement depuis le code source
✅ **Pas de duplication** : Une seule source de vérité (le code des machines)
✅ **Scalable** : Fonctionne pour 10 ou 1000 machines
✅ **Cohérent** : Format uniforme pour toutes les visualisations
✅ **Maintenable** : Modification du style en un seul endroit

## Comment ça fonctionne

### 1. Parsing automatique

Le script `generateVisualizationDocs.ts` :
- Scanne récursivement tous les fichiers `*Machine.ts` dans `src/processus-administratifs/`
- Parse chaque machine pour extraire :
  - ID et nom
  - États (states)
  - Événements (events)
  - Transitions
  - Métadonnées (description, catégorie)

### 2. Génération Mermaid

Pour chaque machine, génère automatiquement :
- Diagramme `stateDiagram-v2` avec tous les états et transitions
- Badges avec le nombre d'états et événements
- Organisation par catégorie (santé, justice, environnement, etc.)

### 3. HTML complet

Produit un fichier HTML autonome avec :
- Navigation par onglets (une par catégorie)
- 109 diagrammes interactifs Mermaid
- Styles cohérents
- Responsive design

## Utilisation

### Générer la documentation

```bash
npm run docs:generate
```

Cela crée le fichier `docs/all-machines.html` avec toutes les visualisations.

### Ouvrir la visualisation

```bash
# Option 1 : Ouvrir directement le fichier HTML
open docs/all-machines.html

# Option 2 : Serveur local
cd docs && python3 -m http.server 8000
# Puis ouvrir http://localhost:8000/all-machines.html
```

## Structure du projet

```
PAA/
├── scripts/
│   └── generateVisualizationDocs.ts    # Script de génération
├── src/
│   └── processus-administratifs/                      # 109 machines source
│       ├── risMachine.ts
│       ├── conversionMachine.ts
│       ├── health/                     # 11 machines santé
│       ├── justice/                    # 5 machines justice
│       └── ...                         # autres catégories
└── docs/
    ├── index.html                      # Documentation manuelle (RIS + Conversion)
    └── all-machines.html              # Généré automatiquement (109 machines)
```

## Améliorations possibles

### 1. Parser plus intelligent

Actuellement, le parsing utilise des regex simples. On pourrait utiliser :
- `@typescript-eslint/parser` pour un AST complet
- Extraction précise des transitions avec conditions
- Métadonnées enrichies depuis les commentaires JSDoc

### 2. Diagrammes enrichis

- Flowchart TD pour montrer le flux de décision
- Sequence diagrams pour les interactions entre machines
- Graph TB pour visualiser les dépendances

### 3. Filtres et recherche

- Filtrer par catégorie, nombre d'états, etc.
- Recherche full-text dans les descriptions
- Tags personnalisés

### 4. Métadonnées légales

- Intégrer `getMachineLegalMetadata()` pour afficher :
  - Sources légales officielles
  - Dates de mise à jour
  - Badges de fraîcheur des données
  - Liens vers la législation

### 5. Export multi-format

- PDF avec tous les diagrammes
- JSON pour consommation par API
- Markdown pour documentation GitHub

## Exemple d'utilisation avancée

### Générer uniquement certaines catégories

Modifier `generateVisualizationDocs.ts` :

```typescript
const categoriesToInclude = ['health', 'justice', 'environment'];
const machines = allMachines.filter(m =>
  categoriesToInclude.includes(m.category)
);
```

### Ajouter des statistiques

```typescript
console.log(`
📊 Statistiques globales:
  - Total machines: ${machines.length}
  - Total états: ${machines.reduce((sum, m) => sum + m.states.length, 0)}
  - Total événements: ${machines.reduce((sum, m) => sum + m.events.length, 0)}
  - Catégories: ${new Set(machines.map(m => m.category)).size}
`);
```

## Intégration CI/CD

Ajouter dans `.github/processus-administratifs/docs.yml` :

```yaml
name: Generate Documentation

on:
  push:
    branches: [ master ]
    paths:
      - 'src/processus-administratifs/**/*.ts'

jobs:
  generate-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run docs:generate
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

Cela mettra automatiquement à jour la documentation sur GitHub Pages à chaque modification d'une machine.

## Contribution

Pour ajouter une nouvelle machine et qu'elle apparaisse automatiquement :

1. Créer le fichier `src/processus-administratifs/[categorie]/maMachine.ts`
2. Suivre la structure XState standard
3. Ajouter des métadonnées dans les commentaires JSDoc
4. Exécuter `npm run docs:generate`

La nouvelle machine apparaîtra automatiquement dans la documentation !

## Support

Pour questions ou améliorations : voir `ARCHITECTURE.md`
