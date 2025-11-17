# language: fr
Fonctionnalité: Déduction pour travaux d'économie d'énergie et isolation
  En tant que propriétaire soucieux de l'environnement
  Je veux déduire mes investissements en économie d'énergie
  Afin de réduire mon impôt tout en améliorant mon habitation

  Contexte:
    Étant donné que les paramètres fiscaux 2024 pour travaux d'économie d'énergie sont:
      | Paramètre                              | Valeur          |
      | Réduction d'impôt maximum par habitation | 3260€          |
      | Taux de réduction standard             | 30%             |
      | Taux de réduction majoré (audit)       | 45%             |
      | Plafond par contribuable               | 3260€           |
      | Report possible                       | 4 ans           |
      | Ancienneté minimale habitation        | 5 ans           |

  Scénario: Isolation du toit avec facture conforme
    Étant donné que je suis propriétaire occupant
    Et que mon habitation a plus de 5 ans
    Et que j'ai fait isoler mon toit en mars 2024
    Et que le coût total est de 8000€ TVA comprise
    Et que l'entrepreneur est enregistré et agréé
    Et que les matériaux respectent les normes R ≥ 4.5
    Quand je calcule ma déduction fiscale
    Alors la base de calcul est 8000€
    Et la réduction d'impôt est 2400€ (30% de 8000€)
    Et je dois déclarer au code 7162-68

  Scénario: Remplacement de chaudière par pompe à chaleur
    Étant donné que j'ai remplacé ma chaudière au mazout
    Par une pompe à chaleur air-eau en juin 2024
    Et que le coût total est de 12000€
    Et que j'ai obtenu une prime régionale de 3000€
    Et que l'installation est certifiée conforme
    Quand je calcule ma déduction fiscale
    Alors la base déductible est 9000€ (12000€ - 3000€ prime)
    Et la réduction d'impôt est 2700€ (30% de 9000€)
    Mais plafonnée à 3260€ sur 4 ans

  Scénario: Audit énergétique préalable avec taux majoré
    Étant donné que j'ai fait réaliser un audit énergétique en janvier 2024
    Et que l'audit a coûté 850€
    Et que j'ai ensuite réalisé les travaux recommandés:
      | Travaux                    | Coût    |
      | Isolation murs extérieurs  | 15000€  |
      | Remplacement châssis       | 8000€   |
      | Isolation sol              | 5000€   |
    Quand je calcule ma déduction fiscale
    Alors l'audit est déductible à 850€
    Et les travaux bénéficient du taux majoré de 45%
    Et la réduction totale est: 850€ + (28000€ × 45%) = 13450€
    Mais plafonnée à 3260€ pour l'année
    Et l'excédent est reportable sur 4 ans

  Scénario: Installation de panneaux solaires photovoltaïques
    Étant donné que j'ai installé des panneaux solaires en 2024
    Et que le coût d'installation est de 9000€
    Et que la puissance installée est de 5 kWc
    Et que j'ai obtenu des certificats verts
    Quand je vérifie la déductibilité fiscale
    Alors les panneaux solaires ne sont plus déductibles depuis 2024
    Mais je bénéficie d'autres avantages:
      | Avantage                        | Description                    |
      | TVA réduite 6%                  | Sur installation               |
      | Certificats verts               | Selon production               |
      | Tarif prosumer avantageux       | Selon région                   |

  Scénario: Double vitrage haute performance
    Étant donné que j'ai remplacé mes châssis simple vitrage
    Par du double vitrage haute performance (U ≤ 1.0)
    Et que le coût total est de 10000€ pour 10 fenêtres
    Et que les travaux sont réalisés en mai 2024
    Quand je calcule ma déduction
    Alors la réduction d'impôt est 3000€ (30% de 10000€)
    Et je dois fournir les certificats de conformité
    Et les factures doivent détailler matériaux et main d'œuvre

  Scénario: Cumul avec primes régionales
    Étant donné que j'ai réalisé une isolation complète
    Et que le coût total est de 20000€
    Et que j'ai reçu:
      | Prime                    | Montant |
      | Prime isolation toiture  | 2000€   |
      | Prime isolation murs     | 3500€   |
      | Prime audit énergétique  | 500€    |
    Quand je calcule ma déduction fiscale
    Alors la base déductible est 14000€ (20000€ - 6000€ primes)
    Et la réduction d'impôt est 4200€ (30% de 14000€)
    Mais plafonnée à 3260€ pour l'année
    Et l'excédent de 940€ est reportable

  Scénario: Travaux sur résidence secondaire
    Étant donné que j'ai une résidence secondaire en Belgique
    Et que j'y ai fait des travaux d'isolation en 2024
    Et que le coût est de 7000€
    Quand je vérifie la déductibilité
    Alors je ne peux pas bénéficier de la réduction
    Car elle est réservée à l'habitation principale
    Mais je peux déduire via les charges professionnelles si location

  Scénario: Report des déductions non utilisées
    Étant donné que j'ai fait des travaux en 2023
    Et que ma réduction calculée était de 5000€
    Et que j'ai pu déduire 3260€ en 2023
    Et que j'ai un report de 1740€
    Et que j'ai fait de nouveaux travaux en 2024 pour 4000€
    Quand je calcule ma déduction 2024
    Alors la nouvelle réduction est 1200€ (30% de 4000€)
    Et j'ajoute le report de 2023: 1740€
    Et le total est 2940€ pour 2024
    Et tout est déductible car inférieur au plafond

  Plan du Scénario: Calcul déduction selon type de travaux
    Étant donné que je réalise des travaux de type <type_travaux>
    Et que le coût est de <cout>€
    Et que j'ai un audit énergétique: <audit>
    Et que je reçois une prime de <prime>€
    Quand je calcule ma déduction
    Alors le taux applicable est <taux>%
    Et la base déductible est <base>€
    Et la réduction d'impôt est <reduction>€

    Exemples:
      | type_travaux          | cout  | audit | prime | taux | base  | reduction |
      | Isolation toiture     | 6000  | non   | 1000  | 30   | 5000  | 1500      |
      | Isolation murs        | 12000 | oui   | 2500  | 45   | 9500  | 3260      |
      | Pompe à chaleur      | 15000 | non   | 3000  | 30   | 12000 | 3260      |
      | Chaudière condensation| 5000  | non   | 500   | 30   | 4500  | 1350      |
      | Isolation complète    | 25000 | oui   | 5000  | 45   | 20000 | 3260      |

  Scénario: Conditions techniques et normes
    Étant donné que je veux bénéficier des déductions
    Quand je planifie mes travaux
    Alors je dois respecter les normes techniques:
      | Type de travaux       | Norme minimale              |
      | Isolation toiture     | R ≥ 4.5 m²K/W              |
      | Isolation murs        | R ≥ 2.0 m²K/W              |
      | Isolation sol         | R ≥ 2.0 m²K/W              |
      | Vitrage              | U ≤ 1.0 W/m²K              |
      | Chaudière            | Rendement ≥ 90%            |
    Et l'entrepreneur doit être enregistré
    Et les factures doivent être détaillées et conformes

  Scénario: Appartement en copropriété
    Étant donné que je suis copropriétaire d'un appartement
    Et que la copropriété fait isoler la façade
    Et que ma quote-part est de 4500€
    Et que les travaux sont conformes aux normes
    Quand je calcule ma déduction
    Alors je peux déduire ma quote-part
    Et la réduction est 1350€ (30% de 4500€)
    Et je dois avoir l'attestation du syndic

  Scénario: Documentation et déclaration
    Étant donné que je veux déclarer mes travaux d'économie d'énergie
    Quand je prépare ma déclaration
    Alors je dois fournir:
      | Document requis                          |
      | Factures détaillées avec TVA             |
      | Attestation entrepreneur enregistré      |
      | Certificats de conformité matériaux      |
      | Rapport d'audit si applicable            |
      | Preuves de paiement                      |
      | Décompte des primes reçues              |
    Et utiliser les codes fiscaux:
      | Type de déduction        | Code      |
      | Travaux économie énergie | 7162-68   |
      | Report années antérieures| 7163-67   |