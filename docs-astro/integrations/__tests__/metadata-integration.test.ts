/**
 * Tests for PAA Metadata Integration
 *
 * Tests the metadata generation and integration with Astro build process
 */

import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import metadataIntegration, {
  getMetadata,
  getMachinesMetadata,
  getRulesMetadata,
  getFeaturesMetadata,
  getLineageData,
  getMachineById,
  getRuleById,
  getFeatureById,
  getMachineRelations,
  type CompleteMetadata,
  type MachineMeta,
  type RuleMeta,
  type Feature
} from '../metadata-integration';

// Mock file system functions
jest.mock('fs');
jest.mock('@cucumber/gherkin');
jest.mock('@cucumber/messages');
jest.mock('../../src/domain/legalMetadata', () => ({
  getMachineLegalMetadata: jest.fn(() => ({
    id: 'test-machine',
    nameFr: 'Machine de Test',
    category: 'test',
    currentVersion: {
      version: '1.0.0',
      status: 'production',
      extractionDate: new Date('2024-01-01'),
      lastLegislativeUpdate: new Date('2024-01-01'),
      sources: [],
      amounts: {}
    }
  })),
  isMachineDataCurrent: jest.fn(() => ({
    isCurrent: true,
    daysOld: 10,
    needsReview: false
  })),
  getMachineSources: jest.fn(() => []),
  generateAuditReport: jest.fn(() => ({
    totalMachines: 1,
    upToDate: 1,
    needsReview: 0,
    deprecated: 0,
    missingMetadata: 0
  }))
}));

describe('PAA Metadata Integration', () => {
  const mockRootPath = '/mock/project';
  const mockMachineFile = path.join(mockRootPath, 'src/workflows/testMachine.ts');
  const mockRuleFile = path.join(mockRootPath, 'src/rules/testRules.ts');
  const mockFeatureFile = path.join(mockRootPath, 'features/test.feature');

  const mockMachineContent = `
    /**
     * Test Machine
     *
     * A test state machine for unit tests
     */
    import { createMachine } from 'xstate';

    export const testMachine = createMachine({
      id: 'test-machine',
      initial: 'idle',
      states: {
        idle: {
          on: {
            START: 'processing'
          }
        },
        processing: {
          on: {
            SUCCESS: 'completed',
            FAILURE: 'failed'
          }
        },
        completed: {
          type: 'final'
        },
        failed: {
          type: 'final'
        }
      }
    });
  `;

  const mockRuleContent = `
    /**
     * Test Rules
     * @version 1.0.0
     */
    import { Engine } from 'json-rules-engine';

    const engine = new Engine();

    engine.addRule({
      priority: 10,
      conditions: {
        all: [
          {
            fact: 'age',
            operator: 'greaterThanInclusive',
            value: 18
          },
          {
            fact: 'income',
            operator: 'lessThan',
            value: 1000
          }
        ]
      },
      event: {
        type: 'eligible',
        params: {
          message: 'User is eligible for the benefit'
        }
      }
    });

    export default engine;
  `;

  const mockFeatureContent = `
    # language: fr
    # @specification-version: 2024.1
    # @effective-date: 2024-01-01
    # @legal-basis: Article 23 de la Constitution
    # @legal-url: https://example.org/legal
    # @implemented-by: testMachine.ts

    Fonctionnalité: Test de bénéfice
      En tant qu'utilisateur
      Je veux vérifier mon éligibilité
      Pour obtenir des bénéfices

      Scénario: Vérification d'éligibilité
        Étant donné que j'ai 25 ans
        Et que mon revenu est de 800 euros
        Quand je vérifie mon éligibilité
        Alors je suis éligible au bénéfice
  `;

  beforeAll(() => {
    // Setup mock file system
    (fs.existsSync as jest.Mock).mockImplementation((path) => {
      return path.includes('src/workflows') ||
             path.includes('src/rules') ||
             path.includes('features');
    });

    (fs.readdirSync as jest.Mock).mockImplementation((dir) => {
      if (dir.includes('workflows')) {
        return [{ name: 'testMachine.ts', isDirectory: () => false }];
      }
      if (dir.includes('rules')) {
        return [{ name: 'testRules.ts', isDirectory: () => false }];
      }
      if (dir.includes('features')) {
        return [{ name: 'test.feature', isDirectory: () => false }];
      }
      return [];
    });

    (fs.readFileSync as jest.Mock).mockImplementation((filePath) => {
      if (filePath.includes('testMachine.ts')) return mockMachineContent;
      if (filePath.includes('testRules.ts')) return mockRuleContent;
      if (filePath.includes('test.feature')) return mockFeatureContent;
      return '';
    });

    (fs.statSync as jest.Mock).mockReturnValue({
      mtime: new Date('2024-01-15'),
      size: 1000
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('Metadata Generation', () => {
    it('should generate complete metadata from source files', async () => {
      // Mock Astro config
      const mockConfig = {
        root: { pathname: path.join(mockRootPath, 'docs-astro') }
      };

      let capturedMetadata: CompleteMetadata | null = null;

      // Create integration instance
      const integration = metadataIntegration({
        writeFiles: false,
        includeLegalMetadata: true
      });

      // Simulate Astro build hooks
      if (integration.hooks && integration.hooks['astro:config:setup']) {
        await integration.hooks['astro:config:setup']({
          config: mockConfig,
          command: 'build',
          updateConfig: jest.fn(),
          injectScript: jest.fn()
        } as any);
      }

      // Get metadata from global store
      capturedMetadata = (global as any).__PAA_METADATA__;

      expect(capturedMetadata).toBeDefined();
      expect(capturedMetadata?.machines).toBeDefined();
      expect(capturedMetadata?.rules).toBeDefined();
      expect(capturedMetadata?.features).toBeDefined();
      expect(capturedMetadata?.lineage).toBeDefined();
    });

    it('should extract machine metadata correctly', () => {
      const metadata = getMetadata();
      const machinesMetadata = getMachinesMetadata();

      expect(machinesMetadata).toBeDefined();
      expect(machinesMetadata?.totalMachines).toBeGreaterThan(0);

      const testMachine = getMachineById('test-machine');
      expect(testMachine).toBeDefined();
      expect(testMachine?.id).toBe('test-machine');
      expect(testMachine?.initial).toBe('idle');
      expect(testMachine?.states).toContain('idle');
      expect(testMachine?.states).toContain('processing');
      expect(testMachine?.states).toContain('completed');
      expect(testMachine?.states).toContain('failed');
    });

    it('should extract rule metadata correctly', () => {
      const rulesMetadata = getRulesMetadata();

      expect(rulesMetadata).toBeDefined();
      expect(rulesMetadata?.totalRules).toBeGreaterThan(0);

      const testRule = getRuleById('testRules-0');
      expect(testRule).toBeDefined();
      expect(testRule?.priority).toBe(10);
      expect(testRule?.conditions.all).toBeDefined();
      expect(testRule?.conditions.all?.length).toBe(2);
    });

    it('should extract feature metadata correctly', () => {
      const featuresMetadata = getFeaturesMetadata();

      expect(featuresMetadata).toBeDefined();
      expect(featuresMetadata?.totalFeatures).toBeGreaterThan(0);

      const testFeature = getFeatureById('uncategorized-test');
      expect(testFeature).toBeDefined();
      expect(testFeature?.name).toBe('Test de bénéfice');
      expect(testFeature?.language).toBe('fr');
      expect(testFeature?.scenarios.length).toBeGreaterThan(0);
    });

    it('should extract lineage relationships', () => {
      const lineageData = getLineageData();

      expect(lineageData).toBeDefined();
      expect(lineageData?.machineRelationships).toBeDefined();
      expect(lineageData?.featureMachineMapping).toBeDefined();
      expect(lineageData?.ruleMachineMapping).toBeDefined();
    });

    it('should calculate legal compliance statistics', () => {
      const machinesMetadata = getMachinesMetadata();
      const legalCompliance = machinesMetadata?.statistics.legalCompliance;

      expect(legalCompliance).toBeDefined();
      expect(legalCompliance?.upToDate).toBeGreaterThanOrEqual(0);
      expect(legalCompliance?.needsReview).toBeGreaterThanOrEqual(0);
      expect(legalCompliance?.outdated).toBeGreaterThanOrEqual(0);
      expect(legalCompliance?.missingMetadata).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Helper Functions', () => {
    it('should get machine relations correctly', () => {
      const relations = getMachineRelations('test-machine');

      expect(relations).toBeDefined();
      expect(relations?.parents).toBeDefined();
      expect(relations?.children).toBeDefined();
      expect(relations?.siblings).toBeDefined();
      expect(relations?.features).toBeDefined();
      expect(relations?.rules).toBeDefined();
    });

    it('should handle missing metadata gracefully', () => {
      const nonExistentMachine = getMachineById('non-existent');
      const nonExistentRule = getRuleById('non-existent');
      const nonExistentFeature = getFeatureById('non-existent');

      expect(nonExistentMachine).toBeNull();
      expect(nonExistentRule).toBeNull();
      expect(nonExistentFeature).toBeNull();
    });
  });

  describe('File Writing', () => {
    it('should write metadata files when writeFiles option is true', async () => {
      const writeFileSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation();
      const mkdirSpy = jest.spyOn(fs, 'mkdirSync').mockImplementation();

      const integration = metadataIntegration({
        writeFiles: true,
        outputDir: 'test-output'
      });

      const mockConfig = {
        root: { pathname: path.join(mockRootPath, 'docs-astro') }
      };

      if (integration.hooks && integration.hooks['astro:config:setup']) {
        await integration.hooks['astro:config:setup']({
          config: mockConfig,
          command: 'build',
          updateConfig: jest.fn(),
          injectScript: jest.fn()
        } as any);
      }

      expect(mkdirSpy).toHaveBeenCalled();
      expect(writeFileSpy).toHaveBeenCalledTimes(4); // machines, rules, features, complete
      expect(writeFileSpy).toHaveBeenCalledWith(
        expect.stringContaining('machines-metadata.json'),
        expect.any(String)
      );
      expect(writeFileSpy).toHaveBeenCalledWith(
        expect.stringContaining('rules-metadata.json'),
        expect.any(String)
      );
      expect(writeFileSpy).toHaveBeenCalledWith(
        expect.stringContaining('features-metadata.json'),
        expect.any(String)
      );
      expect(writeFileSpy).toHaveBeenCalledWith(
        expect.stringContaining('complete-metadata.json'),
        expect.any(String)
      );

      writeFileSpy.mockRestore();
      mkdirSpy.mockRestore();
    });
  });

  describe('Integration Hooks', () => {
    it('should execute all Astro hooks correctly', async () => {
      const integration = metadataIntegration();
      const mockLogger = {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      };

      expect(integration.name).toBe('paa-metadata-integration');
      expect(integration.hooks).toBeDefined();

      // Test astro:build:start hook
      if (integration.hooks && integration.hooks['astro:build:start']) {
        await integration.hooks['astro:build:start']({
          logger: mockLogger
        } as any);

        expect(mockLogger.info).toHaveBeenCalledWith(
          expect.stringContaining('PAA Metadata available for build')
        );
      }

      // Test astro:build:done hook
      if (integration.hooks && integration.hooks['astro:build:done']) {
        await integration.hooks['astro:build:done']({
          logger: mockLogger
        } as any);

        expect(mockLogger.info).toHaveBeenCalledWith(
          expect.stringContaining('Build completed')
        );
      }
    });
  });
});

describe('Metadata Content Validation', () => {
  it('should validate machine metadata structure', () => {
    const machinesMetadata = getMachinesMetadata();

    if (machinesMetadata && machinesMetadata.machines.length > 0) {
      const machine = machinesMetadata.machines[0];

      expect(machine).toHaveProperty('id');
      expect(machine).toHaveProperty('name');
      expect(machine).toHaveProperty('category');
      expect(machine).toHaveProperty('description');
      expect(machine).toHaveProperty('states');
      expect(machine).toHaveProperty('events');
      expect(machine).toHaveProperty('initial');

      expect(Array.isArray(machine.states)).toBe(true);
      expect(Array.isArray(machine.events)).toBe(true);
      expect(typeof machine.id).toBe('string');
    }
  });

  it('should validate rule metadata structure', () => {
    const rulesMetadata = getRulesMetadata();

    if (rulesMetadata && rulesMetadata.totalRules > 0) {
      const firstCategory = Object.keys(rulesMetadata.rulesByCategory)[0];
      const rule = rulesMetadata.rulesByCategory[firstCategory][0];

      expect(rule).toHaveProperty('id');
      expect(rule).toHaveProperty('fileName');
      expect(rule).toHaveProperty('category');
      expect(rule).toHaveProperty('description');
      expect(rule).toHaveProperty('priority');
      expect(rule).toHaveProperty('conditions');
      expect(rule).toHaveProperty('event');

      expect(typeof rule.priority).toBe('number');
      expect(rule.conditions).toHaveProperty('all');
    }
  });

  it('should validate feature metadata structure', () => {
    const featuresMetadata = getFeaturesMetadata();

    if (featuresMetadata && featuresMetadata.features.length > 0) {
      const feature = featuresMetadata.features[0];

      expect(feature).toHaveProperty('id');
      expect(feature).toHaveProperty('name');
      expect(feature).toHaveProperty('description');
      expect(feature).toHaveProperty('category');
      expect(feature).toHaveProperty('tags');
      expect(feature).toHaveProperty('scenarios');
      expect(feature).toHaveProperty('language');

      expect(Array.isArray(feature.tags)).toBe(true);
      expect(Array.isArray(feature.scenarios)).toBe(true);
    }
  });

  it('should validate statistics calculation', () => {
    const metadata = getMetadata();

    if (metadata) {
      // Machine statistics
      expect(metadata.machines.statistics).toHaveProperty('totalStates');
      expect(metadata.machines.statistics).toHaveProperty('totalEvents');
      expect(metadata.machines.statistics).toHaveProperty('averageStatesPerMachine');
      expect(metadata.machines.statistics).toHaveProperty('averageEventsPerMachine');

      // Rule statistics
      expect(metadata.rules.statistics).toHaveProperty('totalConditions');
      expect(metadata.rules.statistics).toHaveProperty('uniqueFacts');
      expect(metadata.rules.statistics).toHaveProperty('uniqueOperators');
      expect(metadata.rules.statistics).toHaveProperty('averageConditionsPerRule');

      // Feature statistics
      expect(metadata.features.statistics).toHaveProperty('totalScenarios');
      expect(metadata.features.statistics).toHaveProperty('totalSteps');
      expect(metadata.features.statistics).toHaveProperty('averageScenariosPerFeature');
      expect(metadata.features.statistics).toHaveProperty('averageStepsPerScenario');
    }
  });
});