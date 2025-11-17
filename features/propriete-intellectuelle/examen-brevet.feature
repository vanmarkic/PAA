# language: fr
Fonctionnalité: Examen de brevet
  En tant que déposant de brevet
  Je veux que ma demande soit examinée
  Afin d'obtenir la délivrance du brevet

  Contexte:
    Étant donné que j'ai déposé une demande de brevet
    Et que le rapport de recherche a été établi
    Et que les frais d'examen de 150€ sont dus

  Scénario: Examen favorable sans objections
    Étant donné que le rapport de recherche est positif
    Et que toutes les revendications sont nouvelles et inventives
    Et que la description est suffisante
    Et que j'ai payé les frais d'examen
    Quand l'examinateur procède à l'examen au fond
    Alors aucune objection ne devrait être soulevée
    Et le brevet devrait être accordé directement
    Et je devrais payer les frais de délivrance de 40€

  Scénario: Objection pour manque de clarté des revendications
    Étant donné que mes revendications utilisent des termes vagues
    Et que l'étendue de protection n'est pas claire
    Quand l'examinateur examine ma demande
    Alors je devrais recevoir une notification d'objection
    Et j'ai 2 mois pour répondre
    Et je peux modifier les revendications pour les clarifier

  Scénario: Objection pour défaut d'activité inventive
    Étant donné que le rapport cite deux documents Y
    Et que leur combinaison rend l'invention évidente
    Quand l'examinateur examine ma demande
    Alors une objection pour manque d'activité inventive est soulevée
    Et je dois argumenter ou modifier les revendications
    Et je peux demander une audition

  Scénario: Demande de prorogation de délai
    Étant donné que j'ai reçu une notification avec délai de 2 mois
    Et que je ne peux pas respecter ce délai
    Quand je demande une prorogation avant l'expiration
    Alors je peux obtenir 2 mois supplémentaires
    Et je dois payer une taxe de prorogation
    Et la prorogation est limitée à une fois

  Scénario: Abandon de certaines revendications
    Étant donné que certaines revendications sont rejetées
    Et que je veux maintenir les autres revendications
    Quand je modifie ma demande
    Alors je peux abandonner les revendications problématiques
    Et maintenir les revendications acceptables
    Et accélérer la délivrance du brevet