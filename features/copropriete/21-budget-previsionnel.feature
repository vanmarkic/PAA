# language: fr
Fonctionnalité: Établissement du Budget Prévisionnel
  En tant que syndic
  Je veux établir le budget prévisionnel
  Afin de planifier les dépenses annuelles

  Contexte:
    Étant donné que l'exercice comptable approche

  Scénario: Préparation budget annuel standard
    Étant donné que l'AG ordinaire approche
    Et que le budget précédent était de 50000€
    Quand je prépare le nouveau budget
    Alors il comprend:
      | Poste | % Budget | Montant |
      | Entretien courant | 25% | 12500€ |
      | Énergie communs | 20% | 10000€ |
      | Assurances | 10% | 5000€ |
      | Honoraires syndic | 15% | 7500€ |
      | Fonds réserve | 10% | 5000€ |
      | Frais administratifs | 5% | 2500€ |
      | Petites réparations | 10% | 5000€ |
      | Divers et imprévus | 5% | 2500€ |

  Scénario: Ajustement pour inflation
    Étant donné que l'inflation est de 4%
    Et que certains postes sont indexés
    Quand je calcule les ajustements
    Alors l'augmentation est:
      | Poste | Indexation |
      | Salaires/honoraires | +4% |
      | Énergie | +8% estimation |
      | Assurances | +3% contrat |
      | Entretien | +4% général |

  Scénario: Vote budget déficitaire interdit
    Étant donné que les dépenses prévues sont 60000€
    Et que les recettes prévues sont 55000€
    Quand le budget est soumis à l'AG
    Alors il doit être équilibré
    Soit par augmentation des charges
    Soit par réduction des dépenses
    Et ne peut être voté en déficit