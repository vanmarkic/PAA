# language: fr
Fonctionnalité: Gestion des Servitudes
  En tant que copropriété
  Je veux gérer les servitudes
  Afin de respecter les droits et obligations

  Contexte:
    Étant donné que l'immeuble a des servitudes

  Scénario: Servitude de passage existante
    Étant donné qu'une servitude de passage existe
    Au profit du fonds voisin
    Quand la copropriété veut modifier l'accès
    Alors elle doit:
      | Action | Condition |
      | Maintenir le passage | Obligatoire |
      | Déplacer si nécessaire | Accord bénéficiaire |
      | Indemniser si suppression | Négociation |
      | Respecter largeur minimale | 3 mètres véhicules |

  Scénario: Création nouvelle servitude
    Étant donné qu'un voisin demande une servitude
    Pour accéder à sa propriété enclavée
    Quand l'AG examine la demande
    Alors la décision requiert:
      | Type décision | Majorité |
      | Servitude temporaire | 2/3 |
      | Servitude permanente | 4/5 |
      | Modification acte base | Unanimité |
    Et une indemnité est négociable

  Scénario: Servitude de vue contestée
    Étant donné qu'un copropriétaire ouvre une fenêtre
    À moins de 1,90m de la limite
    Quand la violation est constatée
    Alors le syndic doit:
      | Action | Délai |
      | Mise en demeure | Immédiat |
      | Fermeture volontaire | 30 jours |
      | Action en justice | Si refus |