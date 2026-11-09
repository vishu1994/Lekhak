# app/services/stt/exceptions.py


class STTException(Exception):
    """Base exception for speech-to-text operations.

    All STT errors inherit from this class so callers can catch
    provider failures without handling each specific error.
    """


class InvalidAudioFileError(STTException):
    """Raised when the supplied audio file is invalid.

    This covers a missing path, a path that is not a regular file,
    and a file that exists but contains no audio data.
    """


class UnsupportedAudioFormatError(STTException):
    """Raised when the audio format is not supported.

    The file extension is outside the formats the active provider
    can transcribe, such as the formats accepted by Whisper.
    """


class AudioFileTooLargeError(STTException):
    """Raised when the audio file exceeds the configured size limit.

    The limit comes from configuration and is checked before the
    model is asked to transcribe the file.
    """


class ModelInitializationError(STTException):
    """Raised when the transcription model cannot be initialized.

    The named model could not be loaded before transcription started.
    The original load error is kept as the cause of this exception.
    """


class TranscriptionError(STTException):
    """Raised when audio transcription fails.

    The model did not return usable text, or the transcription call
    itself failed. The original error is kept as the cause when one exists.
    """