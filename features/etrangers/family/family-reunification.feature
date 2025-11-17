# language: fr
Fonctionnalité: Regroupement familial en Belgique
  En tant que membre de famille d'une personne résidant en Belgique
  Je veux demander le regroupement familial
  Afin de vivre avec ma famille en Belgique

  Contexte:
    Étant donné que les conditions de revenus 2024 sont:
      | Situation du regroupant       | Revenu minimum mensuel |
      | Belge ou UE                   | 1953€ (120% RIS famille) |
      | Ressortissant pays tiers      | 1953€ + charges        |
      | Étudiant                      | 730€/mois              |
      | Pensionné                     | Montant pension minimum |

  Scénario: Regroupement familial conjoint de Belge
    Étant donné que mon conjoint est belge
    Et que nous sommes mariés depuis 2 ans
    Et que nous avons vécu ensemble à l'étranger
    Et que mon conjoint a des revenus stables de 2100€/mois
    Et que nous avons un logement de 60m² avec 2 chambres
    Et que j'ai une assurance maladie
    Quand je demande le regroupement familial article 40ter
    Alors je devrais être éligible
    Et je devrais obtenir une carte F
    Et le délai maximum devrait être 6 mois
    Et je devrais avoir un droit de séjour temporaire de 5 ans

  Scénario: Regroupement familial enfant mineur
    Étant donné que mon père a une carte B en Belgique
    Et que j'ai 15 ans
    Et que mes parents ont l'autorité parentale conjointe
    Et que mon père a des revenus de 2000€/mois
    Et que j'ai un acte de naissance légalisé
    Quand je demande le regroupement familial
    Alors je devrais être automatiquement éligible
    Et aucun test ADN ne devrait être requis
    Et je devrais obtenir le même type de carte que mon père

  Scénario: Regroupement familial partenaire enregistré
    Étant donné que mon partenaire a une carte E (citoyen UE)
    Et que nous avons un partenariat enregistré équivalent au mariage
    Et que nous avons une relation stable de 3 ans
    Et que nous avons cohabité pendant 1 an
    Et que mon partenaire travaille en Belgique
    Quand je demande le regroupement familial
    Alors je devrais être éligible
    Et je devrais obtenir une carte F
    Et mes droits devraient être similaires aux conjoints

  Scénario: Regroupement familial ascendant à charge
    Étant donné que mon fils est belge
    Et que j'ai 68 ans
    Et que je suis à sa charge financièrement
    Et que je n'ai pas de ressources dans mon pays
    Et que mon fils a des revenus de 3000€/mois
    Et que j'ai une assurance maladie complète
    Quand je demande le regroupement familial comme ascendant
    Alors je devrais prouver la dépendance financière
    Et je devrais fournir des preuves de virements réguliers
    Et le délai d'examen devrait être plus long
    Et je pourrais obtenir une carte F

  Scénario: Regroupement familial étudiant étranger
    Étant donné que je suis étudiant avec une carte A
    Et que mon conjoint veut me rejoindre
    Et que j'ai une bourse d'études de 1200€/mois
    Et que nous avons un logement étudiant familial
    Et que mon conjoint a une assurance maladie
    Quand mon conjoint demande le regroupement familial
    Alors il devrait être éligible sous conditions
    Et il devrait obtenir une carte A liée à mon statut
    Et la validité devrait correspondre à mes études

  Scénario: Refus pour revenus insuffisants
    Étant donné que mon conjoint est belge
    Et que ses revenus sont de 1200€/mois
    Et que c'est inférieur au seuil de 1953€
    Et qu'il n'a pas de revenus stables
    Quand je demande le regroupement familial
    Alors ma demande devrait être refusée
    Et le motif devrait être "revenus insuffisants"
    Et je pourrais refaire une demande quand les revenus augmentent

  Scénario: Procédure de cohabitation légale
    Étant donné que mon partenaire est belge
    Et que nous ne sommes pas mariés
    Et que nous voulons faire une cohabitation légale
    Et que nous avons une relation de 2 ans
    Et que j'ai un titre de séjour temporaire
    Quand nous faisons la déclaration de cohabitation
    Alors l'officier d'état civil devrait faire une enquête
    Et vérifier qu'il ne s'agit pas d'une relation de complaisance
    Et après 6 mois, je pourrais demander un séjour

  Scénario: Maintien du droit après divorce
    Étant donné que j'ai une carte F depuis 4 ans
    Et que je divorce de mon conjoint belge
    Et que nous avons des enfants communs belges
    Et que j'ai la garde partagée
    Et que j'ai un emploi stable
    Quand je demande le maintien de mon droit de séjour
    Alors je devrais pouvoir garder ma carte F
    Et je devrais prouver mon intégration
    Et je pourrais demander une carte B après 5 ans

  Scénario: Regroupement familial réfugié reconnu
    Étant donné que j'ai le statut de réfugié en Belgique
    Et que ma famille est restée dans le pays d'origine
    Et que j'ai été reconnu il y a 6 mois
    Quand ma famille demande le regroupement familial
    Alors aucune condition de revenu ne devrait s'appliquer
    Et aucune condition de logement ne devrait s'appliquer
    Et la procédure devrait être gratuite si dans l'année
    Et ils devraient obtenir le même statut de protection

  Plan du Scénario: Délais de traitement selon le type
    Étant donné que je demande un regroupement familial <type>
    Et que mon dossier est complet
    Quand je soumets ma demande
    Alors le délai maximum devrait être <delai> jours

    Exemples:
      | type                    | delai |
      | conjoint de Belge      | 180   |
      | conjoint de UE         | 180   |
      | conjoint pays tiers    | 270   |
      | enfant mineur          | 180   |
      | ascendant à charge     | 270   |
      | membre famille réfugié | 90    |

  Scénario: Contrôle de la cellule familiale
    Étant donné que j'ai obtenu une carte F par mariage
    Et que je vis en Belgique depuis 2 ans
    Quand l'Office des Étrangers fait un contrôle
    Alors ils peuvent vérifier la réalité de la vie commune
    Et demander des preuves de vie familiale effective
    Et en cas de séparation non justifiée
    Mon titre de séjour pourrait être retiré
    Sauf si j'ai des raisons humanitaires