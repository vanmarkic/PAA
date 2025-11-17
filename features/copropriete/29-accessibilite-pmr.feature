# language: fr
Fonctionnalité: Accessibilité PMR
  En tant que copropriété
  Je veux améliorer l'accessibilité PMR
  Afin de respecter les obligations légales et sociales

  Contexte:
    Étant donné qu'un copropriétaire est PMR

  Scénario: Installation rampe accès
    Étant donné qu'un copropriétaire en fauteuil roulant
    Demande l'installation d'une rampe d'accès
    Quand l'AG examine la demande
    Alors la décision considère:
      | Critère | Évaluation |
      | Obligation légale | Si immeuble récent |
      | Coût raisonnable | < 10% budget annuel |
      | Faisabilité technique | Pente max 5% |
      | Majorité requise | 2/3 si modification |

  Scénario: Adaptation ascenseur existant
    Étant donné que l'ascenseur n'est pas accessible
    Et qu'une mise aux normes coûte 25000€
    Quand les travaux sont proposés
    Alors les éléments requis sont:
      | Adaptation | Norme |
      | Dimensions cabine | 110x140cm minimum |
      | Hauteur boutons | 90-110cm |
      | Signalisation sonore | Obligatoire |
      | Braille | Obligatoire |
      | Miroir fond cabine | Recommandé |

  Scénario: Places parking PMR
    Étant donné que le parking compte 30 places
    Quand l'aménagement PMR est requis
    Alors il faut prévoir:
      | Élément | Nombre/Dimension |
      | Places PMR | 1 par 50 (min 1) |
      | Largeur place | 3,30m |
      | Signalisation | Horizontale + verticale |
      | Proximité entrée | Prioritaire |