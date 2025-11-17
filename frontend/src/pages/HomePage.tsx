import { useNavigate } from 'react-router-dom';
import { Home } from '../components/Home';
import { useTranslation } from 'react-i18next';
import { Page } from '../App';

export function HomePage() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const language = i18n.language as 'fr' | 'nl' | 'en';

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

  const handleCompare = (machineIds: string[]) => {
    // Navigate to comparison page with machine IDs as query params
    const params = new URLSearchParams();
    machineIds.forEach(id => params.append('machine', id));
    navigate(`/comparison?${params.toString()}`);
  };

  return (
    <Home
      onNavigate={handleNavigate}
      onCompare={handleCompare}
      language={language}
    />
  );
}