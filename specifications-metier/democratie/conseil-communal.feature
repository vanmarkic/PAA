# language: fr
Fonctionnalité: Participation au conseil communal
  En tant que citoyen de la commune
  Je veux participer aux séances du conseil communal
  Afin d'influencer les décisions locales

  Contexte:
    Étant donné que le conseil communal se réunit mensuellement
    Et que les séances publiques sont ouvertes aux citoyens
    Et que le droit d'interpellation existe pour les résidents

  Scénario: Demande d'interpellation citoyenne
    Étant donné que je suis résident de Namur depuis 2 ans
    Et que j'ai 25 ans
    Et que je veux interpeller le conseil sur "La sécurité routière"
    Quand je soumets ma demande d'interpellation
    Et que je fournis un texte de maximum 3000 caractères
    Et que je respecte le délai de 7 jours avant la séance
    Alors ma demande devrait être examinée par le bureau
    Et si acceptée, je devrais recevoir une invitation
    Et je devrais avoir 10 minutes de temps de parole
    Et le collège devrait répondre pendant la séance

  Scénario: Participation à une consultation publique
    Étant donné qu'un projet d'aménagement urbain est proposé
    Et qu'une consultation publique est organisée
    Et que la période de consultation est de 30 jours
    Quand je soumets mes observations
    Et que j'inclus des propositions alternatives
    Et que je joins des documents techniques
    Alors ma contribution devrait être enregistrée
    Et elle devrait être analysée par les services communaux
    Et une réponse motivée devrait être fournie
    Et le rapport final devrait mentionner ma contribution

  Scénario: Demande d'ajout d'un point à l'ordre du jour
    Étant donné que je représente une association locale
    Et que nous avons une pétition de 200 signatures
    Et que le sujet concerne "L'installation de composteurs collectifs"
    Quand je demande l'inscription à l'ordre du jour
    Et que je fournis le dossier complet 10 jours avant
    Alors le point devrait être ajouté à l'ordre du jour
    Et je devrais pouvoir présenter le dossier
    Et un vote devrait avoir lieu sur notre proposition

  Plan du Scénario: Accès aux documents du conseil
    Étant donné que je suis un <type_demandeur>
    Et que je demande accès à <type_document>
    Quand je fais ma demande d'accès
    Alors l'accès devrait être "<decision>"
    Et le motif devrait être "<raison>"

    Exemples:
      | type_demandeur      | type_document               | decision | raison                                   |
      | citoyen résident    | procès-verbal public        | accordé  | Document public accessible               |
      | citoyen résident    | délibération secrète        | refusé   | Protection vie privée                    |
      | journaliste         | budget communal             | accordé  | Information d'intérêt public             |
      | citoyen non-résident| contrat marché public       | accordé  | Transparence administrative              |
      | entreprise          | dossier concurrent          | refusé   | Secret commercial                        |