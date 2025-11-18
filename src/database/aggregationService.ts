/**
 * Topic Aggregation Service
 * 
 * Aggregates multiple laws into a single feature/rules/workflow per topic
 * 
 * Example: RIS topic combines:
 * - Loi du 26 mai 2002 (primary)
 * - Arrêté royal du 11 juillet 2002 (implementing)
 * - Loi du 2 août 1971 (indexation)
 */

import * as fs from 'fs';
import * as path from 'path';
import { getDatabaseService, LawMetadata, TopicMetadata } from './registryService';
import { ClaudeAPIClient } from '../ai/claudeAPIClient';

export interface AggregationResult {
  topicId: string;
  scrapeId: string;
  files: {
    feature: string;
    rules: string;
    workflow?: string;
  };
  lawVersions: Array<{
    lawId: string;
    version: string;
    type: string;
  }>;
}

export class TopicAggregationService {
  private db = getDatabaseService();

  constructor(private claudeClient: ClaudeAPIClient) {}

  /**
   * Aggregate all laws for a topic into single feature/rules/workflow
   */
  async aggregateTopic(topicId: string): Promise<AggregationResult> {
    const topic = this.db.getTopic(topicId);
    if (!topic) {
      throw new Error(`Topic ${topicId} not found`);
    }

    console.log(`\n📦 Aggregating topic: ${topicId}`);
    console.log(`Laws to aggregate: ${topic.laws.length}`);

    // 1. Load all law files
    const lawContents = await Promise.all(
      topic.laws.map(async (lawRef) => {
        const law = this.db.getLaw(lawRef.lawId);
        if (!law) {
          throw new Error(`Law ${lawRef.lawId} not found`);
        }

        // Load feature, rules for this law
        const featurePath = this.resolveCurrentFile(
          law.fileLocation,
          'feature'
        );
        const rulesPath = this.resolveCurrentFile(
          law.fileLocation.replace('features/', 'src/rules/'),
          'ts'
        );

        return {
          lawId: law.lawId,
          type: lawRef.type,
          version: law.currentVersion,
          law,
          feature: fs.existsSync(featurePath)
            ? fs.readFileSync(featurePath, 'utf-8')
            : null,
          rules: fs.existsSync(rulesPath)
            ? fs.readFileSync(rulesPath, 'utf-8')
            : null
        };
      })
    );

    // 2. Generate aggregated scrape ID
    const scrapeDate = new Date().toISOString().split('T')[0];
    const scrapeId = `scrape-${scrapeDate}-001`;  // TODO: Better sequence

    // 3. Merge features
    const aggregatedFeature = await this.mergeFeatures(topicId, lawContents);

    // 4. Merge rules
    const aggregatedRules = await this.mergeRules(topicId, lawContents);

    // 5. Optionally merge workflows
    const aggregatedWorkflow = await this.mergeWorkflows(topicId, lawContents);

    // 6. Save aggregated files
    const basePath = path.join(
      process.cwd(),
      'features',
      'benefits',
      topicId,
      'aggregated'
    );
    
    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }

    const featurePath = path.join(basePath, `${scrapeId}.feature`);
    const currentFeaturePath = path.join(basePath, 'current.feature');
    
    fs.writeFileSync(featurePath, aggregatedFeature, 'utf-8');
    
    // Symlink or copy to current.feature
    if (fs.existsSync(currentFeaturePath)) {
      fs.unlinkSync(currentFeaturePath);
    }
    fs.symlinkSync(path.basename(featurePath), currentFeaturePath);

    // Same for rules
    const rulesBasePath = path.join(
      process.cwd(),
      'src',
      'rules',
      'benefits',
      topicId,
      'aggregated'
    );
    
    if (!fs.existsSync(rulesBasePath)) {
      fs.mkdirSync(rulesBasePath, { recursive: true });
    }

    const rulesPath = path.join(rulesBasePath, `${scrapeId}.ts`);
    const currentRulesPath = path.join(rulesBasePath, 'current.ts');
    
    fs.writeFileSync(rulesPath, aggregatedRules, 'utf-8');
    
    if (fs.existsSync(currentRulesPath)) {
      fs.unlinkSync(currentRulesPath);
    }
    fs.symlinkSync(path.basename(rulesPath), currentRulesPath);

    // 7. Update topic metadata
    this.db.updateTopic(topicId, {
      aggregatedCurrentVersion: scrapeId,
      lastAggregated: scrapeDate
    });

    return {
      topicId,
      scrapeId,
      files: {
        feature: featurePath,
        rules: rulesPath,
        workflow: aggregatedWorkflow ? path.join(rulesBasePath, `${scrapeId}Machine.ts`) : undefined
      },
      lawVersions: lawContents.map(lc => ({
        lawId: lc.lawId,
        version: lc.version,
        type: lc.type
      }))
    };
  }

  /**
   * Merge multiple feature files into one
   */
  private async mergeFeatures(
    topicId: string,
    lawContents: Array<{
      lawId: string;
      type: string;
      version: string;
      law: LawMetadata;
      feature: string | null;
      rules: string | null;
    }>
  ): Promise<string> {
    const features = lawContents.filter(lc => lc.feature).map(lc => ({
      lawId: lc.lawId,
      type: lc.type,
      title: lc.law.title,
      content: lc.feature!
    }));

    if (features.length === 0) {
      throw new Error(`No features found for topic ${topicId}`);
    }

    // Use Claude to intelligently merge features
    const prompt = `You are merging multiple Gherkin feature files into a single aggregated feature for the topic "${topicId}".

INPUT FEATURES:
${features.map((f, i) => `
=== FEATURE ${i + 1}: ${f.title} (${f.type}) ===
${f.content}
`).join('\n')}

OUTPUT REQUIREMENTS:
1. Create a single Gherkin feature file that combines ALL scenarios from ALL input features
2. Keep the primary law as the main feature
3. Add scenarios from implementing/amendment laws as additional scenarios
4. Preserve all metadata (version, source URLs, etc.)
5. Group scenarios logically:
   - Primary eligibility (from primary law)
   - Amounts and calculations (from implementing + indexation laws)
   - Special cases (from amendments)
6. Use tags to mark scenario sources: @primary, @implementing, @indexation, @amendment
7. Maintain proper Gherkin syntax
8. Include metadata header with all law sources

CRITICAL: Return ONLY the Gherkin feature content, NO markdown code blocks.

Start directly with: # language: fr`;

    const response = await this.claudeClient.callClaudeAPI(prompt, { maxTokens: 8000 });
    
    // Strip markdown if present
    return this.stripMarkdown(response);
  }

  /**
   * Merge multiple rules files into one
   */
  private async mergeRules(
    topicId: string,
    lawContents: Array<{
      lawId: string;
      type: string;
      version: string;
      law: LawMetadata;
      feature: string | null;
      rules: string | null;
    }>
  ): Promise<string> {
    const rules = lawContents.filter(lc => lc.rules).map(lc => ({
      lawId: lc.lawId,
      type: lc.type,
      title: lc.law.title,
      content: lc.rules!
    }));

    if (rules.length === 0) {
      throw new Error(`No rules found for topic ${topicId}`);
    }

    // Use Claude to intelligently merge rules
    const prompt = `You are merging multiple TypeScript rule files (using json-rules-engine) into a single aggregated rule file for the topic "${topicId}".

INPUT RULES:
${rules.map((r, i) => `
=== RULE FILE ${i + 1}: ${r.title} (${r.type}) ===
${r.content.substring(0, 5000)}
`).join('\n')}

OUTPUT REQUIREMENTS:
1. Create a single TypeScript file that combines ALL rules from ALL input files
2. Merge imports
3. Combine metadata (list all law sources)
4. Merge all engine.addRule() calls
5. Combine calculation functions (if they have different names, keep all; if same name, merge logic)
6. Keep consistent naming
7. Ensure TypeScript compiles
8. Preserve all legal references

STRUCTURE:
\`\`\`typescript
/** Aggregated rules for ${topicId} */
import { Engine } from 'json-rules-engine';
// ... other imports

/** Metadata */
export const ${topicId.toUpperCase()}_AGGREGATED_METADATA = {
  version: "...",
  laws: [
    // List all laws
  ]
};

// Rule functions
export async function create${topicId.charAt(0).toUpperCase() + topicId.slice(1)}AggregatedEngine() {
  const engine = new Engine();
  
  // Rules from primary law
  engine.addRule({ ... });
  
  // Rules from implementing laws
  engine.addRule({ ... });
  
  // Rules from indexation
  engine.addRule({ ... });
  
  return engine;
}

// Calculation functions
export function calculate${topicId.charAt(0).toUpperCase() + topicId.slice(1)}Amount(...) {
  // Combined logic
}

export const _RULES_JSON = [...];
\`\`\`

CRITICAL: Return ONLY TypeScript code, NO markdown code blocks. Start directly with: /**`;

    const response = await this.claudeClient.callClaudeAPI(prompt, { maxTokens: 8000 });
    
    // Strip markdown if present
    return this.stripMarkdown(response);
  }

  /**
   * Merge workflows (if needed)
   */
  private async mergeWorkflows(
    topicId: string,
    lawContents: Array<any>
  ): Promise<string | null> {
    // For now, most topics don't need workflows
    // Only conversion pipeline has a workflow
    return null;
  }

  /**
   * Resolve path to current version of a file
   */
  private resolveCurrentFile(basePath: string, extension: string): string {
    const currentPath = path.join(process.cwd(), basePath, `current.${extension}`);
    
    // Check if it's a symlink
    if (fs.existsSync(currentPath)) {
      if (fs.lstatSync(currentPath).isSymbolicLink()) {
        const targetPath = fs.readlinkSync(currentPath);
        return path.join(path.dirname(currentPath), targetPath);
      }
      return currentPath;
    }
    
    // Fallback: look for any file in directory
    const dirPath = path.join(process.cwd(), basePath);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath).filter(f => f.endsWith(`.${extension}`));
      if (files.length > 0) {
        return path.join(dirPath, files[0]);
      }
    }
    
    return currentPath;  // Return expected path even if doesn't exist
  }

  /**
   * Strip markdown code blocks
   */
  private stripMarkdown(content: string): string {
    // Remove opening markdown fence
    content = content.replace(/^```(?:gherkin|typescript|ts)?\s*\n/, '');
    
    // Remove closing markdown fence
    content = content.replace(/\n```\s*$/, '');
    
    return content.trim();
  }
}

