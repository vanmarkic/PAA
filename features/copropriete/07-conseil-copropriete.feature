# language: fr
Fonctionnalité: Conseil de Copropriété
  En tant que copropriété
  Je veux élire et gérer un conseil de copropriété
  Afin d'assister et contrôler le syndic

  Contexte:
    Étant donné que la copropriété compte plus de 20 lots

  Scénario: Élection obligatoire du conseil
    Étant donné que la copropriété a 25 lots principaux
    Et qu'aucun conseil n'est en place
    Quand l'AG ordinaire se tient
    Alors l'élection du conseil est obligatoire
    Et au moins 3 membres doivent être élus
    Et le mandat est de 3 ans maximum

  Scénario: Missions du conseil de copropriété
    Étant donné que le conseil est élu
    Quand il exerce ses fonctions
    Alors ses missions incluent:
      | Mission | Fréquence |
      | Contrôler la gestion du syndic | Continue |
      | Vérifier les comptes | Trimestrielle |
      | Donner avis sur les travaux | À la demande |
      | Assister aux AG | Systématique |
      | Rapport annuel à l'AG | Annuelle |

  Scénario: Réunion conseil avec le syndic
    Étant donné que le conseil demande une réunion
    Et que 2 membres sur 3 le demandent
    Quand la demande est formulée
    Alors le syndic doit organiser la réunion sous 15 jours
    Et fournir les documents demandés
    Et un PV doit être rédigé