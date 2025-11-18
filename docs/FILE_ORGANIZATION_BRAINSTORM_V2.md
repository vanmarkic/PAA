# File Organization & Versioning Brainstorm V2
## Scraping-Based Versioning with Change Detection

## Updated Understanding

**Key Constraints**:
1. ✅ Each **law** has its own versioning (not topic-based versioning)
2. ✅ Versioning based on **scraping date** (when we detected the change)
3. ✅ **Scraping detects changes** → triggers generation pipeline
4. ✅ If no changes detected → no new version generated

**Example Flow**:
```
Day 1: Scrape "Loi du 26 mai 2002" → No changes → No action
Day 2: Scrape "Loi du 26 mai 2002" → Detected change → Generate new version
Day 3: Scrape "Loi du 26 mai 2002" → No changes → No action
```

---

## What is "Database-Driven"?

**Database-Driven Approach** = Central registry that tracks:
- Which laws exist
- When each law was last scraped
- What changed in each scraping
- Which files correspond to which scraping
- Relationships between laws and topics

**Instead of**:
- ❌ Relying on file system structure alone
- ❌ Inferring versions from filenames
- ❌ Manual tracking of relationships

**Benefits**:
- ✅ Single source of truth
- ✅ Rich queries (e.g., "all laws affecting RIS")
- ✅ Change history tracking
- ✅ Easy to find "current" version
- ✅ Can track relationships (law → topic, law → law)

---

## Approach 1: Scraping-Date-Based with Law Registry

### Structure
```
features/
  benefits/
    ris/
      loi-2002-05-26/
        scrape-2024-01-15.feature      # First scrape (no changes)
        scrape-2024-03-20.feature      # Second scrape (changes detected)
        scrape-2024-06-10.feature     # Third scrape (changes detected)
        current.feature -> scrape-2024-06-10.feature

src/rules/
  ris/
    loi-2002-05-26/
      scrape-2024-01-15.ts
      scrape-2024-03-20.ts
      scrape-2024-06-10.ts
      current.ts -> scrape-2024-06-10.ts

database/
  laws.json                           # Central registry
```

### Database (`database/laws.json`)
```json
{
  "laws": {
    "loi-2002-05-26": {
      "title": "Loi du 26 mai 2002 concernant le droit à l'intégration sociale",
      "lawDate": "2002-05-26",
      "url": "https://...",
      "topics": ["ris"],
      "scrapings": [
        {
          "scrapeDate": "2024-01-15",
          "detectedChanges": false,
          "version": "scrape-2024-01-15",
          "files": {
            "feature": "features/benefits/ris/loi-2002-05-26/scrape-2024-01-15.feature",
            "rules": "src/rules/ris/loi-2002-05-26/scrape-2024-01-15.ts",
            "workflow": "src/workflows/ris/loi-2002-05-26/scrape-2024-01-15.ts"
          },
          "hash": "abc123...",  // Content hash for change detection
          "generated": true
        },
        {
          "scrapeDate": "2024-03-20",
          "detectedChanges": true,
          "changeType": "amounts_updated",  // What changed
          "version": "scrape-2024-03-20",
          "files": {
            "feature": "features/benefits/ris/loi-2002-05-26/scrape-2024-03-20.feature",
            "rules": "src/rules/ris/loi-2002-05-26/scrape-2024-03-20.ts",
            "workflow": "src/workflows/ris/loi-2002-05-26/scrape-2024-03-20.ts"
          },
          "hash": "def456...",  // New hash
          "generated": true,
          "parentVersion": "scrape-2024-01-15"
        },
        {
          "scrapeDate": "2024-06-10",
          "detectedChanges": true,
          "changeType": "conditions_updated",
          "version": "scrape-2024-06-10",
          "files": {
            "feature": "features/benefits/ris/loi-2002-05-26/scrape-2024-06-10.feature",
            "rules": "src/rules/ris/loi-2002-05-26/scrape-2024-06-10.ts",
            "workflow": "src/workflows/ris/loi-2002-05-26/scrape-2024-06-10.ts"
          },
          "hash": "ghi789...",
          "generated": true,
          "parentVersion": "scrape-2024-03-20"
        }
      ],
      "currentVersion": "scrape-2024-06-10",
      "lastScraped": "2024-06-10",
      "nextScrapeScheduled": "2024-06-17"
    }
  },
  "topics": {
    "ris": {
      "name": "Revenu d'Intégration Sociale",
      "laws": [
        "loi-2002-05-26",
        "arrete-2002-07-11"  // Another law affecting RIS
      ],
      "currentVersions": {
        "loi-2002-05-26": "scrape-2024-06-10",
        "arrete-2002-07-11": "scrape-2024-05-15"
      }
    }
  }
}
```

### Pros
- ✅ Law-based organization (each law has its own folder)
- ✅ Scraping date visible in filenames
- ✅ Database tracks all relationships
- ✅ Easy to query "what changed when"
- ✅ Change detection built-in

### Cons
- ❌ Deep folder structure
- ❌ Many files if scraping frequently
- ❌ Need to maintain database

---

## Approach 2: Scraping-Date-Based with Hash Suffix

### Structure
```
features/
  benefits/
    ris/
      loi-2002-05-26-scrape-2024-01-15-abc123.feature
      loi-2002-05-26-scrape-2024-03-20-def456.feature
      loi-2002-05-26-scrape-2024-06-10-ghi789.feature
      current.feature -> loi-2002-05-26-scrape-2024-06-10-ghi789.feature

src/rules/
  ris/
    loi-2002-05-26-scrape-2024-01-15-abc123.ts
    loi-2002-05-26-scrape-2024-03-20-def456.ts
    loi-2002-05-26-scrape-2024-06-10-ghi789.ts
    current.ts -> loi-2002-05-26-scrape-2024-06-10-ghi789.ts
```

### Pros
- ✅ Hash in filename (content-based versioning)
- ✅ Easy to detect duplicates (same hash = no change)
- ✅ Flat structure (no deep folders)

### Cons
- ❌ Very long filenames
- ❌ Hash not human-readable
- ❌ Still need database for relationships

---

## Approach 3: Scraping-Date-Based with Incremental Version

### Structure
```
features/
  benefits/
    ris/
      loi-2002-05-26/
        v1-scrape-2024-01-15.feature    # First scrape
        v2-scrape-2024-03-20.feature    # Second scrape (changes)
        v3-scrape-2024-06-10.feature    # Third scrape (changes)
        current.feature -> v3-scrape-2024-06-10.feature

src/rules/
  ris/
    loi-2002-05-26/
      v1-scrape-2024-01-15.ts
      v2-scrape-2024-03-20.ts
      v3-scrape-2024-06-10.ts
      current.ts -> v3-scrape-2024-06-10.ts
```

### Database
```json
{
  "laws": {
    "loi-2002-05-26": {
      "scrapings": [
        {
          "version": "v1",
          "scrapeDate": "2024-01-15",
          "detectedChanges": false,
          "generated": false  // No changes, no generation
        },
        {
          "version": "v2",
          "scrapeDate": "2024-03-20",
          "detectedChanges": true,
          "changeType": "amounts_updated",
          "generated": true
        },
        {
          "version": "v3",
          "scrapeDate": "2024-06-10",
          "detectedChanges": true,
          "changeType": "conditions_updated",
          "generated": true
        }
      ],
      "currentVersion": "v3"
    }
  }
}
```

### Pros
- ✅ Incremental version numbers (easy to see sequence)
- ✅ Scraping date visible
- ✅ Only generate when changes detected

### Cons
- ❌ Version numbers per law (not global)
- ❌ Need to track version numbers in database

---

## Approach 4: Scraping-Date-Only (Simplest)

### Structure
```
features/
  benefits/
    ris/
      loi-2002-05-26/
        2024-01-15.feature    # First scrape (no changes, not generated)
        2024-03-20.feature    # Second scrape (changes, generated)
        2024-06-10.feature    # Third scrape (changes, generated)
        current.feature -> 2024-06-10.feature

src/rules/
  ris/
    loi-2002-05-26/
      2024-01-15.ts    # Not generated (no changes)
      2024-03-20.ts    # Generated (changes detected)
      2024-06-10.ts    # Generated (changes detected)
      current.ts -> 2024-06-10.ts
```

### Database
```json
{
  "laws": {
    "loi-2002-05-26": {
      "scrapings": [
        {
          "scrapeDate": "2024-01-15",
          "detectedChanges": false,
          "generated": false,
          "hash": "abc123..."
        },
        {
          "scrapeDate": "2024-03-20",
          "detectedChanges": true,
          "generated": true,
          "hash": "def456...",
          "files": {
            "feature": "2024-03-20.feature",
            "rules": "2024-03-20.ts"
          }
        }
      ],
      "currentVersion": "2024-06-10"
    }
  }
}
```

### Pros
- ✅ Simplest: just dates
- ✅ Human-readable
- ✅ Easy to sort chronologically
- ✅ Only files for changed scrapings exist

### Cons
- ❌ Can't tell if file exists because of changes or manual creation
- ❌ Need database to know which scrapings had changes

---

## Approach 5: Database-Driven (Central Registry)

### Structure
```
features/
  benefits/
    ris/
      loi-2002-05-26/
        [files named by database, not filesystem]

src/rules/
  ris/
    loi-2002-05-26/
      [files named by database]

database/
  registry.json                    # Single source of truth
  scrapings/
    loi-2002-05-26/
      scrape-2024-01-15.json       # Scraping metadata
      scrape-2024-03-20.json
      scrape-2024-06-10.json
```

### Database (`database/registry.json`)
```json
{
  "laws": {
    "loi-2002-05-26": {
      "title": "Loi du 26 mai 2002...",
      "lawDate": "2002-05-26",
      "url": "https://...",
      "topics": ["ris"],
      "scrapings": [
        {
          "id": "scrape-2024-01-15",
          "scrapeDate": "2024-01-15",
          "detectedChanges": false,
          "hash": "abc123...",
          "generated": false,
          "files": null
        },
        {
          "id": "scrape-2024-03-20",
          "scrapeDate": "2024-03-20",
          "detectedChanges": true,
          "changeType": "amounts_updated",
          "hash": "def456...",
          "generated": true,
          "files": {
            "feature": "features/benefits/ris/loi-2002-05-26/scrape-2024-03-20.feature",
            "rules": "src/rules/ris/loi-2002-05-26/scrape-2024-03-20.ts",
            "workflow": "src/workflows/ris/loi-2002-05-26/scrape-2024-03-20.ts"
          },
          "parentId": "scrape-2024-01-15"
        }
      ],
      "currentVersion": "scrape-2024-06-10"
    }
  },
  "topics": {
    "ris": {
      "name": "Revenu d'Intégration Sociale",
      "laws": ["loi-2002-05-26", "arrete-2002-07-11"],
      "currentVersions": {
        "loi-2002-05-26": "scrape-2024-06-10",
        "arrete-2002-07-11": "scrape-2024-05-15"
      }
    }
  }
}
```

### Scraping Metadata (`database/scrapings/loi-2002-05-26/scrape-2024-03-20.json`)
```json
{
  "scrapeId": "scrape-2024-03-20",
  "lawId": "loi-2002-05-26",
  "scrapeDate": "2024-03-20",
  "scrapeTime": "2024-03-20T10:30:00Z",
  "detectedChanges": true,
  "changeType": "amounts_updated",
  "changes": {
    "amounts": {
      "isolated": { "old": 1000.00, "new": 1070.49 },
      "cohabitant": { "old": 700.00, "new": 713.66 }
    }
  },
  "hash": "def456...",
  "previousHash": "abc123...",
  "generated": true,
  "generatedAt": "2024-03-20T10:35:00Z",
  "files": {
    "feature": "features/benefits/ris/loi-2002-05-26/scrape-2024-03-20.feature",
    "rules": "src/rules/ris/loi-2002-05-26/scrape-2024-03-20.ts",
    "workflow": "src/workflows/ris/loi-2002-05-26/scrape-2024-03-20.ts"
  },
  "parentId": "scrape-2024-01-15"
}
```

### Pros
- ✅ **Single source of truth** (database)
- ✅ **Rich metadata** per scraping
- ✅ **Change tracking** (what changed, when, why)
- ✅ **Queryable** (find all changes to RIS, find all laws affecting topic)
- ✅ **File locations** stored in database (not inferred from structure)
- ✅ **Flexible** (can reorganize files without breaking relationships)

### Cons
- ❌ **Requires database** (JSON file or real database)
- ❌ **Need tooling** to query database
- ❌ **More complex** than filesystem-only

---

## Approach 6: Hybrid - Filesystem + Database

### Structure
```
features/
  benefits/
    ris/
      loi-2002-05-26/
        scrape-2024-03-20.feature    # Only generated files exist
        scrape-2024-06-10.feature
        current.feature -> scrape-2024-06-10.feature

src/rules/
  ris/
    loi-2002-05-26/
      scrape-2024-03-20.ts
      scrape-2024-06-10.ts
      current.ts -> scrape-2024-06-10.ts

database/
  registry.json                       # Central registry
  scrapings/
    loi-2002-05-26/
      scrape-2024-01-15.json         # All scrapings (even no-changes)
      scrape-2024-03-20.json
      scrape-2024-06-10.json
```

### Key Points
- **Filesystem**: Only contains **generated files** (when changes detected)
- **Database**: Contains **all scrapings** (including no-changes)
- **Database tracks**: What changed, when, why, relationships

### Pros
- ✅ **Clean filesystem** (only generated files)
- ✅ **Complete history** in database
- ✅ **Best of both worlds**

### Cons
- ❌ Need to sync filesystem and database

---

## Change Detection Strategy

### How Scraping Detects Changes

```typescript
interface ScrapingResult {
  lawId: string;
  scrapeDate: string;
  content: string;           // Scraped HTML/text
  hash: string;              // Content hash (SHA-256)
  detectedChanges: boolean;
  changeType?: 'amounts_updated' | 'conditions_updated' | 'new_article' | 'removed_article' | 'major_reform';
  changes?: {
    amounts?: Record<string, { old: number; new: number }>;
    articles?: { added: string[]; removed: string[]; modified: string[] };
    conditions?: string[];
  };
}

async function scrapeLaw(lawId: string): Promise<ScrapingResult> {
  // 1. Fetch current content
  const content = await fetchLawContent(lawId);
  const hash = sha256(content);
  
  // 2. Get last scraping from database
  const lastScraping = await getLastScraping(lawId);
  
  // 3. Compare hashes
  if (lastScraping && lastScraping.hash === hash) {
    return {
      lawId,
      scrapeDate: new Date().toISOString().split('T')[0],
      content,
      hash,
      detectedChanges: false
    };
  }
  
  // 4. Detect what changed (if hash different)
  const changes = detectChanges(content, lastScraping?.content);
  
  return {
    lawId,
    scrapeDate: new Date().toISOString().split('T')[0],
    content,
    hash,
    detectedChanges: true,
    changeType: changes.type,
    changes: changes.details
  };
}
```

### Pipeline Trigger

```typescript
async function processScraping(result: ScrapingResult) {
  // 1. Save scraping to database (always)
  await saveScraping(result);
  
  // 2. If changes detected, trigger generation
  if (result.detectedChanges) {
    await triggerGenerationPipeline(result);
  } else {
    console.log(`No changes detected for ${result.lawId}, skipping generation`);
  }
}
```

---

## Recommendation: **Approach 6 (Hybrid)**

### Why?

1. **Filesystem**: Clean, only generated files exist
2. **Database**: Complete history, rich metadata
3. **Change Detection**: Built into scraping
4. **Flexible**: Can query database or browse filesystem
5. **Scalable**: Works for many laws and topics

### Structure Summary

```
features/benefits/ris/loi-2002-05-26/
  scrape-2024-03-20.feature    # Generated (changes detected)
  scrape-2024-06-10.feature    # Generated (changes detected)
  current.feature -> scrape-2024-06-10.feature

database/
  registry.json                # Central registry
  scrapings/loi-2002-05-26/
    scrape-2024-01-15.json     # All scrapings (including no-changes)
    scrape-2024-03-20.json     # With change details
    scrape-2024-06-10.json
```

### Database Schema

```typescript
interface LawRegistry {
  laws: Record<string, {
    title: string;
    lawDate: string;
    url: string;
    topics: string[];
    currentVersion: string;
    lastScraped: string;
    nextScrapeScheduled: string;
  }>;
  topics: Record<string, {
    name: string;
    laws: string[];
    currentVersions: Record<string, string>;  // lawId -> version
  }>;
}

interface ScrapingMetadata {
  scrapeId: string;
  lawId: string;
  scrapeDate: string;
  detectedChanges: boolean;
  changeType?: string;
  changes?: ChangeDetails;
  hash: string;
  previousHash?: string;
  generated: boolean;
  files?: {
    feature?: string;
    rules?: string;
    workflow?: string;
  };
  parentId?: string;
}
```

---

## Questions to Resolve

1. **Scraping Frequency**: Daily? Weekly? Monthly?
2. **Change Detection Granularity**: Hash only? Or semantic diff?
3. **Multiple Laws per Topic**: How to handle when multiple laws affect RIS?
4. **Version Naming**: `scrape-YYYY-MM-DD` or `v1`, `v2`, etc.?
5. **Database Type**: JSON file? SQLite? PostgreSQL?

---

**What do you think? Does the hybrid approach work for your scraping-based versioning?**

