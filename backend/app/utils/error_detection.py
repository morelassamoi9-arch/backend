"""Shared helpers for classifying LLM / network error messages."""

_TRANSIENT_KEYWORDS = ("rate limit", "429", "overloaded", "timeout", "resource_exhausted", "quota")
_RATE_LIMIT_KEYWORDS = ("rate_limit", "rate limit", "429", "resource_exhausted", "quota")


def is_transient_error(message: str) -> bool:
    """Return True when *message* looks like a transient / retriable error."""
    lowered = message.lower()
    return any(kw in lowered for kw in _TRANSIENT_KEYWORDS)


def is_rate_limit_error(message: str) -> bool:
    """Return True when *message* indicates an LLM quota / rate-limit hit."""
    lowered = message.lower()
    return any(kw in lowered for kw in _RATE_LIMIT_KEYWORDS)


def user_facing_error_message(error_message: str) -> str:
    """Return a safe, user-facing string depending on the error category."""
    if is_rate_limit_error(error_message):
        return (
            "Toutes nos excuses, le service d'analyse IA connait actuellement "
            "un fort trafic (limite de requetes atteinte). "
            "Veuillez reessayer dans quelques minutes."
        )
    return "Une erreur technique temporaire est survenue lors du traitement de votre demande. Veuillez reessayer."
