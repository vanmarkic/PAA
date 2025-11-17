# language: fr
Fonctionnalité: Pétitions et initiatives citoyennes
  En tant que citoyen engagé
  Je veux créer et signer des pétitions
  Afin de faire entendre ma voix démocratiquement

  Contexte:
    Étant donné que les seuils de signatures sont:
      | Niveau    | Signatures requises | Délai      |
      | Fédéral   | 25000              | 12 mois    |
      | Régional  | 15000              | 9 mois     |
      | Communal  | 100-5000           | 6 mois     |
      | Européen  | 1000000            | 12 mois    |

  Scénario: Création d'une pétition communale
    Étant donné que je suis un citoyen belge
    Et que j'ai 21 ans
    Et que je réside à Liège
    Et que je veux créer une pétition pour "Plus de pistes cyclables"
    Quand je soumets ma pétition communale
    Et que je fournis une description détaillée
    Et que je définis l'objectif à 500 signatures
    Et que je fixe la date de clôture dans 6 mois
    Alors la pétition devrait être enregistrée
    Et elle devrait recevoir un numéro d'enregistrement
    Et elle devrait être publiée sur la plateforme officielle
    Et je devrais être désigné comme organisateur principal

  Scénario: Signature d'une pétition avec vérification
    Étant donné qu'une pétition "Réduction de la vitesse en ville" existe
    Et que la pétition a déjà 1234 signatures vérifiées
    Et que je suis un résident de la commune concernée
    Et que j'ai 18 ans ou plus
    Quand je signe la pétition avec mon eID
    Et que je confirme mon identité
    Alors ma signature devrait être enregistrée
    Et ma signature devrait être marquée "à vérifier"
    Et le système devrait vérifier mon éligibilité
    Et si je suis éligible, ma signature devient "vérifiée"
    Et le compteur devrait passer à 1235 signatures vérifiées

  Scénario: Pétition atteignant le seuil requis
    Étant donné qu'une pétition communale existe
    Et que l'objectif est de 500 signatures
    Et que la pétition a actuellement 499 signatures vérifiées
    Quand j'ajoute ma signature vérifiée
    Alors le seuil devrait être atteint
    Et l'organisateur devrait être notifié
    Et la commune devrait être notifiée automatiquement
    Et la pétition devrait passer au statut "soumise aux autorités"
    Et un délai de réponse de 3 mois devrait commencer

  Scénario: Initiative citoyenne européenne
    Étant donné que je veux lancer une initiative citoyenne européenne
    Et que j'ai formé un comité de 7 citoyens de pays différents
    Et que le sujet concerne "La protection des abeilles en Europe"
    Quand j'enregistre l'initiative
    Et que je fournis les traductions en FR, NL, DE et EN
    Et que la Commission européenne valide la recevabilité
    Alors l'initiative devrait être publiée
    Et nous devrions avoir 12 mois pour collecter 1 million de signatures
    Et les signatures doivent venir d'au moins 7 pays membres
    Et chaque pays a un seuil minimum de signatures

  Scénario: Tentative de double signature
    Étant donné qu'une pétition "Transport gratuit" existe
    Et que j'ai déjà signé cette pétition il y a 2 semaines
    Quand je tente de signer à nouveau
    Alors le système devrait détecter la double signature
    Et ma nouvelle signature devrait être rejetée
    Et le motif devrait être "Vous avez déjà signé cette pétition"
    Et le compteur de signatures ne devrait pas changer

  Scénario: Pétition expirée sans atteindre le seuil
    Étant donné qu'une pétition régionale existe depuis 9 mois
    Et que l'objectif était de 15000 signatures
    Et qu'elle n'a collecté que 8500 signatures
    Quand la date de clôture arrive
    Alors la pétition devrait être fermée automatiquement
    Et le statut devrait passer à "échec - seuil non atteint"
    Et l'organisateur devrait recevoir un rapport final
    Et les signataires devraient être informés du résultat

  Scénario: Réponse des autorités à une pétition réussie
    Étant donné qu'une pétition a atteint 2000 signatures
    Et qu'elle a été soumise au conseil communal il y a 2 mois
    Quand le conseil communal examine la pétition
    Et qu'il décide d'accepter partiellement les demandes
    Alors une réponse officielle devrait être publiée
    Et la réponse devrait inclure:
      | Élément                   | Contenu                                    |
      | Décision                  | Acceptation partielle                     |
      | Actions prévues           | Étude de faisabilité, consultation        |
      | Délai de mise en œuvre    | 18 mois                                    |
      | Budget alloué             | 50.000€                                    |
    Et tous les signataires devraient être notifiés

  Scénario: Pétition frauduleuse avec fausses signatures
    Étant donné qu'une pétition prétend avoir 5000 signatures
    Et que des doutes sont soulevés sur l'authenticité
    Quand l'audit des signatures est effectué
    Et que 2000 signatures sont identifiées comme frauduleuses
    Alors ces signatures devraient être invalidées
    Et le compteur devrait être corrigé à 3000 signatures valides
    Et l'organisateur devrait recevoir un avertissement
    Et en cas de fraude intentionnelle, des poursuites peuvent être engagées

  Plan du Scénario: Éligibilité à signer selon le type de pétition
    Étant donné que je suis un <statut>
    Et que j'ai <age> ans
    Et qu'une pétition de niveau <niveau> existe
    Quand je vérifie si je peux signer
    Alors mon éligibilité devrait être "<eligible>"
    Et le motif devrait être "<raison>"

    Exemples:
      | statut          | age | niveau    | eligible | raison                                    |
      | citoyen belge   | 18  | fédéral   | oui      | Citoyen majeur éligible                  |
      | citoyen belge   | 16  | communal  | oui      | Âge minimum 16 ans pour pétitions locales |
      | citoyen belge   | 15  | communal  | non      | Âge minimum non atteint                  |
      | citoyen EU      | 25  | européen  | oui      | Citoyen européen éligible                |
      | citoyen EU      | 20  | fédéral   | non      | Réservé aux citoyens belges              |
      | résident non-EU | 30  | communal  | oui      | Résident local éligible                  |
      | résident non-EU | 30  | fédéral   | non      | Réservé aux citoyens belges              |

  Scénario: Transformation d'une pétition en référendum
    Étant donné qu'une pétition communale a collecté 10000 signatures
    Et que cela représente plus de 10% des électeurs inscrits
    Et que le sujet est éligible pour un référendum
    Quand le conseil communal examine la pétition
    Alors il peut décider d'organiser une consultation populaire
    Et tous les citoyens inscrits pourront voter
    Et le résultat sera contraignant si le quorum est atteint