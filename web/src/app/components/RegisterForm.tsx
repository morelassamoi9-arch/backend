import React, { useState } from "react";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { validateRegister, RegisterData, ValidationErrors } from "../../validators/register";
import { useAuth } from "../../hooks/useAuth";

interface RegisterFormProps {
  onSuccess: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegisterData>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const updatedData = { ...formData, [id]: value };
    setFormData(updatedData);

    // Validation en temps réel
    const { errors: validationErrors } = validateRegister(updatedData);
    setErrors((prev) => ({
      ...prev,
      [id]: validationErrors[id as keyof ValidationErrors],
      ...(id === "password" || id === "confirmPassword" ? { confirmPassword: validationErrors.confirmPassword } : {})
    }));
    
    if (apiError) setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const { isValid, errors: validationErrors } = validateRegister(formData);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await register({
        nom: formData.nom,
        prenom: formData.prenom || undefined,
        email: formData.email,
        telephone: formData.telephone || undefined,
        password: formData.password,
      });

      onSuccess();
    } catch (err: any) {
      console.error("Register error:", err);
      setApiError(err.message || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-[#1E1E1E]">
      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-[#C86A4A] text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Grid Nom & Prénom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="nom">Nom <span className="text-[#C86A4A]">*</span></Label>
          <Input
            id="nom"
            type="text"
            placeholder="Kouassi"
            value={formData.nom}
            onChange={handleChange}
            required
            className={errors.nom ? "border-[#C86A4A] focus-visible:ring-[#C86A4A]" : "focus-visible:ring-[#C86A4A]"}
          />
          {errors.nom && (
            <p className="text-xs text-[#C86A4A] flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.nom}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="prenom">Prénom</Label>
          <Input
            id="prenom"
            type="text"
            placeholder="Aya"
            value={formData.prenom}
            onChange={handleChange}
            className="focus-visible:ring-[#C86A4A]"
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1">
        <Label htmlFor="email">Adresse email <span className="text-[#C86A4A]">*</span></Label>
        <Input
          id="email"
          type="email"
          placeholder="aya.kouassi@exemple.ci"
          value={formData.email}
          onChange={handleChange}
          required
          className={errors.email ? "border-[#C86A4A] focus-visible:ring-[#C86A4A]" : "focus-visible:ring-[#C86A4A]"}
        />
        {errors.email && (
          <p className="text-xs text-[#C86A4A] flex items-center gap-1 mt-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.email}
          </p>
        )}
      </div>

      {/* Téléphone */}
      <div className="space-y-1">
        <Label htmlFor="telephone">Téléphone</Label>
        <Input
          id="telephone"
          type="tel"
          placeholder="0712345678"
          value={formData.telephone}
          onChange={handleChange}
          className={errors.telephone ? "border-[#C86A4A] focus-visible:ring-[#C86A4A]" : "focus-visible:ring-[#C86A4A]"}
        />
        {errors.telephone && (
          <p className="text-xs text-[#C86A4A] flex items-center gap-1 mt-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.telephone}
          </p>
        )}
      </div>

      {/* Mot de passe */}
      <div className="space-y-1">
        <Label htmlFor="password">Mot de passe <span className="text-[#C86A4A]">*</span></Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            className={`pr-10 ${errors.password ? "border-[#C86A4A] focus-visible:ring-[#C86A4A]" : "focus-visible:ring-[#C86A4A]"}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password ? (
          <p className="text-xs text-[#C86A4A] flex items-center gap-1 mt-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.password}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Min. 8 caractères avec majuscule, minuscule, chiffre et caractère spécial.
          </p>
        )}
      </div>

      {/* Confirmer le mot de passe */}
      <div className="space-y-1">
        <Label htmlFor="confirmPassword">Confirmer le mot de passe <span className="text-[#C86A4A]">*</span></Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className={`pr-10 ${errors.confirmPassword ? "border-[#C86A4A] focus-visible:ring-[#C86A4A]" : "focus-visible:ring-[#C86A4A]"}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-[#C86A4A] flex items-center gap-1 mt-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Bouton Soumettre */}
      <Button
        type="submit"
        disabled={loading || Object.values(errors).some(Boolean)}
        className="w-full mt-6 py-6 text-base font-semibold transition-all shadow-sm rounded-xl"
        style={{
          backgroundColor: "#C86A4A",
          color: "#FFFFFF",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D9622B")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#C86A4A")}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Inscription en cours...
          </span>
        ) : (
          "Créer mon compte citoyen"
        )}
      </Button>
    </form>
  );
}
