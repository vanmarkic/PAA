# language: fr
Fonctionnalité: Recours administratifs préalables
  En tant qu'administré
  Je veux introduire un recours administratif
  Afin d'obtenir la révision d'une décision sans passer par le tribunal

  Contexte:
    Étant donné que les recours administratifs sont généralement gratuits
    Et qu'ils peuvent être obligatoires avant le recours juridictionnel
    Et qu'ils suspendent parfois les délais de recours contentieux

  Scénario: Recours gracieux auprès de l'auteur de l'acte
    Étant donné que j'ai reçu une décision défavorable de l'administration communale
    Et que je souhaite d'abord tenter un recours amiable
    Et que la décision date de moins de 2 mois
    Quand j'introduis un recours gracieux
    Alors je dois l'adresser à l'autorité qui a pris la décision
    Et l'administration a 60 jours pour répondre
    Et le silence vaut décision implicite de rejet après 60 jours
    Et je conserve mon droit au recours contentieux

  Scénario: Recours hiérarchique auprès du supérieur
    Étant donné qu'un fonctionnaire a pris une décision défavorable
    Et que cette décision peut être révisée par son supérieur
    Et que la voie hiérarchique est ouverte
    Quand j'introduis un recours hiérarchique
    Alors je dois l'adresser au supérieur hiérarchique
    Et le délai est généralement de 30 jours
    Et le supérieur peut annuler, modifier ou confirmer la décision
    Et ce recours est parfois obligatoire avant le contentieux

  Scénario: Recours administratif obligatoire en matière fiscale
    Étant donné que j'ai reçu un avertissement-extrait de rôle
    Et que je conteste le montant de l'impôt
    Quand je veux contester cette imposition
    Alors je dois d'abord introduire une réclamation fiscale
    Et le délai est de 6 mois à partir de l'avertissement
    Et cette réclamation est obligatoire avant le tribunal
    Et l'administration a 6 mois pour répondre (prolongeable)

  Scénario: Recours devant une commission administrative
    Étant donné qu'une commission de recours existe pour ma matière
    Et que j'ai reçu une décision susceptible de recours
    Quand j'introduis mon recours devant la commission
    Alors la commission doit m'entendre si je le demande
    Et elle rend un avis ou une décision selon ses compétences
    Et les délais varient selon le type de commission
    Et la procédure est généralement contradictoire

  Scénario: Médiation administrative
    Étant donné que j'ai un différend avec l'administration
    Et que je préfère une solution négociée
    Et qu'un médiateur est compétent pour ma situation
    Quand je saisis le médiateur
    Alors la médiation est gratuite et confidentielle
    Et le médiateur tente de rapprocher les points de vue
    Et il peut faire des recommandations
    Et la médiation n'empêche pas le recours ultérieur

  Scénario: Recours contre le silence de l'administration
    Étant donné que j'ai introduit une demande il y a 4 mois
    Et que l'administration n'a pas répondu
    Et qu'aucun délai spécifique n'est prévu
    Quand le délai de 4 mois est écoulé
    Alors le silence vaut décision implicite de rejet
    Et je peux contester cette décision implicite
    Et je dois prouver ma demande initiale
    Et le délai de recours court à partir du 4ème mois

  Plan du Scénario: Choix du recours approprié
    Étant donné que j'ai reçu une décision de type <type_decision>
    Et que l'autorité est <autorite>
    Quand je cherche le recours approprié
    Alors je devrais utiliser <type_recours>
    Et le délai est de <delai> jours
    Et le recours est <caractere>

    Exemples:
      | type_decision        | autorite           | type_recours       | delai | caractere    |
      | permis refusé        | commune            | hiérarchique      | 30    | facultatif   |
      | sanction disciplinaire| administration    | hiérarchique      | 30    | obligatoire  |
      | impôt                | SPF Finances       | réclamation       | 180   | obligatoire  |
      | aide sociale         | CPAS               | tribunal travail  | 90    | direct       |
      | amende administrative| commune            | gracieux          | 30    | facultatif   |

  Scénario: Recours administratif avec effet suspensif
    Étant donné qu'une sanction administrative m'a été infligée
    Et que le recours a un effet suspensif légal
    Quand j'introduis mon recours dans les délais
    Alors l'exécution de la sanction est suspendue
    Et elle reste suspendue jusqu'à la décision sur recours
    Et je dois respecter scrupuleusement les délais
    Et l'administration doit me notifier sa décision

  Scénario: Opposition administrative
    Étant donné qu'une décision a été prise en mon absence
    Et que j'avais un empêchement légitime
    Et que la procédure prévoit l'opposition
    Quand je forme opposition
    Alors la décision est remise en question
    Et une nouvelle procédure contradictoire s'ouvre
    Et je dois justifier mon absence
    Et le délai d'opposition est généralement court (15-30 jours)

  Scénario: Révision administrative pour fait nouveau
    Étant donné qu'une décision définitive a été prise
    Et que des éléments nouveaux sont apparus
    Et que ces éléments auraient changé la décision
    Quand je demande la révision administrative
    Alors je dois prouver le caractère nouveau des éléments
    Et l'administration peut rouvrir le dossier
    Et la révision reste exceptionnelle
    Et elle ne remet pas en cause la sécurité juridique