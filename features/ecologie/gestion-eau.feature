# language: fr
Fonctionnalité: Gestion de l'eau et autorisations hydrauliques
  En tant qu'utilisateur d'eau ou gestionnaire
  Je veux obtenir les autorisations nécessaires
  Afin d'utiliser ou rejeter l'eau légalement

  Contexte:
    Étant donné que les types d'autorisations eau sont:
      | Type               | Seuil            | Procédure      | Redevance     |
      | Captage souterrain | > 10 m³/jour     | Permis         | 0.05€/m³      |
      | Captage surface    | > 50 m³/jour     | Autorisation   | 0.03€/m³      |
      | Rejet eaux usées   | > 100 EH         | Permis         | 2.5€/EH/an    |
      | Forage             | > 30m profondeur | Déclaration    | Forfait 500€  |

  Scénario: Permis captage eau souterraine pour industrie
    Étant donné que je suis une industrie agroalimentaire
    Et que j'ai besoin de 500 m³/jour d'eau souterraine
    Et que la nappe est classée en bon état quantitatif
    Et que je suis en Wallonie
    Quand je demande un permis de captage
    Alors je dois fournir:
      | Document                           | Exigence                    |
      | Étude hydrogéologique              | Rayon impact 1km            |
      | Test de pompage 72h                | Débit constant              |
      | Analyse qualité eau                | Paramètres complets         |
      | Plan de monitoring piézométrique   | 4 piézomètres minimum       |
    Et la redevance annuelle sera 9125€ (500 × 365 × 0.05)
    Et je dois installer un compteur agréé
    Et déclarer mensuellement les volumes prélevés

  Scénario: Autorisation rejet station d'épuration communale
    Étant donné que je gère une station d'épuration
    Et qu'elle traite 5000 équivalents-habitants
    Et que le rejet se fait en rivière classe 2
    Quand je demande l'autorisation de rejet
    Alors les normes de rejet sont:
      | Paramètre | Limite    | Fréquence contrôle |
      | DBO5      | 25 mg/l   | Hebdomadaire      |
      | DCO       | 125 mg/l  | Hebdomadaire      |
      | MES       | 35 mg/l   | Hebdomadaire      |
      | N total   | 15 mg/l   | Mensuelle         |
      | P total   | 2 mg/l    | Mensuelle         |
    Et je dois faire un autocontrôle permanent
    Et transmettre les résultats trimestriellement
    Et la redevance sera 12500€/an

  Scénario: Prime citerne eau de pluie particulier
    Étant donné que je suis un particulier
    Et que j'installe une citerne de 10000 litres
    Et que ma maison a une toiture de 150 m²
    Et que le coût d'installation est de 4000€
    Quand je demande la prime citerne
    Alors je suis éligible à la prime
    Et le montant sera 1000€ (maximum régional)
    Et je dois connecter minimum 2 points d'usage
    Et fournir la facture d'un installateur agréé

  Scénario: Permis modification cours d'eau non navigable
    Étant donné que je veux construire un pont privé
    Et que le cours d'eau est de 3ème catégorie
    Et que la largeur est de 4 mètres
    Et que je suis en zone agricole
    Quand je demande le permis de modification
    Alors je dois:
      | Obligation                         | Détail                      |
      | Étude hydraulique                  | Crue centennale             |
      | Compensation zone inondable        | Surface équivalente         |
      | Passage faune aquatique            | Hauteur min 30cm            |
      | Enquête publique                   | 30 jours                    |
    Et obtenir l'accord du gestionnaire de cours d'eau
    Et respecter la période de travaux (juillet-octobre)
    Et garantir le libre écoulement des eaux

  Scénario: Système d'épuration individuelle zone non-égouttée
    Étant donné que ma maison est en zone d'assainissement autonome
    Et qu'elle génère 5 équivalents-habitants
    Et qu'aucun égout n'est prévu avant 10 ans
    Quand j'installe un système d'épuration individuelle
    Alors je dois installer:
      | Équipement              | Capacité      | Norme        |
      | Fosse septique          | 3000 litres   | EN 12566-1   |
      | Station épuration       | 5 EH          | CE marquage  |
      | Regard de visite        | Accessible    | Obligatoire  |
    Et la prime sera de 70% du coût (max 4000€)
    Et l'entretien annuel est obligatoire
    Et je dois tenir un carnet d'entretien

  Plan du Scénario: Calcul redevance captage selon volume et usage
    Étant donné que je capte <volume> m³/an
    Et que l'usage est <usage>
    Et que je suis en <region>
    Quand je calcule ma redevance
    Alors le montant sera <redevance>€

    Exemples:
      | volume  | usage        | region    | redevance |
      | 10000   | domestique   | wallonie  | 300       |
      | 100000  | industriel   | wallonie  | 5000      |
      | 50000   | agricole     | flandre   | 750       |
      | 200000  | potable      | bruxelles | 8000      |
      | 5000    | irrigation   | wallonie  | 150       |