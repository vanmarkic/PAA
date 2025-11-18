/**
 * Change Summary Service
 * 
 * Uses Claude API to generate rich change summaries
 * when hash-based detection finds changes
 */

import { ClaudeAPIClient } from '../ai/claudeAPIClient';
import { ChangeSummary, ScrapingMetadata } from './registryService';

export class ChangeSummaryService {
  constructor(private claudeClient: ClaudeAPIClient) {}

  /**
   * Generate change summary using Claude API
   */
  async generateChangeSummary(
    scraping: ScrapingMetadata,
    currentContent: string,
    previousContent: string | null
  ): Promise<ChangeSummary | null> {
    if (!scraping.changeDetection.detectedChanges) {
      return null;  // No changes, no summary
    }

    const prompt = this.buildChangeSummaryPrompt(
      scraping,
      currentContent,
      previousContent
    );

    try {
      const response = await this.claudeClient.callClaudeAPI(prompt);
      
      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse Claude response as JSON');
      }

      const summary = JSON.parse(jsonMatch[0]);

      return {
        generatedBy: 'claude-opus-4-1',
        generatedAt: new Date().toISOString(),
        changeType: summary.changeType,
        summary: summary.summary,
        changes: summary.changes || {},
        affectedArticles: summary.affectedArticles || [],
        impact: summary.impact
      };
    } catch (error) {
      console.error('Failed to generate change summary:', error);
      
      // Fallback summary
      return {
        generatedBy: 'fallback',
        generatedAt: new Date().toISOString(),
        changeType: 'minor_update',
        summary: 'Des modifications ont été détectées dans la loi.',
        changes: {},
        affectedArticles: [],
        impact: 'medium'
      };
    }
  }

  private buildChangeSummaryPrompt(
    scraping: ScrapingMetadata,
    currentContent: string,
    previousContent: string | null
  ): string {
    return `Compare these two versions of a Belgian law and summarize what changed:

PREVIOUS VERSION (hash: ${scraping.changeDetection.previousHash}):
${previousContent?.substring(0, 10000) || 'N/A (première version)'}

CURRENT VERSION (hash: ${scraping.changeDetection.hash}):
${currentContent.substring(0, 10000)}

Analyze and return JSON with:
- changeType: "amounts_updated" | "conditions_updated" | "new_article" | "removed_article" | "major_reform" | "minor_update"
- summary: Human-readable summary in French (1-2 sentences)
- changes: Detailed changes object with:
  - amounts: { [key]: { old: number, new: number, change: string } }
  - articles: { added: string[], removed: string[], modified: string[] }
  - conditions: string[] (list of changed conditions)
- affectedArticles: Array of article numbers affected (e.g., ["Article 14", "Article 3"])
- impact: "low" | "medium" | "high"

CRITICAL: Return ONLY valid JSON, no markdown code blocks, no explanation.

Example:
{
  "changeType": "amounts_updated",
  "summary": "Les montants RIS ont été indexés: personne isolée passe de 1000.00€ à 1070.49€ (+7.05%).",
  "changes": {
    "amounts": {
      "isolated": { "old": 1000.00, "new": 1070.49, "change": "+70.49€ (+7.05%)" }
    }
  },
  "affectedArticles": ["Article 14"],
  "impact": "medium"
}`;
  }
}

