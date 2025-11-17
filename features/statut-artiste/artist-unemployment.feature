# language: fr
Fonctionnalité: Chômage pour Artistes
  En tant qu'artiste au chômage
  Je veux comprendre mes droits spécifiques
  Afin de maintenir mon activité artistique

  Contexte:
    Étant donné que le régime de chômage artiste prévoit:
      | Paramètre                      | Valeur        |
      | Jours minimum pour ouverture   | 156           |
      | Période de référence           | 21 mois       |
      | Allocation journalière max     | 65.96€        |
      | Cachet exonéré par jour        | 130€          |
      | Période de protection          | 12 mois       |

  Scénario: Ouverture de droits au chômage artistique
    Étant donné que je suis comédien
    Et que j'ai travaillé 165 jours sur les 21 derniers mois
    Et que j'ai cotisé à la sécurité sociale
    Et que mon dernier contrat s'est terminé
    Quand je demande l'ouverture de mes droits au chômage
    Alors je devrais avoir droit au chômage artistique
    Et ma période de protection devrait être de 12 mois
    Et je peux maintenir mon activité artistique accessoire

  Scénario: Maintien des droits avec activité artistique
    Étant donné que je perçois le chômage artistique
    Et que j'ai un cachet de 400€ pour un spectacle
    Et que ce cachet est sur 3 jours
    Quand je déclare cette activité
    Alors une partie du cachet est exonérée (390€)
    Et mes allocations sont maintenues partiellement
    Et mes droits sont prolongés

  Scénario: Règle du cachet
    Étant donné que je suis musicien au chômage
    Et que j'ai un concert rémunéré 500€
    Et que la prestation dure 1 jour
    Quand j'applique la règle du cachet
    Alors 130€ sont exonérés
    Et 370€ sont déduits de mes allocations
    Et je conserve le statut d'artiste

  Scénario: Formation artistique pendant le chômage
    Étant donné que je suis au chômage artistique
    Et que je veux suivre une formation de mise en scène
    Et que la formation dure 3 mois
    Quand je demande l'autorisation
    Alors la formation est compatible avec le chômage
    Et mes allocations sont maintenues
    Et je dois fournir une attestation de présence

  Plan du Scénario: Calcul des allocations selon situation
    Étant donné que je suis <situation>
    Et que mes revenus artistiques mensuels sont de <revenus>€
    Quand je calcule mes allocations
    Alors mon allocation journalière est de <allocation>€
    Et l'exonération appliquée est de <exonération>€

    Exemples:
      | situation              | revenus | allocation | exonération |
      | isolé sans revenus     | 0       | 65.96      | 0           |
      | cohabitant sans revenus| 0       | 43.78      | 0           |
      | isolé avec cachets     | 400     | 45.00      | 130         |
      | chef de famille        | 200     | 55.00      | 130         |

  Scénario: Fin de période de protection
    Étant donné que ma période de protection de 12 mois se termine
    Et que j'ai presté 80 jours sur cette période
    Quand j'évalue mon renouvellement
    Alors je dois prouver 156 jours sur 21 mois
    Ou demander une prolongation exceptionnelle
    Et justifier de démarches actives