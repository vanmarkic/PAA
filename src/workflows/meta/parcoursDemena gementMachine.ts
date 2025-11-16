/**
 * META MACHINE - Parcours Citoyen : Déménagement
 *
 * Toutes les démarches administratives lors d'un déménagement
 */

import { createMachine, assign } from 'xstate';

interface Citoyen {
  nom: string;
  numeroNational: string;
  ancienneAdresse: string;
  nouvelleAdresse: string;
  typeLogement: 'location' | 'achat' | 'social';
}

interface DemarchesDemenagement {
  changementAdresseCommune: boolean;
  courrier: boolean;
  electriciteGaz: boolean;
  eau: boolean;
  internet: boolean;
  assuranceHabitation: boolean;
  voiture: boolean;
  banque: boolean;
  employeur: boolean;
  mutuelleCPAS: boolean;
  impots: boolean;
}

interface ParcoursDemenagementContext {
  citoyen: Citoyen | null;
  demarches: DemarchesDemenagement;
  ancienneCommune: string;
  nouvelleCommune: string;
  changementCommune: boolean;
  checklistRestante: string[];
  documentsObtenus: string[];
}

export const parcoursDemenagementMachine = createMachine({
  id: 'parcoursDemenagement',
  initial: 'preparationDemenagement',

  schemas: {
    context: {} as ParcoursDemenagementContext,
    events: {} as
      | { type: 'DEMENAGEMENT_PLANIFIE'; citoyen: Citoyen }
      | { type: 'CHANGEMENT_ADRESSE_EFFECTUE' }
      | { type: 'COURRIER_REDIRIGE' }
      | { type: 'ENERGIE_TRANSFEREE' }
      | { type: 'INTERNET_TRANSFERE' }
      | { type: 'ASSURANCE_MODIFIEE' }
      | { type: 'ORGANISMES_NOTIFIES' }
      | { type: 'TOUTES_DEMARCHES_FAITES' }
  },

  context: {
    citoyen: null,
    demarches: {
      changementAdresseCommune: false,
      courrier: false,
      electriciteGaz: false,
      eau: false,
      internet: false,
      assuranceHabitation: false,
      voiture: false,
      banque: false,
      employeur: false,
      mutuelleCPAS: false,
      impots: false,
    },
    ancienneCommune: '',
    nouvelleCommune: '',
    changementCommune: false,
    checklistRestante: [],
    documentsObtenus: [],
  },

  states: {
    preparationDemenagement: {
      on: {
        DEMENAGEMENT_PLANIFIE: {
          target: 'changementAdresseOfficiel',
          actions: assign({
            citoyen: ({ event }) => event.citoyen,
            changementCommune: ({ event }) =>
              event.citoyen.ancienneAdresse.split(',')[1] !== event.citoyen.nouvelleAdresse.split(',')[1],
            checklistRestante: [
              'Changement adresse commune',
              'Redirection courrier',
              'Électricité/Gaz',
              'Eau',
              'Internet',
              'Assurance habitation',
              'Banque',
              'Employeur',
              'Mutuelle',
              'Impôts',
            ],
          }),
        },
      },
      meta: {
        description: 'Préparation du déménagement',
        conseil: 'Commencer les démarches 1 mois avant le déménagement',
      },
    },

    changementAdresseOfficiel: {
      on: {
        CHANGEMENT_ADRESSE_EFFECTUE: {
          target: 'redirectionCourrier',
          actions: assign({ demarches: ({ context }) => ({
              ...context.demarches,
              changementAdresseCommune: true,
            }),
            documentsObtenus: (context) => [
              ...context.documentsObtenus,
              'Nouvelle carte d\'identité',
              'Attestation de résidence',
            ],
            checklistRestante: (context) =>
              context.checklistRestante.filter(item => item !== 'Changement adresse commune'),
          }),
        },
      },
      meta: {
        description: 'Changement d\'adresse officiel à la commune',
        URGENCE: 'HAUTE - Délai légal 8 jours ouvrables',
        etapes: [
          '1. Se rendre à la commune avec: carte identité, contrat location/acte achat',
          '2. Déclaration changement domicile',
          '3. Visite domiciliaire par agent quartier (vérification résidence effective)',
          '4. Nouvelle carte d\'identité éditée (±2 semaines)',
        ],
        delai: '8 jours ouvrables MAXIMUM après emménagement',
        amende: 'De 50€ à 500€ si dépassement délai',
        gratuit: true,
      },
    },

    redirectionCourrier: {
      on: {
        COURRIER_REDIRIGE: {
          target: 'transfertEnergie',
          actions: assign({ demarches: ({ context }) => ({
              ...context.demarches,
              courrier: true,
            }),
            checklistRestante: (context) =>
              context.checklistRestante.filter(item => item !== 'Redirection courrier'),
          }),
        },
      },
      meta: {
        description: 'Redirection courrier (bpost)',
        etapes: [
          '1. Commander redirection en ligne (bpost.be) ou bureau de poste',
          '2. Choisir durée: 1, 6 ou 12 mois',
          '3. Courrier redirigé vers nouvelle adresse',
        ],
        tarifs: {
          '1mois': '13€',
          '6mois': '40€',
          '12mois': '70€',
        },
        conseil: 'Profiter pour mettre à jour adresse partout au lieu de prolonger redirection',
      },
    },

    transfertEnergie: {
      on: {
        ENERGIE_TRANSFEREE: {
          target: 'transfertInternet',
          actions: assign({ demarches: ({ context }) => ({
              ...context.demarches,
              electriciteGaz: true,
              eau: true,
            }),
            checklistRestante: (context) =>
              context.checklistRestante.filter(item => !['Électricité/Gaz', 'Eau'].includes(item)),
          }),
        },
      },
      meta: {
        description: 'Électricité, Gaz et Eau',
        electriciteGaz: {
          etapes: [
            '1. Relever compteurs ancien logement le jour du départ',
            '2. Contacter fournisseur pour résiliation/transfert',
            '3. Relever compteurs nouveau logement le jour d\'arrivée',
            '4. Activer contrat ou choisir nouveau fournisseur',
          ],
          delai: 'Prévenir 1-2 semaines avant',
          comparateur: 'CREG (gratuit) pour comparer fournisseurs',
        },
        eau: {
          etapes: [
            '1. Contacter compagnie eaux locale (Vivaqua, SWDE, De Watergroep...)',
            '2. Relevé compteur ancien + nouveau logement',
            '3. Facture de clôture',
          ],
        },
        conseil: 'Profiter du déménagement pour comparer fournisseurs et économiser',
      },
    },

    transfertInternet: {
      on: {
        INTERNET_TRANSFERE: {
          target: 'assuranceHabitation',
          actions: assign({ demarches: ({ context }) => ({
              ...context.demarches,
              internet: true,
            }),
            checklistRestante: (context) =>
              context.checklistRestante.filter(item => item !== 'Internet'),
          }),
        },
      },
      meta: {
        description: 'Internet, TV, Téléphone',
        etapes: [
          '1. Contacter opérateur (Proximus, Telenet, VOO, Orange...)',
          '2. Vérifier couverture nouvelle adresse',
          '3. Transfert abonnement ou résiliation',
          '4. Installation technicien si nécessaire',
        ],
        delai: 'Prévoir 2-3 semaines pour installation',
        conseil: 'Comparer offres si changement opérateur',
      },
    },

    assuranceHabitation: {
      on: {
        ASSURANCE_MODIFIEE: {
          target: 'notificationOrganismes',
          actions: assign({ demarches: ({ context }) => ({
              ...context.demarches,
              assuranceHabitation: true,
            }),
            checklistRestante: (context) =>
              context.checklistRestante.filter(item => item !== 'Assurance habitation'),
          }),
        },
      },
      meta: {
        description: 'Assurance habitation (incendie locataire/propriétaire)',
        IMPORTANT: 'Obligatoire pour location !',
        etapes: [
          '1. Résilier ancienne assurance (préavis généralement 3 mois)',
          '2. Souscrire nouvelle assurance AVANT emménagement',
          '3. Fournir: contrat bail, adresse, inventaire mobilier',
        ],
        types: {
          locataire: 'Assurance incendie locataire (responsabilité + contenu)',
          proprietaire: 'Assurance incendie propriétaire (bâtiment + contenu)',
        },
        cout: '100-300€/an selon valeur mobilier',
      },
    },

    notificationOrganismes: {
      on: {
        ORGANISMES_NOTIFIES: {
          target: 'demenagementComplete',
          actions: assign({ demarches: ({ context }) => ({
              ...context.demarches,
              banque: true,
              employeur: true,
              mutuelleCPAS: true,
              impots: true,
              voiture: true,
            }),
            checklistRestante: [],
          }),
        },
      },
      meta: {
        description: 'Notification tous organismes',
        liste: {
          banque: 'Mise à jour adresse (en ligne ou agence)',
          employeur: 'Nouvelle adresse pour paie et documents',
          mutuelle: 'Mise à jour adresse',
          impots: 'Changement via MyMinfin ou lettre',
          voiture: 'Carte grise à mettre à jour (DIV)',
          cpas: 'Si bénéficiaire RIS/allocations',
          ecole: 'Si enfants scolarisés',
          abonnements: 'Magazine, salle sport, etc.',
        },
        conseil: 'Faire une liste complète pour ne rien oublier',
      },
    },

    demenagementComplete: {
      type: 'final',
      meta: {
        description: 'Toutes les démarches administratives sont complétées',
        recapitulatif: [
          '✓ Changement adresse commune (carte identité)',
          '✓ Redirection courrier',
          '✓ Électricité/Gaz/Eau transférés',
          '✓ Internet transféré',
          '✓ Assurance habitation',
          '✓ Organismes notifiés',
        ],
        dernierConseils: [
          'Conserver preuves: attestations, contrats, photos état lieux',
          'Mettre à jour GPS avec nouvelle adresse',
          'Prévenir famille et amis',
        ],
      },
    },
  },
});

/**
 * Timeline déménagement:
 *
 * J-30  → Planification, réservation camion
 * J-15  → Assurance habitation nouvelle adresse
 * J-7   → Prévenir énergie, internet, courrier
 * J-0   → DÉMÉNAGEMENT - relevés compteurs
 * J+8   → DÉLAI LÉGAL changement adresse commune ⚠️
 * J+15  → Nouvelle carte d\'identité reçue
 *
 * Coûts:
 * - Redirection courrier: 13-70€
 * - Assurance habitation: 100-300€/an
 * - Transfert internet: 0-50€ selon opérateur
 * - Changement adresse: GRATUIT
 *
 * AMENDE si > 8 jours pour changement adresse: 50-500€
 */
