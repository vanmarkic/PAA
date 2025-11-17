# MetadataDisplay Component Documentation

## Overview

The `MetadataDisplay` component is a comprehensive Astro component for displaying legal metadata, data freshness, versioning, and entity relationships in the PAA documentation site. It provides a rich, interactive interface for exploring administrative procedure metadata.

## Features

### Core Features
- **Data Freshness Badge**: Visual indicator showing if data is current, needs review, or is outdated
- **Legal Sources Display**: Clickable links to official Belgian legal sources
- **Version Timeline**: Visual history of all versions with changelog
- **Entity Relationships**: Interactive display of related procedures, rules, and features
- **Hierarchical Navigation**: Parent, child, and sibling procedure relationships
- **Audit Information**: Legal validation and audit trail display
- **Export Functionality**: Export metadata as JSON
- **Print Optimization**: Clean print layout hiding interactive elements

### Visual Features
- Color-coded status indicators
- Responsive grid layout
- Tailwind CSS styling
- Accessible design with proper ARIA attributes
- Hover states and transitions
- Icon-based visual cues using inline SVGs

## Installation

The component is already installed at `/home/user/PAA/docs-astro/src/components/MetadataDisplay.astro`.

## Usage

### Basic Usage

```astro
---
import MetadataDisplay from '../components/MetadataDisplay.astro';

// Your page logic here to get metadata
---

<MetadataDisplay
  entityType="procedure"
  entityId="ris-workflow"
  metadata={metadata}
  legalMetadata={legalMetadata}
  dataFreshness={dataFreshness}
  relatedEntities={relatedEntities}
/>
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `entityType` | `'procedure' \| 'rule' \| 'feature'` | Yes | Type of entity being displayed |
| `entityId` | `string` | Yes | Unique identifier of the entity |
| `metadata` | `object` | No | General metadata (version, category, etc.) |
| `legalMetadata` | `MachineLegalMetadata` | No | Legal metadata from machineMetadataHelper |
| `dataFreshness` | `DataFreshness` | No | Data freshness status and information |
| `relatedEntities` | `RelatedEntities` | No | Related procedures, rules, and features |

### Integration with Existing Pages

#### Example: Workflow Detail Page

```astro
---
import MainLayout from '../../layouts/Layout.astro';
import MetadataDisplay from '../../components/MetadataDisplay.astro';
import { loadEntityMetadata } from '../../lib/metadata-integration';

// ... existing imports and logic ...

// Load metadata for the entity
const {
  metadata,
  legalMetadata,
  dataFreshness,
  relatedEntities
} = await loadEntityMetadata(
  'procedure',
  machine.id,
  machine,
  relatedWorkflows,
  relatedRules,
  relatedFeatures,
  allMachines
);
---

<MainLayout>
  <!-- Your existing page content -->

  <!-- Add the metadata display component -->
  <MetadataDisplay
    entityType="procedure"
    entityId={machine.id}
    metadata={metadata}
    legalMetadata={legalMetadata}
    dataFreshness={dataFreshness}
    relatedEntities={relatedEntities}
  />
</MainLayout>
```

#### Example: Rules Detail Page

```astro
---
import MetadataDisplay from '../../components/MetadataDisplay.astro';

// Prepare metadata for rules
const metadata = {
  category: rule.category,
  version: '1.0.0',
  lastUpdated: new Date()
};

const relatedEntities = {
  procedures: relatedWorkflows,
  features: relatedFeatures
};
---

<MetadataDisplay
  entityType="rule"
  entityId={rule.id}
  metadata={metadata}
  relatedEntities={relatedEntities}
/>
```

## Data Structures

### DataFreshness

```typescript
interface DataFreshness {
  status: 'current' | 'needs-review' | 'outdated' | 'unknown';
  label: string;
  color: string;
  daysOld: number;
}
```

### LegalMetadata

```typescript
interface MachineLegalMetadata {
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
```

### RelatedEntities

```typescript
interface RelatedEntities {
  procedures?: RelatedEntity[];
  rules?: RelatedEntity[];
  features?: RelatedEntity[];
  parentProcedures?: RelatedEntity[];
  childProcedures?: RelatedEntity[];
  siblingProcedures?: RelatedEntity[];
}

interface RelatedEntity {
  id: string;
  name?: string;
  description?: string;
  matchScore?: number;
  matchReasons?: string[];
}
```

## Integration with machineMetadataHelper

The component is designed to work seamlessly with the existing `machineMetadataHelper.ts`:

```typescript
import { getMachineLegalMetadata, getDataFreshnessBadge } from '../../../src/utils/machineMetadataHelper';
import { getMachineLegalMetadata as getLegal } from '../../../src/domain/legalMetadata';

// Get legal metadata
const legalMetadata = getLegal(machine.id);

// Get data freshness
const dataFreshness = getDataFreshnessBadge(machine.id);
```

## Helper Functions

The `metadata-integration.ts` library provides helper functions:

- `loadEntityMetadata()`: Load all metadata for an entity
- `prepareRelatedEntities()`: Format related entities for display
- `getMockLegalMetadata()`: Mock function for development/testing
- `getMockDataFreshness()`: Mock function for development/testing
- `formatDate()`: Format dates for display
- `getStatusBadgeClasses()`: Get Tailwind classes for status badges
- `exportMetadataJSON()`: Export metadata to JSON file

## Styling

The component uses Tailwind CSS classes. Key color schemes:

- **Current/Active**: Green (`green-100`, `green-800`)
- **Needs Review**: Orange (`orange-100`, `orange-800`)
- **Outdated**: Red (`red-100`, `red-800`)
- **Unknown**: Gray (`gray-100`, `gray-800`)
- **Procedures**: Purple (`purple-100`, `purple-700`)
- **Rules**: Blue (`blue-100`, `blue-700`)
- **Features**: Green (`green-100`, `green-700`)

## Accessibility

The component includes:
- Semantic HTML structure
- Proper heading hierarchy
- ARIA attributes where needed
- Keyboard navigable links
- Color contrast compliant with WCAG AA
- Screen reader friendly labels

## Performance Considerations

- The component is static and renders at build time
- No client-side JavaScript required for basic functionality
- Export functions are only loaded when triggered
- Icons are inline SVG for optimal performance

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11 not supported (due to Tailwind CSS v3)
- Print functionality works in all modern browsers

## Future Enhancements

Potential improvements for future versions:

1. **Real-time Updates**: WebSocket connection for live metadata updates
2. **Version Comparison**: Side-by-side version comparison tool
3. **Search Integration**: Search within metadata and related entities
4. **Analytics**: Track which metadata sections are most viewed
5. **Multi-language Support**: Full support for NL, DE, EN in addition to FR
6. **GraphQL Integration**: Query metadata via GraphQL endpoint
7. **Caching Strategy**: Implement smart caching for metadata queries
8. **Audit Trail Visualization**: Timeline view of all audit events

## Example Page

See `/home/user/PAA/docs-astro/src/pages/metadata-example.astro` for a complete working example with mock data.

## Support

For issues or questions about the MetadataDisplay component:
1. Check this documentation
2. Review the example page
3. Examine the component source code
4. Contact the development team

## License

This component is part of the PAA project and follows the same license terms.