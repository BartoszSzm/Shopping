import os
from functools import lru_cache

from pydantic_settings import BaseSettings


class Config(BaseSettings):
    DB_URL: str
    BACKEND_SERVICE_TOKEN: str


@lru_cache()
def get_config():
    env_file = os.getenv("ENV_FILE", ".env")
    return Config(_env_file=env_file)  # pyright: ignore
