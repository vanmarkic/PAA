# language: fr
Fonctionnalité: Garantie de Revenus aux Personnes Âgées (GRAPA)
  En tant que personne âgée avec des ressources insuffisantes
  Je veux savoir si j'ai droit à la GRAPA
  Afin de compléter mes revenus de pension

  Contexte:
    Étant donné que les montants GRAPA 2024 sont:
      | Catégorie              | Montant mensuel |
      | Personne isolée        | 1549.42€        |
      | Personne cohabitante   | 1032.95€        |
    Et que l'âge légal de la pension en 2024 est 65 ans
    Et que l'âge légal passera à 66 ans le 1er février 2025
    Et que l'âge légal passera à 67 ans le 1er février 2030

  Scénario: Personne âgée isolée sans ressources éligible à la GRAPA
    Étant donné que je suis une personne isolée
    Et que j'ai 65 ans
    Et que je suis Belge
    Et que je réside effectivement en Belgique
    Et que je n'ai aucune pension
    Et que je n'ai aucune autre ressource
    Quand je vérifie mon éligibilité à la GRAPA
    Alors je devrais être éligible
    Et le montant de la GRAPA devrait être 1549.42€
    Et la catégorie devrait être "personne isolée"

  Scénario: Personne cohabitante avec petite pension éligible
    Étant donné que je suis cohabitant
    Et que j'ai 68 ans
    Et que je suis Belge
    Et que je réside effectivement en Belgique
    Et que ma pension mensuelle est de 500€
    Et que je n'ai pas d'autres ressources
    Quand je vérifie mon éligibilité à la GRAPA
    Alors je devrais être éligible
    Et le montant de la GRAPA devrait être 532.95€
    Et la catégorie devrait être "personne cohabitante"
    Et le calcul devrait être "1032.95€ - 500€ = 532.95€"

  Scénario: Réfugié reconnu de 70 ans éligible
    Étant donné que je suis une personne isolée
    Et que j'ai 70 ans
    Et que je suis réfugié reconnu en Belgique
    Et que je réside effectivement en Belgique depuis 5 ans
    Et que ma pension mensuelle est de 800€
    Quand je vérifie mon éligibilité à la GRAPA
    Alors je devrais être éligible
    Et le montant de la GRAPA devrait être 749.42€
    Et le motif devrait être "réfugié reconnu éligible selon la loi du 22 mai 1969"

  Scénario: Personne trop jeune pour la GRAPA
    Étant donné que je suis une personne isolée
    Et que j'ai 60 ans
    Et que je suis Belge
    Et que je n'ai aucune ressource
    Quand je vérifie mon éligibilité à la GRAPA
    Alors je ne devrais pas être éligible
    Et le motif devrait être "âge minimum non atteint (65 ans requis en 2024)"

  Scénario: Personne ne résidant pas en Belgique
    Étant donné que je suis une personne isolée
    Et que j'ai 70 ans
    Et que je suis Belge
    Et que je réside en France
    Et que ma pension est de 400€
    Quand je vérifie mon éligibilité à la GRAPA
    Alors je ne devrais pas être éligible
    Et le motif devrait être "résidence effective en Belgique requise"

  Scénario: Ressources trop élevées pour personne isolée
    Étant donné que je suis une personne isolée
    Et que j'ai 72 ans
    Et que je suis Belge
    Et que je réside effectivement en Belgique
    Et que ma pension mensuelle est de 1600€
    Quand je vérifie mon éligibilité à la GRAPA
    Alors je ne devrais pas être éligible
    Et le motif devrait être "ressources supérieures au plafond GRAPA (1549.42€/mois)"

  Scénario: Citoyen européen avec droit à pension belge
    Étant donné que je suis une personne isolée
    Et que j'ai 66 ans
    Et que je suis citoyen français
    Et que j'ai travaillé 15 ans en Belgique
    Et que j'ai droit à une pension belge de 600€
    Et que je réside effectivement en Belgique
    Quand je vérifie mon éligibilité à la GRAPA
    Alors je devrais être éligible
    Et le montant de la GRAPA devrait être 949.42€
    Et le motif devrait être "convention entre la Belgique et la France"

  Scénario: Personne avec patrimoine mobilier pris en compte
    Étant donné que je suis une personne isolée
    Et que j'ai 75 ans
    Et que je suis Belge
    Et que je réside effectivement en Belgique
    Et que ma pension mensuelle est de 500€
    Et que j'ai un compte épargne de 50000€
    Quand je vérifie mon éligibilité à la GRAPA
    Alors mes ressources calculées incluent "revenus du patrimoine mobilier"
    Et le montant pris en compte est "50000€ × 6% = 3000€/an = 250€/mois"
    Et mes ressources totales sont "500€ + 250€ = 750€"
    Et le montant de la GRAPA devrait être 799.42€

  Plan du Scénario: Calcul GRAPA selon catégorie et ressources
    Étant donné que je suis <catégorie>
    Et que j'ai 70 ans
    Et que je suis Belge
    Et que je réside effectivement en Belgique
    Et que mes ressources mensuelles totales sont de <ressources>€
    Quand je calcule ma GRAPA
    Alors le montant de la GRAPA devrait être <grapa_calculée>€

    Exemples:
      | catégorie              | ressources | grapa_calculée |
      | une personne isolée    | 0          | 1549.42        |
      | une personne isolée    | 500        | 1049.42        |
      | une personne isolée    | 1000       | 549.42         |
      | une personne isolée    | 1549.42    | 0              |
      | cohabitant             | 0          | 1032.95        |
      | cohabitant             | 400        | 632.95         |
      | cohabitant             | 800        | 232.95         |
      | cohabitant             | 1032.95    | 0              |

  Scénario: Obligations liées à la GRAPA
    Étant donné que je suis éligible à la GRAPA
    Quand j'accepte la GRAPA
    Alors je dois déclarer tout changement de situation au SFP
    Et je dois déclarer tout changement de ressources
    Et je dois résider effectivement en Belgique
    Et je ne peux pas m'absenter plus de 29 jours par an
    Et je dois avoir épuisé mes droits aux pensions belges et étrangères
    Et la GRAPA est récupérable sur ma succession (au-delà de 32612.44€)

  Scénario: Demande de GRAPA - procédure administrative
    Étant donné que j'ai 65 ans
    Et que je veux demander la GRAPA
    Quand je commence la procédure
    Alors je dois introduire ma demande au Service Fédéral des Pensions (SFP)
    Et je peux le faire via MyPension.be
    Et je peux le faire dans un point pension
    Et je peux le faire par courrier recommandé
    Et le SFP examine automatiquement mon droit lors de ma demande de pension
    Et le SFP vérifie mes ressources et celles de mon conjoint/cohabitant
    Et la décision est prise dans les 4 mois

  Scénario: Cumul GRAPA avec autres revenus
    Étant donné que je suis une personne isolée de 70 ans
    Et que je bénéficie de la GRAPA
    Et que je commence une activité professionnelle limitée
    Et que je gagne 200€ par mois
    Quand je déclare ce changement au SFP
    Alors une partie de mes revenus professionnels est exonérée
    Et l'exonération est de "5000€ par an pour personne isolée"
    Et ma GRAPA est recalculée avec "revenus - exonération"

  Scénario: GRAPA et aide sociale du CPAS
    Étant donné que je suis bénéficiaire de la GRAPA
    Et que j'ai des difficultés financières supplémentaires
    Quand je demande une aide au CPAS
    Alors le CPAS peut octroyer une aide sociale complémentaire
    Et cette aide est évaluée selon mes besoins spécifiques
    Et elle peut couvrir "frais médicaux, chauffage, loyer"
    Mais le CPAS tient compte de ma GRAPA dans le calcul

  Scénario: Révision GRAPA suite à changement de situation
    Étant donné que je suis bénéficiaire GRAPA isolé
    Et que je reçois 1549.42€ par mois
    Et que je déménage pour vivre avec mon enfant
    Quand je déclare ce changement dans les 30 jours
    Alors ma catégorie passe de "isolé" à "cohabitant"
    Et ma GRAPA est recalculée à 1032.95€ maximum
    Et le changement prend effet le mois suivant