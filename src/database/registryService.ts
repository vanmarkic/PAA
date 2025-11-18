/**
 * Database Service for Legal Registry Management
 * 
 * Central service for managing:
 * - Law registry (all laws)
 * - Topic registry (all topics/benefits)
 * - Scraping metadata (all scrapings)
 * - Relationships (law ↔ topic mapping)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// ============================================================================
// TYPES
// ============================================================================

export interface LawMetadata {
  lawId: string;
  title: string;
  lawDate: string;
  url: string;
  authority: string;
  topics: string[];
  type: 'primary' | 'implementing' | 'amendment' | 'indexation';
  isShared: boolean;
  fileLocation: string;
  currentVersion: string;
  lastScraped: string;
  nextScrapeScheduled: string;
  scrapingFrequency: 'weekly' | 'monthly';
  scrapings: string[];
}

export interface TopicMetadata {
  topicId: string;
  name: string;
  laws: Array<{
    lawId: string;
    type: string;
    currentVersion: string;
    fileLocation: string;
    isShared?: boolean;
  }>;
  aggregatedCurrentVersion: string;
  lastAggregated: string;
}

export interface ChangeDetection {
  detectedChanges: boolean;
  hash: string;
  previousHash: string | null;
  hashAlgorithm: string;
}

export interface ChangeSummary {
  generatedBy: string;
  generatedAt: string;
  changeType: 'amounts_updated' | 'conditions_updated' | 'new_article' | 'removed_article' | 'major_reform' | 'minor_update';
  summary: string;
  changes: any;
  affectedArticles: string[];
  impact: 'low' | 'medium' | 'high';
}

export interface GenerationInfo {
  generated: boolean;
  generatedAt: string | null;
  files: {
    feature?: string;
    rules?: string;
    workflow?: string;
  } | null;
  pipelineVersion?: string;
}

export interface ScrapingMetadata {
  scrapeId: string;
  lawId: string;
  scrapeDate: string;
  scrapeTime: string;
  changeDetection: ChangeDetection;
  changeSummary: ChangeSummary | null;
  generation: GenerationInfo;
  parentScrapeId: string | null;
}

export interface Registry {
  version: string;
  schemaVersion: string;
  lastUpdated: string;
  description: string;
  laws: Record<string, LawMetadata>;
  topics: Record<string, TopicMetadata>;
}

// ============================================================================
// DATABASE SERVICE
// ============================================================================

export class DatabaseService {
  private registryPath: string;
  private scrapingsPath: string;
  private registry: Registry;

  constructor(basePath: string = path.join(process.cwd(), 'database')) {
    this.registryPath = path.join(basePath, 'registry.json');
    this.scrapingsPath = path.join(basePath, 'scrapings');
    
    // Ensure directories exist
    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }
    if (!fs.existsSync(this.scrapingsPath)) {
      fs.mkdirSync(this.scrapingsPath, { recursive: true });
    }
    
    // Load or initialize registry
    this.registry = this.loadRegistry();
  }

  // ==========================================================================
  // REGISTRY MANAGEMENT
  // ==========================================================================

  private loadRegistry(): Registry {
    if (fs.existsSync(this.registryPath)) {
      const content = fs.readFileSync(this.registryPath, 'utf-8');
      return JSON.parse(content);
    }
    
    // Initialize empty registry
    return {
      version: '1.0.0',
      schemaVersion: '1.0.0',
      lastUpdated: new Date().toISOString(),
      description: 'Central registry for Belgian legal sources and topics',
      laws: {},
      topics: {}
    };
  }

  private saveRegistry(): void {
    this.registry.lastUpdated = new Date().toISOString();
    fs.writeFileSync(
      this.registryPath,
      JSON.stringify(this.registry, null, 2),
      'utf-8'
    );
  }

  public getRegistry(): Registry {
    return this.registry;
  }

  // ==========================================================================
  // LAW MANAGEMENT
  // ==========================================================================

  public getLaw(lawId: string): LawMetadata | null {
    return this.registry.laws[lawId] || null;
  }

  public addLaw(law: LawMetadata): void {
    this.registry.laws[law.lawId] = law;
    this.saveRegistry();
  }

  public updateLaw(lawId: string, updates: Partial<LawMetadata>): void {
    if (!this.registry.laws[lawId]) {
      throw new Error(`Law ${lawId} not found`);
    }
    this.registry.laws[lawId] = {
      ...this.registry.laws[lawId],
      ...updates
    };
    this.saveRegistry();
  }

  public getAllLaws(): Record<string, LawMetadata> {
    return this.registry.laws;
  }

  public getLawsByTopic(topicId: string): LawMetadata[] {
    return Object.values(this.registry.laws).filter(law =>
      law.topics.includes(topicId)
    );
  }

  // ==========================================================================
  // TOPIC MANAGEMENT
  // ==========================================================================

  public getTopic(topicId: string): TopicMetadata | null {
    return this.registry.topics[topicId] || null;
  }

  public addTopic(topic: TopicMetadata): void {
    this.registry.topics[topic.topicId] = topic;
    this.saveRegistry();
  }

  public updateTopic(topicId: string, updates: Partial<TopicMetadata>): void {
    if (!this.registry.topics[topicId]) {
      throw new Error(`Topic ${topicId} not found`);
    }
    this.registry.topics[topicId] = {
      ...this.registry.topics[topicId],
      ...updates
    };
    this.saveRegistry();
  }

  public getAllTopics(): Record<string, TopicMetadata> {
    return this.registry.topics;
  }

  // ==========================================================================
  // SCRAPING MANAGEMENT
  // ==========================================================================

  private getScrapingPath(lawId: string, scrapeId: string): string {
    const lawDir = path.join(this.scrapingsPath, lawId);
    if (!fs.existsSync(lawDir)) {
      fs.mkdirSync(lawDir, { recursive: true });
    }
    return path.join(lawDir, `${scrapeId}.json`);
  }

  public getScraping(lawId: string, scrapeId: string): ScrapingMetadata | null {
    const scrapingPath = this.getScrapingPath(lawId, scrapeId);
    if (!fs.existsSync(scrapingPath)) {
      return null;
    }
    const content = fs.readFileSync(scrapingPath, 'utf-8');
    return JSON.parse(content);
  }

  public saveScraping(lawId: string, scraping: ScrapingMetadata): void {
    const scrapingPath = this.getScrapingPath(lawId, scraping.scrapeId);
    fs.writeFileSync(
      scrapingPath,
      JSON.stringify(scraping, null, 2),
      'utf-8'
    );
    
    // Update law's scraping list
    const law = this.getLaw(lawId);
    if (law) {
      if (!law.scrapings.includes(scraping.scrapeId)) {
        law.scrapings.push(scraping.scrapeId);
        law.lastScraped = scraping.scrapeDate;
        if (scraping.changeDetection.detectedChanges) {
          law.currentVersion = scraping.scrapeId;
        }
        this.updateLaw(lawId, law);
      }
    }
  }

  public getLastScraping(lawId: string): ScrapingMetadata | null {
    const law = this.getLaw(lawId);
    if (!law || law.scrapings.length === 0) {
      return null;
    }
    
    // Get last scraping
    const lastScrapeId = law.scrapings[law.scrapings.length - 1];
    return this.getScraping(lawId, lastScrapeId);
  }

  public getAllScrapings(lawId: string): ScrapingMetadata[] {
    const law = this.getLaw(lawId);
    if (!law) {
      return [];
    }
    
    return law.scrapings
      .map(scrapeId => this.getScraping(lawId, scrapeId))
      .filter((s): s is ScrapingMetadata => s !== null);
  }

  // ==========================================================================
  // UTILITY FUNCTIONS
  // ==========================================================================

  public generateScrapeId(lawId: string, date?: Date): string {
    const scrapeDate = date || new Date();
    const dateStr = scrapeDate.toISOString().split('T')[0];
    
    // Find next sequence number for this date
    const law = this.getLaw(lawId);
    if (!law) {
      return `scrape-${dateStr}-001`;
    }
    
    const sameDayScrapings = law.scrapings.filter(sid =>
      sid.startsWith(`scrape-${dateStr}`)
    );
    
    const sequence = sameDayScrapings.length + 1;
    return `scrape-${dateStr}-${sequence.toString().padStart(3, '0')}`;
  }

  public calculateHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  // ==========================================================================
  // QUERY HELPERS
  // ==========================================================================

  public getSharedLaws(): LawMetadata[] {
    return Object.values(this.registry.laws).filter(law => law.isShared);
  }

  public getTopicSpecificLaws(topicId: string): LawMetadata[] {
    return Object.values(this.registry.laws).filter(law =>
      law.topics.includes(topicId) && !law.isShared
    );
  }

  public getAffectedTopics(lawId: string): TopicMetadata[] {
    const law = this.getLaw(lawId);
    if (!law) {
      return [];
    }
    
    return law.topics
      .map(topicId => this.getTopic(topicId))
      .filter((t): t is TopicMetadata => t !== null);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let dbInstance: DatabaseService | null = null;

export function getDatabaseService(): DatabaseService {
  if (!dbInstance) {
    dbInstance = new DatabaseService();
  }
  return dbInstance;
}

