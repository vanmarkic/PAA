# What Happens When You Run `npm run scrape`

## Flow Overview

When you run `npm run scrape`, here's the complete flow:

### 1. **Initialization** (`scripts/run-scraping.ts`)

```
✅ Loads environment variables (.env.local or .env)
✅ Initializes Claude API client (claude-opus-4-5)
✅ Creates LawManagementOrchestrator
✅ Loads database registry
```

### 2. **Find Laws to Scrape**

The script checks which laws are due for scraping:

```typescript
// Gets laws where nextScrapeScheduled <= today
lawIds = orchestrator.getLawsToScrape();
```

**Example**: If today is 2025-11-18 and a law's `nextScrapeScheduled` is `2025-11-15`, it will be scraped.

**Filtering options**:
- `npm run scrape` - All laws due for scraping
- `npm run scrape -- ris` - Only laws affecting RIS topic
- `npm run scrape -- --dry-run` - Test mode (no changes)

### 3. **For Each Law: Process Scraping**

For each law found, the orchestrator runs:

#### Step 3.1: **Scrape & Detect Changes**

```typescript
// ScrapingService.scrapeLaw(lawId)
1. Fetch law content from URL (currently PLACEHOLDER)
2. Calculate SHA-256 hash of content
3. Compare with previous scraping hash
4. Create scraping metadata
5. Save to database/scrapings/{lawId}/{scrapeId}.json
```

**Current Status**: ⚠️ **PLACEHOLDER**
- The `fetchLawContent()` method is a placeholder
- Returns fake content: `"Law content fetched at {timestamp}"`
- **This means every run will detect changes** (new timestamp = new hash)

#### Step 3.2: **If Changes Detected**

If hash changed:

##### A. **Generate Change Summary** (Claude API)

```typescript
// ChangeSummaryService.generateChangeSummary()
- Calls Claude API with previous vs current content
- Claude analyzes and returns:
  * changeType: "amounts_updated" | "conditions_updated" | etc.
  * summary: Human-readable French summary
  * changes: Detailed changes object
  * affectedArticles: ["Article 14", "Article 3"]
  * impact: "low" | "medium" | "high"
- Saves summary to scraping metadata
```

##### B. **Generate Files** (Claude + Pipeline)

```typescript
// PipelineOrchestrator.processNewLaw()
- Calls Claude to generate:
  * Feature file (Gherkin)
  * Rules file (TypeScript with json-rules-engine)
  * Workflow file (XState machine, if needed)
- Saves files to:
  * features/benefits/{topic}/laws/{lawId}/{scrapeId}.feature
  * src/rules/benefits/{topic}/laws/{lawId}/{scrapeId}.ts
  * src/workflows/benefits/{topic}/laws/{lawId}/{scrapeId}Machine.ts
- Creates symlink: current.feature → {scrapeId}.feature
```

##### C. **Aggregate Topics** (For All Affected Topics)

```typescript
// TopicAggregationService.aggregateTopic()
For each topic affected by the law:
  1. Load all law files for that topic
  2. Claude merges features into one aggregated feature
  3. Claude merges rules into one aggregated rules file
  4. Saves to:
     * features/benefits/{topic}/aggregated/{scrapeId}.feature
     * src/rules/benefits/{topic}/aggregated/{scrapeId}.ts
  5. Updates topic metadata (aggregatedCurrentVersion)
```

**Example**: If indexation law changes:
- Updates RIS topic aggregation
- Updates GRAPA topic aggregation
- Updates Pensions topic aggregation
- Updates Allocations Familiales topic aggregation

#### Step 3.3: **If No Changes**

```typescript
// Just save scraping metadata
- No Claude API calls
- No file generation
- No aggregation
- Just records that scraping happened
```

### 4. **Schedule Next Scraping**

```typescript
// Calculate next scrape date based on frequency
if (law.scrapingFrequency === 'weekly') {
  nextScrape = lastScraped + 7 days
} else { // monthly
  nextScrape = lastScraped + 1 month
}
// Update law.nextScrapeScheduled in registry
```

---

## Current Behavior (With Placeholder)

**⚠️ IMPORTANT**: Since `fetchLawContent()` is a placeholder:

1. **Every run will detect changes** (new timestamp = new hash)
2. **Claude API will be called** for every law (expensive!)
3. **Files will be regenerated** every time
4. **Topics will be re-aggregated** every time

**This is intentional for testing**, but in production you need to:
- Implement real web scraping
- Store scraped content for comparison
- Only call Claude when actual changes are detected

---

## Example Output

```
🚀 Law Scraping Pipeline

Date: 2025-11-18T16:30:00.000Z

✅ Loaded .env.local

Laws to scrape: 4
  - loi-2002-05-26
  - arrete-2002-07-11
  - loi-1971-08-02
  - arrete-1991-11-25

🔍 Processing scraping for law: loi-2002-05-26
[PLACEHOLDER] Would fetch content from: https://...
   Hash: abc123def4567890...
   Previous: N/A...
   Changes detected: ✅ YES

📝 Generating change summary...
   ✅ Change summary generated:
      Type: minor_update
      Impact: medium
      Summary: Des modifications ont été détectées dans la loi.

🔧 Generating feature/rules/workflow files...
   ✅ Files generated:
      Feature: features/benefits/ris/laws/loi-2002-05-26/scrape-2025-11-18-001.feature
      Rules: src/rules/benefits/ris/laws/loi-2002-05-26/scrape-2025-11-18-001.ts

📦 Updating affected topics...
   Topics to update: 1

   → Aggregating topic: ris
      ✅ Aggregation complete: scrape-2025-11-18-001
      Feature: features/benefits/ris/aggregated/scrape-2025-11-18-001.feature
      Rules: src/rules/benefits/ris/aggregated/scrape-2025-11-18-001.ts

✅ Scraping processing complete!
Next scraping scheduled for loi-2002-05-26: 2025-12-18

[... repeats for each law ...]

✅ Scraping pipeline completed!
```

---

## Cost Considerations

**Claude API Calls** (with placeholder, every run):
- Change summary: 1 call per law with changes
- File generation: 3 calls per law (feature, rules, workflow)
- Topic aggregation: 2 calls per topic (merge features, merge rules)

**Example**: 4 laws, 1 shared law affecting 4 topics:
- Change summaries: 5 calls
- File generation: ~15 calls
- Aggregation: 8 calls
- **Total: ~28 Claude API calls per run** ⚠️

**With real scraping** (only when changes detected):
- Most runs: 0-1 calls (just scraping, no changes)
- When changes: Same as above

---

## Next Steps to Make Production-Ready

1. **Implement Real Web Scraping**
   ```typescript
   // Replace placeholder in ScrapingService.fetchLawContent()
   // Use Puppeteer/Playwright to scrape ejustice.just.fgov.be
   ```

2. **Store Scraped Content**
   ```typescript
   // Save raw HTML/text in database/scrapings/{lawId}/{scrapeId}.txt
   // Enable diff generation for change summaries
   ```

3. **Add Rate Limiting**
   ```typescript
   // Don't scrape all laws at once
   // Add delays between API calls
   ```

4. **Add Error Handling**
   ```typescript
   // Retry failed scrapings
   // Handle network errors gracefully
   ```

---

## Testing Without Costs

Use `--dry-run` mode:

```bash
npm run scrape -- --dry-run
```

This will:
- ✅ Show what would be scraped
- ✅ Show what would be generated
- ❌ **No Claude API calls**
- ❌ **No file writes**
- ❌ **No database updates**

Perfect for testing the flow without spending API credits!

