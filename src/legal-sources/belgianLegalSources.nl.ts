/**
 * Authentieke juridische referenties voor Belgische sociale uitkeringen
 * Officiële bronnen: ejustice.just.fgov.be en etaamb.openjustice.be
 *
 * NEDERLANDSE VERSIE / VERSIE NÉERLANDAISE
 */

import type { LegislationType, LegalReference, BenefitLegalFramework } from './belgianLegalSources';

/**
 * LEEFLOON - Revenu d'Intégration Sociale
 * Volledig juridisch kader
 */
export const RIS_LEGAL_FRAMEWORK_NL: BenefitLegalFramework = {
  benefitName: 'Leefloon (Revenu d\'Intégration Sociale)',

  primaryLegislation: {
    type: 'loi',
    title: 'Wet betreffende het recht op maatschappelijke integratie',
    date: '2002-05-26',
    publication: {
      date: '2002-07-31',
      reference: 'Belgisch Staatsblad 2002-07-31'
    },
    articles: ['3', '11', '14', '19', '22', '30'],
    officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=nl&la=N&cn=2002052647&table_name=wet',
    alternativeUrls: [
      'https://etaamb.openjustice.be/nl/wet-van-26-mei-2002_n2002022559.html'
    ],
    lastAmended: '2024',
    authority: 'Federale Overheidsdienst Sociale Zekerheid'
  },

  implementingLegislation: [
    {
      type: 'arrete_royal',
      title: 'Koninklijk besluit houdende algemeen reglement betreffende het recht op maatschappelijke integratie',
      date: '2002-07-11',
      publication: {
        date: '2002-07-31',
        reference: 'Belgisch Staatsblad 2002-07-31'
      },
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=nl&la=N&table_name=wet&cn=2002071138',
      alternativeUrls: [
        'https://etaamb.openjustice.be/nl/koninklijk-besluit-van-11-juli-2002_n2002022564.html'
      ],
      authority: 'Federale Overheidsdienst Sociale Zekerheid'
    }
  ],

  notes: [
    'Deze wet verving de wet van 7 augustus 1974 tot instelling van het bestaansminimum (minimex)',
    'De bedragen worden jaarlijks geïndexeerd volgens de wet van 2 augustus 1971',
    'Het leefloon wordt beheerd door de Openbare Centra voor Maatschappelijk Welzijn (OCMW)'
  ]
};

/**
 * Belangrijkste artikelen van de leefloonwet
 */
export const RIS_KEY_ARTICLES_NL = {
  'Artikel 3': {
    title: 'Voorwaarden voor het verkrijgen van het recht op maatschappelijke integratie',
    content: 'Cumulatieve voorwaarden',
    conditions: [
      'Werkelijk verblijf in België',
      'Meerderjarigheid (18 jaar) of gelijkstelling met meerderjarige persoon',
      'Belgische nationaliteit OF Europees inwonerstatuut (na 3 maanden) OF inschrijving in vreemdelingenregister OF staatloze OF vluchteling OF subsidiaire bescherming',
      'Ontbreken van toereikende bestaansmiddelen',
      'Bereidheid om te werken (behalve om gezondheidsredenen of billijkheidsredenen)',
      'Uitputting van Belgische en buitenlandse sociale rechten'
    ]
  },

  'Artikel 14': {
    title: 'Bedragen van het leefloon',
    paragraph1: {
      title: 'Categorieën en basisbedragen (2002)',
      categories: {
        cohabitant: {
          amount: 4400,
          currency: 'EUR',
          description: 'Personen die onder hetzelfde dak wonen en hoofdzakelijk hun huishoudelijke aangelegenheden gemeenschappelijk regelen'
        },
        isolated: {
          amount: 6600,
          currency: 'EUR',
          description: 'Persoon zonder samenwonenden, inclusief daklozen met een geïndividualiseerd project'
        },
        familyCharge: {
          amount: 8800,
          currency: 'EUR',
          description: 'Ten minste één ongehuwde minderjarig kind, of echtgenoot/levenspartner met zo\'n kind'
        }
      },
      indexation: 'Bedragen jaarlijks geïndexeerd volgens de wet van 2 augustus 1971'
    }
  },

  'Artikel 11': {
    title: 'Geïndividualiseerd Project voor Maatschappelijke Integratie (GPMI)',
    requirements: [
      'Schriftelijk contract gesloten tussen begunstigde en OCMW',
      'Moet een rechtvaardige evenredigheid respecteren tussen geformuleerde eisen en verleende hulp',
      'Verplicht in bepaalde door de wet gedefinieerde gevallen'
    ]
  },

  'Artikel 19': {
    title: 'Samenwerkingsverplichtingen',
    content: 'De aanvrager moet alle nodige inlichtingen en machtigingen verstrekken voor het onderzoek van zijn recht'
  },

  'Artikel 22': {
    title: 'Aangifteverplichtingen',
    content: 'Onmiddellijke aangifte van elke wijziging van de situatie die het recht op maatschappelijke integratie kan beïnvloeden'
  },

  'Artikel 30': {
    title: 'Sancties voor niet-naleving van verplichtingen',
    sanctions: {
      omissionDeclaration: {
        duration: '6 maanden maximum (12 maanden bij fraude)',
        condition: 'Verzuim aangifte bestaansmiddelen'
      },
      nonRespectPIIS: {
        duration: '1 maand maximum (3 maanden bij herhaling)',
        condition: 'Niet-naleving van GPMI'
      }
    }
  }
};

/**
 * Leefloonbedragen 2024
 */
export const RIS_AMOUNTS_2024_NL = {
  cohabitant: {
    monthly: 713.66,
    annual: 8563.92,
    category: 'Samenwonende persoon'
  },
  isolated: {
    monthly: 1070.49,
    annual: 12845.88,
    category: 'Alleenstaande persoon'
  },
  familyCharge: {
    monthly: 1450.52,
    annual: 17406.24,
    category: 'Persoon met gezinslast'
  },
  workIncomeExemption: {
    monthly: 252.00,
    description: 'Vrijstelling voor arbeidsinkomsten (ongeveer 63% van het beroepsinkomen)',
    legalBasis: 'Artikel 17 van het koninklijk besluit van 11 juli 2002'
  },
  patrimonyLimits: {
    movable: {
      amount: 6200,
      description: 'Maximum roerend vermogen (spaargeld, effecten)'
    },
    immovable: {
      amount: 12500,
      description: 'Maximum bewoond onroerend vermogen (kadastraal inkomen)'
    }
  },
  indexationDate: '2024-01-01',
  source: 'FOD Sociale Zekerheid - Indexering volgens wet van 2 augustus 1971'
};

/**
 * IGU - Inkomensgarantie-uitkering (Allocation de Garantie de Revenus)
 * Volledig juridisch kader
 */
export const AGR_LEGAL_FRAMEWORK_NL: BenefitLegalFramework = {
  benefitName: 'Inkomensgarantie-uitkering (IGU / Allocation de Garantie de Revenus)',

  primaryLegislation: {
    type: 'arrete_royal',
    title: 'Koninklijk besluit houdende reglementering van de werkloosheid',
    date: '1991-11-25',
    officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=nl&la=N&cn=1991112550&table_name=wet',
    alternativeUrls: [
      'https://etaamb.openjustice.be/nl/koninklijk-besluit-van-25-november-1991_n2019012364'
    ],
    articles: ['28', '29', '33', '131bis'],
    lastAmended: '2024-09',
    authority: 'Rijksdienst voor Arbeidsvoorziening (RVA)'
  },

  notes: [
    'De IGU is een uitkering betaald door de RVA als aanvulling op een deeltijds loon',
    'De IGU waarborgt dat het totaal (loon + uitkering) minstens gelijk is aan de werkloosheidsuitkeringen',
    'Besluit meermaals gewijzigd sinds 1991 om zich aan te passen aan de evoluties van de arbeidsmarkt',
    'Nieuwe berekeningsregeling ingevoerd op 01.07.2005'
  ]
};

/**
 * Belangrijkste artikelen van het werkloosheidsbesluit (IGU)
 */
export const AGR_KEY_ARTICLES_NL = {
  'Artikel 28': {
    title: 'Werknemers gelijkgesteld met voltijdse werknemers',
    content: 'Definieert de gelijkgestelde werknemers op basis van loondrempels'
  },

  'Artikel 29': {
    title: 'Deeltijdse werknemer met behoud van rechten (DWBR)',
    content: 'Definieert de voorwaarden voor deeltijdse werknemers met behoud van werkloosheidsrechten'
  },

  'Artikel 33': {
    title: 'Toelating van vrijwillige deeltijdse werknemers',
    content: 'Stelt de voorwaarden vast voor vrijwillige deeltijdse werknemers'
  },

  'Artikel 131bis': {
    title: 'Inkomensgarantie-uitkering',
    content: 'Berekeningsformule en toekenningsvoorwaarden van de IGU',
    formula: 'IGU = Referentieuitkering + Maandelijks uursupplement − Nettobezoldiging'
  }
};

/**
 * IGU voorwaarden en berekeningen 2025
 */
export const AGR_CONDITIONS_2025_NL = {
  salaryThreshold: {
    grossMonthly: 2111.89,
    currency: 'EUR',
    description: 'Maximale brutobezoldiging per maand om in aanmerking te komen'
  },

  workingTimeLimit: {
    fraction: 4/5,
    description: 'De arbeidsduur mag niet meer dan 4/5 van een voltijdse betrekking bedragen'
  },

  calculation: {
    formula: 'IGU = Referentieuitkering + Maandelijks uursupplement − Nettobezoldiging',

    referenceAllowance: {
      calculation: '26 × theoretische netto daguitkering (volledige werkloosheid)',
      description: 'Bedrag dat de werknemer bij volledige werkloosheid zou ontvangen'
    },

    hourlySupplement: {
      formula: '(Gewerkte uren − Drempel 1/3 tijd) × 4,02 EUR',
      threshold: {
        hours: 55,
        description: 'Uren per maand voor een regime van 38u/week (1/3 voltijds)'
      },
      rate: 4.02,
      currency: 'EUR'
    },

    netSalary: {
      calculation: 'Bruto bezoldiging − RSZ-bijdragen (13,07%) + RSZ-bonus − Bedrijfsvoorheffing',
      onssRate: 0.1307
    }
  },

  minimumAmount: {
    amount: 14.35,
    currency: 'EUR',
    description: 'Minimumbedrag van de IGU, daaronder is de uitkering nul'
  },

  maximumAmount: {
    description: 'Mag niet meer bedragen dan (fictieve nettobezoldiging voltijds − nettobezoldiging deeltijds)'
  },

  registration: {
    forms: ['C131A', 'C3'],
    deadline: '2 maanden',
    authority: 'Uitbetalingsinstelling + Gewestelijke dienst voor arbeidsbemiddeling'
  },

  exclusions: [
    'Geen IGU als inkomsten van vorige werkgever blijven bestaan',
    'Onvrijwillige overgang voltijds → deeltijds: wachttijd van 3 maanden',
    'Vrijwillige overgang voltijds → deeltijds: geen IGU (behalve herstructurering)'
  ],

  lastUpdate: '2025-02-01',
  source: 'RVA - Rijksdienst voor Arbeidsvoorziening'
};

/**
 * GRAPA - Inkomensgarantie voor Ouderen
 * Volledig juridisch kader
 */
export const GRAPA_LEGAL_FRAMEWORK_NL: BenefitLegalFramework = {
  benefitName: 'Inkomensgarantie voor Ouderen (IGO / GRAPA)',

  primaryLegislation: {
    type: 'loi',
    title: 'Wet tot instelling van de inkomensgarantie voor ouderen',
    date: '1969-05-22',
    officialUrl: 'https://www.ejustice.just.fgov.be',
    authority: 'Federale Pensioendienst (FPD)'
  },

  notes: [
    'De IGO is geen pensioen maar een bijstandsregeling',
    'Valt niet onder de sociale zekerheid',
    'Toegekend na onderzoek van bestaansmiddelen en pensioenen',
    'Bedragen regelmatig geïndexeerd'
  ]
};

/**
 * GRAPA bedragen 2024
 */
export const GRAPA_AMOUNTS_2024_NL = {
  baseAmountAnnual: {
    amount: 7303.10,
    currency: 'EUR',
    effectiveDate: '2024-01-01',
    description: 'Jaarlijks basisbedrag'
  },
  monthlyAmounts: {
    isolated: {
      amount: 1549.42,
      currency: 'EUR',
      effectiveDate: '2024-05-01',
      category: 'Alleenstaande persoon (verhoogd geïndexeerd bedrag)'
    },
    cohabitant: {
      amount: 1032.95,
      currency: 'EUR',
      effectiveDate: '2024-05-01',
      category: 'Samenwonende persoon (basis geïndexeerd bedrag)'
    }
  },
  conditions: {
    age: {
      minimum: 65,
      description: 'Wettelijke pensioenleeftijd'
    },
    resourcesTest: {
      required: true,
      description: 'Onderzoek van bestaansmiddelen en pensioenen'
    },
    residency: {
      description: 'Werkelijk verblijf in België'
    }
  },
  source: 'Federale Pensioendienst - Verzamelwerk IGO september 2024',
  officialDocument: 'https://www.sfpd.fgov.be/files/3286/receuil-grapa-septembre-2024.pdf'
};

/**
 * Vertaling mapping
 */
export const LEGAL_MAPPING_NL = {
  LEEFLOON: {
    framework: RIS_LEGAL_FRAMEWORK_NL,
    articles: RIS_KEY_ARTICLES_NL,
    amounts: RIS_AMOUNTS_2024_NL
  },
  IGU: {
    framework: AGR_LEGAL_FRAMEWORK_NL,
    articles: AGR_KEY_ARTICLES_NL,
    conditions: AGR_CONDITIONS_2025_NL
  },
  IGO: {
    framework: GRAPA_LEGAL_FRAMEWORK_NL,
    amounts: GRAPA_AMOUNTS_2024_NL
  }
};

/**
 * Officiële URLs voor raadpleging van wetteksten
 */
export const OFFICIAL_LEGAL_DATABASES_NL = {
  ejustice: {
    name: 'Justel - Belgische juridische databank',
    url: 'https://www.ejustice.just.fgov.be',
    description: 'Officiële databank van de Federale Overheidsdienst Justitie'
  },
  etaamb: {
    name: 'etaamb - Open Justice Belgium',
    url: 'https://etaamb.openjustice.be',
    description: 'Open data platform van de akten gepubliceerd in het Belgisch Staatsblad'
  },
  rva: {
    name: 'RVA - Rijksdienst voor Arbeidsvoorziening',
    url: 'https://www.rva.be',
    description: 'Officiële informatie over werkloosheidsuitkeringen en IGU'
  },
  fodSocialeZekerheid: {
    name: 'FOD Sociale Zekerheid',
    url: 'https://socialsecurity.belgium.be',
    description: 'Federale Overheidsdienst Sociale Zekerheid'
  }
};
