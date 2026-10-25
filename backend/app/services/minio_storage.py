
import os

from minio import Minio


class MinIOStorage:
    def __init__(self):
        self.client = Minio(
            endpoint=os.environ["MINIO_ENDPOINT"],
            access_key=os.environ["MINIO_ACCESS_KEY"],
            secret_key=os.environ["MINIO_SECRET_KEY"],
            secure=os.environ.get("MINIO_SECURE", "false").lower() == "true",
        )

        self.bucket_name = os.environ["MINIO_BUCKET"]

    def upload_file(self, file_path: str, object_name: str) -> str:
        self.client.fput_object(
            bucket_name=self.bucket_name,
            object_name=object_name,
            file_path=file_path,
        )

        return object_name
