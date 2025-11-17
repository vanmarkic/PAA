# language: fr
Fonctionnalité: Permis de séjour - Procédures générales
  En tant qu'étranger en Belgique
  Je veux demander ou renouveler un permis de séjour
  Afin de résider légalement sur le territoire belge

  Contexte:
    Étant donné que les frais de carte de séjour 2024 sont:
      | Type de carte | Nouveau | Renouvellement |
      | Carte A       | 180€    | 60€            |
      | Carte B       | 200€    | 200€           |
      | Carte C       | 215€    | 215€           |
      | Carte D       | 215€    | 215€           |
      | Carte E       | 60€     | 60€            |
      | Carte F       | 200€    | 200€           |
      | Carte H       | 350€    | 350€           |

  Scénario: Demande de première carte A (séjour temporaire)
    Étant donné que je suis un ressortissant de pays tiers
    Et que j'ai un visa D valide pour études
    Et que je suis inscrit dans une université belge
    Et que j'ai une preuve de moyens de subsistance de 730€/mois
    Et que j'ai une assurance maladie valide
    Et que j'ai une adresse en Belgique
    Quand je demande une carte A à la commune
    Alors ma demande devrait être recevable
    Et le type de carte devrait être "A"
    Et les frais devraient être 180€
    Et le délai de traitement devrait être environ 45 jours

  Scénario: Renouvellement de carte A
    Étant donné que j'ai une carte A qui expire dans 45 jours
    Et que je suis toujours étudiant
    Et que je progresse dans mes études
    Et que j'ai maintenu mes moyens de subsistance
    Quand je demande le renouvellement de ma carte A
    Alors ma demande devrait être acceptée
    Et les frais devraient être 60€
    Et ma nouvelle carte devrait être valide pour 1 an

  Scénario: Demande de carte B (séjour illimité)
    Étant donné que j'ai une carte A depuis 5 ans
    Et que j'ai eu un séjour ininterrompu
    Et que j'ai un emploi stable
    Et que je n'ai pas de condamnations pénales
    Et que je parle français au niveau A2
    Quand je demande une carte B
    Alors je devrais être éligible
    Et les frais devraient être 200€
    Et le délai de traitement devrait être environ 120 jours

  Scénario: Demande de carte E (citoyen UE)
    Étant donné que je suis citoyen de l'Union européenne
    Et que j'ai un emploi en Belgique
    Et que je réside en Belgique depuis 3 mois
    Quand je demande mon enregistrement (carte E)
    Alors ma demande devrait être automatiquement acceptée
    Et les frais devraient être 60€
    Et ma carte devrait être valide pour 5 ans

  Scénario: Demande de carte F (membre de famille UE)
    Étant donné que je suis conjoint d'un citoyen UE
    Et que mon conjoint a une carte E valide
    Et que nous vivons ensemble
    Et que j'ai une preuve de notre mariage
    Quand je demande une carte F
    Alors je devrais être éligible
    Et les frais devraient être 200€
    Et ma carte devrait être liée au statut de mon conjoint

  Scénario: Demande de carte H (carte bleue européenne)
    Étant donné que j'ai une offre d'emploi hautement qualifié
    Et que le salaire annuel est de 58000€
    Et que j'ai un diplôme universitaire reconnu
    Et que l'employeur a fait une demande de permis unique
    Quand je demande une carte bleue européenne
    Alors je devrais être éligible
    Et les frais devraient être 350€
    Et le délai devrait être environ 90 jours
    Et ma famille devrait pouvoir me rejoindre

  Scénario: Refus pour séjour irrégulier
    Étant donné que mon visa a expiré il y a 6 mois
    Et que je n'ai pas de titre de séjour valide
    Et que je n'ai pas de circonstances exceptionnelles
    Quand je demande une carte de séjour
    Alors ma demande devrait être irrecevable
    Et je devrais recevoir un ordre de quitter le territoire
    Et le motif devrait être "séjour irrégulier - pas de titre valide"

  Scénario: Contrôle de résidence par l'agent de quartier
    Étant donné que j'ai déposé une demande de carte A
    Et que j'ai déclaré mon adresse à la commune
    Quand l'agent de quartier fait le contrôle de résidence
    Alors il devrait vérifier ma présence effective
    Et il devrait faire maximum 2 visites
    Et si je suis absent aux 2 visites
    Alors ma demande pourrait être refusée

  Plan du Scénario: Calcul des frais selon le type de carte
    Étant donné que je demande une <type_carte>
    Et que c'est une <type_demande>
    Quand je vérifie les frais
    Alors le montant devrait être <frais>€

    Exemples:
      | type_carte | type_demande    | frais |
      | Carte A    | nouvelle        | 180   |
      | Carte A    | renouvellement  | 60    |
      | Carte B    | nouvelle        | 200   |
      | Carte C    | nouvelle        | 215   |
      | Carte E    | nouvelle        | 60    |
      | Carte F    | nouvelle        | 200   |
      | Carte H    | nouvelle        | 350   |

  Scénario: Procédure accélérée moyennant supplément
    Étant donné que j'ai besoin urgent de ma carte
    Et que je suis éligible pour une carte A
    Et que j'accepte de payer le supplément
    Quand je demande la procédure accélérée
    Alors les frais supplémentaires devraient être 180€
    Et le délai devrait être réduit à 15 jours ouvrables
    Et je devrais avoir une attestation temporaire