from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

from src.database.db import (
    ListItem,
    ShoppingList,
    ShoppingListShare,
)


def test_get_list_items_403_no_auth(client: TestClient):
    response = client.get("/api/1")
    assert response.status_code == 403


def test_get_list_items_not_found_or_no_access(
    auth_client_user: TestClient, db_session: sessionmaker[Session]
):
    response = auth_client_user.get("/api/9999")
    assert response.status_code == 200
    assert response.json() == {"status": "rejected", "msg": "Item not found"}


def test_get_list_items_success_as_owner(
    auth_client_user: TestClient, db_session: sessionmaker[Session], test_user: str
):
    with db_session() as session:
        new_list = ShoppingList(name="Owner List", user_id=test_user)
        session.add(new_list)
        session.flush()

        item = ListItem(
            name="Milk", list_id=new_list.id, quantity=2, buyed=False, typeicon="dairy"
        )
        session.add(item)
        session.commit()
        list_id = new_list.id

    response = auth_client_user.get(f"/api/{list_id}")
    data = response.json()

    assert response.status_code == 200
    assert data["list_id"] == list_id
    assert len(data["list_items"]) == 1
    assert data["list_items"][0]["name"] == "Milk"
    assert data["list_items"][0]["quantity"] == 2


def test_get_list_items_success_as_shared_user(
    auth_client_user: TestClient, db_session: sessionmaker[Session], test_user: str
):
    with db_session() as session:
        other_list = ShoppingList(name="Shared with me", user_id="other-owner")
        session.add(other_list)
        session.flush()

        share = ShoppingListShare(shopping_list_id=other_list.id, user_id=test_user)
        session.add(share)

        item = ListItem(
            name="Bread",
            list_id=other_list.id,
            quantity=1,
            buyed=False,
            typeicon="someicon",
        )
        session.add(item)
        session.commit()
        list_id = other_list.id

    response = auth_client_user.get(f"/api/{list_id}")
    data = response.json()

    assert response.status_code == 200
    assert data["list_id"] == list_id
    assert data["list_items"][0]["name"] == "Bread"


def test_get_list_items_forbidden_for_other_users(
    auth_client_user: TestClient, db_session: sessionmaker[Session]
):
    with db_session() as session:
        private_list = ShoppingList(name="Private List", user_id="stranger")
        session.add(private_list)
        session.commit()
        list_id = private_list.id

    response = auth_client_user.get(f"/api/{list_id}")

    assert response.json()["status"] == "rejected"
    assert response.json()["msg"] == "Item not found"
