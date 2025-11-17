# language: fr
Fonctionnalité: Prime de Naissance
  En tant que parent ou futur parent
  Je veux savoir si j'ai droit à la prime de naissance
  Afin de recevoir une aide financière unique à la naissance de mon enfant

  Contexte:
    Étant donné que les montants de la prime de naissance 2024 sont:
      | Région              | Premier enfant | Enfants suivants |
      | Bruxelles          | 1367.74€       | 621.70€          |
      | Wallonie           | 1100€          | 500€             |
      | Flandre            | 1269.25€       | 1269.25€         |
    Et que la prime peut être demandée:
      | Période                                    | Description                        |
      | À partir du 6ème mois de grossesse        | Demande anticipée possible        |
      | Dans les 90 jours après la naissance      | Délai normal de déclaration        |
      | Jusqu'à 5 ans après la naissance          | Délai exceptionnel avec justification |

  Scénario: Premier enfant à Bruxelles - demande anticipée
    Étant donné que je suis enceinte de mon premier enfant
    Et que je suis au 7ème mois de grossesse
    Et que j'habite à Bruxelles
    Et que j'ai un titre de séjour valide en Belgique
    Quand je demande la prime de naissance anticipée
    Alors je devrais être éligible
    Et le montant devrait être 1367.74€
    Et la prime sera versée au 6ème mois de grossesse
    Et je dois fournir une attestation médicale de grossesse

  Scénario: Deuxième enfant à Bruxelles - après naissance
    Étant donné que j'ai déjà un enfant
    Et que mon deuxième enfant est né il y a 30 jours
    Et que j'habite à Bruxelles
    Et que j'ai un titre de séjour valide en Belgique
    Quand je demande la prime de naissance
    Alors je devrais être éligible
    Et le montant devrait être 621.70€
    Et je dois fournir l'acte de naissance

  Scénario: Premier enfant en Wallonie
    Étant donné que mon premier enfant est né il y a 15 jours
    Et que j'habite en Wallonie
    Et que j'ai un titre de séjour valide en Belgique
    Quand je demande la prime de naissance
    Alors je devrais être éligible
    Et le montant devrait être 1100€
    Et la caisse compétente devrait être "AVIQ ou autre caisse wallonne"

  Scénario: Troisième enfant en Wallonie
    Étant donné que j'ai déjà deux enfants
    Et que mon troisième enfant est né il y a 45 jours
    Et que j'habite en Wallonie
    Et que j'ai un titre de séjour valide en Belgique
    Quand je demande la prime de naissance
    Alors je devrais être éligible
    Et le montant devrait être 500€
    Et le paiement sera unique

  Scénario: Premier enfant en Flandre (Startbedrag)
    Étant donné que mon premier enfant est né il y a 10 jours
    Et que j'habite en Flandre
    Et que j'ai un titre de séjour valide en Belgique
    Quand je demande la prime de naissance (Startbedrag)
    Alors je devrais être éligible
    Et le montant devrait être 1269.25€
    Et le système devrait être "Groeipakket"

  Scénario: Jumeaux à Bruxelles
    Étant donné que je viens d'avoir des jumeaux
    Et que ce sont mes premiers enfants
    Et que j'habite à Bruxelles
    Et que j'ai un titre de séjour valide en Belgique
    Quand je demande la prime de naissance pour naissance multiple
    Alors je devrais être éligible
    Et le montant devrait être 1367.74€ pour le premier jumeau
    Et le montant devrait être 621.70€ pour le second jumeau
    Et le montant total devrait être 1989.44€

  Scénario: Adoption d'un enfant de 3 ans à Bruxelles
    Étant donné que j'adopte un enfant de 3 ans
    Et que c'est mon premier enfant
    Et que j'habite à Bruxelles
    Et que j'ai un titre de séjour valide en Belgique
    Et que l'adoption est officiellement reconnue
    Quand je demande la prime d'adoption
    Alors je devrais être éligible
    Et le montant devrait être 1367.74€
    Et je dois fournir le jugement d'adoption

  Scénario: Demande tardive après 90 jours
    Étant donné que mon enfant est né il y a 120 jours
    Et que je n'ai pas encore demandé la prime
    Et que j'habite à Bruxelles
    Et que j'ai un titre de séjour valide en Belgique
    Quand je demande la prime de naissance
    Alors je devrais encore être éligible
    Et le montant devrait être maintenu
    Mais je dois justifier le retard
    Et fournir une explication valable

  Scénario: Demande très tardive après 5 ans - non éligible
    Étant donné que mon enfant est né il y a 6 ans
    Et que je n'ai jamais demandé la prime
    Et que j'habite à Bruxelles
    Quand je demande la prime de naissance
    Alors je ne devrais pas être éligible
    Et le motif devrait être "délai de prescription de 5 ans dépassé"

  Scénario: Enfant mort-né
    Étant donné que mon enfant est mort-né après 180 jours de grossesse
    Et que j'habite à Bruxelles
    Et que j'ai un titre de séjour valide en Belgique
    Quand je demande la prime de naissance
    Alors je devrais être éligible
    Et le montant devrait être maintenu selon le rang
    Et je dois fournir un certificat médical attestant de la durée de grossesse

  Scénario: Parent sans titre de séjour valide
    Étant donné que mon enfant est né il y a 20 jours
    Et que je n'ai pas de titre de séjour valide en Belgique
    Et que j'habite à Bruxelles
    Quand je demande la prime de naissance
    Alors je ne devrais pas être éligible
    Et le motif devrait être "pas de titre de séjour valide"

  Scénario: Famille déménageant entre régions
    Étant donné que j'étais enceinte et habitais à Bruxelles
    Et que j'ai déménagé en Wallonie au 8ème mois
    Et que mon enfant est né en Wallonie
    Et que j'ai un titre de séjour valide
    Quand je demande la prime de naissance
    Alors l'éligibilité dépend du domicile au moment de la naissance
    Et le montant sera selon le barème wallon (1100€ pour premier enfant)
    Et la caisse wallonne sera compétente

  Plan du Scénario: Calcul prime selon région et rang
    Étant donné que mon enfant de rang <rang> est né
    Et que j'habite en/à <région>
    Et que j'ai un titre de séjour valide
    Quand je demande la prime de naissance
    Alors le montant devrait être <montant>€

    Exemples:
      | région    | rang | montant  |
      | Bruxelles | 1    | 1367.74  |
      | Bruxelles | 2    | 621.70   |
      | Bruxelles | 3    | 621.70   |
      | Wallonie  | 1    | 1100.00  |
      | Wallonie  | 2    | 500.00   |
      | Wallonie  | 4    | 500.00   |
      | Flandre   | 1    | 1269.25  |
      | Flandre   | 2    | 1269.25  |
      | Flandre   | 5    | 1269.25  |

  Scénario: Documents requis pour la prime
    Étant donné que je veux demander la prime de naissance
    Et que mon enfant est né il y a 10 jours
    Quand je prépare mon dossier
    Alors je dois fournir:
      | Document                           | Description                                    |
      | Acte de naissance                  | Document officiel de la commune               |
      | Carte d'identité des parents       | Ou titre de séjour valide                    |
      | Preuve de domicile                  | Composition de ménage ou facture              |
      | RIB ou numéro de compte            | Pour le versement de la prime                 |
      | Formulaire de demande              | Complété et signé                             |
    Et la prime sera versée dans les 2 mois

  Scénario: Cumul avec autres aides
    Étant donné que je reçois déjà le RIS
    Et que mon enfant vient de naître
    Et que j'habite à Bruxelles
    Et que j'ai un titre de séjour valide
    Quand je demande la prime de naissance
    Alors je devrais être éligible
    Et la prime de naissance est cumulable avec le RIS
    Et le montant de la prime n'affecte pas mon RIS
    Et je recevrai 1367.74€ (premier enfant) ou 621.70€ (suivants)