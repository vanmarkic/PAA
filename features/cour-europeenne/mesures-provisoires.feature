# language: fr
Fonctionnalité: Mesures provisoires (Règle 39)
  En tant que personne face à un danger imminent et irréversible
  Je veux demander des mesures provisoires à la CEDH
  Afin d'empêcher une violation grave de mes droits fondamentaux

  Contexte:
    Étant donné que les mesures provisoires sont exceptionnelles
    Et qu'elles ne sont accordées que si le risque est imminent
    Et que le préjudice serait irréversible

  Scénario: Demande urgente d'empêcher une expulsion
    Étant donné que je dois être expulsé vers la Syrie demain
    Et que je risque la torture ou la mort dans ce pays
    Et que j'ai des preuves de persécutions antérieures
    Et que j'ai été condamné à mort par contumace
    Quand je demande des mesures provisoires d'urgence
    Alors la demande devrait être traitée immédiatement
    Et je devrais fournir "identité, date d'expulsion, preuves du risque"
    Et la Cour devrait suspendre l'expulsion si accordée
    Et l'État devrait être notifié immédiatement

  Scénario: Mesures provisoires pour traitement médical vital
    Étant donné que je suis détenu avec un cancer en phase terminale
    Et que les autorités refusent le traitement médical nécessaire
    Et que mon état se détériore rapidement
    Et que le médecin confirme un risque vital imminent
    Quand je demande des mesures provisoires médicales
    Alors la demande devrait être prioritaire
    Et inclure "rapports médicaux, correspondances avec l'administration"
    Et demander l'accès immédiat aux soins
    Et la Cour pourrait ordonner le transfert médical

  Scénario: Refus de mesures provisoires - pas de risque imminent
    Étant donné que je conteste une décision de justice
    Et que la décision me cause un préjudice financier
    Et qu'il n'y a pas de risque pour ma vie ou intégrité
    Et que le préjudice pourrait être compensé financièrement
    Quand je demande des mesures provisoires
    Alors la demande devrait être refusée
    Et le motif serait "absence de risque imminent et irréversible"
    Et je devrais poursuivre la procédure normale
    Et demander une satisfaction équitable ultérieurement

  Scénario: Protection d'un témoin dans une affaire de violation
    Étant donné que je suis témoin clé dans une affaire de torture
    Et que j'ai reçu des menaces de mort
    Et que deux autres témoins ont déjà disparu
    Et que la police refuse de me protéger
    Quand je demande des mesures de protection
    Alors la Cour devrait examiner le danger
    Et pourrait demander à l'État de garantir ma sécurité
    Et des mesures de protection devraient être mises en place
    Et mon témoignage pourrait être recueilli sous protection

  Plan du Scénario: Évaluation de l'urgence selon le délai
    Étant donné qu'une mesure est prévue dans <delai>
    Et que le risque est de type "<type_risque>"
    Et que le préjudice serait "<nature_prejudice>"
    Quand j'évalue l'urgence
    Alors le niveau d'urgence devrait être "<niveau>"
    Et la procédure devrait être "<procedure>"
    Et la réponse attendue dans "<reponse>"

    Exemples:
      | delai     | type_risque        | nature_prejudice | niveau    | procedure        | reponse    |
      | 24 heures | expulsion/torture  | irréversible    | critique  | ultra-prioritaire| 6 heures   |
      | 48 heures | exécution          | irréversible    | critique  | ultra-prioritaire| 12 heures  |
      | 1 semaine | transfert prison   | potentiellement grave | élevé | prioritaire  | 48 heures  |
      | 1 mois    | démolition maison  | réparable       | modéré    | normale         | 1 semaine  |