/**
 * Index of 50 Environmental Procedures for the Ecology Domain
 *
 * This file provides a comprehensive index of all 50 environmental procedures
 * implemented in the PAA system, organized by category with references to their
 * respective implementation files.
 */

import { EcologyProcedure, ECOLOGY_PROCEDURES } from './domain/ecologieTypes';

export interface ProcedureImplementation {
  id: EcologyProcedure;
  category: string;
  name: string;
  description: string;
  featureFile?: string;
  rulesFile?: string;
  workflowFile?: string;
  processingTime: number; // days
  legalBasis: string;
}

/**
 * Complete index of 50 environmental procedures
 */
export const ECOLOGY_PROCEDURES_INDEX: ProcedureImplementation[] = [
  // ============================================================================
  // WASTE MANAGEMENT (10 procedures)
  // ============================================================================
  {
    id: 'permis-déchets-dangereux',
    category: 'Gestion des déchets',
    name: 'Permis déchets dangereux',
    description: 'Autorisation pour le traitement et stockage de déchets dangereux',
    featureFile: 'features/ecologie/gestion-dechets.feature',
    rulesFile: 'src/rules/ecologie/gestionDechetsRules.ts',
    processingTime: 90,
    legalBasis: 'Directive 2008/98/CE - ADR',
  },
  {
    id: 'autorisation-centre-recyclage',
    category: 'Gestion des déchets',
    name: 'Autorisation centre de recyclage',
    description: 'Permis d\'exploitation d\'un centre de tri et recyclage',
    featureFile: 'features/ecologie/gestion-dechets.feature',
    rulesFile: 'src/rules/ecologie/gestionDechetsRules.ts',
    processingTime: 180,
    legalBasis: 'Décret wallon du 27 juin 1996',
  },
  {
    id: 'declaration-déchets-industriels',
    category: 'Gestion des déchets',
    name: 'Déclaration déchets industriels',
    description: 'Déclaration annuelle des flux de déchets industriels',
    rulesFile: 'src/rules/ecologie/gestionDechetsRules.ts',
    processingTime: 30,
    legalBasis: 'VLAREMA - Règlement flamand',
  },
  {
    id: 'prime-compostage',
    category: 'Gestion des déchets',
    name: 'Prime compostage',
    description: 'Subside pour installation de compostage individuel ou collectif',
    featureFile: 'features/ecologie/gestion-dechets.feature',
    rulesFile: 'src/rules/ecologie/gestionDechetsRules.ts',
    processingTime: 60,
    legalBasis: 'Plan wallon des déchets-ressources',
  },
  {
    id: 'autorisation-incinération',
    category: 'Gestion des déchets',
    name: 'Autorisation incinération',
    description: 'Permis pour installation d\'incinération avec récupération d\'énergie',
    rulesFile: 'src/rules/ecologie/gestionDechetsRules.ts',
    processingTime: 180,
    legalBasis: 'Directive 2010/75/UE (IED)',
  },
  {
    id: 'permis-transport-déchets',
    category: 'Gestion des déchets',
    name: 'Permis transport déchets',
    description: 'Agrément pour le transport professionnel de déchets',
    featureFile: 'features/ecologie/gestion-dechets.feature',
    rulesFile: 'src/rules/ecologie/gestionDechetsRules.ts',
    processingTime: 60,
    legalBasis: 'ADR - Accord européen transport',
  },
  {
    id: 'certification-valorisation',
    category: 'Gestion des déchets',
    name: 'Certification valorisation',
    description: 'Certification des filières de valorisation des déchets',
    processingTime: 90,
    legalBasis: 'Règlement (CE) n° 1013/2006',
  },
  {
    id: 'enregistrement-collecteur',
    category: 'Gestion des déchets',
    name: 'Enregistrement collecteur',
    description: 'Enregistrement comme collecteur agréé de déchets',
    featureFile: 'features/ecologie/gestion-dechets.feature',
    rulesFile: 'src/rules/ecologie/gestionDechetsRules.ts',
    processingTime: 45,
    legalBasis: 'Arrêté du Gouvernement wallon 2009',
  },
  {
    id: 'autorisation-décharge',
    category: 'Gestion des déchets',
    name: 'Autorisation décharge',
    description: 'Permis d\'exploitation d\'un centre d\'enfouissement technique',
    processingTime: 180,
    legalBasis: 'Directive 1999/31/CE décharges',
  },
  {
    id: 'prime-zero-déchet',
    category: 'Gestion des déchets',
    name: 'Prime zéro déchet',
    description: 'Subside pour projets de réduction des déchets à la source',
    processingTime: 60,
    legalBasis: 'Stratégie Circular Wallonia',
  },

  // ============================================================================
  // ENERGY & CLIMATE (10 procedures)
  // ============================================================================
  {
    id: 'prime-panneaux-solaires',
    category: 'Énergie et climat',
    name: 'Prime panneaux solaires',
    description: 'Subside pour installation photovoltaïque résidentielle',
    featureFile: 'features/ecologie/primes-energie.feature',
    rulesFile: 'src/rules/ecologie/primesEnergieRules.ts',
    workflowFile: 'src/workflows/ecologie/primeEnergieMachine.ts',
    processingTime: 60,
    legalBasis: 'AGW du 26 mars 2015 - primes énergie',
  },
  {
    id: 'prime-pompe-chaleur',
    category: 'Énergie et climat',
    name: 'Prime pompe à chaleur',
    description: 'Aide financière pour installation de pompe à chaleur',
    featureFile: 'features/ecologie/primes-energie.feature',
    rulesFile: 'src/rules/ecologie/primesEnergieRules.ts',
    workflowFile: 'src/workflows/ecologie/primeEnergieMachine.ts',
    processingTime: 60,
    legalBasis: 'Arrêté RENOLUTION 2023',
  },
  {
    id: 'prime-isolation',
    category: 'Énergie et climat',
    name: 'Prime isolation',
    description: 'Subside pour travaux d\'isolation thermique',
    featureFile: 'features/ecologie/primes-energie.feature',
    rulesFile: 'src/rules/ecologie/primesEnergieRules.ts',
    workflowFile: 'src/workflows/ecologie/primeEnergieMachine.ts',
    processingTime: 60,
    legalBasis: 'Energiebesluit Vlaanderen',
  },
  {
    id: 'audit-énergétique',
    category: 'Énergie et climat',
    name: 'Audit énergétique',
    description: 'Audit PAE2 obligatoire pour rénovation majeure',
    rulesFile: 'src/rules/ecologie/primesEnergieRules.ts',
    processingTime: 30,
    legalBasis: 'Directive 2012/27/UE efficacité',
  },
  {
    id: 'certificat-peb',
    category: 'Énergie et climat',
    name: 'Certificat PEB',
    description: 'Certificat de performance énergétique des bâtiments',
    processingTime: 15,
    legalBasis: 'Directive 2010/31/UE EPBD',
  },
  {
    id: 'prime-chaudière-biomasse',
    category: 'Énergie et climat',
    name: 'Prime chaudière biomasse',
    description: 'Subside pour chaudière à pellets ou bois',
    featureFile: 'features/ecologie/primes-energie.feature',
    rulesFile: 'src/rules/ecologie/primesEnergieRules.ts',
    processingTime: 60,
    legalBasis: 'Plan Air Climat Énergie 2030',
  },
  {
    id: 'prime-véhicule-électrique',
    category: 'Énergie et climat',
    name: 'Prime véhicule électrique',
    description: 'Aide à l\'achat de véhicules électriques',
    featureFile: 'features/ecologie/primes-energie.feature',
    processingTime: 45,
    legalBasis: 'Décret mobilité verte 2024',
  },
  {
    id: 'compensation-carbone',
    category: 'Énergie et climat',
    name: 'Compensation carbone',
    description: 'Système de compensation des émissions CO2',
    processingTime: 30,
    legalBasis: 'EU ETS - Système d\'échange quotas',
  },
  {
    id: 'certificats-verts',
    category: 'Énergie et climat',
    name: 'Certificats verts',
    description: 'Certificats pour production d\'électricité renouvelable',
    processingTime: 45,
    legalBasis: 'Ordonnance électricité verte',
  },
  {
    id: 'prime-rénovation-énergétique',
    category: 'Énergie et climat',
    name: 'Prime rénovation énergétique',
    description: 'Aide globale pour rénovation énergétique complète',
    featureFile: 'features/ecologie/primes-energie.feature',
    rulesFile: 'src/rules/ecologie/primesEnergieRules.ts',
    workflowFile: 'src/workflows/ecologie/primeEnergieMachine.ts',
    processingTime: 90,
    legalBasis: 'Green Deal européen',
  },

  // ============================================================================
  // WATER MANAGEMENT (8 procedures)
  // ============================================================================
  {
    id: 'permis-captage-eau',
    category: 'Gestion de l\'eau',
    name: 'Permis captage eau',
    description: 'Autorisation de prélèvement d\'eau souterraine ou de surface',
    featureFile: 'features/ecologie/gestion-eau.feature',
    processingTime: 90,
    legalBasis: 'Code de l\'Eau - Livre II',
  },
  {
    id: 'autorisation-rejet-eaux',
    category: 'Gestion de l\'eau',
    name: 'Autorisation rejet eaux',
    description: 'Permis de déversement d\'eaux usées épurées',
    featureFile: 'features/ecologie/gestion-eau.feature',
    processingTime: 90,
    legalBasis: 'Directive 91/271/CEE ERU',
  },
  {
    id: 'permis-forage',
    category: 'Gestion de l\'eau',
    name: 'Permis forage',
    description: 'Autorisation de forage pour puits ou piézomètre',
    featureFile: 'features/ecologie/gestion-eau.feature',
    processingTime: 60,
    legalBasis: 'AGW du 13 septembre 2012',
  },
  {
    id: 'prime-citerne-eau-pluie',
    category: 'Gestion de l\'eau',
    name: 'Prime citerne eau pluie',
    description: 'Subside pour installation de récupération d\'eau de pluie',
    featureFile: 'features/ecologie/gestion-eau.feature',
    processingTime: 45,
    legalBasis: 'Plan de gestion durable de l\'eau',
  },
  {
    id: 'autorisation-épuration',
    category: 'Gestion de l\'eau',
    name: 'Autorisation station épuration',
    description: 'Permis d\'exploitation de station d\'épuration',
    featureFile: 'features/ecologie/gestion-eau.feature',
    processingTime: 120,
    legalBasis: 'Directive cadre sur l\'eau 2000/60/CE',
  },
  {
    id: 'permis-modification-cours-eau',
    category: 'Gestion de l\'eau',
    name: 'Permis modification cours d\'eau',
    description: 'Autorisation de travaux sur cours d\'eau',
    featureFile: 'features/ecologie/gestion-eau.feature',
    processingTime: 90,
    legalBasis: 'Loi du 28 décembre 1967',
  },
  {
    id: 'declaration-puits',
    category: 'Gestion de l\'eau',
    name: 'Déclaration puits',
    description: 'Déclaration obligatoire de puits existant',
    processingTime: 15,
    legalBasis: 'Code de l\'Eau - Article D.172',
  },
  {
    id: 'prime-système-épuration-individuel',
    category: 'Gestion de l\'eau',
    name: 'Prime épuration individuelle',
    description: 'Subside pour système d\'épuration individuelle',
    featureFile: 'features/ecologie/gestion-eau.feature',
    processingTime: 60,
    legalBasis: 'SPGE - Plan d\'assainissement',
  },

  // ============================================================================
  // ENVIRONMENTAL PERMITS (7 procedures)
  // ============================================================================
  {
    id: 'permis-environnement-classe-1',
    category: 'Permis environnementaux',
    name: 'Permis environnement classe 1',
    description: 'Permis pour installations à impact environnemental majeur',
    featureFile: 'features/ecologie/permis-environnement.feature',
    rulesFile: 'src/rules/ecologie/permisEnvironnementRules.ts',
    workflowFile: 'src/workflows/ecologie/permisEnvironnementMachine.ts',
    processingTime: 90,
    legalBasis: 'Décret du 11 mars 1999',
  },
  {
    id: 'permis-environnement-classe-2',
    category: 'Permis environnementaux',
    name: 'Permis environnement classe 2',
    description: 'Permis pour installations à impact environnemental modéré',
    featureFile: 'features/ecologie/permis-environnement.feature',
    rulesFile: 'src/rules/ecologie/permisEnvironnementRules.ts',
    workflowFile: 'src/workflows/ecologie/permisEnvironnementMachine.ts',
    processingTime: 60,
    legalBasis: 'VLAREM I et II',
  },
  {
    id: 'permis-unique',
    category: 'Permis environnementaux',
    name: 'Permis unique',
    description: 'Permis combiné urbanisme et environnement',
    featureFile: 'features/ecologie/permis-environnement.feature',
    processingTime: 120,
    legalBasis: 'Décret du 11 mars 1999',
  },
  {
    id: 'étude-incidences',
    category: 'Permis environnementaux',
    name: 'Étude d\'incidences',
    description: 'Évaluation des incidences environnementales',
    featureFile: 'features/ecologie/permis-environnement.feature',
    rulesFile: 'src/rules/ecologie/permisEnvironnementRules.ts',
    processingTime: 180,
    legalBasis: 'Directive 2011/92/UE EIA',
  },
  {
    id: 'déclaration-classe-3',
    category: 'Permis environnementaux',
    name: 'Déclaration classe 3',
    description: 'Déclaration pour installations à faible impact',
    featureFile: 'features/ecologie/permis-environnement.feature',
    rulesFile: 'src/rules/ecologie/permisEnvironnementRules.ts',
    processingTime: 30,
    legalBasis: 'Arrêté du 4 juillet 2002',
  },
  {
    id: 'permis-intégré',
    category: 'Permis environnementaux',
    name: 'Permis intégré',
    description: 'Permis environnemental intégré pour IPPC',
    processingTime: 120,
    legalBasis: 'Directive 2010/75/UE IED',
  },
  {
    id: 'autorisation-seveso',
    category: 'Permis environnementaux',
    name: 'Autorisation Seveso',
    description: 'Autorisation pour établissement Seveso',
    featureFile: 'features/ecologie/permis-environnement.feature',
    rulesFile: 'src/rules/ecologie/permisEnvironnementRules.ts',
    processingTime: 180,
    legalBasis: 'Directive 2012/18/UE Seveso III',
  },

  // ============================================================================
  // BIODIVERSITY (6 procedures)
  // ============================================================================
  {
    id: 'permis-natura-2000',
    category: 'Biodiversité',
    name: 'Permis Natura 2000',
    description: 'Autorisation d\'activités en zone Natura 2000',
    featureFile: 'features/ecologie/biodiversite-nature.feature',
    processingTime: 120,
    legalBasis: 'Directive 92/43/CEE Habitats',
  },
  {
    id: 'autorisation-abattage-arbres',
    category: 'Biodiversité',
    name: 'Autorisation abattage arbres',
    description: 'Permis d\'abattage d\'arbres remarquables ou protégés',
    featureFile: 'features/ecologie/biodiversite-nature.feature',
    processingTime: 45,
    legalBasis: 'Code forestier - CoDT',
  },
  {
    id: 'prime-plantation-haies',
    category: 'Biodiversité',
    name: 'Prime plantation haies',
    description: 'Subside pour plantation de haies indigènes',
    featureFile: 'features/ecologie/biodiversite-nature.feature',
    processingTime: 60,
    legalBasis: 'Plan Maya - Biodiversité 2020-2030',
  },
  {
    id: 'subside-biodiversité',
    category: 'Biodiversité',
    name: 'Subside biodiversité',
    description: 'Aide pour projets de restauration écologique',
    featureFile: 'features/ecologie/biodiversite-nature.feature',
    processingTime: 90,
    legalBasis: 'Stratégie biodiversité UE 2030',
  },
  {
    id: 'permis-zone-protégée',
    category: 'Biodiversité',
    name: 'Permis zone protégée',
    description: 'Autorisation d\'activités en réserve naturelle',
    featureFile: 'features/ecologie/biodiversite-nature.feature',
    processingTime: 90,
    legalBasis: 'Loi du 12 juillet 1973',
  },
  {
    id: 'prime-toiture-verte',
    category: 'Biodiversité',
    name: 'Prime toiture végétalisée',
    description: 'Subside pour toiture végétalisée extensive ou intensive',
    featureFile: 'features/ecologie/biodiversite-nature.feature',
    processingTime: 45,
    legalBasis: 'Plan nature Bruxelles',
  },

  // ============================================================================
  // AIR QUALITY (5 procedures)
  // ============================================================================
  {
    id: 'permis-émissions-atmosphériques',
    category: 'Qualité de l\'air',
    name: 'Permis émissions atmosphériques',
    description: 'Autorisation d\'émissions dans l\'atmosphère',
    processingTime: 90,
    legalBasis: 'Directive 2008/50/CE qualité air',
  },
  {
    id: 'autorisation-combustion',
    category: 'Qualité de l\'air',
    name: 'Autorisation installation combustion',
    description: 'Permis pour installation de combustion > 1MW',
    processingTime: 60,
    legalBasis: 'Directive 2015/2193/UE MCP',
  },
  {
    id: 'monitoring-qualité-air',
    category: 'Qualité de l\'air',
    name: 'Monitoring qualité air',
    description: 'Système de surveillance continue de la qualité de l\'air',
    processingTime: 30,
    legalBasis: 'Arrêté monitoring émissions',
  },
  {
    id: 'declaration-cov',
    category: 'Qualité de l\'air',
    name: 'Déclaration COV',
    description: 'Déclaration émissions composés organiques volatils',
    processingTime: 30,
    legalBasis: 'Directive 2004/42/CE COV',
  },
  {
    id: 'permis-installation-classée',
    category: 'Qualité de l\'air',
    name: 'Permis installation classée ICPE',
    description: 'Autorisation installation classée pour l\'environnement',
    processingTime: 120,
    legalBasis: 'Code de l\'environnement - ICPE',
  },

  // ============================================================================
  // SOIL & POLLUTION (4 procedures)
  // ============================================================================
  {
    id: 'attestation-sol',
    category: 'Sol et pollution',
    name: 'Attestation du sol',
    description: 'Attestation de non-pollution des sols',
    processingTime: 45,
    legalBasis: 'Décret sols du 1er mars 2018',
  },
  {
    id: 'permis-assainissement-sol',
    category: 'Sol et pollution',
    name: 'Permis assainissement sol',
    description: 'Autorisation de travaux d\'assainissement de sols pollués',
    processingTime: 90,
    legalBasis: 'Ordonnance sols 2009',
  },
  {
    id: 'declaration-pollution',
    category: 'Sol et pollution',
    name: 'Déclaration pollution',
    description: 'Déclaration obligatoire de pollution accidentelle',
    processingTime: 1,
    legalBasis: 'Code de l\'environnement - urgence',
  },
  {
    id: 'certificat-dépollution',
    category: 'Sol et pollution',
    name: 'Certificat dépollution',
    description: 'Certificat de conformité après dépollution',
    processingTime: 60,
    legalBasis: 'Arrêté dépollution 2019',
  },
];

/**
 * Get procedures by category
 */
export function getProceduresByCategory(category: string): ProcedureImplementation[] {
  return ECOLOGY_PROCEDURES_INDEX.filter(proc => proc.category === category);
}

/**
 * Get procedure implementation status
 */
export function getProcedureImplementationStatus(id: EcologyProcedure): {
  hasFeature: boolean;
  hasRules: boolean;
  hasWorkflow: boolean;
  completeness: number; // percentage
} {
  const proc = ECOLOGY_PROCEDURES_INDEX.find(p => p.id === id);

  if (!proc) {
    return {
      hasFeature: false,
      hasRules: false,
      hasWorkflow: false,
      completeness: 0,
    };
  }

  const hasFeature = !!proc.featureFile;
  const hasRules = !!proc.rulesFile;
  const hasWorkflow = !!proc.workflowFile;

  const completeness =
    ((hasFeature ? 33 : 0) + (hasRules ? 33 : 0) + (hasWorkflow ? 34 : 0));

  return {
    hasFeature,
    hasRules,
    hasWorkflow,
    completeness,
  };
}

/**
 * Get implementation statistics
 */
export function getImplementationStatistics(): {
  totalProcedures: number;
  implementedFeatures: number;
  implementedRules: number;
  implementedWorkflows: number;
  averageCompleteness: number;
  byCategory: Record<string, number>;
} {
  const stats = {
    totalProcedures: ECOLOGY_PROCEDURES_INDEX.length,
    implementedFeatures: 0,
    implementedRules: 0,
    implementedWorkflows: 0,
    averageCompleteness: 0,
    byCategory: {} as Record<string, number>,
  };

  let totalCompleteness = 0;

  ECOLOGY_PROCEDURES_INDEX.forEach(proc => {
    if (proc.featureFile) stats.implementedFeatures++;
    if (proc.rulesFile) stats.implementedRules++;
    if (proc.workflowFile) stats.implementedWorkflows++;

    const status = getProcedureImplementationStatus(proc.id);
    totalCompleteness += status.completeness;

    // Count by category
    stats.byCategory[proc.category] = (stats.byCategory[proc.category] || 0) + 1;
  });

  stats.averageCompleteness = totalCompleteness / stats.totalProcedures;

  return stats;
}

// Export for validation
export { ECOLOGY_PROCEDURES };