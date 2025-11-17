# language: fr
# @specification-version:2024.1.0
# @effective-date:2024-01-01
# @legal-basis:Loi du 26 mai 2002 concernant le droit à l'intégration sociale
# @legal-url:https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2002052647&table_name=loi
# @implemented-by:src/regles-eligibilite/risRules.ts

Fonctionnalité: Revenu d'Intégration Sociale (RIS)
  Version: 2024.1.0
  En tant que personne sans ressources suffisantes
  Je veux savoir si j'ai droit au RIS
  Afin de subvenir à mes besoins de base

  Contexte:
    Étant donné que les montants RIS 2024 sont:
      | Catégorie              | Montant mensuel |
      | Personne isolée        | 1070.49€        |
      | Personne cohabitante   | 713.66€         |
      | Famille monoparentale  | 1450.52€        |

  Scénario: Personne isolée sans revenus éligible au RIS
    Étant donné que je suis une personne isolée
    Et que j'ai 25 ans
    Et que je suis Belge
    Et que je n'ai aucun revenu
    Et que je n'ai pas de patrimoine significatif
    Quand je vérifie mon éligibilité au RIS
    Alors je devrais être éligible
    Et le montant du RIS devrait être 1070.49€
    Et la catégorie devrait être "isolé"

  Scénario: Personne cohabitante éligible au RIS
    Étant donné que je suis cohabitant
    Et que j'ai 30 ans
    Et que je suis Belge
    Et que mon revenu mensuel est de 200€
    Et que le revenu du ménage est de 500€
    Quand je vérifie mon éligibilité au RIS
    Alors je devrais être éligible
    Et le montant du RIS devrait être inférieur à 713.66€
    Et la catégorie devrait être "cohabitant"

  Scénario: Parent isolé avec enfant à charge éligible
    Étant donné que je suis parent isolé
    Et que j'ai 1 enfant à charge
    Et que j'ai 28 ans
    Et que je suis Belge
    Et que mon revenu mensuel est de 400€
    Quand je vérifie mon éligibilité au RIS
    Alors je devrais être éligible
    Et le montant du RIS devrait être calculé avec complément
    Et la catégorie devrait être "famille monoparentale"
    Et le montant total devrait être supérieur à 1000€

  Scénario: Personne trop jeune pour le RIS
    Étant donné que je suis une personne isolée
    Et que j'ai 17 ans
    Et que je suis Belge
    Et que je n'ai aucun revenu
    Quand je vérifie mon éligibilité au RIS
    Alors je ne devrais pas être éligible
    Et le motif devrait être "âge minimum non atteint (18 ans requis)"

  Scénario: Personne sans titre de séjour valide
    Étant donné que je suis une personne isolée
    Et que j'ai 25 ans
    Et que je n'ai pas de titre de séjour valide en Belgique
    Et que je n'ai aucun revenu
    Quand je vérifie mon éligibilité au RIS
    Alors je ne devrais pas être éligible
    Et le motif devrait être "pas de titre de séjour valide"

  Scénario: Patrimoine trop élevé pour le RIS
    Étant donné que je suis une personne isolée
    Et que j'ai 25 ans
    Et que je suis Belge
    Et que je n'ai aucun revenu
    Et que je possède un patrimoine mobilier de 15000€
    Quand je vérifie mon éligibilité au RIS
    Alors je ne devrais pas être éligible
    Et le motif devrait être "patrimoine mobilier supérieur à 6200€"

  Scénario: Étudiant temps plein inéligible
    Étant donné que je suis une personne isolée
    Et que j'ai 20 ans
    Et que je suis Belge
    Et que je suis étudiant temps plein
    Et que je n'ai aucun revenu
    Quand je vérifie mon éligibilité au RIS
    Alors je ne devrais pas être éligible
    Et le motif devrait être "étudiant temps plein (sauf exceptions)"

  Scénario: Cumul RIS et revenus professionnels partiels
    Étant donné que je suis une personne isolée
    Et que j'ai 25 ans
    Et que je suis Belge
    Et que je bénéficie du RIS
    Et que je commence à travailler avec un revenu de 400€
    Quand je calcule mon nouveau RIS
    Alors une exonération devrait être appliquée
    Et le montant exonéré devrait être environ 252€
    Et le RIS restant devrait être calculé avec "RIS - (revenu - exonération)"

  Plan du Scénario: Calcul RIS selon revenus et catégorie
    Étant donné que je suis <catégorie>
    Et que j'ai 25 ans
    Et que je suis Belge
    Et que mon revenu mensuel est de <revenu>€
    Quand je calcule mon RIS
    Alors le montant du RIS devrait être <ris_calculé>€

    Exemples:
      | catégorie              | revenu | ris_calculé |
      | une personne isolée    | 0      | 1070.49     |
      | une personne isolée    | 300    | 770.49      |
      | cohabitant             | 0      | 713.66      |
      | cohabitant             | 200    | 513.66      |
      | parent isolé           | 0      | 1450.52     |
      | parent isolé           | 500    | 950.52      |

  Scénario: Obligations liées au RIS
    Étant donné que je suis éligible au RIS
    Quand j'accepte le RIS
    Alors je dois signer un contrat PIIS (Projet Individualisé d'Intégration Sociale)
    Et je dois être disponible pour le marché de l'emploi
    Et je dois déclarer toute modification de ma situation
    Et je dois résider effectivement en Belgique

  Scénario: Comparaison RIS vs chômage
    Étant donné que je suis une personne isolée
    Et que j'ai 25 ans
    Et que je pourrais avoir droit au chômage de 850€
    Et que je pourrais avoir droit au RIS de 1070.49€
    Quand je compare les deux options
    Alors le système devrait suggérer "demander le chômage d'abord"
    Et expliquer "le RIS est subsidiaire - demandez d'abord les autres aides"
