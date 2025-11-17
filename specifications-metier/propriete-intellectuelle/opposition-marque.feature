# language: fr
Fonctionnalité: Opposition à une marque
  En tant que titulaire de marque antérieure
  Je veux m'opposer à une nouvelle marque similaire
  Afin de protéger mes droits exclusifs

  Contexte:
    Étant donné que le délai d'opposition est de 2 mois
    Et que les frais d'opposition sont de 1000€
    Et que la procédure est contradictoire

  Scénario: Opposition fondée sur marque identique
    Étant donné que je possède la marque "TECHPRO" depuis 2020
    Et qu'une nouvelle marque "TECHPRO" est publiée
    Et que les produits sont identiques ou similaires
    Quand je dépose mon opposition dans les 2 mois
    Alors mon opposition est recevable
    Et le déposant est notifié
    Et une phase contradictoire commence
    Et la décision intervient dans 6-12 mois

  Scénario: Opposition basée sur risque de confusion
    Étant donné que ma marque est "NOVATEL"
    Et que la nouvelle marque est "NOVOTEL"
    Et que les services sont similaires
    Et qu'il existe un risque de confusion
    Quand je forme opposition avec preuves d'usage
    Alors je dois prouver l'usage sérieux de ma marque
    Et démontrer le risque de confusion
    Et fournir une argumentation juridique

  Scénario: Défense contre une opposition
    Étant donné qu'une opposition est formée contre ma marque
    Et que j'ai 2 mois pour répondre
    Quand je prépare ma défense
    Alors je peux contester l'usage de la marque antérieure
    Et argumenter sur l'absence de similarité
    Et demander des preuves d'usage à l'opposant

  Scénario: Règlement amiable pendant l'opposition
    Étant donné qu'une opposition est en cours
    Et que les parties souhaitent négocier
    Quand nous demandons une suspension "cooling-off"
    Alors la procédure est suspendue 2 mois
    Et nous pouvons négocier un accord de coexistence
    Et éviter une décision défavorable