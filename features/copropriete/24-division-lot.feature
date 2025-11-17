# language: fr
Fonctionnalité: Division d'un Lot
  En tant que copropriétaire
  Je veux diviser mon lot
  Afin de créer plusieurs unités distinctes

  Contexte:
    Étant donné qu'un copropriétaire veut diviser son bien

  Scénario: Division appartement en deux studios
    Étant donné qu'un appartement de 100m² et 120 millièmes
    Veut être divisé en 2 studios de 50m²
    Quand le projet est soumis à l'AG
    Alors il nécessite:
      | Autorisation | Majorité |
      | Modification structure | 4/5 si porteur |
      | Modification millièmes | 4/5 |
      | Création 2 lots | 4/5 |
      | Modification acte base | Unanimité parfois |

  Scénario: Vérification conformité urbanisme
    Étant donné qu'une division est envisagée
    Quand les autorisations sont vérifiées
    Alors sont requis:
      | Document | Autorité |
      | Permis urbanisme | Commune |
      | Conformité PEB | Région |
      | Sécurité incendie | Pompiers |
      | Attestation électrique | Organisme agréé |

  Scénario: Recalcul des millièmes
    Étant donné que la division crée 2 lots
    Studio A de 45m² et Studio B de 55m²
    Quand les millièmes sont recalculés
    Alors la répartition devient:
      | Lot | Surface | Millièmes |
      | Studio A | 45m² | 54 |
      | Studio B | 55m² | 66 |
    Et l'acte de base est modifié
    Et les charges sont ajustées