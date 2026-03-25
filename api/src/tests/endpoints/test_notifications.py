from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

from src.database.db import Notification


def test_patch_notification_seen_403_no_auth(client: TestClient):
    response = client.patch("/api/notifications/seen")
    assert response.status_code == 403


def test_patch_notification_seen_401_no_user_id(auth_client: TestClient):
    response = auth_client.patch("/api/notifications/seen")
    assert response.status_code == 401
    assert response.json() == {"detail": "Missing X-User-Id header"}


def test_patch_notification_seen_success_marks_all(
    auth_client_user: TestClient,
    db_session: sessionmaker[Session],
    test_user: str,
):
    with db_session() as session:
        session.add_all(
            [
                Notification(id=1, user_id=test_user, is_read=False, message="Msg 1"),
                Notification(id=2, user_id=test_user, is_read=False, message="Msg 2"),
                Notification(
                    id=3, user_id="other-user", is_read=False, message="Msg 3"
                ),
            ]
        )
        session.commit()

    response = auth_client_user.patch("/api/notifications/seen")

    assert response.status_code == 200

    with db_session() as session:
        user_notifs = session.query(Notification).filter_by(user_id=test_user).all()
        assert all(n.is_read for n in user_notifs) is True

        other_notif = session.query(Notification).filter_by(id=3).first()
        assert other_notif.is_read is False


def test_patch_notification_seen_success_empty(
    auth_client_user: TestClient,
    db_session: sessionmaker[Session],
):
    response = auth_client_user.patch("/api/notifications/seen")
    assert response.status_code == 200
