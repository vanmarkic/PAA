# language: fr
Fonctionnalité: Gestion Chauffage Collectif
  En tant que copropriété
  Je veux optimiser le chauffage collectif
  Afin de maîtriser les coûts énergétiques

  Contexte:
    Étant donné que le chauffage est collectif

  Scénario: Période de chauffe légale
    Étant donné que la saison de chauffe approche
    Et que le règlement définit du 15/10 au 15/04
    Quand les températures sont clémentes
    Alors le syndic peut:
      | Action | Condition |
      | Retarder démarrage | T° > 15°C constant |
      | Anticiper arrêt | T° > 18°C prévu |
      | Rallumer si froid | T° < 12°C |
      | Consulter conseil | Si modification |

  Scénario: Contrat maintenance chaufferie
    Étant donné qu'un contrat P2+P3 existe
    Pour la chaudière gaz 350kW
    Quand le renouvellement approche
    Alors il comprend:
      | Prestation | Fréquence |
      | Entretien préventif | Mensuel |
      | Dépannage 24/7 | Inclus |
      | Pièces usure | Incluses |
      | Ramonage | Annuel |
      | Rapport performance | Trimestriel |

  Scénario: Passage chauffage gaz vers pompe chaleur
    Étant donné que la chaudière gaz est vétuste
    Et qu'une PAC coûte 120000€
    Quand la transition est étudiée
    Alors l'analyse porte sur:
      | Critère | Évaluation |
      | ROI estimé | 8-10 ans |
      | Économies | 30% facture |
      | Subsides | 40% Région |
      | Nuisances sonores | Étude acoustique |
      | Vote AG requis | 3/4 amélioration |