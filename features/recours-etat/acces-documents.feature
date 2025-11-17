# language: fr
Fonctionnalité: Accès aux documents administratifs
  En tant que citoyen
  Je veux accéder aux documents administratifs
  Afin d'exercer mon droit à la transparence administrative

  Contexte:
    Étant donné que la publicité de l'administration est un principe constitutionnel
    Et que la loi du 11 avril 1994 organise ce droit
    Et que des exceptions existent pour protéger certains intérêts
    Et que chaque niveau de pouvoir a sa propre législation

  Scénario: Demande d'accès à mon dossier personnel
    Étant donné que l'administration détient un dossier me concernant
    Et que je veux consulter mon dossier personnel
    Quand je fais une demande d'accès
    Alors je n'ai pas besoin de justifier mon intérêt
    Et l'administration a 30 jours pour répondre
    Et je peux consulter sur place gratuitement
    Et obtenir copie moyennant paiement des frais
    Et les données de tiers doivent être occultées

  Scénario: Demande d'accès à un document d'intérêt général
    Étant donné qu'un document administratif existe
    Et qu'il ne contient pas de données personnelles
    Et qu'il n'est pas couvert par une exception
    Quand je demande l'accès à ce document
    Alors je dois identifier clairement le document
    Et l'administration doit répondre dans les 30 jours
    Et motiver tout refus ou limitation
    Et je peux obtenir copie ou consultation

  Scénario: Refus d'accès pour protection de la vie privée
    Étant donné qu'un document contient des données personnelles de tiers
    Et que ces données ne peuvent être anonymisées
    Et que je n'ai pas d'intérêt légitime particulier
    Quand l'administration examine ma demande
    Alors elle peut refuser l'accès pour protéger la vie privée
    Et elle doit motiver ce refus
    Et m'indiquer les voies de recours
    Et je peux contester devant la Commission d'accès

  Scénario: Documents préparatoires non communicables
    Étant donné qu'un document est préparatoire à une décision
    Et que la décision n'est pas encore prise
    Et que la divulgation nuirait au processus décisionnel
    Quand je demande ce document
    Alors l'administration peut refuser temporairement
    Et le document devient accessible après la décision
    Sauf si une autre exception s'applique
    Et je peux revenir après la décision finale

  Scénario: Recours à la Commission d'accès aux documents administratifs
    Étant donné que ma demande d'accès a été refusée
    Ou que l'administration n'a pas répondu dans les 30 jours
    Quand je saisis la Commission d'accès
    Alors je dois le faire dans les 60 jours
    Et fournir copie de ma demande initiale
    Et la Commission rend un avis dans les 30 jours
    Et l'administration doit suivre cet avis ou motiver

  Scénario: Demande de rectification de données incorrectes
    Étant donné qu'un document administratif contient des erreurs me concernant
    Et que ces erreurs peuvent me porter préjudice
    Quand je demande la rectification
    Alors je dois prouver l'erreur
    Et proposer la correction
    Et l'administration doit examiner ma demande
    Et soit rectifier, soit motiver son refus
    Et je peux exercer un recours si refus

  Scénario: Accès aux documents environnementaux (Convention d'Aarhus)
    Étant donné qu'un document concerne l'environnement
    Et que la Convention d'Aarhus s'applique
    Quand je demande l'accès
    Alors les règles sont plus favorables
    Et le délai de réponse est de 30 jours maximum
    Et les exceptions sont interprétées restrictivement
    Et l'intérêt public prime souvent
    Et les frais doivent rester raisonnables

  Plan du Scénario: Délais et procédures selon le niveau de pouvoir
    Étant donné que je veux accéder à un document de <niveau>
    Et que ma demande date du <date_demande>
    Et que nous sommes le <date_actuelle>
    Quand je vérifie le statut
    Alors le délai de réponse est de <delai_reponse> jours
    Et le statut devrait être <statut>

    Exemples:
      | niveau    | date_demande | date_actuelle | delai_reponse | statut           |
      | fédéral   | 2024-01-01   | 2024-01-25    | 30            | en attente       |
      | fédéral   | 2024-01-01   | 2024-02-05    | 30            | silence = refus  |
      | régional  | 2024-01-01   | 2024-01-25    | 30            | en attente       |
      | communal  | 2024-01-01   | 2024-01-20    | 30            | en attente       |
      | européen  | 2024-01-01   | 2024-01-10    | 15            | en attente       |

  Scénario: Réutilisation de documents administratifs
    Étant donné que j'ai obtenu accès à des documents
    Et que je veux les réutiliser commercialement
    Quand je demande l'autorisation de réutilisation
    Alors certaines conditions peuvent s'appliquer
    Et des redevances peuvent être demandées
    Et je dois respecter les droits d'auteur
    Et mentionner la source
    Et ne pas dénaturer l'information

  Scénario: Protection des lanceurs d'alerte
    Étant donné que j'ai connaissance d'irrégularités
    Et que je veux accéder aux documents pour les prouver
    Et que je crains des représailles
    Quand je fais ma demande
    Alors je peux demander la confidentialité
    Et invoquer la protection des lanceurs d'alerte
    Et l'administration doit protéger mon identité
    Et je peux passer par un intermédiaire
    Et des recours spécifiques existent