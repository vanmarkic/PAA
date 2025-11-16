/**
 * Tests unitaires pour les références juridiques
 *
 * Ces tests vérifient :
 * - La présence de toutes les références juridiques obligatoires
 * - La validité des URLs
 * - La cohérence des dates
 * - La complétude des informations
 */

import { describe, it, expect } from '@jest/globals';
import {
  RIS_LEGAL_FRAMEWORK,
  RIS_KEY_ARTICLES,
  RIS_AMOUNTS_2024,
  AGR_LEGAL_FRAMEWORK,
  AGR_KEY_ARTICLES,
  AGR_CONDITIONS_2025,
  FAMILY_ALLOWANCES_LEGAL_FRAMEWORK,
  FAMILY_ALLOWANCES_AMOUNTS_2024,
  GRAPA_LEGAL_FRAMEWORK,
  GRAPA_AMOUNTS_2024,
  RENT_ALLOWANCE_LEGAL_FRAMEWORK,
  LEGAL_MAPPING,
  OFFICIAL_LEGAL_DATABASES,
  type LegalReference,
  type BenefitLegalFramework
} from '../belgianLegalSources';

describe('Legal Sources - Structure Tests', () => {

  describe('RIS - Revenu d\'Intégration Sociale', () => {
    it('should have complete legal framework', () => {
      expect(RIS_LEGAL_FRAMEWORK).toBeDefined();
      expect(RIS_LEGAL_FRAMEWORK.benefitName).toBe('Revenu d\'Intégration Sociale (RIS)');
      expect(RIS_LEGAL_FRAMEWORK.primaryLegislation).toBeDefined();
    });

    it('should have valid primary legislation', () => {
      const primaryLeg = RIS_LEGAL_FRAMEWORK.primaryLegislation;

      expect(primaryLeg.type).toBe('loi');
      expect(primaryLeg.title).toContain('droit à l\'intégration sociale');
      expect(primaryLeg.date).toBe('2002-05-26');
      expect(primaryLeg.authority).toBe('Service Public Fédéral Sécurité Sociale');
      expect(primaryLeg.officialUrl).toMatch(/ejustice\.just\.fgov\.be/);
    });

    it('should have key articles defined', () => {
      expect(RIS_KEY_ARTICLES).toBeDefined();
      expect(RIS_KEY_ARTICLES['Article 3']).toBeDefined();
      expect(RIS_KEY_ARTICLES['Article 11']).toBeDefined();
      expect(RIS_KEY_ARTICLES['Article 14']).toBeDefined();
      expect(RIS_KEY_ARTICLES['Article 22']).toBeDefined();
      expect(RIS_KEY_ARTICLES['Article 30']).toBeDefined();
    });

    it('should have Article 3 conditions', () => {
      const art3 = RIS_KEY_ARTICLES['Article 3'];
      expect(art3.conditions).toBeDefined();
      expect(Array.isArray(art3.conditions)).toBe(true);
      expect(art3.conditions.length).toBeGreaterThan(0);
    });

    it('should have Article 14 categories and amounts', () => {
      const art14 = RIS_KEY_ARTICLES['Article 14'];
      expect(art14.paragraph1).toBeDefined();
      expect(art14.paragraph1.categories).toBeDefined();
      expect(art14.paragraph1.categories.cohabitant).toBeDefined();
      expect(art14.paragraph1.categories.isolated).toBeDefined();
      expect(art14.paragraph1.categories.familyCharge).toBeDefined();
    });

    it('should have 2024 amounts', () => {
      expect(RIS_AMOUNTS_2024).toBeDefined();
      expect(RIS_AMOUNTS_2024.cohabitant.monthly).toBe(713.66);
      expect(RIS_AMOUNTS_2024.isolated.monthly).toBe(1070.49);
      expect(RIS_AMOUNTS_2024.familyCharge.monthly).toBe(1450.52);
    });

    it('should have work income exemption', () => {
      expect(RIS_AMOUNTS_2024.workIncomeExemption.monthly).toBe(252.00);
    });

    it('should have patrimony limits', () => {
      expect(RIS_AMOUNTS_2024.patrimonyLimits).toBeDefined();
      expect(RIS_AMOUNTS_2024.patrimonyLimits.movable.amount).toBe(6200);
      expect(RIS_AMOUNTS_2024.patrimonyLimits.immovable.amount).toBe(12500);
    });
  });

  describe('AGR - Allocation de Garantie de Revenus', () => {
    it('should have complete legal framework', () => {
      expect(AGR_LEGAL_FRAMEWORK).toBeDefined();
      expect(AGR_LEGAL_FRAMEWORK.benefitName).toBe('Allocation de Garantie de Revenus (AGR)');
      expect(AGR_LEGAL_FRAMEWORK.primaryLegislation).toBeDefined();
    });

    it('should have valid primary legislation', () => {
      const primaryLeg = AGR_LEGAL_FRAMEWORK.primaryLegislation;

      expect(primaryLeg.type).toBe('arrete_royal');
      expect(primaryLeg.title).toContain('réglementation du chômage');
      expect(primaryLeg.date).toBe('1991-11-25');
      expect(primaryLeg.authority).toBe('Office National de l\'Emploi (ONEM)');
      expect(primaryLeg.officialUrl).toMatch(/ejustice\.just\.fgov\.be/);
    });

    it('should have key articles defined', () => {
      expect(AGR_KEY_ARTICLES).toBeDefined();
      expect(AGR_KEY_ARTICLES['Article 28']).toBeDefined();
      expect(AGR_KEY_ARTICLES['Article 29']).toBeDefined();
      expect(AGR_KEY_ARTICLES['Article 33']).toBeDefined();
      expect(AGR_KEY_ARTICLES['Article 131bis']).toBeDefined();
    });

    it('should have Article 131bis with formula', () => {
      const art131bis = AGR_KEY_ARTICLES['Article 131bis'];
      expect(art131bis.formula).toBeDefined();
      expect(art131bis.formula).toContain('AGR =');
    });

    it('should have 2025 conditions', () => {
      expect(AGR_CONDITIONS_2025).toBeDefined();
      expect(AGR_CONDITIONS_2025.salaryThreshold.grossMonthly).toBe(2111.89);
      expect(AGR_CONDITIONS_2025.workingTimeLimit.fraction).toBe(4/5);
      expect(AGR_CONDITIONS_2025.minimumAmount.amount).toBe(14.35);
    });

    it('should have calculation formula components', () => {
      expect(AGR_CONDITIONS_2025.calculation).toBeDefined();
      expect(AGR_CONDITIONS_2025.calculation.formula).toBeDefined();
      expect(AGR_CONDITIONS_2025.calculation.referenceAllowance).toBeDefined();
      expect(AGR_CONDITIONS_2025.calculation.hourlySupplement).toBeDefined();
      expect(AGR_CONDITIONS_2025.calculation.netSalary).toBeDefined();
    });

    it('should have registration information', () => {
      expect(AGR_CONDITIONS_2025.registration).toBeDefined();
      expect(AGR_CONDITIONS_2025.registration.forms).toContain('C131A');
      expect(AGR_CONDITIONS_2025.registration.forms).toContain('C3');
    });
  });

  describe('FAMILY_ALLOWANCES - Allocations Familiales', () => {
    it('should have complete legal framework', () => {
      expect(FAMILY_ALLOWANCES_LEGAL_FRAMEWORK).toBeDefined();
      expect(FAMILY_ALLOWANCES_LEGAL_FRAMEWORK.benefitName).toContain('Allocations Familiales');
      expect(FAMILY_ALLOWANCES_LEGAL_FRAMEWORK.primaryLegislation).toBeDefined();
    });

    it('should have valid primary legislation (ordonnance)', () => {
      const primaryLeg = FAMILY_ALLOWANCES_LEGAL_FRAMEWORK.primaryLegislation;

      expect(primaryLeg.type).toBe('ordonnance');
      expect(primaryLeg.title).toContain('prestations familiales');
      expect(primaryLeg.date).toBe('2019-04-25');
      expect(primaryLeg.authority).toContain('Bruxelles-Capitale');
    });

    it('should have 2024 amounts', () => {
      expect(FAMILY_ALLOWANCES_AMOUNTS_2024).toBeDefined();
      expect(FAMILY_ALLOWANCES_AMOUNTS_2024.birthAllowance).toBeDefined();
      expect(FAMILY_ALLOWANCES_AMOUNTS_2024.birthAllowance.firstChild).toBe(1367.74);
      expect(FAMILY_ALLOWANCES_AMOUNTS_2024.birthAllowance.otherChildren).toBe(621.70);
    });

    it('should have monthly allowances by age', () => {
      const monthly = FAMILY_ALLOWANCES_AMOUNTS_2024.monthlyAllowances;
      expect(monthly.age0to11).toBeDefined();
      expect(monthly.age12to17).toBeDefined();
      expect(monthly.age18to24NoHigherEd).toBeDefined();
      expect(monthly.age18to24HigherEd).toBeDefined();
    });

    it('should have supplements defined', () => {
      const supplements = FAMILY_ALLOWANCES_AMOUNTS_2024.supplements;
      expect(supplements.ageSupplement).toBeDefined();
      expect(supplements.socialSupplement).toBeDefined();
      expect(supplements.orphanSupplement).toBeDefined();
      expect(supplements.disabilitySupplement).toBeDefined();
    });
  });

  describe('GRAPA - Garantie de Revenus aux Personnes Âgées', () => {
    it('should have complete legal framework', () => {
      expect(GRAPA_LEGAL_FRAMEWORK).toBeDefined();
      expect(GRAPA_LEGAL_FRAMEWORK.benefitName).toContain('GRAPA');
      expect(GRAPA_LEGAL_FRAMEWORK.primaryLegislation).toBeDefined();
    });

    it('should have valid primary legislation', () => {
      const primaryLeg = GRAPA_LEGAL_FRAMEWORK.primaryLegislation;

      expect(primaryLeg.type).toBe('loi');
      expect(primaryLeg.title).toContain('garantie de revenus aux personnes âgées');
      expect(primaryLeg.date).toBe('1969-05-22');
      expect(primaryLeg.authority).toContain('Pensions');
    });

    it('should have 2024 amounts', () => {
      expect(GRAPA_AMOUNTS_2024).toBeDefined();
      expect(GRAPA_AMOUNTS_2024.baseAmountAnnual.amount).toBe(7303.10);
      expect(GRAPA_AMOUNTS_2024.monthlyAmounts.isolated.amount).toBe(1549.42);
      expect(GRAPA_AMOUNTS_2024.monthlyAmounts.cohabitant.amount).toBe(1032.95);
    });

    it('should have conditions', () => {
      expect(GRAPA_AMOUNTS_2024.conditions).toBeDefined();
      expect(GRAPA_AMOUNTS_2024.conditions.age.minimum).toBe(65);
      expect(GRAPA_AMOUNTS_2024.conditions.resourcesTest.required).toBe(true);
    });
  });

  describe('RENT_ALLOWANCE - Allocation de Loyer', () => {
    it('should have complete legal framework', () => {
      expect(RENT_ALLOWANCE_LEGAL_FRAMEWORK).toBeDefined();
      expect(RENT_ALLOWANCE_LEGAL_FRAMEWORK.benefitName).toContain('Allocation de Loyer');
      expect(RENT_ALLOWANCE_LEGAL_FRAMEWORK.primaryLegislation).toBeDefined();
    });

    it('should have valid primary legislation', () => {
      const primaryLeg = RENT_ALLOWANCE_LEGAL_FRAMEWORK.primaryLegislation;

      expect(primaryLeg.type).toBe('arrete_royal');
      expect(primaryLeg.title).toContain('allocation de loyer');
      expect(primaryLeg.date).toBe('2021-07-15');
      expect(primaryLeg.authority).toContain('Bruxelles-Capitale');
    });

    it('should have implementing legislation', () => {
      expect(RENT_ALLOWANCE_LEGAL_FRAMEWORK.implementingLegislation).toBeDefined();
      expect(Array.isArray(RENT_ALLOWANCE_LEGAL_FRAMEWORK.implementingLegislation)).toBe(true);
      expect(RENT_ALLOWANCE_LEGAL_FRAMEWORK.implementingLegislation!.length).toBeGreaterThan(0);
    });
  });

  describe('LEGAL_MAPPING', () => {
    it('should have all benefit types mapped', () => {
      expect(LEGAL_MAPPING.RIS).toBeDefined();
      expect(LEGAL_MAPPING.AGR).toBeDefined();
      expect(LEGAL_MAPPING.FAMILY_ALLOWANCES).toBeDefined();
      expect(LEGAL_MAPPING.GRAPA).toBeDefined();
      expect(LEGAL_MAPPING.RENT_ALLOWANCE).toBeDefined();
    });

    it('should have framework references', () => {
      expect(LEGAL_MAPPING.RIS.framework).toBe(RIS_LEGAL_FRAMEWORK);
      expect(LEGAL_MAPPING.AGR.framework).toBe(AGR_LEGAL_FRAMEWORK);
      expect(LEGAL_MAPPING.FAMILY_ALLOWANCES.framework).toBe(FAMILY_ALLOWANCES_LEGAL_FRAMEWORK);
      expect(LEGAL_MAPPING.GRAPA.framework).toBe(GRAPA_LEGAL_FRAMEWORK);
      expect(LEGAL_MAPPING.RENT_ALLOWANCE.framework).toBe(RENT_ALLOWANCE_LEGAL_FRAMEWORK);
    });
  });

  describe('OFFICIAL_LEGAL_DATABASES', () => {
    it('should have all official databases defined', () => {
      expect(OFFICIAL_LEGAL_DATABASES.ejustice).toBeDefined();
      expect(OFFICIAL_LEGAL_DATABASES.etaamb).toBeDefined();
      expect(OFFICIAL_LEGAL_DATABASES.onem).toBeDefined();
      expect(OFFICIAL_LEGAL_DATABASES.spfSecuriteSociale).toBeDefined();
    });

    it('should have valid URLs', () => {
      expect(OFFICIAL_LEGAL_DATABASES.ejustice.url).toMatch(/^https?:\/\//);
      expect(OFFICIAL_LEGAL_DATABASES.etaamb.url).toMatch(/^https?:\/\//);
      expect(OFFICIAL_LEGAL_DATABASES.onem.url).toMatch(/^https?:\/\//);
      expect(OFFICIAL_LEGAL_DATABASES.spfSecuriteSociale.url).toMatch(/^https?:\/\//);
    });
  });
});

describe('Legal Sources - URL Validation', () => {

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  it('should have valid RIS URLs', () => {
    expect(validateUrl(RIS_LEGAL_FRAMEWORK.primaryLegislation.officialUrl)).toBe(true);

    if (RIS_LEGAL_FRAMEWORK.primaryLegislation.alternativeUrls) {
      RIS_LEGAL_FRAMEWORK.primaryLegislation.alternativeUrls.forEach(url => {
        expect(validateUrl(url)).toBe(true);
      });
    }
  });

  it('should have valid AGR URLs', () => {
    expect(validateUrl(AGR_LEGAL_FRAMEWORK.primaryLegislation.officialUrl)).toBe(true);

    if (AGR_LEGAL_FRAMEWORK.primaryLegislation.alternativeUrls) {
      AGR_LEGAL_FRAMEWORK.primaryLegislation.alternativeUrls.forEach(url => {
        expect(validateUrl(url)).toBe(true);
      });
    }
  });

  it('should have valid GRAPA document URL', () => {
    if (GRAPA_AMOUNTS_2024.officialDocument) {
      expect(validateUrl(GRAPA_AMOUNTS_2024.officialDocument)).toBe(true);
    }
  });
});

describe('Legal Sources - Date Validation', () => {

  const isValidISODate = (dateString: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  it('should have valid ISO dates for RIS', () => {
    expect(isValidISODate(RIS_LEGAL_FRAMEWORK.primaryLegislation.date)).toBe(true);

    if (RIS_LEGAL_FRAMEWORK.implementingLegislation) {
      RIS_LEGAL_FRAMEWORK.implementingLegislation.forEach(leg => {
        expect(isValidISODate(leg.date)).toBe(true);
      });
    }
  });

  it('should have valid ISO dates for AGR', () => {
    expect(isValidISODate(AGR_LEGAL_FRAMEWORK.primaryLegislation.date)).toBe(true);
  });

  it('should have valid ISO dates for Family Allowances', () => {
    expect(isValidISODate(FAMILY_ALLOWANCES_LEGAL_FRAMEWORK.primaryLegislation.date)).toBe(true);
  });

  it('should have valid ISO dates for GRAPA', () => {
    expect(isValidISODate(GRAPA_LEGAL_FRAMEWORK.primaryLegislation.date)).toBe(true);
  });
});

describe('Legal Sources - Completeness Tests', () => {

  const checkLegalReferenceCompleteness = (ref: LegalReference): void => {
    expect(ref.type).toBeDefined();
    expect(ref.title).toBeDefined();
    expect(ref.title.length).toBeGreaterThan(10);
    expect(ref.date).toBeDefined();
    expect(ref.officialUrl).toBeDefined();
    expect(ref.authority).toBeDefined();
    expect(ref.authority.length).toBeGreaterThan(3);
  };

  it('RIS primary legislation should be complete', () => {
    checkLegalReferenceCompleteness(RIS_LEGAL_FRAMEWORK.primaryLegislation);
  });

  it('AGR primary legislation should be complete', () => {
    checkLegalReferenceCompleteness(AGR_LEGAL_FRAMEWORK.primaryLegislation);
  });

  it('Family Allowances primary legislation should be complete', () => {
    checkLegalReferenceCompleteness(FAMILY_ALLOWANCES_LEGAL_FRAMEWORK.primaryLegislation);
  });

  it('GRAPA primary legislation should be complete', () => {
    checkLegalReferenceCompleteness(GRAPA_LEGAL_FRAMEWORK.primaryLegislation);
  });

  it('Rent Allowance primary legislation should be complete', () => {
    checkLegalReferenceCompleteness(RENT_ALLOWANCE_LEGAL_FRAMEWORK.primaryLegislation);
  });
});
