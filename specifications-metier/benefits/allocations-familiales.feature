# language: fr
Fonctionnalité: Allocations Familiales
  En tant que parent ou responsable d'enfant(s)
  Je veux savoir si j'ai droit aux allocations familiales
  Afin de recevoir une aide financière pour l'éducation de mes enfants

  Contexte:
    Étant donné que les montants des allocations familiales 2024 varient par région:
      | Région              | Age        | Né avant 2019 | Né après 2019 |
      | Bruxelles          | 0-11 ans   | 174.08€       | 186.51€       |
      | Bruxelles          | 12-17 ans  | 186.51€       | 198.94€       |
      | Bruxelles          | 18-24 ans  | 198.95€       | 211.38€       |
      | Wallonie           | 0-17 ans   | -             | 192.73€       |
      | Wallonie           | 18-24 ans  | -             | 205.16€       |
      | Flandre            | tous âges  | -             | 184.62€       |
    Et que les suppléments existent pour:
      | Type                    | Description                                      |
      | Famille monoparentale   | Supplément pour parent isolé                    |
      | Handicap                | Supplément si enfant reconnu handicapé < 21 ans |
      | Orphelin                | Supplément si enfant orphelin                   |
      | Social                  | Supplément selon revenus du ménage              |

  Scénario: Enfant de 5 ans à Bruxelles né après 2019
    Étant donné que mon enfant a 5 ans
    Et qu'il est né en 2020
    Et que nous habitons à Bruxelles
    Et que l'enfant est domicilié légalement en Belgique
    Quand je vérifie mon éligibilité aux allocations familiales
    Alors je devrais être éligible
    Et le montant mensuel devrait être 186.51€
    Et la caisse compétente devrait être "Famiris ou autre caisse bruxelloise"

  Scénario: Enfant de 15 ans à Bruxelles né avant 2019
    Étant donné que mon enfant a 15 ans
    Et qu'il est né en 2009
    Et que nous habitons à Bruxelles
    Et que l'enfant est domicilié légalement en Belgique
    Quand je vérifie mon éligibilité aux allocations familiales
    Alors je devrais être éligible
    Et le montant mensuel devrait être 186.51€
    Et la caisse compétente devrait être "Famiris ou autre caisse bruxelloise"

  Scénario: Enfant de 10 ans en Wallonie né après 2020
    Étant donné que mon enfant a 10 ans
    Et qu'il est né en 2020
    Et que nous habitons en Wallonie
    Et que l'enfant est domicilié légalement en Belgique
    Quand je vérifie mon éligibilité aux allocations familiales
    Alors je devrais être éligible
    Et le montant mensuel devrait être 192.73€
    Et la caisse compétente devrait être "AVIQ ou autre caisse wallonne"

  Scénario: Enfant de 19 ans étudiant en Wallonie
    Étant donné que mon enfant a 19 ans
    Et qu'il est né en 2020
    Et que nous habitons en Wallonie
    Et qu'il est inscrit dans l'enseignement supérieur
    Et que l'enfant est domicilié légalement en Belgique
    Quand je vérifie mon éligibilité aux allocations familiales
    Alors je devrais être éligible
    Et le montant mensuel devrait être 205.16€
    Et la condition devrait être "étudiant jusqu'à 25 ans"

  Scénario: Enfant de 8 ans en Flandre (Groeipakket)
    Étant donné que mon enfant a 8 ans
    Et qu'il est né en 2020
    Et que nous habitons en Flandre
    Et que l'enfant est domicilié légalement en Belgique
    Quand je vérifie mon éligibilité aux allocations familiales
    Alors je devrais être éligible
    Et le montant mensuel devrait être 184.62€
    Et le système devrait être "Groeipakket"

  Scénario: Parent isolé avec enfant de 6 ans à Bruxelles
    Étant donné que je suis parent isolé
    Et que mon enfant a 6 ans
    Et qu'il est né en 2020
    Et que nous habitons à Bruxelles
    Et que l'enfant est domicilié légalement en Belgique
    Quand je vérifie mon éligibilité aux allocations familiales
    Alors je devrais être éligible
    Et le montant de base devrait être 186.51€
    Et je devrais recevoir un supplément famille monoparentale
    Et le montant total devrait être supérieur à 186.51€

  Scénario: Enfant handicapé de 12 ans à Bruxelles
    Étant donné que mon enfant a 12 ans
    Et qu'il est né en 2020
    Et que nous habitons à Bruxelles
    Et qu'il a une reconnaissance de handicap à 66%
    Et que l'enfant est domicilié légalement en Belgique
    Quand je vérifie mon éligibilité aux allocations familiales
    Alors je devrais être éligible
    Et le montant de base devrait être 198.94€
    Et je devrais recevoir un supplément handicap
    Et le montant total devrait être significativement supérieur à 198.94€

  Scénario: Enfant de 26 ans non éligible
    Étant donné que mon enfant a 26 ans
    Et qu'il n'est plus étudiant
    Et que nous habitons à Bruxelles
    Quand je vérifie mon éligibilité aux allocations familiales
    Alors je ne devrais pas être éligible
    Et le motif devrait être "âge maximum dépassé (25 ans)"

  Scénario: Enfant de 22 ans non étudiant non éligible
    Étant donné que mon enfant a 22 ans
    Et qu'il n'est pas étudiant
    Et qu'il n'est pas inscrit comme demandeur d'emploi
    Et qu'il n'est pas en formation
    Et que nous habitons à Bruxelles
    Quand je vérifie mon éligibilité aux allocations familiales
    Alors je ne devrais pas être éligible
    Et le motif devrait être "pas de condition remplie pour 18-25 ans"

  Scénario: Enfant sans domicile légal en Belgique
    Étant donné que mon enfant a 10 ans
    Et qu'il n'a pas de domicile légal en Belgique
    Et qu'il n'a pas de titre de séjour valide
    Quand je vérifie mon éligibilité aux allocations familiales
    Alors je ne devrais pas être éligible
    Et le motif devrait être "pas de domicile légal ou titre de séjour valide"

  Scénario: Famille avec 3 enfants à Bruxelles
    Étant donné que j'ai 3 enfants
    Et qu'ils ont 5, 8 et 12 ans
    Et qu'ils sont tous nés après 2019
    Et que nous habitons à Bruxelles
    Et que tous les enfants sont domiciliés légalement en Belgique
    Quand je calcule mes allocations familiales totales
    Alors chaque enfant devrait recevoir son montant selon son âge
    Et le montant total mensuel devrait être environ 571.96€
    Et je pourrais bénéficier de suppléments selon mes revenus

  Plan du Scénario: Calcul allocations selon région et âge
    Étant donné que mon enfant a <age> ans
    Et qu'il est né en <année_naissance>
    Et que nous habitons en/à <région>
    Et que l'enfant est domicilié légalement en Belgique
    Quand je calcule les allocations familiales
    Alors le montant mensuel devrait être <montant>€

    Exemples:
      | région    | age | année_naissance | montant |
      | Bruxelles | 3   | 2021           | 186.51  |
      | Bruxelles | 14  | 2010           | 186.51  |
      | Bruxelles | 14  | 2021           | 198.94  |
      | Bruxelles | 20  | 2020           | 211.38  |
      | Wallonie  | 5   | 2020           | 192.73  |
      | Wallonie  | 19  | 2020           | 205.16  |
      | Flandre   | 7   | 2020           | 184.62  |
      | Flandre   | 16  | 2020           | 184.62  |

  Scénario: Supplément social selon revenus à Bruxelles
    Étant donné que j'ai 2 enfants de 6 et 9 ans
    Et que nous habitons à Bruxelles
    Et que nos revenus annuels bruts sont inférieurs à 31000€
    Et que les enfants sont domiciliés légalement en Belgique
    Quand je vérifie mon éligibilité aux suppléments sociaux
    Alors je devrais être éligible au supplément social
    Et le supplément devrait s'ajouter au montant de base
    Et le montant total devrait être significativement supérieur aux montants de base

  Scénario: Démarches administratives pour allocations familiales
    Étant donné que j'ai un nouvel enfant
    Et que je n'ai jamais reçu d'allocations familiales
    Quand je demande les allocations familiales
    Alors je dois m'inscrire auprès d'une caisse d'allocations familiales
    Et je dois fournir l'acte de naissance de l'enfant
    Et je dois fournir une preuve de domicile
    Et je dois fournir ma carte d'identité
    Et les allocations seront versées mensuellement
    Et le paiement intervient généralement le 8 du mois

  Scénario: Changement de région
    Étant donné que mon enfant a 10 ans
    Et que nous déménageons de Bruxelles vers la Wallonie
    Et que l'enfant change de domicile légal
    Quand nous changeons de région
    Alors nous devons informer notre caisse actuelle
    Et nous devons nous inscrire à une caisse wallonne
    Et les montants seront ajustés selon le barème wallon
    Et le montant passera de 186.51€ à 192.73€