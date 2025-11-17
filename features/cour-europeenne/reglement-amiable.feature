# language: fr
Fonctionnalité: Règlement amiable devant la CEDH
  En tant que partie à une procédure devant la CEDH
  Je veux explorer la possibilité d'un règlement amiable
  Afin de résoudre le litige sans jugement

  Contexte:
    Étant donné que l'article 39 de la Convention prévoit le règlement amiable
    Et que la Cour se met à disposition des parties
    Et que les négociations sont confidentielles

  Scénario: Proposition de règlement amiable par l'État
    Étant donné que ma requête a été déclarée recevable
    Et que l'État reconnaît certaines défaillances
    Et qu'il propose une compensation de 25000 euros
    Et des mesures pour éviter de futures violations
    Quand j'examine la proposition de règlement
    Alors je devrais évaluer si elle couvre mon préjudice
    Et vérifier les garanties de non-répétition
    Et pouvoir négocier les termes
    Et avoir un délai de réflexion suffisant

  Scénario: Négociation réussie avec engagement de réformes
    Étant donné que je dénonce des conditions de détention indignes
    Et que l'État accepte de reconnaître les violations
    Et qu'il s'engage à rénover les prisons concernées
    Et qu'il offre 15000 euros de compensation
    Quand nous finalisons le règlement amiable
    Alors l'accord devrait inclure un calendrier de réformes
    Et prévoir un mécanisme de suivi
    Et la Cour devrait approuver l'accord
    Et l'affaire serait rayée du rôle après exécution

  Scénario: Échec des négociations - retour à la procédure
    Étant donné que les négociations durent depuis 3 mois
    Et que l'État refuse de reconnaître la violation
    Et qu'il offre seulement 1000 euros sans admission
    Et que c'est insuffisant par rapport au préjudice
    Quand les négociations échouent
    Alors la procédure contentieuse devrait reprendre
    Et la Cour devrait fixer un calendrier
    Et les éléments confidentiels resteraient protégés
    Et l'affaire irait vers un jugement

  Scénario: Règlement incluant des mesures générales
    Étant donné que mon cas révèle un problème systémique
    Et que 200 requêtes similaires sont pendantes
    Et que l'État propose une réforme législative
    Et une compensation pour tous les cas similaires
    Quand nous négocions un règlement pilote
    Alors l'accord devrait couvrir tous les cas similaires
    Et prévoir des mesures législatives précises
    Et établir un mécanisme d'indemnisation
    Et être soumis à la supervision du Comité des Ministres

  Plan du Scénario: Évaluation d'une offre de règlement
    Étant donné qu'on m'offre <montant> euros
    Et que mon préjudice est estimé à <prejudice> euros
    Et que l'État "<reconnaissance>"
    Et qu'il propose "<mesures>"
    Quand j'évalue l'offre
    Alors l'offre devrait être considérée comme "<evaluation>"
    Et ma décision probable serait "<decision>"

    Exemples:
      | montant | prejudice | reconnaissance         | mesures                    | evaluation  | decision   |
      | 20000   | 25000    | reconnaît la violation | réformes complètes        | acceptable  | accepter   |
      | 5000    | 30000    | nie la violation      | aucune                    | insuffisante| refuser    |
      | 30000   | 25000    | reconnaît partiellement| mesures limitées          | correcte    | négocier   |
      | 15000   | 15000    | reconnaît totalement  | garanties non-répétition  | bonne       | accepter   |