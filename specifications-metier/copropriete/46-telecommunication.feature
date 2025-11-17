# language: fr
Fonctionnalité: Infrastructure Télécommunication
  En tant que copropriété
  Je veux moderniser les télécommunications
  Afin d'offrir la fibre optique à tous

  Contexte:
    Étant donné que la fibre optique arrive

  Scénario: Installation fibre optique immeuble
    Étant donné qu'un opérateur propose la fibre
    Gratuitement pour les parties communes
    Quand l'AG vote l'autorisation
    Alors elle vérifie:
      | Point | Validation |
      | Convention opérateur | 25 ans maximum |
      | Travaux parties communes | Gratuits |
      | Raccordement privatif | Choix individuel |
      | Plusieurs opérateurs | Obligatoire |
      | Vote requis | Majorité simple |

  Scénario: Mutualisation infrastructure
    Étant donné que 3 opérateurs veulent accès
    Et que l'infrastructure existe
    Quand la mutualisation est organisée
    Alors les règles sont:
      | Aspect | Règle |
      | Point mutualisation | Local technique |
      | Partage coûts | Égalitaire |
      | Maintenance | Opérateur principal |
      | Accès concurrent | Non discriminatoire |

  Scénario: Suppression antenne collective
    Étant donné que tous ont la fibre/satellite
    Et que l'antenne TV est obsolète
    Quand sa suppression est votée
    Alors il faut:
      | Étape | Condition |
      | Vérifier tous raccordés | Enquête |
      | Vote AG suppression | 2/3 |
      | Dépose antenne | Professionnel |
      | Réfection toiture | Si nécessaire |