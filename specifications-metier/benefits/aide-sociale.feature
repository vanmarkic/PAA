# language: fr
Fonctionnalité: Aide Sociale du CPAS
  En tant que personne en difficulté financière
  Je veux savoir si j'ai droit à l'aide sociale du CPAS
  Afin de subvenir à mes besoins essentiels

  Contexte:
    Étant donné que l'aide sociale est régie par:
      | Législation                          | Date        |
      | Loi organique des CPAS               | 1976-07-08  |
      | Loi sur le droit à l'intégration sociale | 2002-05-26  |
    Et que les montants de référence 2024 sont:
      | Type d'aide                        | Description                              |
      | Aide sociale équivalente RIS       | Même montants que le RIS                |
      | Aide en nature                     | Selon besoins évalués                   |
      | Aide médicale urgente              | Personnes sans titre de séjour          |
      | Avance sur prestations sociales    | En attente d'autres allocations         |

  Scénario: Personne sans titre de séjour - aide médicale urgente uniquement
    Étant donné que je suis une personne sans papiers
    Et que j'ai 35 ans
    Et que je n'ai pas de titre de séjour valide
    Et que je réside effectivement à Bruxelles
    Et que j'ai besoin de soins médicaux urgents
    Quand je demande l'aide du CPAS
    Alors je devrais être éligible uniquement à l'aide médicale urgente
    Et le CPAS prend en charge les frais médicaux urgents
    Et je ne peux pas recevoir d'aide financière régulière
    Et le motif est "aide médicale urgente pour personnes sans titre de séjour"

  Scénario: Mineur non accompagné - aide sociale spécifique
    Étant donné que je suis mineur non accompagné
    Et que j'ai 16 ans
    Et que je n'ai pas de représentant légal en Belgique
    Et que je réside dans un centre d'accueil
    Quand je demande l'aide du CPAS
    Alors je devrais être éligible à l'aide sociale
    Et non au RIS car "mineurs exclus du RIS"
    Et l'aide couvre "hébergement, nourriture, vêtements, frais scolaires"
    Et un tuteur est désigné par le service des tutelles

  Scénario: Étudiant étranger hors UE - aide sociale limitée
    Étant donné que je suis étudiant étranger hors UE
    Et que j'ai 22 ans
    Et que j'ai un visa étudiant valide
    Et que mes ressources sont insuffisantes
    Et que j'ai signé un engagement de prise en charge
    Quand je demande l'aide du CPAS
    Alors je devrais recevoir une aide sociale très limitée
    Et le CPAS vérifie l'engagement de prise en charge
    Et l'aide est exceptionnelle et temporaire
    Et le motif est "étudiant avec garant défaillant"

  Scénario: Personne en attente d'allocations de chômage
    Étant donné que je suis demandeur d'emploi
    Et que j'ai 28 ans
    Et que je suis Belge
    Et que j'ai introduit une demande de chômage il y a 2 mois
    Et que je n'ai aucun revenu actuellement
    Quand je demande l'aide du CPAS
    Alors je devrais être éligible à une avance sur allocations
    Et le montant est équivalent au RIS catégorie isolé (1070.49€)
    Et l'aide est récupérable sur mes futures allocations
    Et le CPAS contacte l'ONEM pour accélérer le traitement

  Scénario: Famille avec enfants - aide en nature
    Étant donné que je suis parent isolé
    Et que j'ai 2 enfants de 8 et 12 ans
    Et que je bénéficie du RIS famille monoparentale
    Et que j'ai des difficultés supplémentaires
    Quand je demande une aide complémentaire au CPAS
    Alors je peux recevoir une aide en nature comprenant:
      | Type d'aide          | Description                    |
      | Colis alimentaires   | Via banque alimentaire        |
      | Bons d'achat         | Pour vêtements et fournitures  |
      | Abonnement STIB      | Transport public gratuit       |
      | Chèques sport/culture| Activités pour les enfants     |
    Et cette aide complète mon RIS
    Et elle est réévaluée tous les 3 mois

  Scénario: Personne âgée avec GRAPA insuffisante
    Étant donné que je suis une personne isolée
    Et que j'ai 72 ans
    Et que je bénéficie de la GRAPA (1549.42€)
    Et que mon loyer est de 900€
    Et que j'ai des frais médicaux importants
    Quand je demande l'aide du CPAS
    Alors je devrais être éligible à une aide sociale complémentaire
    Et l'aide peut couvrir:
      | Frais                | Montant/Description           |
      | Garantie locative    | Maximum 3 mois de loyer       |
      | Frais pharmaceutiques| Non remboursés par la mutuelle|
      | Frais de chauffage   | Fonds social mazout/gaz       |
      | Aide ménagère        | Titres-services subsidiés     |
    Et le CPAS fait une enquête sociale complète
    Et l'aide est accordée après analyse du budget

  Scénario: Européen en séjour de moins de 3 mois
    Étant donné que je suis citoyen européen
    Et que j'ai 30 ans
    Et que je suis en Belgique depuis 2 mois
    Et que je n'ai pas de ressources suffisantes
    Et que je n'ai pas d'emploi
    Quand je demande l'aide du CPAS
    Alors je ne devrais pas être éligible au RIS
    Mais je peux recevoir une aide sociale d'urgence
    Et cette aide est limitée dans le temps
    Et elle ne peut pas créer une charge déraisonnable
    Et le CPAS peut décider un retour volontaire

  Scénario: Personne avec handicap - aide sociale spécifique
    Étant donné que je suis une personne avec handicap
    Et que j'ai 45 ans
    Et que je bénéficie d'allocations handicap (1200€)
    Et que j'ai des frais médicaux importants liés au handicap
    Quand je demande l'aide du CPAS
    Alors je devrais être éligible à une aide sociale complémentaire
    Et l'aide peut inclure:
      | Type d'aide              | Description                      |
      | Adaptation logement      | Rampe d'accès, salle de bain    |
      | Matériel médical         | Non couvert par l'INAMI          |
      | Transport adapté         | Vers centres de soins            |
      | Aide familiale           | Heures supplémentaires           |
    Et le CPAS collabore avec l'AVIQ/PHARE
    Et un projet individualisé est établi

  Plan du Scénario: Aide sociale équivalente au RIS
    Étant donné que je suis <situation>
    Et que j'ai <age> ans
    Et que je n'ai pas droit au RIS car <raison_exclusion>
    Mais que je suis dans le besoin
    Quand je demande l'aide sociale au CPAS
    Alors je devrais recevoir une aide équivalente de <montant>€

    Exemples:
      | situation                    | age | raison_exclusion                | montant  |
      | personne isolée sans papiers | 35  | pas de titre de séjour         | 0        |
      | mineur non accompagné        | 17  | moins de 18 ans                | 1070.49  |
      | européen < 3 mois séjour     | 28  | séjour inférieur à 3 mois      | variable |
      | demandeur d'asile            | 30  | procédure d'asile en cours     | 1070.49  |

  Scénario: Procédure de demande d'aide sociale
    Étant donné que je veux demander l'aide sociale
    Quand je me présente au CPAS
    Alors la procédure comprend:
      | Étape                    | Délai         | Description                           |
      | Accusé de réception      | Immédiat      | Preuve de dépôt de demande          |
      | Enquête sociale          | 30 jours max  | Visite à domicile, vérifications    |
      | Audition                 | Facultative   | Présentation devant le conseil       |
      | Décision                 | 30 jours      | Notification écrite motivée          |
      | Paiement                 | 15 jours      | Après décision positive              |
      | Recours                  | 3 mois        | Tribunal du travail si refus         |

  Scénario: Obligations du bénéficiaire d'aide sociale
    Étant donné que je bénéficie de l'aide sociale du CPAS
    Alors je dois respecter les obligations suivantes:
      | Obligation                           | Conséquence si non-respect        |
      | Déclarer tout changement situation  | Suspension/récupération de l'aide |
      | Collaborer à l'enquête sociale       | Refus ou suspension de l'aide     |
      | Faire valoir mes droits              | Obligation de demander autres aides|
      | Résider effectivement en Belgique   | Suspension après absence prolongée |
      | Respecter le contrat PIIS si applicable | Sanctions graduelles            |

  Scénario: Récupération de l'aide sociale
    Étant donné que j'ai bénéficié de l'aide sociale
    Et que ma situation financière s'est améliorée
    Quand le CPAS examine la récupération
    Alors la récupération est possible dans les cas suivants:
      | Cas                                  | Modalités                          |
      | Retour à meilleure fortune          | Dans les 5 ans, montants raisonnables |
      | Auprès des débiteurs d'aliments     | Parents, enfants selon capacité   |
      | Erreur ou fraude                    | Récupération totale obligatoire   |
      | Avance sur prestations              | Récupération automatique           |
    Mais pas de récupération si "aide minimale de survie"
    Et le CPAS doit motiver sa décision de récupération

  Scénario: Aide sociale d'urgence
    Étant donné que je suis dans une situation d'urgence
    Et que je n'ai aucune ressource immédiate
    Et que je risque d'être à la rue ce soir
    Quand je me présente au CPAS
    Alors je peux recevoir une aide d'urgence immédiate comprenant:
      | Type d'aide              | Description                        |
      | Hébergement d'urgence    | Maison d'accueil ou hôtel social  |
      | Repas                    | Tickets restaurant ou colis        |
      | Soins médicaux urgents   | Réquisitoire médical              |
      | Vêtements de base        | Via vestiaire social              |
    Et une enquête sociale complète suit dans les 30 jours
    Et l'aide d'urgence est limitée à maximum 1 mois