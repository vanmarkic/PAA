import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * HomePage Object Model
 * Represents the home page with workflow search, filtering, and comparison functionality
 */
export class HomePage extends BasePage {
  // Hero section elements
  readonly heroTitle: Locator;
  readonly heroDescription: Locator;

  // Navigation buttons
  readonly wizardButton: Locator;
  readonly benefitsButton: Locator;
  readonly comparisonButton: Locator;
  readonly developerButton: Locator;

  // Search and filter elements
  readonly searchInput: Locator;
  readonly filterButton: Locator;
  readonly categoryFilter: Locator;
  readonly complexityFilter: Locator;
  readonly clearFiltersButton: Locator;

  // Workflow cards
  readonly workflowCards: Locator;
  readonly workflowCard: (index: number) => Locator;
  readonly workflowCardByName: (name: string) => Locator;

  // Comparison elements
  readonly comparisonButton2: Locator;
  readonly compareButton: Locator;
  readonly selectedWorkflowsCount: Locator;

  // Loading and error elements
  readonly loader: Locator;
  readonly errorMessage: Locator;
  readonly retryButton: Locator;

  // Statistics elements
  readonly statsSection: Locator;
  readonly stateCount: Locator;
  readonly eventCount: Locator;

  constructor(page: Page) {
    super(page);

    // Hero section
    this.heroTitle = page.locator('h1').first();
    this.heroDescription = page.locator('p[class*="text-gray-600"]').first();

    // Navigation buttons
    this.wizardButton = page.locator('button:has-text("Trouver une Prestation"), button:has-text("Find a Benefit"), button:has-text("Een Voordeel Vinden")');
    this.benefitsButton = page.locator('button:has-text("Guide des Prestations"), button:has-text("Benefits Guide"), button:has-text("Voordelen Gids")');
    this.comparisonButton = page.locator('button:has-text("Comparer"), button:has-text("Compare"), button:has-text("Vergelijken")');
    this.developerButton = page.locator('button:has-text("Documentation"), button:has-text("Developer Docs")');

    // Search and filter
    this.searchInput = page.locator('[data-testid="search-input"], input[placeholder*="Recherch"], input[placeholder*="Search"], input[placeholder*="Zoek"]').first();
    this.filterButton = page.locator('[data-testid="filter-button"], button[aria-label*="filter"], button:has-text("Filtres"), button:has-text("Filters")').first();
    this.categoryFilter = page.locator('[data-testid="category-filter"]');
    this.complexityFilter = page.locator('[data-testid="complexity-filter"]');
    this.clearFiltersButton = page.locator('[data-testid="clear-filters"], button:has-text("Effacer"), button:has-text("Clear")').first();

    // Workflow cards
    this.workflowCards = page.locator('[data-testid="workflow-card"], [class*="MachineCard"]');
    this.workflowCard = (index: number) => this.workflowCards.nth(index);
    this.workflowCardByName = (name: string) => page.locator(`[data-testid="workflow-card-${name}"], text=${name}`).locator('..').locator('[data-testid="workflow-card"], [class*="card"]').first();

    // Comparison
    this.comparisonButton2 = page.locator('button:has-text("Comparer"), [data-testid="compare-button"]');
    this.compareButton = page.locator('[data-testid="compare-selected-button"], button:has-text("Comparer"), button:has-text("Compare")');
    this.selectedWorkflowsCount = page.locator('[data-testid="selected-count"], [class*="selected"]');

    // Loading and error
    this.loader = page.locator('[data-testid="loader"], [role="progressbar"], .loader');
    this.errorMessage = page.locator('[data-testid="error-message"], [role="alert"]');
    this.retryButton = page.locator('button:has-text("Réessayer"), button:has-text("Retry")');

    // Statistics
    this.statsSection = page.locator('[data-testid="stats-section"]');
    this.stateCount = page.locator('[data-testid="state-count"]');
    this.eventCount = page.locator('[data-testid="event-count"]');
  }

  /**
   * Navigate to home page
   */
  async goto() {
    await this.page.goto('/');
    await this.waitForPageLoad();
  }

  /**
   * Search for a workflow
   */
  async searchForWorkflow(query: string) {
    await this.typeText(this.searchInput, query);
    // Wait for results to update
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Clear search input
   */
  async clearSearch() {
    await this.clearInput(this.searchInput);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get search input value
   */
  async getSearchValue(): Promise<string> {
    return this.page.locator(this.searchInput).inputValue();
  }

  /**
   * Click on filter button to show/hide filters
   */
  async toggleFilters() {
    await this.click(this.filterButton);
    await this.waitForPageLoad();
  }

  /**
   * Filter by category
   */
  async filterByCategory(categoryName: string) {
    const categoryCheckbox = this.page.locator(`label:has-text("${categoryName}"), [data-testid="filter-category-${categoryName}"]`).first();
    await this.click(categoryCheckbox);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Filter by complexity
   */
  async filterByComplexity(complexity: 'Simple' | 'Medium' | 'Complex') {
    const complexityCheckbox = this.page.locator(`label:has-text("${complexity}"), [data-testid="filter-complexity-${complexity}"]`).first();
    await this.click(complexityCheckbox);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Clear all filters
   */
  async clearAllFilters() {
    const clearButton = this.page.locator('button:has-text("Effacer les filtres"), button:has-text("Clear Filters"), [data-testid="clear-all-filters"]').first();
    if (await this.isVisible(clearButton)) {
      await this.click(clearButton);
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Get number of workflow cards displayed
   */
  async getWorkflowCount(): Promise<number> {
    return this.workflowCards.count();
  }

  /**
   * Get workflow card text at index
   */
  async getWorkflowCardText(index: number): Promise<string> {
    return this.getText(this.workflowCard(index));
  }

  /**
   * Click on a workflow card by index
   */
  async clickWorkflowCard(index: number) {
    const card = this.workflowCard(index);
    const link = card.locator('a, button').first();
    await this.click(link);
    await this.waitForNavigation();
  }

  /**
   * Click on a workflow card by name
   */
  async clickWorkflowByName(name: string) {
    const card = this.page.locator(`text=${name}`).locator('..').locator('a, button').first();
    await this.click(card);
    await this.waitForNavigation();
  }

  /**
   * Select workflow for comparison
   */
  async selectWorkflowForComparison(index: number) {
    const card = this.workflowCard(index);
    const checkbox = card.locator('[data-testid="comparison-checkbox"], input[type="checkbox"]').first();
    await this.click(checkbox);
  }

  /**
   * Select multiple workflows for comparison
   */
  async selectMultipleWorkflows(indices: number[]) {
    for (const index of indices) {
      await this.selectWorkflowForComparison(index);
    }
  }

  /**
   * Get number of selected workflows
   */
  async getSelectedWorkflowCount(): Promise<number> {
    const countText = await this.getText(this.selectedWorkflowsCount);
    const match = countText.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  /**
   * Click compare button
   */
  async clickCompare() {
    await this.click(this.compareButton);
    await this.waitForNavigation();
  }

  /**
   * Navigate to wizard page
   */
  async navigateToWizard() {
    await this.click(this.wizardButton);
    await this.waitForNavigation();
  }

  /**
   * Navigate to benefits page
   */
  async navigateToBenefits() {
    await this.click(this.benefitsButton);
    await this.waitForNavigation();
  }

  /**
   * Navigate to comparison page
   */
  async navigateToComparison() {
    await this.click(this.comparisonButton);
    await this.waitForNavigation();
  }

  /**
   * Navigate to developer docs
   */
  async navigateToDeveloper() {
    await this.click(this.developerButton);
    await this.waitForNavigation();
  }

  /**
   * Wait for workflows to load
   */
  async waitForWorkflowsLoaded(timeout = 10000) {
    await this.waitForLoadingComplete(timeout);
    await this.workflowCards.first().waitFor({ state: 'visible', timeout });
  }

  /**
   * Check if loading spinner is visible
   */
  async isLoading(): Promise<boolean> {
    return this.isVisible(this.loader);
  }

  /**
   * Get error message if present
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
    await this.waitForWorkflowsLoaded();
  }

  /**
   * Get stats data
   */
  async getStats(): Promise<{ states: number; events: number } | null> {
    if (await this.isVisible(this.statsSection)) {
      const statesText = await this.getText(this.stateCount);
      const eventsText = await this.getText(this.eventCount);

      const states = parseInt(statesText.match(/\d+/)?.[0] || '0');
      const events = parseInt(eventsText.match(/\d+/)?.[0] || '0');

      return { states, events };
    }
    return null;
  }

  /**
   * Check if specific workflow is visible
   */
  async isWorkflowVisible(name: string): Promise<boolean> {
    const workflow = this.page.locator(`text=${name}`);
    return this.isVisible(workflow);
  }

  /**
   * Get all visible workflow names
   */
  async getVisibleWorkflowNames(): Promise<string[]> {
    const cards = await this.workflowCards.all();
    const names: string[] = [];

    for (const card of cards) {
      const name = await card.locator('h3, h2, [class*="title"]').first().textContent();
      if (name) {
        names.push(name.trim());
      }
    }

    return names;
  }

  /**
   * Scroll through workflow cards
   */
  async scrollToWorkflowCard(index: number) {
    const card = this.workflowCard(index);
    await this.scrollToElement(card);
  }
}
