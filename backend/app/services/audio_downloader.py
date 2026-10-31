from pathlib import Path

import yt_dlp
from app.exceptions import AudioDownloadError, AudioStorageError


class AudioDownloader:
    """Download audio from YouTube videos and manage local audio storage.

    Uses yt-dlp to download the best available audio stream and stores
    downloaded files in the configured output directory.
    """

    def __init__(self, output_dir: str = "media/audio"):
        """Initialize the audio downloader and create the storage directory.

        Args:
            output_dir (str): Directory where downloaded audio files
                will be stored. Defaults to "media/audio".

        Raises:
            AudioStorageError: If the storage directory cannot be created.
        """
        self.output_dir = Path(output_dir)

        try:
            self.output_dir.mkdir(parents=True, exist_ok=True)
        except OSError as exc:
            raise AudioStorageError(
                "Unable to initialize audio storage."
            ) from exc

    def download(self, youtube_url: str) -> str:
        """Download audio from a YouTube video.

        Downloads the best available audio stream using yt-dlp.
        Playlists are disabled, and the downloaded file is saved in the
        configured output directory using the YouTube video ID as its
        filename.

        Args:
            youtube_url (str): URL of the YouTube video to download.

        Returns:
            str: Path to the downloaded audio file.

        Raises:
            AudioDownloadError: If yt-dlp fails to download the audio.
        """
        options = {
            "format": "bestaudio/best",
            "outtmpl": str(self.output_dir / "%(id)s.%(ext)s"),
            "noplaylist": True,
        }

        try:
            with yt_dlp.YoutubeDL(options) as downloader:
                info = downloader.extract_info(youtube_url, download=True)
                return downloader.prepare_filename(info)

        except yt_dlp.utils.DownloadError as exc:
            raise AudioDownloadError(
                "Unable to download audio from the provided YouTube URL."
            ) from exc