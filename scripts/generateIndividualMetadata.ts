/**
 * Génère des fichiers JSON individuels pour chaque machine, règle et feature
 * Structure:
 *   - docs-astro/public/machines/{machineId}.json
 *   - docs-astro/public/rules/{ruleId}.json
 *   - docs-astro/public/features/{featureId}.json
 * 
 * Avantages:
 * - Fichiers beaucoup plus petits (quelques KB chacun)
 * - Chargement à la demande (seulement ce qui est nécessaire)
 * - Meilleur cache (seulement le fichier modifié est re-téléchargé)
 * - Plus rapide à générer (pas besoin de tout re-générer)
 */

import * as fs from 'fs';
import * as path from 'path';

// Import functions
let getMachineLegalMetadata: ((id: string) => any) | null = null;
let getMachineSources: ((id: string) => any) | null = null;
let getDataFreshnessBadge: ((id: string) => any) | null = null;

try {
  const legalMetadataModule = path.join(__dirname, '..', 'src', 'domain', 'legalMetadata');
  const helperModule = path.join(__dirname, '..', 'src', 'utils', 'machineMetadataHelper');
  
  try {
    const legalMetadata = require(legalMetadataModule);
    getMachineLegalMetadata = legalMetadata.getMachineLegalMetadata;
    getMachineSources = legalMetadata.getMachineSources;
  } catch (e) {
    try {
      const legalMetadata = require(legalMetadataModule + '.ts');
      getMachineLegalMetadata = legalMetadata.getMachineLegalMetadata;
      getMachineSources = legalMetadata.getMachineSources;
    } catch (e2) {}
  }
  
  try {
    const helper = require(helperModule);
    getDataFreshnessBadge = helper.getDataFreshnessBadge;
  } catch (e) {
    try {
      const helper = require(helperModule + '.ts');
      getDataFreshnessBadge = helper.getDataFreshnessBadge;
    } catch (e2) {}
  }
} catch (error) {
  console.warn('⚠️  Legal metadata not available');
}

/**
 * Generate individual machine JSON files
 */
function generateMachineFiles(machines: any[]) {
  const machinesDir = path.join(__dirname, '..', 'docs-astro', 'public', 'machines');
  fs.mkdirSync(machinesDir, { recursive: true });
  
  let withSources = 0;
  let withoutSources = 0;
  
  for (const machine of machines) {
    const machineData: any = {
      id: machine.id,
      name: machine.name,
      category: machine.category,
      description: machine.description,
      states: machine.states,
      events: machine.events,
      initial: machine.initial,
      generated: new Date().toISOString(),
    };
    
    // Add legal sources if available
    if (getMachineLegalMetadata && getMachineSources) {
      try {
        const legalMeta = getMachineLegalMetadata(machine.id);
        const sources = getMachineSources(machine.id);
        
        if (legalMeta && sources && sources.length > 0) {
          machineData.legalSources = {
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
            extractionDate: legalMeta.currentVersion?.extractionDate
              ? new Date(legalMeta.currentVersion.extractionDate).toISOString()
              : undefined,
            lastLegislativeUpdate: legalMeta.currentVersion?.lastLegislativeUpdate
              ? new Date(legalMeta.currentVersion.lastLegislativeUpdate).toISOString()
              : undefined,
            version: legalMeta.currentVersion?.version,
          };
          
          if (getDataFreshnessBadge) {
            try {
              const freshness = getDataFreshnessBadge(machine.id);
              machineData.legalSources.dataFreshness = {
                status: freshness.status === 'current' ? 'current' : 'outdated',
                label: freshness.label,
                daysOld: freshness.daysOld || 0,
              };
            } catch (e) {}
          }
          
          withSources++;
        } else {
          withoutSources++;
        }
      } catch (error) {
        withoutSources++;
      }
    } else {
      withoutSources++;
    }
    
    // Write individual file
    const filePath = path.join(machinesDir, `${machine.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(machineData, null, 2), 'utf-8');
  }
  
  console.log(`  ✓ Generated ${machines.length} machine files`);
  console.log(`    - ${withSources} with legal sources`);
  console.log(`    - ${withoutSources} without legal sources`);
  
  return { withSources, withoutSources };
}

/**
 * Generate individual rule JSON files
 */
function generateRuleFiles(rules: any[]) {
  const rulesDir = path.join(__dirname, '..', 'docs-astro', 'public', 'rules');
  fs.mkdirSync(rulesDir, { recursive: true });
  
  let withSources = 0;
  let withoutSources = 0;
  
  for (const rule of rules) {
    const ruleData: any = {
      id: rule.id,
      description: rule.description,
      category: rule.category,
      benefitType: rule.benefitType,
      priority: rule.priority,
      conditions: rule.conditions,
      event: rule.event,
      fileName: rule.fileName,
      generated: new Date().toISOString(),
    };
    
    // Add legal sources if available (rules often map to machines)
    // Try to find related machine ID
    const possibleMachineIds = [
      rule.id,
      rule.benefitType,
      rule.category,
    ];
    
    if (getMachineLegalMetadata && getMachineSources) {
      let found = false;
      for (const machineId of possibleMachineIds) {
        try {
          const legalMeta = getMachineLegalMetadata(machineId);
          const sources = getMachineSources(machineId);
          
          if (legalMeta && sources && sources.length > 0) {
            ruleData.legalSources = {
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
              extractionDate: legalMeta.currentVersion?.extractionDate
                ? new Date(legalMeta.currentVersion.extractionDate).toISOString()
                : undefined,
              lastLegislativeUpdate: legalMeta.currentVersion?.lastLegislativeUpdate
                ? new Date(legalMeta.currentVersion.lastLegislativeUpdate).toISOString()
                : undefined,
              version: legalMeta.currentVersion?.version,
            };
            found = true;
            withSources++;
            break;
          }
        } catch (error) {
          // Try next machine ID
        }
      }
      
      if (!found) {
        withoutSources++;
      }
    } else {
      withoutSources++;
    }
    
    // Write individual file
    const filePath = path.join(rulesDir, `${rule.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(ruleData, null, 2), 'utf-8');
  }
  
  console.log(`  ✓ Generated ${rules.length} rule files`);
  console.log(`    - ${withSources} with legal sources`);
  console.log(`    - ${withoutSources} without legal sources`);
  
  return { withSources, withoutSources };
}

/**
 * Generate individual feature JSON files
 */
function generateFeatureFiles(features: any[]) {
  const featuresDir = path.join(__dirname, '..', 'docs-astro', 'public', 'features');
  fs.mkdirSync(featuresDir, { recursive: true });
  
  let withSources = 0;
  let withoutSources = 0;
  
  for (const feature of features) {
    const featureData: any = {
      id: feature.id,
      name: feature.name,
      description: feature.description,
      category: feature.category,
      tags: feature.tags || [],
      background: feature.background,
      scenarios: feature.scenarios,
      metadata: feature.metadata || {},
      generated: new Date().toISOString(),
    };
    
    // Features often have metadata.legalBasis - check that first
    if (feature.metadata?.legalBasis) {
      featureData.legalSources = {
        sources: [{
          title: feature.metadata.legalBasis,
          authority: feature.metadata.authority || 'Source légale',
        }],
      };
      withSources++;
    } else {
      // Try to find related machine/rule
      const possibleIds = [
        feature.id.replace('benefits-', '').replace('features-', ''),
        feature.category,
      ];
      
      if (getMachineLegalMetadata && getMachineSources) {
        let found = false;
        for (const machineId of possibleIds) {
          try {
            const legalMeta = getMachineLegalMetadata(machineId);
            const sources = getMachineSources(machineId);
            
            if (legalMeta && sources && sources.length > 0) {
              featureData.legalSources = {
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
                extractionDate: legalMeta.currentVersion?.extractionDate
                  ? new Date(legalMeta.currentVersion.extractionDate).toISOString()
                  : undefined,
                lastLegislativeUpdate: legalMeta.currentVersion?.lastLegislativeUpdate
                  ? new Date(legalMeta.currentVersion.lastLegislativeUpdate).toISOString()
                  : undefined,
                version: legalMeta.currentVersion?.version,
              };
              found = true;
              withSources++;
              break;
            }
          } catch (error) {
            // Try next ID
          }
        }
        
        if (!found) {
          withoutSources++;
        }
      } else {
        withoutSources++;
      }
    }
    
    // Write individual file
    const filePath = path.join(featuresDir, `${feature.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(featureData, null, 2), 'utf-8');
  }
  
  console.log(`  ✓ Generated ${features.length} feature files`);
  console.log(`    - ${withSources} with legal sources`);
  console.log(`    - ${withoutSources} without legal sources`);
  
  return { withSources, withoutSources };
}

async function main() {
  console.log('📦 Generating individual metadata files...\n');
  
  // Load existing metadata files
  const machinesPath = path.join(__dirname, '..', 'docs-astro', 'public', 'machines-metadata.json');
  const rulesPath = path.join(__dirname, '..', 'docs-astro', 'public', 'rules-metadata.json');
  const featuresPath = path.join(__dirname, '..', 'docs-astro', 'public', 'features-metadata.json');
  
  let machines: any[] = [];
  let rules: any[] = [];
  let features: any[] = [];
  
  // Load machines
  if (fs.existsSync(machinesPath)) {
    const machinesData = JSON.parse(fs.readFileSync(machinesPath, 'utf-8'));
    machines = machinesData.machines || [];
    console.log(`📊 Found ${machines.length} machines`);
  } else {
    console.warn('⚠️  machines-metadata.json not found. Run npm run docs:metadata first.');
  }
  
  // Load rules
  if (fs.existsSync(rulesPath)) {
    const rulesData = JSON.parse(fs.readFileSync(rulesPath, 'utf-8'));
    rules = rulesData.rules || [];
    console.log(`📊 Found ${rules.length} rules`);
  } else {
    console.warn('⚠️  rules-metadata.json not found. Run npm run rules:metadata first.');
  }
  
  // Load features
  if (fs.existsSync(featuresPath)) {
    const featuresData = JSON.parse(fs.readFileSync(featuresPath, 'utf-8'));
    features = featuresData.features || [];
    console.log(`📊 Found ${features.length} features`);
  } else {
    console.warn('⚠️  features-metadata.json not found. Run npm run features:metadata first.');
  }
  
  console.log('\n');
  
  // Generate individual files
  if (machines.length > 0) {
    console.log('🔧 Generating machine files...');
    generateMachineFiles(machines);
  }
  
  if (rules.length > 0) {
    console.log('\n🔧 Generating rule files...');
    generateRuleFiles(rules);
  }
  
  if (features.length > 0) {
    console.log('\n🔧 Generating feature files...');
    generateFeatureFiles(features);
  }
  
  // Generate index files for quick lookup
  console.log('\n📋 Generating index files...');
  
  const machinesIndex = {
    generated: new Date().toISOString(),
    total: machines.length,
    machines: machines.map(m => ({
      id: m.id,
      name: m.name,
      category: m.category,
    })),
  };
  
  const rulesIndex = {
    generated: new Date().toISOString(),
    total: rules.length,
    rules: rules.map(r => ({
      id: r.id,
      description: r.description,
      category: r.category,
      benefitType: r.benefitType,
    })),
  };
  
  const featuresIndex = {
    generated: new Date().toISOString(),
    total: features.length,
    features: features.map(f => ({
      id: f.id,
      name: f.name,
      category: f.category,
    })),
  };
  
  fs.writeFileSync(
    path.join(__dirname, '..', 'docs-astro', 'public', 'machines-index.json'),
    JSON.stringify(machinesIndex, null, 2),
    'utf-8'
  );
  
  fs.writeFileSync(
    path.join(__dirname, '..', 'docs-astro', 'public', 'rules-index.json'),
    JSON.stringify(rulesIndex, null, 2),
    'utf-8'
  );
  
  fs.writeFileSync(
    path.join(__dirname, '..', 'docs-astro', 'public', 'features-index.json'),
    JSON.stringify(featuresIndex, null, 2),
    'utf-8'
  );
  
  console.log('  ✓ Generated index files');
  
  // Calculate size savings
  const machinesDir = path.join(__dirname, '..', 'docs-astro', 'public', 'machines');
  let totalSize = 0;
  if (fs.existsSync(machinesDir)) {
    const files = fs.readdirSync(machinesDir);
    for (const file of files) {
      const filePath = path.join(machinesDir, file);
      totalSize += fs.statSync(filePath).size;
    }
  }
  
  const originalSize = fs.existsSync(machinesPath) 
    ? fs.statSync(machinesPath).size 
    : 0;
  
  console.log('\n✨ Done!');
  console.log(`📦 Individual files total: ${(totalSize / 1024).toFixed(2)} KB`);
  if (originalSize > 0) {
    console.log(`📦 Original file: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`💡 Files are loaded on-demand, so only needed data is transferred`);
  }
}

main().catch(console.error);

