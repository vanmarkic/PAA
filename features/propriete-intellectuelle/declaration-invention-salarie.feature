# language: fr
Fonctionnalité: Déclaration d'invention de salarié
  En tant que salarié inventeur
  Je dois déclarer mon invention à mon employeur
  Afin de déterminer les droits respectifs

  Contexte:
    Étant donné que la loi régit les inventions de salariés
    Et que trois catégories existent
    Et que la déclaration est obligatoire

  Scénario: Invention de mission appartenant à l'employeur
    Étant donné que j'ai inventé dans le cadre de ma mission
    Et que mon contrat prévoit une mission inventive
    Quand je déclare l'invention à mon employeur
    Alors l'invention appartient à l'employeur
    Et j'ai droit à une rémunération supplémentaire
    Selon les conventions collectives ou contrat

  Scénario: Invention hors mission attribuable
    Étant donné que j'ai inventé hors de ma mission
    Mais en utilisant les moyens de l'entreprise
    Quand je déclare l'invention
    Alors l'employeur peut revendiquer l'attribution
    Dans un délai de 4 mois
    Et me verser un juste prix

  Scénario: Invention libre du salarié
    Étant donné que mon invention est hors mission
    Et sans lien avec l'entreprise
    Quand je la déclare par précaution
    Alors l'employeur confirme mon entière propriété
    Et je peux l'exploiter librement