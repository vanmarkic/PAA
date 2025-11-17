# language: fr
Fonctionnalité: Tarif Social Énergie
  En tant que ménage à revenus modestes ou situation sociale particulière
  Je veux savoir si j'ai droit au tarif social pour l'électricité et le gaz
  Afin de réduire mes factures d'énergie

  Contexte:
    Étant donné que les tarifs sociaux novembre 2024 sont:
      | Type d'énergie        | Tarif social              | Unité          | Révision      |
      | Électricité simple    | 22.773 cents              | par kWh        | Trimestrielle |
      | Électricité bihoraire | Variable jour/nuit        | par kWh        | Trimestrielle |
      | Électricité nuit      | Tarif réduit              | par kWh        | Trimestrielle |
      | Gaz naturel           | 4.745 cents               | par kWh        | Trimestrielle |
      | Chaleur               | Tarif unique              | par kWh        | Trimestrielle |
    Et que les catégories de bénéficiaires automatiques sont:
      | Catégorie                                      | Application      | Depuis         |
      | Allocataires sociaux (GRAPA, RIS, etc.)       | Automatique      | En vigueur     |
      | Personnes handicapées reconnues                | Automatique      | En vigueur     |
      | Enfants avec allocation familiale majorée     | Automatique      | En vigueur     |
      | Locataires sociaux (gaz collectif)            | Sur attestation  | En vigueur     |
      | BIM (Intervention Majorée)                    | Supprimé         | 01/07/2023     |
    Et que le tarif est fixé par la CREG (Commission de Régulation de l'Électricité et du Gaz)
    Et que l'application est automatique via le SPF Économie pour les clients protégés fédéraux

  Scénario: Bénéficiaire RIS avec application automatique
    Étant donné que je bénéficie du RIS à 1070.49€/mois
    Et que j'ai un contrat d'électricité et de gaz
    Et que je suis client chez un fournisseur commercial
    Et que le SPF Économie a transmis mes données
    Quand mon fournisseur reçoit la liste trimestrielle
    Alors le tarif social est appliqué automatiquement
    Et ma facture d'électricité passe à 22.773 cents/kWh
    Et ma facture de gaz passe à 4.745 cents/kWh
    Et aucune démarche n'est requise de ma part
    Et le tarif s'applique rétroactivement au début du trimestre

  Scénario: Personne handicapée avec reconnaissance
    Étant donné que j'ai une reconnaissance de handicap à 65%
    Et que je reçois une allocation de remplacement de revenus
    Et que j'ai un compteur électrique bihoraire
    Et que ma consommation mensuelle est de 300 kWh
    Quand le tarif social est appliqué
    Alors ma facture est calculée au tarif social bihoraire
    Et l'économie est d'environ 40-50% sur le prix normal
    Et le tarif est maintenu tant que mon statut est valide
    Et la révision est automatique chaque trimestre

  Scénario: Famille avec enfant handicapé bénéficiaire
    Étant donné que mon enfant reçoit une allocation familiale majorée
    Et que l'enfant a une reconnaissance de handicap
    Et que nous vivons dans le même ménage
    Et que nous consommons 4000 kWh d'électricité par an
    Quand le SPF vérifie notre éligibilité
    Alors tout le ménage bénéficie du tarif social
    Et l'économie annuelle est d'environ 500-800€
    Et le tarif s'applique à toute la consommation du ménage
    Et pas de limite de consommation

  Scénario: Personne GRAPA avec tarif social
    Étant donné que je bénéficie de la GRAPA à 1549.42€/mois
    Et que je vis seul
    Et que j'ai un chauffage électrique
    Et que ma consommation hivernale est élevée
    Quand le tarif social est appliqué
    Alors ma facture d'électricité est plafonnée à 22.773 cents/kWh
    Et aucun frais fixe n'est supprimé
    Et l'abonnement reste dû
    Et l'économie est significative en période hivernale

  Scénario: Locataire social avec chauffage collectif
    Étant donné que je suis locataire d'un logement social
    Et que l'immeuble a un chauffage collectif au gaz
    Et que les charges sont réparties entre locataires
    Et que j'ai une attestation de la société de logement
    Quand je transmets l'attestation au gestionnaire
    Alors j'ai droit à la prime tarif social depuis septembre 2024
    Et la prime compense la différence avec le tarif social
    Et le calcul est basé sur ma quote-part
    Et la prime est versée directement

  Scénario: Ancien bénéficiaire BIM après juillet 2023
    Étant donné que je bénéficiais du BIM avant juillet 2023
    Et que j'avais le tarif social automatique
    Et que je n'ai pas d'autre statut social
    Et que mes revenus restent modestes
    Quand la règle change au 1er juillet 2023
    Alors je perds le tarif social automatique
    Et je dois vérifier si j'ai un autre statut éligible
    Et je peux demander une attestation si éligible
    Et sinon je reviens au tarif commercial normal

  Scénario: Médiation de dettes avec difficultés de paiement
    Étant donné que je suis en médiation de dettes judiciaire
    Et que j'ai des arriérés sur mes factures d'énergie
    Et que le médiateur gère mon budget
    Et que mes revenus sont insuffisants
    Quand je demande le tarif social via attestation
    Alors mon éligibilité est évaluée au cas par cas
    Et je dois fournir l'attestation du médiateur
    Et si accordé, le tarif s'applique pour 1 an
    Et le renouvellement nécessite une nouvelle attestation

  Scénario: Changement de fournisseur avec tarif social
    Étant donné que je bénéficie du tarif social
    Et que je veux changer de fournisseur d'énergie
    Et que mon statut reste valide
    Quand je change de fournisseur
    Alors le tarif social est transféré automatiquement
    Et le nouveau fournisseur est informé par le SPF
    Et aucune interruption du tarif social
    Et le même tarif CREG s'applique chez tous les fournisseurs

  Scénario: Résidence avec compteur collectif
    Étant donné que je vis dans une résidence avec compteur collectif
    Et que je suis éligible au tarif social (RIS)
    Et que l'électricité est facturée via le syndic
    Et que la nouvelle prime existe depuis septembre 2024
    Quand je demande la prime tarif social
    Alors je dois fournir une attestation d'éligibilité
    Et la prime compense le différentiel de tarif
    Et le calcul est basé sur ma consommation estimée
    Et la prime est versée directement à moi

  Scénario: Contrôle trimestriel et mise à jour
    Étant donné que je bénéficie du tarif social
    Quand la CREG révise les tarifs trimestriellement
    Alors mon tarif est ajusté automatiquement
    Et les nouveaux tarifs s'appliquent au 1er du trimestre
    Et ma situation est vérifiée via le SPF
    Et si je ne suis plus éligible, le tarif normal reprend
    Et je reçois une notification de changement

  Plan du Scénario: Économies selon profil de consommation
    Étant donné que je suis <situation>
    Et que ma consommation annuelle est <conso_elec> kWh électricité
    Et que ma consommation annuelle est <conso_gaz> kWh gaz
    Et que je bénéficie du tarif social
    Quand je compare avec le tarif commercial moyen
    Alors l'économie annuelle électricité est environ <eco_elec>€
    Et l'économie annuelle gaz est environ <eco_gaz>€
    Et l'économie totale est environ <eco_totale>€

    Exemples:
      | situation              | conso_elec | conso_gaz | eco_elec | eco_gaz | eco_totale |
      | personne isolée        | 2000       | 5000      | 200      | 150     | 350        |
      | couple sans enfants    | 3500       | 12000     | 350      | 360     | 710        |
      | famille 2 enfants      | 4500       | 18000     | 450      | 540     | 990        |
      | famille nombreuse      | 6000       | 25000     | 600      | 750     | 1350       |
      | appartement électrique | 8000       | 0         | 800      | 0       | 800        |

  Scénario: Procédure pour client non automatique
    Étant donné que j'ai droit au tarif social
    Mais que je ne suis pas client protégé fédéral automatique
    Quand je veux bénéficier du tarif social
    Alors je dois obtenir une attestation:
      | Organisme                      | Document                          | Validité   |
      | SPF Sécurité Sociale          | Attestation GRAPA                 | 1 an       |
      | CPAS                           | Attestation RIS                   | 1 an       |
      | SPF Personnes Handicapées      | Attestation allocation            | Permanente |
      | Mutualité                      | Attestation enfant handicapé      | 1 an       |
      | Société logement social        | Attestation locataire social     | 1 an       |
    Et je transmets l'attestation à mon fournisseur
    Et le tarif s'applique dans les 10 jours ouvrables
    Et je dois renouveler selon la validité

  Scénario: Impact sur la facture mensuelle
    Étant donné que je consomme 250 kWh d'électricité par mois
    Et que je consomme 800 kWh de gaz par mois
    Et que j'ai le tarif social
    Quand ma facture est calculée
    Alors le coût électricité est 250 × 0.22773 = 56.93€
    Et le coût gaz est 800 × 0.04745 = 37.96€
    Et le total énergie est 94.89€ (hors frais fixes)
    Et comparé au tarif normal (~180€), j'économise ~85€/mois
    Et l'économie annuelle est environ 1,020€