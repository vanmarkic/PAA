# language: fr
Fonctionnalité: Régime Fiscal des Artistes
  En tant qu'artiste indépendant
  Je veux comprendre mon régime fiscal spécifique
  Afin d'optimiser ma situation fiscale légalement

  Contexte:
    Étant donné que le régime fiscal artistique prévoit:
      | Paramètre                        | Valeur/Taux   |
      | Frais forfaitaires déductibles   | 50%           |
      | Plafond frais forfaitaires       | 10000€        |
      | Taux TVA œuvres originales       | 6%            |
      | Quotité exonérée supplémentaire  | 3590€         |
      | Précompte mobilier droits auteur | 15%           |

  Scénario: Application des frais forfaitaires
    Étant donné que je suis artiste plasticien
    Et que mes revenus artistiques bruts sont de 20000€
    Et que je choisis le régime des frais forfaitaires
    Quand je calcule mes revenus imposables
    Alors mes frais forfaitaires sont de 10000€ (plafond)
    Et mes revenus nets imposables sont de 10000€
    Et je bénéficie du régime fiscal avantageux

  Scénario: Droits d'auteur avec précompte mobilier
    Étant donné que je suis écrivain
    Et que mes droits d'auteur sont de 15000€
    Et que je choisis le précompte mobilier libératoire
    Quand je calcule mon imposition
    Alors le précompte de 15% s'applique (2250€)
    Et ces revenus sont exclus de l'IPP
    Et mon revenu net est de 12750€

  Scénario: TVA sur ventes d'œuvres
    Étant donné que je suis sculpteur
    Et que je vends une œuvre originale à 5000€
    Et que l'œuvre est ma création personnelle
    Quand j'applique la TVA
    Alors le taux réduit de 6% s'applique
    Et la TVA est de 300€
    Et le prix total est de 5300€

  Scénario: Régime des petites indemnités
    Étant donné que je suis artiste occasionnel
    Et que mes revenus artistiques annuels sont de 2500€
    Et que je ne dépasse pas le plafond
    Quand je déclare mes revenus
    Alors le régime des petites indemnités s'applique
    Et l'exonération de cotisations sociales est accordée
    Et seul l'impôt sur le revenu est dû

  Scénario: Cumul salariat et indépendant artistique
    Étant donné que je suis salarié à mi-temps
    Et que j'ai des revenus artistiques indépendants de 12000€
    Et que mon salaire annuel est de 18000€
    Quand je calcule ma situation fiscale
    Alors mes deux revenus sont imposés séparément
    Et je peux appliquer les frais forfaitaires artistiques
    Et les cotisations sociales sont calculées sur chaque régime

  Plan du Scénario: Calcul fiscal selon revenus
    Étant donné que mes revenus artistiques sont de <revenus>€
    Et que je choisis <régime>
    Quand je calcule mon impôt
    Alors mes frais déductibles sont de <frais>€
    Et ma base imposable est de <imposable>€

    Exemples:
      | revenus | régime           | frais  | imposable |
      | 10000   | forfaitaire      | 5000   | 5000      |
      | 25000   | forfaitaire      | 10000  | 15000     |
      | 15000   | frais réels      | 8000   | 7000      |
      | 8000    | petites indemnités| 4000   | 4000      |