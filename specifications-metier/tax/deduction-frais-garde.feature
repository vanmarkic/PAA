# language: fr
Fonctionnalité: Déduction des frais de garde d'enfants
  En tant que parent contribuable
  Je veux déduire mes frais de garde d'enfants
  Afin de réduire mon impôt sur le revenu

  Contexte:
    Étant donné que les paramètres fiscaux 2024 sont:
      | Paramètre                      | Valeur           |
      | Plafond journalier par enfant  | 16.40€          |
      | Taux de réduction standard     | 45%             |
      | Taux majoré (parent isolé)     | 75%             |
      | Âge limite enfant standard     | 14 ans          |
      | Âge limite enfant handicapé    | 21 ans          |
      | Code déclaration impôt        | 1384-71         |

  Scénario: Parent avec frais de garde éligibles
    Étant donné que je suis parent salarié
    Et que j'ai 1 enfant de 5 ans
    Et que mon enfant fréquente une crèche agréée
    Et que les frais de garde sont de 15€ par jour
    Et que mon enfant a été gardé 200 jours en 2024
    Quand je calcule ma déduction fiscale
    Alors le montant déductible devrait être 3000€ (15€ × 200 jours)
    Et la réduction d'impôt devrait être 1350€ (45% de 3000€)
    Et je devrais indiquer 3000€ au code 1384-71

  Scénario: Frais de garde dépassant le plafond journalier
    Étant donné que je suis parent salarié
    Et que j'ai 1 enfant de 6 ans
    Et que mon enfant fréquente une garderie privée agréée
    Et que les frais de garde sont de 25€ par jour
    Et que mon enfant a été gardé 100 jours en 2024
    Quand je calcule ma déduction fiscale
    Alors le montant déductible devrait être limité à 1640€ (16.40€ × 100 jours)
    Et la réduction d'impôt devrait être 738€ (45% de 1640€)
    Et je devrais indiquer 1640€ au code 1384-71

  Scénario: Parent isolé avec revenus modestes
    Étant donné que je suis parent isolé
    Et que mes revenus annuels sont inférieurs à 18363€
    Et que j'ai 1 enfant de 4 ans
    Et que mon enfant fréquente une crèche communale
    Et que les frais de garde sont de 10€ par jour
    Et que mon enfant a été gardé 220 jours en 2024
    Quand je calcule ma déduction fiscale
    Alors le montant déductible devrait être 2200€ (10€ × 220 jours)
    Et la réduction d'impôt devrait être 1650€ (75% de 2200€)
    Et je devrais bénéficier du taux majoré de 75%

  Scénario: Enfant de moins de 3 ans - Choix entre avantages
    Étant donné que j'ai un enfant né le 15 mars 2022
    Et que j'ai payé 1500€ de frais de garde en 2024
    Et que j'ai droit à la majoration pour enfant de moins de 3 ans
    Quand je compare les deux avantages fiscaux
    Alors je dois choisir entre:
      | Avantage                        | Montant estimé |
      | Déduction frais de garde        | 675€          |
      | Majoration enfant < 3 ans       | 680€          |
    Et je ne peux pas cumuler les deux avantages
    Et le système devrait recommander la majoration enfant < 3 ans

  Scénario: Enfant handicapé de plus de 14 ans
    Étant donné que j'ai un enfant de 16 ans
    Et que mon enfant a un handicap reconnu à 66%
    Et que mon enfant fréquente un centre spécialisé
    Et que les frais de garde sont de 20€ par jour
    Et que mon enfant a été gardé 150 jours en 2024
    Quand je calcule ma déduction fiscale
    Alors je devrais être éligible car l'âge limite est 21 ans
    Et le montant déductible devrait être 2460€ (16.40€ × 150 jours)
    Et la réduction d'impôt devrait être 1107€ (45% de 2460€)

  Scénario: Garde partagée - Parents séparés
    Étant donné que je suis divorcé avec garde alternée
    Et que mon ex-conjoint et moi partageons la garde à 50/50
    Et que j'ai payé 2000€ de frais de garde en 2024
    Et que mon ex-conjoint a payé 1800€ de frais de garde en 2024
    Quand nous déclarons nos frais de garde
    Alors je peux déduire 2000€ sur ma déclaration
    Et mon ex-conjoint peut déduire 1800€ sur sa déclaration
    Et chacun bénéficie de la réduction selon ses propres frais

  Scénario: Camps de vacances et stages
    Étant donné que j'ai 2 enfants de 8 et 10 ans
    Et que mes enfants ont participé à:
      | Type d'activité     | Enfant | Jours | Coût/jour |
      | Camp scout          | 8 ans  | 10    | 30€       |
      | Stage de football   | 10 ans | 5     | 40€       |
      | Stage de musique    | 8 ans  | 5     | 35€       |
    Quand je calcule ma déduction fiscale
    Alors le montant déductible devrait être:
      | Enfant | Activité         | Montant déductible |
      | 8 ans  | Camp scout       | 164€ (10j × 16.40€)|
      | 10 ans | Stage football   | 82€ (5j × 16.40€)  |
      | 8 ans  | Stage musique    | 82€ (5j × 16.40€)  |
    Et le total déductible devrait être 328€
    Et la réduction d'impôt devrait être 147.60€ (45% de 328€)

  Scénario: Organisme non agréé - Pas de déduction
    Étant donné que j'ai un enfant de 7 ans
    Et que mon enfant est gardé par une baby-sitter non déclarée
    Et que je paie 2000€ de frais de garde en 2024
    Quand je vérifie mon éligibilité à la déduction
    Alors je ne devrais pas être éligible
    Et le motif devrait être "organisme de garde non agréé"
    Et je ne peux déduire aucun montant

  Scénario: Attestation manquante
    Étant donné que j'ai payé 3000€ de frais de garde en 2024
    Et que l'organisme de garde n'a pas fourni d'attestation fiscale
    Et que je n'ai pas le numéro d'agrément de l'organisme
    Quand je tente de déclarer mes frais
    Alors je ne peux pas bénéficier de la déduction
    Et le motif devrait être "attestation fiscale obligatoire manquante"

  Plan du Scénario: Calcul de déduction selon différents profils
    Étant donné que je suis <situation_familiale>
    Et que j'ai <nb_enfants> enfant(s)
    Et que les frais sont de <frais_jour>€ par jour
    Et que la garde a duré <jours> jours
    Quand je calcule ma déduction
    Alors le montant déductible devrait être <montant_deduit>€
    Et la réduction d'impôt devrait être <reduction>€

    Exemples:
      | situation_familiale | nb_enfants | frais_jour | jours | montant_deduit | reduction |
      | couple marié        | 1          | 10         | 200   | 2000          | 900       |
      | couple marié        | 2          | 15         | 150   | 2250          | 1012.50   |
      | parent isolé        | 1          | 8          | 220   | 1760          | 1320      |
      | parent isolé        | 3          | 12         | 180   | 2160          | 1620      |
      | couple cohabitant   | 1          | 20         | 100   | 1640          | 738       |

  Scénario: Documentation et justificatifs requis
    Étant donné que je veux déduire des frais de garde
    Quand je prépare ma déclaration fiscale
    Alors je dois fournir:
      | Document requis                                     |
      | Attestation fiscale de l'organisme agréé           |
      | Numéro national de l'enfant                        |
      | Numéro d'agrément de l'organisme                   |
      | Montant total des frais payés en 2024              |
      | Nombre de jours de garde effectifs                 |
    Et je dois conserver les preuves de paiement pendant 7 ans
    Et l'organisme doit être situé dans l'Espace Économique Européen

  Scénario: Comparaison régionale
    Étant donné que les règles fiscales sont fédérales
    Quand je compare les déductions entre régions
    Alors la déduction frais de garde s'applique identiquement en:
      | Région                        | Taux | Plafond journalier |
      | Région wallonne               | 45%  | 16.40€            |
      | Région flamande               | 45%  | 16.40€            |
      | Région Bruxelles-Capitale     | 45%  | 16.40€            |
    Et seules les majorations régionales peuvent différer