from sqlalchemy.orm import Session

from src.database.db import Notification, ShoppingList


def notify(session: Session, list_id: int, notifier_user_id: str, message: str):

    slist = session.query(ShoppingList).filter_by(id=list_id).one()
    all_users = [slist.user_id, *[l.user_id for l in slist.shared_with]]
    users = list(set(all_users) - {notifier_user_id})

    for user_id in users:
        session.add(
            Notification(
                user_id=user_id,
                is_read=False,
                message=message,
            ),
        )
    session.commit()
