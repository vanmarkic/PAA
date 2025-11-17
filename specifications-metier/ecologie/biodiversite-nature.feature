# language: fr
Fonctionnalité: Protection de la biodiversité et zones naturelles
  En tant que propriétaire ou gestionnaire de terrain
  Je veux obtenir les autorisations pour mes activités
  Afin de respecter la protection de la nature

  Contexte:
    Étant donné que les zones protégées sont classées:
      | Type zone          | Protection | Activités autorisées        | Restrictions            |
      | Natura 2000        | Maximale   | Gestion conservatoire       | Toute modification      |
      | Réserve naturelle  | Très forte | Accès limité               | Construction interdite  |
      | Zone humide RAMSAR | Forte      | Agriculture extensive       | Drainage interdit       |
      | Parc naturel       | Modérée    | Tourisme doux              | Urbanisation limitée    |
      | SGIB               | Variable   | Selon plan de gestion      | Évaluation au cas par cas|

  Scénario: Autorisation activité en zone Natura 2000
    Étant donné que mon terrain de 5 hectares est en Natura 2000
    Et que je veux installer un parcours d'accrobranche
    Et que le site abrite des espèces protégées
    Quand je demande l'autorisation
    Alors je dois fournir:
      | Document                        | Contenu requis                    |
      | Évaluation appropriée           | Impact sur objectifs conservation |
      | Inventaire faune-flore          | Sur 4 saisons complètes          |
      | Plan de gestion                 | Mesures d'évitement et réduction  |
      | Monitoring écologique           | Protocole sur 5 ans               |
    Et l'autorisation peut inclure:
      | Condition                       | Détail                           |
      | Période d'exploitation          | Hors période nidification        |
      | Zones interdites               | Habitats prioritaires            |
      | Compensation                   | 2 ha restaurés pour 1 ha impacté |
    Et un comité de suivi est créé

  Scénario: Permis abattage arbres remarquables
    Étant donné que je veux abattre 3 arbres remarquables
    Et qu'ils sont répertoriés au patrimoine naturel
    Et que leur circonférence dépasse 150 cm
    Et qu'ils présentent un danger
    Quand je demande le permis d'abattage
    Alors je dois:
      | Obligation                      | Détail                          |
      | Expertise phytosanitaire        | Expert agréé                    |
      | Justification sécurité          | Rapport circonstancié           |
      | Enquête publique                | 15 jours minimum                |
      | Mesure compensatoire            | 3 arbres replantés par arbre    |
    Et les essences de remplacement doivent être indigènes
    Et un suivi de reprise sur 3 ans est requis

  Scénario: Subside création corridor écologique
    Étant donné que je suis un agriculteur
    Et que je crée un corridor de 2 km de haies
    Et que je connecte deux zones Natura 2000
    Et que j'utilise des essences locales
    Quand je demande le subside biodiversité
    Alors je reçois:
      | Type aide                       | Montant                         |
      | Plantation                      | 12€/mètre linéaire              |
      | Entretien années 1-3            | 2€/mètre/an                     |
      | Prime résultat (après 5 ans)    | 5€/mètre si 80% survie          |
    Et le montant total sera 24000€ pour la plantation
    Et je m'engage pour 10 ans minimum
    Et l'entretien doit être écologique

  Scénario: Prime toiture végétalisée extensive
    Étant donné que j'ai un bâtiment avec 500 m² de toiture plate
    Et que j'installe une toiture végétalisée extensive
    Et que le substrat fait 10 cm d'épaisseur
    Et que j'utilise des sedums locaux
    Quand je demande la prime toiture verte
    Alors la prime est calculée:
      | Critère                         | Valeur    | Prime        |
      | Surface de base                 | 500 m²    | 50€/m²       |
      | Bonus biodiversité locale       | +20%      | 10€/m²       |
      | Bonus gestion eau pluviale      | +10%      | 5€/m²        |
    Et la prime totale sera 32500€
    Et je dois maintenir la toiture 10 ans
    Et faire un suivi biodiversité annuel

  Scénario: Dérogation espèces protégées pour projet d'intérêt public
    Étant donné qu'un projet de tramway traverse un habitat protégé
    Et que 2 espèces protégées sont impactées
    Et que l'intérêt public majeur est démontré
    Quand je demande la dérogation
    Alors je dois prouver:
      | Condition                       | Preuve requise                   |
      | Absence d'alternative           | Étude de 5 tracés minimum        |
      | Intérêt public majeur          | Décision gouvernementale         |
      | Maintien état conservation      | Plan de sauvegarde espèces       |
      | Compensation écologique         | Ratio 3:1 minimum                |
    Et créer des habitats de substitution avant travaux
    Et assurer un suivi scientifique 10 ans
    Et publier les résultats annuellement

  Plan du Scénario: Calcul compensation écologique selon impact
    Étant donné que j'impacte <surface> ha d'habitat <type>
    Et que la valeur écologique est <valeur>
    Quand je calcule la compensation requise
    Alors je dois compenser <compensation> ha

    Exemples:
      | surface | type              | valeur    | compensation |
      | 1       | prairie humide    | élevée    | 3            |
      | 2       | forêt ancienne    | très élevée| 8            |
      | 0.5     | friche            | faible    | 0.5          |
      | 1.5     | zone humide       | maximale  | 6            |
      | 3       | culture intensive | très faible| 1            |