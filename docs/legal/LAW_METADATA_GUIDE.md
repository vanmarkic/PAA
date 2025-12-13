# Law Metadata: Scraping vs Manual Entry

## ❌ Scraping Does NOT Get Law Names/Dates

**Scraping** (`npm run scrape`) is for:
- ✅ Detecting **changes** in law content (hash comparison)
- ✅ Generating change summaries (Claude API)
- ✅ Triggering file regeneration when laws change

**Scraping does NOT:**
- ❌ Discover law names
- ❌ Extract law dates
- ❌ Find law URLs
- ❌ Identify authorities

## ✅ What You Need to Do

### For Known Laws (RIS, AGR, Indexation)

**Already done!** `db:init` already has real metadata:
- ✅ Law names
- ✅ Law dates
- ✅ URLs
- ✅ Authorities

**No scraping needed** - these are correct.

### For Placeholder Laws (from `db:migrate`)

**You need to manually update** placeholder laws with real metadata.

#### Option 1: Manual Update in `database/registry.json`

```json
{
  "laws": {
    "placeholder-aide-logement": {
      "lawId": "loi-2021-07-15",  // Change from placeholder
      "title": "Arrêté du Gouvernement de la Région de Bruxelles-Capitale...",  // Real title
      "lawDate": "2021-07-15",  // Real date
      "url": "https://www.ejustice.just.fgov.be/...",  // Real URL
      "authority": "Région de Bruxelles-Capitale",  // Real authority
      // ... rest stays the same
    }
  }
}
```

#### Option 2: Use `add-law` Script

```bash
npm run add-law -- \
  --url "https://www.ejustice.just.fgov.be/..." \
  --title "Arrêté du Gouvernement..." \
  --authority "Région de Bruxelles-Capitale"
```

This will:
- Create a new law with real metadata
- Generate feature/rules files
- Add to registry

#### Option 3: Use Existing Metadata Sources

You have `src/domain/legalMetadata.ts` with metadata for 102 machines. You could:
1. Extract metadata from there
2. Update placeholder laws manually
3. Or create a script to sync them (future enhancement)

## 🔄 When to Scrape

**Scrape AFTER you have real law metadata:**

```bash
# 1. Update placeholder laws with real metadata (manual)
# 2. Then scrape to detect changes
npm run scrape
```

Scraping will:
- ✅ Fetch content from the real URLs
- ✅ Detect if laws have changed
- ✅ Generate summaries of changes
- ✅ Regenerate files if needed

## 📋 Recommended Workflow

### Step 1: Initialize Database
```bash
npm run db:init
```
✅ Creates known laws with real metadata

### Step 2: Migrate Files
```bash
npm run db:migrate
```
⚠️ Creates placeholder laws (need updates)

### Step 3: Update Placeholder Laws
**Manual step**: Update `database/registry.json` with real law metadata

Or use existing sources:
- Check `src/domain/legalMetadata.ts`
- Check `src/legal-sources/belgianLegalSources.ts`
- Search ejustice.just.fgov.be

### Step 4: Scrape (Optional)
```bash
npm run scrape -- --dry-run  # Test first
npm run scrape               # Real scraping
```
✅ Detects changes in law content
✅ Updates files if laws changed

## 🎯 Summary

| Task | Method | When |
|------|--------|------|
| **Get law names/dates** | Manual entry or existing metadata | After `db:migrate` |
| **Detect law changes** | Scraping (`npm run scrape`) | After metadata is correct |
| **Generate files** | Automatic (via scraping) | When changes detected |

**Answer**: No, you don't need to scrape to get law names/dates. Scraping is for detecting changes, not discovering metadata. Update placeholder laws manually first, then scrape to detect future changes.

