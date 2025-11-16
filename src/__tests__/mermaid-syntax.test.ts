/**
 * Mermaid Syntax Validation Tests
 *
 * These tests validate that all Mermaid diagrams in the codebase
 * follow proper syntax for Mermaid 10.9.5+
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Mermaid Syntax Validation', () => {
  const projectRoot = path.resolve(__dirname, '../..');
  const markdownFiles = [
    'ARCHITECTURE.md',
    'docs/state-machines-visualization.md',
    'docs/index.html',
  ];

  /**
   * Extract all Mermaid code blocks from a file
   */
  function extractMermaidBlocks(filePath: string): { block: string; lineStart: number }[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const blocks: { block: string; lineStart: number }[] = [];

    // Match markdown code blocks
    const markdownRegex = /```mermaid\n([\s\S]*?)\n```/g;
    let match;

    // Extract markdown code blocks
    while ((match = markdownRegex.exec(content)) !== null) {
      const block = match[1];
      const lineStart = content.substring(0, match.index).split('\n').length;
      blocks.push({ block, lineStart });
    }

    // Extract HTML div blocks (less strict pattern for HTML files)
    if (filePath.endsWith('.html')) {
      const htmlRegex = /<div class="mermaid">\s*([\s\S]*?)\s*<\/div>/g;
      while ((match = htmlRegex.exec(content)) !== null) {
        const block = match[1].trim();
        const lineStart = content.substring(0, match.index).split('\n').length;
        blocks.push({ block, lineStart });
      }
    }

    return blocks;
  }

  /**
   * Validate a single Mermaid block for common syntax errors
   */
  function validateMermaidBlock(block: string): string[] {
    const errors: string[] = [];

    // Check for HTML tags in stateDiagram labels (not allowed in stateDiagram-v2)
    // Note: <br/> is allowed in flowcharts but not in stateDiagram-v2
    if (block.includes('stateDiagram') && (block.includes('<br/>') || block.includes('<br>'))) {
      errors.push('HTML tags like <br/> are not allowed in stateDiagram-v2');
    }

    // Check for unescaped < or > in transition labels (can cause parsing issues)
    const transitionRegex = /-->\s*\w+:\s*[^:\n]*[<>][^:\n]*/g;
    const transitions = block.match(transitionRegex);
    if (transitions) {
      transitions.forEach(transition => {
        // Ignore <<choice>> and similar valid syntax
        if (!transition.includes('<<') && !transition.includes('>>')) {
          errors.push(`Unescaped < or > character in transition: "${transition.trim()}"`);
        }
      });
    }

    // Check for choice states without proper declaration
    // If we see transitions with conditions, ensure the choice state is declared
    const hasConditionalTransitions = /-->\s*\w+:\s*\w+_(less|greater|equal)/.test(block);
    const hasChoiceDeclaration = /state\s+\w+\s*<<choice>>/.test(block);

    if (hasConditionalTransitions && !hasChoiceDeclaration) {
      errors.push('Conditional transitions found but choice state not declared with <<choice>>');
    }

    // Check for proper stateDiagram-v2 syntax
    if (block.includes('stateDiagram') && !block.includes('stateDiagram-v2')) {
      errors.push('Use stateDiagram-v2 instead of stateDiagram for better compatibility');
    }

    return errors;
  }

  // Test each markdown file
  markdownFiles.forEach(file => {
    describe(`Validating ${file}`, () => {
      const filePath = path.join(projectRoot, file);

      test('file should exist', () => {
        expect(fs.existsSync(filePath)).toBe(true);
      });

      test('should have valid Mermaid syntax', () => {
        if (!fs.existsSync(filePath)) {
          return; // Skip if file doesn't exist
        }

        const blocks = extractMermaidBlocks(filePath);
        expect(blocks.length).toBeGreaterThan(0);

        blocks.forEach(({ block, lineStart }, index) => {
          const errors = validateMermaidBlock(block);

          if (errors.length > 0) {
            const errorMsg = `Mermaid block #${index + 1} (starting at line ${lineStart}) has syntax errors:\n${errors.map(e => `  - ${e}`).join('\n')}`;
            throw new Error(errorMsg);
          }
        });
      });

      test('stateDiagrams should not contain HTML break tags', () => {
        if (!fs.existsSync(filePath)) {
          return; // Skip if file doesn't exist
        }

        const blocks = extractMermaidBlocks(filePath);
        const stateDiagramBlocks = blocks.filter(({ block }) => block.includes('stateDiagram'));

        stateDiagramBlocks.forEach(({ block, lineStart }, index) => {
          expect(block).not.toMatch(/<br\s*\/?>/);
        });
      });

      test('should not contain unescaped comparison operators in labels', () => {
        if (!fs.existsSync(filePath)) {
          return; // Skip if file doesn't exist
        }

        const blocks = extractMermaidBlocks(filePath);
        blocks.forEach(({ block }, index) => {
          // Check for patterns like "retry_count < 3" in transition labels
          const problematicPatterns = [
            /-->\s*\w+:\s*\w+\s*<\s*\d+/,  // e.g., "retry_count < 3"
            /-->\s*\w+:\s*\w+\s*>=\s*\d+/, // e.g., "retry_count >= 3"
            /-->\s*\w+:\s*\w+\s*>\s*\d+/,  // e.g., "retry_count > 3"
            /-->\s*\w+:\s*\w+\s*<=\s*\d+/, // e.g., "retry_count <= 3"
          ];

          problematicPatterns.forEach(pattern => {
            const match = block.match(pattern);
            if (match) {
              throw new Error(`Block #${index + 1} contains comparison operators in label: "${match[0]}". Use underscore naming like "retryCount_less_3" instead.`);
            }
          });
        });
      });
    });
  });

  describe('Mermaid Best Practices', () => {
    test('choice states should be properly declared', () => {
      const filePath = path.join(projectRoot, 'ARCHITECTURE.md');
      if (!fs.existsSync(filePath)) {
        return;
      }

      const blocks = extractMermaidBlocks(filePath);
      const stateDiagramBlocks = blocks.filter(({ block }) =>
        block.includes('stateDiagram')
      );

      stateDiagramBlocks.forEach(({ block, lineStart }) => {
        // If we see conditional transition naming, we should have choice state
        if (block.includes('_less_') || block.includes('_greater_')) {
          expect(block).toMatch(/state\s+\w+\s*<<choice>>/);
        }
      });
    });

    test('all state diagrams should use v2 syntax', () => {
      markdownFiles.forEach(file => {
        const filePath = path.join(projectRoot, file);
        if (!fs.existsSync(filePath)) {
          return;
        }

        const blocks = extractMermaidBlocks(filePath);
        blocks.forEach(({ block }, index) => {
          if (block.includes('stateDiagram')) {
            expect(block).toMatch(/stateDiagram-v2/);
          }
        });
      });
    });
  });
});
