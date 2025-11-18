# language: fr
# @specification-version:1.0.0
# @legal-basis:Loi du 26 mai 2002 concernant le droit à l'intégration sociale
# @legal-url:https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language
# @effective-date:2024-01-01

Fonctionnalité: Droit à l'intégration sociale en Belgique
  En tant que citoyen résidant en Belgique
  Je veux vérifier mon éligibilité au revenu d'intégration sociale
  Afin de bénéficier d'une aide financière si je remplis les conditions

  Contexte:
    Étant donné que la loi du 26 mai 2002 définit les conditions d'accès au droit à l'intégration sociale

  Scénario: Éligibilité basée sur la nationalité belge
    Étant donné que je suis de nationalité belge
    Et que j'ai ma résidence effective en Belgique
    Et que j'ai atteint l'âge de la majorité
    Et que je ne dispose pas de ressources suffisantes
    Et que je ne peux pas y prétendre
    Et que je ne suis pas en mesure de me les procurer par mes efforts personnels ou par d'autres moyens
    Quand je fais une demande de revenu d'intégration sociale
    Alors j'ai droit à l'intégration sociale

  Scénario: Éligibilité pour citoyen de l'Union européenne
    Étant donné que je suis citoyen de l'Union européenne
    Et que j'ai ma résidence effective en Belgique
    Et que je bénéficie d'un droit de séjour de plus de trois mois
    Et que j'ai atteint l'âge de la majorité
    Et que je ne dispose pas de ressources suffisantes
    Quand je fais une demande de revenu d'intégration sociale
    Alors j'ai droit à l'intégration sociale

  Scénario: Éligibilité pour étranger inscrit au registre de la population
    Étant donné que je suis étranger inscrit au registre de la population
    Et que j'ai ma résidence effective en Belgique
    Et que j'ai atteint l'âge de la majorité
    Et que je ne dispose pas de ressources suffisantes
    Quand je fais une demande de revenu d'intégration sociale
    Alors j'ai droit à l'intégration sociale

  Scénario: Éligibilité pour réfugié reconnu
    Étant donné que je suis reconnu réfugié en Belgique
    Et que j'ai ma résidence effective en Belgique
    Et que j'ai atteint l'âge de la majorité
    Et que je ne dispose pas de ressources suffisantes
    Quand je fais une demande de revenu d'intégration sociale
    Alors j'ai droit à l'intégration sociale

  Scénario: Éligibilité pour bénéficiaire de protection subsidiaire
    Étant donné que je bénéficie de la protection subsidiaire
    Et que j'ai ma résidence effective en Belgique
    Et que j'ai atteint l'âge de la majorité
    Et que je ne dispose pas de ressources suffisantes
    Quand je fais une demande de revenu d'intégration sociale
    Alors j'ai droit à l'intégration sociale

  Scénario: Condition de disposition au travail
    Étant donné que je suis éligible au droit à l'intégration sociale
    Et que je suis apte au travail
    Quand je fais une demande de revenu d'intégration sociale
    Alors je dois être disposé à travailler
    Et je dois prouver ma disposition au travail

  Scénario: Exemption de disposition au travail pour raisons de santé
    Étant donné que je suis éligible au droit à l'intégration sociale
    Et que des raisons de santé m'empêchent de travailler
    Quand je fais une demande de revenu d'intégration sociale
    Alors je suis exempté de la condition de disposition au travail

  Scénario: Exemption de disposition au travail pour raisons d'équité
    Étant donné que je suis éligible au droit à l'intégration sociale
    Et que des raisons d'équité justifient une exemption
    Quand je fais une demande de revenu d'intégration sociale
    Alors je peux être exempté de la condition de disposition au travail