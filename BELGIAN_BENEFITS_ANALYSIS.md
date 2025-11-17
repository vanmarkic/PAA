# Belgian Social Benefits & Workflows - Feature File Prioritization

## Overview
- **Total Rule Files Found**: 102
- **Existing Feature Files**: 3 (RIS, AGR, Legal Text Conversion)
- **Priority Coverage Target**: Top 15-20 benefits representing ~80% of social impact
- **Benefit Categories**: 9 major categories

---

# PRIORITY 1: FOUNDATION BENEFITS (Already have features or critically urgent)

## 1. RIS (Revenu d'Intégration Sociale)
**Status**: ✓ Feature file exists
- **Feature File**: `/home/user/PAA/features/benefits/ris.feature`
- **Rule File**: `/home/user/PAA/src/rules/risRules.ts`
- **Workflow**: `/home/user/PAA/src/workflows/risMachine.ts`
- **What it does**: Minimum income safety net for people without sufficient resources
- **Key Criteria**: 
  - Age ≥18, Belgian resident (or equivalent status)
  - Insufficient resources (income, patrimony limits)
  - Disposed to work (unless incapable)
  - Priority: Monthly amounts from €713.66 (cohabitant) to €1,450.52 (family)
- **Legal Basis**: Loi du 26 mai 2002, Arrêté royal du 11 juillet 2002
- **Admin**: CPAS (Centre Public d'Action Sociale)

## 2. AGR (Allocation de Garantie de Revenus)
**Status**: ✓ Feature file exists
- **Feature File**: `/home/user/PAA/features/benefits/income-guarantee.feature`
- **Rule File**: `/home/user/PAA/src/rules/agrRules.ts`
- **Workflow**: No dedicated machine yet
- **What it does**: Guarantees minimum income for part-time workers with benefit rights
- **Key Criteria**:
  - Part-time employment (max 4/5 of full-time)
  - Gross monthly salary ≤ €2,111.89 (2025)
  - Maintains unemployment rights
  - Formula: AGR = Reference allowance + Hourly supplement - Net salary
- **Legal Basis**: Arrêté royal du 25 novembre 1991, Articles 28-33, 131bis
- **Admin**: ONEM (Office National de l'Emploi)

---

# PRIORITY 2: HIGH-IMPACT BENEFITS (Immediate implementation needed)

## 3. Allocations de Chômage (Unemployment Benefits)
**Status**: Rule file exists, NO feature file
- **Rule File**: `/home/user/PAA/src/rules/allocationsChomageRules.ts`
- **Workflow**: No machine yet
- **What it does**: Compensation for involuntary unemployment, replaces AGR as primary safety net
- **Key Criteria**:
  - Age 18+, Unemployed involuntarily
  - Minimum working days: 312 days in last 18 months (under 36) or 468 days (36+)
  - Waiting period: 0 days
  - Daily allowance: €65.48 max (2024)
  - Duration: Up to 48 months (age-dependent)
- **Eligibility Tiers**: Full rate → reduced rate → minimum allowance (4 tiers)
- **Legal Basis**: Arrêté royal du 25 novembre 1991 - ONEM regulations
- **Admin**: ONEM

## 4. Allocations Familiales (Family Allowances)
**Status**: Rule file exists, NO feature file
- **Rule File**: `/home/user/PAA/src/rules/allocationsFamilialesRules.ts`
- **Workflow**: `/home/user/PAA/src/workflows/education/allocationEtudesMachine.ts` (related)
- **What it does**: Regular allowances per child for families - regionalized since 2020
- **Key Criteria**:
  - Children aged 0-18 (unconditional)
  - Children 18-25 (conditional: studying, training, or low income)
  - Amount increases with number of children
  - Regional variations: Wallonia, Flanders, Brussels, German community
- **Monthly Amounts (2024)**: €168-€250+ per child depending on region
- **Legal Basis**: Ordonnance du 25 avril 2019 (Brussels), Décrets régionaux
- **Admin**: Regional administrations (OPE, Agence Wallonne, Administratie Slachtoffers, DGTRE)

## 5. GRAPA (Garantie de Revenus aux Personnes Âgées)
**Status**: Rule file exists, NO feature file
- **Rule File**: `/home/user/PAA/src/rules/grapaRules.ts`
- **Workflow**: `/home/user/PAA/src/workflows/pension/grapaMachine.ts`
- **What it does**: Guaranteed minimum income for elderly (65+), top-up to retirement pensions
- **Key Criteria**:
  - Age ≥65
  - Insufficient pension income
  - Belgian resident (3+ years)
  - Patrimony within limits (€16,500 movable, immovable residence only)
- **Monthly Amount (2024)**: €1,389.48-€1,857.97 depending on family status
- **Legal Basis**: Loi du 22 mai 1969
- **Admin**: Service Fédéral des Pensions (SFP)

## 6. Allocations pour Personnes Handicapées (Disability Allowance)
**Status**: Rule file exists, NO feature file
- **Rule File**: `/home/user/PAA/src/rules/allocationHandicapesRules.ts`
- **Workflow**: `/home/user/PAA/src/workflows/handicap/allocationIntegrationMachine.ts`
- **What it does**: Monthly allowance for people with disabilities affecting autonomy
- **Key Criteria**:
  - Medical evaluation: Minimum 9 autonomy points (categories 1-4)
  - Age ≥21 (or special circumstances)
  - Income within limits
  - Categories: 18 points (€1,500) down to 9 points (€600) - example amounts
  - Benefits: Increased with number of dependents
- **Administration**: ARR (Administration des Reclassements de Rente), SFP
- **Legal Basis**: Loi du 27 février 1987

## 7. Allocations d'Études (Study Allowances)
**Status**: Rule file exists, NO feature file
- **Rule File**: `/home/user/PAA/src/rules/allocationsEtudesRules.ts`
- **Workflow**: `/home/user/PAA/src/workflows/education/allocationEtudesMachine.ts`
- **What it does**: Financial aid for students in secondary or higher education
- **Key Criteria**:
  - Enrolled full-time in approved education program
  - Family income within limits (varies by region)
  - Age typically <25 (varies by program)
  - Social status: Student
  - Work limit while studying
- **Administration**: Regional (varies by community)
- **Legal Basis**: Various regional decrees

## 8. Congé Maternité (Maternity Leave)
**Status**: Rule file exists, NO feature file
- **Rule File**: `/home/user/PAA/src/rules/congeMaterniteRules.ts`
- **Workflow**: `/home/user/PAA/src/workflows/family/congeParentalMachine.ts` (related)
- **What it does**: Paid leave for pregnant women and new mothers
- **Key Criteria**:
  - Pregnancy (from 6 weeks before due date)
  - Covered employees: Full salary replacement first 30 days, then 71.5% replacement for 56 days
  - Start date: 1 week before due date (flexible)
  - Total: ~8 weeks
  - Self-employed: 6 weeks lump sum (€3,500 approx)
- **Benefit**: Protects employment + income during motherhood
- **Legal Basis**: Code du travail - Employment law

## 9. Pension de Retraite (Retirement Pension)
**Status**: Rule file exists, NO feature file
- **Rule File**: `/home/user/PAA/src/rules/pensionRetraiteRules.ts`
- **Workflow**: `/home/user/PAA/src/workflows/pension/pensionAnticipeeMachine.ts`
- **What it does**: Regular pension income after retirement
- **Key Criteria**:
  - Age 62-67 (depending on career start and contributions)
  - Minimum contribution years: 45 years (general), 42 (special jobs)
  - Career salary average calculation
  - Pension = Years worked × Average salary × Rate (varies by system)
  - Complementary: Employer pension funds
- **Administration**: SFP (Federal pension system), Regional systems
- **Legal Basis**: Loi de 1889, various amendments

## 10. Aide au Logement (Housing Allowance)
**Status**: Rule file exists, NO feature file
- **Rule File**: `/home/user/PAA/src/rules/aideLogementRules.ts`
- **Workflow**: No machine yet
- **What it does**: Help with housing costs (rent or mortgage) - REGIONAL (Brussels-focused)
- **Key Criteria** (Brussels example):
  - Residence in Brussels
  - Income limits by household size
  - Max rent: €800-900 (varies)
  - Allowance covers portion of rent based on income
  - Max annual income: ~€25,000
- **Monthly Benefit**: €100-€500+ depending on income and rent
- **Legal Basis**: Arrêté du Gouvernement de Bruxelles, 15 juillet 2021
- **Admin**: Regional (Brussels, Wallonia, Flanders have own systems)

---

# PRIORITY 3: IMPORTANT SUPPORTING BENEFITS (Medium implementation urgency)

## 11. Logement Social (Social Housing)
**Status**: Rule file exists, NO feature file
- **Rule File**: `/home/user/PAA/src/rules/logementSocialRules.ts`
- **Workflow**: `/home/user/PAA/src/workflows/housing/agenceImmobiliereSocialeMachine.ts`
- **What it does**: Access to affordable public or subsidized housing
- **Key Criteria**:
  - Insufficient housing or inadequate conditions
  - Income within limits (varies by region)
  - Belgian resident
  - Usually long waiting lists (months/years)
- **Regional**: Wallonia (SWCS/OPH), Flanders (VHM), Brussels
- **Legal Basis**: Regional decrees & ordinances

## 12. Accident du Travail (Workplace Accidents)
**Status**: Rule file exists, NO feature file
- **Rule File**: `/home/user/PAA/src/rules/accidentTravailRules.ts`
- **Workflow**: `/home/user/PAA/src/workflows/health/accidentTravailMachine.ts`
- **What it does**: Compensation for work-related injuries and medical costs
- **Key Criteria**:
  - Accident occurs during/for work
  - Employee or self-employed covered
  - Medical proof required
  - Wage replacement during recovery: 100% first 30 days, 75% up to 12 months
  - Potential permanent disability benefit
- **Coverage**: Medical care + lost wages + disability lump sum
- **Admin**: INAMI + insurance companies
- **Legal Basis**: Loi du 10 avril 1971

## 13. Chèques Repas (Meal Vouchers / Luncheon Vouchers)
**Status**: Rule file exists, NO feature file
- **Rule File**: `/home/user/PAA/src/rules/chequesRepasRules.ts`
- **Workflow**: `/home/user/PAA/src/workflows/chequesRepasMachine.ts`
- **What it does**: Employer-subsidized meal coupons for employees to purchase food
- **Key Criteria**:
  - Employee (excluding management in some cases)
  - Employed at least 1 month
  - Can be used in participating restaurants/shops
  - Value: €5-8.75 per coupon (employer + employee contributions)
  - Not subject to social contributions
- **Tax Advantage**: Employer deduction + exemption from taxes/social charges
- **Legal Basis**: Article 20, Loi Spéciale Sécurité Sociale (regime 1971)

## 14. Prime de Naissance (Birth Allowance)
**Status**: Rule file exists, NO feature file
- **Rule File**: `/home/user/PAA/src/rules/primeNaissanceRules.ts`
- **Workflow**: No machine yet
- **What it does**: One-time payment for each child birth
- **Key Criteria**:
  - Child born in Belgium or mother resident
  - Belgian family benefit recipient
  - Per-child amount: €500-€1,000 (varies by child #)
  - First child: Often higher benefit
- **Regional**: Varies by region (Wallonia, Flanders, Brussels)
- **Legal Basis**: Regional family benefit decrees

## 15. Aide aux Personnes Âgées (Elderly Assistance)
**Status**: Rule file exists, NO feature file
- **Rule File**: `/home/user/PAA/src/rules/aidePersonnesAgeesRules.ts`
- **Workflow**: No machine yet
- **What it does**: Various support services for seniors 65+ (personal care, household help)
- **Key Criteria**:
  - Age 65+
  - Limited mobility or loss of autonomy
  - Income-based eligibility
  - Services: Home care, meal delivery, companionship
  - CPAS may cover costs
- **Funding**: CPAS, regional authorities, sometimes user contribution
- **Related**: GRAPA, Aide Ménagère

---

# PRIORITY 4: MEDIUM-IMPACT EMPLOYMENT & TIME BENEFITS

## 16. Congé Parental (Parental Leave)
**Status**: Rule file exists, NO feature file
- **Rule File**: `/home/user/PAA/src/rules/congeParentalRules.ts`
- **Workflow**: `/home/user/PAA/src/workflows/family/congeParentalMachine.ts`
- **What it does**: Paid or unpaid leave for either parent after child birth
- **Key Criteria**:
  - Newborn (up to age 12-14 months typically)
  - Employed parent (full or part-time)
  - Eligibility: 12-24 months leave with €700-800/month income replacement
  - Flexible: Can be taken partly-time
- **Job Protection**: Position kept or equivalent offered
- **Legal Basis**: Loi sur le travail (employed), special provisions self-employed

## 17. Maladie Professionnelle (Occupational Diseases)
**Status**: Rule file exists, NO feature file
- **Rule File**: `/home/user/PAA/src/rules/maladieProfessionnelleRules.ts`
- **Workflow**: `/home/user/PAA/src/workflows/health/maladieProfessionnelleMachine.ts`
- **What it does**: Compensation for work-related health conditions (asbestos, silicosis, etc.)
- **Key Criteria**:
  - List of recognized occupational diseases (60+ diseases)
  - Proof of exposure at work
  - Medical diagnosis
  - Benefits: Disability annuity, medical care coverage
- **Difference from Accident**: Disease develops over time vs. acute accident
- **Legal Basis**: Loi du 3 juin 1970

## 18. Crédit Temps (Time Credit)
**Status**: Rule file exists, NO feature file
- **Rule File**: `/home/user/PAA/src/rules/creditTempsRules.ts`
- **Workflow**: No machine yet
- **What it does**: Allow employees to reduce working hours with partial income replacement
- **Key Criteria**:
  - Full-time employee (24+ months tenure)
  - Employer agreement
  - Reduction: 1/5, 1/4, 1/3, or 1/2 of time
  - Income: 75% of lost gross salary (within limits: ~€748/month 2024)
  - Duration: 12-60 months depending on reason
- **Reasons**: Parenting, training, caregiving, social/cultural, personal
- **Legal Basis**: Loi du 1er septembre 2011, Arrêté royal

## 19. Aide Alimentaire (Food Assistance)
**Status**: Rule file exists, NO feature file
- **Rule File**: `/home/user/PAA/src/rules/aideAlimentaireRules.ts`
- **Workflow**: `/home/user/PAA/src/workflows/aideAlimentaireMachine.ts`
- **What it does**: Emergency food aid for people in extreme poverty
- **Key Criteria**:
  - RIS recipient or extremely low income
  - Emergency situation
  - Distribution through:
    - Banques alimentaires (food banks)
    - Soupes populaires (community kitchens)
    - Restaurant sociaux
    - CPAS distributions
- **Administration**: CPAS + NGOs, partly subsidy-funded
- **Related**: Banque Alimentaire, Restaurants Sociaux, Cheques Repas

## 20. Écochèque (Eco-Cheque/Green Vouchers)
**Status**: Rule file exists, NO feature file
- **Rule File**: `/home/user/PAA/src/rules/ecoChequeRules.ts`
- **Workflow**: `/home/user/PAA/src/workflows/ecoChequeMachine.ts`
- **What it does**: Employer-provided vouchers for eco-friendly products/services
- **Key Criteria**:
  - Employee (similar to meal vouchers)
  - Value: €250/year per employee (2024)
  - No taxes/social contributions for employee
  - Usable for: Renewable energy, public transit, organic food, environmental services
  - Employer deductible
- **Eligibility**: Employers can provide, employees benefit
- **Legal Basis**: Law on tax deductions for employers

---

# SUMMARY TABLE: Benefits Ranked by Priority

| Rank | Benefit | Category | Feature Needed | Complexity | Monthly Avg Impact |
|------|---------|----------|---------------|-----------|--------------------|
| 1 | RIS | Social Safety Net | ✓ EXISTS | High | €1,070 |
| 2 | AGR | Employment | ✓ EXISTS | High | €500-1,500 |
| 3 | Allocations de Chômage | Employment | URGENT | High | €600-1,800 |
| 4 | Allocations Familiales | Family | URGENT | Medium | €168-500+ |
| 5 | GRAPA | Elderly | URGENT | Medium | €1,389 |
| 6 | Allocations Handicapées | Disability | URGENT | High | €600-1,500 |
| 7 | Allocations d'Études | Education | URGENT | Medium | €200-500 |
| 8 | Congé Maternité | Leave | HIGH | Medium | €2,500 |
| 9 | Pension de Retraite | Retirement | HIGH | Very High | €1,200-2,500 |
| 10 | Aide au Logement | Housing | HIGH | Medium | €200-500 |
| 11 | Logement Social | Housing | HIGH | Very High | Variable |
| 12 | Accident du Travail | Health | HIGH | High | €2,500+ |
| 13 | Chèques Repas | Benefit | MEDIUM | Low | €100-175 |
| 14 | Prime de Naissance | Family | MEDIUM | Low | €1,000 (one-time) |
| 15 | Aide aux Personnes Âgées | Elderly | MEDIUM | Medium | €500-1,500 |
| 16 | Congé Parental | Leave | MEDIUM | Medium | €700-800 |
| 17 | Maladie Professionnelle | Health | MEDIUM | High | €1,000-2,000 |
| 18 | Crédit Temps | Time/Work | MEDIUM | Medium | €748 (max) |
| 19 | Aide Alimentaire | Social | LOW | Low | €200-500 |
| 20 | Écochèque | Benefit | LOW | Low | €250/year |

---

# TECHNICAL IMPLEMENTATION NOTES

## File Locations Pattern
```
Rule File:     /home/user/PAA/src/rules/[benefitName]Rules.ts
Machine:       /home/user/PAA/src/workflows/[benefitName]Machine.ts (or subdirectory)
Feature File:  /home/user/PAA/features/benefits/[benefit-name].feature (TO CREATE)
Types:         /home/user/PAA/src/domain/[benefitName]Types.ts (optional)
Examples:      /home/user/PAA/src/examples/[benefitName]Example.ts (optional)
```

## Existing Workflow Subdirectories (By Sector)
- `health/` - 10 machines (accident, maternity, pharmacy, etc.)
- `handicap/` - 3 machines (allocation, stationnement card, ARM)
- `housing/` - 3 machines (insalubre, expulsion, agency)
- `pension/` - 3 machines (survie, anticipée, GRAPA)
- `family/` - 3 machines (reconaissance, parental leave, pension alimentaire)
- `fiscal/` - 2 machines (succession, donation)
- `education/` - 2 machines (inscription, allocations)
- `energy/` - 2 machines (budget, tarif social)
- `immigration/` - 2 machines (titre sejour, regroupement)
- `commerce/` - 3 machines (creation, accounting, TVA)
- `justice/` - 4 machines (administration, divorce, garde, pension alimentaire)

## Legal Reference Framework
All benefits should reference:
- `LegalReference` type (source, type, date, authority, officialUrl)
- Legal sources file: `/home/user/PAA/src/legal-sources/belgianLegalSources.ts`
- Example: RIS_LEGAL_FRAMEWORK, AGR_LEGAL_FRAMEWORK patterns

## Feature File Structure (from ris.feature)
```gherkin
# language: fr
Fonctionnalité: [Benefit Name]
  En tant que [beneficiary type]
  Je veux savoir [eligibility question]
  Afin de [benefit outcome]

  Contexte: [Reference amounts, constants]
  Scénario: [Specific eligibility scenario]
  Plan du Scénario: [Parametrized test cases]
```

---

# RECOMMENDED IMPLEMENTATION SEQUENCE

## Phase 1 (Critical Foundation - Week 1-2)
1. Allocations de Chômage (unemployment - covers many AGR cases)
2. Allocations Familiales (affects ~400K families)
3. Allocations Handicapées (specific medical criteria)

## Phase 2 (Economic Support - Week 3-4)
4. Aide au Logement (housing pressure point)
5. Crédit Temps (work-life balance policy)
6. Pension de Retraite (age-related eligibility)

## Phase 3 (Health & Family - Week 5-6)
7. Congé Maternité (legal leave rights)
8. Accident du Travail (injury compensation)
9. Maladie Professionnelle (disease compensation)

## Phase 4 (Supporting Benefits - Week 7-8)
10. Prime de Naissance (family support)
11. Allocations d'Études (student support)
12. Logement Social (long-term housing)

---

# KEY BELGIAN INSTITUTIONS TO REFERENCE

- **ONEM** (Office National de l'Emploi) - Unemployment, AGR
- **SPF Sécurité Sociale** - RIS, GRAPA, Pensions
- **INAMI** (Institut National d'Assurance Maladie) - Healthcare, accidents
- **ARR** (Administration des Reclassements de Rente) - Disabilities
- **CPAS** (Centre Public d'Action Sociale) - Local welfare administration (326 in Belgium)
- **Regional Administrations** - Family allowances (since 2020 regionalization)
- **SFP** (Service Fédéral des Pensions) - Pensions, GRAPA
- **OPE, SVB, etc.** - Regional benefit administrators

