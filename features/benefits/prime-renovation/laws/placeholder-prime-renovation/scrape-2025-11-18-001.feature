# language: fr
Fonctionnalité: Prime Rénovation
  En tant que propriétaire ou locataire d'un logement
  Je veux savoir si j'ai droit aux primes de rénovation
  Afin d'améliorer la performance énergétique de mon habitation

  Contexte:
    Étant donné que les systèmes de primes rénovation 2024-2025 sont:
      | Région              | Système           | Période validité        | Changement majeur                     |
      | Wallonie            | Prime Habitation  | Jusqu'au 30/09/2026    | Réduction 60% des montants           |
      | Bruxelles-Capitale  | Renolution        | Système suspendu 2025  | Attente nouveau gouvernement          |
      | Flandres            | MijnVerbouwPremie | En vigueur 2025        | Fusion primes énergie + rénovation    |
    Et que les catégories de revenus en Wallonie sont:
      | Catégorie | Description           | Plafond revenus        | Taux intervention |
      | R1        | Revenus modestes      | < 24,700€              | 70% des coûts    |
      | R2        | Revenus bas           | 24,700€ - 34,700€     | 70% des coûts    |
      | R3        | Revenus moyens bas    | 34,700€ - 44,700€     | 50% des coûts    |
      | R4        | Revenus moyens        | 44,700€ - 97,700€     | 50% des coûts    |
      | R5        | Revenus élevés        | > 97,700€              | Non éligible     |
    Et que l'avantage fiscal fédéral 2024 est plafonné à 3,900€

  Scénario: Propriétaire wallon catégorie R1 isolation toiture
    Étant donné que je suis propriétaire en Wallonie
    Et que mes revenus annuels sont de 20,000€ (catégorie R1)
    Et que ma maison a plus de 15 ans
    Et que je veux isoler 100m² de toiture
    Et que le devis est de 8,000€ HTVA
    Quand je demande la prime habitation
    Alors je devrais être éligible
    Et la prime de base est 20-120€/m² selon performance
    Et avec coefficient R1, la prime peut atteindre 70% du coût
    Et le montant estimé est 5,600€ maximum
    Et je n'ai pas besoin d'audit pour la toiture

  Scénario: Couple wallon catégorie R3 rénovation globale
    Étant donné que nous sommes propriétaires en Wallonie
    Et que nos revenus combinés sont de 40,000€ (catégorie R3)
    Et que nous planifions une rénovation complète
    Et que le devis total est de 50,000€
    Et qu'un audit énergétique préalable coûte 700€
    Quand nous demandons les primes
    Alors nous devons d'abord faire l'audit (obligatoire)
    Et l'audit est subsidié à 90% (630€ de prime)
    Et les primes couvrent maximum 50% des travaux
    Et le montant total des primes est plafonné à 25,000€
    Et nous devons suivre les recommandations de l'audit

  Scénario: Locataire avec accord propriétaire Wallonie
    Étant donné que je suis locataire en Wallonie
    Et que j'ai l'accord écrit du propriétaire
    Et que je veux installer une ventilation double flux
    Et que le coût est de 4,000€
    Et que mes revenus sont de 25,000€ (catégorie R2)
    Quand je demande la prime
    Alors je suis éligible avec accord propriétaire
    Et la prime de base est 680-4,080€ pour double flux
    Et avec coefficient R2 (70%), la prime est 2,800€
    Et le propriétaire doit maintenir le loyer 5 ans

  Scénario: Propriétaire Bruxelles situation 2025
    Étant donné que je suis propriétaire à Bruxelles
    Et que j'ai des travaux prévus en 2025
    Et que le système Renolution est suspendu
    Et que j'ai une facture finale datée de janvier 2025
    Quand je veux demander une prime
    Alors aucune demande n'est possible actuellement
    Et je dois attendre la formation du gouvernement
    Et les travaux 2024 restent éligibles via Irisbox
    Et je peux contacter Homegrade pour information

  Scénario: Propriétaire flamand MijnVerbouwPremie 2025
    Étant donné que je suis propriétaire en Flandres
    Et que mes revenus sont de 35,000€
    Et que je veux isoler les murs extérieurs (80m²)
    Et que le devis est de 12,000€
    Et que la performance atteint R ≥ 3
    Quand je demande MijnVerbouwPremie
    Alors je suis éligible selon mes revenus
    Et la prime dépend de ma catégorie de revenus
    Et le montant est calculé par m²
    Et la demande se fait en ligne
    Et le délai de traitement est 3-4 mois

  Scénario: Revenus élevés Wallonie catégorie R5
    Étant donné que je suis propriétaire en Wallonie
    Et que mes revenus annuels sont de 110,000€
    Et que je suis en catégorie R5
    Et que je veux rénover ma toiture
    Quand je vérifie mon éligibilité aux primes
    Alors je ne suis plus éligible depuis 2025
    Et le motif est "catégorie R5 exclue du système"
    Et je peux bénéficier de l'avantage fiscal fédéral uniquement
    Et la déduction fiscale maximum est 3,900€

  Scénario: Pompe à chaleur en Wallonie catégorie R2
    Étant donné que je suis propriétaire en Wallonie
    Et que mes revenus sont de 30,000€ (catégorie R2)
    Et que je remplace ma chaudière mazout
    Et que j'installe une pompe à chaleur air-eau
    Et que le coût total est de 15,000€
    Quand je demande la prime
    Alors je suis éligible à la prime pompe à chaleur
    Et la prime de base est réduite de 60% en 2025
    Et avec coefficient R2 (70%), le support reste significatif
    Et l'économie d'énergie estimée est 50-70%
    Et un audit préalable est recommandé

  Scénario: Châssis et vitrages en Wallonie
    Étant donné que je suis propriétaire en Wallonie
    Et que mes revenus sont de 28,000€ (catégorie R2)
    Et que je remplace 10 châssis simple vitrage
    Et que le coût est de 8,000€
    Et que les nouveaux châssis ont Uw ≤ 1.5 W/m²K
    Quand je demande la prime châssis
    Alors la prime est fortement réduite en 2025
    Et le montant dépend de la performance Uw
    Et maximum 70% du coût peut être couvert
    Et je dois utiliser un entrepreneur agréé

  Scénario: Avantage fiscal isolation toiture Wallonie
    Étant donné que je suis propriétaire en Wallonie
    Et que j'ai isolé ma toiture en 2024
    Et que la facture est de 10,000€
    Et que je suis dans la catégorie R4
    Quand je fais ma déclaration fiscale 2025
    Alors je peux déduire 30% des coûts
    Et la déduction maximum est 3,900€
    Et c'est cumulable avec les primes régionales
    Et la déduction totale est 3,000€
    Et cet avantage est unique à la Wallonie

  Plan du Scénario: Calcul primes selon région et travaux
    Étant donné que je suis propriétaire en <région>
    Et que mes revenus sont de <revenus>€
    Et que je réalise <travaux>
    Et que le coût est de <coût>€
    Et que ma catégorie est <catégorie>
    Quand je demande la prime
    Alors l'éligibilité est <éligibilité>
    Et le taux d'intervention est <taux>%
    Et la prime estimée est <prime>€

    Exemples:
      | région    | revenus | travaux                  | coût   | catégorie | éligibilité | taux | prime  |
      | Wallonie  | 22000   | isolation toiture 100m²  | 8000   | R1        | oui         | 70   | 5600   |
      | Wallonie  | 35000   | pompe à chaleur          | 15000  | R3        | oui         | 50   | 7500   |
      | Wallonie  | 45000   | châssis double vitrage   | 6000   | R4        | oui         | 50   | 3000   |
      | Wallonie  | 100000  | isolation murs           | 12000  | R5        | non         | 0    | 0      |
      | Flandres  | 28000   | isolation murs 80m²      | 10000  | -         | oui         | var  | 4000   |
      | Flandres  | 40000   | panneaux solaires        | 6000   | -         | oui         | var  | 1500   |
      | Bruxelles | 30000   | travaux 2025             | 10000  | -         | non         | 0    | 0      |

  Scénario: Conditions et obligations post-travaux
    Étant donné que j'ai reçu une prime rénovation
    Quand les travaux sont terminés
    Alors je dois respecter les obligations suivantes:
      | Obligation                              | Durée       | Sanction si non-respect        |
      | Maintenir la destination du bien       | 5 ans       | Remboursement prime            |
      | Ne pas vendre (sauf exceptions)        | 5 ans       | Remboursement proportionnel   |
      | Permettre les contrôles                | Permanent   | Suspension/remboursement       |
      | Conserver les factures                 | 10 ans      | Problème si contrôle fiscal    |
      | Respecter performances promises         | Permanent   | Remboursement si fraude        |
    Et en cas de location:
      | Région    | Obligation loyer                        |
      | Wallonie  | Pas d'augmentation pendant 5 ans      |
      | Flandres  | Grille de loyers maximums              |
      | Bruxelles | Certificat PEB obligatoire             |

  Scénario: Procédure et délais de demande
    Étant donné que je veux demander une prime rénovation
    Quand je prépare mon dossier
    Alors la procédure est:
      | Étape                      | Wallonie               | Flandres              | Bruxelles (suspendu)  |
      | Audit préalable            | Obligatoire sauf toit  | Recommandé            | Obligatoire           |
      | Devis entrepreneurs        | Minimum 1              | Minimum 1             | Minimum 2             |
      | Introduction demande       | Avant travaux          | Après facture         | Après travaux         |
      | Délai traitement           | 3-4 mois               | 3-4 mois              | 2-3 mois              |
      | Paiement prime             | Après travaux          | Direct                | Direct                |
      | Délai maximum travaux      | 2 ans                  | 1 an                  | 2 ans                 |
    Et les documents requis sont:
      | Document                   | Obligatoire |
      | Titre de propriété         | Oui         |
      | Avertissement-extrait      | Oui         |
      | Devis détaillés            | Oui         |
      | Photos avant/après         | Oui         |
      | Factures finales           | Oui         |
      | Attestation entrepreneur   | Oui         |