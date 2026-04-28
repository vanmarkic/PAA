#!/usr/bin/env node
/**
 * Feature File Parser Error Fix Script
 * 
 * Automatically fixes common Gherkin parsing errors in feature files
 * by converting orphaned lines into proper "Et" (And) steps
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Feature File Parser Error Fix Script');
console.log('======================================\n');

// Find all feature files
function findFeatureFiles(dir) {
  const results = [];
  
  function walk(currentDir) {
    try {
      const entries = fs.readdirSync(currentDir);
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walk(fullPath);
        } else if (entry.endsWith('.feature')) {
          results.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }
  
  walk(dir);
  return results;
}

// Fix common parsing errors
function fixFeatureFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  
  // Pattern 1: Lines starting with "Ou " (Or) - convert to "Et " (And)
  content = content.replace(/^\s*Ou /gm, '    Et ');
  
  // Pattern 2: Lines starting with "Si " (If) - convert to "Et " (And)
  content = content.replace(/^\s*Si /gm, '    Et ');
  
  // Pattern 3: Lines starting with "Avec " (With) - convert to "Et " (And)
  content = content.replace(/^\s*Avec /gm, '    Et ');
  
  // Pattern 4: Lines starting with "Couvrant " (Covering) - convert to "Et " (And)
  content = content.replace(/^\s*Couvrant /gm, '    Et ');
  
  // Pattern 5: Lines starting with "Sauf " (Except) - convert to "Et " (And)
  content = content.replace(/^\s*Sauf /gm, '    Et ');
  
  // Pattern 6: Lines starting with "L'" (The) - convert to "Et " (And)
  content = content.replace(/^\s*L'/gm, '    Et ');
  
  // Only write back if changes were made
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  
  return false;
}

// Main execution
const featuresDir = path.join(__dirname, 'features');
const featureFiles = findFeatureFiles(featuresDir);

console.log(`📄 Found ${featureFiles.length} feature files\n`);

let fixedCount = 0;
let errorCount = 0;

for (const file of featureFiles) {
  try {
    const relativePath = path.relative(__dirname, file);
    const fixed = fixFeatureFile(file);
    
    if (fixed) {
      console.log(`✅ Fixed: ${relativePath}`);
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}: ${error.message}`);
    errorCount++;
  }
}

console.log(`\n📊 Summary:`);
console.log(`  ✅ Fixed files: ${fixedCount}`);
console.log(`  ❌ Errors: ${errorCount}`);
console.log(`  📝 Total files processed: ${featureFiles.length}`);

if (fixedCount > 0) {
  console.log(`\n🔄 Please try rebuilding the Astro site now:`);
  console.log(`   cd docs-astro && npm run astro build`);
} else {
  console.log(`\n✅ No parsing errors found to fix.`);
}