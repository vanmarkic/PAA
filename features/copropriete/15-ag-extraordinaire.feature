# language: fr
Fonctionnalité: Assemblée Générale Extraordinaire
  En tant que copropriété
  Je veux convoquer une AG extraordinaire
  Afin de traiter des questions urgentes

  Contexte:
    Étant donné qu'une situation exceptionnelle survient

  Scénario: Convocation à la demande des copropriétaires
    Étant donné que 350 millièmes le demandent
    Soit plus de 1/5 des voix
    Quand la demande est formulée par écrit
    Alors le syndic doit convoquer l'AG
    Dans un délai de 30 jours maximum
    Et les points demandés à l'ordre du jour

  Scénario: AG extraordinaire pour travaux urgents
    Étant donné que la façade menace de s'effondrer
    Et que les travaux dépassent les pouvoirs du syndic
    Quand l'AG extraordinaire est convoquée
    Alors le délai peut être réduit à 8 jours
    Et la convocation mentionne l'urgence
    Et seuls les points urgents sont traités

  Scénario: Refus du syndic de convoquer
    Étant donné que le syndic refuse de convoquer l'AG
    Malgré une demande valide de 1/5 des voix
    Quand 30 jours se sont écoulés
    Alors les copropriétaires peuvent:
      | Action | Procédure |
      | Convoquer eux-mêmes | Par huissier |
      | Saisir le juge de paix | Procédure urgente |
      | Révoquer le syndic | À l'AG convoquée |