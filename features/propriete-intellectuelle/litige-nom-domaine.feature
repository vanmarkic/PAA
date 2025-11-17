# language: fr
Fonctionnalité: Litige de nom de domaine
  En tant que titulaire de marque
  Je veux récupérer un nom de domaine cybersquatté
  Afin de protéger mon identité en ligne

  Contexte:
    Étant donné que les procédures UDRP sont disponibles
    Et que les frais WIPO sont d'environ 1500€
    Et que la procédure dure 2-3 mois

  Scénario: Procédure UDRP pour cybersquatting
    Étant donné que je possède la marque "INNOVATECH"
    Et que quelqu'un a enregistré innovatech.com de mauvaise foi
    Et qu'il propose de me le vendre 10000€
    Quand je lance une procédure UDRP
    Alors je dois prouver mes droits sur la marque
    Et démontrer la mauvaise foi du détenteur
    Et l'absence d'intérêt légitime
    Et demander le transfert du domaine

  Scénario: Procédure pour .be via CEPANI
    Étant donné qu'un domaine .be utilise ma marque
    Et que je veux le récupérer
    Quand je saisis le CEPANI
    Alors la procédure est en français ou néerlandais
    Et coûte environ 1000€
    Et la décision intervient en 60 jours
    Et je peux obtenir transfert ou radiation

  Scénario: Action judiciaire pour concurrence déloyale
    Étant donné qu'un concurrent utilise un domaine similaire
    Et que cela crée une confusion
    Et que l'UDRP n'est pas applicable
    Quand je saisis le tribunal de l'entreprise
    Alors je peux demander la cessation
    Et le transfert ou la radiation
    Et des dommages-intérêts
    Et une astreinte en cas de non-respect