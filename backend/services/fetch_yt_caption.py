
import re
from urllib.parse import urlparse, parse_qs

from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    TranscriptsDisabled,
    NoTranscriptFound,
)


class YouTubeCaptionProvider:

    def __init__(self, language: str = "en"):
        self.language = language
        self.api = YouTubeTranscriptApi()

    def extract_video_id(self, video_url: str) -> str:
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

    def fetch(self, video_url: str) -> dict:
        video_id = self.extract_video_id(video_url)

        try:
            transcript = self.api.fetch(
                video_id,
                languages=[self.language],
            )

        except NoTranscriptFound as exc:
            raise ValueError(
                f"Captions in {self.language} are not available."
            ) from exc

        except TranscriptsDisabled as exc:
            raise ValueError(
                "Captions are disabled for this video."
            ) from exc

        return {
            "video_id": video_id,
            "language": transcript.language_code,
            "is_generated": transcript.is_generated,
            "segments": transcript.to_raw_data(),
        }
