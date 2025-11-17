# language: fr
Fonctionnalité: Recours et voies de droit pour étrangers
  En tant qu'étranger confronté à une décision négative
  Je veux exercer mes droits de recours
  Afin de contester la décision et obtenir justice

  Contexte:
    Étant donné que les juridictions compétentes sont:
      | Instance                    | Compétence                     | Délai recours |
      | CCE                        | Décisions OE, CGRA, visa      | 30 jours      |
      | Conseil d'État             | Cassation administrative      | 30 jours      |
      | Tribunal première instance | Nationalité, état civil       | 15 jours      |
      | Tribunal du travail        | Aide sociale, CPAS            | 3 mois        |
      | Cour européenne           | Droits humains                | 6 mois        |

  Scénario: Recours CCE contre refus de visa
    Étant donné que mon visa a été refusé par le consulat
    Et que j'ai reçu la notification avec motivation
    Et que je conteste les motifs du refus
    Et que je suis dans le délai de 30 jours
    Quand je dépose un recours au CCE
    Alors je dois utiliser le formulaire standard
    Et payer 200€ de droits de rôle
    Et joindre la décision contestée
    Et exposer mes moyens en droit
    Et le CCE statue dans les 3 mois

  Scénario: Suspension en extrême urgence d'un OQT
    Étant donné que j'ai reçu un ordre de quitter le territoire
    Et que je suis détenu en centre fermé
    Et que l'éloignement est imminent (48h)
    Et que j'ai des attaches familiales en Belgique
    Quand je demande la suspension en extrême urgence
    Alors je dois prouver l'extrême urgence
    Et le préjudice grave difficilement réparable
    Et le moyen sérieux d'annulation
    Et l'audience a lieu dans les 3 jours
    Et la décision est rendue séance tenante

  Scénario: Recours en annulation décision CGRA
    Étant donné que le CGRA a rejeté ma demande d'asile
    Et que je conteste l'évaluation de ma crédibilité
    Et que j'ai de nouveaux éléments de preuve
    Quand je fais un recours de pleine juridiction au CCE
    Alors le recours est suspensif automatiquement
    Et je peux demander à être entendu
    Et présenter de nouveaux documents
    Et le CCE peut confirmer, réformer ou annuler
    Et le délai de décision est de 3 à 6 mois

  Scénario: Cassation administrative au Conseil d'État
    Étant donné que le CCE a rejeté mon recours
    Et que je conteste la légalité de l'arrêt
    Et qu'il y a violation de la loi ou procédure
    Quand je me pourvois en cassation
    Alors je dois le faire dans les 30 jours
    Et avoir un avocat au Conseil d'État
    Et payer 200€ de droits
    Et le Conseil examine uniquement le droit
    Et peut casser et renvoyer au CCE

  Scénario: Recours contre décision négative de naturalisation
    Étant donné que la Chambre a rejeté ma naturalisation
    Et que je conteste les motifs
    Et que je pense qu'il y a erreur d'appréciation
    Quand je fais un recours
    Alors je dois saisir le tribunal de première instance
    Et le faire dans les 15 jours de notification
    Et le tribunal examine les faits et le droit
    Et peut ordonner l'octroi de la nationalité
    Et appel possible devant la Cour d'appel

  Scénario: Procédure devant le tribunal du travail
    Étant donné que le CPAS refuse l'aide sociale
    Et qu'il invoque mon statut de séjour
    Et que j'estime y avoir droit
    Quand je saisis le tribunal du travail
    Alors j'ai 3 mois pour agir
    Et je peux demander l'aide juridique
    Et le tribunal examine mes besoins
    Et peut condamner le CPAS
    Et ordonner le paiement avec effet rétroactif

  Scénario: Recours devant la Cour européenne
    Étant donné que tous mes recours internes sont épuisés
    Et que mes droits fondamentaux sont violés
    Et que c'est une violation de la CEDH
    Et que c'est dans les 6 mois de la décision finale
    Quand je saisis la Cour européenne
    Alors je dois remplir le formulaire de requête
    Et démontrer le préjudice important
    Et l'épuisement des recours internes
    Et la Cour peut demander des mesures provisoires
    Et le délai est de plusieurs années

  Scénario: Demande de mesures provisoires (article 39)
    Étant donné que mon éloignement est programmé
    Et qu'un recours est pendant au CCE
    Mais que le recours n'est pas suspensif
    Et qu'il y a risque de traitement inhumain
    Quand je demande des mesures provisoires
    Alors je dois invoquer l'article 39 du règlement CCE
    Et prouver le risque de préjudice irréparable
    Et le CCE peut suspendre l'éloignement
    En attendant la décision au fond

  Scénario: Tierce opposition contre décision
    Étant donné qu'une décision affecte mes droits
    Mais que je n'étais pas partie à la procédure
    Et que mes intérêts sont lésés
    Quand je forme tierce opposition
    Alors je dois justifier mon intérêt
    Et agir dans le délai de 30 jours
    Et démontrer le préjudice
    Et le juge peut modifier la décision
    Pour tenir compte de mes droits

  Scénario: Demande de réouverture de dossier
    Étant donné que ma demande a été rejetée
    Mais que j'ai découvert de nouveaux éléments
    Et qu'ils sont déterminants
    Et qu'ils n'étaient pas disponibles avant
    Quand je demande la réouverture
    Alors je dois prouver le caractère nouveau
    Et leur pertinence pour la décision
    Et l'impossibilité de les produire avant
    Et l'administration peut rouvrir le dossier
    Ou je peux saisir le juge

  Scénario: Procédure en référé administratif
    Étant donné que l'administration ne répond pas
    Et que le délai légal est dépassé
    Et que j'ai besoin urgent d'une décision
    Quand je saisis le président du tribunal
    Alors c'est une procédure en référé
    Et l'audience est fixée rapidement
    Et le juge peut ordonner à l'administration
    De prendre une décision dans un délai
    Sous astreinte financière

  Plan du Scénario: Délais de recours selon la décision
    Étant donné que j'ai reçu une décision <type_decision>
    Et que je veux faire un recours
    Quand je vérifie le délai
    Alors je dois agir dans les <delai> jours

    Exemples:
      | type_decision              | delai |
      | refus de visa             | 30    |
      | rejet demande asile       | 30    |
      | ordre quitter territoire  | 30    |
      | refus naturalisation      | 15    |
      | refus séjour             | 30    |
      | retrait titre séjour     | 30    |
      | refus aide sociale       | 90    |

  Scénario: Aide juridique de deuxième ligne
    Étant donné que mes revenus sont insuffisants
    Et que j'ai besoin d'un avocat pour mon recours
    Quand je demande l'aide juridique
    Alors je m'adresse au bureau d'aide juridique
    Et je fournis mes preuves de revenus
    Et si éligible, un avocat pro deo est désigné
    Et les frais de justice sont réduits ou gratuits
    Et j'ai droit à l'assistance complète