# language: fr
Fonctionnalité: Permis de travail et d'études en Belgique
  En tant qu'étranger souhaitant travailler ou étudier
  Je veux obtenir les autorisations nécessaires
  Afin d'exercer une activité professionnelle ou suivre des études

  Contexte:
    Étant donné que les types de permis de travail sont:
      | Type | Description                        | Validité    |
      | A    | Illimité tous employeurs          | Illimitée   |
      | B    | Limité employeur spécifique       | 12 mois     |
      | C    | Limité changement employeur OK    | 12 mois     |
      | Unique | Permis unique travail + séjour  | Variable    |

  Scénario: Demande de permis unique pour travailleur qualifié
    Étant donné que j'ai une offre d'emploi en Belgique
    Et que le poste requiert un diplôme universitaire
    Et que j'ai les qualifications requises
    Et que le salaire annuel est de 45000€
    Et que l'employeur a fait le test du marché du travail
    Quand mon employeur demande le permis unique
    Alors la demande doit être faite à la région compétente
    Et inclure le contrat de travail
    Et le délai de traitement est de 4 mois maximum
    Et si approuvé, j'obtiens une carte A
    Et je peux commencer à travailler

  Scénario: Carte bleue européenne pour hautement qualifié
    Étant donné que j'ai un master en informatique
    Et que j'ai une offre d'emploi avec salaire de 58000€/an
    Et que c'est 1,5 fois le salaire moyen belge
    Et que le contrat est d'au moins 1 an
    Et que j'ai une assurance maladie
    Quand je demande la carte bleue européenne
    Alors les conditions sont plus favorables
    Et le délai est de 90 jours maximum
    Et j'obtiens une carte H valable 2 ans
    Et ma famille peut me rejoindre facilement
    Et après 5 ans dans l'UE, je peux demander le statut long-terme

  Scénario: Permis de travail B standard
    Étant donné que mon employeur veut m'engager
    Et que je suis cuisinier spécialisé
    Et qu'il y a pénurie de main-d'œuvre
    Et que le salaire respecte les barèmes
    Quand l'employeur demande le permis B
    Alors il doit prouver la recherche infructueuse
    Et obtenir l'autorisation d'occupation
    Et je dois obtenir le permis de travail
    Et ensuite demander le visa D
    Et le permis est lié à cet employeur

  Scénario: Permis étudiant-travailleur (20h/semaine)
    Étant donné que je suis étudiant avec carte A
    Et que je veux travailler pendant mes études
    Et que c'est maximum 20h par semaine
    Et que c'est hors vacances scolaires
    Quand je vérifie mes droits
    Alors je peux travailler sans permis supplémentaire
    Et utiliser mes 475 heures étudiant
    Et travailler temps plein pendant les vacances
    Et ne pas dépasser le plafond de revenus

  Scénario: Carte professionnelle pour indépendant
    Étant donné que je veux créer mon entreprise en Belgique
    Et que j'ai un business plan viable
    Et que j'ai les fonds nécessaires (18600€ minimum)
    Et que l'activité a une plus-value économique
    Quand je demande la carte professionnelle
    Alors je dois la demander au poste consulaire
    Et au guichet d'entreprise si déjà en Belgique
    Et fournir le plan financier
    Et prouver mes compétences de gestion
    Et si approuvée, demander un visa D indépendant

  Scénario: Inscription universitaire pour étudiant étranger
    Étant donné que je veux étudier en Belgique
    Et que j'ai un diplôme secondaire équivalent
    Et que j'ai réussi l'examen d'admission
    Et que j'ai une preuve de moyens de subsistance (730€/mois)
    Et que j'ai une assurance maladie
    Quand je demande le visa étudiant
    Alors je dois avoir l'attestation d'inscription
    Et payer les frais de scolarité
    Et fournir un certificat médical
    Et obtenir le visa D pour études
    Et m'inscrire à la commune dans les 8 jours

  Scénario: Chercheur avec convention d'accueil
    Étant donné que je suis chercheur post-doctoral
    Et qu'une université belge m'invite
    Et que j'ai une convention d'accueil approuvée
    Et que le projet est financé
    Quand je demande le permis chercheur
    Alors la procédure est accélérée
    Et je n'ai pas besoin de permis de travail B
    Et j'obtiens directement une carte A
    Et ma famille peut m'accompagner
    Et je peux enseigner accessoirement

  Scénario: Travailleur saisonnier agricole
    Étant donné que je veux travailler dans l'agriculture
    Et que c'est pour la saison des récoltes
    Et que c'est maximum 90 jours
    Et que l'employeur a l'autorisation
    Quand je demande le permis saisonnier
    Alors c'est une procédure simplifiée
    Et je dois avoir un logement fourni
    Et retourner après la saison
    Et je peux revenir l'année suivante

  Scénario: Transfert intra-entreprise (ICT)
    Étant donné que je travaille pour une multinationale
    Et que je suis transféré en Belgique
    Et que c'est un poste de manager/spécialiste
    Et que j'ai 6 mois d'ancienneté minimum
    Quand l'entreprise demande le permis ICT
    Alors je bénéficie de la directive européenne
    Et j'obtiens un permis spécifique ICT
    Et valable jusqu'à 3 ans pour managers
    Et 1 an pour stagiaires
    Et mobilité intra-UE facilitée

  Scénario: Stage professionnel rémunéré
    Étant donné que j'ai un contrat de stage
    Et que c'est dans le cadre de mes études
    Et que le stage est rémunéré
    Et qu'il dure 6 mois
    Quand je demande l'autorisation
    Alors je dois avoir une convention de stage
    Et l'approbation de l'établissement d'enseignement
    Et un permis de travail C si hors UE
    Et respecter la durée maximum de 12 mois

  Scénario: Artiste ou sportif temporaire
    Étant donné que je suis musicien professionnel
    Et que j'ai des concerts en Belgique
    Et que c'est pour 3 mois
    Et que j'ai des contrats signés
    Quand je demande le permis
    Alors c'est une procédure spécifique artistes
    Et je dois prouver ma qualité d'artiste
    Et avoir les cachets garantis
    Et obtenir un permis de travail B temporaire
    Et déclarer mes revenus en Belgique

  Plan du Scénario: Délais de traitement selon le type de permis
    Étant donné que je demande un <type_permis>
    Et que mon dossier est complet
    Quand les autorités traitent ma demande
    Alors le délai maximum devrait être <delai> jours

    Exemples:
      | type_permis           | delai |
      | permis unique        | 120   |
      | carte bleue          | 90    |
      | permis B standard    | 30    |
      | carte professionnelle| 90    |
      | visa étudiant        | 90    |
      | chercheur            | 60    |
      | ICT                  | 90    |

  Scénario: Refus de permis pour métier non en pénurie
    Étant donné que je postule comme vendeur
    Et que ce n'est pas un métier en pénurie
    Et qu'il y a des demandeurs d'emploi disponibles
    Quand l'employeur demande le permis B
    Alors la demande devrait être refusée
    Et le motif serait "main-d'œuvre disponible sur le marché"
    Et l'employeur peut faire un recours
    Et chercher un candidat européen