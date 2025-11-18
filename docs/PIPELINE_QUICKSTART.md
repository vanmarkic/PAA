# 🚀 Pipeline Quick Start Guide

## Overview

The complete pipeline automates the process of adding a new law to the system:

```
Legal Source (URL/Text) 
  → Extract Metadata
  → Generate Gherkin Feature
  → Generate Rules
  → Generate Machine (if needed)
  → Generate Metadata & Lineage
```

## Prerequisites

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Claude API key** (choose one method):
   
   **Option A: Create `.env.local` file** (recommended):
   ```bash
   echo "ANTHROPIC_API_KEY=your-api-key-here" > .env.local
   ```
   
   **Option B: Create `.env` file**:
   ```bash
   echo "ANTHROPIC_API_KEY=your-api-key-here" > .env
   ```
   
   **Option C: Export as environment variable**:
   ```bash
   export ANTHROPIC_API_KEY="your-api-key-here"
   ```

   Note: `.env.local` takes precedence over `.env`, which takes precedence over environment variables.
   
   Get your API key from: https://console.anthropic.com/

## Usage

### Option 1: From URL

```bash
npm run add-law -- --url="https://www.ejustice.just.fgov.be/..."
```

The pipeline will:
1. Fetch the legal text from the URL
2. Extract metadata (authority, title, dates, etc.)
3. Generate all components

### Option 2: From Text

```bash
npm run add-law -- --text="Loi du 26 mai 2002..." --title="Loi concernant le droit à l'intégration sociale" --authority="SPF"
```

Required flags when using `--text`:
- `--title`: Full title of the law/decree
- `--authority`: Authority (SPF, ONEM, ONSS, SPW, VDAB, Actiris, or Moniteur Belge)

## What Gets Generated

1. **Feature File**: `features/benefits/{feature-id}.feature`
   - Gherkin specification
   - Includes legal metadata
   - All eligibility scenarios

2. **Rules File**: `src/rules/{feature-id}Rules.ts`
   - TypeScript implementation
   - json-rules-engine patterns
   - Follows conversionService.ts patterns

3. **Machine File** (if needed): `src/workflows/{feature-id}Machine.ts`
   - XState state machine
   - Only generated if workflow is needed
   - Follows conversionMachine.ts patterns

4. **Metadata Files**: Auto-generated
   - Features metadata
   - Rules metadata
   - Machines metadata
   - Lineage information

## Example

```bash
# Add RIS law from URL
npm run add-law -- --url="https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2002052647&table_name=loi"

# Or from text
npm run add-law -- \
  --text="Loi du 26 mai 2002 concernant le droit à l'intégration sociale..." \
  --title="Loi concernant le droit à l'intégration sociale" \
  --authority="SPF"
```

## After Generation

1. **Review generated files**:
   - Check feature file for accuracy
   - Verify rules implementation
   - Review machine (if generated)

2. **Update legal metadata**:
   - Edit `src/domain/legalMetadata.ts`
   - Add entry to `MACHINES_LEGAL_METADATA`

3. **Run tests**:
   ```bash
   npm test
   ```

4. **Check version compliance**:
   ```bash
   npm run check:versions
   ```

5. **Build documentation**:
   ```bash
   npm run docs:build
   ```

## Troubleshooting

### "ANTHROPIC_API_KEY not set"
- Make sure you've exported the environment variable
- Or create a `.env` file with the key

### "Feature generation failed"
- Check that the legal text is valid
- Verify the URL is accessible
- Review error message for details

### "Rules generation failed"
- Check that feature file was generated correctly
- Verify TypeScript compilation
- Review warnings in output

### "Machine not needed"
- This is normal for simple eligibility checks
- Machines are only generated for complex workflows

## Pipeline Steps Explained

1. **Extract Legal Source**: Fetches and parses legal text, extracts metadata
2. **Generate Feature**: Converts legal text to Gherkin using Claude
3. **Generate Rules**: Creates TypeScript rules from feature
4. **Validate Compliance**: Checks version compatibility
5. **Generate Machine**: Creates XState machine if workflow needed
6. **Generate Metadata**: Creates all metadata files
7. **Generate Lineage**: Builds relationship graph

## Architecture

- **ClaudeAPIClient**: Real Claude API integration
- **PipelineOrchestrator**: Orchestrates the entire flow
- **claudeIntegration**: Generation functions
- **conversionService**: Legal text conversion patterns
- **conversionMachine**: XState machine for conversion pipeline

## Next Steps

- Review generated files
- Test the rules
- Update legal metadata
- Build documentation

