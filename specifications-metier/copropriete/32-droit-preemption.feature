# language: fr
Fonctionnalité: Droit de Préemption
  En tant que copropriété
  Je veux gérer le droit de préemption
  Afin de contrôler les mutations

  Contexte:
    Étant donné qu'un droit de préemption existe

  Scénario: Exercice droit préemption copropriété
    Étant donné qu'un lot est mis en vente à 200000€
    Et que la copropriété a un droit de préemption
    Quand le propriétaire notifie la vente
    Alors la copropriété doit:
      | Action | Délai |
      | Convoquer AG extraordinaire | 30 jours |
      | Voter exercice préemption | Majorité 2/3 |
      | Notifier décision | 60 jours total |
      | Signer acte | 4 mois |

  Scénario: Préemption pour agrandissement parties communes
    Étant donné qu'un local commercial est vendu
    Et qu'il jouxte le hall d'entrée
    Quand la copropriété veut l'acquérir
    Pour agrandir les parties communes
    Alors elle vérifie:
      | Critère | Validation |
      | Intérêt collectif | Démontré |
      | Financement | Fonds + emprunt |
      | Majorité requise | 4/5 |
      | Modification millièmes | Automatique |

  Scénario: Renonciation au droit
    Étant donné qu'un copropriétaire vend
    Et demande renonciation préemption
    Quand le syndic traite la demande
    Alors il peut:
      | Option | Condition |
      | Renonciation syndic | Si AG l'a autorisé |
      | Consultation conseil | Si existant |
      | AG extraordinaire | Si montant important |
      | Renonciation tacite | Après 60 jours |