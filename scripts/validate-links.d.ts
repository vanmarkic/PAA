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
/**
 * Main validation function
 */
declare function validateLinks(options: ValidationOptions): {
    valid: number;
    invalid: number;
    external: number;
    anchor: number;
    skipped: number;
};
export { validateLinks, ValidationOptions, LinkResult };
//# sourceMappingURL=validate-links.d.ts.map