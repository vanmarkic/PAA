# language: fr
Fonctionnalité: Avis consultatif (Protocole 16)
  En tant que juridiction suprême nationale
  Je veux demander un avis consultatif à la CEDH
  Afin d'obtenir des orientations sur l'interprétation de la Convention

  Contexte:
    Étant donné que le Protocole 16 permet les avis consultatifs
    Et que seules les plus hautes juridictions peuvent demander
    Et que l'État doit avoir ratifié le Protocole 16

  Scénario: Demande d'avis sur une question de principe
    Étant donné que je suis la Cour de cassation belge
    Et que la Belgique a ratifié le Protocole 16
    Et qu'une affaire soulève une nouvelle question d'interprétation
    Et que la question concerne l'article 8 et les données numériques
    Quand je demande un avis consultatif
    Alors je devrais exposer le contexte juridique et factuel
    Et formuler des questions précises
    Et expliquer la pertinence pour l'affaire pendante
    Et la Grande Chambre devrait examiner la demande

  Scénario: État n'ayant pas ratifié le Protocole
    Étant donné que je suis une haute juridiction française
    Et que la France n'a pas ratifié le Protocole 16
    Et que j'ai une question importante sur la Convention
    Quand je considère demander un avis
    Alors la procédure ne serait pas disponible
    Et je devrais trancher selon ma propre interprétation
    Et attendre une éventuelle requête individuelle ultérieure

  Scénario: Question trop abstraite refusée
    Étant donné qu'une juridiction demande un avis général
    Et que les questions sont hypothétiques
    Et qu'elles ne sont pas liées à une affaire concrète
    Et qu'elles ressemblent à une consultation académique
    Quand la CEDH examine la demande
    Alors elle devrait refuser de donner un avis
    Et expliquer que les questions sont trop abstraites
    Et rappeler le cadre du Protocole 16