/**
 * Machine XState pour Certificat PEB (Performance Énergétique Bâtiment)
 */

import { createMachine, assign } from 'xstate';

interface BienImmobilier {
  adresse: string;
  type: 'maison' | 'appartement' | 'immeuble';
  anneeConstruction: number;
}

interface CertificatPEBContext {
  bien: BienImmobilier | null;
  certificateurAgree: string | null;
  scorePEB: string | null; // A+, A, B, C, D, E, F, G
  consommationKwhM2: number;
  recommandationsAmelioration: string[];
  certificatValide: boolean;
}

export const certificatPEBMachine = createMachine({
  id: 'certificatPEB',
  initial: 'demandeCertificat',
  schemas: {
    context: {} as CertificatPEBContext,
    events: {} as
      | { type: 'DEMANDER'; bien: BienImmobilier }
      | { type: 'CERTIFICATEUR_DESIGNE'; nom: string }
      | { type: 'VISITE_EFFECTUEE' }
      | { type: 'CALCUL_REALISE'; score: string; consommation: number }
      | { type: 'CERTIFICAT_EMIS' }
  },
  context: {
    bien: null,
    certificateurAgree: null,
    scorePEB: null,
    consommationKwhM2: 0,
    recommandationsAmelioration: [],
    certificatValide: false,
  },
  states: {
    demandeCertificat: {
      on: {
        DEMANDER: {
          target: 'designationCertificateur',
          actions: assign({ bien: ({ event }) => event.bien }),
        },
      },
      meta: { description: 'Demande certificat PEB (obligatoire vente/location)' },
    },
    designationCertificateur: {
      on: {
        CERTIFICATEUR_DESIGNE: {
          target: 'visiteBatiment',
          actions: assign({ certificateurAgree: ({ event }) => event.nom }),
        },
      },
      meta: { description: 'Choix certificateur agréé (liste régionale)' },
    },
    visiteBatiment: {
      on: {
        VISITE_EFFECTUEE: { target: 'calculPEB' },
      },
      meta: { description: 'Visite certificateur: isolation, châssis, chauffage, ventilation' },
    },
    calculPEB: {
      on: {
        CALCUL_REALISE: {
          target: 'emissionCertificat',
          actions: assign({
            scorePEB: ({ event }) => event.score,
            consommationKwhM2: ({ event }) => event.consommation,
            recommandationsAmelioration: [
              'Isolation toiture',
              'Double vitrage',
              'Chaudière condensation',
              'Panneaux solaires',
            ],
          }),
        },
      },
      meta: { description: 'Calcul selon logiciel officiel' },
    },
    emissionCertificat: {
      on: {
        CERTIFICAT_EMIS: {
          target: 'termine',
          actions: assign({ certificatValide: true }),
        },
      },
      meta: { description: 'Émission certificat PEB (validité 10 ans)' },
    },
    termine: {
      type: 'final',
      meta: { description: 'Certificat PEB valide - obligatoire annonce vente/location' },
    },
  },
});
