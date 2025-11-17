# language: fr
Fonctionnalité: Gestion Caves et Greniers
  En tant que copropriété
  Je veux gérer caves et greniers
  Afin d'optimiser l'usage des espaces

  Contexte:
    Étant donné que l'immeuble a caves et greniers

  Scénario: Attribution cave supplémentaire
    Étant donné qu'une cave est libérée
    Et que 3 copropriétaires la demandent
    Quand l'attribution est décidée
    Alors les critères sont:
      | Priorité | Critère |
      | 1 | Copropriétaire sans cave |
      | 2 | Besoins justifiés |
      | 3 | Proximité du lot |
      | 4 | Tirage au sort |
      | Location | 50€/mois indicatif |

  Scénario: Sécurisation accès caves
    Étant donné que des vols sont signalés
    Dans les caves communes
    Quand la sécurisation est votée
    Alors les mesures sont:
      | Mesure | Coût | Efficacité |
      | Portes blindées | 500€/u | Élevée |
      | Éclairage détection | 1000€ | Moyenne |
      | Caméra couloir | 2000€ | Dissuasive |
      | Grillage séparation | 100€/cave | Basique |

  Scénario: Encombrement parties communes
    Étant donné que des objets encombrent les couloirs
    Créant un risque incendie
    Quand le syndic intervient
    Alors la procédure est:
      | Étape | Délai |
      | Identification propriétaire | Enquête |
      | Mise en demeure | 8 jours |
      | Enlèvement amiable | 15 jours |
      | Enlèvement forcé | Huissier |
      | Facturation frais | Au propriétaire |