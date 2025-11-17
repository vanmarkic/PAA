# language: fr
Fonctionnalité: Saisie douanière de contrefaçons
  En tant que titulaire de droits IP
  Je veux faire saisir les contrefaçons aux frontières
  Afin d'empêcher leur entrée sur le marché

  Contexte:
    Étant donné que le règlement UE 608/2013 s'applique
    Et que la demande d'intervention est gratuite
    Et que la surveillance dure 1 an renouvelable

  Scénario: Demande d'intervention douanière
    Étant donné que je subis des contrefaçons importées
    Et que j'ai des marques et brevets enregistrés
    Quand je demande l'intervention des douanes
    Alors je remplis le formulaire AFA
    Et fournis les informations sur mes droits
    Et décris les produits authentiques et contrefaits
    Et les douanes surveillent pendant 1 an

  Scénario: Notification de retenue douanière
    Étant donné que les douanes ont détecté des suspects
    Et retenu une cargaison
    Quand je suis notifié de la retenue
    Alors j'ai 10 jours pour confirmer la contrefaçon
    Et engager une procédure
    Ou demander la destruction simplifiée
    Et fournir une garantie si nécessaire