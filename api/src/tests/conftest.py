import os

import pytest
from fastapi.testclient import TestClient

os.environ["ENV_FILE"] = ".env.test"

from src.app import app
from src.config import Config


@pytest.fixture(scope="session")
def config():
    return Config(_env_file=".env.test")  # pyright: ignore


@pytest.fixture(scope="session")
def client():
    return TestClient(app)
