# language: fr
Fonctionnalité: Conversion de texte juridique en langage courant
  En tant qu'utilisateur sans formation juridique
  Je veux comprendre les textes légaux
  Afin de connaître mes droits

  Scénario: Conversion basique d'un article du code civil
    Étant donné le texte juridique suivant:
      """
      Tout fait quelconque de l'homme, qui cause à autrui un dommage,
      oblige celui par la faute duquel il est arrivé à le réparer.
      """
    Quand je demande une conversion en niveau "simple"
    Alors le texte converti devrait contenir "causez un dommage"
    Et le texte converti devrait contenir "réparer"
    Et le score de lisibilité devrait être supérieur à 80

  Scénario: Conversion avec exemples pratiques
    Étant donné le texte juridique suivant:
      """
      Tout fait quelconque de l'homme, qui cause à autrui un dommage,
      oblige celui par la faute duquel il est arrivé à le réparer.
      """
    Quand je demande une conversion en niveau "exemples"
    Alors le résultat devrait contenir des exemples pratiques
    Et les exemples devraient inclure "vélo" ou "chien" ou "voiture"
    Et chaque exemple devrait avoir une conséquence claire

  Scénario: Conversion pour optimiseur social
    Étant donné le texte juridique suivant:
      """
      Le travailleur à temps partiel avec maintien des droits peut prétendre
      à une allocation de garantie de revenus si sa rémunération mensuelle brute
      est inférieure au revenu minimum mensuel garanti
      """
    Quand je demande une conversion pour "optimiseur"
    Alors le résultat devrait être un objet structuré
    Et il devrait contenir un "rule_id"
    Et il devrait contenir des "conditions" vérifiables
    Et il devrait contenir un "benefit" avec calcul
    Et il devrait contenir des règles de "cumul"

  Scénario: Détection d'ambiguïté juridique
    Étant donné un texte juridique ambigu
    Quand je demande une conversion
    Alors le système devrait détecter l'ambiguïté
    Et proposer plusieurs interprétations possibles
    Et recommander "Vérifier avec votre CPAS local"
    Et indiquer le niveau de risque

  Scénario: Validation sémantique échoue
    Étant donné un texte juridique complexe
    Et que la première conversion contient des erreurs sémantiques
    Quand le validateur détecte les erreurs
    Alors le système devrait régénérer avec des contraintes
    Et le nouveau texte devrait passer la validation
    Et le nombre de tentatives devrait être tracé

  Plan du Scénario: Niveaux de conversion multiples
    Étant donné un article de loi standard
    Quand je demande une conversion en niveau "<niveau>"
    Alors la complexité linguistique devrait être "<complexité>"
    Et le public cible devrait être "<public>"
    Et le temps de lecture devrait être "<temps>"

    Exemples:
      | niveau    | complexité | public                  | temps   |
      | simple    | faible     | tout public             | < 30s   |
      | détaillé  | moyenne    | bénéficiaires motivés   | 1-2min  |
      | exemples  | faible     | tout public             | 2-3min  |
      | warnings  | moyenne    | personnes à risque      | < 1min  |
