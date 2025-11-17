import { createMachine, assign } from 'xstate';

/**
 * Machine XState: Maladie professionnelle
 *
 * Base légale: Lois coordonnées du 3 juin 1970 relatives aux maladies professionnelles
 * Compétence: Fedris (Agence fédérale risques professionnels)
 * Indemnisation: Similaire accidents travail (rente si IPP)
 *
 * Terminologie consacrée:
 * - "Maladie professionnelle" (affection causée par exposition professionnelle)
 * - "Liste des maladies professionnelles" (liste légale - système ouvert/fermé)
 * - "Incapacité Permanente Physique" - IPP (≠ IPT accidents travail)
 * - "Exposition professionnelle" (contact nocif dans cadre travail)
 */

interface MaladieProfessionnelleContext {
  travailleur: {
    nom: string;
    secteur: string;
    anciennete: number; // années
  };
  maladie: {
    code?: string; // Code liste maladies pro
    diagnostic?: string;
    exposition?: string; // Agent nocif
  };
  incapacite?: {
    tauxIPP?: number;
    dateConsolidation?: string;
  };
  indemnisation?: {
    rente?: number;
    capital?: number;
  };
}

type MaladieProfessionnelleEvent =
  | { type: 'DECLARER_MALADIE'; data: MaladieProfessionnelleContext }
  | { type: 'RECONNAISSANCE_FEDRIS' }
  | { type: 'REJET_FEDRIS'; motif: string }
  | { type: 'EVALUATION_IPP'; taux: number }
  | { type: 'RECOURS' };

export const maladieProfessionnelleMachine = createMachine({
  id: 'maladieProfessionnelle',
  initial: 'information',
  context: {
    travailleur: {
      nom: '',
      secteur: '',
      anciennete: 0,
    },
    maladie: {},
  },
  states: {
    information: {
      meta: {
        description: 'Information sur les maladies professionnelles',
        definition: {
          legale: 'Affection causée par exposition à risque professionnel',
          difference_AT: 'Apparition progressive (≠ accident = événement soudain)',
          lien_travail: 'Lien causal entre travail et maladie',
        },
        systemeListe: {
          liste_fermee: {
            definition: 'Maladies dans liste officielle (annexe AR)',
            avantage: 'Reconnaissance quasi automatique si conditions remplies',
            exemples: [
              'Asbestose (amiante)',
              'Silicose (poussières silice)',
              'Troubles musculo-squelettiques (TMS)',
              'Surdité professionnelle',
              'Dermatoses professionnelles',
              'Asthme professionnel',
            ],
            conditions: 'Exposition + délai + tableau clinique',
          },
          systeme_ouvert: {
            definition: 'Maladies hors liste',
            charge_preuve: 'Prouver lien causal direct travail → maladie',
            difficulte: 'Reconnaissance plus difficile',
            expertise: 'Expertise médicale approfondie',
          },
        },
        principalesCategories: {
          pneumoconioses: 'Poussières (amiante, silice, charbon)',
          TMS: 'Troubles musculo-squelettiques (tendinites, canal carpien)',
          surdite: 'Surdité due au bruit',
          dermatoses: 'Affections peau (eczéma, allergies)',
          asthme: 'Asthme allergique professionnel',
          cancers: 'Cancers (amiante, benzène, etc.)',
        },
        delaiDeclaration: 'Aucun délai strict (mais ne pas tarder)',
      },
      on: {
        DECLARER_MALADIE: 'declaration',
      },
    },
    declaration: {
      meta: {
        description: 'Déclaration maladie professionnelle à Fedris',
        qui_declare: {
          travailleur: 'Le travailleur lui-même (principalement)',
          medecin: 'Médecin traitant peut aider',
          employeur: 'Employeur peut aussi déclarer',
        },
        ou: 'Fedris (anciennement FMP)',
        comment: {
          en_ligne: 'Via portail MyFedris',
          courrier: 'Formulaire papier envoyé à Fedris',
          email: 'maladies.professionnelles@fedris.be',
        },
        documentsNecessaires: [
          'Formulaire déclaration (Fedris)',
          'Certificat médical détaillé',
          'Attestation employeur (exposition)',
          'Historique professionnel complet',
          'Rapports médicaux spécialisés',
        ],
        exposition: {
          preuve: 'Prouver exposition agent nocif',
          duree: 'Durée et intensité exposition',
          periode: 'Période exposition (dates)',
        },
      },
      on: {
        RECONNAISSANCE_FEDRIS: 'reconnaissance',
        REJET_FEDRIS: 'rejet',
      },
    },
    reconnaissance: {
      meta: {
        description: 'Reconnaissance maladie professionnelle par Fedris',
        enquete: {
          medicale: 'Expertise médicale Fedris',
          professionnelle: 'Enquête exposition professionnelle',
          employeur: 'Interrogation employeur',
          delai: '6-18 mois (voire plus)',
        },
        criteresReconnaissance: {
          liste_fermee: [
            'Maladie figure dans liste',
            'Exposition prouvée',
            'Délai prise en charge respecté',
            'Tableau clinique conforme',
          ],
          systeme_ouvert: [
            'Lien causal direct et certain',
            'Exposition habituelle et déterminante',
            'Pas d\'autre cause',
          ],
        },
        decision: 'Décision motivée par Fedris',
      },
      on: {
        EVALUATION_IPP: 'indemnisation',
      },
    },
    indemnisation: {
      meta: {
        description: 'Indemnisation maladie professionnelle',
        incapaciteTemporaire: {
          montant: '90% salaire plafonné (similaire AT)',
          duree: 'Jusqu\'à consolidation',
          frais_medicaux: '100% pris en charge',
        },
        incapacitePermanente: {
          evaluation: 'Taux IPP fixé par médecin Fedris',
          bareme: 'Barème spécifique maladies professionnelles',
          indemnisation: {
            moins_16_pourcent: 'Capital unique',
            '16_pourcent_et_plus': 'Rente mensuelle viagère',
          },
        },
        montantRente: {
          calcul: 'Salaire de référence × taux IPP × coefficient âge',
          indexation: 'Indexation annuelle',
          viager: 'Rente à vie',
        },
        frais_medicaux: {
          soins: 'Tous soins liés à maladie pro',
          reeducation: 'Rééducation professionnelle',
          readaptation: 'Aménagements poste travail',
        },
        cumuls: {
          pension: 'Rente cumulable avec pension retraite',
          salaire: 'Rente cumulable avec salaire (si reprise travail)',
          mutuelle: 'Fedris = primaire (mutuelle = secondaire)',
        },
      },
      type: 'final',
    },
    rejet: {
      meta: {
        description: 'Reconnaissance refusée par Fedris',
        motifs_frequents: [
          'Lien causal non établi',
          'Exposition insuffisante',
          'Maladie hors liste (système ouvert) sans preuve',
          'Délai prise en charge dépassé (liste fermée)',
          'Autre cause médicale prédominante',
        ],
        recours: {
          tribunal: 'Tribunal du travail',
          delai: '3 mois à dater notification',
          expertise: 'Expertise médicale contradictoire possible',
          avocat: 'Assistance avocat recommandée',
        },
        alternatives: {
          mutuelle: 'Indemnités maladie ordinaire (mutuelle)',
          invalidite: 'Allocation invalidité si incapacité > 66%',
          handicap: 'ARR/AI si handicap permanent',
        },
      },
      on: {
        RECOURS: 'recours_judiciaire',
      },
    },
    recours_judiciaire: {
      meta: {
        description: 'Recours devant Tribunal du travail',
        procedure: {
          requete: 'Dépôt requête au greffe',
          expertise: 'Expertise médicale judiciaire fréquente',
          enquete: 'Enquête exposition si nécessaire',
          jugement: 'Jugement contraignant pour Fedris',
        },
        delais_longs: '2-4 ans en moyenne',
        frais: {
          avocat: 'Honoraires avocat',
          expertise: 'Frais expertise (avancés par demandeur)',
          aide_juridique: 'Aide juridique possible',
        },
        taux_reussite: 'Variable selon solidité dossier médical',
      },
      type: 'final',
    },
  },
});
