/**
 * Machine XState pour Installation Alarme Habitation
 * Terminologie: Système d'alarme anti-intrusion, centrale d'alarme agréée
 */

import { createMachine, assign } from 'xstate';

interface SystemeAlarme {
  typeAlarme: 'filaire' | 'sans-fil' | 'mixte';
  detecteurs: number;
  camerasVideo: boolean;
  transmissionCentrale: boolean; // Connexion centrale alarme agréée
  installateur: 'certifie' | 'auto-installation';
}

interface InstallationAlarmeContext {
  systeme: SystemeAlarme | null;
  devisEtabli: boolean;
  installationRealisee: boolean;
  raccordementCentrale: boolean;
  reductionPrimeAssurance: boolean;
  conformiteReglementaire: boolean;
}

export const installationAlarmeHabitationMachine = createMachine({
  id: 'installationAlarmeHabitation',
  initial: 'evaluationBesoins',
  schemas: {
    context: {} as InstallationAlarmeContext,
    events: {} as
      | { type: 'EVALUER'; systeme: SystemeAlarme }
      | { type: 'DEVIS_ACCEPTE' }
      | { type: 'INSTALLER' }
      | { type: 'RACCORDER_CENTRALE' }
      | { type: 'DECLARER_ASSURANCE' }
      | { type: 'SYSTEME_OPERATIONNEL' }
  },
  context: {
    systeme: null,
    devisEtabli: false,
    installationRealisee: false,
    raccordementCentrale: false,
    reductionPrimeAssurance: false,
    conformiteReglementaire: false,
  },
  states: {
    evaluationBesoins: {
      on: {
        EVALUER: {
          target: 'devisInstallation',
          actions: assign({ systeme: ({ event }) => event.systeme }),
        },
      },
      meta: {
        description: 'Évaluation besoins sécurité habitation',
        elements: [
          'Détecteurs mouvement',
          'Contacts portes/fenêtres',
          'Détecteurs bris vitre',
          'Sirène intérieure/extérieure',
          'Centrale alarme',
        ],
      },
    },
    devisInstallation: {
      on: {
        DEVIS_ACCEPTE: {
          target: 'installation',
          actions: assign({ devisEtabli: true }),
        },
      },
      meta: {
        description: 'Devis installation par professionnel agréé',
        cout: {
          basique: '800-1 500€',
          moyenne: '1 500-3 000€',
          complete: '> 3 000€',
        },
      },
    },
    installation: {
      on: {
        INSTALLER: {
          target: 'raccordementCentrale',
          actions: assign({ installationRealisee: true }),
        },
      },
      meta: {
        description: 'Installation système alarme',
        recommandation: 'Installateur certifié INCERT (assurance)',
      },
    },
    raccordementCentrale: {
      on: {
        RACCORDER_CENTRALE: {
          target: 'declarationAssurance',
          actions: assign({ raccordementCentrale: true }),
        },
      },
      meta: {
        description: 'Raccordement centrale alarme agréée (optionnel)',
        avantages: [
          'Intervention rapide si alarme',
          'Surveillance 24/7',
          'Réduction prime assurance',
        ],
        coutAbonnement: '20-40€/mois',
      },
    },
    declarationAssurance: {
      on: {
        DECLARER_ASSURANCE: {
          target: 'systemeActif',
          actions: assign({
            reductionPrimeAssurance: true,
            conformiteReglementaire: true,
          }),
        },
      },
      meta: {
        description: 'Déclaration système alarme à assurance habitation',
        reduction: '5-15% prime annuelle',
        obligationLegale: 'Autocollant "alarme" visible (AR 25/04/2007)',
      },
    },
    systemeActif: {
      on: {
        SYSTEME_OPERATIONNEL: { target: 'termine' },
      },
      meta: {
        description: 'Système alarme opérationnel',
        maintenance: 'Vérification annuelle recommandée',
      },
    },
    termine: {
      type: 'final',
      meta: {
        description: 'Alarme installée et fonctionnelle',
        obligationsLegales: {
          autocollant: 'Autocollants dissuasifs obligatoires',
          faussesAlarmes: 'Limite 3 fausses alarmes/an (police)',
          RGPD: 'Si caméras: respect RGPD + information voisinage',
        },
      },
    },
  },
});
