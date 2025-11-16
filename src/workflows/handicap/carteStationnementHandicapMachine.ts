import { createMachine, assign } from 'xstate';

/**
 * Machine XState: Demande de carte de stationnement pour personnes handicapées
 *
 * Base légale: AR 4 août 1981 relatif à la carte de stationnement pour handicapés
 * Compétence: SPF Sécurité sociale - DG Personnes handicapées
 *
 * Terminologie consacrée:
 * - "Carte de stationnement" (non "carte handicapé")
 * - "Perte d'autonomie" (critère médical)
 * - "Commission médico-technique" (évaluation)
 */

interface CarteStationnementContext {
  demandeur: {
    nom: string;
    registreNational: string;
    adresse: string;
  };
  handicap: {
    naturePerte?: string; // Motrice, visuelle, cognitive
    pourcentageAutonomie?: number; // % perte d'autonomie
    mobilitePropre?: boolean; // Peut se déplacer seul > 200m
  };
  documents: {
    certificatMedical?: boolean;
    photoIdentite?: boolean;
    copieIdentite?: boolean;
  };
  decision?: {
    accordee: boolean;
    validiteAnnees?: number; // 1, 3, 5 ans ou illimitée
    motifRefus?: string;
  };
  numeroReference?: string;
}

type CarteStationnementEvent =
  | { type: 'SOUMETTRE_DEMANDE'; data: CarteStationnementContext }
  | { type: 'EVALUATION_FAVORABLE' }
  | { type: 'EVALUATION_DEFAVORABLE'; motif: string }
  | { type: 'RECOURS' }
  | { type: 'RENOUVELER' }
  | { type: 'DELIVRER_CARTE' };

export const carteStationnementHandicapMachine = createMachine({
  id: 'carteStationnementHandicap',
  initial: 'preparation',
  context: {
    demandeur: {
      nom: '',
      registreNational: '',
      adresse: '',
    },
    handicap: {},
    documents: {},
  },
  states: {
    preparation: {
      meta: {
        description: 'Préparation dossier demande carte stationnement',
        documentsNecessaires: [
          'Formulaire demande (téléchargeable SPF)',
          'Certificat médical modèle type (annexé au formulaire)',
          '2 photos d\'identité récentes',
          'Copie recto-verso carte d\'identité',
        ],
        criteres: {
          moteurs: 'Perte autonomie déplacement > 200m',
          visuels: 'Acuité visuelle < 1/20 (les deux yeux)',
          cognitifs: 'Désorientation importante',
          cardiaques: 'Insuffisance cardiaque sévère (NYHA III-IV)',
          respiratoires: 'Insuffisance respiratoire chronique grave',
        },
        remarque: 'Médecin doit utiliser UNIQUEMENT le formulaire type SPF',
      },
      on: {
        SOUMETTRE_DEMANDE: {
          target: 'evaluation',
          actions: assign(({ context, event }) => ({
            ...context,
            ...event.data,
            numeroReference: `STAT-${Date.now()}`,
          })),
        },
      },
    },
    evaluation: {
      meta: {
        description: 'Évaluation par la Commission médico-technique',
        delai: '3 mois maximum (souvent 6-8 semaines)',
        autorite: 'DG Personnes handicapées - Commission médico-technique',
        criteresPrincipaux: {
          marcheDifficile: 'Incapacité marcher 200m sans aide',
          aidesTechniques: 'Besoin permanent fauteuil, déambulateur, cannes',
          affectionCardiaque: 'Classe fonctionnelle NYHA III ou IV',
          affectionRespiratoire: 'VEMS < 40% valeur théorique',
          cecite: 'Acuité visuelle centrale < 1/20 aux deux yeux',
        },
      },
      on: {
        EVALUATION_FAVORABLE: 'decision',
        EVALUATION_DEFAVORABLE: 'refus',
      },
    },
    decision: {
      meta: {
        description: 'Décision d\'octroi avec durée de validité',
        dureesValidite: {
          un_an: 'Handicap temporaire ou évolutif',
          trois_ans: 'Handicap stabilisé mais réévaluation nécessaire',
          cinq_ans: 'Handicap permanent mais contrôle périodique',
          illimitee: 'Handicap définitif et irréversible (ex: amputation)',
        },
        notification: 'Lettre recommandée avec décision motivée',
      },
      on: {
        DELIVRER_CARTE: 'actif',
      },
    },
    actif: {
      meta: {
        description: 'Carte de stationnement délivrée et valide',
        caracteristiques: {
          format: 'Carte européenne bleue avec pictogramme fauteuil roulant',
          usage: 'Zone bleue illimitée, places réservées handicapés',
          nominative: 'Utilisable uniquement si titulaire dans véhicule',
          sanctions: 'Amende 116€ si usage frauduleux (+ retrait)',
        },
        droits: [
          'Stationnement illimité en zone bleue',
          'Stationnement sur emplacements réservés handicapés',
          'Dérogation limitations temporelles certaines zones',
          'Valable dans toute l\'UE (modèle européen)',
        ],
        obligations: [
          'Carte doit être visible de l\'extérieur (tableau de bord)',
          'Titulaire doit être présent dans véhicule (conducteur ou passager)',
          'Respecter limitations propres aux emplacements handicapés',
        ],
      },
      on: {
        RENOUVELER: 'preparation',
      },
    },
    refus: {
      meta: {
        description: 'Demande refusée - critères non remplis',
        motifsFrequents: [
          'Perte d\'autonomie insuffisante (peut marcher > 200m)',
          'Certificat médical incomplet ou non conforme',
          'Handicap temporaire trop court (< 6 mois)',
          'Situation médicale ne correspond pas aux critères AR',
        ],
        notification: 'Lettre recommandée avec motivation détaillée',
        delaiRecours: '3 mois à dater de la notification',
      },
      on: {
        RECOURS: 'recours',
      },
    },
    recours: {
      meta: {
        description: 'Recours devant Tribunal du travail',
        procedure: {
          etape1: 'Introduire requête auprès greffe Tribunal du travail compétent',
          etape2: 'Joindre nouveaux éléments médicaux si disponibles',
          etape3: 'Audience fixée (délai variable 6-18 mois)',
          etape4: 'Jugement contraignant pour l\'administration',
        },
        tribunalCompetent: 'Tribunal du travail du domicile du demandeur',
        gratuite: 'Procédure gratuite (pas de frais justice)',
        assistanceJuridique: 'Aide juridique possible si revenus faibles',
      },
      on: {
        EVALUATION_FAVORABLE: 'decision',
      },
    },
  },
});
