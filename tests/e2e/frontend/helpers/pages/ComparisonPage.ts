import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * ComparisonPage Object Model
 * Represents the workflow comparison page where users can compare multiple workflows
 */
export class ComparisonPage extends BasePage {
  // Page header
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;
  readonly backButton: Locator;

  // Workflow selection
  readonly selectedWorkflows: Locator;
  readonly workflowHeader: (index: number) => Locator;
  readonly removeWorkflowButton: (index: number) => Locator;

  // Comparison table
  readonly comparisonTable: Locator;
  readonly comparisonRows: Locator;
  readonly comparisonRow: (index: number) => Locator;
  readonly rowLabel: (index: number) => Locator;
  readonly rowCells: (rowIndex: number, cellIndex: number) => Locator;

  // Specific comparison rows
  readonly nameRow: Locator;
  readonly categoryRow: Locator;
  readonly complexityRow: Locator;
  readonly statesRow: Locator;
  readonly eventsRow: Locator;
  readonly descriptionRow: Locator;

  // Add workflow
  readonly addWorkflowButton: Locator;
  readonly searchWorkflowInput: Locator;
  readonly workflowSuggestions: Locator;
  readonly workflowSuggestion: (index: number) => Locator;

  // Export/Download
  readonly downloadButton: Locator;
  readonly exportButton: Locator;
  readonly printButton: Locator;

  // Sorting
  readonly sortButton: (columnIndex: number) => Locator;
  readonly sortAscendingButton: Locator;
  readonly sortDescendingButton: Locator;

  // Loading and error
  readonly loader: Locator;
  readonly errorMessage: Locator;
  readonly emptyStateMessage: Locator;

  // No comparison state
  readonly goHomeButton: Locator;
  readonly minimumWorkflowsWarning: Locator;

  constructor(page: Page) {
    super(page);

    // Page header
    this.pageTitle = page.locator('h1').first();
    this.pageDescription = page.locator('p[class*="text-gray-600"], p[class*="description"]').first();
    this.backButton = page.locator('button[aria-label*="back"], button:has-text("Retour"), button:has-text("Back"), [data-testid="back-button"]').first();

    // Workflow selection
    this.selectedWorkflows = page.locator('[data-testid="selected-workflows"], [class*="selectedWorkflows"]');
    this.workflowHeader = (index: number) => page.locator('[data-testid="workflow-column-header"]').nth(index);
    this.removeWorkflowButton = (index: number) => this.workflowHeader(index).locator('button[aria-label*="remove"], button[aria-label*="delete"], [data-testid="remove-workflow"]').first();

    // Comparison table
    this.comparisonTable = page.locator('[data-testid="comparison-table"], table, [class*="comparison"], [class*="comparisonTable"]').first();
    this.comparisonRows = page.locator('[data-testid="comparison-row"], tr, [class*="row"]');
    this.comparisonRow = (index: number) => this.comparisonRows.nth(index);
    this.rowLabel = (index: number) => this.comparisonRow(index).locator('th, td:first-child, [class*="label"]').first();
    this.rowCells = (rowIndex: number, cellIndex: number) => this.comparisonRow(rowIndex).locator('td').nth(cellIndex);

    // Specific rows
    this.nameRow = page.locator('tr:has-text("Nom"), tr:has-text("Name"), [data-testid="row-name"]').first();
    this.categoryRow = page.locator('tr:has-text("Catégorie"), tr:has-text("Category"), [data-testid="row-category"]').first();
    this.complexityRow = page.locator('tr:has-text("Complexité"), tr:has-text("Complexity"), [data-testid="row-complexity"]').first();
    this.statesRow = page.locator('tr:has-text("États"), tr:has-text("States"), [data-testid="row-states"]').first();
    this.eventsRow = page.locator('tr:has-text("Événements"), tr:has-text("Events"), [data-testid="row-events"]').first();
    this.descriptionRow = page.locator('tr:has-text("Description"), [data-testid="row-description"]').first();

    // Add workflow
    this.addWorkflowButton = page.locator('[data-testid="add-workflow-button"], button:has-text("Ajouter"), button:has-text("Add Workflow")').first();
    this.searchWorkflowInput = page.locator('[data-testid="search-workflow-input"], input[placeholder*="Recherch"], input[placeholder*="Search"]').first();
    this.workflowSuggestions = page.locator('[data-testid="workflow-suggestions"], [class*="suggestions"], ul').first();
    this.workflowSuggestion = (index: number) => this.workflowSuggestions.locator('li, [role="option"], a, button').nth(index);

    // Export/Download
    this.downloadButton = page.locator('[data-testid="download-button"], button:has-text("Télécharger"), button:has-text("Download")').first();
    this.exportButton = page.locator('[data-testid="export-button"], button:has-text("Exporter"), button:has-text("Export")').first();
    this.printButton = page.locator('[data-testid="print-button"], button:has-text("Imprimer"), button:has-text("Print"), button[aria-label*="print"]').first();

    // Sorting
    this.sortButton = (columnIndex: number) => page.locator('[data-testid="sort-button"]').nth(columnIndex);
    this.sortAscendingButton = page.locator('button:has-text("Croissant"), button:has-text("Ascending")').first();
    this.sortDescendingButton = page.locator('button:has-text("Décroissant"), button:has-text("Descending")').first();

    // Loading/Error
    this.loader = page.locator('[data-testid="loader"], [role="progressbar"], .loader');
    this.errorMessage = page.locator('[data-testid="error-message"], [role="alert"]');
    this.emptyStateMessage = page.locator('[data-testid="empty-state"], [class*="emptyState"]');

    // No comparison state
    this.goHomeButton = page.locator('button:has-text("Retour à l\'accueil"), button:has-text("Go Home")').first();
    this.minimumWorkflowsWarning = page.locator('text=/au moins 2 workflows/, text=/at least 2 workflows/').first();
  }

  /**
   * Navigate to comparison page
   */
  async goto(machineIds?: string[]) {
    if (machineIds && machineIds.length >= 2) {
      const params = new URLSearchParams();
      machineIds.forEach(id => params.append('machine', id));
      await this.page.goto(`/comparison?${params.toString()}`);
    } else {
      await this.page.goto('/comparison');
    }
    await this.waitForPageLoad();
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return this.getText(this.pageTitle);
  }

  /**
   * Get number of compared workflows
   */
  async getComparedWorkflowCount(): Promise<number> {
    return this.workflowHeader(0).locator('..').locator('[data-testid="workflow-column-header"], th, td').count() - 1; // Minus the label column
  }

  /**
   * Get workflow name in column
   */
  async getWorkflowNameInColumn(columnIndex: number): Promise<string> {
    const header = this.workflowHeader(columnIndex);
    return this.getText(header);
  }

  /**
   * Remove workflow from comparison
   */
  async removeWorkflow(columnIndex: number) {
    const removeBtn = this.removeWorkflowButton(columnIndex);
    await this.click(removeBtn);
    await this.waitForPageLoad();
  }

  /**
   * Get comparison value at row and column
   */
  async getComparisonValue(rowName: string, columnIndex: number): Promise<string> {
    // Find the row with the label
    const rows = await this.comparisonRows.all();
    let rowIndex = -1;

    for (let i = 0; i < rows.length; i++) {
      const label = await rows[i].locator('th, td:first-child, [class*="label"]').first().textContent();
      if (label?.includes(rowName)) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) {
      return '';
    }

    return this.getText(this.rowCells(rowIndex, columnIndex + 1)); // +1 to skip label column
  }

  /**
   * Get all values in a row
   */
  async getRowValues(rowName: string): Promise<string[]> {
    const rows = await this.comparisonRows.all();
    let rowIndex = -1;

    for (let i = 0; i < rows.length; i++) {
      const label = await rows[i].locator('th, td:first-child').first().textContent();
      if (label?.includes(rowName)) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) {
      return [];
    }

    const cells = await this.comparisonRow(rowIndex).locator('td, th').all();
    const values: string[] = [];

    for (let i = 1; i < cells.length; i++) {
      // Skip label column
      const text = await cells[i].textContent();
      if (text) {
        values.push(text.trim());
      }
    }

    return values;
  }

  /**
   * Get all row labels
   */
  async getAllRowLabels(): Promise<string[]> {
    const rows = await this.comparisonRows.all();
    const labels: string[] = [];

    for (const row of rows) {
      const label = await row.locator('th, td:first-child').first().textContent();
      if (label) {
        labels.push(label.trim());
      }
    }

    return labels;
  }

  /**
   * Get complexity comparison
   */
  async getComplexityComparison(): Promise<string[]> {
    return this.getRowValues('Complexité') || this.getRowValues('Complexity');
  }

  /**
   * Get states count comparison
   */
  async getStatesComparison(): Promise<string[]> {
    return this.getRowValues('États') || this.getRowValues('States');
  }

  /**
   * Get events count comparison
   */
  async getEventsComparison(): Promise<string[]> {
    return this.getRowValues('Événements') || this.getRowValues('Events');
  }

  /**
   * Click add workflow button
   */
  async clickAddWorkflow() {
    await this.click(this.addWorkflowButton);
    await this.waitForPageLoad();
  }

  /**
   * Search for workflow to add
   */
  async searchForWorkflow(query: string) {
    await this.typeText(this.searchWorkflowInput, query);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Select workflow from suggestions
   */
  async selectWorkflowSuggestion(index: number) {
    const suggestion = this.workflowSuggestion(index);
    await this.click(suggestion);
    await this.waitForPageLoad();
  }

  /**
   * Click download button
   */
  async clickDownload() {
    await this.click(this.downloadButton);
  }

  /**
   * Click export button
   */
  async clickExport() {
    await this.click(this.exportButton);
  }

  /**
   * Click print button
   */
  async clickPrint() {
    await this.click(this.printButton);
  }

  /**
   * Sort by column
   */
  async sortByColumn(columnIndex: number, ascending = true) {
    const sortBtn = this.sortButton(columnIndex);
    await this.click(sortBtn);
    if (ascending) {
      await this.click(this.sortAscendingButton);
    } else {
      await this.click(this.sortDescendingButton);
    }
  }

  /**
   * Check if comparison table is visible
   */
  async isTableVisible(): Promise<boolean> {
    return this.isVisible(this.comparisonTable);
  }

  /**
   * Check if error message is shown
   */
  async hasError(): Promise<boolean> {
    return this.isVisible(this.errorMessage);
  }

  /**
   * Get error message
   */
  async getError(): Promise<string | null> {
    if (await this.hasError()) {
      return this.getText(this.errorMessage);
    }
    return null;
  }

  /**
   * Check if empty state is shown
   */
  async isEmpty(): Promise<boolean> {
    return this.isVisible(this.emptyStateMessage);
  }

  /**
   * Check if minimum workflows warning is shown
   */
  async hasMinimumWorkflowsWarning(): Promise<boolean> {
    return this.isVisible(this.minimumWorkflowsWarning);
  }

  /**
   * Get empty state message
   */
  async getEmptyStateMessage(): Promise<string | null> {
    if (await this.isEmpty()) {
      return this.getText(this.emptyStateMessage);
    }
    return null;
  }

  /**
   * Click go home button
   */
  async clickGoHome() {
    await this.click(this.goHomeButton);
    await this.waitForNavigation();
  }

  /**
   * Click back button
   */
  async clickBack() {
    await this.click(this.backButton);
    await this.waitForNavigation();
  }

  /**
   * Check if loading
   */
  async isLoading(): Promise<boolean> {
    return this.isVisible(this.loader);
  }

  /**
   * Wait for table to load
   */
  async waitForTableLoaded(timeout = 10000) {
    await this.waitForLoadingComplete(timeout);
    await this.comparisonTable.waitFor({ state: 'visible', timeout }).catch(() => {
      // Table might not exist if fewer than 2 workflows
    });
  }

  /**
   * Scroll to comparison table
   */
  async scrollToTable() {
    await this.scrollToElement(this.comparisonTable);
  }

  /**
   * Get full comparison data as object
   */
  async getFullComparisonData(): Promise<{ [key: string]: string[] }> {
    const labels = await this.getAllRowLabels();
    const data: { [key: string]: string[] } = {};

    for (const label of labels) {
      data[label] = await this.getRowValues(label);
    }

    return data;
  }

  /**
   * Compare two workflows by name
   */
  async compareWorkflows(names: string[]) {
    if (names.length < 2) {
      throw new Error('At least 2 workflows are required for comparison');
    }

    const params = new URLSearchParams();
    // Note: This assumes workflow names are their IDs or we need to search them first
    names.forEach(name => params.append('machine', name));
    await this.page.goto(`/comparison?${params.toString()}`);
    await this.waitForPageLoad();
  }

  /**
   * Check if table is horizontally scrollable
   */
  async isTableScrollable(): Promise<boolean> {
    const scrollWidth = await this.page.evaluate(() => {
      const table = document.querySelector('[data-testid="comparison-table"], table, [class*="comparison"]');
      return table ? table.scrollWidth > table.clientWidth : false;
    });
    return scrollWidth;
  }

  /**
   * Scroll table horizontally
   */
  async scrollTableHorizontally(amount: number) {
    await this.page.evaluate((scrollAmount) => {
      const table = document.querySelector('[data-testid="comparison-table"], table, [class*="comparison"]');
      if (table) {
        table.scrollLeft += scrollAmount;
      }
    }, amount);
  }

  /**
   * Get number of comparison rows
   */
  async getComparisonRowCount(): Promise<number> {
    return this.comparisonRows.count();
  }

  /**
   * Get comparison summary
   */
  async getComparisonSummary(): Promise<string> {
    return this.getText(this.pageDescription);
  }
}
