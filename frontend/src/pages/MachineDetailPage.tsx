import { useParams, useNavigate } from 'react-router-dom';
import { MachineDetail } from '../components/MachineDetail';
import { useTranslation } from 'react-i18next';
import { Page } from '../App';

export function MachineDetailPage() {
  const { id } = useParams<{ id: string }>();
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
    const params = new URLSearchParams();
    machineIds.forEach(machineId => params.append('machine', machineId));
    navigate(`/comparison?${params.toString()}`);
  };

  if (!id) {
    navigate('/');
    return null;
  }

  return (
    <MachineDetail
      machineId={id}
      onNavigate={handleNavigate}
      onCompare={handleCompare}
      language={language}
    />
  );
}