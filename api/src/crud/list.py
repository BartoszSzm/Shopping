from sqlalchemy.orm import Session

from src.database.db import ShoppingList


def get_list_name(session: Session, list_id: int) -> str:
    return session.query(ShoppingList.name).filter_by(id=list_id).scalar()
