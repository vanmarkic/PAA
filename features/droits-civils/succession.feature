# language: fr
Fonctionnalité: Procédures de Succession
  En tant qu'héritier ou ayant droit
  Je veux gérer une succession
  Afin de régler la transmission du patrimoine

  Contexte:
    Étant donné que les options successorales sont:
      | Option                        | Délai      | Effet                           |
      | Acceptation pure et simple    | 30 ans     | Hérite actif et passif         |
      | Acceptation sous bénéfice    | 3 mois 40j | Hérite actif, passif limité    |
      | Renonciation                 | 30 ans     | Aucun héritage                 |
    Et que l'ordre des héritiers est:
      | Ordre | Héritiers                          |
      | 1     | Descendants (enfants, petits-enfants) |
      | 2     | Ascendants privilégiés et collatéraux privilégiés |
      | 3     | Ascendants ordinaires              |
      | 4     | Collatéraux ordinaires             |

  Scénario: Déclaration de succession simple
    Étant donné qu'un parent est décédé il y a 2 mois
    Et que je suis son unique enfant
    Et que le patrimoine est inférieur à 250.000€
    Et qu'il n'y a pas de testament
    Quand je déclare la succession
    Alors je dois:
      | Action                                    | Délai         |
      | Déposer déclaration au bureau Sécurité juridique | 4 mois    |
      | Fournir acte de décès                   | Avec déclaration |
      | Lister tous les biens                   | Dans déclaration |
      | Déclarer toutes les dettes              | Dans déclaration |
      | Payer les droits de succession          | 2 mois après    |
    Et les droits de succession en ligne directe sont:
      | Tranche           | Taux    |
      | 0-50.000€        | 3%      |
      | 50.000-250.000€  | 9%      |
      | Plus de 250.000€ | 27%     |

  Scénario: Succession avec testament
    Étant donné qu'un parent est décédé avec un testament
    Et que le testament est déposé chez un notaire
    Quand le notaire ouvre le testament
    Alors il doit:
      | Action                                |
      | Consulter le registre des testaments |
      | Convoquer tous les héritiers        |
      | Lire le testament                    |
      | Vérifier la réserve héréditaire     |
    Et la réserve héréditaire est:
      | Situation              | Réserve        | Quotité disponible |
      | 1 enfant              | 1/2            | 1/2               |
      | 2 enfants             | 2/3            | 1/3               |
      | 3 enfants ou plus     | 3/4            | 1/4               |
      | Conjoint seul         | Usufruit 1/2   | Reste             |

  Scénario: Acceptation sous bénéfice d'inventaire
    Étant donné que le défunt avait des dettes importantes
    Et que je ne connais pas l'étendue exacte du patrimoine
    Et que je veux limiter ma responsabilité
    Quand j'accepte sous bénéfice d'inventaire
    Alors je dois:
      | Action                                    | Lieu              |
      | Faire une déclaration                   | Greffe tribunal   |
      | Dans les 3 mois et 40 jours            | Délai légal       |
      | Faire dresser un inventaire            | Par notaire       |
      | Publier au Moniteur Belge              | Obligatoire       |
    Et je ne suis responsable des dettes qu'à concurrence de l'actif
    Et je dois gérer la succession séparément de mon patrimoine

  Scénario: Renonciation à la succession
    Étant donné que le défunt avait plus de dettes que d'actifs
    Et que je ne veux pas hériter des dettes
    Quand je renonce à la succession
    Alors je dois:
      | Action                              | Détails                |
      | Déclarer la renonciation           | Au greffe du tribunal  |
      | Dans les 30 ans                    | Mais mieux rapidement  |
      | Payer les frais de greffe          | Environ 75€           |
    Et je ne peux plus revenir sur cette décision
    Et mes enfants peuvent accepter à ma place si mineurs
    Et ma part accroît celle des autres héritiers

  Scénario: Succession internationale
    Étant donné que le défunt avait des biens en France et en Belgique
    Et qu'il était résident belge
    Et que le règlement européen sur les successions s'applique
    Quand je gère la succession
    Alors s'applique:
      | Règle                                    |
      | Loi du dernier domicile (Belgique)     |
      | Sauf choix de loi nationale            |
      | Certificat successoral européen possible |
      | Double imposition à éviter              |
    Et je dois déclarer dans chaque pays où il y a des biens
    Et les conventions fiscales s'appliquent

  Scénario: Partage de succession conflictuel
    Étant donné que nous sommes 3 héritiers
    Et que nous ne sommes pas d'accord sur le partage
    Et qu'un héritier veut vendre et les autres non
    Quand nous ne trouvons pas d'accord amiable
    Alors nous pouvons:
      | Option                          | Procédure                |
      | Demander un partage judiciaire | Tribunal de la famille   |
      | Désigner un notaire liquidateur| Sur accord ou par juge   |
      | Vendre aux enchères publiques  | Si indivision impossible |
      | Racheter les parts             | Droit de préemption      |
    Et les frais de procédure réduisent la succession
    Et le partage peut prendre plusieurs années

  Scénario: Donation avec réserve d'usufruit
    Étant donné qu'un parent veut transmettre de son vivant
    Et qu'il veut garder les revenus du bien
    Quand il fait une donation avec réserve d'usufruit
    Alors:
      | Aspect                        | Détail                      |
      | Le parent garde l'usufruit   | Jusqu'à son décès          |
      | Les enfants ont la nue-propriété | Immédiatement           |
      | Droits de donation réduits   | Sur la nue-propriété seule |
      | Pas de droits de succession  | Au décès sur ce bien       |
    Et l'acte doit être passé devant notaire
    Et les droits de donation sont:
      | Ligne directe    | Taux          |
      | 0-150.000€      | 3%            |
      | 150.000-250.000€| 9%            |
      | Plus de 250.000€| 27%           |

  Plan du Scénario: Droits de succession selon le lien de parenté
    Étant donné que je suis <lien> du défunt
    Et que j'hérite de <montant>€
    Alors les droits de succession sont de <taux>%

    Exemples:
      | lien           | montant  | taux |
      | enfant         | 40000    | 3    |
      | enfant         | 100000   | 9    |
      | frère/sœur    | 50000    | 30   |
      | neveu/nièce   | 50000    | 35   |
      | non-parent    | 50000    | 60   |