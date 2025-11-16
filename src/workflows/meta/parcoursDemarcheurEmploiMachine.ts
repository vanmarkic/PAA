/**
 * META MACHINE - Parcours Citoyen : Perte d'Emploi et Recherche
 *
 * Orchestre toutes les démarches suite à une perte d'emploi
 */

import { createMachine, assign } from 'xstate';

interface Demandeur {
  nom: string;
  age: number;
  joursTravailes: number;
  dernierSalaire: number;
  raisonFinContrat: 'licenciement' | 'fin-cdd' | 'demission' | 'commun-accord';
  situationFamiliale: 'isole' | 'cohabitant-charge' | 'cohabitant';
}

interface DemarchesChomage {
  inscriptionONEM: boolean;
  inscriptionForem: boolean; // ou VDAB/Actiris
  demandeAllocations: boolean;
  cvRedige: boolean;
  formationsPlanifiees: boolean;
  droitRIS: boolean; // Si inéligible chômage
}

interface ParcoursDemarcheurContext {
  demandeur: Demandeur | null;
  demarches: DemarchesChomage;
  montantAllocationEstime: number;
  delaiPaiement: number;
  formationsDisponibles: string[];
  offresEmploi: number;
  warnings: string[];
}

export const parcoursDemandeurEmploiMachine = createMachine({
  id: 'parcoursDemandeurEmploi',
  initial: 'perteEmploi',

  schemas: {
    context: {} as ParcoursDemarcheurContext,
    events: {} as
      | { type: 'EMPLOI_PERDU'; demandeur: Demandeur }
      | { type: 'ONEM_INSCRIT' }
      | { type: 'SERVICE_EMPLOI_INSCRIT' }
      | { type: 'ALLOCATIONS_DEMANDEES' }
      | { type: 'CV_REDIGE' }
      | { type: 'FORMATION_CHOISIE'; formation: string }
      | { type: 'OFFRE_TROUVEE' }
      | { type: 'EMPLOI_RETROUVE' }
      | { type: 'RIS_DEMANDE' }
  },

  context: {
    demandeur: null,
    demarches: {
      inscriptionONEM: false,
      inscriptionForem: false,
      demandeAllocations: false,
      cvRedige: false,
      formationsPlanifiees: false,
      droitRIS: false,
    },
    montantAllocationEstime: 0,
    delaiPaiement: 0,
    formationsDisponibles: [],
    offresEmploi: 0,
    warnings: [],
  },

  states: {
    perteEmploi: {
      on: {
        EMPLOI_PERDU: {
          target: 'inscriptionONEM',
          actions: assign({
            demandeur: ({ event }) => event.demandeur,
            warnings: ({ event }) => {
              const warnings: string[] = [];
              if (event.demandeur.joursTravailes < 312) {
                warnings.push('⚠️ Moins de 312 jours travaillés: risque inéligibilité chômage');
              }
              if (event.demandeur.raisonFinContrat === 'demission') {
                warnings.push('⚠️ Démission: risque exclusion temporaire allocations');
              }
              return warnings;
            },
          }),
        },
      },
      meta: {
        description: 'Perte d\'emploi - démarrage parcours',
        urgence: 'HAUTE - Agir vite pour droits',
      },
    },

    inscriptionONEM: {
      on: {
        ONEM_INSCRIT: {
          target: 'inscriptionServiceEmploi',
          actions: assign({ demarches: ({ context }) => ({
              ...context.demarches,
              inscriptionONEM: true,
            }),
            delaiPaiement: 14, // Délai de carence
          }),
        },
      },
      meta: {
        description: 'Inscription ONEM comme demandeur d\'emploi',
        delaiLegal: '8 jours après fin contrat',
        etapes: [
          '1. Obtenir C4 de l\'employeur (attestation chômage)',
          '2. S\'inscrire en ligne sur site ONEM ou via syndicat',
          '3. Compléter dossier avec: C4, carte identité, IBAN',
        ],
        obligatoire: true,
      },
    },

    inscriptionServiceEmploi: {
      on: {
        SERVICE_EMPLOI_INSCRIT: {
          target: 'demandeAllocations',
          actions: assign({ demarches: ({ context }) => ({
              ...context.demarches,
              inscriptionForem: true,
            }),
            formationsDisponibles: [
              'Formation bureautique',
              'Permis conduire',
              'Langues (néerlandais/anglais)',
              'Reconversion professionnelle',
            ],
          }),
        },
      },
      meta: {
        description: 'Inscription service régional emploi (Forem/VDAB/Actiris)',
        etapes: [
          '1. Inscription en ligne',
          '2. Entretien avec conseiller',
          '3. Plan d\'accompagnement personnalisé',
        ],
        services: {
          wallonie: 'Le Forem',
          flandre: 'VDAB',
          bruxelles: 'Actiris',
        },
      },
    },

    demandeAllocations: {
      on: {
        ALLOCATIONS_DEMANDEES: [
          {
            target: 'recherche EmploiActive',
            guard: (context) => (context.demandeur?.joursTravailes ?? 0) >= 312,
            actions: assign({ demarches: ({ context }) => ({
                ...context.demarches,
                demandeAllocations: true,
              }),
              montantAllocationEstime: (context) => {
                const salaire = context.demandeur?.dernierSalaire ?? 0;
                const situation = context.demandeur?.situationFamiliale;
                // Calcul simplifié: 65% du salaire plafonné
                let montant = salaire * 0.65;
                if (situation === 'isole') montant = Math.min(montant, 1800);
                if (situation === 'cohabitant-charge') montant = Math.min(montant, 1600);
                if (situation === 'cohabitant') montant = Math.min(montant, 1400);
                return Math.round(montant);
              },
            }),
          },
          {
            target: 'verificationDroitRIS',
            actions: assign({ warnings: ({ context }) => [
                ...context.warnings,
                '❌ Inéligible chômage - vérification droit au RIS (CPAS)',
              ],
            }),
          },
        ],
      },
      meta: {
        description: 'Demande allocations de chômage',
        conditions: {
          joursTravailes: '312 jours (21 mois) si < 36 ans',
          age36a49: '468 jours (27 mois)',
          age50plus: '624 jours (36 mois)',
        },
        montants: {
          isole: '65% salaire (max ±1800€/mois)',
          cohabitantCharge: '60% salaire (max ±1600€/mois)',
          cohabitant: '40% salaire (max ±1400€/mois)',
        },
      },
    },

    rechercheEmploiActive: {
      on: {
        CV_REDIGE: {
          target: 'rechercheEmploiActive',
          actions: assign({ demarches: ({ context }) => ({
              ...context.demarches,
              cvRedige: true,
            }),
          }),
        },
        FORMATION_CHOISIE: {
          target: 'rechercheEmploiActive',
          actions: assign({ demarches: ({ context }) => ({
              ...context.demarches,
              formationsPlanifiees: true,
            }),
          }),
        },
        OFFRE_TROUVEE: {
          target: 'candidatureEnCours',
        },
      },
      meta: {
        description: 'Recherche active d\'emploi obligatoire',
        obligations: [
          'Candidatures régulières',
          'Disponibilité immédiate',
          'Accepter emploi convenable',
          'Participer aux contrôles ONEM',
        ],
        outils: [
          'Forem/VDAB/Actiris (offres)',
          'LinkedIn, Indeed, StepStone',
          'Agences intérim',
          'Réseau personnel',
        ],
        formations: 'Formations gratuites via Forem/VDAB/Bruxelles Formation',
      },
    },

    verificationDroitRIS: {
      on: {
        RIS_DEMANDE: {
          target: 'demarchesCPAS',
          actions: assign({ demarches: ({ context }) => ({
              ...context.demarches,
              droitRIS: true,
            }),
            montantAllocationEstime: (context) => {
              // Montants RIS 2024
              const situation = context.demandeur?.situationFamiliale;
              if (situation === 'isole') return 1437;
              if (situation === 'cohabitant-charge') return 1918;
              return 958; // cohabitant
            },
          }),
        },
      },
      meta: {
        description: 'Si inéligible chômage: vérifier droit RIS (Revenu d\'Intégration Sociale)',
        montantsRIS: {
          isole: '1 437€/mois',
          cohabitantCharge: '1 918€/mois',
          cohabitant: '958€/mois',
        },
        etapes: [
          '1. Se rendre au CPAS de votre commune',
          '2. Enquête sociale',
          '3. Décision sous 30 jours',
        ],
      },
    },

    demarchesCPAS: {
      on: {
        OFFRE_TROUVEE: {
          target: 'candidatureEnCours',
        },
      },
      meta: {
        description: 'Accompagnement CPAS et recherche emploi',
        aidesCPAS: [
          'RIS mensuel',
          'Aide médicale',
          'Aide énergie',
          'Aide au logement',
          'Accompagnement social',
        ],
      },
    },

    candidatureEnCours: {
      on: {
        EMPLOI_RETROUVE: {
          target: 'emploiRetrouve',
        },
        OFFRE_TROUVEE: {
          target: 'candidatureEnCours', // Nouvelle candidature
        },
      },
      meta: {
        description: 'Processus de candidature en cours',
      },
    },

    emploiRetrouve: {
      type: 'final',
      meta: {
        description: 'Emploi retrouvé - fin du parcours chômage',
        formalites: [
          '1. Prévenir ONEM/syndicat immédiatement',
          '2. Arrêt allocations au début nouveau contrat',
          '3. Conserver droits chômage si contrat temporaire < 3 mois',
        ],
        conseil: 'En cas de nouveau licenciement, droits rechargés automatiquement',
      },
    },
  },
});

/**
 * Flux parcours demandeur d'emploi:
 *
 * Perte emploi → Inscription ONEM (8j) → Inscription Forem/VDAB → Allocations
 *   (urgence!)        (obligatoire)        (accompagnement)      ↓
 *                                                           Si éligible (312j)
 *                                                                 ↓
 *                                                    Recherche active + formations
 *                                                                 ↓
 *                                                         Candidatures → Emploi !
 *
 * Si inéligible chômage → Vérif RIS → CPAS → Accompagnement
 *
 * Montants estimés:
 * - Chômage: 40-65% salaire (max 1400-1800€ selon situation)
 * - RIS: 958-1918€ selon situation familiale
 */
