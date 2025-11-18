/**
 * Web Search Service for Finding Official Legal Sources
 * 
 * Uses web search to find official Belgian legal sources for topics
 */

export interface SearchResult {
  url: string;
  title: string;
  snippet: string;
}

export class LegalSourceSearchService {
  /**
   * Search for official Belgian legal source for a topic
   * Uses web_search tool (will be called from script)
   */
  async searchOfficialSource(
    topicId: string,
    topicName: string,
    webSearchFn: (query: string) => Promise<any>
  ): Promise<SearchResult[]> {
    // Build search queries
    const queries = [
      `${topicName} belgique loi arrêté ejustice.just.fgov.be`,
      `${topicName} belgique moniteur belge officiel`,
      `${topicName} belgique SPF service public fédéral`,
    ];
    
    const allResults: SearchResult[] = [];
    
    // Search with each query
    for (const query of queries) {
      try {
        const results = await webSearchFn(query);
        
        // Parse results from web_search tool
        // The tool returns an object with results array
        if (results && results.results && Array.isArray(results.results)) {
          const parsed = results.results.map((r: any) => ({
            url: r.url || r.link || '',
            title: r.title || '',
            snippet: r.snippet || r.description || ''
          })).filter((r: any) => r.url);
          
          allResults.push(...parsed);
        } else if (Array.isArray(results)) {
          // Fallback: if results is directly an array
          allResults.push(...results);
        }
      } catch (error) {
        console.error(`Search failed for query: ${query}`, error);
      }
    }
    
    // Remove duplicates
    const uniqueResults = Array.from(
      new Map(allResults.map(r => [r.url, r])).values()
    );
    
    return uniqueResults;
  }
  
  /**
   * Filter results to only official sources
   */
  filterOfficialSources(results: SearchResult[]): SearchResult[] {
    const officialDomains = [
      'ejustice.just.fgov.be',
      'etaamb.openjustice.be',
      'moniteur.be',
      'mb.cfwb.be',
      'justice.belgium.be',
      'belgium.be',
      'spf-',
      'fps-',
      'wallonie.be',
      'vlaanderen.be',
      'bruxelles.be',
      'onem.be',
      'rva.be',
      'sfpd.fgov.be',
      'pensions.belgium.be',
    ];
    
    return results.filter(result => {
      const urlLower = result.url.toLowerCase();
      return officialDomains.some(domain => urlLower.includes(domain));
    });
  }
}

