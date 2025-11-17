# language: fr
Fonctionnalité: Expropriation pour Utilité Publique
  En tant que copropriété
  Je veux gérer une procédure d'expropriation
  Afin de défendre les intérêts collectifs

  Contexte:
    Étant donné qu'une expropriation est envisagée

  Scénario: Notification plan d'expropriation
    Étant donné que la commune projette une expropriation
    Pour élargir une voirie
    Quand le plan est notifié
    Alors la copropriété doit:
      | Action | Délai |
      | Informer tous copropriétaires | 8 jours |
      | Convoquer AG extraordinaire | 30 jours |
      | Consulter avocat | Immédiat |
      | Déposer observations | 60 jours |

  Scénario: Négociation indemnité collective
    Étant donné que l'expropriation touche parties communes
    Valeur estimée 500000€
    Quand la négociation s'engage
    Alors elle porte sur:
      | Poste | Base calcul |
      | Valeur vénale | Expertise contradictoire |
      | Trouble commercial | Si commerce présent |
      | Frais déménagement | Justificatifs |
      | Moins-value résiduelle | Si partielle |

  Scénario: Répartition indemnité entre copropriétaires
    Étant donné qu'une indemnité de 300000€ est obtenue
    Pour expropriation partielle
    Quand la répartition est décidée
    Alors elle suit:
      | Critère | Répartition |
      | Parties communes seules | Millièmes stricts |
      | Lots privatifs touchés | Propriétaires concernés |
      | Préjudice collectif | Millièmes |
      | Frais procédure | Millièmes |