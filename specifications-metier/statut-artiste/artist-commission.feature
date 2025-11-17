# language: fr
Fonctionnalité: Commission des Artistes
  En tant qu'artiste demandeur
  Je veux comprendre le rôle de la Commission
  Afin de faire valoir mes droits correctement

  Contexte:
    Étant donné que la Commission des Artistes:
      | Compétence                    | Description                           |
      | Attestation artiste           | Délivrance du visa artiste          |
      | Carte artiste                 | Validation statut professionnel      |
      | Litiges                       | Médiation employeur-artiste         |
      | Avis consultatifs            | Interprétation législation          |
      | Délai de traitement          | 30 jours ouvrables                  |

  Scénario: Demande de visa artiste
    Étant donné que je suis artiste débutant
    Et que j'ai des preuves de formations artistiques
    Et que j'ai des contrats signés
    Quand je soumets ma demande de visa
    Alors la Commission examine mes qualifications
    Et vérifie le caractère artistique de mes activités
    Et rend sa décision sous 30 jours

  Scénario: Renouvellement de carte artiste
    Étant donné que ma carte artiste expire
    Et que j'ai presté 100 jours l'année passée
    Et que mes revenus artistiques sont de 15000€
    Quand je demande le renouvellement
    Alors la Commission vérifie la continuité
    Et valide mes nouvelles prestations
    Et renouvelle pour 5 ans si conditions remplies

  Scénario: Contestation de refus
    Étant donné que ma demande a été refusée
    Et que je conteste la décision
    Et que j'ai de nouveaux éléments
    Quand je fais appel
    Alors je dispose de 30 jours pour contester
    Et je peux demander une audition
    Et la Commission réexamine mon dossier

  Scénario: Médiation avec employeur
    Étant donné qu'un litige existe avec un théâtre
    Et que mes cachets ne sont pas payés
    Et que j'ai saisi la Commission
    Quand la médiation commence
    Alors la Commission convoque les parties
    Et propose une solution amiable
    Et peut émettre un avis contraignant

  Scénario: Artiste étranger - reconnaissance
    Étant donné que je suis artiste européen
    Et que j'ai un statut reconnu dans mon pays
    Et que je veux travailler en Belgique
    Quand je demande la reconnaissance
    Alors la Commission vérifie l'équivalence
    Et peut accorder une reconnaissance temporaire
    Ou demander des preuves supplémentaires