# language: fr
Fonctionnalité: Soins de Santé Mentale
  En tant que personne ayant besoin d'aide psychologique
  Je veux accéder aux soins de santé mentale remboursés
  Afin de bénéficier d'un suivi psychologique abordable

  Contexte:
    Étant donné que les remboursements santé mentale INAMI 2024 sont:
      | Type de soin              | Tarif      | Quote-part patient | Quote-part BIM |
      | 1ère séance individuelle  | Gratuit    | 0€                 | 0€             |
      | Séance individuelle adulte| 60€        | 11€                | 4€             |
      | Séance groupe adulte      | Variable   | 2.50€              | 2.50€          |
      | Séance enfant/jeune <23   | 60€        | 0€                 | 0€             |
      | Psychiatre conventionné   | 79.54€     | 19.89€             | 7.96€          |
    Et que les mutuelles offrent des remboursements complémentaires:
      | Mutuelle                  | Montant/an | Par séance | Max séances |
      | Mutualité Chrétienne      | 360€       | 20€        | 18          |
      | Solidaris                 | 400€       | 20€        | 20          |
      | Partenamut                | 400€       | 20€        | 20          |
      | Mutualité Neutre          | 180€       | 15€        | 12          |

  Scénario: Adulte demandant soins psychologiques première ligne
    Étant donné que je suis un adulte de 35 ans
    Et que j'ai des symptômes d'anxiété et dépression
    Et que je n'ai jamais consulté de psychologue
    Quand je contacte un réseau de santé mentale
    Alors ma première séance est gratuite (bilan)
    Et j'ai droit à 8 séances par an (série 1)
    Et je paie 11€ par séance (ou 4€ si BIM)
    Et après épuisement, possibilité série 2 (8 séances)
    Avec prescription du médecin généraliste

  Scénario: Jeune de 20 ans avec troubles psychologiques
    Étant donné que j'ai 20 ans
    Et que je souffre de troubles anxieux
    Et que je suis étudiant
    Quand je consulte via le réseau santé mentale
    Alors toutes mes séances sont gratuites (< 23 ans)
    Et j'ai droit à 10 séances par an minimum
    Et renouvelable selon évaluation clinique
    Et pas besoin de prescription médicale
    Et mes parents ne sont pas informés (secret médical)

  Scénario: Parent cherchant aide pour enfant de 8 ans
    Étant donné que mon enfant de 8 ans a des troubles comportementaux
    Et que l'école recommande un suivi psychologique
    Quand je contacte un centre PMS ou réseau santé mentale
    Alors l'évaluation initiale est gratuite
    Et le suivi est entièrement gratuit (< 23 ans)
    Et comprend:
      | Service                   | Fréquence              |
      | Thérapie individuelle     | Hebdomadaire si besoin |
      | Guidance parentale        | Mensuelle              |
      | Coordination école        | Trimestrielle          |
      | Bilan psychologique       | Annuel                 |
    Et aucune limite de séances pour les mineurs

  Scénario: Personne avec revenus limités et statut BIM
    Étant donné que je bénéficie du statut BIM
    Et que j'ai besoin d'un suivi psychologique régulier
    Et que je consulte via le réseau conventionné
    Quand j'utilise mes droits INAMI et mutuelle
    Alors pour les soins de première ligne:
      | Séance    | Coût total | INAMI paie | Je paie | Mutuelle  |
      | Séance 1  | 60€        | 60€        | 0€      | 0€        |
      | Séances 2-8| 60€       | 56€        | 4€      | 4€ remb.  |
    Et ma mutuelle rembourse jusqu'à 20€/séance
    Donc coût final: 0€ avec remboursement mutuelle

  Scénario: Urgence psychiatrique et hospitalisation
    Étant donné que je suis en crise psychologique aiguë
    Et que je me présente aux urgences psychiatriques
    Quand je suis admis en hospitalisation
    Alors l'admission urgente est couverte à 100%
    Et l'hospitalisation en psychiatrie comprend:
      | Durée              | Intervention personnelle/jour |
      | Jours 1-5          | 44.51€ (6.32€ si BIM)         |
      | Jours 6-365        | 17.02€ (6.32€ si BIM)         |
      | Après 1 an         | 6.32€ pour tous               |
    Et le suivi post-hospitalisation est organisé
    Avec équipe mobile si nécessaire

  Scénario: Thérapie de groupe pour addiction
    Étant donné que j'ai des problèmes d'addiction
    Et que je veux participer à une thérapie de groupe
    Quand je m'inscris via le réseau santé mentale
    Alors les séances de groupe coûtent 2.50€
    Et sont accessibles sans limite annuelle
    Et incluent:
      | Type de groupe            | Fréquence            |
      | Groupe de parole          | Hebdomadaire         |
      | Psychoéducation           | Bi-mensuel           |
      | Groupe familles           | Mensuel              |
      | Prévention rechute        | Selon besoin         |

  Scénario: Consultation psychiatre avec prescription médicaments
    Étant donné que mon médecin me réfère à un psychiatre
    Et que j'ai besoin de médicaments psychotropes
    Quand je consulte le psychiatre conventionné
    Alors la consultation coûte 79.54€
    Et je paie 19.89€ (7.96€ si BIM)
    Et le suivi comprend:
      | Prestation               | Fréquence    | Remboursement      |
      | Consultation initiale    | 1x           | 75% (90% BIM)      |
      | Suivi médicamenteux      | Mensuel      | 75% (90% BIM)      |
      | Psychothérapie           | Si prescrite | Via réseau santé   |
      | Médicaments              | Selon cat.   | 50-100% selon cat. |

  Scénario: Burn-out professionnel et trajet de réintégration
    Étant donné que je suis en burn-out reconnu
    Et que je suis en incapacité de travail
    Quand mon médecin-conseil organise un trajet
    Alors j'ai accès à:
      | Service                  | Couverture              | Durée           |
      | Psychologue du travail   | 100% via mutuelle       | 6 mois          |
      | Coaching réintégration   | 100% via employeur      | Selon besoin    |
      | Thérapie cognitivo-comp. | INAMI + mutuelle        | 20 séances/an   |
      | Médecin du travail       | 100% employeur          | Suivi régulier  |
    Et maintien des indemnités maladie

  Plan du Scénario: Calcul remboursement selon âge et statut
    Étant donné que j'ai <age> ans
    Et que mon statut est <statut>
    Et que je consulte pour la <numero>e séance
    Quand je calcule mon remboursement
    Alors je paie <cout_patient>€
    Et la mutuelle rembourse <remb_mutuelle>€

    Exemples:
      | age | statut    | numero | cout_patient | remb_mutuelle |
      | 10  | ordinaire | 1      | 0            | 0             |
      | 10  | ordinaire | 5      | 0            | 0             |
      | 22  | ordinaire | 1      | 0            | 0             |
      | 22  | BIM       | 5      | 0            | 0             |
      | 30  | ordinaire | 1      | 0            | 0             |
      | 30  | ordinaire | 5      | 11           | 11            |
      | 30  | BIM       | 5      | 4            | 4             |
      | 45  | ordinaire | 10     | 11           | 11            |

  Scénario: Services spécialisés santé mentale
    Étant donné que j'ai des besoins spécifiques en santé mentale
    Alors je peux accéder aux services spécialisés:
      | Service                    | Public cible         | Accès              |
      | Équipes mobiles 2A/2B      | Crise/chronique      | Via psychiatre     |
      | Centre de jour             | Réhabilitation       | Via réseau         |
      | Initiative habitation      | Logement supervisé   | Via CPAS/réseau    |
      | Soins assertifs            | Patients complexes   | Équipe mobile      |
      | Psychoéducation famille    | Proches aidants      | Gratuit            |
      | Case management            | Coordination soins   | Via mutuelle       |
    Et ces services sont largement subsidiés

  Scénario: Téléconsultation et soins à distance
    Étant donné que j'habite en zone rurale
    Ou que j'ai des difficultés de déplacement
    Quand je demande une consultation vidéo
    Alors depuis 2024, la téléconsultation est:
      | Aspect                   | Règle                        |
      | Remboursement            | Identique au présentiel      |
      | Première séance          | Doit être en présentiel      |
      | Séances suivantes        | 50% peuvent être à distance  |
      | Prescription             | Valide électroniquement      |
      | Plateforme              | Agréée et sécurisée          |
    Et mêmes tarifs et remboursements appliqués

  Scénario: Coordination des soins et secret professionnel
    Étant donné que je suis suivi par plusieurs professionnels
    Alors la coordination implique:
      | Professionnel           | Rôle                    | Communication        |
      | Médecin traitant        | Coordinateur principal  | Rapport si accord    |
      | Psychologue             | Thérapeute principal    | Secret sauf danger   |
      | Psychiatre              | Suivi médicamenteux     | Échange avec MT      |
      | Assistant social        | Soutien social          | Selon autorisation   |
    Et je peux refuser le partage d'informations
    Sauf danger imminent pour moi ou autrui