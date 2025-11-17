# language: fr
Fonctionnalité: Audit Technique de l'Immeuble
  En tant que copropriété
  Je veux réaliser un audit technique
  Afin de planifier les travaux nécessaires

  Contexte:
    Étant donné que l'immeuble a plus de 15 ans

  Scénario: Audit technique quinquennal
    Étant donné que le dernier audit date de 5 ans
    Et que l'immeuble a 30 ans
    Quand l'audit est réalisé
    Alors il examine:
      | Élément | Points contrôle |
      | Structure | Fissures, stabilité |
      | Toiture | Étanchéité, isolation |
      | Façades | Dégradation, joints |
      | Installations | Électricité, plomberie |
      | Sécurité | Incendie, accès |
      | Performance | Énergétique, acoustique |

  Scénario: Plan travaux sur 10 ans
    Étant donné que l'audit révèle plusieurs problèmes
    Totalisant 250000€ de travaux
    Quand le plan décennal est établi
    Alors il priorise:
      | Année | Travaux | Budget |
      | 1-2 | Sécurité urgente | 50000€ |
      | 3-4 | Toiture/étanchéité | 80000€ |
      | 5-6 | Ravalement façades | 70000€ |
      | 7-8 | Modernisation ascenseur | 30000€ |
      | 9-10 | Amélioration énergie | 20000€ |

  Scénario: Constitution provision travaux
    Étant donné que 250000€ sont nécessaires sur 10 ans
    Quand la provision est calculée
    Alors elle représente:
      | Calcul | Montant |
      | Annuel total | 25000€ |
      | Par millième/an | 25€ |
      | Mensuel 100 millièmes | 208€ |
      | Révision annuelle | +inflation |