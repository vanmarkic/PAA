#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('🔧 Feature File Parser Error Fix Script v2\n');

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
  
  // Fix specific problematic lines
  const fixes = [
    { pattern: /^\s*Après déduction du loyer et charges fixes$/gm, replacement: '    Et après déduction du loyer et charges fixes' },
    { pattern: /^\s*Ou dans les 24h si urgence médicale$/gm, replacement: '    Et ou dans les 24h si urgence médicale' },
    { pattern: /^\s*Avec risque de remboursement partiel seulement$/gm, replacement: '    Et avec risque de remboursement partiel seulement' },
    { pattern: /^\s*L'aide médicale urgente reste accessible$/gm, replacement: '    Et l\'aide médicale urgente reste accessible' },
    { pattern: /^\s*Si attestée médicalement nécessaire$/gm, replacement: '    Et si attestée médicalement nécessaire' }
  ];
  
  fixes.forEach(fix => {
    content = content.replace(fix.pattern, fix.replacement);
  });
  
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
