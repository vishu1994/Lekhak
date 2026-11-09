# app/services/stt/schemas.py

from dataclasses import dataclass


@dataclass(frozen=True)
class TranscriptionResult:
    """Standard result returned by every STT provider.

    Holds the transcribed text, the detected language when known, and
    the name of the provider that produced the result.
    """

    text: str
    language: str | None = None
    provider: str = "unknown"