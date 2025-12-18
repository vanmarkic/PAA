# File Organization & Versioning Brainstorm

## Problem Statement

**Current Issue**: Files are named by law (e.g., `loi-du-26-mai-2002-concernant-le-droit-l-int-grati.feature`)
- If a law changes, we get a new file with a different name
- But the **topic** (RIS) stays the same
- We lose the connection between related laws and the benefit they govern
- Hard to track evolution over time

**Example**:
- Topic: **RIS** (Revenu d'Intégration Sociale)
- Law 1: Loi du 26 mai 2002 (original)
- Law 2: Loi du X (amendment 2005)
- Law 3: Loi du Y (major reform 2010)
- Law 4: Arrêté royal du Z (implementation details 2015)

**Challenge**: How to structure files so that:
1. ✅ Topic-based organization (RIS, AGR, etc.)
2. ✅ Versioning within topics
3. ✅ Relationship tracking (which laws affect which topics)
4. ✅ Evolution tracking (see how rules changed over time)
5. ✅ Easy to find current version
6. ✅ Easy to see historical versions

---

## Approach 1: Topic-Based with Semantic Versioning

### Structure
```
features/
  benefits/
    ris/
      v1.0.0.feature          # Loi 2002 (original)
      v1.1.0.feature          # Amendment 2005
      v2.0.0.feature          # Major reform 2010
      current.feature -> v2.0.0.feature  # Symlink to latest

src/rules/
  ris/
    v1.0.0.ts
    v1.1.0.ts
    v2.0.0.ts
    current.ts -> v2.0.0.ts

src/workflows/
  ris/
    v1.0.0.ts
    v2.0.0.ts
    current.ts -> v2.0.0.ts
```

### Pros
- ✅ Clear topic organization
- ✅ Semantic versioning (major.minor.patch)
- ✅ Easy to see evolution
- ✅ Symlink for "current" version

### Cons
- ❌ Need to maintain symlinks
- ❌ Version numbers might not match law dates
- ❌ Hard to know which law corresponds to which version

---

## Approach 2: Topic-Based with Law References

### Structure
```
features/
  benefits/
    ris/
      loi-2002-05-26.feature      # Original law
      loi-2005-XX-XX.feature       # Amendment
      loi-2010-XX-XX.feature       # Major reform
      current.feature -> loi-2010-XX-XX.feature

src/rules/
  ris/
    loi-2002-05-26.ts
    loi-2005-XX-XX.ts
    loi-2010-XX-XX.ts
    current.ts -> loi-2010-XX-XX.ts
```

### Pros
- ✅ Law dates visible in filenames
- ✅ Easy to find by law date
- ✅ Clear topic organization

### Cons
- ❌ Not semantic versioning
- ❌ Hard to know which is "newer" without dates
- ❌ Multiple laws might affect same version

---

## Approach 3: Topic-Based with Version + Law Metadata

### Structure
```
features/
  benefits/
    ris/
      v1.0.0-loi-2002-05-26.feature
      v1.1.0-loi-2005-XX-XX.feature
      v2.0.0-loi-2010-XX-XX.feature
      current.feature -> v2.0.0-loi-2010-XX-XX.feature

src/rules/
  ris/
    v1.0.0-loi-2002-05-26.ts
    v1.1.0-loi-2005-XX-XX.ts
    v2.0.0-loi-2010-XX-XX.ts
    current.ts -> v2.0.0-loi-2010-XX-XX.ts
```

### Pros
- ✅ Both version and law date visible
- ✅ Semantic versioning
- ✅ Easy to find by either version or law

### Cons
- ❌ Long filenames
- ❌ Still need symlinks

---

## Approach 4: Topic-Based with Index File

### Structure
```
features/
  benefits/
    ris/
      index.json                 # Version registry
      v1.0.0.feature
      v1.1.0.feature
      v2.0.0.feature

src/rules/
  ris/
    index.json                   # Version registry
    v1.0.0.ts
    v1.1.0.ts
    v2.0.0.ts
```

### Index File (`ris/index.json`)
```json
{
  "topic": "ris",
  "name": "Revenu d'Intégration Sociale",
  "currentVersion": "v2.0.0",
  "versions": [
    {
      "version": "v1.0.0",
      "law": "Loi du 26 mai 2002",
      "lawDate": "2002-05-26",
      "effectiveDate": "2002-07-31",
      "feature": "v1.0.0.feature",
      "rules": "v1.0.0.ts",
      "workflow": "v1.0.0.ts"
    },
    {
      "version": "v1.1.0",
      "law": "Loi du X (amendment)",
      "lawDate": "2005-XX-XX",
      "effectiveDate": "2005-XX-XX",
      "feature": "v1.1.0.feature",
      "rules": "v1.1.0.ts",
      "workflow": "v1.1.0.ts",
      "parentVersion": "v1.0.0"
    },
    {
      "version": "v2.0.0",
      "law": "Loi du Y (major reform)",
      "lawDate": "2010-XX-XX",
      "effectiveDate": "2010-XX-XX",
      "feature": "v2.0.0.feature",
      "rules": "v2.0.0.ts",
      "workflow": "v2.0.0.ts",
      "parentVersion": "v1.1.0"
    }
  ]
}
```

### Pros
- ✅ Clean filenames (just versions)
- ✅ Rich metadata in index
- ✅ Easy to query "current version"
- ✅ Can track relationships (parentVersion)
- ✅ Can track multiple laws per version

### Cons
- ❌ Need to maintain index files
- ❌ Need tooling to read index

---

## Approach 5: Hybrid - Topic + Current + Archive

### Structure
```
features/
  benefits/
    ris.feature                  # Current version (always latest)
    ris/
      archive/
        v1.0.0-loi-2002-05-26.feature
        v1.1.0-loi-2005-XX-XX.feature
        v2.0.0-loi-2010-XX-XX.feature
      index.json                 # Version history

src/rules/
  risRules.ts                    # Current version
  ris/
    archive/
      v1.0.0-loi-2002-05-26.ts
      v1.1.0-loi-2005-XX-XX.ts
      v2.0.0-loi-2010-XX-XX.ts
    index.json
```

### Pros
- ✅ Simple: `ris.feature` is always current
- ✅ Historical versions in archive
- ✅ Easy to find current version
- ✅ Easy to browse history

### Cons
- ❌ Need to update "current" file when version changes
- ❌ Archive might get large

---

## Approach 6: Topic-Based with Git-Like Versioning

### Structure
```
features/
  benefits/
    ris/
      HEAD.feature -> v2.0.0.feature    # Current (like git HEAD)
      v1.0.0.feature
      v1.1.0.feature
      v2.0.0.feature
      .versions.json                     # Version metadata

src/rules/
  ris/
    HEAD.ts -> v2.0.0.ts
    v1.0.0.ts
    v1.1.0.ts
    v2.0.0.ts
    .versions.json
```

### Pros
- ✅ Git-like familiar concept
- ✅ Clear "current" pointer
- ✅ Version history in metadata

### Cons
- ❌ Need to maintain HEAD symlinks
- ❌ Not standard in file systems

---

## Approach 7: Database-Driven with File References

### Structure
```
features/
  benefits/
    ris/
      v1.0.0.feature
      v1.1.0.feature
      v2.0.0.feature

src/rules/
  ris/
    v1.0.0.ts
    v1.1.0.ts
    v2.0.0.ts

database/
  versions.json                    # Central version registry
```

### Database (`database/versions.json`)
```json
{
  "topics": {
    "ris": {
      "name": "Revenu d'Intégration Sociale",
      "currentVersion": "v2.0.0",
      "versions": [
        {
          "version": "v1.0.0",
          "law": "Loi du 26 mai 2002",
          "lawDate": "2002-05-26",
          "effectiveDate": "2002-07-31",
          "files": {
            "feature": "features/benefits/ris/v1.0.0.feature",
            "rules": "src/rules/ris/v1.0.0.ts",
            "workflow": "src/workflows/ris/v1.0.0.ts"
          },
          "parentVersion": null
        },
        {
          "version": "v2.0.0",
          "law": "Loi du Y (major reform)",
          "lawDate": "2010-XX-XX",
          "effectiveDate": "2010-XX-XX",
          "files": {
            "feature": "features/benefits/ris/v2.0.0.feature",
            "rules": "src/rules/ris/v2.0.0.ts",
            "workflow": "src/workflows/ris/v2.0.0.ts"
          },
          "parentVersion": "v1.1.0"
        }
      ]
    }
  }
}
```

### Pros
- ✅ Centralized version management
- ✅ Rich metadata
- ✅ Easy to query
- ✅ Can track relationships
- ✅ Can generate "current" symlinks/aliases

### Cons
- ❌ Need to maintain database
- ❌ Need tooling to sync

---

## Approach 8: Topic-Based with Naming Convention

### Structure
```
features/
  benefits/
    ris/
      ris-v1.0.0.feature
      ris-v1.1.0.feature
      ris-v2.0.0.feature
      ris-current.feature -> ris-v2.0.0.feature

src/rules/
  ris/
    risRules-v1.0.0.ts
    risRules-v1.1.0.ts
    risRules-v2.0.0.ts
    risRules.ts -> risRules-v2.0.0.ts    # Current
```

### Pros
- ✅ Topic name in filename
- ✅ Version visible
- ✅ Current symlink

### Cons
- ❌ Redundant (topic name in folder + filename)
- ❌ Still need symlinks

---

## Recommendation: **Approach 4 + 7 Hybrid**

### Structure
```
features/
  benefits/
    ris/
      index.json                 # Version registry (local)
      v1.0.0.feature
      v1.1.0.feature
      v2.0.0.feature

src/rules/
  ris/
    index.json
    v1.0.0.ts
    v1.1.0.ts
    v2.0.0.ts

src/workflows/
  ris/
    index.json
    v1.0.0.ts
    v2.0.0.ts

database/
  topics.json                    # Central registry (optional)
```

### Why This Approach?

1. **Topic-Based Folders**: Clear organization by benefit/topic
2. **Semantic Versioning**: `v1.0.0`, `v1.1.0`, `v2.0.0` - familiar and meaningful
3. **Index Files**: Rich metadata per topic, easy to query
4. **No Symlinks**: Use index.json to find "current" version
5. **Scalable**: Can add central registry later if needed
6. **Tooling-Friendly**: Easy to build scripts around

### Index File Structure
```json
{
  "topic": "ris",
  "name": "Revenu d'Intégration Sociale",
  "currentVersion": "v2.0.0",
  "versions": [
    {
      "version": "v1.0.0",
      "specificationVersion": "1.0.0",
      "law": {
        "title": "Loi du 26 mai 2002 concernant le droit à l'intégration sociale",
        "date": "2002-05-26",
        "url": "https://...",
        "authority": "SPF Sécurité Sociale"
      },
      "effectiveDate": "2002-07-31",
      "files": {
        "feature": "v1.0.0.feature",
        "rules": "v1.0.0.ts",
        "workflow": "v1.0.0.ts"
      },
      "parentVersion": null,
      "changes": "Initial implementation"
    },
    {
      "version": "v2.0.0",
      "specificationVersion": "2.0.0",
      "law": {
        "title": "Loi du Y (major reform)",
        "date": "2010-XX-XX",
        "url": "https://...",
        "authority": "SPF Sécurité Sociale"
      },
      "effectiveDate": "2010-XX-XX",
      "files": {
        "feature": "v2.0.0.feature",
        "rules": "v2.0.0.ts",
        "workflow": "v2.0.0.ts"
      },
      "parentVersion": "v1.1.0",
      "changes": "Major reform: updated amounts, new categories"
    }
  ]
}
```

### Tooling

1. **Get Current Version**:
   ```typescript
   const index = JSON.parse(fs.readFileSync('features/benefits/ris/index.json'));
   const current = index.versions.find(v => v.version === index.currentVersion);
   ```

2. **List All Versions**:
   ```typescript
   const index = JSON.parse(fs.readFileSync('features/benefits/ris/index.json'));
   return index.versions;
   ```

3. **Find Version by Law**:
   ```typescript
   const index = JSON.parse(fs.readFileSync('features/benefits/ris/index.json'));
   return index.versions.find(v => v.law.date === '2002-05-26');
   ```

4. **Migration Script**: When new law comes out
   ```bash
   npm run version:new -- --topic=ris --law="Loi du X" --law-date="2025-XX-XX"
   ```

---

## Migration Strategy

### Phase 1: Create New Structure
1. Create topic folders: `features/benefits/ris/`, `src/rules/ris/`
2. Move existing files with version numbers
3. Create index.json files

### Phase 2: Update Tooling
1. Update scripts to read from index.json
2. Update pipeline to use versioned structure
3. Update documentation generation

### Phase 3: Backward Compatibility
1. Create symlinks or aliases for old paths (if needed)
2. Update imports gradually
3. Deprecate old structure

---

## Questions to Consider

1. **How to determine version numbers?**
   - Semantic versioning based on changes?
   - Based on law dates?
   - Based on specification versions?

2. **How to handle multiple laws affecting same version?**
   - One law = one version?
   - Multiple laws = one version (consolidated)?
   - One law = multiple versions (if major changes)?

3. **How to handle partial updates?**
   - Only rules change → new rules version, same feature?
   - Only feature changes → new feature version, same rules?

4. **How to handle deprecation?**
   - Keep old versions forever?
   - Archive after X years?
   - Mark as deprecated?

5. **How to handle cross-topic relationships?**
   - RIS depends on AGR?
   - Shared rules between topics?

---

## Next Steps

1. **Decide on approach** (recommendation: Approach 4 + 7 hybrid)
2. **Design index.json schema** in detail
3. **Create migration script** for existing files
4. **Update pipeline** to use new structure
5. **Update tooling** (scripts, generators, etc.)
6. **Document** the new structure

---

**What do you think? Which approach resonates with you? Any other ideas?**

