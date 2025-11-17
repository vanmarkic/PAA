# language: fr
Fonctionnalité: Gestion des Vices Cachés
  En tant que copropriété
  Je veux gérer les vices cachés
  Afin de protéger les intérêts collectifs

  Contexte:
    Étant donné qu'un vice caché est découvert

  Scénario: Vice caché affectant parties communes
    Étant donné qu'une infiltration structurelle est découverte
    Datant de la construction il y a 8 ans
    Quand le vice est constaté par expert
    Alors les actions sont:
      | Action | Délai | Responsable |
      | Expertise judiciaire | Immédiat | Syndic |
      | Mise en cause promoteur | 10 ans max | AG vote |
      | Mesures conservatoires | Urgent | Syndic |
      | Déclaration assurance | 5 jours | Syndic |

  Scénario: Vice affectant un lot privatif
    Étant donné qu'un copropriétaire découvre un vice
    Dans son lot acheté il y a 6 mois
    Quand il demande l'aide de la copropriété
    Alors le syndic:
      | Action | Condition |
      | Vérifie impact commun | Obligatoire |
      | Fournit historique | Si disponible |
      | Témoigne si nécessaire | Sur demande |
      | N'engage pas copropriété | Sauf parties communes |

  Scénario: Action collective contre promoteur
    Étant donné que plusieurs vices affectent l'immeuble
    Et que 5 copropriétaires sont concernés
    Quand une action collective est envisagée
    Alors la procédure est:
      | Étape | Majorité AG |
      | Mandat avocat commun | 2/3 |
      | Expertise unique | Majorité simple |
      | Répartition frais | Millièmes ou dommages |
      | Transaction éventuelle | 2/3 |