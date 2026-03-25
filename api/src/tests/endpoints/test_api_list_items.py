from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

from src.database.db import ListItem, Notification, ShoppingList, ShoppingListShare


def test_new_item_403_no_auth(client: TestClient):
    payload = {"list_id": 1, "name": "Mleko", "quantity": 1}
    response = client.post("/api/newItem", json=payload)
    assert response.status_code == 403


def test_new_item_forbidden_or_not_found(
    auth_client_user: TestClient, db_session: sessionmaker[Session]
):
    with db_session() as session:
        private_list = ShoppingList(name="Private List", user_id="stranger")
        session.add(private_list)
        session.commit()
        list_id = private_list.id

    payload = {"list_id": list_id, "name": "Chleb", "quantity": 1}
    response = auth_client_user.post("/api/newItem", json=payload)
    data = response.json()

    assert response.status_code == 200
    assert data["status"] == "rejected"
    assert data["msg"] == "Error occured, check logs"


def test_new_item_success_as_owner_creates_new_item(
    auth_client_user: TestClient, db_session: sessionmaker[Session], test_user: str
):
    with db_session() as session:
        new_list = ShoppingList(name="My List", user_id=test_user)
        session.add(new_list)
        session.flush()

        share = ShoppingListShare(shopping_list_id=new_list.id, user_id="shared_user_1")
        session.add(share)
        session.commit()
        list_id = new_list.id

    payload = {"list_id": list_id, "name": "Jajka", "quantity": 10}
    response = auth_client_user.post("/api/newItem", json=payload)

    assert response.status_code == 200
    assert response.json() == {"status": "confirmed", "msg": ""}

    with db_session() as session:
        item = session.query(ListItem).filter_by(list_id=list_id, name="Jajka").first()
        assert item is not None
        assert item.quantity == 10
        assert item.typeicon == "🥚"

        notifications = (
            session.query(Notification).filter_by(user_id="shared_user_1").all()
        )
        assert len(notifications) == 1
        assert "dodał element Jajka do listy" in notifications[0].message

        owner_notifications = (
            session.query(Notification).filter_by(user_id=test_user).all()
        )
        assert len(owner_notifications) == 0


def test_new_item_success_updates_existing_quantity(
    auth_client_user: TestClient, db_session: sessionmaker[Session], test_user: str
):
    with db_session() as session:
        new_list = ShoppingList(name="My List 2", user_id=test_user)
        session.add(new_list)
        session.flush()

        existing_item = ListItem(
            name="Jabłka", list_id=new_list.id, quantity=3, typeicon="apple"
        )
        session.add(existing_item)
        session.commit()
        list_id = new_list.id

    payload = {"list_id": list_id, "name": "Jabłka", "quantity": 2}
    response = auth_client_user.post("/api/newItem", json=payload)

    assert response.status_code == 200
    assert response.json() == {"status": "confirmed", "msg": ""}

    with db_session() as session:
        item = session.query(ListItem).filter_by(list_id=list_id, name="Jabłka").first()
        assert item is not None
        assert item.quantity == 5


def test_new_item_success_as_shared_user(
    auth_client_user: TestClient, db_session: sessionmaker[Session], test_user: str
):
    with db_session() as session:
        other_list = ShoppingList(name="Shared List", user_id="other_owner")
        session.add(other_list)
        session.flush()

        share = ShoppingListShare(shopping_list_id=other_list.id, user_id=test_user)
        session.add(share)
        session.commit()
        list_id = other_list.id

    payload = {"list_id": list_id, "name": "Mąka", "quantity": 1}
    response = auth_client_user.post("/api/newItem", json=payload)

    assert response.status_code == 200
    assert response.json() == {"status": "confirmed", "msg": ""}

    with db_session() as session:
        item = session.query(ListItem).filter_by(list_id=list_id, name="Mąka").first()
        assert item is not None
        assert item.quantity == 1
        assert item.typeicon == "🌾"

        owner_notifications = (
            session.query(Notification).filter_by(user_id="other_owner").all()
        )
        assert len(owner_notifications) == 1
