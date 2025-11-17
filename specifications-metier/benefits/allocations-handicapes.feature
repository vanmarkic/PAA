# language: fr
Fonctionnalité: Allocations pour Personnes Handicapées
  En tant que personne en situation de handicap
  Je veux connaître mes droits aux allocations handicap (ARR et AI)
  Afin d'obtenir une compensation financière pour ma perte d'autonomie

  Contexte:
    Étant donné que les montants ARR 2024 (Allocation de Remplacement de Revenus) sont:
      | Catégorie                | Montant annuel | Montant mensuel |
      | Cat A (isolé)             | 10567.43€      | 880.62€         |
      | Cat B (cohabitant)        | 15851.18€      | 1320.93€        |
      | Cat C (famille à charge)  | 21421.87€      | 1785.16€        |
    Et que les montants AI 2024 (Allocation d'Intégration) sont:
      | Catégorie | Points autonomie | Montant annuel | Montant mensuel |
      | Cat I     | 7-8 points       | 1423.66€       | 118.64€         |
      | Cat II    | 9-11 points      | 5128.21€       | 427.35€         |
      | Cat III   | 12-14 points     | 8155.74€       | 679.65€         |
      | Cat IV    | 15-16 points     | 11852.46€      | 987.71€         |
      | Cat V     | 17-18 points     | 13437.21€      | 1119.77€        |

  Scénario: Personne isolée avec handicap catégorie III éligible
    Étant donné que je suis une personne isolée
    Et que j'ai 35 ans
    Et que je suis Belge ou résident légal
    Et que j'ai une évaluation médicale DG Handicap
    Et que mon score d'autonomie est de 13 points
    Et que mon revenu mensuel est de 400€
    Quand je vérifie mon éligibilité aux allocations handicap
    Alors je devrais être éligible à l'AI catégorie III
    Et le montant de l'AI devrait être 679.65€ par mois
    Et je peux aussi prétendre à l'ARR catégorie A
    Et le montant combiné devrait prendre en compte mes revenus

  Scénario: Parent avec enfant handicapé demandant AI catégorie IV
    Étant donné que je suis parent d'un enfant handicapé
    Et que mon enfant a 12 ans
    Et que nous sommes résidents en Belgique
    Et que l'évaluation médicale attribue 15 points d'autonomie
    Et que nous avons une reconnaissance de handicap à 80%
    Quand je demande l'allocation d'intégration
    Alors l'enfant devrait être éligible à l'AI catégorie IV
    Et le montant de l'AI devrait être 987.71€ par mois
    Et la famille peut demander des allocations familiales majorées
    Et une carte de stationnement pour personne handicapée

  Scénario: Travailleur avec handicap cumulant salaire et ARR
    Étant donné que je suis travailleur à temps partiel
    Et que j'ai une reconnaissance de handicap
    Et que j'ai 40 ans
    Et que je suis en couple avec 1 enfant
    Et que mon salaire mensuel est de 800€
    Et que j'ai droit à l'ARR catégorie C
    Quand je calcule mes allocations
    Alors l'ARR de base serait 1785.16€ par mois
    Et après déduction de mes revenus professionnels
    Et avec application de l'exonération partielle
    Et mon ARR net devrait être calculé selon la formule officielle

  Scénario: Personne âgée avec handicap tardif
    Étant donné que je suis une personne de 67 ans
    Et que j'ai développé un handicap après 65 ans
    Et que mon score d'autonomie est de 10 points
    Et que je suis isolé
    Quand je vérifie mon éligibilité
    Alors je ne suis pas éligible à l'ARR (limite d'âge 65 ans)
    Mais je suis éligible à l'AI catégorie II
    Et le montant de l'AI devrait être 427.35€ par mois
    Et je peux cumuler avec ma pension

  Scénario: Jeune adulte handicapé sans revenus
    Étant donné que je suis un jeune adulte de 21 ans
    Et que j'ai un handicap de naissance
    Et que mon score d'autonomie est de 18 points
    Et que je vis chez mes parents
    Et que je n'ai aucun revenu
    Quand je demande les allocations
    Alors je suis éligible à l'AI catégorie V (maximum)
    Et le montant de l'AI devrait être 1119.77€ par mois
    Et je suis éligible à l'ARR catégorie B (cohabitant)
    Et le montant de l'ARR devrait être 1320.93€ par mois

  Scénario: Révision suite à aggravation du handicap
    Étant donné que je bénéficie de l'AI catégorie II
    Et que mon handicap s'est aggravé
    Et que ma nouvelle évaluation donne 16 points
    Quand je demande une révision
    Alors une nouvelle évaluation médicale est requise
    Et si confirmé, je passe en catégorie IV
    Et mon allocation passe de 427.35€ à 987.71€ par mois
    Et l'augmentation est rétroactive à la date de demande

  Scénario: Cumul avec indemnités accident du travail
    Étant donné que je perçois une indemnité accident du travail
    Et que cette indemnité est de 600€ par mois
    Et que j'ai 14 points d'autonomie (catégorie III)
    Quand je demande l'AI
    Alors l'AI est cumulable avec l'indemnité accident
    Mais l'ARR sera réduite en fonction de l'indemnité
    Et un calcul complexe détermine le montant final

  Plan du Scénario: Calcul AI selon points d'autonomie et revenus
    Étant donné que j'ai <points> points d'autonomie
    Et que je suis dans la catégorie <categorie>
    Et que mes revenus mensuels sont de <revenus>€
    Quand je calcule mon AI
    Alors le montant de base est <montant_base>€
    Et après déduction éventuelle, le montant net est <montant_net>€

    Exemples:
      | points | categorie | revenus | montant_base | montant_net |
      | 7      | I         | 0       | 118.64       | 118.64      |
      | 10     | II        | 200     | 427.35       | 427.35      |
      | 13     | III       | 500     | 679.65       | 679.65      |
      | 15     | IV        | 0       | 987.71       | 987.71      |
      | 18     | V         | 300     | 1119.77      | 1119.77     |

  Scénario: Procédure de demande et évaluation médicale
    Étant donné que je veux demander les allocations handicap
    Quand j'introduis ma demande
    Alors je dois remplir le formulaire en ligne sur handicap.belgium.be
    Et joindre les documents médicaux requis
    Et un médecin de la DG Handicap évalue mon dossier
    Et l'évaluation porte sur 6 activités de la vie quotidienne:
      | Activité                    | Points max |
      | Se déplacer                  | 3         |
      | Préparer et manger           | 3         |
      | Hygiène personnelle          | 3         |
      | S'habiller                   | 3         |
      | Dangers et surveillance      | 3         |
      | Communication                | 3         |
    Et la décision est rendue dans les 6 mois
    Et je peux contester via le tribunal du travail

  Scénario: Avantages sociaux liés au statut de handicap
    Étant donné que j'ai une reconnaissance de handicap
    Et que je perçois l'AI ou l'ARR
    Alors j'ai droit aux avantages suivants:
      | Avantage                        | Description                           |
      | Tarif social énergie            | Réduction gaz et électricité          |
      | Carte de stationnement          | Places réservées personnes handicapées |
      | Réduction transports publics    | Carte d'accompagnateur gratuit        |
      | Exonération précompte immobilier| Selon la région                       |
      | Tarif téléphonique social       | Réduction abonnement                  |
      | BIM (intervention majorée)      | Remboursements santé augmentés        |
    Et ces avantages sont automatiques avec la reconnaissance

  Scénario: Contrôle et obligations du bénéficiaire
    Étant donné que je perçois des allocations handicap
    Alors je dois respecter les obligations suivantes:
      | Obligation                           | Détail                               |
      | Déclarer tout changement situation  | Dans les 30 jours                   |
      | Déclarer revenus professionnels     | Immédiatement                       |
      | Déclarer changement état civil      | Mariage, divorce, cohabitation      |
      | Se soumettre aux contrôles médicaux | Si demandé par DG Handicap          |
      | Résider en Belgique                 | Minimum 8 mois par an               |
    Et le non-respect peut entraîner suspension ou récupération