# language: fr
Fonctionnalité: Demandes de visa pour la Belgique
  En tant que ressortissant étranger
  Je veux demander un visa pour la Belgique
  Afin de pouvoir entrer et séjourner légalement sur le territoire

  Contexte:
    Étant donné que les frais de visa 2024 sont:
      | Type de visa                | Frais   |
      | Schengen court séjour      | 80€     |
      | Schengen enfant (6-12 ans) | 40€     |
      | Long séjour (visa D)       | 180€    |
      | Visa étudiant              | 200€    |
      | Visa travail               | 350€    |
      | Regroupement familial UE   | 0€      |
      | Regroupement familial hors UE | 180€ |

  Scénario: Visa Schengen tourisme court séjour
    Étant donné que je suis ressortissant d'un pays soumis à visa
    Et que je veux visiter la Belgique pour 15 jours
    Et que j'ai une réservation d'hôtel confirmée
    Et que j'ai une assurance voyage de 30000€ minimum
    Et que j'ai des moyens de subsistance de 95€/jour
    Et que j'ai un billet retour
    Quand je demande un visa Schengen type C
    Alors ma demande devrait être complète
    Et les frais devraient être 80€
    Et le délai de traitement devrait être 15 jours
    Et je devrais fournir mes données biométriques

  Scénario: Visa étudiant long séjour
    Étant donné que je suis accepté dans une université belge
    Et que j'ai une attestation d'inscription
    Et que j'ai une preuve de moyens de subsistance de 730€/mois
    Et que j'ai un certificat médical
    Et que j'ai un casier judiciaire vierge
    Et que j'ai une preuve de logement
    Quand je demande un visa D pour études
    Alors je devrais être éligible
    Et les frais devraient être 200€
    Et le délai devrait être environ 90 jours
    Et mon visa devrait permettre l'obtention d'une carte A

  Scénario: Visa travail avec permis unique
    Étant donné que j'ai un contrat de travail en Belgique
    Et que mon employeur a obtenu une autorisation d'occupation
    Et que le salaire annuel est supérieur à 45000€
    Et que j'ai les qualifications requises
    Quand je demande un visa D pour travail
    Alors je devrais être éligible
    Et les frais devraient être 350€
    Et le visa devrait mentionner "permis unique"
    Et je devrais pouvoir demander une carte A à l'arrivée

  Scénario: Visa regroupement familial avec citoyen belge
    Étant donné que mon conjoint est belge
    Et que nous sommes mariés depuis plus de 1 an
    Et que j'ai un acte de mariage légalisé
    Et que mon conjoint a des revenus de 1953€/mois minimum
    Et que nous avons un logement adéquat
    Quand je demande un visa D regroupement familial
    Alors je devrais être éligible
    Et les frais devraient être 180€
    Et le délai devrait être maximum 180 jours
    Et je devrais pouvoir obtenir une carte F

  Scénario: Visa affaires court séjour
    Étant donné que j'ai une invitation d'une entreprise belge
    Et que je participe à une réunion d'affaires
    Et que mon entreprise couvre mes frais
    Et que j'ai une assurance voyage professionnelle
    Quand je demande un visa Schengen affaires
    Alors ma demande devrait être prioritaire
    Et les frais devraient être 80€
    Et je pourrais demander un visa à entrées multiples

  Scénario: Visa médical
    Étant donné que j'ai besoin d'un traitement médical en Belgique
    Et que j'ai une attestation de l'hôpital belge
    Et que j'ai la preuve du paiement anticipé ou garantie
    Et que j'ai une assurance maladie couvrant le traitement
    Quand je demande un visa pour raisons médicales
    Alors ma demande devrait être traitée en urgence
    Et un accompagnant pourrait être autorisé
    Et la durée devrait correspondre au traitement

  Scénario: Visa de transit aéroportuaire
    Étant donné que je suis ressortissant d'un pays soumis au VTA
    Et que je transite par l'aéroport de Bruxelles
    Et que j'ai un vol confirmé vers ma destination finale
    Et que j'ai un visa pour le pays de destination
    Quand je demande un visa de transit type A
    Alors les frais devraient être 80€
    Et le visa devrait être valable uniquement pour le transit
    Et je ne pourrais pas sortir de la zone internationale

  Scénario: Refus de visa pour documents insuffisants
    Étant donné que j'ai soumis une demande de visa touristique
    Mais que je n'ai pas de réservation d'hébergement
    Et que je n'ai pas de preuve de moyens financiers
    Quand ma demande est examinée
    Alors elle devrait être refusée
    Et le motif devrait être "documentation insuffisante"
    Et je devrais pouvoir faire appel dans les 30 jours

  Scénario: Exemption de visa pour séjour court
    Étant donné que je suis citoyen américain
    Et que je veux séjourner 60 jours en Belgique
    Et que c'est pour du tourisme
    Quand je vérifie mes obligations de visa
    Alors je ne devrais pas avoir besoin de visa
    Et je pourrais entrer avec mon passeport
    Et je devrais respecter la règle des 90/180 jours

  Plan du Scénario: Frais de visa selon le type et l'âge
    Étant donné que je demande un <type_visa>
    Et que j'ai <age> ans
    Quand je calcule les frais
    Alors le montant devrait être <frais>€

    Exemples:
      | type_visa              | age | frais |
      | visa Schengen         | 25  | 80    |
      | visa Schengen         | 8   | 40    |
      | visa Schengen         | 4   | 0     |
      | visa étudiant         | 22  | 200   |
      | visa travail          | 35  | 350   |
      | regroupement familial | 30  | 180   |

  Scénario: Procédure de recours après refus
    Étant donné que mon visa a été refusé
    Et que j'ai reçu la notification avec les motifs
    Et que je conteste la décision
    Quand je dépose un recours au CCE
    Alors je dois le faire dans les 30 jours
    Et les frais de recours sont de 200€
    Et je peux demander la suspension en extrême urgence
    Et le délai de décision est d'environ 60 jours