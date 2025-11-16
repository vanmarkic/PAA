/**
 * Machine XState pour Protection Données Personnelles - RGPD
 * Terminologie: RGPD (Règlement Général Protection Données), Autorité Protection Données (APD)
 */

import { createMachine, assign } from 'xstate';

interface TraitementDonnees {
  responsableTraitement: string; // Entreprise/organisme
  typesDonnees: string[]; // identité, coordonnées, données sensibles
  finalites: string[];
  baseJuridique: 'consentement' | 'contrat' | 'obligation-legale' | 'interet-legitime';
  transfertsHorsUE: boolean;
}

interface ProtectionDonneesContext {
  traitement: TraitementDonnees | null;
  registreTraitements: boolean;
  analyseImpact: boolean; // AIPD si risques élevés
  DPODesigne: boolean; // Délégué Protection Données
  politiqueConfidentialite: boolean;
  conformeRGPD: boolean;
}

export const protectionDonneesPersonnellesRGPDMachine = createMachine({
  id: 'protectionDonneesPersonnellesRGPD',
  initial: 'identificationTraitements',
  schemas: {
    context: {} as ProtectionDonneesContext,
    events: {} as
      | { type: 'IDENTIFIER_TRAITEMENTS'; traitement: TraitementDonnees }
      | { type: 'CREER_REGISTRE' }
      | { type: 'REALISER_AIPD' }
      | { type: 'DESIGNER_DPO' }
      | { type: 'REDIGER_POLITIQUE' }
      | { type: 'CONFORMITE_VALIDEE' }
  },
  context: {
    traitement: null,
    registreTraitements: false,
    analyseImpact: false,
    DPODesigne: false,
    politiqueConfidentialite: false,
    conformeRGPD: false,
  },
  states: {
    identificationTraitements: {
      on: {
        IDENTIFIER_TRAITEMENTS: {
          target: 'registreActivitesTraitement',
          actions: assign({ traitement: ({ event }) => event.traitement }),
        },
      },
      meta: {
        description: 'Identification tous traitements données personnelles',
        exemples: [
          'Fichiers clients/employés',
          'Newsletter',
          'Cookies site web',
          'Vidéosurveillance',
        ],
      },
    },
    registreActivitesTraitement: {
      on: {
        CREER_REGISTRE: {
          target: 'analyseRisques',
          actions: assign({ registreTraitements: true }),
        },
      },
      meta: {
        description: 'Registre activités traitement (obligatoire > 250 employés)',
        contenu: [
          'Finalités traitement',
          'Catégories données',
          'Destinataires',
          'Durées conservation',
          'Mesures sécurité',
        ],
      },
    },
    analyseRisques: {
      on: {
        REALISER_AIPD: {
          target: 'designationDPO',
          actions: assign({ analyseImpact: true }),
        },
      },
      meta: {
        description: 'Analyse Impact Protection Données (AIPD) si risques élevés',
        obligatoire: 'Profilage, données sensibles, surveillance systématique',
      },
    },
    designationDPO: {
      on: {
        DESIGNER_DPO: {
          target: 'politiqueConfidentialite',
          actions: assign({ DPODesigne: true }),
        },
      },
      meta: {
        description: 'Désignation Délégué Protection Données (DPO)',
        obligatoire: {
          secteurPublic: 'Oui',
          traitementGrandeEchelle: 'Oui',
          donneesSensibles: 'Oui',
        },
        declaration: 'Déclaration Autorité Protection Données (APD)',
      },
    },
    politiqueConfidentialite: {
      on: {
        REDIGER_POLITIQUE: {
          target: 'mesuresConformite',
          actions: assign({ politiqueConfidentialite: true }),
        },
      },
      meta: {
        description: 'Rédaction politique confidentialité',
        informationsObligatoires: [
          'Identité responsable traitement',
          'Finalités',
          'Base juridique',
          'Destinataires',
          'Durée conservation',
          'Droits personnes concernées (accès, rectification, effacement, portabilité)',
        ],
      },
    },
    mesuresConformite: {
      on: {
        CONFORMITE_VALIDEE: {
          target: 'conforme',
          actions: assign({ conformeRGPD: true }),
        },
      },
      meta: {
        description: 'Mise en place mesures techniques et organisationnelles',
        mesures: [
          'Pseudonymisation/chiffrement',
          'Limitation accès',
          'Sauvegardes',
          'Formation personnel',
          'Procédure violation données',
          'Contrats sous-traitants',
        ],
      },
    },
    conforme: {
      type: 'final',
      meta: {
        description: 'Conformité RGPD établie',
        controles: 'Contrôles APD possibles (sanctions jusqu\'à 4% CA ou 20M€)',
        droitsPersonnes: {
          acces: 'Droit d\'accès (1 mois)',
          rectification: 'Droit rectification',
          effacement: 'Droit à l\'oubli',
          portabilite: 'Droit portabilité',
          opposition: 'Droit opposition',
        },
      },
    },
  },
});
