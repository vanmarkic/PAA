/**
 * Simple script to generate rules metadata for documentation
 *
 * This is a simplified version that creates sample metadata
 * to demonstrate the rules loader system
 */

import * as fs from 'fs';
import * as path from 'path';

// Generate sample metadata from key rule files
function generateSimpleRulesMetadata() {
  console.log('🔄 Starting simplified rules metadata generation...');

  const outputPath = path.join(__dirname, '../docs-astro/public/rules-metadata.json');

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Create sample metadata based on known rule files
  const metadata = {
    generated: new Date().toISOString(),
    totalFiles: 8,
    totalRules: 24,
    categories: ['social-benefits', 'fiscal-rights', 'employment', 'social-services'],
    ruleFiles: [
      {
        fileName: 'agrRules.ts',
        path: '/home/user/PAA/src/rules/agrRules.ts',
        category: 'social-benefits',
        benefitType: 'agr',
        rules: [
          {
            id: 'agr-rule-1',
            name: 'agr-eligible',
            description: 'Eligible pour AGR',
            priority: 10,
            conditions: {
              all: [
                { fact: 'employmentStatus', operator: 'equal', value: 'part-time' },
                { fact: 'hasRightsMaintenance', operator: 'equal', value: true },
                { fact: 'monthlySalaryGross', operator: 'lessThan', value: 1650 }
              ]
            },
            event: { type: 'agr-eligible', params: { message: 'Eligible pour AGR' } },
            facts: ['employmentStatus', 'hasRightsMaintenance', 'monthlySalaryGross']
          },
          {
            id: 'agr-rule-2',
            name: 'agr-ineligible-salary',
            description: 'salaire supérieur au minimum garanti',
            priority: 9,
            conditions: {
              all: [
                { fact: 'employmentStatus', operator: 'equal', value: 'part-time' },
                { fact: 'monthlySalaryGross', operator: 'greaterThanInclusive', value: 1650 }
              ]
            },
            event: { type: 'agr-ineligible', params: { reason: 'salaire supérieur au minimum garanti' } },
            facts: ['employmentStatus', 'monthlySalaryGross']
          },
          {
            id: 'agr-rule-3',
            name: 'agr-ineligible-no-rights',
            description: 'pas de maintien des droits',
            priority: 9,
            conditions: {
              all: [
                { fact: 'employmentStatus', operator: 'equal', value: 'part-time' },
                { fact: 'hasRightsMaintenance', operator: 'equal', value: false }
              ]
            },
            event: { type: 'agr-ineligible', params: { reason: 'pas de maintien des droits' } },
            facts: ['employmentStatus', 'hasRightsMaintenance']
          },
          {
            id: 'agr-rule-4',
            name: 'agr-ineligible-unemployment',
            description: 'cumul interdit avec chômage complet',
            priority: 8,
            conditions: {
              all: [
                { fact: 'currentBenefits', operator: 'contains', value: 'unemployment' }
              ]
            },
            event: { type: 'agr-ineligible', params: { reason: 'cumul interdit avec chômage complet' } },
            facts: ['currentBenefits']
          }
        ],
        metadata: {
          implementsSpecification: '2025.1.0',
          implementationVersion: '2025.1.0',
          implementationStatus: 'complete',
          effectiveDate: '2025-02-01'
        },
        legalFramework: {
          primaryLegislation: {
            title: 'Arrêté royal du 25 novembre 1991',
            officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1991112550',
            authority: 'Office National de l\'Emploi (ONEM)'
          }
        },
        constants: {
          MINIMUM_GUARANTEED_INCOME: true,
          AGR_CALCULATION_RATE: true,
          SALARY_THRESHOLD_2025: true
        }
      },
      {
        fileName: 'risRules.ts',
        path: '/home/user/PAA/src/rules/risRules.ts',
        category: 'social-benefits',
        benefitType: 'ris',
        rules: [
          {
            id: 'ris-rule-1',
            name: 'ris-ineligible-age',
            description: 'âge minimum non atteint (18 ans requis)',
            priority: 10,
            conditions: {
              any: [
                { fact: 'age', operator: 'lessThan', value: 18 }
              ]
            },
            event: { type: 'ris-ineligible', params: { reason: 'âge minimum non atteint' } },
            facts: ['age']
          },
          {
            id: 'ris-rule-2',
            name: 'ris-ineligible-residency',
            description: 'pas de titre de séjour valide',
            priority: 10,
            conditions: {
              any: [
                { fact: 'residencyStatus', operator: 'equal', value: 'no-valid-status' }
              ]
            },
            event: { type: 'ris-ineligible', params: { reason: 'pas de titre de séjour valide' } },
            facts: ['residencyStatus']
          },
          {
            id: 'ris-rule-3',
            name: 'ris-ineligible-patrimony',
            description: 'patrimoine mobilier supérieur à 12500€',
            priority: 9,
            conditions: {
              any: [
                { fact: 'patrimonyValue', operator: 'greaterThan', value: 12500 }
              ]
            },
            event: { type: 'ris-ineligible', params: { reason: 'patrimoine mobilier trop élevé' } },
            facts: ['patrimonyValue']
          },
          {
            id: 'ris-rule-4',
            name: 'ris-ineligible-student',
            description: 'étudiant temps plein (sauf exceptions)',
            priority: 8,
            conditions: {
              all: [
                { fact: 'isFullTimeStudent', operator: 'equal', value: true },
                { fact: 'age', operator: 'lessThan', value: 25 }
              ]
            },
            event: { type: 'ris-ineligible', params: { reason: 'étudiant temps plein' } },
            facts: ['isFullTimeStudent', 'age']
          },
          {
            id: 'ris-rule-5',
            name: 'ris-eligible-basic',
            description: 'Conditions de base remplies',
            priority: 5,
            conditions: {
              all: [
                { fact: 'age', operator: 'greaterThanInclusive', value: 18 },
                { fact: 'residencyStatus', operator: 'notIn', value: ['no-valid-status'] },
                { fact: 'patrimonyValue', operator: 'lessThanInclusive', value: 12500 }
              ]
            },
            event: { type: 'ris-eligible-basic', params: { message: 'Conditions de base remplies' } },
            facts: ['age', 'residencyStatus', 'patrimonyValue']
          }
        ],
        metadata: {
          implementsSpecification: '2024.1.0',
          implementationVersion: '2024.1.0',
          implementationStatus: 'complete',
          effectiveDate: '2024-01-01'
        },
        legalFramework: {
          primaryLegislation: {
            title: 'Loi du 26 mai 2002 concernant le droit à l\'intégration sociale',
            officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2002052647',
            authority: 'Service Public Fédéral Intégration Sociale'
          }
        },
        constants: {
          RIS_AMOUNTS_2024: true,
          RIS_CONSTANTS: true
        }
      },
      {
        fileName: 'allocationsFamilialesRules.ts',
        path: '/home/user/PAA/src/rules/allocationsFamilialesRules.ts',
        category: 'social-benefits',
        benefitType: 'allocations-familiales',
        rules: [
          {
            id: 'af-rule-1',
            name: 'allocations-familiales-eligible',
            description: 'Eligible pour allocations familiales',
            priority: 10,
            conditions: {
              all: [
                { fact: 'hasChildren', operator: 'equal', value: true },
                { fact: 'childrenAge', operator: 'lessThan', value: 25 }
              ]
            },
            event: { type: 'af-eligible', params: { message: 'Eligible pour allocations familiales' } },
            facts: ['hasChildren', 'childrenAge']
          }
        ],
        metadata: null,
        legalFramework: null,
        constants: {
          FAMILY_ALLOWANCES_AMOUNTS: true
        }
      },
      {
        fileName: 'deductionHabitationRules.ts',
        path: '/home/user/PAA/src/rules/deductionHabitationRules.ts',
        category: 'fiscal-rights',
        benefitType: 'deduction-habitation',
        rules: [
          {
            id: 'dh-rule-1',
            name: 'deduction-habitation-eligible',
            description: 'Eligible pour déduction habitation',
            priority: 7,
            conditions: {
              all: [
                { fact: 'ownsProperty', operator: 'equal', value: true },
                { fact: 'isPrimaryResidence', operator: 'equal', value: true }
              ]
            },
            event: { type: 'dh-eligible', params: { message: 'Eligible pour déduction habitation' } },
            facts: ['ownsProperty', 'isPrimaryResidence']
          }
        ],
        metadata: null,
        legalFramework: null,
        constants: null
      },
      {
        fileName: 'contratTravailRules.ts',
        path: '/home/user/PAA/src/rules/contratTravailRules.ts',
        category: 'employment',
        benefitType: 'contrat-travail',
        rules: [
          {
            id: 'ct-rule-1',
            name: 'contrat-valid',
            description: 'Contrat de travail valide',
            priority: 10,
            conditions: {
              all: [
                { fact: 'hasWrittenContract', operator: 'equal', value: true },
                { fact: 'signedByBothParties', operator: 'equal', value: true }
              ]
            },
            event: { type: 'contrat-valid', params: { message: 'Contrat valide' } },
            facts: ['hasWrittenContract', 'signedByBothParties']
          }
        ],
        metadata: null,
        legalFramework: null,
        constants: null
      },
      {
        fileName: 'logementSocialRules.ts',
        path: '/home/user/PAA/src/rules/logementSocialRules.ts',
        category: 'social-services',
        benefitType: 'logement-social',
        rules: [
          {
            id: 'ls-rule-1',
            name: 'logement-social-eligible',
            description: 'Eligible pour logement social',
            priority: 8,
            conditions: {
              all: [
                { fact: 'income', operator: 'lessThan', value: 30000 },
                { fact: 'familySize', operator: 'greaterThan', value: 2 }
              ]
            },
            event: { type: 'ls-eligible', params: { message: 'Eligible pour logement social' } },
            facts: ['income', 'familySize']
          }
        ],
        metadata: null,
        legalFramework: null,
        constants: null
      }
    ],
    statistics: {
      totalRules: 15,
      totalRuleFiles: 6,
      rulesPerCategory: {
        'social-benefits': 11,
        'fiscal-rights': 1,
        'employment': 1,
        'social-services': 2
      },
      averageRulesPerFile: '2.5',
      averagePriorityPerCategory: {
        'social-benefits': '8.2',
        'fiscal-rights': '7.0',
        'employment': '10.0',
        'social-services': '8.0'
      },
      commonFacts: [
        { fact: 'age', count: 3 },
        { fact: 'employmentStatus', count: 3 },
        { fact: 'monthlySalaryGross', count: 2 },
        { fact: 'hasRightsMaintenance', count: 2 },
        { fact: 'residencyStatus', count: 2 },
        { fact: 'patrimonyValue', count: 2 },
        { fact: 'income', count: 1 },
        { fact: 'familySize', count: 1 },
        { fact: 'ownsProperty', count: 1 },
        { fact: 'isFullTimeStudent', count: 1 }
      ],
      commonOperators: [
        { operator: 'equal', count: 12 },
        { operator: 'lessThan', count: 5 },
        { operator: 'greaterThan', count: 3 },
        { operator: 'greaterThanInclusive', count: 2 },
        { operator: 'lessThanInclusive', count: 2 },
        { operator: 'notIn', count: 1 },
        { operator: 'contains', count: 1 }
      ],
      commonEventTypes: [
        { type: 'agr-eligible', count: 1 },
        { type: 'agr-ineligible', count: 3 },
        { type: 'ris-eligible-basic', count: 1 },
        { type: 'ris-ineligible', count: 4 },
        { type: 'af-eligible', count: 1 },
        { type: 'dh-eligible', count: 1 },
        { type: 'contrat-valid', count: 1 },
        { type: 'ls-eligible', count: 1 }
      ]
    },
    coverage: {
      withLegalBasis: 2,
      withMetadata: 2,
      withConstants: 3,
      percentageWithLegalBasis: '33.3%',
      percentageWithMetadata: '33.3%'
    }
  };

  // Write to file
  fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2));

  console.log('✅ Sample rules metadata generation complete!');
  console.log(`📊 Statistics:`);
  console.log(`   - Total files: ${metadata.ruleFiles.length}`);
  console.log(`   - Total rules: ${metadata.statistics.totalRules}`);
  console.log(`   - Categories: ${metadata.categories.join(', ')}`);
  console.log(`📄 Output saved to: ${outputPath}`);
}

// Run the script
if (require.main === module) {
  generateSimpleRulesMetadata();
}

export { generateSimpleRulesMetadata };