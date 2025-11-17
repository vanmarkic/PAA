import { test, expect } from '@playwright/test';

/**
 * Performance tests for documentation pages
 * These tests verify page load times and performance metrics
 *
 * Run with: npm run test:docs:performance
 */

test.describe('Performance - Page Load Times', () => {
  test('homepage loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/', { waitUntil: 'networkidle' });

    const loadTime = Date.now() - startTime;

    // Homepage should load within 5 seconds (generous for CI)
    expect(loadTime).toBeLessThan(5000);

    console.log(`Homepage load time: ${loadTime}ms`);
  });

  test('main documentation pages load within acceptable time', async ({ page }) => {
    const pages = ['/benefits', '/features', '/workflows', '/rules', '/developer'];

    for (const pagePath of pages) {
      const startTime = Date.now();

      await page.goto(pagePath, { waitUntil: 'networkidle' });

      const loadTime = Date.now() - startTime;

      // Each page should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);

      console.log(`${pagePath} load time: ${loadTime}ms`);
    }
  });
});

test.describe('Performance - Resource Loading', () => {
  test('homepage loads critical resources efficiently', async ({ page }) => {
    const resources: { url: string; type: string; size: number }[] = [];

    page.on('response', (response) => {
      const url = response.url();
      const type = response.request().resourceType();

      // Track CSS, JS, and image resources
      if (['stylesheet', 'script', 'image'].includes(type)) {
        response.body().then((body) => {
          resources.push({
            url,
            type,
            size: body.length,
          });
        }).catch(() => {
          // Ignore errors for resources we can't access
        });
      }
    });

    await page.goto('/', { waitUntil: 'networkidle' });

    // Wait a bit for all resource tracking to complete
    await page.waitForTimeout(1000);

    // Log resource statistics
    const totalSize = resources.reduce((sum, r) => sum + r.size, 0);
    const cssCount = resources.filter((r) => r.type === 'stylesheet').length;
    const jsCount = resources.filter((r) => r.type === 'script').length;
    const imageCount = resources.filter((r) => r.type === 'image').length;

    console.log(`Total resources loaded: ${resources.length}`);
    console.log(`CSS files: ${cssCount}, JS files: ${jsCount}, Images: ${imageCount}`);
    console.log(`Total size: ${(totalSize / 1024).toFixed(2)} KB`);

    // Basic assertions - adjust based on your actual bundle size
    // Total page weight should be reasonable (< 5MB)
    expect(totalSize).toBeLessThan(5 * 1024 * 1024);
  });

  test('no excessive number of HTTP requests', async ({ page }) => {
    let requestCount = 0;

    page.on('request', () => {
      requestCount++;
    });

    await page.goto('/', { waitUntil: 'networkidle' });

    console.log(`Total HTTP requests: ${requestCount}`);

    // Should not make excessive requests (< 100 is reasonable for modern SPAs)
    expect(requestCount).toBeLessThan(100);
  });
});

test.describe('Performance - Web Vitals', () => {
  test('homepage has good Largest Contentful Paint (LCP)', async ({ page }) => {
    await page.goto('/');

    // Measure LCP using Performance API
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let lcpValue = 0;

        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          lcpValue = lastEntry.renderTime || lastEntry.loadTime;
        });

        observer.observe({ type: 'largest-contentful-paint', buffered: true });

        // Wait a bit then resolve
        setTimeout(() => {
          observer.disconnect();
          resolve(lcpValue);
        }, 2000);
      });
    });

    console.log(`LCP: ${lcp}ms`);

    // LCP should be under 2.5s for good performance
    // We use 4s for CI tolerance
    expect(lcp).toBeLessThan(4000);
  });

  test('homepage has good First Contentful Paint (FCP)', async ({ page }) => {
    await page.goto('/');

    const fcp = await page.evaluate(() => {
      const entries = performance.getEntriesByType('paint');
      const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint');
      return fcpEntry ? fcpEntry.startTime : 0;
    });

    console.log(`FCP: ${fcp}ms`);

    // FCP should be under 1.8s for good performance
    // We use 3s for CI tolerance
    expect(fcp).toBeLessThan(3000);
  });

  test('homepage has acceptable Time to Interactive', async ({ page }) => {
    await page.goto('/');

    const tti = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        // Simple TTI approximation: when page is fully loaded and idle
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        resolve(loadTime);
      });
    });

    console.log(`TTI (approximation): ${tti}ms`);

    // TTI should be reasonable (< 5s)
    expect(tti).toBeLessThan(5000);
  });
});

test.describe('Performance - JavaScript Execution', () => {
  test('no long-running JavaScript tasks', async ({ page }) => {
    const longTasks: any[] = [];

    await page.goto('/');

    // Check for long tasks using Performance Observer
    const tasks = await page.evaluate(() => {
      return new Promise<any[]>((resolve) => {
        const observed: any[] = [];

        try {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.duration > 50) {
                // Tasks longer than 50ms
                observed.push({
                  duration: entry.duration,
                  startTime: entry.startTime,
                });
              }
            }
          });

          observer.observe({ type: 'longtask', buffered: true });

          setTimeout(() => {
            observer.disconnect();
            resolve(observed);
          }, 3000);
        } catch {
          // longtask API might not be available
          resolve([]);
        }
      });
    });

    if (tasks.length > 0) {
      console.log(`Long tasks detected: ${tasks.length}`);
      tasks.forEach((task, i) => {
        console.log(`  Task ${i + 1}: ${task.duration.toFixed(2)}ms at ${task.startTime.toFixed(2)}ms`);
      });
    }

    // Should not have excessive long tasks (< 10)
    expect(tasks.length).toBeLessThan(10);
  });
});

test.describe('Performance - Caching', () => {
  test('static assets are cacheable', async ({ page }) => {
    const cachedResources: string[] = [];
    const noCacheResources: string[] = [];

    page.on('response', (response) => {
      const url = response.url();
      const cacheControl = response.headers()['cache-control'];
      const type = response.request().resourceType();

      if (['stylesheet', 'script', 'image', 'font'].includes(type)) {
        if (cacheControl && !cacheControl.includes('no-cache') && !cacheControl.includes('no-store')) {
          cachedResources.push(url);
        } else {
          noCacheResources.push(url);
        }
      }
    });

    await page.goto('/', { waitUntil: 'networkidle' });

    console.log(`Cacheable resources: ${cachedResources.length}`);
    console.log(`Non-cacheable resources: ${noCacheResources.length}`);

    if (noCacheResources.length > 0) {
      console.log('Non-cacheable resources:', noCacheResources.slice(0, 5));
    }

    // Most static assets should be cacheable
    // This is lenient for development/preview builds
    if (cachedResources.length + noCacheResources.length > 0) {
      const cacheRatio = cachedResources.length / (cachedResources.length + noCacheResources.length);
      expect(cacheRatio).toBeGreaterThan(0.5); // At least 50% should be cacheable
    }
  });
});

test.describe('Performance - Mobile Performance', () => {
  test('homepage performs well on mobile', async ({ page }) => {
    // Emulate mobile device
    await page.emulate({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      viewport: { width: 375, height: 667 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });

    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;

    console.log(`Mobile load time: ${loadTime}ms`);

    // Mobile should load within 6 seconds (accounting for slower mobile networks)
    expect(loadTime).toBeLessThan(6000);
  });
});
