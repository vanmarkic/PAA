# language: fr
Fonctionnalité: Calcul et Répartition des Charges
  En tant que syndic
  Je veux calculer les charges de copropriété
  Afin d'établir les appels de fonds

  Contexte:
    Étant donné que le budget annuel est de 50000€
    Et que la copropriété compte 1000 millièmes

  Scénario: Calcul charges générales au prorata des millièmes
    Étant donné qu'un copropriétaire possède 85 millièmes
    Et que les charges générales sont de 30000€
    Quand je calcule sa quote-part
    Alors il doit payer 2550€ annuellement
    Et soit 212,50€ par mois

  Scénario: Calcul charges spéciales ascenseur
    Étant donné que l'entretien ascenseur coûte 3000€/an
    Et que seuls les étages 1 à 5 participent
    Et qu'un copropriétaire du 3ème étage a 50 millièmes
    Quand je calcule sa participation
    Alors sa quote-part est calculée selon la grille:
      | Étage | Coefficient |
      | RDC | 0 |
      | 1 | 0.5 |
      | 2 | 1 |
      | 3 | 1.5 |
      | 4 | 2 |
      | 5 | 2.5 |

  Scénario: Charges impayées avec intérêts de retard
    Étant donné qu'un copropriétaire doit 1000€
    Et qu'il a 60 jours de retard
    Quand je calcule les pénalités
    Alors les intérêts sont de 8% annuel
    Et le montant total dû est 1013,15€
    Et des frais de rappel de 15€ s'ajoutent