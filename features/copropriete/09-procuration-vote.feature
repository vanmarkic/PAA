# language: fr
Fonctionnalité: Gestion des Procurations de Vote
  En tant que copropriétaire absent
  Je veux donner procuration
  Afin d'être représenté à l'AG

  Contexte:
    Étant donné qu'une AG est convoquée
    Et que je ne peux pas y assister

  Scénario: Procuration valide à un autre copropriétaire
    Étant donné que je possède 50 millièmes
    Et que je donne procuration au copropriétaire B
    Et que B possède déjà 60 millièmes
    Quand je transmets la procuration écrite
    Alors B peut voter pour 110 millièmes total
    Et la procuration est valide pour cette AG uniquement

  Scénario: Limite de procurations par mandataire
    Étant donné qu'un mandataire a déjà 2 procurations
    Et qu'il représente 90 millièmes de procurations
    Quand un 3ème copropriétaire veut lui donner procuration
    Et que cette procuration représente 15 millièmes
    Alors la procuration est refusée
    Car la limite de 3 procurations est atteinte
    Ou la limite de 10% des voix serait dépassée

  Scénario: Procuration avec instructions de vote
    Étant donné que je donne procuration avec instructions
    Et que j'indique mon vote pour chaque point
    Quand le mandataire vote
    Alors il doit respecter mes instructions
    Sauf pour les points modifiés en séance
    Et peut s'abstenir sur les points non prévus