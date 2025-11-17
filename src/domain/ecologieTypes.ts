/**
 * Ecology domain types for environmental procedures
 *
 * Legal basis:
 * - Code de l'environnement
 * - Directives européennes environnementales (2011/92/UE, 2010/75/UE)
 * - Ordonnance de la Région de Bruxelles-Capitale du 5 juin 1997
 * - Décret wallon du 27 mai 2004 relatif au Livre Ier du Code de l'Environnement
 * - Decreet van het Vlaamse Gewest betreffende het algemeen milieubeleid (5 april 1995)
 */

// ============================================================================
// CORE ENVIRONMENTAL TYPES
// ============================================================================

export type EnvironmentalDomain =
  | 'air-quality'
  | 'water-management'
  | 'waste-management'
  | 'energy'
  | 'biodiversity'
  | 'pollution-control'
  | 'climate'
  | 'noise'
  | 'soil'
  | 'environmental-permits';

export type Region = 'wallonie' | 'flandre' | 'bruxelles' | 'federal';

export type PermitType =
  | 'environnement'
  | 'unique'
  | 'classe-1'
  | 'classe-2'
  | 'classe-3'
  | 'declassé';

export type ImpactCategory =
  | 'negligeable'
  | 'faible'
  | 'modéré'
  | 'significatif'
  | 'majeur';

// ============================================================================
// WASTE MANAGEMENT TYPES
// ============================================================================

export type WasteCategory =
  | 'déchets-ménagers'
  | 'déchets-dangereux'
  | 'déchets-inertes'
  | 'déchets-industriels'
  | 'déchets-médicaux'
  | 'déchets-électroniques';

export interface WastePermitApplication {
  id: string;
  applicantType: 'particulier' | 'entreprise' | 'collectivité';
  wasteType: WasteCategory;
  annualVolume: number; // in tons
  treatmentMethod: string;
  storageCapacity: number;
  transportLicense?: string;
  region: Region;
}

// ============================================================================
// ENERGY SUBSIDY TYPES
// ============================================================================

export type EnergySubsidyType =
  | 'panneaux-solaires'
  | 'pompe-chaleur'
  | 'isolation'
  | 'chaudière-biomasse'
  | 'audit-énergétique'
  | 'rénovation-énergétique';

export interface EnergySubsidyRequest {
  id: string;
  type: EnergySubsidyType;
  applicantIncome: number;
  propertyType: 'maison' | 'appartement' | 'commerce';
  propertyAge: number; // years
  estimatedCost: number;
  energyPerformance: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  region: Region;
}

// ============================================================================
// ENVIRONMENTAL IMPACT ASSESSMENT
// ============================================================================

export interface EnvironmentalImpactStudy {
  id: string;
  projectName: string;
  projectType: string;
  location: {
    region: Region;
    commune: string;
    coordinates?: { lat: number; lng: number };
  };
  impactCategories: {
    air: ImpactCategory;
    water: ImpactCategory;
    soil: ImpactCategory;
    noise: ImpactCategory;
    biodiversity: ImpactCategory;
    landscape: ImpactCategory;
  };
  publicInquiryRequired: boolean;
  natura2000Affected: boolean;
}

// ============================================================================
// GREEN BUILDING CERTIFICATION
// ============================================================================

export type GreenCertificationType =
  | 'BREEAM'
  | 'LEED'
  | 'HQE'
  | 'Valideo'
  | 'Passivhaus';

export interface GreenBuildingApplication {
  id: string;
  certificationType: GreenCertificationType;
  buildingType: 'neuf' | 'rénovation';
  surface: number; // m²
  energyConsumption: number; // kWh/m²/year
  waterConsumption: number; // m³/year
  wasteManagementPlan: boolean;
  sustainableMaterials: number; // percentage
}

// ============================================================================
// POLLUTION CONTROL
// ============================================================================

export interface PollutionMonitoring {
  id: string;
  pollutionType: 'air' | 'eau' | 'sol' | 'bruit';
  measurementValue: number;
  unit: string;
  legalLimit: number;
  exceedance: boolean;
  location: string;
  dateTime: Date;
}

export interface EmissionPermit {
  id: string;
  facilityName: string;
  facilityType: string;
  substances: Array<{
    name: string;
    annualLimit: number;
    unit: string;
  }>;
  bestAvailableTechniques: boolean;
  seveso: 'non' | 'seuil-bas' | 'seuil-haut';
}

// ============================================================================
// BIODIVERSITY & NATURE PROTECTION
// ============================================================================

export interface NatureProtectionPermit {
  id: string;
  protectedArea: boolean;
  natura2000: boolean;
  speciesPresent: string[];
  habitatType: string;
  compensationMeasures?: string[];
  monitoringPlan: boolean;
}

export interface BiodiversitySubsidy {
  id: string;
  projectType: 'habitat-restoration' | 'species-protection' | 'ecological-corridor' | 'green-infrastructure';
  surface: number; // hectares
  duration: number; // months
  budget: number;
  expectedOutcomes: string[];
}

// ============================================================================
// WATER MANAGEMENT
// ============================================================================

export interface WaterPermit {
  id: string;
  permitType: 'captage' | 'rejet' | 'modification-cours-eau';
  waterBody: string;
  volume: number; // m³/day
  quality: 'potable' | 'industrielle' | 'irrigation';
  treatmentRequired: boolean;
}

// ============================================================================
// AIR QUALITY
// ============================================================================

export interface AirQualityPermit {
  id: string;
  emissionSource: string;
  pollutants: Array<{
    type: 'NOx' | 'SO2' | 'PM10' | 'PM2.5' | 'COV' | 'CO2';
    limit: number;
    unit: string;
  }>;
  monitoringFrequency: 'continue' | 'journalière' | 'mensuelle' | 'annuelle';
}

// ============================================================================
// RESULT TYPES
// ============================================================================

export interface EcologieEligibilityResult {
  isEligible: boolean;
  permitType?: PermitType;
  subsidyAmount?: number;
  conditions?: string[];
  requiredDocuments?: string[];
  processingTime?: number; // days
  reason?: string;
  legalReference?: {
    law: string;
    article: string;
    url: string;
  };
}

export interface EcologieApplication {
  id: string;
  type: EnvironmentalDomain;
  status: 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected' | 'withdrawn';
  submittedDate?: Date;
  decisionDate?: Date;
  validUntil?: Date;
  region: Region;
  applicant: {
    id: string;
    type: 'particulier' | 'entreprise' | 'collectivité';
    name: string;
    address: string;
    email: string;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const ECOLOGIE_CONSTANTS = {
  // Emission limits (European standards)
  EMISSION_LIMITS: {
    NOx: 200, // µg/m³
    SO2: 350, // µg/m³
    PM10: 50, // µg/m³
    PM25: 25, // µg/m³
    CO2_TAX: 45, // €/tCO2
  },

  // Energy subsidies
  ENERGY_SUBSIDIES: {
    SOLAR_PANELS: {
      max_power: 10, // kWc
      subsidy_per_kwc: 250, // €/kWc
      max_subsidy: 2500, // €
    },
    HEAT_PUMP: {
      base_subsidy: 1500, // €
      income_bonus: 500, // € for low income
      max_subsidy: 4000, // €
    },
    INSULATION: {
      roof: 20, // €/m²
      wall: 25, // €/m²
      floor: 15, // €/m²
      max_subsidy: 6000, // €
    },
  },

  // Waste management fees
  WASTE_FEES: {
    household: 120, // €/year
    dangerous: 250, // €/ton
    electronic: 15, // €/unit
    industrial: 85, // €/ton
  },

  // Processing times (days)
  PROCESSING_TIMES: {
    simple_permit: 30,
    complex_permit: 90,
    impact_study: 180,
    subsidy_request: 60,
  },

  // Regional specifics
  REGIONAL_BONUSES: {
    wallonie: {
      solar_bonus: 1.1,
      insulation_bonus: 1.15,
    },
    flandre: {
      solar_bonus: 1.05,
      heat_pump_bonus: 1.2,
    },
    bruxelles: {
      green_roof_bonus: 1.3,
      rain_water_bonus: 1.25,
    },
  },
};

// ============================================================================
// PROCEDURES LIST (50 PROCEDURES)
// ============================================================================

export const ECOLOGY_PROCEDURES = [
  // Waste Management (10)
  'permis-déchets-dangereux',
  'autorisation-centre-recyclage',
  'declaration-déchets-industriels',
  'prime-compostage',
  'autorisation-incinération',
  'permis-transport-déchets',
  'certification-valorisation',
  'enregistrement-collecteur',
  'autorisation-décharge',
  'prime-zero-déchet',

  // Energy & Climate (10)
  'prime-panneaux-solaires',
  'prime-pompe-chaleur',
  'prime-isolation',
  'audit-énergétique',
  'certificat-peb',
  'prime-chaudière-biomasse',
  'prime-véhicule-électrique',
  'compensation-carbone',
  'certificats-verts',
  'prime-rénovation-énergétique',

  // Water Management (8)
  'permis-captage-eau',
  'autorisation-rejet-eaux',
  'permis-forage',
  'prime-citerne-eau-pluie',
  'autorisation-épuration',
  'permis-modification-cours-eau',
  'declaration-puits',
  'prime-système-épuration-individuel',

  // Environmental Permits (7)
  'permis-environnement-classe-1',
  'permis-environnement-classe-2',
  'permis-unique',
  'étude-incidences',
  'déclaration-classe-3',
  'permis-intégré',
  'autorisation-seveso',

  // Biodiversity (6)
  'permis-natura-2000',
  'autorisation-abattage-arbres',
  'prime-plantation-haies',
  'subside-biodiversité',
  'permis-zone-protégée',
  'prime-toiture-verte',

  // Air Quality (5)
  'permis-émissions-atmosphériques',
  'autorisation-combustion',
  'monitoring-qualité-air',
  'declaration-cov',
  'permis-installation-classée',

  // Soil & Pollution (4)
  'attestation-sol',
  'permis-assainissement-sol',
  'declaration-pollution',
  'certificat-dépollution',
] as const;

export type EcologyProcedure = typeof ECOLOGY_PROCEDURES[number];

// ============================================================================
// LEGAL REFERENCES
// ============================================================================

export const ECOLOGIE_LEGAL_REFERENCES = {
  federal: {
    loi_produits_normes: {
      title: 'Loi du 21 décembre 1998 relative aux normes de produits',
      url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1998122149',
    },
    loi_milieu_marin: {
      title: 'Loi du 20 janvier 1999 protection milieu marin',
      url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1999012033',
    },
  },
  wallonie: {
    code_environnement: {
      title: 'Code de l\'Environnement wallon',
      url: 'http://environnement.wallonie.be/legis/Codeenvironnement/codeLIEnvDispcommunesintro.htm',
    },
    decret_permis: {
      title: 'Décret du 11 mars 1999 relatif au permis d\'environnement',
      url: 'https://wallex.wallonie.be/eli/decret/1999/03/11/1999027439',
    },
    agw_subsidies: {
      title: 'AGW du 26 mars 2015 - primes énergie',
      url: 'https://wallex.wallonie.be/eli/arrete/2015/03/26/2015201732',
    },
  },
  flandre: {
    vlarem_i: {
      title: 'VLAREM I - conditions générales',
      url: 'https://navigator.emis.vito.be/mijn-navigator?woId=75690',
    },
    vlarem_ii: {
      title: 'VLAREM II - normes environnementales',
      url: 'https://navigator.emis.vito.be/mijn-navigator?woId=10071',
    },
    energiebesluit: {
      title: 'Energiebesluit - primes énergie',
      url: 'https://www.energiesparen.be/subsidies',
    },
  },
  bruxelles: {
    cobat: {
      title: 'Code Bruxellois de l\'Aménagement du Territoire',
      url: 'https://urbanisme.irisnet.be/lesreglesdujeu/les-reglementations-urbanistiques',
    },
    ordonnance_permis: {
      title: 'Ordonnance du 5 juin 1997 - permis d\'environnement',
      url: 'http://www.ejustice.just.fgov.be/eli/ordonnance/1997/06/05/1997031238',
    },
    primes_energie: {
      title: 'Arrêté primes énergie 2022',
      url: 'https://environnement.brussels/thematiques/batiment-et-energie/primes-et-incitants',
    },
  },
  europe: {
    directive_ied: {
      title: 'Directive 2010/75/UE émissions industrielles',
      url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32010L0075',
    },
    directive_eia: {
      title: 'Directive 2011/92/UE évaluation incidences',
      url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32011L0092',
    },
    directive_habitats: {
      title: 'Directive 92/43/CEE Habitats',
      url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:31992L0043',
    },
    directive_waste: {
      title: 'Directive 2008/98/CE déchets',
      url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32008L0098',
    },
  },
};