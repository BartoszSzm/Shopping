from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

from src.database.db import ListItem, ListRole, ShoppingList, ShoppingListShare


def test_delete_item_403_no_auth(client: TestClient):
    response = client.post(
        "/api/delete",
        json={"list_id": "list1", "item_id": "item1"},
    )
    assert response.status_code == 403


def test_delete_item_401_no_user_id(auth_client: TestClient):
    response = auth_client.post(
        "/api/delete",
        json={"list_id": "list1", "item_id": "item1"},
    )
    assert response.status_code == 401
    assert response.json() == {"detail": "Missing X-User-Id header"}


def test_delete_item_not_owner_or_shared(
    auth_client_user: TestClient, db_session: sessionmaker[Session], test_user: str
):
    with db_session() as session:
        other_list = ShoppingList(name="Other List", user_id="other-user")
        item = ListItem(list_id=None, name="Other Item", typeicon="any")
        session.add(other_list)
        session.flush()
        item.list_id = other_list.id
        session.add(item)
        session.commit()

        response = auth_client_user.post(
            "/api/delete",
            json={"list_id": other_list.id, "item_id": item.id},
        )

    data = response.json()
    assert response.status_code == 200
    assert data["status"] == "rejected"
    assert "Record not found" in data["msg"]


def test_delete_item_success_owner(
    auth_client_user: TestClient, db_session: sessionmaker[Session], test_user: str
):
    with db_session() as session:
        my_list = ShoppingList(name="My List", user_id=test_user)
        item = ListItem(list_id=None, name="Item To Delete", typeicon="any")
        session.add(my_list)
        session.flush()
        item.list_id = my_list.id
        session.add(item)
        session.commit()

        response = auth_client_user.post(
            "/api/delete",
            json={"list_id": my_list.id, "item_id": item.id},
        )

    data = response.json()
    assert response.status_code == 200
    assert data["status"] == "confirmed"

    with db_session() as session:
        deleted_item = session.query(ListItem).filter_by(id=item.id).first()
        assert deleted_item is None


def test_delete_item_success_shared_role_editor(
    auth_client_user: TestClient, db_session: sessionmaker[Session], test_user: str
):
    with db_session() as session:
        my_list = ShoppingList(name="Shared List", user_id="other-user")
        item = ListItem(list_id=None, name="Shared Item", typeicon="any")
        session.add(my_list)
        session.flush()
        item.list_id = my_list.id
        session.add(item)

        share = ShoppingListShare(shopping_list_id=my_list.id, user_id=test_user)
        session.add(share)
        session.commit()

        response = auth_client_user.post(
            "/api/delete",
            json={"list_id": my_list.id, "item_id": item.id},
        )

    data = response.json()
    assert response.status_code == 200
    assert data["status"] == "confirmed"

    with db_session() as session:
        deleted_item = session.query(ListItem).filter_by(id=item.id).first()
        assert deleted_item is None


def test_delete_item_success_shared_role_viewer(
    auth_client_user: TestClient, db_session: sessionmaker[Session], test_user: str
):
    with db_session() as session:
        my_list = ShoppingList(name="Shared List", user_id="other-user")
        item = ListItem(list_id=None, name="Shared Item", typeicon="any")
        session.add(my_list)
        session.flush()
        item.list_id = my_list.id
        session.add(item)

        share = ShoppingListShare(
            shopping_list_id=my_list.id, user_id=test_user, role=ListRole.VIEWER.value
        )
        session.add(share)
        session.commit()

        response = auth_client_user.post(
            "/api/delete",
            json={"list_id": my_list.id, "item_id": item.id},
        )

    data = response.json()
    assert response.status_code == 200
    assert "insufficient permissions" in data["msg"]

    with db_session() as session:
        deleted_item = session.query(ListItem).filter_by(id=item.id).first()
        assert deleted_item is not None


def test_delete_item_not_found(
    auth_client_user: TestClient, db_session: sessionmaker[Session], test_user: str
):
    response = auth_client_user.post(
        "/api/delete",
        json={"list_id": 99999, "item_id": 9999},
    )

    data = response.json()
    assert response.status_code == 200
    assert data["status"] == "rejected"
    assert "Record not found" in data["msg"]
