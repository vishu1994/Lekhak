from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from app.exceptions import (
    AudioDownloadError,
    AudioConversionError
)
from app.services.audio_downloader import AudioDownloader
from app.services.audio_converter import AudioConverter
from app.services.minio_storage import MinIOStorage

app = FastAPI(title="Lekhak")


class AudioDownloadRequest(BaseModel):
    youtube_url: str


@app.get("/")
def hello_world():
    return {"message": "Hello, World"}


@app.post("/api/v1/audio/download")
def download_youtube_audio(request: AudioDownloadRequest):
    # Step 1: Download audio from YouTube
    try:
        downloader = AudioDownloader()
        audio_path = downloader.download(request.youtube_url)

    except AudioDownloadError as exc:
        raise HTTPException(
            status_code=502,
            detail={
                "code": "AUDIO_DOWNLOAD_FAILED",
                "message": str(exc),
                "action": (
                    "Verify the YouTube URL and confirm "
                    "the video is accessible."
                ),
            },
        ) from exc

    # Step 2: Convert downloaded audio to WAV
    try:
        converter = AudioConverter()
        wav_path = converter.convert_to_wav(audio_path)

    except AudioConversionError as exc:
        raise HTTPException(
            status_code=500,
            detail={
                "code": "AUDIO_CONVERSION_FAILED",
                "message": str(exc),
                "action": (
                    "Check the source audio file and "
                    "FFmpeg installation."
                ),
            },
        ) from exc

    # Step 3: Upload the WAV file to MinIO
    try:
        storage = MinIOStorage()
        object_name = storage.upload_file(
            file_path=wav_path,
            object_name=wav_path.split("/")[-1],
        )

    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail={
                "code": "AUDIO_UPLOAD_FAILED",
                "message": (
                    "Audio was converted, but uploading "
                    "it to storage failed."
                ),
                "action": (
                    "Retry later. If the issue persists, "
                    "check MinIO availability and credentials."
                ),
            },
        ) from exc

    # Step 4: Return success response
    return {
        "message": "Audio downloaded, converted, and uploaded successfully",
        "youtube_url": request.youtube_url,
        "bucket": storage.bucket_name,
        "object_name": object_name,
    }