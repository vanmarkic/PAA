# language: fr
Fonctionnalité: Droits RGPD et Protection de la Vie Privée
  En tant que citoyen concerné par le traitement de données personnelles
  Je veux exercer mes droits RGPD
  Afin de contrôler l'utilisation de mes données personnelles

  Contexte:
    Étant donné que les délais RGPD sont:
      | Type de demande        | Délai réponse | Extension possible |
      | Accès aux données     | 30 jours      | +60 jours         |
      | Rectification         | 30 jours      | +60 jours         |
      | Effacement            | 30 jours      | +60 jours         |
      | Opposition            | Immédiat      | 30 jours max      |
      | Portabilité          | 30 jours      | +60 jours         |
      | Notification breach   | 72 heures     | Non               |

  Scénario: Demande d'accès aux données personnelles
    Étant donné que je suis client d'une entreprise depuis 3 ans
    Et que l'entreprise traite mes données personnelles
    Quand je demande l'accès à mes données via le DPO
    Alors je devrais recevoir:
      | Information                           |
      | Catégories de données traitées       |
      | Finalités du traitement              |
      | Destinataires des données            |
      | Durée de conservation                |
      | Origine des données                  |
      | Existence de prise de décision automatisée |
    Et la première copie devrait être gratuite
    Et la réponse devrait arriver dans les 30 jours
    Et je peux demander le format électronique

  Scénario: Droit à l'effacement (droit à l'oubli)
    Étant donné que j'ai un compte sur un réseau social
    Et que je n'utilise plus ce service
    Et qu'il n'y a pas d'obligation légale de conservation
    Quand je demande l'effacement complet de mes données
    Alors l'entreprise devrait:
      | Action                                    |
      | Effacer mes données personnelles         |
      | Informer les sous-traitants              |
      | Cesser la diffusion des données          |
      | Informer les tiers si raisonnablement possible |
    Et confirmer l'effacement dans les 30 jours
    Et si conservation nécessaire pour:
      | Exception                          |
      | Liberté d'expression              |
      | Obligation légale                 |
      | Intérêt public santé             |
      | Archivage intérêt public         |
      | Constatation droits en justice    |

  Scénario: Rectification de données incorrectes
    Étant donné que mes données sont incorrectes dans une base de données
    Et que je peux prouver l'erreur
    Quand je demande la rectification
    Alors je dois fournir:
      | Element                          |
      | Identification précise des données |
      | Corrections à apporter           |
      | Justificatifs si nécessaire      |
    Et l'entreprise devrait rectifier dans les 30 jours
    Et informer les destinataires des données
    Et me confirmer la rectification

  Scénario: Opposition au marketing direct
    Étant donné que je reçois des emails marketing
    Et que je n'ai pas donné mon consentement explicite
    Quand je m'oppose au traitement pour marketing direct
    Alors l'opposition devrait être immédiate
    Et gratuite
    Et définitive
    Et l'entreprise ne peut plus me contacter pour du marketing

  Scénario: Demande de portabilité des données
    Étant donné que j'ai fourni des données à un service
    Et que je veux changer de fournisseur
    Quand je demande la portabilité de mes données
    Alors je devrais recevoir:
      | Format                           |
      | Données structurées             |
      | Format couramment utilisé       |
      | Lisible par machine (JSON/CSV)  |
    Et uniquement les données que j'ai fournies
    Et dans les 30 jours
    Et je peux demander le transfert direct au nouveau responsable

  Scénario: Notification de violation de données
    Étant donné qu'une entreprise a subi une fuite de données
    Et que mes données personnelles sont concernées
    Et que le risque pour mes droits est élevé
    Quand la violation est découverte
    Alors l'entreprise devrait:
      | Action                                | Délai      |
      | Notifier l'Autorité de Protection   | 72 heures  |
      | Me notifier personnellement          | Sans délai |
      | Décrire la nature de la violation    | Immédiat   |
      | Indiquer les mesures prises         | Immédiat   |
      | Fournir contact du DPO               | Immédiat   |

  Scénario: Accès aux images de vidéosurveillance
    Étant donné que j'ai été filmé dans un lieu sous vidéosurveillance
    Et que c'était il y a 15 jours
    Quand je demande l'accès aux images me concernant
    Alors je dois:
      | Requirement                        |
      | Préciser date et heure approximatives |
      | Fournir une photo pour identification |
      | Justifier un intérêt légitime        |
    Et le délai de conservation est généralement de 30 jours
    Et l'accès peut être refusé si:
      | Motif de refus                    |
      | Atteinte aux droits d'autres personnes |
      | Enquête judiciaire en cours       |
      | Secret des affaires               |

  Scénario: Copie du dossier médical
    Étant donné que j'ai été patient dans un hôpital
    Et que j'ai droit à mon dossier médical
    Quand je demande une copie de mon dossier
    Alors je devrais recevoir:
      | Contenu                         |
      | Résultats d'examens            |
      | Diagnostics                    |
      | Traitements                    |
      | Evolution                      |
      | Notes personnelles du médecin (parfois exclues) |
    Et le délai est de 15 jours maximum
    Et le coût de copie est plafonné à 25€
    Et je peux consulter gratuitement sur place

  Plan du Scénario: Exercice des droits selon le responsable
    Étant donné que le responsable du traitement est <type>
    Quand j'exerce mon droit de <droit>
    Alors le délai de réponse est <delai> jours
    Et la procédure est <procedure>

    Exemples:
      | type            | droit        | delai | procedure                |
      | entreprise      | accès        | 30    | via DPO ou formulaire   |
      | administration  | accès        | 30    | via guichet ou courrier |
      | hôpital        | accès        | 15    | service médiation       |
      | école          | rectification | 30    | via direction          |
      | police         | accès        | 30    | via COC/COL            |