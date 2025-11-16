import { createMachine, assign } from 'xstate';

/**
 * Machine XState: Permis d'urbanisme
 *
 * Base légale: CoDT (Wallonie) / Vlaamse Codex (Flandre) / CoBAT (Bruxelles)
 * Compétence: Commune + Région (selon importance projet)
 * Délai 2024: 75-115 jours selon procédure
 *
 * Terminologie consacrée:
 * - "Permis d'urbanisme" (non "permis de bâtir" - ancien terme)
 * - "Demandeur" (propriétaire ou mandataire)
 * - "Enquête publique" (publicité obligatoire pour certains projets)
 * - "Fonctionnaire délégué" (niveau régional)
 */

interface PermisUrbanismeContext {
  projet: {
    nature: string;
    adresse: string;
    superficie?: number;
  };
  demandeur: {
    nom: string;
    qualite: 'proprietaire' | 'locataire' | 'mandataire';
  };
  procedure?: {
    type: 'ordinaire' | 'allegee';
    enquete_publique?: boolean;
  };
  decision?: {
    octroi: boolean;
    conditions?: string[];
    recours?: boolean;
  };
}

type PermisUrbanismeEvent =
  | { type: 'DEPOSER_DEMANDE'; data: PermisUrbanismeContext }
  | { type: 'ENQUETE_PUBLIQUE' }
  | { type: 'DECISION_FAVORABLE'; conditions?: string[] }
  | { type: 'DECISION_REFUS'; motif: string }
  | { type: 'RECOURS' };

export const permisUrbanismeMachine = createMachine({
  id: 'permisUrbanisme',
  initial: 'preparation',
  context: {
    projet: {
      nature: '',
      adresse: '',
    },
    demandeur: {
      nom: '',
      qualite: 'proprietaire',
    },
  },
  states: {
    preparation: {
      meta: {
        description: 'Préparation demande permis d\'urbanisme',
        actes_soumis: {
          construction: 'Nouvelle construction',
          transformation: 'Transformation bâtiment existant',
          demolition: 'Démolition (si dans zone protégée)',
          changement_affectation: 'Changement destination (ex: bureau → habitation)',
          division_parcelle: 'Division lot',
          relief_sol: 'Modification relief du sol',
        },
        actes_dispenses: {
          petits_travaux: 'Petits travaux intérieurs (sans modification structure)',
          remplacement: 'Remplacement toiture identique',
          abri_jardin: 'Abri < 20-40m² selon région (sous conditions)',
        },
        documents_necessaires: {
          formulaire: 'Formulaire demande (région)',
          plans: [
            'Plans situation (cadastre)',
            'Plans architecturaux (niveaux, façades, coupes)',
            'Photos état existant',
          ],
          annexes: [
            'Titre propriété ou accord propriétaire',
            'Attestation sol (si terrain à bâtir)',
            'Étude urbanistique (si gros projet)',
            'Étude incidences environnementales (si requis)',
            'Note PEB (performance énergétique)',
          ],
        },
        intervenants: {
          architecte: 'Obligatoire si superficie > seuils (30-40m² selon région)',
          geometre: 'Si division parcelle',
          bureau_etudes: 'Si projet complexe',
        },
        verifications_prealables: {
          zonage: 'Vérifier plan secteur (zone habitat, agricole, etc.)',
          reglement: 'Consulter RUE/RCU (règlement communal urbanisme)',
          servitudes: 'Vérifier servitudes (cadastre)',
          classement: 'Vérifier si patrimoine classé',
        },
      },
      on: {
        DEPOSER_DEMANDE: 'instruction',
      },
    },
    instruction: {
      meta: {
        description: 'Instruction demande par commune et région',
        depot: {
          ou: 'Guichet urbanisme commune',
          nombre: '4 exemplaires papier + version digitale',
          accuse: 'Accusé réception avec numéro dossier',
        },
        completude: {
          verification: 'Commune vérifie complétude dossier',
          delai: '20 jours (wallonie) - 30 jours (autres)',
          incomplet: 'Demande compléments si dossier incomplet',
          suspension: 'Délai suspendu jusqu\'à compléments',
        },
        procedures: {
          ordinaire: {
            definition: 'Procédure standard',
            delai: '115 jours maximum',
            enquete_publique: 'Souvent requise',
            avis: 'Avis multiples (CCATM, fonctionnaire délégué, etc.)',
          },
          allegee: {
            definition: 'Procédure simplifiée (petits projets)',
            delai: '75 jours maximum',
            enquete: 'Pas d\'enquête publique',
            condition: 'Projet conforme plans/règlements',
          },
        },
        enquete_publique: {
          quand: 'Si dérogation, projet important, ou obligation réglementaire',
          duree: '15 jours (affichage sur site + commune)',
          reclamations: 'Voisins peuvent formuler observations',
          impact: 'Pris en compte dans décision',
        },
        avis_consultatifs: {
          CCATM: 'Commission Communale Aménagement Territoire (obligatoire)',
          fonctionnaire: 'Fonctionnaire délégué régional (si requis)',
          incidences: 'Direction environnement (si EIE)',
          patrimoine: 'Commission patrimoine (si site classé)',
          mobilite: 'Service mobilité (si gros projet)',
        },
      },
      on: {
        ENQUETE_PUBLIQUE: 'consultation',
        DECISION_FAVORABLE: 'octroi',
        DECISION_REFUS: 'refus',
      },
    },
    consultation: {
      meta: {
        description: 'Enquête publique et consultation',
        affichage: {
          site: 'Pancarte sur terrain (30 jours)',
          commune: 'Affichage maison communale',
          contenu: 'Nature projet, consultation dossier',
        },
        consultationDossier: 'Dossier consultable à l\'urbanisme',
        reclamations: {
          delai: '15 jours pour réclamations',
          forme: 'Écrites et motivées',
          qui: 'Voisins, habitants commune, associations',
        },
        impact: 'Autorité tient compte observations (pas décisif)',
      },
      on: {
        DECISION_FAVORABLE: 'octroi',
        DECISION_REFUS: 'refus',
      },
    },
    octroi: {
      meta: {
        description: 'Permis d\'urbanisme octroyé',
        decision: {
          autorite: 'Collège échevins OU Fonctionnaire délégué',
          delai: '75 jours (alégée) ou 115 jours (ordinaire)',
          notification: 'Envoi recommandé + affichage',
        },
        contenu: {
          dispositif: 'Autorise ou autorise sous conditions',
          conditions: 'Charges urbanistiques (voirie, espaces verts, etc.)',
          plans: 'Plans approuvés',
          prescriptions: 'Prescriptions techniques',
        },
        duree_validite: {
          debut_travaux: '2 ans pour commencer (péremption sinon)',
          achevement: '3 ans pour achever (sauf prolongation)',
          prolongation: 'Possible sur demande motivée',
        },
        affichage_obligatoire: {
          site: 'Pancarte sur terrain VISIBLE de la voie publique',
          duree: 'Pendant TOUTE la durée travaux',
          sanction: 'Défaut affichage = pénal',
        },
        mise_en_oeuvre: {
          conformite: 'Travaux STRICTEMENT conformes permis',
          architecte: 'Direction chantier par architecte (si obligatoire)',
          controle: 'Agent urbanisme peut contrôler chantier',
          reception: 'Certificat conformité en fin travaux',
        },
        recours_tiers: {
          delai: '20 jours après notification',
          qui: 'Voisins ayant réclamé',
          effet: 'Suspension permis pendant recours',
        },
      },
      type: 'final',
    },
    refus: {
      meta: {
        description: 'Permis refusé',
        motifs_frequents: [
          'Non-conformité plan secteur',
          'Violation RUE/RCU',
          'Impact visuel/architectural négatif',
          'Problèmes mobilité/stationnement',
          'Opposition voisinage (rarement seul motif)',
          'Dossier incomplet persistant',
        ],
        recours: {
          autorite: {
            definition: 'Recours administratif',
            destinataire: 'Gouvernement régional (selon région)',
            delai: '20 jours après notification',
            gratuit: 'Pas de frais',
          },
          CE: {
            definition: 'Recours Conseil d\'État',
            delai: '60 jours',
            frais: '200€ droits greffe',
            annulation: 'Annulation décision (pas octroi automatique)',
            duree: '1-3 ans',
          },
        },
        alternatives: {
          modification: 'Modifier projet et redemander',
          derogation: 'Demander dérogation (si possible)',
          recours: 'Introduire recours',
        },
      },
      on: {
        RECOURS: 'recours_administratif',
      },
    },
    recours_administratif: {
      meta: {
        description: 'Recours administratif devant Gouvernement',
        delai: '20 jours notification',
        procedure: {
          requete: 'Lettre recommandée motivée',
          instruction: 'Réexamen dossier',
          decision: '60-90 jours',
        },
        issues: {
          reforme: 'Annulation refus → permis accordé',
          confirmation: 'Confirmation refus',
          renvoi: 'Renvoi commune pour nouvelle décision',
        },
      },
      type: 'final',
    },
  },
});
