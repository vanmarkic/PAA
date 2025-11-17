/**
 * Business Rules for Carte Médicale et Aide Médicale Urgente (AMU)
 *
 * Implements CPAS medical card and urgent medical aid for vulnerable populations
 * Covers free healthcare access for people in precarious situations
 *
 * BASE JURIDIQUE:
 * - Loi du 8 juillet 1976 organique des centres publics d'action sociale
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1976070801&table_name=loi
 * - Arrêté royal du 12 décembre 1996 relatif à l'aide médicale urgente
 * - Circulaire du 9 juillet 2002 concernant l'aide médicale urgente aux étrangers en séjour illégal
 * - Autorité: SPP Intégration Sociale et CPAS locaux
 * - Dernière mise à jour: janvier 2024
 */

import { Engine } from 'json-rules-engine';
import { EligibilityCheck, LegalReference } from '../modele-metier/types';

// CPAS Medical Card Coverage 2024
export const CPAS_MEDICAL_CARD_COVERAGE = {
  prestations: {
    medecinGeneraliste: {
      coverage: 1.00, // 100% tarif INAMI
      conditions: 'Médecin conventionné du réseau CPAS',
    },
    medicamentsEssentiels: {
      coverage: 1.00, // 100% génériques
      conditions: 'Liste CPAS - médicaments essentiels uniquement',
    },
    hospitalisationUrgente: {
      coverage: 1.00, // 100% chambre commune
      conditions: 'Hôpital public ou conventionné',
    },
    soinsDentairesUrgents: {
      coverage: 1.00, // 100% soins conservateurs
      conditions: 'Urgences uniquement - extraction, traitement douleur',
    },
    analysesLaboratoire: {
      coverage: 1.00, // 100% si prescrites
      conditions: 'Laboratoire conventionné CPAS',
    },
    kinesitherapie: {
      coverage: 'Selon prescription',
      maxSeances: 18,
      conditions: 'Prescription médicale requise',
    },
  },
  validite: {
    duree: '3 mois',
    renouvellement: 'Sur demande avec enquête sociale',
    activation: 'Immédiate si urgence médicale attestée',
  },
};

// AMU (Aide Médicale Urgente) for undocumented persons
export const AMU_COVERAGE = {
  beneficiaires: {
    sansPapiers: {
      description: 'Personnes en séjour irrégulier',
      coverage: 'Soins urgents uniquement',
      condition: 'État d\'indigence prouvé',
    },
    demandeurAsileDeboute: {
      description: 'Demandeur d\'asile débouté avec ordre de quitter',
      coverage: 'AMU complète',
      condition: 'Procédure terminée, pas de retour possible',
    },
    europeenSansRessources: {
      description: 'Citoyen EU/EEE < 3 mois en Belgique',
      coverage: 'AMU si état de besoin',
      condition: 'Pas de couverture santé du pays d\'origine',
    },
  },
  soinsCouverts: {
    consultationsUrgentes: 'Médecin généraliste, urgences hôpital',
    medicamentsUrgents: 'Sur prescription pour pathologie urgente',
    hospitalisationUrgente: 'Si médicalement nécessaire',
    accouchement: 'Suivi grossesse et accouchement complet',
    soinsPreventifs: 'Vaccinations enfants, consultations ONE',
    maladiesContagieuses: 'Traitement obligatoire (tuberculose, etc.)',
  },
  procedure: {
    attestationMedicale: 'Certificat d\'urgence par médecin',
    enqueteSociale: 'Vérification indigence par CPAS',
    decision: 'Dans les 30 jours (24h si urgence vitale)',
    requisitoire: 'Document pour prestataire de soins',
  },
};

// Income thresholds for medical card eligibility
export const MEDICAL_CARD_THRESHOLDS = {
  revenus: {
    isole: {
      seuil: 1070.49, // Équivalent RIS isolé
      description: 'Personne vivant seule',
    },
    cohabitant: {
      seuil: 713.66, // Équivalent RIS cohabitant
      description: 'Personne en cohabitation',
    },
    famille: {
      seuil: 1450.52, // Équivalent RIS famille
      supplementEnfant: 250.00,
      description: 'Famille avec enfants',
    },
  },
  charges: {
    loyer: 'Déductible du revenu',
    chargesEnergie: 'Déductible si factures impayées',
    dettesAlimentaires: 'Non déductibles sauf pension alimentaire',
  },
  resteAVivre: {
    minimum: 300, // Montant minimum après charges fixes
    description: 'Si reste à vivre < 300€, carte médicale probable',
  },
};

// Network of approved healthcare providers
export const CPAS_HEALTHCARE_NETWORK = {
  prestataires: {
    medecinsGeneralistes: {
      nombre: '20+ médecins',
      tarification: 'Tiers-payant CPAS',
      localisation: 'Répartis dans la commune',
    },
    pharmacies: {
      reseau: 'Toutes pharmacies avec tiers-payant',
      medicaments: 'Génériques prioritaires',
    },
    hopitauxPublics: {
      services: 'Urgences et consultations',
      facturation: 'Directe au CPAS',
    },
    maisonsMedicales: {
      forfait: 'Soins intégrés au forfait',
      services: 'Médecine générale, infirmerie, kiné',
    },
    planningFamilial: {
      services: 'Contraception, suivi gynécologique',
      tarif: 'Gratuit ou très réduit',
    },
    centresSanteMentale: {
      condition: 'Si prescription médicale',
      services: 'Psychologie, psychiatrie',
    },
  },
};

// Legal framework references
export const MEDICAL_CARD_LEGAL_FRAMEWORK: LegalReference = {
  type: 'loi',
  title: 'Loi organique des centres publics d\'action sociale',
  date: '1976-07-08',
  officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1976070801&table_name=loi',
  articles: ['1', '57', '57bis', '60'],
  lastAmended: '2024-01',
  authority: 'Service Public de Programmation Intégration Sociale',
};

/**
 * Create the medical card eligibility rules engine
 */
function createMedicalCardEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Income-based eligibility for residents
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isResident',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'resteAVivre',
          operator: 'lessThan',
          value: MEDICAL_CARD_THRESHOLDS.resteAVivre.minimum,
        },
      ],
    },
    event: {
      type: 'medical-card-eligible-income',
      params: {
        message: 'Éligible carte médicale - revenus insuffisants',
        cardType: 'complete',
      },
    },
    priority: 9,
  });

  // Rule 2: RIS beneficiary automatic eligibility
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'hasRIS',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'medical-card-eligible-ris',
      params: {
        message: 'Éligible carte médicale - bénéficiaire RIS',
        cardType: 'complete',
      },
    },
    priority: 10,
  });

  // Rule 3: AMU eligibility for undocumented persons
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'legalStatus',
          operator: 'equal',
          value: 'irregular',
        },
        {
          fact: 'hasUrgentMedicalNeed',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'isIndigent',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'amu-eligible',
      params: {
        message: 'Éligible AMU - soins urgents',
        cardType: 'amu',
      },
    },
    priority: 10,
  });

  // Rule 4: Partial medical aid for working poor
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasEmployment',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'monthlyIncome',
          operator: 'lessThan',
          value: 1200,
        },
        {
          fact: 'hasMutuelle',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'medicalDebt',
          operator: 'greaterThan',
          value: 0,
        },
      ],
    },
    event: {
      type: 'medical-card-eligible-partial',
      params: {
        message: 'Éligible aide médicale partielle',
        cardType: 'partial',
      },
    },
    priority: 8,
  });

  // Rule 5: Elderly person with low pension
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'age',
          operator: 'greaterThanInclusive',
          value: 65,
        },
        {
          fact: 'pensionAmount',
          operator: 'lessThan',
          value: 1000,
        },
        {
          fact: 'hasChronicCondition',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'medical-card-eligible-elderly',
      params: {
        message: 'Éligible carte médicale - personne âgée précaire',
        cardType: 'complete',
      },
    },
    priority: 9,
  });

  // Rule 6: Ineligibility - sufficient resources
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'resteAVivre',
          operator: 'greaterThan',
          value: 800,
        },
        {
          fact: 'hasMutuelle',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'medical-card-ineligible',
      params: {
        reason: 'Ressources suffisantes',
        priority: 5,
      },
    },
    priority: 5,
  });

  return engine;
}

/**
 * Singleton instance of the medical card rules engine
 */
const medicalCardEngineInstance = createMedicalCardEngine();

/**
 * Calculate reste à vivre (remaining income after essential expenses)
 */
export function calculateResteAVivre(
  monthlyIncome: number,
  rent: number,
  energyCosts: number = 0,
  otherCharges: number = 0
): number {
  const totalCharges = rent + energyCosts + otherCharges;
  return Math.max(0, monthlyIncome - totalCharges);
}

/**
 * Determine medical card coverage type
 */
export function determineCoverageType(
  cardType: 'complete' | 'partial' | 'amu',
  specificNeeds?: string[]
): {
  coverage: string[];
  restrictions: string[];
  validity: string;
} {
  switch (cardType) {
    case 'complete':
      return {
        coverage: [
          'Consultations médecins généralistes',
          'Médicaments essentiels (génériques)',
          'Hospitalisation chambre commune',
          'Analyses laboratoire prescrites',
          'Soins dentaires urgents',
          'Kinésithérapie (max 18 séances/an)',
        ],
        restrictions: ['Réseau CPAS conventionné uniquement'],
        validity: '3 mois renouvelable',
      };

    case 'partial':
      return {
        coverage: [
          'Ticket modérateur consultations',
          'Médicaments catégorie C (50% restant)',
          'Aide forfaitaire lunettes (200€)',
          'Soins dentaires urgents',
        ],
        restrictions: ['Complément mutuelle uniquement'],
        validity: '3 mois renouvelable',
      };

    case 'amu':
      return {
        coverage: [
          'Consultations urgentes uniquement',
          'Médicaments urgents sur prescription',
          'Hospitalisation si vitale',
          'Accouchement et suivi grossesse',
          'Vaccinations enfants',
          'Traitement maladies contagieuses',
        ],
        restrictions: [
          'Soins urgents uniquement',
          'Attestation médicale d\'urgence requise',
        ],
        validity: 'Par prestation avec requisitoire',
      };

    default:
      return {
        coverage: [],
        restrictions: [],
        validity: 'Non défini',
      };
  }
}

/**
 * Interface for medical card applicant
 */
export interface MedicalCardApplicant {
  isResident: boolean;
  legalStatus: 'regular' | 'irregular' | 'eu_temporary';
  age: number;
  monthlyIncome: number;
  rent: number;
  energyCosts?: number;
  hasRIS?: boolean;
  hasMutuelle?: boolean;
  hasEmployment?: boolean;
  pensionAmount?: number;
  hasChronicCondition?: boolean;
  hasUrgentMedicalNeed?: boolean;
  isIndigent?: boolean;
  medicalDebt?: number;
  householdSize?: number;
}

/**
 * Check medical card eligibility
 */
export async function checkMedicalCardEligibility(
  applicant: MedicalCardApplicant
): Promise<EligibilityCheck> {
  const resteAVivre = calculateResteAVivre(
    applicant.monthlyIncome,
    applicant.rent,
    applicant.energyCosts || 0
  );

  const facts = {
    isResident: applicant.isResident,
    legalStatus: applicant.legalStatus,
    age: applicant.age,
    resteAVivre,
    monthlyIncome: applicant.monthlyIncome,
    hasRIS: applicant.hasRIS || false,
    hasMutuelle: applicant.hasMutuelle || false,
    hasEmployment: applicant.hasEmployment || false,
    pensionAmount: applicant.pensionAmount || 0,
    hasChronicCondition: applicant.hasChronicCondition || false,
    hasUrgentMedicalNeed: applicant.hasUrgentMedicalNeed || false,
    isIndigent: applicant.isIndigent || false,
    medicalDebt: applicant.medicalDebt || 0,
  };

  try {
    const results = await medicalCardEngineInstance.run(facts);

    // Check for ineligibility
    const ineligibleEvent = results.events.find((e) => e.type === 'medical-card-ineligible');
    if (ineligibleEvent) {
      return {
        benefitType: 'housing-allowance', // Placeholder
        isEligible: false,
        reason: ineligibleEvent.params?.reason,
      };
    }

    // Check for eligibility events
    const eligibilityEvents = results.events.filter((e) =>
      e.type.includes('eligible') && !e.type.includes('ineligible')
    );

    if (eligibilityEvents.length > 0) {
      const primaryEvent = eligibilityEvents[0];
      const cardType = primaryEvent.params?.cardType || 'complete';
      const coverage = determineCoverageType(cardType as 'complete' | 'partial' | 'amu');

      return {
        benefitType: 'housing-allowance', // Placeholder
        isEligible: true,
        optimizationSuggestion: `Carte médicale ${cardType}: ${coverage.coverage.slice(0, 3).join(', ')}...`,
        calculatedAmount: 0, // No monetary amount for medical card
      };
    }

    return {
      benefitType: 'housing-allowance',
      isEligible: false,
      reason: 'Conditions non remplies',
    };
  } catch (error) {
    throw new Error(`Error checking medical card eligibility: ${error}`);
  }
}

/**
 * Process urgent medical aid request
 */
export function processAMURequest(
  urgencyType: string,
  hasAttestation: boolean,
  indigenceProven: boolean
): {
  approved: boolean;
  coverage: string;
  procedure: string;
  timeline: string;
} {
  if (!hasAttestation) {
    return {
      approved: false,
      coverage: 'Aucune',
      procedure: 'Attestation médicale d\'urgence requise',
      timeline: 'Non applicable',
    };
  }

  if (!indigenceProven) {
    return {
      approved: false,
      coverage: 'Aucune',
      procedure: 'Enquête sociale requise pour prouver indigence',
      timeline: '30 jours pour décision',
    };
  }

  const urgencyCoverage: { [key: string]: string } = {
    vital: 'Tous soins nécessaires pour sauver la vie',
    accouchement: 'Suivi grossesse complet et accouchement',
    contagieux: 'Traitement obligatoire maladie contagieuse',
    douleur: 'Traitement de la douleur aiguë',
    preventif_enfant: 'Vaccinations et consultations ONE',
  };

  return {
    approved: true,
    coverage: urgencyCoverage[urgencyType] || 'Soins urgents de base',
    procedure: 'Réquisitoire CPAS pour prestataire',
    timeline: urgencyType === 'vital' ? '24h maximum' : '30 jours',
  };
}

/**
 * Export rules in JSON format for transparency
 */
export const MEDICAL_CARD_RULES_JSON = {
  legalFramework: {
    primaryLegislation: {
      title: MEDICAL_CARD_LEGAL_FRAMEWORK.title,
      date: MEDICAL_CARD_LEGAL_FRAMEWORK.date,
      officialUrl: MEDICAL_CARD_LEGAL_FRAMEWORK.officialUrl,
      authority: MEDICAL_CARD_LEGAL_FRAMEWORK.authority,
      articles: MEDICAL_CARD_LEGAL_FRAMEWORK.articles,
      lastAmended: MEDICAL_CARD_LEGAL_FRAMEWORK.lastAmended,
    },
    implementingDecrees: [
      {
        title: 'Arrêté royal relatif à l\'aide médicale urgente',
        date: '1996-12-12',
        description: 'Définit les conditions de l\'AMU pour personnes en séjour illégal',
      },
      {
        title: 'Circulaire concernant l\'aide médicale urgente',
        date: '2002-07-09',
        description: 'Précise les modalités pratiques de l\'AMU',
      },
    ],
  },
  coverage: {
    cpasCard: CPAS_MEDICAL_CARD_COVERAGE,
    amu: AMU_COVERAGE,
  },
  eligibilityThresholds: MEDICAL_CARD_THRESHOLDS,
  network: CPAS_HEALTHCARE_NETWORK,
  procedures: {
    application: {
      documents: [
        'Carte d\'identité ou passeport',
        'Composition de ménage',
        'Preuves de revenus (3 derniers mois)',
        'Preuves de charges (loyer, factures)',
        'Attestation médicale si soins urgents',
      ],
      timeline: {
        normal: '30 jours après demande complète',
        urgent: '24h si urgence médicale attestée',
      },
      enqueteSociale: 'Visite domicile possible',
    },
    renewal: {
      frequency: 'Tous les 3 mois',
      documents: 'Mise à jour situation',
      automatic: 'Non - demande explicite requise',
    },
    usage: {
      presentation: 'Carte médicale chez prestataire',
      reseau: 'Médecins et pharmacies conventionnés',
      facturation: 'Directe CPAS - pas d\'avance de frais',
      horsReseau: 'Remboursement partiel possible sur justification',
    },
  },
  obligations: [
    'Utiliser le réseau conventionné sauf urgence',
    'Renouveler la demande tous les 3 mois',
    'Déclarer tout changement de situation sous 15 jours',
    'Justifier les soins urgents hors réseau',
    'Collaborer à l\'enquête sociale',
  ],
  recours: {
    internal: 'Recours au conseil CPAS sous 15 jours',
    judicial: 'Tribunal du travail sous 3 mois',
    assistance: 'Aide juridique gratuite disponible',
  },
  lastUpdate: '2024-01-01',
  source: 'SPP Intégration Sociale - CPAS',
};