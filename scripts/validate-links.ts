#!/usr/bin/env ts-node
/**
 * Link Validation Script for Astro SSG Site
 * 
 * Scans all HTML files in the built Astro site and validates that all internal links
 * work correctly with the GitHub Pages base path (/PAA).
 * 
 * Uses regex for efficient link extraction (much faster than DOM parsing).
 * 
 * Usage:
 *   npm run validate:links
 *   npm run validate:links -- --base-path /PAA
 *   npm run validate:links -- --base-path /  (for local testing)
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationOptions {
  basePath: string;
  distDir: string;
  verbose: boolean;
}

interface LinkResult {
  file: string;
  link: string;
  resolved: string;
  status: 'valid' | 'invalid' | 'external' | 'anchor' | 'skipped';
  error?: string;
}

const DEFAULT_OPTIONS: ValidationOptions = {
  basePath: '/PAA',
  distDir: path.join(__dirname, '../docs-astro/dist'),
  verbose: false,
};

/**
 * Extract all href attributes from <a> tags and JavaScript strings
 * Much more efficient than DOM parsing for this use case
 * 
 * Note: This will also extract href from JavaScript strings (false positives),
 * but this is acceptable as it ensures external links are detected.
 */
function extractLinks(html: string): string[] {
  const links: string[] = [];
  // Match href in <a> tags: <a ... href="..." ...>
  const anchorTagRegex = /<a\s+[^>]*href\s*=\s*["']([^"']+)["'][^>]*>|<a\s+[^>]*href\s*=\s*([^\s>]+)[^>]*>/gi;
  let match;
  
  while ((match = anchorTagRegex.exec(html)) !== null) {
    const href = match[1] || match[2];
    if (href) {
      links.push(href);
    }
  }
  
  // Also match href patterns in JavaScript code inside <script> tags
  // This catches external links in JavaScript code (e.g., window.location.href = "http://...")
  // Extract script content first to avoid matching HTML attributes
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  while ((match = scriptRegex.exec(html)) !== null) {
    const scriptContent = match[1];
    // Match: .href = "...", href = "...", href: "...", etc. in JavaScript
    const jsHrefRegex = /(?:\.href|href)\s*[:=]\s*(["'])([^"']+)\1/gi;
    let jsMatch;
    while ((jsMatch = jsHrefRegex.exec(scriptContent)) !== null) {
      const href = jsMatch[2];
      if (href) {
        links.push(href);
      }
    }
  }
  
  return links;
}

/**
 * Check if an anchor exists in the HTML content
 */
function anchorExists(html: string, anchorId: string): boolean {
  // Check for id="anchorId" or name="anchorId"
  const idRegex = new RegExp(`(?:id|name)=["']${anchorId}["']`, 'i');
  return idRegex.test(html);
}

/**
 * Resolve a link relative to the current file
 */
function resolveLink(link: string, currentFile: string, basePath: string, distDir: string): string {
  // Skip external links
  if (link.startsWith('http://') || link.startsWith('https://') || link.startsWith('//')) {
    return link;
  }
  
  // Skip mailto and other protocols
  if (link.includes(':') && !link.startsWith('/')) {
    return link;
  }
  
  // Handle anchor links
  if (link.startsWith('#')) {
    return link;
  }
  
  // Remove base path if present
  let cleanLink = link;
  if (cleanLink.startsWith(basePath)) {
    cleanLink = cleanLink.slice(basePath.length);
  }
  
  // Remove query strings and fragments
  const [pathPart] = cleanLink.split('?');
  const [finalPath] = pathPart.split('#');
  
  // Handle absolute paths (starting with /) - resolve from dist root
  if (finalPath.startsWith('/')) {
    const absolutePath = finalPath.slice(1); // Remove leading /
    const resolved = path.resolve(distDir, absolutePath);
    return path.relative(distDir, resolved);
  }
  
  // Resolve relative paths from current file's directory
  const currentDir = path.dirname(currentFile);
  const resolved = path.resolve(currentDir, finalPath);
  
  // Normalize to relative path from distDir
  return path.relative(distDir, resolved);
}

/**
 * Check if a file exists (handling index.html for directories)
 */
function fileExists(filePath: string, distDir: string): boolean {
  // Check if file exists directly
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return true;
  }
  
  // Check for index.html in directory
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    const indexPath = path.join(filePath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return true;
    }
  }
  
  // Check if it's a directory that should have index.html
  const indexPath = path.join(filePath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return true;
  }
  
  // Check for .html extension
  const htmlPath = filePath.endsWith('.html') ? filePath : filePath + '.html';
  if (fs.existsSync(htmlPath)) {
    return true;
  }
  
  return false;
}

/**
 * Validate links in a single HTML file
 */
function validateFileLinks(
  filePath: string,
  options: ValidationOptions
): LinkResult[] {
  const results: LinkResult[] = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract all links using regex (much faster than DOM parsing)
  const links = extractLinks(content);
  
  for (const href of links) {
    const result: LinkResult = {
      file: path.relative(options.distDir, filePath),
      link: href,
      resolved: '',
      status: 'skipped',
    };
    
    // Skip external links
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) {
      result.status = 'external';
      results.push(result);
      continue;
    }
    
    // Skip mailto and other protocols
    if (href.includes(':') && !href.startsWith('/')) {
      result.status = 'external';
      results.push(result);
      continue;
    }
    
    // Handle anchor links (check if anchor exists in current document)
    if (href.startsWith('#')) {
      const anchorId = href.slice(1);
      if (anchorExists(content, anchorId)) {
        result.status = 'anchor';
        result.resolved = href;
      } else {
        result.status = 'invalid';
        result.resolved = href;
        result.error = `Anchor #${anchorId} not found in document`;
      }
      results.push(result);
      continue;
    }
    
    // Resolve internal link
    try {
      const resolvedPath = resolveLink(href, filePath, options.basePath, options.distDir);
      result.resolved = resolvedPath;
      
      // Check if file exists
      const fullPath = path.join(options.distDir, resolvedPath);
      if (fileExists(fullPath, options.distDir)) {
        result.status = 'valid';
      } else {
        result.status = 'invalid';
        result.error = `File not found: ${resolvedPath}`;
      }
    } catch (error) {
      result.status = 'invalid';
      result.error = error instanceof Error ? error.message : String(error);
    }
    
    results.push(result);
  }
  
  return results;
}

/**
 * Find all HTML files in the dist directory
 */
function findHtmlFiles(distDir: string): string[] {
  const files: string[] = [];
  
  function walkDir(dir: string) {
    const entries = fs.readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.endsWith('.html')) {
        files.push(fullPath);
      }
    }
  }
  
  if (fs.existsSync(distDir)) {
    walkDir(distDir);
  }
  
  return files;
}

/**
 * Main validation function
 */
function validateLinks(options: ValidationOptions): { valid: number; invalid: number; external: number; anchor: number; skipped: number } {
  const stats = {
    valid: 0,
    invalid: 0,
    external: 0,
    anchor: 0,
    skipped: 0,
  };
  
  if (!fs.existsSync(options.distDir)) {
    console.error(`❌ Dist directory not found: ${options.distDir}`);
    console.error('   Please build the Astro site first: npm run astro:build');
    process.exit(1);
  }
  
  console.log(`🔍 Scanning HTML files in: ${options.distDir}`);
  console.log(`📁 Base path: ${options.basePath}`);
  console.log('');
  
  const htmlFiles = findHtmlFiles(options.distDir);
  console.log(`📄 Found ${htmlFiles.length} HTML file(s)\n`);
  
  const allResults: LinkResult[] = [];
  const startTime = Date.now();
  
  for (const file of htmlFiles) {
    const results = validateFileLinks(file, options);
    allResults.push(...results);
  }
  
  const duration = Date.now() - startTime;
  
  // Count results
  for (const result of allResults) {
    stats[result.status]++;
  }
  
  // Print results
  const invalidResults = allResults.filter(r => r.status === 'invalid');
  
  if (invalidResults.length > 0) {
    console.log('❌ Invalid Links Found:\n');
    for (const result of invalidResults) {
      console.log(`  File: ${result.file}`);
      console.log(`  Link: ${result.link}`);
      console.log(`  Resolved: ${result.resolved}`);
      console.log(`  Error: ${result.error}`);
      console.log('');
    }
  }
  
  // Print summary
  console.log('📊 Summary:');
  console.log(`  ✅ Valid: ${stats.valid}`);
  console.log(`  ❌ Invalid: ${stats.invalid}`);
  console.log(`  🔗 External: ${stats.external}`);
  console.log(`  ⚓ Anchor: ${stats.anchor}`);
  console.log(`  ⏭️  Skipped: ${stats.skipped}`);
  console.log(`  📝 Total: ${allResults.length}`);
  console.log(`  ⏱️  Duration: ${duration}ms`);
  
  if (options.verbose && stats.valid > 0) {
    console.log('\n✅ Valid Links:');
    allResults
      .filter(r => r.status === 'valid')
      .forEach(r => {
        console.log(`  ${r.file} → ${r.link} (${r.resolved})`);
      });
  }
  
  return stats;
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  
  const options: ValidationOptions = { ...DEFAULT_OPTIONS };
  
  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--base-path' && args[i + 1]) {
      options.basePath = args[i + 1];
      i++;
    } else if (args[i] === '--dist-dir' && args[i + 1]) {
      options.distDir = path.resolve(args[i + 1]);
      i++;
    } else if (args[i] === '--verbose' || args[i] === '-v') {
      options.verbose = true;
    }
  }
  
  const stats = validateLinks(options);
  
  if (stats.invalid > 0) {
    console.error('\n❌ Link validation failed!');
    process.exit(1);
  } else {
    console.log('\n✅ All links are valid!');
    process.exit(0);
  }
}

export { validateLinks, ValidationOptions, LinkResult };
