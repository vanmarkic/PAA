# language: fr
Fonctionnalité: Primes et Aides à la Rénovation Énergétique
  En tant que propriétaire occupant ou bailleur
  Je veux obtenir des aides pour rénover mon bien
  Afin d'améliorer sa performance énergétique et son confort

  Contexte:
    Étant donné que les primes varient selon les régions
    Et que les montants dépendent des revenus du ménage
    Et que le PEB initial influence les primes
    Et que les travaux doivent être réalisés par des professionnels

  # Procédure 41: Prime Habitation Wallonie
  Scénario: Demande de prime habitation pour isolation toiture
    Étant donné que je suis propriétaire occupant en Wallonie
    Et que mes revenus de référence sont 35000€
    Et que je veux isoler 120m² de toiture
    Et que l'entrepreneur est agréé
    Quand je demande la prime habitation
    Alors le calcul est:
      | Élément | Valeur | Calcul |
      | Catégorie revenus | R2 | 23001-43200€ |
      | Prime de base/m² | 6€ | Catégorie R2 |
      | Surface éligible | 120m² | Maximum 150m² |
      | Montant prime base | 720€ | 120 × 6€ |
      | Majoration | 0% | Pas de critères |
      | Prime totale | 720€ | Final |
    Et les conditions sont:
      | Condition | Exigence |
      | R toiture après travaux | ≥ 4,5 m²K/W |
      | Épaisseur isolant | ≥ 12cm laine minérale |
      | Audit préalable | Obligatoire si > 3 postes |
      | Délai introduction | 4 mois après facture |
    Et la prime est plafonnée à 70% de la facture

  # Procédure 42: Audit énergétique (PAE2)
  Scénario: Réalisation d'un audit énergétique PAE2
    Étant donné que je veux rénover globalement ma maison
    Et que plusieurs postes de travaux sont prévus
    Et que je suis en Wallonie
    Quand je commande un audit PAE2
    Alors l'audit comprend:
      | Élément | Contenu | Utilité |
      | État des lieux | Performance actuelle | PEB initial |
      | Bouquets travaux | 2-3 scénarios | Priorités |
      | Économies | kWh et €/an | ROI |
      | Primes estimées | Par poste | Budget |
      | Planning | Ordre optimal | Cohérence |
      | Rapport | 30-50 pages | Détaillé |
    Et le coût est 660-990€ selon superficie
    Et la prime audit est 110-660€ selon revenus
    Et l'audit est valable 5 ans pour les primes

  # Procédure 43: Rénovation énergétique Bruxelles
  Scénario: Primes RENOLUTION pour rénovation complète
    Étant donné que je rénove un bien à Bruxelles
    Et que mes revenus sont catégorie B (moyens)
    Et que je réalise isolation + chauffage + ventilation
    Quand je cumule les primes RENOLUTION
    Alors les montants sont:
      | Travaux | Prime/unité | Maximum | Catégorie B |
      | Isolation murs | 50€/m² | 200m² | 10000€ |
      | Isolation toiture | 35€/m² | 200m² | 7000€ |
      | Châssis | 50€/m² | 50m² | 2500€ |
      | Pompe chaleur | 4500€ | 1 unité | 4500€ |
      | Ventilation D | 2400€ | 1 système | 2400€ |
      | Bonus rénovation | +10% | Si 3+ postes | 2640€ |
      | Total primes | - | - | 29040€ |
    Et l'accompagnement Homegrade est gratuit
    Et les factures doivent dater de moins de 2 ans

  # Procédure 44: Prêt vert à 0% Wallonie
  Scénario: Obtention d'un prêt RenoWatt à taux zéro
    Étant donné que mes revenus sont < 51300€
    Et que je finance des travaux économiseurs énergie
    Et que le montant travaux est 25000€
    Quand je demande un prêt vert
    Alors les conditions sont:
      | Paramètre | Valeur | Conditions |
      | Taux | 0% | Si revenus < seuil |
      | Montant max | 60000€ | Par logement |
      | Durée | 0-20 ans | Selon montant |
      | Travaux éligibles | Liste | Isolation, chauffage... |
      | Cumul primes | Oui | Primes déduites |
      | Garantie | Hypothécaire | Si > 25000€ |
      | Frais dossier | 0€ | Pris en charge |
    Et l'entrepreneur doit être enregistré
    Et un rapport énergie est requis

  # Procédure 45: Certificat PEB
  Scénario: Obtention du certificat PEB pour location
    Étant donné que je mets un bien en location
    Et que le PEB est obligatoire pour publier
    Quand je commande un certificat PEB
    Alors le processus est:
      | Étape | Action | Durée |
      | Commande | Certificateur agréé | Contact |
      | Visite | Mesures et relevés | 2-3h |
      | Calcul | Logiciel officiel | 2-3 jours |
      | Certificat | Emission officielle | 5 jours |
      | Validité | 10 ans | Sauf travaux |
      | Coût | 200-350€ | Selon surface |
    Et les classes vont de A++ à G
    Et l'affichage est obligatoire dans l'annonce
    Et les recommandations sont incluses

  # Procédure 46: Prime photovoltaïque
  Scénario: Installation de panneaux photovoltaïques avec primes
    Étant donné que j'installe 4kWc de panneaux solaires
    Et que mon installation coûte 6000€
    Et que je suis en Wallonie
    Quand je demande les aides disponibles
    Alors les incitants sont:
      | Type aide | Montant | Conditions |
      | Prime (terminée) | 0€ | Plus depuis 2024 |
      | Tarif prosumer | -300€/an | Redevance réseau |
      | Compensation | Variable | Injection = prélèvement |
      | Certificats verts | 0€ | Plus pour < 10kWc |
      | TVA réduite | 6% | Si > 10 ans |
      | Déduction fiscale | 0€ | Plus disponible |
    Et le retour sur investissement est 7-10 ans
    Et le compteur bidirectionnel est supprimé

  # Procédure 47: Prime adaptation logement seniors/PMR
  Scénario: Adaptation d'un logement pour personne âgée
    Étant donné qu'un occupant a plus de 65 ans
    Et que des adaptations sont nécessaires
    Et que les revenus sont modestes
    Quand je demande la prime adaptation
    Alors les travaux éligibles sont:
      | Travaux | Prime | Maximum |
      | Salle de bain PMR | 70% | 3500€ |
      | Monte-escalier | 70% | 4000€ |
      | Rampes accès | 70% | 1500€ |
      | Élargissement portes | 70% | 1000€ |
      | Sol antidérapant | 70% | 2000€ |
      | Aménagement chambre RDC | 70% | 3000€ |
    Et un rapport ergothérapeute est requis
    Et le cumul avec AViQ est possible
    Et le délai de traitement est 3-6 mois

  # Procédure 48: Éco-rénovation collective (copropriété)
  Scénario: Rénovation énergétique d'une copropriété
    Étant donné qu'une copropriété de 20 appartements
    Et que l'AG vote une rénovation globale
    Et que le budget est 400000€
    Quand le syndic organise le projet
    Alors les étapes sont:
      | Phase | Actions | Durée |
      | Audit global | Énergétique + technique | 3 mois |
      | AG décision | Majorité 2/3 | 1 mois |
      | Cahier charges | Lots séparés | 2 mois |
      | Appel offres | 3 entreprises min | 2 mois |
      | Primes collectives | Dossier groupé | 1 mois |
      | Financement | Crédit copro + quotes-parts | 2 mois |
      | Travaux | Phasage occupé | 12 mois |
      | Réception | PV contradictoire | 1 mois |
    Et les primes sont majorées de 10% si collectif
    Et un coordinateur est obligatoire

  # Procédure 49: Démolition-reconstruction
  Scénario: Prime démolition-reconstruction énergétique
    Étant donné qu'un bâtiment est énergivore (PEB G)
    Et que la rénovation coûterait plus que reconstruire
    Et que je veux démolir et reconstruire
    Quand je demande les aides
    Alors les conditions sont:
      | Aspect | Exigence | Prime |
      | PEB initial | F ou G obligatoire | - |
      | PEB nouveau | A minimum | - |
      | Permis démolition | Obligatoire | - |
      | Permis urbanisme | Nouveau bâtiment | - |
      | Prime démolition | Forfait | 5000€ |
      | Prime construction | Q-ZEN | 15000€ |
      | Recyclage | 90% matériaux | Obligatoire |
      | Délai | 5 ans maximum | - |
    Et la nouvelle construction doit être passive
    Et le volume peut augmenter de 20% max

  # Procédure 50: Tiers investisseur énergétique
  Scénario: Rénovation par tiers investisseur
    Étant donné que je n'ai pas les fonds pour rénover
    Et qu'une société propose le tiers investissement
    Et que les économies sont garanties
    Quand je signe un contrat CPE
    Alors le modèle est:
      | Élément | Description | Durée |
      | Investissement | 100% tiers | Initial |
      | Travaux | Clé en main | 3-6 mois |
      | Remboursement | Via économies | 10-15 ans |
      | Garantie performance | 30% économie min | Contractuelle |
      | Maintenance | Incluse | Période contrat |
      | Monitoring | Temps réel | Permanent |
      | Propriété | Transfert final | Fin contrat |
      | Risque technique | Tiers investisseur | Assumé |
    Et les primes restent au bénéficiaire
    Et le contrat est cessible si vente

  Plan du Scénario: Calcul prime isolation selon revenus
    Étant donné que mes revenus de référence sont <revenus>€
    Et que j'isole <surface>m² de <type>
    Et que je suis en <region>
    Quand je calcule ma prime
    Alors ma catégorie est <categorie>
    Et la prime unitaire est <prime_m2>€/m²
    Et la prime totale est <prime_totale>€

    Exemples:
      | region | revenus | type | surface | categorie | prime_m2 | prime_totale |
      | Wallonie | 20000 | toiture | 100 | R1 | 8 | 800 |
      | Wallonie | 35000 | toiture | 100 | R2 | 6 | 600 |
      | Wallonie | 50000 | toiture | 100 | R3 | 4 | 400 |
      | Wallonie | 70000 | toiture | 100 | R4 | 3 | 300 |
      | Bruxelles | 35000 | murs | 80 | B | 50 | 4000 |
      | Wallonie | 25000 | sol | 60 | R1 | 10 | 600 |