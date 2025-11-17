/**
 * Belgian Intellectual Property Legal Sources
 *
 * Comprehensive legal framework for intellectual property rights in Belgium
 */

export const BELGIAN_IP_LEGAL_FRAMEWORK = {
  // PATENTS
  patents: {
    primaryLegislation: {
      title: 'Loi du 28 mars 1984 sur les brevets d\'invention',
      date: '1984-03-28',
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1984032830&table_name=loi',
      lastAmended: '2020-12-20',
      scope: 'Brevets belges nationaux',
    },
    europeanConvention: {
      title: 'Convention sur le brevet européen (CBE)',
      date: '1973-10-05',
      officialUrl: 'https://www.epo.org/law-practice/legal-texts/epc_fr.html',
      lastRevised: '2000-11-29',
      scope: 'Brevets européens avec effet en Belgique',
    },
    pctTreaty: {
      title: 'Traité de coopération en matière de brevets (PCT)',
      date: '1970-06-19',
      officialUrl: 'https://www.wipo.int/pct/fr/',
      scope: 'Procédure internationale de dépôt',
    },
    implementingDecrees: [
      {
        title: 'Arrêté royal du 2 décembre 1986 relatif à la demande, à la délivrance et au maintien en vigueur des brevets d\'invention',
        date: '1986-12-02',
        officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1986120249&table_name=loi',
      },
      {
        title: 'Arrêté royal du 18 décembre 1986 relatif aux taxes et taxes supplémentaires dues en matière de brevets d\'invention',
        date: '1986-12-18',
        officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1986121837&table_name=loi',
      },
    ],
  },

  // TRADEMARKS
  trademarks: {
    beneluxConvention: {
      title: 'Convention Benelux en matière de propriété intellectuelle (marques et dessins ou modèles)',
      date: '2005-02-25',
      officialUrl: 'https://www.boip.int/fr/convention-benelux',
      lastAmended: '2013-01-01',
      scope: 'Protection unitaire Belgique, Pays-Bas, Luxembourg',
      authority: 'BOIP - Office Benelux de la Propriété intellectuelle',
    },
    euRegulation: {
      title: 'Règlement (UE) 2017/1001 sur la marque de l\'Union européenne',
      date: '2017-06-14',
      officialUrl: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32017R1001',
      scope: 'Protection dans tous les États membres UE',
      authority: 'EUIPO - Office de l\'Union européenne pour la propriété intellectuelle',
    },
    madridProtocol: {
      title: 'Protocole relatif à l\'Arrangement de Madrid concernant l\'enregistrement international des marques',
      date: '1989-06-27',
      officialUrl: 'https://www.wipo.int/madrid/fr/',
      scope: 'Système international d\'enregistrement',
      countries: 128,
    },
    niceAgreement: {
      title: 'Arrangement de Nice concernant la classification internationale des produits et des services',
      date: '1957-06-15',
      currentVersion: 'NCL(12-2023)',
      officialUrl: 'https://www.wipo.int/classifications/nice/fr/',
    },
  },

  // COPYRIGHT AND RELATED RIGHTS
  copyright: {
    economicCode: {
      title: 'Code de droit économique - Livre XI, Titre 5: Droit d\'auteur et droits voisins',
      consolidatedDate: '2013-02-28',
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2013022819&table_name=loi',
      articles: 'XI.164 à XI.293',
    },
    originalLaw: {
      title: 'Loi du 30 juin 1994 relative au droit d\'auteur et aux droits voisins',
      date: '1994-06-30',
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1994063035&table_name=loi',
      note: 'Largement intégrée dans le Code de droit économique',
    },
    euDirectives: [
      {
        title: 'Directive 2019/790 sur le droit d\'auteur dans le marché unique numérique',
        date: '2019-04-17',
        officialUrl: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32019L0790',
        transpositionDeadline: '2021-06-07',
      },
      {
        title: 'Directive 2001/29/CE sur l\'harmonisation du droit d\'auteur',
        date: '2001-05-22',
        officialUrl: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32001L0029',
      },
    ],
    collectiveManagement: {
      title: 'Loi du 10 décembre 2009 relative au statut et au contrôle des sociétés de gestion',
      date: '2009-12-10',
      authority: 'Service de Contrôle des sociétés de gestion',
      societies: ['SABAM', 'SACD', 'SOFAM', 'Reprobel', 'Auvibel'],
    },
  },

  // DESIGNS
  designs: {
    beneluxConvention: {
      title: 'Convention Benelux en matière de propriété intellectuelle (dessins et modèles)',
      date: '2005-02-25',
      officialUrl: 'https://www.boip.int/fr/convention-benelux',
      scope: 'Protection unitaire Benelux',
    },
    euRegulation: {
      title: 'Règlement (CE) n° 6/2002 sur les dessins ou modèles communautaires',
      date: '2001-12-12',
      officialUrl: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32002R0006',
      protectionTypes: ['Enregistré (25 ans max)', 'Non enregistré (3 ans)'],
    },
    locarnoAgreement: {
      title: 'Arrangement de Locarno instituant une classification internationale pour les dessins et modèles industriels',
      date: '1968-10-08',
      currentVersion: 'LOC(14-2023)',
      officialUrl: 'https://www.wipo.int/classifications/locarno/fr/',
    },
    hagueeAgreement: {
      title: 'Arrangement de La Haye concernant l\'enregistrement international des dessins et modèles industriels',
      date: '1925-11-06',
      officialUrl: 'https://www.wipo.int/hague/fr/',
    },
  },

  // TRADE SECRETS
  tradeSecrets: {
    primaryLaw: {
      title: 'Loi du 30 juillet 2018 relative à la protection des secrets d\'affaires',
      date: '2018-07-30',
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2018073035&table_name=loi',
      transposesDirective: '2016/943/EU',
    },
    economicCode: {
      title: 'Code de droit économique - Livre XI, Chapitre 8: Secrets d\'affaires',
      articles: 'XI.332/1 à XI.332/11',
      addedDate: '2018-07-30',
    },
    remedies: [
      'Cessation',
      'Interdiction',
      'Rappel et destruction',
      'Dommages et intérêts',
      'Publication de la décision',
    ],
  },

  // PLANT VARIETIES
  plantVarieties: {
    nationalLaw: {
      title: 'Loi du 20 mai 1975 sur la protection des obtentions végétales',
      date: '1975-05-20',
      officialUrl: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1975052002&table_name=loi',
    },
    upovConvention: {
      title: 'Convention internationale pour la protection des obtentions végétales (UPOV)',
      date: '1961-12-02',
      currentAct: 'Acte de 1991',
      officialUrl: 'https://www.upov.int/upovlex/fr/upov_convention.html',
    },
    euRegulation: {
      title: 'Règlement (CE) n° 2100/94 instituant un régime de protection communautaire des obtentions végétales',
      date: '1994-07-27',
      officialUrl: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:31994R2100',
      authority: 'CPVO - Office communautaire des variétés végétales',
    },
  },

  // GEOGRAPHICAL INDICATIONS
  geographicalIndications: {
    euRegulations: [
      {
        title: 'Règlement (UE) n° 1151/2012 relatif aux systèmes de qualité applicables aux produits agricoles et aux denrées alimentaires',
        date: '2012-11-21',
        officialUrl: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32012R1151',
        types: ['AOP', 'IGP', 'STG'],
      },
      {
        title: 'Règlement (UE) 2019/787 concernant les indications géographiques des boissons spiritueuses',
        date: '2019-04-17',
        officialUrl: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32019R0787',
      },
    ],
    belgianProducts: [
      'Fromage de Herve AOP',
      'Beurre d\'Ardenne AOP',
      'Jambon d\'Ardenne IGP',
      'Pâté gaumais IGP',
      'Brussels grondwitloof IGP',
      'Vlaams-Brabantse tafeldruif AOC',
      'Genièvre/Jenever/Genever IG',
    ],
  },

  // DOMAIN NAMES
  domainNames: {
    beRegistry: {
      title: 'Conditions générales pour l\'enregistrement d\'un nom de domaine .be',
      authority: 'DNS Belgium',
      officialUrl: 'https://www.dnsbelgium.be/fr/documents/conditions-generales',
      disputeResolution: 'CEPANI - Centre belge d\'Arbitrage et de Médiation',
    },
    udrp: {
      title: 'Uniform Domain-Name Dispute-Resolution Policy',
      authority: 'ICANN',
      officialUrl: 'https://www.icann.org/resources/pages/help/dndr/udrp-en',
      providers: ['WIPO', 'NAF', 'ADNDRC', 'CAC'],
    },
  },

  // ENFORCEMENT
  enforcement: {
    civilProcedure: {
      court: 'Tribunal de l\'entreprise',
      competence: 'Tous litiges de propriété intellectuelle',
      divisions: ['Bruxelles', 'Anvers', 'Gand', 'Liège', 'Mons'],
      appeals: 'Cour d\'appel (chambres spécialisées)',
      cassation: 'Cour de cassation',
    },
    criminalProcedure: {
      law: 'Loi du 15 mai 2007 relative à la répression de la contrefaçon',
      penalties: {
        fines: '500 à 100.000 EUR',
        imprisonment: '3 mois à 3 ans',
        confiscation: 'Produits et instruments de contrefaçon',
      },
    },
    customsEnforcement: {
      regulation: 'Règlement (UE) n° 608/2013 concernant le contrôle douanier',
      authority: 'Administration générale des Douanes et Accises',
      procedure: 'Demande d\'intervention (AFA)',
      duration: '1 an renouvelable',
    },
    provisionalMeasures: [
      'Saisie-description',
      'Saisie-contrefaçon',
      'Cessation',
      'Astreinte',
      'Cautionnement',
    ],
  },

  // ADMINISTRATIVE BODIES
  administrativeBodies: {
    opri: {
      name: 'Office de la Propriété Intellectuelle',
      competence: 'Brevets belges',
      parent: 'SPF Économie',
      website: 'https://economie.fgov.be/fr/themes/propriete-intellectuelle',
    },
    boip: {
      name: 'Office Benelux de la Propriété intellectuelle',
      competence: 'Marques et dessins Benelux, i-DEPOT',
      website: 'https://www.boip.int/fr',
      headquarters: 'La Haye, Pays-Bas',
    },
    controlService: {
      name: 'Service de Contrôle des sociétés de gestion',
      competence: 'Supervision des sociétés de gestion collective',
      parent: 'SPF Économie',
    },
    economicInspection: {
      name: 'Inspection économique',
      competence: 'Enquêtes sur les infractions IP',
      parent: 'SPF Économie',
    },
  },

  // INTERNATIONAL TREATIES
  internationalTreaties: {
    wipo: {
      name: 'Organisation Mondiale de la Propriété Intellectuelle',
      memberSince: '1970-01-31',
      headquarters: 'Genève, Suisse',
      website: 'https://www.wipo.int',
    },
    trips: {
      title: 'Accord sur les ADPIC (TRIPS)',
      date: '1994-04-15',
      organization: 'OMC',
      minimumStandards: true,
    },
    parisConvention: {
      title: 'Convention de Paris pour la protection de la propriété industrielle',
      date: '1883-03-20',
      lastRevised: '1979-09-28',
      principles: ['Traitement national', 'Droit de priorité', 'Indépendance des brevets'],
    },
    berneConvention: {
      title: 'Convention de Berne pour la protection des œuvres littéraires et artistiques',
      date: '1886-09-09',
      lastRevised: '1979-09-28',
      principles: ['Protection automatique', 'Traitement national', 'Durée minimale'],
    },
  },
};

// Key IP articles for quick reference
export const IP_KEY_ARTICLES = {
  patents: {
    'Article 2': {
      title: 'Inventions brevetables',
      content: 'Les brevets sont délivrés pour les inventions nouvelles, impliquant une activité inventive et susceptibles d\'application industrielle.',
    },
    'Article 3': {
      title: 'Exclusions',
      content: 'Ne sont pas considérés comme inventions: découvertes, théories scientifiques, méthodes mathématiques, créations esthétiques, programmes d\'ordinateur en tant que tels.',
    },
    'Article 28': {
      title: 'Durée du brevet',
      content: 'La durée du brevet est de vingt ans à compter de la date de dépôt de la demande.',
    },
  },
  trademarks: {
    'Article 2.1 CBPI': {
      title: 'Signes susceptibles de constituer une marque',
      content: 'Peuvent constituer des marques tous les signes susceptibles de représentation graphique servant à distinguer les produits ou services.',
    },
    'Article 2.2bis CBPI': {
      title: 'Motifs absolus de refus',
      content: 'Signes dépourvus de caractère distinctif, descriptifs, génériques, trompeurs, contraires à l\'ordre public.',
    },
    'Article 2.14 CBPI': {
      title: 'Droits conférés',
      content: 'Le titulaire a le droit exclusif d\'utiliser la marque et d\'interdire aux tiers l\'usage de signes identiques ou similaires.',
    },
  },
  copyright: {
    'Article XI.165 CDE': {
      title: 'Objet du droit d\'auteur',
      content: 'L\'auteur d\'une œuvre littéraire ou artistique a seul le droit de la reproduire ou d\'en autoriser la reproduction.',
    },
    'Article XI.167 CDE': {
      title: 'Droits patrimoniaux',
      content: 'L\'auteur jouit du droit exclusif d\'exploiter son œuvre sous quelque forme que ce soit et d\'en tirer un profit pécuniaire.',
    },
    'Article XI.196 CDE': {
      title: 'Durée des droits',
      content: 'Le droit d\'auteur subsiste pendant septante ans après le décès de l\'auteur.',
    },
  },
};