# language: fr
Fonctionnalité: Protection d'obtention végétale
  En tant qu'obtenteur de nouvelles variétés végétales
  Je veux protéger mes créations
  Afin de contrôler leur commercialisation pendant 25-30 ans

  Contexte:
    Étant donné que la protection UPOV est disponible
    Et que les tests DHS sont obligatoires
    Et que la durée est de 25 ans (30 pour arbres/vignes)

  Scénario: Demande de certificat d'obtention végétale
    Étant donné que j'ai créé une nouvelle variété de tomate
    Et qu'elle est distincte, homogène et stable (DHS)
    Et qu'elle a une dénomination unique
    Quand je dépose ma demande à l'OCVV
    Alors des essais DHS sont organisés
    Et durent 2 cycles de végétation
    Et coûtent environ 3000€
    Et le certificat est délivré si conforme

  Scénario: Protection provisoire pendant l'examen
    Étant donné que ma demande est en cours d'examen
    Et que des tiers commercialisent déjà
    Quand je notifie mes droits provisoires
    Alors je peux réclamer une indemnité
    Mais seulement après délivrance du certificat
    Et rétroactivement à la publication