/**
 * Génère un fichier JSON léger avec uniquement les sources légales
 * Mapping: machineId -> sources (sans toutes les autres métadonnées)
 * 
 * Ce fichier est beaucoup plus petit que le metadata complet
 * et peut être chargé à la demande pour chaque page
 */

import * as fs from 'fs';
import * as path from 'path';

// Import legal metadata functions
let getMachineLegalMetadata: ((id: string) => any) | null = null;
let getMachineSources: ((id: string) => any) | null = null;

try {
  const legalMetadataModule = path.join(__dirname, '..', 'src', 'domain', 'legalMetadata');
  
  try {
    const legalMetadata = require(legalMetadataModule);
    getMachineLegalMetadata = legalMetadata.getMachineLegalMetadata;
    getMachineSources = legalMetadata.getMachineSources;
  } catch (e) {
    try {
      const legalMetadata = require(legalMetadataModule + '.ts');
      getMachineLegalMetadata = legalMetadata.getMachineLegalMetadata;
      getMachineSources = legalMetadata.getMachineSources;
    } catch (e2) {
      // Skip if not available
    }
  }
} catch (error) {
  console.warn('⚠️  Legal metadata not available:', (error as Error).message);
}

interface LegalSource {
  authority: string;
  authorityType?: string;
  region?: string;
  title: string;
  publicationDate?: string;
  effectiveDate?: string;
  officialUrl?: string;
  language?: string;
}

interface MachineLegalSources {
  machineId: string;
  sources: LegalSource[];
  extractionDate?: string;
  lastLegislativeUpdate?: string;
  version?: string;
}

/**
 * Get all machine IDs from machines-metadata.json
 */
function getAllMachineIds(): string[] {
  const machinesPath = path.join(__dirname, '..', 'docs-astro', 'public', 'machines-metadata.json');
  
  if (!fs.existsSync(machinesPath)) {
    console.warn('⚠️  machines-metadata.json not found, generating sources for all known machines');
    return [];
  }
  
  try {
    const content = fs.readFileSync(machinesPath, 'utf-8');
    const metadata = JSON.parse(content);
    return metadata.machines?.map((m: any) => m.id) || [];
  } catch (error) {
    console.error('Error reading machines-metadata.json:', error);
    return [];
  }
}

async function main() {
  if (!getMachineLegalMetadata || !getMachineSources) {
    console.error('❌ Legal metadata functions not available');
    console.error('   Make sure src/domain/legalMetadata.ts is accessible');
    process.exit(1);
  }

  console.log('📋 Generating legal sources mapping...\n');

  // Get all machine IDs
  const machineIds = getAllMachineIds();
  
  // Also check all entries in legalMetadata.ts
  const allMetadata: MachineLegalSources[] = [];
  let foundCount = 0;
  let missingCount = 0;

  // Try to get sources for each machine
  for (const machineId of machineIds) {
    try {
      const metadata = getMachineLegalMetadata(machineId);
      const sources = getMachineSources(machineId);
      
      if (metadata && sources && sources.length > 0) {
        allMetadata.push({
          machineId,
          sources: sources.map((source: any) => ({
            authority: source.authority,
            authorityType: source.authorityType,
            region: source.region,
            title: source.title,
            publicationDate: source.publicationDate 
              ? new Date(source.publicationDate).toISOString()
              : undefined,
            effectiveDate: source.effectiveDate
              ? new Date(source.effectiveDate).toISOString()
              : undefined,
            officialUrl: source.officialUrl,
            language: source.language,
          })),
          extractionDate: metadata.currentVersion?.extractionDate
            ? new Date(metadata.currentVersion.extractionDate).toISOString()
            : undefined,
          lastLegislativeUpdate: metadata.currentVersion?.lastLegislativeUpdate
            ? new Date(metadata.currentVersion.lastLegislativeUpdate).toISOString()
            : undefined,
          version: metadata.currentVersion?.version,
        });
        foundCount++;
      } else {
        missingCount++;
      }
    } catch (error) {
      // Skip machines without legal metadata
      missingCount++;
    }
  }

  // Create a map for efficient lookup
  const sourcesMap: Record<string, MachineLegalSources> = {};
  allMetadata.forEach(entry => {
    sourcesMap[entry.machineId] = entry;
  });

  // Generate output
  const output = {
    generated: new Date().toISOString(),
    totalMachines: allMetadata.length,
    sources: sourcesMap,
  };

  // Write to both locations
  const docsPath = path.join(__dirname, '..', 'docs', 'legal-sources.json');
  const astroPath = path.join(__dirname, '..', 'docs-astro', 'public', 'legal-sources.json');
  
  fs.writeFileSync(docsPath, JSON.stringify(output, null, 2), 'utf-8');
  fs.writeFileSync(astroPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`✅ Generated legal sources for ${foundCount} machines`);
  if (missingCount > 0) {
    console.log(`⚠️  ${missingCount} machines without legal sources`);
  }
  console.log(`\n✨ Generated: ${docsPath}`);
  console.log(`✨ Generated: ${astroPath}`);
  console.log(`📦 Size: ${(fs.statSync(docsPath).size / 1024).toFixed(2)} KB`);
  
  // Show size comparison
  const machinesMetadataPath = path.join(__dirname, '..', 'docs-astro', 'public', 'machines-metadata.json');
  if (fs.existsSync(machinesMetadataPath)) {
    const machinesSize = fs.statSync(machinesMetadataPath).size;
    const sourcesSize = fs.statSync(docsPath).size;
    const reduction = ((1 - sourcesSize / machinesSize) * 100).toFixed(1);
    console.log(`\n📊 Size comparison:`);
    console.log(`   machines-metadata.json: ${(machinesSize / 1024).toFixed(2)} KB`);
    console.log(`   legal-sources.json: ${(sourcesSize / 1024).toFixed(2)} KB`);
    console.log(`   Reduction: ${reduction}%`);
  }
}

main().catch(console.error);

