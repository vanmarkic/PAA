# language: fr
Fonctionnalité: Logement Social et Habitations à Loyer Modéré
  En tant que personne à revenus modestes
  Je veux accéder à un logement social
  Afin d'avoir un logement décent et abordable

  Contexte:
    Étant donné que les plafonds de revenus 2024 pour le logement social sont:
      | Catégorie | Wallonie | Bruxelles | Flandre |
      | Personne seule | 25300€ | 24229€ | 26184€ |
      | Ménage 2 revenus | 30700€ | 26921€ | 39276€ |
      | + par enfant | +2400€ | +2692€ | +3648€ |
    Et que les sociétés de logement social sont régionales

  # Procédure 21: Inscription au logement social
  Scénario: Demande d'inscription pour un logement social
    Étant donné que mes revenus annuels sont de 20000€
    Et que je suis une personne seule
    Et que je vis en Région Wallonne
    Et que je n'ai pas de propriété
    Quand je m'inscris pour un logement social
    Alors je dois fournir:
      | Document | Description |
      | Composition de ménage | Commune - 3 mois max |
      | Avertissement extrait de rôle | Dernière année |
      | Attestation revenus | Tous les membres majeurs |
      | Attestation non-propriété | SPF Finances |
      | Certificat médical | Si priorité santé |
      | Preuve de séparation | Si applicable |
    Et je reçois un numéro de candidature unique
    Et je suis inscrit sur liste d'attente avec points de priorité

  # Procédure 22: Calcul des points de priorité
  Scénario: Attribution des points de priorité logement social
    Étant donné que je suis candidat au logement social
    Et que j'ai différentes situations prioritaires
    Quand mon dossier est évalué
    Alors les points sont attribués selon:
      | Situation | Points | Cumul |
      | Sans-abri | 20 | Oui |
      | Logement insalubre | 15 | Oui |
      | Expulsion sans faute | 10 | Oui |
      | Handicap > 66% | 10 | Oui |
      | Famille monoparentale | 8 | Oui |
      | Plus de 65 ans | 6 | Oui |
      | Victime violence | 10 | Oui |
      | Ancienneté par année | 2 | Max 20 |
    Et l'attribution suit l'ordre des points
    Et à points égaux, l'ancienneté prime

  # Procédure 23: Calcul du loyer social
  Scénario: Détermination du loyer dans le logement social
    Étant donné que j'ai obtenu un logement social 2 chambres
    Et que mes revenus annuels sont de 18000€
    Et que le loyer de base est de 400€
    Et que je suis en Wallonie
    Quand mon loyer social est calculé
    Alors la formule comprend:
      | Élément | Calcul |
      | Revenu de référence | 18000€ / 12 = 1500€ |
      | Taux d'effort | 20% du revenu mensuel |
      | Loyer social | 1500€ × 20% = 300€ |
      | Minimum | 126€ (plancher 2024) |
      | Maximum | 400€ (loyer de base) |
      | Charges | 50€ (forfait) |
    Et le loyer total est 350€ charges comprises
    Et le loyer est révisé annuellement

  # Procédure 24: Mutation dans le logement social
  Scénario: Demande de mutation vers un autre logement social
    Étant donné que j'occupe un logement social 1 chambre
    Et que ma famille s'est agrandie
    Et que j'ai maintenant 2 enfants
    Quand je demande une mutation
    Alors les motifs valables sont:
      | Motif | Priorité | Documents |
      | Sur/sous-occupation | Haute | Composition ménage |
      | Raisons médicales | Haute | Certificat médical |
      | Rapprochement travail | Moyenne | Contrat de travail |
      | Problèmes voisinage | Moyenne | Plaintes officielles |
      | Adaptation handicap | Haute | Attestation handicap |
    Et je reste locataire pendant la procédure
    Et la mutation est prioritaire sur nouvelles candidatures

  # Procédure 25: Achat d'un logement social
  Scénario: Acquisition d'un logement social par le locataire
    Étant donné que j'occupe mon logement social depuis 5 ans
    Et que la société propose la vente
    Et que le prix estimé est de 150000€
    Quand je veux acheter mon logement
    Alors les conditions sont:
      | Condition | Détail |
      | Ancienneté location | Minimum 5 ans |
      | Revenus plafonds | Ne pas dépasser 150% du plafond |
      | Prix de vente | Estimation - 30% (avantage social) |
      | Financement | Crédit social possible |
      | Clause de réméré | 10 ans non-revente |
      | Plus-value | Partage si revente < 10 ans |
    Et le prix d'achat est environ 105000€
    Et je bénéficie du taux réduit crédit social

  # Procédure 26: AIS (Agence Immobilière Sociale)
  Scénario: Location via une Agence Immobilière Sociale
    Étant donné que mes revenus sont de 22000€ annuels
    Et que je cherche un logement abordable
    Et qu'une AIS gère des biens privés
    Quand je candidate auprès de l'AIS
    Alors les avantages sont:
      | Aspect | Locataire | Propriétaire |
      | Loyer | -20% marché | Garanti |
      | Garantie | 2 mois max | AIS garantit |
      | Accompagnement | Social inclus | Gestion complète |
      | Entretien | Normal | AIS supervise |
      | Fiscalité | - | Exonération précompte |
    Et les revenus doivent être < plafonds sociaux + 20%
    Et le bail est de type classique 9 ans

  # Procédure 27: Habitat groupé solidaire
  Scénario: Création d'un habitat groupé solidaire
    Étant donné que 5 familles veulent créer un habitat groupé
    Et que le projet inclut espaces communs
    Et que nous visons l'accessibilité financière
    Quand nous montons le projet
    Alors les étapes sont:
      | Phase | Actions | Durée |
      | Constitution groupe | Charte, vision commune | 6 mois |
      | Forme juridique | ASBL, coopérative, copropriété | 3 mois |
      | Recherche terrain | Achat groupé ou CLT | 12 mois |
      | Financement | Crédits + subsides | 6 mois |
      | Permis urbanisme | Projet participatif | 9 mois |
      | Construction | Eco-construction privilégiée | 18 mois |
    Et des subsides régionaux sont disponibles
    Et l'accompagnement Habitat et Participation existe

  # Procédure 28: Logement de transit
  Scénario: Attribution d'un logement de transit d'urgence
    Étant donné que je suis en situation d'urgence
    Et que j'ai perdu mon logement suite à un sinistre
    Et que j'ai des enfants mineurs
    Quand je demande un logement de transit
    Alors la procédure est:
      | Étape | Responsable | Délai |
      | Signalement urgence | CPAS/Police | Immédiat |
      | Évaluation situation | Assistant social | 24h |
      | Décision attribution | Commission | 48h |
      | Installation | Service logement | Immédiat |
      | Durée maximum | - | 6 mois renouvelable |
      | Loyer | Proportionnel revenus | Max 20% |
      | Accompagnement | Obligatoire | Hebdomadaire |
    Et la recherche de logement définitif est obligatoire
    Et l'aide sociale est coordonnée

  # Procédure 29: Habitat léger
  Scénario: Installation en habitat léger permanent
    Étant donné que je veux vivre en habitat léger (tiny house)
    Et que j'ai trouvé un terrain en zone d'habitat
    Quand je prépare mon installation
    Alors les conditions sont:
      | Aspect | Exigence | Autorité |
      | Zone urbanisme | Habitat ou récréative | Commune |
      | Permis urbanisme | Si > 6 mois même lieu | Commune |
      | Raccordements | Eau, électricité, égouts | Gestionnaires |
      | Domiciliation | Possible si conforme | Commune |
      | Superficie min | Variable par commune | Plan secteur |
      | Salubrité | Normes logement | Région |
      | Taxe caravane | Si non-domicilié | Province |
    Et certaines communes ont des zones dédiées
    Et le Code wallon de l'habitation durable s'applique

  # Procédure 30: Rénovation logement social
  Scénario: Travaux de rénovation dans un logement social
    Étant donné que mon logement social nécessite rénovation
    Et que la société programme des travaux
    Quand les travaux sont planifiés
    Alors le processus est:
      | Phase | Droits locataire | Obligations |
      | Information | Préavis 6 mois minimum | - |
      | Concertation | Participation aux réunions | Présence |
      | Travaux légers | Reste dans logement | Accès ouvriers |
      | Travaux lourds | Relogement temporaire | Déménagement |
      | Indemnisation | Si relogement nécessaire | Justificatifs |
      | Loyer | Maintenu ou réduit | Paiement |
      | Retour | Priorité absolue | Dans les délais |
    Et le loyer n'augmente pas suite aux travaux obligatoires
    Et l'amélioration énergétique est prioritaire

  Plan du Scénario: Éligibilité au logement social par région
    Étant donné que mes revenus annuels sont <revenus>€
    Et que mon ménage compte <personnes> personne(s)
    Et que j'ai <enfants> enfant(s)
    Et que je suis en <region>
    Quand je vérifie mon éligibilité
    Alors le plafond applicable est <plafond>€
    Et je suis <eligibilite>

    Exemples:
      | region | revenus | personnes | enfants | plafond | eligibilite |
      | Wallonie | 20000 | 1 | 0 | 25300 | éligible |
      | Wallonie | 28000 | 2 | 1 | 33100 | éligible |
      | Bruxelles | 25000 | 1 | 0 | 24229 | non éligible |
      | Flandre | 35000 | 2 | 2 | 46572 | éligible |
      | Wallonie | 35000 | 2 | 0 | 30700 | non éligible |