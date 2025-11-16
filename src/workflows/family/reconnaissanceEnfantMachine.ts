import { createMachine, assign } from 'xstate';

/**
 * Machine XState: Reconnaissance d'enfant
 *
 * Base légale: Code civil belge - Articles 319bis et suivants
 * Compétence: Officier de l'état civil (commune)
 *
 * Terminologie consacrée:
 * - "Reconnaissance" (non "déclaration paternité")
 * - "Filiation paternelle" (lien juridique père-enfant)
 * - "Consentement de la mère" (requis si enfant mineur non émancipé)
 * - "Acte de reconnaissance" (acte authentique état civil)
 */

interface ReconnaissanceContext {
  pere: {
    nom: string;
    age: number;
  };
  mere: {
    nom: string;
    consentement?: boolean;
  };
  enfant: {
    nom?: string;
    dateNaissance?: string;
    age?: number;
  };
  reconnaissance?: {
    moment: 'avant_naissance' | 'apres_naissance';
    date?: string;
  };
}

type ReconnaissanceEvent =
  | { type: 'DEMANDER_RECONNAISSANCE'; data: ReconnaissanceContext }
  | { type: 'CONSENTEMENT_MERE' }
  | { type: 'REFUS_MERE' }
  | { type: 'ACTE_DRESSE' }
  | { type: 'CONTESTER' };

export const reconnaissanceEnfantMachine = createMachine<
  ReconnaissanceContext,
  ReconnaissanceEvent
>({
  id: 'reconnaissanceEnfant',
  initial: 'information',
  context: {
    pere: {
      nom: '',
      age: 0,
    },
    mere: {
      nom: '',
    },
    enfant: {},
  },
  states: {
    information: {
      meta: {
        description: 'Information reconnaissance paternité',
        principe: {
          definition: 'Acte juridique établissant lien filiation paternelle',
          volontaire: 'Démarche volontaire du père',
          irrevocable: 'Reconnaissance définitive (sauf contestation judiciaire)',
        },
        quand: {
          avant_naissance: 'Possible dès conception (reconnaissance prénatale)',
          apres_naissance: 'Possible à tout moment après naissance',
          delai: 'Pas de délai maximum (même si enfant majeur)',
        },
        qui_peut: {
          pere_biologique: 'Homme affirmant être père biologique',
          age_minimum: 'Aucun minimum (mineur peut reconnaître)',
          nationalite: 'Toute nationalité',
        },
        ou: {
          commune_mere: 'Commune résidence de la mère',
          commune_pere: 'Commune résidence du père',
          commune_naissance: 'Commune naissance enfant',
          etranger: 'Ambassade/consulat belge si résidence étranger',
        },
      },
      on: {
        DEMANDER_RECONNAISSANCE: 'verification_consentement',
      },
    },
    verification_consentement: {
      meta: {
        description: 'Vérification consentement de la mère',
        principe: {
          consentement_mere_requis: 'OUI si enfant mineur non émancipé',
          raison: 'Protection intérêts enfant et mère',
          forme: 'Consentement écrit devant officier état civil',
        },
        exceptions: {
          enfant_majeur: 'Pas besoin consentement mère si enfant 18+',
          enfant_emancipe: 'Pas besoin consentement si enfant émancipé',
          deces_mere: 'Pas besoin consentement si mère décédée',
        },
        refus_mere: {
          consequence: 'Reconnaissance impossible (pour l\'instant)',
          recours: 'Action judiciaire recherche paternité (Tribunal famille)',
        },
        delai_reflexion: {
          aucun: 'Pas de délai imposé',
          conseil: 'Réflexion importante (irrevocable)',
        },
      },
      on: {
        CONSENTEMENT_MERE: 'etablissement_acte',
        REFUS_MERE: 'refus',
      },
    },
    etablissement_acte: {
      meta: {
        description: 'Établissement acte de reconnaissance',
        procedure: {
          rendez_vous: 'Prendre RDV avec officier état civil',
          comparution: 'Comparution personnelle obligatoire',
          identite: 'Vérification identité (carte identité, passeport)',
          lecture_acte: 'Officier lit acte et explique conséquences',
          signature: 'Signature père (+ mère si consent ement)',
        },
        documentsNecessaires: [
          'Carte identité du père',
          'Carte identité de la mère (si consentement)',
          'Acte naissance enfant (si déjà né)',
          'Certificat médical grossesse (si reconnaissance prénatale)',
          'Acte décès mère (si applicable)',
        },
        gratuit: 'Acte gratuit (pas de frais)',
        langues: 'Français, néerlandais, allemand',
      },
      on: {
        ACTE_DRESSE: 'reconnaissance_etablie',
      },
    },
    reconnaissance_etablie: {
      meta: {
        description: 'Reconnaissance établie - filiation paternelle créée',
        effets_juridiques: {
          filiation: 'Enfant porte nom du père (selon convention parents)',
          autorite_parentale: 'Père obtient autorité parentale',
          hebergement: 'Droit hébergement (ex garde alternée)',
          obligation_alimentaire: 'Obligation contribuer entretien enfant',
          succession: 'Droits successoraux réciproques',
          nationalite: 'Transmission nationalité belge si père belge',
        },
        nom_enfant: {
          choix: 'Parents choisissent nom (père, mère, ou double nom)',
          delai: 'Déclaration dans délai légal (commune)',
          defaut: 'Nom mère par défaut si pas déclaration',
        },
        autorite_parentale: {
          exercice_commun: 'Exercice conjoint si parents cohabitent',
          exercice_exclusif: 'Exercice exclusif mère si séparés (sauf accord/jugement)',
          hebergement: 'Hébergement à définir (amiable ou judiciaire)',
        },
        contribution_alimentaire: {
          obligation: 'Père doit contribuer entretien enfant',
          montant: 'Selon capacités financières (accord ou jugement)',
          tribunal: 'Tribunal famille si désaccord',
        },
        contestation_possible: {
          delai: '1 an si découverte non-paternité',
          action: 'Action contestation paternité (Tribunal famille)',
          test_ADN: 'Expertise génétique ordonnée par juge',
          annulation: 'Si non-paternité prouvée → annulation reconnaissance',
        },
      },
      type: 'final',
    },
    refus: {
      meta: {
        description: 'Reconnaissance refusée (mère n\'a pas consenti)',
        alternatives: {
          recherche_paternite: {
            action: 'Action judiciaire recherche paternité',
            tribunal: 'Tribunal de la famille',
            delai: 'Avant 22 ans de l\'enfant',
            test_ADN: 'Test ADN peut être ordonné par juge',
            effets: 'Si paternité établie = mêmes effets que reconnaissance',
          },
          nouvelle_demande: 'Redemander consentement mère ultérieurement',
        },
        conseil: 'Consulter avocat spécialisé droit familial',
      },
      on: {
        CONTESTER: 'action_judiciaire',
      },
    },
    action_judiciaire: {
      meta: {
        description: 'Action judiciaire recherche paternité',
        tribunal: 'Tribunal de la famille',
        procedure: {
          requete: 'Requête par avocat (obligatoire)',
          citation: 'Citation de la mère et enfant',
          expertise: 'Expertise génétique (ADN) quasi systématique',
          jugement: 'Jugement établissant ou rejetant paternité',
        },
        delais: {
          enfant_mineur: 'Jusqu\'à 22 ans de l\'enfant (action par mère)',
          enfant_majeur: 'Enfant peut agir lui-même jusqu\'à 22 ans',
          pere: 'Père peut agir sans limite',
        },
        frais: {
          avocat: 'Honoraires avocat (aide juridique possible)',
          expertise: 'Expertise ADN (± 500-1.000€)',
        },
      },
      type: 'final',
    },
  },
});
