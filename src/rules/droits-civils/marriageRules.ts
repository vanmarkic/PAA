/**
 * Business Rules for Marriage and Partnership Procedures
 *
 * BASE JURIDIQUE:
 * - Code Civil belge, Livre I, Titre V (Du mariage)
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1804032130&table_name=loi
 * - Loi du 23 novembre 1998 instaurant la cohabitation légale
 *   https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1998112335&table_name=loi
 * - Loi du 4 mai 1999 modifiant certaines dispositions relatives au mariage
 */

import { Engine } from 'json-rules-engine';
import {
  MarriageProcedure,
  MarriageStatus,
  PersonDetails,
  ValidationResult,
  CIVIL_RIGHTS_CONSTANTS
} from '../../domain/droitsCivilsTypes';

/**
 * Create the marriage rules engine
 */
function createMarriageEngine(): Engine {
  const engine = new Engine();

  // Rule 1: Minimum age requirement
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'partner1Age',
          operator: 'lessThan',
          value: CIVIL_RIGHTS_CONSTANTS.MARRIAGE_MIN_AGE,
        },
        {
          fact: 'partner2Age',
          operator: 'lessThan',
          value: CIVIL_RIGHTS_CONSTANTS.MARRIAGE_MIN_AGE,
        },
      ],
    },
    event: {
      type: 'marriage-age-requirement-failed',
      params: {
        reason: `Les deux partenaires doivent avoir au moins ${CIVIL_RIGHTS_CONSTANTS.MARRIAGE_MIN_AGE} ans`,
        legalBasis: 'Article 144 Code Civil',
      },
    },
    priority: 10,
  });

  // Rule 2: Check for existing marriage (bigamy prevention)
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'partner1Status',
          operator: 'equal',
          value: 'marie',
        },
        {
          fact: 'partner2Status',
          operator: 'equal',
          value: 'marie',
        },
      ],
    },
    event: {
      type: 'bigamy-prevention',
      params: {
        reason: 'Bigamie interdite - Un des partenaires est déjà marié',
        legalBasis: 'Article 147 Code Civil',
        action: 'Le mariage précédent doit être dissous',
      },
    },
    priority: 10,
  });

  // Rule 3: Check for prohibited relationships (consanguinity)
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'relationshipDegree',
          operator: 'equal',
          value: 'direct-line', // Parent-child, grandparent-grandchild
        },
        {
          fact: 'relationshipDegree',
          operator: 'equal',
          value: 'sibling', // Brothers and sisters
        },
        {
          fact: 'relationshipDegree',
          operator: 'equal',
          value: 'uncle-niece', // Uncle-niece, aunt-nephew
        },
      ],
    },
    event: {
      type: 'prohibited-relationship',
      params: {
        reason: 'Mariage interdit entre parents au degré prohibé',
        legalBasis: 'Articles 161-164 Code Civil',
        note: 'Le mariage entre cousins germains est autorisé',
      },
    },
    priority: 10,
  });

  // Rule 4: Check for existing legal cohabitation
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'partner1Status',
          operator: 'equal',
          value: 'cohabitant-legal',
        },
        {
          fact: 'partner2Status',
          operator: 'equal',
          value: 'cohabitant-legal',
        },
      ],
    },
    event: {
      type: 'existing-cohabitation',
      params: {
        reason: 'Cohabitation légale existante doit être terminée',
        action: 'Mettre fin à la cohabitation légale avant le mariage',
        note: 'La cohabitation entre les futurs époux se termine automatiquement',
      },
    },
    priority: 8,
  });

  // Rule 5: Foreign partner documentation
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'partner1Nationality',
          operator: 'notEqual',
          value: 'BE',
        },
        {
          fact: 'partner2Nationality',
          operator: 'notEqual',
          value: 'BE',
        },
      ],
    },
    event: {
      type: 'foreign-partner-requirements',
      params: {
        additionalDocuments: [
          'Certificat de coutume',
          'Certificat de célibat du pays d\'origine',
          'Acte de naissance légalisé',
          'Traduction jurée des documents',
        ],
        note: 'Le parquet doit donner son avis',
        processingTime: 'Jusqu\'à 5 mois',
      },
    },
    priority: 7,
  });

  // Rule 6: Publication of banns timing
  engine.addRule({
    conditions: {
      all: [
        {
          fact: 'declarationSubmitted',
          operator: 'equal',
          value: true,
        },
        {
          fact: 'daysSinceDeclaration',
          operator: 'lessThan',
          value: CIVIL_RIGHTS_CONSTANTS.MARRIAGE_DECLARATION_DAYS,
        },
      ],
    },
    event: {
      type: 'banns-period-not-complete',
      params: {
        reason: `Délai de ${CIVIL_RIGHTS_CONSTANTS.MARRIAGE_DECLARATION_DAYS} jours requis après publication des bans`,
        remainingDays: {
          calculate: `${CIVIL_RIGHTS_CONSTANTS.MARRIAGE_DECLARATION_DAYS} - daysSinceDeclaration`,
        },
      },
    },
    priority: 6,
  });

  // Rule 7: Divorce waiting period for remarriage
  engine.addRule({
    conditions: {
      any: [
        {
          all: [
            {
              fact: 'partner1Status',
              operator: 'equal',
              value: 'divorce',
            },
            {
              fact: 'partner1DivorceFinal',
              operator: 'equal',
              value: false,
            },
          ],
        },
        {
          all: [
            {
              fact: 'partner2Status',
              operator: 'equal',
              value: 'divorce',
            },
            {
              fact: 'partner2DivorceFinal',
              operator: 'equal',
              value: false,
            },
          ],
        },
      ],
    },
    event: {
      type: 'divorce-not-final',
      params: {
        reason: 'Le divorce doit être définitif avant un nouveau mariage',
        action: 'Attendre la transcription du jugement de divorce',
      },
    },
    priority: 9,
  });

  // Rule 8: Witness requirements
  engine.addRule({
    conditions: {
      any: [
        {
          fact: 'witnessCount',
          operator: 'lessThan',
          value: 2,
        },
        {
          fact: 'witnessCount',
          operator: 'greaterThan',
          value: 4,
        },
      ],
    },
    event: {
      type: 'witness-requirement',
      params: {
        reason: 'Le mariage nécessite 2 à 4 témoins majeurs',
        legalBasis: 'Article 75 Code Civil',
      },
    },
    priority: 5,
  });

  return engine;
}

/**
 * Singleton instance of the marriage rules engine
 */
const marriageEngine = createMarriageEngine();

/**
 * Check degree of relationship between partners
 */
export function checkRelationshipDegree(
  partner1: PersonDetails,
  partner2: PersonDetails,
  relationship?: string
): string {
  // This would normally check family trees
  // For now, return based on provided relationship
  if (!relationship) return 'none';

  const prohibitedRelationships = [
    'parent-child',
    'grandparent-grandchild',
    'sibling',
    'half-sibling',
    'uncle-niece',
    'aunt-nephew',
  ];

  if (prohibitedRelationships.includes(relationship)) {
    if (relationship.includes('parent') || relationship.includes('grandparent')) {
      return 'direct-line';
    }
    if (relationship.includes('sibling')) {
      return 'sibling';
    }
    if (relationship.includes('uncle') || relationship.includes('aunt')) {
      return 'uncle-niece';
    }
  }

  return relationship === 'cousin' ? 'cousin' : 'none';
}

/**
 * Calculate marriage fees
 */
export function calculateMarriageFees(
  procedureType: string,
  urgentProcedure: boolean = false
): number {
  const baseFees: Record<string, number> = {
    'declaration-mariage': 50,
    'celebration-mariage': 0, // Included in declaration
    'cohabitation-legale': 25,
    'fin-cohabitation': 25,
    'divorce-consentement': 500, // Minimum notary fees
    'divorce-desunion': 800, // Court procedure
    'separation-corps': 600,
    'contrat-mariage': 300, // Notary fees
    'regime-matrimonial': 400,
    'reconnaissance-mariage': 75, // Foreign marriage recognition
  };

  let fee = baseFees[procedureType] || 50;

  // Add urgency fee if applicable
  if (urgentProcedure) {
    fee += 100;
  }

  return fee;
}

/**
 * Check marriage eligibility
 */
export async function checkMarriageEligibility(
  procedure: Partial<MarriageProcedure>
): Promise<ValidationResult> {
  const facts = {
    partner1Age: calculateAge(procedure.partner1?.birthDate),
    partner2Age: calculateAge(procedure.partner2?.birthDate),
    partner1Status: procedure.partner1?.civilStatus,
    partner2Status: procedure.partner2?.civilStatus,
    partner1Nationality: procedure.partner1?.nationality,
    partner2Nationality: procedure.partner2?.nationality,
    relationshipDegree: checkRelationshipDegree(
      procedure.partner1!,
      procedure.partner2!,
      (procedure as any).relationship
    ),
    declarationSubmitted: !!(procedure as any).declarationDate,
    daysSinceDeclaration: calculateDaysSince((procedure as any).declarationDate),
    witnessCount: procedure.witnesses?.length || 0,
    partner1DivorceFinal: (procedure as any).partner1DivorceFinal !== false,
    partner2DivorceFinal: (procedure as any).partner2DivorceFinal !== false,
  };

  try {
    const results = await marriageEngine.run(facts);

    const errors: any[] = [];
    const warnings: string[] = [];
    const missingDocuments: string[] = [];

    // Process events
    for (const event of results.events) {
      switch (event.type) {
        case 'marriage-age-requirement-failed':
        case 'bigamy-prevention':
        case 'prohibited-relationship':
        case 'divorce-not-final':
          errors.push({
            field: event.type,
            message: event.params?.reason,
            code: event.type,
            severity: 'error',
          });
          break;

        case 'existing-cohabitation':
        case 'banns-period-not-complete':
        case 'witness-requirement':
          warnings.push(event.params?.reason || event.params?.note);
          break;

        case 'foreign-partner-requirements':
          missingDocuments.push(...(event.params?.additionalDocuments || []));
          warnings.push(event.params?.note);
          break;
      }
    }

    // Add standard required documents
    if (errors.length === 0) {
      missingDocuments.push(
        'Acte de naissance (moins de 3 mois)',
        'Preuve d\'identité',
        'Certificat de résidence',
        'Preuve de célibat ou divorce'
      );
    }

    // Calculate fees
    const estimatedFees = calculateMarriageFees(
      procedure.type || 'declaration-mariage',
      false
    );

    // Calculate processing time
    let estimatedTime = CIVIL_RIGHTS_CONSTANTS.MARRIAGE_DECLARATION_DAYS;
    if (facts.partner1Nationality !== 'BE' || facts.partner2Nationality !== 'BE') {
      estimatedTime = 150; // Up to 5 months for foreign partners
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      missingDocuments,
      estimatedFees,
      estimatedTime,
    };
  } catch (error) {
    throw new Error(`Error checking marriage eligibility: ${error}`);
  }
}

/**
 * Helper functions
 */
function calculateAge(birthDate?: Date): number {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function calculateDaysSince(date?: Date): number {
  if (!date) return 0;
  const today = new Date();
  const past = new Date(date);
  const diffMs = today.getTime() - past.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Export rules for transparency
 */
export const MARRIAGE_RULES_JSON = {
  legalFramework: {
    codeCivil: {
      title: 'Code Civil belge - Livre I, Titre V',
      articles: ['144-171', '175-195'],
      url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1804032130&table_name=loi',
    },
    cohabitationLaw: {
      title: 'Loi instaurant la cohabitation légale',
      date: '1998-11-23',
      url: 'https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1998112335&table_name=loi',
    },
  },
  conditions: {
    minimumAge: CIVIL_RIGHTS_CONSTANTS.MARRIAGE_MIN_AGE,
    prohibitedRelationships: [
      'Ligne directe (parents-enfants)',
      'Frères et sœurs',
      'Oncle-nièce, tante-neveu',
    ],
    allowedRelationships: [
      'Cousins germains',
      'Sans lien de parenté',
    ],
    bannsPublication: `${CIVIL_RIGHTS_CONSTANTS.MARRIAGE_DECLARATION_DAYS} jours`,
    witnesses: '2 à 4 témoins majeurs',
  },
  procedures: {
    marriage: {
      steps: [
        'Déclaration de mariage à la commune',
        'Publication des bans (14 jours)',
        'Célébration du mariage',
        'Transcription dans les registres',
      ],
      documents: [
        'Acte de naissance',
        'Certificat de célibat',
        'Certificat de résidence',
        'Pièce d\'identité',
      ],
    },
    divorce: {
      types: [
        'Consentement mutuel (minimum 1 an de mariage)',
        'Désunion irrémédiable (séparation 12 mois)',
      ],
    },
  },
};