import { useState, useRef } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { MobileNav } from "../components/MobileNav";
import { Link, useNavigate } from "react-router";
import { Shield, ArrowLeft, Mic, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export default function NewRequest() {
  const navigate = useNavigate();
  const [request, setRequest] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const recognitionRef = useRef<any>(null);
  const SpeechRecognitionAPI =
    typeof window !== "undefined" &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  const voiceInputSupported = Boolean(SpeechRecognitionAPI);

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/demande";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request.trim()) return;
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: request }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || `Erreur serveur (${response.status})`);
      }
      const data = await response.json();
      navigate("/citizen/request/4", { state: { reponse: data } });
    } catch (err: any) {
      setApiError(err.message || "Impossible de contacter le serveur. Vérifiez votre connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    if (!voiceInputSupported) return;

    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "fr-FR";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = (event: any) => { setIsRecording(false); console.error("Erreur vocale:", event?.error); };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setRequest((prev) => (prev ? `${prev} ${finalTranscript}` : finalTranscript));
      }
    };



    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/citizen">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <img src="/Icone.png" alt="e-Citoyen CI" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="text-lg font-semibold">Nouvelle Demande</h1>
                <p className="text-xs text-muted-foreground">Décrivez votre situation</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Info Banner */}
        <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-primary mb-1">
                Assistant IA prêt à vous aider
              </h3>
              <p className="text-sm text-foreground">
                Décrivez votre situation en détail. Notre IA analysera votre demande et générera 
                un guide complet avec toutes les démarches nécessaires.
              </p>
            </div>
          </div>
        </div>

        {/* Request Form */}
        <Card>
          <CardHeader>
            <CardTitle>Décrire votre situation</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Text Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Expliquez votre situation
                </label>
                <Textarea
                  placeholder="Exemple : Mon enfant est né hier à l'hôpital général d'Anyama. Je souhaite faire sa déclaration de naissance. Quelles sont les démarches à suivre ?"
                  value={request}
                  onChange={(e) => setRequest(e.target.value)}
                  className="min-h-[200px] resize-none"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Soyez aussi précis que possible : lieu, dates, documents déjà en votre possession...
                </p>
              </div>

              {/* Voice Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Ou utilisez la saisie vocale
                </label>
                <Button
                  type="button"
                  variant={isRecording ? "destructive" : "outline"}
                  className="w-full"
                  onClick={toggleRecording}
                  disabled={!voiceInputSupported}
                  title={!voiceInputSupported ? "Saisie vocale non supportée par ce navigateur" : undefined}
                >
                  <Mic className="w-5 h-5 mr-2" />
                  {!voiceInputSupported
                    ? "Saisie vocale non disponible sur ce navigateur"
                    : isRecording
                      ? "Arrêter l'enregistrement"
                      : "Commencer l'enregistrement"}
                </Button>

                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-destructive/10 border border-destructive/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {[0, 1, 2, 3].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1 bg-destructive rounded-full"
                            animate={{
                              height: [12, 24, 12],
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-destructive font-medium">
                        Enregistrement en cours...
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Submit Button */}
              {apiError && (
  <p className="text-sm text-destructive font-medium">⚠️ {apiError}</p>
)}
<Button type="submit" className="w-full" size="lg" disabled={isLoading || !request.trim()}>
  <Sparkles className="w-5 h-5 mr-2" />
  {isLoading ? "Analyse en cours..." : "Analyser ma demande"}
</Button>

            </form>
          </CardContent>
        </Card>

        {/* Examples */}
        <div className="mt-8">
          <h3 className="font-semibold mb-4">Exemples de demandes</h3>
          <div className="grid gap-3">
            {[
              "Je souhaite faire ma demande de carte nationale d'identité. Où dois-je aller ?",
              "Mon enfant est né il y a 3 jours. Comment obtenir son acte de naissance ?",
              "Je veux m'inscrire à l'assurance maladie universelle. Quels documents apporter ?"
            ].map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setRequest(example)}
                className="p-4 text-left rounded-lg border border-border hover:bg-accent transition-colors text-sm"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
