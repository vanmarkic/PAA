# language: fr
Fonctionnalité: Dépôt de brevet belge
  En tant qu'inventeur ou entreprise
  Je veux déposer une demande de brevet en Belgique
  Afin de protéger mon invention pendant 20 ans

  Contexte:
    Étant donné que les frais de dépôt de brevet 2024 sont:
      | Type de frais          | Montant |
      | Dépôt                  | 50€     |
      | Recherche              | 300€    |
      | Examen                 | 150€    |
      | Délivrance             | 40€     |
      | Annuité année 3        | 40€     |
      | Annuité année 10       | 260€    |
      | Annuité année 20       | 1200€   |

  Scénario: Dépôt de brevet pour invention technique éligible
    Étant donné que je suis un inventeur indépendant
    Et que j'ai développé un nouveau dispositif médical
    Et que mon invention présente une nouveauté absolue
    Et que mon invention implique une activité inventive
    Et que mon invention est susceptible d'application industrielle
    Et que j'ai préparé une description complète avec revendications
    Quand je dépose ma demande de brevet auprès de l'OPRI
    Alors ma demande devrait être acceptée pour dépôt
    Et je devrais recevoir un numéro de demande BE2024/XXXXX
    Et la date de dépôt devrait être enregistrée
    Et je devrais payer les frais de dépôt de 50€

  Scénario: Demande avec priorité conventionnelle
    Étant donné que j'ai déposé une première demande en France il y a 6 mois
    Et que le numéro de priorité est FR2023/12345
    Et que je souhaite étendre ma protection en Belgique
    Quand je dépose ma demande belge avec revendication de priorité
    Alors la priorité devrait être reconnue
    Et la date de priorité devrait être celle du dépôt français
    Et je dispose de 16 mois pour fournir la copie certifiée

  Scénario: Invention non brevetable - méthode commerciale
    Étant donné que j'ai développé une nouvelle méthode de marketing
    Et que cette méthode est purement commerciale
    Et qu'elle ne présente pas de caractère technique
    Quand je vérifie l'éligibilité au brevet
    Alors je devrais être informé que c'est non brevetable
    Et le motif devrait être "les méthodes commerciales ne sont pas brevetables"

  Scénario: Invention non brevetable - programme d'ordinateur en tant que tel
    Étant donné que j'ai créé un nouveau logiciel
    Et que le logiciel n'a pas d'effet technique
    Et qu'il s'agit d'un programme d'ordinateur en tant que tel
    Quand je vérifie l'éligibilité au brevet
    Alors je devrais être informé que c'est non brevetable
    Et le motif devrait être "les programmes d'ordinateur en tant que tels ne sont pas brevetables"

  Scénario: Demande provisoire pour établir une date de dépôt
    Étant donné que j'ai une invention urgente à protéger
    Et que ma description n'est pas complète
    Et que je n'ai pas encore rédigé les revendications
    Quand je dépose une demande provisoire
    Alors je devrais obtenir une date de dépôt
    Et je dispose de 12 mois pour compléter le dossier
    Et je peux revendiquer "patent pending"

  Scénario: Rapport de recherche avec antériorités destructrices
    Étant donné que j'ai déposé ma demande de brevet
    Et que j'ai payé les frais de recherche de 300€
    Quand l'OPRI effectue la recherche d'antériorités
    Et qu'un document X est trouvé détruisant la nouveauté
    Alors je devrais recevoir un rapport de recherche négatif
    Et je peux modifier mes revendications dans un délai de 2 mois
    Et abandonner ma demande

  Plan du Scénario: Calcul des annuités selon l'année
    Étant donné que mon brevet a été délivré
    Et que je suis en année <année> après le dépôt
    Quand je calcule l'annuité à payer
    Alors le montant devrait être <montant>€

    Exemples:
      | année | montant |
      | 3     | 40      |
      | 5     | 60      |
      | 10    | 260     |
      | 15    | 560     |
      | 20    | 1200    |

  Scénario: Extension via PCT (Patent Cooperation Treaty)
    Étant donné que j'ai déposé une demande belge
    Et que je souhaite une protection internationale
    Et que moins de 12 mois se sont écoulés depuis le dépôt
    Quand je dépose une demande PCT
    Alors je peux désigner jusqu'à 153 pays
    Et je dispose de 30 mois pour entrer en phase nationale
    Et je dois payer les taxes PCT internationales

  Scénario: Certificat complémentaire de protection pour médicament
    Étant donné que j'ai un brevet sur un principe actif pharmaceutique
    Et que j'ai obtenu une AMM (Autorisation de Mise sur le Marché)
    Et que l'AMM a pris 8 ans après le dépôt du brevet
    Quand je demande un certificat complémentaire de protection
    Alors je peux obtenir jusqu'à 5 ans de protection supplémentaire
    Et la durée est calculée selon la formule réglementaire

  Scénario: Co-inventeurs avec répartition des droits
    Étant donné que nous sommes 3 co-inventeurs
    Et que les contributions sont 50%, 30%, et 20%
    Quand nous déposons la demande de brevet ensemble
    Alors tous les inventeurs doivent être mentionnés
    Et un accord de copropriété doit être établi
    Et les droits d'exploitation doivent être définis