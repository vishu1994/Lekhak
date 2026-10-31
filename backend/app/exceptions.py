class LekhakError(Exception):
    """Base exception for the entire application."""


class AudioError(LekhakError):
    """Base exception for audio-related operations."""


class AudioDownloadError(AudioError):
    """Raised when downloading audio from YouTube fails."""

class AudioStorageError(AudioError):
    """Audio storage operation failed."""
    
class AudioUploadError(AudioStorageError):
    """Raised when uploading audio to MinIO fails."""


class AudioConversionError(AudioError):
    """Raised when audio conversion fails."""


class MinIOConfigurationError(LekhakError):
    """Raised when MinIO configuration is missing or invalid."""



class AudioFileNotFoundError(AudioError):
    """Raised when the source audio file does not exist."""