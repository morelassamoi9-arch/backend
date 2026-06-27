import { useState, useMemo } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { MobileNav } from "../components/MobileNav";
import { useNavigate } from "react-router";
import { 
  ArrowLeft, 
  ChevronDown, 
  Send, 
  FileText, 
  CheckCircle2, 
  Search, 
  BookOpen, 
  Phone, 
  Mail, 
  MapPin, 
  X, 
  Globe, 
  DollarSign, 
  Clock, 
  AlertTriangle 
} from "lucide-react";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

// ============================================
// BASE DE DONNÉES DÉMARCHES (ISSU DE PROCEDURES.JSON)
// ============================================
interface Procedure {
  id: string;
  titre: string;
  categorie: string;
  description: string;
  guichet: string;
  siteWeb: string;
  cout: string;
  delai: string;
  documents: string[];
  documentsConditionnels: string[];
  etapes: string[];
  casParticuliers: { situation: string; impact: string }[];
  proceduresLiees: string[];
  telephone?: string;
  email?: string;
}

const proceduresData: Procedure[] = [
  {
    id: "cni",
    titre: "Carte Nationale d'Identité (CNI)",
    categorie: "Identité & Voyage",
    description: "Procédure d'obtention de la Carte Nationale d'Identité ivoirienne biométrique officielle délivrée par l'ONECI.",
    guichet: "Centres d'enrôlement ONECI (présents dans les mairies, sous-préfectures et commissariats)",
    siteWeb: "https://www.oneci.ci",
    cout: "5 000 FCFA (Timbre d'enrôlement unique payable en ligne ou dans les banques partenaires NSIA, BNI, etc.)",
    delai: "Plusieurs semaines à quelques mois après l'enrôlement physique.",
    documents: [
      "Reçu d'achat du timbre d'enrôlement (5 000 FCFA)",
      "Extrait d'acte de naissance sécurisé de moins de 6 mois",
      "Certificat de nationalité ivoirienne original délivré par les tribunaux"
    ],
    documentsConditionnels: [
      "Ancienne CNI (obligatoire uniquement pour renouvellement)",
      "Certificat de perte ou de vol (obligatoire uniquement en cas de perte/vol)"
    ],
    etapes: [
      "Achat du timbre d'enrôlement de 5 000 FCFA en ligne (portail ONECI) ou dans une banque agréée.",
      "Rassemblement des pièces justificatives physiques (acte de naissance sécurisé, certificat de nationalité).",
      "Présentation physique dans un centre d'enrôlement ONECI de son choix pour la capture des données biométriques.",
      "Réception du récépissé d'enrôlement comportant le numéro de suivi unique.",
      "Suivi de la production de la carte en ligne sur le portail ONECI.",
      "Retrait de la CNI physique dans le centre d'enrôlement sur présentation du récépissé."
    ],
    casParticuliers: [
      {
        situation: "Perte ou Vol de la CNI",
        impact: "Fournir obligatoirement un certificat de perte ou de vol légal délivré par un commissariat ou une gendarmerie."
      },
      {
        situation: "Changement de statut matrimonial",
        impact: "Joindre obligatoirement l'acte de mariage ou le jugement de divorce pour la mise à jour."
      }
    ],
    proceduresLiees: ["acte_naissance", "certificat_nationalite"],
    telephone: "Call-center ONECI"
  },
  {
    id: "casier_judiciaire",
    titre: "Casier Judiciaire (Bulletin n°3)",
    categorie: "Justice",
    description: "Demande et délivrance du Bulletin n°3 du Casier Judiciaire de manière dématérialisée sur le portail e-justice.ci.",
    guichet: "Portail numérique de l'administration judiciaire / Tribunal de première instance du lieu de naissance",
    siteWeb: "https://www.e-justice.ci",
    cout: "2 500 FCFA (Paiement électronique intégré sur la plateforme)",
    delai: "48 à 72 heures ouvrables après validation du paiement.",
    documents: [
      "Copie numérique de l'Extrait d'acte de naissance",
      "Copie numérique d'une pièce d'identité (CNI ou Passeport)",
      "Formulaire de demande en ligne renseigné"
    ],
    documentsConditionnels: [],
    etapes: [
      "Connexion sur le portail officiel e-justice.ci et création de compte citoyen.",
      "Remplissage du formulaire de demande électronique avec vos informations d'état civil.",
      "Chargement (upload) de l'extrait de naissance et de la pièce d'identité scannés.",
      "Paiement en ligne des frais de 2 500 FCFA via Mobile Money ou TrésorPay.",
      "Réception de la notification de validation par SMS.",
      "Présentation physique au tribunal de naissance (ou guichet d'Abidjan) muni de votre pièce d'identité originale pour le retrait du document imprimé."
    ],
    casParticuliers: [
      {
        situation: "Personnes nées à l'étranger",
        impact: "La demande doit obligatoirement être adressée au Casier Judiciaire Central situé au Ministère de la Justice au Plateau (Abidjan)."
      },
      {
        situation: "Personnes condamnées antérieurement",
        impact: "Le casier ne sera pas vierge sans qu'une procédure légale de réhabilitation n'ait été enregistrée."
      }
    ],
    proceduresLiees: ["acte_naissance"]
  },
  {
    id: "certificat_nationalite",
    titre: "Certificat de Nationalité Ivoirienne",
    categorie: "Identité & Voyage",
    description: "Obtention légale du certificat officiel prouvant la nationalité ivoirienne, délivré par le greffe du tribunal.",
    guichet: "Portail e-justice.ci / Tribunal de Première Instance du lieu de naissance",
    siteWeb: "https://www.e-justice.ci",
    cout: "3 000 FCFA (Timbre d'établissement et frais techniques de paiement électronique)",
    delai: "3 à 5 jours ouvrables après validation en ligne.",
    documents: [
      "Copie de l'Extrait d'acte de naissance du demandeur",
      "Copie de la pièce d'identité du parent (Père ou Mère)",
      "Reçu de paiement généré en ligne"
    ],
    documentsConditionnels: [
      "Certificat de nationalité d'un des parents (exigé pour consolider le dossier s'il s'agit d'une première demande)"
    ],
    etapes: [
      "Accès au portail e-justice.ci et connexion sur son espace citoyen.",
      "Sélection de la procédure 'Demande de Certificat de Nationalité'.",
      "Saisie des données civiles du demandeur, de son père et de sa mère.",
      "Téléchargement des pièces requises.",
      "Paiement en ligne des frais de 3 000 FCFA via Mobile Money.",
      "Présentation au tribunal de naissance avec les originaux papier pour contrôle et retrait."
    ],
    casParticuliers: [
      {
        situation: "Nationalité acquise par mariage",
        impact: "Fournir l'acte de mariage original, le certificat de nationalité du conjoint et la déclaration d'acquisition."
      },
      {
        situation: "Nationalité par naturalisation",
        impact: "Joindre une copie du décret de naturalisation publié au Journal Officiel."
      }
    ],
    proceduresLiees: ["acte_naissance", "cni"]
  },
  {
    id: "actes_etat_civil",
    titre: "Actes d'État Civil (Naissance, Mariage, Décès)",
    categorie: "État Civil",
    description: "Demande et livraison postale d'extraits d'actes de naissance, de mariage ou de décès sans déplacement physique à la mairie d'origine.",
    guichet: "Portail en ligne documents.ci / Agences de La Poste pour le retrait ou livraison à domicile",
    siteWeb: "https://documents.ci",
    cout: "Variable (timbre municipal de 500 à 2 000 FCFA + frais de livraison postale à partir de 1 500 FCFA)",
    delai: "48 heures à 7 jours ouvrables (selon la mairie d'origine et le mode de livraison choisi).",
    documents: [
      "Formulaire de demande en ligne renseigné",
      "Pièce d'identité du demandeur"
    ],
    documentsConditionnels: [
      "Copie ou photo de l'ancien extrait d'acte (fortement recommandé pour retrouver le registre rapidement)"
    ],
    etapes: [
      "Connexion sur le site documents.ci.",
      "Sélection du type de document (naissance, mariage, décès) et de la mairie d'origine.",
      "Remplissage des champs d'identification de l'acte.",
      "Choix du mode de réception (retrait en agence postale ou livraison à domicile).",
      "Paiement électronique sécurisé et suivi de livraison."
    ],
    casParticuliers: [
      {
        situation: "Mairie d'origine non connectée",
        impact: "La commande en ligne est impossible. Vous devez vous déplacer physiquement dans la mairie d'origine."
      }
    ],
    proceduresLiees: ["cni", "casier_judiciaire", "certificat_nationalite"]
  },
  {
    id: "acte_naissance",
    titre: "Déclaration et Acte de Naissance",
    categorie: "État Civil",
    description: "Déclaration et obtention de l'acte de naissance officiel d'un nouveau-né à la Mairie.",
    guichet: "Bureau de l'état civil de la mairie de la commune de naissance",
    siteWeb: "https://servicepublic.gouv.ci",
    cout: "Gratuit (si effectué dans le délai légal de 3 mois)",
    delai: "Immédiat à 48 heures selon les mairies.",
    documents: [
      "Certificat de déclaration de naissance (Volet 1 délivré par la maternité)",
      "Pièce d'identité originale et copie des parents"
    ],
    documentsConditionnels: [
      "Livret de famille (requis si les parents sont légalement mariés)",
      "Pièce d'identité du déclarant (requis si la déclaration est faite par un tiers)"
    ],
    etapes: [
      "Récupération du certificat de naissance à la maternité suite à l'accouchement.",
      "Présentation du déclarant à la mairie de naissance sous un délai de 3 mois maximum.",
      "Remise du certificat médical et des pièces d'identité.",
      "Saisie de l'acte et enregistrement dans le registre municipal par l'officier d'état civil.",
      "Signature conjointe du registre.",
      "Remise immédiate ou sous 48h des extraits d'actes gratuits."
    ],
    casParticuliers: [
      {
        situation: "Dépassement du délai de 3 mois",
        impact: "L'enregistrement direct en mairie est impossible. Le parent doit engager une procédure judiciaire de jugement supplétif au tribunal."
      }
    ],
    proceduresLiees: ["cmu", "allocations_cnps"]
  },
  {
    id: "cmu",
    titre: "Couverture Maladie Universelle (CMU)",
    categorie: "Santé & Social",
    description: "Système obligatoire national d'assurance maladie en Côte d'Ivoire géré par la CNAM.",
    guichet: "Centres d'enrôlement IPS-CNAM (présents dans les mairies, hôpitaux et agences de la caisse)",
    siteWeb: "https://www.ips-cnam.ci",
    cout: "Gratuit pour l'enrôlement et la première carte (les soins sont ensuite soumis à une cotisation de 1 000 FCFA/mois)",
    delai: "Immédiat dans les centres équipés de production in situ, ou quelques semaines.",
    documents: [
      "Pièce d'identité d'origine en cours de validité (CNI, Passeport)",
      "Extrait d'acte de naissance (obligatoire pour les enfants mineurs)"
    ],
    documentsConditionnels: [
      "Carte de résident ou Passeport avec visa (requis uniquement pour les ressortissants étrangers)",
      "Récépissé d'enrôlement ONECI (accepté si la CNI physique est en cours de production)"
    ],
    etapes: [
      "Présentation physique dans un centre d'enrôlement IPS-CNAM.",
      "Remise des documents civils à l'agent d'enrôlement.",
      "Saisie des informations de contact et de téléphone.",
      "Capture biométrique sur place (photo et empreintes digitales).",
      "Remise du récépissé d'enrôlement avec votre numéro d'assuré.",
      "Retrait de la carte CMU physique."
    ],
    casParticuliers: [
      {
        situation: "Étudiants",
        impact: "L'immatriculation à la CMU est obligatoire pour finaliser les inscriptions scolaires ou universitaires annuelles."
      },
      {
        situation: "Personnes indigentes sans ressources",
        impact: "Prise en charge à 100% des mensualités par l'État après enquête sociale validée."
      }
    ],
    proceduresLiees: ["cni", "acte_naissance"]
  },
  {
    id: "permis_conduire",
    titre: "Permis de Conduire Biométrique",
    categorie: "Transport & Mobilité",
    description: "Délivrance et renouvellement du permis de conduire biométrique par le biais du Centre de Gestion Intégrée (CGI).",
    guichet: "Agences des Centres de Gestion Intégrée (CGI) de Quipux Afrique",
    siteWeb: "https://www.quipuxafrique.ci",
    cout: "Environ 24 500 FCFA pour un renouvellement standard (timbre de base, hors auto-école pour premier établissement)",
    delai: "Titre provisoire délivré immédiatement (valable 3 mois), carte définitive sous quelques semaines.",
    documents: [
      "Pièce d'identité d'origine en cours de validité (CNI, Passeport)",
      "Certificat d'aptitude médicale à la conduite (établi après examen médical agréé)"
    ],
    documentsConditionnels: [
      "Ancien permis de conduire (obligatoire uniquement pour un renouvellement ou extension)",
      "Certificat de perte ou de vol (obligatoire uniquement pour demande de duplicata)",
      "Attestation de réussite à l'examen de conduite (obligatoire pour premier établissement)"
    ],
    etapes: [
      "Prise de rendez-vous en ligne sur Quipux ou présentation directe au CGI.",
      "Passage de la visite médicale obligatoire auprès du médecin agréé présent sur le site.",
      "Paiement des frais administratifs au guichet du centre.",
      "Passage au box d'enrôlement pour la capture de la photo et des empreintes.",
      "Remise du titre provisoire de conduite valable 3 mois.",
      "Retrait du permis de conduire définitif après réception du SMS d'invitation."
    ],
    casParticuliers: [
      {
        situation: "Conversion d'un permis étranger",
        impact: "Fournir le permis d'origine authentifié et une attestation de validité de l'ambassade ou pays émetteur."
      },
      {
        situation: "Conducteurs poids lourds ou transporteurs",
        impact: "La validité du titre est de 1 à 3 ans maximum avec examens médicaux renforcés."
      }
    ],
    proceduresLiees: ["cni"]
  },
  {
    id: "passeport",
    titre: "Passeport Ivoirien Biométrique",
    categorie: "Identité & Voyage",
    description: "Procédure d'obtention ou de renouvellement du passeport biométrique ivoirien délivré par la SNEDAI.",
    guichet: "Plateforme en ligne SNEDAI / Sites d'enrôlement physique (Abidjan et délégations régionales)",
    siteWeb: "https://snedai.com",
    cout: "40 000 FCFA (Timbre de passeport payable en ligne par carte ou Mobile Money)",
    delai: "72 heures à 15 jours ouvrables après la capture biométrique.",
    documents: [
      "Reçu de paiement du timbre en ligne (40 000 FCFA)",
      "Fiche de pré-enrôlement en ligne imprimée",
      "Original de l'Extrait d'acte de naissance de moins de 1 an",
      "Original du Certificat de nationalité ivoirienne"
    ],
    documentsConditionnels: [
      "Ancien passeport (obligatoire uniquement s'il s'agit d'un renouvellement)",
      "Autorisation parentale légalisée + pièce d'identité du parent (obligatoire pour les mineurs)",
      "Attestation de profession (si mention souhaitée sur le passeport)"
    ],
    etapes: [
      "Paiement du timbre en ligne de 40 000 FCFA sur le site de la SNEDAI.",
      "Renseignement du formulaire de pré-enrôlement et choix du centre physique et de la date du rendez-vous.",
      "Impression de la fiche de pré-enrôlement et du reçu.",
      "Présentation au centre d'enrôlement avec les pièces originales.",
      "Vérification par les agents de police et capture biométrique.",
      "Retrait du passeport physique suite à la réception du SMS de confirmation."
    ],
    casParticuliers: [
      {
        situation: "Demande pour un enfant mineur",
        impact: "Fournir l'autorisation parentale légalisée et la copie de pièce d'identité du parent signataire."
      },
      {
        situation: "Perte ou Vol du passeport en cours de validité",
        impact: "Joindre un certificat de perte ou de vol original délivré par la police."
      }
    ],
    proceduresLiees: ["certificat_nationalite", "acte_naissance"]
  },
  {
    id: "jugement_suppletif",
    titre: "Jugement Supplétif de Naissance",
    categorie: "État Civil",
    description: "Procédure judiciaire permettant d'établir un acte de naissance après le dépassement du délai de 3 mois.",
    guichet: "Greffe civil du tribunal compétent du lieu de naissance",
    siteWeb: "https://www.e-justice.ci",
    cout: "5 000 FCFA à 10 000 FCFA (Frais de greffe et de timbre fiscal)",
    delai: "1 à 2 mois (nécessite une audience avec témoins devant le juge).",
    documents: [
      "Certificat médical d'accouchement ou certificat d'âge apparent",
      "Attestation de non-inscription de naissance délivrée par la mairie du lieu de naissance (moins de 3 mois)",
      "Pièce d'identité originale et copie des parents",
      "Deux témoins majeurs munis de leurs pièces d'identité originales"
    ],
    documentsConditionnels: [],
    etapes: [
      "Demande de l'attestation de non-inscription auprès du bureau d'état civil de la mairie de naissance.",
      "Constitution du dossier de requête et dépôt physique auprès du greffe du tribunal.",
      "Comparution devant le juge pour l'audience d'homologation accompagné des deux témoins.",
      "Délivrance de l'ordonnance de jugement supplétif par le greffe.",
      "Présentation du jugement à la mairie de naissance pour la transcription dans le registre civil et retrait de votre acte de naissance officiel."
    ],
    casParticuliers: [],
    proceduresLiees: ["acte_naissance"]
  },
  {
    id: "impots",
    titre: "Télédéclaration & Paiement E-Impôts",
    categorie: "Finances & Impôts",
    description: "Télédéclaration et paiement des impôts et obligations fiscales via la plateforme officielle de la DGI.",
    guichet: "Portail web officiel e-impots.gouv.ci / Centres des impôts de rattachement pour l'assistance",
    siteWeb: "https://e-impots.gouv.ci",
    cout: "Gratuit pour la soumission (seul le montant réel de vos impôts calculés est dû)",
    delai: "Immédiat (quittance émise après transaction).",
    documents: [
      "Numéro de Compte Contribuable (NCC)",
      "États financiers ou éléments de comptabilité de l'exercice fiscal concerné",
      "Code d'activation de l'espace E-Impôts fourni par votre centre d'impôts"
    ],
    documentsConditionnels: [],
    etapes: [
      "Connexion sur e-impots.gouv.ci avec vos accès sécurisés.",
      "Sélection du formulaire de la taxe à acquitter (TVA, Impôts salaires, etc.).",
      "Saisie des données et télédéclaration.",
      "Sélection du mode de paiement électronique (Mobile Money, virement).",
      "Téléchargement immédiat de l'accusé de réception et de la quittance."
    ],
    casParticuliers: [
      {
        situation: "Déclaration Hors Délai",
        impact: "Application automatique de pénalités de retard et d'intérêts de moratoire par le système."
      }
    ],
    proceduresLiees: []
  },
  {
    id: "douane",
    titre: "Dédouanement des Marchandises (SYDAM)",
    categorie: "Finances & Impôts",
    description: "Déclaration et dédouanement des marchandises importées ou exportées via le système automatisé douanier SYDAM World.",
    guichet: "Système SYDAM World en ligne / Bureaux de douane physiques (Port, Aéroport, Frontières)",
    siteWeb: "https://www.douanes.ci",
    cout: "Variable (calculé selon la valeur en douane, la nomenclature et le taux de taxe applicable)",
    delai: "Quelques heures à quelques jours selon les circuits.",
    documents: [
      "Facture commerciale finale",
      "Titre de transport (Connaissement / Bill of Lading)",
      "Document de Déclaration Anticipée d'Importation (DAI)",
      "Liste de colisage"
    ],
    documentsConditionnels: [
      "Certificat d'origine (requis pour bénéficier de tarifs préférentiels, ex: zone CEDEAO)"
    ],
    etapes: [
      "Saisie et enregistrement de la Déclaration en Détail sur SYDAM.",
      "Chargement des pièces justificatives scannées.",
      "Liquidation des droits de douane.",
      "Paiement des taxes via TrésorPay ou virement.",
      "Contrôle douanier et émission du 'Bon à Enlever' (BAE)."
    ],
    casParticuliers: [
      {
        situation: "Exonérations",
        impact: "L'autorisation d'exonération doit être jointe avec le code de régime douanier approprié."
      }
    ],
    proceduresLiees: []
  },
  {
    id: "allocations_familiales",
    titre: "Allocations Familiales CNPS",
    categorie: "Santé & Social",
    description: "Prestation trimestrielle versée par la CNPS aux salariés du secteur privé pour leurs enfants à charge.",
    guichet: "Agence IPS-CNPS de rattachement de l'employeur / Espace 'Assuré' en ligne",
    siteWeb: "https://www.cnps.ci",
    cout: "Entièrement gratuit.",
    delai: "30 à 45 jours ouvrables après dépôt complet.",
    documents: [
      "Formulaire de demande de prestations familiales (imprimé CNPS) visé par l'employeur",
      "Original de l'acte de naissance de l'enfant de moins de 6 mois",
      "Certificat de vie et d'entretien de l'enfant",
      "Attestation de travail ou bulletin de salaire récent de l'assuré",
      "Relevé d'Identité Bancaire (RIB) pour virement direct"
    ],
    documentsConditionnels: [
      "Certificat de scolarité (obligatoire uniquement pour les enfants de 6 ans et plus)"
    ],
    etapes: [
      "Téléchargement du formulaire sur le portail de la CNPS.",
      "Remplissage et signature par l'employeur de l'assuré.",
      "Rassemblement des pièces de l'enfant (naissance, certificat de vie).",
      "Dépôt physique en agence ou chargement sur l'espace assuré en ligne.",
      "Instruction du dossier par la CNPS.",
      "Virement trimestriel des allocations après validation."
    ],
    casParticuliers: [
      {
        situation: "Mère et père salariés",
        impact: "Non-cumul strict. Un certificat de non-cumul est requis, les allocations étant versées à un seul parent."
      }
    ],
    proceduresLiees: ["acte_naissance"]
  },
  {
    id: "concours_fonction_publique",
    titre: "Concours de la Fonction Publique",
    categorie: "Éducation & Emploi",
    description: "Inscription aux concours directs et professionnels de recrutement des agents de l'État.",
    guichet: "Portail officiel fonctionpublique.gouv.ci / Antennes de dépôt physique des dossiers",
    siteWeb: "https://fonctionpublique.gouv.ci",
    cout: "Variable (droits d'inscription de 23 500 FCFA + visite médicale de 25 000 FCFA)",
    delai: "Plusieurs mois (processus complet comprenant inscription, visite, épreuves et résultats).",
    documents: [
      "Diplôme requis certifié conforme",
      "Extrait d'acte de naissance de moins de 6 mois",
      "Certificat de nationalité de moins de 1 an",
      "Extrait de Casier Judiciaire de moins de 3 mois",
      "Attestation d'enrôlement ou Carte CMU"
    ],
    documentsConditionnels: [],
    etapes: [
      "Création de votre espace candidat en ligne.",
      "Saisie du formulaire d'inscription et paiement en ligne de la visite médicale.",
      "Passage obligatoire aux examens médicaux au pôle choisi.",
      "Dépôt physique du dossier de candidature complet.",
      "Téléchargement de votre convocation et participation aux épreuves écrites."
    ],
    casParticuliers: [
      {
        situation: "Candidats handicapés",
        impact: "Dispositions spécifiques et quotas de places réservés peuvent s'appliquer."
      }
    ],
    proceduresLiees: ["casier_judiciaire", "certificat_nationalite", "cmu"]
  },
  {
    id: "inscription_scolaire",
    titre: "Inscription Scolaire Secondaire",
    categorie: "Éducation & Emploi",
    description: "Inscription nationale annuelle obligatoire des élèves dans les collèges et lycées publics et privés.",
    guichet: "Menu mobile d'inscription USSD (Orange, MTN, Moov) / Établissement de l'élève",
    siteWeb: "https://education.gouv.ci",
    cout: "6 000 FCFA pour le public (frais variables pour le secteur privé)",
    delai: "Immédiat.",
    documents: [
      "Numéro matricule national de l'élève",
      "Compte Mobile Money approvisionné pour la transaction"
    ],
    documentsConditionnels: [
      "Extrait de naissance ou bulletin de notes (si demandé par l'établissement pour vérification)"
    ],
    etapes: [
      "Accès au menu d'inscription scolaire via code USSD sur votre téléphone mobile.",
      "Saisie du numéro matricule national de l'élève.",
      "Vérification des données et validation du paiement (6 000 FCFA) par Mobile Money.",
      "Réception du SMS de confirmation de l'inscription.",
      "Présentation du SMS ou du reçu à l'établissement à la rentrée."
    ],
    casParticuliers: [
      {
        situation: "Élève sans matricule national",
        impact: "L'inscription en ligne est impossible. Vous devez vous rendre à la Direction Régionale (DREN) pour attribution."
      }
    ],
    proceduresLiees: []
  }
];

const categories = [
  "Toutes",
  "Identité & Voyage",
  "État Civil",
  "Justice",
  "Finances & Impôts",
  "Santé & Social",
  "Éducation & Emploi"
];

// ============================================
// QUESTIONS FRÉQUENTES (FAQ) BASÉES SUR PROCEDURES.JSON
// ============================================
const faqData = [
  {
    question: "Comment obtenir ma Carte Nationale d'Identité (CNI) ?",
    answer: "Vous devez acheter un timbre d'enrôlement de 5 000 FCFA (sur le site de l'ONECI ou en banque), puis vous présenter dans un centre d'enrôlement avec votre extrait d'acte de naissance sécurisé de moins de 6 mois et votre certificat de nationalité ivoirienne original. En cas de perte, un certificat de perte délivré par la police est nécessaire."
  },
  {
    question: "Quelles pièces fournir pour déclarer la naissance d'un enfant ?",
    answer: "La déclaration est gratuite si elle est faite dans les 3 mois à la mairie du lieu de naissance. Vous devez fournir le certificat médical d'accouchement (Volet 1 de la maternité) et les pièces d'identité originales des deux parents. Si les parents sont mariés, joignez également le livret de famille."
  },
  {
    question: "Comment déclarer une naissance si le délai de 3 mois est dépassé ?",
    answer: "Si le délai de 3 mois est dépassé, l'enregistrement direct en mairie n'est plus possible. Vous devez engager une procédure de 'Jugement Supplétif de Naissance' auprès du tribunal de votre localité de naissance. Il vous faudra un certificat de non-inscription délivré par la mairie, un certificat d'âge apparent, et deux témoins majeurs munis de leurs pièces d'identité. Le coût légal est d'environ 5 000 à 10 000 FCFA."
  },
  {
    question: "Comment commander et me faire livrer un extrait d'acte de naissance sans me déplacer ?",
    answer: "Vous pouvez utiliser la plateforme officielle 'documents.ci' gérée par La Poste. Renseignez la mairie d'origine de l'acte, joignez si possible une photo de l'ancien extrait pour faciliter la recherche, et choisissez votre mode de réception (retrait en agence postale ou livraison à domicile). Les tarifs incluent la taxe de la mairie (500 à 2 000 FCFA) et les frais postaux (à partir de 1 500 FCFA)."
  },
  {
    question: "Quel est le coût et le délai pour obtenir un passeport biométrique ?",
    answer: "Le coût réglementaire du timbre de passeport est de 40 000 FCFA (payable en ligne sur snedai.com). Une fois le rendez-vous physique et l'enrôlement biométrique effectués (avec votre acte de naissance de moins de 1 an et certificat de nationalité), le délai indicatif de traitement et d'impression est de 72 heures à 15 jours ouvrables."
  },
  {
    question: "Comment demander son casier judiciaire en ligne ?",
    answer: "Rendez-vous sur le portail 'e-justice.ci'. Renseignez le formulaire électronique, chargez votre extrait d'acte de naissance et votre pièce d'identité scannés, puis réglez les 2 500 FCFA de frais par Mobile Money ou TrésorPay. Le document est prêt sous 48 à 72 heures. Vous devrez aller le retirer physiquement au tribunal de votre lieu de naissance (ou au guichet central de justice à Abidjan) muni de votre pièce d'identité originale."
  },
  {
    question: "L'inscription à la Couverture Maladie Universelle (CMU) est-elle gratuite ?",
    answer: "Oui, l'enrôlement biométrique et la délivrance de la carte CMU initiale sont entièrement gratuits dans tous les centres IPS-CNAM. Toutefois, pour bénéficier de la prise en charge des soins de santé, vous devez vous acquitter d'une cotisation mensuelle obligatoire de 1 000 FCFA par personne (les étudiants doivent fournir leur numéro CMU pour valider leur scolarité)."
  }
];

export default function Help() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [activeProcedure, setActiveProcedure] = useState<Procedure | null>(null);
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Filtrer les démarches selon la recherche et la catégorie
  const filteredProcedures = useMemo(() => {
    return proceduresData.filter((proc) => {
      const matchesCategory = selectedCategory === "Toutes" || proc.categorie === selectedCategory;
      const matchesSearch = 
        proc.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proc.categorie.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const toggleFAQ = (index: number) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setShowContactModal(false);
      setContactForm({ name: "", email: "", subject: "", message: "" });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/citizen")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <img src="/Icone.png" alt="e-Citoyen CI" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="text-lg font-semibold text-foreground">Centre d'Aide & Support</h1>
                <p className="text-xs text-muted-foreground">
                  Fiches officielles de procédures, guides et FAQ synchronisés avec procedures.json
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-10">
        
        {/* Barre de recherche & Filtres */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une démarche (ex: passeport, CNI, naissance...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    selectedCategory === cat
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Index des procédures */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Index des démarches administratives</h2>
          </div>
          {filteredProcedures.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-border">
              <p className="text-muted-foreground">Aucune procédure ne correspond à votre recherche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredProcedures.map((proc) => (
                <Card 
                  key={proc.id} 
                  className="bg-white border border-border hover:border-primary/50 transition-all cursor-pointer flex flex-col justify-between"
                  onClick={() => setActiveProcedure(proc)}
                >
                  <CardHeader className="pb-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full w-max">
                      {proc.categorie}
                    </span>
                    <CardTitle className="text-sm font-bold text-foreground pt-2 leading-snug">
                      {proc.titre}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {proc.description}
                    </p>
                    <div className="flex items-center justify-between text-[11px] font-medium border-t border-border/50 pt-2 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-primary" />
                        {proc.cout.split(" (")[0]}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {proc.delai.split(" (")[0]}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* FAQ Accordion */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Questions fréquentes sur les démarches</h2>
          </div>
          <Card className="bg-white border border-border overflow-hidden">
            <CardContent className="p-0 divide-y divide-border">
              {faqData.map((item, idx) => {
                const isOpen = openFAQIndex === idx;
                return (
                  <div key={idx} className="transition-colors hover:bg-muted/10">
                    <button
                      className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm md:text-base text-foreground focus:outline-none"
                      onClick={() => toggleFAQ(idx)}
                    >
                      <span>{item.question}</span>
                      <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isOpen ? "transform rotate-180 text-primary" : ""}`} />
                    </button>
                    <div 
                      className={`overflow-hidden transition-all duration-300 ${
                        isOpen ? "max-h-[300px] border-t border-border/40" : "max-h-0"
                      }`}
                    >
                      <div className="p-5 text-sm text-muted-foreground leading-relaxed bg-muted/20">
                        {item.answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>

        {/* Support Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Contact Details Card */}
          <Card className="bg-white border border-border flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                Assistance citoyenne
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>Besoin d'un accompagnement physique ? Vous pouvez contacter nos services ou vous rendre à notre guichet central.</p>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>support@ecitoyen.ci</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>+225 07 00 00 00 00 (Lundi - Vendredi 8h - 17h)</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Plateau, Abidjan, République de Côte d'Ivoire</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Card */}
          <Card className="border border-primary/20 bg-primary/5 flex flex-col justify-between p-6">
            <div className="space-y-3">
              <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Poser une question spécifique ?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Si vous avez une situation complexe qui n'est pas répertoriée dans l'index ou la FAQ, envoyez un message à nos conseillers d'assistance.
              </p>
            </div>
            <Button 
              onClick={() => setShowContactModal(true)} 
              className="w-full mt-6 active:scale-95 transition-transform"
            >
              Écrire à l'assistance
            </Button>
          </Card>
        </section>
      </div>

      {/* MODAL / DRAWER DETAIL D'UNE DÉMARCHE */}
      {activeProcedure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setActiveProcedure(null)}>
          <div 
            className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-primary bg-primary/15 px-2.5 py-1 rounded-full">
                  {activeProcedure.categorie}
                </span>
                <h2 className="text-lg font-bold text-foreground mt-2 leading-snug">
                  {activeProcedure.titre}
                </h2>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setActiveProcedure(null)}
                className="rounded-full hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm text-muted-foreground leading-relaxed">
              {/* Description */}
              <div className="space-y-1">
                <h3 className="font-bold text-foreground">Description de la démarche</h3>
                <p>{activeProcedure.description}</p>
              </div>

              {/* Infos Clés Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase text-primary">Coût réglementaire</span>
                  <p className="text-foreground font-medium flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-primary" />
                    {activeProcedure.cout}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase text-primary">Délai estimé</span>
                  <p className="text-foreground font-medium flex items-center gap-1">
                    <Clock className="w-4 h-4 text-primary" />
                    {activeProcedure.delai}
                  </p>
                </div>
              </div>

              {/* Guichet */}
              <div className="space-y-1">
                <h3 className="font-bold text-foreground">Où s'adresser ? (Guichet physique)</h3>
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{activeProcedure.guichet}</span>
                </p>
              </div>

              {/* Documents à fournir */}
              <div className="space-y-2">
                <h3 className="font-bold text-foreground">Pièces justificatives obligatoires</h3>
                <ul className="space-y-1.5 pl-4 list-disc">
                  {activeProcedure.documents.map((doc, idx) => (
                    <li key={idx} className="text-foreground font-medium">{doc}</li>
                  ))}
                </ul>
              </div>

              {/* Documents Optionnels / Conditionnels */}
              {activeProcedure.documentsConditionnels.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-bold text-foreground">Pièces selon votre situation (Conditionnel)</h3>
                  <ul className="space-y-1.5 pl-4 list-disc">
                    {activeProcedure.documentsConditionnels.map((doc, idx) => (
                      <li key={idx} className="italic">{doc}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Étapes simplifiées */}
              <div className="space-y-2">
                <h3 className="font-bold text-foreground">Étapes à suivre (Guide simplifié)</h3>
                <ol className="space-y-2 pl-4 list-decimal text-foreground font-medium">
                  {activeProcedure.etapes.map((etape, idx) => (
                    <li key={idx} className="font-normal text-muted-foreground">
                      {etape}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Cas particuliers */}
              {activeProcedure.casParticuliers.length > 0 && (
                <div className="space-y-3 border-t border-border/50 pt-4">
                  <h3 className="font-bold text-foreground flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-primary" />
                    Situations particulières & complications
                  </h3>
                  <div className="space-y-3">
                    {activeProcedure.casParticuliers.map((cas, idx) => (
                      <div key={idx} className="bg-amber-50/50 border border-amber-200/50 p-3 rounded-lg space-y-1">
                        <span className="text-xs font-bold text-amber-800">{cas.situation}</span>
                        <p className="text-xs text-amber-900">{cas.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/20">
              <Button variant="ghost" onClick={() => setActiveProcedure(null)}>
                Fermer la fiche
              </Button>
              {activeProcedure.siteWeb && (
                <Button 
                  onClick={() => window.open(activeProcedure.siteWeb, "_blank")}
                  className="bg-primary hover:bg-primary/95 text-white"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Visiter le site officiel
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONTACT */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowContactModal(false)}>
          <div 
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex justify-between items-center bg-accent/20">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Formulaire d'Assistance
              </h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowContactModal(false)}
                className="rounded-full hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {isSubmitted ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-4 animate-scale-up">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Message envoyé !</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Nos conseillers reviendront vers vous sous 24 à 48 heures.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Votre nom complet</label>
                  <Input 
                    type="text" 
                    required 
                    placeholder="Ex: Jean Kouadio" 
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Votre adresse e-mail</label>
                  <Input 
                    type="email" 
                    required 
                    placeholder="Ex: jean.kouadio@email.com" 
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Sujet de la demande</label>
                  <Input 
                    type="text" 
                    required 
                    placeholder="Ex: Demande CNI bloquée, erreur acte..." 
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Votre message</label>
                  <Textarea 
                    required 
                    rows={4}
                    placeholder="Décrivez votre problème avec le maximum de détails..." 
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  />
                </div>

                <div className="pt-2 border-t border-border flex justify-end gap-3 bg-accent/10 -mx-5 -mb-5 p-4 mt-4">
                  <Button variant="ghost" type="button" onClick={() => setShowContactModal(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" className="active:scale-95 transition-transform">
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer le message
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  );
}
