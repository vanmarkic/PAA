# language: fr
Fonctionnalité: Primes énergie et rénovation énergétique
  En tant que propriétaire ou locataire
  Je veux obtenir des primes pour améliorer la performance énergétique
  Afin de réduire ma consommation et mes factures

  Contexte:
    Étant donné que les montants des primes 2024 sont:
      | Type installation      | Prime base | Prime revenus modestes | Prime revenus précaires |
      | Panneaux solaires      | 250€/kWc   | 375€/kWc              | 500€/kWc               |
      | Pompe à chaleur        | 1500€      | 2250€                 | 3000€                  |
      | Isolation toiture      | 20€/m²     | 30€/m²                | 40€/m²                 |
      | Isolation murs         | 25€/m²     | 37€/m²                | 50€/m²                 |
      | Chaudière biomasse     | 2000€      | 3000€                 | 4000€                  |

  Scénario: Installation panneaux solaires pour famille revenus moyens
    Étant donné que je suis propriétaire d'une maison unifamiliale
    Et que mes revenus annuels sont de 45000€
    Et que j'installe 6 kWc de panneaux solaires
    Et que le coût total est de 8000€
    Et que je suis en Wallonie
    Quand je demande la prime panneaux solaires
    Alors je suis éligible à la prime de base
    Et le montant de la prime sera 1500€ (6 × 250€)
    Et je dois fournir la facture et l'attestation de conformité
    Et le délai de traitement est de 60 jours

  Scénario: Cumul de primes pour rénovation complète
    Étant donné que je suis propriétaire d'une maison de 1975
    Et que mes revenus sont considérés comme modestes (30000€/an)
    Et que je réalise une rénovation complète:
      | Travaux              | Surface/Puissance | Coût    |
      | Isolation toiture    | 120 m²           | 4000€   |
      | Isolation murs       | 80 m²            | 3500€   |
      | Pompe à chaleur      | 12 kW            | 12000€  |
      | Panneaux solaires    | 4 kWc            | 6000€   |
    Quand je demande toutes les primes disponibles
    Alors mes primes totales seront:
      | Type               | Calcul           | Montant |
      | Isolation toiture  | 120 × 30€        | 3600€   |
      | Isolation murs     | 80 × 37€         | 2960€   |
      | Pompe à chaleur    | forfait          | 2250€   |
      | Panneaux solaires  | 4 × 375€         | 1500€   |
    Et le total des primes sera 10310€
    Et l'audit énergétique préalable est obligatoire

  Scénario: Bonus pour performance énergétique exceptionnelle
    Étant donné que ma maison atteint le label PEB A après rénovation
    Et que j'ai réalisé un bouquet de travaux complet
    Et que l'amélioration énergétique est de plus de 50%
    Quand je demande le bonus performance
    Alors je reçois un bonus de 25% sur toutes mes primes
    Et je dois fournir les certificats PEB avant/après
    Et un test d'étanchéité à l'air est requis

  Scénario: Prime véhicule électrique entreprise
    Étant donné que je suis une PME
    Et que j'achète 3 véhicules électriques utilitaires
    Et que chaque véhicule coûte 45000€
    Quand je demande la prime véhicule électrique
    Alors je reçois 5000€ par véhicule
    Et le total de la prime sera 15000€
    Et je dois garder les véhicules minimum 3 ans
    Et installer des bornes de recharge est obligatoire

  Scénario: Refus pour travaux non conformes
    Étant donné que j'ai installé des panneaux solaires moi-même
    Et que je n'ai pas de certification RESCERT
    Et que l'installation n'est pas aux normes
    Quand je demande la prime
    Alors ma demande est refusée
    Et le motif est "installation non conforme - pas de certification"
    Et je peux régulariser et redemander dans 6 mois

  Plan du Scénario: Calcul prime isolation selon revenus et surface
    Étant donné que mes revenus sont <revenus>€/an
    Et que j'isole <surface> m² de <type>
    Quand je calcule ma prime
    Alors la prime sera de <prime>€

    Exemples:
      | revenus | surface | type     | prime |
      | 25000   | 100     | toiture  | 4000  |
      | 25000   | 100     | murs     | 5000  |
      | 45000   | 100     | toiture  | 2000  |
      | 45000   | 100     | murs     | 2500  |
      | 70000   | 100     | toiture  | 2000  |
      | 70000   | 100     | murs     | 2500  |