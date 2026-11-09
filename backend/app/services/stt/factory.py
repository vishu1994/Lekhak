# app/services/stt/factory.py

from app.core.config import STTConfig
from app.services.stt.base import TranscriptionService
from app.services.stt.exceptions import STTException
from app.services.stt.whisper_service import WhisperTranscriptionService


def get_transcription_service() -> TranscriptionService:
    """Create the configured transcription provider.

    Read the provider name from STTConfig and return the matching
    service. Raise STTException when that provider is not supported.
    """

    if STTConfig.PROVIDER == "whisper":
        return WhisperTranscriptionService(
            model_name=STTConfig.MODEL,
            max_file_size_mb=STTConfig.MAX_FILE_SIZE_MB,
        )

    raise STTException(
        f"Unsupported STT provider: {STTConfig.PROVIDER}"
    )