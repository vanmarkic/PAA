# Nouvelles Machines et Tests Sémantiques

## 📊 Vue d'ensemble

Ce document décrit les nouvelles machines, meta machines et tests sémantiques ajoutés au projet PAA.

### Statistiques

- **Machines individuelles créées**: 7+ nouvelles machines dans 5 domaines
- **Meta machines de parcours citoyens**: 4 parcours complets
- **Tests sémantiques**: 1 suite complète de validation légale
- **Domaines couverts**: Santé, Justice, Environnement, Commerce, Consommation + Meta parcours

---

## 🏥 Nouvelles Machines - Santé (`src/workflows/health/`)

### 1. `consultationMedecin.ts`
**Description**: Consultation médicale généraliste ou spécialiste avec remboursement mutuelle

**États principaux**:
- Vérification couverture mutuelle
- Prise de rendez-vous
- Consultation effectuée
- Calcul remboursement (75% généraliste, 60% spécialiste)
- Tiers payant ou paiement direct

**Conformité légale**: Nomenclature INAMI, Arrêté Royal remboursements

**Use case citoyen**: "Je dois consulter un médecin, combien vais-je payer ?"

---

### 2. `hospitalisationMachine.ts`
**Description**: Procédure d'hospitalisation complète

**États principaux**:
- Admission
- Traitement hospitalier
- Facturation
- Remboursement mutuelle
- Sortie

**Particularités**:
- Gestion chambre individuelle/commune
- Suppléments d'honoraires
- Assurance hospitalisation complémentaire

**Use case citoyen**: "J'ai besoin d'une opération, quels sont les coûts ?"

---

### 3. `pharmacieMachine.ts`
**Description**: Délivrance médicaments en pharmacie

**États principaux**:
- Présentation ordonnance
- Validation ordonnance
- Vérification stock
- Calcul remboursement (40-100% selon catégorie médicament)
- Délivrance

**Conformité légale**: Catégories remboursement INAMI (A, B, C, Cs, Cx)

**Use case citoyen**: "Combien vais-je payer pour mes médicaments ?"

---

## ⚖️ Nouvelles Machines - Justice (`src/workflows/justice/`)

### 4. `procedureDivorceMachine.ts`
**Description**: Procédure de divorce complète (consentement mutuel ou contentieux)

**États principaux**:
- Désignation avocats
- Tentative médiation familiale (obligatoire)
- Rédaction convention
- Dépôt requête tribunal famille
- Audience
- Jugement divorce

**Types de divorce**:
- Consentement mutuel (plus rapide)
- Désunion irrémédiable
- Faute (rare)

**Conformité légale**: Code Civil Belge, réforme divorce 2007

**Use case citoyen**: "Quelles sont les étapes d'un divorce ?"

---

## 🌱 Nouvelles Machines - Environnement (`src/workflows/environment/`)

### 5. `permisEnvironnementMachine.ts`
**Description**: Demande permis d'environnement pour activité industrielle/commerciale

**États principaux**:
- Dépôt demande
- Examen recevabilité
- Étude d'impact (si classe 1)
- Enquête publique obligatoire
- Instruction technique
- Délivrance permis ou refus

**Classes de permis**:
- **Classe 1**: Impact important, enquête publique, étude impact
- **Classe 2**: Impact moyen, déclaration
- **Classe 3**: Impact faible, enregistrement

**Conformité légale**: Décret environnement régional (Wallonie/Flandre/Bruxelles)

**Use case citoyen**: "Je veux ouvrir une entreprise, ai-je besoin d'un permis environnement ?"

---

## 💼 Nouvelles Machines - Commerce (`src/workflows/commerce/`)

### 6. `creationEntrepriseMachine.ts`
**Description**: Création complète d'une entreprise (SRL, SA, indépendant...)

**États principaux**:
- Rédaction plan financier
- Ouverture compte bancaire
- Rédaction actes constitutifs
- Dépôt guichet entreprise
- Immatriculation BCE (Banque-Carrefour Entreprises)
- Activation TVA
- Affiliation caisse assurances sociales

**Formes juridiques couvertes**:
- Indépendant (personne physique)
- SRL (Société à Responsabilité Limitée)
- SA (Société Anonyme)
- ASBL
- SC (Société Coopérative)

**Conformité légale**: Code des Sociétés et Associations (CSA), législation BCE

**Use case citoyen**: "Je veux créer mon entreprise, quelles démarches ?"

---

## 🛡️ Nouvelles Machines - Protection Consommateur (`src/workflows/consumer/`)

### 7. `reclamationConsommationMachine.ts`
**Description**: Procédure de réclamation consommateur

**États principaux**:
- Réclamation écrite auprès vendeur (30 jours)
- Contact Service Médiation Consommateurs (gratuit)
- Médiation amiable
- Saisie Justice de Paix (si échec)

**Conformité légale**: Code Droit Économique Livre VI, Service de Médiation pour le Consommateur

**Use case citoyen**: "J'ai un problème avec un achat, comment me faire rembourser ?"

---

## 🌟 META MACHINES - Parcours Citoyens Complets (`src/workflows/meta/`)

Les meta machines orchestrent plusieurs démarches administratives pour représenter un parcours de vie complet du point de vue du citoyen.

### Meta Machine 1: `parcoursNaissanceEnfantMachine.ts`
**Parcours**: Toutes les démarches suite à la naissance d'un enfant

**Démarches orchestrées**:
1. ✅ **Déclaration naissance** (commune - 15 jours ⚠️)
2. ✅ **Affiliation mutuelle** enfant
3. ✅ **Allocations familiales** (±170€/mois)
4. ✅ **Prime naissance** (1272€ Wallonie, 1122€ Flandre/Bruxelles)
5. ✅ **Congé parental** (maternité 15 semaines, paternité 20 jours)
6. ✅ **Inscription garderie** (anticiper listes d'attente)
7. ✅ **Préparation déclaration fiscale** (déductions)

**Aides financières estimées**:
- Prime naissance unique: 1 272€
- Allocations mensuelles: ±170€/mois
- Congé maternité: 15 semaines rémunérées
- Congé paternité: 20 jours rémunérés

**Délais critiques**:
- ⚠️ **15 jours** pour déclaration naissance (URGENT)
- 30 jours pour mutuelle
- Dès grossesse pour inscription garderie

**Use case**: "J'attends un bébé, à quoi dois-je penser ?"

---

### Meta Machine 2: `parcoursCreationEntrepriseMachine.ts`
**Parcours**: Création complète d'une entreprise de A à Z

**Étapes orchestrées**:
1. ✅ **Formation gestion de base** (obligatoire - ±700€)
2. ✅ **Élaboration business plan** (plan financier 3 ans)
3. ✅ **Recherche financement** (crédit, subsides régionaux, microStart)
4. ✅ **Ouverture compte bancaire** professionnel
5. ✅ **Guichet entreprise** → Numéro BCE
6. ✅ **Activation TVA** (sauf si franchise < 25 000€)
7. ✅ **Caisse assurances sociales** (800€/trimestre)
8. ✅ **Autorisations sectorielles** (selon activité)

**Coûts totaux estimés**:
- Indépendant: ±1 000€
- SRL: ±2 500€ (notaire inclus)
- SA: ±5 000€

**Délai moyen**: 2-3 mois

**Aides disponibles**:
- Bourse préactivité Wallonie: max 12 500€
- Chèque création Bruxelles: max 15 000€
- Tremplin indépendants (si ex-chômeur)
- Garantie Région pour crédit

**Use case**: "Je veux devenir indépendant, par où commencer ?"

---

### Meta Machine 3: `parcoursDemandeurEmploiMachine.ts`
**Parcours**: Perte d'emploi et recherche active

**Étapes orchestrées**:
1. ✅ **Inscription ONEM** (8 jours ⚠️ après fin contrat)
2. ✅ **Inscription service emploi régional** (Forem/VDAB/Actiris)
3. ✅ **Demande allocations chômage** (si 312 jours travaillés)
4. ✅ **Recherche active emploi** (obligations contrôlées)
5. ✅ **Formations gratuites** (reconversion)
6. ✅ **Alternative RIS** si inéligible chômage

**Montants allocations**:
- **Isolé**: 65% salaire (max ±1800€/mois)
- **Cohabitant avec charge**: 60% salaire (max ±1600€/mois)
- **Cohabitant**: 40% salaire (max ±1400€/mois)

**RIS (si inéligible chômage)**:
- Isolé: 1 437€/mois
- Cohabitant avec charge: 1 918€/mois
- Cohabitant: 958€/mois

**Conditions chômage**:
- < 36 ans: 312 jours travaillés (21 mois)
- 36-49 ans: 468 jours (27 mois)
- 50+ ans: 624 jours (36 mois)

**Use case**: "Je perds mon emploi, quels sont mes droits ?"

---

### Meta Machine 4: `parcoursDemenagementMachine.ts`
**Parcours**: Toutes les démarches lors d'un déménagement

**Démarches orchestrées**:
1. ✅ **Changement adresse commune** (8 jours ⚠️ - GRATUIT)
2. ✅ **Redirection courrier** bpost (13-70€)
3. ✅ **Électricité/Gaz** (relève compteurs)
4. ✅ **Eau**
5. ✅ **Internet/TV** (prévoir 2-3 semaines installation)
6. ✅ **Assurance habitation** (OBLIGATOIRE location)
7. ✅ **Notification organismes** (banque, employeur, mutuelle, impôts, voiture...)

**Timeline déménagement**:
- J-30: Planification
- J-15: Assurance habitation
- J-7: Prévenir fournisseurs
- J-0: Déménagement + relevés compteurs
- **J+8: DÉLAI LÉGAL** changement adresse ⚠️

**Coûts**:
- Changement adresse: **GRATUIT**
- Redirection courrier: 13-70€
- Assurance habitation: 100-300€/an
- **AMENDE si > 8 jours**: 50-500€ ⚠️

**Use case**: "Je déménage, quelles démarches obligatoires ?"

---

## 🧪 Tests Sémantiques - Validation Légale

### Fichier: `src/__tests__/semantic/semanticLegalValidation.test.ts`

**Objectif**: Valider que les machines respectent SÉMANTIQUEMENT les textes de loi, pas seulement syntaxiquement.

### Principe

Les tests sémantiques ne testent PAS:
- ❌ "La machine a un état X"
- ❌ "La transition Y existe"

Les tests sémantiques testent:
- ✅ "Si condition légale Y, alors conséquence Z **conformément à l'article X de la loi**"
- ✅ Le **signifié** (meaning) de la machine par rapport au texte légal
- ✅ Les montants, délais, conditions **exactes** de la législation

### Exemples de Tests Sémantiques

#### Test 1: Minimum jours travaillés (Allocations Chômage)
```typescript
test('Nombre minimum de jours travaillés selon Article 30', () => {
  // TEXTE DE LOI:
  // Article 30 AR: "312 jours travaillés dans les 21 mois"

  // Test avec 311 jours (1 de moins)
  actor.send({ joursTravailes: 311 });

  // ASSERTION SÉMANTIQUE:
  // Avec 311 jours, doit être inéligible selon la loi
  expect(snapshot.value).toBe('ineligible');
});
```

#### Test 2: Démission volontaire (Allocations Chômage)
```typescript
test('Raison de fin de contrat: démission volontaire NON couverte (Article 51)', () => {
  // TEXTE DE LOI:
  // Article 51: "La démission volontaire sans motif légitime entraîne une exclusion"

  actor.send({ raisonFinContrat: 'demission-volontaire' });

  // ASSERTION SÉMANTIQUE:
  // Une démission volontaire doit rendre inéligible
  expect(snapshot.value).toBe('ineligible');
  expect(resultat.raisons).toContain(expect.stringMatching(/[Dd]émission/));
});
```

#### Test 3: Taux de remboursement médecin (Consultations Médicales)
```typescript
test('Taux de remboursement médecin généraliste: 75% (tarif conventionné)', () => {
  // LÉGISLATION:
  // Arrêté Royal nomenclature INAMI: remboursement 75% pour consultation généraliste

  actor.send({ typeMedecin: 'generaliste', coutConsultation: 28 });

  // ASSERTION SÉMANTIQUE:
  // Le taux de 75% doit être respecté
  expect(resultat.pourcentageRemboursement).toBe(75);
});
```

### Méthodologie de Validation Sémantique

1. **Identifier la source légale**
   - Arrêté Royal, Loi, Décret, Directive UE
   - Numéro et date exacte
   - Article(s) concerné(s)

2. **Extraire les règles métier**
   - Conditions d'éligibilité
   - Montants/délais/durées
   - Procédures obligatoires
   - Sanctions/conséquences

3. **Mapper règles → états machine**
   - Chaque règle légale = transition ou état
   - Conditions légales = guards (cond)
   - Effets légaux = actions (assign)

4. **Tester le signifié, pas la syntaxe**
   - Ne pas tester "la machine a un état X"
   - Tester "si condition légale Y, alors conséquence Z"

5. **Documenter la conformité**
   - Référence légale dans chaque test
   - Copie de l'article concerné
   - Explication de la validation

### Sources Légales Référencées

**Allocations de Chômage**:
- Arrêté Royal du 25 novembre 1991
- Article 30: Conditions jours travaillés
- Article 40: Délai inscription ONEM
- Article 51: Exclusions (démission)
- Article 56: Contrôle recherche active
- Article 114: Durée selon âge

**Soins de Santé**:
- Nomenclature INAMI
- Arrêtés Royaux remboursements
- Tarifs conventionnés
- Intervention Majorée (BIM)

---

## 🎯 Impact et Valeur Ajoutée

### Pour les Citoyens

1. **Parcours complets** au lieu de machines isolées
   - Vision globale d'une situation de vie
   - Toutes les démarches en un seul endroit
   - Estimation des coûts et délais

2. **Conseils pratiques intégrés**
   - Délais légaux avec alertes
   - Astuces pour économiser
   - Pièges à éviter

3. **Calculs financiers réalistes**
   - Montants des aides
   - Coûts des démarches
   - Optimisations possibles

### Pour le Projet PAA

1. **Validation juridique renforcée**
   - Tests sémantiques garantissent conformité légale
   - Références légales explicites
   - Détection automatique non-conformités

2. **Couverture élargie**
   - 5 nouveaux domaines
   - 4 parcours de vie complets
   - Extension facile à d'autres parcours

3. **Documentation vivante**
   - Meta descriptions dans machines
   - Tests = documentation exécutable
   - Sources légales traçables

---

## 🚀 Utilisation

### Machines Individuelles

```typescript
import { consultationMedecinMachine } from './workflows/health/consultationMedecin';
import { createActor } from 'xstate';

const actor = createActor(consultationMedecinMachine);
actor.start();

actor.send({
  type: 'DEMARRER_DEMANDE',
  patient: {
    nom: 'Jean Dupont',
    numeroINAMI: '12345678901',
    mutuelleSouscrite: true,
    typeAssurance: 'ordinaire',
    age: 45
  }
});
```

### Meta Machines

```typescript
import { parcoursNaissanceEnfantMachine } from './workflows/meta/parcoursNaissanceEnfantMachine';
import { createActor } from 'xstate';

const actor = createActor(parcoursNaissanceEnfantMachine);
actor.start();

actor.send({
  type: 'ENFANT_NE',
  enfant: {
    nom: 'Dupont',
    prenom: 'Marie',
    dateNaissance: new Date('2024-01-15')
  },
  parents: [/* ... */]
});

// Accès au contexte pour voir état des démarches
const snapshot = actor.getSnapshot();
console.log(snapshot.context.demarchesCompletees);
console.log(snapshot.context.aidesFinancieres); // Estimation aides
```

### Tests Sémantiques

```bash
# Exécuter tous les tests
npm run test

# Tests sémantiques uniquement
npm run test -- semantic

# Mode watch
npm run test:watch
```

---

## 📚 Prochaines Étapes Suggérées

### Machines Supplémentaires Pertinentes

1. **Santé** (20+ machines possibles)
   - Urgences hospitalières
   - Chirurgie ambulatoire
   - Kinésithérapie
   - Soins infirmiers domicile
   - Maternité
   - Psychiatrie/psychothérapie

2. **Justice** (30+ machines)
   - Garde des enfants
   - Pension alimentaire
   - Succession et héritage
   - Saisie immobilière
   - Faillite personnelle/entreprise

3. **Environnement** (30+ machines)
   - Prime rénovation énergétique
   - Panneaux solaires
   - Isolation thermique
   - Certificat PEB
   - Permis urbanisme

4. **Commerce** (40+ machines)
   - Comptabilité annuelle
   - Déclarations TVA
   - Subsides entreprise
   - Marques et brevets
   - Fusion/acquisition

5. **Parcours Citoyens** (10+ meta machines)
   - Mariage/PACS
   - Séparation/divorce
   - Décès proche
   - Retraite
   - Achat immobilier
   - Immigration/naturalisation

### Améliorations Tests Sémantiques

1. Ajouter tests pour toutes les machines existantes (102)
2. Automatiser extraction des montants depuis législation
3. Tests de régression lors changements législatifs
4. Intégration continue avec alertes conformité

### Métadonnées Légales

1. Compléter `legalMetadata.ts` pour nouvelles machines
2. Ajouter versions historiques
3. Liens vers Moniteur Belge
4. Dates de révision automatiques

---

## 📞 Contact et Contribution

Pour ajouter de nouvelles machines ou tests sémantiques, suivre le pattern établi:

1. **Machine individuelle**: Copier template d'une machine existante
2. **Meta machine**: Identifier parcours de vie complet
3. **Test sémantique**: Référencer article de loi précis
4. **Documentation**: Mettre à jour ce README

---

*Document créé le 2024-11-16*
*Projet: Plateforme d'Aide Administrative (PAA)*
*Session: claude/add-machines-tests-01PmEPq6iaQXRqfymA94Y8Xm*
