from fastapi.testclient import TestClient

from src.config import Config


def test_403_no_auth(config: Config, client: TestClient):
    response = client.get("/token-data")
    assert response.status_code == 403
    assert response.json() == {"detail": "Not authenticated"}


def test_401_no_x_user_id(config: Config, client: TestClient):
    response = client.get(
        "/token-data",
        headers={"Authorization": f"Bearer {config.BACKEND_SERVICE_TOKEN}"},
    )
    assert response.status_code == 401
    assert response.json() == {"detail": "Missing X-User-Id header"}


def test_200_ok(config: Config, client: TestClient):
    response = client.get(
        "/token-data",
        headers={
            "Authorization": f"Bearer {config.BACKEND_SERVICE_TOKEN}",
            "x-user-id": "myuser",
        },
    )
    assert response.status_code == 200
    assert response.json() == {"user_id": "myuser"}


def test_401_invalid_token(config: Config, client: TestClient):
    response = client.get(
        "/token-data",
        headers={
            "Authorization": "Bearer invalid-token",
            "x-user-id": "myuser",
        },
    )
    assert response.status_code == 401
    assert response.json() == {"detail": "Could not validate credentials"}


def test_403_wrong_auth_scheme(config: Config, client: TestClient):
    response = client.get(
        "/token-data",
        headers={
            "Authorization": f"Basic {config.BACKEND_SERVICE_TOKEN}",
            "x-user-id": "myuser",
        },
    )
    assert response.status_code == 403


def test_401_empty_token(config: Config, client: TestClient):
    response = client.get(
        "/token-data",
        headers={
            "Authorization": "Bearer ",
            "x-user-id": "myuser",
        },
    )
    assert response.status_code == 403
    assert response.json() == {"detail": "Not authenticated"}


def test_401_empty_x_user_id(config: Config, client: TestClient):
    response = client.get(
        "/token-data",
        headers={
            "Authorization": f"Bearer {config.BACKEND_SERVICE_TOKEN}",
            "x-user-id": "",
        },
    )
    assert response.status_code == 401
    assert response.json() == {"detail": "Missing X-User-Id header"}
