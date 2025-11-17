# language: fr
Fonctionnalité: Procédures de Mariage Civil
  En tant que personne souhaitant se marier
  Je veux suivre la procédure légale de mariage
  Afin de formaliser mon union civile

  Contexte:
    Étant donné que les conditions légales sont:
      | Condition                | Valeur                    |
      | Âge minimum             | 18 ans                    |
      | Délai déclaration       | 14 jours minimum          |
      | Délai maximum           | 365 jours                 |
      | Témoins requis          | 2 minimum, 4 maximum      |

  Scénario: Déclaration de mariage entre deux majeurs belges
    Étant donné que nous sommes deux personnes majeures
    Et que nous sommes tous les deux belges
    Et que nous sommes célibataires
    Et que nous n'avons pas de lien de parenté prohibé
    Quand nous faisons une déclaration de mariage à la commune
    Alors nous devons fournir:
      | Document                           |
      | Acte de naissance récent          |
      | Preuve d'identité                |
      | Preuve de célibat                |
      | Certificat de résidence          |
    Et la publication des bans devrait être affichée pendant 14 jours
    Et nous pouvons choisir une date de célébration après ce délai
    Et le coût devrait être de 50€

  Scénario: Mariage avec un ressortissant étranger
    Étant donné que je suis belge
    Et que mon/ma partenaire est de nationalité française
    Et que nous sommes tous les deux célibataires
    Quand nous déclarons notre mariage
    Alors nous devons fournir des documents supplémentaires:
      | Document                                    |
      | Certificat de coutume                      |
      | Certificat de célibat du pays d'origine    |
      | Traduction jurée des documents étrangers   |
      | Légalisation/Apostille selon le pays       |
    Et le parquet doit donner son avis
    Et le délai peut être prolongé jusqu'à 5 mois

  Scénario: Refus de mariage pour bigamie
    Étant donné que je suis déjà marié(e)
    Et que mon divorce n'est pas finalisé
    Quand je tente de déclarer un nouveau mariage
    Alors ma demande devrait être refusée
    Et le motif devrait être "Bigamie interdite - Article 147 Code Civil"
    Et je devrais attendre la transcription du divorce

  Scénario: Mariage entre cousins germains
    Étant donné que nous sommes cousins germains
    Et que nous souhaitons nous marier
    Quand nous déclarons notre mariage
    Alors notre demande devrait être acceptée
    Car le mariage entre cousins germains est autorisé en Belgique
    Mais nous devons prouver le lien de parenté exact

  Scénario: Opposition au mariage par un parent
    Étant donné qu'une déclaration de mariage est publiée
    Et qu'un parent forme opposition pour "mariage blanc suspecté"
    Quand l'officier de l'état civil examine l'opposition
    Alors le mariage devrait être suspendu
    Et une enquête devrait être menée
    Et le tribunal de la famille peut être saisi
    Et le délai maximum de suspension est de 6 mois

  Scénario: Cohabitation légale comme alternative au mariage
    Étant donné que nous ne souhaitons pas nous marier
    Mais que nous voulons une reconnaissance légale
    Et que nous sommes majeurs et capables
    Quand nous déclarons une cohabitation légale
    Alors nous devons:
      | Requirement                          |
      | Résider ensemble                    |
      | Signer une convention               |
      | Ne pas être mariés                 |
      | Ne pas avoir d'autre cohabitation  |
    Et les effets juridiques sont limités par rapport au mariage
    Et le coût devrait être de 25€

  Scénario: Divorce par consentement mutuel
    Étant donné que nous sommes mariés depuis plus d'un an
    Et que nous sommes d'accord pour divorcer
    Et que nous avons un accord sur:
      | Aspect                    |
      | Partage des biens        |
      | Pension alimentaire      |
      | Garde des enfants        |
      | Domicile conjugal        |
    Quand nous introduisons une procédure de divorce
    Alors nous devons passer devant le notaire ou le tribunal
    Et la procédure peut durer minimum 1 mois
    Et le coût dépend du notaire (500-1500€)

  Scénario: Divorce pour désunion irrémédiable
    Étant donné que nous sommes séparés depuis 12 mois
    Et qu'il n'y a pas d'accord mutuel
    Quand je demande le divorce pour désunion
    Alors je dois prouver:
      | Preuve                                |
      | Séparation de fait de 12 mois       |
      | OU séparation de fait de 6 mois     |
      | après 2 comparutions (3 mois écart) |
    Et le tribunal décide des modalités
    Et la procédure peut durer 6-18 mois

  Plan du Scénario: Vérification des empêchements au mariage
    Étant donné que les futurs époux ont un lien de <parente>
    Quand ils déclarent leur mariage
    Alors le mariage devrait être <decision>
    Et le motif serait "<motif>"

    Exemples:
      | parente              | decision | motif                                    |
      | frère-sœur          | refusé   | Parenté en ligne directe prohibée      |
      | parent-enfant       | refusé   | Parenté en ligne directe prohibée      |
      | oncle-nièce        | refusé   | Parenté collatérale 3e degré prohibée  |
      | cousins germains    | accepté  | Parenté collatérale 4e degré autorisée |
      | aucun              | accepté  | Pas d'empêchement                      |