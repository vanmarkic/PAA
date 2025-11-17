# language: fr
Fonctionnalité: Constitution du Fonds de Réserve
  En tant que copropriété
  Je veux constituer un fonds de réserve
  Afin de financer les gros travaux futurs

  Contexte:
    Étant donné que la loi impose un fonds de réserve

  Scénario: Calcul du montant obligatoire
    Étant donné que le budget annuel est de 50000€
    Et que le fonds de réserve actuel est de 2000€
    Quand je calcule le minimum légal
    Alors le fonds doit atteindre 5% du budget
    Soit 2500€ minimum
    Et une provision de 500€ est nécessaire

  Scénario: Utilisation du fonds de réserve
    Étant donné que le fonds contient 15000€
    Et que des travaux de toiture coûtent 12000€
    Quand l'AG vote aux 2/3 l'utilisation du fonds
    Alors 12000€ peuvent être utilisés
    Et le fonds doit être reconstitué progressivement
    Et un plan sur 5 ans maximum est établi

  Scénario: Placement du fonds de réserve
    Étant donné que le fonds atteint 20000€
    Quand l'AG décide du placement
    Alors les options autorisées sont:
      | Type placement | Risque | Autorisé |
      | Compte épargne | Faible | Oui |
      | Obligations d'État | Faible | Oui |
      | Actions | Élevé | Non |
      | Immobilier | Moyen | Non |