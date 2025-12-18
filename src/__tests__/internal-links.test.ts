import fs from 'fs';
import path from 'path';

describe('Internal Links - No Hardcoded Paths', () => {
  // Pattern to match hardcoded /PAA prefix (should use BASE_URL or relative paths instead)
  const hardcodedPAAPattern = /href=["']\/PAA\/|href=`\/PAA\/|navigate\(["']\/PAA\/|fetch\(["']\/PAA\//g;

  // Pattern to match unresolved internal links that should use BASE_URL
  const _internalLinkPattern = /href=["'{`](\/[a-z])/g;

  // Files to exclude from checks
  const excludePatterns = [
    /node_modules/,
    /dist/,
    /\.next/,
    /__pycache__/,
    /\.git/,
    /ui\//,  // Exclude UI component library files
  ];

  function shouldExcludeFile(filePath: string): boolean {
    return excludePatterns.some(pattern => pattern.test(filePath));
  }

  function getFilesRecursively(dir: string): string[] {
    let files: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (shouldExcludeFile(fullPath)) continue;

      if (entry.isDirectory()) {
        files = files.concat(getFilesRecursively(fullPath));
      } else if (
        entry.name.endsWith('.astro') ||
        entry.name.endsWith('.tsx') ||
        entry.name.endsWith('.ts') ||
        entry.name.endsWith('.jsx') ||
        entry.name.endsWith('.js')
      ) {
        files.push(fullPath);
      }
    }
    return files;
  }

  test('Astro pages should NOT have hardcoded /PAA prefix', () => {
    const astroDir = path.join(__dirname, '../../docs-astro/src/pages');
    if (!fs.existsSync(astroDir)) {
      console.warn(`Astro pages directory not found: ${astroDir}`);
      return;
    }

    const files = getFilesRecursively(astroDir);
    const violations: string[] = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const relPath = path.relative(process.cwd(), file);
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        if (hardcodedPAAPattern.test(line)) {
          violations.push(`${relPath}:${index + 1}: Found hardcoded /PAA prefix - use BASE_URL or relative paths instead`);
        }
      });
    }

    if (violations.length > 0) {
      throw new Error(
        `Found ${violations.length} hardcoded /PAA prefixes:\n${violations.join('\n')}`
      );
    }
  });

  test('React components should NOT have hardcoded /PAA prefix', () => {
    const docsComponentsDir = path.join(__dirname, '../../docs-astro/src/components');
    const frontendPagesDir = path.join(__dirname, '../../frontend/src/pages');

    let files: string[] = [];

    if (fs.existsSync(docsComponentsDir)) {
      files = files.concat(getFilesRecursively(docsComponentsDir));
    }
    if (fs.existsSync(frontendPagesDir)) {
      files = files.concat(getFilesRecursively(frontendPagesDir));
    }

    const violations: string[] = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const relPath = path.relative(process.cwd(), file);
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        if (hardcodedPAAPattern.test(line)) {
          violations.push(`${relPath}:${index + 1}: Found hardcoded /PAA prefix - use BASE_URL or relative paths instead`);
        }
      });
    }

    if (violations.length > 0) {
      throw new Error(
        `Found ${violations.length} hardcoded /PAA prefixes:\n${violations.join('\n')}`
      );
    }
  });
});
