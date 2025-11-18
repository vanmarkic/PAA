/**
 * Main Orchestrator for Law Management Pipeline
 * 
 * Orchestrates:
 * 1. Scraping → Change Detection
 * 2. Change Summary (if changed)
 * 3. Generation (if changed)
 * 4. Topic Aggregation (for affected topics)
 */

import { getDatabaseService } from './registryService';
import { getScrapingService, ScrapingResult } from './scrapingService';
import { ChangeSummaryService } from './changeSummaryService';
import { TopicAggregationService } from './aggregationService';
import { ClaudeAPIClient } from '../ai/claudeAPIClient';
import { PipelineOrchestrator } from '../ai/pipelineOrchestrator';

export interface ProcessScrapingOptions {
  skipGeneration?: boolean;
  skipAggregation?: boolean;
}

export class LawManagementOrchestrator {
  private db = getDatabaseService();
  private scrapingService = getScrapingService();
  private changeSummaryService: ChangeSummaryService;
  private aggregationService: TopicAggregationService;
  private pipelineOrchestrator: PipelineOrchestrator;

  constructor(private claudeClient: ClaudeAPIClient) {
    this.changeSummaryService = new ChangeSummaryService(claudeClient);
    this.aggregationService = new TopicAggregationService(claudeClient);
    this.pipelineOrchestrator = new PipelineOrchestrator(claudeClient);
  }

  /**
   * Process a scraping result
   * 
   * Flow:
   * 1. Scrape law → detect changes (hash)
   * 2. If changed:
   *    a. Generate change summary (Claude)
   *    b. Generate new feature/rules/workflow files (Claude + pipeline)
   *    c. Update all affected topics (aggregation)
   * 3. If not changed:
   *    - Just save scraping metadata
   */
  async processScraping(
    lawId: string,
    options: ProcessScrapingOptions = {}
  ): Promise<void> {
    console.log(`\n🔍 Processing scraping for law: ${lawId}`);

    // 1. Scrape and detect changes
    const result = await this.scrapingService.scrapeLaw(lawId);
    const { scraping, content, detectedChanges } = result;

    console.log(`   Hash: ${scraping.changeDetection.hash.substring(0, 16)}...`);
    console.log(`   Previous: ${scraping.changeDetection.previousHash?.substring(0, 16) || 'N/A'}...`);
    console.log(`   Changes detected: ${detectedChanges ? '✅ YES' : '❌ NO'}`);

    if (!detectedChanges) {
      console.log('   No changes, skipping generation and aggregation.');
      return;
    }

    // 2. Generate change summary
    console.log('\n📝 Generating change summary...');
    const previousContent = await this.scrapingService.getPreviousContent(
      lawId,
      scraping.parentScrapeId
    );

    const changeSummary = await this.changeSummaryService.generateChangeSummary(
      scraping,
      content,
      previousContent
    );

    if (changeSummary) {
      scraping.changeSummary = changeSummary;
      this.db.saveScraping(lawId, scraping);
      
      console.log(`   ✅ Change summary generated:`);
      console.log(`      Type: ${changeSummary.changeType}`);
      console.log(`      Impact: ${changeSummary.impact}`);
      console.log(`      Summary: ${changeSummary.summary}`);
    }

    // 3. Generate files (if not skipped)
    if (!options.skipGeneration) {
      console.log('\n🔧 Generating feature/rules/workflow files...');
      
      const law = this.db.getLaw(lawId);
      if (!law) {
        throw new Error(`Law ${lawId} not found`);
      }

      try {
        const generationResult = await this.pipelineOrchestrator.processNewLaw({
          url: law.url,
          title: law.title,
          authority: law.authority,
          text: content  // Use scraped content
        });

        if (generationResult.success) {
          scraping.generation = {
            generated: true,
            generatedAt: new Date().toISOString(),
            files: {
              feature: generationResult.files?.feature,
              rules: generationResult.files?.rules,
              workflow: generationResult.files?.workflow
            },
            pipelineVersion: '2.0.0'
          };
          this.db.saveScraping(lawId, scraping);
          
          console.log(`   ✅ Files generated:`);
          console.log(`      Feature: ${generationResult.files?.feature}`);
          console.log(`      Rules: ${generationResult.files?.rules}`);
          if (generationResult.files?.workflow) {
            console.log(`      Workflow: ${generationResult.files?.workflow}`);
          }
        }
      } catch (error) {
        console.error(`   ❌ Generation failed:`, error);
      }
    }

    // 4. Update affected topics (if not skipped)
    if (!options.skipAggregation) {
      console.log('\n📦 Updating affected topics...');
      
      const affectedTopics = this.db.getAffectedTopics(lawId);
      console.log(`   Topics to update: ${affectedTopics.length}`);
      
      for (const topic of affectedTopics) {
        console.log(`\n   → Aggregating topic: ${topic.topicId}`);
        
        try {
          const aggregationResult = await this.aggregationService.aggregateTopic(
            topic.topicId
          );
          
          console.log(`      ✅ Aggregation complete: ${aggregationResult.scrapeId}`);
          console.log(`      Feature: ${aggregationResult.files.feature}`);
          console.log(`      Rules: ${aggregationResult.files.rules}`);
        } catch (error) {
          console.error(`      ❌ Aggregation failed:`, error);
        }
      }
    }

    console.log('\n✅ Scraping processing complete!');
  }

  /**
   * Schedule next scraping for a law
   */
  scheduleNextScraping(lawId: string): void {
    const law = this.db.getLaw(lawId);
    if (!law) {
      throw new Error(`Law ${lawId} not found`);
    }

    const lastScraped = new Date(law.lastScraped);
    let nextScrape: Date;

    if (law.scrapingFrequency === 'weekly') {
      nextScrape = new Date(lastScraped);
      nextScrape.setDate(nextScrape.getDate() + 7);
    } else {  // monthly
      nextScrape = new Date(lastScraped);
      nextScrape.setMonth(nextScrape.getMonth() + 1);
    }

    this.db.updateLaw(lawId, {
      nextScrapeScheduled: nextScrape.toISOString().split('T')[0]
    });

    console.log(`Next scraping scheduled for ${law.lawId}: ${nextScrape.toISOString().split('T')[0]}`);
  }

  /**
   * Get laws that need scraping
   */
  getLawsToScrape(): string[] {
    const today = new Date().toISOString().split('T')[0];
    const allLaws = Object.values(this.db.getAllLaws());
    
    return allLaws
      .filter(law => law.nextScrapeScheduled <= today)
      .map(law => law.lawId);
  }
}

