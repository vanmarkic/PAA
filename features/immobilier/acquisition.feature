# language: fr
Fonctionnalité: Acquisition Immobilière en Belgique
  En tant qu'acheteur potentiel
  Je veux connaître les procédures d'acquisition immobilière
  Afin de réaliser mon projet d'achat en respectant la législation belge

  Contexte:
    Étant donné que les droits d'enregistrement en Région Wallonne sont de 12.5%
    Et que les droits d'enregistrement en Région Flamande sont de 10%
    Et que les droits d'enregistrement en Région Bruxelloise sont de 12.5%
    Et que les frais de notaire sont environ 2-3% du prix d'achat
    Et que l'abattement fiscal pour habitation propre est de 20000€ en Wallonie

  # Procédure 1: Vérification capacité d'emprunt
  Scénario: Calcul de la capacité d'emprunt pour acquisition
    Étant donné que je suis un acheteur avec un revenu mensuel net de 3000€
    Et que mon partenaire a un revenu mensuel net de 2500€
    Et que nous avons des charges mensuelles de 500€
    Et que le taux d'endettement maximum est de 33%
    Quand je calcule ma capacité d'emprunt sur 20 ans
    Alors ma capacité d'emprunt devrait être environ 250000€
    Et mon apport personnel minimum devrait être 10% soit 25000€
    Et les frais totaux estimés devraient être environ 40000€

  # Procédure 2: Offre d'achat et compromis de vente
  Scénario: Soumission d'une offre d'achat conforme
    Étant donné que j'ai trouvé un bien à 300000€
    Et que je veux faire une offre à 285000€
    Et que j'ai un apport de 30000€
    Et que j'ai une préqualification bancaire
    Quand je soumets mon offre d'achat
    Alors l'offre doit contenir les conditions suspensives suivantes:
      | Condition | Délai |
      | Obtention du crédit hypothécaire | 60 jours |
      | Absence de servitudes cachées | 30 jours |
      | Conformité urbanistique | 45 jours |
    Et le compromis de vente doit être signé dans les 15 jours
    Et un acompte de 10% doit être versé sur compte bloqué

  # Procédure 3: Crédit hypothécaire
  Scénario: Demande de crédit hypothécaire
    Étant donné que j'achète un bien de 250000€
    Et que j'ai un apport de 25000€
    Et que mes revenus mensuels nets sont de 3500€
    Et que j'ai moins de 35 ans
    Quand je demande un crédit hypothécaire
    Alors je dois fournir:
      | Document | Description |
      | Fiches de salaire | 3 derniers mois |
      | Avertissement-extrait de rôle | 2 dernières années |
      | Compromis de vente | Signé par les parties |
      | Expertise du bien | Rapport d'expert agréé |
      | Attestation assurance | Solde restant dû |
    Et le taux maximum sera plafonné selon la législation
    Et la quotité d'emprunt ne peut excéder 90% pour primo-accédant

  # Procédure 4: Conditions suspensives urbanisme
  Scénario: Vérification de la conformité urbanistique
    Étant donné que j'achète un bien construit en 1985
    Et que des travaux ont été effectués en 2010
    Quand je vérifie la conformité urbanistique
    Alors je dois obtenir:
      | Document | Source | Délai |
      | Permis d'urbanisme original | Commune | 30 jours |
      | Permis pour les travaux de 2010 | Commune | 30 jours |
      | Certificat d'urbanisme n°1 | Commune | 30 jours |
      | Attestation du sol (Flandre) | OVAM | 60 jours |
      | DIU (Déclaration d'Intention d'Urbanisme) | Vendeur | Immédiat |
    Et si des infractions sont constatées
    Alors je peux annuler la vente ou négocier une réduction

  # Procédure 5: Expertise immobilière
  Scénario: Réalisation de l'expertise obligatoire
    Étant donné que la banque exige une expertise
    Et que le bien est estimé à 280000€ par le vendeur
    Quand l'expert agréé effectue l'expertise
    Alors l'expertise doit évaluer:
      | Critère | Pondération |
      | Localisation et environnement | 30% |
      | État du bâtiment | 25% |
      | Surface et agencement | 20% |
      | Performance énergétique | 15% |
      | Conformité légale | 10% |
    Et si la valeur expertisée est inférieure de plus de 10%
    Alors la banque peut refuser le crédit ou demander un apport supplémentaire

  # Procédure 6: Acte notarié et enregistrement
  Scénario: Signature de l'acte authentique chez le notaire
    Étant donné que toutes les conditions suspensives sont levées
    Et que le crédit est approuvé
    Et que la date de signature est fixée
    Quand je signe l'acte authentique
    Alors les frais suivants sont dus:
      | Frais | Montant/Taux | Base |
      | Droits d'enregistrement | 12.5% | Prix de vente (Wallonie) |
      | Abattement habitation propre | -20000€ | Si conditions remplies |
      | Honoraires notaire | 1-2% | Barème légal |
      | Frais administratifs | 1500€ | Forfait approximatif |
      | Inscription hypothécaire | 0.30% | Montant du crédit |
    Et les clés sont remises après paiement intégral

  # Procédure 7: Primo-accédant avantages fiscaux
  Scénario: Application des avantages primo-accédant
    Étant donné que je suis primo-accédant
    Et que j'achète ma résidence principale
    Et que le bien est situé en Wallonie
    Et que le prix est de 200000€
    Quand je calcule mes avantages fiscaux
    Alors je bénéficie de:
      | Avantage | Montant | Condition |
      | Abattement droits enregistrement | 20000€ | Habitation propre |
      | Taux réduit crédit social | -1% | Revenus < plafonds |
      | Prime acquisition Région | 750€ | Zone de pression immobilière |
      | Chèque habitat (Flandre) | 160€/an | Pendant 20 ans |
    Et les droits d'enregistrement effectifs sont 10000€ au lieu de 25000€

  # Procédure 8: Vente en viager
  Scénario: Acquisition d'un bien en viager
    Étant donné que le vendeur a 75 ans
    Et que le bien vaut 300000€
    Et que je propose un viager occupé
    Quand je structure l'achat en viager
    Alors le montage comprend:
      | Élément | Montant | Description |
      | Bouquet | 60000€ | Payé à la signature |
      | Rente mensuelle | 800€ | Indexée annuellement |
      | Espérance de vie | 12 ans | Tables légales |
      | Droit d'usage | Viager | Jusqu'au décès |
    Et un acte notarié spécifique doit être établi
    Et une inscription hypothécaire garantit la rente

  # Procédure 9: Achat en copropriété
  Scénario: Acquisition d'un appartement en copropriété
    Étant donné que j'achète un appartement de 80m²
    Et que l'immeuble compte 20 lots
    Et que mes millièmes sont 52/1000
    Quand j'acquiers en copropriété
    Alors je dois vérifier:
      | Document | Contenu vérifié |
      | Acte de base | Division et millièmes |
      | Règlement de copropriété | Droits et obligations |
      | PV des 3 dernières AG | Décisions et litiges |
      | Décompte charges | Arriérés éventuels |
      | Fonds de réserve | Part à reprendre |
      | Travaux votés | Montants à prévoir |
    Et je dois obtenir le certificat syndical avant signature

  # Procédure 10: Protection de l'acheteur
  Scénario: Activation des protections légales de l'acheteur
    Étant donné que j'ai signé un compromis de vente
    Et que je découvre un vice caché majeur
    Et que le vice n'était pas apparent lors de la visite
    Quand j'active mes protections légales
    Alors je peux:
      | Action | Base légale | Délai |
      | Annuler la vente | Code Civil art. 1641 | Avant acte |
      | Demander réduction prix | Vice caché | 1 an découverte |
      | Exiger réparation | Garantie décennale | 10 ans gros œuvre |
      | Action en responsabilité | Dol du vendeur | 30 ans si fraude |
    Et je dois notifier par recommandé dans les délais légaux

  Plan du Scénario: Calcul des frais d'acquisition par région
    Étant donné que j'achète un bien de <prix>€
    Et que le bien est situé en <région>
    Et que c'est <type_achat>
    Quand je calcule les frais totaux
    Alors les droits d'enregistrement sont <droits>€
    Et les frais de notaire sont environ <notaire>€
    Et le total des frais est environ <total>€

    Exemples:
      | région | prix | type_achat | droits | notaire | total |
      | Wallonie | 200000 | habitation propre | 5000 | 4000 | 10500 |
      | Wallonie | 200000 | investissement | 25000 | 4000 | 30500 |
      | Flandre | 200000 | habitation propre | 6000 | 4000 | 11500 |
      | Bruxelles | 200000 | habitation propre | 5000 | 4000 | 10500 |
      | Wallonie | 500000 | habitation propre | 42500 | 8000 | 52000 |