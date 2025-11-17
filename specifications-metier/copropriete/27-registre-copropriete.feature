# language: fr
Fonctionnalité: Tenue du Registre de Copropriété
  En tant que syndic
  Je veux tenir le registre de copropriété
  Afin de documenter toutes les décisions et événements

  Contexte:
    Étant donné que le registre est obligatoire

  Scénario: Contenu obligatoire du registre
    Étant donné que je constitue le registre
    Quand je vérifie la complétude
    Alors il doit contenir:
      | Document | Conservation |
      | Acte de base | Permanent |
      | Règlement ordre intérieur | Version actuelle |
      | PV assemblées générales | 10 ans minimum |
      | Contrats en cours | Durée + 5 ans |
      | Plans techniques | Permanent |
      | Décisions syndic | 5 ans |
      | Correspondances importantes | 5 ans |

  Scénario: Consultation du registre
    Étant donné qu'un copropriétaire demande consultation
    Quand il formule sa demande
    Alors le syndic doit:
      | Action | Délai |
      | Fixer rendez-vous | 15 jours |
      | Permettre consultation | Sur place |
      | Autoriser copies | Aux frais demandeur |
      | Respecter RGPD | Données personnelles |

  Scénario: Transmission registre nouveau syndic
    Étant donné qu'un nouveau syndic est désigné
    Quand la passation s'effectue
    Alors la transmission comprend:
      | Élément | Format | Délai |
      | Registre complet | Original | 30 jours |
      | Archives numériques | Fichiers | 30 jours |
      | Inventaire détaillé | Écrit signé | Remise |
      | Clés et codes | Physique | Immédiat |