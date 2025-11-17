# language: fr
Fonctionnalité: Permis d'environnement
  En tant qu'entreprise ou particulier
  Je veux obtenir un permis d'environnement
  Afin d'exploiter une installation classée légalement

  Contexte:
    Étant donné que les classes d'installations sont définies selon l'impact:
      | Classe | Impact            | Procédure            | Délai    |
      | 1      | Impact important  | Permis complet       | 90 jours |
      | 2      | Impact modéré     | Permis simplifié     | 60 jours |
      | 3      | Impact faible     | Déclaration simple   | 30 jours |

  Scénario: Installation industrielle classe 1 nécessitant permis complet
    Étant donné que je suis une entreprise industrielle
    Et que mon installation a une puissance de 2000 kW
    Et que j'émets plus de 50 tonnes de CO2 par an
    Et que je suis situé en Wallonie
    Quand je demande un permis d'environnement
    Alors je dois fournir une étude d'incidences complète
    Et une enquête publique doit être organisée
    Et le délai de traitement sera de 90 jours
    Et je dois appliquer les meilleures techniques disponibles (MTD)

  Scénario: PME classe 2 avec procédure simplifiée
    Étant donné que je suis une PME
    Et que mon installation a une puissance de 500 kW
    Et que mes émissions sont inférieures aux seuils IPPC
    Et que je suis situé à Bruxelles
    Quand je demande un permis d'environnement
    Alors je dois fournir une notice d'évaluation
    Et le délai de traitement sera de 60 jours
    Et je dois respecter les conditions sectorielles

  Scénario: Artisan classe 3 avec simple déclaration
    Étant donné que je suis un artisan
    Et que mon atelier fait moins de 100 m²
    Et que j'utilise moins de 50 kW de puissance
    Et que je n'utilise pas de produits dangereux
    Quand je fais ma déclaration environnementale
    Alors elle est automatiquement acceptée sous 30 jours
    Et je reçois un récépissé de déclaration
    Et je dois respecter les conditions générales d'exploitation

  Scénario: Installation Seveso seuil haut
    Étant donné que je stocke 500 tonnes de substances dangereuses
    Et que je dépasse le seuil haut Seveso
    Quand je demande un permis d'environnement
    Alors je dois fournir un rapport de sécurité
    Et un plan d'urgence interne doit être établi
    Et une zone de protection doit être définie
    Et l'inspection annuelle est obligatoire

  Scénario: Refus pour non-conformité
    Étant donné que mon installation est située en zone Natura 2000
    Et que l'étude d'incidences montre un impact majeur sur la biodiversité
    Et qu'aucune mesure compensatoire n'est suffisante
    Quand je demande un permis d'environnement
    Alors ma demande est refusée
    Et le motif est "impact inacceptable sur zone protégée"
    Et je peux introduire un recours dans les 30 jours

  Plan du Scénario: Calcul des garanties financières selon la classe
    Étant donné que mon installation est de classe <classe>
    Et que le risque est évalué comme <risque>
    Quand je calcule la garantie financière requise
    Alors le montant sera de <garantie> euros

    Exemples:
      | classe | risque   | garantie |
      | 1      | élevé    | 50000    |
      | 1      | modéré   | 30000    |
      | 2      | élevé    | 20000    |
      | 2      | modéré   | 10000    |
      | 3      | faible   | 0        |