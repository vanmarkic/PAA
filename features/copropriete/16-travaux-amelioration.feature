# language: fr
Fonctionnalité: Travaux d'Amélioration
  En tant que copropriété
  Je veux réaliser des travaux d'amélioration
  Afin de valoriser l'immeuble

  Contexte:
    Étant donné que des améliorations sont proposées

  Scénario: Installation d'un ascenseur
    Étant donné que l'immeuble n'a pas d'ascenseur
    Et qu'un projet d'installation est proposé à 150000€
    Quand l'AG vote le projet
    Alors la majorité des 3/4 est requise
    Et la répartition des coûts suit une clé spéciale
    Et les RDC participent à 10%
    Et les étages selon coefficient progressif

  Scénario: Amélioration énergétique
    Étant donné que l'isolation est déficiente
    Et qu'un projet d'isolation coûte 80000€
    Et que des subsides de 30% sont disponibles
    Quand l'AG examine le projet
    Alors le retour sur investissement est calculé
    Et les économies d'énergie sont estimées à 20%/an
    Et la décision requiert 2/3 des voix

  Scénario: Refus d'un copropriétaire de participer
    Étant donné qu'un copropriétaire vote contre les travaux
    Mais que la majorité requise est atteinte
    Quand les travaux sont décidés
    Alors il doit quand même payer sa quote-part
    Sauf s'il prouve un préjudice excessif
    Et peut saisir le juge de paix sous 4 mois