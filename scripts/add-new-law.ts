#!/usr/bin/env ts-node
/**
 * Add New Law Pipeline
 * 
 * Complete pipeline to add a new law:
 * 1. Extract legal source
 * 2. Generate Gherkin feature
 * 3. Generate rules
 * 4. Generate machine (if needed)
 * 5. Generate metadata & lineage
 * 
 * Usage:
 *   npm run add-law -- --url="https://..."
 *   npm run add-law -- --text="..." --title="..." --authority="..."
 */

// Load environment variables from .env.local or .env
import * as fs from 'fs';
import * as path from 'path';

// Try to load .env.local first, then .env
const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');

if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
} else if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

import { ClaudeAPIClient, ClaudeAPIConfig } from '../src/ai/claudeAPIClient';
import { PipelineOrchestrator, PipelineInput } from '../src/ai/pipelineOrchestrator';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: npm run add-law -- --url="https://..." or --text="..."');
    console.error('');
    console.error('Options:');
    console.error('  --url="https://..."          URL to legal source');
    console.error('  --text="..."                 Legal text content');
    console.error('  --title="..."                Law title (required if using --text)');
    console.error('  --authority="SPF|ONEM|..."   Authority (required if using --text)');
    process.exit(1);
  }

  // Parse arguments
  const url = args.find(a => a.startsWith('--url='))?.split('=')[1]?.replace(/^["']|["']$/g, '');
  const text = args.find(a => a.startsWith('--text='))?.split('=')[1]?.replace(/^["']|["']$/g, '');
  const title = args.find(a => a.startsWith('--title='))?.split('=')[1]?.replace(/^["']|["']$/g, '');
  const authority = args.find(a => a.startsWith('--authority='))?.split('=')[1]?.replace(/^["']|["']$/g, '');

  if (!url && !text) {
    console.error('❌ Either --url or --text must be provided');
    process.exit(1);
  }

  if (text && (!title || !authority)) {
    console.error('❌ When using --text, both --title and --authority are required');
    process.exit(1);
  }

  // Get API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY environment variable not set');
    console.error('');
    console.error('Please set it in one of these ways:');
    console.error('  1. Export as environment variable:');
    console.error('     export ANTHROPIC_API_KEY="your-api-key"');
    console.error('');
    console.error('  2. Create .env.local file with:');
    console.error('     ANTHROPIC_API_KEY=your-api-key');
    console.error('');
    console.error('  3. Create .env file with:');
    console.error('     ANTHROPIC_API_KEY=your-api-key');
    console.error('');
    console.error('Note: .env.local takes precedence over .env');
    process.exit(1);
  }

  // Create Claude client and orchestrator
  const config: ClaudeAPIConfig = {
    apiKey,
    model: 'claude-opus-4-1',
    maxTokens: 4096,
  };

  const claudeClient = new ClaudeAPIClient(config);
  const orchestrator = new PipelineOrchestrator(claudeClient, config);

  // Prepare input
  const input: PipelineInput = {
    url,
    text,
    title,
    authority,
  };

  try {
    console.log('🚀 Starting pipeline...\n');
    
    const result = await orchestrator.processNewLaw(input);

    console.log('\n✅ Success! Generated:');
    console.log(`   📄 Feature: ${result.feature.filePath}`);
    console.log(`   ⚙️  Rules: ${result.rules.filePath}`);
    if (result.machine) {
      console.log(`   🤖 Machine: ${result.machine.filePath}`);
    }

    if (result.compliance.overallStatus !== 'compliant') {
      console.log('\n⚠️  Human review recommended');
      console.log('   Issues:', result.compliance.issues.join(', '));
      console.log('   Recommendations:', result.compliance.recommendations.join(', '));
    } else {
      console.log('\n✅ Version compliance: OK');
    }

    console.log('\n💡 Next steps:');
    console.log('   1. Review generated files');
    console.log('   2. Update src/domain/legalMetadata.ts with legal source');
    console.log('   3. Run tests: npm test');
    console.log('   4. Check compliance: npm run check:versions');
  } catch (error) {
    console.error('\n❌ Pipeline failed:', error);
    if (error instanceof Error) {
      console.error('   Error:', error.message);
      if (error.stack) {
        console.error('   Stack:', error.stack);
      }
    }
    process.exit(1);
  }
}

main();

