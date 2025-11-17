# language: fr
Fonctionnalité: Gestion des Litiges pour Impayés
  En tant que syndic
  Je veux gérer les impayés de charges
  Afin de recouvrer les créances de la copropriété

  Contexte:
    Étant donné qu'un copropriétaire a des charges impayées

  Scénario: Procédure de recouvrement amiable
    Étant donné qu'un copropriétaire doit 1500€
    Et qu'il a 45 jours de retard
    Quand je lance la procédure de recouvrement
    Alors les étapes sont:
      | Étape | Délai | Frais |
      | 1er rappel simple | J+30 | 7,50€ |
      | 2ème rappel recommandé | J+45 | 15€ |
      | Mise en demeure | J+60 | 30€ |
      | Saisie conservatoire | J+90 | Variable |

  Scénario: Calcul des intérêts de retard
    Étant donné qu'un montant de 2000€ est impayé
    Et que le retard est de 120 jours
    Quand je calcule les pénalités
    Alors les intérêts sont de 8% annuel
    Soit 53,15€ d'intérêts
    Plus 52,50€ de frais de rappel
    Pour un total de 2105,65€

  Scénario: Saisie conservatoire sur lot
    Étant donné que les impayés dépassent 6 mois
    Et que le montant dépasse 2000€
    Quand l'AG autorise la saisie à la majorité absolue
    Alors le syndic peut:
      | Action | Condition |
      | Saisir les loyers | Si le lot est loué |
      | Bloquer la vente | Inscription hypothèque |
      | Saisir le bien | Décision justice |