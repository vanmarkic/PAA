import { ArrowLeft, Code, Book, GitBranch, Terminal, Wrench, FileCode, ArrowRight } from'lucide-react';
import { useState } from'react';
import type { Page } from'../App';

interface DeveloperDocsProps {
 onNavigate: (page: Page, machineId?: string) => void;
 language:'fr' | 'nl' | 'en';
}

const docSections = [
 {
 id:'getting-started',
 title:'Démarrage Rapide',
 icon: Terminal,
 color:'purple',
 items: [
 {
 title:'Installation & Configuration',
 description:'Configuration de l\'environnement de développement local',
 content: `# Installation du projet PAA

\`\`\`bash
# Cloner le repository
git clone https://github.com/vanmarkic/PAA.git
cd PAA

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
\`\`\`

## Prérequis
- Node.js >= 18
- npm >= 9
- Git`
 },
 {
 title:'Structure du Projet',
 description:'Organisation des fichiers et dossiers',
 content: `## Architecture des Dossiers

\`\`\`
PAA/
├── src/
│ ├── workflows/ # Machines d'état XState
│ ├── rules/ # Règles json-rules-engine
│ ├── domain/ # Modèles de domaine TypeScript
│ └── services/ # Services métier
├── features/ # Scénarios Gherkin
├── docs-astro/ # Site de documentation
└── tests/ # Tests unitaires et d'intégration
\`\`\`

### workflows/
Contient les définitions des machines d'état XState. Chaque fichier représente un workflow de prestation sociale.

### features/
Scénarios Gherkin en langage naturel décrivant les règles métier.`
 }
 ]
 },
 {
 id:'architecture',
 title:'Architecture',
 icon: GitBranch,
 color:'blue',
 items: [
 {
 title:'Vue d\'Ensemble du Système',
 description:'Architecture hybride combinant 4 technologies',
 content: `## Architecture Hybride

PAA utilise une approche multi-technologie:

### 1. Gherkin - Règles Lisibles
Scénarios en langage naturel pour les experts métier.

\`\`\`gherkin
Scenario: Éligibilité RIS pour personne isolée
 Given je suis une personne isolée
 And j'ai 25 ans
 And je n'ai aucun revenu
 When je demande le RIS
 Then je devrais être éligible
 And le montant devrait être 1070€
\`\`\`

### 2. XState - Orchestration des Workflows
Machines d'état pour gérer les processus complexes.

### 3. json-rules-engine - Évaluation des Règles
Moteur de règles pour les conditions d'éligibilité.

### 4. TypeScript - Implémentation Sûre
Type-safety pour les calculs critiques.`
 },
 {
 title:'Flux de Données',
 description:'Comment les données circulent dans le système',
 content: `## Flux de Traitement

1. **Entrée**: Données utilisateur (age, revenus, situation familiale)
2. **Validation**: Vérification des données avec TypeScript
3. **Évaluation**: json-rules-engine évalue l'éligibilité
4. **Orchestration**: XState gère les transitions d'état
5. **Calcul**: Détermination du montant de la prestation
6. **Sortie**: Décision d'éligibilité + montant

\`\`\`typescript
// Exemple de flux
const application = {
 age: 25,
 income: 0,
 household:'single'
};

// 1. Validation TypeScript
validateApplication(application);

// 2. Démarrage de la machine
const machine = createRISMachine();
const service = interpret(machine);

// 3. Traitement
service.send({ type:'START', data: application });
\`\`\``
 }
 ]
 },
 {
 id:'api',
 title:'API Reference',
 icon: Code,
 color:'green',
 items: [
 {
 title:'REST API Endpoints',
 description:'Documentation des endpoints disponibles',
 content: `## Endpoints Principaux

### POST /api/evaluate
Évalue l'éligibilité à une prestation.

\`\`\`typescript
// Request
POST /api/evaluate
Content-Type: application/json

{
"machineId": "risWorkflow",
"applicant": {
"age": 25,
"income": 0,
"residence": "Belgium",
"household": "single"
 }
}

// Response
{
"eligible": true,
"amount": 1070.00,
"reason": "Éligible au RIS catégorie isolé",
"machineState": "completed"
}
\`\`\`

### GET /api/machines
Liste toutes les machines disponibles.

\`\`\`typescript
// Response
{
"machines": [
 {
"id": "risWorkflow",
"name": "RIS Eligibility Workflow",
"category": "social",
"complexity": "Medium"
 }
 ],
"total": 109
}
\`\`\``
 },
 {
 title:'Authentification',
 description:'Comment s\'authentifier avec l\'API',
 content: `## Authentification API

L'API utilise des tokens JWT pour l'authentification.

\`\`\`bash
# Obtenir un token
curl -X POST https://api.paa.be/auth/login \\
 -H"Content-Type: application/json" \\
 -d'{"username":"your-username", "password": "your-password"}'

# Utiliser le token
curl -X POST https://api.paa.be/api/evaluate \\
 -H"Authorization: Bearer YOUR_JWT_TOKEN" \\
 -H"Content-Type: application/json" \\
 -d'{"machineId":"risWorkflow", ...}'
\`\`\`

### Variables d'Environnement
\`\`\`env
API_BASE_URL=https://api.paa.be
API_KEY=your_api_key_here
JWT_SECRET=your_jwt_secret
\`\`\``
 }
 ]
 },
 {
 id:'guides',
 title:'Guides d\'Intégration',
 icon: Book,
 color:'orange',
 items: [
 {
 title:'Créer une Nouvelle Machine',
 description:'Guide pas à pas pour ajouter un nouveau workflow',
 content: `## Ajouter une Nouvelle Prestation

### Étape 1: Créer le Scénario Gherkin

\`\`\`gherkin
# features/social/nouvelle-prestation.feature
Feature: Nouvelle Prestation Sociale
 
 Scenario: Cas d'éligibilité standard
 Given l'utilisateur a 30 ans
 And son revenu mensuel est de 800€
 When il demande la prestation
 Then il devrait être éligible
\`\`\`

### Étape 2: Définir la Machine XState

\`\`\`typescript
// src/workflows/nouvellePrestationMachine.ts
import { createMachine } from'xstate';

export const nouvellePrestationMachine = createMachine({
 id:'nouvellePrestationWorkflow',
 initial:'idle',
 states: {
 idle: {
 on: { START:'checking' }
 },
 checking: {
 on: {
 ELIGIBLE:'approved',
 NOT_ELIGIBLE:'rejected'
 }
 },
 approved: { type:'final' },
 rejected: { type:'final' }
 }
});
\`\`\`

### Étape 3: Créer les Règles d'Éligibilité

\`\`\`typescript
// src/rules/nouvellePrestationRules.ts
export const rules = {
 conditions: {
 all: [
 { fact:'age', operator: 'greaterThanInclusive', value: 18 },
 { fact:'income', operator: 'lessThan', value: 1000 }
 ]
 },
 event: { type:'eligible' }
};
\`\`\`

### Étape 4: Ajouter la Documentation

Mettre à jour \`docs-astro/\` avec les métadonnées de la nouvelle machine.`
 },
 {
 title:'Écrire des Tests',
 description:'Stratégies de test pour les workflows',
 content: `## Testing des Workflows

### Tests Gherkin (Cucumber)

\`\`\`typescript
// tests/features/step-definitions/ris.steps.ts
import { Given, When, Then } from'@cucumber/cucumber';
import { expect } from'chai';

Given('je suis une personne isolée', function() {
 this.context.household ='single';
});

When('je demande le RIS', async function() {
 this.result = await evaluateRIS(this.context);
});

Then('je devrais être éligible', function() {
 expect(this.result.eligible).to.be.true;
});
\`\`\`

### Tests Unitaires (Vitest)

\`\`\`typescript
// tests/unit/risWorkflow.test.ts
import { describe, it, expect } from'vitest';
import { interpret } from'xstate';
import { risWorkflowMachine } from'@/workflows/risWorkflow';

describe('RIS Workflow', () => {
 it('approuve un demandeur éligible', (done) => {
 const service = interpret(risWorkflowMachine)
 .onTransition((state) => {
 if (state.matches('approved')) {
 expect(state.context.amount).toBe(1070);
 done();
 }
 })
 .start();
 
 service.send({ 
 type:'START', 
 data: { age: 25, income: 0 } 
 });
 });
});
\`\`\``
 }
 ]
 },
 {
 id:'contributing',
 title:'Contribuer',
 icon: FileCode,
 color:'pink',
 items: [
 {
 title:'Guide de Contribution',
 description:'Comment contribuer au projet PAA',
 content: `## Contribuer à PAA

### Workflow Git

1. **Fork** le repository
2. **Créer** une branche: \`git checkout -b feature/ma-nouvelle-fonctionnalite\`
3. **Commiter**: \`git commit -m'Add: nouvelle fonctionnalité'\`
4. **Push**: \`git push origin feature/ma-nouvelle-fonctionnalite\`
5. **Créer** une Pull Request

### Conventions de Code

#### Nommage des Fichiers
- Machines: \`nomPrestationMachine.ts\`
- Features: \`nom-prestation.feature\`
- Tests: \`nomPrestation.test.ts\`

#### Style de Code
- Suivre les règles ESLint configurées
- Utiliser TypeScript strict mode
- Documenter les fonctions publiques avec JSDoc

\`\`\`typescript
/**
 * Évalue l'éligibilité RIS d'un demandeur
 * @param applicant - Données du demandeur
 * @returns Résultat de l'évaluation
 */
export function evaluateRIS(applicant: Applicant): EvaluationResult {
 // ...
}
\`\`\`

### Process de Review
- Toutes les PR nécessitent une review
- Les tests doivent passer (CI/CD)
- Documentation à jour obligatoire`
 },
 {
 title:'Rapport de Bugs',
 description:'Comment signaler des problèmes',
 content: `## Signaler un Bug

### Template d'Issue

\`\`\`markdown
**Description du Bug**
Description claire et concise du bug.

**Pour Reproduire**
1. Aller sur'...'
2. Cliquer sur'...'
3. Voir l'erreur

**Comportement Attendu**
Ce qui devrait se passer.

**Screenshots**
Si applicable, ajouter des captures d'écran.

**Environnement**
- OS: [e.g. Windows 11]
- Node.js: [e.g. 18.2.0]
- Navigateur: [e.g. Chrome 120]

**Contexte Additionnel**
Toute autre information pertinente.
\`\`\`

### Priorités
- **Critique**: Blocage complet du système
- **Haute**: Fonctionnalité majeure cassée
- **Moyenne**: Bug gênant mais contournable
- **Basse**: Améliorations mineures`
 }
 ]
 }
];

export function DeveloperDocs({ onNavigate, language }: DeveloperDocsProps) {
 const [activeSection, setActiveSection] = useState(docSections[0].id);
 const [activeItem, setActiveItem] = useState(0);

 const currentSection = docSections.find((s) => s.id === activeSection) || docSections[0];
 const currentItem = currentSection.items[activeItem];

 const iconColors: Record<string, string> = {
 purple:'text-purple-500 bg-purple-100 ',
 blue:'text-blue-500 bg-blue-100 ',
 green:'text-green-500 bg-green-100 ',
 orange:'text-orange-500 bg-orange-100 ',
 pink:'text-pink-500 bg-pink-100 '
 };

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
 <button
 onClick={() => onNavigate('home')}
 className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-8"
 >
 <ArrowLeft className="w-4 h-4" />
 Retour à l'accueil
 </button>

 <div className="mb-12">
 <h1 className="text-gray-900 mb-4">Documentation Développeur</h1>
 <p className="text-gray-600 max-w-3xl">
 Guide complet pour développer, maintenir et étendre la plateforme PAA. 
 Trouvez tout ce dont vous avez besoin pour contribuer au projet.
 </p>
 </div>

 {/* Quick Links */}
 <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
 {docSections.map((section) => {
 const Icon = section.icon;
 return (
 <button
 key={section.id}
 onClick={() => {
 setActiveSection(section.id);
 setActiveItem(0);
 }}
 className={`p-4 rounded-xl transition-all ${
 activeSection === section.id
 ?'bg-purple-100 border-2 border-purple-500'
 :'bg-white border-2 border-gray-200 hover:border-gray-300 '
 }`}
 >
 <div className={`w-12 h-12 rounded-lg ${iconColors[section.color]} flex items-center justify-center mb-3 mx-auto`}>
 <Icon className="w-6 h-6" />
 </div>
 <div className="font-medium text-gray-900 text-sm">
 {section.title}
 </div>
 </button>
 );
 })}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
 {/* Sidebar */}
 <div className="lg:col-span-1">
 <div className="sticky top-24 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
 <h3 className="font-semibold text-gray-900 mb-4">
 {currentSection.title}
 </h3>
 <nav className="space-y-1">
 {currentSection.items.map((item, idx) => (
 <button
 key={idx}
 onClick={() => setActiveItem(idx)}
 className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
 activeItem === idx
 ?'bg-purple-100 text-purple-700 font-medium'
 :'text-gray-700 hover:bg-gray-50 '
 }`}
 >
 {item.title}
 </button>
 ))}
 </nav>
 </div>
 </div>

 {/* Content */}
 <div className="lg:col-span-3">
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
 <h2 className="text-gray-900 mb-3">{currentItem.title}</h2>
 <p className="text-gray-600 mb-6">{currentItem.description}</p>
 
 <div className="prose prose-gray max-w-none">
 <div className="whitespace-pre-wrap text-gray-700 font-mono text-sm">
 {currentItem.content}
 </div>
 </div>

 {/* Navigation */}
 <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
 <button
 onClick={() => {
 if (activeItem > 0) {
 setActiveItem(activeItem - 1);
 }
 }}
 disabled={activeItem === 0}
 className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 <ArrowLeft className="w-4 h-4" />
 Précédent
 </button>

 <button
 onClick={() => {
 if (activeItem < currentSection.items.length - 1) {
 setActiveItem(activeItem + 1);
 }
 }}
 disabled={activeItem === currentSection.items.length - 1}
 className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 Suivant
 <ArrowRight className="w-4 h-4" />
 </button>
 </div>
 </div>

 {/* Additional Resources */}
 <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
 <h3 className="font-semibold text-gray-900 mb-3">
 Ressources Additionnelles
 </h3>
 <ul className="space-y-2">
 <li>
 <a href="#" className="text-blue-600 hover:text-blue-700 flex items-center gap-2">
 <Code className="w-4 h-4" />
 Repository GitHub
 </a>
 </li>
 <li>
 <a href="#" className="text-blue-600 hover:text-blue-700 flex items-center gap-2">
 <Book className="w-4 h-4" />
 XState Documentation
 </a>
 </li>
 <li>
 <a href="#" className="text-blue-600 hover:text-blue-700 flex items-center gap-2">
 <Wrench className="w-4 h-4" />
 json-rules-engine Guide
 </a>
 </li>
 </ul>
 </div>
 </div>
 </div>
 </div>
 );
}