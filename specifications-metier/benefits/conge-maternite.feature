# language: fr
Fonctionnalité: Congé de Maternité
  En tant que femme enceinte ou jeune mère
  Je veux connaître mes droits au congé de maternité
  Afin de bénéficier d'un repos payé avant et après l'accouchement

  Contexte:
    Étant donné que le congé de maternité en Belgique comprend:
      | Période            | Durée standard | Durée grossesse multiple |
      | Repos prénatal     | 6 semaines     | 8 semaines              |
      | Repos postnatal    | 9 semaines     | 9-11 semaines           |
      | Total              | 15 semaines    | 17-19 semaines          |
    Et que les indemnités 2024 sont:
      | Période                  | Taux         | Plafond journalier |
      | 30 premiers jours        | 82% brut     | Pas de plafond     |
      | À partir du 31ème jour   | 75% brut     | ±120€/jour         |
    Et que le repos prénatal obligatoire est de 1 semaine avant la date prévue

  Scénario: Employée enceinte avec salaire moyen
    Étant donné que je suis enceinte de 7 mois
    Et que je suis employée depuis plus de 6 mois
    Et que mon salaire brut est de 3000€/mois
    Et que j'ai cotisé à la sécurité sociale
    Quand je demande mon congé de maternité
    Alors je devrais être éligible
    Et j'ai droit à 15 semaines de congé
    Et l'indemnité des 30 premiers jours sera 82% de mon salaire brut
    Et l'indemnité après 30 jours sera 75% avec plafond journalier

  Scénario: Travailleuse indépendante enceinte
    Étant donné que je suis enceinte de 8 mois
    Et que je suis travailleuse indépendante
    Et que j'ai cotisé depuis au moins 6 mois
    Et que mes revenus annuels sont de 40000€
    Quand je demande mon congé de maternité
    Alors je devrais être éligible
    Et j'ai droit à 12 semaines de congé
    Et l'indemnité sera forfaitaire selon mon statut
    Et je peux bénéficier de titres-services gratuits

  Scénario: Grossesse multiple (jumeaux)
    Étant donné que je suis enceinte de jumeaux
    Et que je suis employée
    Et que j'ai cotisé à la sécurité sociale
    Quand je demande mon congé de maternité
    Alors je devrais être éligible
    Et j'ai droit à 17 semaines minimum de congé
    Et le repos prénatal peut être porté à 8 semaines
    Et je peux demander jusqu'à 19 semaines au total

  Scénario: Report du repos prénatal au postnatal
    Étant donné que je suis enceinte de 8 mois
    Et que je suis employée
    Et que je souhaite travailler jusqu'à l'accouchement
    Et que mon médecin donne son accord
    Quand je demande le report du repos prénatal
    Alors je peux reporter jusqu'à 5 semaines au postnatal
    Mais je dois prendre obligatoirement 1 semaine avant l'accouchement
    Et mon repos postnatal sera prolongé d'autant

  Scénario: Accouchement prématuré
    Étant donné que j'ai accouché prématurément
    Et que je n'avais pris que 2 semaines de repos prénatal
    Et que j'avais droit à 6 semaines prénatales
    Quand je calcule mon congé postnatal
    Alors les 4 semaines non prises sont perdues
    Mais j'ai toujours droit à 9 semaines postnatales minimum
    Et en cas d'hospitalisation du bébé, le congé peut être prolongé

  Scénario: Hospitalisation prolongée du nouveau-né
    Étant donné que mon bébé est hospitalisé après la naissance
    Et que l'hospitalisation dure plus de 7 jours
    Et que je suis en congé de maternité
    Quand je demande la prolongation de mon congé
    Alors mon congé postnatal peut être prolongé
    Et la prolongation égale la durée d'hospitalisation au-delà de 7 jours
    Avec un maximum de 24 semaines de prolongation

  Scénario: Décès du nouveau-né
    Étant donné que mon enfant est décédé à la naissance
    Et que j'étais en congé de maternité
    Quand je consulte mes droits
    Alors j'ai droit au congé de maternité complet
    Et les indemnités sont maintenues
    Et je peux bénéficier d'un accompagnement psychologique

  Scénario: Chômeuse enceinte
    Étant donné que je suis au chômage
    Et que je suis enceinte de 8 mois
    Et que je perçois des allocations de chômage
    Quand je demande mon congé de maternité
    Alors je devrais être éligible
    Et mes allocations de chômage sont converties en indemnités de maternité
    Et le montant sera basé sur mes allocations de chômage
    Et je conserve mes droits au chômage après le congé

  Scénario: Employée à temps partiel
    Étant donné que je travaille à temps partiel (20h/semaine)
    Et que je suis enceinte
    Et que mon salaire brut est de 1500€/mois
    Quand je demande mon congé de maternité
    Alors je devrais être éligible
    Et j'ai droit à 15 semaines de congé
    Et l'indemnité sera calculée sur base de mon salaire temps partiel
    Et les premiers 30 jours seront à 82% de 1500€

  Scénario: Incapacité de travail avant le congé de maternité
    Étant donné que je suis en incapacité de travail pour raison médicale
    Et que je suis enceinte de 6 mois
    Et que mon incapacité est liée à la grossesse
    Quand arrive la période de congé de maternité
    Alors je passe automatiquement en congé de maternité
    Et les indemnités de maternité remplacent celles d'incapacité
    Et le taux d'indemnisation peut être plus avantageux

  Scénario: Travailleuse sans cotisations suffisantes
    Étant donné que je suis enceinte
    Et que j'ai commencé à travailler il y a 3 mois seulement
    Et que je n'ai pas suffisamment cotisé
    Quand je demande mon congé de maternité
    Alors je ne suis pas éligible aux indemnités complètes
    Mais j'ai droit au repos de maternité non payé
    Et je dois vérifier mes droits au CPAS

  Plan du Scénario: Calcul indemnités selon salaire et durée
    Étant donné que mon salaire brut mensuel est de <salaire>€
    Et que je suis au jour <jour> de mon congé de maternité
    Quand je calcule mon indemnité journalière
    Alors le taux applicable est <taux>%
    Et l'indemnité journalière est <indemnité>€

    Exemples:
      | salaire | jour | taux | indemnité |
      | 2500    | 15   | 82   | 68.33     |
      | 2500    | 45   | 75   | 62.50     |
      | 4500    | 15   | 82   | 123.00    |
      | 4500    | 45   | 75   | 120.00    |
      | 1800    | 15   | 82   | 49.20     |
      | 1800    | 45   | 75   | 45.00     |

  Scénario: Démarches administratives pour le congé
    Étant donné que je suis enceinte de 6 mois
    Et que je veux préparer mon congé de maternité
    Quand j'entame les démarches
    Alors je dois:
      | Étape                                  | Délai                              |
      | Informer mon employeur                | Au moins 7 semaines avant la date |
      | Fournir certificat médical            | Attestant la date prévue          |
      | Envoyer formulaire à la mutuelle      | Dès le début du congé             |
      | Déclarer la naissance                 | Dans les 30 jours                 |
      | Envoyer acte de naissance             | À la mutuelle et employeur        |
    Et la mutuelle verse les indemnités directement

  Scénario: Protection contre le licenciement
    Étant donné que je suis enceinte
    Et que j'ai informé mon employeur de ma grossesse
    Quand je suis en période de protection
    Alors mon employeur ne peut pas me licencier
    Et la protection commence à l'annonce de la grossesse
    Et elle se termine 1 mois après la fin du congé de maternité
    Sauf pour motif grave étranger à la grossesse

  Scénario: Allaitement après le congé de maternité
    Étant donné que mon congé de maternité se termine
    Et que j'allaite mon enfant
    Et que je reprends le travail
    Quand je demande des pauses d'allaitement
    Alors j'ai droit à des pauses rémunérées
    Et 30 minutes par tranche de 4 heures travaillées
    Et ce droit est valable jusqu'aux 9 mois de l'enfant
    Et je dois fournir un certificat médical mensuel