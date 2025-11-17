# language: fr
Fonctionnalité: Assurance de l'Immeuble
  En tant que syndic
  Je veux gérer les assurances de la copropriété
  Afin de protéger le patrimoine commun

  Contexte:
    Étant donné que l'assurance immeuble est obligatoire

  Scénario: Souscription assurance globale
    Étant donné que l'immeuble vaut 3 millions d'euros
    Et qu'il compte 30 lots
    Quand je souscris l'assurance globale
    Alors elle doit couvrir:
      | Risque | Montant minimum |
      | Incendie | Valeur reconstruction |
      | Dégâts des eaux | Valeur reconstruction |
      | RC immeuble | 5.000.000€ |
      | RC syndic | 1.000.000€ |
      | Protection juridique | 25.000€ |

  Scénario: Déclaration de sinistre
    Étant donné qu'un dégât des eaux survient
    Affectant 3 appartements
    Quand le syndic est informé
    Alors il doit:
      | Action | Délai |
      | Mesures conservatoires | Immédiat |
      | Déclaration assurance | 5 jours |
      | Information copropriétaires | 48h |
      | Expertise contradictoire | Sur demande |
      | Suivi réparations | Continu |

  Scénario: Répartition franchise après sinistre
    Étant donné qu'un sinistre génère 1000€ de franchise
    Et que le responsable est identifié
    Quand la franchise est payée
    Alors la répartition est:
      | Cas | Répartition |
      | Responsable identifié | 100% au responsable |
      | Partie commune | Au prorata millièmes |
      | Cause inconnue | Au prorata millièmes |