import { useState, useRef } from 'react'

const API_URL = 'http://localhost:8000/api/demande'

function App() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [copied, setCopied] = useState(false)

  const recognitionRef = useRef(null)

  const SpeechRecognitionAPI =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)
  const voiceInputSupported = Boolean(SpeechRecognitionAPI)
  const voiceOutputSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window

  function toggleListening() {
    if (!voiceInputSupported) return

    if (listening) {
      recognitionRef.current?.stop()
      return
    }

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'fr-FR'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setMessage((prev) => (prev ? `${prev} ${transcript}` : transcript))
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  function toggleSpeaking() {
    if (!voiceOutputSupported || !result) return

    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }

    const texteALire = [
      result.resume_situation,
      'Plan d\'action.',
      ...result.plan_action.map((etape, i) => `Étape ${i + 1}. ${etape}`),
      result.documents_a_apporter.length > 0
        ? `Documents à apporter. ${result.documents_a_apporter.join(', ')}.`
        : '',
      `Lieu. ${result.lieu}.`,
      `Délai estimé. ${result.delai_estime}.`,
      `Coût. ${result.cout}.`,
    ].filter(Boolean).join(' ')

    const utterance = new SpeechSynthesisUtterance(texteALire)
    utterance.lang = 'fr-FR'
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  async function copierLettre() {
    if (!result?.contenu_lettre) return
    try {
      await navigator.clipboard.writeText(result.contenu_lettre)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError("Impossible de copier automatiquement. Sélectionnez le texte manuellement.")
    }
  }

  function envoyerParEmail() {
    if (!result?.contenu_lettre) return
    const sujet = encodeURIComponent(`Demande - ${result.resume_situation.slice(0, 60)}`)
    const corps = encodeURIComponent(result.contenu_lettre)
    window.location.href = `mailto:?subject=${sujet}&body=${corps}`
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (message.trim().length < 3) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.detail || "Une erreur est survenue. Réessayez dans un instant.")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? "Impossible de contacter le serveur. Vérifiez que le backend est bien lancé."
          : err.message
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <header className="header">
        <p className="header__eyebrow">e-Citoyen CI</p>
        <h1 className="header__title">Décrivez votre situation</h1>
        <p className="header__subtitle">
          Expliquez avec vos mots ce que vous voulez faire, à l'écrit ou à la voix.
          Nous vous indiquons les démarches exactes à suivre.
        </p>
      </header>

      <form className="form" onSubmit={handleSubmit}>
        <label htmlFor="message">Votre situation</label>
        <div className="input-with-mic">
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ex : Je veux faire ma carte d'identité mais j'ai perdu mon acte de naissance"
            disabled={loading}
          />
          {voiceInputSupported && (
            <button
              type="button"
              className={`mic-button ${listening ? 'mic-button--active' : ''}`}
              onClick={toggleListening}
              disabled={loading}
              aria-label={listening ? 'Arrêter l\'écoute' : 'Parler au lieu d\'écrire'}
              title={listening ? 'Arrêter l\'écoute' : 'Parler au lieu d\'écrire'}
            >
              {listening ? '⏹' : '🎤'}
            </button>
          )}
        </div>
        {listening && (
          <p className="form__hint form__hint--listening">🎤 Je vous écoute, parlez maintenant…</p>
        )}
        {!listening && (
          <p className="form__hint">
            Minimum 3 caractères. Plus vous donnez de détails, plus la réponse sera précise.
          </p>
        )}
        <button type="submit" className="button" disabled={loading || message.trim().length < 3}>
          {loading ? 'Analyse en cours…' : 'Obtenir ma démarche'}
        </button>
      </form>

      {loading && (
        <div className="loading">
          <span className="loading__spinner" />
          <span>
            Analyse de votre situation en cours. Cela peut prendre jusqu'à une minute,
            ne fermez pas cette page.
          </span>
        </div>
      )}

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {result && (
        <div className="result">
          <div className="result__inner">
            <div className="result__header-row">
              <span className="result__badge">Votre démarche</span>
              {voiceOutputSupported && (
                <button
                  type="button"
                  className="listen-button"
                  onClick={toggleSpeaking}
                >
                  {speaking ? '⏹ Arrêter' : '🔊 Écouter la réponse'}
                </button>
              )}
            </div>
            <p className="result__summary">{result.resume_situation}</p>

            <div className="result__section">
              <p className="result__section-title">Plan d'action</p>
              <ol className="result__steps">
                {result.plan_action.map((step, i) => (
                  <li className="result__step" key={i}>
                    <span className="result__step-number">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="result__section">
              <p className="result__section-title">Documents à apporter</p>
              <ul className="result__docs">
                {result.documents_a_apporter.map((doc, i) => (
                  <li key={i}>{doc}</li>
                ))}
              </ul>
            </div>

            <div className="result__section">
              <p className="result__section-title">Informations pratiques</p>
              <div className="result__meta">
                <div className="result__meta-item">
                  <p className="result__meta-label">Lieu</p>
                  <p className="result__meta-value">{result.lieu}</p>
                </div>
                <div className="result__meta-item">
                  <p className="result__meta-label">Délai estimé</p>
                  <p className="result__meta-value">{result.delai_estime}</p>
                </div>
                <div className="result__meta-item">
                  <p className="result__meta-label">Coût</p>
                  <p className="result__meta-value">{result.cout}</p>
                </div>
              </div>
            </div>

            {result.lettre_generee && result.contenu_lettre && (
              <div className="result__section">
                <div className="result__letter-header">
                  <p className="result__section-title">Lettre de demande prête à compléter</p>
                  <div className="result__letter-actions">
                    <button type="button" className="letter-action-button" onClick={copierLettre}>
                      {copied ? '✓ Copié' : '📋 Copier'}
                    </button>
                    <button type="button" className="letter-action-button" onClick={envoyerParEmail}>
                      ✉️ Envoyer par email
                    </button>
                  </div>
                </div>
                <div className="result__letter">{result.contenu_lettre}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App