# language: fr
Fonctionnalité: Procédure devant la Grande Chambre
  En tant que partie à une affaire CEDH
  Je veux demander le renvoi devant la Grande Chambre
  Afin d'obtenir un réexamen de l'affaire par la plus haute formation

  Contexte:
    Étant donné que la Grande Chambre est composée de 17 juges
    Et qu'elle examine les affaires soulevant des questions graves
    Et que le renvoi doit être demandé dans les 3 mois

  Scénario: Demande de renvoi recevable dans le délai
    Étant donné qu'un arrêt de Chambre a été rendu le "01/09/2024"
    Et que l'arrêt soulève une question d'interprétation importante
    Et que nous sommes le "15/11/2024"
    Et que l'affaire concerne un problème systémique
    Quand je demande le renvoi en Grande Chambre
    Alors la demande devrait être dans le délai de 3 mois
    Et le collège de 5 juges devrait examiner la demande
    Et les critères d'acceptation devraient être évalués
    Et la décision devrait être rendue sans motivation

  Scénario: Dessaisissement en faveur de la Grande Chambre
    Étant donné qu'une Chambre examine mon affaire
    Et que l'affaire soulève une question grave d'interprétation
    Et qu'il pourrait y avoir contradiction avec un arrêt antérieur
    Et que les parties ne s'opposent pas au dessaisissement
    Quand la Chambre propose le dessaisissement
    Alors la Grande Chambre devrait être saisie directement
    Et aucune demande de renvoi ne serait nécessaire
    Et l'affaire serait réexaminée ab initio
    Et une audience publique pourrait être organisée

  Scénario: Audience devant la Grande Chambre
    Étant donné que mon affaire est devant la Grande Chambre
    Et qu'une audience est prévue le "01/12/2024"
    Et que j'ai préparé mes plaidoiries
    Et que des tiers intervenants participent
    Quand l'audience se tient
    Alors je devrais disposer de 30 minutes de plaidoirie
    Et pouvoir répondre aux questions des juges
    Et les tiers intervenants auraient un temps limité
    Et l'audience serait publique et retransmise

  Scénario: Arrêt définitif de la Grande Chambre
    Étant donné que la Grande Chambre a délibéré
    Et qu'elle a trouvé une violation de l'article 6
    Et qu'elle accorde 50000 euros de satisfaction équitable
    Et que l'arrêt est prononcé publiquement
    Quand l'arrêt est rendu
    Alors il devrait être définitif immédiatement
    Et aucun recours ne serait possible
    Et l'État devrait l'exécuter dans les 3 mois
    Et le Comité des Ministres superviserait l'exécution

  Plan du Scénario: Évaluation des critères de renvoi
    Étant donné qu'un arrêt de Chambre concerne "<question>"
    Et que l'impact est "<impact>"
    Et qu'il y a "<contradiction>"
    Quand le collège évalue la demande
    Alors l'acceptation devrait être "<decision>"
    Et la raison principale serait "<raison>"

    Exemples:
      | question                    | impact      | contradiction        | decision  | raison                        |
      | interprétation nouvelle     | systémique  | aucune              | acceptée  | question grave d'interprétation |
      | application standard        | individuel  | aucune              | refusée   | pas de question grave          |
      | principe fondamental        | général     | arrêt antérieur     | acceptée  | risque de contradiction        |
      | procédure habituelle        | limité      | aucune              | refusée   | importance insuffisante        |