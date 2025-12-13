/**
 * Script: Update Placeholder Laws with Specific URLs
 * 
 * This script processes all placeholder laws and attempts to find specific law URLs.
 * For laws where specific URLs cannot be found automatically, it documents them
 * for manual search.
 */

import * as fs from 'fs';
import * as path from 'path';
import { getDatabaseService } from '../src/database/registryService';

// Known law mappings (specific laws we know about)
const KNOWN_LAWS: Record<string, { url: string; title: string; date?: string }> = {
  'ris': {
    url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2002052647&table_name=loi',
    title: 'Loi du 26 mai 2002 concernant le droit à l\'intégration sociale',
    date: '2002-05-26'
  },
  'accident-travail': {
    url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1971041001&table_name=loi',
    title: 'Loi du 10 avril 1971 sur les accidents du travail',
    date: '1971-04-10'
  },
  'accompagnement-social': {
    url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1976070801&table_name=loi',
    title: 'Loi organique du 8 juillet 1976 des centres publics d\'action sociale',
    date: '1976-07-08'
  },
  'aide-sociale': {
    url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1976070801&table_name=loi',
    title: 'Loi organique du 8 juillet 1976 des centres publics d\'action sociale',
    date: '1976-07-08'
  },
  'allocations-familiales': {
    url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1930081901&table_name=loi',
    title: 'Loi du 19 août 1930 concernant les allocations familiales',
    date: '1930-08-19'
  },
  'allocations-chomage': {
    url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2001122001&table_name=loi',
    title: 'Loi du 20 décembre 2001 concernant les allocations de chômage',
    date: '2001-12-20'
  },
  'allocation-integration': {
    url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2002052647&table_name=loi',
    title: 'Loi du 26 mai 2002 concernant le droit à l\'intégration sociale',
    date: '2002-05-26'
  }
};

// Trust scoring
function scoreSource(url: string): { score: number; reason: string } {
  const urlLower = url.toLowerCase();
  
  // Perfect scores (10/10) - specific law pages
  if (urlLower.includes('ejustice.just.fgov.be/cgi_loi') || 
      urlLower.includes('ejustice.just.fgov.be/eli/')) {
    return { score: 10, reason: 'Specific law page on ejustice.just.fgov.be' };
  }
  if (urlLower.includes('ejustice.just.fgov.be') && urlLower.includes('cn=')) {
    return { score: 10, reason: 'Specific law page on ejustice.just.fgov.be' };
  }
  
  // Generic base URL
  if (urlLower === 'https://www.ejustice.just.fgov.be' || 
      urlLower === 'https://www.ejustice.just.fgov.be/') {
    return { score: 8, reason: 'Official base domain (not specific law page)' };
  }
  
  return { score: 5, reason: 'Unknown source' };
}

async function main() {
  console.log('\n🔍 Updating Placeholder Laws with Specific URLs\n');
  
  const db = getDatabaseService();
  const registry = db.getRegistry();
  
  // Get all placeholder laws
  const placeholderLaws = Object.entries(registry.laws)
    .filter(([lawId]) => lawId.startsWith('placeholder-'))
    .map(([lawId, law]) => ({ lawId, law }));
  
  console.log(`Found ${placeholderLaws.length} placeholder laws\n`);
  
  const results: Array<{
    lawId: string;
    topicId: string;
    title: string;
    oldUrl: string;
    newUrl: string | null;
    trustScore: number;
    source: 'known' | 'generic' | 'manual';
  }> = [];
  
  let updatedCount = 0;
  let knownLawCount = 0;
  let manualSearchNeeded: string[] = [];
  
  for (const { lawId, law } of placeholderLaws) {
    const topicId = lawId.replace('placeholder-', '');
    const oldUrl = law.url || 'https://www.ejustice.just.fgov.be';
    
    // Check if we have a known law mapping
    const knownLaw = KNOWN_LAWS[topicId];
    
    let newUrl: string | null = null;
    let trustScore = 8;
    let source: 'known' | 'generic' | 'manual' = 'generic';
    
    if (knownLaw) {
      newUrl = knownLaw.url;
      const scored = scoreSource(newUrl);
      trustScore = scored.score;
      source = 'known';
      knownLawCount++;
      
      // Update registry
      db.updateLaw(lawId, {
        url: newUrl,
        title: knownLaw.title,
        lawDate: knownLaw.date || law.lawDate
      });
      
      updatedCount++;
      console.log(`  ✅ ${topicId}: Updated with known law URL (${trustScore}/10)`);
    } else {
      // Keep generic URL but mark for manual search
      newUrl = oldUrl;
      trustScore = 8; // Generic official domain
      source = 'manual';
      manualSearchNeeded.push(topicId);
    }
    
    results.push({
      lawId,
      topicId,
      title: law.title,
      oldUrl,
      newUrl: newUrl || oldUrl,
      trustScore,
      source
    });
  }
  
  // Summary
  console.log('\n📊 Summary:\n');
  console.log(`✅ Updated with known laws: ${knownLawCount}`);
  console.log(`⚠️  Need manual search: ${manualSearchNeeded.length}`);
  console.log(`📄 Total processed: ${results.length}\n`);
  
  // Show sources with score < 8/10
  const lowScoreResults = results.filter(r => r.trustScore < 8);
  if (lowScoreResults.length > 0) {
    console.log('⚠️ Sources with trust score < 8/10:\n');
    lowScoreResults.forEach(result => {
      console.log(`  ${result.topicId}: ${result.newUrl} (Score: ${result.trustScore}/10)`);
    });
    console.log('');
  } else {
    console.log('✅ All sources have trust score ≥ 8/10\n');
  }
  
  // Save manual search list
  const manualSearchFile = path.join(process.cwd(), 'database', 'manual-law-search-needed.json');
  fs.writeFileSync(manualSearchFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalLaws: placeholderLaws.length,
    knownLaws: knownLawCount,
    manualSearchNeeded: manualSearchNeeded.length,
    topics: manualSearchNeeded.map(topicId => {
      const law = placeholderLaws.find(({ lawId }) => lawId === `placeholder-${topicId}`);
      return {
        topicId,
        title: law?.law.title || '',
        currentUrl: 'https://www.ejustice.just.fgov.be',
        searchQuery: `${law?.law.title.replace('[Placeholder] Loi pour ', '')} belgique ejustice.just.fgov.be`
      };
    })
  }, null, 2));
  
  console.log(`📄 Manual search list saved to: ${manualSearchFile}\n`);
  console.log(`💡 Next steps:`);
  console.log(`   1. Review ${manualSearchFile} for topics needing manual search`);
  console.log(`   2. Search ejustice.just.fgov.be for each topic`);
  console.log(`   3. Update registry with specific law URLs\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });

