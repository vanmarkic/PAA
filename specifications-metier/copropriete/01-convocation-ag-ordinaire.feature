# language: fr
Fonctionnalité: Convocation Assemblée Générale Ordinaire
  En tant que syndic
  Je veux convoquer une assemblée générale ordinaire
  Afin de respecter les obligations légales annuelles

  Contexte:
    Étant donné que la copropriété "Résidence Bellevue" existe
    Et qu'elle compte 30 lots principaux
    Et que le syndic est désigné

  Scénario: Convocation AG ordinaire dans les délais légaux
    Étant donné que la dernière AG date de plus de 11 mois
    Et que le syndic prépare la convocation 20 jours avant
    Quand il envoie la convocation avec l'ordre du jour
    Alors la convocation est valide
    Et le délai légal de 15 jours est respecté
    Et tous les copropriétaires sont notifiés

  Scénario: Convocation AG avec documents obligatoires
    Étant donné que l'AG ordinaire est prévue
    Quand le syndic prépare la convocation
    Alors les documents suivants sont joints:
      | Document | Obligatoire |
      | Comptes annuels | Oui |
      | Budget prévisionnel | Oui |
      | Rapport du syndic | Oui |
      | Rapport du conseil | Non |
      | Devis travaux | Non |

  Scénario: Convocation tardive invalide
    Étant donné que l'AG est prévue dans 10 jours
    Quand le syndic envoie la convocation
    Alors la convocation est invalide
    Et le motif est "délai minimum de 15 jours non respecté"