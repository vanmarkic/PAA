/**
 * Utilitaires pour accéder et afficher les métadonnées légales des machines
 */

import {
  MachineLegalMetadata,
  getMachineLegalMetadata,
  isMachineDataCurrent,
  getMachineSources,
  generateAuditReport,
  LegalSource,
} from '../domain/legalMetadata';

/**
 * Génère un badge de fraîcheur des données
 */
export function getDataFreshnessBadge(machineId: string): {
  status: 'current' | 'needs-review' | 'outdated' | 'unknown';
  label: string;
  color: string;
  daysOld: number;
} {
  const metadata = getMachineLegalMetadata(machineId);

  if (!metadata) {
    return {
      status: 'unknown',
      label: 'Métadonnées non disponibles',
      color: 'gray',
      daysOld: 0,
    };
  }

  const { isCurrent, daysOld, needsReview } = isMachineDataCurrent(machineId);

  if (needsReview) {
    return {
      status: 'needs-review',
      label: `Révision nécessaire (${daysOld} jours)`,
      color: 'orange',
      daysOld,
    };
  }

  if (!isCurrent) {
    return {
      status: 'outdated',
      label: `Données anciennes (${daysOld} jours)`,
      color: 'red',
      daysOld,
    };
  }

  return {
    status: 'current',
    label: `Données à jour (${daysOld} jours)`,
    color: 'green',
    daysOld,
  };
}

/**
 * Formate une source légale pour l'affichage
 */
export function formatLegalSource(source: LegalSource): string {
  const parts: string[] = [];

  parts.push(`**${source.title}**`);

  if (source.referenceNumber) {
    parts.push(`(Réf: ${source.referenceNumber})`);
  }

  parts.push(`\n- Autorité: ${source.authority}`);
  parts.push(`- Région: ${source.region}`);
  parts.push(`- Date de publication: ${source.publicationDate.toLocaleDateString('fr-BE')}`);
  parts.push(`- Date d'entrée en vigueur: ${source.effectiveDate.toLocaleDateString('fr-BE')}`);
  parts.push(`- Lien officiel: [${source.officialUrl}](${source.officialUrl})`);

  if (source.backupUrl) {
    parts.push(`- Lien de secours: [${source.backupUrl}](${source.backupUrl})`);
  }

  return parts.join('\n');
}

/**
 * Génère une section de métadonnées pour la documentation d'une machine
 */
export function generateMetadataSection(machineId: string): string {
  const metadata = getMachineLegalMetadata(machineId);

  if (!metadata) {
    return `## ⚠️ Métadonnées non disponibles\n\nLes métadonnées légales pour cette machine ne sont pas encore configurées.`;
  }

  const freshness = getDataFreshnessBadge(machineId);
  const sources = metadata.currentVersion.sources;

  let output = `## 📋 Métadonnées Légales\n\n`;

  // Informations de base
  output += `### Informations de base\n\n`;
  output += `- **Nom**: ${metadata.nameFr}`;
  if (metadata.nameNl) {
    output += ` / ${metadata.nameNl}`;
  }
  output += `\n`;
  output += `- **Catégorie**: ${metadata.category}\n`;
  output += `- **Version**: ${metadata.currentVersion.version}\n`;
  output += `- **Statut**: ${metadata.currentVersion.status}\n\n`;

  // Fraîcheur des données
  output += `### 🔄 Fraîcheur des données\n\n`;
  output += `- **Date d'extraction**: ${metadata.currentVersion.extractionDate.toLocaleDateString('fr-BE')}\n`;
  output += `- **Dernière mise à jour législative**: ${metadata.currentVersion.lastLegislativeUpdate.toLocaleDateString('fr-BE')}\n`;
  if (metadata.currentVersion.nextReviewDate) {
    output += `- **Prochaine révision**: ${metadata.currentVersion.nextReviewDate.toLocaleDateString('fr-BE')}\n`;
  }
  output += `- **État**: ${freshness.label}\n\n`;

  // Sources légales
  output += `### 📚 Sources légales officielles\n\n`;
  sources.forEach((source, index) => {
    output += `#### Source ${index + 1}\n\n`;
    output += formatLegalSource(source) + '\n\n';
  });

  // Montants (si disponibles)
  if (metadata.currentVersion.amounts) {
    output += `### 💰 Montants de référence\n\n`;
    Object.entries(metadata.currentVersion.amounts).forEach(([key, value]) => {
      output += `- **${key}**: ${value.toFixed(2)} EUR\n`;
    });
    output += `\n`;
  }

  // Contact
  if (metadata.contactEmail || metadata.contactPhone) {
    output += `### 📞 Contact\n\n`;
    if (metadata.contactEmail) {
      output += `- **Email**: ${metadata.contactEmail}\n`;
    }
    if (metadata.contactPhone) {
      output += `- **Téléphone**: ${metadata.contactPhone}\n`;
    }
    output += `\n`;
  }

  // Validation juridique (si disponible)
  if (metadata.lastLegalValidation) {
    output += `### ✅ Validation juridique\n\n`;
    output += `- **Date**: ${metadata.lastLegalValidation.date.toLocaleDateString('fr-BE')}\n`;
    output += `- **Validateur**: ${metadata.lastLegalValidation.validatorName}\n`;
    output += `- **Rôle**: ${metadata.lastLegalValidation.validatorRole}\n\n`;
  }

  // Notes de version
  if (metadata.currentVersion.changeLog) {
    output += `### 📝 Notes de version\n\n`;
    output += metadata.currentVersion.changeLog + '\n\n';
  }

  return output;
}

/**
 * Génère un rapport complet sur l'état de toutes les machines
 */
export function generateFullAuditReport(): string {
  const report = generateAuditReport();

  let output = `# 📊 Rapport d'Audit des Machines\n\n`;
  output += `**Date du rapport**: ${new Date().toLocaleDateString('fr-BE')}\n\n`;

  output += `## Résumé\n\n`;
  output += `- **Total des machines**: ${report.totalMachines}\n`;
  output += `- **✅ À jour**: ${report.upToDate}\n`;
  output += `- **⚠️ Nécessitent une révision**: ${report.needsReview}\n`;
  output += `- **❌ Dépréciées**: ${report.deprecated}\n`;
  output += `- **❓ Métadonnées manquantes**: ${report.missingMetadata}\n\n`;

  // Pourcentages
  const percentUpToDate = ((report.upToDate / report.totalMachines) * 100).toFixed(1);
  const percentNeedsReview = ((report.needsReview / report.totalMachines) * 100).toFixed(1);

  output += `## Taux de conformité\n\n`;
  output += `- **Données à jour**: ${percentUpToDate}%\n`;
  output += `- **Révision nécessaire**: ${percentNeedsReview}%\n\n`;

  if (report.upToDate === report.totalMachines) {
    output += `🎉 **Excellent!** Toutes les machines sont à jour!\n\n`;
  } else if (report.needsReview > report.totalMachines * 0.3) {
    output += `⚠️ **Attention**: Plus de 30% des machines nécessitent une révision.\n\n`;
  }

  return output;
}

/**
 * Génère un fichier JSON avec toutes les métadonnées (pour export)
 */
export function exportMetadataToJSON(machineId?: string): string {
  if (machineId) {
    const metadata = getMachineLegalMetadata(machineId);
    return JSON.stringify(metadata, null, 2);
  }

  // Export de toutes les métadonnées
  const allMetadata: Record<string, any> = {};

  // Note: We would need to iterate through all machines
  // For now, return empty object if no machineId specified
  return JSON.stringify(allMetadata, null, 2);
}

/**
 * Vérifie si une machine a besoin d'une mise à jour urgente
 */
export function needsUrgentUpdate(machineId: string): {
  urgent: boolean;
  reason: string;
} {
  const { isCurrent, daysOld, needsReview } = isMachineDataCurrent(machineId);

  if (daysOld > 90) {
    return {
      urgent: true,
      reason: `Les données ont ${daysOld} jours. Mise à jour urgente recommandée.`,
    };
  }

  if (needsReview) {
    return {
      urgent: true,
      reason: 'La date de révision planifiée est dépassée.',
    };
  }

  if (!isCurrent) {
    return {
      urgent: false,
      reason: `Les données ont ${daysOld} jours. Mise à jour recommandée bientôt.`,
    };
  }

  return {
    urgent: false,
    reason: 'Les données sont à jour.',
  };
}

/**
 * Génère un avertissement pour l'utilisateur si les données sont anciennes
 */
export function generateUserWarning(machineId: string): string | null {
  const { urgent, reason } = needsUrgentUpdate(machineId);
  const metadata = getMachineLegalMetadata(machineId);

  if (!metadata) {
    return `⚠️ ATTENTION: Les métadonnées légales pour cette fonctionnalité ne sont pas disponibles. Veuillez vérifier les informations auprès des sources officielles.`;
  }

  if (urgent) {
    return `⚠️ AVERTISSEMENT: ${reason} Les montants et conditions affichés peuvent ne plus être d'actualité. Veuillez consulter les sources officielles pour les informations les plus récentes.`;
  }

  const freshness = getDataFreshnessBadge(machineId);
  if (freshness.status !== 'current') {
    return `ℹ️ INFO: ${reason}`;
  }

  return null; // Pas d'avertissement nécessaire
}

/**
 * Génère un footer avec les sources pour une page de documentation
 */
export function generateSourcesFooter(machineId: string): string {
  const sources = getMachineSources(machineId);
  const metadata = getMachineLegalMetadata(machineId);

  if (!sources.length || !metadata) {
    return '';
  }

  let output = `\n---\n\n`;
  output += `## Sources Officielles\n\n`;
  output += `*Dernière extraction: ${metadata.currentVersion.extractionDate.toLocaleDateString('fr-BE')}*\n\n`;

  sources.forEach((source, index) => {
    output += `${index + 1}. [${source.title}](${source.officialUrl}) - ${source.authority}\n`;
  });

  const warning = generateUserWarning(machineId);
  if (warning) {
    output += `\n${warning}\n`;
  }

  return output;
}
