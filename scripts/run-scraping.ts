/**
 * CLI Script: Run Scraping for All Laws
 * 
 * Usage:
 *   npm run scrape              # Scrape all laws that are due
 *   npm run scrape -- ris       # Scrape only RIS laws
 *   npm run scrape -- --dry-run # Dry run mode
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { ClaudeAPIClient } from '../ai/claudeAPIClient';
import { LawManagementOrchestrator } from '../database/lawManagementOrchestrator';
import { getDatabaseService } from '../database/registryService';

// Load environment variables
const envPath = path.join(process.cwd(), '.env.local');
const envLocalExists = require('fs').existsSync(envPath);

if (envLocalExists) {
  dotenv.config({ path: envPath });
  console.log('✅ Loaded .env.local');
} else {
  dotenv.config();
  console.log('✅ Loaded .env');
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const topicFilter = args.find(arg => !arg.startsWith('--'));

  console.log('\n🚀 Law Scraping Pipeline\n');
  console.log(`Date: ${new Date().toISOString()}`);
  if (dryRun) {
    console.log('[DRY RUN MODE - No changes will be made]\n');
  }

  // Initialize services
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not found. Set it in .env.local or .env');
  }

  const claudeClient = new ClaudeAPIClient({
    apiKey,
    model: 'claude-opus-4-5',
    maxTokens: 8000
  });

  const orchestrator = new LawManagementOrchestrator(claudeClient);
  const db = getDatabaseService();

  // Get laws to scrape
  let lawIds: string[];
  
  if (topicFilter) {
    console.log(`Filtering by topic: ${topicFilter}\n`);
    lawIds = db.getLawsByTopic(topicFilter).map(law => law.lawId);
  } else {
    lawIds = orchestrator.getLawsToScrape();
  }

  if (lawIds.length === 0) {
    console.log('✅ No laws need scraping today.');
    return;
  }

  console.log(`Laws to scrape: ${lawIds.length}`);
  lawIds.forEach(id => console.log(`  - ${id}`));
  console.log('');

  // Process each law
  for (const lawId of lawIds) {
    try {
      if (dryRun) {
        console.log(`\n[DRY RUN] Would scrape: ${lawId}`);
      } else {
        await orchestrator.processScraping(lawId, {
          skipGeneration: false,
          skipAggregation: false
        });

        // Schedule next scraping
        orchestrator.scheduleNextScraping(lawId);
      }
    } catch (error) {
      console.error(`\n❌ Failed to process ${lawId}:`, error);
    }
  }

  console.log('\n✅ Scraping pipeline completed!\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });

