# language: fr
Fonctionnalité: Destruction et Reconstruction
  En tant que copropriété
  Je veux gérer la destruction de l'immeuble
  Afin de protéger les droits en cas de sinistre

  Contexte:
    Étant donné qu'un sinistre majeur survient

  Scénario: Destruction partielle par incendie
    Étant donné que 40% de l'immeuble est détruit
    Et que la reconstruction coûte 2 millions €
    Quand l'AG décide de la suite
    Alors les options sont:
      | Option | Majorité requise |
      | Reconstruction identique | 2/3 |
      | Reconstruction modifiée | 3/4 |
      | Vente terrain | 4/5 |
      | Dissolution copropriété | Unanimité |

  Scénario: Indemnité assurance insuffisante
    Étant donné que l'assurance verse 1,5 millions €
    Mais que la reconstruction coûte 2 millions €
    Quand le financement est organisé
    Alors les solutions sont:
      | Source | Modalité |
      | Appel fonds extraordinaire | 500000€ |
      | Emprunt collectif | Si AG 3/4 |
      | Réduction projet | Si AG 2/3 |
      | Abandon reconstruction | Si AG 4/5 |

  Scénario: Copropriétaire refusant reconstruction
    Étant donné qu'un copropriétaire refuse de participer
    À la reconstruction votée aux 2/3
    Quand il conteste la décision
    Alors ses options sont:
      | Option | Procédure |
      | Vendre ses droits | Aux autres copropriétaires |
      | Contester en justice | Sous 4 mois |
      | Demander indemnisation | Si préjudice excessif |
      | Subir décision | Si vote régulier |