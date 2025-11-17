# language: fr
Fonctionnalité: Gestion des Troubles de Voisinage
  En tant que syndic
  Je veux gérer les troubles de voisinage
  Afin de maintenir la tranquillité dans l'immeuble

  Contexte:
    Étant donné que des troubles sont signalés

  Scénario: Nuisances sonores répétées
    Étant donné qu'un copropriétaire fait du bruit excessif
    Entre 22h et 7h régulièrement
    Quand des plaintes sont déposées
    Alors le syndic doit:
      | Action | Délai | Suite |
      | Avertissement verbal | Immédiat | Documentation |
      | Lettre recommandée | Si récidive | Copie conseil |
      | Médiation | Proposée | Volontaire |
      | Mise en demeure | 3ème fois | Menace sanctions |
      | AG extraordinaire | Si persiste | Vote sanctions |

  Scénario: Travaux non autorisés bruyants
    Étant donné qu'un copropriétaire fait des travaux
    Sans autorisation et hors horaires légaux
    Quand le syndic intervient
    Alors il peut:
      | Mesure | Condition |
      | Arrêt immédiat travaux | Danger ou urgence |
      | Constat huissier | Preuve violations |
      | Amendes ROI | Si prévues |
      | Action en cessation | Justice de paix |

  Scénario: Médiation entre copropriétaires
    Étant donné qu'un conflit oppose deux copropriétaires
    Pour des odeurs de cuisine persistantes
    Quand une médiation est organisée
    Alors elle comprend:
      | Étape | Objectif |
      | Réunion tripartite | Exposer griefs |
      | Recherche solutions | Compromis acceptable |
      | Accord écrit | Engagement mutuel |
      | Suivi syndic | Respect accord |