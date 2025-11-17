# language: fr
Fonctionnalité: Sécurité Sociale des Artistes
  En tant qu'artiste indépendant
  Je veux comprendre ma couverture sociale
  Afin de bénéficier de la protection adaptée

  Contexte:
    Étant donné que la sécurité sociale artistique comprend:
      | Cotisation                    | Taux/Montant        |
      | Cotisation minimum trimestrielle| 721.89€            |
      | Cotisation sur revenus         | 20.5%              |
      | Pension minimum garantie       | 1449.15€/mois      |
      | Indemnité maladie             | 60% revenus        |
      | Congé maternité artiste       | 12 semaines        |

  Scénario: Affiliation comme artiste indépendant
    Étant donné que je débute comme artiste indépendant
    Et que mes revenus prévisionnels sont de 20000€
    Quand je m'affilie à une caisse d'assurances sociales
    Alors je paie les cotisations provisoires
    Et je suis couvert en maladie-invalidité
    Et j'accumule des droits de pension

  Scénario: Calcul des cotisations sociales
    Étant donné que mes revenus artistiques sont de 25000€
    Et que je suis indépendant à titre principal
    Quand je calcule mes cotisations
    Alors la base de calcul est de 25000€
    Et les cotisations sont de 5125€ (20.5%)
    Et elles sont payables trimestriellement

  Scénario: Dispense de cotisations pour faibles revenus
    Étant donné que mes revenus annuels sont de 4000€
    Et que c'est inférieur au seuil
    Quand je demande une dispense
    Alors je peux être dispensé de cotisations
    Mais je perds certains droits sociaux
    Et je dois le demander explicitement

  Scénario: Assimilation artiste-salarié
    Étant donné que j'ai le statut article 1bis
    Et que je travaille sous contrats courts
    Quand mes cotisations sont calculées
    Alors elles sont prélevées comme pour un salarié
    Et l'employeur paie la part patronale
    Et j'ai les mêmes droits qu'un salarié

  Scénario: Congé maternité pour artiste
    Étant donné que je suis artiste enceinte
    Et que j'ai cotisé 6 mois minimum
    Quand je prends mon congé maternité
    Alors j'ai droit à 12 semaines
    Et l'indemnité est de 506.24€/semaine
    Et je peux reprendre progressivement

  Scénario: Cumul pension et activité artistique
    Étant donné que je suis pensionné
    Et que je veux continuer mon activité artistique
    Et que ma pension est de 1500€/mois
    Quand je calcule les limites
    Alors je peux gagner jusqu'à 7700€/an
    Sans réduction de pension
    Au-delà, la pension est réduite proportionnellement