# language: fr
Fonctionnalité: Gestion de l'importation parallèle
  En tant que titulaire de droits IP
  Je veux contrôler les importations parallèles
  Afin de protéger mon réseau de distribution

  Contexte:
    Étant donné que l'épuisement communautaire s'applique
    Et que les importations hors EEE peuvent être bloquées
    Et que les produits authentiques dans l'EEE circulent librement

  Scénario: Blocage d'importation hors EEE
    Étant donné que mes produits sont vendus moins cher hors Europe
    Et qu'un importateur veut les importer en Belgique
    Quand je détecte cette importation parallèle
    Alors je peux saisir les douanes
    Et bloquer l'importation
    Car pas d'épuisement international

  Scénario: Importation parallèle légale dans l'EEE
    Étant donné que j'ai vendu mes produits en Allemagne
    Et qu'un revendeur les importe en Belgique
    Quand j'essaie de m'y opposer
    Alors je ne peux pas bloquer
    Car l'épuisement communautaire s'applique
    Après la première mise sur le marché EEE