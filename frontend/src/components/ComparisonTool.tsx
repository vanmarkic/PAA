import { ArrowLeft, Download, X, Loader2, AlertCircle } from'lucide-react';
import { useWorkflows } from'../hooks/useWorkflows';
import type { Page } from'../App';

interface ComparisonToolProps {
 machineIds: string[];
 onNavigate: (page: Page, machineId?: string) => void;
 language:'fr' | 'nl' | 'en';
}

export function ComparisonTool({ machineIds, onNavigate, language }: ComparisonToolProps) {
 const { workflows, loading, error } = useWorkflows();

 if (loading) {
 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
 <div className="flex flex-col items-center justify-center py-12">
 <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
 <p className="text-gray-600">Chargement des workflows...</p>
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
 <button
 onClick={() => onNavigate('home')}
 className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
 >
 Retour à l'accueil
 </button>
 </div>
 </div>
 );
 }

 const machines = machineIds
 .map((id) => workflows.find((m) => m.id === id))
 .filter((m): m is NonNullable<typeof m> => m !== undefined);

 if (machines.length < 2) {
 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
 <div className="text-center">
 <h2 className="text-gray-900 mb-4">
 Sélectionnez au moins 2 workflows pour comparer
 </h2>
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

 const comparisonRows = [
 {
 label:'Nom',
 getValue: (m: typeof machines[0]) => m.name,
 type:'text'
 },
 {
 label:'Catégorie',
 getValue: (m: typeof machines[0]) => m.category,
 type:'badge'
 },
 {
 label:'Complexité',
 getValue: (m: typeof machines[0]) => m.complexity,
 type:'complexity'
 },
 {
 label:'Nombre d\'États',
 getValue: (m: typeof machines[0]) => m.stateCount.toString(),
 type:'number'
 },
 {
 label:'Nombre d\'Événements',
 getValue: (m: typeof machines[0]) => m.eventCount.toString(),
 type:'number'
 },
 {
 label:'Version',
 getValue: (m: typeof machines[0]) => m.version ||'N/A',
 type:'text'
 },
 {
 label:'Dernière Mise à Jour',
 getValue: (m: typeof machines[0]) => m.lastModified ||'N/A',
 type:'text'
 },
 {
 label:'Références Légales',
 getValue: (m: typeof machines[0]) => m.legalReferences?.length.toString() ||'0',
 type:'number'
 },
 {
 label:'État Initial',
 getValue: (m: typeof machines[0]) => m.initialState,
 type:'code'
 }
 ];

 const complexityColors = {
 Simple:'bg-green-100 text-green-700 ',
 Medium:'bg-orange-100 text-orange-700 ',
 Complex:'bg-red-100 text-red-700 '
 };

 const getHighlightClass = (row: typeof comparisonRows[0]) => {
 if (row.type !=='number') return '';
 const values = machines.map((m) => parseInt(row.getValue(m)));
 const allSame = values.every((v) => v === values[0]);
 return allSame ?'' : 'bg-yellow-50 ';
 };

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
 {/* Header */}
 <div className="flex items-center justify-between mb-8">
 <div className="flex items-center gap-4">
 <button
 onClick={() => onNavigate('home')}
 className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
 >
 <ArrowLeft className="w-5 h-5 text-gray-600" />
 </button>
 <div>
 <h1 className="text-gray-900">Comparaison de Workflows</h1>
 <p className="text-gray-600">
 Comparaison de {machines.length} workflow(s)
 </p>
 </div>
 </div>

 <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
 <Download className="w-4 h-4" />
 Exporter PDF
 </button>
 </div>

 {/* Comparison Table */}
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead className="bg-gray-50 border-b border-gray-200">
 <tr>
 <th className="px-6 py-4 text-left font-semibold text-gray-900 sticky left-0 bg-gray-50">
 Propriété
 </th>
 {machines.map((machine) => (
 <th key={machine.id} className="px-6 py-4 text-left min-w-[250px]">
 <div className="flex items-center justify-between gap-2">
 <button
 onClick={() => onNavigate('machine', machine.id)}
 className="font-semibold text-purple-600 hover:text-purple-700 text-left"
 >
 {machine.name}
 </button>
 </div>
 </th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-200">
 {comparisonRows.map((row) => {
 const highlightClass = getHighlightClass(row);
 return (
 <tr key={row.label} className={highlightClass}>
 <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-white">
 {row.label}
 </td>
 {machines.map((machine) => {
 const value = row.getValue(machine);
 return (
 <td key={`${machine.id}-${row.label}`} className="px-6 py-4">
 {row.type ==='code' ? (
 <code className="px-2 py-1 bg-gray-100 text-purple-600 rounded text-sm">
 {value}
 </code>
 ) : row.type ==='complexity' ? (
 <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${complexityColors[value as keyof typeof complexityColors]}`}>
 {value}
 </span>
 ) : row.type ==='badge' ? (
 <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
 {value}
 </span>
 ) : (
 <span className="text-gray-700">{value}</span>
 )}
 </td>
 );
 })}
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>

 {/* Detailed Descriptions */}
 <div className="mt-8 space-y-6">
 <h2 className="text-gray-900">Descriptions Détaillées</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {machines.map((machine) => (
 <div
 key={machine.id}
 className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
 >
 <h3 className="font-semibold text-gray-900 mb-3">
 {machine.name}
 </h3>
 <p className="text-gray-600 mb-4">
 {machine.plainLanguage}
 </p>

 {machine.legalReferences && machine.legalReferences.length > 0 && (
 <div className="mb-4">
 <h4 className="font-medium text-gray-900 mb-2">
 Références Légales:
 </h4>
 <ul className="space-y-1">
 {machine.legalReferences.map((ref, idx) => (
 <li key={idx} className="text-gray-600">
 • {ref.type}: {ref.name}
 </li>
 ))}
 </ul>
 </div>
 )}

 <button
 onClick={() => onNavigate('machine', machine.id)}
 className="text-purple-600 hover:text-purple-700 font-medium"
 >
 Voir les détails →
 </button>
 </div>
 ))}
 </div>
 </div>

 {/* States Comparison */}
 <div className="mt-8">
 <h2 className="text-gray-900 mb-4">Comparaison des États</h2>
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {machines.map((machine) => (
 <div key={machine.id}>
 <h3 className="font-semibold text-gray-900 mb-3">
 {machine.name}
 </h3>
 <div className="space-y-2">
 {machine.states.slice(0, 8).map((state) => (
 <div
 key={state}
 className="px-3 py-2 bg-gray-50 rounded text-gray-700"
 >
 {state}
 </div>
 ))}
 {machine.states.length > 8 && (
 <div className="text-gray-500 text-sm">
 +{machine.states.length - 8} autres états
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Events Comparison */}
 <div className="mt-8">
 <h2 className="text-gray-900 mb-4">Comparaison des Événements</h2>
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {machines.map((machine) => (
 <div key={machine.id}>
 <h3 className="font-semibold text-gray-900 mb-3">
 {machine.name}
 </h3>
 <div className="flex flex-wrap gap-2">
 {machine.events.map((event) => (
 <span
 key={event}
 className="px-3 py-1 bg-blue-50 text-blue-700 rounded font-mono text-sm"
 >
 {event}
 </span>
 ))}
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
}