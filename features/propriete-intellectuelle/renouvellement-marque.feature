# language: fr
Fonctionnalité: Renouvellement de marque
  En tant que titulaire de marque
  Je veux renouveler mon enregistrement
  Afin de maintenir mes droits exclusifs

  Contexte:
    Étant donné que les marques durent 10 ans
    Et que le renouvellement est indéfini
    Et que les frais sont de 268€ pour le Benelux

  Scénario: Renouvellement dans le délai normal
    Étant donné que ma marque expire dans 3 mois
    Et que je veux la renouveler pour 10 ans
    Quand je demande le renouvellement au BOIP
    Alors je paie 268€ pour 3 classes
    Et 37€ par classe supplémentaire
    Et le renouvellement prend effet à l'échéance
    Et je reçois un certificat de renouvellement

  Scénario: Renouvellement tardif avec surtaxe
    Étant donné que ma marque a expiré il y a 2 mois
    Et que je suis dans le délai de grâce de 6 mois
    Quand je demande le renouvellement tardif
    Alors je paie les frais normaux plus 25% de surtaxe
    Et mes droits sont restaurés rétroactivement
    Et les tiers de bonne foi sont protégés