from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

from src.database.db import Notification


def test_patch_notification_seen_403_no_auth(client: TestClient):
    response = client.patch("/api/notifications/seen", json={"id": 1})
    assert response.status_code == 403


def test_patch_notification_seen_401_no_user_id(auth_client: TestClient):
    response = auth_client.patch("/api/notifications/seen", json={"id": 1})
    assert response.status_code == 401
    assert response.json() == {"detail": "Missing X-User-Id header"}


def test_patch_notification_seen_404_not_found(
    auth_client_user: TestClient,
    db_session: sessionmaker[Session],
    test_user: str,
):
    with db_session() as session:
        session.add_all(
            [
                Notification(id=1, user_id=test_user, is_read=False, message=""),
                Notification(id=2, user_id=test_user, is_read=True, message=""),
            ]
        )
        session.commit()

    response = auth_client_user.patch("/api/notifications/seen", json={"id": 9999})

    assert response.status_code == 404
    assert response.json() == {"detail": "Notification not found for this user"}


def test_patch_notification_seen_404_wrong_user(
    auth_client_user: TestClient,
    db_session: sessionmaker[Session],
):
    with db_session() as session:
        notification = Notification(
            id=1, user_id="other-user", is_read=False, message=""
        )
        session.add(notification)
        session.commit()

    response = auth_client_user.patch("/api/notifications/seen", json={"id": 1})

    assert response.status_code == 404
    assert response.json() == {"detail": "Notification not found for this user"}

    with db_session() as session:
        db_notif = session.query(Notification).filter_by(id=1).first()
        assert db_notif.is_read is False


def test_patch_notification_seen_success(
    auth_client_user: TestClient,
    db_session: sessionmaker[Session],
    test_user: str,
):
    with db_session() as session:
        notification = Notification(id=1, user_id=test_user, is_read=False, message="")
        session.add(notification)
        session.commit()

    response = auth_client_user.patch("/api/notifications/seen", json={"id": 1})

    assert response.status_code == 200

    with db_session() as session:
        updated_notification = session.query(Notification).filter_by(id=1).first()
        assert updated_notification.is_read is True
