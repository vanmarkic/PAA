# language: fr
Fonctionnalité: Déduction des emprunts hypothécaires
  En tant que propriétaire avec emprunt hypothécaire
  Je veux déduire mes intérêts et remboursements en capital
  Afin de réduire mon impôt sur le revenu

  Contexte:
    Étant donné que les paramètres fiscaux 2024 pour emprunts hypothécaires sont:
      | Paramètre                                  | Valeur           |
      | Plafond déduction ordinaire intérêts      | 2350€           |
      | Plafond épargne à long terme              | 2350€           |
      | Bonus logement Flandre (supprimé)         | 0€              |
      | Chèque habitat Wallonie base              | 1520€           |
      | Chèque habitat majoration enfant          | 125€            |
      | Déduction Bruxelles habitation propre     | Variable        |
      | Durée minimale emprunt                    | 10 ans          |
      | Durée maximale avantage fiscal            | 20 ans          |

  Scénario: Emprunt habitation propre et unique - Wallonie
    Étant donné que je réside en Wallonie
    Et que j'ai contracté un emprunt de 250000€ en janvier 2021
    Et que la durée de l'emprunt est de 20 ans
    Et que le taux d'intérêt est de 1.5%
    Et que j'ai payé en 2024:
      | Type de paiement        | Montant  |
      | Intérêts               | 3600€    |
      | Capital                | 11000€   |
      | Assurance solde restant| 450€     |
    Quand je calcule ma déduction fiscale
    Alors je bénéficie du chèque habitat de 1520€
    Et l'avantage est une réduction d'impôt directe
    Et je ne déduis pas les intérêts séparément

  Scénario: Emprunt habitation non principale - Déduction ordinaire
    Étant donné que j'ai un emprunt pour une résidence secondaire
    Et que j'ai contracté l'emprunt de 150000€ en 2018
    Et que j'ai payé 2800€ d'intérêts en 2024
    Et que j'ai payé 600€ d'assurance solde restant dû
    Quand je calcule ma déduction fiscale
    Alors seuls les intérêts sont déductibles
    Et le montant déductible est plafonné à 2350€
    Et la déduction s'applique au taux marginal d'imposition
    Et pour un taux de 40%, l'économie est de 940€

  Scénario: Emprunt mixte habitation et travaux
    Étant donné que j'ai contracté un emprunt de 300000€
    Et dont 220000€ pour l'achat de l'habitation
    Et 80000€ pour des travaux de rénovation
    Et que j'ai payé 4500€ d'intérêts en 2024
    Quand je calcule mes déductions
    Alors les intérêts sont ventilés proportionnellement:
      | Part                | Pourcentage | Intérêts |
      | Habitation         | 73.33%      | 3300€    |
      | Travaux           | 26.67%      | 1200€    |
    Et chaque partie suit ses propres règles de déduction
    Et je peux cumuler avec les primes rénovation

  Scénario: Refinancement avec augmentation du capital
    Étant donné que j'avais un emprunt initial de 200000€ en 2019
    Et que le solde restant dû était de 170000€ en 2024
    Et que j'ai refinancé pour 220000€ en mars 2024
    Et que j'ai payé 3800€ d'intérêts après refinancement
    Quand je calcule ma déduction fiscale
    Alors seule la partie correspondant au solde initial (170000€) est éligible
    Et les intérêts déductibles sont: 3800€ × (170000/220000) = 2936€
    Et le supplément de 50000€ ne donne pas droit à déduction

  Scénario: Couple avec emprunts multiples
    Étant donné que nous sommes un couple marié
    Et que nous avons:
      | Emprunt                    | Montant  | Intérêts 2024 |
      | Habitation principale      | 280000€  | 4200€        |
      | Appartement investissement | 120000€  | 2100€        |
      | Maison de campagne        | 100000€  | 1800€        |
    Quand nous calculons nos déductions
    Alors l'habitation principale suit les règles régionales
    Et les autres biens sont en déduction ordinaire plafonnée
    Et le plafond global de 2350€ s'applique par bien

  Scénario: Emprunt à taux variable avec révision
    Étant donné que j'ai un emprunt à taux variable
    Et que le taux initial était de 1.2% en 2023
    Et que le taux a été révisé à 2.1% en juin 2024
    Et que mes intérêts payés sont:
      | Période            | Montant |
      | Janvier-Mai 2024   | 1000€   |
      | Juin-Décembre 2024 | 1900€   |
    Quand je déclare mes intérêts
    Alors le total déductible est 2900€
    Mais plafonné selon les règles applicables
    Et l'attestation bancaire reprend le total annuel

  Scénario: Assurance solde restant dû - Règles transitoires
    Étant donné que j'ai contracté mon emprunt en 2015
    Et que j'ai une assurance solde restant dû
    Et que la prime annuelle est de 800€
    Quand je vérifie la déductibilité
    Alors l'assurance est déductible car contrat avant 2020
    Et le montant s'ajoute aux intérêts
    Mais le plafond global reste d'application
    Et pour les nouveaux contrats (post-2020), pas de déduction

  Scénario: Remboursement anticipé partiel
    Étant donné que j'ai effectué un remboursement anticipé de 30000€
    Et que j'ai payé une indemnité de remploi de 900€
    Et que mes intérêts réguliers sont de 2500€ pour 2024
    Quand je calcule mes déductions
    Alors l'indemnité de remploi n'est pas déductible
    Et seuls les intérêts réguliers (2500€) sont déductibles
    Et mes mensualités futures sont recalculées

  Plan du Scénario: Déduction selon région et date contrat
    Étant donné que je réside en <région>
    Et que mon emprunt date de <année_contrat>
    Et que le montant emprunté est de <montant>€
    Et que j'ai <enfants> enfants à charge
    Et que je paie <intérêts>€ d'intérêts annuels
    Quand je calcule mon avantage fiscal
    Alors l'avantage devrait être <avantage>€

    Exemples:
      | région    | année_contrat | montant | enfants | intérêts | avantage |
      | Wallonie  | 2021         | 200000  | 0       | 3000     | 1520     |
      | Wallonie  | 2020         | 250000  | 2       | 3750     | 1770     |
      | Bruxelles | 2018         | 180000  | 1       | 2700     | 1215     |
      | Flandre   | 2019         | 220000  | 2       | 3300     | 1520     |
      | Flandre   | 2024         | 300000  | 1       | 4500     | 0        |

  Scénario: Construction ou acquisition sur plan
    Étant donné que j'ai signé un compromis pour une construction
    Et que j'ai un crédit de construction de 350000€
    Et que je ne paie que des intérêts intercalaires en 2024
    Et que le montant des intérêts est de 2100€
    Quand je vérifie mes déductions
    Alors les intérêts intercalaires sont déductibles
    Mais l'avantage fiscal principal commence après réception
    Et je dois occuper dans les 2 ans de la réception

  Scénario: Séparation et reprise de l'emprunt
    Étant donné que je me suis séparé en 2024
    Et que j'ai repris seul l'emprunt commun de 180000€
    Et que j'ai payé 3200€ d'intérêts depuis la reprise
    Et que l'habitation reste ma résidence principale
    Quand je calcule mes déductions
    Alors je bénéficie de l'intégralité des avantages
    Et les conditions initiales sont maintenues
    Et mon ex-conjoint perd tout avantage fiscal

  Scénario: Documentation requise pour la déclaration
    Étant donné que je veux déduire mes intérêts hypothécaires
    Quand je prépare ma déclaration fiscale
    Alors je dois disposer de:
      | Document requis                           | Source        |
      | Attestation fiscale 281.61                | Banque        |
      | Détail intérêts et capital                | Banque        |
      | Attestation assurance solde restant       | Assureur      |
      | Preuve occupation habitation propre       | Commune       |
      | Acte de crédit hypothécaire              | Notaire       |
    Et je dois utiliser les codes:
      | Type                    | Code cadre VII |
      | Intérêts ordinaires    | 1146-28        |
      | Chèque habitat         | Automatique    |
      | Assurance (si éligible)| 1145-29        |