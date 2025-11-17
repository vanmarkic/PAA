# Backend Integration Points for PAA Frontend

## Overview
This document outlines all the backend integration points needed to connect the Figmapaa frontend components with the PAA backend services.

## Data Structure Summary

### Machine/Workflow Data Model
```typescript
interface Machine {
  id: string;                    // Unique workflow identifier
  name: string;                   // Display name
  category: string;               // Category (social, family, housing, etc.)
  description: string;            // Technical description
  plainLanguage: string;          // User-friendly description
  states: string[];               // List of state names
  events: string[];               // List of event names
  initialState: string;           // Starting state
  complexity: 'Simple' | 'Medium' | 'Complex';
  stateCount: number;             // Total number of states
  eventCount: number;             // Total number of events
  legalReferences?: LegalReference[];  // Legal basis
  keywords?: string[];            // Search keywords
  lastModified?: string;          // ISO date string
  version?: string;               // Semantic version
  gherkinFile?: string;          // Path to Gherkin feature file
}

interface LegalReference {
  type: string;                   // Loi, Arrêté Royal, Décret, etc.
  name: string;                   // Full legal document name
  url: string;                    // ejustice.just.fgov.be URL
  articles?: string[];            // Specific articles referenced
}
```

### Categories
- **social**: Social benefits (RIS, AGR, unemployment)
- **family**: Family-related benefits (allocations, birth premiums)
- **housing**: Housing assistance
- **health**: Health and disability benefits
- **immigration**: Immigration-related procedures

## Required API Endpoints

### 1. Workflows/Machines

#### GET /api/workflows
**Purpose**: Fetch all workflows/state machines
**Response**: `Machine[]`
**Used by**: Home.tsx, ComparisonTool.tsx, BenefitsGuide.tsx

#### GET /api/workflows/:id
**Purpose**: Get detailed information about a specific workflow
**Response**: `Machine`
**Used by**: MachineDetail.tsx

#### GET /api/workflows/search
**Purpose**: Search workflows by keyword, category, or complexity
**Query params**:
- `q`: search query
- `category`: filter by category
- `complexity`: filter by complexity level
**Response**: `Machine[]`
**Used by**: Home.tsx search functionality

### 2. Benefits Eligibility

#### POST /api/eligibility/check
**Purpose**: Check eligibility for multiple benefits
**Request Body**:
```json
{
  "age": number,
  "income": number,
  "residence": string,
  "employmentStatus": string,
  "familySize": number,
  "hasDisability": boolean
}
```
**Response**:
```json
{
  "eligibleBenefits": [
    {
      "benefitId": string,
      "name": string,
      "eligible": boolean,
      "amount": number,
      "reason": string
    }
  ]
}
```
**Used by**: WorkflowWizard.tsx

#### POST /api/eligibility/:benefitId
**Purpose**: Check eligibility for a specific benefit
**Request Body**: Same as above
**Response**: Single benefit eligibility result
**Used by**: MachineDetail.tsx (simulation tab)

### 3. Workflow Simulation

#### POST /api/simulation/start
**Purpose**: Start a workflow simulation session
**Request Body**:
```json
{
  "workflowId": string,
  "initialContext": object
}
```
**Response**:
```json
{
  "sessionId": string,
  "currentState": string,
  "availableEvents": string[]
}
```
**Used by**: MachineDetail.tsx (simulation feature)

#### POST /api/simulation/:sessionId/event
**Purpose**: Send an event to a running simulation
**Request Body**:
```json
{
  "event": string,
  "data": object
}
```
**Response**: Updated state and available events
**Used by**: MachineDetail.tsx

### 4. Legal Text Conversion

#### POST /api/legal/convert
**Purpose**: Convert legal text to plain language
**Request Body**:
```json
{
  "text": string,
  "language": "fr" | "nl" | "de",
  "format": "plain" | "structured"
}
```
**Response**:
```json
{
  "originalText": string,
  "convertedText": string,
  "confidence": number,
  "references": LegalReference[]
}
```
**Used by**: DeveloperDocs.tsx (API examples)

### 5. Documentation & Metadata

#### GET /api/docs/gherkin/:workflowId
**Purpose**: Get Gherkin scenarios for a workflow
**Response**: Gherkin feature file content as text
**Used by**: MachineDetail.tsx (technical tab)

#### GET /api/docs/examples/:workflowId
**Purpose**: Get example cases for a workflow
**Response**:
```json
{
  "examples": [
    {
      "name": string,
      "input": object,
      "output": object,
      "description": string
    }
  ]
}
```
**Used by**: MachineDetail.tsx (examples tab)

### 6. Statistics & Analytics

#### GET /api/stats/summary
**Purpose**: Get system-wide statistics
**Response**:
```json
{
  "totalWorkflows": number,
  "totalCategories": number,
  "totalStates": number,
  "totalEvents": number,
  "lastUpdated": string
}
```
**Used by**: Home.tsx (stats dashboard)

#### GET /api/stats/workflow/:id
**Purpose**: Get usage statistics for a specific workflow
**Response**: Usage metrics, success rates, common paths
**Used by**: MachineDetail.tsx

## Hardcoded Data to Replace

### 1. mockMachines.ts
Currently contains 109 hardcoded workflow definitions. Should be replaced with:
- API call to `/api/workflows` on component mount
- Caching strategy using React Query or SWR
- Loading states and error handling

### 2. BenefitsGuide.tsx - benefitCategories
Static benefit category definitions should be fetched from:
- `/api/benefits/categories` endpoint
- Include dynamic benefit amounts based on current rates

### 3. WorkflowWizard.tsx - Questions
Hardcoded wizard questions should come from:
- `/api/wizard/questions` endpoint
- Dynamic question flow based on answers

## State Management Recommendations

### 1. API Client Setup
```typescript
// api/client.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const apiClient = {
  get: (path: string) => fetch(`${API_BASE_URL}${path}`).then(r => r.json()),
  post: (path: string, body: any) =>
    fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(r => r.json())
};
```

### 2. Data Fetching Pattern
```typescript
// hooks/useWorkflows.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';

export function useWorkflows() {
  return useQuery({
    queryKey: ['workflows'],
    queryFn: () => apiClient.get('/workflows'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

## Authentication & Authorization

### Headers Required
- `Authorization`: Bearer token for authenticated endpoints
- `Accept-Language`: fr | nl | de for localized responses
- `X-Session-Id`: For simulation session tracking

### Public vs Protected Endpoints
**Public**:
- GET /api/workflows
- GET /api/stats/summary
- POST /api/eligibility/check

**Protected** (require authentication):
- POST /api/simulation/*
- GET /api/docs/internal/*
- POST /api/admin/*

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {},
    "timestamp": "2025-01-25T10:00:00Z"
  }
}
```

### Common Error Codes
- `WORKFLOW_NOT_FOUND`: Requested workflow doesn't exist
- `INVALID_INPUT`: Validation error in request body
- `SIMULATION_ERROR`: State machine simulation failed
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `UNAUTHORIZED`: Authentication required
- `SERVER_ERROR`: Internal server error

## Performance Considerations

### Caching Strategy
1. **Static Data**: Workflows, categories - cache for 1 hour
2. **Dynamic Data**: Eligibility results - cache for 5 minutes
3. **User-Specific**: Simulation sessions - no caching

### Pagination
For endpoints returning lists:
- `?page=1&limit=20` query parameters
- Response includes total count and page info

### Optimization Tips
1. Implement virtual scrolling for long workflow lists
2. Lazy load workflow details on demand
3. Prefetch commonly accessed workflows
4. Use WebSocket for real-time simulation updates

## Migration Path

### Phase 1: Read-Only Integration
1. Replace mockMachines with API calls
2. Implement loading states
3. Add error boundaries

### Phase 2: Interactive Features
1. Implement eligibility checking
2. Add workflow simulation
3. Enable PDF export

### Phase 3: Full Integration
1. User authentication
2. Personalized dashboards
3. Admin features
4. Analytics tracking

## Testing Considerations

### Mock Server Setup
Use MSW (Mock Service Worker) for development:
```typescript
// mocks/handlers.ts
export const handlers = [
  rest.get('/api/workflows', (req, res, ctx) => {
    return res(ctx.json(mockMachines));
  }),
  // ... other handlers
];
```

### E2E Testing
- Use Playwright with mocked API responses
- Test critical user journeys:
  - Search and filter workflows
  - Check benefit eligibility
  - Compare workflows
  - Navigate workflow details