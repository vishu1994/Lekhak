from fastapi import FastAPI

from app.core.logging_config import LoggingManager

logger = LoggingManager.get_logger(__name__)

app = FastAPI(title="Lekhak")


@app.get("/")
def hello_world():
    logger.info("Hello endpoint called")
    return {"message": "Hello, World"}
