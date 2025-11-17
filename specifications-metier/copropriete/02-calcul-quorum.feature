# language: fr
Fonctionnalité: Calcul du Quorum pour Assemblée Générale
  En tant que président de séance
  Je veux calculer le quorum atteint
  Afin de valider les décisions de l'assemblée

  Contexte:
    Étant donné que la copropriété totalise 1000 millièmes
    Et que l'assemblée générale est en cours

  Scénario: Quorum atteint pour décision majoritaire
    Étant donné que 520 millièmes sont présents
    Et que 180 millièmes sont représentés
    Quand je calcule le quorum
    Alors le quorum de 50% est atteint
    Et l'assemblée peut délibérer valablement

  Scénario: Quorum insuffisant première convocation
    Étant donné que seulement 400 millièmes sont présents ou représentés
    Quand je vérifie le quorum pour une décision aux 2/3
    Alors le quorum n'est pas atteint
    Et une seconde convocation est nécessaire

  Plan du Scénario: Calcul quorum selon type de décision
    Étant donné que <milliemes_presents> millièmes sont présents/représentés
    Quand je vérifie le quorum pour <type_decision>
    Alors le quorum est <resultat>

    Exemples:
      | milliemes_presents | type_decision | resultat |
      | 510 | majorité simple | atteint |
      | 490 | majorité simple | non atteint |
      | 667 | deux tiers | atteint |
      | 750 | trois quarts | atteint |
      | 800 | quatre cinquièmes | atteint |