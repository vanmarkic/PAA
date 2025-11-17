# language: fr
Fonctionnalité: Individualisation des Compteurs
  En tant que copropriété
  Je veux individualiser les compteurs
  Afin que chacun paie sa consommation réelle

  Contexte:
    Étant donné que les compteurs sont collectifs

  Scénario: Installation compteurs eau individuels
    Étant donné que l'eau est au compteur général
    Et que l'individualisation coûte 500€/lot
    Quand le projet est voté à l'AG
    Alors il nécessite:
      | Élément | Détail |
      | Majorité requise | 2/3 des voix |
      | Coût total 30 lots | 15000€ |
      | Durée travaux | 2 semaines |
      | Accès logements | Obligatoire |
      | Nouveau contrat | Individuel distributeur |

  Scénario: Répartiteurs frais chauffage
    Étant donné que le chauffage est collectif
    Et que la directive européenne l'impose
    Quand les répartiteurs sont installés
    Alors la facturation devient:
      | Poste | Répartition |
      | Charges fixes | 30% millièmes |
      | Consommation | 70% compteurs |
      | Relevé | Annuel ou télé |
      | Régularisation | Annuelle |
      | Contestation | Procédure définie |

  Scénario: Copropriétaire refusant accès
    Étant donné qu'un copropriétaire refuse l'accès
    Pour installer les compteurs votés
    Quand le syndic agit
    Alors il peut:
      | Action | Base légale |
      | Mise en demeure | Vote AG valide |
      | Référé tribunal | Urgence |
      | Installation forcée | Avec huissier |
      | Facturation forfait | Maximum légal |