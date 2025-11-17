# language: fr
Fonctionnalité: Copropriété Forcée
  En tant que copropriété
  Je veux gérer les situations de copropriété forcée
  Afin de respecter les droits inaliénables

  Contexte:
    Étant donné qu'une situation de copropriété forcée existe

  Scénario: Mur mitoyen obligatoire
    Étant donné que deux propriétés sont contiguës
    Et qu'un mur mitoyen les sépare
    Quand un propriétaire veut modifier le mur
    Alors il doit:
      | Obligation | Détail |
      | Informer voisin | Préalable écrit |
      | Respecter structure | Pas d'affaiblissement |
      | Partager coûts entretien | 50%-50% |
      | Expertise si désaccord | Contradictoire |

  Scénario: Cour commune indivisible
    Étant donné qu'une cour dessert 4 maisons
    Et qu'elle est indivisible par nature
    Quand un copropriétaire veut la modifier
    Alors il faut:
      | Condition | Règle |
      | Accord unanime | Pour modification |
      | Maintien accès | Obligatoire tous |
      | Charges entretien | Quote-part égale |
      | Impossibilité vente | Sauf ensemble |

  Scénario: Passage nécessaire enclave
    Étant donné qu'une propriété est enclavée
    Et bénéficie d'un passage nécessaire
    Quand le fonds servant veut modifier
    Alors les règles sont:
      | Principe | Application |
      | Maintien passage | Impératif |
      | Déplacement possible | Si équivalent |
      | Indemnité | Si aggravation |
      | Prescription | Imprescriptible |