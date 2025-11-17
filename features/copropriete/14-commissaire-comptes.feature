# language: fr
Fonctionnalité: Commissaire aux Comptes
  En tant que copropriété
  Je veux nommer un commissaire aux comptes
  Afin de contrôler la gestion financière

  Contexte:
    Étant donné que la copropriété veut contrôler ses comptes

  Scénario: Nomination obligatoire grande copropriété
    Étant donné que la copropriété compte plus de 50 lots
    Quand l'AG ordinaire se réunit
    Alors la nomination d'un commissaire est obligatoire
    Et il peut être copropriétaire ou externe
    Et son mandat est d'un an renouvelable

  Scénario: Missions du commissaire aux comptes
    Étant donné qu'un commissaire est nommé
    Quand il exerce sa mission
    Alors il doit:
      | Mission | Fréquence |
      | Vérifier les comptes | Trimestrielle |
      | Contrôler les pièces justificatives | Continue |
      | Vérifier les appels de fonds | Mensuelle |
      | Contrôler le compte bancaire | Mensuelle |
      | Rapport à l'AG | Annuelle |

  Scénario: Découverte d'irrégularités
    Étant donné que le commissaire découvre des anomalies
    Montant à 5000€ non justifiés
    Quand il constate l'irrégularité
    Alors il doit:
      | Action | Délai |
      | Demander justificatifs au syndic | Immédiat |
      | Informer le conseil | 48h |
      | Rapport spécial si non résolu | 15 jours |
      | Demander AG extraordinaire | Si grave |