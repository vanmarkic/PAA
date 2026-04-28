# language: fr
Fonctionnalité: Carte Médicale et Aide Médicale Urgente (AMU)
  En tant que personne en situation de précarité
  Je veux obtenir une carte médicale du CPAS
  Afin d'accéder gratuitement aux soins de santé essentiels

  Contexte:
    Étant donné que la carte médicale CPAS couvre:
      | Type de prestation           | Couverture                    | Conditions              |
      | Médecin généraliste          | 100% tarif INAMI              | Médecin conventionné    |
      | Médicaments essentiels       | 100% génériques               | Liste CPAS              |
      | Hospitalisation urgente      | 100% chambre commune          | Hôpital public          |
      | Soins dentaires urgents      | 100% soins conservateurs      | Urgence uniquement      |
      | Analyses laboratoire         | 100% prescrites               | Labo conventionné       |
      | Kinésithérapie              | Selon prescription            | Maximum 18 séances/an   |
    Et que l'AMU (Aide Médicale Urgente) est pour:
      | Statut                       | Conditions                    | Couverture              |
      | Sans-papiers                 | Pas de séjour légal           | Soins urgents uniquement|
      | Demandeur d'asile débouté    | Procédure terminée            | AMU complète            |
      | Européen sans ressources     | - de 3 mois en Belgique       | AMU si indigent         |

  Scénario: Résident belge sans ressources demandant carte médicale
    Étant donné que je suis résident belge
    Et que mes revenus sont inférieurs au RIS
    Et que je n'ai pas de mutuelle active
    Et que j'ai des problèmes de santé chroniques
    Quand je me présente au CPAS de ma commune
    Alors une enquête sociale est menée
    Et si mes ressources sont insuffisantes
    Alors je reçois une carte médicale valable 3 mois
    Et renouvelable sur demande
    Et je peux consulter les médecins conventionnés

  Scénario: Sans-papiers nécessitant soins urgents (AMU)
    Étant donné que je suis en séjour irrégulier
    Et que j'ai besoin de soins médicaux urgents
    Et que je n'ai aucune ressource financière
    Quand je me présente au CPAS
    Et une attestation médicale d'urgence
    Alors le CPAS vérifie mon état d'indigence
    Et accorde l'AMU pour les soins urgents
    Et couvre:
      | Soins couverts              | Description                    |
      | Consultations urgentes      | Médecin, urgences hôpital      |
      | Médicaments urgents         | Sur prescription               |
      | Hospitalisation urgente     | Si médicalement nécessaire     |
      | Accouchement               | Suivi grossesse et naissance   |
      | Soins préventifs enfants    | Vaccinations, consultations ONE|

  Scénario: Famille avec enfants et carte médicale
    Étant donné que je suis parent isolé avec 3 enfants
    Et que je bénéficie du RIS
    Et que mes enfants sont scolarisés
    Quand je demande la carte médicale familiale
    Alors toute la famille est couverte
    Et les enfants ont accès à:
      | Service                     | Couverture                     |
      | Médecine scolaire           | 100% examens obligatoires      |
      | Dentiste                    | 100% soins préventifs          |
      | Lunettes                    | Forfait 150€/2 ans             |
      | Psychologue scolaire        | Si prescrit par PMS            |
    Et la carte est valable pour toute la famille
    Et renouvelable tous les 3 mois

  Scénario: Personne âgée isolée avec carte médicale
    Étant donné que je suis une personne de 75 ans
    Et que ma pension est de 900€/mois
    Et que j'ai des frais médicaux importants
    Et que je vis seul
    Quand le CPAS évalue ma situation
    Alors il calcule mes ressources disponibles
    Et après déduction du loyer et charges fixes
    Et si le reste est insuffisant pour vivre
    Alors j'obtiens une carte médicale
    Et médicaments chroniques et soins

  Scénario: Étudiant européen sans ressources
    Étant donné que je suis étudiant européen
    Et que j'étudie en Belgique depuis 2 mois
    Et que je n'ai plus de ressources financières
    Et que je ne peux pas rentrer dans mon pays
    Quand je demande l'aide au CPAS
    Alors ma situation est évaluée
    Et si je suis en état de besoin urgent
    Alors je peux recevoir l'AMU temporaire
    Mais pas d'aide sociale complète (< 3 mois)
    Et uniquement pour soins urgents

  Scénario: Travailleur précaire avec carte médicale partielle
    Étant donné que je travaille à temps partiel
    Et que mon salaire est de 600€/mois
    Et que j'ai une mutuelle mais difficultés à payer
    Quand je demande l'aide du CPAS
    Alors le CPAS peut accorder une aide partielle:
      | Type d'aide                 | Montant/Couverture            |
      | Ticket modérateur           | Prise en charge CPAS          |
      | Médicaments catégorie C     | 50% du coût restant           |
      | Lunettes                    | Intervention 200€             |
      | Soins dentaires             | Urgences uniquement           |
    Et cette aide complète ma mutuelle
    Et évite l'accumulation de dettes médicales

  Scénario: Procédure de demande et documents requis
    Étant donné que je veux demander la carte médicale
    Quand je me présente au CPAS
    Alors je dois fournir:
      | Document                    | Objectif                      |
      | Carte d'identité/passeport  | Identification                |
      | Composition de ménage       | Situation familiale           |
      | Preuves de revenus          | Salaire, allocations          |
      | Preuves de charges          | Loyer, factures               |
      | Attestation médicale        | Si soins urgents              |
    Et l'assistant social mène une enquête
    Et visite mon domicile si nécessaire
    Et la décision est prise dans les 30 jours
    Et dans les 24h si urgence médicale

  Scénario: Utilisation de la carte médicale chez le médecin
    Étant donné que j'ai une carte médicale CPAS valide
    Quand je vais chez un médecin conventionné
    Alors je présente ma carte médicale
    Et le médecin vérifie la validité
    Et ne me fait pas payer la consultation
    Et envoie la facture directement au CPAS
    Mais si je vais chez un médecin non-conventionné
    Alors je dois payer et demander remboursement
    Et risque de remboursement partiel seulement

  Plan du Scénario: Évaluation ressources pour carte médicale
    Étant donné que mes revenus sont de <revenus>€
    Et que mon loyer est de <loyer>€
    Et que je suis <situation>
    Quand le CPAS calcule mes ressources
    Alors mon reste à vivre est <reste>€
    Et la décision est <decision>

    Exemples:
      | situation      | revenus | loyer | reste | decision           |
      | isolé          | 800     | 500   | 300   | carte accordée     |
      | isolé          | 1200    | 400   | 800   | carte refusée      |
      | famille 3 pers | 1500    | 700   | 800   | carte accordée     |
      | couple         | 1100    | 600   | 500   | carte partielle    |

  Scénario: Réseau de soins et prestataires conventionnés
    Étant donné que j'ai la carte médicale
    Alors je peux accéder au réseau conventionné:
      | Type prestataire           | Disponibilité                  |
      | Médecins généralistes      | Liste CPAS - 20+ médecins      |
      | Pharmacies                 | Toutes avec tiers-payant       |
      | Hôpitaux publics           | Urgences et consultations      |
      | Maisons médicales          | Soins intégrés au forfait      |
      | Planning familial          | Contraception et suivi         |
      | Centres santé mentale      | Si prescription médicale       |
    Et je dois respecter ce réseau
    Et urgence absolue

  Scénario: Renouvellement et obligations du bénéficiaire
    Étant donné que je bénéficie de la carte médicale
    Alors je dois respecter ces obligations:
      | Obligation                  | Fréquence                      |
      | Renouvellement demande      | Tous les 3 mois                |
      | Déclaration changements     | Dans les 15 jours              |
      | Utilisation réseau agréé    | Sauf urgence                   |
      | Justifier soins urgents     | Attestation médicale           |
      | Collaborer enquête sociale  | À chaque renouvellement        |
    Et en cas de non-respect:
      | Manquement                  | Conséquence                    |
      | Consultation hors réseau    | Non remboursement              |
      | Fausse déclaration         | Récupération + sanctions       |
      | Non renouvellement         | Suspension automatique         |

  Scénario: Recours en cas de refus
    Étant donné que ma demande de carte médicale est refusée
    Quand je conteste la décision
    Alors je peux introduire un recours:
      | Étape                      | Délai                          |
      | Recours interne CPAS       | 15 jours après notification    |
      | Tribunal du travail        | 3 mois après décision          |
      | Aide juridique gratuite    | Via bureau aide juridique      |
    Et pendant le recours
    Et aide médicale urgente reste accessible
    Et attestée médicalement nécessaire