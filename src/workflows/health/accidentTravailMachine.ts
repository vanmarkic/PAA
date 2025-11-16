import { createMachine, assign } from 'xstate';

/**
 * Machine XState: Accident du travail
 *
 * Base légale: Loi du 10 avril 1971 sur les accidents du travail
 * Compétence: Fedris (Agence fédérale risques professionnels)
 * Indemnisation: 100% salaire (temporaire), rente (permanent)
 *
 * Terminologie consacrée:
 * - "Accident du travail" (définition stricte: événement soudain)
 * - "Incapacité temporaire de travail" - ITT
 * - "Incapacité permanente de travail" - IPT (taux %)
 * - "Assureur loi accidents du travail" (non mutuelle)
 */

interface AccidentTravailContext {
  travailleur: {
    nom: string;
    employeur: string;
    dateAccident: string;
  };
  accident: {
    lieu?: 'travail' | 'trajet' | 'mission';
    description?: string;
    temoin?: boolean;
  };
  lesions?: {
    nature: string;
    gravite: 'legere' | 'grave' | 'très_grave';
  };
  incapacite?: {
    type?: 'temporaire' | 'permanente';
    tauxIPT?: number; // % invalidité permanente
    dureeITT?: number; // jours
  };
  indemnisation?: {
    montantJournalier?: number;
    rente?: number;
  };
}

type AccidentTravailEvent =
  | { type: 'DECLARER_ACCIDENT'; data: AccidentTravailContext }
  | { type: 'EMPLOYEUR_DECLARE' }
  | { type: 'MEDECIN_CONSTATE'; lesions: string }
  | { type: 'INCAPACITE_TEMPORAIRE'; jours: number }
  | { type: 'INCAPACITE_PERMANENTE'; taux: number }
  | { type: 'GUERISON_SANS_SEQUELLES' };

export const accidentTravailMachine = createMachine<
  AccidentTravailContext,
  AccidentTravailEvent
>({
  id: 'accidentTravail',
  initial: 'declaration',
  context: {
    travailleur: {
      nom: '',
      employeur: '',
      dateAccident: '',
    },
    accident: {},
  },
  states: {
    declaration: {
      meta: {
        description: 'Déclaration accident du travail',
        definition_legale: {
          accident: 'Événement soudain (≠ maladie progressive)',
          cause: 'Lien causal avec exécution contrat travail',
          dommage: 'Lésion corporelle ou psychique',
        },
        types_accidents: {
          sur_lieu: 'Accident sur lieu de travail pendant heures travail',
          trajet: 'Accident trajet domicile-travail (chemin normal et raisonnable)',
          mission: 'Accident en mission pour employeur',
        },
        exclusions: [
          'Faute intentionnelle victime (tentative suicide)',
          'Ivresse caractérisée (sauf si sans lien)',
          'Rixe provoquée par victime',
        ],
        delaiDeclaration: {
          travailleur: 'Informer employeur immédiatement (ou 1er jour ouvrable)',
          employeur: 'Déclarer à assureur dans 8 jours (3 jours si décès)',
          sanction: 'Perte indemnités si déclaration tardive sans excuse',
        },
        premiersGestes: {
          urgence: 'Soins urgents si nécessaire (appeler 112)',
          temoin: 'Faire constater par témoins si possible',
          employeur: 'Prévenir employeur IMMÉDIATEMENT',
          medecin: 'Consulter médecin (délivre certificat AT)',
          declaration: 'Remplir formulaire déclaration accident',
        },
      },
      on: {
        DECLARER_ACCIDENT: {
          target: 'expertise',
          actions: assign((context, event) => ({
            ...context,
            ...event.data,
          })),
        },
      },
    },
    expertise: {
      meta: {
        description: 'Expertise médicale et reconnaissance accident',
        assureur: 'Assureur loi accidents du travail (choisi par employeur)',
        medecin_conseil: 'Médecin-conseil de l\'assureur examine victime',
        contstation: 'Possible si désaccord avec médecin-conseil',
        fedris: 'Fedris intervient si litige ou défaut d\'assurance',
        documentsNecessaires: [
          'Déclaration accident (formulaire employeur)',
          'Certificat médical initial (médecin traitant)',
          'Témoignages éventuels',
          'Rapport circonstances (employeur)',
        ],
      },
      on: {
        INCAPACITE_TEMPORAIRE: 'indemnisation_temporaire',
        INCAPACITE_PERMANENTE: 'indemnisation_permanente',
        GUERISON_SANS_SEQUELLES: 'cloture',
      },
    },
    indemnisation_temporaire: {
      meta: {
        description: 'Incapacité Temporaire de Travail (ITT)',
        montants: {
          jour_accident: '100% salaire (jour même)',
          jours_1_a_7: '0% (pas d\'indemnité - employeur peut payer garantie revenu)',
          jours_8_a_28: '90% salaire journalier garanti',
          jour_29_et_suivants: '90% salaire plafonné',
        },
        plafonds2024: {
          salaire_reference: 'Salaire brut plafonné à ± 55.000€/an',
          indemnite_max: '± 135€/jour',
        },
        soins: {
          frais_medicaux: '100% remboursés (pas de ticket modérateur)',
          kine: 'Séances kiné illimitées si prescrites',
          hospitalisation: 'Frais hospitaliers pris en charge',
          protheses: 'Appareillages, prothèses pris en charge',
        },
        obligations: {
          certificats: 'Envoyer certificats médicaux à assureur',
          controles: 'Se soumettre aux contrôles médicaux',
          guerison: 'Notifier consolidation/guérison',
        },
      },
      on: {
        INCAPACITE_PERMANENTE: 'indemnisation_permanente',
        GUERISON_SANS_SEQUELLES: 'cloture',
      },
    },
    indemnisation_permanente: {
      meta: {
        description: 'Incapacité Permanente de Travail (IPT)',
        consolidation: 'État médical stabilisé (fin amélioration)',
        evaluation: 'Médecin-conseil fixe taux IPT (%)',
        bareme: 'Barème officiel lésions (annexe AR)',
        tauxIPT: {
          moins_16_pourcent: 'Indemnité en capital (une fois)',
          '16_pourcent_et_plus': 'Rente viagère mensuelle',
        },
        montantRente: {
          calcul: 'Salaire de base × taux IPT × coefficient âge',
          exemple: 'Salaire 35.000€, IPT 25%, 45 ans → ± 550€/mois viager',
          revalorisation: 'Indexation annuelle automatique',
        },
        indemnite_capital: {
          exemple: 'IPT 10% → capital de ± 8.000-15.000€ selon âge',
        },
        droits_associes: {
          aide_tierce_personne: 'Indemnité si besoin aide quotidienne (IPT élevé)',
          frais_medicaux_futurs: 'Prise en charge soins liés séquelles',
          adaptation_logement: 'Aménagements si handicap lourd',
          reconversion: 'Formation si impossibilité reprendre métier',
        },
      },
      type: 'final',
    },
    cloture: {
      meta: {
        description: 'Guérison sans séquelles permanentes',
        attestation: 'Certificat de guérison médecin',
        reprise_travail: 'Retour au poste (éventuellement adapté)',
        protection: 'Protection contre licenciement (délai selon durée ITT)',
      },
      type: 'final',
    },
  },
});
