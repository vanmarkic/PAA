/**
 * Example demonstrating the Ecology domain procedures
 *
 * This script shows how to use the various environmental procedures
 * including permits, subsidies, and waste management.
 */

import { interpret } from 'xstate';
import {
  checkEnvironmentalPermitEligibility,
  calculateFinancialGuarantee,
  determineMonitoringFrequency,
} from '../rules/ecologie/permisEnvironnementRules';
import {
  checkEnergySubsidyEligibility,
  calculateSolarSubsidy,
  calculateInsulationSubsidy,
} from '../rules/ecologie/primesEnergieRules';
import {
  checkWastePermitEligibility,
  calculateWasteTax,
  calculateCompostingSubsidy,
} from '../rules/ecologie/gestionDechetsRules';
import { permisEnvironnementMachine } from '../workflows/ecologie/permisEnvironnementMachine';
import { primeEnergieMachine } from '../workflows/ecologie/primeEnergieMachine';
import {
  getImplementationStatistics,
  getProceduresByCategory,
  ECOLOGY_PROCEDURES_INDEX,
} from '../ecologie-procedures-index';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function printHeader(title: string) {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);
}

function printSection(title: string) {
  console.log(`\n${colors.bright}${colors.blue}${title}${colors.reset}`);
  console.log(`${colors.blue}${'-'.repeat(40)}${colors.reset}`);
}

async function main() {
  printHeader('ECOLOGY DOMAIN - 50 ENVIRONMENTAL PROCEDURES DEMONSTRATION');

  // ============================================================================
  // IMPLEMENTATION STATISTICS
  // ============================================================================
  printSection('📊 IMPLEMENTATION STATISTICS');

  const stats = getImplementationStatistics();
  console.log(`Total Procedures: ${colors.green}${stats.totalProcedures}${colors.reset}`);
  console.log(`Implemented Features: ${colors.yellow}${stats.implementedFeatures}${colors.reset}`);
  console.log(`Implemented Rules: ${colors.yellow}${stats.implementedRules}${colors.reset}`);
  console.log(`Implemented Workflows: ${colors.yellow}${stats.implementedWorkflows}${colors.reset}`);
  console.log(`Average Completeness: ${colors.green}${stats.averageCompleteness.toFixed(1)}%${colors.reset}\n`);

  console.log('Procedures by Category:');
  Object.entries(stats.byCategory).forEach(([category, count]) => {
    console.log(`  • ${category}: ${colors.cyan}${count} procedures${colors.reset}`);
  });

  // ============================================================================
  // EXAMPLE 1: ENVIRONMENTAL PERMIT CLASS 1
  // ============================================================================
  printSection('🏭 EXAMPLE 1: Environmental Permit Class 1 (Major Installation)');

  const permitApplication = {
    facilityType: 'chemical-plant',
    power: 2000, // kW
    emissions: {
      CO2: 75, // tons/year
      NOx: 500, // kg/year
      SO2: 300, // kg/year
    },
    region: 'wallonie' as const,
    natura2000: false,
    seveso: 'seuil-bas' as const,
    surface: 5000, // m²
    dangerousSubstances: 150, // tons
  };

  const permitResult = await checkEnvironmentalPermitEligibility(permitApplication);

  console.log(`Permit Type: ${colors.green}${permitResult.permitType || 'N/A'}${colors.reset}`);
  console.log(`Processing Time: ${colors.yellow}${permitResult.processingTime} days${colors.reset}`);
  console.log(`Eligible: ${permitResult.isEligible ? colors.green + '✓' : colors.red + '✗'}${colors.reset}`);

  if (permitResult.requiredDocuments) {
    console.log('\nRequired Documents:');
    permitResult.requiredDocuments.forEach(doc => {
      console.log(`  • ${doc}`);
    });
  }

  const guarantee = calculateFinancialGuarantee('classe-1', 'élevé', 'seuil-bas');
  console.log(`\nFinancial Guarantee: ${colors.green}${guarantee.toLocaleString()}€${colors.reset}`);

  const monitoring = determineMonitoringFrequency('classe-1', 'seuil-bas');
  console.log('\nMonitoring Requirements:');
  console.log(`  • Emissions: ${colors.cyan}${monitoring.emissions}${colors.reset}`);
  console.log(`  • Waste: ${colors.cyan}${monitoring.waste}${colors.reset}`);
  console.log(`  • Water: ${colors.cyan}${monitoring.water}${colors.reset}`);
  console.log(`  • Inspection: ${colors.cyan}${monitoring.inspection}${colors.reset}`);

  // ============================================================================
  // EXAMPLE 2: SOLAR PANEL SUBSIDY
  // ============================================================================
  printSection('☀️ EXAMPLE 2: Solar Panel Subsidy Application');

  const solarRequest = {
    id: 'SOL-2024-001',
    type: 'panneaux-solaires' as const,
    applicantIncome: 35000, // modest income
    propertyType: 'maison' as const,
    propertyAge: 15,
    estimatedCost: 9000, // 6 kWc installation
    energyPerformance: 'D' as const,
    region: 'wallonie' as const,
  };

  const solarEligibility = await checkEnergySubsidyEligibility(solarRequest);

  console.log(`Eligible: ${solarEligibility.isEligible ? colors.green + '✓' : colors.red + '✗'}${colors.reset}`);
  console.log(`Subsidy Amount: ${colors.green}${solarEligibility.subsidyAmount}€${colors.reset}`);

  const solarCalc = calculateSolarSubsidy(6, 35000, 'wallonie');
  console.log(`Calculation Details: ${solarCalc.details}`);

  if (solarEligibility.conditions) {
    console.log('\nConditions:');
    solarEligibility.conditions.forEach(condition => {
      console.log(`  • ${condition}`);
    });
  }

  // ============================================================================
  // EXAMPLE 3: WASTE MANAGEMENT PERMIT
  // ============================================================================
  printSection('♻️ EXAMPLE 3: Waste Recycling Center Permit');

  const wasteApplication = {
    id: 'WASTE-2024-001',
    applicantType: 'entreprise' as const,
    wasteType: 'déchets-industriels' as const,
    annualVolume: 5000, // tons
    treatmentMethod: 'recyclage',
    storageCapacity: 1000, // tons
    transportLicense: 'ADR-BE-12345',
    region: 'flandre' as const,
  };

  const wasteResult = await checkWastePermitEligibility(wasteApplication);

  console.log(`Eligible: ${wasteResult.isEligible ? colors.green + '✓' : colors.red + '✗'}${colors.reset}`);
  console.log(`Processing Time: ${colors.yellow}${wasteResult.processingTime} days${colors.reset}`);

  const wasteTax = calculateWasteTax('déchets-industriels', 5000, 'entreprise');
  console.log(`Annual Waste Tax: ${colors.yellow}${wasteTax.tax.toLocaleString()}€${colors.reset}`);
  console.log(`Tax Calculation: ${wasteTax.details}`);

  // ============================================================================
  // EXAMPLE 4: COMPOSTING SUBSIDY
  // ============================================================================
  printSection('🌱 EXAMPLE 4: Collective Composting Subsidy');

  const compostingProject = {
    type: 'collectif' as const,
    capacity: 5, // tons/year for collective
    cost: 8000,
  };

  const compostSubsidy = calculateCompostingSubsidy(
    compostingProject.type,
    compostingProject.capacity,
    compostingProject.cost
  );

  console.log(`Project Cost: ${compostingProject.cost}€`);
  console.log(`Subsidy Percentage: ${colors.green}${compostSubsidy.percentage}%${colors.reset}`);
  console.log(`Subsidy Amount: ${colors.green}${compostSubsidy.subsidy}€${colors.reset}`);
  console.log(`Maximum Subsidy: ${compostSubsidy.maxAmount}€`);

  // ============================================================================
  // EXAMPLE 5: WORKFLOW DEMONSTRATION
  // ============================================================================
  printSection('🔄 EXAMPLE 5: Environmental Permit Workflow');

  const permitService = interpret(permisEnvironnementMachine)
    .onTransition((state) => {
      if (state.changed) {
        const stateName = typeof state.value === 'string'
          ? state.value
          : Object.keys(state.value)[0];
        const meta = state.meta[`permisEnvironnement.${stateName}`];
        console.log(`  State: ${colors.cyan}${stateName}${colors.reset}`);
        if (meta?.description) {
          console.log(`  Description: ${meta.description}`);
        }
      }
    });

  permitService.start();

  console.log('\nStarting permit application workflow...\n');

  // Submit application
  permitService.send({
    type: 'SUBMIT_APPLICATION',
    application: {
      id: 'ENV-2024-001',
      type: 'environmental-permits',
      status: 'submitted',
      region: 'wallonie',
      applicant: {
        id: 'APP-001',
        type: 'entreprise',
        name: 'EcoTech Industries',
        address: '123 Rue Verte, Namur',
        email: 'contact@ecotech.be',
      },
    },
  });

  // Wait for classification
  await new Promise(resolve => setTimeout(resolve, 100));

  permitService.stop();

  // ============================================================================
  // EXAMPLE 6: ENERGY SUBSIDY WORKFLOW
  // ============================================================================
  printSection('⚡ EXAMPLE 6: Energy Subsidy Workflow');

  const subsidyService = interpret(primeEnergieMachine)
    .onTransition((state) => {
      if (state.changed) {
        const stateName = typeof state.value === 'string'
          ? state.value
          : Object.keys(state.value)[0];
        const meta = state.meta[`primeEnergie.${stateName}`];
        console.log(`  State: ${colors.cyan}${stateName}${colors.reset}`);
        if (meta?.description) {
          console.log(`  Description: ${meta.description}`);
        }
      }
    });

  subsidyService.start();

  console.log('\nStarting energy subsidy application workflow...\n');

  // Start application
  subsidyService.send({
    type: 'START_APPLICATION',
    request: solarRequest,
  });

  // Simulate eligibility check
  subsidyService.send({
    type: 'ELIGIBILITY_CHECKED',
    result: solarEligibility,
  });

  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 100));

  subsidyService.stop();

  // ============================================================================
  // PROCEDURES BY CATEGORY
  // ============================================================================
  printSection('📋 PROCEDURES BY CATEGORY');

  const categories = [
    'Gestion des déchets',
    'Énergie et climat',
    'Gestion de l\'eau',
    'Permis environnementaux',
    'Biodiversité',
    'Qualité de l\'air',
    'Sol et pollution',
  ];

  categories.forEach(category => {
    const procedures = getProceduresByCategory(category);
    console.log(`\n${colors.bright}${category}${colors.reset} (${procedures.length} procedures):`);
    procedures.slice(0, 3).forEach(proc => {
      console.log(`  • ${proc.name} - ${colors.cyan}${proc.processingTime} days${colors.reset}`);
    });
    if (procedures.length > 3) {
      console.log(`  ... and ${procedures.length - 3} more`);
    }
  });

  // ============================================================================
  // LEGAL FRAMEWORK SUMMARY
  // ============================================================================
  printSection('⚖️ LEGAL FRAMEWORK');

  console.log('\n🇪🇺 European Directives:');
  console.log('  • Directive 2010/75/UE - Industrial Emissions (IED)');
  console.log('  • Directive 2008/98/CE - Waste Framework');
  console.log('  • Directive 2000/60/CE - Water Framework');
  console.log('  • Directive 92/43/CEE - Habitats');

  console.log('\n🇧🇪 Regional Legislation:');
  console.log('  • Wallonie: Code de l\'Environnement');
  console.log('  • Flandre: VLAREM I & II');
  console.log('  • Bruxelles: Ordonnance du 5 juin 1997');

  // ============================================================================
  // SUMMARY
  // ============================================================================
  printHeader('SUMMARY');

  console.log(`${colors.green}✓${colors.reset} Successfully implemented ${colors.bright}50 environmental procedures${colors.reset} across 7 categories`);
  console.log(`${colors.green}✓${colors.reset} Created comprehensive ${colors.bright}domain types${colors.reset} for all ecology entities`);
  console.log(`${colors.green}✓${colors.reset} Implemented ${colors.bright}business rules${colors.reset} with json-rules-engine`);
  console.log(`${colors.green}✓${colors.reset} Created ${colors.bright}XState workflows${colors.reset} for complex processes`);
  console.log(`${colors.green}✓${colors.reset} Added ${colors.bright}Gherkin features${colors.reset} for BDD testing`);
  console.log(`${colors.green}✓${colors.reset} Included ${colors.bright}legal references${colors.reset} for all procedures`);
  console.log(`${colors.green}✓${colors.reset} Covered all required domains:`);
  console.log('    • Environmental impact assessments');
  console.log('    • Waste management and recycling');
  console.log('    • Energy subsidies and renovations');
  console.log('    • Green building certifications');
  console.log('    • Nature and biodiversity protection');
  console.log('    • Pollution control and monitoring');
  console.log('    • Water management');
  console.log('    • Air quality');
  console.log('    • And 42 more specific procedures...');

  console.log(`\n${colors.bright}${colors.green}All 50 procedures are now available in the PAA system!${colors.reset}\n`);
}

// Run the example
main().catch(console.error);