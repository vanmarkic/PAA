# language: fr
Fonctionnalité: Congé Maladie et Indemnités d'Incapacité de Travail
  En tant que travailleur en incapacité de travail
  Je veux comprendre mes droits aux indemnités maladie
  Afin de maintenir un revenu pendant mon incapacité

  Contexte:
    Étant donné que les indemnités maladie INAMI 2024 sont:
      | Période               | Taux                  | Plafond journalier |
      | Salaire garanti J1-30 | 100% puis 60%         | Via employeur      |
      | Incapacité J31-365    | 60% salaire brut      | 170.66€            |
      | Invalidité >365j      | Selon situation       | Variable           |
    Et que les taux d'invalidité sont:
      | Situation familiale        | Taux    | Min/jour | Max/jour |
      | Avec charge de famille     | 65%     | 76.42€   | 114.41€  |
      | Isolé                      | 55%     | 60.56€   | 96.81€   |
      | Cohabitant                 | 40%     | 51.93€   | 70.41€   |
    Et que les conditions pour indépendants diffèrent:
      | Période               | Indemnisation         |
      | Jours 1-7            | Pas d'indemnité       |
      | Jours 8-14           | Indemnité partielle   |
      | Après jour 15        | Indemnité complète    |

  Scénario: Employé avec grippe de courte durée
    Étant donné que je suis employé à temps plein
    Et que mon salaire brut est de 3000€/mois
    Et que je suis malade pendant 5 jours
    Quand je fournis un certificat médical
    Alors mon employeur paie le salaire garanti:
      | Jour    | Paiement              |
      | Jour 1  | 100% salaire (carenz) |
      | Jours 2-5| 100% salaire garanti |
    Et je garde mon salaire complet
    Et pas d'intervention mutuelle nécessaire
    Et je dois envoyer le certificat dans les 48h

  Scénario: Ouvrier avec accident non-professionnel (2 mois)
    Étant donné que je suis ouvrier
    Et que mon salaire brut est de 2500€/mois
    Et que j'ai un accident domestique
    Quand je suis en incapacité 60 jours
    Alors la couverture est:
      | Période     | Payeur      | Montant                |
      | Jours 1-7   | Employeur   | 100% salaire           |
      | Jours 8-14  | Employeur   | 85.88% salaire         |
      | Jours 15-30 | Employeur   | 25.88% + mutuelle 60%  |
      | Jours 31-60 | Mutuelle    | 60% salaire (max plafond)|
    Et mon indemnité mutuelle = 60% × (2500/26) = 57.69€/jour
    Plafonné si nécessaire

  Scénario: Travailleur avec burn-out longue durée
    Étant donné que je souffre d'un burn-out diagnostiqué
    Et que je suis en incapacité depuis 6 mois
    Et que j'ai une famille à charge
    Et que mon salaire était de 3500€/mois
    Quand mon incapacité continue
    Alors en incapacité primaire (mois 1-12):
      - Indemnité = 60% × (3500/26) = 80.77€/jour
      - Minimum garanti famille = 76.42€/jour
      - Maximum = 170.66€/jour
    Et après 1 an, je passe en invalidité:
      - Taux = 65% (charge famille)
      - Maximum = 114.41€/jour
    Et possibilité de reprise progressive

  Scénario: Indépendant avec maladie de 3 semaines
    Étant donné que je suis indépendant
    Et que mes revenus annuels sont de 30000€
    Et que je suis malade 21 jours
    Quand je demande les indemnités
    Alors le calcul est:
      | Période      | Indemnité journalière   |
      | Jours 1-7    | 0€ (carence)            |
      | Jours 8-14   | 38.44€ (partielle)      |
      | Jours 15-21  | 57.52€ (complète)       |
    Et je dois avoir payé mes cotisations sociales
    Et certificat médical obligatoire dès jour 1

  Scénario: Femme enceinte avec complications
    Étant donné que je suis enceinte de 6 mois
    Et que j'ai des complications médicales
    Et que mon médecin prescrit repos complet
    Quand je suis mise en incapacité
    Alors je reçois les indemnités maladie normales
    Jusqu'à 6 semaines avant accouchement
    Puis je bascule en congé de maternité:
      | Période                | Indemnité              |
      | 6 sem avant - 9 sem après | 82% salaire (3 premiers mois) |
      | Reste congé maternité   | 75% salaire plafonné   |
    Et protection contre licenciement

  Scénario: Chômeur tombant malade
    Étant donné que je suis chômeur indemnisé
    Et que mon allocation est de 1200€/mois
    Et que je tombe malade
    Quand je fournis certificat médical à mutuelle
    Alors mes indemnités maladie sont:
      | Base calcul       | Montant            |
      | Allocation chômage| 60% × (1200/26)    |
      | Indemnité maladie | 27.69€/jour        |
      | Minimum isolé     | 60.56€/jour        |
    Donc je reçois le minimum garanti
    Et suspension des contrôles ONEM/FOREM

  Scénario: Reprise progressive du travail (mi-temps médical)
    Étant donné que je suis en invalidité depuis 8 mois
    Et que mon médecin autorise reprise progressive
    Et que je reprends à 50%
    Quand je travaille mi-temps thérapeutique
    Alors je cumule:
      | Source              | Montant                |
      | Salaire mi-temps    | 50% salaire normal     |
      | Indemnité partielle | % selon formule INAMI  |
      | Total approximatif  | 75-85% revenu initial  |
    Et autorisation médecin-conseil requise
    Et réévaluation tous les 3 mois
    Et durée maximale selon pathologie

  Scénario: Contrôle médical et obligations
    Étant donné que je suis en congé maladie
    Alors je dois respecter ces obligations:
      | Obligation                    | Délai/Condition        |
      | Envoi certificat employeur    | 48h                    |
      | Envoi certificat mutuelle     | 48h si > 1 jour        |
      | Disponible pour contrôle      | Heures de sortie       |
      | Répondre convocation          | Médecin-conseil        |
      | Déclarer reprise travail      | Immédiatement          |
    Et en cas de non-respect:
      | Manquement                    | Sanction               |
      | Certificat tardif             | Perte salaire garanti  |
      | Absence contrôle              | Suspension indemnités  |
      | Travail au noir               | Récupération + amende  |

  Plan du Scénario: Calcul indemnité selon durée et statut
    Étant donné que je suis <statut>
    Et que mon salaire/revenu est <revenu>€/mois
    Et que je suis malade <duree> jours
    Et que ma situation est <situation>
    Quand je calcule mes indemnités
    Alors mon indemnité journalière est <indemnite>€

    Exemples:
      | statut      | revenu | duree | situation  | indemnite |
      | salarié     | 2500   | 5     | isolé      | 96.15     |
      | salarié     | 2500   | 45    | isolé      | 57.69     |
      | salarié     | 4000   | 400   | famille    | 114.41    |
      | indépendant | 2000   | 5     | isolé      | 0.00      |
      | indépendant | 2000   | 20    | isolé      | 38.44     |
      | chômeur     | 1100   | 30    | isolé      | 60.56     |

  Scénario: Accident du travail vs maladie
    Étant donné que j'ai un accident
    Quand l'origine est déterminée
    Alors les indemnités diffèrent:
      | Type          | Couverture    | Indemnité base | Plafond    |
      | Accident travail| Assurance AT | 90% salaire    | Aucun      |
      | Maladie prof. | Fedris        | 90% salaire    | Aucun      |
      | Accident privé| Mutuelle      | 60% salaire    | 170.66€/j  |
      | Maladie       | Mutuelle      | 60% salaire    | 170.66€/j  |
    Et procédures de déclaration différentes
    Et droits complémentaires selon le cas

  Scénario: Épuisement des droits et CPAS
    Étant donné que mes droits mutuelle sont épuisés
    Et que je n'ai pas retrouvé capacité de travail
    Et que je n'ai plus de ressources
    Quand je m'adresse au CPAS
    Alors je peux demander:
      | Aide                  | Conditions             | Montant         |
      | RIS médical           | Incapacité >33%        | Selon catégorie |
      | Aide sociale          | État de besoin         | Variable        |
      | Carte médicale        | Soins continus         | 100% soins      |
      | Allocation handicap   | Si handicap reconnu    | Selon points    |
    Et enquête sociale approfondie
    Et coordination avec médecin-conseil

  Scénario: Fin de contrat pendant maladie
    Étant donné que mon CDD se termine pendant ma maladie
    Ou que je suis licencié (hors faute grave)
    Quand mon contrat prend fin
    Alors mes droits sont:
      | Situation            | Droits                  |
      | Fin CDD prévu        | Indemnités continuent   |
      | Licenciement         | Indemnités + préavis    |
      | Démission            | Indemnités si incapacité|
      | Force majeure méd.   | Indemnités maintenues   |
    Et passage automatique en chômage-maladie
    Après fin incapacité si pas de reprise