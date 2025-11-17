# language: fr
Fonctionnalité: Système de Vidéoprotection
  En tant que copropriété
  Je veux installer la vidéoprotection
  Afin de sécuriser les parties communes

  Contexte:
    Étant donné que la sécurité nécessite amélioration

  Scénario: Installation caméras parties communes
    Étant donné qu'un système 8 caméras est proposé
    Pour 12000€ installation comprise
    Quand l'AG vote le projet
    Alors elle vérifie:
      | Aspect | Exigence |
      | Vote requis | Majorité 2/3 |
      | Déclaration CNIL | Obligatoire |
      | Affichage | Panneaux informatifs |
      | Zones filmées | Parties communes seules |
      | Conservation images | 30 jours maximum |

  Scénario: Respect vie privée RGPD
    Étant donné que des caméras sont installées
    Quand le système est configuré
    Alors il respecte:
      | Obligation RGPD | Application |
      | Information résidents | Affichage permanent |
      | Finalité légitime | Sécurité uniquement |
      | Accès images | Protocole strict |
      | Floutage zones privées | Automatique |
      | Registre traitement | Tenu à jour |

  Scénario: Gestion incidents avec vidéo
    Étant donné qu'un vol est constaté
    Et filmé par les caméras
    Quand l'extraction est demandée
    Alors la procédure est:
      | Étape | Responsable |
      | Constat incident | Victime |
      | Dépôt plainte | Police |
      | Demande extraction | Syndic |
      | Sauvegarde images | 48h max |
      | Transmission police | Sur réquisition |