# language: fr
Fonctionnalité: Cession de droits d'auteur
  En tant qu'auteur ou cessionnaire
  Je veux céder ou acquérir des droits d'auteur
  Afin d'exploiter commercialement une œuvre

  Contexte:
    Étant donné que la cession doit être écrite
    Et que les droits moraux sont incessibles
    Et que la rémunération doit être proportionnelle

  Scénario: Cession de droits pour édition de livre
    Étant donné que j'ai écrit un roman
    Et qu'un éditeur veut le publier
    Quand nous signons un contrat de cession
    Alors je cède les droits de reproduction et distribution
    Et je reçois 10% de royalties sur les ventes
    Et je conserve mes droits moraux
    Et la cession est limitée à 5 ans et au territoire

  Scénario: Cession globale d'œuvres futures invalide
    Étant donné qu'un éditeur me propose un contrat
    Et qu'il veut tous mes futurs livres
    Quand j'examine la clause de cession
    Alors cette cession globale est nulle
    Car la loi interdit la cession d'œuvres futures globales
    Et chaque œuvre doit faire l'objet d'un contrat