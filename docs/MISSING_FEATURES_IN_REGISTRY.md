# Missing Features in Registry: The Subdirectory Problem

## 🔍 The Issue

You have features and rules that exist but are **NOT tracked** in the registry:

### Examples:
- **Copropriété**: 50 features + 3 rules in `src/rules/copropriete/` (subdirectory)
- **Europe/Cour Européenne**: Rules in `src/rules/cour-europeenne/` (subdirectory)
- **Étrangers**: Rules in `src/rules/etrangers/` (subdirectory)
- **Propriété Intellectuelle**: Rules in `src/rules/propriete-intellectuelle/` (subdirectory)
- **Écologie**: Rules in `src/rules/ecologie/` (subdirectory)
- **Démocratie**: Rules in `src/rules/democratie/` (subdirectory)
- **Immobilier**: Rules in `src/rules/immobilier/` (subdirectory)
- **Statut Artiste**: Rules in `src/rules/statut-artiste/` (subdirectory)
- **Recours État**: Rules in `src/rules/recours-etat/` (subdirectory)
- **Droits Civils**: Rules in `src/rules/droits-civils/` (subdirectory)

## ❌ Why They're Missing

The migration script (`migrationService.ts`) only scans **top-level** rule files:

```typescript
// Line 40-42
const files = fs.readdirSync(rulesDir)  // Only reads top-level!
  .filter(f => f.endsWith('Rules.ts') && f !== 'index.ts')
```

**It doesn't scan subdirectories**, so:
- ✅ `src/rules/risRules.ts` → Found ✅
- ✅ `src/rules/agrRules.ts` → Found ✅
- ❌ `src/rules/copropriete/assembleeGeneraleRules.ts` → **MISSED** ❌
- ❌ `src/rules/cour-europeenne/admissibilityRules.ts` → **MISSED** ❌

## 📊 Impact

**Missing from registry:**
- ~50 copropriété features
- ~20+ subdirectory topics
- Hundreds of features total

**These features:**
- ✅ Exist in `features/` directory
- ✅ Have corresponding rules
- ❌ **NOT tracked** in `database/registry.json`
- ❌ **Won't be scraped** by `npm run scrape`
- ❌ **Won't be aggregated**
- ❌ **No lineage tracking**

## ✅ Solution: Recursive Discovery

Update the migration script to scan subdirectories recursively:

```typescript
private getAllTopicsFromRules(): Array<{ topicId: string; rulesPath: string; featurePath: string | null }> {
  const rulesDir = path.join(this.workspace, 'src/rules');
  if (!fs.existsSync(rulesDir)) {
    return [];
  }

  // Recursively find all Rules.ts files
  const allFiles: string[] = [];
  
  function scanDirectory(dir: string, basePath: string = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        scanDirectory(fullPath, relativePath);
      } else if (entry.isFile() && entry.name.endsWith('Rules.ts') && entry.name !== 'index.ts') {
        allFiles.push(relativePath);
      }
    }
  }
  
  scanDirectory(rulesDir);
  
  return allFiles.map(relativePath => {
    // Convert to topic ID
    // e.g., "copropriete/assembleeGeneraleRules.ts" -> "copropriete-assemblee-generale"
    // e.g., "cour-europeenne/admissibilityRules.ts" -> "cour-europeenne-admissibility"
    
    const parts = relativePath.replace('Rules.ts', '').split(path.sep);
    const topicId = parts.join('-').replace(/([A-Z])/g, '-$1').toLowerCase();
    
    return {
      topicId,
      rulesPath: `src/rules/${relativePath}`,
      featurePath: this.findFeatureFile(topicId, parts)
    };
  });
}
```

## 🎯 What This Means

**Current state:**
- Only ~102 topics tracked (top-level rules)
- ~50+ copropriété features **untracked**
- ~20+ subdirectory topics **untracked**

**After fix:**
- All topics discovered (top-level + subdirectories)
- All features tracked
- All rules tracked
- Complete lineage

## 💡 Recommendation

**Update the migration script** to recursively scan subdirectories so all features/rules are discovered and tracked.

Should I implement this fix?

