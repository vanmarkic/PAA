# language: fr
Fonctionnalité: Régime Petite Copropriété
  En tant que petite copropriété
  Je veux appliquer le régime simplifié
  Afin de réduire les contraintes administratives

  Contexte:
    Étant donné que la copropriété compte moins de 20 lots

  Scénario: Application régime simplifié
    Étant donné que la copropriété a 15 lots
    Et qu'elle opte pour le régime simplifié
    Quand les règles s'appliquent
    Alors les simplifications sont:
      | Obligation | Régime normal | Régime simplifié |
      | AG ordinaire | Annuelle | Biannuelle possible |
      | Conseil copropriété | Obligatoire >20 lots | Facultatif |
      | Commissaire comptes | Obligatoire >50 lots | Facultatif |
      | Comptabilité | Double | Simple autorisée |

  Scénario: AG biannuelle petite copropriété
    Étant donné que l'AG précédente date de 18 mois
    Et que le régime biannuel est adopté
    Quand l'AG est convoquée
    Alors elle doit traiter:
      | Points | Période couverte |
      | Comptes | 2 exercices |
      | Budget | 2 années à venir |
      | Décharge syndic | 2 années |
      | Travaux | Plan bisannuel |

  Scénario: Décision sans AG physique
    Étant donné qu'une décision urgente est nécessaire
    Et que tous les copropriétaires sont d'accord
    Quand la décision est prise par écrit
    Alors elle est valable si:
      | Condition | Requis |
      | Accord écrit tous | 100% |
      | Conservation preuve | 5 ans |
      | Inscription registre | Obligatoire |