# language: fr
Fonctionnalité: Éligibilité au Statut d'Artiste
  En tant qu'artiste ou travailleur culturel
  Je veux vérifier mon éligibilité au statut d'artiste
  Afin de bénéficier du régime spécifique de protection sociale

  Contexte:
    Étant donné que les seuils pour le statut d'artiste 2024 sont:
      | Type de seuil                     | Montant/Jours |
      | Revenus artistiques minimum        | 2000€         |
      | Jours prestés minimum              | 156           |
      | Jours prestés réduit (dérogation) | 104           |
      | Plafond revenus non-artistiques   | 10000€        |

  Scénario: Artiste professionnel éligible au statut complet
    Étant donné que je suis un artiste professionnel
    Et que j'ai 25 ans
    Et que mes revenus artistiques annuels sont de 25000€
    Et que j'ai presté 180 jours artistiques
    Et que je n'ai pas d'autres revenus professionnels
    Quand je vérifie mon éligibilité au statut d'artiste
    Alors je devrais être éligible au statut d'artiste complet
    Et le type de statut devrait être "artiste professionnel"
    Et j'aurais droit au régime de sécurité sociale adapté

  Scénario: Artiste débutant avec dérogation
    Étant donné que je suis un artiste débutant
    Et que j'ai 22 ans
    Et que mes revenus artistiques annuels sont de 8000€
    Et que j'ai presté 110 jours artistiques
    Et que c'est ma première demande
    Quand je vérifie mon éligibilité au statut d'artiste
    Alors je devrais être éligible au statut d'artiste débutant
    Et une dérogation devrait être appliquée pour les jours prestés
    Et le motif devrait être "première demande - seuil réduit accepté"

  Scénario: Artiste avec revenus mixtes éligible
    Étant donné que je suis artiste et enseignant
    Et que j'ai 30 ans
    Et que mes revenus artistiques annuels sont de 15000€
    Et que mes revenus d'enseignement sont de 8000€
    Et que j'ai presté 160 jours au total
    Quand je vérifie mon éligibilité au statut d'artiste
    Alors je devrais être éligible au statut mixte
    Et le calcul devrait prendre en compte les revenus mixtes
    Et mes droits sociaux devraient être adaptés

  Scénario: Technicien du spectacle éligible
    Étant donné que je suis technicien son et lumière
    Et que j'ai 28 ans
    Et que mes revenus techniques annuels sont de 22000€
    Et que j'ai presté 175 jours techniques
    Et que j'ai travaillé pour 5 employeurs différents
    Quand je vérifie mon éligibilité au statut d'artiste
    Alors je devrais être éligible au statut de technicien du spectacle
    Et j'aurais droit au régime intermittent

  Scénario: Artiste plasticien avec ventes d'œuvres
    Étant donné que je suis artiste plasticien
    Et que j'ai 35 ans
    Et que mes ventes d'œuvres rapportent 18000€ par an
    Et que j'ai 30 jours d'exposition
    Et que j'ai 50 jours de création attestés
    Quand je vérifie mon éligibilité au statut d'artiste
    Alors je devrais être éligible au statut d'artiste plasticien
    Et les jours d'exposition devraient compter double
    Et mes jours totaux devraient être 110 jours

  Scénario: Musicien avec cachets insuffisants
    Étant donné que je suis musicien
    Et que j'ai 26 ans
    Et que mes cachets annuels totalisent 1500€
    Et que j'ai presté 45 jours
    Quand je vérifie mon éligibilité au statut d'artiste
    Alors je ne devrais pas être éligible
    Et le motif devrait être "revenus artistiques insuffisants (minimum 2000€)"

  Scénario: Artiste avec trop de revenus non-artistiques
    Étant donné que je suis comédien
    Et que j'ai 29 ans
    Et que mes revenus artistiques sont de 12000€
    Et que mes revenus non-artistiques sont de 15000€
    Et que j'ai presté 160 jours
    Quand je vérifie mon éligibilité au statut d'artiste
    Alors je ne devrais pas être éligible
    Et le motif devrait être "revenus non-artistiques dépassent le plafond (10000€)"

  Scénario: Artiste étranger avec permis de travail
    Étant donné que je suis artiste étranger
    Et que j'ai un permis de travail artiste valide
    Et que mes revenus artistiques sont de 20000€
    Et que j'ai presté 165 jours en Belgique
    Quand je vérifie mon éligibilité au statut d'artiste
    Alors je devrais être éligible
    Et des conditions spécifiques s'appliquent pour les étrangers

  Plan du Scénario: Calcul des jours prestés selon l'activité
    Étant donné que je suis <type_artiste>
    Et que j'ai effectué <jours_activité> jours de <activité>
    Quand je calcule mes jours prestés pour le statut
    Alors mes jours comptabilisés devraient être <jours_comptés>

    Exemples:
      | type_artiste        | activité       | jours_activité | jours_comptés |
      | musicien            | concerts       | 50             | 50            |
      | danseur             | répétitions    | 80             | 80            |
      | plasticien          | expositions    | 20             | 40            |
      | écrivain            | résidences     | 30             | 60            |
      | metteur en scène    | créations      | 40             | 80            |
      | photographe         | reportages     | 60             | 60            |

  Scénario: Cumul avec allocations de chômage artistique
    Étant donné que je bénéficie d'allocations de chômage artistique
    Et que mes allocations mensuelles sont de 900€
    Et que je gagne 800€ par mois en cachets
    Et que j'ai le statut d'artiste
    Quand je calcule mes droits cumulés
    Alors je peux cumuler partiellement les revenus
    Et l'exonération devrait être de 130€
    Et mes allocations ajustées devraient être calculées

  Scénario: Passage du statut amateur au professionnel
    Étant donné que j'étais artiste amateur
    Et que mes revenus artistiques dépassent maintenant 2000€
    Et que j'ai presté 160 jours artistiques
    Quand je demande le statut professionnel
    Alors je dois passer devant la Commission des Artistes
    Et fournir mes attestations de prestations
    Et prouver le caractère professionnel de mon activité