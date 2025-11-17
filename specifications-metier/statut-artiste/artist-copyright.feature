# language: fr
Fonctionnalité: Droits d'Auteur et Droits Voisins
  En tant qu'artiste créateur
  Je veux gérer mes droits d'auteur
  Afin de protéger et monétiser mes œuvres

  Contexte:
    Étant donné que les droits d'auteur comprennent:
      | Type de droit               | Durée protection     | Taux standard |
      | Droit d'auteur œuvre        | Vie + 70 ans        | Variable      |
      | Droits voisins interprète   | 50 ans              | Variable      |
      | Droit de suite plasticien   | Vie + 70 ans        | 4% max        |
      | Droits mécaniques           | Vie + 70 ans        | 9.1%          |
      | Droits SABAM                | Selon contrat       | 10-15%        |

  Scénario: Inscription à la SABAM
    Étant donné que je suis compositeur
    Et que j'ai créé 10 œuvres originales
    Et que je veux protéger mes droits
    Quand je m'inscris à la SABAM
    Alors je dois fournir les partitions
    Et déclarer toutes mes œuvres
    Et signer un mandat de gestion
    Et payer la cotisation annuelle de 50€

  Scénario: Déclaration d'œuvre musicale
    Étant donné que j'ai composé une nouvelle chanson
    Et que je suis membre SABAM
    Quand je déclare l'œuvre
    Alors je fournis le titre et les paroles
    Et j'indique les co-auteurs éventuels
    Et je précise la répartition des droits
    Et l'œuvre est protégée immédiatement

  Scénario: Perception de droits de diffusion
    Étant donné que ma musique est diffusée à la radio
    Et que la radio a déclaré 50 diffusions
    Et que le tarif est de 25€ par diffusion
    Quand la SABAM perçoit les droits
    Alors le montant brut est de 1250€
    Et la SABAM retient 12% de frais
    Et je reçois 1100€ de droits nets

  Scénario: Droit de suite sur vente d'œuvre
    Étant donné que je suis artiste plasticien
    Et qu'une de mes œuvres est revendue 50000€
    Et que c'est une vente aux enchères
    Quand le droit de suite s'applique
    Alors le taux est de 4% jusqu'à 50000€
    Et je perçois 2000€ de droit de suite
    Et la société de gestion prélève 10% de frais

  Scénario: Contrat de cession de droits
    Étant donné qu'un éditeur veut publier mon livre
    Et que le tirage prévu est de 5000 exemplaires
    Et que le prix de vente est de 20€
    Quand je négocie la cession
    Alors mes droits d'auteur sont de 10% du prix
    Et j'obtiens une avance de 5000€
    Et les droits numériques sont négociés séparément

  Scénario: Protection contre le plagiat
    Étant donné que mon œuvre a été plagiée
    Et que j'ai les preuves d'antériorité
    Et que j'ai déposé l'œuvre
    Quand j'engage une procédure
    Alors je peux demander l'arrêt de l'exploitation
    Et réclamer des dommages et intérêts
    Et exiger la mention de mon nom

  Plan du Scénario: Calcul des droits selon exploitation
    Étant donné que mon œuvre est exploitée en <type>
    Et que les recettes sont de <recettes>€
    Quand je calcule mes droits
    Alors le taux applicable est de <taux>%
    Et mes droits bruts sont de <droits>€

    Exemples:
      | type          | recettes | taux | droits |
      | streaming     | 10000    | 12   | 1200   |
      | téléchargement| 5000     | 15   | 750    |
      | synchronisation| 20000   | 50   | 10000  |
      | reproduction  | 8000     | 10   | 800    |