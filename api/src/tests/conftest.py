import os

import pytest
from fastapi.testclient import TestClient

from src.database.db import create_db, get_db_session

os.environ["ENV_FILE"] = ".env.test"

from src.app import app
from src.config import Config


@pytest.fixture(scope="session")
def config():
    return Config(_env_file=".env.test")  # pyright: ignore


@pytest.fixture
def test_user():
    return "test_user"


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def auth_client(config: Config):
    return TestClient(
        app, headers={"Authorization": f"Bearer {config.BACKEND_SERVICE_TOKEN}"}
    )


@pytest.fixture
def auth_client_user(auth_client: TestClient, config: Config, test_user: str):
    return TestClient(
        app,
        headers={
            "Authorization": f"Bearer {config.BACKEND_SERVICE_TOKEN}",
            "x-user-id": test_user,
        },
    )


@pytest.fixture(autouse=True)
def setup_db(config: Config):
    create_db(config.DB_URL)
    yield
    if config.DB_URL.startswith("sqlite:///"):
        db_path = config.DB_URL.replace("sqlite:///", "")
        if os.path.exists(db_path):
            os.remove(db_path)


@pytest.fixture
def db_session(config: Config):
    return get_db_session(config=config)
