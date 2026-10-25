from pathlib import Path

import yt_dlp
from app.exceptions import AudioDownloadError

class AudioDownloader:
    def __init__(self, output_dir: str = "media/audio"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def download(self, youtube_url: str) -> str:
        options = {
            "format": "bestaudio/best",
            "outtmpl": str(self.output_dir / "%(id)s.%(ext)s"),
            "noplaylist": True,
        }

        try:
            with yt_dlp.YoutubeDL(options) as downloader:
                info = downloader.extract_info(youtube_url, download=True)
                return downloader.prepare_filename(info)

        except Exception as exc:
            raise AudioDownloadError(
                "Unable to download audio from the provided YouTube URL."
            ) from exc
