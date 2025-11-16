# Références Juridiques / Juridische Referenties

Ce dossier contient toutes les références juridiques authentiques pour les prestations sociales belges encodées dans le projet PAA.

---

## 📁 Structure du dossier

```
legal-sources/
├── belgianLegalSources.ts      # Références FR (principal)
├── belgianLegalSources.nl.ts   # Traductions NL
├── README.md                    # Ce fichier
└── __tests__/
    └── legalSources.test.ts    # Tests unitaires
```

---

## 🇫🇷 Français

### Contenu disponible

Le fichier `belgianLegalSources.ts` contient les références juridiques complètes pour :

1. **RIS** (Revenu d'Intégration Sociale)
   - Loi du 26 mai 2002
   - Articles clés : 3, 11, 14, 19, 22, 30
   - Montants 2024 indexés

2. **AGR** (Allocation de Garantie de Revenus)
   - Arrêté royal du 25 novembre 1991
   - Articles clés : 28, 29, 33, 131bis
   - Conditions et calculs 2025

3. **Allocations Familiales** (Région de Bruxelles-Capitale)
   - Ordonnance du 25 avril 2019
   - Montants 2024 par âge
   - Suppléments

4. **GRAPA** (Garantie de Revenus aux Personnes Âgées)
   - Loi du 22 mai 1969
   - Montants 2024 (isolé/cohabitant)

5. **Allocation de Loyer** (Région de Bruxelles-Capitale)
   - Arrêté du 15 juillet 2021

### Utilisation dans le code

```typescript
import {
  RIS_LEGAL_FRAMEWORK,
  RIS_KEY_ARTICLES,
  RIS_AMOUNTS_2024,
  AGR_LEGAL_FRAMEWORK,
  AGR_CONDITIONS_2025,
  LEGAL_MAPPING
} from './legal-sources/belgianLegalSources';

// Accéder à une référence juridique
const risLaw = RIS_LEGAL_FRAMEWORK.primaryLegislation;
console.log(risLaw.title); // "Loi concernant le droit à l'intégration sociale"
console.log(risLaw.date);  // "2002-05-26"
console.log(risLaw.officialUrl); // URL vers ejustice.just.fgov.be

// Accéder aux articles
const article3 = RIS_KEY_ARTICLES['Article 3'];
console.log(article3.conditions); // Array des conditions

// Accéder aux montants
const montantIsolé = RIS_AMOUNTS_2024.isolé; // 1070.49
```

### Ajouter une nouvelle prestation

1. Définir le cadre juridique :
```typescript
export const MY_BENEFIT_LEGAL_FRAMEWORK: BenefitLegalFramework = {
  benefitName: 'Nom de la prestation',
  primaryLegislation: {
    type: 'loi',  // ou 'arrete_royal', 'ordonnance', etc.
    title: 'Titre complet de la loi',
    date: '2024-01-15',  // Format ISO 8601
    officialUrl: 'https://www.ejustice.just.fgov.be/...',
    authority: 'Autorité responsable'
  },
  notes: [
    'Note importante 1',
    'Note importante 2'
  ]
};
```

2. Définir les articles clés :
```typescript
export const MY_BENEFIT_KEY_ARTICLES = {
  'Article 1': {
    title: 'Titre de l\'article',
    content: 'Description du contenu'
  }
};
```

3. Définir les montants :
```typescript
export const MY_BENEFIT_AMOUNTS_2024 = {
  baseAmount: 1234.56,
  currency: 'EUR'
};
```

4. Ajouter au `LEGAL_MAPPING` :
```typescript
export const LEGAL_MAPPING = {
  // ... existants
  MY_BENEFIT: {
    framework: MY_BENEFIT_LEGAL_FRAMEWORK,
    articles: MY_BENEFIT_KEY_ARTICLES,
    amounts: MY_BENEFIT_AMOUNTS_2024
  }
};
```

---

## 🇳🇱 Nederlands

### Beschikbare inhoud

Het bestand `belgianLegalSources.nl.ts` bevat de volledige juridische referenties voor:

1. **Leefloon** (Revenu d'Intégration Sociale)
   - Wet van 26 mei 2002
   - Belangrijkste artikelen: 3, 11, 14, 19, 22, 30
   - Bedragen 2024 geïndexeerd

2. **IGU** (Inkomensgarantie-uitkering)
   - Koninklijk besluit van 25 november 1991
   - Belangrijkste artikelen: 28, 29, 33, 131bis
   - Voorwaarden en berekeningen 2025

3. **Kinderbijslag** (Brussels Hoofdstedelijk Gewest)
   - Ordonnantie van 25 april 2019
   - Bedragen 2024 per leeftijd
   - Supplementen

4. **IGO** (Inkomensgarantie voor Ouderen)
   - Wet van 22 mei 1969
   - Bedragen 2024 (alleenstaande/samenwonend)

### Gebruik in code

```typescript
import {
  RIS_LEGAL_FRAMEWORK_NL,
  RIS_KEY_ARTICLES_NL,
  RIS_AMOUNTS_2024_NL,
  AGR_LEGAL_FRAMEWORK_NL,
  AGR_CONDITIONS_2025_NL,
  LEGAL_MAPPING_NL
} from './legal-sources/belgianLegalSources.nl';

// Toegang tot een juridische referentie
const leefloonWet = RIS_LEGAL_FRAMEWORK_NL.primaryLegislation;
console.log(leefloonWet.title); // "Wet betreffende het recht op maatschappelijke integratie"
console.log(leefloonWet.date);  // "2002-05-26"
console.log(leefloonWet.officialUrl); // URL naar ejustice.just.fgov.be

// Toegang tot artikelen
const artikel3 = RIS_KEY_ARTICLES_NL['Artikel 3'];
console.log(artikel3.conditions); // Array van voorwaarden

// Toegang tot bedragen
const bedragAlleenstaand = RIS_AMOUNTS_2024_NL.isolated.monthly; // 1070.49
```

---

## 🧪 Tests

Des tests unitaires complets sont disponibles dans `__tests__/legalSources.test.ts`.

### Exécuter les tests

```bash
npm test src/legal-sources/__tests__/legalSources.test.ts
```

### Ce qui est testé

✅ **Structure** : Présence de tous les champs obligatoires
✅ **URLs** : Validation du format des URLs officielles
✅ **Dates** : Format ISO 8601 valide
✅ **Complétude** : Tous les attributs requis présents
✅ **Cohérence** : Correspondance entre montants et cadre juridique

---

## 📝 Types TypeScript

### `LegislationType`

```typescript
type LegislationType =
  | 'loi'              // Loi / Wet
  | 'arrete_royal'     // Arrêté royal / Koninklijk besluit
  | 'arrete_ministeriel' // Arrêté ministériel
  | 'code'             // Code (civil, pénal, etc.)
  | 'ordonnance'       // Ordonnance (Bruxelles)
  | 'decret';          // Décret (régional)
```

### `LegalReference`

```typescript
interface LegalReference {
  type: LegislationType;
  title: string;
  date: string;  // Format ISO 8601 : "YYYY-MM-DD"
  publication?: {
    date: string;
    reference?: string;
  };
  articles?: string[];
  officialUrl: string;
  alternativeUrls?: string[];
  lastAmended?: string;
  authority: string;
}
```

### `BenefitLegalFramework`

```typescript
interface BenefitLegalFramework {
  benefitName: string;
  primaryLegislation: LegalReference;
  implementingLegislation?: LegalReference[];
  recentAmendments?: LegalReference[];
  notes?: string[];
}
```

---

## 🔗 Sources officielles

Toutes les références pointent vers des sources officielles :

- **ejustice.just.fgov.be** : Base de données juridique officielle
- **etaamb.openjustice.be** : Plateforme open data du Moniteur Belge
- **onem.be / rva.be** : Office National de l'Emploi
- **sfpd.fgov.be** : Service Fédéral des Pensions

---

## 🔄 Maintenance

### Mise à jour des montants

Les montants sont indexés régulièrement :

- **RIS** : Annuellement (loi du 2 août 1971)
- **AGR** : Mise à jour ONEM (février 2025)
- **GRAPA** : Semestriellement (janvier et mai)
- **Allocations familiales** : Selon région

### Vérification des sources

Avant de mettre à jour :

1. Consulter l'URL officielle
2. Vérifier la date de dernière modification
3. Mettre à jour les montants et dates
4. Exécuter les tests
5. Mettre à jour la documentation

---

## 📄 Documentation complète

Une documentation markdown complète est disponible dans `/docs/legal-sources.md` avec :

- Liste exhaustive de toutes les prestations
- Articles détaillés avec explications
- Tableaux de montants
- Procédures de demande
- Contacts utiles

---

## 📧 Questions

Pour toute question sur les sources juridiques :

1. Consulter la documentation : `/docs/legal-sources.md`
2. Vérifier les tests : `__tests__/legalSources.test.ts`
3. Contacter les organismes officiels (voir documentation)

---

**Dernière mise à jour** : 16 janvier 2025
