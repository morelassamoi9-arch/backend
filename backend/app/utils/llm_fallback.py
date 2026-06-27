"""Unified retry-with-fallback logic for CrewAI kickoff.

Both the synchronous background worker (`process_demande_with_crew`) and
the async API endpoint (`traiter_demande`) need the same cascade:

    Gemini (with retries) -> Groq fallback -> deterministic local fallback

This module exposes a single function that encapsulates that cascade.
"""

import logging
import os
import time
from typing import Any, Callable, Optional

from app.utils.error_detection import is_transient_error

logger = logging.getLogger(__name__)


def _build_groq_fallback_llm():
    """Create a Groq-backed LLM instance if the API key is available."""
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        return None
    from crewai import LLM
    return LLM(
        model="groq/llama-3.3-70b-versatile",
        api_key=groq_key,
        tool_choice="auto",
    )


def kickoff_with_fallback(
    message: str,
    *,
    max_retries: int = 3,
    initial_delay: float = 5.0,
    deterministic_fallback_fn: Optional[Callable[[str], dict]] = None,
) -> Any:
    """Run a CrewAI kickoff with automatic Gemini -> Groq -> deterministic fallback.

    Parameters
    ----------
    message:
        The citizen request forwarded to the crew.
    max_retries:
        How many times to retry the primary (Gemini) provider.
    initial_delay:
        Initial back-off delay in seconds (doubles on transient errors).
    deterministic_fallback_fn:
        Optional callable(message) -> dict used as last-resort fallback.
        If provided, the dict is wrapped in a ``FallbackResult``.

    Returns
    -------
    The CrewAI result object (with a ``.pydantic`` attribute).
    """
    from app.agents.crew import ECitoyenCrew
    from app.api.demandes import FallbackResult

    delay = initial_delay
    last_exc: Optional[Exception] = None

    for attempt in range(max_retries):
        try:
            logger.info("CrewAI kickoff attempt %d/%d", attempt + 1, max_retries)
            result = ECitoyenCrew().crew().kickoff(inputs={"demande_citoyen": message})
            if result is None or result.pydantic is None:
                raise ValueError("Le crew n'a pas produit de sortie structuree valide")
            return result
        except Exception as exc:
            last_exc = exc
            error_msg = str(exc)
            if attempt < max_retries - 1:
                if is_transient_error(error_msg):
                    logger.warning(
                        "Transient error (attempt %d/%d), retrying in %.1fs: %s",
                        attempt + 1, max_retries, delay, exc,
                    )
                    time.sleep(delay)
                    delay *= 2.0
                else:
                    logger.warning(
                        "Non-transient CrewAI error (attempt %d/%d), retrying in %.1fs: %s",
                        attempt + 1, max_retries, delay, exc,
                    )
                    time.sleep(delay)
                    delay *= 1.5
                continue

            # Final attempt failed — try Groq fallback
            logger.warning("All %d primary attempts exhausted. Trying Groq fallback...", max_retries)
            fallback_llm = _build_groq_fallback_llm()
            if fallback_llm is not None:
                try:
                    result = ECitoyenCrew(llm_override=fallback_llm).crew().kickoff(
                        inputs={"demande_citoyen": message}
                    )
                    if result is None or result.pydantic is None:
                        raise ValueError("Le crew de secours n'a pas produit de sortie structuree valide")
                    logger.info("Groq fallback succeeded.")
                    return result
                except Exception as groq_exc:
                    logger.error("Groq fallback failed: %s", groq_exc)
                    last_exc = groq_exc

            # Last resort: deterministic fallback
            if deterministic_fallback_fn is not None:
                logger.warning("Falling back to deterministic local response.")
                try:
                    data = deterministic_fallback_fn(message)
                    return FallbackResult(data)
                except Exception as fb_err:
                    logger.error("Deterministic fallback failed: %s", fb_err)

    raise last_exc  # type: ignore[misc]
