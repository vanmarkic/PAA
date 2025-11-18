/**
 * Claude API Client
 * 
 * Real implementation of Claude API integration using Anthropic SDK
 * Replaces mock implementations in conversionService.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import { ConversionLevel } from '../domain/types';

export interface ClaudeAPIConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
}

/**
 * Real Claude API Client implementing LLMService interface
 */
export class ClaudeAPIClient {
  private client: Anthropic;
  private config: ClaudeAPIConfig;

  constructor(config: ClaudeAPIConfig) {
    this.config = {
      model: config.model || 'claude-opus-4-1',
      maxTokens: config.maxTokens || 4096,
      ...config,
    };
    
    if (!this.config.apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required. Set it as environment variable or pass in config.');
    }

    this.client = new Anthropic({ apiKey: this.config.apiKey });
  }

  /**
   * Call Claude API with a prompt
   */
  async callClaudeAPI(prompt: string, options?: { maxTokens?: number }): Promise<string> {
    try {
      const message = await this.client.messages.create({
        model: this.config.model!,
        max_tokens: options?.maxTokens || this.config.maxTokens || 4096,
        messages: [{ role: 'user', content: prompt }],
      });

      // Extract text from response
      if (message.content[0].type === 'text') {
        return message.content[0].text;
      }

      throw new Error('Unexpected response type from Claude API');
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        throw new Error(`Claude API error: ${error.message} (status: ${error.status})`);
      }
      throw error;
    }
  }

  /**
   * Convert legal text to common language
   * Implements LLMService interface for conversionService.ts
   */
  async convert(text: string, level: ConversionLevel): Promise<string> {
    const prompt = `Convert this Belgian legal text to ${level} language:

${text}

Requirements:
- Maintain all legal concepts
- Use simple vocabulary
- Preserve semantic accuracy
- Format as Gherkin feature if level is 'gherkin'
- Keep all monetary amounts exact
- Preserve all dates and legal references`;

    return this.callClaudeAPI(prompt);
  }

  /**
   * Detect ambiguities in legal text
   * Implements LLMService interface for conversionService.ts
   */
  async detectAmbiguity(text: string): Promise<boolean> {
    const prompt = `Analyze this Belgian legal text for ambiguities:

${text}

Return ONLY "true" if ambiguous, "false" if clear. No explanation.`;

    const response = await this.callClaudeAPI(prompt, { maxTokens: 100 });
    return response.toLowerCase().trim().includes('true');
  }

  /**
   * Extract legal structure from text
   * Implements LLMService interface for conversionService.ts
   */
  async extractStructure(text: string): Promise<any> {
    const prompt = `Extract the legal structure from this Belgian legal text. Return ONLY valid JSON:

${text}

Return JSON with this structure:
{
  "type": "obligation" | "right" | "procedure" | "condition",
  "subject": "who/what is affected",
  "action": "what must be done",
  "conditions": ["condition1", "condition2"],
  "articles": ["Article 1", "Article 2"],
  "amounts": {"type": value},
  "dates": {"effective": "YYYY-MM-DD", "publication": "YYYY-MM-DD"}
}

Return ONLY the JSON, no markdown, no explanation.`;

    const response = await this.callClaudeAPI(prompt);
    
    // Try to extract JSON from response (might have markdown code blocks)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        throw new Error(`Failed to parse JSON from Claude response: ${e}`);
      }
    }

    throw new Error('No JSON found in Claude response');
  }

  /**
   * Extract legal source metadata from web content
   */
  async extractLegalSourceMetadata(
    url: string,
    htmlContent?: string
  ): Promise<{
    authority: string;
    title: string;
    officialUrl: string;
    publicationDate?: string;
    effectiveDate?: string;
    articles?: string[];
    referenceNumber?: string;
  }> {
    const content = htmlContent || `[Content from ${url}]`;
    
    const prompt = `Extract legal source metadata from this Belgian legal website:

URL: ${url}
Content: ${content.substring(0, 10000)}

Return ONLY valid JSON with this structure:
{
  "authority": "SPF" | "ONEM" | "ONSS" | "SPW" | "VDAB" | "Actiris" | "Moniteur Belge",
  "title": "Full title of the law/decree",
  "officialUrl": "${url}",
  "publicationDate": "YYYY-MM-DD",
  "effectiveDate": "YYYY-MM-DD",
  "articles": ["Article 1", "Article 2"],
  "referenceNumber": "law/decree number"
}

Return ONLY the JSON, no markdown, no explanation.`;

    const response = await this.callClaudeAPI(prompt);
    
    // Extract JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        throw new Error(`Failed to parse legal source metadata: ${e}`);
      }
    }

    throw new Error('No JSON found in legal source metadata response');
  }
}

