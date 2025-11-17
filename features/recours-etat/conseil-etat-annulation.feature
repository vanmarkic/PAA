# language: fr
Fonctionnalité: Recours en annulation au Conseil d'État
  En tant que citoyen ou personne morale
  Je veux introduire un recours en annulation contre un acte administratif
  Afin d'obtenir l'annulation d'une décision illégale

  Contexte:
    Étant donné que le délai de recours est de 60 jours
    Et que le droit de timbre est de 200€
    Et que le Conseil d'État est compétent pour les actes administratifs
    Et que l'intérêt à agir doit être démontré

  Scénario: Recours dans les délais avec intérêt direct
    Étant donné que j'ai reçu une décision de refus de permis d'urbanisme
    Et que la notification date du "2024-01-15"
    Et que nous sommes le "2024-02-20"
    Et que je suis propriétaire du terrain concerné
    Et que j'ai un intérêt direct et personnel
    Quand je vérifie l'admissibilité de mon recours
    Alors le recours devrait être admissible
    Et le délai restant devrait être de 25 jours
    Et les frais de procédure devraient être de 200€
    Et je devrais pouvoir demander la suspension en même temps

  Scénario: Recours avec demande de suspension en extrême urgence
    Étant donné que j'ai reçu un ordre de démolition
    Et que l'exécution est prévue dans 5 jours
    Et que la démolition causerait un préjudice grave et irréparable
    Quand je vérifie les conditions d'extrême urgence
    Alors je devrais pouvoir introduire un recours en extrême urgence
    Et les frais devraient être de 400€
    Et l'audience devrait être fixée dans les 3 jours
    Et je dois démontrer l'imminence du péril

  Scénario: Recours hors délai
    Étant donné que j'ai reçu une décision défavorable
    Et que la notification date du "2024-01-01"
    Et que nous sommes le "2024-04-15"
    Quand je vérifie l'admissibilité de mon recours
    Alors le recours ne devrait pas être admissible
    Et le motif devrait être "délai de recours dépassé (60 jours)"
    Et je devrais vérifier si un cas de force majeure s'applique

  Scénario: Recours sans intérêt à agir
    Étant donné qu'une décision administrative a été prise
    Et que cette décision ne me concerne pas directement
    Et que je n'ai pas d'intérêt personnel et actuel
    Quand je vérifie l'admissibilité de mon recours
    Alors le recours ne devrait pas être admissible
    Et le motif devrait être "absence d'intérêt à agir"
    Et je devrais vérifier si une action collective est possible

  Scénario: Association avec intérêt collectif
    Étant donné que je représente une association environnementale
    Et que nos statuts prévoient la défense de l'environnement depuis plus de 3 ans
    Et qu'une décision autorise un projet polluant
    Et que ce projet affecte notre objet social
    Quand je vérifie notre capacité à agir
    Alors l'association devrait avoir intérêt à agir
    Et nous devrions fournir nos statuts publiés au Moniteur Belge
    Et nous devrions prouver notre activité effective

  Scénario: Recours contre un règlement communal
    Étant donné qu'un règlement communal a été adopté
    Et que ce règlement impose des taxes illégales
    Et que je suis contribuable de la commune
    Quand j'introduis un recours en annulation
    Alors le délai devrait être de 60 jours à partir de la publication
    Et je dois attaquer le règlement dans son ensemble
    Et je peux demander la suspension si urgence

  Scénario: Recours avec aide juridique
    Étant donné que mes revenus sont inférieurs au seuil
    Et que je souhaite contester une décision administrative
    Et que je n'ai pas les moyens de payer les frais
    Quand je demande l'aide juridique
    Alors je devrais pouvoir bénéficier du pro deo
    Et les frais de procédure pourraient être réduits ou supprimés
    Et je dois fournir une attestation de revenus

  Plan du Scénario: Calcul des délais selon le type de notification
    Étant donné que j'ai reçu une décision le <date_notification>
    Et que la notification s'est faite par <mode>
    Et que nous sommes le <date_actuelle>
    Quand je calcule le délai de recours
    Alors le délai devrait <etre_expire>
    Et il devrait rester <jours_restants> jours

    Exemples:
      | date_notification | mode          | date_actuelle | etre_expire    | jours_restants |
      | 2024-01-01       | recommandé    | 2024-02-15    | ne pas expirer | 15             |
      | 2024-01-01       | main propre   | 2024-02-15    | ne pas expirer | 15             |
      | 2024-01-01       | publication   | 2024-03-15    | expirer        | 0              |
      | 2024-01-15       | recommandé    | 2024-03-10    | ne pas expirer | 5              |

  Scénario: Moyens d'annulation à invoquer
    Étant donné que je conteste une décision administrative
    Quand je rédige ma requête
    Alors je dois invoquer au moins un des moyens suivants:
      | Moyen                      | Description                                           |
      | Incompétence               | L'autorité n'avait pas le pouvoir de prendre l'acte |
      | Vice de forme              | Les formes substantielles n'ont pas été respectées  |
      | Violation de la loi        | L'acte viole une norme supérieure                   |
      | Détournement de pouvoir    | L'acte poursuit un but autre que l'intérêt général  |
      | Erreur manifeste           | Appréciation manifestement déraisonnable des faits  |
      | Défaut de motivation       | L'acte n'est pas motivé formellement                |
    Et chaque moyen doit être développé et étayé
    Et je dois citer les dispositions légales violées

  Scénario: Constitution du dossier administratif
    Étant donné qu'un recours est introduit
    Quand l'administration est notifiée
    Alors elle doit transmettre le dossier administratif dans les 30 jours
    Et le dossier doit contenir toutes les pièces
    Et je peux demander des pièces manquantes
    Et l'absence de transmission peut entraîner l'annulation