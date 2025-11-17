# language: fr
Fonctionnalité: Escrow de code source
  En tant que licencié ou fournisseur de logiciel
  Je veux mettre en place un escrow
  Afin de sécuriser l'accès au code source

  Contexte:
    Étant donné que l'escrow protège les deux parties
    Et qu'un tiers de confiance intervient
    Et que les conditions de libération sont prédéfinies

  Scénario: Mise en place d'escrow logiciel
    Étant donné que je licencie un logiciel critique
    Et que je veux sécuriser la continuité
    Quand nous établissons un contrat d'escrow
    Alors le code source est déposé chez un tiers
    Et mis à jour régulièrement
    Et libéré si faillite ou abandon du support
    Pour un coût de 2000-5000€/an

  Scénario: Déclenchement de libération d'escrow
    Étant donné que le fournisseur fait faillite
    Et que j'ai un contrat d'escrow
    Quand je demande la libération
    Alors l'agent d'escrow vérifie les conditions
    Et libère le code source dans les 30 jours
    Me permettant de maintenir le logiciel