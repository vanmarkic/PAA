# language: fr
Fonctionnalité: Logement Social
  En tant que personne à revenus modestes
  Je veux savoir si je peux accéder à un logement social
  Afin d'avoir un logement abordable et décent

  Contexte:
    Étant donné que les plafonds de revenus 2024 pour le logement social sont:
      | Région              | Catégorie                          | Plafond annuel              | Majoration par enfant |
      | Bruxelles-Capitale  | Personne isolée                    | Variable                    | 2,702.77€             |
      | Bruxelles-Capitale  | Ménage                              | Variable                    | 2,702.77€             |
      | Wallonie            | Personne isolée                    | 69,800€                     | 3,200€                |
      | Wallonie            | Ménage multiple                    | 85,100€                     | 3,200€                |
      | Flandres 2024       | Personne isolée                    | 29,515€                     | 2,475€                |
      | Flandres 2024       | Personne isolée handicapée         | 31,987€                     | 2,475€                |
      | Flandres 2024       | Autres cas                         | 44,270€                     | 2,475€                |
      | Flandres 2025       | Personne isolée                    | 30,636€                     | 2,569€                |
      | Flandres 2025       | Personne isolée handicapée         | 33,202€                     | 2,569€                |
      | Flandres 2025       | Autres cas                         | 45,952€                     | 2,569€                |
    Et que les délais d'attente moyens sont:
      | Région              | Type logement      | Délai moyen    |
      | Bruxelles-Capitale  | Studio/1 chambre   | 11-12 ans      |
      | Bruxelles-Capitale  | 2 chambres         | 8-10 ans       |
      | Wallonie            | Tous types         | 3-5 ans        |
      | Flandres            | Tous types         | 2-5 ans        |

  Scénario: Personne isolée à Bruxelles éligible au logement social
    Étant donné que je suis une personne isolée
    Et que je réside à Bruxelles-Capitale
    Et que mon revenu imposable net est de 20,000€
    Et que je ne suis pas propriétaire d'un bien immobilier
    Et que je suis inscrit au registre de la population
    Quand je vérifie mon éligibilité au logement social
    Alors je devrais être éligible
    Et je peux m'inscrire auprès d'une société de logement social
    Et le délai d'attente estimé est de 11-12 ans pour un studio
    Et mon loyer sera calculé selon mes revenus (environ 20-30% des revenus)

  Scénario: Famille en Wallonie éligible au logement social
    Étant donné que je suis en couple avec 3 enfants
    Et que nous résidons en Wallonie
    Et que notre revenu imposable annuel est de 45,000€
    Et que nous ne possédons aucun bien immobilier
    Et que nous sommes inscrits au registre de la population
    Quand nous vérifions notre éligibilité au logement social
    Alors nous devrions être éligibles
    Et le plafond de revenus est 85,100€ + (3,200€ × 3) = 94,700€
    Et nous pouvons nous inscrire auprès de la société wallonne du logement
    Et le délai d'attente estimé est de 3-5 ans

  Scénario: Personne handicapée en Flandres avec majoration
    Étant donné que je suis une personne isolée avec handicap reconnu
    Et que je réside en Flandres
    Et que mon revenu imposable 2021 est de 30,000€
    Et que je ne suis pas propriétaire
    Et que j'ai un handicap reconnu à 66%
    Quand je vérifie mon éligibilité au logement social
    Alors je devrais être éligible
    Et le plafond adapté est 31,987€ (2024) ou 33,202€ (2025)
    Et j'ai une priorité supplémentaire sur la liste d'attente
    Et le logement proposé sera adapté à mon handicap

  Scénario: Test de patrimoine en Flandres depuis 2024
    Étant donné que je suis une personne isolée
    Et que je réside en Flandres
    Et que mon revenu imposable est de 25,000€
    Et que j'ai 35,000€ d'épargne sur mes comptes
    Et que la limite patrimoniale est 30,636€ (2025)
    Quand je vérifie mon éligibilité après janvier 2024
    Alors je ne devrais pas être éligible
    Et le motif devrait être "patrimoine mobilier (35,000€) > limite (30,636€)"
    Et cette règle s'applique uniquement aux nouvelles inscriptions

  Scénario: Revenus trop élevés en Wallonie
    Étant donné que je suis une personne isolée
    Et que je réside en Wallonie
    Et que mon revenu imposable annuel est de 75,000€
    Et que le plafond est 69,800€
    Quand je vérifie mon éligibilité au logement social
    Alors je ne devrais pas être éligible
    Et le motif devrait être "revenus (75,000€) > plafond (69,800€)"
    Et je peux vérifier mon éligibilité au logement moyen

  Scénario: Propriétaire non éligible
    Étant donné que je possède un appartement en Belgique
    Et que je réside à Bruxelles-Capitale
    Et que mes revenus sont modestes (15,000€/an)
    Quand je vérifie mon éligibilité au logement social
    Alors je ne devrais pas être éligible
    Et le motif devrait être "propriétaire d'un bien immobilier"
    Et l'exception existe uniquement si le bien est inhabitable avec certificat

  Scénario: Famille nombreuse avec priorité en Wallonie
    Étant donné que je suis parent isolé avec 4 enfants mineurs
    Et que je réside en Wallonie
    Et que notre revenu familial est de 35,000€
    Et que nous vivons dans un logement insalubre
    Et que nous avons un certificat d'insalubrité
    Quand nous vérifions notre éligibilité au logement social
    Alors nous devrions être éligibles avec priorité
    Et le plafond adapté est 85,100€ + (3,200€ × 4) = 97,900€
    Et nous avons des points de priorité supplémentaires pour:
      | Critère                    | Points |
      | Famille monoparentale      | 3      |
      | 4 enfants à charge         | 4      |
      | Logement insalubre         | 5      |
    Et notre dossier sera traité en priorité

  Scénario: Étudiant majeur en Flandres
    Étant donné que je suis étudiant à temps plein
    Et que j'ai 22 ans
    Et que je réside en Flandres
    Et que mon revenu est de 8,000€/an (job étudiant)
    Et que mes parents ont des revenus élevés
    Quand je vérifie mon éligibilité au logement social
    Alors mon éligibilité dépend de ma situation
    Et si je suis encore à charge de mes parents, leurs revenus comptent
    Et si je suis autonome financièrement, seuls mes revenus comptent
    Et je dois prouver mon indépendance depuis au moins 1 an

  Scénario: Sans-abri avec accompagnement social
    Étant donné que je suis sans domicile fixe
    Et que je suis accompagné par le CPAS
    Et que je n'ai aucun revenu
    Et que je réside à Bruxelles-Capitale
    Quand le CPAS introduit une demande de logement social
    Alors je devrais être éligible en urgence
    Et j'ai accès au logement de transit
    Et la procédure est accélérée via Housing First
    Et un accompagnement social est obligatoire

  Scénario: Calcul du loyer social selon les revenus
    Étant donné que je suis locataire d'un logement social
    Et que mes revenus annuels sont de <revenu>€
    Et que je réside en <région>
    Quand mon loyer social est calculé
    Alors le loyer mensuel sera approximativement <loyer>€
    Et le calcul suit la formule régionale

    Exemples:
      | région              | revenu  | loyer  |
      | Bruxelles-Capitale  | 15000   | 250    |
      | Bruxelles-Capitale  | 25000   | 416    |
      | Wallonie            | 18000   | 300    |
      | Wallonie            | 30000   | 500    |
      | Flandres            | 20000   | 333    |

  Plan du Scénario: Éligibilité selon région et composition familiale
    Étant donné que je suis <situation_familiale>
    Et que je réside en <région>
    Et que le revenu du ménage est de <revenu>€
    Et que nous avons <enfants> enfant(s) à charge
    Et que <condition_patrimoine>
    Quand nous vérifions l'éligibilité
    Alors l'éligibilité devrait être <éligibilité>
    Et le motif est "<motif>"

    Exemples:
      | région              | situation_familiale     | revenu | enfants | condition_patrimoine          | éligibilité | motif                                    |
      | Bruxelles-Capitale  | personne isolée         | 22000  | 0       | pas de propriété              | oui         | revenus dans les limites                |
      | Wallonie            | personne isolée         | 70000  | 0       | pas de propriété              | non         | revenus > 69,800€                       |
      | Wallonie            | couple                  | 80000  | 2       | pas de propriété              | oui         | plafond adapté: 91,500€                 |
      | Flandres 2024       | personne isolée         | 28000  | 0       | pas de propriété              | oui         | revenus < 29,515€                       |
      | Flandres 2024       | famille                 | 50000  | 3       | pas de propriété              | non         | revenus > 44,270€ + 7,425€              |
      | Flandres 2025       | personne isolée         | 25000  | 0       | épargne 40,000€               | non         | patrimoine > limite 30,636€             |
      | Bruxelles-Capitale  | couple                  | 35000  | 1       | propriétaire appartement      | non         | propriétaire immobilier                 |

  Scénario: Procédure d'inscription et documents requis
    Étant donné que je souhaite m'inscrire pour un logement social
    Quand je prépare mon dossier d'inscription
    Alors je dois fournir les documents suivants:
      | Document                              | Obligatoire | Remarque                           |
      | Carte d'identité                      | Oui         | Tous les membres du ménage        |
      | Composition de ménage                 | Oui         | Datée de moins de 3 mois          |
      | Avertissement-extrait de rôle         | Oui         | Année de référence N-3            |
      | Preuve de non-propriété               | Oui         | Attestation notariale             |
      | Certificat médical handicap           | Si applicable | Pour priorité/adaptation         |
      | Jugement de garde enfants            | Si applicable | Parents séparés                  |
      | Attestation CPAS/chômage              | Si applicable | Pour revenus de remplacement     |
    Et l'inscription est gratuite
    Et je reçois un accusé de réception dans les 30-50 jours
    Et mon numéro d'inscription détermine mon ordre sur la liste
    Et je dois renouveler ma candidature annuellement

  Scénario: Mutation au sein du parc social
    Étant donné que je suis déjà locataire social à Bruxelles
    Et que mon logement actuel a 2 chambres
    Et que j'ai eu 2 enfants supplémentaires depuis mon entrée
    Et que j'ai besoin d'un logement avec 4 chambres
    Quand je demande une mutation
    Alors j'ai priorité sur les nouveaux candidats
    Et ma demande est justifiée par sur-occupation
    Et je conserve mon ancienneté dans le système
    Et le délai est généralement plus court (1-2 ans)