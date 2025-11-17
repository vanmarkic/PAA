# language: fr
Fonctionnalité: Gestion du Stationnement
  En tant que copropriété
  Je veux gérer le stationnement
  Afin d'optimiser l'usage des parkings

  Contexte:
    Étant donné que la copropriété a un parking

  Scénario: Attribution places visiteurs
    Étant donné que 5 places visiteurs existent
    Pour 30 lots d'habitation
    Quand l'usage est réglementé
    Alors les règles sont:
      | Règle | Application |
      | Durée maximum | 4 heures |
      | Réservation | Interphone/app |
      | Usage abusif | Amende 50€ |
      | Nuit interdite | 22h-7h |
      | Priorité urgences | Médecin, secours |

  Scénario: Location place à externe
    Étant donné que 3 places sont inoccupées
    Et qu'un voisin veut en louer une
    Quand la location est envisagée
    Alors elle nécessite:
      | Condition | Détail |
      | Vote AG | Majorité 2/3 |
      | Contrat précaire | Résiliable 3 mois |
      | Tarif marché | 80-120€/mois |
      | Assurance | RC locataire |
      | Badge accès | Caution 50€ |

  Scénario: Stationnement gênant répété
    Étant donné qu'un véhicule gêne l'accès
    De façon répétée malgré avertissements
    Quand l'intervention est nécessaire
    Alors les mesures sont:
      | Étape | Action |
      | 1er fois | Avertissement écrit |
      | 2ème fois | Mise en demeure |
      | 3ème fois | Sabot + 100€ amende |
      | Persistance | Enlèvement fourrière |
      | Frais | Au propriétaire |