# language: fr
Fonctionnalité: Gestion Terrasse Privative
  En tant que copropriété
  Je veux gérer les terrasses privatives
  Afin de maintenir l'harmonie architecturale

  Contexte:
    Étant donné que des terrasses sont privatives

  Scénario: Aménagement terrasse par copropriétaire
    Étant donné qu'un copropriétaire veut aménager sa terrasse
    Et pergola et jardinière
    Quand il demande l'autorisation
    Alors il doit vérifier:
      | Aspect | Règle |
      | Poids maximum | 350kg/m² |
      | Hauteur pergola | Max 2,5m |
      | Couleur structure | Harmonie façade |
      | Évacuation eau | Pas d'obstruction |
      | Autorisation AG | Si visible façade |

  Scénario: Étanchéité sous terrasse
    Étant donné qu'une fuite apparaît sous terrasse
    Affectant l'appartement inférieur
    Quand la responsabilité est déterminée
    Alors elle dépend de:
      | Zone | Responsable |
      | Dalle béton | Copropriété |
      | Étanchéité membrane | Copropriété |
      | Revêtement privatif | Propriétaire terrasse |
      | Dégât par usage | Propriétaire terrasse |

  Scénario: Transformation terrasse en véranda
    Étant donné qu'un copropriétaire veut fermer sa terrasse
    Pour créer une véranda
    Quand le projet est présenté
    Alors il nécessite:
      | Autorisation | Majorité |
      | Modification façade | 3/4 |
      | Augmentation surface | 4/5 |
      | Permis urbanisme | Obligatoire |
      | Recalcul millièmes | Automatique |