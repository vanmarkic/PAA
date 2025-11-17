/**
 * Integration helper for MetadataDisplay component
 * Bridges the gap between the PAA backend metadata and the Astro documentation site
 */

// Type definitions for metadata structures
export interface DataFreshness {
  status: 'current' | 'needs-review' | 'outdated' | 'unknown';
  label: string;
  color: string;
  daysOld: number;
}

export interface LegalSource {
  title: string;
  referenceNumber?: string;
  authority: string;
  region: string;
  publicationDate: Date | string;
  effectiveDate: Date | string;
  officialUrl: string;
  backupUrl?: string;
}

export interface LegislationVersion {
  version: string;
  extractionDate: Date | string;
  lastLegislativeUpdate: Date | string;
  nextReviewDate?: Date | string;
  status: string;
  sources: LegalSource[];
  amounts?: Record<string, number>;
  changeLog?: string;
}

export interface MachineLegalMetadata {
  machineId: string;
  nameFr: string;
  nameNl?: string;
  category: string;
  currentVersion: LegislationVersion;
  versionHistory?: LegislationVersion[];
  contactEmail?: string;
  contactPhone?: string;
  lastLegalValidation?: {
    date: Date | string;
    validatorName: string;
    validatorRole: string;
  };
}

export interface RelatedEntity {
  id: string;
  name?: string;
  description?: string;
  matchScore?: number;
  matchReasons?: string[];
}

export interface RelatedEntities {
  procedures?: RelatedEntity[];
  rules?: RelatedEntity[];
  features?: RelatedEntity[];
  parentProcedures?: RelatedEntity[];
  childProcedures?: RelatedEntity[];
  siblingProcedures?: RelatedEntity[];
}

/**
 * Mock function to get legal metadata
 * In production, this would connect to the actual machineMetadataHelper
 */
export function getMockLegalMetadata(entityId: string): MachineLegalMetadata | null {
  // This is a mock implementation
  // In production, import and use the real machineMetadataHelper

  const mockData: Record<string, MachineLegalMetadata> = {
    'ris-workflow': {
      machineId: 'ris-workflow',
      nameFr: 'Revenu d\'Intégration Sociale',
      nameNl: 'Leefloon',
      category: 'social-benefits',
      currentVersion: {
        version: '2.1.0',
        extractionDate: new Date('2024-01-15'),
        lastLegislativeUpdate: new Date('2024-01-01'),
        nextReviewDate: new Date('2024-07-01'),
        status: 'active',
        sources: [
          {
            title: 'Loi concernant le droit à l\'intégration sociale',
            referenceNumber: 'Loi du 26 mai 2002',
            authority: 'federal',
            region: 'Belgique',
            publicationDate: new Date('2002-05-26'),
            effectiveDate: new Date('2002-10-01'),
            officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2002052647&table_name=loi',
            backupUrl: 'https://www.mi-is.be/fr/reglementations/loi-du-26-mai-2002-concernant-le-droit-lintegration-sociale'
          }
        ],
        amounts: {
          'Isolé': 1115.67,
          'Cohabitant': 743.78,
          'Famille monoparentale': 1506.79
        }
      },
      contactEmail: 'info@mi-is.be',
      contactPhone: '+32 2 508 85 85'
    },
    'agr-workflow': {
      machineId: 'agr-workflow',
      nameFr: 'Allocation de Garantie de Revenus',
      nameNl: 'Inkomensgarantie-uitkering',
      category: 'social-benefits',
      currentVersion: {
        version: '1.5.0',
        extractionDate: new Date('2024-01-10'),
        lastLegislativeUpdate: new Date('2023-10-01'),
        status: 'active',
        sources: [
          {
            title: 'Arrêté royal relatif à l\'allocation de garantie de revenus',
            authority: 'federal',
            region: 'Belgique',
            publicationDate: new Date('2001-04-01'),
            effectiveDate: new Date('2001-07-01'),
            officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/loi_a.pl'
          }
        ]
      }
    }
  };

  return mockData[entityId] || null;
}

/**
 * Mock function to get data freshness
 * In production, this would connect to the actual machineMetadataHelper
 */
export function getMockDataFreshness(entityId: string): DataFreshness {
  // This is a mock implementation
  // In production, import and use the real getDataFreshnessBadge

  const mockFreshness: Record<string, DataFreshness> = {
    'ris-workflow': {
      status: 'current',
      label: 'Données à jour',
      color: 'green',
      daysOld: 5
    },
    'agr-workflow': {
      status: 'needs-review',
      label: 'Révision nécessaire',
      color: 'orange',
      daysOld: 45
    },
    'conversion-workflow': {
      status: 'outdated',
      label: 'Données anciennes',
      color: 'red',
      daysOld: 120
    }
  };

  return mockFreshness[entityId] || {
    status: 'unknown',
    label: 'Métadonnées non disponibles',
    color: 'gray',
    daysOld: 0
  };
}

/**
 * Prepare related entities for the MetadataDisplay component
 */
export function prepareRelatedEntities(
  relatedWorkflows?: any[],
  relatedRules?: any[],
  relatedFeatures?: any[],
  allWorkflows?: any[],
  currentCategory?: string
): RelatedEntities {
  const entities: RelatedEntities = {};

  // Add procedures (workflows)
  if (relatedWorkflows && relatedWorkflows.length > 0) {
    entities.procedures = relatedWorkflows.map(w => ({
      id: w.id,
      name: w.name,
      description: w.description,
      matchScore: w.matchScore,
      matchReasons: w.matchReasons
    }));
  }

  // Add rules
  if (relatedRules && relatedRules.length > 0) {
    entities.rules = relatedRules.map(r => ({
      id: r.id,
      name: r.name || r.description,
      description: r.description,
      matchScore: r.matchScore,
      matchReasons: r.matchReasons
    }));
  }

  // Add features
  if (relatedFeatures && relatedFeatures.length > 0) {
    entities.features = relatedFeatures.map(f => ({
      id: f.id,
      name: f.name,
      description: f.description,
      matchScore: f.matchScore,
      matchReasons: f.matchReasons
    }));
  }

  // Add sibling procedures (same category)
  if (allWorkflows && currentCategory) {
    const siblings = allWorkflows
      .filter(w => w.category === currentCategory)
      .slice(0, 5)
      .map(w => ({
        id: w.id,
        name: w.name,
        description: w.description
      }));

    if (siblings.length > 0) {
      entities.siblingProcedures = siblings;
    }
  }

  // Mock parent and child procedures for demonstration
  // In production, these would be determined by actual relationships
  if (currentCategory === 'social-benefits') {
    entities.parentProcedures = [
      {
        id: 'social-benefits-master',
        name: 'Prestations Sociales',
        description: 'Procédure principale des prestations sociales'
      }
    ];
  }

  return entities;
}

/**
 * Integration function to load all metadata for an entity
 */
export async function loadEntityMetadata(
  entityType: 'procedure' | 'rule' | 'feature',
  entityId: string,
  entityData?: any,
  relatedWorkflows?: any[],
  relatedRules?: any[],
  relatedFeatures?: any[],
  allWorkflows?: any[]
) {
  // Get legal metadata (mock for now)
  const legalMetadata = getMockLegalMetadata(entityId);

  // Get data freshness (mock for now)
  const dataFreshness = getMockDataFreshness(entityId);

  // Prepare related entities
  const relatedEntities = prepareRelatedEntities(
    relatedWorkflows,
    relatedRules,
    relatedFeatures,
    allWorkflows,
    entityData?.category
  );

  // Prepare general metadata
  const metadata = {
    category: entityData?.category,
    version: legalMetadata?.currentVersion?.version || '1.0.0',
    lastUpdated: legalMetadata?.currentVersion?.extractionDate || new Date(),
    versionHistory: legalMetadata?.versionHistory,
    auditInfo: entityData?.auditInfo
  };

  return {
    metadata,
    legalMetadata,
    dataFreshness,
    relatedEntities
  };
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string): string {
  if (!date) return 'Non disponible';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-BE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Get color classes for status badges
 */
export function getStatusBadgeClasses(status: string): string {
  const classMap: Record<string, string> = {
    'current': 'bg-green-100 text-green-800 border-green-200',
    'needs-review': 'bg-orange-100 text-orange-800 border-orange-200',
    'outdated': 'bg-red-100 text-red-800 border-red-200',
    'unknown': 'bg-gray-100 text-gray-800 border-gray-200',
    'active': 'bg-blue-100 text-blue-800 border-blue-200',
    'archived': 'bg-gray-100 text-gray-800 border-gray-200',
    'deprecated': 'bg-red-100 text-red-800 border-red-200'
  };

  return classMap[status] || classMap['unknown'];
}

/**
 * Export metadata to JSON file
 */
export function exportMetadataJSON(
  entityId: string,
  entityType: string,
  metadata: any,
  legalMetadata: any,
  relatedEntities: any
): void {
  const data = {
    entityId,
    entityType,
    exportDate: new Date().toISOString(),
    metadata,
    legalMetadata,
    relatedEntities
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `metadata-${entityId}-${new Date().getTime()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}