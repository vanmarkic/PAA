# language: fr
Fonctionnalité: Gestion des Parties Communes
  En tant que copropriété
  Je veux gérer les parties communes
  Afin de maintenir et valoriser le patrimoine commun

  Contexte:
    Étant donné que l'immeuble comprend des parties communes

  Scénario: Utilisation privative temporaire
    Étant donné qu'un copropriétaire demande l'usage exclusif du jardin
    Pour organiser un événement familial
    Quand le syndic évalue la demande
    Alors il peut autoriser si:
      | Condition | Statut |
      | Durée < 48h | Requis |
      | Pas de nuisance | Requis |
      | Assurance RC | Requis |
      | Remise en état | Engagement écrit |
      | Caution | 500€ |

  Scénario: Modification de partie commune
    Étant donné qu'un copropriétaire veut modifier une partie commune
    En installant une rampe d'accès PMR
    Quand il soumet le projet à l'AG
    Alors la décision requiert:
      | Élément | Majorité requise |
      | Modification structurelle | 4/5 |
      | Modification esthétique | 3/4 |
      | Amélioration technique | 2/3 |
      | Entretien simple | Majorité absolue |

  Scénario: Privatisation d'une partie commune
    Étant donné qu'un couloir commun dessert un seul lot
    Et que le propriétaire demande la privatisation
    Quand l'AG examine la demande
    Alors l'unanimité est requise
    Et une modification de l'acte de base est nécessaire
    Et les millièmes doivent être recalculés