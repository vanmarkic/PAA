import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserRoleProvider } from './contexts/UserRoleContext';

// Import page components
import { HomePage } from './pages/HomePage';
import { MachineDetailPage } from './pages/MachineDetailPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { BenefitsPage } from './pages/BenefitsPage';
import { WizardPage } from './pages/WizardPage';
import { DeveloperPage } from './pages/DeveloperPage';
import { NotFound } from './pages/NotFound';
import { RouterLayout } from './components/RouterLayout';

// Type definitions for page components
export type Page = 'home' | 'machine' | 'comparison' | 'benefits' | 'wizard' | 'developers';

export interface Machine {
  id: string;
  name: string;
  category: string;
  description: string;
  plainLanguage: string;
  states: string[];
  events: string[];
  initialState: string;
  complexity: 'Simple' | 'Medium' | 'Complex';
  stateCount: number;
  eventCount: number;
  legalReferences?: {
    type: string;
    name: string;
    url: string;
    articles?: string[];
  }[];
  keywords?: string[];
  lastModified?: string;
  version?: string;
  gherkinFile?: string;
}

function App() {
  return (
    <BrowserRouter>
      <UserRoleProvider>
        <Routes>
          <Route path="/" element={<RouterLayout />}>
            {/* Main Routes */}
            <Route index element={<HomePage />} />
            <Route path="workflows/:id" element={<MachineDetailPage />} />
            <Route path="comparison" element={<ComparisonPage />} />
            <Route path="benefits" element={<BenefitsPage />} />
            <Route path="wizard" element={<WizardPage />} />
            <Route path="developer" element={<DeveloperPage />} />

            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </UserRoleProvider>
    </BrowserRouter>
  );
}

export default App;