# language: fr
Fonctionnalité: Assurance Maladie-Invalidité
  En tant qu'assuré social
  Je veux comprendre mes droits à l'assurance maladie obligatoire
  Afin d'être remboursé pour mes soins de santé et recevoir des indemnités en cas de maladie

  Contexte:
    Étant donné que les taux de remboursement INAMI 2024 sont:
      | Type de soin                | Remboursement ordinaire | Remboursement BIM |
      | Consultation généraliste    | 75%                      | 90%               |
      | Consultation spécialiste    | 75%                      | 90%               |
      | Médicaments catégorie A     | 100%                     | 100%              |
      | Médicaments catégorie B     | 75%                      | 85%               |
      | Médicaments catégorie C     | 50%                      | 50%               |
      | Hospitalisation chambre commune | 100% frais médicaux  | 100%              |
    Et que le statut BIM (Bénéficiaire Intervention Majorée) s'applique si:
      | Condition                              | Seuil revenus annuels 2024 |
      | Ménage 1 personne                      | 22251.48€                   |
      | Ménage + 1 personne à charge           | +4116.62€                   |
      | Bénéficiaire GRAPA, RIS, ARR           | Automatique                 |
      | Enfant avec allocation handicap >66%    | Automatique                 |

  Scénario: Travailleur salarié avec consultation médicale
    Étant donné que je suis travailleur salarié affilié à une mutuelle
    Et que j'ai payé mes cotisations sociales
    Et que je consulte mon médecin généraliste (tarif 29€)
    Quand je présente ma carte eID+ chez le médecin
    Alors le système tiers-payant s'applique
    Et je paie seulement ma quote-part de 7.25€ (25%)
    Et la mutuelle paie directement 21.75€ au médecin
    Et j'ai droit à 12 consultations/an avec DMG (Dossier Médical Global)

  Scénario: Famille avec enfants et statut BIM
    Étant donné que je suis parent isolé avec 2 enfants
    Et que mes revenus annuels sont de 19000€
    Et que je suis reconnu BIM automatiquement
    Quand mon enfant consulte un spécialiste (tarif 50€)
    Alors le remboursement BIM s'applique (90%)
    Et je paie seulement 5€ de ticket modérateur
    Et le maximum à facturer (MAF) protège contre les dépenses excessives
    Et le plafond MAF 2024 pour ma famille est de 250€/an

  Scénario: Personne âgée avec médicaments chroniques
    Étant donné que je suis pensionné de 72 ans
    Et que j'ai des médicaments pour diabète (catégorie A)
    Et que j'ai des médicaments pour tension (catégorie B)
    Et que mes revenus me donnent droit au BIM
    Quand j'achète mes médicaments mensuels
    Alors les antidiabétiques sont remboursés à 100%
    Et les antihypertenseurs sont remboursés à 85%
    Et j'ai droit au forfait malade chronique (103.97€/an)
    Et la pharmacie applique le tiers-payant

  Scénario: Hospitalisation en chambre commune
    Étant donné que je dois être hospitalisé 5 jours
    Et que je choisis une chambre commune
    Et que je suis en ordre de mutuelle
    Quand je suis admis à l'hôpital
    Alors les frais médicaux sont couverts à 100%
    Mais je paie une intervention personnelle journalière:
      | Jour              | Montant 2024  | Montant BIM   |
      | Jour 1            | 44.51€        | 6.32€         |
      | Jours 2-90        | 17.02€/jour   | 6.32€/jour    |
      | Après 91 jours    | 6.32€/jour    | 6.32€/jour    |
    Et aucun supplément d'honoraires n'est facturé
    Et les médicaments hospitaliers sont inclus

  Scénario: Indépendant avec assurance maladie
    Étant donné que je suis travailleur indépendant
    Et que je paie mes cotisations sociales trimestrielles
    Et que j'ai souscrit à une assurance maladie obligatoire
    Quand je tombe malade
    Alors j'ai les mêmes remboursements qu'un salarié
    Mais le délai de carence pour indemnités est différent:
      | Période           | Indemnisation                |
      | Jours 1-7         | Pas d'indemnité              |
      | Jours 8-14        | Indemnité partielle          |
      | Après 15 jours    | Indemnité complète           |
    Et le montant dépend de ma situation familiale

  Scénario: Étudiant avec carte européenne d'assurance maladie
    Étant donné que je suis étudiant belge de 22 ans
    Et que je pars en Erasmus en Espagne
    Et que j'ai demandé ma CEAM (Carte Européenne)
    Quand j'ai besoin de soins urgents à l'étranger
    Alors la CEAM couvre les soins nécessaires
    Et je suis remboursé selon les tarifs INAMI belges
    Ou selon les tarifs du pays si plus avantageux
    Et la mutuelle rembourse après présentation des factures

  Scénario: Chômeur avec maintien des droits
    Étant donné que je suis chômeur indemnisé
    Et que je perçois des allocations de chômage
    Quand je consulte un médecin
    Alors mes droits à l'assurance maladie sont maintenus
    Et les cotisations sont prélevées sur mes allocations
    Et j'ai potentiellement droit au statut BIM
    Si mes revenus sont inférieurs au seuil

  Scénario: Soins dentaires avec remboursement
    Étant donné que j'ai 35 ans
    Et que je vais chez le dentiste agréé
    Quand je fais mon contrôle annuel préventif
    Alors l'examen buccal est remboursé à 100% (code 371011)
    Et le détartrage est remboursé à 75%
    Et si j'ai été l'année précédente (trajet de soins)
    Alors j'ai droit à des remboursements majorés
    Et les soins conservateurs sont mieux remboursés

  Plan du Scénario: Calcul ticket modérateur selon statut
    Étant donné que je suis <statut>
    Et que le coût de la prestation est <cout>€
    Et que le taux de remboursement est <taux>%
    Quand je calcule ma quote-part
    Alors je paie <ticket>€ de ticket modérateur
    Et la mutuelle rembourse <remboursement>€

    Exemples:
      | statut          | cout | taux | ticket | remboursement |
      | assuré ordinaire| 29   | 75   | 7.25   | 21.75         |
      | bénéficiaire BIM| 29   | 90   | 2.90   | 26.10         |
      | assuré ordinaire| 50   | 75   | 12.50  | 37.50         |
      | bénéficiaire BIM| 50   | 90   | 5.00   | 45.00         |

  Scénario: Maximum à facturer (MAF) et protection financière
    Étant donné que ma famille a des frais médicaux importants
    Et que nous avons atteint 650€ de tickets modérateurs en 2024
    Et que nos revenus sont de 35000€ (catégorie 2)
    Quand le MAF est calculé
    Alors notre plafond MAF est de 650€ pour l'année
    Et tous les tickets modérateurs au-delà sont remboursés à 100%
    Et nous recevons automatiquement le remboursement
    Et pour l'année suivante, le compteur repart à zéro

  Scénario: Affection chronique avec forfait de soins
    Étant donné que j'ai une maladie chronique reconnue
    Et que mes dépenses de santé dépassent 365€/an
    Quand je demande le forfait malades chroniques
    Alors je reçois automatiquement 103.97€/an
    Et ce montant aide pour les frais non remboursés
    Et je peux demander le statut affection chronique
    Qui donne droit au tiers-payant obligatoire
    Et réduit mes avances de frais

  Scénario: Contrôles et obligations de l'assuré
    Étant donné que je bénéficie de l'assurance maladie
    Alors je dois respecter ces obligations:
      | Obligation                      | Description                          |
      | Affiliation à une mutuelle      | Obligatoire pour tous               |
      | Paiement des cotisations        | Via employeur ou direct              |
      | Déclaration changement situation| Emploi, adresse, état civil         |
      | Utilisation carte eID/ISI+      | Pour identification                  |
      | Respect parcours de soins       | DMG, renvoi spécialiste             |
    Et le non-respect peut entraîner:
      | Sanction                        | Conséquence                         |
      | Pas de DMG                      | Remboursement réduit de 5€          |
      | Pas de renvoi spécialiste       | Remboursement réduit                |
      | Cotisations impayées            | Suspension des droits               |