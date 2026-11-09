# app/services/stt/whisper_service.py

from pathlib import Path
from typing import Any

import whisper

from app.core.logging_config import LoggingManager
from app.services.stt.base import TranscriptionService
from app.services.stt.exceptions import (
    AudioFileTooLargeError,
    InvalidAudioFileError,
    ModelInitializationError,
    TranscriptionError,
    UnsupportedAudioFormatError,
)
from app.services.stt.schemas import TranscriptionResult

logger = LoggingManager.get_logger(__name__)


class WhisperTranscriptionService(TranscriptionService):
    """Transcribe audio files using the local Whisper model.

    The model stays unloaded until the first transcription request.
    File format and size are checked before Whisper is called.
    """

    SUPPORTED_FORMATS = {
        ".wav",
        ".mp3",
        ".m4a",
        ".mp4",
        ".mpeg",
        ".mpga",
        ".webm",
        ".ogg",
        ".flac",
    }

    def __init__(
        self,
        model_name: str = "tiny",
        max_file_size_mb: int = 500,
    ) -> None:
        """Initialize the Whisper transcription service.

        Store the model name and the maximum file size without loading
        Whisper yet. The model is created on the first transcription.
        """

        self.model_name = model_name
        self.max_file_size_mb = max_file_size_mb
        self._model: Any = None
        logger.info(
            "Whisper service ready model=%s max_file_size_mb=%s",
            model_name,
            max_file_size_mb,
        )

    def _load_model(self) -> Any:
        """Load Whisper model only when required.

        Reuse the model when it is already in memory. Raise
        ModelInitializationError when Whisper cannot load that model.
        """

        if self._model is None:
            logger.info("Loading Whisper model=%s", self.model_name)
            try:
                self._model = whisper.load_model(self.model_name)
                logger.info("Whisper model loaded model=%s", self.model_name)

            except Exception as exc:
                logger.exception(
                    "Unable to load Whisper model=%s",
                    self.model_name,
                )
                raise ModelInitializationError(
                    f"Unable to load Whisper model: {self.model_name}"
                ) from exc
        else:
            logger.debug("Reusing loaded Whisper model=%s", self.model_name)

        return self._model

    def _validate_audio(self, audio_path: Path) -> None:
        """Validate audio file existence, format and size.

        Confirm the path is an existing file in a supported format.
        Reject empty files and files larger than the configured limit.
        """

        if not audio_path.exists():
            logger.warning("Audio file does not exist path=%s", audio_path)
            raise InvalidAudioFileError(
                f"Audio file does not exist: {audio_path}"
            )

        if not audio_path.is_file():
            logger.warning("Audio path is not a file path=%s", audio_path)
            raise InvalidAudioFileError(
                "Provided audio path is not a file."
            )

        if audio_path.suffix.lower() not in self.SUPPORTED_FORMATS:
            logger.warning(
                "Unsupported audio format path=%s format=%s",
                audio_path,
                audio_path.suffix,
            )
            raise UnsupportedAudioFormatError(
                f"Unsupported audio format: {audio_path.suffix}"
            )

        file_size_mb = audio_path.stat().st_size / (1024 * 1024)

        if file_size_mb == 0:
            logger.warning("Audio file is empty path=%s", audio_path)
            raise InvalidAudioFileError(
                "Audio file is empty."
            )

        if file_size_mb > self.max_file_size_mb:
            logger.warning(
                "Audio file too large path=%s size_mb=%.2f limit_mb=%s",
                audio_path,
                file_size_mb,
                self.max_file_size_mb,
            )
            raise AudioFileTooLargeError(
                f"Audio file exceeds {self.max_file_size_mb} MB."
            )

        logger.debug(
            "Audio validated path=%s size_mb=%.2f",
            audio_path,
            file_size_mb,
        )

    def transcribe(
        self,
        audio_path: Path,
    ) -> TranscriptionResult:
        """Transcribe an audio file and return standardized output.

        Validate the file, run the local Whisper model, and return the
        text with its detected language. Raise TranscriptionError on failure.
        """

        audio_path = Path(audio_path)
        logger.info("Transcription started file=%s", audio_path.name)

        self._validate_audio(audio_path)

        try:
            model = self._load_model()

            response = model.transcribe(
                str(audio_path),
                fp16=False,
            )

            text = response.get("text", "").strip()

            if not text:
                logger.error(
                    "Empty transcription file=%s",
                    audio_path.name,
                )
                raise TranscriptionError(
                    "Whisper returned an empty transcription."
                )

            language = response.get("language")
            logger.info(
                "Transcription finished file=%s language=%s chars=%s",
                audio_path.name,
                language,
                len(text),
            )

            return TranscriptionResult(
                text=text,
                language=language,
                provider="whisper",
            )

        except (
            InvalidAudioFileError,
            UnsupportedAudioFormatError,
            AudioFileTooLargeError,
            ModelInitializationError,
            TranscriptionError,
        ):
            raise

        except Exception as exc:
            logger.exception(
                "Whisper transcription failed file=%s",
                audio_path.name,
            )
            raise TranscriptionError(
                f"Whisper transcription failed: {audio_path.name}"
            ) from exc