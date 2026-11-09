# app/services/stt/base.py

from pathlib import Path
from typing import Protocol

from app.services.stt.schemas import TranscriptionResult


class TranscriptionService(Protocol):
    """Contract that all STT providers must implement.

    Each provider accepts an audio path and returns a TranscriptionResult.
    Callers depend on this contract instead of a specific engine.
    """

    def transcribe(
        self,
        audio_path: Path,
    ) -> TranscriptionResult:
        """Convert an audio file into text.

        Read the file at the given path and return a TranscriptionResult.
        Raise an STT error when the audio cannot be transcribed.
        """
        ...