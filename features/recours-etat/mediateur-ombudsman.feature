# language: fr
Fonctionnalité: Procédures devant les médiateurs et ombudsmans
  En tant que citoyen confronté à un problème avec l'administration
  Je veux saisir un médiateur ou ombudsman
  Afin d'obtenir une solution amiable et des recommandations

  Contexte:
    Étant donné que les médiateurs sont indépendants
    Et que leurs services sont gratuits
    Et qu'ils ne peuvent pas imposer de décisions
    Et qu'ils formulent des recommandations

  Scénario: Plainte au médiateur fédéral
    Étant donné que j'ai un problème avec une administration fédérale
    Et que j'ai déjà contacté l'administration concernée
    Et que je n'ai pas obtenu satisfaction
    Quand je saisis le médiateur fédéral
    Alors je peux le faire par courrier, email ou formulaire en ligne
    Et il n'y a pas de délai strict mais un délai d'un an est recommandé
    Et le médiateur examine la recevabilité
    Et il peut demander des informations à l'administration
    Et il rend un rapport avec recommandations

  Scénario: Médiateur régional wallon
    Étant donné que j'ai un différend avec la Région wallonne
    Et que cela concerne une matière régionale
    Et que les démarches préalables ont échoué
    Quand je m'adresse au médiateur wallon
    Alors ma plainte doit être écrite et signée
    Et je dois identifier clairement l'administration concernée
    Et le médiateur instruit le dossier contradictoirement
    Et il tente une conciliation
    Et il peut faire des recommandations générales

  Scénario: Médiateur communal
    Étant donné que ma commune a désigné un médiateur
    Et que j'ai un problème avec les services communaux
    Et que j'ai tenté un contact direct sans succès
    Quand je saisis le médiateur communal
    Alors la procédure suit le règlement communal
    Et le médiateur est accessible aux heures de permanence
    Et il examine les plaintes des citoyens
    Et il fait rapport au conseil communal annuellement

  Scénario: Médiateur pour les pensions
    Étant donné que j'ai un problème avec ma pension
    Et que cela concerne le SFP ou une caisse de pension
    Et que ma réclamation directe n'a pas abouti
    Quand je contacte le service de médiation pensions
    Alors je peux expliquer mon problème en français, néerlandais ou allemand
    Et le médiateur examine mon dossier pension
    Et il peut obtenir tous les documents nécessaires
    Et il propose des solutions concrètes
    Et il peut recommander des modifications de pratiques

  Scénario: Médiateur de l'énergie
    Étant donné que j'ai un litige avec mon fournisseur d'énergie
    Et que le fournisseur n'a pas résolu ma plainte en 60 jours
    Et que cela concerne l'électricité ou le gaz
    Quand je saisis le médiateur de l'énergie
    Alors ma plainte doit être recevable (écrite, identifiée, après démarche préalable)
    Et le médiateur examine le respect de la législation
    Et il peut proposer un accord amiable
    Et il peut faire des recommandations contraignantes dans certains cas
    Et le délai de traitement est de 90 jours maximum

  Scénario: Médiateur de la SNCB
    Étant donné que j'ai une plainte contre la SNCB
    Et que le service clientèle n'a pas donné suite satisfaisante
    Et que cela concerne le transport de voyageurs
    Quand je m'adresse au médiateur SNCB
    Alors je dois d'abord avoir contacté le service clientèle
    Et attendre 30 jours ou avoir un refus
    Et le médiateur examine la plainte objectivement
    Et il peut proposer des solutions équitables

  Scénario: Médiateur des assurances
    Étant donné que j'ai un litige avec mon assureur
    Et que la procédure interne de plainte a échoué
    Et que cela concerne un contrat d'assurance
    Quand je saisis l'Ombudsman des assurances
    Alors la procédure est gratuite et confidentielle
    Et je dois fournir les documents pertinents
    Et l'ombudsman examine les deux points de vue
    Et il rend un avis non contraignant
    Et les parties restent libres d'aller en justice

  Plan du Scénario: Choix du médiateur approprié
    Étant donné que j'ai un problème avec <organisme>
    Et que la matière concerne <domaine>
    Quand je cherche le médiateur compétent
    Alors je dois m'adresser au <mediateur>
    Et le délai recommandé est de <delai>

    Exemples:
      | organisme        | domaine           | mediateur                | delai        |
      | SPF Finances     | impôts            | médiateur fédéral       | 1 an         |
      | Région wallonne  | permis            | médiateur wallon        | 1 an         |
      | CPAS             | aide sociale      | médiateur fédéral       | 1 an         |
      | Proximus         | télécom           | médiateur télécom       | 1 an         |
      | Electrabel       | facture énergie   | médiateur énergie       | 1 an         |
      | commune          | taxe communale    | médiateur communal      | 6 mois       |
      | SFP              | pension           | médiateur pensions      | pas de délai |

  Scénario: Plainte irrecevable
    Étant donné que je veux saisir un médiateur
    Mais que je n'ai pas contacté l'administration d'abord
    Et que ma plainte est anonyme
    Et que l'affaire est en justice
    Quand le médiateur examine la recevabilité
    Alors ma plainte sera déclarée irrecevable
    Et le médiateur m'expliquera pourquoi
    Et il m'orientera vers la procédure appropriée
    Et je pourrai revenir après avoir rempli les conditions

  Scénario: Suivi des recommandations
    Étant donné que le médiateur a fait des recommandations
    Et que l'administration concernée a été notifiée
    Quand je vérifie le suivi
    Alors l'administration doit répondre dans un délai raisonnable
    Et expliquer si elle suit ou non les recommandations
    Et le médiateur publie un rapport annuel
    Et les recommandations non suivies y sont mentionnées
    Et le Parlement peut interpeller l'administration