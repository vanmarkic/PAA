#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('🔧 Comprehensive Feature File Fix Script\n');

function findFeatureFiles(dir) {
  const results = [];
  function walk(currentDir) {
    try {
      const entries = fs.readdirSync(currentDir);
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) walk(fullPath);
        else if (entry.endsWith('.feature')) results.push(fullPath);
      }
    } catch (error) {}
  }
  walk(dir);
  return results;
}

function fixFeatureFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  
  // Fix lines that start with various patterns but aren't proper Gherkin steps
  // These should be converted to "Et " (And) steps
  const patterns = [
    'Plafonné si nécessaire',
    'Puis je bascule en',
    'Après fin incapacité si pas de reprise',
    'Jusqu\'à 6 semaines avant accouchement'
  ];
  
  patterns.forEach(pattern => {
    const regex = new RegExp(`^\\s*${pattern}`, 'gm');
    content = content.replace(regex, `    Et ${pattern}`);
  });
  
  // Fix bullet points that should be part of previous steps
  content = content.replace(/^\s*- (Indemnité|Minimum|Maximum|Taux) = /gm, '    Et $1 = ');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

const featuresDir = path.join(__dirname, 'features');
const featureFiles = findFeatureFiles(featuresDir);

console.log(`Found ${featureFiles.length} feature files\n`);

let fixedCount = 0;
featureFiles.forEach(file => {
  try {
    const relativePath = path.relative(__dirname, file);
    if (fixFeatureFile(file)) {
      console.log(`✅ Fixed: ${relativePath}`);
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Error: ${file} - ${error.message}`);
  }
});

console.log(`\n✅ Fixed ${fixedCount} files`);
console.log(`Try: cd docs-astro && npm run astro build`);
