import { useSearchParams, useNavigate } from 'react-router-dom';
import { ComparisonTool } from '../components/ComparisonTool';
import { useTranslation } from 'react-i18next';
import { Page } from '../App';

export function ComparisonPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const language = i18n.language as 'fr' | 'nl' | 'en';

  // Get machine IDs from query params
  const machineIds = searchParams.getAll('machine');

  const handleNavigate = (page: Page, machineId?: string) => {
    switch (page) {
      case 'home':
        navigate('/');
        break;
      case 'machine':
        if (machineId) {
          navigate(`/workflows/${machineId}`);
        }
        break;
      case 'comparison':
        navigate('/comparison');
        break;
      case 'benefits':
        navigate('/benefits');
        break;
      case 'wizard':
        navigate('/wizard');
        break;
      case 'developers':
        navigate('/developer');
        break;
    }
  };

  return (
    <ComparisonTool
      machineIds={machineIds}
      onNavigate={handleNavigate}
      language={language}
    />
  );
}