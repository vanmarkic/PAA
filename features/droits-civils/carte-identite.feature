# language: fr
Fonctionnalité: Demande de Carte d'Identité Belge
  En tant que citoyen belge ou résident
  Je veux demander ou renouveler ma carte d'identité
  Afin d'avoir un document d'identité valide

  Contexte:
    Étant donné que les tarifs 2024 sont:
      | Type de procédure    | Tarif    | Délai        |
      | Normale             | 20€      | 7 jours      |
      | Urgente             | 90€      | 2 jours      |
      | Très urgente        | 135€     | 24 heures    |
    Et que la validité est de:
      | Age                 | Durée validité |
      | Moins de 18 ans    | 5 ans          |
      | 18 ans et plus     | 10 ans         |

  Scénario: Première demande de carte d'identité pour un adulte belge
    Étant donné que je suis un citoyen belge
    Et que j'ai 25 ans
    Et que je n'ai jamais eu de carte d'identité
    Et que je fournis tous les documents requis:
      | Document                    |
      | Photo d'identité récente   |
      | Acte de naissance          |
      | Certificat de résidence    |
    Quand je demande ma première carte d'identité
    Alors ma demande devrait être acceptée
    Et la validité devrait être de 10 ans
    Et le coût devrait être de 20€
    Et le délai de production devrait être de 7 jours

  Scénario: Renouvellement de carte d'identité expirée
    Étant donné que je suis un citoyen belge
    Et que j'ai 35 ans
    Et que ma carte d'identité expire dans 15 jours
    Quand je demande le renouvellement de ma carte
    Alors ma demande devrait être acceptée
    Et la validité devrait être de 10 ans
    Et je devrais pouvoir choisir entre:
      | Procédure    | Tarif | Délai    |
      | Normale      | 20€   | 7 jours  |
      | Urgente      | 90€   | 2 jours  |

  Scénario: Remplacement de carte d'identité volée avec procédure urgente
    Étant donné que je suis un citoyen belge
    Et que ma carte d'identité a été volée
    Et que j'ai fait une déclaration à la police
    Et que j'ai besoin d'un document rapidement pour voyager
    Quand je demande un remplacement en urgence
    Alors ma demande devrait être acceptée
    Et je dois présenter:
      | Document                      |
      | Déclaration de vol (PV)       |
      | Photo d'identité récente      |
    Et le coût devrait être de 90€
    Et le délai devrait être de 2 jours maximum

  Scénario: Demande Kids-ID pour enfant mineur
    Étant donné que mon enfant a 8 ans
    Et qu'il est de nationalité belge
    Et que j'ai l'autorité parentale
    Quand je demande une Kids-ID pour mon enfant
    Alors je dois fournir:
      | Document                           |
      | Photo d'identité de l'enfant       |
      | Consentement des deux parents      |
      | Preuve d'autorité parentale        |
    Et la validité devrait être de 5 ans
    Et le coût devrait être de 10€
    Et la carte devrait inclure les coordonnées d'urgence

  Scénario: Refus pour documents incomplets
    Étant donné que je suis un citoyen belge
    Et que j'ai 30 ans
    Quand je demande une carte d'identité sans photo conforme
    Alors ma demande devrait être refusée
    Et le motif devrait être "Photo non conforme aux standards ICAO"
    Et je devrais recevoir la liste des exigences photo:
      | Exigence                                |
      | Fond uni et clair                      |
      | Face visible, expression neutre         |
      | Pas de couvre-chef (sauf religieux)    |
      | Photo de moins de 6 mois               |

  Scénario: Changement d'adresse avec carte valide
    Étant donné que j'ai une carte d'identité valide
    Et que je déménage dans une autre commune
    Quand je signale mon changement d'adresse
    Alors ma carte devrait être mise à jour
    Et je dois me présenter à la nouvelle commune dans les 8 jours
    Et un autocollant avec la nouvelle adresse sera apposé
    Et le coût devrait être gratuit

  Plan du Scénario: Calcul de validité selon l'âge
    Étant donné que le demandeur a <age> ans
    Quand il demande une carte d'identité
    Alors la validité devrait être de <validite> ans

    Exemples:
      | age | validite |
      | 5   | 5        |
      | 12  | 5        |
      | 17  | 5        |
      | 18  | 10       |
      | 25  | 10       |
      | 65  | 10       |
      | 75  | 10       |

  Scénario: Procédure pour personne handicapée ne pouvant se déplacer
    Étant donné que je suis une personne à mobilité réduite
    Et que je ne peux pas me déplacer à la commune
    Et que j'ai un certificat médical attestant de mon incapacité
    Quand je demande une carte d'identité
    Alors un agent communal devrait se déplacer à mon domicile
    Et la procédure devrait être gratuite
    Et les empreintes digitales peuvent être exemptées sur base médicale

  Scénario: Carte d'identité pour Belge résidant à l'étranger
    Étant donné que je suis un citoyen belge
    Et que je réside en France
    Et que je suis inscrit au consulat belge
    Quand je demande une carte d'identité
    Alors je dois la demander au consulat belge
    Et la validité devrait être de 10 ans
    Et le délai peut être plus long (jusqu'à 6 semaines)
    Et les frais consulaires s'ajoutent au tarif de base