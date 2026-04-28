# language: fr
Fonctionnalité: Copropriété Horizontale
  En tant que copropriété horizontale
  Je veux gérer les spécificités des maisons mitoyennes
  Afin d'organiser la gestion des parties communes

  Contexte:
    Étant donné qu'il s'agit de maisons mitoyennes

  Scénario: Gestion voiries privées
    Étant donné que la copropriété gère des voiries privées
    Et 2000m² pour 25 maisons
    Quand l'entretien est planifié
    Alors il comprend:
      | Élément | Fréquence | Coût/an |
      | Réfection asphalte | 10 ans | 5000€ provision |
      | Éclairage public | Continu | 3000€ |
      | Espaces verts | Hebdomadaire été | 8000€ |
      | Déneigement | Hiver | 2000€ |

  Scénario: Mitoyenneté des murs
    Étant donné qu'un mur mitoyen nécessite réparation
    Entre les maisons A et B
    Quand les travaux sont nécessaires
    Alors la répartition est:
      | Situation | Partage coûts |
      | Mur mitoyen simple | 50%-50% |
      | Dégât causé par A | 100% A |
      | Amélioration demandée par B | 100% B |
      | Entretien normal | 50%-50% |

  Scénario: Jardins privatifs vs communs
    Étant donné que certains jardins sont privatifs
    Et d'autres espaces sont communs
    Quand l'entretien est organisé
    Alors les responsabilités sont:
      | Zone | Responsable | Charges |
      | Jardin privatif | Propriétaire | Individuel |
      | Pelouse commune | Copropriété | Millièmes |
      | Haies mitoyennes | Voisins concernés | 50%-50% |
      | Arbres communs | Copropriété | Millièmes |