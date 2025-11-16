/**
 * META MACHINE - Parcours Citoyen : Naissance d'un Enfant
 *
 * Cette meta machine orchestre toutes les démarches administratives
 * nécessaires suite à la naissance d'un enfant, du point de vue du citoyen.
 */

import { createMachine, assign } from 'xstate';

interface Parent {
  nom: string;
  prenom: string;
  numeroNational: string;
  situationProfessionnelle: 'salarie' | 'independant' | 'chomage' | 'cpas';
}

interface Enfant {
  nom: string;
  prenom: string;
  dateNaissance: Date;
  numeroNational?: string;
  mutuelle?: string;
}

interface DemarchesCompletees {
  declarationNaissance: boolean;
  carteIdentite: boolean;
  mutuelle: boolean;
  allocationsFamiliales: boolean;
  congeParental: boolean;
  garderie: boolean;
  primeNaissance: boolean;
  declarationImpots: boolean;
}

interface ParcoursNaissanceContext {
  parents: Parent[];
  enfant: Enfant | null;
  demarchesCompletees: DemarchesCompletees;
  documentsObtenus: string[];
  aidesFinancieres: Array<{ type: string; montant: number }>;
  delaiJoursDeclaration: number;
  erreurs: string[];
}

export const parcoursNaissanceEnfantMachine = createMachine({
  id: 'parcoursNaissanceEnfant',
  initial: 'naissanceEnfant',

  schemas: {
    context: {} as ParcoursNaissanceContext,
    events: {} as
      | { type: 'ENFANT_NE'; enfant: Enfant; parents: Parent[] }
      | { type: 'DECLARATION_EFFECTUEE'; numeroNational: string }
      | { type: 'MUTUELLE_AFFILIEE'; mutuelle: string }
      | { type: 'ALLOCATIONS_DEMANDEES' }
      | { type: 'CONGE_DEMANDE' }
      | { type: 'PRIME_DEMANDEE' }
      | { type: 'GARDERIE_INSCRITE' }
      | { type: 'TOUTES_DEMARCHES_COMPLETEES' }
      | { type: 'ERREUR'; message: string }
  },

  context: {
    parents: [],
    enfant: null,
    demarchesCompletees: {
      declarationNaissance: false,
      carteIdentite: false,
      mutuelle: false,
      allocationsFamiliales: false,
      congeParental: false,
      garderie: false,
      primeNaissance: false,
      declarationImpots: false,
    },
    documentsObtenus: [],
    aidesFinancieres: [],
    delaiJoursDeclaration: 0,
    erreurs: [],
  },

  states: {
    naissanceEnfant: {
      on: {
        ENFANT_NE: {
          target: 'declarationNaissance',
          actions: assign({
            enfant: (_, event) => event.enfant,
            parents: (_, event) => event.parents,
            delaiJoursDeclaration: 0,
          }),
        },
      },
      meta: {
        description: 'Enfant vient de naître - démarrage du parcours administratif',
        conseilCitoyen: 'Félicitations ! Vous avez 15 jours pour déclarer la naissance à la commune.',
      },
    },

    declarationNaissance: {
      on: {
        DECLARATION_EFFECTUEE: {
          target: 'affiliationMutuelle',
          actions: assign({
            enfant: (context, event) => ({
              ...context.enfant!,
              numeroNational: event.numeroNational,
            }),
            demarchesCompletees: (context) => ({
              ...context.demarchesCompletees,
              declarationNaissance: true,
              carteIdentite: true,
            }),
            documentsObtenus: (context) => [
              ...context.documentsObtenus,
              'Acte de naissance',
              'Numéro national enfant',
            ],
          }),
        },
        ERREUR: {
          target: 'declarationNaissance',
          actions: assign({
            erreurs: (context, event) => [...context.erreurs, event.message],
            delaiJoursDeclaration: (context) => context.delaiJoursDeclaration + 1,
          }),
        },
      },
      meta: {
        description: 'Déclaration naissance à la commune (délai: 15 jours)',
        etapes: [
          '1. Se rendre à la commune avec: attestation hôpital, pièces identité parents, livret mariage',
          '2. Remplir formulaire déclaration',
          '3. Obtenir acte de naissance et numéro national',
        ],
        urgence: 'HAUTE - Délai légal 15 jours',
      },
    },

    affiliationMutuelle: {
      on: {
        MUTUELLE_AFFILIEE: {
          target: 'demandeAllocationsFamiliales',
          actions: assign({
            enfant: (context, event) => ({
              ...context.enfant!,
              mutuelle: event.mutuelle,
            }),
            demarchesCompletees: (context) => ({
              ...context.demarchesCompletees,
              mutuelle: true,
            }),
            documentsObtenus: (context) => [
              ...context.documentsObtenus,
              'Carte SIS (mutuelle)',
            ],
          }),
        },
      },
      meta: {
        description: 'Affiliation enfant à la mutuelle des parents',
        etapes: [
          '1. Contacter votre mutuelle',
          '2. Fournir acte de naissance',
          '3. Obtenir carte SIS pour l\'enfant',
        ],
        delai: '30 jours',
      },
    },

    demandeAllocationsFamiliales: {
      on: {
        ALLOCATIONS_DEMANDEES: {
          target: 'demandePrimeNaissance',
          actions: assign({
            demarchesCompletees: (context) => ({
              ...context.demarchesCompletees,
              allocationsFamiliales: true,
            }),
            aidesFinancieres: (context) => [
              ...context.aidesFinancieres,
              { type: 'Allocations familiales', montant: 170 }, // Montant indicatif mensuel
            ],
          }),
        },
      },
      meta: {
        description: 'Demande allocations familiales',
        etapes: [
          '1. Contacter caisse allocations familiales (Wallonie/Flandre/Bruxelles)',
          '2. Fournir: acte naissance, composition ménage, compte bancaire',
          '3. Allocations versées automatiquement chaque mois',
        ],
        montantEstime: '±170€/mois selon région et rang enfant',
      },
    },

    demandePrimeNaissance: {
      on: {
        PRIME_DEMANDEE: {
          target: 'demandeCongeParental',
          actions: assign({
            demarchesCompletees: (context) => ({
              ...context.demarchesCompletees,
              primeNaissance: true,
            }),
            aidesFinancieres: (context) => [
              ...context.aidesFinancieres,
              { type: 'Prime naissance', montant: 1272 }, // Wallonie 2024
            ],
          }),
        },
      },
      meta: {
        description: 'Demande prime de naissance (selon région)',
        montants: {
          wallonie: '1 272.52€ (1er enfant)',
          flandre: '1 122.30€',
          bruxelles: '1 122€',
        },
        etapes: [
          '1. Via caisse allocations familiales',
          '2. Versement unique après naissance',
        ],
      },
    },

    demandeCongeParental: {
      on: {
        CONGE_DEMANDE: [
          {
            target: 'inscriptionGarderie',
            guard: (context) => context.parents.some(p => p.situationProfessionnelle === 'salarie'),
            actions: assign({
              demarchesCompletees: (context) => ({
                ...context.demarchesCompletees,
                congeParental: true,
              }),
            }),
          },
          {
            target: 'inscriptionGarderie',
          },
        ],
      },
      meta: {
        description: 'Congé parental et congé de maternité/paternité',
        droits: {
          congeMaternite: '15 semaines (employée)',
          congePaternite: '20 jours (depuis 2023)',
          congeParental: '4 mois à temps plein ou 8 mois mi-temps (avant 12 ans enfant)',
        },
        etapes: [
          '1. Informer employeur (délai préavis variable)',
          '2. Introduire demande ONEM/mutuelle',
          '3. Allocations versées pendant congé',
        ],
      },
    },

    inscriptionGarderie: {
      on: {
        GARDERIE_INSCRITE: {
          target: 'preparationDeclarationImpots',
          actions: assign({
            demarchesCompletees: (context) => ({
              ...context.demarchesCompletees,
              garderie: true,
            }),
          }),
        },
      },
      meta: {
        description: 'Inscription crèche/garderie (optionnel mais conseillé)',
        etapes: [
          '1. Inscription dès la grossesse (longues listes d\'attente)',
          '2. Choisir: crèche communale, privée, accueillante ONE',
          '3. Tarif selon revenus (crèches subventionnées)',
        ],
        avantagesFiscaux: 'Déduction fiscale frais garde enfants (max 14,40€/jour)',
      },
    },

    preparationDeclarationImpots: {
      on: {
        TOUTES_DEMARCHES_COMPLETEES: {
          target: 'parcoursComplete',
          actions: assign({
            demarchesCompletees: (context) => ({
              ...context.demarchesCompletees,
              declarationImpots: true,
            }),
          }),
        },
      },
      meta: {
        description: 'Préparation déclaration fiscale année suivante',
        avantages: [
          'Quotient conjugal majoré',
          'Enfant à charge: réduction d\'impôt',
          'Déduction frais garde',
          'Supplément enfant pour isolés',
        ],
        conseil: 'Conserver tous justificatifs: frais médicaux, garde, activités extrascolaires',
      },
    },

    parcoursComplete: {
      type: 'final',
      meta: {
        description: 'Toutes les démarches administratives essentielles sont complétées',
        recapitulatif: [
          '✓ Déclaration naissance',
          '✓ Mutuelle',
          '✓ Allocations familiales',
          '✓ Prime naissance',
          '✓ Congé parental',
          '✓ Garderie',
          '✓ Préparation fiscale',
        ],
        prochainesEtapes: [
          'Vaccinations (ONE/Kind en Gezin)',
          'Inscription école (3 ans)',
          'Révision allocations si changement situation',
        ],
      },
    },
  },
});

/**
 * Aide visuelle - Flux du parcours citoyen:
 *
 * Naissance → Déclaration (15j) → Mutuelle (30j) → Allocations → Prime → Congé → Garderie → Impôts → Terminé
 *                                                                                                ↓
 *                                                                                     Aidesestimées: 1272€ + 170€/mois
 */
