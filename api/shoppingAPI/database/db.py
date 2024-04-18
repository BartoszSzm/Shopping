import os
import typing as t
from datetime import datetime
from enum import Enum

import sqlalchemy as sa
import sqlalchemy.orm as so

DB_URL = os.environ["DB_URL"]
engine = sa.create_engine(DB_URL)
db_session = so.sessionmaker(autocommit=False, autoflush=False, bind=engine)()


class Base(so.DeclarativeBase):
    pass


class ItemType(str, Enum):
    fruit = "FaAppleAlt"
    diary = "FaCheese"
    ready_made = "FaUtensils"


class ShoppingList(Base):
    __tablename__ = "shoppingList"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(100), unique=True)
    created: so.Mapped[datetime] = so.mapped_column(sa.DateTime, default=sa.func.now())
    modified: so.Mapped[datetime] = so.mapped_column(
        sa.DateTime, default=sa.func.now(), onupdate=sa.func.now()
    )

    items: so.Mapped[t.List["ListItem"]] = so.relationship(back_populates="list")


class ListItem(Base):
    __tablename__ = "listItem"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(100), unique=True)
    list_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey("shoppingList.id", ondelete="CASCADE")
    )
    quantity: so.Mapped[int] = so.mapped_column(sa.Integer, default=1)
    typeicon: so.Mapped[ItemType] = so.mapped_column(sa.Enum(ItemType))
    buyed: so.Mapped[bool] = so.mapped_column(sa.Boolean, default=False)
    created: so.Mapped[datetime] = so.mapped_column(sa.DateTime, default=sa.func.now())
    modified: so.Mapped[datetime] = so.mapped_column(
        sa.DateTime, default=sa.func.now(), onupdate=sa.func.now()
    )

    list: so.Mapped["ShoppingList"] = so.relationship(back_populates="items")


def create_db() -> None:
    Base.metadata.create_all(engine)


def create_dummy_list() -> None:
    with db_session as session:
        session.add(ShoppingList(name="test"))
        session.commit()
