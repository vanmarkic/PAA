# language: fr
Fonctionnalité: Allocation Chauffage (Fonds Social Chauffage)
  En tant que ménage à revenus modestes
  Je veux savoir si j'ai droit à l'allocation chauffage
  Afin de réduire mes frais de chauffage durant l'hiver

  Contexte:
    Étant donné que les paramètres du Fonds Social Chauffage 2024 sont:
      | Type de combustible         | Montant/Conditions                                        |
      | Gasoil de chauffage vrac    | 14 à 20 cents/litre (max 1500 litres)                   |
      | Gasoil à la pompe (type c)  | Forfait 210€ par ménage par période                     |
      | Pétrole lampant à la pompe  | Forfait 210€ par ménage par période                     |
      | Gaz propane en vrac         | 14 à 20 cents/litre (max 1500 litres)                   |
    Et que les plafonds de revenus 2024 sont:
      | Catégorie                   | Plafond annuel brut      | Majoration par personne à charge |
      | Ménage catégorie 1-2        | 16,965.47€               | 3,140.77€                        |
      | Personne à charge           | Revenus nets < 3,980€    | (hors allocations familiales)    |
    Et que la période de chauffe s'étend du 1er janvier au 31 décembre
    Et que les catégories de bénéficiaires sont:
      | Catégorie | Description                                                    |
      | 1         | Bénéficiaires d'intervention majorée (BIM)                   |
      | 2         | Ménages à revenus limités                                     |
      | 3         | Personnes en médiation de dettes/règlement collectif          |

  Scénario: Personne isolée BIM éligible à l'allocation forfaitaire
    Étant donné que je suis une personne isolée
    Et que je bénéficie de l'intervention majorée (BIM)
    Et que j'achète du pétrole lampant à la pompe
    Et que j'ai une facture de 180€ datée du 15 février 2024
    Quand je demande l'allocation chauffage au CPAS
    Alors je devrais être éligible au forfait
    Et le montant de l'allocation devrait être 210€
    Et je dois introduire ma demande dans les 60 jours
    Et la catégorie est "catégorie 1 - BIM"

  Scénario: Famille avec livraison de gasoil éligible
    Étant donné que je suis en couple avec 2 enfants
    Et que notre revenu annuel brut est de 20,000€
    Et que le plafond adapté est 16,965.47€ + (2 × 3,140.77€) = 23,247.01€
    Et que nous avons une livraison de 1000 litres de gasoil
    Et que le prix est de 0.95€/litre
    Et que la facture date du 10 mars 2024
    Quand nous demandons l'allocation chauffage
    Alors nous devrions être éligibles
    Et le montant devrait être entre 140€ et 200€
    Et le calcul est "1000 litres × 14-20 cents/litre"
    Et la catégorie est "catégorie 2 - revenus limités"

  Scénario: Ménage avec livraison dépassant le maximum
    Étant donné que je suis une personne isolée
    Et que mon revenu annuel brut est de 15,000€
    Et que j'ai une livraison de 2000 litres de gasoil
    Et que la facture date du 20 janvier 2024
    Quand je demande l'allocation chauffage
    Alors je devrais être éligible
    Et seuls 1500 litres sont pris en compte
    Et le montant maximum est 1500 × 0.20€ = 300€
    Et l'excédent de 500 litres reste à ma charge

  Scénario: Personne en médiation de dettes éligible
    Étant donné que je suis en médiation de dettes judiciaire
    Et que je ne peux pas payer ma facture de chauffage
    Et que j'ai une attestation du médiateur
    Et que j'ai acheté du gasoil à la pompe pour 250€
    Quand je demande l'allocation via mon médiateur
    Alors je devrais être éligible
    Et le montant forfaitaire est 210€
    Et la catégorie est "catégorie 3 - médiation de dettes"
    Et le médiateur peut introduire la demande pour moi

  Scénario: Revenus trop élevés pour l'allocation
    Étant donné que je suis en couple sans enfants
    Et que notre revenu annuel brut est de 25,000€
    Et que le plafond est 16,965.47€
    Et que nous ne sommes pas BIM
    Et que nous avons une facture de gasoil de 800€
    Quand nous demandons l'allocation chauffage
    Alors nous ne devrions pas être éligibles
    Et le motif devrait être "revenus (25,000€) > plafond (16,965.47€)"
    Et nous pouvons vérifier le fonds énergie du CPAS

  Scénario: Demande hors délai
    Étant donné que je suis éligible au Fonds Social Chauffage
    Et que ma livraison de gasoil date du 1er janvier 2024
    Et que nous sommes le 15 mars 2024
    Et que le délai de 60 jours est dépassé
    Quand je demande l'allocation chauffage
    Alors ma demande devrait être refusée
    Et le motif devrait être "délai de 60 jours dépassé"
    Et aucune exception n'est prévue sauf force majeure

  Scénario: Famille nombreuse avec majoration
    Étant donné que je suis parent isolé avec 4 enfants à charge
    Et que mon revenu annuel brut est de 25,000€
    Et que le plafond adapté est 16,965.47€ + (4 × 3,140.77€) = 29,528.55€
    Et que chaque enfant a des revenus nets < 3,980€
    Et que j'ai une livraison de 1200 litres de gasoil
    Quand je demande l'allocation chauffage
    Alors je devrais être éligible
    Et le montant est calculé sur 1200 litres
    Et l'allocation est entre 168€ et 240€

  Scénario: Propriétaire occupant éligible
    Étant donné que je suis propriétaire de ma maison
    Et que je bénéficie du statut BIM
    Et que j'ai une facture de gasoil de 1,200€
    Et que la livraison est de 1300 litres
    Quand je demande l'allocation chauffage
    Alors je devrais être éligible
    Et le statut de propriétaire n'est pas un obstacle
    Et le montant est calculé sur 1300 litres × 14-20 cents
    Et l'allocation est entre 182€ et 260€

  Scénario: Chauffage collectif en immeuble
    Étant donné que je vis dans un immeuble avec chauffage collectif
    Et que je bénéficie du statut BIM
    Et que les charges de chauffage sont incluses dans mon loyer
    Et que je peux prouver ma part des frais de chauffage
    Quand je demande l'allocation chauffage
    Alors mon éligibilité dépend de la situation
    Et je dois fournir une attestation du syndic
    Et le montant dépend du type de combustible utilisé
    Et le CPAS évalue au cas par cas

  Scénario: Cumul avec d'autres aides
    Étant donné que je bénéficie du RIS à 1070.49€/mois
    Et que je suis dans la catégorie 1 (BIM)
    Et que j'ai une facture de pétrole lampant de 200€
    Quand je demande l'allocation chauffage
    Alors je devrais être éligible
    Et l'allocation chauffage est cumulable avec le RIS
    Et le montant forfaitaire reste 210€
    Et aucune réduction n'est appliquée

  Plan du Scénario: Calcul allocation selon type et quantité
    Étant donné que je suis <situation>
    Et que mon revenu annuel est de <revenu>€
    Et que j'achète <quantité> de <combustible>
    Et que le prix unitaire est <prix>€
    Et que <condition_spéciale>
    Quand je demande l'allocation
    Alors l'éligibilité est <éligibilité>
    Et le montant de l'allocation est <allocation>€

    Exemples:
      | situation        | revenu | combustible          | quantité      | prix  | condition_spéciale | éligibilité | allocation |
      | personne BIM     | 12000  | pétrole pompe        | 200€ total    | -     | forfait pompe      | oui         | 210        |
      | couple 1 enfant  | 18000  | gasoil vrac          | 800 litres    | 0.90  | dans plafonds      | oui         | 112-160    |
      | personne isolée  | 14000  | gasoil vrac          | 1500 litres   | 0.95  | maximum litres     | oui         | 210-300    |
      | famille 3 enfants| 24000  | gasoil vrac          | 1200 litres   | 0.92  | dans plafonds      | oui         | 168-240    |
      | couple           | 30000  | gasoil vrac          | 1000 litres   | 0.88  | hors plafonds      | non         | 0          |
      | médiation dettes | -      | pétrole pompe        | 180€ total    | -     | catégorie 3        | oui         | 210        |

  Scénario: Procédure de demande au CPAS
    Étant donné que je suis éligible au Fonds Social Chauffage
    Quand j'introduis ma demande au CPAS
    Alors je dois fournir les documents suivants:
      | Document                          | Obligatoire      | Remarque                              |
      | Carte d'identité                  | Oui              | Tous membres du ménage                |
      | Facture ou bon de livraison       | Oui              | Datée de moins de 60 jours           |
      | Preuve de paiement                 | Si disponible    | Ticket, virement, etc.                |
      | Composition de ménage              | Oui              | Récente (< 3 mois)                   |
      | Preuve de revenus                  | Si catégorie 2   | Fiches de paie, allocations          |
      | Attestation BIM                    | Si catégorie 1   | De la mutuelle                       |
      | Attestation médiateur              | Si catégorie 3   | Médiation de dettes                  |
    Et le CPAS dispose de 30 jours pour traiter ma demande
    Et l'allocation est versée sur mon compte bancaire
    Et une seule allocation par ménage et par période
    Et je peux introduire une nouvelle demande pour chaque livraison

  Scénario: Contrôle et vérification
    Étant donné que j'ai reçu l'allocation chauffage
    Quand le CPAS effectue un contrôle
    Alors ils peuvent vérifier:
      | Élément vérifié              | Méthode                           |
      | Composition réelle du ménage | Visite à domicile                |
      | Revenus déclarés             | Flux BCSS                        |
      | Utilisation du combustible   | Vérification installation        |
      | Autres aides perçues         | Base de données CPAS             |
    Et en cas de fraude constatée
    Alors je dois rembourser l'allocation
    Et je peux être exclu pour les périodes suivantes
    Et des poursuites peuvent être engagées