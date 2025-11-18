# 🔍 Root Cause Analysis: Markdown Wrapper Issue

## Problem

Generated files start with markdown code block wrappers:
- Feature files: `\`\`\`gherkin` at the start
- Rules files: `\`\`\`typescript` at the start

## Root Cause

The markdown wrappers come from **the prompt examples themselves**.

### Location 1: Feature Generation Prompt

**File**: `src/ai/claudeIntegration.ts`  
**Function**: `generateFeatureGenerationPrompt()`  
**Lines**: 625-645

```typescript
5. Follow this structure:
\`\`\`gherkin          // ← This is the problem!
# language: fr
...
\`\`\`
```

**Why it happens**: Claude sees the markdown code block in the example and mimics that format in its response, even though we say "Return ONLY the feature file content".

### Location 2: Rules Generation Prompt

**File**: `src/ai/claudeIntegration.ts`  
**Function**: `generateRulesGenerationPrompt()`  
**Lines**: 734-737

```typescript
## Example Rules Pattern (Follow This Structure)
\`\`\`typescript        // ← This is the problem!
${exampleRules}
\`\`\`
```

**Why it happens**: Same issue - Claude copies the format from the example.

## Why Markdown Blocks Are in the Prompt

The markdown code blocks are used in the prompt to:
1. **Format examples nicely** - Makes the prompt more readable
2. **Show structure** - Clearly demonstrates the expected format
3. **Syntax highlighting** - Helps Claude understand the file type

However, Claude interprets this as: "Format your response the same way as the examples."

## Solutions

### Solution 1: Remove Markdown from Examples (Recommended)

Change the prompt to use **indented code blocks** instead of markdown:

```typescript
// BEFORE (causes markdown wrapper):
5. Follow this structure:
\`\`\`gherkin
# language: fr
...
\`\`\`

// AFTER (no markdown wrapper):
5. Follow this structure (raw content, no markdown):
    # language: fr
    ...
```

### Solution 2: Explicit Instruction (Add to existing)

Add explicit instruction to NOT include markdown:

```typescript
## CRITICAL REQUIREMENTS
- Return RAW file content, NO markdown code blocks
- Do NOT include \`\`\`gherkin or \`\`\`typescript
- Start directly with # language: fr (for features) or import statements (for rules)
```

### Solution 3: Post-Processing (Safety Net)

Add a cleanup function to strip markdown wrappers:

```typescript
function stripMarkdownWrapper(content: string): string {
  // Remove markdown code block wrappers
  return content
    .replace(/^```(?:gherkin|typescript|ts)?\n?/gm, '')
    .replace(/\n?```\s*$/gm, '')
    .trim();
}
```

### Solution 4: Use Different Example Format

Use plain text examples with clear delimiters:

```typescript
5. Follow this structure:
---START OF FILE---
# language: fr
...
---END OF FILE---
```

## Recommended Fix

**Best approach**: Combine Solution 1 + Solution 2 + Solution 3

1. **Remove markdown from examples** (Solution 1)
2. **Add explicit instruction** (Solution 2)  
3. **Add post-processing** (Solution 3) as safety net

This ensures:
- Prompts don't encourage markdown
- Explicit instruction prevents it
- Post-processing catches any edge cases

## Where Should Markdown Be?

**Answer**: Nowhere in the generated files!

Markdown code blocks should ONLY be:
- In documentation files (`.md`)
- In prompt examples (but we'll change this)
- NOT in generated source files (`.feature`, `.ts`)

## Implementation

The fix should be in:
1. `src/ai/claudeIntegration.ts` - Update prompt generation functions
2. `src/ai/claudeIntegration.ts` - Add post-processing function
3. `src/ai/pipelineOrchestrator.ts` - Apply post-processing before writing files

---

**Status**: ✅ **Root cause identified** - Markdown in prompt examples causes Claude to mimic the format

