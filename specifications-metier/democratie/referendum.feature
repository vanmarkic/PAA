# language: fr
Fonctionnalité: Référendums et consultations populaires
  En tant que citoyen
  Je veux participer aux référendums et consultations
  Afin d'exprimer directement mon opinion sur des questions importantes

  Contexte:
    Étant donné que les référendums sont organisés au niveau:
      | Niveau    | Type                | Quorum participation | Majorité requise |
      | Fédéral   | Constitutionnel    | 50%                  | 66.7%            |
      | Régional  | Consultatif        | 30%                  | 50.1%            |
      | Communal  | Consultation       | 10%                  | 50.1%            |

  Scénario: Organisation d'une consultation communale
    Étant donné que la commune de Liège veut consulter ses citoyens
    Et que le sujet est "Piétonnisation du centre-ville"
    Et que le conseil communal a approuvé la consultation
    Quand la consultation est organisée
    Et que la question est formulée de manière neutre
    Et que la période de vote est de 30 jours
    Alors tous les citoyens inscrits devraient être informés
    Et les modalités de vote devraient inclure:
      | Modalité       | Disponible |
      | Vote en ligne  | Oui        |
      | Vote papier    | Oui        |
      | Vote anticipé  | Oui        |
    Et le quorum minimum devrait être 10% des inscrits

  Scénario: Vote lors d'un référendum constitutionnel
    Étant donné qu'un référendum constitutionnel est organisé
    Et que je suis un citoyen belge inscrit
    Et que j'ai reçu ma convocation
    Quand je me présente au bureau de vote
    Et que je présente ma carte d'identité
    Et que je reçois mon bulletin de vote
    Alors je devrais pouvoir voter OUI ou NON
    Et mon vote devrait être secret
    Et je devrais recevoir un justificatif de participation
    Et le vote est obligatoire avec amende en cas d'absence

  Scénario: Dépouillement et validation des résultats
    Étant donné qu'une consultation populaire s'est terminée
    Et que le dépouillement commence
    Et que les résultats sont:
      | Votes OUI  | Votes NON | Blancs | Nuls | Total  |
      | 12500      | 8300      | 450    | 120  | 21370  |
    Et que le nombre d'inscrits est 85000
    Quand les résultats sont validés
    Alors le taux de participation devrait être 25.1%
    Et le quorum de 10% devrait être atteint
    Et le résultat devrait être "OUI à 60.1%"
    Et les résultats devraient être publiés sous 3 jours

  Scénario: Consultation populaire échouant au quorum
    Étant donné qu'une consultation régionale est organisée
    Et que le quorum minimum est de 30%
    Et que seulement 22% des électeurs ont participé
    Quand les résultats sont comptabilisés
    Alors la consultation devrait être déclarée "non valide"
    Et le motif devrait être "quorum de participation non atteint"
    Et les autorités peuvent décider de réorganiser

  Scénario: Initiative citoyenne déclenchant un référendum
    Étant donné qu'une initiative citoyenne a collecté 50000 signatures
    Et que cela représente 15% des électeurs de la région
    Et que le seuil légal de 10% est dépassé
    Quand l'initiative est validée par les autorités
    Alors un référendum devrait être organisé dans les 6 mois
    Et la question devrait reprendre la formulation de l'initiative
    Et une campagne d'information neutre devrait être menée

  Scénario: Campagne référendaire avec comités
    Étant donné qu'un référendum est prévu dans 2 mois
    Et que des comités de campagne sont formés
    Quand je crée un comité "Pour le OUI"
    Et que j'enregistre le comité auprès des autorités
    Alors mon comité devrait respecter:
      | Règle                      | Limite              |
      | Budget maximum             | 500.000€            |
      | Durée campagne officielle  | 30 jours            |
      | Temps d'antenne équitable  | 50% par position    |
      | Affichage public           | Espaces désignés    |
    Et toutes les dépenses doivent être déclarées

  Scénario: Vote électronique lors d'une consultation
    Étant donné qu'une consultation permet le vote électronique
    Et que j'ai activé ma eID pour le vote en ligne
    Et que la période de vote est ouverte
    Quand je me connecte à la plateforme de vote
    Et que je m'authentifie avec ma eID
    Et que je soumets mon vote
    Alors je devrais recevoir un accusé de réception
    Et mon vote devrait être anonymisé
    Et je ne devrais pas pouvoir voter à nouveau
    Et un code de vérification devrait m'être fourni

  Scénario: Contestation des résultats d'un référendum
    Étant donné qu'un référendum s'est tenu
    Et que les résultats montrent "OUI à 50.8%"
    Et que des irrégularités sont suspectées
    Quand je dépose un recours dans les 40 jours
    Et que je fournis des preuves d'irrégularités
    Alors le Conseil d'État devrait examiner le recours
    Et une enquête devrait être menée
    Et si les irrégularités sont confirmées:
      | Action possible           | Condition                     |
      | Annulation partielle      | Irrégularités localisées     |
      | Annulation totale         | Impact sur le résultat global |
      | Nouveau référendum        | Annulation confirmée          |

  Plan du Scénario: Participation selon le type de consultation
    Étant donné qu'une consultation de type <type> est organisée
    Et que je suis un <statut_citoyen>
    Et que j'ai <age> ans
    Quand je vérifie mon droit de participation
    Alors mon éligibilité devrait être "<eligible>"
    Et le vote devrait être "<obligation>"

    Exemples:
      | type             | statut_citoyen   | age | eligible | obligation  |
      | référendum       | citoyen belge    | 18  | oui      | obligatoire |
      | référendum       | citoyen belge    | 75  | oui      | facultatif  |
      | référendum       | citoyen EU       | 25  | non      | -           |
      | consultation     | citoyen belge    | 18  | oui      | facultatif  |
      | consultation     | résident local   | 21  | oui      | facultatif  |
      | consultation     | citoyen belge    | 16  | non      | -           |

  Scénario: Budget participatif communal
    Étant donné que la commune alloue 100.000€ au budget participatif
    Et que les citoyens peuvent proposer des projets
    Et que j'ai soumis un projet "Aire de jeux inclusive"
    Quand la phase de vote commence
    Et que chaque citoyen a 3 votes à distribuer
    Et que mon projet reçoit 850 votes
    Et qu'il arrive en 2ème position
    Alors mon projet devrait être retenu pour financement
    Et le budget alloué devrait être proportionnel aux votes
    Et la mise en œuvre devrait commencer dans l'année