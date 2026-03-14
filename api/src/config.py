import os

from pydantic_settings import BaseSettings, SettingsConfigDict

env_path = os.path.dirname(os.path.dirname(__file__)) + "/.env"


class Config(BaseSettings):
    DB_URL: str
    ALGORITHM: str
    KEYCLOAK_CLIENT_ID: str
    KEYCLOAK_CLIENT_SECRET: str
    KEYCLOAK_BASE_URL: str
    KEYCLOAK_REALM: str
    DISABLE_AUTH: bool
    DEV_USER_ID: str

    model_config = SettingsConfigDict(env_file=env_path)


config = Config()  # pyright: ignore[reportCallIssue]
