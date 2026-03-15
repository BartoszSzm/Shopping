import os

from pydantic_settings import BaseSettings, SettingsConfigDict

env_path = os.path.dirname(os.path.dirname(__file__)) + "/.env"


class Config(BaseSettings):
    DB_URL: str

    BACKEND_SERVICE_TOKEN: str

    DISABLE_AUTH: bool
    DEV_USER_ID: str

    model_config = SettingsConfigDict(env_file=env_path)


config = Config()  # pyright: ignore[reportCallIssue]
