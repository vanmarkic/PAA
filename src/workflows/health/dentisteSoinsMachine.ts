/**
 * Machine XState pour Soins Dentaires
 * Terminologie: Nomenclature INAMI soins dentaires, DMG dentiste (Dossier Médical Global)
 */

import { createMachine, assign } from 'xstate';

interface PatientDentiste {
  nom: string;
  numeroINAMI: string;
  age: number;
  DMGDentiste: boolean; // Dossier Médical Global chez ce dentiste
  derniereVisite: Date | null;
}

interface SoinsDentairesContext {
  patient: PatientDentiste | null;
  typeConsultation: 'preventif' | 'curatif' | 'orthodontie' | 'esthetique';
  soinsProdiguees: string[];
  montantTotal: number;
  remboursement: number;
  ticketModerateur: number;
}

export const dentisteSoinsMachine = createMachine({
  id: 'dentisteSoins',
  initial: 'consultation',
  schema: {
    context: {} as SoinsDentairesContext,
    events: {} as
      | { type: 'CONSULTER'; patient: PatientDentiste; type: 'preventif' | 'curatif' | 'orthodontie' | 'esthetique' }
      | { type: 'DIAGNOSTIC_ETABLI' }
      | { type: 'DEVIS_PRESENTE'; montant: number }
      | { type: 'SOINS_REALISES'; soins: string[] }
      | { type: 'REMBOURSEMENT_CALCULE'; rembourse: number; ticket: number }
  },
  context: {
    patient: null,
    typeConsultation: 'preventif',
    soinsProdiguees: [],
    montantTotal: 0,
    remboursement: 0,
    ticketModerateur: 0,
  },
  states: {
    consultation: {
      on: {
        CONSULTER: {
          target: 'examenBuccal',
          actions: assign({
            patient: (_, event) => event.patient,
            typeConsultation: (_, event) => event.type,
          }),
        },
      },
      meta: {
        description: 'Consultation dentiste',
        remboursementConsultation: {
          normale: '75% (± 21€ remboursés sur 28€)',
          preventive: '100% si < 18 ans (contrôle annuel)',
        },
      },
    },
    examenBuccal: {
      on: {
        DIAGNOSTIC_ETABLI: { target: 'devis' },
      },
      meta: {
        description: 'Examen complet cavité buccale',
        examens: ['Inspection visuelle', 'Radiographies si nécessaire', 'Sondage parodontal'],
      },
    },
    devis: {
      on: {
        DEVIS_PRESENTE: {
          target: 'soins',
          actions: assign({ montantTotal: (_, event) => event.montant }),
        },
      },
      meta: {
        description: 'Présentation devis si soins importants',
        obligatoire: 'Devis écrit obligatoire > 250€',
      },
    },
    soins: {
      on: {
        SOINS_REALISES: {
          target: 'calculRemboursement',
          actions: assign({ soinsProdiguees: (_, event) => event.soins }),
        },
      },
      meta: {
        description: 'Réalisation soins dentaires',
        soinsCouverts: {
          preventif: 'Détartrage annuel (gratuit < 18 ans)',
          conservateur: 'Plombages, dévitalisations (remb. 75%)',
          extraction: 'Extractions (remb. 75%)',
          prothese: 'Prothèses partiellement remboursées (plafond)',
          orthodontie: 'Remb. uniquement < 15 ans (ou > 15 ans si malformation grave)',
        },
        nonCouverts: ['Blanchiment', 'Facettes esthétiques', 'Implants (hors exceptions)'],
      },
    },
    calculRemboursement: {
      on: {
        REMBOURSEMENT_CALCULE: {
          target: 'termine',
          actions: assign({
            remboursement: (_, event) => event.rembourse,
            ticketModerateur: (_, event) => event.ticket,
          }),
        },
      },
      meta: {
        description: 'Calcul remboursement mutuelle',
        tauxRemboursement: {
          general: '75%',
          preventif: '100% si < 18 ans ou BIM',
          orthodontie: '75% (si < 15 ans)',
          protheses: 'Selon barème INAMI (plafonds)',
        },
        supplementHonoraires: 'Suppléments non remboursés',
      },
    },
    termine: {
      type: 'final',
      meta: {
        description: 'Soins dentaires terminés',
        prevention: {
          controleAnnuel: 'Visite contrôle annuelle recommandée',
          detartrageGratuit: 'Détartrage gratuit/an si < 18 ans',
          sceauFissures: 'Scellement fissures gratuit 6-14 ans',
        },
      },
    },
  },
});
