# Manual Law Search Guide

## Current Status

- **6 laws** have specific URLs (✅)
- **94 laws** need manual search (⚠️)
- **100 total** placeholder laws

## Laws Already Updated

1. **ris** - Loi du 26 mai 2002 concernant le droit à l'intégration sociale
2. **accident-travail** - Loi du 10 avril 1971 sur les accidents du travail
3. **accompagnement-social** - Loi organique du 8 juillet 1976 des CPAS
4. **aide-sociale** - Loi organique du 8 juillet 1976 des CPAS
5. **allocation-integration** - Loi du 26 mai 2002 concernant le droit à l'intégration sociale
6. **allocations-chomage** - Loi du 20 décembre 2001 concernant les allocations de chômage
7. **allocations-familiales** - Loi du 19 août 1930 concernant les allocations familiales

## Topics Needing Manual Search (94)

See `database/manual-law-search-needed.json` for full list.

## Manual Search Process

### Using ejustice.just.fgov.be

1. **Go to**: https://www.ejustice.just.fgov.be/cgi/welcome.pl
2. **Select**: "Législation consolidée" (Justel database)
3. **Search for**: Topic name (e.g., "abattement succession")
4. **Find relevant law**: Look for laws matching the topic
5. **Extract URL**: Copy the specific law URL (format: `ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=YYYYMMDDNN&table_name=loi`)
6. **Update registry**: Add URL to the database

### Batch Processing Strategy

Process in batches of 10:
- Batch 1: abattement-succession through aide-menagere
- Batch 2: aide-mobilite through allocation-handicapes
- Batch 3: allocations-etudes through copropriete
- ... and so on

### Trust Scoring

- Specific law URL on ejustice.just.fgov.be: **10/10**
- Generic ejustice.just.fgov.be: **8/10**
- Other official sources (moniteur.be, etc.): **8-9/10**

## Next Steps

1. Review `database/manual-law-search-needed.json`
2. Use Chrome DevTools or browser to search ejustice.just.fgov.be
3. For each topic:
   - Search for relevant law
   - Extract specific URL
   - Update registry with: `db.updateLaw(lawId, { url: specificUrl })`

## Automation Note

Web search doesn't return specific law URLs automatically. Manual search on ejustice.just.fgov.be is the most reliable method to find exact law pages for each topic.

## Example Searches

- **abattement-succession**: Search "code droits succession abattement"
- **abonnement-social-transport**: Search "transport public tarif social"
- **aide-alimentaire**: Search "aide alimentaire CPAS"
- **aide-juridique**: Search "aide juridique première ligne"

## Sources with Score < 8/10

Currently: **0 sources** (all are either specific 10/10 or generic 8/10 official domain)

After manual search, all sources should be 10/10 (specific law pages).

