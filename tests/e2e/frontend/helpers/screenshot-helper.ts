/**
 * Screenshot Helper Utility
 *
 * Provides utilities for capturing and organizing screenshots in Playwright tests.
 * Automatically organizes screenshots by viewport type (desktop/mobile) with
 * consistent naming conventions including timestamps and step numbers.
 *
 * @example
 * ```typescript
 * import { captureScreenshot } from './helpers/screenshot-helper';
 *
 * test('user journey', async ({ page }) => {
 *   // Capture with step number and name
 *   await captureScreenshot(page, 'homepage', { step: 1, testName: 'user-journey' });
 *
 *   // Capture at specific step
 *   await captureScreenshot(page, 'search-results', { step: 2, testName: 'user-journey' });
 * });
 * ```
 */

import { Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Viewport size thresholds for determining device type
 */
const VIEWPORT_THRESHOLDS = {
  MOBILE_MAX_WIDTH: 768, // iPad Mini and smaller
  TABLET_MAX_WIDTH: 1024, // iPad Pro and smaller
};

/**
 * Screenshot options configuration
 */
export interface ScreenshotOptions {
  /**
   * Step number for sequential screenshots (e.g., 01, 02, 03)
   * @default undefined (no step number)
   */
  step?: number;

  /**
   * Test name for screenshot organization
   * Used to group related screenshots together
   */
  testName?: string;

  /**
   * Custom file extension (without dot)
   * @default 'png'
   */
  extension?: string;

  /**
   * Include timestamp in filename
   * Format: YYYYMMDD-HHMMSS
   * @default true
   */
  includeTimestamp?: boolean;

  /**
   * Force device type override (desktop/mobile)
   * If not specified, auto-detected from viewport width
   * @default undefined (auto-detect)
   */
  deviceType?: 'desktop' | 'mobile';

  /**
   * Playwright screenshot options
   */
  playwrightOptions?: Parameters<Page['screenshot']>[0];
}

/**
 * Screenshot path configuration
 */
export interface ScreenshotPath {
  /** Full file path including filename */
  fullPath: string;

  /** Directory containing the screenshot */
  directory: string;

  /** Filename with extension */
  filename: string;

  /** Device type (desktop or mobile) */
  deviceType: 'desktop' | 'mobile';

  /** Timestamp in YYYYMMDD-HHMMSS format */
  timestamp: string;
}

/**
 * Get current timestamp in YYYYMMDD-HHMMSS format
 *
 * @returns Formatted timestamp string
 *
 * @example
 * ```typescript
 * const timestamp = getTimestamp();
 * // Returns: '20231215-143052'
 * ```
 */
export function getTimestamp(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

/**
 * Format step number with leading zeros
 *
 * @param step - Step number (1-indexed)
 * @returns Formatted step string (e.g., '01', '02', '10')
 *
 * @example
 * ```typescript
 * formatStepNumber(1); // '01'
 * formatStepNumber(10); // '10'
 * ```
 */
export function formatStepNumber(step: number): string {
  return String(step).padStart(2, '0');
}

/**
 * Determine device type based on viewport width
 *
 * Device classification:
 * - Mobile: width <= 768px
 * - Desktop: width > 768px
 *
 * @param page - Playwright page object
 * @returns 'mobile' or 'desktop'
 *
 * @example
 * ```typescript
 * const deviceType = await detectDeviceType(page);
 * // Returns: 'mobile' or 'desktop'
 * ```
 */
export async function detectDeviceType(
  page: Page,
  options?: { deviceTypeOverride?: 'desktop' | 'mobile' }
): Promise<'desktop' | 'mobile'> {
  if (options?.deviceTypeOverride) {
    return options.deviceTypeOverride;
  }

  const viewportSize = page.viewportSize();

  if (!viewportSize) {
    return 'desktop'; // Default to desktop if viewport is not set
  }

  return viewportSize.width <= VIEWPORT_THRESHOLDS.MOBILE_MAX_WIDTH ? 'mobile' : 'desktop';
}

/**
 * Create screenshot path and directory structure
 *
 * Path structure:
 * - Base: tests/e2e/frontend/__screenshots__
 * - Device folder: {desktop|mobile}
 * - Filename: [step-][testName-][name]-{timestamp}.png
 *
 * Examples:
 * - tests/e2e/frontend/__screenshots__/desktop/01-user-journey-homepage-20231215-143052.png
 * - tests/e2e/frontend/__screenshots__/mobile/02-user-journey-search-20231215-143052.png
 * - tests/e2e/frontend/__screenshots__/desktop/homepage-20231215-143052.png
 *
 * @param screenshotName - Name of the screenshot (e.g., 'homepage-load', 'search-results')
 * @param options - Screenshot options
 * @returns Screenshot path configuration
 *
 * @example
 * ```typescript
 * const pathConfig = createScreenshotPath('homepage-load', {
 *   step: 1,
 *   testName: 'user-journey',
 *   deviceType: 'desktop'
 * });
 *
 * console.log(pathConfig.fullPath);
 * // Output: /absolute/path/tests/e2e/frontend/__screenshots__/desktop/01-user-journey-homepage-load-20231215-143052.png
 * ```
 */
export function createScreenshotPath(
  screenshotName: string,
  options: ScreenshotOptions & { deviceType: 'desktop' | 'mobile' }
): ScreenshotPath {
  const timestamp = getTimestamp();
  const extension = options.extension || 'png';

  // Build filename components
  const nameParts: string[] = [];

  // Add step number if provided
  if (options.step !== undefined) {
    nameParts.push(formatStepNumber(options.step));
  }

  // Add test name if provided
  if (options.testName) {
    nameParts.push(options.testName);
  }

  // Add screenshot name
  nameParts.push(screenshotName);

  // Build final filename with timestamp
  const baseFilename = nameParts.join('-');
  const filename = `${baseFilename}-${timestamp}.${extension}`;

  // Build directory path
  const deviceFolder = options.deviceType;
  const screenshotsDir = path.join(
    __dirname,
    '..',
    '__screenshots__',
    deviceFolder
  );

  // Build full path
  const fullPath = path.join(screenshotsDir, filename);

  return {
    fullPath,
    directory: screenshotsDir,
    filename,
    deviceType: options.deviceType,
    timestamp,
  };
}

/**
 * Ensure screenshot directory exists, creating if necessary
 *
 * @param directoryPath - Full path to directory to create
 */
export function ensureScreenshotDirectory(directoryPath: string): void {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
}

/**
 * Capture a screenshot with organized naming and storage
 *
 * Automatically:
 * - Detects device type (mobile/desktop) based on viewport width
 * - Generates timestamps in YYYYMMDD-HHMMSS format
 * - Organizes into device-specific folders
 * - Supports sequential step numbering
 *
 * @param page - Playwright page object
 * @param screenshotName - Name of the screenshot (e.g., 'homepage', 'search-results')
 * @param options - Screenshot options
 * @returns Screenshot path configuration for the saved screenshot
 *
 * @throws Will throw if screenshot cannot be saved
 *
 * @example
 * ```typescript
 * import { test } from '@playwright/test';
 * import { captureScreenshot } from './helpers/screenshot-helper';
 *
 * test('user journey', async ({ page }) => {
 *   await page.goto('https://example.com');
 *
 *   // Capture homepage screenshot with step number
 *   const homepageScreenshot = await captureScreenshot(page, 'homepage-load', {
 *     step: 1,
 *     testName: 'user-journey'
 *   });
 *   console.log(`Saved to: ${homepageScreenshot.fullPath}`);
 *
 *   // Capture search results screenshot
 *   const searchScreenshot = await captureScreenshot(page, 'search-results', {
 *     step: 2,
 *     testName: 'user-journey'
 *   });
 *
 *   // Capture with force mobile device type
 *   const mobileScreenshot = await captureScreenshot(page, 'mobile-view', {
 *     deviceType: 'mobile',
 *     testName: 'responsive-test'
 *   });
 * });
 * ```
 */
export async function captureScreenshot(
  page: Page,
  screenshotName: string,
  options: ScreenshotOptions = {}
): Promise<ScreenshotPath> {
  // Detect device type
  const deviceType = await detectDeviceType(page, { deviceTypeOverride: options.deviceType });

  // Determine if timestamp should be included
  const includeTimestamp = options.includeTimestamp !== false; // Default: true

  // Create screenshot path configuration
  const pathConfig = createScreenshotPath(screenshotName, {
    ...options,
    deviceType,
    includeTimestamp,
  });

  // Ensure directory exists
  ensureScreenshotDirectory(pathConfig.directory);

  // Set default Playwright screenshot options
  const playwrightOptions = {
    path: pathConfig.fullPath,
    fullPage: false, // Capture visible area, not full page by default
    ...options.playwrightOptions,
  };

  // Capture screenshot
  await page.screenshot(playwrightOptions);

  return pathConfig;
}

/**
 * Capture full-page screenshot with organized naming
 *
 * Convenience wrapper around `captureScreenshot()` that automatically
 * enables `fullPage` option in Playwright settings.
 *
 * @param page - Playwright page object
 * @param screenshotName - Name of the screenshot
 * @param options - Screenshot options
 * @returns Screenshot path configuration
 *
 * @example
 * ```typescript
 * const result = await captureFullPageScreenshot(page, 'homepage', {
 *   step: 1,
 *   testName: 'visual-regression'
 * });
 * ```
 */
export async function captureFullPageScreenshot(
  page: Page,
  screenshotName: string,
  options: ScreenshotOptions = {}
): Promise<ScreenshotPath> {
  return captureScreenshot(page, screenshotName, {
    ...options,
    playwrightOptions: {
      fullPage: true,
      ...options.playwrightOptions,
    },
  });
}

/**
 * Capture screenshot for specific viewport and save to both device types
 *
 * Useful when you want to capture the same screenshot at a specific
 * viewport width and classify it as both mobile and desktop in reports.
 *
 * @param page - Playwright page object
 * @param screenshotName - Name of the screenshot
 * @param viewportWidth - Target viewport width in pixels
 * @param options - Screenshot options
 * @returns Array of screenshot path configurations (one for each device type)
 *
 * @example
 * ```typescript
 * const results = await captureResponsiveScreenshot(page, 'homepage', 768, {
 *   step: 1,
 *   testName: 'responsive-test'
 * });
 * // Results include both desktop and mobile versions
 * ```
 */
export async function captureResponsiveScreenshot(
  page: Page,
  screenshotName: string,
  viewportWidth: number,
  options: ScreenshotOptions = {}
): Promise<ScreenshotPath[]> {
  const results: ScreenshotPath[] = [];

  // Capture desktop version
  const desktopResult = await captureScreenshot(page, `${screenshotName}-desktop`, {
    ...options,
    deviceType: 'desktop',
  });
  results.push(desktopResult);

  // Capture mobile version
  const mobileResult = await captureScreenshot(page, `${screenshotName}-mobile`, {
    ...options,
    deviceType: 'mobile',
  });
  results.push(mobileResult);

  return results;
}

/**
 * Build screenshot filename from components
 *
 * Utility function for manual filename construction
 *
 * @param components - Filename components to join
 * @param options - Screenshot options
 * @returns Formatted filename string
 *
 * @example
 * ```typescript
 * const filename = buildScreenshotFilename(
 *   ['homepage'],
 *   { step: 1, includeTimestamp: true }
 * );
 * // Returns: '01-homepage-20231215-143052.png'
 * ```
 */
export function buildScreenshotFilename(
  components: string[],
  options: ScreenshotOptions = {}
): string {
  const extension = options.extension || 'png';
  const includeTimestamp = options.includeTimestamp !== false;

  const nameParts: string[] = [];

  // Add step number if provided
  if (options.step !== undefined) {
    nameParts.push(formatStepNumber(options.step));
  }

  // Add provided components
  nameParts.push(...components);

  // Build filename
  let filename = nameParts.join('-');

  // Add timestamp if requested
  if (includeTimestamp) {
    filename = `${filename}-${getTimestamp()}`;
  }

  return `${filename}.${extension}`;
}

export default {
  captureScreenshot,
  captureFullPageScreenshot,
  captureResponsiveScreenshot,
  createScreenshotPath,
  detectDeviceType,
  ensureScreenshotDirectory,
  getTimestamp,
  formatStepNumber,
  buildScreenshotFilename,
};
