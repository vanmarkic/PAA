# Terminology Mapping - Improved Clarity

This document defines improved, self-explanatory terminology for main concepts across all supported languages (FR, NL, DE, EN).

## Core Concepts - Improved Terminology

### 1. Workflow → Procedure (Procédure)

**Previous terminology:**
- EN: Workflows
- FR: Workflows
- NL: Workflows
- DE: (missing)

**Improved terminology:**
- EN: **Procedures** (more administrative, self-explanatory)
- FR: **Procédures** (standard French administrative term)
- NL: **Procedures** (standard Dutch administrative term)
- DE: **Verfahren** (standard German administrative term)

**Rationale:** "Workflow" is technical jargon. "Procedure" clearly indicates a step-by-step administrative process that citizens and social workers understand.

---

### 2. State Machine → Process Automaton (Automate de Processus)

**Previous terminology:**
- EN: State machines
- FR: Machines d'état
- NL: Toestandsmachines
- DE: (missing)

**Improved terminology:**
- EN: **Process Automata** or **Process Flow Models**
- FR: **Automates de processus** or **Modèles de flux**
- NL: **Procesautomaten** or **Processtroommodellen**
- DE: **Prozessautomaten** or **Prozessflussmodelle**

**Rationale:** "State machine" is computer science jargon. "Process automaton" or "process flow model" better describes what it does: model administrative procedures.

---

### 3. Conversion → Simplification (Simplification)

**Previous terminology:**
- EN: Legal Text Conversion
- FR: Conversion de textes légaux
- NL: Conversie van wettelijke teksten
- DE: (missing)

**Improved terminology:**
- EN: **Legal Text Simplification** / **Plain Language Translation**
- FR: **Simplification de textes légaux** / **Traduction en langage simple**
- NL: **Vereenvoudiging van wetteksten** / **Vertaling naar eenvoudige taal**
- DE: **Vereinfachung von Rechtstexten** / **Übersetzung in einfache Sprache**

**Rationale:** "Conversion" is ambiguous (format conversion? encoding?). "Simplification" or "plain language translation" clearly indicates transforming legal jargon into citizen-friendly language.

---

### 4. Business Rules → Eligibility Rules (Règles d'Éligibilité)

**Previous terminology:**
- EN: Business Rules
- FR: Règles métier
- NL: Bedrijfsregels
- DE: (missing)

**Improved terminology:**
- EN: **Eligibility Rules** / **Benefit Criteria**
- FR: **Règles d'éligibilité** / **Critères d'attribution**
- NL: **Geschiktheidsregels** / **Toekenningscriteria**
- DE: **Zulassungsregeln** / **Leistungskriterien**

**Rationale:** "Business rules" sounds commercial. "Eligibility rules" or "benefit criteria" clearly indicates rules determining who qualifies for social benefits.

---

### 5. Benefits → Social Entitlements (Prestations Sociales)

**Previous terminology:**
- EN: Benefits
- FR: Prestations
- NL: Uitkeringen
- DE: (missing)

**Improved terminology:**
- EN: **Social Entitlements** / **Social Benefits**
- FR: **Prestations sociales** / **Droits sociaux**
- NL: **Sociale uitkeringen** / **Sociale rechten**
- DE: **Sozialleistungen** / **Sozialrechte**

**Rationale:** Adding "social" qualifier makes it explicit these are social welfare entitlements, not commercial benefits or employee perks.

---

### 6. Eligibility Check → Entitlement Assessment (Évaluation de Droits)

**Previous terminology:**
- EN: Eligibility Check
- FR: Vérification d'éligibilité
- NL: Geschiktheidscontrole
- DE: (missing)

**Improved terminology:**
- EN: **Entitlement Assessment** / **Rights Evaluation**
- FR: **Évaluation des droits** / **Examen d'admissibilité**
- NL: **Rechtenbeoordeling** / **Geschiktheidsbeoordeling**
- DE: **Leistungsbewertung** / **Anspruchsprüfung**

**Rationale:** "Assessment" or "evaluation" sounds more professional and less judgmental than "check". Emphasizes determining rights rather than checking eligibility.

---

### 7. Processing → Under Review (En Examen)

**Previous terminology:**
- EN: Processing
- FR: En traitement
- NL: In verwerking
- DE: (missing)

**Improved terminology:**
- EN: **Under Review** / **Being Evaluated**
- FR: **En examen** / **En cours d'évaluation**
- NL: **In behandeling** / **In beoordeling**
- DE: **In Prüfung** / **In Bearbeitung**

**Rationale:** "Processing" sounds mechanical. "Under review" or "being evaluated" indicates human assessment, which is more reassuring for benefit applicants.

---

### 8. Context → Application Data (Données de Demande)

**Previous terminology:**
- EN: Context (technical term in XState machines)
- FR: Contexte
- NL: Context
- DE: (missing)

**Improved terminology (user-facing):**
- EN: **Application Data** / **Case Information**
- FR: **Données de demande** / **Informations du dossier**
- NL: **Aanvraaggegevens** / **Dossierinformatie**
- DE: **Antragsdaten** / **Fallinformationen**

**Rationale:** "Context" is programming jargon. For user-facing interfaces, "application data" or "case information" is clearer.

---

### 9. Guard → Condition (Condition)

**Previous terminology:**
- EN: Guard (XState terminology)
- FR: Guard
- NL: Guard
- DE: (missing)

**Improved terminology (user-facing):**
- EN: **Condition** / **Prerequisite**
- FR: **Condition** / **Prérequis**
- NL: **Voorwaarde** / **Vereiste**
- DE: **Bedingung** / **Voraussetzung**

**Rationale:** "Guard" is programming terminology. "Condition" or "prerequisite" clearly indicates a requirement that must be met.

---

### 10. Action → Step (Étape)

**Previous terminology:**
- EN: Action (XState terminology)
- FR: Action
- NL: Actie
- DE: (missing)

**Improved terminology (user-facing):**
- EN: **Step** / **Operation**
- FR: **Étape** / **Opération**
- NL: **Stap** / **Bewerking**
- DE: **Schritt** / **Vorgang**

**Rationale:** "Action" is generic. "Step" clearly indicates a stage in a multi-step procedure.

---

## Implementation Strategy

### Phase 1: User-Facing Interfaces
Update terminology in:
- Frontend translation files (FR, NL, EN)
- Add German (DE) translations
- API response messages
- Documentation for end users

### Phase 2: Code Comments & Documentation
Update:
- JSDoc comments
- README files
- Architecture documentation
- Feature documentation

### Phase 3: Internal Code (Optional, Low Priority)
Consider aliasing or documenting internal technical terms:
- Keep XState terminology in code (context, guards, actions) for library compatibility
- Add comments explaining user-facing equivalents
- Type aliases for clarity

---

## Language Priority

1. **French (FR)** - Primary language for Wallonia and Brussels
2. **Dutch (NL)** - Primary language for Flanders
3. **German (DE)** - Official language for German-speaking community (NEW - must be added)
4. **English (EN)** - Technical documentation and international context

---

## Belgian Administrative Context

Belgian social welfare uses specific official terminology:
- **CPAS/OCMW** (Centre Public d'Action Sociale / Openbaar Centrum voor Maatschappelijk Welzijn)
- **SPF/FOD** (Service Public Fédéral / Federale Overheidsdienst)
- **ONEM/RVA** (Office National de l'Emploi / Rijksdienst voor Arbeidsvoorziening)

These official abbreviations should remain unchanged as they are legally defined.

---

## Summary of Key Changes

| Concept | Old (EN/FR/NL) | New (EN/FR/NL/DE) |
|---------|----------------|-------------------|
| Workflow | Workflows / Workflows / Workflows | Procedures / Procédures / Procedures / Verfahren |
| State Machine | State machines / Machines d'état / Toestandsmachines | Process Automata / Automates de processus / Procesautomaten / Prozessautomaten |
| Conversion | Conversion / Conversion / Conversie | Simplification / Simplification / Vereenvoudiging / Vereinfachung |
| Business Rules | Business Rules / Règles métier / Bedrijfsregels | Eligibility Rules / Règles d'éligibilité / Geschiktheidsregels / Zulassungsregels |
| Benefits | Benefits / Prestations / Uitkeringen | Social Benefits / Prestations sociales / Sociale uitkeringen / Sozialleistungen |
| Eligibility Check | Eligibility Check / Vérification d'éligibilité / Geschiktheidscontrole | Entitlement Assessment / Évaluation des droits / Rechtenbeoordeling / Leistungsbewertung |
| Processing | Processing / En traitement / In verwerking | Under Review / En examen / In behandeling / In Prüfung |
| Context | Context / Contexte / Context | Application Data / Données de demande / Aanvraaggegevens / Antragsdaten |
| Guard | Guard / Guard / Guard | Condition / Condition / Voorwaarde / Bedingung |
| Action | Action / Action / Actie | Step / Étape / Stap / Schritt |

---

## Notes

- Technical code can maintain library-specific terminology (XState: context, guards, actions) with documentation
- User-facing interfaces must use improved terminology
- All new features must include all four languages: FR, NL, DE, EN
- German translations must be added to all existing user-facing content
