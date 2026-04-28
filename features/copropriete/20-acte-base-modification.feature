# language: fr
Fonctionnalité: Modification de l'Acte de Base
  En tant que copropriété
  Je veux modifier l'acte de base
  Afin d'adapter les statuts aux besoins actuels

  Contexte:
    Étant donné que l'acte de base nécessite une modification

  Scénario: Modification requérant l'unanimité
    Étant donné que la modification change la destination de l'immeuble
    De résidentiel vers mixte commercial
    Quand l'AG vote la modification
    Alors l'unanimité absolue est requise
    Soit 1000/1000 millièmes favorables
    Et aucune opposition n'est tolérée

  Scénario: Correction d'erreur matérielle
    Étant donné qu'une erreur de calcul existe dans les millièmes
    Et qu'elle est purement matérielle
    Quand la correction est proposée
    Alors la majorité des 4/5 suffit
    Et l'erreur est manifeste et documentée
    Et ne modifie pas substantiellement les droits

  Scénario: Procédure notariale de modification
    Étant donné que l'AG a voté la modification
    Quand le processus notarial commence
    Alors les étapes sont:
      | Étape | Délai | Responsable |
      | Rédaction projet acte | 30 jours | Notaire |
      | Vérification légale | 15 jours | Notaire |
      | Signature authentique | Convenu | Tous copropriétaires |
      | Transcription | 4 mois | Conservation hypothèques |
      | Publication | 15 jours | Syndic |