from .base import AppError


class YouTubeCaptionError(AppError):
    """Base exception for YouTube caption errors."""


class InvalidYouTubeURLError(YouTubeCaptionError):
    """Invalid or unsupported YouTube URL."""


class CaptionsNotFoundError(YouTubeCaptionError):
    """Requested transcript was not found."""


class CaptionsDisabledError(YouTubeCaptionError):
    """Captions are disabled for the video."""