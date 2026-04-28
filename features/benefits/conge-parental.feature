# language: fr
Fonctionnalité: Congé Parental
  En tant que parent travailleur
  Je veux connaître mes droits au congé parental
  Afin de m'occuper de mon enfant tout en préservant mon emploi

  Contexte:
    Étant donné que le congé parental en Belgique offre ces formules:
      | Formule                  | Durée totale | Description                      |
      | Temps plein              | 4 mois       | Suspension complète du travail    |
      | Mi-temps                 | 8 mois       | Réduction à 50% du temps          |
      | 1/5 temps                | 20 mois      | Réduction d'1 jour par semaine    |
      | 1/10 temps               | 40 mois      | Réduction d'1 demi-jour/semaine   |
    Et que les allocations ONEM 2024 sont:
      | Formule      | Montant brut mensuel |
      | Temps plein  | 879.15€             |
      | Mi-temps     | 439.58€             |
      | 1/5 temps    | 148.74€             |
      | 1/10 temps   | 74.37€              |
    Et que l'enfant doit avoir moins de 12 ans (21 ans si handicap)

  Scénario: Parent temps plein demandant congé complet de 4 mois
    Étant donné que je travaille à temps plein
    Et que j'ai un enfant de 3 ans
    Et que j'ai au moins 12 mois d'ancienneté
    Et que je n'ai jamais pris de congé parental
    Quand je demande un congé parental temps plein
    Alors je devrais être éligible
    Et j'ai droit à 4 mois de congé
    Et l'allocation mensuelle sera de 879.15€
    Et mon contrat de travail est suspendu mais protégé

  Scénario: Parent souhaitant réduire à mi-temps
    Étant donné que je travaille à temps plein
    Et que j'ai un enfant de 5 ans
    Et que j'ai au moins 12 mois d'ancienneté
    Quand je demande un congé parental mi-temps
    Alors je devrais être éligible
    Et j'ai droit à 8 mois de réduction
    Et l'allocation mensuelle sera de 439.58€
    Et je travaillerai 50% de mon horaire normal

  Scénario: Parent isolé avec majoration
    Étant donné que je suis parent isolé
    Et que j'ai la garde exclusive de mon enfant de 4 ans
    Et que je travaille à temps plein
    Et que j'ai au moins 12 mois d'ancienneté
    Quand je demande un congé parental temps plein
    Alors je devrais être éligible
    Et j'ai droit à une majoration de l'allocation
    Et l'allocation mensuelle sera supérieure à 879.15€
    Et la majoration compense partiellement la situation monoparentale

  Scénario: Congé 1/5 temps sur 20 mois
    Étant donné que je travaille à temps plein (5 jours/semaine)
    Et que j'ai un enfant de 7 ans
    Et que j'ai au moins 12 mois d'ancienneté
    Quand je demande un congé parental 1/5 temps
    Alors je devrais être éligible
    Et j'ai droit à 20 mois de réduction
    Et je travaillerai 4 jours par semaine
    Et l'allocation mensuelle sera de 148.74€

  Scénario: Parent d'enfant handicapé jusqu'à 21 ans
    Étant donné que j'ai un enfant handicapé de 15 ans
    Et que le handicap est reconnu à 66%
    Et que je travaille à temps plein
    Et que j'ai au moins 12 mois d'ancienneté
    Quand je demande un congé parental
    Alors je devrais être éligible jusqu'aux 21 ans de l'enfant
    Et j'ai droit aux mêmes formules de congé
    Et les allocations sont identiques
    Et je peux bénéficier d'aménagements supplémentaires

  Scénario: Fractionnement du congé parental
    Étant donné que je travaille à temps plein
    Et que j'ai un enfant de 2 ans
    Et que j'ai droit à 4 mois de congé temps plein
    Quand je demande un fractionnement
    Alors je peux prendre le congé en plusieurs périodes
    Et chaque période doit être d'au moins 1 mois
    Et avec l'accord de l'employeur pour le fractionnement
    Et le total ne peut excéder 4 mois

  Scénario: Congé parental pour adoption
    Étant donné que j'ai adopté un enfant de 5 ans
    Et que l'adoption est officielle depuis 2 mois
    Et que je travaille à temps plein
    Et que j'ai au moins 12 mois d'ancienneté
    Quand je demande un congé parental
    Alors je devrais être éligible
    Et les mêmes droits s'appliquent que pour un enfant biologique
    Et je dois prendre le congé avant les 12 ans de l'enfant

  Scénario: Congé parental corona (mesure temporaire expirée)
    Étant donné que j'ai un enfant de 8 ans
    Et que nous sommes en 2024
    Et que je souhaite un congé parental corona
    Quand je vérifie mon éligibilité
    Alors cette mesure n'est plus disponible
    Et le congé corona était limité à la période COVID
    Et je dois utiliser le congé parental classique

  Scénario: Employé à temps partiel demandant congé parental
    Étant donné que je travaille à temps partiel (24h/semaine)
    Et que j'ai un enfant de 4 ans
    Et que j'ai au moins 12 mois d'ancienneté
    Quand je demande un congé parental
    Alors mes options sont limitées
    Et je ne peux pas prendre de congé 1/5 temps
    Et je peux prendre un congé complet ou mi-temps adapté
    Et les allocations sont calculées proportionnellement

  Scénario: Protection contre le licenciement
    Étant donné que je suis en congé parental
    Et que j'ai notifié correctement mon employeur
    Quand je suis en période de protection
    Alors mon employeur ne peut pas me licencier
    Et la protection commence à la notification écrite
    Et elle se termine 3 mois après la fin du congé
    Et pour motif grave ou raisons économiques

  Scénario: Enfant de 13 ans - non éligible
    Étant donné que j'ai un enfant de 13 ans sans handicap
    Et que je n'ai jamais pris de congé parental
    Et que je travaille à temps plein
    Quand je demande un congé parental
    Alors je ne suis pas éligible
    Et le motif est "enfant de plus de 12 ans"
    Et je dois explorer d'autres formes de crédit-temps

  Scénario: Travailleur avec moins de 12 mois d'ancienneté
    Étant donné que je travaille depuis 8 mois chez mon employeur
    Et que j'ai un enfant de 2 ans
    Quand je demande un congé parental
    Alors je ne suis pas encore éligible
    Et le motif est "ancienneté insuffisante (12 mois requis)"
    Et je pourrai demander dans 4 mois

  Plan du Scénario: Calcul allocation selon formule et situation
    Étant donné que je demande un congé parental <formule>
    Et que je suis <situation_familiale>
    Quand je calcule mon allocation
    Alors l'allocation mensuelle brute sera <montant>€

    Exemples:
      | formule     | situation_familiale | montant |
      | temps plein | parent couple       | 879.15  |
      | temps plein | parent isolé        | 1000.00 |
      | mi-temps    | parent couple       | 439.58  |
      | mi-temps    | parent isolé        | 500.00  |
      | 1/5 temps   | parent couple       | 148.74  |
      | 1/10 temps  | parent couple       | 74.37   |

  Scénario: Procédure de demande de congé parental
    Étant donné que je veux prendre un congé parental
    Et que je remplis les conditions
    Quand j'entame la procédure
    Alors je dois:
      | Étape                                    | Délai                           |
      | Avertir l'employeur par écrit           | 2 mois avant (3 mois si PME)    |
      | Préciser la formule choisie             | Dans la demande initiale        |
      | Fournir preuve de filiation             | Acte de naissance ou adoption   |
      | Remplir formulaire ONEM C61              | Au début du congé               |
      | Faire compléter partie par employeur    | Avant envoi à l'ONEM           |
    Et l'ONEM verse les allocations mensuellement

  Scénario: Cumul avec d'autres congés
    Étant donné que je suis en congé de maternité
    Et que mon congé se termine dans 2 semaines
    Et que je souhaite enchaîner avec un congé parental
    Quand je vérifie les possibilités de cumul
    Alors je peux prendre le congé parental après la maternité
    Et les deux congés sont distincts
    Et je dois faire une demande séparée pour le congé parental
    Et informer mon employeur dans les délais

  Scénario: Couple prenant congé parental simultanément
    Étant donné que nous sommes deux parents
    Et que nous avons un enfant de 3 ans
    Et que nous travaillons tous les deux à temps plein
    Quand nous demandons un congé parental simultané
    Alors nous pouvons tous deux prendre un congé
    Et chaque parent a ses propres droits (4 mois temps plein)
    Et nous pouvons le prendre en même temps
    Et chacun reçoit son allocation ONEM séparément