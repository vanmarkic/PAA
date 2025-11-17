# language: fr
Fonctionnalité: Formation Professionnelle
  En tant que demandeur d'emploi ou travailleur
  Je veux accéder à une formation professionnelle
  Afin d'améliorer mes compétences et mon employabilité

  Contexte:
    Étant donné que les conditions de formation professionnelle 2024 sont:
      | Type de prestation                    | Détails                                            |
      | Organismes régionaux                  | Forem (Wallonie), Actiris/Bruxelles Formation (Bruxelles), VDAB (Flandre) |
      | Indemnité de formation                | 1€ par heure de formation                         |
      | Maintien allocations chômage          | Oui, si formation agréée                          |
      | Prime de formation                    | 350€ après formation métier en pénurie            |
      | Frais de déplacement                  | Remboursement selon distance                      |
      | Durée maximale                        | Variable selon le type de formation               |
      | Formations métiers en pénurie        | Liste mise à jour annuellement                    |
      | Âge minimum                          | 18 ans (sauf exceptions)                          |

  Scénario: Demandeur d'emploi en formation métier en pénurie
    Étant donné que je suis inscrit comme demandeur d'emploi au Forem
    Et que j'ai 28 ans
    Et que je perçois des allocations de chômage de 1200€
    Et que je souhaite suivre une formation d'électricien (métier en pénurie)
    Et que la formation dure 6 mois à temps plein
    Quand je vérifie mon éligibilité à la formation professionnelle
    Alors je devrais être éligible
    Et je maintiens mes allocations de chômage complètes
    Et je reçois une indemnité de "1€ par heure de formation"
    Et je recevrai une prime de "350€ à la fin de la formation"
    Et mes frais de déplacement seront remboursés

  Scénario: Travailleur en reconversion professionnelle
    Étant donné que je suis employé à temps plein
    Et que j'ai 35 ans
    Et que je souhaite me reconvertir dans le secteur informatique
    Et que je demande un congé-éducation payé
    Et que la formation est reconnue par la Région
    Quand je vérifie mes droits à la formation
    Alors je devrais être éligible au congé-éducation payé
    Et j'ai droit à "120 heures par an" de congé-éducation
    Et mon salaire est maintenu pendant les heures de formation
    Et le plafond salarial est de "3098€ brut par mois"

  Scénario: Jeune sans qualification en formation qualifiante
    Étant donné que j'ai 20 ans
    Et que je n'ai pas de diplôme du secondaire supérieur
    Et que je suis inscrit chez Actiris
    Et que je souhaite suivre une formation qualifiante en vente
    Et que la formation dure 3 mois
    Quand je vérifie mon éligibilité
    Alors je devrais être éligible prioritairement
    Et je reçois une allocation de formation de "200€ par mois"
    Et j'ai accès à la gratuité des transports en commun
    Et je reçois une attestation de compétences à la fin

  Scénario: Formation en alternance pour demandeur d'emploi
    Étant donné que je suis demandeur d'emploi
    Et que j'ai 24 ans
    Et que je souhaite suivre une formation en alternance
    Et que j'ai trouvé une entreprise d'accueil
    Et que le contrat est de type FPIE (Formation Professionnelle Individuelle en Entreprise)
    Quand je démarre la formation
    Alors je maintiens mes allocations de chômage
    Et je reçois une indemnité de productivité progressive
    Et l'entreprise s'engage à m'embaucher après la formation
    Et la durée maximale est de "6 mois"

  Scénario: Travailleur âgé de plus de 50 ans
    Étant donné que j'ai 52 ans
    Et que j'ai été licencié après 20 ans dans la même entreprise
    Et que je souhaite me former aux outils numériques
    Et que je suis inscrit au VDAB
    Quand je vérifie mes droits spécifiques
    Alors j'ai accès prioritaire aux formations
    Et je bénéficie d'un accompagnement personnalisé
    Et je maintiens mes allocations de chômage majorées
    Et je peux accéder au programme "50+"
    Et la durée de formation peut être étendue

  Scénario: Formation non agréée par le service régional
    Étant donné que je suis demandeur d'emploi
    Et que je perçois des allocations de chômage
    Et que je souhaite suivre une formation privée non reconnue
    Et que la formation n'est pas sur la liste agréée
    Quand je vérifie l'impact sur mes allocations
    Alors je risque de perdre mes allocations de chômage
    Et je dois demander une dispense à l'ONEM
    Et le motif devrait être "formation non compatible avec disponibilité"

  Scénario: Parent isolé avec enfants en formation
    Étant donné que je suis parent isolé avec 2 enfants
    Et que je suis au chômage
    Et que je souhaite suivre une formation d'aide-soignante
    Et que la formation nécessite des stages
    Quand je vérifie les aides supplémentaires
    Alors j'ai droit aux frais de garde d'enfants
    Et le remboursement peut atteindre "18€ par jour par enfant"
    Et j'ai accès aux horaires de formation adaptés
    Et je maintiens mes allocations familiales majorées

  Scénario: Formation en langues pour emploi spécifique
    Étant donné que je suis demandeur d'emploi à Bruxelles
    Et que j'ai une promesse d'embauche conditionnelle
    Et que l'emploi nécessite la connaissance du néerlandais
    Et que mon niveau actuel est A1
    Quand je demande une formation linguistique
    Alors j'ai accès aux chèques-langues gratuits
    Et la formation intensive dure "3 mois maximum"
    Et je peux passer la certification Selor
    Et je maintiens mes allocations pendant la formation
    Et l'employeur peut recevoir une prime à l'embauche

  Plan du Scénario: Indemnités selon le type de formation
    Étant donné que je suis <statut>
    Et que je suis une formation de type <type_formation>
    Et que la durée est de <duree> mois
    Et que je suis inscrit auprès de <organisme>
    Quand je calcule mes indemnités
    Alors l'indemnité de formation est <indemnite>
    Et les avantages supplémentaires sont <avantages>

    Exemples:
      | statut             | type_formation      | duree | organisme | indemnite        | avantages                          |
      | demandeur emploi   | métier en pénurie   | 6     | Forem     | 1€/heure + 350€  | transport + maintien allocations   |
      | demandeur emploi   | qualifiante         | 3     | Actiris   | 200€/mois        | transport gratuit                  |
      | travailleur        | reconversion        | 12    | VDAB      | salaire maintenu | congé-éducation 120h               |
      | jeune sans diplôme | alternance          | 4     | Forem     | progressive      | engagement embauche                |
      | parent isolé       | aide-soignante      | 18    | Actiris   | 1€/heure         | garde enfants 18€/jour             |

  Scénario: Validation des compétences acquises
    Étant donné que j'ai suivi une formation professionnelle complète
    Et que j'ai réussi les évaluations
    Quand je termine la formation
    Alors je reçois une attestation de réussite
    Et je peux demander la validation des compétences
    Et le titre de compétence est reconnu par les trois Régions
    Et je peux l'ajouter à mon CV Europass
    Et cela améliore mon positionnement salarial

  Scénario: Obligations durant la formation
    Étant donné que je suis en formation professionnelle agréée
    Et que je maintiens mes allocations de chômage
    Quand je suis les cours
    Alors je dois respecter un taux de présence minimum de 80%
    Et je dois justifier toute absence
    Et je dois participer activement aux cours
    Et je dois réussir les évaluations intermédiaires
    Et je dois rester inscrit comme demandeur d'emploi
    Et je dois informer l'ONEM du début et fin de formation
    Et je reste disponible pour un emploi convenable

  Scénario: Formation à l'entrepreneuriat
    Étant donné que je suis demandeur d'emploi
    Et que je souhaite créer ma propre entreprise
    Et que je m'inscris à une formation en gestion d'entreprise
    Et que la formation est organisée par l'IFAPME
    Quand je démarre la formation
    Alors je peux maintenir mes allocations pendant 6 mois
    Et j'ai accès à l'accompagnement "Airbag" de l'UCM
    Et je peux demander le plan "Tremplin-indépendants"
    Et je bénéficie d'un coaching personnalisé
    Et je peux accéder aux microcrédits après formation