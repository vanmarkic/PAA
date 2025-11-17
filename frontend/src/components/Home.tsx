import { useState, useMemo } from'react';
import { Search, Filter, TrendingUp, Users, FileText, Code, Loader2, AlertCircle } from'lucide-react';
import { useWorkflows } from'../hooks/useWorkflows';
import { MachineCard } from'./MachineCard';
import type { Page } from'../App';

interface HomeProps {
 onNavigate: (page: Page, machineId?: string) => void;
 onCompare: (machineIds: string[]) => void;
 language:'fr' | 'nl' | 'en';
}

export function Home({ onNavigate, onCompare, language }: HomeProps) {
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
 const [selectedComplexity, setSelectedComplexity] = useState<string[]>([]);
 const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
 const [showFilters, setShowFilters] = useState(false);

 // Fetch workflows from API
 const { workflows, categories, loading, error, refetch } = useWorkflows();

 const filteredMachines = useMemo(() => {
 return workflows.filter((machine) => {
 const matchesSearch =
 searchQuery ==='' ||
 machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 machine.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
 machine.plainLanguage.toLowerCase().includes(searchQuery.toLowerCase()) ||
 machine.keywords?.some(kw => kw.toLowerCase().includes(searchQuery.toLowerCase()));

 const matchesCategory =
 selectedCategories.length === 0 ||
 selectedCategories.includes(machine.category);

 const matchesComplexity =
 selectedComplexity.length === 0 ||
 selectedComplexity.includes(machine.complexity);

 return matchesSearch && matchesCategory && matchesComplexity;
 });
 }, [searchQuery, selectedCategories, selectedComplexity]);

 const toggleCategory = (categoryId: string) => {
 setSelectedCategories((prev) =>
 prev.includes(categoryId)
 ? prev.filter((c) => c !== categoryId)
 : [...prev, categoryId]
 );
 };

 const toggleComplexity = (complexity: string) => {
 setSelectedComplexity((prev) =>
 prev.includes(complexity)
 ? prev.filter((c) => c !== complexity)
 : [...prev, complexity]
 );
 };

 const toggleMachineSelection = (machineId: string) => {
 setSelectedForComparison((prev) =>
 prev.includes(machineId)
 ? prev.filter((id) => id !== machineId)
 : prev.length < 4
 ? [...prev, machineId]
 : prev
 );
 };

 const handleCompare = () => {
 if (selectedForComparison.length >= 2) {
 onCompare(selectedForComparison);
 }
 };

 const totalStates = workflows.reduce((sum, m) => sum + m.stateCount, 0);
 const totalEvents = workflows.reduce((sum, m) => sum + m.eventCount, 0);

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
 {/* Hero Section */}
 <div className="text-center mb-16">
 <h1 className="text-gray-900 mb-4">
 Naviguer les Prestations Sociales Belges en Toute Confiance
 </h1>
 <p className="text-gray-600 mb-8 max-w-3xl mx-auto">
 Documentation interactive pour 109 processus administratifs. Trouvez rapidement les workflows,
 explorez les règles d'éligibilité et comprenez les processus de prestations sociales.
 </p>

 {/* Role-Based Navigation */}
 <div className="flex flex-wrap justify-center gap-4 mb-8">
 <button
 onClick={() => onNavigate('wizard')}
 className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg hover:shadow-lg transition-all"
 >
 Trouver une Prestation
 </button>
 <button
 onClick={() => onNavigate('benefits')}
 className="px-6 py-3 bg-white text-purple-600 border-2 border-purple-500 rounded-lg hover:bg-purple-50 transition-all"
 >
 Guide des Prestations
 </button>
 <button
 onClick={() => onNavigate('developers')}
 className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
 >
 Documentation Dev
 </button>
 </div>

 {/* Role Selector */}
 <div className="inline-flex items-center gap-2 text-gray-600">
 <span>Je suis:</span>
 <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
 Expert Juridique
 </button>
 <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
 Travailleur Social
 </button>
 <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
 Développeur
 </button>
 <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
 Administrateur
 </button>
 </div>
 </div>

 {/* Stats Dashboard */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
 <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
 <div className="flex items-center justify-between mb-2">
 <FileText className="w-8 h-8 text-purple-500" />
 <TrendingUp className="w-5 h-5 text-green-500" />
 </div>
 <div className="text-gray-900 mb-1">{workflows.length}</div>
 <div className="text-gray-600">Workflows</div>
 </div>

 <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
 <div className="flex items-center justify-between mb-2">
 <Filter className="w-8 h-8 text-blue-500" />
 </div>
 <div className="text-gray-900 mb-1">{categories.length}</div>
 <div className="text-gray-600">Catégories</div>
 </div>

 <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
 <div className="flex items-center justify-between mb-2">
 <Users className="w-8 h-8 text-green-500" />
 </div>
 <div className="text-gray-900 mb-1">{totalStates.toLocaleString()}</div>
 <div className="text-gray-600">États Totaux</div>
 </div>

 <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
 <div className="flex items-center justify-between mb-2">
 <Code className="w-8 h-8 text-orange-500" />
 </div>
 <div className="text-gray-900 mb-1">{totalEvents.toLocaleString()}</div>
 <div className="text-gray-600">Événements Totaux</div>
 </div>
 </div>

 {/* Search and Filters */}
 <div className="mb-8">
 <div className="flex gap-4 mb-4">
 <div className="flex-1 relative">
 <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
 <input
 type="text"
 placeholder="Rechercher des workflows, catégories, mots-clés..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
 />
 </div>
 <button
 onClick={() => setShowFilters(!showFilters)}
 className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700"
 >
 <Filter className="w-5 h-5" />
 Filtres
 {(selectedCategories.length > 0 || selectedComplexity.length > 0) && (
 <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
 {selectedCategories.length + selectedComplexity.length}
 </span>
 )}
 </button>
 </div>

 {/* Filter Panel */}
 {showFilters && (
 <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
 <div>
 <h3 className="font-semibold text-gray-900 mb-3">Catégories</h3>
 <div className="flex flex-wrap gap-2">
 {categories.map((cat) => (
 <button
 key={cat.id}
 onClick={() => toggleCategory(cat.id)}
 className={`px-4 py-2 rounded-lg transition-colors ${
 selectedCategories.includes(cat.id)
 ?'bg-purple-100 text-purple-700 border-2 border-purple-500'
 :'bg-gray-100 text-gray-700 border-2 border-transparent hover:border-gray-300 '
 }`}
 >
 {cat.name} ({cat.count})
 </button>
 ))}
 </div>
 </div>

 <div>
 <h3 className="font-semibold text-gray-900 mb-3">Complexité</h3>
 <div className="flex gap-2">
 {['Simple','Medium', 'Complex'].map((complexity) => (
 <button
 key={complexity}
 onClick={() => toggleComplexity(complexity)}
 className={`px-4 py-2 rounded-lg transition-colors ${
 selectedComplexity.includes(complexity)
 ?'bg-purple-100 text-purple-700 border-2 border-purple-500'
 :'bg-gray-100 text-gray-700 border-2 border-transparent hover:border-gray-300 '
 }`}
 >
 {complexity}
 </button>
 ))}
 </div>
 </div>

 {(selectedCategories.length > 0 || selectedComplexity.length > 0) && (
 <button
 onClick={() => {
 setSelectedCategories([]);
 setSelectedComplexity([]);
 }}
 className="text-purple-600 hover:text-purple-700"
 >
 Effacer tous les filtres
 </button>
 )}
 </div>
 )}

 {/* Results Count */}
 <div className="mt-4 text-gray-600">
 {filteredMachines.length} de {workflows.length} workflows
 </div>
 </div>

 {/* Comparison Mode Banner */}
 {selectedForComparison.length > 0 && (
 <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <span className="text-purple-700 font-medium">
 {selectedForComparison.length} workflow(s) sélectionné(s) pour comparaison
 </span>
 <button
 onClick={() => setSelectedForComparison([])}
 className="text-purple-600 hover:text-purple-700"
 >
 Effacer
 </button>
 </div>
 <button
 onClick={handleCompare}
 disabled={selectedForComparison.length < 2}
 className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 Comparer
 </button>
 </div>
 )}

 {/* Machine Grid */}
 {loading ? (
 <div className="flex flex-col items-center justify-center py-12">
 <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
 <p className="text-gray-600">Chargement des workflows...</p>
 </div>
 ) : error ? (
 <div className="flex flex-col items-center justify-center py-12">
 <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
 <p className="text-gray-900 font-semibold mb-2">Erreur de chargement</p>
 <p className="text-gray-600 mb-4">{error.message}</p>
 <button
 onClick={() => refetch()}
 className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
 >
 Réessayer
 </button>
 </div>
 ) : (
 <>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {filteredMachines.map((machine) => (
 <MachineCard
 key={machine.id}
 machine={machine}
 onNavigate={onNavigate}
 isSelected={selectedForComparison.includes(machine.id)}
 onToggleSelection={toggleMachineSelection}
 />
 ))}
 </div>

 {filteredMachines.length === 0 && (
 <div className="text-center py-12">
 <p className="text-gray-500">
 Aucun workflow trouvé. Essayez d'ajuster vos filtres.
 </p>
 </div>
 )}
 </>
 )}
 </div>
 );
}