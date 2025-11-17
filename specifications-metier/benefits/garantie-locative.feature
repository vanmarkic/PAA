# language: fr
Fonctionnalité: Garantie Locative
  En tant que locataire avec des difficultés financières
  Je veux obtenir de l'aide pour constituer ma garantie locative
  Afin de pouvoir accéder à un logement décent

  Contexte:
    Étant donné que les montants maximums de garantie locative 2024 sont:
      | Région              | Type constitution          | Montant maximum        | Depuis        |
      | Bruxelles-Capitale  | Tous types                 | 2 mois de loyer       | Nov 2024      |
      | Wallonie            | Compte bloqué              | 2 mois de loyer       | En vigueur    |
      | Wallonie            | Garantie bancaire          | 3 mois de loyer       | En vigueur    |
      | Wallonie            | Via CPAS                   | 3 mois de loyer       | En vigueur    |
      | Flandres            | Tous types                 | 3 mois de loyer max   | En vigueur    |
    Et que les types d'intervention CPAS sont:
      | Type intervention   | Description                                              | Montant max    |
      | Avance directe      | CPAS place l'argent sur compte bloqué                  | 2 mois loyer   |
      | Garantie bancaire   | Banque s'engage via CPAS                               | 3 mois loyer   |
      | Prêt sans intérêt   | CPAS prête avec plan de remboursement                  | 2-3 mois loyer |
      | Don                 | CPAS offre la garantie (cas exceptionnels)             | Variable       |

  Scénario: Personne RIS demandant aide CPAS pour garantie
    Étant donné que je bénéficie du RIS à 1070.49€/mois
    Et que j'ai trouvé un logement à 600€/mois
    Et que la garantie demandée est 2 mois (1,200€)
    Et que je n'ai aucune épargne
    Et que je réside à Bruxelles
    Quand je demande l'aide du CPAS pour la garantie
    Alors je devrais être éligible à l'aide
    Et le CPAS peut avancer les 1,200€
    Et l'argent est placé sur un compte bloqué à mon nom
    Et je rembourse progressivement selon mes capacités
    Et le plan de remboursement est adapté à mes revenus

  Scénario: Famille avec garantie bancaire via CPAS
    Étant donné que nous sommes une famille de 4 personnes
    Et que nos revenus mensuels sont de 2,000€
    Et que le loyer du nouveau logement est 900€
    Et que la garantie demandée est 2,700€ (3 mois)
    Et que nous résidons en Wallonie
    Quand nous demandons une garantie bancaire via le CPAS
    Alors le CPAS évalue notre situation financière
    Et peut se porter garant auprès de la banque
    Et la banque émet la garantie au nom du CPAS
    Et nous remboursons le CPAS progressivement
    Et aucun intérêt n'est appliqué

  Scénario: Jeune sortant d'institution avec aide exceptionnelle
    Étant donné que j'ai 19 ans
    Et que je sors d'une institution d'aide à la jeunesse
    Et que j'ai un contrat de travail à 1,400€/mois
    Et que j'ai trouvé un studio à 500€/mois
    Et que je n'ai aucune épargne ni famille
    Quand je demande l'aide du CPAS
    Alors ma situation est considérée comme prioritaire
    Et le CPAS peut octroyer un don partiel ou total
    Et la garantie de 1,000€ peut être offerte
    Et un accompagnement social est proposé
    Et un suivi budgétaire est mis en place

  Scénario: Personne surendettée en médiation
    Étant donné que je suis en médiation de dettes
    Et que mon budget est géré par un médiateur
    Et que je dois déménager suite à une expulsion
    Et que le nouveau loyer est 650€/mois
    Et que la garantie demandée est 1,300€
    Quand le médiateur demande l'aide du CPAS
    Alors le CPAS examine avec le médiateur
    Et peut accorder un prêt sans intérêt
    Et le remboursement est intégré au plan de médiation
    Et les mensualités sont adaptées (ex: 50€/mois)
    Et la durée peut s'étendre sur 2-3 ans

  Scénario: Constitution progressive de garantie locative
    Étant donné que je suis locataire à Bruxelles
    Et que mon loyer est de 700€/mois
    Et que je n'ai que 500€ d'économies
    Et que la garantie requise est 1,400€ (2 mois)
    Quand je négocie avec le propriétaire
    Alors je peux proposer une garantie progressive
    Et verser 500€ immédiatement
    Et compléter par versements de 150€/mois sur 6 mois
    Et le CPAS peut garantir les versements futurs
    Et un accord écrit est obligatoire

  Scénario: Refus d'aide CPAS pour revenus suffisants
    Étant donné que j'ai un salaire de 2,500€/mois
    Et que j'ai 5,000€ d'épargne
    Et que je demande l'aide pour une garantie de 1,800€
    Et que je n'ai pas de charges exceptionnelles
    Quand je demande l'aide du CPAS
    Alors ma demande devrait être refusée
    Et le motif est "ressources suffisantes disponibles"
    Et je suis orienté vers une solution bancaire classique
    Et je peux faire appel de la décision

  Scénario: Garantie via Fonds du Logement régional
    Étant donné que je réside en Wallonie
    Et que mes revenus sont modestes mais stables
    Et que je ne suis pas éligible à l'aide CPAS
    Et que j'ai besoin d'une garantie de 1,500€
    Quand je m'adresse au Fonds du Logement
    Alors je peux obtenir un prêt à taux réduit
    Et le taux est de 0% à 2% selon mes revenus
    Et le remboursement s'étale sur 24-36 mois
    Et les conditions sont plus souples qu'une banque
    Et l'accord du propriétaire est requis

  Scénario: Changement de logement avec récupération garantie
    Étant donné que j'ai une garantie CPAS sur mon logement actuel
    Et que la garantie est de 1,200€ sur compte bloqué
    Et que je dois déménager pour un nouveau logement
    Et que la nouvelle garantie requise est 1,400€
    Quand je demande le transfert de garantie
    Alors le CPAS peut faciliter la transition
    Et avancer la différence de 200€
    Et coordonner avec l'ancien et nouveau propriétaire
    Et s'assurer de la libération de l'ancienne garantie
    Et éviter une double garantie temporaire

  Scénario: Garantie pour logement social ou AIS
    Étant donné que j'accède à un logement social
    Et que le loyer social est de 350€/mois
    Et qu'une garantie de 700€ est demandée
    Et que je bénéficie du RIS
    Quand je demande l'aide pour la garantie
    Alors le CPAS a une procédure simplifiée
    Et la garantie peut être constituée progressivement
    Et les premiers mois peuvent être déduits du RIS
    Et un maximum de 100€/mois est prélevé
    Et la société de logement accepte cet arrangement

  Plan du Scénario: Aide CPAS selon situation et montants
    Étant donné que je suis <situation>
    Et que mes revenus mensuels sont <revenus>€
    Et que le loyer est de <loyer>€
    Et que la garantie demandée est <garantie>€
    Et que mon épargne est <épargne>€
    Quand je demande l'aide du CPAS
    Alors l'éligibilité est <éligibilité>
    Et le type d'aide proposé est <type_aide>
    Et le montant accordé est <montant>€

    Exemples:
      | situation            | revenus | loyer | garantie | épargne | éligibilité | type_aide           | montant |
      | bénéficiaire RIS     | 1070    | 600   | 1200     | 0       | oui         | avance directe      | 1200    |
      | travailleur pauvre   | 1400    | 700   | 1400     | 200     | oui         | prêt sans intérêt   | 1200    |
      | famille nombreuse    | 2200    | 950   | 1900     | 500     | oui         | garantie bancaire   | 1400    |
      | jeune 18 ans         | 0       | 450   | 900      | 0       | oui         | don exceptionnel    | 900     |
      | médiation dettes     | 1600    | 650   | 1300     | 0       | oui         | prêt adapté         | 1300    |
      | revenus élevés       | 3000    | 900   | 1800     | 5000    | non         | aucune              | 0       |
      | sans-abri relogé     | 0       | 500   | 1000     | 0       | oui         | don + accompagnement| 1000    |

  Scénario: Procédure de demande et enquête sociale
    Étant donné que je demande l'aide du CPAS pour une garantie
    Quand j'introduis ma demande
    Alors la procédure comprend:
      | Étape                       | Délai         | Documents requis                    |
      | Dépôt de la demande         | Immédiat      | Formulaire + carte identité        |
      | Accusé de réception         | Immédiat      | Preuve de dépôt avec date          |
      | Enquête sociale             | 8-15 jours    | Visite à domicile possible         |
      | Documents à fournir         | Variable      | Contrat bail, preuves revenus      |
      | Décision du conseil         | Max 30 jours  | Notification écrite                |
      | Versement si accepté        | 8 jours       | Sur compte bloqué ou au propriétaire|
    Et l'enquête sociale examine:
      | Critère examiné             | Vérification                        |
      | Situation financière        | Revenus, charges, dettes           |
      | Composition du ménage       | Registre national                  |
      | Nécessité du déménagement   | Raisons (insalubrité, expulsion)   |
      | Capacité de remboursement   | Budget disponible mensuel          |
      | Autres aides possibles      | Famille, employeur, associations   |

  Scénario: Remboursement et suivi de la garantie
    Étant donné que j'ai reçu une aide CPAS de 1,500€
    Et que c'est un prêt sans intérêt
    Quand le plan de remboursement est établi
    Alors les modalités sont:
      | Aspect                      | Détail                              |
      | Mensualité                  | Adaptée aux revenus (50-150€)      |
      | Durée maximale              | 36 mois généralement                |
      | Révision possible           | Si changement situation             |
      | Suspension possible         | En cas de difficultés temporaires  |
      | Remboursement anticipé      | Toujours possible sans pénalité    |
    Et en cas de non-remboursement:
      | Conséquence                 | Application                        |
      | Rappels                     | 3 rappels avant poursuites         |
      | Médiation                   | Tentative de nouvel accord         |
      | Récupération                | Sur prestations sociales futures   |
      | Poursuites                  | En dernier recours uniquement      |

  Scénario: Libération et récupération de garantie
    Étant donné que je quitte mon logement
    Et que j'ai une garantie CPAS de 1,200€
    Et que l'état des lieux de sortie est fait
    Quand la garantie doit être libérée
    Alors la procédure est:
      | Étape                       | Responsable   | Délai              |
      | État des lieux de sortie    | Locataire     | Fin du bail       |
      | Accord sur dégâts éventuels | Parties       | Immédiat          |
      | Libération garantie         | Propriétaire  | Max 2 mois        |
      | Remboursement au CPAS       | Automatique   | Si prêt en cours  |
      | Solde au locataire          | CPAS          | Après déduction   |
    Et si contestation:
      | Recours                     | Procédure                          |
      | Médiation                   | Via juge de paix                   |
      | CPAS peut intervenir        | Assistance juridique               |
      | Protection du locataire     | Garantie ne peut être saisie      |