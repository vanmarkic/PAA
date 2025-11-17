# language: fr
Fonctionnalité: Règlement d'Ordre Intérieur
  En tant que copropriété
  Je veux établir et modifier le règlement d'ordre intérieur
  Afin d'organiser la vie commune dans l'immeuble

  Contexte:
    Étant donné que la copropriété nécessite des règles de vie commune

  Scénario: Adoption du règlement initial
    Étant donné qu'aucun règlement n'existe
    Et qu'un projet est soumis à l'AG
    Quand l'AG vote à la majorité des 3/4
    Et que 760 millièmes approuvent
    Alors le règlement est adopté
    Et devient opposable à tous
    Y compris futurs acquéreurs

  Scénario: Modification d'article sur les animaux
    Étant donné que le règlement interdit les animaux
    Et qu'une demande de modification est faite
    Quand l'AG vote la modification
    Alors la majorité des 3/4 est requise
    Et la modification doit être notifiée à tous
    Et transcrite au registre des décisions

  Scénario: Sanctions pour violation du règlement
    Étant donné qu'un copropriétaire viole le règlement
    En faisant du bruit après 22h régulièrement
    Quand le syndic constate l'infraction
    Alors il peut:
      | Action | Délai |
      | Avertissement écrit | Immédiat |
      | Mise en demeure | Après 2 avertissements |
      | Convocation AG extraordinaire | Si persistance |
      | Action en justice | Sur décision AG |