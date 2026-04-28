# language: fr
Fonctionnalité: Déduction pour habitation propre et unique
  En tant que propriétaire occupant
  Je veux bénéficier des déductions fiscales pour mon habitation
  Afin de réduire mon impôt sur le revenu

  Contexte:
    Étant donné que les paramètres fiscaux 2024 sont:
      | Paramètre                           | Valeur            |
      | Bonus logement Flandre (supprimé)   | 0€               |
      | Chèque habitat Wallonie             | Variable         |
      | Déduction intérêts Bruxelles        | Variable         |
      | Plafond déduction ordinaire         | 2350€            |
      | Majoration première tranche         | 820€             |
      | Majoration 3+ enfants               | 80€/enfant       |
      | Durée avantage fiscal              | Maximum 20 ans    |

  Scénario: Chèque habitat wallon - Emprunt contracté après 2016
    Étant donné que je suis résident en Wallonie
    Et que j'ai contracté un emprunt hypothécaire le 1er mars 2020
    Et que le montant emprunté est de 200000€
    Et que l'habitation est mon unique logement
    Et que mes revenus imposables sont de 45000€
    Et que j'ai 2 enfants à charge
    Quand je calcule mon chèque habitat
    Alors l'avantage fiscal de base devrait être 1520€
    Et la réduction forfaitaire devrait être 125€ × 2 = 250€
    Et le montant total du chèque habitat devrait être 1770€
    Et cet avantage est valable pendant maximum 20 ans

  Scénario: Déduction intérêts hypothécaires Bruxelles
    Étant donné que je suis résident à Bruxelles
    Et que j'ai contracté un emprunt le 15 juin 2017
    Et que j'ai payé 3500€ d'intérêts en 2024
    Et que j'ai payé 1200€ de capital en 2024
    Et que l'habitation est mon unique logement
    Quand je calcule ma déduction fiscale
    Alors la déduction des intérêts devrait être plafonnée à 2350€
    Et l'avantage fiscal devrait être calculé au taux marginal
    Et pour un taux de 45%, l'économie devrait être 1057.50€

  Scénario: Ancien bonus logement flamand - Droits acquis
    Étant donné que je suis résident en Flandre
    Et que j'ai contracté un emprunt avant le 1er janvier 2020
    Et que je bénéficiais du bonus logement
    Et que mon bonus était de 1520€ en 2019
    Quand je calcule mon avantage fiscal 2024
    Alors je conserve mes droits acquis
    Et le montant reste fixé selon les anciennes règles
    Et l'avantage est maintenu jusqu'à la fin du crédit

  Scénario: Nouvelle acquisition Flandre après 2020
    Étant donné que je suis résident en Flandre
    Et que j'ai acheté ma première habitation en 2024
    Et que j'ai contracté un emprunt de 250000€
    Et que je paie 4000€ d'intérêts annuels
    Quand je vérifie mes avantages fiscaux
    Alors je ne bénéficie d'aucune déduction fiscale régionale
    Et le bonus logement n'existe plus depuis 2020
    Mais je peux déduire les droits d'enregistrement réduits (6% au lieu de 10%)

  Scénario: Habitation non principale - Déduction ordinaire
    Étant donné que je possède une résidence secondaire
    Et que j'ai un emprunt hypothécaire sur ce bien
    Et que j'ai payé 2800€ d'intérêts en 2024
    Et que j'ai payé 800€ d'assurance solde restant dû
    Quand je calcule ma déduction fiscale
    Alors la déduction est plafonnée à 2350€
    Et seuls les intérêts sont déductibles (pas l'assurance)
    Et la déduction s'applique au taux marginal d'imposition

  Scénario: Famille nombreuse - Majorations
    Étant donné que je suis propriétaire occupant en Wallonie
    Et que j'ai 4 enfants à charge au 1er janvier 2024
    Et que j'ai un emprunt hypothécaire en cours
    Et que mon chèque habitat de base est de 1520€
    Quand je calcule les majorations
    Alors la majoration pour enfants devrait être:
      | Enfants | Majoration unitaire | Total majoration |
      | 2 premiers | 125€ | 250€ |
      | 3ème enfant | 125€ + 80€ | 205€ |
      | 4ème enfant | 125€ + 80€ | 205€ |
    Et le chèque habitat total devrait être 2180€

  Scénario: Refinancement hypothécaire
    Étant donné que j'ai refinancé mon emprunt en 2024
    Et que l'emprunt initial datait de 2018
    Et que le nouveau montant emprunté est de 180000€
    Et que le solde restant dû était de 150000€
    Quand je calcule mes avantages fiscaux
    Alors seul le montant initial (150000€) reste éligible
    Et le supplément de 30000€ n'ouvre pas droit à déduction
    Et les conditions initiales sont maintenues

  Scénario: Achat avec travaux économiseurs d'énergie
    Étant donné que j'ai acheté une habitation en 2024
    Et que j'ai contracté un emprunt de 300000€
    Et dont 250000€ pour l'achat
    Et 50000€ pour des travaux de rénovation énergétique
    Quand je calcule mes avantages fiscaux
    Alors la partie habitation suit les règles régionales
    Et la partie travaux peut bénéficier de déductions supplémentaires
    Et je peux cumuler avec les primes énergie régionales

  Plan du Scénario: Calcul déduction selon région et revenus
    Étant donné que je réside en <région>
    Et que mes revenus imposables sont de <revenus>€
    Et que j'ai <enfants> enfants à charge
    Et que mon emprunt date de <année_emprunt>
    Et que je paie <intérêts>€ d'intérêts annuels
    Quand je calcule mon avantage fiscal
    Alors l'avantage devrait être <avantage>€

    Exemples:
      | région    | revenus | enfants | année_emprunt | intérêts | avantage |
      | Wallonie  | 35000   | 2       | 2021         | 3000     | 1770     |
      | Wallonie  | 50000   | 0       | 2019         | 4000     | 1520     |
      | Bruxelles | 40000   | 1       | 2018         | 3500     | 1057     |
      | Flandre   | 45000   | 2       | 2019         | 3800     | 1520     |
      | Flandre   | 60000   | 3       | 2024         | 4500     | 0        |

  Scénario: Conditions d'occupation
    Étant donné que j'ai acheté une habitation avec avantage fiscal
    Quand je vérifie les conditions d'occupation
    Alors je dois occuper l'habitation dans les 2 ans suivant l'acquisition
    Et l'habitation doit rester mon domicile principal
    Et en cas de non-respect, l'avantage fiscal est récupéré
    Et des exceptions existent pour raisons professionnelles ou sociales

  Scénario: Vente anticipée de l'habitation
    Étant donné que je bénéficie d'un avantage fiscal habitation
    Et que je vends mon habitation après 5 ans
    Et que l'emprunt court depuis 2019
    Quand je calcule les conséquences fiscales
    Alors l'avantage fiscal cesse à la date de vente
    Et aucune récupération n'est due si j'ai occupé 2 ans minimum
    Et je peux transférer l'avantage si j'achète une nouvelle habitation propre

  Scénario: Déclaration fiscale - Codes à utiliser
    Étant donné que je veux déclarer mes déductions habitation
    Quand je remplis ma déclaration fiscale
    Alors je dois utiliser les codes suivants:
      | Type de déduction              | Code cadre | Remarque                   |
      | Intérêts hypothécaires         | VII        | Selon région               |
      | Capital remboursé              | VII        | Si éligible                |
      | Assurance solde restant dû     | VII        | Si contrat avant 2020      |
      | Chèque habitat Wallonie        | Automatique| Calculé par l'administration|
    Et je dois joindre l'attestation de mon prêteur
    Et le calcul final est fait par l'administration fiscale

  Scénario: Cumul avec autres avantages
    Étant donné que je bénéficie de déductions habitation
    Et que j'ai aussi droit à d'autres avantages fiscaux
    Quand je vérifie les possibilités de cumul
    Alors je peux cumuler avec:
      | Avantage compatible                    |
      | Déduction pour épargne-pension          |
      | Réduction pour isolation                |
      | Déduction pour frais de garde           |
      | Crédit d'impôt pour bas revenus         |
    Mais je ne peux pas cumuler plusieurs avantages habitation
    Et le plafond global des déductions reste d'application