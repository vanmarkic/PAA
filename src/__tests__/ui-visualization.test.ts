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
  const fileExists = fs.existsSync(htmlPath);
  let dom: JSDOM | null = null;
  let document: Document | null = null;
  let window: Window | null = null;

  // Helper to skip tests if file doesn't exist
  const skipIfMissing = (testName: string, testFn: () => void) => {
    if (!fileExists) {
      test.skip(testName, () => {});
      return;
    }
    test(testName, testFn);
  };

  beforeAll(() => {
    // Skip all tests if the old index.html doesn't exist (project moved to Astro)
    if (!fileExists) {
      console.log('Skipping UI visualization tests - docs/index.html no longer exists (moved to Astro)');
      return;
    }
  });

  beforeEach(() => {
    if (!fileExists) {
      return; // Skip if file doesn't exist
    }
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
    if (dom) {
      dom.window.close();
    }
  });

  describe('HTML Structure', () => {
    skipIfMissing('should have proper document structure', () => {
      if (!document) return;
      expect(document.doctype).toBeTruthy();
      expect(document.documentElement.lang).toBe('en');
      expect(document.querySelector('meta[charset="UTF-8"]')).toBeTruthy();
      expect(document.querySelector('meta[name="viewport"]')).toBeTruthy();
    });

    skipIfMissing('should have correct page title', () => {
      if (!document) return;
      expect(document.title).toBe('PAA - State Machine Visualizations');
    });

    skipIfMissing('should include Mermaid library', () => {
      if (!document) return;
      const mermaidScript = document.querySelector('script[type="module"]');
      expect(mermaidScript).toBeTruthy();
      expect(mermaidScript?.textContent).toContain('mermaid@10');
    });

    skipIfMissing('should have main container', () => {
      if (!document) return;
      const container = document.querySelector('.container');
      expect(container).toBeTruthy();
    });

    skipIfMissing('should have header with title and subtitle', () => {
      if (!document) return;
      const header = document.querySelector('header');
      expect(header).toBeTruthy();

      const title = header?.querySelector('h1');
      expect(title?.textContent).toContain('PAA State Machines');

      const subtitle = header?.querySelector('.subtitle');
      expect(subtitle?.textContent).toContain('Plateforme d\'Aide Administrative');
    });
  });

  describe('Language Support', () => {
    skipIfMissing('should have language selector with three languages', () => {
      if (!document) return;
      const langSelector = document.querySelector('.language-selector');
      expect(langSelector).toBeTruthy();

      const langButtons = langSelector?.querySelectorAll('.lang-btn');
      expect(langButtons?.length).toBe(3);
    });

    skipIfMissing('should have English, French, and Dutch language options', () => {
      if (!document) return;
      const langButtons = Array.from(document.querySelectorAll('.lang-btn'));
      const languages = langButtons.map(btn => btn.textContent?.trim() || '');

      // Check for language names (may include flag emojis)
      expect(languages.some(lang => lang.includes('English'))).toBe(true);
      expect(languages.some(lang => lang.includes('Français'))).toBe(true);
      expect(languages.some(lang => lang.includes('Nederlands'))).toBe(true);
    });

    skipIfMissing('should have content sections for all three languages', () => {
      if (!document) return;
      expect(document.querySelector('#lang-en')).toBeTruthy();
      expect(document.querySelector('#lang-fr')).toBeTruthy();
      expect(document.querySelector('#lang-nl')).toBeTruthy();
    });

    skipIfMissing('English should be active by default', () => {
      if (!document) return;
      const englishContent = document.querySelector('#lang-en');
      expect(englishContent?.classList.contains('active')).toBe(true);
    });
  });

  describe('Navigation Tabs', () => {
    skipIfMissing('each language should have five tabs', () => {
      if (!document) return;
      const languages = ['en', 'fr', 'nl'];

      languages.forEach(lang => {
        if (!document) return;
        const tabs = document.querySelectorAll(`#lang-${lang} .tab`);
        expect(tabs.length).toBe(5);
      });
    });

    skipIfMissing('tabs should have correct labels in English', () => {
      if (!document) return;
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

    skipIfMissing('first tab should be active by default in each language', () => {
      if (!document) return;
      const languages = ['en', 'fr', 'nl'];

      languages.forEach(lang => {
        if (!document) return;
        const firstTab = document.querySelector(`#lang-${lang} .tab`);
        expect(firstTab?.classList.contains('active')).toBe(true);
      });
    });
  });

  describe('Content Sections', () => {
    skipIfMissing('each language should have all content sections', () => {
      if (!document) return;
      const languages = ['en', 'fr', 'nl'];
      const sections = ['overview', 'architecture', 'ris', 'conversion', 'about'];

      languages.forEach(lang => {
        sections.forEach(section => {
          if (!document) return;
          const contentSection = document.querySelector(`#${section}-${lang}`);
          expect(contentSection).toBeTruthy();
        });
      });
    });

    skipIfMissing('overview section should be active by default', () => {
      if (!document) return;
      const overviewEn = document.querySelector('#overview-en');
      expect(overviewEn?.classList.contains('active')).toBe(true);
    });
  });

  describe('Mermaid Diagrams', () => {
    skipIfMissing('should have multiple Mermaid diagrams', () => {
      if (!document) return;
      const mermaidDivs = document.querySelectorAll('.mermaid');
      expect(mermaidDivs.length).toBeGreaterThan(0);
    });

    skipIfMissing('should have RIS workflow state diagrams', () => {
      if (!document) return;
      const mermaidBlocks = Array.from(document.querySelectorAll('.mermaid'));
      const risStateDiagrams = mermaidBlocks.filter(block =>
        block.textContent?.includes('stateDiagram-v2') &&
        block.textContent?.includes('checkingEligibility')
      );

      expect(risStateDiagrams.length).toBeGreaterThan(0);
    });

    skipIfMissing('should have Legal Conversion Pipeline state diagrams', () => {
      if (!document) return;
      const mermaidBlocks = Array.from(document.querySelectorAll('.mermaid'));
      const conversionStateDiagrams = mermaidBlocks.filter(block =>
        block.textContent?.includes('stateDiagram-v2') &&
        block.textContent?.includes('extractingStructure')
      );

      expect(conversionStateDiagrams.length).toBeGreaterThan(0);
    });

    skipIfMissing('all state diagrams should use stateDiagram-v2 syntax', () => {
      if (!document) return;
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
    skipIfMissing('should use correct choice state syntax with square brackets', () => {
      if (!fileExists) return;
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

      conversionDiagrams.forEach((content) => {
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
    skipIfMissing('should have switchLanguage function defined', () => {
      if (!window) return;
      expect(typeof (window as any).switchLanguage).toBe('function');
    });

    skipIfMissing('should have showTab function defined', () => {
      if (!window) return;
      expect(typeof (window as any).showTab).toBe('function');
    });
  });

  describe('Information Content', () => {
    skipIfMissing('should display RIS amounts for 2024', () => {
      if (!document) return;
      const risSection = document.querySelector('#ris-en');
      expect(risSection?.textContent).toContain('€1,070.49'); // Single person
      expect(risSection?.textContent).toContain('€713.66');   // Cohabiting
      expect(risSection?.textContent).toContain('€1,450.52'); // Single parent
    });

    skipIfMissing('should display impact metrics in About section', () => {
      if (!document) return;
      const aboutSection = document.querySelector('#about-en');
      expect(aboutSection?.textContent).toContain('+287%'); // Comprehension
      expect(aboutSection?.textContent).toContain('+171%'); // Correct actions
      expect(aboutSection?.textContent).toContain('-82%');  // Abandonment
      expect(aboutSection?.textContent).toContain('-83%');  // Time saved
    });

    skipIfMissing('should have info boxes explaining key concepts', () => {
      if (!document) return;
      const infoBoxes = document.querySelectorAll('.info-box');
      expect(infoBoxes.length).toBeGreaterThan(0);
    });

    skipIfMissing('should have badges for key features', () => {
      if (!document) return;
      const badges = document.querySelectorAll('.badge');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('Styling and Layout', () => {
    skipIfMissing('should have responsive design styles', () => {
      if (!document) return;
      const styles = document.querySelector('style');
      expect(styles?.textContent).toContain('@media (max-width: 768px)');
    });

    skipIfMissing('should have gradient background styling', () => {
      if (!document) return;
      const styles = document.querySelector('style');
      expect(styles?.textContent).toContain('linear-gradient');
      expect(styles?.textContent).toContain('#667eea');
      expect(styles?.textContent).toContain('#764ba2');
    });

    skipIfMissing('should have card-based layout', () => {
      if (!document) return;
      const cards = document.querySelectorAll('.card');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Footer', () => {
    skipIfMissing('should have footer with project description', () => {
      if (!document) return;
      const footer = document.querySelector('footer');
      expect(footer).toBeTruthy();
      expect(footer?.textContent).toContain('Plateforme d\'Aide Administrative');
    });

    skipIfMissing('should have multilingual tagline in footer', () => {
      if (!document) return;
      const footer = document.querySelector('footer');
      const footerText = footer?.textContent || '';

      expect(footerText).toContain('Making Belgian social benefits accessible'); // English
      expect(footerText).toContain('Rendre les prestations sociales belges accessibles'); // French
      expect(footerText).toContain('Belgische sociale uitkeringen toegankelijk'); // Dutch
    });
  });

  describe('State Machine Details', () => {
    skipIfMissing('RIS machine should have 11 states documented', () => {
      if (!document) return;
      const risSection = document.querySelector('#ris-en');
      const badges = risSection?.querySelectorAll('.badge');
      const badgeTexts = Array.from(badges || []).map(b => b.textContent);

      expect(badgeTexts).toContain('11 States');
      expect(badgeTexts).toContain('11 Events');
    });

    skipIfMissing('Conversion machine should have 8 states documented', () => {
      if (!document) return;
      const conversionSection = document.querySelector('#conversion-en');
      const badges = conversionSection?.querySelectorAll('.badge');
      const badgeTexts = Array.from(badges || []).map(b => b.textContent);

      expect(badgeTexts).toContain('8 States');
      expect(badgeTexts).toContain('9 Events');
    });

    skipIfMissing('should document retry mechanism with max 3 attempts', () => {
      if (!document) return;
      const conversionSection = document.querySelector('#conversion-en');
      const badges = conversionSection?.querySelectorAll('.badge');
      const badgeTexts = Array.from(badges || []).map(b => b.textContent);

      expect(badgeTexts).toContain('Auto Retry (Max 3)');
    });
  });

  describe('Architecture Diagrams', () => {
    skipIfMissing('should have system architecture overview', () => {
      if (!document) return;
      const architectureSection = document.querySelector('#architecture-en');
      expect(architectureSection).toBeTruthy();
      expect(architectureSection?.textContent).toContain('System Architecture');
    });

    skipIfMissing('should document state machines integration', () => {
      if (!document) return;
      const architectureSection = document.querySelector('#architecture-en');
      const mermaidBlocks = architectureSection?.querySelectorAll('.mermaid');

      expect(mermaidBlocks && mermaidBlocks.length).toBeGreaterThan(0);
    });

    skipIfMissing('should show technology stack information', () => {
      if (!document) return;
      const architectureSection = document.querySelector('#architecture-en');
      const content = architectureSection?.textContent || '';

      expect(content).toContain('XState v5.24.0');
      expect(content).toContain('TypeScript');
      expect(content).toContain('json-rules-engine');
    });
  });
});
