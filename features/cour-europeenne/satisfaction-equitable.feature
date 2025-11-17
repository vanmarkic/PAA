# language: fr
Fonctionnalité: Satisfaction équitable (Article 41)
  En tant que requérant ayant obtenu gain de cause
  Je veux demander une satisfaction équitable
  Afin d'obtenir réparation pour le préjudice subi

  Contexte:
    Étant donné que l'article 41 prévoit la satisfaction équitable
    Et que la Cour peut l'accorder si le droit interne ne permet pas réparation
    Et que les demandes doivent être chiffrées et justifiées

  Scénario: Demande complète de satisfaction équitable
    Étant donné que la Cour a constaté une violation de l'article 6
    Et que j'ai subi un préjudice matériel de 25000 euros
    Et un préjudice moral évalué à 15000 euros
    Et que mes frais d'avocat s'élèvent à 12000 euros
    Quand je soumets ma demande de satisfaction équitable
    Alors je devrais fournir les justificatifs pour chaque montant
    Et détailler le calcul du préjudice matériel
    Et justifier le préjudice moral par des cas comparables
    Et fournir les factures des frais et dépens

  Scénario: Préjudice matériel avec perte de revenus
    Étant donné que j'ai été licencié illégalement
    Et que mon salaire mensuel était de 3000 euros
    Et que j'ai été sans emploi pendant 18 mois
    Et que j'ai retrouvé un emploi à 2500 euros
    Quand je calcule mon préjudice matériel
    Alors la perte totale devrait être 54000 euros
    Et la perte future estimée à 6000 euros par an
    Et je devrais demander la capitalisation des pertes futures
    Et fournir mes fiches de paie comme preuves

  Scénario: Préjudice moral pour détention arbitraire
    Étant donné que j'ai été détenu arbitrairement 6 mois
    Et que la jurisprudence accorde 100-200 euros par jour
    Et que mes conditions de détention étaient difficiles
    Et que j'ai subi une atteinte à ma réputation
    Quand j'évalue mon préjudice moral
    Alors je pourrais demander 30000 euros minimum
    Et citer les arrêts similaires comme références
    Et décrire les souffrances endurées
    Et l'impact sur ma vie familiale

  Scénario: Frais et dépens avec plusieurs avocats
    Étant donné que j'ai eu un avocat national (8000 euros)
    Et un avocat devant la CEDH (15000 euros)
    Et des frais de traduction de 3000 euros
    Et des frais d'expertise de 5000 euros
    Quand je compile mes frais et dépens
    Alors le total devrait être 31000 euros
    Et je devrais fournir toutes les factures
    Et justifier la nécessité de chaque dépense
    Et demander les intérêts moratoires

  Scénario: Refus partiel de satisfaction équitable
    Étant donné que j'ai demandé 100000 euros au total
    Et que certains préjudices ne sont pas prouvés
    Et que certains frais sont jugés excessifs
    Et que la violation est partielle
    Quand la Cour statue sur ma demande
    Alors elle pourrait accorder une somme réduite
    Et expliquer les raisons des réductions
    Et fixer un délai de paiement de 3 mois
    Et prévoir des intérêts en cas de retard

  Plan du Scénario: Montants typiques selon la violation
    Étant donné une violation de l'article "<article>"
    Et une durée/gravité "<gravite>"
    Et un contexte "<contexte>"
    Quand la Cour accorde une satisfaction équitable
    Alors le montant typique serait environ <montant> euros
    Et le type principal serait "<type>"

    Exemples:
      | article | gravite        | contexte              | montant | type              |
      | 3       | torture        | garde à vue           | 50000   | préjudice moral   |
      | 5       | 2 ans détention| détention illégale    | 40000   | préjudice moral   |
      | 6       | 5 ans procès   | délai déraisonnable   | 15000   | préjudice moral   |
      | 8       | surveillance   | vie privée violée     | 10000   | préjudice moral   |
      | 1-P1    | expropriation  | sans indemnisation    | 100000  | préjudice matériel|