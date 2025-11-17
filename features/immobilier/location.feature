# language: fr
Fonctionnalité: Location et Droits des Locataires en Belgique
  En tant que locataire ou propriétaire
  Je veux connaître mes droits et obligations en matière de location
  Afin de respecter la législation sur les baux d'habitation

  Contexte:
    Étant donné que la garantie locative maximum est de 2 mois en Wallonie et Bruxelles
    Et que la garantie locative maximum est de 3 mois en Flandre
    Et que l'indexation du loyer suit l'indice santé
    Et que le préavis standard est de 3 mois pour le locataire

  # Procédure 11: Contrat de bail conforme
  Scénario: Établissement d'un bail d'habitation conforme
    Étant donné que je loue un appartement 2 chambres
    Et que le loyer mensuel est de 800€
    Et que la location est en Région Wallonne
    Quand j'établis le contrat de bail
    Alors le bail doit contenir obligatoirement:
      | Élément | Description |
      | Identité des parties | Nom complet et domicile |
      | Description du bien | Adresse et composition |
      | Destination | Résidence principale |
      | Durée | 9 ans, 3 ans ou courte durée |
      | Loyer | Montant et modalités paiement |
      | Charges | Provisions ou forfait |
      | Garantie locative | Maximum 2 mois |
      | État des lieux | Date et modalités |
      | PEB | Certificat annexé |
    Et le bail doit être enregistré dans les 2 mois
    Et les frais d'enregistrement sont gratuits

  # Procédure 12: Garantie locative
  Scénario: Constitution de la garantie locative bancaire
    Étant donné que le loyer est de 900€
    Et que je suis en Région Bruxelloise
    Et que je choisis une garantie bancaire
    Quand je constitue la garantie locative
    Alors les options sont:
      | Type | Montant | Modalités |
      | Compte bloqué | 1800€ | Versement unique |
      | Garantie bancaire | 1800€ | Constitution progressive sur 3 ans |
      | CPAS | 1800€ | Si conditions sociales |
      | Brugal (Bruxelles) | 1800€ | Garantie régionale |
    Et les intérêts appartiennent au locataire
    Et la libération nécessite l'accord des deux parties

  # Procédure 13: Indexation du loyer
  Scénario: Calcul de l'indexation annuelle du loyer
    Étant donné que le loyer initial est de 750€
    Et que le bail a commencé en janvier 2022
    Et que l'indice de base est 115.53
    Et que l'indice actuel est 123.47
    Quand je calcule l'indexation pour 2024
    Alors la formule est: loyer_base × indice_nouveau / indice_base
    Et le nouveau loyer est: 750 × 123.47 / 115.53 = 801.60€
    Et l'indexation doit être notifiée par écrit
    Et elle ne peut être rétroactive que de 3 mois maximum

  # Procédure 14: État des lieux
  Scénario: Réalisation de l'état des lieux contradictoire
    Étant donné que je commence une location
    Et que l'état des lieux d'entrée est obligatoire
    Quand je procède à l'état des lieux
    Alors je dois:
      | Action | Délai | Responsable |
      | État des lieux d'entrée | Avant occupation | Commun ou expert |
      | Annexer au bail | Immédiat | Propriétaire |
      | Enregistrer | 2 mois | Propriétaire |
      | Signaler anomalies | 1 mois | Locataire |
      | État des lieux sortie | Fin bail | Contradictoire |
    Et si désaccord, un expert est désigné
    Et les frais d'expert sont partagés 50/50

  # Procédure 15: Réparations locatives
  Scénario: Répartition des obligations de réparation
    Étant donné qu'une réparation est nécessaire dans le logement
    Quand je détermine qui doit payer
    Alors la répartition est:
      | Type de réparation | Responsable | Exemples |
      | Grosses réparations | Propriétaire | Toiture, structure, chauffage central |
      | Réparations locatives | Locataire | Robinets, interrupteurs, entretien |
      | Vétusté normale | Propriétaire | Usure normale, vieillissement |
      | Dégradations | Locataire | Dégâts anormaux, négligence |
      | Mise en conformité | Propriétaire | Normes sécurité, salubrité |
      | Entretien courant | Locataire | Chaudière annuel, ramonage |
    Et le locataire doit permettre l'accès pour réparations urgentes

  # Procédure 16: Préavis et résiliation
  Scénario: Résiliation du bail par le locataire
    Étant donné que j'ai un bail de 9 ans
    Et que j'occupe le logement depuis 2 ans
    Et que je veux donner mon préavis
    Quand je résilie mon bail
    Alors les règles de préavis sont:
      | Période | Préavis | Indemnité |
      | 0-6 mois | 3 mois | 3 mois de loyer |
      | 6-12 mois | 3 mois | 2 mois de loyer |
      | 12-18 mois | 3 mois | 1 mois de loyer |
      | > 18 mois | 3 mois | Aucune |
    Et le préavis doit être envoyé par recommandé
    Et il prend cours le 1er du mois suivant

  # Procédure 17: Expulsion pour arriérés
  Scénario: Procédure d'expulsion pour non-paiement
    Étant donné qu'un locataire a 3 mois d'arriérés de loyer
    Et que des rappels ont été envoyés
    Quand le propriétaire lance une procédure d'expulsion
    Alors les étapes sont:
      | Étape | Délai | Action |
      | Mise en demeure | Immédiat | Recommandé avec délai 15 jours |
      | Citation justice de paix | +15 jours | Requête au tribunal |
      | Audience | +1-2 mois | Comparution obligatoire |
      | Jugement | +15 jours | Décision du juge |
      | Délai de grâce | 1-12 mois | Possible selon situation |
      | Exécution | Variable | Huissier si non-départ |
    Et le CPAS peut intervenir pour médiation
    Et l'expulsion hivernale est interdite (décembre-mars)

  # Procédure 18: Logement étudiant (kot)
  Scénario: Location d'un logement étudiant
    Étant donné que je loue un kot à un étudiant
    Et que le loyer est de 400€ charges comprises
    Quand j'établis le bail étudiant
    Alors les spécificités sont:
      | Élément | Règle spécifique |
      | Durée | Maximum 12 mois |
      | Reconduction | Tacite possible |
      | Garantie | Maximum 2 mois |
      | Préavis locataire | 2 mois |
      | Préavis propriétaire | 3 mois |
      | Domiciliation | Généralement interdite |
      | Sous-location | Interdite sauf accord |
    Et le bail prend fin automatiquement aux études
    Et les parents peuvent être caution solidaire

  # Procédure 19: Colocation
  Scénario: Mise en place d'une colocation légale
    Étant donné que 3 personnes veulent colouer une maison
    Et que le loyer total est de 1200€
    Et que chacun a une chambre privée
    Quand nous organisons la colocation
    Alors les options de bail sont:
      | Type | Responsabilité | Avantages | Inconvénients |
      | Bail unique solidaire | Solidaire | Simple | Tous responsables |
      | Bails multiples | Individuelle | Indépendance | Plus complexe |
      | Bail principal + sous-location | Variable | Flexibilité | Accord propriétaire |
    Et un règlement de colocation est recommandé
    Et la garantie peut être divisée ou solidaire

  # Procédure 20: Insalubrité et recours
  Scénario: Recours pour logement insalubre
    Étant donné que mon logement présente des problèmes de salubrité
    Et que le propriétaire refuse d'agir
    Quand j'engage un recours
    Alors les étapes sont:
      | Action | Autorité | Délai |
      | Mise en demeure | Propriétaire | Recommandé |
      | Inspection régionale | Service logement | Sur demande |
      | Rapport d'insalubrité | Inspecteur | 30 jours |
      | Mise en conformité | Propriétaire | Délai fixé |
      | Justice de paix | Tribunal | Si inaction |
      | Réduction loyer | Juge | Proportionnelle |
    Et je peux consigner le loyer si graves manquements
    Et une attestation de conformité peut être exigée

  Plan du Scénario: Calcul du préavis selon la durée d'occupation
    Étant donné que j'ai un bail de <type_bail>
    Et que j'occupe depuis <mois_occupation> mois
    Et que je suis <partie>
    Quand je donne mon préavis
    Alors le délai de préavis est <delai> mois
    Et l'indemnité est <indemnite>

    Exemples:
      | type_bail | mois_occupation | partie | delai | indemnite |
      | 9 ans | 5 | locataire | 3 | 3 mois |
      | 9 ans | 8 | locataire | 3 | 2 mois |
      | 9 ans | 15 | locataire | 3 | 1 mois |
      | 9 ans | 24 | locataire | 3 | 0 mois |
      | 3 ans | 12 | locataire | 3 | 0 mois |
      | 9 ans | 36 | propriétaire | 6 | 0 mois |