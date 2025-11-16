/**
 * Génère un fichier JSON avec les métadonnées de toutes les machines
 * Pour génération dynamique côté client
 */

import * as fs from 'fs';
import * as path from 'path';

interface MachineMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  states: string[];
  events: string[];
  initial: string;
}

/**
 * Parse un fichier de machine pour extraire les métadonnées
 */
function parseMachineFile(filePath: string): MachineMeta | null {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Extraction par regex
  const idMatch = content.match(/id:\s*['"]([^'"]+)['"]/);
  const initialMatch = content.match(/initial:\s*['"]([^'"]+)['"]/);

  if (!idMatch || !initialMatch) return null;

  const id = idMatch[1];
  const initial = initialMatch[1];

  // Extraire les états
  const statesMatch = content.match(/states:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/s);
  const states: string[] = [];
  if (statesMatch) {
    const stateMatches = statesMatch[1].matchAll(/(\w+):\s*\{/g);
    for (const match of stateMatches) {
      states.push(match[1]);
    }
  }

  // Extraire les événements
  const events: string[] = [];
  const eventMatches = content.matchAll(/type:\s*['"]([A-Z_]+)['"]/g);
  for (const match of eventMatches) {
    if (!events.includes(match[1])) {
      events.push(match[1]);
    }
  }

  // Extraction nom et description
  const commentMatch = content.match(/\/\*\*([\s\S]*?)\*\//);
  let name = id;
  let description = '';

  if (commentMatch) {
    const comment = commentMatch[1];
    const nameMatch = comment.match(/\*\s*(.+)/);
    if (nameMatch) {
      name = nameMatch[1].replace(/^(Machine XState pour|XState machine for)\s+/i, '').trim();
    }
    const descMatch = comment.match(/\*\s*\n\s*\*\s*(.+)/);
    if (descMatch) {
      description = descMatch[1].trim();
    }
  }

  const category = path.basename(path.dirname(filePath));

  return {
    id,
    name,
    category: category === 'workflows' ? 'general' : category,
    description,
    states,
    events,
    initial,
  };
}

/**
 * Trouve récursivement tous les fichiers *Machine.ts
 */
function findMachineFiles(dir: string, files: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '__tests__') {
      findMachineFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('Machine.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Exécution
async function main() {
  const machinesPath = path.join(__dirname, '..', 'src', 'workflows');
  const machineFiles = findMachineFiles(machinesPath);

  console.log(`📊 Trouvé ${machineFiles.length} machines`);

  const machines: MachineMeta[] = [];

  for (const file of machineFiles) {
    const meta = parseMachineFile(file);
    if (meta) {
      machines.push(meta);
      console.log(`  ✓ ${meta.id} (${meta.states.length} états, ${meta.events.length} événements)`);
    }
  }

  // Trier par catégorie puis par nom
  machines.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });

  // Statistiques
  const categories = new Set(machines.map(m => m.category));
  const totalStates = machines.reduce((sum, m) => sum + m.states.length, 0);
  const totalEvents = machines.reduce((sum, m) => sum + m.events.length, 0);

  console.log(`\n✅ Parsé ${machines.length} machines avec succès`);
  console.log(`📁 ${categories.size} catégories: ${Array.from(categories).join(', ')}`);
  console.log(`📊 Total: ${totalStates} états, ${totalEvents} événements`);

  // Générer le JSON
  const output = {
    generated: new Date().toISOString(),
    totalMachines: machines.length,
    categories: Array.from(categories).sort(),
    machines,
    statistics: {
      totalStates,
      totalEvents,
      averageStatesPerMachine: (totalStates / machines.length).toFixed(1),
      averageEventsPerMachine: (totalEvents / machines.length).toFixed(1),
    },
  };

  const outputPath = path.join(__dirname, '..', 'docs', 'machines-metadata.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`\n✨ Généré: ${outputPath}`);
  console.log(`📦 Taille: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
}

main().catch(console.error);
