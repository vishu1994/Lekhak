import subprocess
from pathlib import Path
from app.config import settings

from app.exceptions import AudioConversionError, AudioFileNotFoundError


class AudioConverter:
    def convert_to_wav(self, input_path: str) -> str:
        """Convert an audio file to WAV format using FFmpeg.

        Converts the input audio file into WAV format using the configured
        FFmpeg executable and audio settings, including sample rate, channels,
        and codec. The converted file is saved in the same directory as the
        source file with a .wav extension.

        Args:
            input_path (str): Path to the source audio file.

        Returns:
            str: Path to the converted WAV file.

        Raises:
            AudioFileNotFoundError: If the source audio file does not exist.
            AudioConversionError: If FFmpeg execution fails, the conversion
                fails, or the output WAV file is not created.
        """
        source = Path(input_path)

        # Step 1: Validate the input file
        if not source.is_file():
            raise AudioFileNotFoundError(
                f"Source audio file not found: {source}"
            )
        output_path = source.with_suffix(".wav")

        # Step 2: Build the FFmpeg command
        command = [
            settings.ffmpeg_executable,
            "-y" if settings.audio_overwrite_output else "-n",
            "-i",
            str(source),
        ]
        
        if settings.audio_remove_video_stream:
            command.append("-vn")
            
        command.extend([
            "-ac",
            str(settings.audio_channels),
            "-ar",
            str(settings.audio_sample_rate),
            "-c:a",
            settings.audio_codec,
            str(output_path),
        ])

        # Step 3: Convert the audio
        try:
            subprocess.run(
                command,
                check=True,
                capture_output=True,
                text=True,
            )
            
            if not output_path.is_file():
                raise AudioConversionError(
                    f"FFmpeg completed but WAV file was not created: {output_path}"
    )       

        except subprocess.CalledProcessError as exc:
            raise AudioConversionError(
                f"FFmpeg failed to convert audio: {exc.stderr}"
            ) from exc

        except OSError as exc:
            raise AudioConversionError(
                "Unable to execute FFmpeg."
            ) from exc

        # Step 4: Return the converted file path
        return str(output_path)