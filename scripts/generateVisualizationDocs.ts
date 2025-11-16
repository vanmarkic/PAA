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

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const categoryMachines = grouped.get(category)!;
    const isActive = i === 0 ? ' active' : '';
    categorySections += `
            <div id="${category}-en" class="content${isActive}">
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
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            line-height: 1.6;
            min-height: 100vh;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }

        header {
            text-align: center;
            color: white;
            padding: 3rem 0;
            margin-bottom: 1rem;
        }

        h1 {
            font-size: 3rem;
            margin-bottom: 0.5rem;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }

        .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
            font-weight: 300;
        }

        .tabs {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
            justify-content: center;
        }

        .tab {
            background: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .tab:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }

        .tab.active {
            background: #667eea;
            color: white;
        }

        .content {
            display: none;
        }

        .content.active {
            display: block;
        }

        .card {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .card h2 {
            color: #667eea;
            margin-bottom: 1rem;
            font-size: 2rem;
            border-bottom: 3px solid #667eea;
            padding-bottom: 0.5rem;
        }

        .card h3 {
            color: #764ba2;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            font-size: 1.3rem;
        }

        .mermaid {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            overflow-x: auto;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-top: 1.5rem;
        }

        .info-box {
            background: #f7f7f9;
            padding: 1.5rem;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }

        .info-box h4 {
            color: #667eea;
            margin-bottom: 0.75rem;
            font-size: 1.1rem;
        }

        .info-box ul {
            list-style: none;
            padding-left: 0;
        }

        .info-box li {
            padding: 0.3rem 0;
            padding-left: 1.5rem;
            position: relative;
        }

        .info-box li:before {
            content: "▸";
            position: absolute;
            left: 0;
            color: #667eea;
            font-weight: bold;
        }

        .badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: #667eea;
            color: white;
            border-radius: 20px;
            font-size: 0.85rem;
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
        }

        footer {
            text-align: center;
            color: white;
            padding: 2rem 0;
            margin-top: 3rem;
            opacity: 0.8;
        }

        @media (max-width: 768px) {
            h1 {
                font-size: 2rem;
            }

            .container {
                padding: 1rem;
            }

            .card {
                padding: 1rem;
            }
        }
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

/**
 * Met à jour index.html pour inclure toutes les machines
 */
function updateIndexHTML(machines: MachineInfo[]): void {
  const indexPath = path.join(__dirname, '..', 'docs', 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    console.log('⚠️  index.html not found, skipping update');
    return;
  }

  let indexHTML = fs.readFileSync(indexPath, 'utf-8');
  const grouped = groupByCategory(machines);
  const categories = Array.from(grouped.keys()).sort();

  // Générer les tabs de catégories
  const categoryTabs = categories.map((cat, i) =>
    `<button class="tab${i === 0 ? ' active' : ''}" onclick="showTab('${cat}-en')">${cat}</button>`
  ).join('\n                ');

  // Générer les sections de contenu par catégorie
  let categorySections = '';
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const categoryMachines = grouped.get(category)!;
    const isActive = i === 0 ? ' active' : '';
    categorySections += `
            <div id="${category}-en" class="content${isActive}">
${categoryMachines.map(m => generateMachineSection(m, 'en')).join('\n')}
            </div>
`;
  }

  // Section "All Machines" complète
  const allMachinesSection = `
            <div id="all-machines-en" class="content">
                <div class="card">
                    <h2>All State Machines</h2>
                    <p style="font-size: 1.1rem; margin-bottom: 1.5rem;">
                        Browse all ${machines.length} state machines organized by category. Each machine represents a Belgian administrative workflow.
                    </p>
                </div>
                
                <div class="tabs" style="margin-top: 2rem;">
                ${categoryTabs}
                </div>
                
${categorySections}
            </div>`;

  // Ajouter le tab "All Machines" dans les tabs principaux (anglais)
  const tabsPattern = /(<button class="tab" onclick="showTab\('about-en'\)">About<\/button>)/;
  if (tabsPattern.test(indexHTML)) {
    indexHTML = indexHTML.replace(
      tabsPattern,
      `$1\n                <button class="tab" onclick="showTab('all-machines-en')">All Machines (${machines.length})</button>`
    );
  }

  // Insérer la section all-machines avant le contenu français
  const insertPattern = /(\s*<\/div>\s*<\/div>\s*<!-- FRENCH VERSION -->)/;
  if (insertPattern.test(indexHTML)) {
    indexHTML = indexHTML.replace(insertPattern, allMachinesSection + '$1');
  }

  // Mettre à jour la fonction showTab pour gérer les tabs imbriqués
  const showTabFunction = `        function showTab(tabName) {
            const langSuffix = tabName.split('-').pop();
            
            // Check if this is a nested tab (inside all-machines)
            const allMachinesContent = document.getElementById('all-machines-en');
            const targetElement = document.getElementById(tabName);
            const isNestedTab = allMachinesContent && allMachinesContent.contains(targetElement);

            if (isNestedTab) {
                // Handle nested tabs within all-machines
                // Hide all content within all-machines
                allMachinesContent.querySelectorAll('.content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // Deactivate all tabs within all-machines
                allMachinesContent.querySelectorAll('.tab').forEach(tab => {
                    tab.classList.remove('active');
                });
                
                // Show selected content
                if (targetElement) {
                    targetElement.classList.add('active');
                }
                
                // Activate selected tab
                if (event && event.target) {
                    event.target.classList.add('active');
                }
            } else {
                // Handle top-level tabs
                // Hide all content for current language
                document.querySelectorAll('#lang-' + langSuffix + ' .content').forEach(content => {
                    content.classList.remove('active');
                });

                // Deactivate all tabs for current language
                document.querySelectorAll('#lang-' + langSuffix + ' .tab').forEach(tab => {
                    tab.classList.remove('active');
                });

                // Show selected content
                if (targetElement) {
                    targetElement.classList.add('active');
                }

                // Activate selected tab
                if (event && event.target) {
                    event.target.classList.add('active');
                }
            }
        }`;

  // Remplacer la fonction showTab existante
  // Chercher la fonction complète entre <script> tags (le dernier script tag)
  const scriptStart = indexHTML.lastIndexOf('<script>');
  const scriptEnd = indexHTML.lastIndexOf('</script>');
  
  if (scriptStart !== -1 && scriptEnd !== -1 && scriptEnd > scriptStart) {
    const beforeScript = indexHTML.substring(0, scriptStart);
    const scriptTag = '<script>';
    const scriptContent = indexHTML.substring(scriptStart + scriptTag.length, scriptEnd);
    const afterScript = indexHTML.substring(scriptEnd);
    
    // Pattern pour trouver la fonction showTab - chercher depuis "function showTab" jusqu'à la prochaine fonction ou fin
    // Utiliser un pattern non-greedy qui s'arrête à la première fonction suivante ou fin de script
    const showTabPattern = /function\s+showTab\s*\([^)]+\)\s*\{[\s\S]*?\n\s*\}/;
    
    // Vérifier si la fonction existe
    if (showTabPattern.test(scriptContent)) {
      // Remplacer UNE SEULE fois
      const newScriptContent = scriptContent.replace(showTabPattern, showTabFunction);
      // Reconstruire le HTML
      indexHTML = beforeScript + scriptTag + newScriptContent + afterScript;
    } else {
      // Si la fonction n'existe pas, l'ajouter avant </script>
      const insertPoint = scriptContent.lastIndexOf('</script>') || scriptContent.length;
      const newScriptContent = scriptContent.substring(0, insertPoint) + '\n' + showTabFunction + '\n    ' + scriptContent.substring(insertPoint);
      indexHTML = beforeScript + scriptTag + newScriptContent + afterScript;
    }
  }

  fs.writeFileSync(indexPath, indexHTML, 'utf-8');
  console.log(`\n✨ Mis à jour: ${indexPath} avec ${machines.length} machines`);
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

  // Générer le HTML pour all-machines.html
  const html = generateFullHTML(machines);
  const outputPath = path.join(__dirname, '..', 'docs', 'all-machines.html');

  fs.writeFileSync(outputPath, html, 'utf-8');
  console.log(`\n✨ Généré: ${outputPath}`);

  // Mettre à jour index.html avec toutes les machines
  updateIndexHTML(machines);

  console.log(`\n🌐 Ouvrez index.html dans un navigateur pour voir toutes les ${machines.length} machines visualisées!`);
}

main().catch(console.error);
