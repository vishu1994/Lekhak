import subprocess
from pathlib import Path

from app.exceptions import AudioConversionError


class AudioConverter:
    def convert_to_wav(self, input_path: str) -> str:
        source = Path(input_path)

        # Step 1: Validate the input file
        if not source.is_file():
            raise AudioConversionError(
                f"Source audio file not found: {source}"
            )

        output_path = source.with_suffix(".wav")

        # Step 2: Build the FFmpeg command
        command = [
            "ffmpeg",
            "-y",
            "-i", str(source),
            "-vn",
            "-ac", "1",
            "-ar", "16000",
            "-c:a", "pcm_s16le",
            str(output_path),
        ]

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

        except FileNotFoundError as exc:
            # This can happen if FFmpeg itself is not installed.
            raise AudioConversionError(
                "FFmpeg executable was not found."
            ) from exc

        # Step 4: Return the converted file path
        return str(output_path)