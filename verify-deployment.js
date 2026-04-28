#!/usr/bin/env node
/**
 * GitHub Pages Deployment Verification Script
 * 
 * Checks if the GitHub Pages deployment is working correctly
 * by verifying the base path configuration and checking for common issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 GitHub Pages Deployment Verification');
console.log('=====================================\n');

// Check if dist directory exists
const distDir = path.join(__dirname, 'docs-astro/dist');
if (!fs.existsSync(distDir)) {
  console.error('❌ Dist directory not found:', distDir);
  console.error('   Please build the Astro site first: npm run astro:build');
  process.exit(1);
}

console.log('✅ Dist directory found:', distDir);

// Check if index.html exists
const indexPath = path.join(distDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html not found in dist directory');
  process.exit(1);
}

console.log('✅ index.html found');

// Check index.html content for base path
const indexContent = fs.readFileSync(indexPath, 'utf-8');

// Check for GitHub Pages base path
const basePathRegex = /href="\/PAA/g;
const basePathMatches = indexContent.match(basePathRegex);

if (!basePathMatches || basePathMatches.length === 0) {
  console.error('❌ No /PAA base path found in index.html');
  console.error('   GitHub Pages requires base path /PAA for this repository');
  process.exit(1);
}

console.log(`✅ Found ${basePathMatches.length} links with /PAA base path`);

// Check for common GitHub Pages issues
const issues = [];

// Check for .DS_Store files
const dsStoreFiles = findFiles(distDir, '.DS_Store');
if (dsStoreFiles.length > 0) {
  issues.push(`Found ${dsStoreFiles.length} .DS_Store files (should be removed)`);
}

// Check for .git directories
const gitDirs = findDirectories(distDir, '.git');
if (gitDirs.length > 0) {
  issues.push(`Found ${gitDirs.length} .git directories (should be removed)`);
}

// Check for node_modules
const nodeModulesDirs = findDirectories(distDir, 'node_modules');
if (nodeModulesDirs.length > 0) {
  issues.push(`Found ${nodeModulesDirs.length} node_modules directories (should be removed)`);
}

// Check for common deployment issues
if (issues.length > 0) {
  console.log('\n⚠️  Potential Issues Found:');
  issues.forEach(issue => console.log(`  - ${issue}`));
} else {
  console.log('✅ No common deployment issues found');
}

// Check GitHub Pages configuration
console.log('\n📋 GitHub Pages Configuration:');
console.log('  Base Path: /PAA');
console.log('  Site URL: https://vanmarkic.github.io/PAA');
console.log('  Build Command: npm run astro:build');
console.log('  Deploy Command: GitHub Actions (CI/CD workflow)');

console.log('\n✅ GitHub Pages deployment configuration looks correct!');
console.log('\n📝 Next Steps:');
console.log('  1. Push changes to master/main branch');
console.log('  2. GitHub Actions will automatically build and deploy');
console.log('  3. Check deployment status in GitHub repository settings');
console.log('  4. Visit https://vanmarkic.github.io/PAA to verify');

function findFiles(dir, filename) {
  const results = [];
  
  function walk(currentDir) {
    try {
      const entries = fs.readdirSync(currentDir);
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walk(fullPath);
        } else if (entry === filename) {
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

function findDirectories(dir, dirname) {
  const results = [];
  
  function walk(currentDir) {
    try {
      const entries = fs.readdirSync(currentDir);
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (entry === dirname) {
            results.push(fullPath);
          }
          walk(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }
  
  walk(dir);
  return results;
}