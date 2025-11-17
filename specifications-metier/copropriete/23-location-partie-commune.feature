# language: fr
Fonctionnalité: Location de Partie Commune
  En tant que copropriété
  Je veux louer des parties communes
  Afin de générer des revenus supplémentaires

  Contexte:
    Étant donné que la copropriété a des espaces locatifs

  Scénario: Location emplacement publicitaire
    Étant donné qu'une façade permet l'affichage publicitaire
    Et qu'une société offre 500€/mois
    Quand l'AG vote la location
    Alors la majorité des 2/3 est requise
    Et les revenus réduisent les charges communes
    Et un contrat maximum 3 ans est établi

  Scénario: Location toiture pour antenne
    Étant donné qu'un opérateur télécom veut installer une antenne
    Pour 800€/mois sur 9 ans
    Quand l'AG examine l'offre
    Alors elle vérifie:
      | Critère | Validation |
      | Impact santé | Étude ondes requise |
      | Impact esthétique | Avis urbanisme |
      | Assurance RC | Augmentation prime |
      | Accès maintenance | Protocole défini |
      | Démantèlement | Garantie bancaire |

  Scénario: Répartition revenus locatifs
    Étant donné que la location rapporte 12000€/an
    Quand les revenus sont distribués
    Alors la répartition est:
      | Usage | Pourcentage |
      | Réduction charges | 70% |
      | Fonds de réserve | 20% |
      | Frais de gestion | 10% |