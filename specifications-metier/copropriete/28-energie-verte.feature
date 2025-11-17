# language: fr
Fonctionnalité: Transition Énergétique
  En tant que copropriété
  Je veux améliorer la performance énergétique
  Afin de réduire les coûts et l'empreinte carbone

  Contexte:
    Étant donné que la transition énergétique est prioritaire

  Scénario: Installation panneaux solaires
    Étant donné qu'un projet solaire de 50000€ est proposé
    Avec un retour sur investissement de 7 ans
    Quand l'AG vote le projet
    Alors la majorité requise est 2/3
    Et les subsides disponibles sont:
      | Source | Montant |
      | Région | 30% max 15000€ |
      | Certificats verts | 5000€/an estimé |
      | Primes énergie | 2000€ |

  Scénario: Audit énergétique obligatoire
    Étant donné que l'immeuble date de 1975
    Et que le PEB est classe F
    Quand l'audit est réalisé
    Alors il identifie:
      | Poste | Économie potentielle |
      | Isolation toiture | 25% chauffage |
      | Double vitrage | 15% chauffage |
      | Chaudière condensation | 20% gaz |
      | LED communs | 60% électricité |

  Scénario: Bornes recharge véhicules électriques
    Étant donné que 3 copropriétaires ont des VE
    Et demandent l'installation de bornes
    Quand le projet est étudié
    Alors les options sont:
      | Solution | Coût | Vote requis |
      | Infrastructure commune | 15000€ | 2/3 |
      | Bornes individuelles | 2000€/u | Accord AG simple |
      | Compteurs séparés | 500€/u | Notification |