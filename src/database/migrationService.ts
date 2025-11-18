/**
 * Migration Script: Existing Files → New Structure
 * 
 * Migrates existing feature/rules/workflow files to new database-driven structure:
 * 
 * OLD:
 * - features/benefits/ris.feature
 * - src/rules/risRules.ts
 * 
 * NEW:
 * - database/registry.json (central registry)
 * - features/benefits/ris/laws/loi-2002-05-26/current.feature
 * - features/benefits/ris/aggregated/current.feature
 * - src/rules/benefits/ris/laws/loi-2002-05-26/current.ts
 * - src/rules/benefits/ris/aggregated/current.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { getDatabaseService, LawMetadata, TopicMetadata } from './registryService';

interface MigrationConfig {
  dryRun?: boolean;
  verbose?: boolean;
}

export class MigrationService {
  private db = getDatabaseService();
  private workspace = process.cwd();

  /**
   * Discover all topics from rule files
   */
  private getAllTopicsFromRules(): Array<{ topicId: string; rulesPath: string; featurePath: string | null }> {
    const rulesDir = path.join(this.workspace, 'src/rules');
    if (!fs.existsSync(rulesDir)) {
      return [];
    }

    const files = fs.readdirSync(rulesDir)
      .filter(f => f.endsWith('Rules.ts') && f !== 'index.ts')
      .filter(f => f !== 'loi-du-26-mai-2002-concernant-le-droit-l-int-gratiRules.ts'); // Special case

    return files.map(f => {
      // Convert filename to topic ID
      let topicId = f.replace('Rules.ts', '');
      topicId = topicId.replace(/([A-Z])/g, '-$1').toLowerCase();
      if (topicId.startsWith('-')) {
        topicId = topicId.substring(1);
      }

      const rulesPath = path.join('src/rules', f);
      
      // Try to find corresponding feature file
      let featurePath: string | null = null;
      
      // Check common locations
      const possiblePaths = [
        `features/benefits/${topicId}.feature`,
        `features/benefits/${f.replace('Rules.ts', '.feature')}`,
        `features/tax/${topicId}.feature`,
        `features/immobilier/${topicId}.feature`,
        `features/etrangers/${topicId}.feature`,
        `features/statut-artiste/${topicId}.feature`,
        `features/recours-etat/${topicId}.feature`,
        `features/propriete-intellectuelle/${topicId}.feature`,
      ];

      for (const possiblePath of possiblePaths) {
        const fullPath = path.join(this.workspace, possiblePath);
        if (fs.existsSync(fullPath)) {
          featurePath = possiblePath;
          break;
        }
      }

      return { topicId, rulesPath, featurePath };
    });
  }

  /**
   * Get topic name from various sources
   */
  private getTopicName(topicId: string): string {
    // Try to get from registry first
    const topic = this.db.getTopic(topicId);
    if (topic) {
      return topic.name;
    }

    // Fallback: generate from topicId
    return topicId.split('-').map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ');
  }

  /**
   * Main migration function
   */
  async migrate(config: MigrationConfig = {}): Promise<void> {
    const { dryRun = false, verbose = false } = config;

    console.log('\n🚀 Starting migration to new structure...');
    if (dryRun) {
      console.log('   [DRY RUN MODE - No files will be modified]\n');
    }

    // 1. Discover all topics from rules
    console.log('📋 Discovering topics from rule files...');
    const allTopics = this.getAllTopicsFromRules();
    console.log(`   Found ${allTopics.length} topics with rules\n`);

    // 2. Migrate known topics with explicit law mappings first
    const knownTopics = new Set<string>();
    
    // RIS
    await this.migrateTopic('ris', 'Revenu d\'Intégration Sociale', [
      {
        lawId: 'loi-2002-05-26',
        title: 'Loi du 26 mai 2002 concernant le droit à l\'intégration sociale',
        lawDate: '2002-05-26',
        url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2002052647&table_name=loi',
        authority: 'Service Public Fédéral Sécurité Sociale',
        type: 'primary',
        oldFeaturePath: 'features/benefits/ris.feature',
        oldRulesPath: 'src/rules/risRules.ts'
      },
      {
        lawId: 'arrete-2002-07-11',
        title: 'Arrêté royal du 11 juillet 2002 portant règlement général en matière de droit à l\'intégration sociale',
        lawDate: '2002-07-11',
        url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&table_name=loi&cn=2002071138',
        authority: 'Service Public Fédéral Sécurité Sociale',
        type: 'implementing',
        oldFeaturePath: null,
        oldRulesPath: null
      }
    ], dryRun, verbose);
    knownTopics.add('ris');

    // AGR
    await this.migrateTopic('agr', 'Allocation de Garantie de Revenus', [
      {
        lawId: 'arrete-1991-11-25',
        title: 'Arrêté royal portant réglementation du chômage',
        lawDate: '1991-11-25',
        url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1991112550&table_name=loi',
        authority: 'Office National de l\'Emploi (ONEM)',
        type: 'primary',
        oldFeaturePath: 'features/benefits/income-guarantee.feature',
        oldRulesPath: 'src/rules/agrRules.ts'
      }
    ], dryRun, verbose);
    knownTopics.add('agr');

    // 3. Add shared indexation law
    await this.addSharedLaw({
      lawId: 'loi-1971-08-02',
      title: 'Loi du 2 août 1971 organisant un régime de liaison à l\'indice des prix à la consommation',
      lawDate: '1971-08-02',
      url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1971080201&table_name=loi',
      authority: 'SPF Économie',
      topics: ['ris', 'grapa', 'pensions', 'allocations-familiales'],
      type: 'indexation'
    }, dryRun, verbose);

    // 4. Migrate remaining topics (without explicit law mappings)
    console.log('\n📦 Migrating remaining topics (without explicit law mappings)...\n');
    
    const topicsWithIndexation = ['ris', 'grapa', 'pensions', 'allocations-familiales'];
    let migratedCount = 0;
    let skippedCount = 0;

    for (const { topicId, rulesPath, featurePath } of allTopics) {
      if (knownTopics.has(topicId)) {
        continue; // Already migrated
      }

      const topicName = this.getTopicName(topicId);
      
      // Create a placeholder law for topics without explicit law mappings
      // This allows them to be in the registry and ready for future law assignment
      const placeholderLawId = `placeholder-${topicId}`;
      
      const laws: Array<{
        lawId: string;
        title: string;
        lawDate: string;
        url: string;
        authority: string;
        type: 'primary' | 'implementing' | 'amendment' | 'indexation';
        oldFeaturePath: string | null;
        oldRulesPath: string | null;
      }> = [
        {
          lawId: placeholderLawId,
          title: `[Placeholder] Loi pour ${topicName}`,
          lawDate: new Date().toISOString().split('T')[0],
          url: 'https://www.ejustice.just.fgov.be',
          authority: 'À déterminer',
          type: 'primary',
          oldFeaturePath: featurePath,
          oldRulesPath: rulesPath
        }
      ];

      // Add indexation law if applicable
      if (topicsWithIndexation.includes(topicId)) {
        laws.push({
          lawId: 'loi-1971-08-02',
          title: 'Loi du 2 août 1971 organisant un régime de liaison à l\'indice des prix à la consommation',
          lawDate: '1971-08-02',
          url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1971080201&table_name=loi',
          authority: 'SPF Économie',
          type: 'indexation',
          oldFeaturePath: null,
          oldRulesPath: null
        });
      }

      try {
        await this.migrateTopic(topicId, topicName, laws, dryRun, verbose);
        migratedCount++;
      } catch (error) {
        console.log(`   ⚠️ Skipped ${topicId}: ${error instanceof Error ? error.message : String(error)}`);
        skippedCount++;
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Migrated: ${migratedCount + knownTopics.size} topics`);
    console.log(`   ⚠️ Skipped: ${skippedCount} topics`);
    console.log(`   📋 Total discovered: ${allTopics.length} topics`);

    console.log('\n✅ Migration complete!');
    console.log('\nNext steps:');
    console.log('1. Review the generated registry.json');
    console.log('2. Update placeholder laws with real legal sources');
    console.log('3. Run aggregation for each topic');
    console.log('4. Test the new structure');
  }

  /**
   * Migrate a single topic
   */
  private async migrateTopic(
    topicId: string,
    topicName: string,
    laws: Array<{
      lawId: string;
      title: string;
      lawDate: string;
      url: string;
      authority: string;
      type: 'primary' | 'implementing' | 'amendment' | 'indexation';
      oldFeaturePath: string | null;
      oldRulesPath: string | null;
    }>,
    dryRun: boolean,
    verbose: boolean
  ): Promise<void> {
    console.log(`\n📂 Migrating topic: ${topicId} (${topicName})`);

    const today = new Date().toISOString().split('T')[0];
    const scrapeId = `scrape-${today}-001`;

    // 1. Create topic in registry
    const topicMetadata: TopicMetadata = {
      topicId,
      name: topicName,
      laws: [],
      aggregatedCurrentVersion: scrapeId,
      lastAggregated: today
    };

    for (const law of laws) {
      console.log(`\n   → Processing law: ${law.lawId}`);

      // 2. Create law in registry
      const lawMetadata: LawMetadata = {
        lawId: law.lawId,
        title: law.title,
        lawDate: law.lawDate,
        url: law.url,
        authority: law.authority,
        topics: [topicId],
        type: law.type,
        isShared: false,
        fileLocation: `features/benefits/${topicId}/laws/${law.lawId}`,
        currentVersion: scrapeId,
        lastScraped: today,
        nextScrapeScheduled: this.getNextScrapeDate(today, 'monthly'),
        scrapingFrequency: 'monthly',
        scrapings: [scrapeId]
      };

      if (!dryRun) {
        this.db.addLaw(lawMetadata);
      }

      // 3. Add law to topic
      topicMetadata.laws.push({
        lawId: law.lawId,
        type: law.type,
        currentVersion: scrapeId,
        fileLocation: lawMetadata.fileLocation,
        isShared: false
      });

      // 4. Move files if they exist
      if (law.oldFeaturePath) {
        await this.moveFile(
          law.oldFeaturePath,
          `${lawMetadata.fileLocation}/${scrapeId}.feature`,
          dryRun,
          verbose
        );

        // Create symlink to current
        if (!dryRun) {
          const currentPath = path.join(
            this.workspace,
            lawMetadata.fileLocation,
            'current.feature'
          );
          const targetPath = `${scrapeId}.feature`;
          
          if (fs.existsSync(currentPath)) {
            fs.unlinkSync(currentPath);
          }
          
          try {
            fs.symlinkSync(targetPath, currentPath);
            if (verbose) {
              console.log(`      Created symlink: current.feature → ${targetPath}`);
            }
          } catch (error) {
            // Fallback to copy on Windows
            const sourcePath = path.join(
              this.workspace,
              lawMetadata.fileLocation,
              targetPath
            );
            fs.copyFileSync(sourcePath, currentPath);
            if (verbose) {
              console.log(`      Created copy (symlink failed): current.feature`);
            }
          }
        }
      }

      if (law.oldRulesPath) {
        const rulesLocation = lawMetadata.fileLocation.replace('features/', 'src/rules/');
        await this.moveFile(
          law.oldRulesPath,
          `${rulesLocation}/${scrapeId}.ts`,
          dryRun,
          verbose
        );

        // Create symlink to current
        if (!dryRun) {
          const currentPath = path.join(
            this.workspace,
            rulesLocation,
            'current.ts'
          );
          const targetPath = `${scrapeId}.ts`;
          
          if (fs.existsSync(currentPath)) {
            fs.unlinkSync(currentPath);
          }
          
          try {
            fs.symlinkSync(targetPath, currentPath);
            if (verbose) {
              console.log(`      Created symlink: current.ts → ${targetPath}`);
            }
          } catch (error) {
            // Fallback to copy on Windows
            const sourcePath = path.join(
              this.workspace,
              rulesLocation,
              targetPath
            );
            fs.copyFileSync(sourcePath, currentPath);
            if (verbose) {
              console.log(`      Created copy (symlink failed): current.ts`);
            }
          }
        }
      }
    }

    // 5. Save topic
    if (!dryRun) {
      this.db.addTopic(topicMetadata);
    }

    console.log(`   ✅ Topic ${topicId} migrated`);
  }

  /**
   * Add a shared law (affects multiple topics)
   */
  private async addSharedLaw(
    law: {
      lawId: string;
      title: string;
      lawDate: string;
      url: string;
      authority: string;
      topics: string[];
      type: 'primary' | 'implementing' | 'amendment' | 'indexation';
    },
    dryRun: boolean,
    verbose: boolean
  ): Promise<void> {
    console.log(`\n📚 Adding shared law: ${law.lawId}`);

    const today = new Date().toISOString().split('T')[0];
    const scrapeId = `scrape-${today}-001`;

    const lawMetadata: LawMetadata = {
      lawId: law.lawId,
      title: law.title,
      lawDate: law.lawDate,
      url: law.url,
      authority: law.authority,
      topics: law.topics,
      type: law.type,
      isShared: true,
      fileLocation: `features/laws/${law.lawId}`,
      currentVersion: scrapeId,
      lastScraped: today,
      nextScrapeScheduled: this.getNextScrapeDate(today, 'monthly'),
      scrapingFrequency: 'monthly',
      scrapings: [scrapeId]
    };

    if (!dryRun) {
      this.db.addLaw(lawMetadata);

      // Update affected topics
      for (const topicId of law.topics) {
        const topic = this.db.getTopic(topicId);
        if (topic) {
          topic.laws.push({
            lawId: law.lawId,
            type: law.type,
            currentVersion: scrapeId,
            fileLocation: lawMetadata.fileLocation,
            isShared: true
          });
          this.db.updateTopic(topicId, topic);
          
          if (verbose) {
            console.log(`   → Added to topic: ${topicId}`);
          }
        }
      }
    }

    console.log(`   ✅ Shared law ${law.lawId} added`);
  }

  /**
   * Move a file to new location
   */
  private async moveFile(
    oldPath: string,
    newPath: string,
    dryRun: boolean,
    verbose: boolean
  ): Promise<void> {
    const oldFullPath = path.join(this.workspace, oldPath);
    const newFullPath = path.join(this.workspace, newPath);

    if (!fs.existsSync(oldFullPath)) {
      console.log(`      ⚠️ Source file not found: ${oldPath}`);
      return;
    }

    if (dryRun) {
      console.log(`      [DRY RUN] Would move: ${oldPath} → ${newPath}`);
      return;
    }

    // Create directory if doesn't exist
    const newDir = path.dirname(newFullPath);
    if (!fs.existsSync(newDir)) {
      fs.mkdirSync(newDir, { recursive: true });
    }

    // Copy file
    fs.copyFileSync(oldFullPath, newFullPath);

    if (verbose) {
      console.log(`      Moved: ${oldPath} → ${newPath}`);
    }
  }

  /**
   * Calculate next scrape date
   */
  private getNextScrapeDate(today: string, frequency: 'weekly' | 'monthly'): string {
    const date = new Date(today);
    
    if (frequency === 'weekly') {
      date.setDate(date.getDate() + 7);
    } else {
      date.setMonth(date.getMonth() + 1);
    }
    
    return date.toISOString().split('T')[0];
  }
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose');

  const migrationService = new MigrationService();
  migrationService.migrate({ dryRun, verbose })
    .then(() => {
      console.log('\n✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}

