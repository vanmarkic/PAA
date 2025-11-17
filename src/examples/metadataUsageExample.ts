/**
 * Exemple d'utilisation du système de métadonnées légales
 *
 * Ce fichier montre comment intégrer les métadonnées dans vos workflows
 * pour garantir la traçabilité et la conformité légale.
 */

import {
  getMachineLegalMetadata,
  isMachineDataCurrent,
  getMachineSources,
  generateAuditReport,
} from '../modele-metier/legalMetadata';

import {
  getDataFreshnessBadge,
  generateUserWarning,
  generateMetadataSection,
  generateSourcesFooter,
  needsUrgentUpdate,
} from '../utils/machineMetadataHelper';

// ============================================================================
// EXEMPLE 1: Vérifier la fraîcheur des données avant un calcul
// ============================================================================

function calculateRISAmount(userId: string, monthlyIncome: number): {
  amount: number;
  warning?: string;
  metadata: any;
} {
  const machineId = 'risApplication';

  // 1. Vérifier si les données sont à jour
  const { isCurrent, daysOld, needsReview } = isMachineDataCurrent(machineId);
  const metadata = getMachineLegalMetadata(machineId);

  if (!metadata) {
    throw new Error('❌ Métadonnées manquantes pour le calcul RIS');
  }

  // 2. Générer un avertissement si nécessaire
  const warning = generateUserWarning(machineId);

  // 3. Logger pour l'audit
  console.log(`
    📊 CALCUL RIS
    User: ${userId}
    Version législation: ${metadata.currentVersion.version}
    Date extraction: ${metadata.currentVersion.extractionDate.toLocaleDateString('fr-BE')}
    Âge des données: ${daysOld} jours
    État: ${isCurrent ? '✅ À jour' : needsReview ? '⚠️ Révision nécessaire' : '⚠️ Anciennes'}
  `);

  // 4. Effectuer le calcul avec les montants de référence
  const amounts = metadata.currentVersion.amounts || {};
  const montantIsole = amounts.isolé || 1070.49;

  // Calcul simplifié
  const amount = Math.max(0, montantIsole - monthlyIncome * 0.8);

  return {
    amount,
    warning: warning || undefined,
    metadata: {
      version: metadata.currentVersion.version,
      extractionDate: metadata.currentVersion.extractionDate,
      sources: metadata.currentVersion.sources.map(s => ({
        authority: s.authority,
        url: s.officialUrl,
      })),
    },
  };
}

// ============================================================================
// EXEMPLE 2: Afficher les sources officielles à l'utilisateur
// ============================================================================

function displayRISInformation(): void {
  const machineId = 'risApplication';
  const sources = getMachineSources(machineId);
  const metadata = getMachineLegalMetadata(machineId);

  if (!metadata) {
    console.error('❌ Impossible de récupérer les informations RIS');
    return;
  }

  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                REVENU D'INTÉGRATION SOCIALE (RIS)              ║
╚════════════════════════════════════════════════════════════════╝

📋 Informations légales
  Version: ${metadata.currentVersion.version}
  Dernière mise à jour: ${metadata.currentVersion.lastLegislativeUpdate.toLocaleDateString('fr-BE')}

💰 Montants (au ${metadata.currentVersion.extractionDate.toLocaleDateString('fr-BE')})
  • Isolé: ${metadata.currentVersion.amounts?.isolé} EUR/mois
  • Cohabitant: ${metadata.currentVersion.amounts?.cohabitant} EUR/mois
  • Famille monoparentale: ${metadata.currentVersion.amounts?.familleMonoparentale} EUR/mois

📚 Sources officielles
  `);

  sources.forEach((source, index) => {
    console.log(`
  ${index + 1}. ${source.title}
     Autorité: ${source.authority}
     Lien: ${source.officialUrl}
     Publié le: ${source.publicationDate.toLocaleDateString('fr-BE')}
  `);
  });

  console.log(`
📞 Contact
  Email: ${metadata.contactEmail}
  Téléphone: ${metadata.contactPhone}

${generateUserWarning(machineId) || '✅ Informations à jour'}
  `);
}

// ============================================================================
// EXEMPLE 3: Génération de documentation automatique
// ============================================================================

function generateMachineDocumentation(machineId: string): string {
  const metadata = getMachineLegalMetadata(machineId);

  if (!metadata) {
    return `# ⚠️ Machine: ${machineId}\n\nMétadonnées non disponibles.`;
  }

  let doc = `# ${metadata.nameFr}`;

  if (metadata.nameNl) {
    doc += ` / ${metadata.nameNl}`;
  }

  doc += '\n\n';

  // Ajouter la section de métadonnées
  doc += generateMetadataSection(machineId);

  // Ajouter le footer avec les sources
  doc += generateSourcesFooter(machineId);

  return doc;
}

// ============================================================================
// EXEMPLE 4: Dashboard d'audit pour l'administrateur
// ============================================================================

function displayAuditDashboard(): void {
  const report = generateAuditReport();

  console.log(`
╔════════════════════════════════════════════════════════════════╗
║              DASHBOARD D'AUDIT DES MÉTADONNÉES                 ║
╚════════════════════════════════════════════════════════════════╝

📊 Vue d'ensemble
  Total de machines: ${report.totalMachines}
  ✅ À jour: ${report.upToDate} (${((report.upToDate / report.totalMachines) * 100).toFixed(1)}%)
  ⚠️ Révision nécessaire: ${report.needsReview}
  ❌ Dépréciées: ${report.deprecated}
  ❓ Métadonnées manquantes: ${report.missingMetadata}

${report.upToDate === report.totalMachines ? '🎉 Excellent! Toutes les machines sont à jour!' : ''}
${report.needsReview > 0 ? `⚠️ Attention: ${report.needsReview} machines nécessitent une révision` : ''}
  `);

  // Liste des machines nécessitant une révision
  if (report.needsReview > 0) {
    console.log('📋 Machines nécessitant une révision:\n');

    const machinesToCheck = [
      'allocationsChomage',
      'grapa',
      'risApplication',
      'pensionRetraite',
      'creditImpot',
    ];

    machinesToCheck.forEach(machineId => {
      const { urgent, reason } = needsUrgentUpdate(machineId);
      const badge = getDataFreshnessBadge(machineId);

      if (badge.status !== 'current') {
        console.log(`  ${urgent ? '🔴' : '🟡'} ${machineId}: ${reason} (${badge.daysOld} jours)`);
      }
    });
  }
}

// ============================================================================
// EXEMPLE 5: Validation avant publication
// ============================================================================

function validateBeforePublish(machineId: string): {
  canPublish: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  const metadata = getMachineLegalMetadata(machineId);

  // 1. Vérifier que les métadonnées existent
  if (!metadata) {
    issues.push('❌ Métadonnées manquantes');
    return { canPublish: false, issues };
  }

  // 2. Vérifier la fraîcheur des données
  const { isCurrent, daysOld, needsReview } = isMachineDataCurrent(machineId);

  if (needsReview) {
    issues.push(`⚠️ Révision nécessaire (dernière mise à jour: ${daysOld} jours)`);
  }

  if (daysOld > 60) {
    issues.push(`⚠️ Données anciennes (${daysOld} jours)`);
  }

  // 3. Vérifier que les sources sont présentes
  if (!metadata.currentVersion.sources || metadata.currentVersion.sources.length === 0) {
    issues.push('❌ Aucune source légale référencée');
  }

  // 4. Vérifier que les URLs sont valides
  metadata.currentVersion.sources.forEach((source, index) => {
    if (!source.officialUrl || !source.officialUrl.startsWith('http')) {
      issues.push(`❌ URL invalide pour la source ${index + 1}`);
    }
  });

  // 5. Vérifier la version
  if (!metadata.currentVersion.version) {
    issues.push('❌ Numéro de version manquant');
  }

  // 6. Vérifier les dates
  if (!metadata.currentVersion.extractionDate) {
    issues.push('❌ Date d\'extraction manquante');
  }

  if (!metadata.currentVersion.lastLegislativeUpdate) {
    issues.push('❌ Date de dernière mise à jour législative manquante');
  }

  const canPublish = issues.length === 0 || (issues.length === 1 && issues[0].includes('Révision nécessaire'));

  return { canPublish, issues };
}

// ============================================================================
// EXEMPLE 6: Intégration dans une API REST
// ============================================================================

interface APIResponse {
  success: boolean;
  data?: any;
  metadata: {
    version: string;
    extractionDate: string;
    dataAge: number;
    sources: Array<{
      authority: string;
      url: string;
    }>;
  };
  warnings?: string[];
}

function createAPIResponse(machineId: string, calculationResult: any): APIResponse {
  const metadata = getMachineLegalMetadata(machineId);
  const warning = generateUserWarning(machineId);
  const { daysOld } = isMachineDataCurrent(machineId);

  if (!metadata) {
    return {
      success: false,
      metadata: {
        version: 'unknown',
        extractionDate: 'unknown',
        dataAge: 0,
        sources: [],
      },
      warnings: ['Métadonnées non disponibles'],
    };
  }

  return {
    success: true,
    data: calculationResult,
    metadata: {
      version: metadata.currentVersion.version,
      extractionDate: metadata.currentVersion.extractionDate.toISOString(),
      dataAge: daysOld,
      sources: metadata.currentVersion.sources.map(s => ({
        authority: s.authority,
        url: s.officialUrl,
      })),
    },
    warnings: warning ? [warning] : undefined,
  };
}

// ============================================================================
// EXÉCUTION DES EXEMPLES
// ============================================================================

if (require.main === module) {
  console.log('════════════════════════════════════════════════════════════════\n');
  console.log('EXEMPLE 1: Calcul RIS avec métadonnées\n');
  console.log('════════════════════════════════════════════════════════════════\n');

  const risResult = calculateRISAmount('user123', 500);
  console.log('Résultat:', JSON.stringify(risResult, null, 2));

  console.log('\n════════════════════════════════════════════════════════════════\n');
  console.log('EXEMPLE 2: Affichage des informations RIS\n');
  console.log('════════════════════════════════════════════════════════════════\n');

  displayRISInformation();

  console.log('\n════════════════════════════════════════════════════════════════\n');
  console.log('EXEMPLE 3: Documentation automatique GRAPA\n');
  console.log('════════════════════════════════════════════════════════════════\n');

  const grapaDoc = generateMachineDocumentation('grapa');
  console.log(grapaDoc);

  console.log('\n════════════════════════════════════════════════════════════════\n');
  console.log('EXEMPLE 4: Dashboard d\'audit\n');
  console.log('════════════════════════════════════════════════════════════════\n');

  displayAuditDashboard();

  console.log('\n════════════════════════════════════════════════════════════════\n');
  console.log('EXEMPLE 5: Validation avant publication\n');
  console.log('════════════════════════════════════════════════════════════════\n');

  const validation = validateBeforePublish('allocationsChomage');
  console.log('Peut publier:', validation.canPublish);
  console.log('Problèmes:', validation.issues.join('\n'));

  console.log('\n════════════════════════════════════════════════════════════════\n');
  console.log('EXEMPLE 6: Réponse API avec métadonnées\n');
  console.log('════════════════════════════════════════════════════════════════\n');

  const apiResponse = createAPIResponse('creditImpot', { montantCredit: 1250.50 });
  console.log(JSON.stringify(apiResponse, null, 2));
}
