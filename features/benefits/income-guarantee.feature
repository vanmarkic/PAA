# language: fr
Fonctionnalité: Allocation de Garantie de Revenus (AGR)
  En tant que travailleur à temps partiel
  Je veux savoir si j'ai droit à l'AGR
  Afin d'optimiser mes revenus

  Contexte:
    Étant donné que le revenu minimum mensuel garanti est de 1650€

  Scénario: Travailleur à temps partiel avec maintien des droits éligible
    Étant donné que je suis un travailleur à temps partiel
    Et que j'ai le maintien des droits
    Et que mon salaire brut mensuel est de 1200€
    Quand je vérifie mon éligibilité à l'AGR
    Alors je devrais être éligible
    Et le montant de l'allocation devrait être 360€
    Et je devrais pouvoir cumuler avec mon salaire
    Et je devrais pouvoir cumuler avec les allocations familiales

  Scénario: Salaire trop élevé pour l'AGR
    Étant donné que je suis un travailleur à temps partiel
    Et que j'ai le maintien des droits
    Et que mon salaire brut mensuel est de 1700€
    Quand je vérifie mon éligibilité à l'AGR
    Alors je ne devrais pas être éligible
    Et le motif devrait être "salaire supérieur au minimum garanti"

  Scénario: Sans maintien des droits
    Étant donné que je suis un travailleur à temps partiel
    Et que je n'ai pas le maintien des droits
    Et que mon salaire brut mensuel est de 1200€
    Quand je vérifie mon éligibilité à l'AGR
    Alors je ne devrais pas être éligible
    Et le motif devrait être "pas de maintien des droits"

  Scénario: Incompatibilité avec le chômage complet
    Étant donné que je suis un travailleur à temps partiel
    Et que j'ai le maintien des droits
    Et que mon salaire brut mensuel est de 1200€
    Et que je reçois une allocation de chômage complet
    Quand je vérifie mon éligibilité à l'AGR
    Alors je ne devrais pas être éligible
    Et le motif devrait être "cumul interdit avec chômage complet"

  Plan du Scénario: Heures de travail optimales
    Étant donné que je travaille <heures> heures par semaine
    Et que mon salaire brut mensuel est de <salaire>€
    Et que j'ai le maintien des droits
    Quand je calcule mon revenu total avec l'AGR
    Alors mon revenu total devrait être de <revenu_total>€
    Et l'optimisation devrait suggérer "<conseil>"

    Exemples:
      | heures | salaire | revenu_total | conseil                                  |
      | 15     | 800     | 1160         | "Augmenter à 20-28h pour maximiser AGR" |
      | 20     | 1100    | 1540         | "Zone optimale pour AGR"                 |
      | 28     | 1500    | 1700         | "Zone optimale pour AGR"                 |
      | 35     | 1800    | 1800         | "Temps plein, pas d'AGR possible"        |
