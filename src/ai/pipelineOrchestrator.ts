/**
 * Pipeline Orchestrator
 * 
 * Complete pipeline: Legal Source → Feature → Rules → Machine → Lineage
 */

import { ClaudeAPIClient, ClaudeAPIConfig } from './claudeAPIClient';
import {
  generateFeatureFromLegalText,
  generateRulesFromFeature,
  generateMachineFromRules,
  LegalSourceInput
} from './claudeIntegration';
import { checkVersionCompliance } from '../utils/versionCompliance';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export interface PipelineInput {
  url?: string;
  text?: string;
  authority?: string;
  title?: string;
}

export interface PipelineResult {
  feature: {
    id: string;
    name: string;
    content: string;
    filePath: string;
  };
  rules: {
    id: string;
    content: string;
    filePath: string;
  };
  machine?: {
    id: string;
    content: string;
    filePath: string;
  };
  legalSource: LegalSourceInput;
  compliance: any;
}

export class PipelineOrchestrator {
  private config: ClaudeAPIConfig;
  
  constructor(
    private claudeClient: ClaudeAPIClient,
    config: ClaudeAPIConfig
  ) {
    // Ensure all required fields are set
    this.config = {
      apiKey: config.apiKey,
      model: config.model || 'claude-opus-4-5',
      maxTokens: config.maxTokens || 4096,
    };
  }

  /**
   * Complete pipeline: Legal Source → Feature → Rules → Machine → Lineage
   */
  async processNewLaw(input: PipelineInput): Promise<PipelineResult> {
    console.log('🚀 Starting complete pipeline...\n');

    // Step 1: Extract legal source
    console.log('📖 Step 1: Extracting legal source...');
    const legalSource = await this.extractLegalSource(input);
    console.log(`   ✓ Extracted: ${legalSource.title}`);

    // Step 2: Convert to Gherkin feature
    console.log('\n🔄 Step 2: Converting to Gherkin feature...');
    const feature = await this.convertToFeature(legalSource);
    console.log(`   ✓ Generated: ${feature.id}`);

    // Step 3: Write feature file
    await this.writeFeatureFile(feature);

    // Step 4: Generate rules
    console.log('\n⚙️  Step 3: Generating rules...');
    const rules = await this.generateRules(feature);
    console.log(`   ✓ Generated: ${rules.id}`);

    // Step 5: Write rules file
    await this.writeRulesFile(rules);

    // Step 6: Validate version compliance
    console.log('\n✅ Step 4: Validating version compliance...');
    const compliance = checkVersionCompliance(feature.id);
    if (compliance.overallStatus !== 'compliant') {
      console.warn(`   ⚠️  Compliance issues: ${compliance.issues.join(', ')}`);
    } else {
      console.log('   ✓ Version compliance OK');
    }

    // Step 7: Generate machine (if needed)
    console.log('\n🤖 Step 5: Checking if machine needed...');
    const machine = await this.generateMachineIfNeeded(rules, feature);
    if (machine) {
      console.log(`   ✓ Generated: ${machine.id}`);
      await this.writeMachineFile(machine);
    } else {
      console.log('   ⊘ Machine not needed (simple eligibility check)');
    }

    // Step 8: Update legal metadata (optional - would need to modify legalMetadata.ts)
    console.log('\n📋 Step 6: Legal metadata update skipped (manual step)');
    console.log('   ℹ️  Please update src/domain/legalMetadata.ts manually');

    // Step 9: Generate metadata files
    console.log('\n📊 Step 7: Generating metadata files...');
    await this.generateMetadataFiles();
    console.log('   ✓ Metadata generated');

    // Step 10: Generate lineage
    console.log('\n🔗 Step 8: Generating lineage...');
    await this.generateLineage();
    console.log('   ✓ Lineage generated');

    console.log('\n✨ Pipeline completed successfully!');

    return {
      feature,
      rules,
      machine,
      legalSource,
      compliance,
    };
  }

  private async extractLegalSource(input: PipelineInput): Promise<LegalSourceInput> {
    // If URL provided, fetch
    if (input.url) {
      try {
        const response = await fetch(input.url);
        const html = await response.text();
        
        // Use Claude to extract structured data
        const extracted = await this.claudeClient.extractLegalSourceMetadata(
          input.url,
          html
        );
        
        return {
          ...extracted,
          text: html.substring(0, 50000), // Limit text size
        };
      } catch {
        console.warn(`   ⚠️  Failed to fetch URL, using provided metadata`);
        // Fallback to provided metadata
        return {
          authority: input.authority || 'Unknown',
          title: input.title || 'Unknown Law',
          officialUrl: input.url,
          text: input.text,
        };
      }
    }

    // If text provided, extract from text
    if (input.text) {
      const prompt = `Extract legal source metadata from this Belgian legal text:
      
${input.text.substring(0, 5000)}

Return JSON with: authority, title, officialUrl (if mentioned), publicationDate, effectiveDate`;

      try {
        const extracted = await this.claudeClient.callClaudeAPI(prompt);
        const jsonMatch = extracted.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            ...parsed,
            text: input.text,
            officialUrl: parsed.officialUrl || 'N/A',
          };
        }
      } catch {
        console.warn(`   ⚠️  Failed to extract metadata, using defaults`);
      }

      // Fallback
      return {
        authority: input.authority || 'Unknown',
        title: input.title || 'Unknown Law',
        officialUrl: 'N/A',
        text: input.text,
      };
    }

    throw new Error('Either URL or text must be provided');
  }

  private async convertToFeature(legalSource: LegalSourceInput): Promise<any> {
    const legalText = legalSource.text || '';
    
    if (!legalText) {
      throw new Error('Legal text is required to generate feature');
    }

    // Generate feature using Claude
    const result = await generateFeatureFromLegalText(
      legalText,
      legalSource,
      {
        apiKey: this.config.apiKey,
        model: this.config.model!,
        maxTokens: this.config.maxTokens!,
      }
    );

    if (!result.success || !result.newContent) {
      throw new Error(`Feature generation failed: ${result.error || 'Unknown error'}`);
    }

    // Extract feature name and ID
    const featureName = this.extractFeatureName(result.newContent);
    const featureId = result.benefitId;

    return {
      id: featureId,
      name: featureName,
      content: result.newContent,
      metadata: {
        specificationVersion: result.newVersion || '1.0.0',
        legalBasis: legalSource.title,
        legalUrl: legalSource.officialUrl,
      },
    };
  }

  private async generateRules(feature: any): Promise<any> {
    const result = await generateRulesFromFeature(feature, {
      apiKey: this.config.apiKey,
      model: this.config.model!,
      maxTokens: this.config.maxTokens!,
    });

    if (!result.success || !result.newContent) {
      throw new Error(`Rules generation failed: ${result.error || 'Unknown error'}`);
    }

    // Extract events and conditions from rules content
    const events = this.extractEvents(result.newContent);
    const conditions = this.extractConditions(result.newContent);

    return {
      id: `${feature.id}Rules`,
      content: result.newContent,
      events,
      conditions,
    };
  }

  private async generateMachineIfNeeded(
    rules: any,
    feature: any
  ): Promise<any | null> {
    const result = await generateMachineFromRules(rules, feature, {
      apiKey: this.config.apiKey,
      model: this.config.model!,
      maxTokens: this.config.maxTokens!,
    });

    if (!result || !result.success || !result.newContent) {
      return null;
    }

    return {
      id: `${feature.id}Machine`,
      content: result.newContent,
    };
  }

  private async writeFeatureFile(feature: any): Promise<void> {
    const filePath = path.join(
      process.cwd(),
      'features',
      'benefits',
      `${feature.id}.feature`
    );
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, feature.content, 'utf-8');
    feature.filePath = filePath;
  }

  private async writeRulesFile(rules: any): Promise<void> {
    const filePath = path.join(
      process.cwd(),
      'src',
      'rules',
      `${rules.id}.ts`
    );
    await fs.promises.writeFile(filePath, rules.content, 'utf-8');
    rules.filePath = filePath;
  }

  private async writeMachineFile(machine: any): Promise<void> {
    const filePath = path.join(
      process.cwd(),
      'src',
      'workflows',
      `${machine.id}.ts`
    );
    await fs.promises.writeFile(filePath, machine.content, 'utf-8');
    machine.filePath = filePath;
  }

  private async generateMetadataFiles(): Promise<void> {
    try {
      await execAsync('npm run features:metadata');
      await execAsync('npm run rules:metadata');
      await execAsync('npm run docs:metadata');
    } catch (error) {
      console.warn('   ⚠️  Some metadata generation failed:', error);
    }
  }

  private async generateLineage(): Promise<void> {
    try {
      await execAsync('npm run docs:individual');
    } catch (error) {
      console.warn('   ⚠️  Lineage generation failed:', error);
    }
  }

  private extractFeatureName(content: string): string {
    const match = content.match(/Fonctionnalité:\s*(.+)/);
    return match ? match[1].trim() : 'Unknown Feature';
  }

  private extractEvents(content: string): string[] {
    const events: string[] = [];
    const matches = content.matchAll(/event:\s*{\s*type:\s*['"]([^'"]+)['"]/g);
    for (const match of matches) {
      events.push(match[1]);
    }
    // Also check for event type definitions
    const eventTypeMatches = content.matchAll(/type:\s*['"]([^'"]+)['"]/g);
    for (const match of eventTypeMatches) {
      if (!events.includes(match[1])) {
        events.push(match[1]);
      }
    }
    return events.length > 0 ? events : ['CHECK_ELIGIBILITY']; // Default
  }

  private extractConditions(content: string): any {
    // Extract conditions from rules file
    // This is a simplified version - could be enhanced
    const conditions: any = {};
    
    // Try to find condition objects
    const conditionMatches = content.matchAll(/conditions:\s*\{([^}]+)\}/g);
    for (const match of conditionMatches) {
      // Simple extraction - could be more sophisticated
      conditions.raw = match[1];
    }
    
    return Object.keys(conditions).length > 0 ? conditions : { all: [] };
  }
}

