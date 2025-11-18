# language: fr
Fonctionnalité: Garde d'Enfants et Aides Financières
  En tant que parent ayant besoin de faire garder mon enfant
  Je veux connaître les aides financières disponibles pour la garde
  Afin de réduire le coût de l'accueil de mon enfant

  Contexte:
    Étant donné que les aides pour la garde d'enfants en 2024 comprennent:
      | Type d'aide                    | Montant/Taux                                |
      | Réduction fiscale              | 45% des frais, max 16.40€/jour/enfant      |
      | Tarif social BIM               | Gratuit si statut BIM                       |
      | Réduction famille nombreuse    | -30% à partir du 2ème enfant simultané      |
      | Réduction temps partiel        | -40% si présence ≤ 5h/jour                  |
      | Intervention employeur         | Variable selon secteur                      |
    Et que les tarifs des crèches subventionnées sont:
      | Organisme              | Tarif minimum | Tarif maximum |
      | ONE (Wallonie/Brux)   | 3.06€/jour    | 43.14€/jour   |
      | Kind en Gezin (Flandre)| 6.24€/jour    | 34.64€/jour   |

  Scénario: Parent avec revenus moyens en crèche ONE
    Étant donné que j'ai un enfant de 18 mois
    Et que nos revenus annuels nets sont de 35000€
    Et que l'enfant va en crèche ONE à Bruxelles
    Et que la crèche est subventionnée
    Quand je calcule le coût de garde
    Alors le tarif journalier sera calculé selon mes revenus
    Et il sera environ de 18€/jour
    Et je pourrai déduire 45% fiscalement
    Et la déduction maximale sera 16.40€/jour

  Scénario: Famille avec statut BIM
    Étant donné que j'ai le statut BIM (intervention majorée)
    Et que j'ai un enfant de 2 ans
    Et que l'enfant va en crèche subventionnée
    Quand je vérifie le tarif applicable
    Alors la garde est gratuite
    Et je dois fournir mon attestation BIM
    Et cette gratuité s'applique depuis janvier 2023

  Scénario: Famille nombreuse avec 3 enfants en crèche
    Étant donné que j'ai 3 enfants
    Et que 2 enfants vont en crèche simultanément
    Et que nos revenus annuels nets sont de 40000€
    Et que la crèche est ONE
    Quand je calcule le coût total
    Alors le 1er enfant paie le tarif normal selon revenus
    Et le 2ème enfant bénéficie de -30% de réduction
    Et j'ai aussi -30% car famille de 3 enfants ou plus

  Scénario: Parent isolé avec réduction supplémentaire
    Étant donné que je suis parent isolé
    Et que j'ai la garde exclusive de mon enfant de 1 an
    Et que mes revenus annuels nets sont de 25000€
    Et que l'enfant va en crèche ONE
    Quand je calcule le coût de garde
    Alors je bénéficie de -30% en tant que parent isolé
    Et le tarif de base sera déjà réduit vu mes revenus
    Et le cumul des réductions s'applique

  Scénario: Garde temps partiel (moins de 5h/jour)
    Étant donné que mon enfant va en crèche
    Et qu'il n'y reste que 4 heures par jour
    Et que nos revenus annuels nets sont de 30000€
    Quand je calcule le tarif journalier
    Alors je bénéficie de -40% sur le tarif normal
    Et cette réduction s'applique automatiquement
    Et je dois déclarer les heures de présence

  Scénario: Déduction fiscale pour garde privée
    Étant donné que mon enfant va chez une gardienne privée
    Et que je paie 30€/jour
    Et que l'enfant y va 220 jours par an
    Et que la gardienne est agréée ONE/Kind en Gezin
    Quand je fais ma déclaration fiscale
    Alors je peux déduire maximum 16.40€/jour
    Et la déduction totale sera 3608€ (16.40€ × 220 jours)
    Et j'aurai une réduction d'impôt de 45% de ce montant
    Soit environ 1623.60€ de réduction d'impôt

  Scénario: Intervention employeur secteur alimentaire
    Étant donné que je travaille dans le secteur alimentaire
    Et que j'ai un enfant de 2 ans en crèche
    Et que je paie 20€/jour de garde
    Quand je demande l'intervention employeur
    Alors j'ai droit à une intervention via Alimento
    Et le montant peut aller jusqu'à 5€/jour
    Et je dois fournir les attestations de paiement

  Scénario: Garde d'enfant malade à domicile
    Étant donné que mon enfant de 3 ans est malade
    Et qu'il ne peut pas aller en crèche
    Et que j'ai besoin d'une garde à domicile
    Et que j'ai une mutuelle
    Quand je contacte le service garde enfants malades
    Alors certaines mutuelles offrent ce service
    Et le coût est réduit (environ 3-5€/heure)
    Et je peux avoir jusqu'à 10 jours/an

  Scénario: Accueillante conventionnée vs libre
    Étant donné que je cherche une garde pour mon enfant
    Et que j'hésite entre conventionnée et libre
    Quand je compare les options
    Alors l'accueillante conventionnée:
      | Avantage                          | Description                    |
      | Tarif réglementé selon revenus   | 3.06€ à 43.14€/jour           |
      | Déduction fiscale garantie       | 45% jusqu'à 16.40€/jour       |
      | Contrôle ONE/Kind en Gezin       | Qualité surveillée             |
    Et l'accueillante libre:
      | Avantage                          | Description                    |
      | Tarif libre négociable           | Souvent 25-40€/jour            |
      | Plus de flexibilité horaire      | Horaires atypiques possibles   |
      | Déduction fiscale si agréée      | Mêmes conditions si reconnue   |

  Scénario: Enfant de plus de 12 ans - non éligible déduction
    Étant donné que mon enfant a 13 ans
    Et qu'il va en garderie après l'école
    Et que je paie 10€/jour
    Quand je veux déduire fiscalement
    Alors je ne suis pas éligible à la déduction
    Et le motif est "enfant de plus de 12 ans"
    Et aucune déduction fiscale n'est possible

  Scénario: Crèche d'entreprise avec participation employeur
    Étant donné que mon entreprise a une crèche
    Et que l'entreprise subventionne 50% du coût
    Et que le tarif normal est 30€/jour
    Quand je calcule mon coût réel
    Alors je paie 15€/jour après intervention
    Et je peux toujours déduire fiscalement
    Et la déduction porte sur les 15€ payés
    Avec maximum 16.40€/jour déductibles

  Plan du Scénario: Calcul coût net selon revenus et aides
    Étant donné que mes revenus annuels nets sont <revenus>€
    Et que le tarif crèche ONE est <tarif>€/jour
    Et que j'ai <nombre_enfants> enfant(s) en crèche
    Quand je calcule le coût net après déductions
    Alors le coût journalier après réduction fiscale est <cout_net>€

    Exemples:
      | revenus | tarif | nombre_enfants | cout_net |
      | 25000   | 12.00 | 1             | 6.60     |
      | 35000   | 18.00 | 1             | 10.62    |
      | 45000   | 25.00 | 1             | 17.62    |
      | 35000   | 18.00 | 2             | 8.10     |
      | 0       | 3.06  | 1             | 1.68     |

  Scénario: Procédure inscription en crèche
    Étant donné que j'attends un enfant
    Et que je veux l'inscrire en crèche
    Quand j'entame les démarches
    Alors je dois:
      | Étape                              | Quand                                   |
      | M'inscrire sur liste d'attente    | Dès le 3ème mois de grossesse         |
      | Fournir certificat de grossesse   | À l'inscription                        |
      | Confirmer après naissance          | Dans le mois suivant la naissance      |
      | Fournir composition de ménage     | Pour calcul du tarif                   |
      | Fournir avertissement-extrait     | Revenus année N-2                      |
      | Signer contrat d'accueil          | Avant l'entrée en crèche               |
    Et les places sont attribuées selon critères de priorité

  Scénario: Chèques garde d'enfants de la Région
    Étant donné que j'habite en Région wallonne
    Et que j'ai un enfant de moins de 3 ans
    Et que je reprends une formation ou emploi
    Quand je vérifie les aides régionales
    Alors je peux demander des chèques garde d'enfants
    Et ils couvrent une partie des frais de garde
    Et c'est limité dans le temps (6-12 mois)
    Et je dois prouver la reprise d'activité

  Scénario: Cumul des différentes aides
    Étant donné que j'ai 2 enfants en crèche
    Et que je suis parent isolé avec statut BIM
    Et que mon employeur intervient
    Quand je cumule toutes les aides
    Alors la garde est gratuite (statut BIM)
    Mais l'intervention employeur reste acquise
    Et je ne peux pas déduire fiscalement (déjà gratuit)
    Et l'employeur pourrait me verser l'intervention en net