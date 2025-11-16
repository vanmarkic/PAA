import { createMachine, assign } from 'xstate';

/**
 * Machine XState: Administration provisoire (mesure de protection)
 *
 * Base légale: Code civil - Articles 488bis et suivants
 * Compétence: Juge de paix
 *
 * Terminologie consacrée:
 * - "Administration provisoire" (non "tutelle majeur" - terme inexact)
 * - "Personne protégée" (non "incapable")
 * - "Administrateur provisoire" (mandataire judiciaire)
 * - "Altération des facultés mentales" (condition légale)
 */

interface AdministrationProvisoireContext {
  personne: {
    nom: string;
    age: number;
    situation: string;
  };
  demandeur: {
    nom: string;
    lien: string; // Parent, conjoint, procureur du Roi
  };
  mesure?: {
    type: 'generale' | 'limitee';
    administrateur?: string;
    etendue?: string[];
  };
}

type AdministrationProvisoireEvent =
  | { type: 'DEMANDER_PROTECTION'; data: AdministrationProvisoireContext }
  | { type: 'AUDITION' }
  | { type: 'EXPERTISE_MEDICALE' }
  | { type: 'JUGEMENT_FAVORABLE'; type: 'generale' | 'limitee' }
  | { type: 'JUGEMENT_DEFAVORABLE' };

export const administrationProvisoireMachine = createMachine<
  AdministrationProvisoireContext,
  AdministrationProvisoireEvent
>({
  id: 'administrationProvisoire',
  initial: 'evaluation',
  context: {
    personne: {
      nom: '',
      age: 0,
      situation: '',
    },
    demandeur: {
      nom: '',
      lien: '',
    },
  },
  states: {
    evaluation: {
      meta: {
        description: 'Évaluation nécessité mesure de protection',
        definition: {
          objectif: 'Protéger personne ne pouvant plus gérer ses intérêts',
          nature: 'Mesure judiciaire de protection',
          subsidiarite: 'Seulement si autres solutions insuffisantes',
        },
        conditions: {
          alteration: 'Altération facultés mentales OU état physique grave',
          incapacite: 'Incapacité gérer (tout ou partie) intérêts',
          necessite: 'Nécessité protection',
        },
        situations_types: [
          'Démence, Alzheimer avancé',
          'Handicap mental sévère (majeur)',
          'Troubles psychiatriques graves',
          'Coma, état végétatif',
          'Dépendance alcool/drogue (rare)',
        ],
        qui_peut_demander: [
          'Conjoint, cohabitant légal',
          'Parents, enfants',
          'Frères, sœurs',
          'Procureur du Roi (office)',
          'Personne concernée elle-même (rare)',
        ],
      },
      on: {
        DEMANDER_PROTECTION: 'procedure',
      },
    },
    procedure: {
      meta: {
        description: 'Procédure devant juge de paix',
        tribunal: 'Juge de paix du domicile personne à protéger',
        requete: {
          avocat: 'Non obligatoire mais recommandé',
          contenu: [
            'Identité personne à protéger',
            'Motifs demande (état santé)',
            'Certificat médical circonstancié',
            'Proposition administrateur',
          ],
        },
        audition: {
          personne: 'Audition personne concernée OBLIGATOIRE (sauf impossible)',
          lieu: 'Domicile si déplacement impossible',
          contradictoire: 'Personne peut se défendre',
        },
        expertise: {
          medicale: 'Expertise psychiatrique souvent ordonnée',
          contenu: 'État mental, capacités, pronostic',
          expert: 'Psychiatre désigné par juge',
        },
        delai: '2-6 mois selon urgence',
      },
      on: {
        AUDITION: 'expertise',
      },
    },
    expertise: {
      meta: {
        description: 'Expertise médicale et auditions',
        expertise_psychiatrique: {
          obligatoire: 'Quasi systématique',
          contenu: 'Évaluation capacités mentales',
          questions: [
            'Altération facultés?',
            'Capacité gérer affaires?',
            'Pronostic évolution?',
            'Étendue protection nécessaire?',
          ],
        },
        audition_famille: 'Juge peut entendre famille',
        avis_procureur: 'Procureur du Roi donne avis',
      },
      on: {
        JUGEMENT_FAVORABLE: 'protection',
        JUGEMENT_DEFAVORABLE: 'rejet',
      },
    },
    protection: {
      meta: {
        description: 'Mesure de protection prononcée',
        types_mesures: {
          administration_generale: {
            definition: 'Protection complète personne et biens',
            administrateur: 'Gère TOUS les biens et actes',
            personne: 'Personne protégée ne peut plus agir seule',
            gravite: 'Altération grave et durable',
          },
          administration_limitee: {
            definition: 'Protection limitée à certains actes',
            exemples: 'Gestion patrimoine mais pas actes quotidiens',
            souplesse: 'Personne garde autonomie pour actes courants',
            preference: 'Favorisée (principe proportionnalité)',
          },
        },
        designation_administrateur: {
          priorite: [
            '1. Conjoint, cohabitant légal',
            '2. Enfant majeur',
            '3. Parent',
            '4. Autre parent proche',
            '5. Tiers professionnel (avocat, notaire)',
          ],
          choix: 'Juge désigne en fonction intérêt personne',
          pluralite: 'Possibilité plusieurs administrateurs',
        },
        pouvoirs_administrateur: {
          generale: [
            'Gérer tous les biens',
            'Percevoir revenus',
            'Payer factures, impôts',
            'Placements financiers',
            'Vente biens (avec autorisation juge)',
            'Représenter pour actes juridiques',
          ],
          limitee: 'Selon étendue fixée par jugement',
          interdits: [
            'Donations (sauf autorisation)',
            'Testament pour personne protégée',
            'Actes spéculatifs risqués',
          ],
        },
        obligations_administrateur: {
          inventaire: 'Dresser inventaire patrimoine',
          gestion_bon_pere: 'Gérer en bon père de famille',
          comptes_annuels: 'Rendre comptes annuellement au juge',
          autorisation: 'Demander autorisation juge pour actes graves',
          separation: 'Séparer biens propres et biens personne protégée',
        },
        remuneration: {
          principe: 'Gratuit si famille proche',
          professionnel: 'Rémunération si administrateur professionnel',
          frais: 'Remboursement frais sur biens personne protégée',
        },
        duree: {
          provisoire: 'Durée déterminée par juge (souvent 3-5 ans)',
          renouvellement: 'Renouvellement possible',
          mainlevee: 'Levée si amélioration état',
        },
        controle: {
          juge: 'Contrôle juge de paix',
          comptes: 'Comptes annuels obligatoires',
          visite: 'Juge peut visiter personne protégée',
          sanctions: 'Révocation administrateur si manquements',
        },
      },
      type: 'final',
    },
    rejet: {
      meta: {
        description: 'Demande rejetée',
        motifs: [
          'Altération facultés insuffisante',
          'Personne capable gérer ses affaires',
          'Autres mesures moins restrictives suffisantes',
          'Demande abusive',
        ],
        alternatives: {
          mandat_extrajudiciaire: 'Mandat notarié (si capacité)',
          tutelle: 'Tutelle (si mineur prolongé)',
          curatelle: 'Internement (si danger)',
        },
      },
      type: 'final',
    },
  },
});
