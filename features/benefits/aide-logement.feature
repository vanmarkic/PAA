# language: fr
Fonctionnalité: Aide au Logement
  En tant que locataire à revenus modestes
  Je veux savoir si j'ai droit à l'aide au logement
  Afin d'alléger mes charges locatives

  Contexte:
    Étant donné que les montants d'aide au logement 2024 sont:
      | Région                   | Type d'aide                | Montant mensuel              | Plafond revenus annuels    |
      | Bruxelles-Capitale       | Allocation loyer           | 186.67€ (priorité sociale)  | 27,550.86€                  |
      | Bruxelles-Capitale       | Allocation loyer           | 140€ (revenus moyens)       | 27,550.86€                  |
      | Bruxelles-Capitale       | Allocation relogement      | max 5 ans                   | 24,370.47€ + 7,071.79€/coh |
      | Wallonie                 | ADeL - Allocation loyer    | 100€ + 20€/enfant           | 17,000€ (isolé)            |
      | Wallonie                 | ADeL - Allocation loyer    | 100€ + 20€/enfant           | 23,200€ (couple)           |
      | Wallonie                 | AAL - Attente logement     | 125-185€/mois               | Liste attente >18 mois      |
      | Flandres                 | Aide locative              | Variable                     | 4 ans liste attente        |

  Scénario: Famille monoparentale à Bruxelles éligible à l'allocation loyer
    Étant donné que je suis parent isolé avec 2 enfants
    Et que je réside à Bruxelles-Capitale
    Et que mon revenu annuel est de 20,000€
    Et que je loue un logement privé à 750€/mois
    Et que j'ai au moins 6 points de priorité sur la liste d'attente logement social
    Quand je vérifie mon éligibilité à l'aide au logement
    Alors je devrais être éligible à l'allocation loyer
    Et le montant mensuel devrait être 186.67€
    Et le motif devrait être "famille monoparentale avec revenus <= 20,895.43€"

  Scénario: Couple avec revenus moyens à Bruxelles
    Étant donné que je suis en couple sans enfants
    Et que je réside à Bruxelles-Capitale
    Et que notre revenu annuel est de 25,000€
    Et que nous louons un logement à 900€/mois
    Et que nous avons au moins 6 points de priorité
    Quand je vérifie notre éligibilité à l'aide au logement
    Alors nous devrions être éligibles à l'allocation loyer
    Et le montant mensuel devrait être 140€
    Et le motif devrait être "revenus entre 20,895.43€ et 27,550.86€"

  Scénario: Personne isolée en Wallonie éligible à ADeL
    Étant donné que je suis une personne isolée
    Et que je réside en Wallonie
    Et que mon revenu annuel est de 15,000€
    Et que je quitte un logement insalubre
    Et que je loue un nouveau logement salubre à 500€/mois
    Quand je vérifie mon éligibilité à l'aide au logement
    Alors je devrais être éligible à l'ADeL
    Et l'allocation déménagement devrait être 400€
    Et l'allocation loyer mensuelle devrait être 100€
    Et la durée maximale devrait être 2 ans
    Et le motif devrait être "revenus < 17,000€ et déménagement logement salubre"

  Scénario: Famille en Wallonie avec enfants éligible à ADeL
    Étant donné que je suis en couple avec 3 enfants
    Et que je réside en Wallonie
    Et que notre revenu annuel est de 22,000€
    Et que nous quittons un logement surpeuplé
    Et que nous louons un logement adapté à 800€/mois
    Quand je vérifie notre éligibilité à l'aide au logement
    Alors nous devrions être éligibles à l'ADeL
    Et l'allocation déménagement devrait être 640€
    Et l'allocation loyer mensuelle devrait être 160€
    Et le calcul devrait être "100€ + (20€ × 3 enfants)"
    Et la durée maximale devrait être 2 ans

  Scénario: Candidat logement social en Wallonie éligible à AAL
    Étant donné que je suis une personne isolée
    Et que je réside en Wallonie
    Et que je suis inscrit sur la liste d'attente logement social depuis 24 mois
    Et que mon revenu ne dépasse pas les plafonds sociaux
    Quand je vérifie mon éligibilité à l'allocation d'attente
    Alors je devrais être éligible à l'AAL
    Et le montant mensuel devrait être entre 125€ et 185€
    Et le motif devrait être "inscrit liste attente > 18 mois"

  Scénario: Revenus trop élevés à Bruxelles
    Étant donné que je suis une personne isolée
    Et que je réside à Bruxelles-Capitale
    Et que mon revenu annuel est de 35,000€
    Et que je loue un logement à 1000€/mois
    Quand je vérifie mon éligibilité à l'aide au logement
    Alors je ne devrais pas être éligible
    Et le motif devrait être "revenus annuels > 27,550.86€"

  Scénario: Propriétaire non éligible
    Étant donné que je suis propriétaire de mon logement
    Et que je réside à Bruxelles-Capitale
    Et que j'ai des difficultés financières
    Quand je vérifie mon éligibilité à l'aide au logement
    Alors je ne devrais pas être éligible
    Et le motif devrait être "propriétaire du logement - aide réservée aux locataires"

  Scénario: Loyer trop élevé en Wallonie
    Étant donné que je suis une personne isolée
    Et que je réside en Wallonie
    Et que mon revenu annuel est de 14,000€
    Et que je loue un logement à 1,200€/mois
    Quand je vérifie mon éligibilité à l'aide au logement
    Alors je devrais être partiellement éligible
    Et le montant pourrait être plafonné
    Et le motif devrait être "loyer excessif par rapport aux plafonds régionaux"

  Scénario: Allocation de relogement à Bruxelles après expulsion
    Étant donné que je suis expulsé de mon logement
    Et que je réside à Bruxelles-Capitale
    Et que mon revenu annuel est de 20,000€
    Et que j'ai 1 enfant à charge
    Et que je trouve un nouveau logement à 700€/mois
    Quand je demande l'allocation de relogement
    Alors je devrais être éligible
    Et l'aide au déménagement devrait être 1,180€
    Et l'aide mensuelle au loyer devrait être accordée pour 5 ans maximum
    Et le calcul devrait inclure "majoration pour enfant à charge"

  Scénario: Personne sans-abri en Wallonie accédant à un logement
    Étant donné que je sors de la rue
    Et que je réside en Wallonie
    Et que j'accède à un logement via le CPAS
    Et que le loyer est de 400€/mois
    Quand je vérifie mon éligibilité à l'ADeL
    Alors je devrais être éligible
    Et l'allocation loyer devrait être forfaitaire à 100€/mois
    Et aucune preuve de logement antérieur n'est requise
    Et la durée devrait être 2 ans renouvelable

  Plan du Scénario: Calcul aide au logement selon région et situation
    Étant donné que je suis <situation_familiale>
    Et que je réside en <région>
    Et que mon revenu annuel est de <revenu>€
    Et que mon loyer mensuel est de <loyer>€
    Et que <condition_spécifique>
    Quand je vérifie mon éligibilité
    Alors l'éligibilité devrait être <éligibilité>
    Et le montant mensuel devrait être <aide_mensuelle>€

    Exemples:
      | région              | situation_familiale | revenu  | loyer | condition_spécifique                    | éligibilité | aide_mensuelle |
      | Bruxelles-Capitale  | parent isolé        | 18000   | 700   | 6 points priorité liste sociale         | oui         | 186.67         |
      | Bruxelles-Capitale  | couple              | 26000   | 850   | 6 points priorité liste sociale         | oui         | 140            |
      | Wallonie            | personne isolée     | 12000   | 450   | déménagement logement salubre            | oui         | 100            |
      | Wallonie            | couple 2 enfants    | 20000   | 650   | déménagement logement adapté            | oui         | 140            |
      | Wallonie            | personne isolée     | 14000   | 500   | liste attente sociale 20 mois           | oui         | 155            |
      | Bruxelles-Capitale  | personne isolée     | 30000   | 900   | aucune                                   | non         | 0              |
      | Wallonie            | personne isolée     | 25000   | 600   | revenus dépassent plafond               | non         | 0              |
      | Flandres            | famille             | 22000   | 750   | liste attente 5 ans                     | oui         | variable       |

  Scénario: Cumul avec autres aides sociales
    Étant donné que je bénéficie du RIS à 1070.49€/mois
    Et que je réside à Bruxelles-Capitale
    Et que mon loyer est de 600€/mois
    Et que j'ai 8 points de priorité sur la liste sociale
    Quand je vérifie mon éligibilité à l'allocation loyer
    Alors je devrais être éligible
    Et l'aide au logement est cumulable avec le RIS
    Et le montant total d'aides ne peut dépasser certains plafonds
    Et une déclaration au CPAS est obligatoire

  Scénario: Procédure de demande et délais
    Étant donné que je suis éligible à l'aide au logement
    Quand je soumets ma demande
    Alors je dois fournir les documents suivants:
      | Document                           | Obligatoire |
      | Contrat de bail                    | Oui         |
      | Preuve de revenus                  | Oui         |
      | Composition de ménage              | Oui         |
      | Attestation liste attente sociale  | Si applicable |
      | Certificat salubrité               | Pour ADeL    |
    Et le délai de traitement est:
      | Région              | Délai maximum   |
      | Bruxelles-Capitale  | 45 jours        |
      | Wallonie            | 30 jours        |
      | Flandres            | 60 jours        |
    Et le paiement est effectué mensuellement
    Et un contrôle annuel des conditions est effectué