# language: fr
Fonctionnalité: Demande d'asile et protection internationale
  En tant que personne fuyant la persécution
  Je veux demander l'asile en Belgique
  Afin d'obtenir une protection internationale

  Contexte:
    Étant donné que les autorités compétentes sont:
      | Organisme | Rôle                                    |
      | OE        | Office des Étrangers - Enregistrement  |
      | CGRA      | Commissariat général - Décision asile  |
      | CCE       | Conseil du contentieux - Recours       |
      | Fedasil   | Accueil des demandeurs d'asile        |

  Scénario: Première demande d'asile à la frontière
    Étant donné que j'arrive à l'aéroport de Bruxelles
    Et que je fuis des persécutions dans mon pays
    Et que je n'ai pas de visa valide
    Et que je demande immédiatement l'asile
    Quand je présente ma demande à la police des frontières
    Alors je devrais être dirigé vers l'Office des Étrangers
    Et recevoir une annexe 26 (attestation de demande)
    Et être placé en centre fermé ou libéré
    Et avoir un entretien Dublin dans les 3 jours

  Scénario: Demande d'asile sur le territoire
    Étant donné que je suis déjà en Belgique
    Et que la situation dans mon pays s'est détériorée
    Et que je crains des persécutions en cas de retour
    Quand je me présente à l'Office des Étrangers
    Alors je dois le faire dans les 8 jours ouvrables
    Et fournir mes empreintes digitales
    Et déclarer ma langue de procédure (FR/NL)
    Et recevoir une attestation d'immatriculation (AI)
    Et être assigné à un centre Fedasil ou ILA

  Scénario: Procédure Dublin III applicable
    Étant donné que j'ai demandé l'asile en Belgique
    Mais que mes empreintes sont dans Eurodac
    Et que j'ai transité par l'Italie
    Et que l'Italie a accepté la reprise en charge
    Quand l'OE applique le règlement Dublin
    Alors je devrais recevoir une décision 26quater
    Et avoir 30 jours pour un recours en suspension
    Et le transfert devrait se faire dans les 6 mois
    Sauf si je fais un recours suspensif

  Scénario: Reconnaissance du statut de réfugié
    Étant donné que j'ai fui des persécutions politiques
    Et que j'ai fourni des preuves crédibles
    Et que le CGRA a examiné mon dossier
    Et qu'il y a un risque réel en cas de retour
    Quand le CGRA prend sa décision
    Alors je devrais être reconnu réfugié
    Et recevoir une carte A de 5 ans (carte N temporaire)
    Et avoir accès au marché du travail
    Et pouvoir demander le regroupement familial
    Et après 5 ans, demander la carte B

  Scénario: Octroi de la protection subsidiaire
    Étant donné que je viens d'une zone de conflit
    Et que je ne suis pas personnellement persécuté
    Mais qu'il y a une violence aveugle généralisée
    Et que tout civil court un risque réel
    Quand le CGRA examine ma demande
    Alors je pourrais obtenir la protection subsidiaire
    Et recevoir une carte A d'1 an renouvelable
    Et après 5 ans, demander la carte B
    Et avoir les mêmes droits sociaux qu'un réfugié

  Scénario: Demande manifestement infondée
    Étant donné que j'ai déjà demandé l'asile 3 fois
    Et que toutes ont été rejetées définitivement
    Et que je n'apporte aucun élément nouveau
    Quand je dépose une nouvelle demande
    Alors elle devrait être déclarée irrecevable
    Et je n'aurais pas droit à l'accueil
    Et je recevrais un ordre de quitter le territoire
    Et je pourrais faire un recours non-suspensif

  Scénario: Procédure pour mineur non-accompagné (MENA)
    Étant donné que j'ai 16 ans
    Et que je suis arrivé seul en Belgique
    Et que j'ai fui mon pays d'origine
    Quand je demande l'asile
    Alors un tuteur devrait m'être désigné
    Et je devrais être placé dans un centre adapté
    Et bénéficier d'une procédure adaptée
    Et ne pas être détenu
    Et avoir droit à la scolarisation immédiate

  Scénario: Demande d'apatridie
    Étant donné que je n'ai aucune nationalité
    Et que je peux le prouver documentairement
    Et que je réside en Belgique
    Quand je demande la reconnaissance d'apatride
    Alors la procédure se fait au tribunal de famille
    Et je dois prouver l'absence de nationalité
    Et si reconnu, j'obtiens une carte B directement
    Et je peux demander des documents de voyage

  Scénario: Recours au CCE après décision négative
    Étant donné que le CGRA a rejeté ma demande d'asile
    Et que j'ai reçu la notification de la décision
    Et que je conteste les motifs du rejet
    Quand je dépose un recours au CCE
    Alors je dois le faire dans les 30 jours
    Et payer 200€ de frais de procédure
    Et le recours est suspensif de plein droit
    Et une audience devrait avoir lieu dans les 3 mois
    Et le CCE peut confirmer, réformer ou annuler

  Scénario: Régularisation humanitaire 9bis
    Étant donné que je suis en Belgique depuis 5 ans
    Et que je suis bien intégré
    Et que mes enfants sont scolarisés
    Et que j'ai un promesse d'embauche
    Et que j'ai des circonstances exceptionnelles
    Quand je demande la régularisation 9bis
    Alors je dois la déposer à la commune
    Et payer 350€ de redevance
    Et prouver l'impossibilité de retour
    Et attendre environ 18 mois pour une décision

  Scénario: Régularisation médicale 9ter
    Étant donné que je souffre d'une maladie grave
    Et que le traitement n'est pas disponible dans mon pays
    Et qu'arrêter le traitement présente un risque vital
    Et que j'ai un certificat médical type
    Quand je demande la régularisation 9ter
    Alors ma demande doit être envoyée par recommandé
    Et être examinée par un médecin de l'OE
    Et si recevable, j'obtiens une AI
    Et si fondée, j'obtiens une carte A
    Et après 5 ans, je peux demander la carte B

  Plan du Scénario: Délais de procédure d'asile
    Étant donné que j'ai introduit une demande d'asile <type>
    Et que mon dossier est complet
    Quand le CGRA traite ma demande
    Alors le délai devrait être environ <delai> jours

    Exemples:
      | type                  | delai |
      | procédure normale    | 180   |
      | procédure prioritaire| 60    |
      | procédure accélérée  | 30    |
      | demande ultérieure   | 60    |
      | MENA                 | 120   |

  Scénario: Cessation du statut de réfugié
    Étant donné que je suis reconnu réfugié depuis 7 ans
    Et que la situation dans mon pays a changé
    Et qu'il n'y a plus de risque de persécution
    Quand le CGRA réexamine mon statut
    Alors ils peuvent initier une procédure de cessation
    Et je devrais être convoqué pour être entendu
    Et pouvoir démontrer d'autres craintes
    Ou demander le maintien pour raisons humanitaires
    Et avoir droit à un recours au CCE