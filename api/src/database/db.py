from __future__ import annotations

import typing as t
from datetime import datetime
from enum import Enum

import sqlalchemy as sa
import sqlalchemy.orm as so
from fastapi import Depends

from src.config import Config, get_config


def get_engine(db_url: str):
    return sa.create_engine(db_url)


def get_db_session(config: Config = Depends(get_config)):
    return so.sessionmaker(
        autocommit=False, autoflush=False, bind=get_engine(config.DB_URL)
    )


class Base(so.DeclarativeBase):
    pass


def create_db(db_url: str) -> None:
    Base.metadata.create_all(get_engine(db_url))


class ListRole(Enum):
    OWNER = "owner"
    VIEWER = "viewer"
    EDITOR = "editor"


class ShoppingList(Base):
    __tablename__ = "shoppingList"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(100))
    user_id: so.Mapped[str] = so.mapped_column(sa.String(100))
    created: so.Mapped[datetime] = so.mapped_column(sa.DateTime, default=sa.func.now())
    role: so.Mapped[ListRole] = so.mapped_column(
        sa.String(30), default=ListRole.OWNER.value
    )
    modified: so.Mapped[datetime] = so.mapped_column(
        sa.DateTime, default=sa.func.now(), onupdate=sa.func.now()
    )

    items: so.Mapped[t.List["ListItem"]] = so.relationship(
        back_populates="list", cascade="all,delete"
    )

    shared_with: so.Mapped[t.List["ShoppingListShare"]] = so.relationship(
        back_populates="shopping_list", cascade="all,delete"
    )


class ListItem(Base):
    __tablename__ = "listItem"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(100))
    list_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey("shoppingList.id", ondelete="CASCADE")
    )
    quantity: so.Mapped[int] = so.mapped_column(sa.Integer, default=1)
    typeicon: so.Mapped[str] = so.mapped_column(sa.String(50))
    buyed: so.Mapped[bool] = so.mapped_column(sa.Boolean, default=False)
    created: so.Mapped[datetime] = so.mapped_column(sa.DateTime, default=sa.func.now())
    modified: so.Mapped[datetime] = so.mapped_column(
        sa.DateTime, default=sa.func.now(), onupdate=sa.func.now()
    )

    list: so.Mapped["ShoppingList"] = so.relationship(back_populates="items")


class ShoppingListShare(Base):
    __tablename__ = "shoppingListShare"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    shopping_list_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey("shoppingList.id", ondelete="CASCADE")
    )
    user_id: so.Mapped[str] = so.mapped_column(sa.String(100))
    role: so.Mapped[ListRole] = so.mapped_column(
        sa.String(30), default=ListRole.EDITOR.value
    )
    created: so.Mapped[datetime] = so.mapped_column(sa.DateTime, default=sa.func.now())

    shopping_list: so.Mapped["ShoppingList"] = so.relationship(
        back_populates="shared_with"
    )
