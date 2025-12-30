import os

from pydantic import BaseModel


class Config(BaseModel):
    ALGORITHM: str
    KEYCLOAK_CLIENT_ID: str
    KEYCLOAK_CLIENT_SECRET: str
    KEYCLOAK_BASE_URL: str
    KEYCLOAK_REALM: str


config = Config(
    ALGORITHM=os.environ["ALGORITHM"],
    KEYCLOAK_CLIENT_ID=os.environ["KEYCLOAK_CLIENT_ID"],
    KEYCLOAK_CLIENT_SECRET=os.environ["KEYCLOAK_CLIENT_SECRET"],
    KEYCLOAK_BASE_URL=os.environ["KEYCLOAK_BASE_URL"],
    KEYCLOAK_REALM=os.environ["KEYCLOAK_REALM"],
)
