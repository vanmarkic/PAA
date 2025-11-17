# language: fr
Fonctionnalité: Gestion Succession Suite Décès
  En tant que copropriété
  Je veux gérer les successions
  Afin d'assurer la continuité administrative

  Contexte:
    Étant donné qu'un copropriétaire décède

  Scénario: Notification décès copropriétaire
    Étant donné que M. Dupont est décédé
    Propriétaire de 120 millièmes
    Quand le syndic est informé
    Alors il doit:
      | Action | Délai |
      | Noter au registre | Immédiat |
      | Suspendre prélèvements | Immédiat |
      | Contacter notaire | Si connu |
      | Attendre héritiers | Raisonnable |
      | Maintenir charges | Sur succession |

  Scénario: Indivision successorale
    Étant donné que 3 héritiers existent
    En indivision sur le lot
    Quand ils doivent être représentés
    Alors les règles sont:
      | Situation | Règle |
      | Représentation AG | 1 mandataire commun |
      | Paiement charges | Solidaire |
      | Notifications | À tous |
      | Décisions lot | Unanimité héritiers |
      | Durée maximum | 2 ans conseillé |

  Scénario: Vente par succession
    Étant donné que les héritiers vendent
    Et que des charges sont impayées
    Quand la vente se réalise
    Alors le syndic:
      | Action | Protection |
      | État daté notaire | Sous 15 jours |
      | Privilège immobilier | 6 mois charges |
      | Opposition vente | Si impayés > 1000€ |
      | Prélèvement notaire | Sur prix vente |
      | Quittance finale | Après paiement |