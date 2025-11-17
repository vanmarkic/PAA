# Guide des Métadonnées Légales

Ce guide explique comment les métadonnées légales sont gérées dans le projet PAA (Plateforme d'Aide Administrative).

## 📚 Vue d'ensemble

Chaque machine d'état représentant un droit social ou fiscal belge dispose de métadonnées complètes incluant:

- **Dates d'extraction** - Quand les informations ont été collectées
- **Versions de législation** - Quelle version de la loi est appliquée
- **Sources authentiques** - URLs vers les textes officiels (Moniteur Belge, sites SPF, etc.)
- **Montants de référence** - Valeurs monétaires indexées
- **Contacts officiels** - Comment obtenir plus d'informations

## 🎯 Pourquoi c'est important

Les droits sociaux et fiscaux belges changent fréquemment:
- **Indexations annuelles** (montants RIS, GRAPA, pensions, etc.)
- **Nouvelles lois** (réformes fiscales, nouvelles allocations)
- **Modifications régionales** (Wallonie, Flandre, Bruxelles ont leurs propres règles)

Sans métadonnées:
- ❌ Impossible de savoir si les données sont à jour
- ❌ Pas de traçabilité juridique
- ❌ Risque de donner des informations erronées aux citoyens

Avec métadonnées:
- ✅ Transparence totale sur la fraîcheur des données
- ✅ Liens directs vers les sources officielles
- ✅ Auditabilité et conformité légale
- ✅ Confiance des utilisateurs

## 🗂️ Structure des métadonnées

### Fichier principal: `src/modele-metier/legalMetadata.ts`

Ce fichier contient:

1. **Types TypeScript** pour la structure des métadonnées
2. **Sources officielles** - URLs de tous les organismes belges
3. **Registre complet** - Métadonnées pour les 102 machines

### Structure d'une entrée de métadonnées

```typescript
{
  machineId: 'allocationsChomage',
  nameFr: 'Allocations de chômage',
  nameNl: 'Werkloosheidsuitkeringen',
  category: 'social-benefits',
  currentVersion: {
    version: '2024.1.0',
    extractionDate: new Date('2024-11-16'),
    lastLegislativeUpdate: new Date('2024-01-01'),
    nextReviewDate: new Date('2025-01-01'),
    sources: [
      {
        authority: 'ONEM',
        title: 'Réglementation du chômage',
        officialUrl: 'https://www.onem.be/fr/documentation/feuille-info/t67',
        publicationDate: new Date('2023-12-15'),
        effectiveDate: new Date('2024-01-01'),
        // ...
      }
    ],
    amounts: {
      montantMinimum: 1234.56
    },
    status: 'active'
  },
  contactEmail: 'info@onem.be',
  contactPhone: '02 515 44 44'
}
```

## 🔧 Utilisation des métadonnées

### 1. Obtenir les métadonnées d'une machine

```typescript
import { getMachineLegalMetadata } from '../modele-metier/legalMetadata';

const metadata = getMachineLegalMetadata('allocationsChomage');
console.log(metadata.currentVersion.sources);
```

### 2. Vérifier si les données sont à jour

```typescript
import { isMachineDataCurrent } from '../modele-metier/legalMetadata';

const { isCurrent, daysOld, needsReview } = isMachineDataCurrent('grapa');

if (needsReview) {
  console.warn('⚠️ Cette machine nécessite une révision!');
}
```

### 3. Afficher les sources dans une interface

```typescript
import { generateSourcesFooter } from '../utils/machineMetadataHelper';

const footer = generateSourcesFooter('risApplication');
// Affiche un footer avec toutes les sources officielles
```

### 4. Générer un avertissement utilisateur

```typescript
import { generateUserWarning } from '../utils/machineMetadataHelper';

const warning = generateUserWarning('pensionRetraite');
if (warning) {
  // Afficher l'avertissement à l'utilisateur
  alert(warning);
}
```

### 5. Créer une documentation avec métadonnées

```typescript
import { generateMetadataSection } from '../utils/machineMetadataHelper';

const docSection = generateMetadataSection('creditImpot');
// Génère une section Markdown complète avec toutes les métadonnées
```

## 📊 Audit et maintenance

### Générer un rapport d'audit

```typescript
import { generateFullAuditReport } from '../utils/machineMetadataHelper';

const report = generateFullAuditReport();
console.log(report);
```

Le rapport indique:
- Nombre total de machines
- Combien sont à jour
- Combien nécessitent une révision
- Taux de conformité global

### Mettre à jour les métadonnées

Quand une loi change ou qu'une indexation a lieu:

1. Mettre à jour l'entrée dans `legalMetadata.ts`
2. Incrémenter la version (ex: `2024.1.0` → `2024.2.0`)
3. Ajouter l'ancienne version dans `versionHistory`
4. Mettre à jour `lastLegislativeUpdate`
5. Ajouter un `changeLog` expliquant les modifications

Exemple:

```typescript
allocationsChomage: {
  // ...
  currentVersion: {
    version: '2024.2.0', // ← Version mise à jour
    extractionDate: new Date('2024-11-16'),
    lastLegislativeUpdate: new Date('2024-06-01'), // ← Nouvelle date
    // ...
    changeLog: 'Indexation 2024: augmentation de 2.5% des montants de base',
    amounts: {
      montantMinimum: 1265.00, // ← Montant mis à jour
    }
  },
  versionHistory: [
    {
      version: '2024.1.0',
      extractionDate: new Date('2024-01-15'),
      // ... ancienne version archivée
    }
  ]
}
```

## 🔗 Sources officielles belges

Le projet référence les sources authentiques suivantes:

### Fédéral
- **Moniteur Belge**: `https://www.ejustice.just.fgov.be`
- **SPF Sécurité Sociale**: `https://socialsecurity.belgium.be`
- **SPF Finances**: `https://finances.belgium.be`
- **SPF Emploi**: `https://emploi.belgique.be`
- **ONEM**: `https://www.onem.be`
- **ONSS**: `https://www.onss.be`
- **INAMI**: `https://www.inami.fgov.be`
- **SPF Intégration Sociale**: `https://www.mi-is.be`
- **Service des Pensions**: `https://www.sfpd.fgov.be`

### Régional
- **Wallonie**: `https://www.wallonie.be`
- **Flandre**: `https://www.vlaanderen.be`
- **Bruxelles**: `https://www.brussels.be`

Toutes les URLs sont définies dans la constante `OFFICIAL_SOURCES` du fichier `legalMetadata.ts`.

## ⚖️ Conformité légale

### Avertissements obligatoires

Toujours afficher un avertissement lorsque:
- Les données ont plus de 30 jours
- La date de révision est dépassée
- Les métadonnées sont manquantes

Exemple d'avertissement:

```
⚠️ AVERTISSEMENT: Les données ont 45 jours.
Les montants et conditions affichés peuvent ne plus être d'actualité.
Veuillez consulter les sources officielles pour les informations les plus récentes.

Sources officielles:
- ONEM: https://www.onem.be/fr/documentation/feuille-info/t67
- Contact: info@onem.be | 02 515 44 44
```

### Traçabilité

Chaque calcul ou décision doit pouvoir être tracé jusqu'à sa source:
1. Machine utilisée (ex: `allocationsChomage`)
2. Version de la législation (ex: `2024.1.0`)
3. Date d'extraction (ex: `2024-11-16`)
4. Source officielle (ex: lien ONEM)

## 📅 Calendrier de révision

### Révisions annuelles obligatoires

Certaines machines doivent être révisées chaque année:

- **1er janvier**: Indexations (RIS, GRAPA, pensions, allocations)
- **1er septembre**: Allocations familiales (Wallonie/Bruxelles)
- **Année fiscale**: Réductions et crédits d'impôt

### Révisions ad-hoc

En cas de:
- Nouvelle loi ou décret
- Arrêté royal modifiant les montants
- Réforme majeure (ex: réforme des pensions)

## 🚀 Bonnes pratiques

1. **Toujours vérifier la fraîcheur** avant d'afficher des montants
2. **Inclure les sources** dans toute documentation ou interface
3. **Logger les versions** utilisées pour chaque calcul
4. **Mettre à jour régulièrement** le registre de métadonnées
5. **Archiver les anciennes versions** dans `versionHistory`
6. **Documenter les changements** dans `changeLog`

## 📞 Support

Pour toute question sur les métadonnées légales:
- Consulter ce guide
- Vérifier le code dans `src/modele-metier/legalMetadata.ts`
- Utiliser les utilitaires dans `src/utils/machineMetadataHelper.ts`

## 📝 Exemples d'intégration

### Affichage dans une interface React

```typescript
import { getMachineLegalMetadata, generateUserWarning } from './utils';

function AllocationCard({ machineId }) {
  const metadata = getMachineLegalMetadata(machineId);
  const warning = generateUserWarning(machineId);

  return (
    <div>
      <h2>{metadata.nameFr}</h2>

      {warning && (
        <div className="warning">{warning}</div>
      )}

      <div className="metadata">
        <p>Version: {metadata.currentVersion.version}</p>
        <p>Dernière mise à jour: {metadata.currentVersion.lastLegislativeUpdate.toLocaleDateString('fr-BE')}</p>
      </div>

      <div className="sources">
        <h3>Sources officielles</h3>
        {metadata.currentVersion.sources.map(source => (
          <a key={source.officialUrl} href={source.officialUrl} target="_blank">
            {source.title} - {source.authority}
          </a>
        ))}
      </div>
    </div>
  );
}
```

### Validation avant calcul

```typescript
import { isMachineDataCurrent } from './modele-metier/legalMetadata';

function calculateRIS(userId: string) {
  const { isCurrent, needsReview } = isMachineDataCurrent('risApplication');

  if (needsReview) {
    console.error('⚠️ ATTENTION: Les montants RIS doivent être révisés!');
    // Alerter l'administrateur
  }

  if (!isCurrent) {
    console.warn('ℹ️ Les montants RIS ont plus de 30 jours');
    // Logger l'avertissement
  }

  // Procéder au calcul
  // ...
}
```

## 🎓 Conclusion

Les métadonnées légales sont **essentielles** pour:
- La **conformité** avec la législation belge
- La **transparence** envers les citoyens
- La **maintenabilité** du système
- La **confiance** des utilisateurs

Toujours garder les métadonnées à jour et afficher les sources officielles!
