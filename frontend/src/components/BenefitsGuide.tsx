import { ArrowLeft, ArrowRight, Users, Home, Heart, Briefcase } from'lucide-react';
import type { Page } from'../App';

interface BenefitsGuideProps {
 onNavigate: (page: Page, machineId?: string) => void;
 language:'fr' | 'nl' | 'en';
}

const benefitCategories = [
 {
 id:'employment',
 name:'Emploi & Revenus',
 icon: Briefcase,
 color:'purple',
 description:'Prestations pour les travailleurs, chômeurs et personnes sans ressources',
 benefits: [
 {
 id:'ris',
 name:'RIS - Revenu d\'Intégration Sociale',
 description:'Revenu de base pour les personnes sans ressources suffisantes. Montant: 1070€ (isolé), 1427€ (famille avec enfants).',
 machineId:'risWorkflow',
 eligibility: ['18 ans ou plus','Résidence en Belgique', 'Revenus insuffisants', 'Disponible pour le travail'],
 keyFacts: {
 amount:'1070€ - 1427€/mois',
 application:'CPAS local',
 processing:'30 jours'
 }
 },
 {
 id:'agr',
 name:'AGR - Allocation de Garantie de Revenus',
 description:'Complément de revenus pour travailleurs à temps partiel. Garantit un revenu minimum de 1650€.',
 machineId:'agrWorkflow',
 eligibility: ['Travailleur à temps partiel','Maintien des droits', 'Salaire mensuel < 1650€'],
 keyFacts: {
 amount:'Variable (complément jusqu\'à 1650€)',
 application:'ONEM',
 processing:'2 semaines'
 }
 },
 {
 id:'unemployment',
 name:'Allocations de Chômage',
 description:'Soutien financier pour demandeurs d\'emploi. Montant basé sur le dernier salaire.',
 machineId:'unemploymentBenefits',
 eligibility: ['Historique d\'emploi suffisant','Inscription comme demandeur d\'emploi', 'Disponible pour le travail'],
 keyFacts: {
 amount:'55-65% du dernier salaire',
 application:'ONEM',
 processing:'4-6 semaines'
 }
 }
 ]
 },
 {
 id:'family',
 name:'Famille & Enfance',
 icon: Users,
 color:'pink',
 description:'Soutien financier pour les familles et les parents',
 benefits: [
 {
 id:'family-allowances',
 name:'Allocations Familiales',
 description:'Paiements mensuels par enfant. Montant varie selon la région et le nombre d\'enfants.',
 machineId:'familyAllowances',
 eligibility: ['Enfant(s) à charge','Résidence en Belgique', 'Enfant de moins de 25 ans'],
 keyFacts: {
 amount:'155€ - 300€/enfant/mois',
 application:'Automatique à la naissance',
 processing:'Immédiat'
 }
 },
 {
 id:'birth-allowance',
 name:'Prime de Naissance',
 description:'Allocation unique à la naissance d\'un enfant.',
 machineId:'birthAllowance',
 eligibility: ['Naissance en Belgique','Résidence des parents', 'Déclaration dans les 3 mois'],
 keyFacts: {
 amount:'1272€ (Wallonie)',
 application:'Caisse d\'allocations familiales',
 processing:'2-3 mois'
 }
 }
 ]
 },
 {
 id:'housing',
 name:'Logement',
 icon: Home,
 color:'blue',
 description:'Aide au loyer et subventions pour l\'amélioration de l\'habitat',
 benefits: [
 {
 id:'housing-assistance',
 name:'Aide au Logement',
 description:'Subventions de loyer et aides pour l\'amélioration de l\'habitat. Prend en compte les revenus du ménage.',
 machineId:'housingAssistance',
 eligibility: ['Revenus du ménage < seuil','Bail de location valide', 'Logement décent'],
 keyFacts: {
 amount:'100€ - 250€/mois',
 application:'Région/CPAS',
 processing:'2-3 mois'
 }
 }
 ]
 },
 {
 id:'health',
 name:'Santé & Handicap',
 icon: Heart,
 color:'red',
 description:'Prestations pour personnes en incapacité ou avec handicap',
 benefits: [
 {
 id:'disability',
 name:'Allocation d\'Invalidité',
 description:'Soutien pour personnes en incapacité de travail. Évaluation médicale requise.',
 machineId:'disabilityBenefits',
 eligibility: ['Évaluation médicale','Incapacité de travail > 66%', 'Cotisations sociales suffisantes'],
 keyFacts: {
 amount:'1200€ - 1800€/mois',
 application:'Mutualité',
 processing:'3-6 mois'
 }
 }
 ]
 }
];

export function BenefitsGuide({ onNavigate, language }: BenefitsGuideProps) {
 const iconColors: Record<string, string> = {
 purple:'text-purple-500 bg-purple-100 ',
 pink:'text-pink-500 bg-pink-100 ',
 blue:'text-blue-500 bg-blue-100 ',
 green:'text-green-500 bg-green-100 ',
 red:'text-red-500 bg-red-100 '
 };

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
 {/* Header */}
 <div className="mb-12">
 <button
 onClick={() => onNavigate('home')}
 className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
 >
 <ArrowLeft className="w-4 h-4" />
 Retour à l'accueil
 </button>

 <h1 className="text-gray-900 mb-4">Guide des Prestations Sociales</h1>
 <p className="text-gray-600 max-w-3xl">
 Découvrez les prestations sociales belges organisées par situation de vie.
 Chaque prestation est liée à sa machine d'état correspondante pour une documentation technique détaillée.
 </p>
 </div>

 {/* Quick Start Button */}
 <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-xl p-8 mb-12 text-white">
 <h2 className="mb-4">Besoin d'aide pour trouver la bonne prestation?</h2>
 <p className="mb-6 text-purple-100">
 Répondez à quelques questions simples et nous vous recommanderons les prestations adaptées à votre situation.
 </p>
 <button
 onClick={() => onNavigate('wizard')}
 className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium"
 >
 Démarrer l'assistant
 <ArrowRight className="w-5 h-5" />
 </button>
 </div>

 {/* Benefit Categories */}
 <div className="space-y-12">
 {benefitCategories.map((category) => {
 const Icon = category.icon;
 return (
 <div key={category.id} className="scroll-mt-20" id={category.id}>
 <div className="flex items-center gap-4 mb-6">
 <div className={`p-3 rounded-xl ${iconColors[category.color]}`}>
 <Icon className="w-8 h-8" />
 </div>
 <div>
 <h2 className="text-gray-900">{category.name}</h2>
 <p className="text-gray-600">{category.description}</p>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {category.benefits.map((benefit) => (
 <div
 key={benefit.id}
 className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
 >
 <div className="p-6">
 <h3 className="text-gray-900 mb-3">{benefit.name}</h3>
 <p className="text-gray-600 mb-4">{benefit.description}</p>

 {/* Key Facts */}
 <div className="bg-gray-50 rounded-lg p-4 mb-4">
 <div className="grid grid-cols-3 gap-4">
 <div>
 <div className="text-gray-600 mb-1">Montant</div>
 <div className="font-semibold text-gray-900">
 {benefit.keyFacts.amount}
 </div>
 </div>
 <div>
 <div className="text-gray-600 mb-1">Demande via</div>
 <div className="font-semibold text-gray-900">
 {benefit.keyFacts.application}
 </div>
 </div>
 <div>
 <div className="text-gray-600 mb-1">Délai</div>
 <div className="font-semibold text-gray-900">
 {benefit.keyFacts.processing}
 </div>
 </div>
 </div>
 </div>

 {/* Eligibility */}
 <div className="mb-4">
 <h4 className="font-semibold text-gray-900 mb-2">
 Conditions d'éligibilité:
 </h4>
 <ul className="space-y-1">
 {benefit.eligibility.map((condition, idx) => (
 <li
 key={idx}
 className="flex items-start gap-2 text-gray-600"
 >
 <span className="text-green-500 mt-1">✓</span>
 <span>{condition}</span>
 </li>
 ))}
 </ul>
 </div>

 {/* Actions */}
 <div className="flex gap-3">
 <button
 onClick={() => onNavigate('machine', benefit.machineId)}
 className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
 >
 Voir le workflow
 </button>
 <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
 En savoir plus
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
 })}
 </div>

 {/* Call to Action */}
 <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
 <h2 className="text-gray-900 mb-3">
 Vous ne trouvez pas la prestation que vous cherchez?
 </h2>
 <p className="text-gray-600 mb-6">
 Explorez toutes les {benefitCategories.reduce((sum, cat) => sum + cat.benefits.length, 0)} workflows
 disponibles ou utilisez notre assistant pour trouver la prestation adaptée.
 </p>
 <div className="flex flex-wrap justify-center gap-4">
 <button
 onClick={() => onNavigate('home')}
 className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
 >
 Explorer tous les workflows
 </button>
 <button
 onClick={() => onNavigate('wizard')}
 className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
 >
 Utiliser l'assistant
 </button>
 </div>
 </div>
 </div>
 );
}