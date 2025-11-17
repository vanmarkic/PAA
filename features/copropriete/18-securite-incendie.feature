# language: fr
Fonctionnalité: Sécurité Incendie
  En tant que syndic
  Je veux assurer la sécurité incendie
  Afin de protéger les occupants et l'immeuble

  Contexte:
    Étant donné que la sécurité incendie est obligatoire

  Scénario: Contrôle annuel des équipements
    Étant donné que l'immeuble a des équipements incendie
    Quand le contrôle annuel est effectué
    Alors il vérifie:
      | Équipement | Fréquence | Certificat |
      | Extincteurs | Annuelle | Obligatoire |
      | Détecteurs fumée | Annuelle | Obligatoire |
      | Éclairage secours | Semestrielle | Obligatoire |
      | Portes coupe-feu | Annuelle | Obligatoire |
      | Désenfumage | Annuelle | Si existant |

  Scénario: Mise en conformité obligatoire
    Étant donné que le rapport signale des non-conformités
    Notamment l'absence d'éclairage de secours
    Quand le syndic reçoit le rapport
    Alors il doit:
      | Action | Délai |
      | Informer l'AG | Prochaine réunion |
      | Obtenir devis | 30 jours |
      | Réaliser travaux urgents | Immédiat si danger |
      | Mettre en conformité | 6 mois maximum |

  Scénario: Plan d'évacuation
    Étant donné que l'immeuble compte 5 étages
    Quand le plan d'évacuation est établi
    Alors il doit inclure:
      | Élément | Emplacement |
      | Plans évacuation | Chaque palier |
      | Consignes incendie | Hall entrée |
      | Point rassemblement | Défini et signalé |
      | Exercice évacuation | Annuel recommandé |