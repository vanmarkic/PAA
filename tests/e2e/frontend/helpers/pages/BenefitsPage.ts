import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * BenefitsPage Object Model
 * Represents the benefits guide page with categorized benefits and search functionality
 */
export class BenefitsPage extends BasePage {
  // Page title and description
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;

  // Navigation
  readonly backButton: Locator;
  readonly homeButton: Locator;

  // Search and filter
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  // Benefit categories
  readonly categoryTabs: Locator;
  readonly categoryTab: (name: string) => Locator;
  readonly employmentCategoryTab: Locator;
  readonly familyCategoryTab: Locator;
  readonly healthCategoryTab: Locator;
  readonly housingCategoryTab: Locator;

  // Benefit cards
  readonly benefitCards: Locator;
  readonly benefitCard: (index: number) => Locator;
  readonly benefitCardByName: (name: string) => Locator;

  // Benefit details
  readonly benefitName: (index: number) => Locator;
  readonly benefitDescription: (index: number) => Locator;
  readonly benefitAmount: (index: number) => Locator;
  readonly benefitEligibility: (index: number) => Locator;
  readonly benefitKeyFacts: (index: number) => Locator;

  // Action buttons
  readonly learnMoreButton: (index: number) => Locator;
  readonly applyButton: (index: number) => Locator;
  readonly moreInfoButton: (index: number) => Locator;

  // Expandable sections
  readonly expandButton: (index: number) => Locator;
  readonly eligibilityList: (index: number) => Locator;
  readonly keyFactsList: (index: number) => Locator;

  // Comparison elements
  readonly compareButton: Locator;
  readonly selectedCount: Locator;

  // Loading and error
  readonly loader: Locator;
  readonly errorMessage: Locator;
  readonly retryButton: Locator;

  constructor(page: Page) {
    super(page);

    // Page header
    this.pageTitle = page.locator('h1').first();
    this.pageDescription = page.locator('p[class*="text-gray-600"], p[class*="description"]').first();

    // Navigation
    this.backButton = page.locator('button[aria-label*="back"], button:has-text("Retour"), button:has-text("Back"), [data-testid="back-button"]').first();
    this.homeButton = page.locator('a[href="/"], button:has-text("Accueil"), button:has-text("Home")').first();

    // Search
    this.searchInput = page.locator('[data-testid="search-input"], input[placeholder*="Recherch"], input[placeholder*="Search"], input[placeholder*="Zoek"]').first();
    this.searchButton = page.locator('[data-testid="search-button"], button[aria-label*="search"]').first();

    // Category tabs
    this.categoryTabs = page.locator('[data-testid="category-tab"], button[role="tab"], [class*="categoryTab"]');
    this.categoryTab = (name: string) => page.locator(`[data-testid="category-tab-${name}"], button:has-text("${name}"), [role="tab"]:has-text("${name}")`).first();
    this.employmentCategoryTab = this.categoryTab('Emploi');
    this.familyCategoryTab = this.categoryTab('Famille');
    this.healthCategoryTab = this.categoryTab('Santé');
    this.housingCategoryTab = this.categoryTab('Logement');

    // Benefit cards
    this.benefitCards = page.locator('[data-testid="benefit-card"], [class*="BenefitCard"], [class*="benefitCard"]');
    this.benefitCard = (index: number) => this.benefitCards.nth(index);
    this.benefitCardByName = (name: string) => page.locator(`text=${name}`).locator('..').locator('[data-testid="benefit-card"], [class*="BenefitCard"]').first();

    // Benefit details
    this.benefitName = (index: number) => this.benefitCard(index).locator('h3, h2, [class*="name"], [class*="title"]').first();
    this.benefitDescription = (index: number) => this.benefitCard(index).locator('p, [class*="description"]').first();
    this.benefitAmount = (index: number) => this.benefitCard(index).locator('[data-testid="benefit-amount"], [class*="amount"], text=/€|€/').first();
    this.benefitEligibility = (index: number) => this.benefitCard(index).locator('[data-testid="benefit-eligibility"], [class*="eligibility"]').first();
    this.benefitKeyFacts = (index: number) => this.benefitCard(index).locator('[data-testid="benefit-key-facts"], [class*="keyFacts"]').first();

    // Action buttons
    this.learnMoreButton = (index: number) => this.benefitCard(index).locator('button:has-text("En savoir plus"), button:has-text("Learn More"), button:has-text("Meer informatie")').first();
    this.applyButton = (index: number) => this.benefitCard(index).locator('button:has-text("Demander"), button:has-text("Apply"), button:has-text("Aanvragen")').first();
    this.moreInfoButton = (index: number) => this.benefitCard(index).locator('a, button').first();

    // Expandable sections
    this.expandButton = (index: number) => this.benefitCard(index).locator('button[aria-expanded], [data-testid="expand-button"]').first();
    this.eligibilityList = (index: number) => this.benefitCard(index).locator('[data-testid="eligibility-items"], ul[class*="eligibility"], li').first();
    this.keyFactsList = (index: number) => this.benefitCard(index).locator('[data-testid="key-facts-items"], [class*="keyFacts"] li, [class*="keyFacts"] div').first();

    // Comparison
    this.compareButton = page.locator('[data-testid="compare-button"], button:has-text("Comparer"), button:has-text("Compare")').first();
    this.selectedCount = page.locator('[data-testid="selected-count"]');

    // Loading/Error
    this.loader = page.locator('[data-testid="loader"], [role="progressbar"], .loader');
    this.errorMessage = page.locator('[data-testid="error-message"], [role="alert"]');
    this.retryButton = page.locator('button:has-text("Réessayer"), button:has-text("Retry")').first();
  }

  /**
   * Navigate to benefits page
   */
  async goto() {
    await this.page.goto('/benefits');
    await this.waitForPageLoad();
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return this.getText(this.pageTitle);
  }

  /**
   * Get page description
   */
  async getPageDescription(): Promise<string> {
    return this.getText(this.pageDescription);
  }

  /**
   * Search for benefit
   */
  async searchBenefit(query: string) {
    await this.typeText(this.searchInput, query);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Clear search
   */
  async clearSearch() {
    await this.clearInput(this.searchInput);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get search value
   */
  async getSearchValue(): Promise<string> {
    return this.searchInput.inputValue();
  }

  /**
   * Click on category tab
   */
  async selectCategory(categoryName: string) {
    const tab = this.categoryTab(categoryName);
    await this.click(tab);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get number of benefit cards
   */
  async getBenefitCount(): Promise<number> {
    return this.benefitCards.count();
  }

  /**
   * Get benefit name by index
   */
  async getBenefitName(index: number): Promise<string> {
    return this.getText(this.benefitName(index));
  }

  /**
   * Get benefit description by index
   */
  async getBenefitDescription(index: number): Promise<string> {
    return this.getText(this.benefitDescription(index));
  }

  /**
   * Get benefit amount by index
   */
  async getBenefitAmount(index: number): Promise<string> {
    return this.getText(this.benefitAmount(index));
  }

  /**
   * Click on benefit card
   */
  async clickBenefit(index: number) {
    const card = this.benefitCard(index);
    const link = card.locator('a').first();
    if (await this.elementExists(link)) {
      await this.click(link);
      await this.waitForNavigation();
    }
  }

  /**
   * Click on benefit by name
   */
  async clickBenefitByName(name: string) {
    const card = this.benefitCardByName(name);
    const link = card.locator('a').first();
    if (await this.elementExists(link)) {
      await this.click(link);
      await this.waitForNavigation();
    }
  }

  /**
   * Click expand button for benefit
   */
  async expandBenefit(index: number) {
    const expandBtn = this.expandButton(index);
    if (await this.elementExists(expandBtn)) {
      await this.click(expandBtn);
      await this.page.waitForTimeout(300); // Wait for animation
    }
  }

  /**
   * Click learn more button
   */
  async clickLearnMore(index: number) {
    const btn = this.learnMoreButton(index);
    if (await this.elementExists(btn)) {
      await this.click(btn);
    }
  }

  /**
   * Click apply button
   */
  async clickApply(index: number) {
    const btn = this.applyButton(index);
    if (await this.elementExists(btn)) {
      await this.click(btn);
    }
  }

  /**
   * Get eligibility items for benefit
   */
  async getBenefitEligibility(index: number): Promise<string[]> {
    const eligibilitySection = this.benefitEligibility(index);
    const items = await eligibilitySection.locator('li, [class*="item"], span').all();
    const eligibility: string[] = [];

    for (const item of items) {
      const text = await item.textContent();
      if (text) {
        eligibility.push(text.trim());
      }
    }

    return eligibility;
  }

  /**
   * Get key facts for benefit
   */
  async getBenefitKeyFacts(index: number): Promise<{ [key: string]: string }> {
    const keyFactsSection = this.benefitKeyFacts(index);
    const facts: { [key: string]: string } = {};

    const items = await keyFactsSection.locator('[data-testid="key-fact"], li, div[class*="fact"]').all();

    for (const item of items) {
      const text = await item.textContent();
      if (text) {
        // Try to parse key: value format
        const match = text.match(/^([^:]+):\s*(.+)$/);
        if (match) {
          facts[match[1].trim()] = match[2].trim();
        }
      }
    }

    return facts;
  }

  /**
   * Click category tab
   */
  async clickCategoryTab(categoryName: string) {
    const tab = this.categoryTab(categoryName);
    await this.click(tab);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get all visible category tab names
   */
  async getCategoryTabs(): Promise<string[]> {
    const tabs = await this.categoryTabs.all();
    const tabNames: string[] = [];

    for (const tab of tabs) {
      const text = await tab.textContent();
      if (text) {
        tabNames.push(text.trim());
      }
    }

    return tabNames;
  }

  /**
   * Get all visible benefit names
   */
  async getVisibleBenefitNames(): Promise<string[]> {
    const cards = await this.benefitCards.all();
    const names: string[] = [];

    for (const card of cards) {
      const name = await card.locator('h3, h2').first().textContent();
      if (name) {
        names.push(name.trim());
      }
    }

    return names;
  }

  /**
   * Scroll to benefit card
   */
  async scrollToBenefit(index: number) {
    const card = this.benefitCard(index);
    await this.scrollToElement(card);
  }

  /**
   * Check if loading
   */
  async isLoading(): Promise<boolean> {
    return this.isVisible(this.loader);
  }

  /**
   * Get error message
   */
  async getError(): Promise<string | null> {
    if (await this.isVisible(this.errorMessage)) {
      return this.getText(this.errorMessage);
    }
    return null;
  }

  /**
   * Click retry button
   */
  async clickRetry() {
    await this.click(this.retryButton);
    await this.waitForPageLoad();
  }

  /**
   * Wait for benefits to load
   */
  async waitForBenefitsLoaded(timeout = 10000) {
    await this.waitForLoadingComplete(timeout);
    await this.pageTitle.waitFor({ state: 'visible', timeout });
  }

  /**
   * Click back button
   */
  async clickBack() {
    await this.click(this.backButton);
    await this.waitForNavigation();
  }

  /**
   * Click home button
   */
  async clickHome() {
    await this.click(this.homeButton);
    await this.waitForNavigation();
  }

  /**
   * Check if benefit card is visible
   */
  async isBenefitVisible(name: string): Promise<boolean> {
    const benefit = this.page.locator(`text=${name}`);
    return this.isVisible(benefit);
  }

  /**
   * Get full benefit card text
   */
  async getBenefitCardText(index: number): Promise<string> {
    return this.getText(this.benefitCard(index));
  }

  /**
   * Scroll through benefits
   */
  async scrollThroughBenefits() {
    await this.scrollToBottom();
    await this.page.waitForTimeout(500);
  }

  /**
   * Filter benefits by clicking category
   */
  async filterByCategory(categoryName: string) {
    await this.selectCategory(categoryName);
  }

  /**
   * Get employment category benefits
   */
  async getEmploymentBenefits(): Promise<string[]> {
    await this.selectCategory('Emploi');
    return this.getVisibleBenefitNames();
  }

  /**
   * Get family category benefits
   */
  async getFamilyBenefits(): Promise<string[]> {
    await this.selectCategory('Famille');
    return this.getVisibleBenefitNames();
  }

  /**
   * Check if benefit is expandable
   */
  async isBenefitExpandable(index: number): Promise<boolean> {
    const expandBtn = this.expandButton(index);
    return this.elementExists(expandBtn);
  }

  /**
   * Get all benefit details
   */
  async getAllBenefitDetails(): Promise<Array<{ name: string; description: string; amount: string }>> {
    const count = await this.getBenefitCount();
    const details = [];

    for (let i = 0; i < count; i++) {
      details.push({
        name: await this.getBenefitName(i),
        description: await this.getBenefitDescription(i),
        amount: await this.getBenefitAmount(i),
      });
    }

    return details;
  }
}
