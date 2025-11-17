# language: fr
Fonctionnalité: Recours en matière fiscale
  En tant que contribuable
  Je veux contester une imposition ou une décision fiscale
  Afin d'obtenir une rectification ou un dégrèvement

  Contexte:
    Étant donné que les recours fiscaux suivent une procédure spécifique
    Et que la réclamation administrative est obligatoire
    Et que les délais sont stricts et de déchéance

  Scénario: Réclamation contre l'impôt des personnes physiques
    Étant donné que j'ai reçu mon avertissement-extrait de rôle le "2024-06-15"
    Et que je conteste le calcul de mon impôt
    Et que nous sommes le "2024-09-01"
    Quand j'introduis ma réclamation
    Alors je dois l'envoyer au directeur régional des contributions
    Et le délai de 6 mois n'est pas dépassé
    Et je dois motiver précisément mes griefs
    Et je peux demander la suspension du paiement
    Et l'administration a 6 mois pour répondre (prolongeable de 3 mois)

  Scénario: Réclamation tardive avec circonstances exceptionnelles
    Étant donné que le délai de réclamation est dépassé
    Et que j'étais hospitalisé pendant la période
    Et que je peux prouver l'impossibilité d'agir
    Quand je demande la recevabilité tardive
    Alors le directeur peut accepter en équité
    Et je dois fournir les justificatifs médicaux
    Et la décision reste discrétionnaire
    Et je garde un recours au tribunal si refus

  Scénario: Recours au tribunal de première instance
    Étant donné que ma réclamation a été rejetée
    Et que j'ai reçu la décision le "2024-01-15"
    Et que nous sommes le "2024-03-01"
    Quand j'introduis un recours judiciaire
    Alors le délai de 3 mois n'est pas dépassé
    Et je dois assigner l'État belge (SPF Finances)
    Et les frais de justice sont de 50€
    Et je peux demander une expertise
    Et le tribunal examine en fait et en droit

  Scénario: Procédure amiable avec le service de conciliation
    Étant donné que j'ai un différend fiscal complexe
    Et que je préfère éviter un long procès
    Et que le service de conciliation est compétent
    Quand je demande la conciliation fiscale
    Alors la procédure est gratuite et confidentielle
    Et le conciliateur examine objectivement le dossier
    Et il peut proposer une solution équitable
    Et l'accord lie les parties s'il est accepté

  Scénario: Réclamation TVA avec remboursement
    Étant donné que j'ai payé de la TVA en trop
    Et que j'ai droit à un remboursement
    Et que ma déclaration contenait une erreur
    Quand j'introduis une demande de restitution
    Alors le délai est de 3 ans à partir du paiement
    Et je dois corriger ma déclaration TVA
    Et l'administration vérifie la demande
    Et les intérêts moratoires peuvent être dus

  Scénario: Recours contre une amende fiscale
    Étant donné qu'une amende administrative m'a été infligée
    Et que je conteste la proportionnalité de la sanction
    Quand je conteste l'amende
    Alors je dois d'abord faire une réclamation administrative
    Et je peux invoquer ma bonne foi
    Et l'administration peut réduire ou annuler l'amende
    Et le juge a un pouvoir de pleine juridiction

  Scénario: Opposition à contrainte
    Étant donné qu'une contrainte a été décernée pour non-paiement
    Et que je conteste la dette fiscale
    Et que la contrainte m'a été signifiée
    Quand je fais opposition
    Alors le délai est d'un mois à partir de la signification
    Et l'opposition se fait par citation
    Et elle suspend l'exécution (sauf mesures conservatoires)
    Et je dois motiver mon opposition

  Plan du Scénario: Délais selon le type d'impôt
    Étant donné que je conteste un impôt de type <type_impot>
    Et que j'ai reçu la décision le <date_decision>
    Et que nous sommes le <date_actuelle>
    Quand je vérifie les délais
    Alors le délai de réclamation est de <delai_reclamation> mois
    Et le recours est <statut>

    Exemples:
      | type_impot            | date_decision | date_actuelle | delai_reclamation | statut      |
      | IPP                   | 2024-06-01    | 2024-10-01    | 6                 | recevable   |
      | Précompte immobilier  | 2024-01-01    | 2024-04-01    | 6                 | recevable   |
      | TVA                   | 2024-01-01    | 2025-01-01    | 36                | recevable   |
      | Droits de succession  | 2023-01-01    | 2024-07-01    | 6                 | irrecevable |

  Scénario: Demande de surséance indéfinie au recouvrement
    Étant donné que je conteste l'impôt
    Et que j'ai introduit une réclamation ou un recours
    Et que le paiement immédiat causerait un préjudice grave
    Quand je demande la surséance au recouvrement
    Alors je dois motiver le préjudice grave
    Et fournir une garantie peut être exigé
    Et la surséance peut être totale ou partielle
    Et des intérêts de retard peuvent être dus

  Scénario: Recours en cassation fiscal
    Étant donné qu'un arrêt de la cour d'appel m'est défavorable
    Et que je conteste uniquement des points de droit
    Quand j'introduis un pourvoi en cassation
    Alors le délai est de 3 mois
    Et je dois être représenté par un avocat à la Cour de cassation
    Et les frais sont de 375€
    Et seules les violations de la loi sont examinées