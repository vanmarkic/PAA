# language: fr
Fonctionnalité: Crédit-temps et Interruption de Carrière
  En tant que travailleur du secteur privé ou public
  Je veux prendre un crédit-temps ou une interruption de carrière
  Afin de concilier vie professionnelle et vie privée

  Contexte:
    Étant donné que les conditions de crédit-temps 2024 sont:
      | Type de mesure                        | Détails                                            |
      | Crédit-temps sans motif               | Supprimé depuis avril 2017                        |
      | Crédit-temps avec motif               | Max 51 mois sur la carrière                       |
      | Congé parental                        | 4 mois par enfant                                 |
      | Congé pour soins                     | 51 mois maximum                                   |
      | Congé pour assistance médicale        | 12 mois (prolongeable à 24)                       |
      | Congé pour soins palliatifs          | 1 mois (prolongeable à 2)                         |
      | Réduction 1/5 temps fin de carrière  | À partir de 55 ans                                |
      | Réduction 1/2 temps fin de carrière  | À partir de 60 ans                                |
      | Application obligatoire               | Via Break@work depuis octobre 2024                |

  Scénario: Congé parental pour parent d'un enfant de moins de 12 ans
    Étant donné que je suis employé à temps plein depuis 3 ans
    Et que j'ai un enfant de 3 ans
    Et que je n'ai jamais pris de congé parental
    Et que mon employeur a plus de 10 travailleurs
    Quand je demande un congé parental à 1/5 temps
    Alors j'ai droit à 4 mois de réduction
    Et je reçois une allocation de l'ONEM de "179.84€ net par mois"
    Et mon employeur ne peut pas refuser
    Et je conserve mon ancienneté
    Et je suis protégé contre le licenciement
    Et la protection dure "3 mois après la fin du congé"

  Scénario: Crédit-temps pour soins à un parent malade
    Étant donné que je travaille à temps plein
    Et que j'ai 45 ans
    Et que ma mère est gravement malade (certificat médical)
    Et que je souhaite réduire mon temps de travail à mi-temps
    Et que j'ai 24 mois d'ancienneté chez mon employeur
    Quand je demande un crédit-temps pour assistance médicale
    Alors j'ai droit à 12 mois (prolongeable à 24)
    Et je reçois une allocation de "664.10€ net par mois" (mi-temps)
    Et je dois fournir un certificat médical tous les 3 mois
    Et mon contrat reste en CDI
    Et mes droits sociaux sont maintenus proportionnellement

  Scénario: Fin de carrière en douceur à 1/5 temps
    Étant donné que j'ai 58 ans
    Et que j'ai une carrière de 35 ans
    Et que je travaille dans le secteur privé
    Et que je souhaite réduire à 4/5 temps
    Et que j'ai l'accord de mon employeur
    Quand je demande un crédit-temps fin de carrière
    Alors j'ai droit jusqu'à ma pension
    Et je reçois une allocation de "271.15€ net par mois"
    Et je dois avoir 25 ans de carrière salariée
    Et la mesure est possible dès 55 ans avec conditions
    Et je peux cumuler avec mon salaire réduit

  Scénario: Interruption de carrière complète secteur public
    Étant donné que je suis fonctionnaire statutaire
    Et que j'ai 35 ans
    Et que j'ai 5 ans d'ancienneté
    Et que je souhaite faire une pause carrière d'un an
    Quand je demande une interruption de carrière ordinaire
    Alors la durée maximale est de "60 mois sur ma carrière"
    Et je reçois une allocation de "766.42€ net par mois" (isolé)
    Et mon emploi est garanti au retour
    Et je conserve mes droits à la promotion
    Et ma période compte pour ma pension (sous conditions)

  Scénario: Congé pour soins palliatifs
    Étant donné que mon partenaire est en phase terminale
    Et que j'ai besoin de l'accompagner
    Et que j'ai un certificat médical approprié
    Quand je demande un congé pour soins palliatifs
    Alors j'ai droit à 1 mois (prolongeable 1 fois)
    Et je reçois une allocation de "1528.78€ net" (temps plein)
    Et mon employeur ne peut pas refuser
    Et je suis protégé contre le licenciement
    Et je peux prendre ce congé de manière fractionnée

  Scénario: Crédit-temps refusé pour motif non valable
    Étant donné que je souhaite un crédit-temps pour voyager
    Et que le crédit-temps sans motif est supprimé depuis 2017
    Et que je n'ai pas de motif reconnu
    Quand je demande un crédit-temps
    Alors ma demande sera refusée
    Et le motif sera "absence de motif valable depuis la réforme 2017"
    Et je ne peux pas recevoir d'allocations ONEM

  Scénario: Employé dans une PME de moins de 10 travailleurs
    Étant donné que mon employeur a seulement 8 employés
    Et que je souhaite un congé parental
    Et que j'ai un enfant de 2 ans
    Quand je demande le congé
    Alors mon employeur peut reporter la demande
    Et le report peut être de "6 mois maximum"
    Et il doit justifier par l'organisation du travail
    Et j'ai quand même droit après ce délai
    Et l'allocation ONEM reste identique

  Scénario: Crédit-temps pour formation reconnue
    Étant donné que je suis employé à temps plein
    Et que je souhaite suivre une formation en comptabilité
    Et que la formation est reconnue par la Communauté
    Et que j'ai 2 ans d'ancienneté
    Quand je demande un crédit-temps formation à mi-temps
    Alors j'ai droit à 36 mois maximum sur ma carrière
    Et je reçois une allocation de "664.10€ net par mois"
    Et je dois fournir une attestation d'inscription
    Et je dois prouver la participation régulière
    Et je dois réussir pour continuer l'année suivante

  Plan du Scénario: Montants d'allocations selon la situation
    Étant donné que je prends un <type_conge>
    Et que ma situation familiale est <situation>
    Et que la réduction est <reduction>
    Et que j'ai <age> ans
    Quand je calcule mon allocation ONEM
    Alors le montant mensuel net est <montant>€
    Et la durée maximale est <duree>

    Exemples:
      | type_conge           | situation | reduction    | age | montant | duree        |
      | congé parental       | isolé     | 1/5 temps    | 35  | 179.84  | 4 mois       |
      | congé parental       | isolé     | 1/2 temps    | 35  | 449.60  | 4 mois       |
      | congé parental       | isolé     | temps plein  | 35  | 899.20  | 4 mois       |
      | assistance médicale  | cohabitant| 1/2 temps    | 45  | 531.28  | 24 mois max  |
      | soins palliatifs    | isolé     | temps plein  | 40  | 1528.78 | 2 mois max   |
      | fin de carrière     | isolé     | 1/5 temps    | 58  | 271.15  | jusqu'à pension |
      | fin de carrière     | isolé     | 1/2 temps    | 60  | 664.10  | jusqu'à pension |

  Scénario: Procédure via Break@work depuis 2024
    Étant donné que je veux demander un crédit-temps
    Et que nous sommes après octobre 2024
    Quand je fais ma demande
    Alors je dois obligatoirement utiliser Break@work
    Et je ne peux plus introduire de demande papier
    Et je dois d'abord créer mon compte avec eID
    Et je peux consulter mes droits restants en ligne
    Et je reçois la décision par voie électronique
    Et le délai de traitement est de "30 jours maximum"

  Scénario: Cumul de différents types de congés
    Étant donné que j'ai déjà pris 24 mois de congé parental
    Et que j'ai maintenant un parent malade
    Et que je souhaite prendre un congé pour assistance
    Quand je vérifie mes droits restants
    Alors le congé parental n'impacte pas mes droits assistance
    Et j'ai encore droit à 12-24 mois pour assistance
    Et le total ne peut pas dépasser 51 mois avec motif
    Et les congés thématiques sont comptés séparément

  Scénario: Impact sur la pension
    Étant donné que je prends une interruption de carrière
    Et que je suis fonctionnaire
    Et que l'interruption dure 12 mois
    Quand je calcule l'impact sur ma pension
    Alors certaines périodes sont assimilées gratuitement
    Et d'autres nécessitent une cotisation volontaire
    Et le congé parental compte toujours pour la pension
    Et je peux racheter les périodes non couvertes
    Et le coût dépend de mon traitement de référence

  Scénario: Obligations pendant le crédit-temps
    Étant donné que je suis en crédit-temps pour formation
    Quand je suis en période de crédit-temps
    Alors je dois suivre la formation régulièrement
    Et je dois fournir les attestations trimestrielles
    Et je ne peux pas exercer d'activité incompatible
    Et je dois informer l'ONEM de tout changement
    Et je dois reprendre le travail à la date prévue
    Et je reste lié par mon contrat de travail
    Et je ne peux pas prester pour un concurrent