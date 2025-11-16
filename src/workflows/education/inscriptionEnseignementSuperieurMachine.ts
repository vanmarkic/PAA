/**
 * Machine XState pour Inscription Enseignement Supérieur
 * Terminologie: Décret Paysage (enseignement supérieur Belgique francophone)
 */

import { createMachine, assign } from 'xstate';

interface EtudiantSuperieur {
  nom: string;
  diplomeCESS: boolean; // Certificat Enseignement Secondaire Supérieur
  anneeReussie: number; // Crédits ECTS
  finançable: boolean; // Statut étudiant finançable (Décret Paysage)
}

interface InscriptionSuperieurContext {
  etudiant: EtudiantSuperieur | null;
  etablissement: string | null;
  programme: string | null;
  droitsInscription: number;
  bourseAllouee: boolean;
  inscriptionValidee: boolean;
}

export const inscriptionEnseignementSuperieurMachine = createMachine({
  id: 'inscriptionEnseignementSuperieur',
  initial: 'choixEtudes',
  schemas: {
    context: {} as InscriptionSuperieurContext,
    events: {} as
      | { type: 'CHOISIR_PROGRAMME'; etablissement: string; programme: string }
      | { type: 'VERIFIER_FINANCABILITE'; etudiant: EtudiantSuperieur }
      | { type: 'ETUDIANT_FINANÇABLE' }
      | { type: 'ETUDIANT_NON_FINANÇABLE' }
      | { type: 'DEPOSER_DOSSIER' }
      | { type: 'DEMANDER_BOURSE' }
      | { type: 'BOURSE_ACCORDEE' }
      | { type: 'PAYER_MINERVAL' }
      | { type: 'INSCRIPTION_VALIDEE' }
  },
  context: {
    etudiant: null,
    etablissement: null,
    programme: null,
    droitsInscription: 835, // Minerval plein 2024-2025
    bourseAllouee: false,
    inscriptionValidee: false,
  },
  states: {
    choixEtudes: {
      on: {
        CHOISIR_PROGRAMME: {
          target: 'verificationAcces',
          actions: assign({
            etablissement: (_, event) => event.etablissement,
            programme: (_, event) => event.programme,
          }),
        },
      },
      meta: {
        description: 'Choix établissement et programme (Université, Haute École, ESA)',
      },
    },
    verificationAcces: {
      on: {
        VERIFIER_FINANCABILITE: {
          target: 'evaluationFinancabilite',
          actions: assign({ etudiant: (_, event) => event.etudiant }),
        },
      },
      meta: {
        description: 'Vérification titre accès (CESS ou équivalence)',
      },
    },
    evaluationFinancabilite: {
      on: {
        ETUDIANT_FINANÇABLE: { target: 'depotDossier' },
        ETUDIANT_NON_FINANÇABLE: { target: 'refusInscription' },
      },
      meta: {
        description: 'Évaluation finançabilité selon Décret Paysage',
        criteres: {
          regle1: 'Acquérir minimum 75% crédits inscrits sur 3 années',
          regle2: 'Acquérir minimum 50% crédits chaque année',
          regle3: 'Maximum 5 inscriptions même cycle',
        },
      },
    },
    depotDossier: {
      on: {
        DEPOSER_DOSSIER: { target: 'demandeBourse' },
      },
      meta: {
        description: 'Dépôt dossier inscription + documents requis',
      },
    },
    demandeBourse: {
      on: {
        DEMANDER_BOURSE: { target: 'analyseBourse' },
        PAYER_MINERVAL: { target: 'paiementMinerval' },
      },
      meta: {
        description: 'Demande allocation études (si revenus limités)',
      },
    },
    analyseBourse: {
      on: {
        BOURSE_ACCORDEE: {
          target: 'paiementMinerval',
          actions: assign({
            bourseAllouee: true,
            droitsInscription: 0, // Exonération si bourse
          }),
        },
      },
      meta: {
        description: 'Analyse revenus parents - allocation études FWB',
        montants: {
          bourseMax: '5 686€ (2024-2025)',
          exoneration: 'Minerval gratuit si bourse',
        },
      },
    },
    paiementMinerval: {
      on: {
        PAYER_MINERVAL: {
          target: 'inscriptionDefinitive',
        },
      },
      meta: {
        description: 'Paiement droits inscription (minerval)',
        montants: {
          plein: '835€',
          reduit: '374€ (boursier non-FWB)',
          gratuit: 'Si bourse FWB ou revenus très faibles',
        },
      },
    },
    inscriptionDefinitive: {
      on: {
        INSCRIPTION_VALIDEE: {
          target: 'termine',
          actions: assign({ inscriptionValidee: true }),
        },
      },
      meta: {
        description: 'Inscription définitive - carte étudiant',
      },
    },
    refusInscription: {
      type: 'final',
      meta: {
        description: 'Refus inscription (non-finançable ou titre accès insuffisant)',
        recours: 'Possibilité dérogation sur dossier exceptionnel',
      },
    },
    termine: {
      type: 'final',
      meta: {
        description: 'Inscription validée - début cours',
      },
    },
  },
});
