import { ArrowRight, CheckCircle } from'lucide-react';
import type { Machine, Page } from'../App';

interface MachineCardProps {
 machine: Machine;
 onNavigate: (page: Page, machineId?: string) => void;
 isSelected?: boolean;
 onToggleSelection?: (machineId: string) => void;
}

const complexityColors = {
 Simple:'bg-green-100 text-green-700 border-green-200 ',
 Medium:'bg-orange-100 text-orange-700 border-orange-200 ',
 Complex:'bg-red-100 text-red-700 border-red-200 '
};

const categoryColors: Record<string, string> = {
 social:'bg-purple-100 text-purple-700 ',
 family:'bg-pink-100 text-pink-700 ',
 housing:'bg-blue-100 text-blue-700 ',
 immigration:'bg-green-100 text-green-700 ',
 health:'bg-red-100 text-red-700 '
};

export function MachineCard({ machine, onNavigate, isSelected, onToggleSelection }: MachineCardProps) {
 return (
 <div
 className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all border-2 ${
 isSelected
 ?'border-purple-500 '
 :'border-gray-200 hover:border-gray-300 '
 } overflow-hidden group`}
 >
 <div className="p-6">
 {/* Header */}
 <div className="flex items-start justify-between mb-3">
 <div className="flex-1">
 <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
 {machine.name}
 </h3>
 <div className="flex flex-wrap gap-2 mb-3">
 <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[machine.category] ||'bg-gray-100 text-gray-700 '}`}>
 {machine.category}
 </span>
 <span className={`px-3 py-1 rounded-full text-xs font-medium border ${complexityColors[machine.complexity]}`}>
 {machine.complexity}
 </span>
 </div>
 </div>
 {onToggleSelection && (
 <button
 onClick={(e) => {
 e.stopPropagation();
 onToggleSelection(machine.id);
 }}
 className={`ml-2 p-2 rounded-lg transition-colors ${
 isSelected
 ?'bg-purple-100 text-purple-600 '
 :'bg-gray-100 text-gray-400 hover:text-purple-600 '
 }`}
 aria-label={isSelected ?'Désélectionner' : 'Sélectionner pour comparaison'}
 >
 <CheckCircle className="w-5 h-5" />
 </button>
 )}
 </div>

 {/* Description */}
 <p className="text-gray-600 mb-4 line-clamp-2">
 {machine.plainLanguage}
 </p>

 {/* Stats */}
 <div className="flex items-center gap-4 mb-4 text-gray-600">
 <div className="flex items-center gap-1">
 <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
 <span>{machine.stateCount} états</span>
 </div>
 <div className="flex items-center gap-1">
 <span className="w-2 h-2 bg-green-500 rounded-full"></span>
 <span>{machine.eventCount} événements</span>
 </div>
 </div>

 {/* Legal References Badge */}
 {machine.legalReferences && machine.legalReferences.length > 0 && (
 <div className="mb-4">
 <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
 </svg>
 {machine.legalReferences.length} référence(s) légale(s)
 </span>
 </div>
 )}

 {/* Version Info */}
 {machine.version && (
 <div className="text-xs text-gray-500 mb-4">
 Version {machine.version} • Mis à jour le {machine.lastModified}
 </div>
 )}

 {/* Action Button */}
 <button
 onClick={() => onNavigate('machine', machine.id)}
 className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-purple-600 rounded-lg transition-colors group"
 >
 <span className="font-medium">Voir les détails</span>
 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
 </button>
 </div>
 </div>
 );
}