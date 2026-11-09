# app/core/config.py

import os
from pathlib import Path

from dotenv import load_dotenv

# Load backend/.env before reading STT settings.
load_dotenv(Path(__file__).resolve().parents[2] / ".env")


class STTConfig:
    """Configuration for speech-to-text services.

    Values come from environment variables, with defaults for the
    provider, the model name, and the maximum audio file size.
    """

    PROVIDER = os.getenv("STT_PROVIDER", "whisper")
    MODEL = os.getenv("STT_MODEL", "tiny")

    MAX_FILE_SIZE_MB = int(
        os.getenv("STT_MAX_FILE_SIZE_MB", "500")
    )