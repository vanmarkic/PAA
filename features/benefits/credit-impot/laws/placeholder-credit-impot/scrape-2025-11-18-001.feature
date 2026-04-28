# language: fr
Fonctionnalité: Crédit d'impôt pour bas et moyens revenus
  En tant que contribuable à revenus modestes
  Je veux bénéficier du crédit d'impôt
  Afin de réduire ma charge fiscale ou recevoir un remboursement

  Contexte:
    Étant donné que les paramètres du crédit d'impôt 2024 sont:
      | Paramètre                                | Valeur         |
      | Crédit d'impôt maximum (isolé)           | 320€          |
      | Crédit d'impôt maximum (couple)          | 640€          |
      | Seuil revenus bas (isolé)                | 7070€         |
      | Seuil revenus moyens (isolé)             | 15820€        |
      | Seuil revenus bas (couple)               | 14140€        |
      | Seuil revenus moyens (couple)            | 21070€        |
      | Bonus emploi maximum                     | 760€          |
      | Crédit d'impôt enfants à charge          | 460€/enfant   |

  Scénario: Travailleur isolé bas revenus avec crédit remboursable
    Étant donné que je suis travailleur isolé
    Et que mes revenus professionnels nets sont de 12000€
    Et que j'ai payé 500€ de précompte professionnel
    Et que mon impôt calculé est de 200€
    Quand je calcule mon crédit d'impôt
    Alors je devrais avoir droit au crédit d'impôt de 320€
    Et mon impôt final devrait être 0€
    Et je devrais recevoir un remboursement de 620€ (500€ + 120€)

  Scénario: Couple avec enfants - Crédit d'impôt familial
    Étant donné que nous sommes un couple marié
    Et que nos revenus communs sont de 25000€
    Et que nous avons 3 enfants à charge
    Et que notre impôt calculé est de 2000€
    Quand nous calculons notre crédit d'impôt
    Alors nous devrions bénéficier de:
      | Type de crédit              | Montant  |
      | Crédit de base couple       | 640€     |
      | Crédit enfants (3×460€)     | 1380€    |
      | Total crédits               | 2020€    |
    Et notre impôt final devrait être 0€
    Et nous devrions recevoir un remboursement de 20€

  Scénario: Bonus à l'emploi - Bas salaires
    Étant donné que je suis salarié
    Et que mon salaire brut mensuel est de 1800€
    Et que je travaille à temps plein
    Et que j'ai droit au bonus emploi social
    Quand je calcule mon bonus emploi fiscal
    Alors le bonus emploi devrait être environ 63€ par mois
    Et le crédit d'impôt annuel devrait être 756€
    Et ce montant réduit directement mon précompte professionnel

  Scénario: Pensionné avec revenus modestes
    Étant donné que je suis pensionné isolé
    Et que ma pension annuelle est de 14000€
    Et que j'ai 67 ans
    Et que j'ai payé 800€ de précompte
    Quand je calcule mon crédit d'impôt
    Alors je devrais bénéficier du crédit d'impôt de 320€
    Et je peux aussi bénéficier de la quotité exemptée majorée
    Et mon impôt final devrait être réduit significativement

  Scénario: Indépendant avec faibles revenus
    Étant donné que je suis indépendant
    Et que mes revenus nets imposables sont de 10000€
    Et que j'ai payé 1200€ de versements anticipés
    Et que mon impôt calculé est de 900€
    Quand je calcule mon crédit d'impôt
    Alors je devrais avoir droit au crédit d'impôt de 320€
    Et mon impôt final devrait être 580€
    Et je devrais recevoir un remboursement de 620€

  Scénario: Parent isolé avec bonus garde d'enfants
    Étant donné que je suis parent isolé
    Et que mes revenus sont de 18000€
    Et que j'ai 2 enfants de moins de 12 ans
    Et que j'ai des frais de garde déductibles
    Quand je calcule mes avantages fiscaux
    Alors je bénéficie de:
      | Avantage                    | Montant  |
      | Crédit d'impôt de base      | 320€     |
      | Crédit enfants (2×460€)     | 920€     |
      | Majoration parent isolé     | 460€     |
    Et le total des crédits devrait être 1700€
    Et ces crédits sont remboursables si supérieurs à l'impôt

  Scénario: Calcul dégressif pour revenus moyens
    Étant donné que je suis isolé
    Et que mes revenus sont de 13000€
    Et que je suis dans la tranche dégressive du crédit
    Quand je calcule mon crédit d'impôt
    Alors le crédit est calculé proportionnellement:
      | Calcul                                          |
      | Revenus au-dessus du seuil: 13000€ - 7070€ = 5930€ |
      | Réduction: (5930€ / 8750€) × 320€ = 217€      |
      | Crédit final: 320€ - 217€ = 103€              |
    Et mon crédit d'impôt devrait être environ 103€

  Scénario: Cumul crédit d'impôt et autres réductions
    Étant donné que j'ai droit au crédit d'impôt de 320€
    Et que j'ai aussi des déductions pour:
      | Type de déduction           | Montant  |
      | Épargne-pension             | 990€     |
      | Dons                        | 250€     |
      | Frais de garde              | 1500€    |
    Quand je calcule mon impôt final
    Alors les déductions s'appliquent d'abord sur la base imposable
    Et puis le crédit d'impôt s'applique sur l'impôt calculé
    Et le crédit non utilisé est remboursable

  Plan du Scénario: Crédit d'impôt selon profil et revenus
    Étant donné que je suis <situation>
    Et que mes revenus sont de <revenus>€
    Et que j'ai <enfants> enfants à charge
    Quand je calcule mon crédit d'impôt
    Alors le crédit de base devrait être <credit_base>€
    Et le crédit enfants devrait être <credit_enfants>€
    Et le crédit total devrait être <credit_total>€

    Exemples:
      | situation      | revenus | enfants | credit_base | credit_enfants | credit_total |
      | isolé          | 6000    | 0       | 320         | 0             | 320          |
      | isolé          | 12000   | 1       | 320         | 460           | 780          |
      | couple         | 13000   | 0       | 640         | 0             | 640          |
      | couple         | 20000   | 2       | 640         | 920           | 1560         |
      | parent isolé   | 15000   | 2       | 320         | 920           | 1700         |

  Scénario: Crédit d'impôt pour activité professionnelle complémentaire
    Étant donné que j'ai un emploi principal
    Et que j'ai aussi une activité complémentaire (économie collaborative)
    Et que mes revenus de l'activité complémentaire sont de 3000€
    Quand je vérifie mon éligibilité au crédit d'impôt
    Alors je peux bénéficier d'une exonération jusqu'à 6540€
    Et les premiers 3000€ sont exonérés à 100%
    Et je conserve mon droit au crédit d'impôt normal

  Scénario: Transition chômage vers emploi
    Étant donné que j'étais au chômage pendant 6 mois en 2024
    Et que j'ai trouvé un emploi en juillet 2024
    Et que mes revenus totaux sont de 15000€
    Et dont 8000€ d'allocations de chômage
    Et 7000€ de salaires
    Quand je calcule mon crédit d'impôt
    Alors je bénéficie du crédit pour bas revenus
    Et le bonus emploi s'applique sur mes mois travaillés
    Et l'administration calcule automatiquement l'optimisation

  Scénario: Documentation et codes déclaration
    Étant donné que je veux demander le crédit d'impôt
    Quand je remplis ma déclaration fiscale
    Alors le crédit d'impôt est calculé automatiquement
    Et aucun code spécifique n'est nécessaire
    Mais je dois déclarer correctement:
      | Information requise                    | Cadre    |
      | Revenus professionnels                 | Cadre IV |
      | Situation familiale                    | Cadre II |
      | Enfants à charge                       | Cadre II |
      | Versements anticipés/précomptes        | Cadre XV |
    Et le remboursement est automatique si dû