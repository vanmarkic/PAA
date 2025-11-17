# language: fr
Fonctionnalité: Demande d'Acte de Naissance
  En tant que citoyen ou parent
  Je veux obtenir un acte de naissance
  Afin de prouver l'identité et la filiation

  Contexte:
    Étant donné que les types d'actes disponibles sont:
      | Type                    | Usage                          | Tarif |
      | Copie intégrale        | Toutes procédures             | 25€   |
      | Extrait avec filiation | Procédures administratives     | 25€   |
      | Extrait sans filiation | Usage simple                   | 25€   |
      | Extrait multilingue    | Usage international           | 30€   |

  Scénario: Déclaration de naissance d'un nouveau-né
    Étant donné qu'un enfant est né à l'hôpital
    Et que je suis le père de l'enfant
    Et que la naissance date de moins de 15 jours
    Quand je déclare la naissance à la commune
    Alors je dois fournir:
      | Document                              |
      | Attestation de naissance de l'hôpital |
      | Carte d'identité des parents         |
      | Acte de mariage ou reconnaissance    |
      | Carnet de mariage (si applicable)    |
    Et la déclaration doit être faite dans les 15 jours
    Et l'acte de naissance est gratuit à la première délivrance
    Et le prénom et nom sont enregistrés selon les règles en vigueur

  Scénario: Demande d'extrait d'acte de naissance pour passeport
    Étant donné que j'ai besoin d'un acte pour demander un passeport
    Et que je suis né en Belgique
    Et que ma commune de naissance est Bruxelles
    Quand je demande un extrait avec filiation
    Alors je peux demander:
      | Méthode            | Délai      | Procédure                   |
      | En ligne (BAEC)    | Immédiat   | Via e-guichet communal     |
      | À la commune       | Le jour même| Présentation en personne   |
      | Par courrier       | 5-10 jours | Envoi formulaire + paiement|
    Et l'acte doit dater de moins de 3 mois pour être valide
    Et le coût est de 25€

  Scénario: Demande d'acte de naissance pour enfant mineur
    Étant donné que je suis parent d'un enfant mineur
    Et que j'ai l'autorité parentale
    Quand je demande l'acte de naissance de mon enfant
    Alors je dois prouver:
      | Preuve                          |
      | Mon identité                   |
      | Ma qualité de parent           |
      | L'autorité parentale           |
    Et je peux obtenir tous les types d'extraits
    Et l'usage doit être justifié pour certaines procédures

  Scénario: Demande d'acte de naissance étranger avec transcription
    Étant donné que je suis né à l'étranger
    Et que je suis belge ou parent d'un belge
    Et que l'acte n'est pas transcrit en Belgique
    Quand je demande la transcription de mon acte étranger
    Alors je dois fournir:
      | Document                                |
      | Acte de naissance original légalisé     |
      | Traduction jurée si pas en FR/NL/DE/EN |
      | Preuve de nationalité belge            |
      | Documents d'identité                   |
    Et la procédure passe par le consulat ou le SPF Justice
    Et le délai peut être de 2 à 6 mois
    Et des vérifications d'authenticité sont effectuées

  Scénario: Rectification d'erreur sur acte de naissance
    Étant donné qu'il y a une erreur sur mon acte de naissance
    Et que l'erreur concerne l'orthographe du prénom
    Quand je demande une rectification administrative
    Alors je dois:
      | Action                                    |
      | Signaler l'erreur à l'officier d'état civil |
      | Fournir les preuves de l'erreur          |
      | Justifier la correction demandée          |
    Et si c'est une erreur matérielle évidente
    Alors la rectification est gratuite
    Et le délai est d'environ 1 mois
    Sinon une procédure judiciaire peut être nécessaire

  Scénario: Demande d'acte pour personne décédée
    Étant donné qu'une personne est décédée depuis plus de 50 ans
    Quand je demande son acte de naissance
    Alors l'acte est librement accessible
    Et aucune justification n'est requise
    Et je peux obtenir une copie intégrale
    Et le tarif reste de 25€

  Scénario: Reconnaissance paternelle/maternelle
    Étant donné qu'un enfant n'a pas de filiation paternelle établie
    Et que je veux reconnaître l'enfant comme mon enfant
    Et que la mère donne son consentement
    Quand je fais une reconnaissance
    Alors je peux le faire:
      | Moment                          | Lieu                    |
      | Avant la naissance             | Devant notaire ou commune |
      | À la déclaration de naissance  | À la commune            |
      | Après la naissance             | Devant notaire ou commune |
    Et si l'enfant a plus de 12 ans, son consentement est requis
    Et la reconnaissance est mentionnée sur l'acte de naissance

  Plan du Scénario: Délais selon le type de demande
    Étant donné que je demande un acte de naissance
    Et que j'utilise la méthode <methode>
    Quand je soumets ma demande
    Alors le délai de délivrance est <delai>

    Exemples:
      | methode          | delai        |
      | BAEC en ligne    | Immédiat     |
      | Guichet commune  | Le jour même |
      | Courrier postal  | 5-10 jours   |
      | Consulat         | 2-4 semaines |
      | Transcription    | 2-6 mois     |