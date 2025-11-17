import { Page, Locator } from '@playwright/test';

/**
 * Base Page Object Model
 * Provides common functionality for all page objects including navigation,
 * language selection, and shared element interactions.
 */
export class BasePage {
  readonly page: Page;

  // Common navigation elements
  readonly homeLink: Locator;
  readonly logoLink: Locator;
  readonly languageSelector: Locator;

  constructor(page: Page) {
    this.page = page;

    // Navigation selectors
    this.homeLink = page.locator('a[href="/"]');
    this.logoLink = page.locator('[data-testid="logo"]');
    this.languageSelector = page.locator('[data-testid="language-selector"]');
  }

  /**
   * Navigate to the home page
   */
  async goto() {
    // Subclasses should override this
    await this.page.goto('/');
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get the current page title
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Navigate to home page
   */
  async navigateToHome() {
    await this.homeLink.click();
    await this.waitForPageLoad();
  }

  /**
   * Change the application language
   * @param language - Language code: 'fr', 'nl', or 'en'
   */
  async changeLanguage(language: 'fr' | 'nl' | 'en') {
    // Click language selector to open dropdown
    const selector = this.page.locator('[data-testid="language-selector"]');

    // Check if selector exists, fall back to button with language dropdown
    if (await selector.isVisible().catch(() => false)) {
      await selector.click();
    } else {
      // Fallback: look for language button in navigation
      await this.page.locator('button[aria-label*="language"], button[aria-label*="Language"]').first().click();
    }

    // Select the language option
    const languageOption = this.page.locator(`[data-testid="language-option-${language}"], button:has-text("${language.toUpperCase()}")`);
    await languageOption.click();
    await this.waitForPageLoad();
  }

  /**
   * Check if an element is visible
   */
  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible().catch(() => false);
  }

  /**
   * Scroll to element
   */
  async scrollToElement(locator: Locator) {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Scroll to top of page
   */
  async scrollToTop() {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  /**
   * Scroll to bottom of page
   */
  async scrollToBottom() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(locator: Locator, timeout = 5000) {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Get text content of an element
   */
  async getText(locator: Locator): Promise<string> {
    return locator.textContent().then(text => text?.trim() || '');
  }

  /**
   * Check if element exists in DOM
   */
  async elementExists(locator: Locator): Promise<boolean> {
    return locator.count().then(count => count > 0);
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(action?: () => Promise<void>) {
    const navigationPromise = this.page.waitForNavigation();
    if (action) {
      await action();
    }
    await navigationPromise;
    await this.waitForPageLoad();
  }

  /**
   * Get current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Wait for specific URL
   */
  async waitForUrl(urlPattern: string | RegExp, timeout = 5000) {
    await this.page.waitForURL(urlPattern, { timeout });
  }

  /**
   * Reload the page
   */
  async reload() {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  /**
   * Go back in browser history
   */
  async goBack() {
    await this.page.goBack();
    await this.waitForPageLoad();
  }

  /**
   * Press keyboard key
   */
  async pressKey(key: string) {
    await this.page.keyboard.press(key);
  }

  /**
   * Type text
   */
  async typeText(locator: Locator, text: string) {
    await locator.click();
    await locator.fill(text);
  }

  /**
   * Clear input field
   */
  async clearInput(locator: Locator) {
    await locator.fill('');
  }

  /**
   * Click element
   */
  async click(locator: Locator) {
    await locator.click();
  }

  /**
   * Double click element
   */
  async doubleClick(locator: Locator) {
    await locator.dblclick();
  }

  /**
   * Check if element is disabled
   */
  async isDisabled(locator: Locator): Promise<boolean> {
    return locator.isDisabled();
  }

  /**
   * Check if element is enabled
   */
  async isEnabled(locator: Locator): Promise<boolean> {
    return locator.isEnabled();
  }

  /**
   * Get attribute value
   */
  async getAttribute(locator: Locator, attributeName: string): Promise<string | null> {
    return locator.getAttribute(attributeName);
  }

  /**
   * Wait for loading spinner to disappear
   */
  async waitForLoadingComplete(timeout = 10000) {
    const spinner = this.page.locator('[data-testid="loader"], .loader, [role="progressbar"]').first();
    await spinner.waitFor({ state: 'hidden', timeout }).catch(() => {
      // Spinner might not exist, which is fine
    });
  }

  /**
   * Check for error message
   */
  async getErrorMessage(): Promise<string | null> {
    const errorElement = this.page.locator('[data-testid="error-message"], [role="alert"]').first();
    if (await this.isVisible(errorElement)) {
      return this.getText(errorElement);
    }
    return null;
  }

  /**
   * Hover over element
   */
  async hover(locator: Locator) {
    await locator.hover();
  }

  /**
   * Get count of elements matching locator
   */
  async getElementCount(locator: Locator): Promise<number> {
    return locator.count();
  }

  /**
   * Screenshot for visual regression testing
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }
}
