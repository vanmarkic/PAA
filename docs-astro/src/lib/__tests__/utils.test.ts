import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('utils - pure functions', () => {
  it('slugify should convert text to URL-friendly slug', async () => {
    const { slugify } = await import('../utils');

    assert.strictEqual(slugify('Hello World'), 'hello-world');
    assert.strictEqual(slugify('  Multiple   Spaces  '), 'multiple-spaces');
    assert.strictEqual(slugify('Special!@#$%Characters'), 'specialcharacters');
    assert.strictEqual(slugify('Already-slugified'), 'already-slugified');
    assert.strictEqual(slugify('UPPERCASE'), 'uppercase');
  });

  it('truncate should shorten text with ellipsis', async () => {
    const { truncate } = await import('../utils');

    assert.strictEqual(truncate('Hello World', 5), 'Hello...');
    assert.strictEqual(truncate('Short', 10), 'Short');
    assert.strictEqual(truncate('Exactly10!', 10), 'Exactly10!');
  });

  it('formatDate should format dates correctly', async () => {
    const { formatDate } = await import('../utils');

    const date = new Date('2024-01-15');
    const formatted = formatDate(date, 'en-US');
    assert.ok(formatted.includes('January'));
    assert.ok(formatted.includes('15'));
    assert.ok(formatted.includes('2024'));
  });

  it('formatBelgianDate should format dates in Belgian locale', async () => {
    const { formatBelgianDate } = await import('../utils');

    const date = new Date('2024-01-15');
    const formatted = formatBelgianDate(date);
    // Belgian format: day/month/year
    assert.ok(formatted.includes('15'));
    assert.ok(formatted.includes('2024'));
  });

  it('isBrowser should return false in Node.js', async () => {
    const { isBrowser } = await import('../utils');

    assert.strictEqual(isBrowser(), false);
  });
});

describe('buildUrlPath - GitHub Pages URL building', () => {
  it('should generate correct URL with /PAA base path (GitHub Pages)', async () => {
    const { buildUrlPath } = await import('../utils');

    // Simulate GitHub Pages deployment: https://username.github.io/PAA/
    const url = buildUrlPath('/PAA/', '/docs/intro');
    assert.strictEqual(url, '/PAA/docs/intro');
  });

  it('should handle base path without trailing slash', async () => {
    const { buildUrlPath } = await import('../utils');

    const url = buildUrlPath('/PAA', '/docs/intro');
    assert.strictEqual(url, '/PAA/docs/intro');
  });

  it('should handle path without leading slash', async () => {
    const { buildUrlPath } = await import('../utils');

    const url = buildUrlPath('/PAA/', 'docs/intro');
    assert.strictEqual(url, '/PAA/docs/intro');
  });

  it('should work with root base path (local dev)', async () => {
    const { buildUrlPath } = await import('../utils');

    const url = buildUrlPath('/', '/docs/intro');
    assert.strictEqual(url, '/docs/intro');
  });

  it('should handle empty path', async () => {
    const { buildUrlPath } = await import('../utils');

    const url = buildUrlPath('/PAA', '');
    assert.strictEqual(url, '/PAA/');
  });

  it('should normalize double slashes in path', async () => {
    const { buildUrlPath } = await import('../utils');

    const url = buildUrlPath('/PAA/', '//docs//intro');
    assert.strictEqual(url, '/PAA/docs/intro');
  });

  it('should handle deeply nested paths', async () => {
    const { buildUrlPath } = await import('../utils');

    const url = buildUrlPath('/PAA', '/docs/guides/getting-started/installation');
    assert.strictEqual(url, '/PAA/docs/guides/getting-started/installation');
  });
});
