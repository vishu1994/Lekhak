import os

from minio import Minio
from app.exceptions import AudioUploadError, MinIOConfigurationError
from minio.error import S3Error


class MinIOStorage:
    """Manage audio file storage using a MinIO object storage server.

    Initializes a MinIO client using environment-based configuration
    and provides functionality to upload local audio files to a
    configured MinIO bucket.
    """

    def __init__(self):
        """Initialize the MinIO client using environment configuration.

        Reads the MinIO endpoint, access credentials, bucket name,
        and connection security settings from environment variables.

        Raises:
            MinIOConfigurationError: If any required environment
                variable is missing.
        """
        try:
            self.client = Minio(
                endpoint=os.environ["MINIO_ENDPOINT"],
                access_key=os.environ["MINIO_ACCESS_KEY"],
                secret_key=os.environ["MINIO_SECRET_KEY"],
                secure=os.environ.get("MINIO_SECURE", "false").lower() == "true",
            )

            self.bucket_name = os.environ["MINIO_BUCKET"]

        except KeyError as exc:
            raise MinIOConfigurationError(
                f"Missing required environment variable: {exc.args[0]}"
            ) from exc

    def upload_file(self, file_path: str, object_name: str) -> str:
        """Upload a local file to the configured MinIO bucket.

        Uses the MinIO client to upload a local file to the configured
        bucket. The uploaded object is identified by the provided
        object name.

        Args:
            file_path (str): Local filesystem path of the file to upload.
            object_name (str): Name under which the file will be stored
                in the MinIO bucket.

        Returns:
            str: Object name of the successfully uploaded file.

        Raises:
            AudioUploadError: If MinIO returns an S3 error during upload.
        """
        try:
            self.client.fput_object(
                bucket_name=self.bucket_name,
                object_name=object_name,
                file_path=file_path,
            )
        except S3Error as exc:
            # MinIO/S3 returned an error response.
            raise AudioUploadError(
                f"MinIO upload failed with error code: {exc.code}"
            ) from exc

        return object_name