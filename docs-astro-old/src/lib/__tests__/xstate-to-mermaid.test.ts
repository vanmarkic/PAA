/**
 * Tests for XState to Mermaid converter
 */

import { describe, it, expect } from 'vitest';
import { createMachine } from 'xstate';
import { xstateToMermaid } from '../xstate-to-mermaid';

describe('xstateToMermaid', () => {
  it('should include all states in the diagram', () => {
    // Create a test machine similar to declarationTVAMachine
    const testMachine = createMachine({
      id: 'testMachine',
      initial: 'periode',
      states: {
        periode: {
          on: {
            NOUVELLE_PERIODE: { target: 'comptabilisation' },
          },
        },
        comptabilisation: {
          on: {
            COMPTABILITE_FINALISEE: { target: 'redactionDeclaration' },
          },
        },
        redactionDeclaration: {
          on: {
            DECLARATION_REMPLIE: { target: 'transmissionIntervat' },
          },
        },
        transmissionIntervat: {
          on: {
            TRANSMISSION_INTERVAT: { target: 'paiement' },
          },
        },
        paiement: {
          on: {
            PAIEMENT_EFFECTUE: { target: 'termine' },
          },
        },
        termine: {
          type: 'final',
        },
      },
    });

    const mermaidCode = xstateToMermaid(testMachine);

    // Check that all states are present
    expect(mermaidCode).toContain('periode');
    expect(mermaidCode).toContain('comptabilisation');
    expect(mermaidCode).toContain('redactionDeclaration');
    expect(mermaidCode).toContain('transmissionIntervat');
    expect(mermaidCode).toContain('paiement');
    expect(mermaidCode).toContain('termine');

    // Check that all transitions are present
    expect(mermaidCode).toContain('periode --> comptabilisation');
    expect(mermaidCode).toContain('comptabilisation --> redactionDeclaration');
    expect(mermaidCode).toContain('redactionDeclaration --> transmissionIntervat');
    expect(mermaidCode).toContain('transmissionIntervat --> paiement');
    expect(mermaidCode).toContain('paiement --> termine');
    expect(mermaidCode).toContain('termine --> [*]');
    expect(mermaidCode).toContain('[*] --> periode');
  });

  it('should generate valid Mermaid syntax', () => {
    const testMachine = createMachine({
      id: 'simple',
      initial: 'start',
      states: {
        start: {
          on: {
            GO: { target: 'end' },
          },
        },
        end: {
          type: 'final',
        },
      },
    });

    const mermaidCode = xstateToMermaid(testMachine);

    // Should start with stateDiagram-v2
    expect(mermaidCode).toMatch(/^stateDiagram-v2/);
    
    // Should have initial state transition
    expect(mermaidCode).toContain('[*] --> start');
    
    // Should have state transitions
    expect(mermaidCode).toContain('start --> end');
    
    // Should have final state transition
    expect(mermaidCode).toContain('end --> [*]');
  });

  it('should handle states with multiple transitions', () => {
    const testMachine = createMachine({
      id: 'multiTransition',
      initial: 'start',
      states: {
        start: {
          on: {
            EVENT1: { target: 'middle' },
            EVENT2: { target: 'end' },
          },
        },
        middle: {
          on: {
            EVENT3: { target: 'end' },
          },
        },
        end: {
          type: 'final',
        },
      },
    });

    const mermaidCode = xstateToMermaid(testMachine);

    expect(mermaidCode).toContain('start --> middle');
    expect(mermaidCode).toContain('start --> end');
    expect(mermaidCode).toContain('middle --> end');
  });
});

