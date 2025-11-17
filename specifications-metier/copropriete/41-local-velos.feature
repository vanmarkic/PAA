# language: fr
Fonctionnalité: Aménagement Local Vélos
  En tant que copropriété
  Je veux aménager un local vélos
  Afin de promouvoir la mobilité douce

  Contexte:
    Étant donné que les résidents utilisent des vélos

  Scénario: Création local vélos sécurisé
    Étant donné qu'un espace de 30m² est disponible
    Pour 30 vélos potentiels
    Quand l'aménagement est voté
    Alors il comprend:
      | Équipement | Spécification |
      | Râteliers | 15 doubles |
      | Éclairage | Détecteur présence |
      | Ventilation | Naturelle suffisante |
      | Accès sécurisé | Badge/clé |
      | Caméra | Option votée |
      | Prise recharge VAE | 6 prises |

  Scénario: Attribution emplacements vélos
    Étant donné que 30 places sont disponibles
    Mais 40 demandes existent
    Quand l'attribution est organisée
    Alors les critères sont:
      | Priorité | Critère |
      | 1 | Usage quotidien prouvé |
      | 2 | Pas de garage privatif |
      | 3 | Ordre inscription |
      | Durée | 1 an renouvelable |
      | Tarif | 5€/mois facultatif |

  Scénario: Responsabilité vol/dégradation
    Étant donné qu'un vélo est volé du local
    Quand la responsabilité est examinée
    Alors elle dépend de:
      | Situation | Responsabilité |
      | Local fermé correctement | Assurance propriétaire |
      | Négligence fermeture | Dernier utilisateur |
      | Défaut sécurité prouvé | Copropriété partielle |
      | Pas d'obligation garde | Copropriété dégagée |