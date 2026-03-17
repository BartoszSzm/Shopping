from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

from src.database.db import ListRole, ShoppingList, ShoppingListShare


def test_get_lists_403_no_auth(client: TestClient):
    response = client.get("/api/lists")
    assert response.status_code == 403


def test_get_lists_401_no_user_id(auth_client: TestClient):
    response = auth_client.get("/api/lists")
    assert response.status_code == 401
    assert response.json() == {"detail": "Missing X-User-Id header"}


def test_get_lists_empty(auth_client_user: TestClient):
    response = auth_client_user.get("/api/lists")

    assert response.status_code == 200
    assert response.json() == []


def test_get_lists_only_owner_lists(
    auth_client_user: TestClient,
    db_session: sessionmaker[Session],
    test_user: str,
):
    with db_session() as session:
        session.add_all(
            [
                ShoppingList(name="list1", user_id=test_user),
                ShoppingList(name="list2", user_id=test_user),
                ShoppingList(name="list3", user_id="other-user"),
            ]
        )
        session.commit()

    response = auth_client_user.get("/api/lists")

    data = response.json()
    assert response.status_code == 200
    assert len(data) == 2
    assert all(item["owner"] == test_user for item in data)


def test_get_lists_excludes_shared_lists(
    auth_client_user: TestClient,
    db_session: sessionmaker[Session],
    test_user: str,
):
    with db_session() as session:
        owned = ShoppingList(
            name="My List", user_id=test_user, role=ListRole.OWNER.value
        )
        other_list = ShoppingList(
            name="Shared List", user_id="other", role=ListRole.OWNER.value
        )
        session.add_all([owned, other_list])
        session.flush()

        share = ShoppingListShare(
            shopping_list_id=other_list.id,
            user_id=test_user,
            role=ListRole.EDITOR.value,
        )
        session.add(share)
        session.commit()

    response = auth_client_user.get("/api/lists")
    data = response.json()

    assert len(data) == 1
    assert data[0]["name"] == "My List"
