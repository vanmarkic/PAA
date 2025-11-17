import { useState } from'react';
import { ArrowLeft, ArrowRight, CheckCircle, Sparkles } from'lucide-react';
import type { Page } from'../App';

interface WorkflowWizardProps {
 onNavigate: (page: Page, machineId?: string) => void;
 language:'fr' | 'nl' | 'en';
}

type Step ='category' | 'questions' | 'results';

interface Recommendation {
 machineId: string;
 name: string;
 confidence:'high' | 'medium';
 reason: string;
}

const categories = [
 {
 id:'employment',
 name:'Emploi & Revenus',
 description:'Chômage, RIS, AGR, complément de revenus',
 icon:'💼'
 },
 {
 id:'family',
 name:'Famille & Enfance',
 description:'Allocations familiales, prime de naissance',
 icon:'👨‍👩‍👧‍👦'
 },
 {
 id:'housing',
 name:'Logement',
 description:'Aide au loyer, primes habitat',
 icon:'🏠'
 },
 {
 id:'health',
 name:'Santé & Handicap',
 description:'Invalidité, aide aux personnes handicapées',
 icon:'❤️'
 },
 {
 id:'immigration',
 name:'Immigration',
 description:'Permis de travail, regroupement familial',
 icon:'🌍'
 }
];

const questions: Record<string, Array<{
 id: string;
 text: string;
 options: Array<{ value: string; label: string }>;
}>> = {
 employment: [
 {
 id:'status',
 text:'Quel est votre statut d\'emploi actuel?',
 options: [
 { value:'employed-fulltime', label: 'Employé à temps plein' },
 { value:'employed-parttime', label: 'Employé à temps partiel' },
 { value:'unemployed', label: 'Sans emploi' },
 { value:'student', label: 'Étudiant' }
 ]
 },
 {
 id:'income',
 text:'Quel est votre revenu mensuel approximatif?',
 options: [
 { value:'none', label: 'Aucun revenu' },
 { value:'low', label: 'Moins de 1000€' },
 { value:'medium', label: '1000€ - 1500€' },
 { value:'high', label: 'Plus de 1500€' }
 ]
 },
 {
 id:'household',
 text:'Quelle est votre situation familiale?',
 options: [
 { value:'single', label: 'Isolé(e)' },
 { value:'couple', label: 'En couple sans enfants' },
 { value:'family', label: 'En couple avec enfants' },
 { value:'single-parent', label: 'Parent isolé' }
 ]
 }
 ],
 family: [
 {
 id:'children',
 text:'Avez-vous des enfants à charge?',
 options: [
 { value:'none', label: 'Non' },
 { value:'expecting', label: 'En attente d\'un enfant' },
 { value:'one', label: '1 enfant' },
 { value:'multiple', label: '2 enfants ou plus' }
 ]
 },
 {
 id:'age',
 text:'Âge de l\'enfant le plus jeune?',
 options: [
 { value:'newborn', label: 'Nouveau-né (< 1 an)' },
 { value:'toddler', label: '1-5 ans' },
 { value:'school', label: '6-17 ans' },
 { value:'young-adult', label: '18-25 ans (études)' }
 ]
 }
 ],
 housing: [
 {
 id:'situation',
 text:'Quelle est votre situation de logement?',
 options: [
 { value:'renting', label: 'Locataire' },
 { value:'owner', label: 'Propriétaire' },
 { value:'homeless', label: 'Sans domicile' },
 { value:'family', label: 'Chez la famille' }
 ]
 },
 {
 id:'cost',
 text:'Quel est le coût de votre logement?',
 options: [
 { value:'low', label: 'Moins de 500€/mois' },
 { value:'medium', label: '500€ - 800€/mois' },
 { value:'high', label: 'Plus de 800€/mois' }
 ]
 }
 ],
 health: [
 {
 id:'condition',
 text:'Avez-vous une incapacité de travail?',
 options: [
 { value:'none', label: 'Non' },
 { value:'temporary', label: 'Temporaire (< 1 an)' },
 { value:'permanent', label: 'Permanente' },
 { value:'disability', label: 'Handicap reconnu' }
 ]
 }
 ],
 immigration: [
 {
 id:'status',
 text:'Quel est votre statut en Belgique?',
 options: [
 { value:'citizen', label: 'Citoyen belge' },
 { value:'eu', label: 'Citoyen UE' },
 { value:'non-eu', label: 'Non-UE avec permis' },
 { value:'refugee', label: 'Demandeur d\'asile/réfugié' }
 ]
 }
 ]
};

export function WorkflowWizard({ onNavigate, language }: WorkflowWizardProps) {
 const [step, setStep] = useState<Step>('category');
 const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
 const [answers, setAnswers] = useState<Record<string, string>>({});
 const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

 const handleCategorySelect = (categoryId: string) => {
 setSelectedCategory(categoryId);
 setAnswers({});
 setStep('questions');
 };

 const handleAnswer = (questionId: string, value: string) => {
 setAnswers((prev) => ({ ...prev, [questionId]: value }));
 };

 const generateRecommendations = (): Recommendation[] => {
 if (!selectedCategory) return [];

 const recs: Recommendation[] = [];

 if (selectedCategory ==='employment') {
 if (answers.status ==='unemployed' && answers.income === 'none') {
 recs.push({
 machineId:'risWorkflow',
 name:'RIS - Revenu d\'Intégration Sociale',
 confidence:'high',
 reason:'Vous êtes sans emploi et sans revenu. Le RIS fournit un revenu de base.'
 });
 }
 if (answers.status ==='employed-parttime' && (answers.income === 'low' || answers.income === 'medium')) {
 recs.push({
 machineId:'agrWorkflow',
 name:'AGR - Allocation de Garantie de Revenus',
 confidence:'high',
 reason:'Vous travaillez à temps partiel avec un revenu modeste. L\'AGR peut compléter vos revenus.'
 });
 }
 if (answers.status ==='unemployed') {
 recs.push({
 machineId:'unemploymentBenefits',
 name:'Allocations de Chômage',
 confidence:'medium',
 reason:'Si vous avez un historique d\'emploi suffisant, vous pourriez être éligible.'
 });
 }
 }

 if (selectedCategory ==='family') {
 if (answers.children ==='expecting') {
 recs.push({
 machineId:'birthAllowance',
 name:'Prime de Naissance',
 confidence:'high',
 reason:'Vous attendez un enfant. La prime de naissance est une allocation unique à la naissance.'
 });
 }
 if (answers.children !=='none' && answers.children !== 'expecting') {
 recs.push({
 machineId:'familyAllowances',
 name:'Allocations Familiales',
 confidence:'high',
 reason:'Vous avez des enfants à charge. Les allocations familiales sont versées mensuellement.'
 });
 }
 }

 if (selectedCategory ==='housing') {
 if (answers.situation ==='renting') {
 recs.push({
 machineId:'housingAssistance',
 name:'Aide au Logement',
 confidence:'medium',
 reason:'En tant que locataire, vous pourriez être éligible à l\'aide au loyer selon vos revenus.'
 });
 }
 }

 if (selectedCategory ==='health') {
 if (answers.condition ==='permanent' || answers.condition === 'disability') {
 recs.push({
 machineId:'disabilityBenefits',
 name:'Allocation d\'Invalidité',
 confidence:'high',
 reason:'Vous avez une incapacité permanente. L\'allocation d\'invalidité peut vous soutenir.'
 });
 }
 }

 if (selectedCategory ==='immigration') {
 if (answers.status ==='non-eu') {
 recs.push({
 machineId:'immigrationWorkPermit',
 name:'Permis de Travail',
 confidence:'medium',
 reason:'En tant que non-citoyen UE, vous pourriez avoir besoin d\'un permis de travail.'
 });
 }
 }

 return recs;
 };

 const handleSubmit = () => {
 const recs = generateRecommendations();
 setRecommendations(recs);
 setStep('results');
 };

 const currentQuestions = selectedCategory ? questions[selectedCategory] || [] : [];
 const allQuestionsAnswered = currentQuestions.every((q) => answers[q.id]);

 return (
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
 <button
 onClick={() => {
 if (step ==='category') {
 onNavigate('home');
 } else if (step ==='questions') {
 setStep('category');
 } else {
 setStep('questions');
 }
 }}
 className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-8"
 >
 <ArrowLeft className="w-4 h-4" />
 {step ==='category' ? 'Retour à l\'accueil' : 'Retour'}
 </button>

 {/* Header */}
 <div className="text-center mb-12">
 <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full mb-4">
 <Sparkles className="w-8 h-8 text-white" />
 </div>
 <h1 className="text-gray-900 mb-3">Assistant de Recherche de Prestations</h1>
 <p className="text-gray-600">
 Répondez à quelques questions pour trouver les prestations adaptées à votre situation
 </p>
 </div>

 {/* Progress Indicator */}
 <div className="flex items-center justify-center gap-2 mb-12">
 <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step ==='category' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600 '}`}>
 {step !=='category' ? <CheckCircle className="w-5 h-5" /> : '1'}
 </div>
 <div className={`h-1 w-12 ${step !=='category' ? 'bg-purple-600' : 'bg-gray-300 '}`}></div>
 <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step ==='questions' ? 'bg-purple-600 text-white' : step === 'results' ? 'bg-purple-100 text-purple-600 ' : 'bg-gray-300 text-gray-600 '}`}>
 {step ==='results' ? <CheckCircle className="w-5 h-5" /> : '2'}
 </div>
 <div className={`h-1 w-12 ${step ==='results' ? 'bg-purple-600' : 'bg-gray-300 '}`}></div>
 <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step ==='results' ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600 '}`}>
 3
 </div>
 </div>

 {/* Category Selection */}
 {step ==='category' && (
 <div>
 <h2 className="text-gray-900 mb-6 text-center">
 Dans quel domaine avez-vous besoin d'aide?
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {categories.map((category) => (
 <button
 key={category.id}
 onClick={() => handleCategorySelect(category.id)}
 className="text-left p-6 bg-white border-2 border-gray-200 hover:border-purple-500 rounded-xl transition-all hover:shadow-md"
 >
 <div className="text-4xl mb-3">{category.icon}</div>
 <h3 className="font-semibold text-gray-900 mb-2">
 {category.name}
 </h3>
 <p className="text-gray-600">{category.description}</p>
 </button>
 ))}
 </div>
 </div>
 )}

 {/* Questions */}
 {step ==='questions' && selectedCategory && (
 <div className="max-w-2xl mx-auto">
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
 <div className="mb-8">
 <h2 className="text-gray-900 mb-2">
 {categories.find((c) => c.id === selectedCategory)?.name}
 </h2>
 <p className="text-gray-600">
 Question {Object.keys(answers).length + 1} sur {currentQuestions.length}
 </p>
 </div>

 <div className="space-y-8">
 {currentQuestions.map((question) => (
 <div key={question.id}>
 <h3 className="text-gray-900 mb-4">{question.text}</h3>
 <div className="space-y-2">
 {question.options.map((option) => (
 <button
 key={option.value}
 onClick={() => handleAnswer(question.id, option.value)}
 className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
 answers[question.id] === option.value
 ?'border-purple-500 bg-purple-50 text-purple-900 '
 :'border-gray-200 hover:border-gray-300 text-gray-700 '
 }`}
 >
 <div className="flex items-center gap-3">
 <div
 className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
 answers[question.id] === option.value
 ?'border-purple-500 bg-purple-500'
 :'border-gray-300 '
 }`}
 >
 {answers[question.id] === option.value && (
 <CheckCircle className="w-4 h-4 text-white" />
 )}
 </div>
 <span>{option.label}</span>
 </div>
 </button>
 ))}
 </div>
 </div>
 ))}
 </div>

 <button
 onClick={handleSubmit}
 disabled={!allQuestionsAnswered}
 className="w-full mt-8 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
 >
 Voir les recommandations
 <ArrowRight className="w-5 h-5" />
 </button>
 </div>
 </div>
 )}

 {/* Results */}
 {step ==='results' && (
 <div className="max-w-3xl mx-auto">
 <div className="text-center mb-8">
 <h2 className="text-gray-900 mb-3">
 Prestations Recommandées
 </h2>
 <p className="text-gray-600">
 Basé sur vos réponses, voici les prestations qui pourraient vous concerner
 </p>
 </div>

 {recommendations.length > 0 ? (
 <div className="space-y-6">
 {recommendations.map((rec, idx) => (
 <div
 key={idx}
 className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6"
 >
 <div className="flex items-start justify-between mb-3">
 <div className="flex-1">
 <div className="flex items-center gap-3 mb-2">
 <h3 className="text-gray-900">{rec.name}</h3>
 <span
 className={`px-3 py-1 rounded-full text-xs font-medium ${
 rec.confidence ==='high'
 ?'bg-green-100 text-green-700 '
 :'bg-orange-100 text-orange-700 '
 }`}
 >
 Confiance {rec.confidence ==='high' ? 'élevée' : 'moyenne'}
 </span>
 </div>
 <p className="text-gray-600 mb-4">{rec.reason}</p>
 </div>
 </div>

 <div className="flex gap-3">
 <button
 onClick={() => onNavigate('machine', rec.machineId)}
 className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
 >
 Voir la documentation technique
 </button>
 <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
 En savoir plus
 </button>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="bg-gray-50 rounded-xl p-12 text-center">
 <p className="text-gray-600 mb-4">
 Aucune recommandation spécifique pour votre situation. 
 Explorez toutes les prestations disponibles ou contactez votre CPAS local.
 </p>
 <button
 onClick={() => onNavigate('benefits')}
 className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
 >
 Voir toutes les prestations
 </button>
 </div>
 )}

 <div className="mt-8 text-center">
 <button
 onClick={() => {
 setStep('category');
 setSelectedCategory(null);
 setAnswers({});
 setRecommendations([]);
 }}
 className="text-purple-600 hover:text-purple-700"
 >
 Recommencer avec une autre catégorie
 </button>
 </div>
 </div>
 )}
 </div>
 );
}
