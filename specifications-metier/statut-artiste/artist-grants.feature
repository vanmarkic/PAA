# language: fr
Fonctionnalité: Bourses et Subventions Artistiques
  En tant qu'artiste créateur
  Je veux accéder aux bourses disponibles
  Afin de financer mes projets artistiques

  Contexte:
    Étant donné que les bourses artistiques incluent:
      | Type de bourse            | Montant max  | Durée       |
      | Bourse de création        | 25000€       | 12 mois     |
      | Bourse de résidence       | 15000€       | 6 mois      |
      | Bourse de recherche       | 20000€       | 12 mois     |
      | Aide au projet            | 10000€       | Par projet  |
      | Bourse jeune talent       | 8000€        | 12 mois     |
      | Subvention équipement     | 5000€        | Unique      |

  Scénario: Demande de bourse de création
    Étant donné que je suis chorégraphe
    Et que j'ai un projet de création original
    Et que mon dossier est complet
    Quand je soumets ma demande de bourse
    Alors je dois fournir un budget détaillé
    Et un calendrier de création
    Et des lettres de soutien professionnel
    Et la décision est rendue sous 60 jours

  Scénario: Bourse de résidence artistique
    Étant donné que je suis plasticien
    Et que je suis sélectionné pour une résidence
    Et que la résidence dure 3 mois
    Quand je demande la bourse de résidence
    Alors le montant couvre les frais de séjour
    Et les matériaux de création
    Et une allocation mensuelle de 2000€

  Scénario: Cumul de bourses
    Étant donné que je bénéficie d'une bourse de création
    Et que je veux postuler pour une aide au projet
    Quand je vérifie les règles de cumul
    Alors certains cumuls sont interdits
    Et je dois déclarer mes autres financements
    Et le total ne peut dépasser 30000€/an

  Scénario: Bourse jeune talent (moins de 30 ans)
    Étant donné que j'ai 24 ans
    Et que c'est ma première demande
    Et que j'ai un diplôme artistique
    Quand je postule pour la bourse jeune talent
    Alors les critères sont assouplis
    Et l'accompagnement est renforcé
    Et un mentor peut être assigné

  Scénario: Justification et rapport final
    Étant donné que j'ai reçu une bourse de 15000€
    Et que le projet est terminé
    Quand je soumets mon rapport final
    Alors je dois fournir les justificatifs financiers
    Et un compte-rendu artistique
    Et des preuves de réalisation (photos, vidéos)
    Et le solde de 25% est versé après validation

  Plan du Scénario: Éligibilité selon profil
    Étant donné que je suis <profil>
    Et que mon expérience est de <années> ans
    Quand je vérifie mon éligibilité aux bourses
    Alors je suis éligible à <bourses_possibles>

    Exemples:
      | profil              | années | bourses_possibles                    |
      | artiste débutant    | 1      | jeune talent, aide projet           |
      | artiste confirmé    | 5      | création, résidence, recherche      |
      | artiste émergent    | 3      | création, aide projet, équipement   |
      | collectif artistique| 2      | aide projet, subvention structure   |