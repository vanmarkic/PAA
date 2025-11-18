/**
 * CLI Script: Initialize Database with ALL Topics from Codebase
 * 
 * Creates initial registry with all topics/benefits found in the project
 * 
 * Usage:
 *   npm run db:init
 */

import * as fs from 'fs';
import * as path from 'path';
import { getDatabaseService } from '../src/database/registryService';

// Extract topic IDs from rule files
function getAllTopicsFromRules(): string[] {
  const rulesDir = path.join(process.cwd(), 'src/rules');
  if (!fs.existsSync(rulesDir)) {
    return [];
  }

  const files = fs.readdirSync(rulesDir)
    .filter(f => f.endsWith('Rules.ts') && f !== 'index.ts');

  return files
    .map(f => {
      // Convert filename to topic ID
      // e.g., "allocationsFamilialesRules.ts" -> "allocations-familiales"
      // e.g., "aideLogementRules.ts" -> "aide-logement"
      // e.g., "creditImpotRules.ts" -> "credit-impot"
      let topicId = f.replace('Rules.ts', '');
      
      // Convert camelCase to kebab-case
      topicId = topicId.replace(/([A-Z])/g, '-$1').toLowerCase();
      if (topicId.startsWith('-')) {
        topicId = topicId.substring(1);
      }
      
      return topicId;
    })
    .filter(id => id !== 'loi-du-26-mai-2002-concernant-le-droit-l-int-grati'); // Special case
}

// Topic name mapping (French names)
const TOPIC_NAMES: Record<string, string> = {
  'ris': 'Revenu d\'Intégration Sociale',
  'agr': 'Allocation de Garantie de Revenus',
  'grapa': 'Garantie de Revenus aux Personnes Âgées',
  'allocations-familiales': 'Allocations familiales',
  'prime-naissance': 'Prime de naissance',
  'allocations-chomage': 'Allocations de chômage',
  'aide-logement': 'Aide au logement',
  'logement-social': 'Logement social',
  'aide-sociale': 'Aide sociale CPAS',
  'aide-personnes-agees': 'Aide aux personnes âgées',
  'allocation-handicapes': 'Allocations handicapés',
  'pension-retraite': 'Pensions de retraite',
  'pension-survie': 'Pensions de survie',
  'pensions': 'Pensions (général)',
  'assurance-maladie': 'Assurance maladie',
  'carte-medicale': 'Carte médicale',
  'conge-parental': 'Congé parental',
  'conge-maternite': 'Congé maternité',
  'conge-maladie': 'Congé maladie',
  'allocations-etudes': 'Allocations d\'études',
  'bourse-etudes': 'Bourse d\'études',
  'garantie-locative': 'Garantie locative',
  'garde-enfants': 'Garde d\'enfants',
  'aide-juridique': 'Aide juridique',
  'fonds-securite-existence': 'Fonds de sécurité d\'existence',
  'allocation-chauffage': 'Allocation chauffage',
  'tarif-social-energie': 'Tarif social énergie',
  'abonnement-social-transport': 'Abonnement social transport',
  'credit-impot': 'Crédit d\'impôt',
  'deduction-habitation': 'Déduction habitation',
  'deduction-investissement': 'Déduction investissement',
  'reduction-epargne-pension': 'Réduction épargne pension',
  'cheques-repas': 'Chèques repas',
  'eco-cheque': 'Éco-chèque',
  'avantages-nature': 'Avantages en nature',
  'tva-reduite': 'TVA réduite',
  'exoneration-precompte': 'Exonération précompte',
  'bonus-logement': 'Bonus logement',
  'deduction-frais-garde': 'Déduction frais de garde',
  'credit-impot-service-local': 'Crédit d\'impôt service local',
  'quotient-conjugal': 'Quotient conjugal',
  'rente-alimentaire': 'Rente alimentaire',
  'deduction-dons': 'Déduction dons',
  'frais-professionnels': 'Frais professionnels',
  'deduction-vehicule-electrique': 'Déduction véhicule électrique',
  'prime-renovation': 'Prime rénovation',
  'deduction-isolation': 'Déduction isolation',
  'credit-impot-investissement-durable': 'Crédit d\'impôt investissement durable',
  'exoneration-plus-value': 'Exonération plus-value',
  'deduction-emprunt-hypothecaire': 'Déduction emprunt hypothécaire',
  'abattement-succession': 'Abattement succession',
  'droits-donation-reduits': 'Droits donation réduits',
  'exoneration-revenus-mobiliers': 'Exonération revenus mobiliers',
  'insertion-professionnelle': 'Insertion professionnelle',
  'formation-professionnelle': 'Formation professionnelle',
  'credit-temps': 'Crédit-temps',
  'contrat-travail': 'Contrat de travail',
  'preavis': 'Préavis',
  'licenciement': 'Licenciement',
  'demission': 'Démission',
  'accident-travail': 'Accident du travail',
  'maladie-professionnelle': 'Maladie professionnelle',
  'harcelement-travail': 'Harcèlement au travail',
  'discrimination-emploi': 'Discrimination emploi',
  'egalite-salariale': 'Égalité salariale',
  'travail-etudiant': 'Travail étudiant',
  'stage': 'Stage',
  'flexi-job': 'Flexi-job',
  'travail-interimaire': 'Travail intérimaire',
  'contrat-duree-determinee': 'Contrat durée déterminée',
  'contrat-duree-indeterminee': 'Contrat durée indéterminée',
  'temps-partiel': 'Temps partiel',
  'horaire-flexible': 'Horaire flexible',
  'teletravail': 'Télétravail',
  'droit-greve': 'Droit de grève',
  'representation-syndicale': 'Représentation syndicale',
  'formation-entreprise': 'Formation entreprise',
  'outplacement': 'Outplacement',
  'pension-complementaire': 'Pension complémentaire',
  'inscription-ecole': 'Inscription école',
  'repas-scolaires-gratuits': 'Repas scolaires gratuits',
  'transport-scolaire': 'Transport scolaire',
  'aide-alimentaire': 'Aide alimentaire',
  'banque-alimentaire': 'Banque alimentaire',
  'restaurants-sociaux': 'Restaurants sociaux',
  'mediation-dettes': 'Médiation dettes',
  'budget-energetique': 'Budget énergétique',
  'fonds-creances': 'Fonds créances',
  'protection-juridique': 'Protection juridique',
  'accompagnement-social': 'Accompagnement social',
  'service-public-emploi': 'Service public emploi',
  'aide-mobilite': 'Aide mobilité',
  'soins-sante-mentale': 'Soins santé mentale',
  'aide-sans-abri': 'Aide sans-abri',
  'centre-accueil': 'Centre d\'accueil',
  'mediation-familiale': 'Médiation familiale',
  'aide-victimes': 'Aide victimes',
  'protection-enfance': 'Protection enfance',
  'tele-assistance': 'Télé-assistance',
  'aide-menagere': 'Aide ménagère',
  'repas-domicile': 'Repas à domicile',
  'revenu-cadastral-exoneration': 'Revenu cadastral exonération',
  'allocation-integration': 'Allocation d\'intégration',
};

function getTopicName(topicId: string): string {
  return TOPIC_NAMES[topicId] || topicId.split('-').map(w => 
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join(' ');
}

async function main() {
  console.log('\n🚀 Initializing database with ALL topics from codebase...\n');

  const db = getDatabaseService();
  const today = new Date().toISOString().split('T')[0];

  // 1. Add core laws (same as before)
  console.log('Adding core laws...');
  
  // RIS primary law
  db.addLaw({
    lawId: 'loi-2002-05-26',
    title: 'Loi du 26 mai 2002 concernant le droit à l\'intégration sociale',
    lawDate: '2002-05-26',
    url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2002052647&table_name=loi',
    authority: 'Service Public Fédéral Sécurité Sociale',
    topics: ['ris'],
    type: 'primary',
    isShared: false,
    fileLocation: 'features/benefits/ris/laws/loi-2002-05-26',
    currentVersion: `scrape-${today}-001`,
    lastScraped: today,
    nextScrapeScheduled: getNextMonth(today),
    scrapingFrequency: 'monthly',
    scrapings: []
  });

  // RIS implementing legislation
  db.addLaw({
    lawId: 'arrete-2002-07-11',
    title: 'Arrêté royal du 11 juillet 2002 portant règlement général en matière de droit à l\'intégration sociale',
    lawDate: '2002-07-11',
    url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&table_name=loi&cn=2002071138',
    authority: 'Service Public Fédéral Sécurité Sociale',
    topics: ['ris'],
    type: 'implementing',
    isShared: false,
    fileLocation: 'features/benefits/ris/laws/arrete-2002-07-11',
    currentVersion: `scrape-${today}-001`,
    lastScraped: today,
    nextScrapeScheduled: getNextMonth(today),
    scrapingFrequency: 'monthly',
    scrapings: []
  });

  // Indexation law (shared)
  db.addLaw({
    lawId: 'loi-1971-08-02',
    title: 'Loi du 2 août 1971 organisant un régime de liaison à l\'indice des prix à la consommation',
    lawDate: '1971-08-02',
    url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1971080201&table_name=loi',
    authority: 'SPF Économie',
    topics: ['ris', 'grapa', 'pensions', 'allocations-familiales'],
    type: 'indexation',
    isShared: true,
    fileLocation: 'features/laws/loi-1971-08-02',
    currentVersion: `scrape-${today}-001`,
    lastScraped: today,
    nextScrapeScheduled: getNextMonth(today),
    scrapingFrequency: 'monthly',
    scrapings: []
  });

  // AGR law
  db.addLaw({
    lawId: 'arrete-1991-11-25',
    title: 'Arrêté royal portant réglementation du chômage',
    lawDate: '1991-11-25',
    url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1991112550&table_name=loi',
    authority: 'Office National de l\'Emploi (ONEM)',
    topics: ['agr'],
    type: 'primary',
    isShared: false,
    fileLocation: 'features/benefits/agr/laws/arrete-1991-11-25',
    currentVersion: `scrape-${today}-001`,
    lastScraped: today,
    nextScrapeScheduled: getNextMonth(today),
    scrapingFrequency: 'monthly',
    scrapings: []
  });

  // 2. Get all topics from rules
  console.log('\nDiscovering topics from rules...');
  const allTopicIds = getAllTopicsFromRules();
  console.log(`Found ${allTopicIds.length} topics with rules\n`);

  // 3. Create topics (with indexation law if applicable)
  const topicsWithIndexation = ['ris', 'grapa', 'pensions', 'allocations-familiales'];
  
  for (const topicId of allTopicIds) {
    const name = getTopicName(topicId);
    const laws: Array<{
      lawId: string;
      type: string;
      currentVersion: string;
      fileLocation: string;
      isShared?: boolean;
    }> = [];

    // Add indexation law if applicable
    if (topicsWithIndexation.includes(topicId)) {
      laws.push({
        lawId: 'loi-1971-08-02',
        type: 'indexation',
        currentVersion: `scrape-${today}-001`,
        fileLocation: 'features/laws/loi-1971-08-02',
        isShared: true
      });
    }

    // Add topic-specific laws if they exist
    if (topicId === 'ris') {
      laws.unshift(
        {
          lawId: 'loi-2002-05-26',
          type: 'primary',
          currentVersion: `scrape-${today}-001`,
          fileLocation: 'features/benefits/ris/laws/loi-2002-05-26'
        },
        {
          lawId: 'arrete-2002-07-11',
          type: 'implementing',
          currentVersion: `scrape-${today}-001`,
          fileLocation: 'features/benefits/ris/laws/arrete-2002-07-11'
        }
      );
    } else if (topicId === 'agr') {
      laws.unshift({
        lawId: 'arrete-1991-11-25',
        type: 'primary',
        currentVersion: `scrape-${today}-001`,
        fileLocation: 'features/benefits/agr/laws/arrete-1991-11-25'
      });
    }

    db.addTopic({
      topicId,
      name,
      laws,
      aggregatedCurrentVersion: `scrape-${today}-001`,
      lastAggregated: today
    });

    console.log(`  ✅ Added topic: ${topicId} (${name})`);
  }

  // 4. Add special topics that might not have rules yet
  const specialTopics = [
    { id: 'pensions', name: 'Pensions de retraite et de survie' },
  ];

  for (const topic of specialTopics) {
    if (!allTopicIds.includes(topic.id)) {
      db.addTopic({
        topicId: topic.id,
        name: topic.name,
        laws: [
          {
            lawId: 'loi-1971-08-02',
            type: 'indexation',
            currentVersion: `scrape-${today}-001`,
            fileLocation: 'features/laws/loi-1971-08-02',
            isShared: true
          }
        ],
        aggregatedCurrentVersion: `scrape-${today}-001`,
        lastAggregated: today
      });
      console.log(`  ✅ Added special topic: ${topic.id} (${topic.name})`);
    }
  }

  console.log('\n✅ Database initialized successfully!');
  console.log('\nRegistry summary:');
  console.log(`  Laws: ${Object.keys(db.getAllLaws()).length}`);
  console.log(`  Topics: ${Object.keys(db.getAllTopics()).length}`);
  console.log(`  Shared laws: ${db.getSharedLaws().length}`);
  console.log('');
}

function getNextMonth(date: string): string {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().split('T')[0];
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Failed to initialize database:', error);
    process.exit(1);
  });
