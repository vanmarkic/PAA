# language: fr
Fonctionnalité: Naturalisation et acquisition de la nationalité belge
  En tant qu'étranger résidant en Belgique
  Je veux acquérir la nationalité belge
  Afin de devenir citoyen belge avec tous les droits

  Contexte:
    Étant donné que les voies d'acquisition sont:
      | Procédure          | Durée résidence | Conditions principales      |
      | Naturalisation     | 5 ans          | Intégration + participation |
      | Déclaration 12bis  | 5 ans          | Intégration sociale        |
      | Déclaration 12bis/1| 10 ans         | Conditions allégées        |
      | Par mariage        | 3 ans          | Vie commune avec Belge     |
      | Option (18-22 ans) | Variable       | Parents belges ou naissance|

  Scénario: Naturalisation après 5 ans de résidence
    Étant donné que je réside légalement depuis 5 ans
    Et que j'ai eu un séjour illimité les 5 dernières années
    Et que j'ai travaillé 468 jours sur 5 ans
    Et que j'ai un diplôme belge du secondaire supérieur
    Et que je parle français au niveau A2
    Et que je n'ai pas de condamnations pénales graves
    Quand je demande la naturalisation
    Alors je dois déposer le dossier à la commune
    Et payer 150€ de frais de dossier
    Et fournir mon acte de naissance intégral
    Et attendre la décision de la Chambre (12 mois)
    Et si accepté, je deviens belge

  Scénario: Déclaration de nationalité par intégration sociale
    Étant donné que je réside légalement depuis 5 ans
    Et que j'ai une carte B ou C
    Et que j'ai suivi un parcours d'intégration
    Et que j'ai un certificat de langue A2
    Et que j'ai participé économiquement ou socialement
    Et que je n'ai pas de faits personnels graves
    Quand je fais une déclaration de nationalité
    Alors je la dépose à l'officier d'état civil
    Et le parquet a 4 mois pour s'opposer
    Et si pas d'opposition, je deviens belge
    Et je reçois un acte de nationalité

  Scénario: Nationalité après 10 ans de résidence
    Étant donné que je réside légalement depuis 10 ans
    Et que j'ai toujours respecté mes obligations
    Et que je connais une langue nationale
    Et que je participe à la vie de ma communauté
    Quand je demande la nationalité
    Alors les conditions sont plus souples
    Et je dois prouver ma participation sociale
    Et le délai est de 4 mois
    Et c'est une procédure déclarative

  Scénario: Nationalité par mariage avec un Belge
    Étant donné que je suis marié avec un(e) Belge
    Et que nous sommes mariés depuis 3 ans
    Et que nous vivons ensemble en Belgique
    Et que j'ai un titre de séjour de plus de 3 ans
    Et que je parle une langue nationale (A2)
    Et que je prouve mon intégration sociale
    Quand je demande la nationalité
    Alors je dois prouver la vie commune effective
    Et avoir résidé ensemble minimum 3 ans
    Et le parquet vérifie le mariage
    Et la procédure dure 4 mois

  Scénario: Option de nationalité pour jeune majeur
    Étant donné que j'ai 19 ans
    Et que je suis né en Belgique
    Et que mes parents étrangers y résidaient légalement
    Et que j'ai toujours vécu en Belgique
    Et que j'ai ma résidence principale ici
    Quand je fais la déclaration d'option
    Alors c'est un droit entre 18 et 22 ans
    Et je dois le faire avant mes 22 ans
    Et c'est automatique si conditions remplies
    Et je deviens belge immédiatement

  Scénario: Nationalité pour apatride reconnu
    Étant donné que je suis reconnu apatride
    Et que j'ai une carte B depuis 2 ans
    Et que je réside en Belgique depuis 3 ans
    Et que je parle une langue nationale
    Quand je demande la nationalité
    Alors j'ai une procédure accélérée
    Et les conditions sont allégées
    Et je dois prouver mon intégration
    Et la procédure dure 4 mois

  Scénario: Refus pour condamnation pénale
    Étant donné que je remplis les conditions de résidence
    Et que je parle français niveau A2
    Mais que j'ai été condamné à 8 mois de prison
    Et que c'était il y a 3 ans
    Quand je demande la nationalité
    Alors ma demande sera probablement refusée
    Et le motif sera "faits personnels graves"
    Et je dois attendre 10 ans après la condamnation
    Et demander la réhabilitation

  Scénario: Nationalité pour enfant né en Belgique
    Étant donné qu'un enfant est né en Belgique
    Et que ses parents sont étrangers
    Et qu'ils résident légalement depuis 10 ans
    Et que l'enfant a toujours vécu en Belgique
    Quand l'enfant atteint 12 ans
    Alors les parents peuvent demander pour lui
    Et si accepté avant ses 18 ans
    Il devient belge automatiquement

  Scénario: Perte de nationalité d'origine
    Étant donné que je deviens belge par naturalisation
    Et que mon pays n'accepte pas la double nationalité
    Quand j'acquiers la nationalité belge
    Alors je perds automatiquement ma nationalité d'origine
    Et je dois en être informé avant
    Et évaluer les conséquences
    Et je ne peux pas renoncer à la nationalité belge facilement

  Scénario: Preuve de participation économique
    Étant donné que je demande la naturalisation
    Et que je dois prouver ma participation économique
    Quand je constitue mon dossier
    Alors je peux prouver:
      | 468 jours de travail sur 5 ans
      | Ou diplôme belge ou équivalent
      | Ou formation professionnelle de 400h
      | Ou cours d'intégration réussi
      | Ou activité indépendante 18 mois

  Scénario: Test de connaissance langue et société
    Étant donné que je demande la nationalité
    Et que je dois prouver mes connaissances
    Quand je passe les tests requis
    Alors je dois avoir le niveau A2 en langue
    Et connaître les droits et devoirs des citoyens
    Et comprendre l'histoire et institutions belges
    Et obtenir les certificats requis

  Plan du Scénario: Délais selon la procédure
    Étant donné que je demande la nationalité par <procedure>
    Et que mon dossier est complet
    Quand ma demande est traitée
    Alors le délai devrait être <delai> mois

    Exemples:
      | procedure           | delai |
      | naturalisation      | 12    |
      | déclaration 5 ans   | 4     |
      | déclaration 10 ans  | 4     |
      | mariage             | 4     |
      | option 18-22 ans    | 1     |

  Scénario: Recours après refus de nationalité
    Étant donné que ma demande de nationalité est refusée
    Et que je conteste les motifs
    Quand je fais un recours
    Alors je dois m'adresser au tribunal de première instance
    Et le faire dans les 15 jours
    Et je peux contester les faits ou l'interprétation
    Et le tribunal statue dans les 2 mois
    Et je peux faire appel de la décision