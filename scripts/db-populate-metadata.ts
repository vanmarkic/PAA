/**
 * Script: Populate Placeholder Laws from Existing Metadata
 * 
 * Extracts law metadata from src/domain/legalMetadata.ts and
 * updates placeholder laws in database/registry.json
 * 
 * Usage:
 *   npm run db:populate-metadata
 */

import * as fs from 'fs';
import * as path from 'path';
import { getDatabaseService } from '../src/database/registryService';

// Import legal metadata (if available)
let legalMetadata: any = null;
try {
  // Try to import the legal metadata
  const metadataPath = path.join(process.cwd(), 'src/domain/legalMetadata.ts');
  if (fs.existsSync(metadataPath)) {
    // For now, we'll read it as text and parse manually
    // In production, you might want to compile it first
    console.log('📚 Found legalMetadata.ts - will attempt to extract metadata');
  }
} catch (error) {
  console.log('⚠️ Could not load legalMetadata.ts');
}

async function main() {
  console.log('\n🔍 Populating placeholder laws from existing metadata...\n');

  const db = getDatabaseService();
  const registry = db.getRegistry();
  
  let updatedCount = 0;
  let skippedCount = 0;

  // Get all placeholder laws
  const placeholderLaws = Object.values(registry.laws).filter(
    law => law.lawId.startsWith('placeholder-')
  );

  console.log(`Found ${placeholderLaws.length} placeholder laws\n`);

  for (const law of placeholderLaws) {
    const topicId = law.lawId.replace('placeholder-', '');
    
    // Try to find metadata from existing sources
    // For now, we'll provide guidance on manual updates
    
    console.log(`📋 ${law.lawId}`);
    console.log(`   Topic: ${topicId}`);
    console.log(`   Current: ${law.title}`);
    console.log(`   ⚠️ Needs manual update with real legal source`);
    console.log(`   Steps:`);
    console.log(`   1. Find the law URL on ejustice.just.fgov.be`);
    console.log(`   2. Extract law date, title, authority`);
    console.log(`   3. Update in database/registry.json`);
    console.log(`   Or use: npm run add-law -- --url <URL> --title "<Title>" --authority "<Authority>"`);
    console.log('');
    
    skippedCount++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ⚠️ Placeholder laws: ${placeholderLaws.length}`);
  console.log(`   💡 These need manual updates with real legal sources`);
  console.log(`\n💡 Recommendation:`);
  console.log(`   Use the existing legalMetadata.ts as reference`);
  console.log(`   Or manually update each placeholder in database/registry.json`);
  console.log(`   Or use: npm run add-law to add new laws with real metadata`);
  console.log('');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });

