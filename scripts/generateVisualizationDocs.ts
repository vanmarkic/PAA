/**
 * Script de génération automatique de la documentation de visualisation
 * Génère les diagrammes Mermaid pour toutes les machines XState
 */

import * as fs from 'fs';
import * as path from 'path';

interface MachineInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  filePath: string;
  states: string[];
  events: string[];
  transitions: Array<{ from: string; to: string; event: string }>;
}

/**
 * Parse un fichier de machine pour extraire les informations
 */
function parseMachineFile(filePath: string): MachineInfo | null {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Extraction basique par regex (pourrait être amélioré avec un parser AST)
  const idMatch = content.match(/id:\s*['"]([^'"]+)['"]/);
  const initialMatch = content.match(/initial:\s*['"]([^'"]+)['"]/);
  const statesMatch = content.match(/states:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/s);

  if (!idMatch || !initialMatch) return null;

  const id = idMatch[1];
  const initial = initialMatch[1];

  // Extraire les états using brace counting
  const states: string[] = [];
  const statesStart = content.indexOf('states:');
  if (statesStart !== -1) {
    const openBraceIdx = content.indexOf('{', statesStart);
    if (openBraceIdx !== -1) {
      let braceCount = 0;
      let endIdx = openBraceIdx;
      for (let i = openBraceIdx; i < content.length; i++) {
        if (content[i] === '{') braceCount++;
        if (content[i] === '}') braceCount--;
        if (braceCount === 0) {
          endIdx = i;
          break;
        }
      }
      const statesContent = content.substring(openBraceIdx + 1, endIdx);
      // Extract top-level state names
      const lines = statesContent.split('\n');
      for (const line of lines) {
        const match = line.match(/^\s+(\w+):\s*\{/);
        if (match && match[1] !== 'on' && match[1] !== 'meta' && match[1] !== 'entry' && match[1] !== 'exit') {
          if (!states.includes(match[1])) {
            states.push(match[1]);
          }
        }
      }
    }
  }

  // Extraire les événements
  const events: string[] = [];
  const eventMatches = content.matchAll(/type:\s*['"]([^'"]+)['"]/g);
  for (const match of eventMatches) {
    if (!events.includes(match[1])) {
      events.push(match[1]);
    }
  }

  // Extraire les transitions (simplifié)
  const transitions: Array<{ from: string; to: string; event: string }> = [];
  const transitionMatches = content.matchAll(/(\w+):\s*\{[^}]*target:\s*['"](\w+)['"]/g);
  for (const match of transitionMatches) {
    const event = match[1];
    const target = match[2];
    // Trouver l'état source (simplifié)
    transitions.push({ from: initial, to: target, event });
  }

  // Extraction du nom et description
  const nameMatch = content.match(/\/\*\*[\s\S]*?Machine.*?pour\s+(.+?)\n/);
  const descMatch = content.match(/\/\*\*[\s\S]*?\*\s+(.+?)\n/);

  const fileName = path.basename(filePath, '.ts').replace('Machine', '');
  const category = path.basename(path.dirname(filePath));

  return {
    id,
    name: nameMatch ? nameMatch[1] : fileName,
    category: category === 'workflows' ? 'general' : category,
    description: descMatch ? descMatch[1] : '',
    filePath,
    states,
    events,
    transitions,
  };
}

/**
 * Génère le diagramme Mermaid stateDiagram-v2
 */
function generateMermaidDiagram(machine: MachineInfo): string {
  let mermaid = 'stateDiagram-v2\n';
  mermaid += `    [*] --> ${machine.states[0]}\n`;

  // Ajouter les transitions
  for (const transition of machine.transitions) {
    mermaid += `    ${transition.from} --> ${transition.to}: ${transition.event}\n`;
  }

  return mermaid;
}

/**
 * Génère une section HTML pour une machine
 */
function generateMachineSection(machine: MachineInfo, lang: 'en' | 'fr' | 'nl'): string {
  const titles = {
    en: { diagram: 'State Diagram', states: 'States', events: 'Events', description: 'Description' },
    fr: { diagram: 'Diagramme d\'États', states: 'États', events: 'Événements', description: 'Description' },
    nl: { diagram: 'Toestandsdiagram', states: 'Toestanden', events: 'Gebeurtenissen', description: 'Beschrijving' },
  };

  const t = titles[lang];

  return `
                <div class="card">
                    <h3>${machine.name}</h3>
                    <p>${machine.description}</p>

                    <div class="info-grid">
                        <div class="info-box">
                            <h4>${t.states}</h4>
                            <p>${machine.states.length} états</p>
                        </div>
                        <div class="info-box">
                            <h4>${t.events}</h4>
                            <p>${machine.events.length} événements</p>
                        </div>
                    </div>

                    <h4>${t.diagram}</h4>
                    <div class="mermaid">
${generateMermaidDiagram(machine)}
                    </div>

                    <div style="margin: 1rem 0;">
                        ${machine.states.map(s => `<span class="badge">${s}</span>`).join('\n                        ')}
                    </div>
                </div>
`;
}

/**
 * Groupe les machines par catégorie
 */
function groupByCategory(machines: MachineInfo[]): Map<string, MachineInfo[]> {
  const grouped = new Map<string, MachineInfo[]>();

  for (const machine of machines) {
    const category = machine.category;
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category)!.push(machine);
  }

  return grouped;
}

/**
 * Génère le HTML complet
 */
function generateFullHTML(machines: MachineInfo[]): string {
  const grouped = groupByCategory(machines);
  const categories = Array.from(grouped.keys()).sort();

  let categorySections = '';

  for (const category of categories) {
    const categoryMachines = grouped.get(category)!;
    categorySections += `
            <div id="${category}-en" class="content">
${categoryMachines.map(m => generateMachineSection(m, 'en')).join('\n')}
            </div>
`;
  }

  const tabs = categories.map((cat, i) =>
    `<button class="tab${i === 0 ? ' active' : ''}" onclick="showTab('${cat}-en')">${cat}</button>`
  ).join('\n                ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PAA - ${machines.length} State Machines</title>
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose',
        });
    </script>
    <style>
        /* ... copier les styles de index.html ... */
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🇧🇪 PAA - ${machines.length} State Machines</h1>
            <p class="subtitle">Comprehensive Belgian Administrative Workflows</p>
        </header>

        <div class="tabs">
            ${tabs}
        </div>

        ${categorySections}
    </div>

    <script>
        function showTab(tabName) {
            document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');
        }
    </script>
</body>
</html>`;
}

/**
 * Trouve récursivement tous les fichiers *Machine.ts
 */
function findMachineFiles(dir: string, files: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findMachineFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('Machine.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Exécution principale
async function main() {
  const machinesPath = path.join(__dirname, '..', 'src', 'workflows');
  const machineFiles = findMachineFiles(machinesPath);

  console.log(`📊 Trouvé ${machineFiles.length} machines`);

  const machines: MachineInfo[] = [];

  for (const file of machineFiles) {
    const info = parseMachineFile(file);
    if (info) {
      machines.push(info);
      console.log(`  ✓ ${info.id}`);
    }
  }

  console.log(`\n✅ Parsé ${machines.length} machines avec succès`);
  console.log(`\n📁 Catégories: ${Array.from(groupByCategory(machines).keys()).join(', ')}`);

  // Générer le HTML
  const html = generateFullHTML(machines);
  const outputPath = path.join(__dirname, '..', 'docs', 'all-machines.html');

  fs.writeFileSync(outputPath, html, 'utf-8');
  console.log(`\n✨ Généré: ${outputPath}`);
  console.log(`\n🌐 Ouvrez le fichier dans un navigateur pour voir ${machines.length} machines visualisées!`);
}

main().catch(console.error);
