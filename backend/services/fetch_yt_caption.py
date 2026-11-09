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

from backend.exceptions.fetch_caption import CaptionsDisabledError, CaptionsNotFoundError, InvalidYouTubeURLError

@dataclass
class TranscriptSegment:
    text: str
    start: float
    duration: float


@dataclass
class FetchedTranscript:
    language_code: str
    is_generated: bool
    segments: list[TranscriptSegment]


# =====================================================
# 3. Abstract Base Class
# =====================================================

class BaseTranscriptApi(ABC):

    @abstractmethod
    def fetch(
        self,
        video_id: str,
        languages: Iterable[str] = ("en",),
    ) -> FetchedTranscript:
        pass


# =====================================================
# 4. YouTube Adapter
# =====================================================

class YoutubeTranscriptionApiAdapter(BaseTranscriptApi):

    def __init__(self, library=None):

        if library is None:
            library = YouTubeTranscriptApi()

        self.library = library

    def fetch(
        self,
        video_id: str,
        languages: Iterable[str] = ("en",),
    ) -> FetchedTranscript:

        try:
            raw_result = self.library.fetch(
                video_id,
                languages=list(languages),
            )

        except NoTranscriptFound as exc:
            raise CaptionsNotFoundError(
                "Captions in the requested language are not available."
            ) from exc

        except TranscriptsDisabled as exc:
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

        return FetchedTranscript(
            language_code=raw_result.language_code,
            is_generated=raw_result.is_generated,
            segments=segments,
        )


# =====================================================
# 5. YouTube Caption Provider
# =====================================================

class YouTubeCaptionProvider:

    def __init__(
        self,
        api: BaseTranscriptApi,
        language: str = "en",
    ):
        self.api = api
        self.language = language

    def _extract_video_id(self, video_url: str) -> str:

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
                    if len(parts) == 2
                    and parts[0] in {"shorts", "embed", "live"}
                    else ""
                )

        else:
            raise ValueError("Unsupported YouTube URL")

        if not re.fullmatch(r"[A-Za-z0-9_-]{11}", video_id):
            raise ValueError("Invalid YouTube video ID")

        return video_id

    def fetch(self, video_url: str) -> dict[str, Any]:

        try:
            video_id = self._extract_video_id(video_url)

        except (ValueError, TypeError) as exc:
            raise InvalidYouTubeURLError(
                f"Invalid video URL: {exc}"
            ) from exc

        # Adapter handles third-party exceptions.
        transcript = self.api.fetch(
            video_id,
            languages=[self.language],
        )

        return {
            "video_id": video_id,
            "language": transcript.language_code,
            "is_generated": transcript.is_generated,
            "segments": transcript.segments,
        }


# =====================================================
# 6. Application Usage
# =====================================================

if __name__ == "__main__":

    adapter = YoutubeTranscriptionApiAdapter()

    provider = YouTubeCaptionProvider(
        api=adapter,
        language="en",
    )

    try:
        result = provider.fetch(
            "https://www.youtube.com/watch?v="
        )

        print(result)

    except InvalidYouTubeURLError as exc:
        print(f"Invalid URL: {exc}")

    except CaptionsNotFoundError as exc:
        print(f"Captions not found: {exc}")

    except CaptionsDisabledError as exc:
        print(f"Captions disabled: {exc}")