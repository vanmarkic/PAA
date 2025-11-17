# language: fr
Fonctionnalité: Appel de Fonds Extraordinaire
  En tant que syndic
  Je veux lancer un appel de fonds extraordinaire
  Afin de financer des travaux exceptionnels

  Contexte:
    Étant donné que des travaux extraordinaires sont votés

  Scénario: Appel pour travaux de toiture
    Étant donné que les travaux coûtent 100000€
    Et que l'AG les a votés aux 2/3
    Quand je lance l'appel de fonds
    Alors la répartition est:
      | Copropriétaire | Millièmes | Montant |
      | Appartement A | 150 | 15000€ |
      | Appartement B | 100 | 10000€ |
      | Commerce C | 200 | 20000€ |
    Et l'échéancier peut être:
      | Échéance | Pourcentage |
      | Signature devis | 30% |
      | Début travaux | 30% |
      | Mi-travaux | 20% |
      | Réception | 20% |

  Scénario: Copropriétaire demandant étalement
    Étant donné qu'un copropriétaire doit 15000€
    Et qu'il demande un étalement
    Quand le syndic examine la demande
    Alors il peut accorder:
      | Durée | Conditions |
      | 6 mois | Sans intérêts si accord AG |
      | 12 mois | Avec intérêts 4% |
      | 24 mois | Garantie bancaire requise |

  Scénario: Utilisation fonds de réserve partielle
    Étant donné que le fonds de réserve contient 30000€
    Et que les travaux coûtent 100000€
    Quand l'AG décide l'utilisation du fonds
    Alors l'appel extraordinaire est de 70000€
    Et le fonds doit être reconstitué sur 5 ans
    Soit 6000€/an supplémentaires