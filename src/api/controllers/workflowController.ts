/**
 * Workflow Controller
 * Handles workflow-related endpoints
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { getAllWorkflowMetadata, getWorkflowMetadataById } from '../../utils/workflowMetadataExtractor';
import { checkRISEligibility } from '../regles-eligibilite/risRules';
import { RISUser } from '../modele-metier/risTypes';
import { createAuditLog } from '../../utils/auditService';
import { AuthenticatedUser } from '../../middleware/auth';

// Define workflow categories
const workflowCategories = [
  { id: 'social', name: 'Protection Sociale', count: 0, color: 'purple' },
  { id: 'family', name: 'Famille & Enfance', count: 0, color: 'pink' },
  { id: 'housing', name: 'Logement', count: 0, color: 'blue' },
  { id: 'immigration', name: 'Immigration', count: 0, color: 'green' },
  { id: 'health', name: 'Santé & Handicap', count: 0, color: 'red' },
  { id: 'employment', name: 'Emploi', count: 0, color: 'orange' },
  { id: 'tax', name: 'Fiscalité', count: 0, color: 'yellow' },
  { id: 'education', name: 'Éducation', count: 0, color: 'indigo' }
];

// Workflow complexity calculation
function calculateComplexity(stateCount: number, eventCount: number): 'Simple' | 'Medium' | 'Complex' {
  const totalComplexity = stateCount + eventCount;
  if (totalComplexity <= 12) return 'Simple';
  if (totalComplexity <= 25) return 'Medium';
  return 'Complex';
}

// Category mapping based on workflow ID or keywords
function determineCategory(id: string, name: string, description: string): string {
  const lowerName = name.toLowerCase();
  const lowerDesc = description.toLowerCase();
  const lowerId = id.toLowerCase();

  if (lowerId.includes('ris') || lowerId.includes('chomage') || lowerId.includes('agr') ||
      lowerId.includes('grapa') || lowerName.includes('social') || lowerDesc.includes('social')) {
    return 'social';
  }
  if (lowerId.includes('famille') || lowerId.includes('naissance') || lowerId.includes('allocation') ||
      lowerId.includes('enfant') || lowerId.includes('garde')) {
    return 'family';
  }
  if (lowerId.includes('logement') || lowerId.includes('locati') || lowerId.includes('habitat')) {
    return 'housing';
  }
  if (lowerId.includes('sante') || lowerId.includes('handicap') || lowerId.includes('medical') ||
      lowerId.includes('maladie')) {
    return 'health';
  }
  if (lowerId.includes('travail') || lowerId.includes('emploi') || lowerId.includes('licenci') ||
      lowerId.includes('demission') || lowerId.includes('contrat')) {
    return 'employment';
  }
  if (lowerId.includes('impot') || lowerId.includes('deduction') || lowerId.includes('credit') ||
      lowerId.includes('fiscal') || lowerId.includes('taxe') || lowerId.includes('exoneration')) {
    return 'tax';
  }
  if (lowerId.includes('ecole') || lowerId.includes('etude') || lowerId.includes('formation') ||
      lowerId.includes('bourse')) {
    return 'education';
  }

  return 'social'; // Default category
}

/**
 * Get all workflows with metadata
 */
export async function getAllWorkflows(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const workflowsMetadata = await getAllWorkflowMetadata();

    // Transform metadata to match frontend Machine interface
    const workflows = workflowsMetadata.map(meta => {
      const states = meta.states.map(s => s.name);
      const events = Array.from(new Set(meta.states.flatMap(s => s.transitions.map(t => t.event))));
      const stateCount = states.length;
      const eventCount = events.length;
      const category = determineCategory(meta.id, meta.name, meta.description);
      const complexity = calculateComplexity(stateCount, eventCount);

      // Generate keywords from name and description
      const keywords = [
        ...meta.id.split(/(?=[A-Z])/).map(w => w.toLowerCase()),
        ...meta.name.toLowerCase().split(' '),
        category
      ].filter(k => k.length > 2);

      return {
        id: meta.id,
        name: meta.name,
        category,
        description: meta.description,
        plainLanguage: meta.plainLanguageDescription || meta.description,
        states,
        events,
        initialState: meta.initialState,
        complexity,
        stateCount,
        eventCount,
        legalReferences: meta.legalReferences || [],
        keywords,
        lastModified: new Date().toISOString().split('T')[0],
        version: meta.version || '1.0.0',
        gherkinFile: meta.gherkinFile
      };
    });

    // Update category counts
    const categoryCounts = new Map<string, number>();
    workflows.forEach(w => {
      categoryCounts.set(w.category, (categoryCounts.get(w.category) || 0) + 1);
    });

    const categories = workflowCategories.map(c => ({
      ...c,
      count: categoryCounts.get(c.id) || 0
    })).filter(c => c.count > 0);

    return reply.send({
      success: true,
      workflows,
      categories
    });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return reply.status(500).send({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch workflows'
    });
  }
}

/**
 * Get workflow by ID
 */
export async function getWorkflowById(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const metadata = await getWorkflowMetadataById(id);

    if (!metadata) {
      return reply.status(404).send({
        success: false,
        error: `Workflow with ID '${id}' not found`
      });
    }

    // Transform metadata to match frontend Machine interface
    const states = metadata.states.map(s => s.name);
    const events = Array.from(new Set(metadata.states.flatMap(s => s.transitions.map(t => t.event))));
    const stateCount = states.length;
    const eventCount = events.length;
    const category = determineCategory(metadata.id, metadata.name, metadata.description);
    const complexity = calculateComplexity(stateCount, eventCount);

    const keywords = [
      ...metadata.id.split(/(?=[A-Z])/).map(w => w.toLowerCase()),
      ...metadata.name.toLowerCase().split(' '),
      category
    ].filter(k => k.length > 2);

    const workflow = {
      id: metadata.id,
      name: metadata.name,
      category,
      description: metadata.description,
      plainLanguage: metadata.plainLanguageDescription || metadata.description,
      states,
      events,
      initialState: metadata.initialState,
      complexity,
      stateCount,
      eventCount,
      legalReferences: metadata.legalReferences || [],
      keywords,
      lastModified: new Date().toISOString().split('T')[0],
      version: metadata.version || '1.0.0',
      gherkinFile: metadata.gherkinFile,
      // Include detailed state information for the detail view
      detailedStates: metadata.states
    };

    return reply.send({
      success: true,
      workflow
    });
  } catch (error) {
    console.error(`Error fetching workflow ${request.params.id}:`, error);
    return reply.status(500).send({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch workflow'
    });
  }
}

/**
 * Check eligibility for a specific workflow
 */
export async function checkWorkflowEligibility(
  request: FastifyRequest<{ Params: { id: string }; Body: any }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const user = (request as any).user as AuthenticatedUser;

  try {
    let result: any;

    // Handle specific workflow eligibility checks
    switch (id) {
      case 'risWorkflow':
      case 'risMachine':
        const bodyData = request.body as Record<string, any>;
        const risUser: RISUser = {
          id: user.id,
          age: bodyData.age || 25,
          category: bodyData.category || 'isolé',
          residencyStatus: bodyData.residencyStatus || 'belgian-citizen',
          monthlyIncome: bodyData.monthlyIncome || 0,
          householdIncome: bodyData.householdIncome,
          patrimonyValue: bodyData.patrimonyValue || 0,
          isFullTimeStudent: bodyData.isFullTimeStudent || false,
          childrenInCharge: bodyData.childrenInCharge || 0,
          isCurrentlyReceivingRIS: bodyData.isCurrentlyReceivingRIS || false
        };
        result = await checkRISEligibility(risUser);
        break;

      // Add more workflow-specific eligibility checks here
      default:
        return reply.status(400).send({
          success: false,
          error: `Eligibility check not implemented for workflow: ${id}`
        });
    }

    // Audit log
    await createAuditLog({
      action: 'workflow-eligibility-check',
      resourceType: 'workflow',
      resourceId: id,
      context: {
        actorId: user.id,
        actorRole: user.role,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      },
      tags: [id, 'eligibility-check']
    });

    return reply.send({
      success: true,
      result
    });
  } catch (error) {
    console.error(`Error checking eligibility for workflow ${id}:`, error);
    return reply.status(500).send({
      success: false,
      error: error instanceof Error ? error.message : 'Eligibility check failed'
    });
  }
}

/**
 * Get workflow categories
 */
export async function getCategories(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const workflowsMetadata = await getAllWorkflowMetadata();

    // Count workflows per category
    const categoryCounts = new Map<string, number>();
    workflowsMetadata.forEach(meta => {
      const category = determineCategory(meta.id, meta.name, meta.description);
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
    });

    const categories = workflowCategories.map(c => ({
      ...c,
      count: categoryCounts.get(c.id) || 0
    })).filter(c => c.count > 0);

    return reply.send({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return reply.status(500).send({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch categories'
    });
  }
}

/**
 * Search workflows
 */
export async function searchWorkflows(
  request: FastifyRequest<{ Querystring: { q?: string; category?: string; complexity?: string } }>,
  reply: FastifyReply
) {
  try {
    const { q, category, complexity } = request.query;
    const workflowsMetadata = await getAllWorkflowMetadata();

    // Transform and filter workflows
    let workflows = workflowsMetadata.map(meta => {
      const states = meta.states.map(s => s.name);
      const events = Array.from(new Set(meta.states.flatMap(s => s.transitions.map(t => t.event))));
      const stateCount = states.length;
      const eventCount = events.length;
      const workflowCategory = determineCategory(meta.id, meta.name, meta.description);
      const workflowComplexity = calculateComplexity(stateCount, eventCount);

      const keywords = [
        ...meta.id.split(/(?=[A-Z])/).map(w => w.toLowerCase()),
        ...meta.name.toLowerCase().split(' '),
        workflowCategory
      ].filter(k => k.length > 2);

      return {
        id: meta.id,
        name: meta.name,
        category: workflowCategory,
        description: meta.description,
        plainLanguage: meta.plainLanguageDescription || meta.description,
        states,
        events,
        initialState: meta.initialState,
        complexity: workflowComplexity,
        stateCount,
        eventCount,
        legalReferences: meta.legalReferences || [],
        keywords,
        lastModified: new Date().toISOString().split('T')[0],
        version: meta.version || '1.0.0',
        gherkinFile: meta.gherkinFile
      };
    });

    // Apply filters
    if (category) {
      workflows = workflows.filter(w => w.category === category);
    }

    if (complexity) {
      workflows = workflows.filter(w => w.complexity === complexity);
    }

    if (q) {
      const searchTerm = q.toLowerCase();
      workflows = workflows.filter(w =>
        w.name.toLowerCase().includes(searchTerm) ||
        w.description.toLowerCase().includes(searchTerm) ||
        w.keywords.some(k => k.includes(searchTerm)) ||
        w.id.toLowerCase().includes(searchTerm)
      );
    }

    return reply.send({
      success: true,
      workflows,
      totalCount: workflows.length
    });
  } catch (error) {
    console.error('Error searching workflows:', error);
    return reply.status(500).send({
      success: false,
      error: error instanceof Error ? error.message : 'Search failed'
    });
  }
}