# language: fr
Fonctionnalité: Contrôle d'Accès Électronique
  En tant que copropriété
  Je veux moderniser le contrôle d'accès
  Afin de sécuriser les entrées

  Contexte:
    Étant donné que l'accès doit être sécurisé

  Scénario: Installation système badges
    Étant donné qu'un système badges/vigik est proposé
    Pour 3 portes d'accès à 8000€
    Quand l'installation est votée
    Alors elle comprend:
      | Élément | Quantité |
      | Lecteurs badges | 6 (3 int + 3 ext) |
      | Badges résidents | 2 par lot |
      | Badges visiteurs | 10 temporaires |
      | Centrale gestion | 1 + logiciel |
      | Formation syndic | 4 heures |

  Scénario: Gestion badges perdus
    Étant donné qu'un résident perd son badge
    Quand il demande un remplacement
    Alors la procédure est:
      | Action | Coût | Délai |
      | Déclaration perte | Gratuit | Immédiat |
      | Désactivation ancien | Gratuit | Immédiat |
      | Nouveau badge | 25€ | 48h |
      | Activation | Inclus | À réception |

  Scénario: Accès prestataires services
    Étant donné que des prestataires réguliers interviennent
    Quand l'accès est organisé
    Alors les options sont:
      | Type prestataire | Solution |
      | Facteur/livreurs | Code tournant mensuel |
      | Femme ménage | Badge horaires définis |
      | Urgences | Code pompier/police |
      | Entrepreneurs | Badge temporaire jour |