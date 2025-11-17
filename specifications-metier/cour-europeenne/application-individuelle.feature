# language: fr
Fonctionnalité: Requête individuelle devant la CEDH
  En tant que victime d'une violation des droits de l'homme
  Je veux déposer une requête devant la Cour européenne des droits de l'homme
  Afin d'obtenir réparation pour la violation de mes droits

  Contexte:
    Étant donné que la CEDH examine les violations de la Convention européenne des droits de l'homme
    Et que le délai pour déposer une requête est de 4 mois depuis février 2024
    Et que l'ancien délai de 6 mois s'applique aux violations antérieures

  Scénario: Requête recevable dans le délai de 4 mois
    Étant donné que je suis un ressortissant belge de 35 ans
    Et que j'ai subi une violation de l'article 6 (procès équitable)
    Et que la décision finale des tribunaux belges date du "01/09/2024"
    Et que nous sommes le "15/12/2024"
    Et que j'ai épuisé toutes les voies de recours internes
    Et que j'ai subi un préjudice important de 8000 euros
    Quand je vérifie la recevabilité de ma requête
    Alors ma requête devrait être recevable
    Et le délai restant devrait être de 15 jours
    Et je devrais utiliser le formulaire de requête officiel
    Et les documents requis devraient inclure "décision finale, procuration, preuves"

  Scénario: Requête irrecevable pour délai dépassé
    Étant donné que je suis un ressortissant français de 42 ans
    Et que j'ai subi une violation de l'article 8 (vie privée)
    Et que la décision finale des tribunaux français date du "01/03/2024"
    Et que nous sommes le "15/11/2024"
    Quand je vérifie la recevabilité de ma requête
    Alors ma requête devrait être irrecevable
    Et le motif devrait être "délai de 4 mois dépassé"
    Et le délai était expiré depuis 106 jours

  Scénario: Violation continue sans décision finale
    Étant donné que je suis détenu dans des conditions inhumaines (article 3)
    Et que la violation est continue depuis le "01/01/2024"
    Et que j'ai introduit des recours qui sont toujours pendants
    Et que la situation perdure actuellement
    Quand je vérifie la possibilité de déposer une requête
    Alors je devrais pouvoir déposer une requête
    Et le type devrait être "violation continue"
    Et des mesures provisoires pourraient être demandées
    Et la procédure prioritaire pourrait s'appliquer

  Scénario: Requête collective pour violations similaires
    Étant donné que nous sommes 15 personnes affectées par la même loi
    Et que nous avons tous subi une violation de l'article 14 (discrimination)
    Et que nous avons tous épuisé les recours internes
    Et que toutes les décisions finales datent de moins de 4 mois
    Quand nous vérifions la possibilité d'une requête collective
    Alors une requête collective devrait être possible
    Et un représentant commun devrait être désigné
    Et chaque requérant devrait signer une procuration
    Et la procédure pourrait être simplifiée

  Scénario: Demande de mesures provisoires (article 39)
    Étant donné que je risque l'expulsion vers un pays où je risque la torture
    Et que l'expulsion est prévue dans 48 heures
    Et que j'ai des preuves du risque de torture
    Et que le danger est imminent et irréversible
    Quand je demande des mesures provisoires
    Alors la demande devrait être traitée en urgence
    Et je devrais fournir "identité complète, faits détaillés, preuves du risque"
    Et la Cour devrait répondre dans les 24-48 heures
    Et l'expulsion devrait être suspendue si accordée

  Scénario: Requête avec demande d'anonymat
    Étant donné que je suis victime de violences domestiques
    Et que je crains des représailles si mon identité est révélée
    Et que j'ai des preuves du danger
    Et que la publication pourrait me causer un préjudice grave
    Quand je demande l'anonymat dans ma requête
    Alors la demande d'anonymat devrait être motivée
    Et les preuves du risque devraient être fournies
    Et la Cour devrait examiner la demande
    Et mon identité pourrait être protégée dans les documents publics

  Scénario: Requête sans épuisement des recours pour remède inefficace
    Étant donné que je suis victime d'une violation systémique
    Et qu'il existe une jurisprudence constante défavorable
    Et que 50 cas similaires ont tous été rejetés
    Et que le recours serait manifestement inefficace
    Quand je dépose une requête sans épuiser tous les recours
    Alors je devrais expliquer pourquoi les recours sont inefficaces
    Et fournir la jurisprudence pertinente
    Et démontrer l'absence de perspective de succès
    Et la Cour pourrait accepter l'exception

  Plan du Scénario: Calcul du délai selon la date de violation
    Étant donné que la décision finale date du "<date_decision>"
    Et que la violation a eu lieu "<type_violation>"
    Et que nous sommes le "<date_actuelle>"
    Quand je vérifie le délai
    Alors le délai applicable devrait être <delai_mois> mois
    Et la requête devrait être "<statut>"
    Et il devrait rester <jours_restants> jours

    Exemples:
      | date_decision | type_violation    | date_actuelle | delai_mois | statut      | jours_restants |
      | 01/08/2024   | après février 2024| 15/11/2024   | 4          | recevable   | 15             |
      | 01/01/2024   | avant février 2024| 15/06/2024   | 6          | recevable   | 15             |
      | 01/03/2024   | après février 2024| 15/08/2024   | 4          | irrecevable | -15            |
      | 01/10/2023   | avant février 2024| 15/03/2024   | 6          | recevable   | 15             |

  Scénario: Requête avec assistance judiciaire
    Étant donné que mes revenus annuels sont de 12000 euros
    Et que je n'ai pas les moyens de payer un avocat
    Et que ma requête a des chances raisonnables de succès
    Et que j'ai fourni mes justificatifs de revenus
    Quand je demande l'assistance judiciaire
    Alors la demande devrait être examinée par la Cour
    Et je devrais remplir le formulaire d'assistance judiciaire
    Et fournir une déclaration de ressources
    Et l'assistance pourrait couvrir les frais d'avocat et de traduction

  Scénario: Vérification du statut de victime
    Étant donné que j'ai été affecté directement par une mesure étatique
    Et que j'ai subi un préjudice personnel et actuel
    Et que le préjudice est suffisamment direct
    Et que je peux le démontrer avec des preuves
    Quand ma qualité de victime est examinée
    Alors je devrais être reconnu comme victime directe
    Et ma requête devrait satisfaire l'article 34 de la Convention
    Et je devrais pouvoir demander une satisfaction équitable