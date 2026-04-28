# language: fr
Fonctionnalité: Service de Gardiennage
  En tant que copropriété
  Je veux organiser le gardiennage
  Afin d'assurer la sécurité et l'entretien

  Contexte:
    Étant donné que la copropriété envisage un gardiennage

  Scénario: Engagement concierge résident
    Étant donné qu'un poste de concierge est créé
    Et logement de fonction
    Quand le recrutement est lancé
    Alors les conditions sont:
      | Élément | Détail |
      | Vote AG | Majorité 2/3 |
      | Contrat travail | CDI temps plein |
      | Salaire mensuel | 2200€ brut |
      | Logement | Avantage nature |
      | Charges sociales | +40% employeur |

  Scénario: Société de gardiennage externe
    Étant donné que 3 sociétés sont consultées
    Pour surveillance 7j/7 de 18h à 6h
    Quand les offres sont comparées
    Alors l'évaluation porte sur:
      | Critère | Pondération |
      | Prix mensuel | 40% |
      | Références | 20% |
      | Moyens techniques | 20% |
      | Réactivité | 10% |
      | Assurances | 10% |

  Scénario: Répartition coûts gardiennage
    Étant donné que le gardiennage coûte 3000€/mois
    Quand les charges sont réparties
    Alors la clé est:
      | Type lot | Participation |
      | Appartements | 100% millièmes |
      | Commerces RDC | 150% millièmes |
      | Bureaux | 120% millièmes |
      | Parkings seuls | 50% millièmes |