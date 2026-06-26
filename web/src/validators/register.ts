export interface RegisterData {
  nom: string;
  prenom?: string;
  email: string;
  telephone?: string;
  password: string;
  confirmPassword?: string;
}

export interface ValidationErrors {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  password?: string;
  confirmPassword?: string;
}

export function validateRegister(data: RegisterData): { isValid: boolean; errors: ValidationErrors } {
  const errors: ValidationErrors = {};

  // Nom
  if (!data.nom.trim()) {
    errors.nom = "Le nom est obligatoire";
  } else if (data.nom.trim().length < 2) {
    errors.nom = "Le nom doit contenir au moins 2 caractères";
  }

  // Email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!data.email.trim()) {
    errors.email = "L'adresse email est obligatoire";
  } else if (!emailRegex.test(data.email.trim())) {
    errors.email = "Format d'adresse email invalide";
  }

  // Téléphone
  if (data.telephone) {
    const phoneRegex = /^\+?[\d\s-]{8,20}$/;
    if (!phoneRegex.test(data.telephone)) {
      errors.telephone = "Format de numéro de téléphone invalide (8 à 20 chiffres)";
    }
  }

  // Mot de passe
  const password = data.password;
  if (!password) {
    errors.password = "Le mot de passe est obligatoire";
  } else if (password.length < 8) {
    errors.password = "Le mot de passe doit contenir au moins 8 caractères";
  } else if (password.length > 72) {
    errors.password = "Le mot de passe ne doit pas dépasser 72 caractères";
  } else if (!/[A-Z]/.test(password)) {
    errors.password = "Le mot de passe doit contenir au moins une lettre majuscule";
  } else if (!/[a-z]/.test(password)) {
    errors.password = "Le mot de passe doit contenir au moins une lettre minuscule";
  } else if (!/\d/.test(password)) {
    errors.password = "Le mot de passe doit contenir au moins un chiffre";
  } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.password = "Le mot de passe doit contenir au moins un caractère spécial";
  }

  // Confirmation mot de passe
  if (data.confirmPassword !== undefined && data.confirmPassword !== password) {
    errors.confirmPassword = "Les mots de passe ne correspondent pas";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
