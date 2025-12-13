# language: fr
# @specification-version:1.0.0
# @legal-basis:Documentation et législation - Bail à ferme
# @legal-url:https://agriculture.wallonie.be/home/ruralite-et-foncier/foncier/foncier-agricole/louer/bail-a-ferme/legislation-et-documentation.html
# @effective-date:2025-12-13

Fonctionnalité: Bail à ferme en Wallonie
  En tant que propriétaire ou agriculteur en Wallonie
  Je veux comprendre les règles du bail à ferme
  Afin de louer ou exploiter des terres agricoles conformément à la législation

  Contexte:
    Étant donné que le bail à ferme est régi par la législation wallonne
    Et que l'Agence du foncier agricole supervise les locations de biens agricoles

  Scénario: Choix du type de bail à ferme
    Étant donné que je souhaite conclure un bail à ferme
    Quand je consulte les différents types de baux disponibles
    Alors je peux choisir parmi les options suivantes:
      | Type de bail          |
      | Bail classique        |
      | Bail de carrière      |
      | Bail de longue durée  |
      | Bail de fin de carrière |
      | Bail de courte durée  |

  Scénario: Obligation d'un écrit pour le bail à ferme
    Étant donné que je conclus un bail à ferme
    Quand le contrat est établi
    Alors un écrit est obligatoire pour formaliser le bail

  Scénario: Réalisation de l'état des lieux
    Étant donné que je conclus un bail à ferme
    Quand le bail entre en vigueur
    Alors un état des lieux doit être réalisé

  Scénario: Notification à l'Observatoire du foncier agricole
    Étant donné que je conclus un bail à ferme
    Quand le contrat est signé
    Alors je dois notifier le bail à l'Observatoire du foncier agricole

  Scénario: Enregistrement au SPF Finances
    Étant donné que je conclus un bail à ferme
    Quand le contrat est formalisé
    Alors le bail doit être enregistré au SPF Finances

  Scénario: Calcul du fermage
    Étant donné que je suis bailleur ou preneur d'un bail à ferme
    Quand je dois déterminer le montant du loyer
    Alors le fermage est calculé selon les coefficients de fermage en vigueur

  Scénario: Location de biens publics
    Étant donné que des biens agricoles publics sont mis en location
    Quand une personne publique loue des terres agricoles
    Alors des règles spécifiques de mise en location s'appliquent
    Et des contrats de gestion peuvent être conclus

  Scénario: Transmission du bail par décès du preneur
    Étant donné qu'un preneur décède
    Quand le bail est en cours
    Alors les règles de transmission du bail par décès du preneur s'appliquent

  Scénario: Transmission du bail par décès du bailleur
    Étant donné qu'un bailleur décède
    Quand le bail est en cours
    Alors les règles de transmission du bail par décès du bailleur s'appliquent

  Scénario: Cession du bail
    Étant donné que je suis preneur d'un bail à ferme
    Quand je souhaite céder mon bail
    Alors je dois respecter les règles de cession prévues par la législation

  Scénario: Aliénation des biens loués
    Étant donné que je suis bailleur d'un bien agricole
    Quand je souhaite vendre le bien loué
    Alors les règles d'aliénation des biens s'appliquent

  Scénario: Sous-location d'un bien agricole
    Étant donné que je suis preneur d'un bail à ferme
    Quand je souhaite sous-louer le bien
    Alors je dois respecter les conditions relatives aux sous-locations

  Scénario: Échange de culture
    Étant donné que je suis agriculteur
    Quand je souhaite échanger des cultures avec un autre agriculteur
    Alors je dois respecter les règles relatives aux échanges de culture

  Scénario: Contrat de culture
    Étant donné que je souhaite conclure un contrat de culture
    Quand j'établis le contrat
    Alors les dispositions spécifiques aux contrats de culture s'appliquent

  Scénario: Fin du bail de plein droit
    Étant donné qu'un bail à ferme arrive à son terme
    Quand les conditions de fin de plein droit sont remplies
    Alors le bail prend fin automatiquement

  Scénario: Résiliation amiable du bail
    Étant donné que le bailleur et le preneur sont d'accord
    Quand ils souhaitent mettre fin au bail
    Alors une résiliation amiable peut être conclue

  Scénario: Fiscalité - Impôt des personnes physiques
    Étant donné que je perçois des revenus d'un bail à ferme
    Quand je déclare mes revenus
    Alors les règles d'impôt des personnes physiques relatives au bail à ferme s'appliquent

  Scénario: Fiscalité - Droits de donation
    Étant donné que je souhaite donner un bien agricole loué
    Quand la donation est réalisée
    Alors les droits de donation spécifiques s'appliquent

  Scénario: Fiscalité - Droits de succession
    Étant donné qu'un bien agricole loué fait partie d'une succession
    Quand la succession est ouverte
    Alors les droits de succession spécifiques s'appliquent