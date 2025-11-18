# File Organization & Versioning Brainstorm V4
## Multi-Topic Laws Support

## Key Question: Can Laws Influence Multiple Topics?

**Answer: YES!** A single law can affect multiple topics/benefits.

### Examples:

1. **Loi du 2 août 1971** (Indexation)
   - Affects: RIS, GRAPA, pensions, allocations familiales
   - Impact: Annual amount indexation

2. **Fiscal Reform Law**
   - Affects: Multiple tax benefits (credit d'impôt, déductions, etc.)
   - Impact: Changes to tax calculation rules

3. **Social Security Reform**
   - Affects: RIS, AGR, chômage, pensions
   - Impact: Changes to eligibility conditions

4. **Regional Law (Bruxelles)**
   - Affects: Multiple regional benefits
   - Impact: Regional-specific rules

---

## Updated Structure: Law → Topics (Many-to-Many)

### Database Schema Update

```json
{
  "laws": {
    "loi-1971-08-02": {
      "lawId": "loi-1971-08-02",
      "title": "Loi du 2 août 1971 organisant un régime de liaison à l'indice des prix à la consommation",
      "lawDate": "1971-08-02",
      "url": "https://...",
      "authority": "SPF Économie",
      "topics": ["ris", "grapa", "pensions", "allocations-familiales"],  // MULTIPLE TOPICS
      "type": "indexation",  // Special type for indexation laws
      "currentVersion": "scrape-2024-06-10-001",
      "lastScraped": "2024-06-10",
      "nextScrapeScheduled": "2024-07-10",
      "scrapingFrequency": "monthly",
      "scrapings": [
        "scrape-2024-01-15-001",
        "scrape-2024-06-10-001"
      ]
    },
    "loi-2002-05-26": {
      "lawId": "loi-2002-05-26",
      "title": "Loi du 26 mai 2002 concernant le droit à l'intégration sociale",
      "lawDate": "2002-05-26",
      "url": "https://...",
      "authority": "SPF Sécurité Sociale",
      "topics": ["ris"],  // Single topic
      "type": "primary",
      "currentVersion": "scrape-2024-06-10-001",
      "lastScraped": "2024-06-10",
      "nextScrapeScheduled": "2024-07-10",
      "scrapingFrequency": "monthly",
      "scrapings": [
        "scrape-2024-01-15-001",
        "scrape-2024-06-10-001"
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
        },
        {
          "lawId": "loi-1971-08-02",
          "type": "indexation",
          "currentVersion": "scrape-2024-06-10-001"
        }
      ],
      "aggregatedCurrentVersion": "scrape-2024-06-10-001",
      "lastAggregated": "2024-06-10"
    },
    "grapa": {
      "topicId": "grapa",
      "name": "Garantie de Revenus aux Personnes Âgées",
      "laws": [
        {
          "lawId": "loi-1969-05-22",
          "type": "primary",
          "currentVersion": "scrape-2024-05-01-001"
        },
        {
          "lawId": "loi-1971-08-02",
          "type": "indexation",
          "currentVersion": "scrape-2024-06-10-001"
        }
      ],
      "aggregatedCurrentVersion": "scrape-2024-06-10-001",
      "lastAggregated": "2024-06-10"
    }
  }
}
```

---

## File Structure: Law Files Shared Across Topics

### Option A: Law Files in Shared Location

```
features/
  laws/
    loi-1971-08-02/                    # Shared law (affects multiple topics)
      scrape-2024-01-15-001.feature
      scrape-2024-06-10-001.feature
      current.feature -> scrape-2024-06-10-001.feature
    
    loi-2002-05-26/                    # RIS-specific law
      scrape-2024-01-15-001.feature
      scrape-2024-06-10-001.feature
      current.feature -> scrape-2024-06-10-001.feature

  benefits/
    ris/
      laws/
        loi-2002-05-26/                # Symlink or reference
          current.feature -> ../../laws/loi-2002-05-26/current.feature
        loi-1971-08-02/                # Symlink or reference
          current.feature -> ../../laws/loi-1971-08-02/current.feature
      aggregated/
        current.feature                # Aggregated RIS (all laws)

    grapa/
      laws/
        loi-1969-05-22/
          current.feature
        loi-1971-08-02/                # Same law, different topic
          current.feature -> ../../laws/loi-1971-08-02/current.feature
      aggregated/
        current.feature                # Aggregated GRAPA (all laws)
```

**Pros**:
- ✅ Single source of truth for shared laws
- ✅ No duplication
- ✅ One scraping updates all affected topics

**Cons**:
- ❌ Symlinks might be complex
- ❌ Need to track which topics use which laws

### Option B: Law Files in Each Topic (With References)

```
features/
  benefits/
    ris/
      laws/
        loi-2002-05-26/                # RIS-specific
          scrape-2024-06-10-001.feature
          current.feature
        
        loi-1971-08-02/                # Shared law (copy or reference)
          current.feature -> ../../../shared/laws/loi-1971-08-02/current.feature
          # OR: Copy with reference to source
      aggregated/
        current.feature

    grapa/
      laws/
        loi-1969-05-22/
          current.feature
        
        loi-1971-08-02/                # Same shared law
          current.feature -> ../../../shared/laws/loi-1971-08-02/current.feature
      aggregated/
        current.feature

  shared/
    laws/
      loi-1971-08-02/                  # Shared law files
        scrape-2024-01-15-001.feature
        scrape-2024-06-10-001.feature
        current.feature -> scrape-2024-06-10-001.feature
```

**Pros**:
- ✅ Clear topic organization
- ✅ Easy to see which laws affect each topic
- ✅ Can have topic-specific views of shared laws

**Cons**:
- ❌ Need to maintain references
- ❌ Potential for inconsistency

### **Recommendation: Option A (Shared Laws Location)**

**Why?**
- ✅ **Single source of truth**: One scraping updates all topics
- ✅ **No duplication**: Law files stored once
- ✅ **Clear relationships**: Database tracks which topics use which laws
- ✅ **Efficient**: One change detection triggers updates for all affected topics

---

## Updated File Structure

```
features/
  laws/                                # Shared laws (affect multiple topics)
    loi-1971-08-02/
      scrape-2024-01-15-001.feature
      scrape-2024-06-10-001.feature
      current.feature -> scrape-2024-06-10-001.feature

  benefits/
    ris/
      laws/
        loi-2002-05-26/                # RIS-specific law
          scrape-2024-01-15-001.feature
          scrape-2024-06-10-001.feature
          current.feature -> scrape-2024-06-10-001.feature
        
        loi-1971-08-02/                # Symlink to shared law
          current.feature -> ../../../laws/loi-1971-08-02/current.feature

      aggregated/
        current.feature                # Aggregated RIS (all laws)
        scrape-2024-06-10-001.feature

    grapa/
      laws/
        loi-1969-05-22/
          current.feature
        
        loi-1971-08-02/                # Same shared law
          current.feature -> ../../../laws/loi-1971-08-02/current.feature

      aggregated/
        current.feature                # Aggregated GRAPA (all laws)

src/rules/
  laws/                                # Shared law rules
    loi-1971-08-02/
      scrape-2024-01-15-001.ts
      scrape-2024-06-10-001.ts
      current.ts -> scrape-2024-06-10-001.ts

  benefits/
    ris/
      laws/
        loi-2002-05-26/
          current.ts
        
        loi-1971-08-02/
          current.ts -> ../../../laws/loi-1971-08-02/current.ts

      aggregated/
        current.ts                     # Aggregated RIS rules

    grapa/
      laws/
        loi-1969-05-22/
          current.ts
        
        loi-1971-08-02/
          current.ts -> ../../../laws/loi-1971-08-02/current.ts

      aggregated/
        current.ts                     # Aggregated GRAPA rules
```

---

## Change Detection Flow (Multi-Topic)

### When Shared Law Changes

```typescript
async function processScraping(result: ScrapingResult) {
  const { scraping, content, detectedChanges } = result;
  const law = await getLaw(scraping.lawId);
  
  // Save scraping
  await saveScraping(scraping.lawId, scraping);
  
  if (!detectedChanges) {
    return;  // No changes, no action
  }
  
  // Generate change summary
  const changeSummary = await generateChangeSummary(scraping, content);
  scraping.changeSummary = changeSummary;
  await saveScraping(scraping.lawId, scraping);
  
  // Generate law files (once)
  const lawFiles = await triggerGenerationPipeline({
    lawId: scraping.lawId,
    content,
    scrapeId: scraping.scrapeId,
    changeSummary
  });
  
  // Update ALL affected topics
  const affectedTopics = law.topics;  // ["ris", "grapa", "pensions", ...]
  
  for (const topicId of affectedTopics) {
    console.log(`Updating topic: ${topicId}`);
    
    // Re-aggregate topic (combines all current law versions)
    await aggregateTopic(topicId);
    
    // Notify topic subscribers (if any)
    await notifyTopicUpdate(topicId, {
      lawId: scraping.lawId,
      scrapeId: scraping.scrapeId,
      changeSummary
    });
  }
}
```

### Topic Aggregation (Multi-Law)

```typescript
async function aggregateTopic(topicId: string) {
  const topic = await getTopic(topicId);
  
  // Get all laws affecting this topic
  const laws = topic.laws;
  
  // Get current version of each law
  const currentLawVersions = await Promise.all(
    laws.map(async (law) => {
      const lawData = await getLaw(law.lawId);
      const currentScraping = await getScraping(
        law.lawId,
        lawData.currentVersion
      );
      
      // Get law files (from shared location or topic-specific)
      const lawFiles = await getLawFiles(law.lawId, currentScraping.scrapeId);
      
      return {
        lawId: law.lawId,
        type: law.type,
        scraping: currentScraping,
        files: lawFiles
      };
    })
  );
  
  // Merge features, rules, workflows from all laws
  const aggregated = {
    topicId,
    aggregatedDate: new Date().toISOString().split('T')[0],
    lawVersions: currentLawVersions.map(l => ({
      lawId: l.lawId,
      version: l.scraping.scrapeId,
      type: l.type
    })),
    feature: await mergeFeatures(currentLawVersions),
    rules: await mergeRules(currentLawVersions),
    workflow: await mergeWorkflows(currentLawVersions)
  };
  
  // Save aggregated files
  const scrapeId = `scrape-${aggregated.aggregatedDate}-001`;
  await saveAggregatedFiles(topicId, scrapeId, aggregated);
  
  // Update topic
  await updateTopic(topicId, {
    aggregatedCurrentVersion: scrapeId,
    lastAggregated: aggregated.aggregatedDate
  });
}
```

---

## Database Schema: Multi-Topic Support

### Updated `database/registry.json`

```json
{
  "laws": {
    "loi-1971-08-02": {
      "lawId": "loi-1971-08-02",
      "title": "Loi du 2 août 1971 organisant un régime de liaison à l'indice des prix à la consommation",
      "lawDate": "1971-08-02",
      "url": "https://...",
      "authority": "SPF Économie",
      "topics": ["ris", "grapa", "pensions", "allocations-familiales"],  // MULTIPLE
      "type": "indexation",
      "isShared": true,  // Flag for shared laws
      "fileLocation": "features/laws/loi-1971-08-02",  // Shared location
      "currentVersion": "scrape-2024-06-10-001",
      "lastScraped": "2024-06-10",
      "nextScrapeScheduled": "2024-07-10",
      "scrapingFrequency": "monthly"
    },
    "loi-2002-05-26": {
      "lawId": "loi-2002-05-26",
      "title": "Loi du 26 mai 2002 concernant le droit à l'intégration sociale",
      "lawDate": "2002-05-26",
      "url": "https://...",
      "authority": "SPF Sécurité Sociale",
      "topics": ["ris"],  // SINGLE
      "type": "primary",
      "isShared": false,
      "fileLocation": "features/benefits/ris/laws/loi-2002-05-26",  // Topic-specific
      "currentVersion": "scrape-2024-06-10-001",
      "lastScraped": "2024-06-10",
      "nextScrapeScheduled": "2024-07-10",
      "scrapingFrequency": "monthly"
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
          "currentVersion": "scrape-2024-06-10-001",
          "fileLocation": "features/benefits/ris/laws/loi-2002-05-26"
        },
        {
          "lawId": "arrete-2002-07-11",
          "type": "implementing",
          "currentVersion": "scrape-2024-05-15-001",
          "fileLocation": "features/benefits/ris/laws/arrete-2002-07-11"
        },
        {
          "lawId": "loi-1971-08-02",
          "type": "indexation",
          "currentVersion": "scrape-2024-06-10-001",
          "fileLocation": "features/laws/loi-1971-08-02",  // Shared location
          "isShared": true
        }
      ],
      "aggregatedCurrentVersion": "scrape-2024-06-10-001",
      "lastAggregated": "2024-06-10"
    },
    "grapa": {
      "topicId": "grapa",
      "name": "Garantie de Revenus aux Personnes Âgées",
      "laws": [
        {
          "lawId": "loi-1969-05-22",
          "type": "primary",
          "currentVersion": "scrape-2024-05-01-001",
          "fileLocation": "features/benefits/grapa/laws/loi-1969-05-22"
        },
        {
          "lawId": "loi-1971-08-02",
          "type": "indexation",
          "currentVersion": "scrape-2024-06-10-001",
          "fileLocation": "features/laws/loi-1971-08-02",  // Same shared law
          "isShared": true
        }
      ],
      "aggregatedCurrentVersion": "scrape-2024-06-10-001",
      "lastAggregated": "2024-06-10"
    }
  }
}
```

---

## Benefits of Multi-Topic Support

1. ✅ **Efficient**: One scraping updates all affected topics
2. ✅ **Consistent**: Shared laws have single source of truth
3. ✅ **Flexible**: Can track which topics are affected by which laws
4. ✅ **Scalable**: Works for any number of topics per law
5. ✅ **Clear relationships**: Database shows law → topics mapping

---

## Example: Indexation Law Update

### Scenario:
- **Law**: Loi du 2 août 1971 (indexation)
- **Affects**: RIS, GRAPA, pensions, allocations familiales
- **Change**: New indexation rate detected

### Flow:
1. **Scraping**: Detect hash change
2. **Summary**: Claude generates: "Indexation 2024: +7.05%"
3. **Generation**: Generate law files once (in `features/laws/loi-1971-08-02/`)
4. **Aggregation**: Update all 4 topics:
   - Re-aggregate RIS
   - Re-aggregate GRAPA
   - Re-aggregate pensions
   - Re-aggregate allocations familiales
5. **Notification**: Notify all affected topics

### Result:
- ✅ One law scraping
- ✅ One law file generation
- ✅ Four topic aggregations
- ✅ All topics updated consistently

---

## Next Steps

1. **Update database schema** to support multi-topic laws
2. **Implement shared law location** (`features/laws/`)
3. **Update aggregation logic** to handle multi-law topics
4. **Update change detection** to trigger multi-topic updates
5. **Add law → topics mapping** to registry

---

**This design handles both single-topic and multi-topic laws efficiently!**

