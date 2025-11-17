# language: fr
Fonctionnalité: Procédure de l'arrêt pilote
  En tant que CEDH face à un problème systémique
  Je veux appliquer la procédure de l'arrêt pilote
  Afin de traiter efficacement de nombreuses requêtes similaires

  Contexte:
    Étant donné que l'arrêt pilote traite les problèmes structurels
    Et qu'il peut suspendre les affaires similaires
    Et qu'il ordonne des mesures générales

  Scénario: Identification d'un problème systémique
    Étant donné que 500 requêtes concernent les conditions de détention
    Et qu'elles révèlent un problème structurel en Roumanie
    Et que le problème affecte des milliers de détenus
    Et que la législation nationale est défaillante
    Quand la Cour examine ces requêtes
    Alors elle devrait identifier le problème systémique
    Et sélectionner une ou plusieurs affaires pilotes
    Et communiquer avec le gouvernement
    Et envisager la procédure de l'arrêt pilote

  Scénario: Arrêt pilote avec mesures générales
    Étant donné qu'un arrêt pilote est rendu
    Et qu'il constate des violations systémiques de l'article 3
    Et qu'il identifie les causes structurelles
    Et que 2000 requêtes similaires sont pendantes
    Quand la Cour ordonne des mesures
    Alors elle devrait fixer des mesures générales précises
    Et établir un calendrier de mise en œuvre (18 mois)
    Et suspendre l'examen des affaires similaires
    Et prévoir un mécanisme de réparation domestique

  Scénario: Suivi de l'exécution d'un arrêt pilote
    Étant donné qu'un arrêt pilote a été rendu il y a 12 mois
    Et que l'État a soumis un plan d'action
    Et que des réformes législatives sont en cours
    Et qu'un mécanisme d'indemnisation a été créé
    Quand le Comité des Ministres supervise
    Alors il devrait évaluer les progrès réalisés
    Et vérifier l'effectivité des mesures
    Et décider de la reprise des affaires suspendues
    Et surveiller jusqu'à résolution complète

  Scénario: Échec de mise en œuvre et reprise des affaires
    Étant donné qu'un arrêt pilote fixait un délai de 2 ans
    Et que le délai est expiré sans mesures adéquates
    Et que le problème systémique persiste
    Et que les victimes n'ont pas de recours
    Quand la Cour constate l'échec
    Alors elle devrait reprendre l'examen des affaires gelées
    Et traiter les requêtes individuellement
    Et constater les violations dans chaque cas
    Et accorder des satisfactions équitables

  Plan du Scénario: Critères pour arrêt pilote
    Étant donné "<nombre>" requêtes similaires
    Et un problème de type "<type_probleme>"
    Et une origine "<origine>"
    Quand la Cour évalue la procédure pilote
    Alors la décision devrait être "<decision>"
    Et la priorité serait "<priorite>"

    Exemples:
      | nombre | type_probleme        | origine      | decision | priorite |
      | 1000   | conditions détention | législatif   | pilote   | haute    |
      | 50     | délais judiciaires   | systémique   | pilote   | moyenne  |
      | 10     | cas individuel       | ponctuel     | normale  | basse    |
      | 5000   | pensions impayées    | structurel   | pilote   | critique |