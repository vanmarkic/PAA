# language: fr
Fonctionnalité: Allocation pour l'Aide aux Personnes Âgées (APA)
  En tant que personne âgée avec perte d'autonomie
  Je veux savoir si j'ai droit à l'APA
  Afin de couvrir les coûts supplémentaires liés à ma perte d'autonomie

  Contexte:
    Étant donné que les montants APA 2024 sont:
      | Catégorie | Points autonomie | Montant annuel | Montant mensuel |
      | 1         | 7-8             | 1269.81€       | 105.82€         |
      | 2         | 9-11            | 4847.15€       | 403.93€         |
      | 3         | 12-14           | 5893.36€       | 491.11€         |
      | 4         | 15-16           | 6939.25€       | 578.27€         |
      | 5         | 17-18           | 7985.15€       | 665.43€         |
    Et que les plafonds de revenus depuis juin 2024 sont:
      | Situation            | Plafond annuel  |
      | Personne isolée      | 20725.25€       |
      | Ménage              | 25468.38€       |
    Et que l'âge minimum est 65 ans

  Scénario: Personne âgée isolée avec perte d'autonomie légère
    Étant donné que je suis une personne isolée
    Et que j'ai 68 ans
    Et que je suis Belge
    Et que je réside en Région de Bruxelles-Capitale
    Et que mon score d'autonomie est de 8 points
    Et que mes revenus annuels sont de 15000€
    Quand je vérifie mon éligibilité à l'APA
    Alors je devrais être éligible
    Et ma catégorie APA devrait être 1
    Et le montant annuel devrait être 1269.81€
    Et le montant mensuel devrait être 105.82€

  Scénario: Couple avec perte d'autonomie modérée
    Étant donné que je vis en couple
    Et que j'ai 72 ans
    Et que mon conjoint a 70 ans
    Et que mon score d'autonomie est de 11 points
    Et que nos revenus annuels combinés sont de 22000€
    Et que nous résidons en Wallonie
    Quand je vérifie mon éligibilité à l'APA
    Alors je devrais être éligible
    Et ma catégorie APA devrait être 2
    Et le montant annuel devrait être 4847.15€
    Et le montant mensuel devrait être 403.93€

  Scénario: Personne avec handicap sévère en maison de repos
    Étant donné que je suis en maison de repos
    Et que j'ai 82 ans
    Et que mon score d'autonomie est de 16 points
    Et que mes revenus annuels sont de 18000€
    Et que je suis en Région de Bruxelles-Capitale
    Quand je vérifie mon éligibilité à l'APA
    Alors je devrais être éligible
    Et ma catégorie APA devrait être 4
    Et le montant annuel devrait être 6939.25€
    Et le montant mensuel devrait être 578.27€
    Et l'APA est versée directement à la maison de repos

  Scénario: Personne trop jeune pour l'APA
    Étant donné que je suis une personne isolée
    Et que j'ai 60 ans
    Et que j'ai une perte d'autonomie de 10 points
    Et que mes revenus sont de 12000€ par an
    Quand je vérifie mon éligibilité à l'APA
    Alors je ne devrais pas être éligible
    Et le motif devrait être "âge minimum non atteint (65 ans requis)"
    Mais je peux être orienté vers "l'allocation de remplacement de revenus (ARR)"

  Scénario: Score d'autonomie insuffisant
    Étant donné que je suis une personne isolée
    Et que j'ai 70 ans
    Et que mon score d'autonomie est de 5 points
    Et que mes revenus sont de 15000€ par an
    Quand je vérifie mon éligibilité à l'APA
    Alors je ne devrais pas être éligible
    Et le motif devrait être "score d'autonomie insuffisant (minimum 7 points requis)"

  Scénario: Revenus trop élevés pour personne isolée
    Étant donné que je suis une personne isolée
    Et que j'ai 75 ans
    Et que mon score d'autonomie est de 12 points
    Et que mes revenus annuels sont de 25000€
    Quand je vérifie mon éligibilité à l'APA
    Alors je ne devrais pas être éligible
    Et le motif devrait être "revenus supérieurs au plafond (20725.25€ pour personne isolée)"

  Scénario: Évaluation de la perte d'autonomie
    Étant donné que je demande l'APA
    Et que j'ai 70 ans
    Quand un médecin évalue ma perte d'autonomie
    Alors il évalue les domaines suivants:
      | Domaine                    | Points max | Description                          |
      | Se déplacer                | 3          | À l'intérieur et à l'extérieur      |
      | Préparer et prendre repas   | 3          | Capacité à cuisiner et manger       |
      | Hygiène personnelle         | 3          | Se laver, s'habiller                |
      | Entretien ménager           | 3          | Nettoyer, ranger                    |
      | Dangers et comportement     | 3          | Conscience des risques              |
      | Communication               | 3          | Contacts sociaux                     |
    Et le total détermine ma catégorie APA
    Et l'évaluation est valable 5 ans maximum

  Scénario: Cumul APA avec autres allocations
    Étant donné que je suis bénéficiaire de l'APA catégorie 3
    Et que je reçois 491.11€ par mois
    Et que je bénéficie aussi de la GRAPA
    Quand je vérifie les règles de cumul
    Alors l'APA est cumulable avec:
      | Allocation               | Cumul      | Remarque                          |
      | GRAPA                   | Oui        | Sans réduction                   |
      | Pension de retraite     | Oui        | Sans réduction                   |
      | Allocation handicap     | Non        | Choix entre APA ou ARR/AI        |
      | Aide sociale CPAS       | Oui        | APA non comptée dans ressources  |
      | Allocation aidant proche| Oui        | Pour la personne aidante         |

  Plan du Scénario: Calcul APA selon catégorie et revenus
    Étant donné que je suis <situation>
    Et que j'ai 70 ans
    Et que mon score d'autonomie est de <points> points
    Et que mes revenus annuels sont de <revenus>€
    Quand je calcule mon APA
    Alors ma catégorie est <catégorie>
    Et mon montant annuel est <montant_annuel>€
    Et mon montant mensuel est <montant_mensuel>€

    Exemples:
      | situation       | points | revenus | catégorie | montant_annuel | montant_mensuel |
      | personne isolée | 7      | 10000   | 1         | 1269.81        | 105.82          |
      | personne isolée | 10     | 15000   | 2         | 4847.15        | 403.93          |
      | personne isolée | 13     | 18000   | 3         | 5893.36        | 491.11          |
      | personne isolée | 16     | 20000   | 4         | 6939.25        | 578.27          |
      | en couple       | 11     | 24000   | 2         | 4847.15        | 403.93          |
      | en couple       | 15     | 25000   | 4         | 6939.25        | 578.27          |

  Scénario: Procédure de demande APA - Région Bruxelles-Capitale
    Étant donné que je réside à Bruxelles
    Et que je veux demander l'APA
    Quand je commence la procédure
    Alors je dois suivre ces étapes:
      | Étape                      | Canal              | Délai            |
      | Introduction demande       | MyIriscare en ligne| Immédiat         |
      | Ou formulaire papier       | Via mutuelle/CPAS  | 5 jours ouvrables|
      | Évaluation médicale        | Médecin Iriscare   | Dans les 3 mois  |
      | Visite à domicile          | Si nécessaire      | Sur rendez-vous  |
      | Décision                   | Par courrier       | 6 mois maximum   |
      | Paiement                   | Virement mensuel   | Mois suivant décision|
    Et je peux obtenir de l'aide du CPAS pour la demande

  Scénario: Procédure de demande APA - Région Wallonne
    Étant donné que je réside en Wallonie
    Et que je veux demander l'APA
    Quand je commence la procédure
    Alors je dois suivre ces étapes:
      | Étape                      | Canal              | Délai            |
      | Introduction demande       | Wal-Protect        | En ligne         |
      | Ou via mutuelle            | Formulaire papier  | Transmission AVIQ|
      | Évaluation médicale        | Médecin AVIQ       | Dans les 4 mois  |
      | Décision                   | Notification AVIQ  | 6 mois maximum   |
      | Recours possible          | Tribunal du travail| 3 mois après décision|

  Scénario: Révision de l'APA suite à changement de situation
    Étant donné que je bénéficie de l'APA catégorie 2
    Et que ma perte d'autonomie s'aggrave
    Et que mon score passe de 10 à 14 points
    Quand je demande une révision
    Alors une nouvelle évaluation médicale est programmée
    Et si confirmée, ma catégorie passe à 3
    Et mon allocation mensuelle passe de 403.93€ à 491.11€
    Et le changement prend effet le mois suivant la décision

  Scénario: APA et services d'aide à domicile
    Étant donné que je bénéficie de l'APA catégorie 3
    Et que je vis à domicile
    Quand j'utilise mon APA
    Alors je peux financer:
      | Service                    | Utilisation APA    | Complément possible    |
      | Aide familiale            | Titres-services    | CPAS si insuffisant    |
      | Soins infirmiers          | Via mutuelle       | APA pour surplus       |
      | Adaptation logement       | Frais directs      | Primes régionales      |
      | Télévigilance            | Abonnement mensuel | Réduction via commune  |
      | Transport adapté          | Services agréés    | Intervention mutuelle  |
      | Matériel médical          | Location/achat     | INAMI si prescrit      |

  Scénario: Impact sur les impôts
    Étant donné que je bénéficie de l'APA
    Et que je reçois 5893.36€ par an (catégorie 3)
    Quand je fais ma déclaration fiscale
    Alors l'APA est exonérée d'impôts
    Et elle n'est pas comptée dans mes revenus imposables
    Et je bénéficie d'une réduction d'impôt pour personne handicapée
    Et le montant de la réduction dépend de mon degré de handicap

  Scénario: APA en maison de repos et de soins
    Étant donné que j'entre en maison de repos
    Et que je bénéficie de l'APA catégorie 4
    Et que le coût mensuel est de 2000€
    Quand je calcule ma contribution
    Alors mon APA de 578.27€ est versée à l'établissement
    Et ma pension contribue également
    Et le CPAS peut intervenir pour le solde si nécessaire
    Et je garde un argent de poche minimum de 111.24€/mois