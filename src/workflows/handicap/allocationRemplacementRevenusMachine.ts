import { createMachine, assign } from 'xstate';

/**
 * Machine XState: Allocation de Remplacement de Revenus (ARR)
 *
 * Base légale: Loi 27 février 1987 relative aux allocations aux personnes handicapées
 * Compétence: SPF Sécurité sociale - DG Personnes handicapées
 * Montants 2024: Catégorie A (2.043,19€), B (1.534,79€), C (1.226,14€)
 *
 * Terminologie consacrée:
 * - "Allocation de Remplacement de Revenus" - ARR (non "allocation handicap")
 * - "Réduction de la capacité de gain" (critère légal - non "taux handicap")
 * - "Catégorie" A/B/C selon composition de ménage
 */

interface ARRContext {
  demandeur: {
    nom: string;
    dateNaissance: string;
    registreNational: string;
    age?: number;
  };
  handicap: {
    reductionCapaciteGain?: number; // % réduction capacité de gain (min 66%)
    dateDebut?: string;
    natureHandicap?: string;
  };
  situation: {
    categorie?: 'A' | 'B' | 'C';
    menage?: 'isole' | 'cohabitant' | 'famille_a_charge';
    revenus?: {
      propres: number;
      conjoint?: number;
      plafondDepassement?: boolean;
    };
  };
  montantMensuel?: number;
  decision?: {
    accordee: boolean;
    categorieOctroyee?: 'A' | 'B' | 'C';
    dateEffet?: string;
    motifRefus?: string;
  };
}

type ARREvent =
  | { type: 'SOUMETTRE_DEMANDE'; data: ARRContext }
  | { type: 'EVALUATION_MEDICALE_FAVORABLE'; reductionCapaciteGain: number }
  | { type: 'EVALUATION_MEDICALE_DEFAVORABLE' }
  | { type: 'ENQUETE_SOCIALE_TERMINEE'; categorie: 'A' | 'B' | 'C' }
  | { type: 'DECISION_OCTROI'; montant: number }
  | { type: 'DECISION_REFUS'; motif: string }
  | { type: 'RECOURS' }
  | { type: 'REVISION'; nouveauMontant: number };

export const allocationRemplacementRevenusMachine = createMachine<
  ARRContext,
  ARREvent
>({
  id: 'allocationRemplacementRevenus',
  initial: 'verification',
  context: {
    demandeur: {
      nom: '',
      dateNaissance: '',
      registreNational: '',
    },
    handicap: {},
    situation: {},
  },
  states: {
    verification: {
      meta: {
        description: 'Vérification conditions d\'accès ARR',
        conditionsGenerales: {
          age: 'Entre 21 ans et âge pension légale (65-67 ans selon cohorte)',
          residence: 'Résidence effective en Belgique',
          nationalite: 'Belge, UE, apatride, ou titre séjour illimité',
          capaciteGain: 'Réduction capacité de gain minimum 66%',
        },
        exceptions: {
          ageInferieur: 'Dès 18 ans si plus à charge des parents',
          prolongation: 'Jusqu\'à 65 ans (cohorte née avant 1956)',
        },
        remarque: 'ARR = allocation PRINCIPALE (pas cumul avec AI)',
      },
      on: {
        SOUMETTRE_DEMANDE: {
          target: 'evaluationMedicale',
          actions: assign((context, event) => ({
            ...context,
            ...event.data,
          })),
        },
      },
    },
    evaluationMedicale: {
      meta: {
        description: 'Évaluation réduction capacité de gain par médecin SPF',
        critere: 'Réduction capacité de gain à minimum 66%',
        definition: {
          capaciteGain: 'Aptitude à se procurer revenus par travail sur marché général emploi',
          evaluation: 'Tient compte de TOUTES les affections (physiques, mentales, sensorielles)',
          bareme: 'Guide-barème officiel médical SPF (non public)',
        },
        delai: '6 mois en moyenne (peut être 3-12 mois)',
        medecin: 'Médecin de la DG Personnes handicapées (examen obligatoire)',
        remarques: [
          'Pas de certificat médecin traitant suffisant',
          'Convocation pour examen médical SPF obligatoire',
          'Évaluation globale situation médicale (pas somme %)',
        ],
      },
      on: {
        EVALUATION_MEDICALE_FAVORABLE: {
          target: 'enqueteSociale',
          actions: assign({
            handicap: (context, event) => ({
              ...context.handicap,
              reductionCapaciteGain: event.reductionCapaciteGain,
            }),
          }),
        },
        EVALUATION_MEDICALE_DEFAVORABLE: 'refusMedical',
      },
    },
    enqueteSociale: {
      meta: {
        description: 'Enquête sociale pour déterminer catégorie A/B/C',
        categories: {
          A: {
            definition: 'Personne isolée OU ménage avec personne à charge',
            montant2024: '2.043,19 € / mois',
            personneACharge: 'Conjoint sans revenus propres OU enfant à charge',
          },
          B: {
            definition: 'Personne cohabitant sans personne à charge',
            montant2024: '1.534,79 € / mois',
            cohabitant: 'Vit avec une ou plusieurs personnes (pas seul)',
          },
          C: {
            definition: 'Personne isolée vivant seule',
            montant2024: '1.226,14 € / mois',
            remarque: 'Catégorie la plus courante (célibataire vivant seul)',
          },
        },
        plafondsRevenus: {
          revenus_propres: 'Max 6.177,02 €/an (exonération)',
          revenus_conjoint: 'Max 24.708,09 €/an (si catégorie A)',
          indexation: 'Montants indexés annuellement',
        },
        assistantSocial: 'Visite à domicile par assistant social SPF',
      },
      on: {
        ENQUETE_SOCIALE_TERMINEE: {
          target: 'decision',
          actions: assign({
            situation: (context, event) => ({
              ...context.situation,
              categorie: event.categorie,
            }),
          }),
        },
      },
    },
    decision: {
      meta: {
        description: 'Décision d\'octroi avec catégorie et montant',
        notification: 'Lettre recommandée avec motivation détaillée',
        effetRetroactif: 'Maximum 12 mois avant la demande (si handicap antérieur)',
        delaiTotal: '6-12 mois entre demande et décision',
      },
      on: {
        DECISION_OCTROI: {
          target: 'paiement',
          actions: assign({
            montantMensuel: (context, event) => event.montant,
            decision: {
              accordee: true,
              dateEffet: new Date().toISOString().split('T')[0],
            },
          }),
        },
        DECISION_REFUS: {
          target: 'refus',
          actions: assign({
            decision: (context, event) => ({
              accordee: false,
              motifRefus: event.motif,
            }),
          }),
        },
      },
    },
    paiement: {
      meta: {
        description: 'Paiement mensuel ARR',
        modalites: {
          frequence: 'Mensuel (le 5 du mois)',
          virement: 'Compte bancaire belge (IBAN obligatoire)',
          indexation: 'Automatique selon index santé',
        },
        obligations: {
          declarationRevenus: 'Annuelle (revenus propres + conjoint)',
          changementSituation: 'Notification dans 30 jours (mariage, déménagement, revenus)',
          controles: 'Contrôles médicaux périodiques (révision possible)',
        },
        cumuls: {
          ARR_AI: 'NON cumulable (choix plus avantageux)',
          ARR_GRAPA: 'NON cumulable',
          ARR_allocFamiliales: 'OUI cumulable',
          ARR_mutuellePrimaire: 'OUI cumulable',
        },
        fiscalite: 'ARR est IMPOSABLE (déclaration impôts)',
      },
      on: {
        REVISION: {
          target: 'paiement',
          actions: assign({
            montantMensuel: (context, event) => event.nouveauMontant,
          }),
        },
      },
    },
    refusMedical: {
      meta: {
        description: 'Refus car réduction capacité gain < 66%',
        motif: 'Réduction capacité de gain inférieure au seuil légal de 66%',
        alternative: 'Vérifier éligibilité Allocation d\'Intégration (AI) si handicap 9+ points',
      },
      on: {
        RECOURS: 'recours',
      },
    },
    refus: {
      meta: {
        description: 'Refus ARR - autres motifs',
        motifsFrequents: [
          'Revenus dépassent les plafonds autorisés',
          'Âge hors limites (< 21 ans ou > âge pension)',
          'Pas de résidence effective en Belgique',
          'Réduction capacité gain < 66%',
        ],
      },
      on: {
        RECOURS: 'recours',
      },
    },
    recours: {
      meta: {
        description: 'Recours devant Tribunal du travail',
        delai: '3 mois à dater de la notification de la décision',
        procedure: {
          depot: 'Requête au greffe du Tribunal du travail',
          gratuite: 'Pas de droits de greffe ni timbres',
          expertiseMedicale: 'Possible si contestation évaluation médicale',
          jugement: 'Contraignant pour l\'administration',
        },
        assistanceJuridique: 'Aide juridique gratuite si revenus < seuil',
        delaiJugement: '12-24 mois en moyenne',
      },
      on: {
        EVALUATION_MEDICALE_FAVORABLE: 'enqueteSociale',
      },
    },
  },
});
