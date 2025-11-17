# language: fr
Fonctionnalité: Demande de révision d'un arrêt CEDH
  En tant que partie à un arrêt définitif
  Je veux demander la révision de l'arrêt
  Afin de faire prendre en compte un fait nouveau décisif

  Contexte:
    Étant donné que la révision est exceptionnelle (Règle 80)
    Et qu'un fait nouveau décisif doit être découvert
    Et que ce fait était inconnu lors de l'arrêt

  Scénario: Découverte d'un document falsifié
    Étant donné qu'un arrêt a été rendu il y a 2 ans
    Et qu'un document clé était falsifié
    Et que la falsification vient d'être prouvée
    Et que ce document était déterminant
    Quand je demande la révision
    Alors je devrais fournir la preuve de falsification
    Et expliquer pourquoi c'était impossible à découvrir avant
    Et démontrer l'impact sur l'arrêt
    Et respecter le délai de 6 mois depuis la découverte

  Scénario: Témoin ayant menti sous serment
    Étant donné qu'un témoin clé a été condamné pour faux témoignage
    Et que son témoignage était crucial dans l'affaire
    Et que la condamnation date d'il y a 3 mois
    Et que cela change fondamentalement les faits
    Quand je soumets la demande de révision
    Alors je devrais joindre le jugement pénal
    Et expliquer l'importance du témoignage
    Et démontrer qu'un arrêt différent aurait été rendu
    Et la Cour devrait examiner la demande

  Scénario: Fait nouveau sans impact décisif
    Étant donné qu'un nouveau document a été trouvé
    Et qu'il apporte des précisions mineures
    Et qu'il ne change pas l'essence de l'affaire
    Et que les violations resteraient établies
    Quand j'évalue la pertinence pour révision
    Alors la demande ne devrait pas être recevable
    Et le fait ne serait pas considéré comme décisif
    Et la procédure normale resterait close