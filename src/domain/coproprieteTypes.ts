/**
 * COPROPRIÉTÉ domain types
 *
 * Base juridique:
 * - Code Civil Belge, Livre II, Titre II, Chapitre III (articles 577-2 à 577-14)
 * - Loi du 2 juin 2010 modifiant le Code civil afin de moderniser le fonctionnement des copropriétés
 * - Loi du 18 juin 2018 portant dispositions diverses en matière de droit civil (réforme copropriété)
 *
 * URL: https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=1804032133&table_name=loi
 */

// Types de copropriétaire
export type CoproprietaireType =
  | 'proprietaire_occupant'
  | 'proprietaire_bailleur'
  | 'nu_proprietaire'
  | 'usufruitier'
  | 'emphyteote'
  | 'superficiaire';

// Statut de la copropriété
export type CoproprieteStatus =
  | 'petite_copropriete' // < 20 lots
  | 'copropriete_moyenne' // 20-50 lots
  | 'grande_copropriete'; // > 50 lots

// Types d'assemblée générale
export type AssembleeType =
  | 'ordinaire_annuelle'
  | 'extraordinaire'
  | 'speciale'
  | 'biannuelle'; // Pour petites copropriétés

// Types de décisions
export type DecisionType =
  | 'unanimite' // 100% des voix
  | 'quatre_cinquiemes' // 80% des voix
  | 'trois_quarts' // 75% des voix
  | 'deux_tiers' // 66.67% des voix
  | 'majorite_absolue' // >50% des voix
  | 'majorite_simple'; // Majorité des présents/représentés

// Statut d'une décision
export type DecisionStatus =
  | 'proposee'
  | 'en_discussion'
  | 'votee_acceptee'
  | 'votee_rejetee'
  | 'reportee'
  | 'annulee';

// Types de travaux
export type TravauxType =
  | 'entretien_ordinaire'
  | 'reparation_urgente'
  | 'renovation_conservatoire'
  | 'amelioration'
  | 'transformation'
  | 'reconstruction';

// Urgence des travaux
export type UrgenceLevel =
  | 'immediat' // < 24h
  | 'urgent' // < 7 jours
  | 'prioritaire' // < 30 jours
  | 'normal' // Planifié
  | 'reportable'; // Peut attendre

// Types de charges
export type ChargeType =
  | 'charge_generale'
  | 'charge_particuliere'
  | 'charge_extraordinaire'
  | 'provision_fonds_reserve'
  | 'provision_fonds_roulement';

// Statut de paiement
export type PaiementStatus =
  | 'a_jour'
  | 'retard_leger' // < 30 jours
  | 'retard_important' // 30-90 jours
  | 'impayes_graves' // > 90 jours
  | 'procedure_recouvrement'
  | 'saisie';

// Types de litiges
export type LitigeType =
  | 'impayes_charges'
  | 'travaux_non_autorises'
  | 'troubles_voisinage'
  | 'contestation_ag'
  | 'responsabilite_syndic'
  | 'vice_cache'
  | 'servitude';

// Interface principale Copropriétaire
export interface Coproprietaire {
  id: string;
  nom: string;
  prenom: string;
  type: CoproprietaireType;
  email?: string;
  telephone?: string;
  adresse: string;
  lots: Lot[];
  quotePartMilliemes: number;
  statutPaiement: PaiementStatus;
  montantImpayes: number;
  dateEntreeVigueur: Date;
  procurations?: Procuration[];
}

// Interface Lot
export interface Lot {
  id: string;
  numero: string;
  type: 'appartement' | 'studio' | 'bureau' | 'commerce' | 'garage' | 'cave' | 'grenier';
  etage?: number;
  surface: number;
  milliemes: number;
  coproprietaireId: string;
  description?: string;
}

// Interface Copropriété
export interface Copropriete {
  id: string;
  nom: string;
  adresse: string;
  numeroEntreprise: string; // BCE
  nombreLots: number;
  status: CoproprieteStatus;
  syndic: Syndic;
  conseilCopropriete?: ConseilCopropriete;
  commissaireComptes?: CommissaireComptes;
  reglementOrdreInterieur?: ReglementOrdreInterieur;
  acteBase: ActeBase;
  dateCreation: Date;
  dateDerniereAG: Date;
  fondsReserve: number;
  fondsRoulement: number;
}

// Interface Syndic
export interface Syndic {
  id: string;
  type: 'professionnel' | 'non_professionnel';
  nom: string;
  numeroIPI?: string; // Pour syndic professionnel
  numeroEntreprise?: string;
  email: string;
  telephone: string;
  adresse: string;
  dateDesignation: Date;
  dateFinMandat: Date;
  remuneration: number;
  contratGestion: string; // URL ou référence
}

// Interface Conseil de Copropriété
export interface ConseilCopropriete {
  membres: MembreConseil[];
  dateElection: Date;
  dureeMandat: number; // en années
}

export interface MembreConseil {
  coproprietaireId: string;
  role: 'president' | 'secretaire' | 'membre';
  dateElection: Date;
}

// Interface Commissaire aux Comptes
export interface CommissaireComptes {
  id: string;
  nom: string;
  type: 'coproprietaire' | 'externe';
  dateDesignation: Date;
  dateFinMandat: Date;
}

// Interface Assemblée Générale
export interface AssembleeGenerale {
  id: string;
  type: AssembleeType;
  dateConvocation: Date;
  dateReunion: Date;
  lieu: string;
  ordreJour: PointOrdreJour[];
  quorum: QuorumInfo;
  procesVerbal?: ProcesVerbal;
  decisions: Decision[];
  presences: Presence[];
}

// Point à l'ordre du jour
export interface PointOrdreJour {
  numero: number;
  titre: string;
  description: string;
  typeDecision: DecisionType;
  documents?: string[]; // URLs ou références
}

// Information sur le quorum
export interface QuorumInfo {
  milliemesRequis: number;
  milliemesPresents: number;
  milliemesRepresentes: number;
  quorumAtteint: boolean;
}

// Décision d'AG
export interface Decision {
  id: string;
  assembleeId: string;
  pointOrdreJour: number;
  description: string;
  typeDecision: DecisionType;
  status: DecisionStatus;
  votePour: number; // en millièmes
  voteContre: number;
  abstention: number;
  dateExecution?: Date;
}

// Présence à l'AG
export interface Presence {
  coproprietaireId: string;
  present: boolean;
  represente: boolean;
  mandataireId?: string;
  milliemes: number;
}

// Procès-verbal
export interface ProcesVerbal {
  id: string;
  assembleeId: string;
  redacteur: string;
  dateRedaction: Date;
  contenu: string;
  approuve: boolean;
  dateApprobation?: Date;
  signatures: Signature[];
}

export interface Signature {
  signataire: string;
  role: string;
  date: Date;
}

// Interface Procuration
export interface Procuration {
  id: string;
  mandant: string; // Copropriétaire qui donne procuration
  mandataire: string; // Personne qui reçoit procuration
  assembleeId: string;
  dateDebut: Date;
  dateFin: Date;
  limitePoints?: number[]; // Points spécifiques ou tous si undefined
}

// Interface Travaux
export interface Travaux {
  id: string;
  type: TravauxType;
  description: string;
  urgence: UrgenceLevel;
  montantEstime: number;
  montantFinal?: number;
  entrepreneur?: Entrepreneur;
  dateDecision?: Date;
  dateDebut?: Date;
  dateFin?: Date;
  status: 'planifie' | 'en_cours' | 'termine' | 'reporte' | 'annule';
  decisionAGId?: string;
}

export interface Entrepreneur {
  nom: string;
  numeroEntreprise: string;
  assuranceRC: string;
  telephone: string;
  email: string;
}

// Interface Charges et Budget
export interface Budget {
  annee: number;
  montantTotal: number;
  repartition: RepartitionCharge[];
  approuveAG: boolean;
  dateApprobation?: Date;
}

export interface RepartitionCharge {
  type: ChargeType;
  description: string;
  montant: number;
  cleRepartition: 'milliemes' | 'consommation' | 'custom';
  details?: string;
}

// Interface Appel de Fonds
export interface AppelFonds {
  id: string;
  periode: string;
  montantTotal: number;
  dateEmission: Date;
  dateEcheance: Date;
  type: 'ordinaire' | 'extraordinaire';
  details: DetailAppelFonds[];
}

export interface DetailAppelFonds {
  coproprietaireId: string;
  montant: number;
  paye: boolean;
  datePaiement?: Date;
  rappels: Rappel[];
}

export interface Rappel {
  numero: number;
  date: Date;
  montantDu: number;
  fraisRappel: number;
}

// Interface Litige
export interface Litige {
  id: string;
  type: LitigeType;
  parties: string[]; // IDs des parties impliquées
  description: string;
  dateDebut: Date;
  status: 'ouvert' | 'mediation' | 'justice' | 'resolu' | 'abandonne';
  montantReclame?: number;
  resolution?: string;
  dateResolution?: Date;
  fraisJustice?: number;
}

// Interface Règlement d'Ordre Intérieur
export interface ReglementOrdreInterieur {
  version: string;
  dateAdoption: Date;
  chapitres: ChapitreROI[];
  modifications: ModificationROI[];
}

export interface ChapitreROI {
  numero: number;
  titre: string;
  articles: ArticleROI[];
}

export interface ArticleROI {
  numero: string;
  titre: string;
  contenu: string;
}

export interface ModificationROI {
  date: Date;
  description: string;
  decisionAGId: string;
}

// Interface Acte de Base
export interface ActeBase {
  dateActe: Date;
  notaire: string;
  reference: string;
  modificationsUrl?: string;
}

// Interface Document
export interface DocumentCopropriete {
  id: string;
  type: 'pv_ag' | 'contrat' | 'facture' | 'devis' | 'reglement' | 'plan' | 'autre';
  nom: string;
  dateCreation: Date;
  url: string;
  taille: number;
  metadata?: Record<string, any>;
}

// Interface Notification
export interface Notification {
  id: string;
  type: 'convocation' | 'rappel' | 'information' | 'urgence';
  destinataires: string[]; // IDs copropriétaires
  objet: string;
  message: string;
  dateEnvoi: Date;
  canal: 'email' | 'courrier' | 'recommande';
}

// Interface Résultat de Calcul
export interface CalculResult {
  success: boolean;
  result?: any;
  error?: string;
  details?: Record<string, any>;
}

// Interface Résultat de Vote
export interface VoteResult {
  decision: Decision;
  quorumAtteint: boolean;
  majoriteRequise: number;
  majoriteObtenue: number;
  accepte: boolean;
  contestations?: string[];
}

// Constantes importantes
export const COPROPRIETE_CONSTANTS = {
  // Seuils pour taille copropriété
  SEUIL_PETITE_COPRO: 20,
  SEUIL_GRANDE_COPRO: 50,

  // Délais légaux (en jours)
  DELAI_CONVOCATION_AG_ORDINAIRE: 15,
  DELAI_CONVOCATION_AG_EXTRAORDINAIRE: 8,
  DELAI_CONTESTATION_AG: 4 * 30, // 4 mois
  DELAI_PRESCRIPTION_CHARGES: 5 * 365, // 5 ans

  // Majorités requises (en pourcentage)
  MAJORITE_UNANIMITE: 100,
  MAJORITE_QUATRE_CINQUIEMES: 80,
  MAJORITE_TROIS_QUARTS: 75,
  MAJORITE_DEUX_TIERS: 66.67,
  MAJORITE_ABSOLUE: 50,

  // Fonds obligatoires
  FONDS_RESERVE_MIN_PERCENT: 5, // % du budget annuel

  // Limites procuration
  MAX_PROCURATIONS_PAR_MANDATAIRE: 3,
  MAX_MILLIEMES_PAR_MANDATAIRE: 100, // 10%

  // Frais et pénalités
  TAUX_INTERET_RETARD: 8, // % annuel
  FRAIS_RAPPEL_1: 7.5,
  FRAIS_RAPPEL_2: 15,
  FRAIS_MISE_DEMEURE: 30,
};

// Types de calculs pour la copropriété
export interface CalculQuorum {
  assembleeType: AssembleeType;
  totalMilliemes: number;
  milliemesPresents: number;
  milliemesRepresentes: number;
  decisionType: DecisionType;
}

export interface CalculCharges {
  budget: Budget;
  coproprietaire: Coproprietaire;
  periode: string;
  consommations?: Record<string, number>;
}

export interface CalculMajorite {
  decisionType: DecisionType;
  votePour: number;
  voteContre: number;
  abstention: number;
  totalMilliemes: number;
}

// Export des types de validation
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface ConvocationValidation extends ValidationResult {
  delaiRespecte: boolean;
  documentsComplets: boolean;
  ordreJourConforme: boolean;
}

export interface ProcurationValidation extends ValidationResult {
  nombreProcurationsOK: boolean;
  milliemesLimiteOK: boolean;
  mandataireEligible: boolean;
}

// Types pour les statistiques
export interface StatistiquesCopropriete {
  tauxPresenceAG: number;
  tauxImpayes: number;
  montantImpayes: number;
  nombreLitiges: number;
  budgetAnnuel: number;
  fondsReserve: number;
  travauxEnCours: number;
  satisfactionGlobale?: number;
}

// Énumérations pour les décisions courantes
export const DECISIONS_UNANIMITE = [
  'modification_acte_base',
  'dissolution_copropriete',
  'changement_destination_immeuble',
];

export const DECISIONS_QUATRE_CINQUIEMES = [
  'acquisition_immeuble',
  'alienation_parties_communes',
  'modification_repartition_charges',
  'travaux_extraordinaires_somptuaires',
];

export const DECISIONS_TROIS_QUARTS = [
  'travaux_amelioration',
  'modification_reglement_ordre_interieur',
];

export const DECISIONS_DEUX_TIERS = [
  'travaux_conservation',
  'designation_syndic',
  'action_justice_copropriete',
];

export const DECISIONS_MAJORITE_ABSOLUE = [
  'travaux_entretien_importants',
  'approbation_comptes',
  'approbation_budget',
  'designation_conseil_copropriete',
];

export const DECISIONS_MAJORITE_SIMPLE = [
  'travaux_entretien_ordinaire',
  'questions_diverses',
  'report_point_ordre_jour',
];