/**
 * Script: Find Specific Law URLs for All Placeholder Laws
 * 
 * Processes all placeholder laws in batches, searches for specific Belgian law URLs,
 * scores them, and updates the registry.
 */

import * as fs from 'fs';
import * as path from 'path';
import { getDatabaseService } from '../src/database/registryService';

interface SourceResult {
  lawId: string;
  topicId: string;
  title: string;
  foundSources: Array<{
    url: string;
    title: string;
    trustScore: number;
    reason: string;
  }>;
  bestSource: {
    url: string;
    title: string;
    trustScore: number;
    reason: string;
  } | null;
}

// Trust scoring rules
function scoreSource(url: string): { score: number; reason: string } {
  const urlLower = url.toLowerCase();
  
  // Perfect scores (10/10) - specific law pages on ejustice
  if (urlLower.includes('ejustice.just.fgov.be/cgi_loi') || 
      urlLower.includes('ejustice.just.fgov.be/eli/')) {
    return { score: 10, reason: 'Specific law page on ejustice.just.fgov.be' };
  }
  if (urlLower.includes('ejustice.just.fgov.be') && urlLower.includes('cn=')) {
    return { score: 10, reason: 'Specific law page on ejustice.just.fgov.be' };
  }
  if (urlLower.includes('etaamb.openjustice.be')) {
    return { score: 10, reason: 'Official Open Justice platform (etaamb.openjustice.be)' };
  }
  
  // High scores (9/10)
  if (urlLower.includes('moniteur.be') || urlLower.includes('mb.cfwb.be')) {
    return { score: 9, reason: 'Official Moniteur Belge (Belgian Official Gazette)' };
  }
  if (urlLower.includes('justice.belgium.be')) {
    return { score: 9, reason: 'Official Belgian Justice website' };
  }
  
  // Very good scores (8/10)
  if (urlLower.includes('spf-') || urlLower.includes('fps-')) {
    return { score: 8, reason: 'Federal Public Service website' };
  }
  if (urlLower.includes('belgium.be') && (urlLower.includes('.gov') || urlLower.includes('/fr/'))) {
    return { score: 8, reason: 'Official Belgian government website' };
  }
  if (urlLower.includes('wallonie.be') || urlLower.includes('vlaanderen.be') || urlLower.includes('bruxelles.be')) {
    return { score: 8, reason: 'Official regional government website' };
  }
  
  // Good scores (7/10)
  if (urlLower.includes('onem.be') || urlLower.includes('rva.be')) {
    return { score: 7, reason: 'Official employment agency website' };
  }
  if (urlLower.includes('sfpd.fgov.be') || urlLower.includes('pensions.belgium.be')) {
    return { score: 7, reason: 'Official pensions service website' };
  }
  
  // Medium scores (6/10)
  if (urlLower.includes('wikipedia.org')) {
    return { score: 6, reason: 'Wikipedia (good reference but not official)' };
  }
  if (urlLower.includes('droitbelge.be') || urlLower.includes('juridat.be')) {
    return { score: 6, reason: 'Legal database (commercial but reliable)' };
  }
  
  // Low scores (3-5/10)
  if (urlLower.includes('blog') || urlLower.includes('forum')) {
    return { score: 3, reason: 'Blog or forum (not official source)' };
  }
  
  // Generic base URL (not specific law page)
  if (urlLower === 'https://www.ejustice.just.fgov.be' || 
      urlLower === 'https://www.ejustice.just.fgov.be/') {
    return { score: 5, reason: 'Generic base URL (not specific law page)' };
  }
  
  // Default: medium-low
  return { score: 5, reason: 'Unknown source - needs verification' };
}

// Extract URLs from web search results
function extractUrlsFromSearchResult(result: any): string[] {
  const urls: string[] = [];
  
  if (!result) return urls;
  
  // Check if result has Content field (web_search tool format)
  if (result.Content) {
    const content = result.Content;
    const urlRegex = /https?:\/\/[^\s\)]+/g;
    const matches = content.match(urlRegex) || [];
    urls.push(...matches.map((url: string) => url.replace(/[.,;!?]+$/, '')));
  }
  
  // Check if result has Title field with URL
  if (result.Title) {
    const title = result.Title;
    const urlRegex = /https?:\/\/[^\s\)]+/g;
    const matches = title.match(urlRegex) || [];
    urls.push(...matches.map((url: string) => url.replace(/[.,;!?]+$/, '')));
  }
  
  return urls;
}

// Filter to only Belgian official sources
function isBelgianOfficialSource(url: string): boolean {
  const urlLower = url.toLowerCase();
  return urlLower.includes('ejustice.just.fgov.be') ||
         urlLower.includes('etaamb.openjustice.be') ||
         urlLower.includes('moniteur.be') ||
         urlLower.includes('mb.cfwb.be') ||
         urlLower.includes('belgium.be') ||
         urlLower.includes('spf-') ||
         urlLower.includes('fps-') ||
         urlLower.includes('wallonie.be') ||
         urlLower.includes('vlaanderen.be') ||
         urlLower.includes('bruxelles.be') ||
         urlLower.includes('onem.be') ||
         urlLower.includes('rva.be') ||
         urlLower.includes('sfpd.fgov.be');
}

async function processPlaceholderLaw(
  lawId: string,
  law: any,
  webSearchFn: (query: string) => Promise<any>
): Promise<SourceResult> {
  const topicId = lawId.replace('placeholder-', '');
  const topicName = law.title.replace('[Placeholder] Loi pour ', '');
  
  // Build search queries (Belgian-specific, looking for specific law pages)
  const queries = [
    `${topicName} belgique loi arrêté ejustice.just.fgov.be cgi_loi`,
    `${topicName} belgique moniteur belge loi arrêté royal`,
    `${topicName} belgique SPF service public fédéral arrêté`,
  ];
  
  const allUrls: string[] = [];
  
  // Search with each query in parallel
  const searchPromises = queries.map(query => webSearchFn(query));
  const searchResults = await Promise.all(searchPromises);
  
  // Extract URLs from all results
  for (const result of searchResults) {
    const urls = extractUrlsFromSearchResult(result);
    allUrls.push(...urls);
  }
  
  // Remove duplicates and filter to Belgian official sources
  const uniqueUrls = Array.from(new Set(allUrls))
    .filter(isBelgianOfficialSource)
    .filter(url => {
      // Prefer specific law pages over base URLs
      const urlLower = url.toLowerCase();
      return urlLower !== 'https://www.ejustice.just.fgov.be' &&
             urlLower !== 'https://www.ejustice.just.fgov.be/';
    });
  
  // Score each URL
  const foundSources = uniqueUrls.map(url => {
    const scored = scoreSource(url);
    return {
      url,
      title: '', // Title will be extracted from URL or search result
      trustScore: scored.score,
      reason: scored.reason
    };
  });
  
  // Sort by score (highest first)
  foundSources.sort((a, b) => b.trustScore - a.trustScore);
  
  // Best source is the highest scored one
  const bestSource = foundSources.length > 0 ? foundSources[0] : null;
  
  return {
    lawId,
    topicId,
    title: law.title,
    foundSources,
    bestSource
  };
}

async function main() {
  console.log('\n🔍 Finding Specific Law URLs for All Placeholder Laws\n');
  
  const db = getDatabaseService();
  const registry = db.getRegistry();
  
  // Get all placeholder laws
  const placeholderLaws = Object.entries(registry.laws)
    .filter(([lawId]) => lawId.startsWith('placeholder-'))
    .map(([lawId, law]) => ({ lawId, law }));
  
  console.log(`Found ${placeholderLaws.length} placeholder laws\n`);
  console.log('⚠️  This script requires web_search tool to be available.\n');
  console.log('💡 Processing will be done in parallel batches of 5 laws each.\n');
  
  // Process in parallel (batches of 5 to avoid rate limits)
  const batchSize = 5;
  const results: SourceResult[] = [];
  
  // Note: web_search function will be provided by execution context
  // For now, create placeholder
  async function performWebSearch(query: string): Promise<any> {
    // This will be replaced with actual web_search tool calls
    // The script will be run in an environment where web_search is available
    return { Content: '', Title: '' };
  }
  
  // Process all laws in batches
  for (let i = 0; i < placeholderLaws.length; i += batchSize) {
    const batch = placeholderLaws.slice(i, i + batchSize);
    
    console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(placeholderLaws.length / batchSize)} (${batch.length} laws)...`);
    
    const batchResults = await Promise.all(
      batch.map(({ lawId, law }) => {
        const topicId = lawId.replace('placeholder-', '');
        console.log(`  🔍 ${topicId}...`);
        return processPlaceholderLaw(lawId, law, performWebSearch);
      })
    );
    
    results.push(...batchResults);
    
    // Show progress
    const foundCount = batchResults.filter(r => r.bestSource && r.bestSource.trustScore >= 8).length;
    const lowScoreCount = batchResults.filter(r => r.bestSource && r.bestSource.trustScore < 8).length;
    console.log(`  ✅ Found high-trust sources (≥8/10): ${foundCount}/${batch.length}`);
    console.log(`  ⚠️  Found low-trust sources (<8/10): ${lowScoreCount}/${batch.length}`);
    
    // Small delay between batches to avoid rate limits
    if (i + batchSize < placeholderLaws.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Show results
  console.log('\n📊 Results Summary:\n');
  
  const lowScoreResults = results.filter(r => 
    r.bestSource && r.bestSource.trustScore < 8
  );
  
  const highScoreResults = results.filter(r => 
    r.bestSource && r.bestSource.trustScore >= 8
  );
  
  const noSourceResults = results.filter(r => !r.bestSource);
  
  console.log(`✅ High trust sources (≥8/10): ${highScoreResults.length}`);
  console.log(`⚠️ Low trust sources (<8/10): ${lowScoreResults.length}`);
  console.log(`❌ No source found: ${noSourceResults.length}\n`);
  
  if (lowScoreResults.length > 0) {
    console.log('⚠️ Sources with trust score < 8/10:\n');
    lowScoreResults.forEach(result => {
      console.log(`  ${result.topicId}:`);
      console.log(`    Title: ${result.title}`);
      if (result.bestSource) {
        console.log(`    Best source: ${result.bestSource.url}`);
        console.log(`    Score: ${result.bestSource.trustScore}/10 - ${result.bestSource.reason}`);
      }
      console.log('');
    });
  }
  
  // Update registry with found sources
  console.log('\n💾 Updating registry with found sources...\n');
  
  let updatedCount = 0;
  for (const result of highScoreResults) {
    if (result.bestSource) {
      const law = db.getLaw(result.lawId);
      if (law) {
        db.updateLaw(result.lawId, {
          url: result.bestSource.url,
          // Keep other fields the same
        });
        updatedCount++;
        console.log(`  ✅ Updated ${result.topicId}: ${result.bestSource.url.substring(0, 80)}...`);
      }
    }
  }
  
  console.log(`\n✅ Updated ${updatedCount} laws with official sources (score ≥8/10)`);
  console.log(`⚠️ ${results.length - updatedCount} laws still need manual review\n`);
  
  // Save results to file for review
  const resultsFile = path.join(process.cwd(), 'database', 'source-discovery-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalLaws: placeholderLaws.length,
    highScore: highScoreResults.length,
    lowScore: lowScoreResults.length,
    noSource: noSourceResults.length,
    results: results.map(r => ({
      lawId: r.lawId,
      topicId: r.topicId,
      title: r.title,
      bestSource: r.bestSource,
      allSources: r.foundSources
    }))
  }, null, 2));
  
  console.log(`📄 Detailed results saved to: ${resultsFile}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });

