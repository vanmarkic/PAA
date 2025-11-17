import { useNavigate } from 'react-router-dom';
import { BenefitsGuide } from '../components/BenefitsGuide';
import { useTranslation } from 'react-i18next';
import { Page } from '../App';

export function BenefitsPage() {
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

  return (
    <BenefitsGuide
      onNavigate={handleNavigate}
      language={language}
    />
  );
}