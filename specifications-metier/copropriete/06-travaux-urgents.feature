# language: fr
Fonctionnalité: Gestion des Travaux Urgents
  En tant que syndic
  Je veux gérer les travaux urgents
  Afin de préserver l'immeuble et la sécurité

  Contexte:
    Étant donné qu'un problème urgent survient dans l'immeuble

  Scénario: Fuite d'eau majeure nécessitant intervention immédiate
    Étant donné qu'une canalisation principale a éclaté
    Et que l'eau menace plusieurs appartements
    Quand le syndic est informé
    Alors il peut engager les travaux immédiatement
    Et sans autorisation préalable de l'AG
    Et doit informer le conseil de copropriété sous 24h
    Et convoquer une AG extraordinaire sous 30 jours

  Scénario: Plafond de dépense pour travaux urgents
    Étant donné que des travaux urgents sont nécessaires
    Et que le devis est de 8000€
    Et que le plafond syndic est de 5000€
    Quand le syndic évalue la situation
    Alors il doit consulter le conseil de copropriété
    Et obtenir au moins 2 devis si possible
    Et peut dépasser si danger imminent

  Scénario: Travaux conservatoires après sinistre
    Étant donné qu'un sinistre a endommagé le toit
    Et que des mesures conservatoires sont nécessaires
    Quand le syndic agit
    Alors il doit:
      | Action | Délai |
      | Sécuriser la zone | Immédiat |
      | Prévenir l'assurance | 24h |
      | Faire établir devis | 48h |
      | Informer copropriétaires | 72h |
      | Convoquer AG si > 10% budget | 30 jours |