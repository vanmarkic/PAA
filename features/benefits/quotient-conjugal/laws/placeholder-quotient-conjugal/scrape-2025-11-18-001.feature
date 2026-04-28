# language: fr
Fonctionnalité: Quotient conjugal et déclaration commune
  En tant que couple marié ou cohabitant légal
  Je veux bénéficier du quotient conjugal
  Afin d'optimiser notre imposition commune

  Contexte:
    Étant donné que les paramètres du quotient conjugal 2024 sont:
      | Paramètre                                | Valeur         |
      | Limite de transfert (30% des revenus)   | 11660€        |
      | Quotité exemptée de base                | 10160€        |
      | Quotité exemptée couple                 | 20320€        |
      | Seuil revenus professionnels conjoint   | 3830€         |
      | Majoration enfants à charge             | Variable      |
      | Taux d'imposition progressif min        | 25%           |
      | Taux d'imposition progressif max        | 50%           |

  Scénario: Couple avec un seul revenu professionnel
    Étant donné que nous sommes mariés
    Et que mon revenu professionnel est de 45000€
    Et que mon conjoint n'a aucun revenu
    Et que nous n'avons pas d'enfants
    Quand nous calculons notre imposition commune
    Alors le quotient conjugal s'applique automatiquement
    Et 11660€ sont transférés à mon conjoint (30% de 45000€)
    Et ma base imposable devient 33340€
    Et l'économie d'impôt est significative par rapport à une imposition séparée

  Scénario: Couple avec revenus déséquilibrés et enfants
    Étant donné que nous sommes cohabitants légaux
    Et que mon revenu est de 55000€
    Et que le revenu de mon partenaire est de 15000€
    Et que nous avons 2 enfants à charge
    Quand nous calculons le quotient conjugal
    Alors le transfert maximal est 11660€ (30% du plus bas revenu imposable)
    Et nous bénéficions de la majoration pour enfants
    Et la quotité exemptée est augmentée de 1810€ par enfant
    Et notre charge fiscale commune est optimisée

  Scénario: Conjoint aidant dans profession indépendante
    Étant donné que je suis indépendant
    Et que mon conjoint m'aide dans mon activité
    Et que je lui attribue 30% de mes revenus professionnels
    Et que mes revenus nets sont de 60000€
    Quand nous déclarons nos revenus
    Alors 18000€ sont attribués à mon conjoint aidant
    Et ces revenus sont imposés séparément dans son chef
    Et nous bénéficions d'une optimisation fiscale
    Et les cotisations sociales sont calculées séparément

  Scénario: Limite du quotient conjugal atteinte
    Étant donné que nous sommes mariés
    Et que mon revenu est de 80000€
    Et que mon conjoint a un revenu de 3000€
    Quand nous calculons le quotient conjugal
    Alors le transfert est limité car le conjoint a moins de 3830€
    Et seulement la différence (3830€ - 3000€ = 830€) peut être transférée
    Et le quotient conjugal est moins avantageux

  Scénario: Pension de survie et quotient conjugal
    Étant donné que je suis veuf/veuve
    Et que je perçois une pension de survie de 12000€
    Et que j'ai des revenus professionnels de 25000€
    Et que j'ai 1 enfant à charge
    Quand je calcule mon imposition
    Alors je bénéficie du quotient conjugal pour veuf/veuve
    Et ma quotité exemptée est majorée
    Et l'avantage est maintenu pendant l'année du décès et les 3 suivantes

  Scénario: Séparation en cours d'année
    Étant donné que nous nous sommes séparés le 1er juillet 2024
    Et que nous étions mariés depuis 2015
    Et que mon revenu annuel est de 40000€
    Et que celui de mon ex-conjoint est de 30000€
    Quand nous établissons nos déclarations
    Alors nous devons choisir entre:
      | Option                        | Description                          |
      | Déclaration commune           | Pour toute l'année 2024             |
      | Déclarations séparées         | À partir de la séparation           |
    Et généralement la déclaration commune reste avantageuse
    Et l'année suivante, déclarations obligatoirement séparées

  Scénario: Revenus de remplacement et quotient conjugal
    Étant donné que je suis au chômage
    Et que mes allocations annuelles sont de 18000€
    Et que mon conjoint a un salaire de 45000€
    Quand nous calculons notre imposition commune
    Alors mes allocations sont imposables
    Mais le quotient conjugal s'applique normalement
    Et le transfert est calculé sur les revenus nets
    Et nous optimisons notre charge fiscale globale

  Scénario: Parent isolé vs quotient conjugal
    Étant donné que je suis parent isolé (divorcé)
    Et que j'ai 2 enfants à charge exclusive
    Et que mes revenus sont de 35000€
    Quand je compare avec le quotient conjugal
    Alors je bénéficie d'avantages spécifiques:
      | Avantage parent isolé          | Montant/Description       |
      | Quotité exemptée majorée       | +1810€                   |
      | Première tranche majorée       | Taux réduit              |
      | Crédit d'impôt supplémentaire  | 460€                     |
    Et ces avantages compensent partiellement l'absence de quotient conjugal

  Plan du Scénario: Optimisation fiscale selon configuration familiale
    Étant donné que nous sommes <situation>
    Et que le revenu 1 est de <revenu1>€
    Et que le revenu 2 est de <revenu2>€
    Et que nous avons <enfants> enfants
    Quand nous calculons l'optimisation
    Alors le transfert quotient conjugal est <transfert>€
    Et l'économie d'impôt estimée est <economie>€

    Exemples:
      | situation        | revenu1 | revenu2 | enfants | transfert | economie |
      | mariés          | 50000   | 0       | 0       | 11660     | 3500     |
      | mariés          | 60000   | 20000   | 2       | 6000      | 1800     |
      | cohabitants     | 40000   | 10000   | 1       | 10000     | 2500     |
      | mariés          | 70000   | 35000   | 3       | 10500     | 2100     |
      | mariés          | 45000   | 2000    | 0       | 1830      | 550      |

  Scénario: Déclaration commune obligatoire
    Étant donné que nous sommes mariés ou cohabitants légaux
    Et que nous n'étions pas séparés au 31 décembre 2024
    Quand nous établissons notre déclaration fiscale
    Alors nous devons obligatoirement faire une déclaration commune
    Et nous recevons un seul avertissement-extrait de rôle
    Et les deux conjoints sont solidairement responsables
    Et pour les dettes fiscales antérieures au mariage

  Scénario: Avantages fiscaux personnels dans déclaration commune
    Étant donné que nous faisons une déclaration commune
    Et que j'ai des frais professionnels de 3000€
    Et que mon conjoint a des frais de garde d'enfants de 2000€
    Et que j'ai souscrit une épargne-pension de 990€
    Quand nous calculons nos déductions
    Alors chaque avantage reste personnel:
      | Avantage                  | Bénéficiaire      |
      | Frais professionnels      | Moi              |
      | Frais de garde           | Conjoint         |
      | Épargne-pension          | Moi              |
    Mais le quotient conjugal s'applique sur le résultat net
    Et l'optimisation est automatique

  Scénario: Précompte professionnel et versements anticipés
    Étant donné que nous sommes mariés
    Et que j'ai un précompte professionnel retenu de 12000€
    Et que mon conjoint indépendant a fait des versements anticipés de 8000€
    Quand nous calculons notre impôt final
    Alors les deux montants sont additionnés (20000€)
    Et comparés à l'impôt total du couple
    Et nous recevons un remboursement ou devons un complément
    Et la bonification pour versements anticipés s'applique

  Scénario: Documentation pour quotient conjugal
    Étant donné que nous voulons bénéficier du quotient conjugal
    Quand nous préparons notre déclaration
    Alors nous devons fournir:
      | Document/Information requis              |
      | Acte de mariage ou cohabitation légale  |
      | Composition de ménage au 31/12/2024     |
      | Revenus des deux conjoints               |
      | Charges d'enfants éventuelles            |
      | Numéros nationaux des deux conjoints     |
    Et le calcul du quotient est automatique
    Et aucune demande spécifique n'est nécessaire