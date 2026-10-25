
class AudioDownloadError(Exception):
    """Raised when downloading audio from YouTube fails."""


class AudioUploadError(Exception):
    """Raised when uploading audio to MinIO fails."""


class AudioConversionError(Exception):
    """Raised when audio conversion fails."""