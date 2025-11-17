import { useState } from 'react';

interface Machine {
  id: string;
  name: string;
  category: string;
  description?: string;
  states?: string[];
  events?: string[];
  plainLanguage?: string;
  keywords?: string[];
}

interface WorkflowWizardProps {
  machines: Machine[];
}

type Step = 'category' | 'situation' | 'urgency' | 'results';

const categoryMapping: Record<string, string[]> = {
  'social': ['Aide sociale', 'Soutien financier', 'CPAS'],
  'family': ['Famille', 'Enfants', 'Allocations familiales'],
  'housing': ['Logement', 'Location', 'Propriété'],
  'energy': ['Énergie', 'Chauffage', 'Électricité'],
  'health': ['Santé', 'Soins médicaux', 'Mutuelle'],
  'pension': ['Retraite', 'Pension', 'Senior'],
  'handicap': ['Handicap', 'Invalidité', 'Aide aux personnes'],
  'selfemployed': ['Indépendant', 'Entrepreneur', 'Business'],
  'education': ['Formation', 'Études', 'Bourse'],
  'immigration': ['Immigration', 'Séjour', 'Naturalisation']
};

export default function WorkflowWizard({ machines }: WorkflowWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('category');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSituation, setSelectedSituation] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('');
  const [results, setResults] = useState<Machine[]>([]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentStep('situation');
  };

  const handleSituationSelect = (situation: string) => {
    setSelectedSituation(situation);
    setCurrentStep('urgency');
  };

  const handleUrgencySelect = (urgency: string) => {
    setSelectedUrgency(urgency);

    // Filter machines based on selections
    const filtered = machines.filter(machine => {
      // Check category match
      if (selectedCategory && machine.category !== selectedCategory) {
        const categoryKeywords = categoryMapping[selectedCategory] || [];
        const hasKeywordMatch = machine.keywords?.some(kw =>
          categoryKeywords.some(ck => kw.toLowerCase().includes(ck.toLowerCase()))
        );

        if (!hasKeywordMatch && machine.category !== selectedCategory) {
          return false;
        }
      }

      // Additional filtering based on situation and urgency could be added here
      return true;
    });

    setResults(filtered.slice(0, 10)); // Limit to top 10 results
    setCurrentStep('results');
  };

  const restart = () => {
    setCurrentStep('category');
    setSelectedCategory('');
    setSelectedSituation('');
    setSelectedUrgency('');
    setResults([]);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className={`text-sm font-medium ${currentStep === 'category' ? 'text-purple-600' : 'text-gray-400'}`}>
            Catégorie
          </span>
          <span className={`text-sm font-medium ${currentStep === 'situation' ? 'text-purple-600' : 'text-gray-400'}`}>
            Situation
          </span>
          <span className={`text-sm font-medium ${currentStep === 'urgency' ? 'text-purple-600' : 'text-gray-400'}`}>
            Urgence
          </span>
          <span className={`text-sm font-medium ${currentStep === 'results' ? 'text-purple-600' : 'text-gray-400'}`}>
            Résultats
          </span>
        </div>
        <div className="bg-gray-200 h-2 rounded-full">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: currentStep === 'category' ? '25%' :
                     currentStep === 'situation' ? '50%' :
                     currentStep === 'urgency' ? '75%' : '100%'
            }}
          />
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 'category' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quel type d'aide recherchez-vous?
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleCategorySelect('social')}
              className="p-6 text-left bg-gray-50 rounded-lg hover:bg-purple-50 hover:border-purple-300 border-2 border-transparent transition-all"
            >
              <div className="text-lg font-semibold text-gray-900 mb-2">Aide Sociale</div>
              <div className="text-sm text-gray-600">RIS, CPAS, aide d'urgence</div>
            </button>
            <button
              onClick={() => handleCategorySelect('family')}
              className="p-6 text-left bg-gray-50 rounded-lg hover:bg-purple-50 hover:border-purple-300 border-2 border-transparent transition-all"
            >
              <div className="text-lg font-semibold text-gray-900 mb-2">Famille</div>
              <div className="text-sm text-gray-600">Allocations familiales, garde d'enfants</div>
            </button>
            <button
              onClick={() => handleCategorySelect('housing')}
              className="p-6 text-left bg-gray-50 rounded-lg hover:bg-purple-50 hover:border-purple-300 border-2 border-transparent transition-all"
            >
              <div className="text-lg font-semibold text-gray-900 mb-2">Logement</div>
              <div className="text-sm text-gray-600">Aide au loyer, prime logement</div>
            </button>
            <button
              onClick={() => handleCategorySelect('health')}
              className="p-6 text-left bg-gray-50 rounded-lg hover:bg-purple-50 hover:border-purple-300 border-2 border-transparent transition-all"
            >
              <div className="text-lg font-semibold text-gray-900 mb-2">Santé</div>
              <div className="text-sm text-gray-600">Soins de santé, mutuelle</div>
            </button>
            <button
              onClick={() => handleCategorySelect('pension')}
              className="p-6 text-left bg-gray-50 rounded-lg hover:bg-purple-50 hover:border-purple-300 border-2 border-transparent transition-all"
            >
              <div className="text-lg font-semibold text-gray-900 mb-2">Pension</div>
              <div className="text-sm text-gray-600">Retraite, GRAPA</div>
            </button>
            <button
              onClick={() => handleCategorySelect('')}
              className="p-6 text-left bg-gray-50 rounded-lg hover:bg-purple-50 hover:border-purple-300 border-2 border-transparent transition-all"
            >
              <div className="text-lg font-semibold text-gray-900 mb-2">Autre</div>
              <div className="text-sm text-gray-600">Voir toutes les catégories</div>
            </button>
          </div>
        </div>
      )}

      {currentStep === 'situation' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quelle est votre situation actuelle?
          </h2>
          <div className="space-y-4">
            <button
              onClick={() => handleSituationSelect('unemployed')}
              className="w-full p-4 text-left bg-gray-50 rounded-lg hover:bg-purple-50 hover:border-purple-300 border-2 border-transparent transition-all"
            >
              <div className="font-semibold text-gray-900">Sans emploi</div>
              <div className="text-sm text-gray-600 mt-1">Je recherche un emploi ou je suis au chômage</div>
            </button>
            <button
              onClick={() => handleSituationSelect('employed')}
              className="w-full p-4 text-left bg-gray-50 rounded-lg hover:bg-purple-50 hover:border-purple-300 border-2 border-transparent transition-all"
            >
              <div className="font-semibold text-gray-900">En emploi</div>
              <div className="text-sm text-gray-600 mt-1">J'ai un emploi mais j'ai besoin d'aide supplémentaire</div>
            </button>
            <button
              onClick={() => handleSituationSelect('student')}
              className="w-full p-4 text-left bg-gray-50 rounded-lg hover:bg-purple-50 hover:border-purple-300 border-2 border-transparent transition-all"
            >
              <div className="font-semibold text-gray-900">Étudiant</div>
              <div className="text-sm text-gray-600 mt-1">Je suis en formation ou aux études</div>
            </button>
            <button
              onClick={() => handleSituationSelect('retired')}
              className="w-full p-4 text-left bg-gray-50 rounded-lg hover:bg-purple-50 hover:border-purple-300 border-2 border-transparent transition-all"
            >
              <div className="font-semibold text-gray-900">Retraité</div>
              <div className="text-sm text-gray-600 mt-1">Je suis pensionné ou proche de la retraite</div>
            </button>
          </div>
          <button
            onClick={() => setCurrentStep('category')}
            className="mt-6 text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Retour
          </button>
        </div>
      )}

      {currentStep === 'urgency' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quelle est l'urgence de votre demande?
          </h2>
          <div className="space-y-4">
            <button
              onClick={() => handleUrgencySelect('immediate')}
              className="w-full p-4 text-left bg-red-50 rounded-lg hover:bg-red-100 hover:border-red-300 border-2 border-transparent transition-all"
            >
              <div className="font-semibold text-gray-900">Urgent</div>
              <div className="text-sm text-gray-600 mt-1">J'ai besoin d'aide immédiatement</div>
            </button>
            <button
              onClick={() => handleUrgencySelect('soon')}
              className="w-full p-4 text-left bg-yellow-50 rounded-lg hover:bg-yellow-100 hover:border-yellow-300 border-2 border-transparent transition-all"
            >
              <div className="font-semibold text-gray-900">Dans les prochaines semaines</div>
              <div className="text-sm text-gray-600 mt-1">J'ai besoin d'aide dans le mois qui vient</div>
            </button>
            <button
              onClick={() => handleUrgencySelect('planning')}
              className="w-full p-4 text-left bg-green-50 rounded-lg hover:bg-green-100 hover:border-green-300 border-2 border-transparent transition-all"
            >
              <div className="font-semibold text-gray-900">Je planifie</div>
              <div className="text-sm text-gray-600 mt-1">Je me renseigne pour plus tard</div>
            </button>
          </div>
          <button
            onClick={() => setCurrentStep('situation')}
            className="mt-6 text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Retour
          </button>
        </div>
      )}

      {currentStep === 'results' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Workflows Recommandés
          </h2>

          {results.length > 0 ? (
            <div className="space-y-4 mb-6">
              {results.map(machine => (
                <a
                  key={machine.id}
                  href={`/workflows/${machine.id}`}
                  className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{machine.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {machine.description || machine.plainLanguage || 'Workflow administratif belge'}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          {machine.category}
                        </span>
                        <span>{machine.states?.length || 0} états</span>
                        <span>{machine.events?.length || 0} événements</span>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center mb-6">
              <p className="text-gray-600">
                Aucun workflow ne correspond exactement à vos critères.
                Essayez d'élargir votre recherche ou consultez toutes les catégories.
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={restart}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Nouvelle Recherche
            </button>
            <a
              href="/benefits"
              className="px-6 py-3 bg-white text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
            >
              Voir Toutes les Prestations
            </a>
          </div>
        </div>
      )}
    </div>
  );
}