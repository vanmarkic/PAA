# language: fr
Fonctionnalité: Vote des Résolutions en Assemblée Générale
  En tant que copropriétaire
  Je veux voter sur les résolutions proposées
  Afin d'exercer mes droits dans la copropriété

  Contexte:
    Étant donné que l'AG est en cours avec quorum atteint
    Et que je possède 85 millièmes

  Scénario: Vote pour travaux d'entretien ordinaire
    Étant donné que les travaux coûtent 5000€
    Et qu'ils nécessitent une majorité simple
    Quand 520 millièmes votent pour et 300 contre
    Alors la résolution est adoptée
    Et les travaux sont approuvés

  Scénario: Vote pour modification du règlement
    Étant donné que la modification nécessite les 3/4 des voix
    Quand 760 millièmes votent pour
    Et 240 millièmes votent contre
    Alors la résolution est adoptée à 76%
    Et le règlement est modifié

  Scénario: Rejet d'une résolution nécessitant l'unanimité
    Étant donné que la vente d'une partie commune nécessite l'unanimité
    Quand 980 millièmes votent pour
    Et 20 millièmes votent contre
    Alors la résolution est rejetée
    Et le motif est "unanimité requise non atteinte"