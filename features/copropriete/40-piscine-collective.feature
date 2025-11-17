# language: fr
Fonctionnalité: Gestion Piscine Collective
  En tant que copropriété avec piscine
  Je veux gérer la piscine collective
  Afin d'assurer sécurité et hygiène

  Contexte:
    Étant donné que la copropriété possède une piscine

  Scénario: Entretien et conformité sanitaire
    Étant donné que la piscine fait 100m²
    Et qu'elle est ouverte de mai à septembre
    Quand l'entretien est organisé
    Alors il comprend:
      | Tâche | Fréquence | Coût annuel |
      | Analyse eau | Quotidienne été | 1500€ |
      | Nettoyage | 2x/semaine | 3000€ |
      | Maintenance technique | Mensuelle | 2000€ |
      | Hivernage/remise route | Annuel | 1000€ |
      | Contrôle ARS | Annuel | 500€ |

  Scénario: Règlement utilisation piscine
    Étant donné que l'usage doit être réglementé
    Quand le règlement est établi
    Alors il précise:
      | Règle | Détail |
      | Horaires | 9h-20h |
      | Douche obligatoire | Avant baignade |
      | Surveillance enfants | Parent présent |
      | Invités | Max 2 par résident |
      | Interdictions | Animaux, verre |

  Scénario: Responsabilité accident piscine
    Étant donné qu'un accident survient
    Impliquant un enfant non surveillé
    Quand la responsabilité est recherchée
    Alors l'analyse porte sur:
      | Aspect | Responsable |
      | Conformité installation | Copropriété |
      | Surveillance enfant | Parents |
      | Respect règlement | Utilisateur |
      | Assurance RC | Copropriété + victime |