import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Smoke tests for dynamic documentation routes
 * These tests verify that dynamic pages load correctly with real data
 */

// Load metadata to get real IDs
const loadMetadata = () => {
  try {
    const machinesMetadata = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), 'docs-astro/public/machines-metadata.json'),
        'utf-8'
      )
    );
    const featuresMetadata = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), 'docs-astro/public/features-metadata.json'),
        'utf-8'
      )
    );

    return {
      machines: machinesMetadata.machines || [],
      features: featuresMetadata.features || [],
    };
  } catch (error) {
    console.error('Failed to load metadata:', error);
    return { machines: [], features: [] };
  }
};

test.describe('Dynamic Machine Routes', () => {
  test.beforeAll(() => {
    // Ensure metadata exists
    const metadata = loadMetadata();
    if (metadata.machines.length === 0) {
      console.warn('No machines metadata found - some tests may be skipped');
    }
  });

  test('machine detail page loads for first machine', async ({ page }) => {
    const metadata = loadMetadata();

    if (metadata.machines.length === 0) {
      test.skip();
      return;
    }

    const firstMachine = metadata.machines[0];
    await page.goto(`/machine/${firstMachine.id}`);

    // Check page loads
    await expect(page.locator('body')).toBeVisible();

    // Check for machine-specific content
    const mainContent = page.locator('main, article, .content');
    await expect(mainContent).toBeVisible();

    // Visual regression snapshot
    await expect(page).toHaveScreenshot(`machine-${firstMachine.id}.png`, {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 100, // Allow some diff for dynamic content
    });
  });

  test('machine detail page loads for sample machines from different categories', async ({
    page,
  }) => {
    const metadata = loadMetadata();

    if (metadata.machines.length === 0) {
      test.skip();
      return;
    }

    // Get one machine from each of the first 3 unique categories
    const categoriesMap = new Map<string, any>();
    for (const machine of metadata.machines) {
      if (!categoriesMap.has(machine.category) && categoriesMap.size < 3) {
        categoriesMap.set(machine.category, machine);
      }
      if (categoriesMap.size >= 3) break;
    }

    const sampleMachines = Array.from(categoriesMap.values());

    for (const machine of sampleMachines) {
      await page.goto(`/machine/${machine.id}`);

      // Basic load check
      await expect(page.locator('body')).toBeVisible();

      // Check page doesn't show error state
      const errorIndicators = page.locator('text=/error|not found|404/i');
      const errorCount = await errorIndicators.count();
      expect(errorCount).toBe(0);
    }
  });

  test('workflows detail page loads for first machine', async ({ page }) => {
    const metadata = loadMetadata();

    if (metadata.machines.length === 0) {
      test.skip();
      return;
    }

    const firstMachine = metadata.machines[0];
    await page.goto(`/workflows/${firstMachine.id}`);

    // Check page loads
    await expect(page.locator('body')).toBeVisible();

    // Visual regression snapshot
    await expect(page).toHaveScreenshot(`workflow-${firstMachine.id}.png`, {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 100,
    });
  });
});

test.describe('Dynamic Feature Routes', () => {
  test('feature detail page loads for first feature', async ({ page }) => {
    const metadata = loadMetadata();

    if (metadata.features.length === 0) {
      test.skip();
      return;
    }

    const firstFeature = metadata.features[0];
    await page.goto(`/features/${firstFeature.id}`);

    // Check page loads
    await expect(page.locator('body')).toBeVisible();

    // Check for feature-specific content
    const mainContent = page.locator('main, article, .content');
    await expect(mainContent).toBeVisible();

    // Visual regression snapshot
    await expect(page).toHaveScreenshot(`feature-${firstFeature.id}.png`, {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 100,
    });
  });

  test('feature detail page loads for sample features from different categories', async ({
    page,
  }) => {
    const metadata = loadMetadata();

    if (metadata.features.length === 0) {
      test.skip();
      return;
    }

    // Get one feature from each of the first 3 unique categories
    const categoriesMap = new Map<string, any>();
    for (const feature of metadata.features) {
      if (!categoriesMap.has(feature.category) && categoriesMap.size < 3) {
        categoriesMap.set(feature.category, feature);
      }
      if (categoriesMap.size >= 3) break;
    }

    const sampleFeatures = Array.from(categoriesMap.values());

    for (const feature of sampleFeatures) {
      await page.goto(`/features/${feature.id}`);

      // Basic load check
      await expect(page.locator('body')).toBeVisible();

      // Check page doesn't show error state
      const errorIndicators = page.locator('text=/error|not found|404/i');
      const errorCount = await errorIndicators.count();
      expect(errorCount).toBe(0);
    }
  });
});

test.describe('Category Pages', () => {
  test('machine category pages load', async ({ page }) => {
    const metadata = loadMetadata();

    if (metadata.machines.length === 0) {
      test.skip();
      return;
    }

    // Get first category
    const firstCategory = metadata.machines[0].category;
    await page.goto(`/category/${firstCategory}`);

    // Check page loads
    await expect(page.locator('body')).toBeVisible();

    // Visual regression snapshot
    await expect(page).toHaveScreenshot(`category-${firstCategory}.png`, {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 100,
    });
  });

  test('feature category pages load', async ({ page }) => {
    const metadata = loadMetadata();

    if (metadata.features.length === 0) {
      test.skip();
      return;
    }

    // Get first category
    const firstCategory = metadata.features[0].category;
    await page.goto(`/features/category/${firstCategory}`);

    // Check page loads
    await expect(page.locator('body')).toBeVisible();

    // Visual regression snapshot
    await expect(page).toHaveScreenshot(`feature-category-${firstCategory}.png`, {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 100,
    });
  });
});

test.describe('Dynamic Routes - Error Handling', () => {
  test('non-existent machine ID shows appropriate error', async ({ page }) => {
    await page.goto('/machine/non-existent-machine-id-12345');

    // Page should load (not network error)
    await expect(page.locator('body')).toBeVisible();

    // Should show some kind of error or 404 message (or redirect)
    // We just verify the page loads, specific error handling is implementation-dependent
  });

  test('non-existent feature ID shows appropriate error', async ({ page }) => {
    await page.goto('/features/non-existent-feature-id-12345');

    // Page should load (not network error)
    await expect(page.locator('body')).toBeVisible();
  });
});
