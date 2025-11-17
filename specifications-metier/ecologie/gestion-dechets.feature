# language: fr
Fonctionnalité: Gestion et traitement des déchets
  En tant qu'entreprise ou collectivité
  Je veux obtenir les autorisations pour la gestion des déchets
  Afin de respecter la réglementation environnementale

  Contexte:
    Étant donné que les catégories de déchets sont:
      | Catégorie          | Code | Traitement requis        | Tarif/tonne |
      | Déchets ménagers   | 20   | Tri et valorisation      | 120€        |
      | Déchets dangereux  | HP   | Traitement spécialisé    | 250€        |
      | Déchets inertes    | 17   | Recyclage ou enfouissement| 85€         |
      | Déchets industriels| 15   | Selon composition        | 150€        |
      | DEEE               | 16   | Démantèlement spécifique | 200€        |

  Scénario: Autorisation centre de recyclage classe B
    Étant donné que je veux ouvrir un centre de recyclage
    Et que je traiterai 5000 tonnes/an de déchets non dangereux
    Et que j'ai une surface de 2 hectares
    Et que je suis en zone d'activité économique
    Quand je demande l'autorisation d'exploitation
    Alors je dois fournir:
      | Document                          | Délai      |
      | Étude d'incidences                | 180 jours  |
      | Plan de gestion des déchets       | Immédiat   |
      | Garantie financière 100000€       | Avant permis|
      | Certificat de capacité technique  | Immédiat   |
    Et l'enquête publique durera 30 jours
    Et je dois respecter la hiérarchie des déchets

  Scénario: Permis transport déchets dangereux ADR
    Étant donné que je suis transporteur de déchets
    Et que je transporte des déchets classés dangereux
    Et que j'ai 5 camions conformes ADR
    Quand je demande le permis de transport
    Alors je dois avoir:
      | Exigence                    | Validité  |
      | Certificat ADR conducteurs  | 5 ans     |
      | Assurance RC spécifique     | Annuelle  |
      | Agrément véhicules          | 1 an      |
      | Conseiller sécurité ADR     | Permanent |
    Et je dois tenir un registre de transport
    Et déclarer mensuellement les flux transportés

  Scénario: Prime compostage collectif
    Étant donné que je représente une copropriété de 50 logements
    Et que nous installons un système de compostage collectif
    Et que le coût du projet est de 8000€
    Quand nous demandons la prime compostage
    Alors nous sommes éligibles à 60% du coût
    Et la prime sera de 4800€
    Et nous devons former 3 maîtres-composteurs
    Et faire un rapport annuel de valorisation

  Scénario: Enregistrement collecteur déchets électroniques
    Étant donné que je collecte des équipements électroniques usagés
    Et que je traite 500 tonnes de DEEE par an
    Et que j'ai un contrat avec Recupel
    Quand je demande mon enregistrement
    Alors je dois prouver:
      | Critère                      | Preuve requise          |
      | Traçabilité complète         | Système informatique    |
      | Taux de recyclage > 65%      | Attestation annuelle    |
      | Dépollution conforme         | Certificat ISO 14001    |
      | Personnel formé              | Attestations formation  |
    Et l'enregistrement est valable 5 ans
    Et un audit annuel est obligatoire

  Scénario: Obligation tri 5 flux pour entreprise
    Étant donné que mon entreprise génère plus de 10m³ de déchets par semaine
    Et que j'ai 50 employés
    Quand je vérifie mes obligations de tri
    Alors je dois trier obligatoirement:
      | Flux      | Conteneur | Collecte    |
      | Papier    | Bleu      | Hebdomadaire|
      | PMC       | Jaune     | Hebdomadaire|
      | Verre     | Vert      | Mensuelle   |
      | Organique | Orange    | Bi-hebdo    |
      | Résiduel  | Gris      | Hebdomadaire|
    Et je dois tenir un registre des déchets
    Et faire une déclaration annuelle

  Plan du Scénario: Calcul taxe déchets selon volume et type
    Étant donné que je produis <volume> tonnes de déchets <type>
    Et que je suis une <structure>
    Quand je calcule ma taxe déchets
    Alors le montant sera <taxe>€

    Exemples:
      | volume | type        | structure   | taxe   |
      | 100    | ménagers    | entreprise  | 12000  |
      | 100    | dangereux   | entreprise  | 25000  |
      | 50     | inertes     | collectivité| 4250   |
      | 200    | industriels | entreprise  | 30000  |
      | 10     | DEEE        | association | 2000   |