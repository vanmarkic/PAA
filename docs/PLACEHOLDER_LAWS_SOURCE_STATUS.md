# Current State: Placeholder Laws Source Discovery

## Summary

All 100 placeholder laws have been updated with URLs, but they all point to the **generic base URL**:
- `https://www.ejustice.just.fgov.be` (base domain only)

## Status

- ✅ **100/100 laws** have URLs set
- ⚠️ **100/100 laws** have generic base URL (not specific law pages)
- ❌ **0/100 laws** have specific law URLs

## Trust Score Analysis

Since all laws have the same generic base URL:
- **All 100 laws** effectively need specific URLs
- **All 100 laws** would need manual review to find specific law pages
- **Trust scores** cannot be properly assigned without specific URLs

## What Needs to Be Done

1. **Find specific law URLs** for each of the 100 topics
2. **Extract URLs** from ejustice.just.fgov.be for each specific law/arrêté
3. **Score each URL** based on trustworthiness
4. **Update registry** with specific URLs and trust scores
5. **List all sources with score < 8/10** for manual review

## Example Topics Needing Specific URLs

- `abattement-succession` → Need specific succession law URL
- `abonnement-social-transport` → Need specific transport tariff law URL
- `accident-travail` → Need specific work accident law URL (e.g., loi 10 avril 1971)
- `accompagnement-social` → Need specific CPAS law URL (e.g., loi organique 8 juillet 1976)
- `aide-alimentaire` → Need specific food aid law URL

## Next Steps

1. Search for specific Belgian law URLs for each topic
2. Extract exact ejustice.just.fgov.be URLs for each law
3. Score each URL (10/10 for ejustice, 8-9/10 for other official sites)
4. Update registry with specific URLs
5. Show all sources with score < 8/10

## Recommendation

Since web search is not easily finding specific ejustice.just.fgov.be URLs, we may need to:
- Use more specific search queries with law names and dates
- Manually search ejustice.just.fgov.be for each topic
- Or accept that some topics may not have direct law URLs and use general resource pages

