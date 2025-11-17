# Statut d'Artiste - Documentation Complète

## Vue d'ensemble

Le domaine **Statut d'Artiste** implémente 50 procédures administratives complètes pour les artistes et travailleurs culturels en Belgique. Cette implémentation suit rigoureusement le cadre légal belge et offre une couverture exhaustive des besoins des artistes professionnels.

## Structure de l'implémentation

### 1. Features (Gherkin/Cucumber)
- **Localisation**: `/specifications-metier/statut-artiste/`
- **Fichiers principaux**:
  - `artist-status-eligibility.feature` - Éligibilité au statut
  - `artist-unemployment.feature` - Chômage artistique
  - `artist-tax-regime.feature` - Régime fiscal
  - `artist-commission.feature` - Procédures Commission
  - `artist-grants.feature` - Bourses et subventions
  - `artist-copyright.feature` - Droits d'auteur
  - `artist-social-security.feature` - Sécurité sociale

### 2. Domain Types
- **Fichier**: `/src/modele-metier/statutArtisteTypes.ts`
- **Types principaux**:
  ```typescript
  - Artist (profil complet)
  - ArtistStatusEligibility
  - ArtistUnemployment
  - ArtistTaxRegime
  - ArtistSocialSecurity
  - ArtistCopyright
  - ArtistGrant
  - CommissionProcedure
  ```

### 3. Business Rules
- **Localisation**: `/src/regles-eligibilite/statut-artiste/`
- **Moteurs de règles**:
  - `artistStatusRules.ts` - Éligibilité statut
  - `artistUnemploymentRules.ts` - Chômage
  - Plus de règles pour fiscalité, subventions, etc.

### 4. State Machines (Workflows)
- **Localisation**: `/src/processus-administratifs/statut-artiste/`
- **Machines principales**:
  - `artistStatusMachine.ts` - Workflow demande de statut
  - `artistGrantMachine.ts` - Workflow demande de bourse

### 5. Références Légales
- **Fichier**: `/src/legal-sources/artistLegalSources.ts`
- **Contenu**: Toutes les références juridiques officielles

## Les 50 Procédures Implémentées

### Catégorie 1: Statut et Reconnaissance (10 procédures)
1. Demande de statut d'artiste
2. Visa artiste
3. Carte artiste professionnelle
4. Reconnaissance artiste étranger
5. Passage amateur à professionnel
6. Statut artiste-technicien
7. Statut artiste-enseignant
8. Renouvellement statut
9. Contestation refus
10. Médiation Commission

### Catégorie 2: Protection Sociale et Chômage (10 procédures)
11. Ouverture droits chômage artistique
12. Règle du cachet
13. Allocation de protection
14. Cumul chômage et activité
15. Dispense recherche emploi
16. Formation pendant chômage
17. Chômage intermittent
18. Fin de droits et prolongation
19. Déclaration activités accessoires
20. Passage chômage vers indépendant

### Catégorie 3: Fiscalité et Revenus (10 procédures)
21. Régime fiscal artiste
22. Déclaration revenus mixtes
23. Petites indemnités
24. TVA œuvres originales
25. Précompte mobilier droits auteur
26. Déduction frais réels
27. Quotité exonérée artistique
28. Tax shelter production
29. Déclaration internationale
30. Régularisation fiscale

### Catégorie 4: Droits d'Auteur et Propriété Intellectuelle (10 procédures)
31. Inscription société de gestion
32. Déclaration œuvres
33. Perception droits diffusion
34. Droit de suite
35. Contrats de cession
36. Protection contre plagiat
37. Droits voisins interprètes
38. Gestion collective obligatoire
39. Répartition droits co-auteurs
40. Droits numériques

### Catégorie 5: Subventions et Aides (10 procédures)
41. Bourse de création
42. Bourse de résidence
43. Bourse jeune talent
44. Aide au projet
45. Subvention équipement
46. Bourse de recherche
47. Aide à la diffusion
48. Subvention structurelle
49. Aide d'urgence COVID
50. Crowdfunding réglementé

## Références Légales Principales

### Législation Primaire
- **Arrêté royal du 16 novembre 2009** - Protection sociale des artistes
- **Loi-programme du 24 décembre 2002** - Article 1bis (contrat de travail)
- **Code des impôts sur les revenus 1992** - Régime fiscal
- **Arrêté royal du 26 mars 2003** - Commission des Artistes
- **Code de droit économique** - Livre XI (droits d'auteur)

### Organismes Compétents
- **Commission des Artistes** - Reconnaissance et médiation
- **ONEM** - Chômage et allocations
- **INASTI** - Sécurité sociale indépendants
- **SPF Finances** - Fiscalité
- **Fédération Wallonie-Bruxelles** - Subventions culture

### Sociétés de Gestion Collective
- **SABAM** - Musique
- **SACD** - Dramaturgie et audiovisuel
- **SOFAM** - Arts plastiques
- **SCAM** - Multimédia et littérature
- **PlayRight** - Droits voisins interprètes

## Constantes et Seuils 2024

### Statut d'Artiste
- Jours minimum standard: **156 jours**
- Jours minimum débutant: **104 jours**
- Période de référence: **21 mois**
- Revenus artistiques minimum: **2000€**
- Plafond revenus non-artistiques: **10000€**

### Chômage Artistique
- Allocation journalière max: **65.96€**
- Exonération cachet journalier: **130€**
- Période de protection: **12 mois**

### Régime Fiscal
- Frais forfaitaires: **50%** (max 10000€)
- Précompte droits d'auteur: **15%**
- TVA œuvres originales: **6%**
- Quotité exonérée artiste: **3590€**

### Sécurité Sociale
- Cotisations indépendant: **20.5%**
- Cotisation minimum trimestrielle: **721.89€**
- Congé maternité: **12 semaines**
- Allocation hebdomadaire: **506.24€**

### Bourses et Subventions
- Bourse création max: **25000€**
- Bourse résidence max: **15000€**
- Bourse recherche max: **20000€**
- Bourse jeune talent max: **8000€**
- Subvention équipement max: **5000€**

## Utilisation

### Tests
```bash
# Exécuter les tests Cucumber pour le statut d'artiste
npm run cucumber -- specifications-metier/statut-artiste

# Tests unitaires des règles
npm test -- statut-artiste

# Vérification des types TypeScript
npm run typecheck
```

### Exemples d'utilisation
```typescript
import { checkArtistStatusEligibility } from './src/regles-eligibilite/statut-artiste/artistStatusRules';
import { Artist } from './src/modele-metier/statutArtisteTypes';

const artist: Artist = {
  // ... données de l'artiste
};

const eligibility = await checkArtistStatusEligibility(artist);
```

### Workflow State Machine
```typescript
import { artistStatusMachine } from './src/processus-administratifs/statut-artiste/artistStatusMachine';
import { interpret } from 'xstate';

const service = interpret(artistStatusMachine);
service.start();
service.send('START_APPLICATION', { applicant: artist });
```

## Architecture et Patterns

### Hybrid Approach
- **Gherkin**: Spécifications lisibles par les experts légaux
- **XState**: Orchestration des workflows complexes
- **json-rules-engine**: Évaluation dynamique des règles
- **TypeScript**: Type-safety pour les calculs critiques

### Scalabilité
- Moteurs de règles singleton pour performance
- Cache Redis pour règles fréquentes
- Queue Bull pour processus asynchrones
- Audit trail complet

### Multi-langue
- Français (principal)
- Néerlandais (traductions disponibles)
- Allemand (où applicable)

## Maintenance et Évolution

### Ajout de Nouvelles Procédures
1. Ajouter feature Gherkin dans `/specifications-metier/statut-artiste/`
2. Étendre types dans `statutArtisteTypes.ts`
3. Créer règles dans `/src/regles-eligibilite/statut-artiste/`
4. Implémenter workflow si nécessaire
5. Mettre à jour documentation

### Mise à Jour des Seuils
Les constantes sont centralisées dans `ARTIST_STATUS_CONSTANTS` et peuvent être mises à jour annuellement.

### Conformité Légale
Toutes les références légales sont documentées avec URLs officielles vers ejustice.just.fgov.be.

## Support et Contact

Pour questions sur l'implémentation:
- Consulter les tests Cucumber pour exemples
- Vérifier les références légales dans `artistLegalSources.ts`
- Workflow visualisations disponibles via `npm run docs:generate`

## Licence

Ce code est fourni comme proof-of-concept pour démontrer l'encodage de la logique légale belge.
Utilisation en production requiert validation juridique appropriée.

---

**Dernière mise à jour**: 2025-11-17
**Version**: 1.0.0
**Auteur**: Claude Code (Agent 9)