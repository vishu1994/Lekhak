import re
from typing import Any, Iterable, Protocol
from urllib.parse import urlparse, parse_qs

from youtube_transcript_api import YouTubeTranscriptApi

from youtube_transcript_api._errors import (
    TranscriptsDisabled,
    NoTranscriptFound,
)

from exceptions.fetch_caption import (
    InvalidYouTubeURLError,
    CaptionsNotFoundError,
    CaptionsDisabledError,
)


# 1. Define the Protocol for the returned transcript object
class FetchedTranscriptProtocol(Protocol):
    language_code: str
    is_generated: bool

    def to_raw_data(self) -> list[dict[str, Any]]: ...


# 2. Define the Protocol for the injected API dependency
class TranscriptApiProtocol(Protocol):
    def fetch(
        self,
        video_id: str,
        languages: Iterable[str] = ("en",),
        preserve_formatting: bool = False,
    ) -> FetchedTranscriptProtocol: ...


# 3. Inject the Protocol into your provider class
class YouTubeCaptionProvider:

    def __init__(self, api: TranscriptApiProtocol, language: str = "en"):
        self.api = api
        self.language = language

    def __extract_video_id(self, video_url: str) -> str:
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

        return video_id

    def fetch(self, video_url: str) -> dict[str, Any]:
        try:
            video_id = self.__extract_video_id(video_url)
        except ValueError as exc:
            raise InvalidYouTubeURLError(f"Invalid video URL: {exc}") from exc

        try:
            transcript = self.api.fetch(
                video_id,
                languages=[self.language],
            )

        except NoTranscriptFound as exc:
            raise CaptionsNotFoundError(
                f"Captions in {self.language} are not available."
            ) from exc

        except TranscriptsDisabled as exc:
            raise CaptionsDisabledError(
                "Captions are disabled for this video."
            ) from exc

        return {
            "video_id": video_id,
            "language": transcript.language_code,
            "is_generated": transcript.is_generated,
            "segments": transcript.to_raw_data(),
        }
