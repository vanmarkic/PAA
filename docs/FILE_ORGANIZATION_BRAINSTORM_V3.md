# File Organization & Versioning Brainstorm V3
## Final Design with Constraints

## Constraints from Discussion

1. ✅ **Scraping frequency**: Weekly or monthly
2. ✅ **Change detection**: Hash only first, then Claude API fills in summary
3. ✅ **Multiple laws per topic**: Need to check current implementation
4. ✅ **Version naming**: Most flexible for future
5. ✅ **Database**: JSON for now

---

## Current Implementation Analysis

### How Multiple Laws Are Handled Now

**Example: RIS (Revenu d'Intégration Sociale)**

Currently in `src/legal-sources/belgianLegalSources.ts`:
```typescript
RIS_LEGAL_FRAMEWORK = {
  primaryLegislation: {
    title: "Loi du 26 mai 2002 concernant le droit à l'intégration sociale",
    date: "2002-05-26",
    // ...
  },
  implementingLegislation: [
    {
      title: "Arrêté royal du 11 juillet 2002...",
      date: "2002-07-11",
      // ...
    }
  ],
  recentAmendments: [
    // Additional laws/amendments
  ]
}
```

**Current Structure**:
- One **primary law** (main law)
- Multiple **implementing legislation** (arrêtés, décrets)
- **Recent amendments** (updates to the law)

**Files**:
- `features/benefits/ris.feature` - Single feature file
- `src/rules/risRules.ts` - Single rules file
- References multiple laws in comments/metadata

**Issue**: All laws affecting RIS are in one file. When one law changes, we regenerate the entire file.

---

## Proposed Solution: Law-Based Versioning with Topic Aggregation

### Structure

```
features/benefits/ris/
  laws/
    loi-2002-05-26/
      scrape-2024-01-15.feature      # First scrape
      scrape-2024-03-20.feature      # Changes detected
      scrape-2024-06-10.feature      # Changes detected
      current.feature -> scrape-2024-06-10.feature
    
    arrete-2002-07-11/
      scrape-2024-02-01.feature
      scrape-2024-05-15.feature      # Changes detected
      current.feature -> scrape-2024-05-15.feature

  aggregated/
    current.feature                  # Aggregated from all current law versions
    scrape-2024-06-10.feature       # Snapshot of aggregated state

src/rules/ris/
  laws/
    loi-2002-05-26/
      scrape-2024-01-15.ts
      scrape-2024-03-20.ts
      scrape-2024-06-10.ts
      current.ts -> scrape-2024-06-10.ts
    
    arrete-2002-07-11/
      scrape-2024-02-01.ts
      scrape-2024-05-15.ts
      current.ts -> scrape-2024-05-15.ts

  aggregated/
    current.ts                       # Aggregated from all current law versions
    scrape-2024-06-10.ts

database/
  registry.json                      # Central registry
  scrapings/
    loi-2002-05-26/
      scrape-2024-01-15.json
      scrape-2024-03-20.json
      scrape-2024-06-10.json
    
    arrete-2002-07-11/
      scrape-2024-02-01.json
      scrape-2024-05-15.json
```

### Key Concepts

1. **Law-Level Versioning**: Each law has its own version history
2. **Topic Aggregation**: Combine all current law versions into topic-level files
3. **Scraping-Based**: Versions based on scraping dates
4. **Hash + Claude Summary**: Hash detects changes, Claude summarizes what changed

---

## Version Naming: Most Flexible for Future

### Option A: Scraping Date Only
```
scrape-2024-03-20.feature
scrape-2024-06-10.feature
```

**Pros**:
- ✅ Simple, human-readable
- ✅ Chronologically sortable
- ✅ No version numbers to maintain

**Cons**:
- ❌ Can't tell sequence without dates
- ❌ What if multiple scrapings same day?

### Option B: Scraping Date + Sequence
```
scrape-2024-03-20-001.feature
scrape-2024-03-20-002.feature  # If multiple scrapings same day
scrape-2024-06-10-001.feature
```

**Pros**:
- ✅ Handles multiple scrapings per day
- ✅ Still date-based

**Cons**:
- ❌ Slightly longer names

### Option C: Scraping Date + Hash Suffix (Short)
```
scrape-2024-03-20-a1b2c3.feature
scrape-2024-06-10-d4e5f6.feature
```

**Pros**:
- ✅ Hash ensures uniqueness
- ✅ Can detect duplicates

**Cons**:
- ❌ Hash not human-readable
- ❌ Longer names

### Option D: Scraping Date + Incremental (Per Law)
```
scrape-2024-03-20-v1.feature
scrape-2024-06-10-v2.feature
```

**Pros**:
- ✅ Version numbers per law
- ✅ Easy to see sequence

**Cons**:
- ❌ Need to track version numbers in database

### **Recommendation: Option B (Date + Sequence)**

**Why?**
- ✅ **Flexible**: Can handle multiple scrapings per day
- ✅ **Future-proof**: Works with weekly/monthly scraping
- ✅ **Human-readable**: Dates are clear
- ✅ **Sortable**: Chronological order
- ✅ **No version numbers**: Don't need to track incrementing numbers

**Format**: `scrape-YYYY-MM-DD-NNN.feature`
- `YYYY-MM-DD`: Scraping date
- `NNN`: Sequence number (001, 002, 003...) if multiple scrapings same day

**In practice**: With weekly/monthly scraping, sequence will almost always be `001`.

---

## Database Schema (JSON)

### `database/registry.json`

```json
{
  "version": "1.0.0",
  "lastUpdated": "2024-06-10T10:30:00Z",
  "laws": {
    "loi-2002-05-26": {
      "lawId": "loi-2002-05-26",
      "title": "Loi du 26 mai 2002 concernant le droit à l'intégration sociale",
      "lawDate": "2002-05-26",
      "url": "https://www.ejustice.just.fgov.be/...",
      "authority": "SPF Sécurité Sociale",
      "topics": ["ris"],
      "type": "primary",  // primary | implementing | amendment
      "currentVersion": "scrape-2024-06-10-001",
      "lastScraped": "2024-06-10",
      "nextScrapeScheduled": "2024-07-10",  // Monthly
      "scrapingFrequency": "monthly",
      "scrapings": [
        "scrape-2024-01-15-001",
        "scrape-2024-03-20-001",
        "scrape-2024-06-10-001"
      ]
    },
    "arrete-2002-07-11": {
      "lawId": "arrete-2002-07-11",
      "title": "Arrêté royal du 11 juillet 2002...",
      "lawDate": "2002-07-11",
      "url": "https://...",
      "authority": "SPF Sécurité Sociale",
      "topics": ["ris"],
      "type": "implementing",
      "currentVersion": "scrape-2024-05-15-001",
      "lastScraped": "2024-05-15",
      "nextScrapeScheduled": "2024-06-15",
      "scrapingFrequency": "monthly",
      "scrapings": [
        "scrape-2024-02-01-001",
        "scrape-2024-05-15-001"
      ]
    }
  },
  "topics": {
    "ris": {
      "topicId": "ris",
      "name": "Revenu d'Intégration Sociale",
      "laws": [
        {
          "lawId": "loi-2002-05-26",
          "type": "primary",
          "currentVersion": "scrape-2024-06-10-001"
        },
        {
          "lawId": "arrete-2002-07-11",
          "type": "implementing",
          "currentVersion": "scrape-2024-05-15-001"
        }
      ],
      "aggregatedCurrentVersion": "scrape-2024-06-10-001",
      "lastAggregated": "2024-06-10"
    }
  }
}
```

### `database/scrapings/loi-2002-05-26/scrape-2024-03-20-001.json`

```json
{
  "scrapeId": "scrape-2024-03-20-001",
  "lawId": "loi-2002-05-26",
  "scrapeDate": "2024-03-20",
  "scrapeTime": "2024-03-20T10:30:00Z",
  
  "changeDetection": {
    "detectedChanges": true,
    "hash": "def4567890abcdef...",
    "previousHash": "abc1234567890abc...",
    "hashAlgorithm": "sha256"
  },
  
  "changeSummary": {
    "generatedBy": "claude-opus-4-1",
    "generatedAt": "2024-03-20T10:35:00Z",
    "changeType": "amounts_updated",
    "summary": "Les montants RIS ont été indexés: personne isolée passe de 1000.00€ à 1070.49€, personne cohabitante de 700.00€ à 713.66€.",
    "changes": {
      "amounts": {
        "isolated": {
          "old": 1000.00,
          "new": 1070.49,
          "change": "+70.49€ (+7.05%)"
        },
        "cohabitant": {
          "old": 700.00,
          "new": 713.66,
          "change": "+13.66€ (+1.95%)"
        }
      }
    },
    "affectedArticles": ["Article 14"],
    "impact": "medium"  // low | medium | high
  },
  
  "generation": {
    "generated": true,
    "generatedAt": "2024-03-20T10:40:00Z",
    "files": {
      "feature": "features/benefits/ris/laws/loi-2002-05-26/scrape-2024-03-20-001.feature",
      "rules": "src/rules/ris/laws/loi-2002-05-26/scrape-2024-03-20-001.ts",
      "workflow": "src/workflows/ris/laws/loi-2002-05-26/scrape-2024-03-20-001.ts"
    },
    "pipelineVersion": "1.0.0"
  },
  
  "parentScrapeId": "scrape-2024-01-15-001"
}
```

### `database/scrapings/loi-2002-05-26/scrape-2024-01-15-001.json`

```json
{
  "scrapeId": "scrape-2024-01-15-001",
  "lawId": "loi-2002-05-26",
  "scrapeDate": "2024-01-15",
  "scrapeTime": "2024-01-15T10:30:00Z",
  
  "changeDetection": {
    "detectedChanges": false,
    "hash": "abc1234567890abc...",
    "previousHash": null,  // First scraping
    "hashAlgorithm": "sha256"
  },
  
  "changeSummary": null,  // No changes, no summary needed
  
  "generation": {
    "generated": false,  // No changes, no generation
    "generatedAt": null,
    "files": null
  },
  
  "parentScrapeId": null  // First scraping
}
```

---

## Change Detection Flow

### Step 1: Scraping (Hash Detection)

```typescript
async function scrapeLaw(lawId: string): Promise<ScrapingResult> {
  // 1. Fetch current content
  const content = await fetchLawContent(lawId);
  const hash = sha256(content);
  
  // 2. Get last scraping from database
  const lastScraping = await getLastScraping(lawId);
  
  // 3. Compare hashes
  const detectedChanges = !lastScraping || lastScraping.hash !== hash;
  
  // 4. Generate scrape ID
  const scrapeDate = new Date().toISOString().split('T')[0];
  const sequence = await getNextSequence(lawId, scrapeDate);
  const scrapeId = `scrape-${scrapeDate}-${sequence.toString().padStart(3, '0')}`;
  
  // 5. Save scraping (always, even if no changes)
  const scraping = {
    scrapeId,
    lawId,
    scrapeDate,
    scrapeTime: new Date().toISOString(),
    changeDetection: {
      detectedChanges,
      hash,
      previousHash: lastScraping?.hash || null,
      hashAlgorithm: "sha256"
    },
    changeSummary: null,  // Will be filled if changes detected
    generation: {
      generated: false,
      generatedAt: null,
      files: null
    },
    parentScrapeId: lastScraping?.scrapeId || null
  };
  
  await saveScraping(lawId, scraping);
  
  return {
    scraping,
    content,
    detectedChanges
  };
}
```

### Step 2: Change Summary (Claude API)

```typescript
async function generateChangeSummary(
  scraping: ScrapingMetadata,
  currentContent: string,
  previousContent: string | null
): Promise<ChangeSummary> {
  if (!scraping.changeDetection.detectedChanges) {
    return null;  // No changes, no summary
  }
  
  const prompt = `Compare these two versions of a Belgian law and summarize what changed:

PREVIOUS VERSION (hash: ${scraping.changeDetection.previousHash}):
${previousContent?.substring(0, 10000) || 'N/A (first version)'}

CURRENT VERSION (hash: ${scraping.changeDetection.hash}):
${currentContent.substring(0, 10000)}

Analyze and return JSON with:
- changeType: "amounts_updated" | "conditions_updated" | "new_article" | "removed_article" | "major_reform" | "minor_update"
- summary: Human-readable summary in French
- changes: Detailed changes (amounts, articles, conditions)
- affectedArticles: Array of article numbers affected
- impact: "low" | "medium" | "high"

Return ONLY valid JSON, no markdown.`;

  const response = await claudeClient.callClaudeAPI(prompt);
  const summary = JSON.parse(response);
  
  return {
    generatedBy: "claude-opus-4-1",
    generatedAt: new Date().toISOString(),
    ...summary
  };
}
```

### Step 3: Generation Pipeline (If Changes Detected)

```typescript
async function processScraping(result: ScrapingResult) {
  const { scraping, content, detectedChanges } = result;
  
  // Always save scraping first
  await saveScraping(scraping.lawId, scraping);
  
  if (!detectedChanges) {
    console.log(`No changes detected for ${scraping.lawId}, skipping generation`);
    return;
  }
  
  // Generate change summary with Claude
  console.log(`Changes detected, generating summary...`);
  const changeSummary = await generateChangeSummary(
    scraping,
    content,
    await getPreviousContent(scraping.lawId, scraping.parentScrapeId)
  );
  
  scraping.changeSummary = changeSummary;
  await saveScraping(scraping.lawId, scraping);
  
  // Trigger generation pipeline
  console.log(`Triggering generation pipeline...`);
  const pipelineResult = await triggerGenerationPipeline({
    lawId: scraping.lawId,
    content,
    scrapeId: scraping.scrapeId,
    changeSummary
  });
  
  // Update scraping with generated files
  scraping.generation = {
    generated: true,
    generatedAt: new Date().toISOString(),
    files: {
      feature: pipelineResult.featurePath,
      rules: pipelineResult.rulesPath,
      workflow: pipelineResult.workflowPath
    },
    pipelineVersion: "1.0.0"
  };
  
  await saveScraping(scraping.lawId, scraping);
  
  // Update topic aggregation if needed
  await updateTopicAggregation(scraping.lawId);
}
```

---

## Topic Aggregation

### When to Aggregate?

1. **After each law change**: When any law affecting a topic changes
2. **On demand**: When user requests current topic version
3. **Scheduled**: Weekly/monthly aggregation check

### How to Aggregate?

```typescript
async function aggregateTopic(topicId: string) {
  const topic = await getTopic(topicId);
  const laws = topic.laws;
  
  // Get current version of each law
  const currentLawVersions = await Promise.all(
    laws.map(async (law) => {
      const lawData = await getLaw(law.lawId);
      const currentScraping = await getScraping(
        law.lawId,
        lawData.currentVersion
      );
      return {
        lawId: law.lawId,
        type: law.type,
        scraping: currentScraping
      };
    })
  );
  
  // Merge features, rules, workflows
  const aggregated = {
    topicId,
    aggregatedDate: new Date().toISOString().split('T')[0],
    lawVersions: currentLawVersions.map(l => ({
      lawId: l.lawId,
      version: l.scraping.scrapeId
    })),
    feature: await mergeFeatures(currentLawVersions),
    rules: await mergeRules(currentLawVersions),
    workflow: await mergeWorkflows(currentLawVersions)
  };
  
  // Save aggregated files
  const scrapeId = `scrape-${aggregated.aggregatedDate}-001`;
  await saveAggregatedFiles(topicId, scrapeId, aggregated);
  
  // Update topic current version
  await updateTopic(topicId, {
    aggregatedCurrentVersion: scrapeId,
    lastAggregated: aggregated.aggregatedDate
  });
}
```

---

## File Naming Convention

### Law-Level Files
```
features/benefits/ris/laws/loi-2002-05-26/scrape-2024-03-20-001.feature
src/rules/ris/laws/loi-2002-05-26/scrape-2024-03-20-001.ts
src/workflows/ris/laws/loi-2002-05-26/scrape-2024-03-20-001.ts
```

### Topic Aggregated Files
```
features/benefits/ris/aggregated/scrape-2024-06-10-001.feature
features/benefits/ris/aggregated/current.feature -> scrape-2024-06-10-001.feature
src/rules/ris/aggregated/scrape-2024-06-10-001.ts
src/rules/ris/aggregated/current.ts -> scrape-2024-06-10-001.ts
```

### Symlinks for "Current"
```
features/benefits/ris/laws/loi-2002-05-26/current.feature -> scrape-2024-06-10-001.feature
src/rules/ris/laws/loi-2002-05-26/current.ts -> scrape-2024-06-10-001.ts
```

---

## Migration Strategy

### Phase 1: Setup Database Structure
1. Create `database/` directory
2. Create `database/registry.json` with current laws
3. Create scraping metadata structure

### Phase 2: Implement Scraping
1. Implement hash-based change detection
2. Implement Claude API change summary
3. Save all scrapings to database

### Phase 3: Reorganize Files
1. Create law-based folder structure
2. Move existing files to first scraping
3. Create aggregation logic

### Phase 4: Update Pipeline
1. Update pipeline to use new structure
2. Update scripts to read from database
3. Update documentation generation

---

## Benefits of This Approach

1. ✅ **Law-based versioning**: Each law tracked independently
2. ✅ **Scraping-based**: Versions based on when changes detected
3. ✅ **Hash + Claude**: Fast detection, rich summaries
4. ✅ **Topic aggregation**: Combine laws for topic-level views
5. ✅ **Flexible naming**: Date + sequence works for any frequency
6. ✅ **JSON database**: Simple, no external dependencies
7. ✅ **Complete history**: Every scraping recorded
8. ✅ **Future-proof**: Can migrate to SQLite/PostgreSQL later

---

## Next Steps

1. **Design database schema** in detail
2. **Implement scraping infrastructure**
3. **Implement change detection** (hash)
4. **Implement change summary** (Claude API)
5. **Create migration script** for existing files
6. **Implement aggregation logic**

---

**Ready to proceed with implementation?**

