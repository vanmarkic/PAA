/**
 * META MACHINE - Parcours Citoyen : Création d'Entreprise
 *
 * Orchestre toutes les démarches pour créer une entreprise en Belgique
 * du point de vue de l'entrepreneur citoyen.
 */

import { createMachine, assign } from 'xstate';

interface Entrepreneur {
  nom: string;
  situationActuelle: 'salarie' | 'chomeur' | 'etudiant' | 'independant';
  capitalDisponible: number;
}

interface ProjetEntreprise {
  formeJuridique: 'SRL' | 'SA' | 'independant' | 'ASBL' | 'SC';
  secteurActivite: string;
  investissementInitial: number;
}

interface EtapesCompletees {
  formationGestion: boolean;
  planAffaires: boolean;
  financementSecurise: boolean;
  guichetEntreprise: boolean;
  compteBancaire: boolean;
  numeroTVA: boolean;
  caisseAssurances: boolean;
  autorisationsSpecifiques: boolean;
}

interface ParcoursCreationContext {
  entrepreneur: Entrepreneur | null;
  projet: ProjetEntreprise | null;
  etapesCompletees: EtapesCompletees;
  numeroEntreprise: string | null;
  couts: Array<{ libelle: string; montant: number }>;
  aidesObtenues: Array<{ type: string; montant: number }>;
  delaiEstime: number;
  warnings: string[];
}

export const parcoursCreationEntrepriseMachine = createMachine({
  id: 'parcoursCreationEntreprise',
  initial: 'ideationProjet',

  schemas: {
    context: {} as ParcoursCreationContext,
    events: {} as
      | { type: 'PROJET_DEFINI'; entrepreneur: Entrepreneur; projet: ProjetEntreprise }
      | { type: 'FORMATION_VALIDEE' }
      | { type: 'PLAN_AFFAIRES_VALIDE' }
      | { type: 'FINANCEMENT_OBTENU'; montant: number }
      | { type: 'COMPTE_OUVERT' }
      | { type: 'GUICHET_COMPLETE'; numeroEntreprise: string }
      | { type: 'TVA_ACTIVEE' }
      | { type: 'CAISSE_AFFILIEE' }
      | { type: 'AUTORISATIONS_OBTENUES' }
      | { type: 'WARNING'; message: string }
  },

  context: {
    entrepreneur: null,
    projet: null,
    etapesCompletees: {
      formationGestion: false,
      planAffaires: false,
      financementSecurise: false,
      guichetEntreprise: false,
      compteBancaire: false,
      numeroTVA: false,
      caisseAssurances: false,
      autorisationsSpecifiques: false,
    },
    numeroEntreprise: null,
    couts: [],
    aidesObtenues: [],
    delaiEstime: 90,
    warnings: [],
  },

  states: {
    ideationProjet: {
      on: {
        PROJET_DEFINI: {
          target: 'formationGestion',
          actions: assign({
            entrepreneur: ({ event }: { event: any }) => event.entrepreneur,
            projet: ({ event }: { event: any }) => event.projet,
          }),
        },
      },
      meta: {
        description: 'Définition du projet entrepreneurial',
        questions: [
          'Quelle forme juridique? (indépendant, SRL, SA...)',
          'Quel secteur d\'activité?',
          'Quel investissement initial nécessaire?',
          'Compétences entrepreneuriales acquises?',
        ],
        conseil: 'Consulter un guichet d\'entreprise pour conseil gratuit',
      },
    },

    formationGestion: {
      on: {
        FORMATION_VALIDEE: {
          target: 'elaborationPlanAffaires',
          actions: assign({ etapesCompletees: ({ context }: { context: any }) => ({
              ...context.etapesCompletees,
              formationGestion: true,
            }),
            couts: ({ context }: { context: any }) => [
              ...context.couts,
              { libelle: 'Formation gestion base', montant: 700 },
            ],
          }),
        },
        WARNING: {
          target: 'formationGestion',
          actions: assign({
            warnings: ({ context, event }: { context: any; event: any }) => [...context.warnings, event.message],
          }),
        },
      },
      meta: {
        description: 'Connaissances gestion de base OBLIGATOIRES',
        formation: {
          diplomeGestion: 'Dispense si diplôme commercial/gestion',
          formationCourte: '3 jours minimum (entreprenariat, comptabilité, législation)',
          cout: '±700€',
          ou: 'Jury central (gratuit mais examen)',
        },
        obligatoire: true,
        secteursSpecifiques: {
          horeca: 'Formation spécifique AFSCA + alcool',
          construction: 'Accès à la profession',
        },
      },
    },

    elaborationPlanAffaires: {
      on: {
        PLAN_AFFAIRES_VALIDE: {
          target: 'rechercheFinancement',
          actions: assign({ etapesCompletees: ({ context }: { context: any }) => ({
              ...context.etapesCompletees,
              planAffaires: true,
            }),
          }),
        },
      },
      meta: {
        description: 'Rédaction business plan',
        contenu: [
          'Executive summary',
          'Étude de marché',
          'Plan marketing',
          'Plan opérationnel',
          'Plan financier (3 ans obligatoire SRL/SA)',
        ],
        aide: 'Service 1819 (Bruxelles), Sowalfin (Wallonie), VLAIO (Flandre)',
        gratuit: true,
      },
    },

    rechercheFinancement: {
      on: {
        FINANCEMENT_OBTENU: {
          target: 'ouvertureCompteBancaire',
          actions: assign({ etapesCompletees: ({ context }: { context: any }) => ({
              ...context.etapesCompletees,
              financementSecurise: true,
            }),
            aidesObtenues: ({ context, event }: { context: any; event: any }) => [
              ...context.aidesObtenues,
              { type: 'Financement obtenu', montant: event.montant },
            ],
          }),
        },
      },
      meta: {
        description: 'Financement du projet',
        options: {
          fondsPersonnels: 'Épargne, famille',
          creditBancaire: 'Prêt professionnel',
          microCredit: 'Microstart (sans garantie)',
          subsides: 'Chèques entreprise, primes régionales',
          crowdfunding: 'Financement participatif',
          businessAngels: 'Investisseurs privés',
        },
        aidesRegionales: [
          'Bourse de préactivité (Wallonie): max 12.500€',
          'Chèque création (Bruxelles): max 15.000€',
          'Subsides VLAIO (Flandre)',
          'Garantie Région pour crédit',
        ],
      },
    },

    ouvertureCompteBancaire: {
      on: {
        COMPTE_OUVERT: {
          target: 'guichetEntreprise',
          actions: assign({ etapesCompletees: ({ context }: { context: any }) => ({
              ...context.etapesCompletees,
              compteBancaire: true,
            }),
            couts: ({ context }: { context: any }) => [
              ...context.couts,
              { libelle: 'Compte professionnel', montant: 15 },
            ],
          }),
        },
      },
      meta: {
        description: 'Compte bancaire professionnel',
        obligatoire: 'SRL, SA (dépôt capital social)',
        documents: [
          'Carte d\'identité',
          'Plan financier',
          'Projet statuts (SRL/SA)',
        ],
        cout: '±15€/mois gestion compte',
      },
    },

    guichetEntreprise: {
      on: {
        GUICHET_COMPLETE: {
          target: 'activationTVA',
          actions: assign({ etapesCompletees: ({ context }: { context: any }) => ({
              ...context.etapesCompletees,
              guichetEntreprise: true,
            }),
            numeroEntreprise: ({ event }: { event: any }) => event.numeroEntreprise,
            couts: ({ context }: { context: any }) => [
              ...context.couts,
              { libelle: 'Inscription BCE', montant: 95 },
              { libelle: 'Extrait BCE', montant: 10 },
            ],
          }),
        },
      },
      meta: {
        description: 'Guichet d\'entreprise agréé',
        etapes: [
          '1. Choisir guichet (Partena, UCM, Securex, Acerta...)',
          '2. Fournir dossier complet',
          '3. Immatriculation BCE (Banque-Carrefour Entreprises)',
          '4. Obtenir numéro d\'entreprise (10 chiffres)',
        ],
        documents: [
          'Certificat gestion',
          'Diplômes',
          'Plan financier',
          'Statuts (SRL/SA)',
          'Compte bancaire',
        ],
        couts: '±95€ + 10€ extrait',
        delai: '1 jour ouvrable',
      },
    },

    activationTVA: {
      on: {
        TVA_ACTIVEE: {
          target: 'affiliationCaisseAssurances',
          actions: assign({ etapesCompletees: ({ context }: { context: any }) => ({
              ...context.etapesCompletees,
              numeroTVA: true,
            }),
          }),
        },
      },
      meta: {
        description: 'Activation numéro TVA',
        etapes: [
          '1. Via guichet entreprise ou MyMinfin',
          '2. Obtenir numéro TVA (BE 0xxx.xxx.xxx)',
          '3. Obligation déclarations TVA (mensuel/trimestriel)',
        ],
        franchiseTVA: 'Dispense si CA < 25.000€/an (sauf certains secteurs)',
        gratuit: true,
      },
    },

    affiliationCaisseAssurances: {
      on: {
        CAISSE_AFFILIEE: {
          target: 'autorisationsSpecifiques',
          actions: assign({ etapesCompletees: ({ context }: { context: any }) => ({
              ...context.etapesCompletees,
              caisseAssurances: true,
            }),
            couts: ({ context }: { context: any }) => [
              ...context.couts,
              { libelle: 'Cotisations sociales trimestrielles provisoires', montant: 800 },
            ],
          }),
        },
      },
      meta: {
        description: 'Caisse d\'assurances sociales indépendants',
        obligatoire: true,
        delai: '90 jours après début activité',
        caisses: [
          'Xerius',
          'Acerta',
          'Liantis',
          'Partena',
          'UCM',
          'Securex',
          'Caisse libre (INASTI)',
        ],
        cotisations: {
          provisoires: '±800€/trimestre la 1ère année',
          definitives: '20,5% du revenu net (régularisation année N+2)',
        },
      },
    },

    autorisationsSpecifiques: {
      on: {
        AUTORISATIONS_OBTENUES: {
          target: 'entrepriseOperationnelle',
          actions: assign({ etapesCompletees: ({ context }: { context: any }) => ({
              ...context.etapesCompletees,
              autorisationsSpecifiques: true,
            }),
          }),
        },
      },
      meta: {
        description: 'Autorisations sectorielles (si nécessaire)',
        exemples: {
          horeca: 'Licence exploitation, formation AFSCA',
          construction: 'Accès profession, enregistrement',
          transport: 'Licence transport',
          sante: 'Agréments spécifiques',
          environnement: 'Permis d\'environnement',
        },
        variable: 'Selon secteur activité',
      },
    },

    entrepriseOperationnelle: {
      type: 'final',
      meta: {
        description: 'Entreprise créée et prête à démarrer !',
        recapitulatif: [
          '✓ Formation gestion validée',
          '✓ Plan d\'affaires rédigé',
          '✓ Financement sécurisé',
          '✓ Compte bancaire ouvert',
          '✓ Numéro d\'entreprise BCE',
          '✓ Numéro TVA activé',
          '✓ Caisse assurances sociales',
          '✓ Autorisations obtenues',
        ],
        coutsEstimes: {
          minimum: '±1.000€ (indépendant)',
          SRL: '±2.500€ (notaire inclus)',
          SA: '±5.000€',
        },
        delaiMoyen: '2-3 mois',
        prochainesEtapes: [
          'Comptabilité: tenir livres comptables ou engager comptable',
          'Déclarations TVA (si assujetti)',
          'Déclarations IPP (impôts)',
          'Assurances: RC professionnelle, protection juridique',
          'Site web et marketing',
          'Facturation: logiciel conforme',
        ],
        aidesApres: [
          'Tremplin indépendants (si ex-chômeur): allocation transition',
          'Dispense cotisations sociales (si revenu faible)',
          'Subsides régionaux post-création',
        ],
      },
    },
  },
});

/**
 * Visualisation parcours entrepreneurial:
 *
 * Idée → Formation → Plan Affaires → Financement → Compte Bancaire → Guichet Entreprise
 *   ↓         (obligatoire)        (BP+3ans)      (aides régionales)    (BCE + n° entreprise)
 *   ↓                                                                          ↓
 * TVA → Caisse Assurances Sociales → Autorisations → Opérationnel !
 *      (BE 0xxx.xxx.xxx)           (800€/trim)      (selon secteur)
 *
 * Coûts totaux: 1.000€ - 5.000€ selon forme juridique
 * Délai: 2-3 mois
 */
