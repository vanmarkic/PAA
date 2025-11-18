# language: fr
Fonctionnalité: Allocations de Chômage
  En tant que travailleur ayant perdu mon emploi
  Je veux savoir si j'ai droit aux allocations de chômage
  Afin de maintenir un revenu minimum pendant ma recherche d'emploi

  Contexte:
    Étant donné que les conditions de chômage 2024 sont:
      | Type de condition                     | Valeur                                              |
      | Âge minimum                          | 18 ans                                              |
      | Jours travaillés (moins de 36 ans)   | 312 jours sur 18 mois                             |
      | Jours travaillés (36 ans et plus)    | 468 jours sur 24 mois                             |
      | Durée maximale allocation complète   | 24 mois (12 mois + 12 mois selon historique)      |
      | Allocation temporaire                | 60% du salaire (65% si force majeure)             |
      | Plafond journalier                   | 65.48€                                             |
      | Inscription obligatoire              | ONEM/VDAB/Forem/Actiris                           |
      | Période de stage                     | Variable selon l'âge                               |

  Scénario: Licenciement économique avec conditions remplies
    Étant donné que je suis un travailleur licencié économiquement
    Et que j'ai 32 ans
    Et que j'ai travaillé 350 jours sur les 18 derniers mois
    Et que mon salaire brut mensuel était de 2800€
    Et que je suis inscrit auprès de l'ONEM
    Et que je suis disponible pour le marché de l'emploi
    Quand je vérifie mon éligibilité aux allocations de chômage
    Alors je devrais être éligible
    Et le montant de l'allocation devrait être environ 1680€ par mois
    Et la catégorie devrait être "travailleur avec charge de famille"
    Et la durée maximale devrait être "24 mois maximum"

  Scénario: Fin de contrat à durée déterminée
    Étant donné que mon contrat à durée déterminée est terminé
    Et que j'ai 25 ans
    Et que j'ai travaillé 320 jours sur les 18 derniers mois
    Et que mon salaire brut mensuel était de 2200€
    Et que je suis inscrit auprès du Forem
    Et que je suis isolé
    Quand je vérifie mon éligibilité aux allocations de chômage
    Alors je devrais être éligible
    Et le montant de l'allocation devrait être environ 1320€ par mois
    Et la catégorie devrait être "isolé"
    Et je devrais recevoir "60% du salaire plafonné"

  Scénario: Travailleur de plus de 36 ans avec historique insuffisant
    Étant donné que j'ai été licencié
    Et que j'ai 42 ans
    Et que j'ai travaillé seulement 400 jours sur les 24 derniers mois
    Et que mon salaire brut mensuel était de 3000€
    Quand je vérifie mon éligibilité aux allocations de chômage
    Alors je ne devrais pas être éligible
    Et le motif devrait être "jours travaillés insuffisants (468 jours requis sur 24 mois)"

  Scénario: Démission volontaire sans motif valable
    Étant donné que j'ai démissionné volontairement
    Et que j'ai 28 ans
    Et que je n'ai pas de motif valable reconnu
    Et que j'ai travaillé 400 jours sur les 18 derniers mois
    Quand je vérifie mon éligibilité aux allocations de chômage
    Alors je ne devrais pas être éligible immédiatement
    Et le motif devrait être "démission volontaire - période de sanction applicable"
    Et la durée de sanction devrait être "4 à 52 semaines selon les circonstances"

  Scénario: Travailleur trop jeune sans stage suffisant
    Étant donné que j'ai terminé mes études
    Et que j'ai 17 ans
    Et que j'ai travaillé 100 jours
    Quand je vérifie mon éligibilité aux allocations de chômage
    Alors je ne devrais pas être éligible
    Et le motif devrait être "âge minimum non atteint (18 ans requis)"

  Scénario: Chômage temporaire pour force majeure
    Étant donné que je suis en chômage temporaire pour force majeure
    Et que j'ai 35 ans
    Et que mon salaire brut mensuel est de 2500€
    Et que je suis employé depuis 2 ans
    Quand je vérifie mon éligibilité aux allocations de chômage temporaire
    Alors je devrais être éligible immédiatement
    Et le montant de l'allocation devrait être "65% du salaire plafonné"
    Et je n'ai pas besoin de prouver les conditions d'admissibilité

  Scénario: Travailleur à temps partiel involontaire
    Étant donné que j'ai perdu mon emploi à temps partiel
    Et que j'ai 30 ans
    Et que j'ai travaillé 312 jours sur 18 mois à temps partiel
    Et que je cherche un emploi à temps plein
    Et que mon salaire mensuel était de 1200€
    Quand je vérifie mon éligibilité aux allocations de chômage
    Alors je devrais être éligible
    Et le calcul devrait tenir compte du régime temps partiel
    Et je pourrais avoir droit à l'AGR si je trouve un nouvel emploi temps partiel

  Scénario: Cumul avec formation professionnelle
    Étant donné que je suis au chômage complet
    Et que je perçois des allocations de chômage
    Et que je souhaite suivre une formation professionnelle
    Et que la formation est agréée par le Forem
    Quand je vérifie les règles de cumul
    Alors je peux maintenir mes allocations pendant la formation
    Et je dois déclarer la formation à l'ONEM
    Et je peux recevoir une indemnité de formation supplémentaire
    Et le montant devrait être "1€ par heure de formation"

  Plan du Scénario: Calcul allocations selon situation familiale
    Étant donné que j'ai été licencié
    Et que j'ai <age> ans
    Et que j'ai travaillé <jours> jours
    Et que ma situation familiale est <situation>
    Et que mon salaire mensuel était de <salaire>€
    Quand je calcule mes allocations de chômage
    Alors le pourcentage applicable devrait être <pourcentage>%
    Et le montant mensuel devrait être environ <montant>€

    Exemples:
      | age | jours | situation        | salaire | pourcentage | montant |
      | 25  | 320   | avec charge      | 2800    | 75          | 1440    |
      | 30  | 350   | isolé            | 2500    | 60          | 1440    |
      | 28  | 400   | cohabitant       | 2200    | 55          | 1210    |
      | 40  | 500   | avec charge      | 3500    | 75          | 1440    |
      | 35  | 480   | isolé            | 1800    | 60          | 1080    |

  Scénario: Obligations liées aux allocations de chômage
    Étant donné que je suis bénéficiaire d'allocations de chômage
    Quand j'accepte les allocations
    Alors je dois être inscrit comme demandeur d'emploi
    Et je dois être disponible pour le marché de l'emploi
    Et je dois rechercher activement un emploi
    Et je dois accepter tout emploi convenable proposé
    Et je dois me présenter aux convocations de l'ONEM
    Et je dois déclarer toute activité ou revenu
    Et je dois résider effectivement en Belgique
    Et je dois coller les timbres de contrôle (carte C3)

  Scénario: Réforme 2024 - Limitation dans le temps
    Étant donné que je suis au chômage depuis janvier 2024
    Et que la nouvelle réforme est en application
    Quand je vérifie la durée de mes droits
    Alors mes allocations complètes sont limitées à 24 mois maximum
    Et après 12 mois, je passe en période 2 (montant dégressif)
    Et après 24 mois, je passe en allocation forfaitaire (période 3)
    Et le montant forfaitaire dépend uniquement de ma situation familiale

  Scénario: Allocations d'insertion pour jeunes
    Étant donné que j'ai terminé mes études
    Et que j'ai 22 ans
    Et que j'ai effectué mon stage d'insertion de 310 jours
    Et que je n'ai pas trouvé d'emploi
    Quand je demande les allocations d'insertion
    Alors je devrais être éligible
    Et la durée maximale est limitée à "1 an depuis la réforme 2024"
    Et le montant dépend de ma situation familiale
    Et je dois avoir obtenu un diplôme ou suivi une formation