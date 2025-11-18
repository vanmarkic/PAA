# Finding Official Sources for Placeholder Laws

## Summary

I've created a script (`scripts/db-find-sources.ts`) that:

1. **Processes placeholder laws in parallel batches** (5 at a time to avoid rate limits)
2. **Searches for official Belgian sources** using web_search tool
3. **Scores each source** based on trustworthiness (10/10 for ejustice.just.fgov.be, 8-9/10 for other official sites)
4. **Updates the registry** with found sources (only sources with score ≥8/10)
5. **Shows all sources with score < 8/10** for manual review

## Trust Scoring System

- **10/10**: ejustice.just.fgov.be, etaamb.openjustice.be
- **9/10**: moniteur.be, mb.cfwb.be, justice.belgium.be
- **8/10**: SPF/FPS websites, belgium.be, regional government sites
- **7/10**: ONEM, RVA, pensions services
- **6/10**: Wikipedia, commercial legal databases
- **5/10**: Unknown sources (needs verification)
- **3/10**: Blogs, forums

## Current Status

- ✅ Script structure created
- ✅ Trust scoring system implemented
- ✅ Parallel batch processing ready
- ⚠️ Web search needs to be more specific for Belgian sources
- ⚠️ Need to process all 100 placeholder laws

## Next Steps

1. **Run the script** with web_search tool to process all 100 placeholder laws
2. **Review sources with score < 8/10** and manually verify/update
3. **Update registry** with all found official sources

## Usage

The script will be executed with web_search tool available. It processes laws in batches of 5 to avoid rate limits.

```bash
# The script is ready but needs web_search tool integration
# It will process all placeholder laws and update the registry
```

## Example Output

After processing, the script will show:
- ✅ High trust sources (≥8/10): X
- ⚠️ Low trust sources (<8/10): Y
- ❌ No source found: Z

And will list all sources with score < 8/10 for manual review.

