from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

from src.database.db import ListRole, ShoppingList, ShoppingListShare


def test_share_list_403_no_auth(client: TestClient):
    response = client.post(
        "/api/lists/share",
        json={"shopping_list_id": "list1", "user_id": "user2", "role": "editor"},
    )
    assert response.status_code == 403


def test_share_list_401_no_user_id(auth_client: TestClient):
    response = auth_client.post(
        "/api/lists/share",
        json={"shopping_list_id": "list1", "user_id": "user2", "role": "editor"},
    )
    assert response.status_code == 401
    assert response.json() == {"detail": "Missing X-User-Id header"}


def test_share_list_not_owner(
    auth_client_user: TestClient, db_session: sessionmaker[Session], test_user: str
):
    with db_session() as session:
        other_list = ShoppingList(name="Other List", user_id="other-user")
        session.add(other_list)
        session.flush()

    response = auth_client_user.post(
        "/api/lists/share",
        json={"shopping_list_id": other_list.id, "user_id": "user2", "role": "editor"},
    )

    data = response.json()
    assert response.status_code == 200
    assert data["status"] == "rejected"
    assert "not the owner" in data["msg"]


def test_share_list_success(
    auth_client_user: TestClient, db_session: sessionmaker[Session], test_user: str
):
    with db_session() as session:
        my_list = ShoppingList(name="My List", user_id=test_user)
        session.add(my_list)
        session.commit()

        response = auth_client_user.post(
            "/api/lists/share",
            json={"shopping_list_id": my_list.id, "user_id": "user2", "role": "editor"},
        )

    data = response.json()
    assert response.status_code == 200
    assert data["status"] == "confirmed"
    assert "user2" in data["msg"]

    with db_session() as session:
        share = (
            session.query(ShoppingListShare)
            .filter_by(shopping_list_id=my_list.id, user_id="user2")
            .first()
        )
        assert share is not None
        assert share.role == ListRole.EDITOR.value


def test_share_list_duplicate(
    auth_client_user: TestClient, db_session: sessionmaker[Session], test_user: str
):
    with db_session() as session:
        my_list = ShoppingList(name="My List", user_id=test_user)
        session.add(my_list)
        session.flush()

        share = ShoppingListShare(
            shopping_list_id=my_list.id, user_id="user2", role=ListRole.EDITOR.value
        )
        session.add(share)
        session.commit()

        response = auth_client_user.post(
            "/api/lists/share",
            json={"shopping_list_id": my_list.id, "user_id": "user2", "role": "editor"},
        )

    data = response.json()
    assert response.status_code == 200
    assert data["status"] == "rejected"
    assert "already shared" in data["msg"]
