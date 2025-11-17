/**
 * DÉMOCRATIE - Democracy domain types for Belgian democratic procedures
 *
 * Legal basis:
 * - Code électoral belge (Code électoral du 12 avril 1894, coordonné)
 *   https://www.ejustice.just.fgov.be/eli/code/1894/04/12/1894041255/justel
 * - Constitution belge - Titre II: Des Belges et de leurs droits
 *   https://www.ejustice.just.fgov.be/eli/constitution/1994/02/17/1994021048/justel
 * - Loi du 14 janvier 2013 sur les consultations populaires
 * - Règlements communaux sur la participation citoyenne
 */

// ============================================================================
// Core Democratic Types
// ============================================================================

export type CitoyenneteStatus =
  | 'belge'
  | 'eu-citoyen'
  | 'non-eu-resident'
  | 'refugie-reconnu'
  | 'apatride';

export type ElectoralRight =
  | 'elections-federales'
  | 'elections-regionales'
  | 'elections-communales'
  | 'elections-europeennes'
  | 'referendum'
  | 'consultation-populaire';

export type VoteType =
  | 'obligatoire'
  | 'facultatif'
  | 'par-procuration'
  | 'electronique'
  | 'postal'
  | 'anticipe';

export type PetitionType =
  | 'petition-federale'
  | 'petition-regionale'
  | 'petition-communale'
  | 'petition-europeenne'
  | 'initiative-citoyenne';

export type ConsultationType =
  | 'consultation-communale'
  | 'consultation-regionale'
  | 'enquete-publique'
  | 'consultation-environnementale'
  | 'budget-participatif';

export type PoliticalPartyStatus =
  | 'enregistre'
  | 'en-attente'
  | 'suspendu'
  | 'dissous';

export type CampaignFinanceType =
  | 'don-prive'
  | 'financement-public'
  | 'cotisation-membre'
  | 'evenement-levee-fonds'
  | 'pret-bancaire';

// ============================================================================
// User/Citizen Models
// ============================================================================

export interface DemocraticCitizen {
  id: string;
  numeroNational: string;
  nom: string;
  prenom: string;
  dateNaissance: Date;
  age: number;
  nationalite: CitoyenneteStatus;
  residenceLegale: {
    commune: string;
    province: string;
    region: 'wallonie' | 'flandre' | 'bruxelles';
    codePostal: string;
    dateInscription: Date;
  };
  droitsElectoraux: ElectoralRight[];
  inscriptionElectorale: boolean;
  procurationsRecues: number;
  procurationsDonnees: number;
  sanctionsElectorales: SanctionElectorale[];
}

export interface SanctionElectorale {
  type: 'amende' | 'suspension-droits' | 'avertissement';
  motif: string;
  date: Date;
  dureeJours?: number;
  montantEuros?: number;
}

// ============================================================================
// Voter Registration & Electoral Lists
// ============================================================================

export interface InscriptionElectorale {
  citoyenId: string;
  typeElection: ElectoralRight;
  commune: string;
  bureauVote: string;
  numeroElecteur: string;
  dateInscription: Date;
  dateExpiration?: Date;
  statut: 'active' | 'suspendue' | 'radiee';
  motifRadiation?: string;
}

export interface DemandeInscription {
  id: string;
  citoyenId: string;
  typeElection: ElectoralRight;
  dateDepot: Date;
  documentsRequis: DocumentElectoral[];
  statut: 'en-cours' | 'approuvee' | 'rejetee';
  motifRejet?: string;
  delaiRecours?: Date;
}

export interface DocumentElectoral {
  type: 'carte-identite' | 'preuve-residence' | 'certificat-nationalite' | 'formulaire-inscription';
  nomFichier: string;
  dateUpload: Date;
  verifie: boolean;
}

// ============================================================================
// Voting & Elections
// ============================================================================

export interface Election {
  id: string;
  type: ElectoralRight;
  date: Date;
  heureOuverture: string;
  heureFermeture: string;
  circonscription: string;
  candidats: Candidat[];
  bureauxVote: BureauVote[];
  tauxParticipation?: number;
  resultatsPublies: boolean;
}

export interface Candidat {
  id: string;
  nom: string;
  prenom: string;
  parti?: string;
  numeroListe: number;
  positionListe: number;
  eligible: boolean;
  declarationPatrimoine: boolean;
  declarationInteret: boolean;
}

export interface BureauVote {
  id: string;
  code: string;
  adresse: string;
  commune: string;
  accessiblePMR: boolean;
  capaciteElecteurs: number;
  typeVote: VoteType[];
}

export interface Vote {
  id: string;
  electionId: string;
  bureauVoteId: string;
  type: VoteType;
  timestamp: Date;
  valide: boolean;
  anonymise: true; // Always true for privacy
}

export interface Procuration {
  id: string;
  mandantId: string;
  mandataireId: string;
  electionId: string;
  motif: 'maladie' | 'voyage' | 'professionnel' | 'etudes' | 'handicap';
  documentJustificatif: string;
  dateSignature: Date;
  approuvee: boolean;
  utilisee: boolean;
}

// ============================================================================
// Petitions & Citizen Initiatives
// ============================================================================

export interface Petition {
  id: string;
  type: PetitionType;
  titre: string;
  description: string;
  organisateurId: string;
  dateCreation: Date;
  dateCloture?: Date;
  objectifSignatures: number;
  signaturesVerifiees: number;
  signaturesRejetees: number;
  niveau: 'federal' | 'regional' | 'communal' | 'europeen';
  statut: 'ouverte' | 'fermee' | 'examinee' | 'acceptee' | 'rejetee';
  reponseAutorite?: ReponsePetition;
  signatures: SignaturePetition[];
}

export interface SignaturePetition {
  id: string;
  petitionId: string;
  signataire: {
    nom: string;
    prenom: string;
    numeroNational: string;
    commune: string;
    email?: string;
  };
  dateSignature: Date;
  ipAddress?: string;
  verifiee: boolean;
  valide: boolean;
  motifRejet?: string;
}

export interface ReponsePetition {
  autorite: string;
  dateReponse: Date;
  decision: 'acceptee' | 'rejetee' | 'en-examen' | 'transferee';
  motif: string;
  actionsPrevues?: string[];
  delaiMiseEnOeuvre?: number; // en jours
}

export interface InitiativeCitoyenne {
  id: string;
  titre: string;
  description: string;
  domainesPolitiques: string[];
  organisateurs: CitoyenOrganisateur[];
  dateEnregistrement: Date;
  numeroEnregistrement: string;
  objectifSignatures: number;
  signaturesCollectees: number;
  delaiCollecte: number; // en mois
  statut: 'enregistree' | 'collecte' | 'verifiee' | 'soumise' | 'adoptee' | 'rejetee';
  languesDisponibles: ('fr' | 'nl' | 'de' | 'en')[];
}

export interface CitoyenOrganisateur {
  citoyenId: string;
  nom: string;
  prenom: string;
  role: 'initiateur' | 'co-organisateur' | 'representant';
  email: string;
  telephone?: string;
}

// ============================================================================
// Municipal & Advisory Council Participation
// ============================================================================

export interface ConseilCommunal {
  id: string;
  commune: string;
  dateSeance: Date;
  ordreJour: PointOrdreJour[];
  seancePublique: boolean;
  nbCitoyensPresents?: number;
  interpellationsCitoyennes: InterpellationCitoyenne[];
  proceedingsUrl?: string;
}

export interface PointOrdreJour {
  numero: number;
  titre: string;
  description: string;
  rapporteur: string;
  documentsSoumis: string[];
  voteRequis: boolean;
  resultatVote?: {
    pour: number;
    contre: number;
    abstention: number;
    adopte: boolean;
  };
}

export interface InterpellationCitoyenne {
  id: string;
  citoyenId: string;
  conseilId: string;
  sujet: string;
  question: string;
  dateDepot: Date;
  acceptee: boolean;
  motifRefus?: string;
  reponse?: string;
  tempsParole?: number; // en minutes
}

export interface ConseilConsultatif {
  id: string;
  nom: string;
  type: 'jeunes' | 'aines' | 'etrangers' | 'handicap' | 'environnement' | 'mobilite' | 'culture';
  commune: string;
  membresMax: number;
  membresActuels: number;
  mandatDuree: number; // en années
  reunionsAnnuelles: number;
  avisRendus: AvisConsultatif[];
}

export interface AvisConsultatif {
  id: string;
  conseilId: string;
  sujet: string;
  dateEmission: Date;
  contenu: string;
  recommandations: string[];
  suivi: 'en-attente' | 'examine' | 'accepte' | 'refuse';
  reponseCommunale?: string;
}

// ============================================================================
// Referendums & Popular Consultations
// ============================================================================

export interface Referendum {
  id: string;
  type: 'constitutionnel' | 'legislatif' | 'consultatif' | 'abrogatif';
  question: string;
  dateVote: Date;
  niveau: 'federal' | 'regional' | 'communal';
  quorumParticipation: number; // pourcentage
  majoriteRequise: number; // pourcentage
  resultats?: {
    participation: number;
    votesOui: number;
    votesNon: number;
    votesBlancs: number;
    votesNuls: number;
    adopte: boolean;
  };
  campagneInfo: CampagneReferendum;
}

export interface CampagneReferendum {
  budgetMax: number;
  dateDebut: Date;
  dateFin: Date;
  comitesOui: ComiteCampagne[];
  comitesNon: ComiteCampagne[];
  debatsPublics: DebatPublic[];
  materielsAutorises: string[];
}

export interface ComiteCampagne {
  id: string;
  nom: string;
  position: 'oui' | 'non';
  responsable: string;
  budget: number;
  depensesDeclarees: DepenseCampagne[];
}

export interface DepenseCampagne {
  description: string;
  montant: number;
  date: Date;
  fournisseur: string;
  justificatif: string;
  approuve: boolean;
}

export interface DebatPublic {
  date: Date;
  lieu: string;
  moderateur: string;
  participantsOui: string[];
  participantsNon: string[];
  audienceEstimee?: number;
  diffusionTV?: boolean;
  streaming?: string;
}

export interface ConsultationPopulaire {
  id: string;
  type: ConsultationType;
  sujet: string;
  description: string;
  commune: string;
  dateOuverture: Date;
  dateCloture: Date;
  modalitesParticipation: ('en-ligne' | 'papier' | 'reunion' | 'telephone')[];
  participantsMin: number;
  participantsActuels: number;
  contributions: ContributionConsultation[];
  rapportFinal?: string;
}

export interface ContributionConsultation {
  id: string;
  consultationId: string;
  contributeurId?: string; // peut être anonyme
  dateContribution: Date;
  type: 'avis' | 'proposition' | 'objection' | 'question';
  contenu: string;
  piecesJointes?: string[];
  moderee: boolean;
  publiee: boolean;
  reponseOfficielle?: string;
}

// ============================================================================
// Political Parties & Campaign Finance
// ============================================================================

export interface PartiPolitique {
  id: string;
  nom: string;
  acronyme: string;
  dateCreation: Date;
  numeroEnregistrement: string;
  statut: PoliticalPartyStatus;
  presidentNom: string;
  tresorierNom: string;
  siegeSocial: string;
  nombreMembres: number;
  ideologie: string[];
  financementPublic: boolean;
  comptesPublies: CompteAnnuel[];
}

export interface CompteAnnuel {
  annee: number;
  recettes: {
    financementPublic: number;
    cotisations: number;
    dons: number;
    evenements: number;
    autres: number;
  };
  depenses: {
    personnel: number;
    locaux: number;
    campagnes: number;
    communication: number;
    autres: number;
  };
  resultat: number;
  certifieParCommissaire: boolean;
  datePublication: Date;
}

export interface DonPolitique {
  id: string;
  donateurId?: string; // anonyme si < 125€
  partiId?: string;
  candidatId?: string;
  montant: number;
  date: Date;
  modePaiement: 'virement' | 'cheque' | 'especes' | 'crypto';
  declare: boolean;
  conforme: boolean;
  motifNonConformite?: string;
}

export interface DeclarationPatrimoine {
  id: string;
  mandataireId: string;
  fonction: string;
  dateDeclaration: Date;
  biensImmobiliers: BienDeclare[];
  comptesBancaires: CompteDeclare[];
  participationsSocietaires: ParticipationDeclare[];
  dettes: DetteDeclare[];
  autresBiens: string[];
  publiee: boolean;
  verifiee: boolean;
}

export interface BienDeclare {
  type: 'maison' | 'appartement' | 'terrain' | 'commercial' | 'autre';
  valeurEstimee: number;
  adresse: string;
  pourcentageDetention: number;
}

export interface CompteDeclare {
  banque: string;
  type: 'courant' | 'epargne' | 'titres' | 'autre';
  soldeApproximatif: number;
  pays: string;
}

export interface ParticipationDeclare {
  societe: string;
  typeParticipation: 'actions' | 'obligations' | 'parts';
  pourcentage: number;
  valeurEstimee: number;
}

export interface DetteDeclare {
  type: 'hypothecaire' | 'personnel' | 'professionnel' | 'autre';
  montantRestant: number;
  creancier: string;
}

// ============================================================================
// Democratic Process Results
// ============================================================================

export interface EligibilityResult {
  eligible: boolean;
  droitsActifs: ElectoralRight[];
  restrictions: RestrictionDemocratique[];
  recommandations?: string[];
  prochainesElections?: Election[];
  dateProchainDroit?: Date;
}

export interface RestrictionDemocratique {
  type: ElectoralRight;
  raison: string;
  dateDebut: Date;
  dateFin?: Date;
  recoursPossible: boolean;
  delaiRecours?: Date;
}

export interface StatistiquesElectorales {
  election: Election;
  tauxParticipation: number;
  votesValides: number;
  votesNuls: number;
  votesBlancs: number;
  repartitionAge: { tranche: string; pourcentage: number }[];
  repartitionGenre: { genre: string; pourcentage: number }[];
  bureauPlusParticipant: string;
  bureauMoinsParticipant: string;
}

// ============================================================================
// Constants
// ============================================================================

export const DEMOCRATIE_CONSTANTS = {
  // Ages légaux
  AGE_MAJORITE_ELECTORALE: 18,
  AGE_ELIGIBILITE_DEPUTE: 21,
  AGE_ELIGIBILITE_SENATEUR: 21,
  AGE_ELIGIBILITE_BOURGMESTRE: 18,
  AGE_VOTE_OBLIGATOIRE_MIN: 18,
  AGE_VOTE_FACULTATIF_MAX: 70,

  // Seuils de pétitions
  PETITION_FEDERALE_MIN_SIGNATURES: 25000,
  PETITION_REGIONALE_MIN_SIGNATURES: 15000,
  PETITION_COMMUNALE_MIN_SIGNATURES: 100, // varie selon la taille de la commune
  INITIATIVE_CITOYENNE_UE_SIGNATURES: 1000000,
  INITIATIVE_CITOYENNE_UE_PAYS_MIN: 7,

  // Limites de procuration
  MAX_PROCURATIONS_RECUES: 1,
  MAX_PROCURATIONS_DONNEES: 1,

  // Délais légaux (en jours)
  DELAI_INSCRIPTION_ELECTORALE: 30,
  DELAI_RECOURS_ELECTORAL: 15,
  DELAI_PUBLICATION_RESULTATS: 3,
  DELAI_CONTESTATION_RESULTATS: 40,

  // Finance politique
  DON_MAX_ANNUEL_PERSONNE: 500,
  DON_MAX_ANNUEL_ENTREPRISE: 0, // interdit
  DON_DECLARATION_SEUIL: 125,
  AMENDE_NON_VOTE_MIN: 40,
  AMENDE_NON_VOTE_MAX: 200,
  AMENDE_NON_VOTE_RECIDIVE_MIN: 80,
  AMENDE_NON_VOTE_RECIDIVE_MAX: 400,

  // Quorums
  QUORUM_CONSULTATION_COMMUNALE: 10, // % des électeurs
  QUORUM_REFERENDUM_CONSTITUTIONNEL: 50, // % de participation
  MAJORITE_SIMPLE: 50.1,
  MAJORITE_QUALIFIEE: 66.7,

  // Durées de mandat (en années)
  MANDAT_CHAMBRE: 5,
  MANDAT_SENAT: 5,
  MANDAT_REGIONAL: 5,
  MANDAT_COMMUNAL: 6,
  MANDAT_EUROPEEN: 5,
  MANDAT_CONSEIL_CONSULTATIF: 3,
};

// ============================================================================
// Validation Helpers
// ============================================================================

export function isEligibleToVote(citizen: DemocraticCitizen, electionType: ElectoralRight): boolean {
  if (citizen.age < DEMOCRATIE_CONSTANTS.AGE_MAJORITE_ELECTORALE) {
    return false;
  }

  if (!citizen.inscriptionElectorale) {
    return false;
  }

  // Check nationality requirements
  switch (electionType) {
    case 'elections-federales':
    case 'elections-regionales':
      return citizen.nationalite === 'belge';

    case 'elections-communales':
      return ['belge', 'eu-citoyen', 'non-eu-resident'].includes(citizen.nationalite);

    case 'elections-europeennes':
      return ['belge', 'eu-citoyen'].includes(citizen.nationalite);

    case 'referendum':
    case 'consultation-populaire':
      return citizen.nationalite === 'belge';

    default:
      return false;
  }
}

export function canSignPetition(citizen: DemocraticCitizen, petition: Petition): boolean {
  if (citizen.age < 16) { // Some petitions allow 16+
    return false;
  }

  // Check geographic requirements
  switch (petition.niveau) {
    case 'communal':
      return citizen.residenceLegale.commune === petition.organisateurId;

    case 'regional':
      // Would need to check if citizen's region matches petition's region
      return true;

    case 'federal':
    case 'europeen':
      return ['belge', 'eu-citoyen'].includes(citizen.nationalite);

    default:
      return false;
  }
}

export function calculateVotingPenalty(absences: number, justifiee: boolean): number {
  if (justifiee) {
    return 0;
  }

  if (absences === 1) {
    return DEMOCRATIE_CONSTANTS.AMENDE_NON_VOTE_MIN;
  } else if (absences === 2) {
    return DEMOCRATIE_CONSTANTS.AMENDE_NON_VOTE_RECIDIVE_MIN;
  } else {
    return DEMOCRATIE_CONSTANTS.AMENDE_NON_VOTE_RECIDIVE_MAX;
  }
}

export function validateDonation(montant: number, donateurType: 'personne' | 'entreprise'): {
  valide: boolean;
  raison?: string;
} {
  if (donateurType === 'entreprise') {
    return { valide: false, raison: 'Les dons d\'entreprises sont interdits' };
  }

  if (montant > DEMOCRATIE_CONSTANTS.DON_MAX_ANNUEL_PERSONNE) {
    return {
      valide: false,
      raison: `Le montant dépasse la limite annuelle de ${DEMOCRATIE_CONSTANTS.DON_MAX_ANNUEL_PERSONNE}€`
    };
  }

  if (montant < 0) {
    return { valide: false, raison: 'Le montant doit être positif' };
  }

  return { valide: true };
}