from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ffmpeg_executable: str = "ffmpeg"
    audio_overwrite_output: bool = True
    audio_remove_video_stream: bool = True
    audio_channels: int = 1
    audio_sample_rate: int = 16000
    audio_codec: str = "pcm_s16le"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()