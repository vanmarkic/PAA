# language: fr
Fonctionnalité: Dépôt de marque Benelux
  En tant qu'entreprise ou entrepreneur
  Je veux déposer une marque Benelux
  Afin de protéger mon identité commerciale en Belgique, Pays-Bas et Luxembourg

  Contexte:
    Étant donné que les frais de marque Benelux 2024 sont:
      | Type de frais              | Montant |
      | Dépôt base (3 classes)     | 244€    |
      | Classe supplémentaire      | 37€     |
      | Renouvellement            | 268€    |
      | Recherche d'antériorités  | 150€    |

  Scénario: Dépôt de marque verbale distinctive
    Étant donné que je souhaite protéger le nom "INNOVATECH"
    Et que la marque est distinctive pour des services informatiques
    Et que j'ai choisi les classes 9, 35 et 42
    Et qu'aucune marque identique n'existe dans ces classes
    Quand je dépose ma demande auprès du BOIP
    Alors ma demande devrait être acceptée
    Et je devrais payer 244€ de frais de base
    Et je reçois un numéro de dépôt immédiat
    Et la marque sera publiée dans 2 semaines

  Scénario: Marque descriptive refusée
    Étant donné que je veux déposer "SUPER ORDINATEUR"
    Et que ces termes décrivent directement les produits
    Et qu'ils manquent de caractère distinctif
    Quand le BOIP examine ma demande
    Alors ma demande devrait être refusée
    Et le motif est "marque descriptive sans caractère distinctif"
    Et je peux faire appel dans les 2 mois

  Scénario: Opposition par un tiers
    Étant donné que ma marque a été publiée
    Et qu'un concurrent a une marque antérieure similaire
    Et qu'il dépose une opposition dans les 2 mois
    Quand la procédure d'opposition commence
    Alors je dois répondre dans le délai imparti
    Et une phase contradictoire s'engage
    Et le BOIP rendra une décision dans 6 mois

  Scénario: Renouvellement de marque après 10 ans
    Étant donné que ma marque expire dans 6 mois
    Et que je souhaite la renouveler pour 10 ans
    Quand je demande le renouvellement
    Alors je dois payer 268€
    Et je peux le faire jusqu'à 6 mois après expiration
    Et une surtaxe s'applique après la date d'expiration

  Plan du Scénario: Calcul des frais selon nombre de classes
    Étant donné que je dépose une marque dans <nombre_classes> classes
    Quand je calcule les frais totaux
    Alors le montant devrait être <montant>€

    Exemples:
      | nombre_classes | montant |
      | 3              | 244     |
      | 4              | 281     |
      | 5              | 318     |
      | 10             | 503     |