import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * WorkflowDetailPage Object Model
 * Represents the detailed view of a workflow with states, transitions, and legal references
 */
export class WorkflowDetailPage extends BasePage {
  // Header elements
  readonly breadcrumb: Locator;
  readonly workflowTitle: Locator;
  readonly workflowCategory: Locator;
  readonly complexityBadge: Locator;
  readonly backButton: Locator;

  // Tab navigation
  readonly overviewTab: Locator;
  readonly simulationTab: Locator;
  readonly technicalTab: Locator;
  readonly legalTab: Locator;
  readonly examplesTab: Locator;

  // Overview section
  readonly plainLanguageDescription: Locator;
  readonly workflowSummary: Locator;
  readonly keywordsSection: Locator;

  // Workflow visualization
  readonly statesDiagram: Locator;
  readonly statesCount: Locator;
  readonly eventsCount: Locator;
  readonly statesList: Locator;
  readonly stateItem: (index: number) => Locator;

  // Simulation section
  readonly simulationForm: Locator;
  readonly simulationInput: (field: string) => Locator;
  readonly runSimulationButton: Locator;
  readonly simulationResults: Locator;
  readonly simulationState: Locator;

  // Technical section
  readonly technicalDetails: Locator;
  readonly codeBlock: Locator;
  readonly copyCodeButton: Locator;
  readonly versionInfo: Locator;

  // Legal section
  readonly legalReferences: Locator;
  readonly legalReferenceItem: (index: number) => Locator;
  readonly legalReferenceLink: (index: number) => Locator;
  readonly legalArticles: Locator;

  // Examples section
  readonly examplesSection: Locator;
  readonly exampleItem: (index: number) => Locator;
  readonly exampleCode: (index: number) => Locator;

  // Action buttons
  readonly downloadButton: Locator;
  readonly shareButton: Locator;
  readonly compareButton: Locator;
  readonly viewGherkinButton: Locator;

  // Loading and error
  readonly loader: Locator;
  readonly errorMessage: Locator;
  readonly retryButton: Locator;

  constructor(page: Page) {
    super(page);

    // Header
    this.breadcrumb = page.locator('[data-testid="breadcrumb"], nav[role="navigation"]');
    this.workflowTitle = page.locator('h1').first();
    this.workflowCategory = page.locator('[data-testid="workflow-category"], span[class*="category"]');
    this.complexityBadge = page.locator('[data-testid="complexity-badge"], [class*="complexity"]');
    this.backButton = page.locator('button[aria-label*="back"], button:has-text("Retour"), button:has-text("Back"), [data-testid="back-button"]').first();

    // Tabs
    this.overviewTab = page.locator('button:has-text("Vue d\'ensemble"), button:has-text("Overview"), button:has-text("Overzicht")').first();
    this.simulationTab = page.locator('button:has-text("Simulation"), button:has-text("Simulatie"), [data-testid="tab-simulation"]').first();
    this.technicalTab = page.locator('button:has-text("Technique"), button:has-text("Technical"), button:has-text("Technisch"), [data-testid="tab-technical"]').first();
    this.legalTab = page.locator('button:has-text("Légal"), button:has-text("Legal"), button:has-text("Juridisch"), [data-testid="tab-legal"]').first();
    this.examplesTab = page.locator('button:has-text("Exemples"), button:has-text("Examples"), button:has-text("Voorbeelden"), [data-testid="tab-examples"]').first();

    // Overview section
    this.plainLanguageDescription = page.locator('[data-testid="plain-language-description"], [class*="plainLanguage"]').first();
    this.workflowSummary = page.locator('[data-testid="workflow-summary"]');
    this.keywordsSection = page.locator('[data-testid="keywords-section"]');

    // Workflow visualization
    this.statesDiagram = page.locator('[data-testid="states-diagram"], svg[class*="diagram"]');
    this.statesCount = page.locator('[data-testid="states-count"], text=/\d+ états/, text=/\d+ states/');
    this.eventsCount = page.locator('[data-testid="events-count"], text=/\d+ événements/, text=/\d+ events/');
    this.statesList = page.locator('[data-testid="states-list"], [class*="statesList"]');
    this.stateItem = (index: number) => this.statesList.locator('[data-testid="state-item"]').nth(index);

    // Simulation
    this.simulationForm = page.locator('[data-testid="simulation-form"], form[class*="simulation"]');
    this.simulationInput = (field: string) => page.locator(`[data-testid="simulation-input-${field}"], input[name="${field}"], label:has-text("${field}") ~ input`).first();
    this.runSimulationButton = page.locator('[data-testid="run-simulation"], button:has-text("Lancer"), button:has-text("Run")').first();
    this.simulationResults = page.locator('[data-testid="simulation-results"], [class*="results"]');
    this.simulationState = page.locator('[data-testid="simulation-state"], [class*="resultState"]');

    // Technical
    this.technicalDetails = page.locator('[data-testid="technical-details"]');
    this.codeBlock = page.locator('[data-testid="code-block"], pre, code[class*="block"]').first();
    this.copyCodeButton = page.locator('[data-testid="copy-code"], button:has-text("Copier"), button:has-text("Copy")').first();
    this.versionInfo = page.locator('[data-testid="version-info"], [class*="version"]');

    // Legal
    this.legalReferences = page.locator('[data-testid="legal-references"], [class*="legalReferences"]');
    this.legalReferenceItem = (index: number) => this.legalReferences.locator('[data-testid="legal-reference-item"]').nth(index);
    this.legalReferenceLink = (index: number) => this.legalReferenceItem(index).locator('a').first();
    this.legalArticles = page.locator('[data-testid="legal-articles"]');

    // Examples
    this.examplesSection = page.locator('[data-testid="examples-section"], [class*="examples"]');
    this.exampleItem = (index: number) => this.examplesSection.locator('[data-testid="example-item"]').nth(index);
    this.exampleCode = (index: number) => this.exampleItem(index).locator('code, pre').first();

    // Action buttons
    this.downloadButton = page.locator('[data-testid="download-button"], button[aria-label*="download"], button:has-text("Télécharger"), button:has-text("Download")').first();
    this.shareButton = page.locator('[data-testid="share-button"], button[aria-label*="share"], button:has-text("Partager"), button:has-text("Share")').first();
    this.compareButton = page.locator('[data-testid="compare-button"], button:has-text("Comparer"), button:has-text("Compare")').first();
    this.viewGherkinButton = page.locator('[data-testid="view-gherkin"], button:has-text("Gherkin"), button:has-text("Feature")').first();

    // Loading/Error
    this.loader = page.locator('[data-testid="loader"], [role="progressbar"], .loader');
    this.errorMessage = page.locator('[data-testid="error-message"], [role="alert"]');
    this.retryButton = page.locator('button:has-text("Réessayer"), button:has-text("Retry"), [data-testid="retry-button"]').first();
  }

  /**
   * Navigate to workflow detail page
   */
  async goto(workflowId: string) {
    await this.page.goto(`/workflows/${workflowId}`);
    await this.waitForPageLoad();
  }

  /**
   * Get workflow title
   */
  async getWorkflowTitle(): Promise<string> {
    return this.getText(this.workflowTitle);
  }

  /**
   * Get workflow category
   */
  async getCategory(): Promise<string> {
    return this.getText(this.workflowCategory);
  }

  /**
   * Get complexity level
   */
  async getComplexity(): Promise<string> {
    return this.getText(this.complexityBadge);
  }

  /**
   * Click back button
   */
  async clickBack() {
    await this.click(this.backButton);
    await this.waitForNavigation();
  }

  /**
   * Click on a specific tab
   */
  async clickTab(tabName: 'overview' | 'simulation' | 'technical' | 'legal' | 'examples') {
    let tab: Locator;
    switch (tabName) {
      case 'overview':
        tab = this.overviewTab;
        break;
      case 'simulation':
        tab = this.simulationTab;
        break;
      case 'technical':
        tab = this.technicalTab;
        break;
      case 'legal':
        tab = this.legalTab;
        break;
      case 'examples':
        tab = this.examplesTab;
        break;
    }

    await this.click(tab);
    await this.waitForPageLoad();
  }

  /**
   * Get plain language description
   */
  async getPlainLanguageDescription(): Promise<string> {
    return this.getText(this.plainLanguageDescription);
  }

  /**
   * Get number of states
   */
  async getStateCount(): Promise<number> {
    const text = await this.getText(this.statesCount);
    const match = text.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  /**
   * Get number of events
   */
  async getEventCount(): Promise<number> {
    const text = await this.getText(this.eventsCount);
    const match = text.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  /**
   * Get list of all states
   */
  async getStatesList(): Promise<string[]> {
    const items = await this.statesList.locator('[data-testid="state-item"]').all();
    const states: string[] = [];

    for (const item of items) {
      const text = await item.textContent();
      if (text) {
        states.push(text.trim());
      }
    }

    return states;
  }

  /**
   * Click on a state in the list
   */
  async clickState(index: number) {
    const state = this.stateItem(index);
    await this.click(state);
  }

  /**
   * Scroll to visualization
   */
  async scrollToVisualization() {
    await this.scrollToElement(this.statesDiagram);
  }

  /**
   * Check if states diagram is visible
   */
  async isDiagramVisible(): Promise<boolean> {
    return this.isVisible(this.statesDiagram);
  }

  /**
   * Fill simulation form field
   */
  async fillSimulationField(field: string, value: string) {
    const input = this.simulationInput(field);
    await this.typeText(input, value);
  }

  /**
   * Run simulation
   */
  async runSimulation() {
    await this.click(this.runSimulationButton);
    await this.waitForLoadingComplete();
  }

  /**
   * Get simulation result state
   */
  async getSimulationResult(): Promise<string | null> {
    if (await this.isVisible(this.simulationResults)) {
      return this.getText(this.simulationState);
    }
    return null;
  }

  /**
   * Get number of legal references
   */
  async getLegalReferenceCount(): Promise<number> {
    return this.legalReferences.locator('[data-testid="legal-reference-item"]').count();
  }

  /**
   * Get legal reference by index
   */
  async getLegalReferenceText(index: number): Promise<string> {
    const item = this.legalReferenceItem(index);
    return this.getText(item);
  }

  /**
   * Click on legal reference link
   */
  async clickLegalReference(index: number) {
    const link = this.legalReferenceLink(index);
    const href = await this.getAttribute(link, 'href');
    // Note: This opens in a new tab, handle accordingly in test
    return href;
  }

  /**
   * Get number of examples
   */
  async getExampleCount(): Promise<number> {
    return this.examplesSection.locator('[data-testid="example-item"]').count();
  }

  /**
   * Get example code by index
   */
  async getExampleCode(index: number): Promise<string> {
    return this.getText(this.exampleCode(index));
  }

  /**
   * Click download button
   */
  async clickDownload() {
    await this.click(this.downloadButton);
  }

  /**
   * Click share button
   */
  async clickShare() {
    await this.click(this.shareButton);
  }

  /**
   * Click compare button
   */
  async clickCompare() {
    await this.click(this.compareButton);
  }

  /**
   * Click view Gherkin button
   */
  async clickViewGherkin() {
    await this.click(this.viewGherkinButton);
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
   * Wait for workflow to load
   */
  async waitForWorkflowLoaded(timeout = 10000) {
    await this.waitForLoadingComplete(timeout);
    await this.workflowTitle.waitFor({ state: 'visible', timeout });
  }

  /**
   * Copy code to clipboard
   */
  async copyCode() {
    await this.click(this.copyCodeButton);
    // Wait for toast notification or similar
    await this.page.waitForTimeout(500);
  }

  /**
   * Get code block content
   */
  async getCodeContent(): Promise<string> {
    return this.getText(this.codeBlock);
  }

  /**
   * Scroll to legal section
   */
  async scrollToLegalSection() {
    await this.clickTab('legal');
    await this.scrollToElement(this.legalReferences);
  }

  /**
   * Scroll to examples section
   */
  async scrollToExamples() {
    await this.clickTab('examples');
    await this.scrollToElement(this.examplesSection);
  }

  /**
   * Get all visible keywords
   */
  async getKeywords(): Promise<string[]> {
    const keywordElements = await this.page.locator('[data-testid="keyword"], [class*="keyword"], .badge, span[class*="tag"]').all();
    const keywords: string[] = [];

    for (const el of keywordElements) {
      const text = await el.textContent();
      if (text) {
        keywords.push(text.trim());
      }
    }

    return keywords.filter(k => k.length > 0);
  }

  /**
   * Check if tab exists
   */
  async doesTabExist(tabName: string): Promise<boolean> {
    const tab = this.page.locator(`button:has-text("${tabName}")`);
    return this.elementExists(tab);
  }
}
