# language: fr
Fonctionnalité: Mutation d'un Lot
  En tant que notaire
  Je veux gérer la mutation d'un lot
  Afin de transférer la propriété correctement

  Contexte:
    Étant donné qu'un lot est vendu

  Scénario: Vérification des charges dues
    Étant donné qu'un lot est en vente
    Et que l'acte est prévu dans 30 jours
    Quand le notaire demande l'état des charges
    Alors le syndic doit fournir sous 15 jours:
      | Document | Contenu |
      | État des charges | Montants dus et à venir |
      | Procès-verbaux | 3 dernières AG |
      | Fonds de réserve | Quote-part |
      | Litiges en cours | Liste détaillée |
      | Budget prévisionnel | Année en cours |

  Scénario: Transfert avec charges impayées
    Étant donné que le vendeur doit 2500€ de charges
    Et que la vente est prévue
    Quand le notaire établit l'acte
    Alors il doit retenir le montant dû
    Et payer directement le syndic
    Et obtenir quittance avant signature

  Scénario: Information du nouveau propriétaire
    Étant donné qu'un nouveau propriétaire arrive
    Quand la mutation est effectuée
    Alors le syndic doit:
      | Action | Délai |
      | Mettre à jour le registre | 8 jours |
      | Informer de ses droits/devoirs | 15 jours |
      | Transmettre le ROI | 15 jours |
      | Calculer ses charges | Prorata temporis |