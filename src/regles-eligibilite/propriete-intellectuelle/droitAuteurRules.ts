/**
 * Business Rules for Copyright (Droit d'Auteur) in Belgium
 *
 * BASE JURIDIQUE:
 * - Code de droit économique, Livre XI, Titre 5
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2013022819&table_name=loi
 * - Loi du 30 juin 1994 relative au droit d'auteur et aux droits voisins
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1994063035&table_name=loi
 * - Directive 2019/790 sur le droit d'auteur dans le marché unique numérique
 */

import { Engine } from 'json-rules-engine';
import { CopyrightRegistration, CopyrightType, IP_CONSTANTS } from '../modele-metier/proprieteIntellectuelleTypes';

/**
 * Create copyright protection rules engine
 */
function createCopyrightEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Originality requirement
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'hasOriginalExpression',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'isCreativeWork',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'copyright-eligible',
      params: {
        message: 'L\'œuvre présente une forme d\'expression originale',
        protection: 'Protection automatique dès la création',
      },
    },
    priority: 10,
  });

  // Rule 2: Fixed form requirement
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'isFixedInTangibleForm',
          operator: 'equal',
          value: false,
        },
        {
          fact: 'isPureIdea',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'copyright-ineligible',
      params: {
        reason: 'Les idées et concepts ne sont pas protégeables, seule l\'expression l\'est',
        legalBasis: 'Article XI.165 CDE',
      },
    },
    priority: 10,
  });

  // Rule 3: Work made for hire
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isEmployeeWork',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasContractualTransfer',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'copyright-transferred-employer',
      params: {
        message: 'Droits patrimoniaux transférés à l\'employeur',
        note: 'Droits moraux restent à l\'auteur',
        legalBasis: 'Article XI.167 CDE',
      },
    },
    priority: 9,
  });

  // Rule 4: Database protection
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isDatabase',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasSubstantialInvestment',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'database-sui-generis-protection',
      params: {
        message: 'Protection sui generis de base de données',
        duration: '15 ans à partir de l\'achèvement',
        legalBasis: 'Articles XI.307-311 CDE',
      },
    },
    priority: 8,
  });

  // Rule 5: Software protection
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isSoftware',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'hasOriginalCode',
          operator: 'equal',
          value: true,
        },
      ],
    },
    event: {
      type: 'software-copyright-protection',
      params: {
        message: 'Protection du logiciel comme œuvre littéraire',
        scope: 'Code source, code objet, architecture',
        exclusion: 'Algorithmes et fonctionnalités non protégés',
        legalBasis: 'Articles XI.294-306 CDE',
      },
    },
    priority: 9,
  });

  // Rule 6: Collaboration work
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'isCollaborativeWork',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'numberOfAuthors',
          operator: 'greaterThan',
          value: 1,
        },
      ],
    },
    event: {
      type: 'collaborative-work-rules',
      params: {
        message: 'Œuvre de collaboration - accord de tous requis',
        duration: '70 ans après décès du dernier co-auteur',
        exploitation: 'Accord unanime sauf convention contraire',
      },
    },
    priority: 7,
  });

  return engine;
}

// Singleton instance
const copyrightEngineInstance = createCopyrightEngine();

/**
 * Check copyright eligibility and protection
 */
export async function checkCopyrightProtection(work: Partial<CopyrightRegistration>): Promise<{
  isProtected: boolean;
  protectionType?: string;
  duration?: string;
  rights?: string[];
  restrictions?: string[];
}> {
  const facts = {
    hasOriginalExpression: (work as any).hasOriginalExpression !== false,
    isCreativeWork: (work as any).isCreative !== false,
    isFixedInTangibleForm: (work as any).isFixed !== false,
    isPureIdea: (work as any).isPureIdea ?? false,
    isEmployeeWork: (work as any).createdByEmployee ?? false,
    hasContractualTransfer: (work as any).hasTransferAgreement ?? false,
    isDatabase: work.type === 'base-donnees',
    hasSubstantialInvestment: (work as any).substantialInvestment ?? false,
    isSoftware: work.type === 'logiciel',
    hasOriginalCode: (work as any).hasOriginalCode !== false,
    isCollaborativeWork: (work as any).isCollaborative ?? false,
    numberOfAuthors: (work as any).numberOfAuthors ?? 1,
  };

  const results = await copyrightEngineInstance.run(facts);

  const protectionEvents = results.events.filter(e =>
    e.type.includes('eligible') || e.type.includes('protection')
  );

  const ineligibleEvents = results.events.filter(e =>
    e.type === 'copyright-ineligible'
  );

  if (ineligibleEvents.length > 0) {
    return {
      isProtected: false,
      restrictions: ineligibleEvents.map(e => e.params?.reason).filter(Boolean),
    };
  }

  const rights = [
    'Droit de reproduction',
    'Droit de communication au public',
    'Droit de distribution',
    'Droit d\'adaptation',
    'Droit de suite (arts visuels)',
  ];

  const duration = calculateCopyrightDuration(work.type ?? 'oeuvre-litteraire', (work as any).authorDeathDate);

  return {
    isProtected: true,
    protectionType: protectionEvents[0]?.params?.message,
    duration,
    rights,
    restrictions: [],
  };
}

/**
 * Calculate copyright duration
 */
export function calculateCopyrightDuration(
  type: CopyrightType,
  authorDeathDate?: Date,
  publicationDate?: Date
): string {
  const now = new Date();

  if (authorDeathDate) {
    const yearsSinceDeath = Math.floor(
      (now.getTime() - authorDeathDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
    const remaining = IP_CONSTANTS.COPYRIGHT_TERM_AUTHOR - yearsSinceDeath;

    if (remaining <= 0) {
      return 'Domaine public';
    }
    return `${remaining} ans (70 ans post mortem)`;
  }

  if (type === 'logiciel' || type === 'base-donnees') {
    if (publicationDate) {
      const yearsSincePublication = Math.floor(
        (now.getTime() - publicationDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      );
      const remaining = IP_CONSTANTS.COPYRIGHT_TERM_CORPORATE - yearsSincePublication;
      return `${remaining} ans depuis publication`;
    }
    return '70 ans depuis publication (personne morale)';
  }

  return '70 ans après décès de l\'auteur';
}

/**
 * Check moral rights (inalienable in Belgium)
 */
export function getMoralRights(): {
  rights: string[];
  characteristics: string[];
} {
  return {
    rights: [
      'Droit de paternité (être reconnu comme auteur)',
      'Droit au respect de l\'œuvre (s\'opposer aux modifications)',
      'Droit de divulgation (décider de publier)',
      'Droit de retrait (sous conditions)',
    ],
    characteristics: [
      'Inaliénables (ne peuvent être cédés)',
      'Imprescriptibles (durée illimitée)',
      'Insaisissables (protection contre créanciers)',
      'Perpétuels après la mort (exercés par héritiers)',
    ],
  };
}

/**
 * Calculate fair remuneration for private copy
 */
export function calculatePrivateCopyRemuneration(
  mediaType: 'digital' | 'analog',
  capacity: number // in GB for digital, units for analog
): number {
  // Belgian private copy levy rates (simplified)
  const rates = {
    digital: {
      smartphone: 0.40, // per GB
      tablet: 0.35,
      computer: 0.30,
      externalDrive: 0.25,
    },
    analog: {
      cdBlank: 0.10,
      dvdBlank: 0.20,
    },
  };

  if (mediaType === 'digital') {
    return capacity * rates.digital.externalDrive;
  } else {
    return capacity * rates.analog.cdBlank;
  }
}

/**
 * Check exceptions and limitations
 */
export function checkCopyrightException(
  useCase: string
): {
  isException: boolean;
  conditions?: string[];
  legalBasis?: string;
} {
  const exceptions: Record<string, any> = {
    'citation': {
      conditions: [
        'Œuvre licitement publiée',
        'Mention de la source et auteur',
        'Conforme aux bons usages',
        'Dans la mesure justifiée par le but',
      ],
      legalBasis: 'Article XI.189 CDE',
    },
    'education': {
      conditions: [
        'À des fins d\'illustration de l\'enseignement',
        'Pas de but lucratif',
        'Mention de la source',
        'Compensation équitable versée',
      ],
      legalBasis: 'Article XI.191/1 CDE',
    },
    'parodie': {
      conditions: [
        'Respect des lois du genre',
        'Pas de confusion avec l\'original',
        'Pas de préjudice injustifié',
      ],
      legalBasis: 'Article XI.190, 11° CDE',
    },
    'private-copy': {
      conditions: [
        'Usage strictement privé',
        'Cercle de famille',
        'Source licite',
        'Redevance pour copie privée payée',
      ],
      legalBasis: 'Article XI.190, 9° CDE',
    },
    'research': {
      conditions: [
        'Fins de recherche scientifique',
        'Pas de but commercial',
        'Mention de la source',
      ],
      legalBasis: 'Article XI.191/2 CDE',
    },
  };

  const exception = exceptions[useCase];
  if (!exception) {
    return { isException: false };
  }

  return {
    isException: true,
    conditions: exception.conditions,
    legalBasis: exception.legalBasis,
  };
}

/**
 * Validate i-DEPOT requirements
 */
export function validateIDepot(
  content: any,
  depositType: 'electronic' | 'physical'
): {
  isValid: boolean;
  requirements: string[];
  cost: number;
  duration: number;
} {
  const requirements = [
    'Fichier PDF, ZIP ou autre format accepté',
    'Taille maximale: 2GB',
    'Description claire du contenu',
    'Identification du déposant',
  ];

  if (depositType === 'physical') {
    requirements.push('Enveloppe scellée');
    requirements.push('Envoi recommandé');
  }

  return {
    isValid: true,
    requirements,
    cost: 45, // EUR for 5 years
    duration: 5, // years
  };
}

/**
 * Export copyright rules for transparency
 */
export const COPYRIGHT_RULES_JSON = {
  legalFramework: {
    economicCode: {
      title: 'Code de droit économique, Livre XI',
      url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2013022819&table_name=loi',
    },
    copyrightLaw: {
      title: 'Loi du 30 juin 1994 relative au droit d\'auteur',
      url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1994063035&table_name=loi',
    },
  },
  protection: {
    automatic: 'Protection automatique dès création',
    noFormalities: 'Aucune formalité requise',
    proof: 'i-DEPOT recommandé pour preuve de date',
  },
  requirements: {
    originality: 'Forme d\'expression originale',
    fixation: 'Fixation sur support tangible',
    creativity: 'Empreinte de la personnalité de l\'auteur',
  },
  duration: {
    author: `${IP_CONSTANTS.COPYRIGHT_TERM_AUTHOR} ans post mortem`,
    corporate: `${IP_CONSTANTS.COPYRIGHT_TERM_CORPORATE} ans depuis publication`,
    anonymous: `${IP_CONSTANTS.COPYRIGHT_TERM_ANONYMOUS} ans depuis publication`,
    database: '15 ans pour protection sui generis',
  },
  rights: {
    moral: ['Paternité', 'Intégrité', 'Divulgation', 'Retrait'],
    patrimonial: ['Reproduction', 'Communication', 'Distribution', 'Adaptation'],
  },
  exceptions: [
    'Citation',
    'Enseignement',
    'Parodie',
    'Copie privée',
    'Recherche',
    'Bibliothèques',
  ],
};