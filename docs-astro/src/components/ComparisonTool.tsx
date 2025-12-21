import { useState, useMemo, useEffect } from 'react';
import { getUrl } from '../lib/utils';

interface Machine {
  id: string;
  name: string;
  category: string;
  description?: string;
  states?: string[];
  events?: string[];
  complexity?: string;
  plainLanguage?: string;
  keywords?: string[];
}

interface ComparisonToolProps {
  machines: Machine[];
  preselectedIds?: string[];
}

export default function ComparisonTool({ machines, preselectedIds = [] }: ComparisonToolProps) {
  const [selectedMachines, setSelectedMachines] = useState<string[]>(preselectedIds);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Read URL params on mount (client-side)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const workflowsParam = params.get('workflows');
    if (workflowsParam) {
      const ids = workflowsParam.split(',').filter(id =>
        machines.some(m => m.id === id)
      );
      if (ids.length > 0) {
        setSelectedMachines(ids.slice(0, 4)); // Max 4
      }
    }
  }, [machines]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(machines.map(m => m.category));
    return Array.from(cats).sort();
  }, [machines]);

  // Filter machines for selection
  const filteredMachines = useMemo(() => {
    return machines.filter(machine => {
      const matchesSearch = searchQuery === '' ||
        machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === '' || machine.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [machines, searchQuery, selectedCategory]);

  // Get selected machine objects
  const comparisonMachines = machines.filter(m => selectedMachines.includes(m.id));

  const toggleMachine = (machineId: string) => {
    setSelectedMachines(prev => {
      if (prev.includes(machineId)) {
        return prev.filter(id => id !== machineId);
      }
      if (prev.length >= 4) {
        alert('Vous pouvez comparer jusqu\'à 4 procédures maximum');
        return prev;
      }
      return [...prev, machineId];
    });
  };

  const removeMachine = (machineId: string) => {
    setSelectedMachines(prev => prev.filter(id => id !== machineId));
  };

  const clearSelection = () => {
    setSelectedMachines([]);
  };

  return (
    <div>
      {/* Selection Panel */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sélectionner des Procédures</h3>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Toutes catégories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Machine List */}
        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
          {filteredMachines.map(machine => (
            <label
              key={machine.id}
              className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <input
                type="checkbox"
                checked={selectedMachines.includes(machine.id)}
                onChange={() => toggleMachine(machine.id)}
                className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{machine.name}</div>
                <div className="text-sm text-gray-500">
                  {machine.category} • {machine.states?.length || 0} étapes • {machine.events?.length || 0} actions
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Selection Status */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {selectedMachines.length}/4 procédures sélectionnées
          </span>
          {selectedMachines.length > 0 && (
            <button
              onClick={clearSelection}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Effacer la sélection
            </button>
          )}
        </div>
      </div>

      {/* Comparison Table */}
      {comparisonMachines.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                  Critère
                </th>
                {comparisonMachines.map(machine => (
                  <th key={machine.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-between">
                      <span>{machine.name}</span>
                      <button
                        onClick={() => removeMachine(machine.id)}
                        className="ml-2 text-gray-400 hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Category Row */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                  Catégorie
                </td>
                {comparisonMachines.map(machine => (
                  <td key={machine.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                      {machine.category}
                    </span>
                  </td>
                ))}
              </tr>

              {/* States Count */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                  Nombre d'États
                </td>
                {comparisonMachines.map(machine => (
                  <td key={machine.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {machine.states?.length || 0}
                  </td>
                ))}
              </tr>

              {/* Events Count */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                  Nombre d'Événements
                </td>
                {comparisonMachines.map(machine => (
                  <td key={machine.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {machine.events?.length || 0}
                  </td>
                ))}
              </tr>

              {/* Complexity */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                  Complexité
                </td>
                {comparisonMachines.map(machine => (
                  <td key={machine.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      machine.complexity === 'Simple' ? 'bg-green-100 text-green-700' :
                      machine.complexity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {machine.complexity || 'Non définie'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Description */}
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                  Description
                </td>
                {comparisonMachines.map(machine => (
                  <td key={machine.id} className="px-6 py-4 text-sm text-gray-900">
                    {machine.description || 'Aucune description disponible'}
                  </td>
                ))}
              </tr>

              {/* Plain Language */}
              {comparisonMachines.some(m => m.plainLanguage) && (
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                    Langage Clair
                  </td>
                  {comparisonMachines.map(machine => (
                    <td key={machine.id} className="px-6 py-4 text-sm text-gray-900">
                      {machine.plainLanguage || '-'}
                    </td>
                  ))}
                </tr>
              )}

              {/* States List */}
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 align-top sticky left-0 bg-white">
                  États
                </td>
                {comparisonMachines.map(machine => (
                  <td key={machine.id} className="px-6 py-4 text-sm text-gray-900">
                    <ul className="space-y-1">
                      {machine.states?.slice(0, 5).map(state => (
                        <li key={state} className="text-xs">• {state}</li>
                      ))}
                      {(machine.states?.length || 0) > 5 && (
                        <li className="text-xs text-gray-500">... et {machine.states!.length - 5} de plus</li>
                      )}
                    </ul>
                  </td>
                ))}
              </tr>

              {/* Link to Details */}
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                  Détails
                </td>
                {comparisonMachines.map(machine => (
                  <td key={machine.id} className="px-6 py-4">
                    <a
                      href={getUrl(`workflows/${machine.id}`)}
                      className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                    >
                      Voir les détails →
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {comparisonMachines.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-500">Sélectionnez des procédures à comparer</p>
        </div>
      )}
    </div>
  );
}