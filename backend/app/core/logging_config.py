import logging
import os
from pathlib import Path
from threading import Lock

from dotenv import load_dotenv

# Load backend/.env once so LOG_LEVEL and later settings are available.
load_dotenv(Path(__file__).resolve().parents[2] / ".env")


class LoggingManager:
    """Centralized logging helper for Lekhak.

    Provides a single place to configure and obtain loggers so FastAPI
    routes, services, and Celery tasks all emit logs in the same format.
    Configuration runs only once; later calls reuse the existing setup
    and do not attach duplicate handlers.
    """

    _lock = Lock()
    _configured = False

    @classmethod
    def configure(cls) -> None:
        """Apply global logging settings exactly once.

        Reads ``LOG_LEVEL`` from the environment (default: ``INFO``).
        Invalid levels fall back to ``INFO``. Sets a consistent format
        with timestamp, level, logger name, and message. Thread-safe;
        subsequent calls are no-ops.
        """

        with cls._lock:
            if cls._configured:
                return

            level_name = os.getenv(
                "LOG_LEVEL", "INFO"
            ).upper()

            # Accept only standard logging levels.
            valid_levels = {
                "DEBUG",
                "INFO",
                "WARNING",
                "ERROR",
                "CRITICAL",
            }

            if level_name not in valid_levels:
                level_name = "INFO"

            logging.basicConfig(
                level=getattr(logging, level_name),
                format=(
                    "%(asctime)s | %(levelname)s | "
                    "%(name)s | %(message)s"
                ),
                datefmt="%Y-%m-%d %H:%M:%S",
            )

            cls._configured = True

    @classmethod
    def get_logger(
        cls, name: str
    ) -> logging.Logger:
        """Return a named logger after ensuring logging is configured.

        Prefer ``__name__`` as ``name`` so log lines identify the
        calling module. The same name always returns the same logger
        instance. Use ``logger.exception(...)`` inside except blocks
        to include the stack trace.
        """

        cls.configure()
        return logging.getLogger(name)
