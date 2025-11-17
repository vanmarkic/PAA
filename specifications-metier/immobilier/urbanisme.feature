# language: fr
Fonctionnalité: Permis d'Urbanisme et Aménagement du Territoire
  En tant que propriétaire ou constructeur
  Je veux obtenir les permis nécessaires pour mes projets
  Afin de respecter les règles d'aménagement du territoire

  Contexte:
    Étant donné que le CoDT (Code du Développement Territorial) s'applique en Wallonie
    Et que le CoBAT (Code Bruxellois de l'Aménagement du Territoire) s'applique à Bruxelles
    Et que le VCRO (Vlaamse Codex Ruimtelijke Ordening) s'applique en Flandre
    Et que les délais légaux sont stricts et suspensifs

  # Procédure 31: Permis d'urbanisme simple
  Scénario: Demande de permis d'urbanisme pour extension
    Étant donné que je veux construire une extension de 30m²
    Et que mon terrain est en zone d'habitat
    Et que le projet respecte les gabarits voisins
    Quand je demande un permis d'urbanisme
    Alors le dossier doit contenir:
      | Document | Nombre | Description |
      | Formulaire demande | 1 | Cadre I ou annexe selon région |
      | Plans de situation | 4 | Échelle 1/1000 ou 1/500 |
      | Plans architecture | 4 | Façades, coupes, implantation |
      | Photos | 4 | Contexte et voisinage |
      | Notice descriptive | 1 | Matériaux et techniques |
      | PEB | 1 | Si > 50m² ou rénovation lourde |
      | Statistiques INS | 1 | Modèle I si nouveau logement |
    Et le délai de traitement est:
      | Type | Délai | Prolongation possible |
      | Sans enquête | 75 jours | +30 jours |
      | Avec enquête | 115 jours | +30 jours |
    Et les frais de dossier sont environ 125€

  # Procédure 32: Enquête publique
  Scénario: Déroulement de l'enquête publique urbanisme
    Étant donné qu'une enquête publique est requise
    Et que le projet dépasse les seuils d'impact
    Quand l'enquête est organisée
    Alors le processus est:
      | Étape | Durée | Actions |
      | Annonce | 5 jours avant | Affichage jaune sur site |
      | Publication | - | Site commune et valves |
      | Consultation | 30 jours | Dossier disponible |
      | Réclamations | Pendant enquête | Écrit ou oral |
      | Clôture | Dernier jour | PV de clôture |
      | Commission | +15 jours | Si réclamations |
      | Avis | +30 jours | Favorable ou défavorable |
    Et les voisins dans 50m sont notifiés
    Et les réclamations doivent être motivées

  # Procédure 33: Permis d'urbanisation (lotir)
  Scénario: Création d'un lotissement de 5 parcelles
    Étant donné que j'ai un terrain de 5000m²
    Et que je veux créer 5 lots à bâtir
    Et que la zone est urbanisable
    Quand je demande un permis d'urbanisation
    Alors les exigences sont:
      | Aspect | Obligation | Norme |
      | Voirie | Création ou élargissement | 6-12m selon type |
      | Équipements | Eau, gaz, électricité, égouts | Standards région |
      | Espaces verts | Minimum requis | 10% superficie |
      | Parkings | Ratio par lot | 2 places/logement |
      | Charges urbanisme | Participation | Calcul commune |
      | Garantie bancaire | Travaux voirie | 110% du coût |
      | Cession gratuite | Voirie et espaces publics | Acte notarié |
    Et l'étude d'incidences peut être requise
    Et la modification ultérieure nécessite nouveau permis

  # Procédure 34: Régularisation urbanistique
  Scénario: Régularisation d'une construction sans permis
    Étant donné qu'une construction a été réalisée sans permis
    Et que l'infraction date de plus de 5 ans
    Et que je veux régulariser la situation
    Quand je demande une régularisation
    Alors la procédure est:
      | Étape | Action | Conséquence |
      | Constat infraction | PV urbanisme | Risque pénal |
      | Demande permis | Dossier complet | Comme nouveau |
      | Analyse conformité | Règles actuelles | Pas anciennes |
      | Amendes | Transactionnelle | 250-25000€ |
      | Mesures réparatoires | Si nécessaire | Remise état |
      | Délai prescription | 10 ans (Wallonie) | Sauf ordre arrêt |
    Et la bonne foi n'excuse pas l'infraction
    Et le permis peut être refusé si non-conforme

  # Procédure 35: Certificat d'urbanisme n°1
  Scénario: Obtention d'un certificat d'urbanisme informatif
    Étant donné que je veux connaître les possibilités d'un terrain
    Et que je n'ai pas encore de projet précis
    Quand je demande un CU1
    Alors les informations fournies sont:
      | Information | Source | Validité |
      | Affectation plan secteur | CoDT/PRAS | Actuelle |
      | Prescriptions urbanistiques | RCU/PPAS | Si existant |
      | Périmètres particuliers | SAR, rénovation | Liste |
      | Servitudes | Utilité publique | Connues |
      | Permis délivrés | Archives commune | 10 ans |
      | Infractions connues | Service urbanisme | Si relevées |
    Et le délai de délivrance est 75 jours
    Et le coût est environ 25€
    Et ce n'est pas un permis de construire

  # Procédure 36: Permis intégré (environnement + urbanisme)
  Scénario: Demande de permis intégré pour projet mixte
    Étant donné que mon projet nécessite permis environnement
    Et qu'il nécessite aussi permis urbanisme
    Et que je suis en Région Wallonne
    Quand je demande un permis intégré
    Alors les avantages sont:
      | Aspect | Permis séparés | Permis intégré |
      | Procédures | 2 distinctes | 1 unique |
      | Délai | 115j × 2 | 140 jours max |
      | Enquête publique | Possible 2× | 1 seule |
      | Autorité | Possible différente | Unique |
      | Recours | 2 procédures | 1 procédure |
      | Cohérence | À assurer | Garantie |
    Et les classes 1 et 2 sont éligibles
    Et le fonctionnaire délégué peut être compétent

  # Procédure 37: Division d'un bien (appartements)
  Scénario: Transformation d'une maison en 3 appartements
    Étant donné que j'ai une grande maison unifamiliale
    Et que je veux créer 3 appartements
    Quand je demande le permis de division
    Alors les exigences sont:
      | Critère | Norme minimale | Vérification |
      | Surface appartement | 50m² (varie région) | Plans |
      | Hauteur sous plafond | 2,5m minimum | Mesures |
      | Éclairement | 1/10 surface sol | Calcul |
      | Parking | 1 place/logement | Plan mobilité |
      | Sécurité incendie | Compartimentage | Rapport SIAMU |
      | Acoustique | Isolation entre lots | Normes NBN |
      | Compteurs séparés | Eau, gaz, électricité | Gestionnaires |
      | Cadastre | Division officielle | Géomètre |
    Et un permis d'urbanisme est obligatoire
    Et la copropriété doit être créée

  # Procédure 38: Abattage d'arbres remarquables
  Scénario: Demande d'abattage d'un arbre remarquable
    Étant donné qu'un arbre remarquable est sur ma propriété
    Et qu'il présente un danger ou gêne construction
    Quand je demande l'autorisation d'abattage
    Alors la procédure est:
      | Étape | Responsable | Délai |
      | Identification | DNF/commune | Liste officielle |
      | Demande motivée | Propriétaire | Formulaire |
      | Expertise | Expert agréé | Si contesté |
      | Enquête publique | Commune | 15 jours |
      | Avis DNF | Service nature | Obligatoire |
      | Décision | Collège/Région | 60 jours |
      | Compensation | Si accordé | 3 arbres minimum |
    Et l'abattage sans autorisation = 100-1000€/arbre
    Et le remplacement est surveillé 3 ans

  # Procédure 39: Changement d'affectation
  Scénario: Transformation d'un commerce en logement
    Étant donné qu'un rez-de-chaussée commercial est vacant
    Et que je veux le transformer en logement
    Et que le plan de secteur l'autorise
    Quand je demande le changement d'affectation
    Alors je dois vérifier:
      | Aspect | Condition | Impact |
      | Plan secteur/PRAS | Zone compatible | Fondamental |
      | RCU communal | Maintien commerce ? | Possible refus |
      | Accès PMR | Si public avant | Maintenir |
      | Stationnement | Impact différent | Étude mobilité |
      | Charges urbanisme | Si création logement | Variable |
      | Prescriptions | Façade commerciale | Possible maintien |
      | Voisinage | Perte animation | Opposition possible |
    Et un permis d'urbanisme est requis
    Et l'enquête publique est probable

  # Procédure 40: Patrimoine classé modifications
  Scénario: Travaux sur un bâtiment classé monument
    Étant donné que mon bâtiment est classé monument historique
    Et que je veux effectuer des travaux de restauration
    Quand je prépare mon dossier
    Alors les obligations sont:
      | Type travaux | Autorisation | Autorité |
      | Entretien normal | Aucune | - |
      | Restauration | Permis unique | Région patrimoine |
      | Modification | Très encadrée | AWaP/Urban |
      | Techniques | Traditionnelles | Imposées |
      | Matériaux | Authentiques | Ou similaires |
      | Expertise | Architecte spécialisé | Liste agréés |
      | Subsides | 40-80% | Selon classement |
      | Délais | Prolongés | 6-12 mois |
    Et la Commission royale des Monuments donne avis
    Et les travaux sont suivis par l'administration

  Plan du Scénario: Délais de traitement des permis par type
    Étant donné que je demande un <type_permis>
    Et que le projet est situé en <region>
    Et que <enquete> enquête publique
    Quand ma demande est complète
    Alors le délai légal est <delai> jours
    Et une prolongation de <prolongation> jours est possible

    Exemples:
      | region | type_permis | enquete | delai | prolongation |
      | Wallonie | urbanisme simple | sans | 75 | 30 |
      | Wallonie | urbanisme | avec | 115 | 30 |
      | Bruxelles | urbanisme | sans | 75 | 30 |
      | Bruxelles | urbanisme | avec | 160 | 30 |
      | Wallonie | intégré | avec | 140 | 40 |
      | Flandre | urbanisme | sans | 60 | 30 |