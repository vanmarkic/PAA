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

import * as path from 'path';
import { validateLinks, ValidationOptions } from '../src/utils/validateLinks';

const DEFAULT_OPTIONS: ValidationOptions = {
  basePath: '/PAA',
  distDir: path.join(__dirname, '../docs-astro/dist'),
  verbose: false,
};

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
