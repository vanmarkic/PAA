import { Machine } from '../App';

export const mockMachines: Machine[] = [
  {
    id: 'risWorkflow',
    name: 'RIS Eligibility Workflow',
    category: 'social',
    description: 'State machine for determining RIS (Revenu d\'Intégration Sociale) benefit eligibility',
    plainLanguage: 'Ce workflow détermine si une personne est éligible au Revenu d\'Intégration Sociale (RIS) en vérifiant ses revenus, sa résidence, son âge et son statut d\'emploi. Le RIS fournit un revenu de base aux personnes sans ressources suffisantes.',
    states: ['idle', 'checkingEligibility', 'verifyingIncome', 'validatingResidence', 'checkingAge', 'calculatingAmount', 'completed', 'rejected', 'failed'],
    events: ['START', 'APPROVE', 'REJECT', 'CALCULATE', 'RETRY', 'RESET', 'VALIDATE', 'SUBMIT'],
    initialState: 'idle',
    complexity: 'Medium',
    stateCount: 18,
    eventCount: 8,
    legalReferences: [
      {
        type: 'Loi',
        name: 'Loi du 26 mai 2002 concernant le droit à l\'intégration sociale',
        url: 'https://www.ejustice.just.fgov.be/eli/loi/2002/05/26/2002022559',
        articles: ['Art. 3', 'Art. 6', 'Art. 14']
      }
    ],
    keywords: ['ris', 'revenu', 'integration', 'sociale', 'cpas', 'aide sociale'],
    lastModified: '2025-01-15',
    version: '2.1.0',
    gherkinFile: 'features/social/ris.feature'
  },
  {
    id: 'agrWorkflow',
    name: 'AGR Income Guarantee Workflow',
    category: 'social',
    description: 'Determines AGR (Allocation de Garantie de Revenus) eligibility and calculates supplement',
    plainLanguage: 'Ce workflow calcule l\'Allocation de Garantie de Revenus (AGR) pour les travailleurs à temps partiel. L\'AGR complète les salaires à temps partiel jusqu\'au revenu minimum garanti de 1650€.',
    states: ['idle', 'checkingEmployment', 'verifyingSalary', 'checkingRights', 'calculating', 'approved', 'rejected'],
    events: ['START', 'VERIFY', 'APPROVE', 'REJECT', 'CALCULATE'],
    initialState: 'idle',
    complexity: 'Medium',
    stateCount: 12,
    eventCount: 5,
    legalReferences: [
      {
        type: 'Arrêté Royal',
        name: 'Arrêté royal du 16 juillet 1992 relatif à l\'allocation de garantie de revenus',
        url: 'https://www.ejustice.just.fgov.be/eli/arrete/1992/07/16/1992022326',
        articles: ['Art. 1', 'Art. 4']
      }
    ],
    keywords: ['agr', 'allocation', 'garantie', 'revenus', 'temps partiel', 'salaire'],
    lastModified: '2024-12-10',
    version: '1.8.3',
    gherkinFile: 'features/social/agr.feature'
  },
  {
    id: 'unemploymentBenefits',
    name: 'Unemployment Benefits Workflow',
    category: 'social',
    description: 'Processes unemployment benefit claims and calculates payment amounts',
    plainLanguage: 'Ce workflow traite les demandes d\'allocations de chômage. Il vérifie l\'historique d\'emploi, calcule le montant des prestations basé sur le dernier salaire, et gère les paiements mensuels.',
    states: ['idle', 'verifyingEmploymentHistory', 'calculatingBenefit', 'processing', 'approved', 'rejected', 'suspended'],
    events: ['START', 'APPROVE', 'REJECT', 'SUSPEND', 'RESUME', 'CALCULATE'],
    initialState: 'idle',
    complexity: 'Complex',
    stateCount: 24,
    eventCount: 10,
    legalReferences: [
      {
        type: 'Arrêté Royal',
        name: 'Arrêté royal du 25 novembre 1991 portant réglementation du chômage',
        url: 'https://www.ejustice.just.fgov.be/eli/arrete/1991/11/25/1991013073',
        articles: ['Art. 30', 'Art. 44', 'Art. 66']
      }
    ],
    keywords: ['chomage', 'unemployment', 'allocation', 'onem', 'werkloosheid'],
    lastModified: '2025-01-20',
    version: '3.2.1',
    gherkinFile: 'features/social/unemployment.feature'
  },
  {
    id: 'familyAllowances',
    name: 'Family Allowances Workflow',
    category: 'family',
    description: 'Calculates family allowance payments based on household composition',
    plainLanguage: 'Ce workflow calcule les allocations familiales mensuelles en fonction du nombre d\'enfants, de leur âge, et de la situation familiale. Les montants varient selon la région (Flandre, Wallonie, Bruxelles).',
    states: ['idle', 'verifyingChildren', 'checkingResidence', 'calculating', 'approved', 'rejected'],
    events: ['START', 'VERIFY', 'APPROVE', 'REJECT', 'UPDATE'],
    initialState: 'idle',
    complexity: 'Simple',
    stateCount: 8,
    eventCount: 5,
    legalReferences: [
      {
        type: 'Décret',
        name: 'Décret du 8 février 2018 relatif au soutien des familles',
        url: 'https://www.ejustice.just.fgov.be/eli/decret/2018/02/08/2018200986',
        articles: ['Art. 5', 'Art. 12']
      }
    ],
    keywords: ['allocations familiales', 'kinderbijslag', 'enfants', 'famille'],
    lastModified: '2024-11-05',
    version: '2.0.0',
    gherkinFile: 'features/family/allowances.feature'
  },
  {
    id: 'housingAssistance',
    name: 'Housing Assistance Workflow',
    category: 'housing',
    description: 'Evaluates eligibility for housing subsidies and rent assistance',
    plainLanguage: 'Ce workflow évalue l\'éligibilité aux aides au logement, incluant les primes au loyer et les subventions pour l\'amélioration de l\'habitat. Il prend en compte les revenus du ménage et le coût du logement.',
    states: ['idle', 'verifyingIncome', 'checkingRentalCost', 'evaluatingConditions', 'calculating', 'approved', 'rejected'],
    events: ['START', 'VERIFY', 'APPROVE', 'REJECT', 'RECALCULATE'],
    initialState: 'idle',
    complexity: 'Medium',
    stateCount: 15,
    eventCount: 7,
    legalReferences: [
      {
        type: 'Arrêté',
        name: 'Code wallon du Logement et de l\'Habitat durable',
        url: 'https://www.ejustice.just.fgov.be/eli/decret/2016/03/17/2016202135',
        articles: ['Art. 70', 'Art. 88']
      }
    ],
    keywords: ['logement', 'housing', 'loyer', 'rent', 'aide', 'subsidy'],
    lastModified: '2024-09-12',
    version: '1.5.2',
    gherkinFile: 'features/housing/assistance.feature'
  },
  {
    id: 'immigrationWorkPermit',
    name: 'Immigration Work Permit Workflow',
    category: 'immigration',
    description: 'Processes work permit applications for foreign nationals',
    plainLanguage: 'Ce workflow traite les demandes de permis de travail pour les ressortissants étrangers. Il vérifie les qualifications, l\'offre d\'emploi, et les conditions du marché du travail.',
    states: ['idle', 'reviewing', 'verifyingQualifications', 'checkingEmployer', 'evaluating', 'approved', 'rejected', 'pendingInfo'],
    events: ['START', 'SUBMIT', 'APPROVE', 'REJECT', 'REQUEST_INFO', 'PROVIDE_INFO'],
    initialState: 'idle',
    complexity: 'Complex',
    stateCount: 22,
    eventCount: 9,
    legalReferences: [
      {
        type: 'Loi',
        name: 'Loi du 30 avril 1999 relative à l\'occupation des travailleurs étrangers',
        url: 'https://www.ejustice.just.fgov.be/eli/loi/1999/04/30/1999012338',
        articles: ['Art. 8', 'Art. 12']
      }
    ],
    keywords: ['immigration', 'work permit', 'permis de travail', 'étranger', 'travailleur'],
    lastModified: '2025-01-08',
    version: '2.3.0',
    gherkinFile: 'features/immigration/work-permit.feature'
  },
  {
    id: 'disabilityBenefits',
    name: 'Disability Benefits Workflow',
    category: 'health',
    description: 'Evaluates disability status and calculates benefit amounts',
    plainLanguage: 'Ce workflow évalue le degré d\'incapacité de travail et détermine l\'allocation d\'invalidité appropriée. Il prend en compte l\'évaluation médicale et la capacité résiduelle de travail.',
    states: ['idle', 'medicalReview', 'assessingCapacity', 'calculating', 'approved', 'rejected', 'underAppeal'],
    events: ['START', 'MEDICAL_EVAL', 'APPROVE', 'REJECT', 'APPEAL', 'REVIEW'],
    initialState: 'idle',
    complexity: 'Complex',
    stateCount: 20,
    eventCount: 8,
    legalReferences: [
      {
        type: 'Arrêté Royal',
        name: 'Arrêté royal du 3 juillet 1996 portant exécution de la loi relative à l\'assurance obligatoire',
        url: 'https://www.ejustice.just.fgov.be/eli/arrete/1996/07/03/1996022386',
        articles: ['Art. 100', 'Art. 114']
      }
    ],
    keywords: ['invalidité', 'disability', 'handicap', 'incapacité', 'allocation'],
    lastModified: '2024-12-18',
    version: '2.4.5',
    gherkinFile: 'features/health/disability.feature'
  },
  {
    id: 'birthAllowance',
    name: 'Birth Allowance Workflow',
    category: 'family',
    description: 'Processes birth allowance claims for new parents',
    plainLanguage: 'Ce workflow traite les demandes de prime de naissance. Il vérifie l\'acte de naissance, la résidence des parents, et calcule le montant de l\'allocation unique à la naissance.',
    states: ['idle', 'verifyingBirth', 'checkingResidence', 'calculating', 'approved', 'rejected'],
    events: ['START', 'VERIFY', 'APPROVE', 'REJECT'],
    initialState: 'idle',
    complexity: 'Simple',
    stateCount: 6,
    eventCount: 4,
    legalReferences: [
      {
        type: 'Décret',
        name: 'Décret relatif aux prestations familiales',
        url: 'https://www.ejustice.just.fgov.be/eli/decret/2019/04/04/2019041228',
        articles: ['Art. 15']
      }
    ],
    keywords: ['naissance', 'birth', 'prime', 'bébé', 'allowance'],
    lastModified: '2024-10-22',
    version: '1.2.1',
    gherkinFile: 'features/family/birth.feature'
  }
];

export const categories = [
  { id: 'social', name: 'Protection Sociale', count: 3, color: 'purple' },
  { id: 'family', name: 'Famille & Enfance', count: 2, color: 'pink' },
  { id: 'housing', name: 'Logement', count: 1, color: 'blue' },
  { id: 'immigration', name: 'Immigration', count: 1, color: 'green' },
  { id: 'health', name: 'Santé & Handicap', count: 1, color: 'red' }
];
