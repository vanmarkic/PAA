/**
 * UI Visualization Tests
 *
 * Tests for the PAA state machine visualization HTML page
 * Validates structure, content, and interactive functionality
 *
 * @jest-environment jsdom
 */

import * as fs from 'fs';
import * as path from 'path';
import { JSDOM } from 'jsdom';

describe('PAA Visualization UI Tests', () => {
  const htmlPath = path.resolve(__dirname, '../../docs/index.html');
  let dom: JSDOM;
  let document: Document;
  let window: Window;

  beforeEach(() => {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    dom = new JSDOM(html, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost',
    });
    document = dom.window.document;
    window = dom.window as unknown as Window;
  });

  afterEach(() => {
    dom.window.close();
  });

  describe('HTML Structure', () => {
    test('should have proper document structure', () => {
      expect(document.doctype).toBeTruthy();
      expect(document.documentElement.lang).toBe('en');
      expect(document.querySelector('meta[charset="UTF-8"]')).toBeTruthy();
      expect(document.querySelector('meta[name="viewport"]')).toBeTruthy();
    });

    test('should have correct page title', () => {
      expect(document.title).toBe('PAA - State Machine Visualizations');
    });

    test('should include Mermaid library', () => {
      const mermaidScript = document.querySelector('script[type="module"]');
      expect(mermaidScript).toBeTruthy();
      expect(mermaidScript?.textContent).toContain('mermaid@10');
    });

    test('should have main container', () => {
      const container = document.querySelector('.container');
      expect(container).toBeTruthy();
    });

    test('should have header with title and subtitle', () => {
      const header = document.querySelector('header');
      expect(header).toBeTruthy();

      const title = header?.querySelector('h1');
      expect(title?.textContent).toContain('PAA State Machines');

      const subtitle = header?.querySelector('.subtitle');
      expect(subtitle?.textContent).toContain('Plateforme d\'Aide Administrative');
    });
  });

  describe('Language Support', () => {
    test('should have language selector with three languages', () => {
      const langSelector = document.querySelector('.language-selector');
      expect(langSelector).toBeTruthy();

      const langButtons = langSelector?.querySelectorAll('.lang-btn');
      expect(langButtons?.length).toBe(3);
    });

    test('should have English, French, and Dutch language options', () => {
      const langButtons = Array.from(document.querySelectorAll('.lang-btn'));
      const languages = langButtons.map(btn => btn.textContent?.trim() || '');

      // Check for language names (may include flag emojis)
      expect(languages.some(lang => lang.includes('English'))).toBe(true);
      expect(languages.some(lang => lang.includes('Français'))).toBe(true);
      expect(languages.some(lang => lang.includes('Nederlands'))).toBe(true);
    });

    test('should have content sections for all three languages', () => {
      expect(document.querySelector('#lang-en')).toBeTruthy();
      expect(document.querySelector('#lang-fr')).toBeTruthy();
      expect(document.querySelector('#lang-nl')).toBeTruthy();
    });

    test('English should be active by default', () => {
      const englishContent = document.querySelector('#lang-en');
      expect(englishContent?.classList.contains('active')).toBe(true);
    });
  });

  describe('Navigation Tabs', () => {
    test('each language should have five tabs', () => {
      const languages = ['en', 'fr', 'nl'];

      languages.forEach(lang => {
        const tabs = document.querySelectorAll(`#lang-${lang} .tab`);
        expect(tabs.length).toBe(5);
      });
    });

    test('tabs should have correct labels in English', () => {
      const tabs = Array.from(document.querySelectorAll('#lang-en .tab'));
      const tabLabels = tabs.map(tab => tab.textContent?.trim());

      expect(tabLabels).toEqual([
        'Overview',
        'System Architecture',
        'RIS Workflow',
        'Legal Conversion',
        'About'
      ]);
    });

    test('first tab should be active by default in each language', () => {
      const languages = ['en', 'fr', 'nl'];

      languages.forEach(lang => {
        const firstTab = document.querySelector(`#lang-${lang} .tab`);
        expect(firstTab?.classList.contains('active')).toBe(true);
      });
    });
  });

  describe('Content Sections', () => {
    test('each language should have all content sections', () => {
      const languages = ['en', 'fr', 'nl'];
      const sections = ['overview', 'architecture', 'ris', 'conversion', 'about'];

      languages.forEach(lang => {
        sections.forEach(section => {
          const contentSection = document.querySelector(`#${section}-${lang}`);
          expect(contentSection).toBeTruthy();
        });
      });
    });

    test('overview section should be active by default', () => {
      const overviewEn = document.querySelector('#overview-en');
      expect(overviewEn?.classList.contains('active')).toBe(true);
    });
  });

  describe('Mermaid Diagrams', () => {
    test('should have multiple Mermaid diagrams', () => {
      const mermaidDivs = document.querySelectorAll('.mermaid');
      expect(mermaidDivs.length).toBeGreaterThan(0);
    });

    test('should have RIS workflow state diagrams', () => {
      const mermaidBlocks = Array.from(document.querySelectorAll('.mermaid'));
      const risStateDiagrams = mermaidBlocks.filter(block =>
        block.textContent?.includes('stateDiagram-v2') &&
        block.textContent?.includes('checkingEligibility')
      );

      expect(risStateDiagrams.length).toBeGreaterThan(0);
    });

    test('should have Legal Conversion Pipeline state diagrams', () => {
      const mermaidBlocks = Array.from(document.querySelectorAll('.mermaid'));
      const conversionStateDiagrams = mermaidBlocks.filter(block =>
        block.textContent?.includes('stateDiagram-v2') &&
        block.textContent?.includes('extractingStructure')
      );

      expect(conversionStateDiagrams.length).toBeGreaterThan(0);
    });

    test('all state diagrams should use stateDiagram-v2 syntax', () => {
      const mermaidBlocks = Array.from(document.querySelectorAll('.mermaid'));
      const stateDiagrams = mermaidBlocks.filter(block =>
        block.textContent?.includes('stateDiagram')
      );

      stateDiagrams.forEach(diagram => {
        expect(diagram.textContent).toContain('stateDiagram-v2');
      });
    });
  });

  describe('Conversion Pipeline Choice State Syntax', () => {
    test('should use correct choice state syntax with square brackets', () => {
      // Read the HTML file directly since JSDOM may not fully parse all content
      const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

      // Extract all mermaid blocks that contain conversion pipeline
      const mermaidBlockRegex = /<div class="mermaid">([\s\S]*?)<\/div>/g;
      const allMermaidBlocks: string[] = [];
      let match;

      while ((match = mermaidBlockRegex.exec(htmlContent)) !== null) {
        allMermaidBlocks.push(match[1]);
      }

      const conversionDiagrams = allMermaidBlocks.filter(block =>
        block.includes('checkingRetries') &&
        block.includes('<<choice>>') &&
        block.includes('extractingStructure')
      );

      // Should have at least 3 conversion diagrams (one per language: en, fr, nl)
      expect(conversionDiagrams.length).toBeGreaterThanOrEqual(3);

      conversionDiagrams.forEach((content, index) => {
        // Should have proper choice state declaration
        expect(content).toMatch(/state\s+checkingRetries\s*<<choice>>/);

        // Should use square bracket syntax for conditions
        expect(content).toMatch(/checkingRetries\s*-->\s*regeneratingWithConstraints:\s*\[retryCount\s*<\s*3\]/);
        expect(content).toMatch(/checkingRetries\s*-->\s*failed:\s*\[retryCount\s*>=\s*3\]/);

        // Should NOT use underscore naming for conditions
        expect(content).not.toContain('retryCount_less_3');
        expect(content).not.toContain('retryCount_greater_equal_3');
      });
    });
  });

  describe('Interactive Features', () => {
    test('should have switchLanguage function defined', () => {
      expect(typeof (window as any).switchLanguage).toBe('function');
    });

    test('should have showTab function defined', () => {
      expect(typeof (window as any).showTab).toBe('function');
    });
  });

  describe('Information Content', () => {
    test('should display RIS amounts for 2024', () => {
      const risSection = document.querySelector('#ris-en');
      expect(risSection?.textContent).toContain('€1,070.49'); // Single person
      expect(risSection?.textContent).toContain('€713.66');   // Cohabiting
      expect(risSection?.textContent).toContain('€1,450.52'); // Single parent
    });

    test('should display impact metrics in About section', () => {
      const aboutSection = document.querySelector('#about-en');
      expect(aboutSection?.textContent).toContain('+287%'); // Comprehension
      expect(aboutSection?.textContent).toContain('+171%'); // Correct actions
      expect(aboutSection?.textContent).toContain('-82%');  // Abandonment
      expect(aboutSection?.textContent).toContain('-83%');  // Time saved
    });

    test('should have info boxes explaining key concepts', () => {
      const infoBoxes = document.querySelectorAll('.info-box');
      expect(infoBoxes.length).toBeGreaterThan(0);
    });

    test('should have badges for key features', () => {
      const badges = document.querySelectorAll('.badge');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('Styling and Layout', () => {
    test('should have responsive design styles', () => {
      const styles = document.querySelector('style');
      expect(styles?.textContent).toContain('@media (max-width: 768px)');
    });

    test('should have gradient background styling', () => {
      const styles = document.querySelector('style');
      expect(styles?.textContent).toContain('linear-gradient');
      expect(styles?.textContent).toContain('#667eea');
      expect(styles?.textContent).toContain('#764ba2');
    });

    test('should have card-based layout', () => {
      const cards = document.querySelectorAll('.card');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Footer', () => {
    test('should have footer with project description', () => {
      const footer = document.querySelector('footer');
      expect(footer).toBeTruthy();
      expect(footer?.textContent).toContain('Plateforme d\'Aide Administrative');
    });

    test('should have multilingual tagline in footer', () => {
      const footer = document.querySelector('footer');
      const footerText = footer?.textContent || '';

      expect(footerText).toContain('Making Belgian social benefits accessible'); // English
      expect(footerText).toContain('Rendre les prestations sociales belges accessibles'); // French
      expect(footerText).toContain('Belgische sociale uitkeringen toegankelijk'); // Dutch
    });
  });

  describe('State Machine Details', () => {
    test('RIS machine should have 11 states documented', () => {
      const risSection = document.querySelector('#ris-en');
      const badges = risSection?.querySelectorAll('.badge');
      const badgeTexts = Array.from(badges || []).map(b => b.textContent);

      expect(badgeTexts).toContain('11 States');
      expect(badgeTexts).toContain('11 Events');
    });

    test('Conversion machine should have 8 states documented', () => {
      const conversionSection = document.querySelector('#conversion-en');
      const badges = conversionSection?.querySelectorAll('.badge');
      const badgeTexts = Array.from(badges || []).map(b => b.textContent);

      expect(badgeTexts).toContain('8 States');
      expect(badgeTexts).toContain('9 Events');
    });

    test('should document retry mechanism with max 3 attempts', () => {
      const conversionSection = document.querySelector('#conversion-en');
      const badges = conversionSection?.querySelectorAll('.badge');
      const badgeTexts = Array.from(badges || []).map(b => b.textContent);

      expect(badgeTexts).toContain('Auto Retry (Max 3)');
    });
  });

  describe('Architecture Diagrams', () => {
    test('should have system architecture overview', () => {
      const architectureSection = document.querySelector('#architecture-en');
      expect(architectureSection).toBeTruthy();
      expect(architectureSection?.textContent).toContain('System Architecture');
    });

    test('should document state machines integration', () => {
      const architectureSection = document.querySelector('#architecture-en');
      const mermaidBlocks = architectureSection?.querySelectorAll('.mermaid');

      expect(mermaidBlocks && mermaidBlocks.length).toBeGreaterThan(0);
    });

    test('should show technology stack information', () => {
      const architectureSection = document.querySelector('#architecture-en');
      const content = architectureSection?.textContent || '';

      expect(content).toContain('XState v5.24.0');
      expect(content).toContain('TypeScript');
      expect(content).toContain('json-rules-engine');
    });
  });
});
