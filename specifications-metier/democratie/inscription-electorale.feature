# language: fr
Fonctionnalité: Inscription sur les listes électorales
  En tant que citoyen belge ou européen
  Je veux m'inscrire sur les listes électorales
  Afin d'exercer mon droit de vote démocratique

  Contexte:
    Étant donné que l'âge de majorité électorale est 18 ans
    Et que le vote est obligatoire en Belgique pour les citoyens belges
    Et que l'inscription est automatique pour les Belges
    Et que l'inscription est volontaire pour les citoyens européens

  Scénario: Citoyen belge majeur automatiquement inscrit
    Étant donné que je suis un citoyen belge
    Et que j'ai 18 ans
    Et que je réside légalement à Bruxelles
    Et que mon adresse est enregistrée au registre national
    Quand je vérifie mon inscription électorale
    Alors je devrais être automatiquement inscrit
    Et mes droits électoraux devraient inclure "elections-federales"
    Et mes droits électoraux devraient inclure "elections-regionales"
    Et mes droits électoraux devraient inclure "elections-communales"
    Et je devrais recevoir ma convocation électorale par courrier

  Scénario: Citoyen européen s'inscrivant pour les élections communales
    Étant donné que je suis un citoyen européen (français)
    Et que j'ai 25 ans
    Et que je réside à Liège depuis 2 ans
    Et que je n'ai jamais voté en Belgique
    Quand je demande mon inscription pour les élections communales
    Et que je fournis une preuve de résidence
    Et que je signe la déclaration de non-double vote
    Alors ma demande devrait être approuvée
    Et mes droits électoraux devraient inclure "elections-communales"
    Et mes droits électoraux devraient inclure "elections-europeennes"
    Et le vote devrait être facultatif pour moi

  Scénario: Citoyen non-EU tentant de s'inscrire
    Étant donné que je suis un citoyen non-EU (marocain)
    Et que j'ai 30 ans
    Et que je réside légalement en Belgique depuis 5 ans
    Et que j'ai un titre de séjour valide
    Quand je demande mon inscription électorale
    Alors je devrais être éligible uniquement pour "elections-communales"
    Et je dois résider depuis au moins 5 ans dans la commune
    Et je dois signer un engagement de respecter la Constitution

  Scénario: Mineur tentant de s'inscrire
    Étant donné que je suis un citoyen belge
    Et que j'ai 17 ans
    Et que je réside à Namur
    Quand je vérifie mon éligibilité à voter
    Alors je ne devrais pas être éligible
    Et le motif devrait être "âge minimum non atteint (18 ans requis)"
    Et je devrais être informé que l'inscription sera automatique à mes 18 ans

  Scénario: Citoyen ayant perdu ses droits civiques
    Étant donné que je suis un citoyen belge
    Et que j'ai 40 ans
    Et que j'ai été condamné à une interdiction des droits civiques
    Et que l'interdiction court jusqu'au 31/12/2025
    Quand je vérifie mes droits électoraux
    Alors je ne devrais avoir aucun droit électoral actif
    Et le motif devrait être "suspension des droits civiques jusqu'au 31/12/2025"
    Et je devrais être informé de la procédure de réhabilitation

  Scénario: Citoyen belge résidant à l'étranger
    Étant donné que je suis un citoyen belge
    Et que j'ai 35 ans
    Et que je réside en France (Paris)
    Et que je suis inscrit au consulat belge
    Quand je demande mon inscription pour voter depuis l'étranger
    Et que je choisis le mode de vote "postal"
    Alors je devrais être inscrit sur la liste consulaire
    Et mes droits devraient inclure "elections-federales"
    Et mes droits devraient inclure "elections-europeennes"
    Mais je ne peux pas voter pour les élections communales

  Scénario: Radiation pour non-participation répétée
    Étant donné que je suis un citoyen belge
    Et que j'ai 45 ans
    Et que j'ai manqué 4 élections consécutives sans justification
    Et que j'ai reçu des amendes non payées
    Quand l'administration vérifie mon statut électoral
    Alors je devrais être radié des listes électorales
    Et le motif devrait être "abstention répétée non justifiée"
    Et je dois payer les amendes pour retrouver mes droits
    Et le montant total des amendes devrait être au moins 600€

  Plan du Scénario: Inscription selon la nationalité et l'âge
    Étant donné que je suis un citoyen <nationalite>
    Et que j'ai <age> ans
    Et que je réside en Belgique depuis <annees_residence> ans
    Quand je vérifie mes droits électoraux
    Alors mon éligibilité devrait être "<eligible>"
    Et les élections autorisées devraient être "<elections_autorisees>"

    Exemples:
      | nationalite     | age | annees_residence | eligible | elections_autorisees                              |
      | belge           | 18  | 18               | oui      | federales,regionales,communales,europeennes      |
      | belge           | 17  | 17               | non      | aucune                                            |
      | eu-citoyen      | 25  | 3                | oui      | communales,europeennes                           |
      | eu-citoyen      | 18  | 0.5              | partiel  | europeennes                                       |
      | non-eu-resident | 30  | 5                | oui      | communales                                        |
      | non-eu-resident | 30  | 3                | non      | aucune                                            |
      | refugie-reconnu | 21  | 2                | non      | aucune                                            |

  Scénario: Vérification des conditions de résidence
    Étant donné que je suis un citoyen européen
    Et que j'ai 28 ans
    Et que j'ai déménagé 3 fois en 2 ans
      | Date       | Commune    | Durée     |
      | 01/01/2023 | Bruxelles  | 8 mois    |
      | 01/09/2023 | Anvers     | 6 mois    |
      | 01/03/2024 | Gand       | 10 mois   |
    Quand je demande mon inscription à Gand
    Alors ma résidence principale devrait être vérifiée
    Et la durée minimale de résidence devrait être respectée
    Et mon bureau de vote devrait être assigné à Gand

  Scénario: Double inscription interdite
    Étant donné que je suis un citoyen européen (néerlandais)
    Et que je suis déjà inscrit pour voter aux Pays-Bas
    Et que je réside maintenant en Belgique
    Quand je demande mon inscription en Belgique
    Alors je dois choisir où exercer mon droit de vote
    Et je dois signer une déclaration de non-double vote
    Et mon inscription précédente devrait être annulée automatiquement