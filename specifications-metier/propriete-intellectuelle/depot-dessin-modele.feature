# language: fr
Fonctionnalité: Dépôt de dessin ou modèle
  En tant que designer ou entreprise
  Je veux protéger l'apparence de mes produits
  Afin d'empêcher la copie pendant 25 ans maximum

  Contexte:
    Étant donné que les frais de dépôt de dessin/modèle 2024 sont:
      | Type                  | Montant |
      | Dépôt unique         | 140€    |
      | Dépôt multiple       | 366€    |
      | Publication          | 127€    |
      | Renouvellement 1     | 94€     |
      | Renouvellement 5     | 198€    |

  Scénario: Dépôt de dessin nouveau et ayant caractère individuel
    Étant donné que j'ai créé un nouveau design de chaise
    Et que le design est nouveau (non divulgué)
    Et qu'il a un caractère individuel
    Et que j'ai préparé 7 vues du produit
    Quand je dépose ma demande au BOIP
    Alors ma demande est enregistrée
    Et je paie 140€ pour un dépôt unique
    Et la protection est valable 5 ans
    Et je peux renouveler jusqu'à 25 ans

  Scénario: Dépôt multiple pour une collection
    Étant donné que j'ai créé une collection de 10 designs
    Et qu'ils appartiennent à la même classe de Locarno
    Et que tous sont nouveaux et individuels
    Quand je fais un dépôt multiple
    Alors je paie 366€ pour l'ensemble
    Et tous les designs sont protégés
    Et c'est plus économique qu'un dépôt individuel

  Scénario: Ajournement de publication pour confidentialité
    Étant donné que mon design n'est pas encore sur le marché
    Et que je veux garder la confidentialité
    Quand je demande l'ajournement de publication
    Alors la publication peut être différée jusqu'à 30 mois
    Et je paie les frais d'ajournement
    Et le design reste secret pendant cette période

  Scénario: Protection communautaire non enregistrée
    Étant donné que j'ai divulgué mon design dans l'UE
    Et que je n'ai pas fait de dépôt formel
    Quand mon design est copié
    Alors j'ai une protection de 3 ans
    Mais seulement contre la copie intentionnelle
    Et je dois prouver la divulgation et la copie