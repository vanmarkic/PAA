# language: fr
Fonctionnalité: Désignation du Syndic
  En tant que copropriété
  Je veux désigner un syndic
  Afin d'assurer la gestion de l'immeuble

  Contexte:
    Étant donné que le mandat du syndic actuel expire
    Et que l'AG doit désigner un nouveau syndic

  Scénario: Désignation syndic professionnel
    Étant donné que 3 candidats syndics se présentent
    Et que le candidat A propose 500€/mois
    Et que le candidat B propose 450€/mois
    Et que le candidat C propose 600€/mois
    Quand l'AG vote à la majorité des 2/3
    Et que le candidat B obtient 680 millièmes
    Alors le syndic B est désigné
    Et son mandat est de 3 ans maximum

  Scénario: Validation des conditions IPI
    Étant donné qu'un syndic professionnel est candidat
    Quand je vérifie ses qualifications
    Alors il doit avoir:
      | Condition | Statut |
      | Numéro IPI valide | Obligatoire |
      | Assurance RC professionnelle | Obligatoire |
      | Cautionnement | Obligatoire |
      | Expérience minimum | Recommandé |

  Scénario: Révocation du syndic pour faute grave
    Étant donné que le syndic a commis une faute grave
    Et que 30% des copropriétaires demandent une AG extraordinaire
    Quand l'AG vote la révocation à la majorité absolue
    Et que 550 millièmes votent pour la révocation
    Alors le syndic est révoqué immédiatement
    Et un syndic provisoire doit être désigné