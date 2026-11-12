import re
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Iterable
from urllib.parse import urlparse, parse_qs

from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    TranscriptsDisabled,
    NoTranscriptFound,
)

from backend.app.core.logging_config import LoggingManager

logger = LoggingManager.get_logger(__name__)

from backend.exceptions.fetch_caption import (
    InvalidYouTubeURLError,
    CaptionsNotFoundError,
    CaptionsDisabledError,
)


@dataclass
class TranscriptSegment:
    """Represents an individual segment of a fetched transcript.

    Attributes:
        text: Text content of the transcript segment.
        start: Start time of the segment in seconds.
        duration: Duration of the segment in seconds.
    """

    text: str
    start: float
    duration: float


@dataclass
class FetchedTranscript:
    """Represents a normalized transcript returned by a transcription API.

    Attributes:
        language_code: Language code of the fetched transcript.
        is_generated: Whether the transcript was automatically generated.
        segments: List of transcript segments.
    """

    language_code: str
    is_generated: bool
    segments: list[TranscriptSegment]


class BaseTranscriptApi(ABC):
    """Abstract interface for transcript API implementations.

    Concrete implementations must provide a fetch method that retrieves
    and normalizes transcript data.
    """

    @abstractmethod
    def fetch(
        self,
        video_id: str,
        languages: Iterable[str] = ("en",),
    ) -> FetchedTranscript:
        """Fetch a transcript for a video.

        Args:
            video_id: Unique identifier of the video.
            languages: Preferred transcript languages in priority order.

        Returns:
            A normalized FetchedTranscript object.

        Raises:
            NotImplementedError: If the method is not implemented by a subclass.
        """
        pass


class YoutubeTranscriptionApiAdapter(BaseTranscriptApi):
    """Adapts youtube-transcript-api to the application's transcript interface.

    Converts third-party transcript responses into application-level data
    models and translates third-party exceptions into application exceptions.
    """

    def __init__(self, library=None):
        """Initialize the adapter with a transcript API library.

        Args:
            library: Optional transcript API library instance.
                Defaults to a new YouTubeTranscriptApi instance.
        """
        if library is None:
            library = YouTubeTranscriptApi()

        self.library = library

    def fetch(
        self,
        video_id: str,
        languages: Iterable[str] = ("en",),
    ) -> FetchedTranscript:
        """Fetch and normalize a video's transcript using YouTube's API.

        Args:
            video_id: Unique identifier of the YouTube video.
            languages: Preferred transcript languages in priority order.

        Returns:
            A FetchedTranscript containing normalized transcript data.

        Raises:
            CaptionsNotFoundError: If captions in the requested language
                are unavailable.
            CaptionsDisabledError: If captions are disabled for the video.
        """
        try:
            raw_result = self.library.fetch(
                video_id,
                languages=list(languages),
            )

        except NoTranscriptFound as exc:
            logger.warning(
                f"No transcript found for video_id=%s in requested languages.",
                video_id,
            )
            raise CaptionsNotFoundError(
                "Captions in the requested language are not available."
            ) from exc

        except TranscriptsDisabled as exc:
            logger.warning(
                "Transcript retrieval is disabled for video_id=%s.",
                video_id,
            )
            raise CaptionsDisabledError(
                "Captions are disabled for this video."
            ) from exc

        segments = [
            TranscriptSegment(
                text=segment.text,
                start=segment.start,
                duration=segment.duration,
            )
            for segment in raw_result
        ]
        logger.debug(
            "Transcript retrieved successfully from YouTube API. video_id=%s",
            video_id,
        )
        return FetchedTranscript(
            language_code=raw_result.language_code,
            is_generated=raw_result.is_generated,
            segments=segments,
        )


class YouTubeCaptionProvider:
    """Provides YouTube caption retrieval using an injected transcript API.

    Handles YouTube URL validation, video ID extraction, and transcript
    retrieval without depending on a specific third-party API implementation.
    """

    def __init__(
        self,
        api: BaseTranscriptApi,
        language: str = "en",
    ):
        """Initialize the YouTube caption provider.

        Args:
            api: Transcript API implementation used to fetch captions.
            language: Preferred language code for the transcript.
        """
        self.api = api
        self.language = language

    def _extract_video_id(self, video_url: str) -> str:
        """Extract and validate a YouTube video ID from a URL.

        Supports standard YouTube watch URLs, shortened youtu.be URLs,
        and YouTube Shorts, embed, and live URLs.

        Args:
            video_url: YouTube video URL.

        Returns:
            The extracted 11-character YouTube video ID.

        Raises:
            ValueError: If the URL is unsupported or the video ID is invalid.
        """
        logger.debug("Starting YouTube URL validation.")
        parsed = urlparse(video_url)
        host = (parsed.hostname or "").lower()

        if host == "youtu.be":
            video_id = parsed.path.strip("/").split("/")[0]

        elif host == "youtube.com" or host.endswith(".youtube.com"):
            if parsed.path == "/watch":
                video_id = parse_qs(parsed.query).get("v", [""])[0]

            else:
                parts = parsed.path.strip("/").split("/")

                video_id = (
                    parts[1]
                    if len(parts) == 2 and parts[0] in {"shorts", "embed", "live"}
                    else ""
                )

        else:
            raise ValueError("Unsupported YouTube URL")

        if not re.fullmatch(r"[A-Za-z0-9_-]{11}", video_id):
            raise ValueError("Invalid YouTube video ID")

        logger.debug(
            "YouTube URL validated successfully. video_id=%s",
            video_id,
        )
        return video_id

    def fetch(self, video_url: str) -> dict[str, Any]:
        """Fetch captions for a YouTube video.

        Extracts the video ID, validates the URL, and delegates transcript
        retrieval to the injected transcript API implementation.

        Args:
            video_url: URL of the YouTube video.

        Returns:
            A dictionary containing:
                video_id: YouTube video identifier.
                language: Language code of the fetched transcript.
                is_generated: Whether captions were automatically generated.
                segments: List of normalized transcript segments.

        Raises:
            InvalidYouTubeURLError: If the supplied URL is invalid or unsupported.
            CaptionsNotFoundError: If captions in the requested language
                are unavailable.
            CaptionsDisabledError: If captions are disabled for the video.
        """
        try:
            video_id = self._extract_video_id(video_url)

        except (ValueError, TypeError) as exc:
            logger.error(
                "YouTube URL validation failed: %s",
                exc,
            )
            raise InvalidYouTubeURLError(f"Invalid video URL: {exc}") from exc

        # The adapter handles third-party exceptions.
        logger.info(
            "Starting transcript retrieval. video_id=%s, language=%s",
            video_id,
            self.language,
        )
        transcript = self.api.fetch(
            video_id,
            languages=[self.language],
        )
        logger.info(
            "Transcript retrieval completed successfully. video_id=%s, language=%s",
            video_id,
            transcript.language_code,
        )
        return {
            "video_id": video_id,
            "language": transcript.language_code,
            "is_generated": transcript.is_generated,
            "segments": transcript.segments,
        }


if __name__ == "__main__":
    adapter = YoutubeTranscriptionApiAdapter()

    provider = YouTubeCaptionProvider(
        api=adapter,
        language="en",
    )

    try:
        result = provider.fetch("https://www.youtube.com/watch?v=rgHZa7-Dibg&t=1519s")

        # print(result)

    except InvalidYouTubeURLError as exc:
        print(f"Invalid URL: {exc}")

    except CaptionsNotFoundError as exc:
        print(f"Captions not found: {exc}")

    except CaptionsDisabledError as exc:
        print(f"Captions disabled: {exc}")
