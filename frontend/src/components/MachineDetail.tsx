import { useState } from'react';
import { ArrowLeft, Download, Share2, ExternalLink, Code, BookOpen, Scale, FileCode, PlayCircle, Loader2, AlertCircle } from'lucide-react';
import { useWorkflowDetail } from'../hooks/useWorkflows';
import type { Page } from'../App';

interface MachineDetailProps {
 machineId: string;
 onNavigate: (page: Page, machineId?: string) => void;
 onCompare: (machineIds: string[]) => void;
 language:'fr' | 'nl' | 'en';
}

type TabType ='overview' | 'simulation' | 'technical' | 'legal' | 'examples';

export function MachineDetail({ machineId, onNavigate, onCompare, language }: MachineDetailProps) {
 const [activeTab, setActiveTab] = useState<TabType>('overview');
 const { workflow: machine, loading, error, refetch } = useWorkflowDetail(machineId);

 if (loading) {
 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
 <div className="flex flex-col items-center justify-center py-12">
 <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
 <p className="text-gray-600">Chargement du workflow...</p>
 </div>
 </div>
 );
 }

 if (error) {
 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
 <div className="flex flex-col items-center justify-center py-12">
 <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
 <p className="text-gray-900 font-semibold mb-2">Erreur de chargement</p>
 <p className="text-gray-600 mb-4">{error.message}</p>
 <div className="flex gap-4">
 <button
 onClick={() => refetch()}
 className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
 >
 Réessayer
 </button>
 <button
 onClick={() => onNavigate('home')}
 className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
 >
 Retour à l'accueil
 </button>
 </div>
 </div>
 </div>
 );
 }

 if (!machine) {
 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
 <div className="text-center">
 <h2 className="text-gray-900 mb-4">Workflow non trouvé</h2>
 <button
 onClick={() => onNavigate('home')}
 className="text-purple-600 hover:text-purple-700"
 >
 Retour à l'accueil
 </button>
 </div>
 </div>
 );
 }

 const tabs = [
 { id:'overview' as TabType, label: 'Vue d\'ensemble', icon: BookOpen },
 { id:'simulation' as TabType, label: 'Simulation Interactive', icon: PlayCircle },
 { id:'technical' as TabType, label: 'Référence Technique', icon: Code },
 { id:'legal' as TabType, label: 'Contexte Légal', icon: Scale },
 { id:'examples' as TabType, label: 'Exemples & Cas d\'Usage', icon: FileCode }
 ];

 const complexityColors = {
 Simple:'bg-green-100 text-green-700 ',
 Medium:'bg-orange-100 text-orange-700 ',
 Complex:'bg-red-100 text-red-700 '
 };

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
 {/* Breadcrumb */}
 <nav className="mb-6 flex items-center gap-2 text-gray-600">
 <button
 onClick={() => onNavigate('home')}
 className="hover:text-purple-600 transition-colors"
 >
 Accueil
 </button>
 <span>/</span>
 <span className="text-purple-600">{machine.category}</span>
 <span>/</span>
 <span className="text-gray-900">{machine.name}</span>
 </nav>

 {/* Header */}
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
 <div className="flex items-start justify-between mb-4">
 <div className="flex-1">
 <div className="flex items-center gap-3 mb-3">
 <h1 className="text-gray-900">{machine.name}</h1>
 <span className={`px-3 py-1 rounded-full text-xs font-medium ${complexityColors[machine.complexity]}`}>
 {machine.complexity}
 </span>
 </div>
 <p className="text-gray-600 mb-4">{machine.description}</p>
 </div>
 </div>

 {/* Quick Stats */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
 <div className="bg-gray-50 rounded-lg p-4">
 <div className="text-gray-600 mb-1">États</div>
 <div className="font-semibold text-gray-900">{machine.stateCount}</div>
 </div>
 <div className="bg-gray-50 rounded-lg p-4">
 <div className="text-gray-600 mb-1">Événements</div>
 <div className="font-semibold text-gray-900">{machine.eventCount}</div>
 </div>
 <div className="bg-gray-50 rounded-lg p-4">
 <div className="text-gray-600 mb-1">Version</div>
 <div className="font-semibold text-gray-900">{machine.version}</div>
 </div>
 <div className="bg-gray-50 rounded-lg p-4">
 <div className="text-gray-600 mb-1">Dernière MAJ</div>
 <div className="font-semibold text-gray-900">{machine.lastModified}</div>
 </div>
 </div>

 {/* Quick Actions */}
 <div className="flex flex-wrap gap-3">
 <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
 <PlayCircle className="w-4 h-4" />
 Simuler
 </button>
 <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
 <Download className="w-4 h-4" />
 Exporter PDF
 </button>
 <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
 <Share2 className="w-4 h-4" />
 Partager
 </button>
 <button
 onClick={() => onCompare([machine.id])}
 className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
 >
 Comparer
 </button>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
 {/* Main Content */}
 <div className="lg:col-span-3">
 {/* Tabs */}
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
 <div className="border-b border-gray-200">
 <div className="flex overflow-x-auto">
 {tabs.map((tab) => {
 const Icon = tab.icon;
 return (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors border-b-2 ${
 activeTab === tab.id
 ?'text-purple-600 border-purple-600 bg-purple-50 '
 :'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50 '
 }`}
 >
 <Icon className="w-4 h-4" />
 {tab.label}
 </button>
 );
 })}
 </div>
 </div>

 <div className="p-8">
 {activeTab ==='overview' && (
 <div className="space-y-6">
 <div>
 <h2 className="text-gray-900 mb-3">Que fait cette machine?</h2>
 <p className="text-gray-600 leading-relaxed">
 {machine.plainLanguage}
 </p>
 </div>

 <div>
 <h3 className="text-gray-900 mb-3">Résumé</h3>
 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
 <ul className="space-y-2 text-gray-700">
 <li className="flex items-start gap-2">
 <span className="text-blue-600 mt-1">•</span>
 <span><strong>État initial:</strong> {machine.initialState}</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-blue-600 mt-1">•</span>
 <span><strong>Complexité:</strong> {machine.complexity} ({machine.stateCount} états, {machine.eventCount} événements)</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-blue-600 mt-1">•</span>
 <span><strong>Catégorie:</strong> {machine.category}</span>
 </li>
 </ul>
 </div>
 </div>

 <div>
 <h3 className="text-gray-900 mb-3">Mots-clés</h3>
 <div className="flex flex-wrap gap-2">
 {machine.keywords?.map((keyword) => (
 <span
 key={keyword}
 className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full"
 >
 {keyword}
 </span>
 ))}
 </div>
 </div>

 {machine.gherkinFile && (
 <div>
 <h3 className="text-gray-900 mb-3">Scénarios Gherkin</h3>
 <a
 href="#"
 className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700"
 >
 <FileCode className="w-4 h-4" />
 {machine.gherkinFile}
 <ExternalLink className="w-4 h-4" />
 </a>
 </div>
 )}
 </div>
 )}

 {activeTab ==='simulation' && (
 <div className="space-y-6">
 <div className="bg-gray-50 rounded-lg p-8 text-center">
 <PlayCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
 <h3 className="text-gray-900 mb-2">Simulation Interactive</h3>
 <p className="text-gray-600 mb-4">
 Testez cette machine d'état avec différents scénarios et visualisez les transitions en temps réel.
 </p>
 <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
 Lancer la simulation
 </button>
 </div>

 <div>
 <h3 className="text-gray-900 mb-3">Scénarios pré-configurés</h3>
 <div className="space-y-2">
 <button className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
 <div className="font-medium text-gray-900 mb-1">Scénario 1: Cas standard</div>
 <div className="text-gray-600">Éligibilité complète avec tous les critères remplis</div>
 </button>
 <button className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
 <div className="font-medium text-gray-900 mb-1">Scénario 2: Rejet - Revenu trop élevé</div>
 <div className="text-gray-600">Cas où le revenu dépasse le seuil d'éligibilité</div>
 </button>
 <button className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
 <div className="font-medium text-gray-900 mb-1">Scénario 3: Cas complexe</div>
 <div className="text-gray-600">Situation familiale complexe avec plusieurs enfants</div>
 </button>
 </div>
 </div>
 </div>
 )}

 {activeTab ==='technical' && (
 <div className="space-y-6">
 <div>
 <h3 className="text-gray-900 mb-3">États</h3>
 <div className="overflow-x-auto">
 <table className="w-full text-left">
 <thead className="bg-gray-50">
 <tr>
 <th className="px-4 py-3 text-gray-700 font-medium">État</th>
 <th className="px-4 py-3 text-gray-700 font-medium">Type</th>
 <th className="px-4 py-3 text-gray-700 font-medium">Description</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-200">
 {machine.states.slice(0, 6).map((state) => (
 <tr key={state} className="hover:bg-gray-50">
 <td className="px-4 py-3">
 <code className="px-2 py-1 bg-gray-100 text-purple-600 rounded">
 {state}
 </code>
 </td>
 <td className="px-4 py-3 text-gray-600">
 {state === machine.initialState ?'Initial' : state === 'completed' || state === 'rejected' ? 'Final' : 'Intermédiaire'}
 </td>
 <td className="px-4 py-3 text-gray-600">
 État de traitement
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 <div>
 <h3 className="text-gray-900 mb-3">Événements</h3>
 <div className="flex flex-wrap gap-2">
 {machine.events.map((event) => (
 <span
 key={event}
 className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-mono"
 >
 {event}
 </span>
 ))}
 </div>
 </div>

 <div>
 <h3 className="text-gray-900 mb-3">Code Source</h3>
 <a
 href="#"
 className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700"
 >
 <Code className="w-4 h-4" />
 Voir sur GitHub
 <ExternalLink className="w-4 h-4" />
 </a>
 </div>
 </div>
 )}

 {activeTab ==='legal' && (
 <div className="space-y-6">
 <div>
 <h3 className="text-gray-900 mb-3">Références Légales</h3>
 {machine.legalReferences && machine.legalReferences.length > 0 ? (
 <div className="space-y-4">
 {machine.legalReferences.map((ref, index) => (
 <div
 key={index}
 className="bg-blue-50 border border-blue-200 rounded-lg p-4"
 >
 <div className="flex items-start gap-3">
 <Scale className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
 <div className="flex-1">
 <div className="font-medium text-gray-900 mb-1">
 {ref.type}: {ref.name}
 </div>
 {ref.articles && (
 <div className="text-gray-600 mb-2">
 Articles: {ref.articles.join(',')}
 </div>
 )}
 <a
 href={ref.url}
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
 >
 Voir sur ejustice.just.fgov.be
 <ExternalLink className="w-4 h-4" />
 </a>
 </div>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-gray-600">
 Aucune référence légale disponible pour cette machine.
 </p>
 )}
 </div>
 </div>
 )}

 {activeTab ==='examples' && (
 <div className="space-y-6">
 <div>
 <h3 className="text-gray-900 mb-3">Exemples de Cas Réels</h3>
 <div className="space-y-4">
 <div className="bg-gray-50 rounded-lg p-6">
 <h4 className="font-semibold text-gray-900 mb-3">Exemple 1: Cas Standard</h4>
 <div className="space-y-3">
 <div>
 <div className="font-medium text-gray-700 mb-1">Entrée:</div>
 <pre className="bg-white border border-gray-200 rounded p-3 text-sm overflow-x-auto">
{`{
"age": 25,
"income": 0,
"residence": "Belgium",
"employmentStatus": "unemployed"
}`}
 </pre>
 </div>
 <div>
 <div className="font-medium text-gray-700 mb-1">Sortie:</div>
 <pre className="bg-white border border-gray-200 rounded p-3 text-sm overflow-x-auto">
{`{
"eligible": true,
"amount": 1070.00,
"reason": "Éligible au RIS catégorie isolé"
}`}
 </pre>
 </div>
 </div>
 </div>

 <div className="bg-gray-50 rounded-lg p-6">
 <h4 className="font-semibold text-gray-900 mb-3">Exemple 2: Rejet</h4>
 <div className="space-y-3">
 <div>
 <div className="font-medium text-gray-700 mb-1">Entrée:</div>
 <pre className="bg-white border border-gray-200 rounded p-3 text-sm overflow-x-auto">
{`{
"age": 25,
"income": 1500,
"residence": "Belgium",
"employmentStatus": "part-time"
}`}
 </pre>
 </div>
 <div>
 <div className="font-medium text-gray-700 mb-1">Sortie:</div>
 <pre className="bg-white border border-gray-200 rounded p-3 text-sm overflow-x-auto">
{`{
"eligible": false,
"amount": 0,
"reason": "Revenu supérieur au seuil d'éligibilité"
}`}
 </pre>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Sidebar */}
 <div className="lg:col-span-1">
 <div className="sticky top-24 space-y-6">
 {/* Related Machines */}
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <h3 className="font-semibold text-gray-900 mb-4">Workflows Connexes</h3>
 <div className="space-y-3">
 {mockMachines
 .filter((m) => m.category === machine.category && m.id !== machine.id)
 .slice(0, 3)
 .map((relatedMachine) => (
 <button
 key={relatedMachine.id}
 onClick={() => onNavigate('machine', relatedMachine.id)}
 className="block w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
 >
 <div className="font-medium text-gray-900 mb-1">
 {relatedMachine.name}
 </div>
 <div className="text-gray-600">
 {relatedMachine.stateCount} états
 </div>
 </button>
 ))}
 </div>
 </div>

 {/* Quick Links */}
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <h3 className="font-semibold text-gray-900 mb-4">Actions Rapides</h3>
 <div className="space-y-2">
 <button className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded transition-colors">
 Rapporter un problème
 </button>
 <button className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded transition-colors">
 Suggérer une amélioration
 </button>
 <button className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded transition-colors">
 Voir l'historique
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}