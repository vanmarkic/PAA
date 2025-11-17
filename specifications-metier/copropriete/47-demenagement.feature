# language: fr
Fonctionnalité: Gestion des Déménagements
  En tant que copropriété
  Je veux encadrer les déménagements
  Afin de limiter les dégradations

  Contexte:
    Étant donné qu'un déménagement est prévu

  Scénario: Déclaration déménagement obligatoire
    Étant donné qu'un copropriétaire déménage
    Le 15 du mois prochain
    Quand il informe le syndic
    Alors il doit fournir:
      | Information | Délai |
      | Date et horaires | 8 jours avant |
      | Entreprise déménagement | Nom + assurance |
      | Monte-charge nécessaire | Réservation |
      | Protection parties communes | Engagement |
      | État des lieux | Avant/après |

  Scénario: Caution dégradations déménagement
    Étant donné qu'une caution est demandée
    Pour protéger les parties communes
    Quand le montant est fixé
    Alors il est de:
      | Type déménagement | Caution |
      | Studio/F1 | 200€ |
      | F2/F3 | 300€ |
      | F4 et plus | 500€ |
      | Professionnel agréé | Réduit 50% |
      | Restitution | Sous 30 jours |

  Scénario: Dégâts lors déménagement
    Étant donné que l'ascenseur est endommagé
    Lors d'un déménagement
    Quand les responsabilités sont établies
    Alors la procédure est:
      | Action | Responsable |
      | Constat immédiat | Syndic/gardien |
      | Photos preuves | Datées |
      | Devis réparation | 3 entreprises |
      | Retenue caution | Montant dégâts |
      | Poursuite si insuffisant | Copropriétaire |