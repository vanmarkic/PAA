# Gherkin Feature File Implementation Status Checklist

## Legend
- ✓ = Complete (has feature file)
- 🔄 = Partial (has rule file + machine)
- ⚠ = At Risk (has rule file, no machine)
- ❌ = Not Started (bare minimum)

---

## CRITICAL PRIORITY (Implement in Phase 1-2)

### 3. Allocations de Chômage (Unemployment Benefits)
- [⚠] Rule file: `/home/user/PAA/src/regles-eligibilite/allocationsChomageRules.ts`
- [ ] Feature file: NEEDS CREATION
- [ ] Workflow machine: NEEDS CREATION
- [ ] Types file: May exist
- **Impact**: €600-1,800/month for ~350,000 beneficiaries
- **Complexity**: HIGH (4 tiers, multiple duration categories)
- **Key Test Cases**:
  - Under 36 with 312+ working days → full allowance tier
  - Over 36 with 468+ working days → different rules
  - Extended unemployment (12+ months) → reduced tier
  - Edge case: Just reached 312 days

### 4. Allocations Familiales (Family Allowances)
- [⚠] Rule file: `/home/user/PAA/src/regles-eligibilite/allocationsFamilialesRules.ts`
- [ ] Feature file: NEEDS CREATION
- [🔄] Related machine: `/home/user/PAA/src/processus-administratifs/education/allocationEtudesMachine.ts`
- [ ] Workflow machine: NEEDS CREATION or CONSOLIDATION
- **Impact**: €168-€500+/month × ~2.5M children
- **Complexity**: MEDIUM-HIGH (4 regions, 2 categories of children)
- **Special Note**: Regionalized since 2020 - requires region-specific rules
- **Key Test Cases**:
  - Child 0-18 years (unconditional)
  - Child 18-25 studying full-time (conditional)
  - Child 18-25 with low income (conditional)
  - Multiple children (amount increases)
  - Region-specific amount variations

### 6. Allocations pour Personnes Handicapées (Disability Allowance)
- [⚠] Rule file: `/home/user/PAA/src/regles-eligibilite/allocationHandicapesRules.ts`
- [ ] Feature file: NEEDS CREATION
- [🔄] Related machine: `/home/user/PAA/src/processus-administratifs/handicap/allocationIntegrationMachine.ts`
- **Impact**: €600-€1,500/month for ~95,000 beneficiaries
- **Complexity**: HIGH (medical evaluation, 4 categories, ARR process)
- **Key Test Cases**:
  - Medical evaluation: 18 points (category 1) → €1,500
  - Medical evaluation: 15-17 points (category 2) → €1,200
  - Medical evaluation: 12-14 points (category 3) → €900
  - Medical evaluation: 9-11 points (category 4) → €600
  - Dependent increase calculations

---

## HIGH PRIORITY (Implement in Phase 2-3)

### 5. GRAPA (Garantie de Revenus aux Personnes Âgées)
- [⚠] Rule file: `/home/user/PAA/src/regles-eligibilite/grapaRules.ts`
- [ ] Feature file: NEEDS CREATION
- [🔄] Machine: `/home/user/PAA/src/processus-administratifs/pension/grapaMachine.ts`
- **Impact**: €1,389-€1,857/month for ~300,000 elderly
- **Complexity**: MEDIUM (age-based, pension interaction)
- **Key Test Cases**:
  - Age 64 years 11 months → NOT eligible (must be 65)
  - Age 65+ with no pension → full GRAPA
  - Age 65+ with small pension (€500) → partial GRAPA
  - Age 65+ with sufficient pension → NOT eligible
  - Patrimony €17,000 (over limit) → NOT eligible

### 7. Allocations d'Études (Study Allowances)
- [⚠] Rule file: `/home/user/PAA/src/regles-eligibilite/allocationsEtudesRules.ts`
- [ ] Feature file: NEEDS CREATION
- [🔄] Machine: `/home/user/PAA/src/processus-administratifs/education/allocationEtudesMachine.ts`
- **Impact**: €200-€500/month for ~250,000 students
- **Complexity**: MEDIUM-HIGH (regional variation, income limits, work restrictions)
- **Key Test Cases**:
  - Secondary school student, family income €20,000/year
  - University student, family income €30,000/year
  - Student working 8 hours/week (allowed) vs 15 hours/week (maybe not)
  - Student turns 25 during school year
  - Regional difference checks

### 10. Aide au Logement (Housing Allowance)
- [⚠] Rule file: `/home/user/PAA/src/regles-eligibilite/aideLogementRules.ts`
- [ ] Feature file: NEEDS CREATION
- [ ] Machine: NEEDS CREATION
- **Impact**: €200-€500/month for ~100,000 households
- **Complexity**: MEDIUM (income limits, rent validation)
- **Regional**: Brussels example (others needed)
- **Key Test Cases**:
  - Income €15,000/year, rent €700/month → eligible
  - Income €30,000/year, rent €700/month → NOT eligible
  - Rent €1,200/month (over max) → limited benefit
  - Mortgage vs rent distinction

### 8. Congé Maternité (Maternity Leave)
- [⚠] Rule file: `/home/user/PAA/src/regles-eligibilite/congeMaterniteRules.ts`
- [ ] Feature file: NEEDS CREATION
- [🔄] Related machine: `/home/user/PAA/src/processus-administratifs/family/congeParentalMachine.ts`
- **Impact**: €2,500/month × 2 months average per mother
- **Complexity**: MEDIUM (employment status: employed vs self-employed, dates)
- **Key Test Cases**:
  - Pregnant employee at 6 weeks before due date → eligible
  - Self-employed mother → €3,500 lump sum
  - Employee: first 30 days 100%, next 56 days 71.5%
  - Due date calculation from conception date

### 12. Accident du Travail (Workplace Accidents)
- [⚠] Rule file: `/home/user/PAA/src/regles-eligibilite/accidentTravailRules.ts`
- [ ] Feature file: NEEDS CREATION
- [🔄] Machine: `/home/user/PAA/src/processus-administratifs/health/accidentTravailMachine.ts`
- **Impact**: €2,500+/month for ~100,000 cases/year
- **Complexity**: HIGH (medical proof, wage replacement tiers, permanent disability)
- **Key Test Cases**:
  - Accident during work hours on employer premises → eligible
  - Accident during lunch break → eligible
  - Accident commuting to/from work → NOT eligible (separate scheme)
  - First 30 days: 100% wage replacement
  - Days 31-365: 75% wage replacement
  - Permanent disability evaluation (0-100% rating)

---

## MEDIUM PRIORITY (Implement in Phase 3-4)

### 9. Pension de Retraite (Retirement Pension)
- [⚠] Rule file: `/home/user/PAA/src/regles-eligibilite/pensionRetraiteRules.ts`
- [ ] Feature file: NEEDS CREATION
- [🔄] Machine: `/home/user/PAA/src/processus-administratifs/pension/pensionAnticipeeMachine.ts`
- **Impact**: €1,200-€2,500/month for ~1.7M pensioners
- **Complexity**: VERY HIGH (45 year calculation, multiple systems, early/late options)
- **Key Test Cases**:
  - 45 years contributions, age 62 → early retirement available
  - 42 years contributions, age 62 → NOT eligible (needs 45)
  - Age 65 with 45 years → full pension
  - Average career salary €2,000/month → pension calculation
  - Work beyond retirement age bonus (increased rate)

### 11. Logement Social (Social Housing)
- [⚠] Rule file: `/home/user/PAA/src/regles-eligibilite/logementSocialRules.ts`
- [ ] Feature file: NEEDS CREATION
- [🔄] Machine: `/home/user/PAA/src/processus-administratifs/housing/agenceImmobiliereSocialeMachine.ts`
- **Impact**: Huge (150,000+ on waiting lists nationally)
- **Complexity**: VERY HIGH (regional systems, wait lists, needs assessment)
- **Regional**: Wallonia (SWCS, OPH), Flanders (VHM), Brussels (SLRB)
- **Key Test Cases**:
  - Inadequate housing condition assessment
  - Income within regional limits
  - Waiting list position and time
  - Priority categories (homeless, overcrowding, etc.)

### 14. Prime de Naissance (Birth Allowance)
- [⚠] Rule file: `/home/user/PAA/src/regles-eligibilite/primeNaissanceRules.ts`
- [ ] Feature file: NEEDS CREATION
- [ ] Machine: NEEDS CREATION
- **Impact**: €1,000 one-time per birth for ~100,000 births/year
- **Complexity**: LOW (simple eligibility check)
- **Key Test Cases**:
  - First child born → €1,000 (or region-specific)
  - Second child born → €1,000 (different amount?)
  - Third+ child → €1,000 (or progressive)
  - Mother receives family allowance → eligible

### 16. Congé Parental (Parental Leave)
- [⚠] Rule file: `/home/user/PAA/src/regles-eligibilite/congeParentalRules.ts`
- [ ] Feature file: NEEDS CREATION
- [🔄] Machine: `/home/user/PAA/src/processus-administratifs/family/congeParentalMachine.ts`
- **Impact**: €700-€800/month × 12-24 months per parent
- **Complexity**: MEDIUM (flexible arrangements, both parents)
- **Key Test Cases**:
  - Full-time employee with newborn → eligible
  - Part-time employee with newborn → eligible
  - Flexible: 1/5 reduction, 1/4 reduction, 1/3 reduction, 1/2 reduction
  - Duration: 12 months (partial-time) to 24 months (full break)
  - Both parents can take (not simultaneous)

### 17. Maladie Professionnelle (Occupational Diseases)
- [⚠] Rule file: `/home/user/PAA/src/regles-eligibilite/maladieProfessionnelleRules.ts`
- [ ] Feature file: NEEDS CREATION
- [🔄] Machine: `/home/user/PAA/src/processus-administratifs/health/maladieProfessionnelleMachine.ts`
- **Impact**: €1,000-€2,000/month for recognized diseases
- **Complexity**: HIGH (disease list validation, exposure proof, medical eval)
- **Key Test Cases**:
  - Asbestos exposure → listed disease → eligible
  - Silicosis from mining → listed disease → eligible
  - Depression from work stress → NOT on list → NOT eligible
  - 20 years exposure to recognized hazard → disease develops → eligible

### 18. Crédit Temps (Time Credit)
- [⚠] Rule file: `/home/user/PAA/src/regles-eligibilite/creditTempsRules.ts`
- [ ] Feature file: NEEDS CREATION
- [ ] Machine: NEEDS CREATION
- **Impact**: €748/month max for ~50,000 beneficiaries
- **Complexity**: MEDIUM (multiple time reduction options, reasons)
- **Key Test Cases**:
  - 24+ months employed, full-time → eligible
  - 23 months employed → NOT eligible (need 24)
  - Reduction 1/5 (1 day/week) → small benefit
  - Reduction 1/2 (2-3 days/week) → larger benefit
  - Reason: parenting, training, caregiving, social/cultural
  - Duration varies by reason: 12, 36, 60 months

### 13. Chèques Repas (Meal Vouchers)
- [⚠] Rule file: `/home/user/PAA/src/regles-eligibilite/chequesRepasRules.ts`
- [ ] Feature file: NEEDS CREATION
- [🔄] Machine: `/home/user/PAA/src/processus-administratifs/chequesRepasMachine.ts`
- **Impact**: €100-€175/month for ~2.5M workers
- **Complexity**: LOW-MEDIUM (mostly employer decision)
- **Key Test Cases**:
  - Employee 1+ month employed → eligible for meals vouchers
  - Management excluded (depends on employer)
  - Value per voucher: €5-8.75
  - Employer + employee split contribution
  - Tax exemption verification

---

## LOWER PRIORITY (Phase 4+)

### 15. Aide aux Personnes Âgées (Elderly Assistance)
- [⚠] Rule file: `/home/user/PAA/src/regles-eligibilite/aidePersonnesAgeesRules.ts`
- [ ] Feature file: NEEDS CREATION
- **Impact**: Services (care, meals) for ~400,000 elderly
- **Complexity**: MEDIUM (service type varies, home assessment)

### 19. Aide Alimentaire (Food Assistance)
- [⚠] Rule file: `/home/user/PAA/src/regles-eligibilite/aideAlimentaireRules.ts`
- [ ] Feature file: NEEDS CREATION
- [🔄] Machine: `/home/user/PAA/src/processus-administratifs/aideAlimentaireMachine.ts`
- **Impact**: Emergency assistance for ~50,000 people/year
- **Complexity**: LOW (income verification only)

### 20. Écochèque (Eco-Cheque)
- [⚠] Rule file: `/home/user/PAA/src/regles-eligibilite/ecoChequeRules.ts`
- [ ] Feature file: NEEDS CREATION
- [🔄] Machine: `/home/user/PAA/src/processus-administratifs/ecoChequeMachine.ts`
- **Impact**: €250/year for eligible employees
- **Complexity**: LOW (employer discretion mostly)

---

## SPECIAL CASES (Require investigation)

### Transporteurs Scolaire (School Transport)
- Need to check if exists in rules
- Low complexity but serves ~500,000 students

### Abonnement Social Transport (Social Transit Pass)
- [⚠] Rule file: `/home/user/PAA/src/regles-eligibilite/abonnementSocialTransportRules.ts`
- Need feature file
- Income-based subsidized public transit pass

### Carte Médicale (Medical Card)
- [⚠] Rule file: `/home/user/PAA/src/regles-eligibilite/carteMedicaleRules.ts`
- Low complexity if income-based
- Provides healthcare access

---

## IMPLEMENTATION EFFORT ESTIMATE

### Quick Wins (1-2 hours each)
- Prime de Naissance
- Chèques Repas
- Écochèque
- Aide Alimentaire

### Medium Effort (4-6 hours each)
- Aide aux Personnes Âgées
- Congé Parental
- Crédit Temps
- Aide au Logement
- GRAPA

### Complex (8-12 hours each)
- Allocations de Chômage (4 tiers system)
- Allocations Familiales (4 regions)
- Allocations d'Études (regions + income tiers)
- Congé Maternité (employed vs self-employed)
- Accident du Travail (wage tiers + disability)

### Very Complex (16+ hours each)
- Pension de Retraite (historical data, 45-year calc)
- Logement Social (regional systems, wait lists)
- Allocations Handicapées (ARR evaluation process)
- Maladie Professionnelle (disease list management)

---

## TESTING STRATEGY FOR FEATURES

Each feature file should include:
1. **Context**: Reference amounts, date constants, thresholds
2. **Basic Eligibility**: Happy path - person meets all criteria
3. **Ineligibility Scenarios**: Age too young, income too high, status invalid
4. **Boundary Cases**: Just above/below thresholds
5. **Calculation Tests**: Parametrized scenarios with amounts
6. **Regional Variations**: Where applicable
7. **Interaction Rules**: Cumul (allowed/forbidden with other benefits)
8. **Administrative Process**: Application flow, documentation, CPAS coordination

---

## COVERAGE GAPS ANALYSIS

### Missing Workflows (Have rules, no machines)
- Many benefits have rule files but NO XState machines
- Priority: Create machines for top 5 benefits (Chômage, Familiales, Handicapés, GRAPA, Logement)

### Incomplete Rule Files
- Some files have placeholder implementations (basic-conditions checks)
- Priority: Flesh out complex rules (AGR calculation, pension formula, disability categories)

### Missing Type Definitions
- Most benefits don't have dedicated domain types
- Create `[BenefitName]Types.ts` for complex benefits

### Missing Examples
- `src/examples/` directory has few examples
- Each featured benefit should have example usage script

### Legal Reference Deficiency
- Legal sources file partially complete (RIS, AGR, GRAPA defined)
- Add references for other 97 benefits to `belgianLegalSources.ts`

---

## VALIDATION REQUIREMENTS

Each Gherkin feature should validate:
1. **Legal Compliance**: Against official ONEM/SFP/SPF requirements
2. **Amount Accuracy**: 2024-2025 official thresholds
3. **Cumul Rules**: Which benefits can/cannot be combined
4. **Regional Rules**: Where administration is decentralized
5. **Temporal Rules**: Waiting periods, duration limits
6. **Documentation**: Official Belgian government sources referenced

