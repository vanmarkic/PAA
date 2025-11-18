# language: fr
Fonctionnalité: Insertion Professionnelle
  En tant que personne éloignée du marché de l'emploi
  Je veux bénéficier de mesures d'insertion professionnelle
  Afin de retrouver un emploi durable et adapté à ma situation

  Contexte:
    Étant donné que les dispositifs d'insertion professionnelle 2024 sont:
      | Dispositif                            | Description                                         |
      | Article 60§7                          | Emploi temporaire via CPAS                        |
      | Article 61                           | Mise à disposition économie sociale                |
      | PTP (Programme de Transition Prof.)  | Emploi subsidié 2 ans maximum                     |
      | SINE (Économie d'Insertion Sociale)  | Emploi dans économie sociale                      |
      | Activa                               | Réduction ONSS pour employeurs                     |
      | Impulsion                            | Prime à l'embauche jeunes/longue durée            |
      | Stage First                          | Stage d'insertion pour jeunes                      |
      | IBO/FPI                              | Formation professionnelle individuelle             |
      | Titres-services                     | Emploi dans aide ménagère                         |

  Scénario: Bénéficiaire du RIS en Article 60§7
    Étant donné que je suis bénéficiaire du RIS depuis 6 mois
    Et que j'ai 35 ans
    Et que je n'ai pas travaillé depuis 2 ans
    Et que le CPAS propose un emploi Article 60§7
    Et que l'emploi est dans une administration communale
    Quand j'accepte cet emploi d'insertion
    Alors je signe un contrat de travail avec le CPAS
    Et la durée est calculée pour "reconstituer mes droits au chômage"
    Et mon salaire est au minimum "le barème de la fonction"
    Et je bénéficie de tous les avantages sociaux
    Et j'ai droit à un accompagnement social
    Et à la fin, j'ouvre mes droits aux allocations de chômage

  Scénario: Chômeur longue durée en Programme de Transition Professionnelle
    Étant donné que je suis au chômage depuis 18 mois
    Et que j'ai 42 ans
    Et que j'ai un niveau de qualification faible
    Et qu'un employeur du secteur non-marchand veut m'engager
    Quand je suis engagé en PTP
    Alors l'employeur reçoit une subvention salariale
    Et mon contrat est à durée déterminée de "24 mois maximum"
    Et je peux bénéficier d'une formation complémentaire
    Et mon salaire suit les barèmes du secteur
    Et j'ai une priorité pour un CDI après le PTP

  Scénario: Jeune peu qualifié en Stage First
    Étant donné que j'ai 23 ans
    Et que j'ai quitté l'école sans diplôme
    Et que je suis inscrit chez Actiris depuis 3 mois
    Et qu'une entreprise propose un Stage First
    Et que le stage est dans le secteur de la logistique
    Quand je démarre le stage
    Alors la durée est de "3 à 6 mois"
    Et je reçois une indemnité de stage de "200€ par mois"
    Et je maintiens mes allocations d'insertion
    Et l'entreprise reçoit une prime de "500€ par mois"
    Et j'ai 70% de chances d'être embauché après

  Scénario: Personne handicapée en entreprise de travail adapté
    Étant donné que j'ai une reconnaissance de handicap à 35%
    Et que j'ai 30 ans
    Et que je cherche un emploi adapté
    Et qu'une entreprise de travail adapté (ETA) recrute
    Quand je suis embauché en ETA
    Alors j'ai un contrat de travail ordinaire
    Et mon poste est adapté à mon handicap
    Et je bénéficie d'un encadrement spécialisé
    Et l'entreprise reçoit des subsides spécifiques
    Et je peux évoluer vers l'emploi ordinaire

  Scénario: Mère isolée dans les titres-services
    Étant donné que je suis mère isolée avec 2 enfants
    Et que j'ai 38 ans
    Et que je n'ai pas travaillé depuis 5 ans
    Et qu'une entreprise titres-services recrute
    Quand je suis embauchée
    Alors j'ai un contrat de travail standard
    Et je travaille minimum "à mi-temps (19h/semaine)"
    Et mon salaire est au minimum "11.99€ brut/heure"
    Et j'ai droit aux formations du Fonds de formation
    Et je peux obtenir un CDI après 3 mois
    Et mes horaires sont compatibles avec la vie familiale

  Scénario: Emploi Activa pour chômeur de longue durée
    Étant donné que je suis au chômage depuis 24 mois
    Et que j'ai 45 ans
    Et qu'un employeur privé veut m'engager
    Et que l'employeur demande l'avantage Activa
    Quand je suis embauché avec la carte Activa
    Alors l'employeur bénéficie d'une réduction ONSS
    Et la réduction est de "1000€ par mois pendant 30 mois"
    Et mon salaire est celui de la fonction
    Et j'ai un contrat à durée indéterminée obligatoire
    Et je bénéficie de tous les avantages du secteur

  Scénario: Formation professionnelle individuelle en entreprise (FPI/IBO)
    Étant donné que je suis demandeur d'emploi
    Et que j'ai 28 ans
    Et qu'une entreprise accepte de me former
    Et que la formation FPI dure 6 mois
    Et que c'est pour un poste de soudeur
    Quand je commence la FPI
    Alors je maintiens mes allocations de chômage
    Et je reçois une prime de productivité progressive
    Et l'entreprise ne paie pas de charges sociales
    Et j'ai une garantie d'embauche en CDI après
    Et la durée maximale est de "26 semaines"

  Scénario: Économie sociale d'insertion (SINE)
    Étant donné que je suis très éloigné de l'emploi
    Et que j'ai 40 ans
    Et que j'ai des problèmes sociaux multiples
    Et qu'une initiative SINE me propose un emploi
    Quand je suis engagé en SINE
    Alors j'ai un contrat de travail à durée indéterminée
    Et je bénéficie d'un accompagnement psychosocial
    Et mon employeur reçoit une subvention importante
    Et je peux suivre des formations pendant mon temps de travail
    Et l'objectif est ma réinsertion progressive

  Plan du Scénario: Comparaison des dispositifs d'insertion
    Étant donné que je suis <profil>
    Et que je cherche un emploi depuis <duree_chomage>
    Et que mon niveau de qualification est <qualification>
    Quand j'examine les dispositifs disponibles
    Alors le dispositif le plus adapté est <dispositif>
    Et la durée maximale est <duree_max>
    Et l'avantage principal est <avantage>

    Exemples:
      | profil               | duree_chomage | qualification | dispositif    | duree_max   | avantage                          |
      | bénéficiaire RIS     | 12 mois       | faible        | Article 60    | 24 mois     | reconstitution droits chômage     |
      | jeune sans diplôme   | 3 mois        | aucune        | Stage First   | 6 mois      | formation + indemnité             |
      | chômeur longue durée | 24 mois       | moyenne       | Activa        | illimitée   | CDI avec réduction ONSS          |
      | parent isolé         | 36 mois       | faible        | Titres-serv.  | illimitée   | horaires flexibles                |
      | personne handicapée  | 6 mois        | adaptée       | ETA           | illimitée   | environnement adapté              |

  Scénario: Cumul avec d'autres aides sociales
    Étant donné que je suis en insertion professionnelle Article 60
    Et que j'ai 3 enfants à charge
    Et que mon salaire est de 1400€ net
    Quand je vérifie mes autres droits
    Alors je maintiens mes allocations familiales
    Et je peux demander une prime d'installation si je déménage
    Et j'ai droit au tarif social pour l'énergie
    Et je peux obtenir une intervention dans les frais de garde
    Et je conserve ma carte médicale du CPAS pendant 1 an

  Scénario: Transition vers l'emploi durable
    Étant donné que mon contrat Article 60 se termine dans 3 mois
    Et que j'ai acquis de l'expérience en administration
    Et que j'ai suivi des formations complémentaires
    Quand je prépare ma sortie du dispositif
    Alors je bénéficie d'un accompagnement à la recherche d'emploi
    Et mon CV est valorisé avec cette expérience
    Et j'ai droit à un bilan de compétences
    Et je peux postuler en interne à la commune
    Et j'ouvre mes droits complets au chômage
    Et je peux accéder aux emplois ACS/APE

  Scénario: Échec d'insertion et nouvelle tentative
    Étant donné que mon stage d'insertion a été interrompu
    Et que c'était pour raisons médicales justifiées
    Et que je souhaite reprendre un parcours d'insertion
    Quand je me réinscris comme demandeur d'emploi
    Alors je peux accéder à un nouveau dispositif
    Et mon historique est pris en compte positivement
    Et je bénéficie d'un accompagnement renforcé
    Et la période d'interruption n'est pas pénalisante
    Et je peux choisir un autre secteur d'activité

  Scénario: Obligations pendant l'insertion professionnelle
    Étant donné que je suis en parcours d'insertion
    Quand je signe mon contrat d'insertion
    Alors je dois respecter les horaires de travail
    Et je dois suivre les formations obligatoires
    Et je dois collaborer avec mon référent social
    Et je dois signaler tout changement de situation
    Et je dois participer aux évaluations régulières
    Et je dois chercher activement un emploi durable
    Et je dois respecter le règlement de travail