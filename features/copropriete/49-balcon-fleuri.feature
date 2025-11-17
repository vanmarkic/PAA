# language: fr
Fonctionnalité: Gestion des Balcons et Façades
  En tant que copropriété
  Je veux encadrer l'usage des balcons
  Afin de maintenir l'esthétique de l'immeuble

  Contexte:
    Étant donné que les balcons sont visibles

  Scénario: Installation jardinières balcon
    Étant donné qu'un copropriétaire veut des jardinières
    Sur son balcon au 3ème étage
    Quand il demande l'autorisation
    Alors les conditions sont:
      | Aspect | Règle |
      | Fixation | Intérieure obligatoire |
      | Hauteur max | Garde-corps |
      | Couleur | Harmonie façade |
      | Arrosage | Sans coulure |
      | Entretien | Régulier exigé |

  Scénario: Store banne sur balcon
    Étant donné qu'un store banne est souhaité
    De 4 mètres pour terrasse sud
    Quand l'installation est demandée
    Alors elle requiert:
      | Élément | Exigence |
      | Modèle | Uniforme par façade |
      | Couleur toile | Votée AG |
      | Installation | Professionnel |
      | Vote AG | Majorité simple |
      | Entretien | Propriétaire |

  Scénario: Interdiction séchage linge visible
    Étant donné que le règlement interdit le linge visible
    Et qu'un résident sèche sur balcon façade rue
    Quand l'infraction est constatée
    Alors le syndic:
      | Action | Progressivité |
      | Rappel règlement | Courtois |
      | Avertissement écrit | Si récidive |
      | Mise en demeure | 3ème fois |
      | AG sanctions | Si persiste |