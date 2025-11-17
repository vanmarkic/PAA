# language: fr
Fonctionnalité: Restauration de droits IP perdus
  En tant que titulaire négligent
  Je veux restaurer mes droits expirés
  Afin de récupérer ma protection IP

  Contexte:
    Étant donné que certains oublis peuvent être rattrapés
    Et que des délais de grâce existent
    Et que des surtaxes s'appliquent

  Scénario: Restauration de brevet après non-paiement
    Étant donné que j'ai oublié de payer une annuité
    Et que mon brevet est déchu depuis 3 mois
    Quand je demande la restauration
    Alors je dois prouver le caractère non intentionnel
    Et payer l'annuité plus 50% de surtaxe
    Et soumettre la demande dans les 6 mois
    Et les droits des tiers sont préservés

  Scénario: Poursuite de procédure après délai manqué
    Étant donné que j'ai manqué un délai de réponse
    Et que ma demande est réputée retirée
    Quand je demande la poursuite de procédure
    Alors je paie la taxe de poursuite
    Et accomplis l'acte omis dans les 2 mois
    Et la procédure reprend son cours